(() => {
  "use strict";

  const BIN_COPY = {
    relevant_answerable: {
      label: "Relevant + Answerable",
      heading: "Relevant and answerable",
      description: "This question fits the exhibit and can be investigated using available knowledge or evidence."
    },
    relevant_not_answerable: {
      label: "Relevant + Not Answerable",
      heading: "Relevant, but not yet answerable",
      description: "This question fits the exhibit, but the available evidence is not sufficient to establish the requested answer responsibly."
    },
    not_relevant_answerable: {
      label: "Not Relevant + Answerable",
      heading: "Answerable, but outside the exhibit",
      description: "This question can be answered, but it falls outside the main intellectual focus of ArchIvory."
    },
    not_relevant_not_answerable: {
      label: "Not Relevant + Not Answerable",
      heading: "Outside the exhibit and not answerable",
      description: "This question falls outside the exhibit and cannot be responsibly answered from available knowledge or evidence."
    }
  };

  function setMetric(root, prefix, item, label) {
    root.querySelector(`[data-aic-${prefix}-label]`).textContent = label;
    root.querySelector(`[data-aic-${prefix}-reason]`).textContent = item.reason;
    const meter = root.querySelector(`[data-aic-${prefix}-meter]`);
    meter.style.width = `${Math.max(0, Math.min(100, item.score))}%`;
    meter.parentElement.setAttribute("aria-label", `${prefix} score ${item.score} out of 100`);
  }

  function relevanceLabel(item) {
    if (item.class === "relevant") {
      return item.score >= 75 ? `Strongly Relevant · ${item.score}` : `Relevant · ${item.score}`;
    }
    return item.score >= 25 ? `Weakly Related · ${item.score}` : `Not Relevant · ${item.score}`;
  }

  function answerabilityLabel(item) {
    if (item.class === "answerable") {
      return item.score >= 75 ? `Strongly Answerable · ${item.score}` : `Answerable with Qualification · ${item.score}`;
    }
    return item.score >= 25 ? `Substantial Uncertainty · ${item.score}` : `Not Answerable · ${item.score}`;
  }

  function originalityLabel(item) {
    const labelMap = {
      low: "Foundational",
      medium: "Developing",
      high: "Generative"
    };
    return `${labelMap[item.class] || item.class} · ${item.score}`;
  }

  function reset() {
    const root = document.querySelector("[data-aic-assessment]");
    if (!root) return;

    root.hidden = true;
    root.querySelectorAll("[data-aic-cell]").forEach(cell => cell.classList.remove("is-active"));

    const output = document.getElementById("aiq-output");
    if (!output) return;

    output.querySelectorAll("article").forEach(article => {
      if (!article.hasAttribute("data-aiq-refinement-card") && !article.hasAttribute("data-aiq-module-card")) {
        article.hidden = false;
      }
    });
    output.querySelectorAll(".aic-emphasis").forEach(article => article.classList.remove("aic-emphasis"));
    delete output.dataset.responseBin;
  }

  function render(response) {
    const root = document.querySelector("[data-aic-assessment]");
    if (!root || !response?.classification || !response?.responseBin) return;

    const classification = response.classification;
    const bin = BIN_COPY[response.responseBin];
    if (!bin) return;

    root.hidden = false;
    root.querySelectorAll("[data-aic-cell]").forEach(cell => {
      cell.classList.toggle("is-active", cell.dataset.aicCell === response.responseBin);
    });
    root.querySelector("[data-aic-bin-label]").textContent = bin.label;
    root.querySelector("[data-aic-bin-heading]").textContent = bin.heading;
    root.querySelector("[data-aic-bin-description]").textContent = bin.description;

    setMetric(root, "relevance", classification.relevance, relevanceLabel(classification.relevance));
    setMetric(root, "answerability", classification.answerability, answerabilityLabel(classification.answerability));
    setMetric(root, "originality", classification.originality, originalityLabel(classification.originality));

    const output = document.getElementById("aiq-output");
    if (!output) return;

    output.dataset.responseBin = response.responseBin;
    const strongerCard = output.querySelector("[data-aiq-refinement-card]");
    const evidenceCard = output.querySelector("[data-aiq-evidence]")?.closest("article");

    if (response.responseBin === "relevant_not_answerable") {
      evidenceCard?.classList.add("aic-emphasis");
    }

    if (["not_relevant_answerable", "not_relevant_not_answerable"].includes(response.responseBin) && strongerCard) {
      strongerCard.hidden = true;
    }
  }

  window.ArchIvoryClassificationUX = { render, reset };
})();
