(() => {
  "use strict";

  const CONFIG = {
    pointsForQuestion: 15,
    pointsForRefinement: 10
  };

  const INQUIRY_API_URL =
    window.ARCHIVORY_INQUIRY_API_URL ||
    "http://localhost:3000/api/inquiry";

  const MODULE_LABELS = {
    "bone-identification": "Bone Identification Station",
    "elephant-species": "Extant Elephant Species Statuettes",
    "proboscidean-timeline": "Proboscidean Timeline",
    "habitation-map": "Habitation Map"
  };

  const shell = document.getElementById("archivory-inquiry");
  if (!shell) {
    console.warn("ArchIvory Inquiry Terminal: #archivory-inquiry not found.");
    return;
  }

  const terminal = shell.querySelector(".aiq-terminal");
  const form = shell.querySelector("#aiq-form");
  const textarea = shell.querySelector("#aiq-question");
  const status = shell.querySelector("#aiq-status");
  const output = shell.querySelector("#aiq-output");
  const scoreDisplay = shell.querySelector("[data-aiq-score-display]");
  const refinementCard = shell.querySelector("[data-aiq-refinement-card]");

  let lastFocusedElement = null;
  let currentResponse = null;

  scoreDisplay.textContent = `+${CONFIG.pointsForQuestion}`;

  function open() {
    lastFocusedElement = document.activeElement;
    shell.setAttribute("aria-hidden", "false");
    document.body.dataset.aiqOpen = "true";
    requestAnimationFrame(() => textarea.focus());
  }

  function close() {
    shell.setAttribute("aria-hidden", "true");
    delete document.body.dataset.aiqOpen;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function awardPoints(action, points) {
    emit("archivory:award-points", {
      source: "inquiry-terminal",
      action,
      points
    });
  }

  function switchPanel(view) {
    shell.querySelectorAll("[data-aiq-panel]").forEach(panel => {
      panel.hidden = panel.dataset.aiqPanel !== view;
    });
    shell.querySelectorAll("[data-aiq-view]").forEach(button => {
      button.classList.toggle("is-active", button.dataset.aiqView === view);
    });
  }

  async function getInquiryResponse(question) {
    const response = await fetch(INQUIRY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error || `Inquiry request failed (${response.status}).`);
    }

    return payload;
  }

  function renderResponse(response) {
    currentResponse = response;

    shell.querySelector("[data-aiq-answer]").textContent = response.answer;
    shell.querySelector("[data-aiq-analysis]").textContent = response.analysis;
    shell.querySelector("[data-aiq-question-type]").textContent = response.questionType;
    shell.querySelector("[data-aiq-evidence]").textContent = response.evidencePrompt;

    if (response.refinementNeeded && response.strongerQuestion) {
      refinementCard.hidden = false;
      shell.querySelector("[data-aiq-stronger]").textContent = response.strongerQuestion;
    } else {
      refinementCard.hidden = true;
      shell.querySelector("[data-aiq-stronger]").textContent = "";
    }

    const followups = shell.querySelector("[data-aiq-followups]");
    followups.replaceChildren();

    response.followUps.forEach(question => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "aiq-secondary";
      button.textContent = question;
      button.addEventListener("click", () => {
        textarea.value = question;
        textarea.focus();
      });
      li.appendChild(button);
      followups.appendChild(li);
    });

    const moduleCard = shell.querySelector("[data-aiq-module-card]");
    if (response.suggestedModule && MODULE_LABELS[response.suggestedModule]) {
      moduleCard.hidden = false;
      moduleCard.dataset.moduleId = response.suggestedModule;
      shell.querySelector("[data-aiq-module-label]").textContent =
        MODULE_LABELS[response.suggestedModule];
    } else {
      moduleCard.hidden = true;
      delete moduleCard.dataset.moduleId;
    }

    output.hidden = false;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const question = textarea.value.trim();
    if (!question) return;

    status.textContent = "Consulting the inquiry terminal…";
    output.hidden = true;

    try {
      const response = await getInquiryResponse(question);
      renderResponse(response);
      status.textContent = `Question recorded. +${CONFIG.pointsForQuestion} inquiry points.`;
      awardPoints("ask-question", CONFIG.pointsForQuestion);
    } catch (error) {
      console.error(error);
      status.textContent = error?.message || "The terminal could not process that question. Please try again.";
    }
  });

  shell.querySelector("[data-aiq-use-refinement]").addEventListener("click", () => {
    if (!currentResponse?.strongerQuestion) return;
    textarea.value = currentResponse.strongerQuestion;
    textarea.focus();
    status.textContent = `Question refined. +${CONFIG.pointsForRefinement} inquiry points.`;
    awardPoints("refine-question", CONFIG.pointsForRefinement);
  });

  shell.querySelector("[data-aiq-open-module]").addEventListener("click", () => {
    const card = shell.querySelector("[data-aiq-module-card]");
    const moduleId = card.dataset.moduleId;
    if (!moduleId) return;

    emit("archivory:open-module", {
      source: "inquiry-terminal",
      moduleId
    });

    close();
  });

  shell.querySelectorAll("[data-aiq-close]").forEach(button => {
    button.addEventListener("click", close);
  });

  shell.querySelectorAll("[data-aiq-view]").forEach(button => {
    button.addEventListener("click", () => switchPanel(button.dataset.aiqView));
  });

  document.addEventListener("keydown", event => {
    if (shell.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") close();
  });

  // Public API for SVG overlay / room code.
  window.ArchIvoryInquiry = {
    open,
    close
  };
})();
