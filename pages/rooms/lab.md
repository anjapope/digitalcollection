---
title: "Lab Room"
layout: vestibule
permalink: /pages/rooms/lab.html
---

<section class="atrium-page collection-room-art-hall">
  <h1 class="visually-hidden">Lab room</h1>

  <div class="house-scene">
    <div class="house-backdrop art-hall collection-room-lab">
      <div class="house-cornice"></div>
      <a class="art-cornice-link art-cornice-link-left" href="{{ '/pages/vestibule.html' | relative_url }}">Back to Hall</a>
      <a class="art-cornice-link art-cornice-link-right" href="{{ '/pages/pathways-overview.html' | relative_url }}">Pathways Overview</a>

      <button class="lab-attic-sign" type="button" aria-haspopup="dialog" aria-controls="lab-attic-sequence" aria-label="Open attic access information">
        <span class="lab-attic-sign-chain lab-attic-sign-chain-left" aria-hidden="true"></span>
        <span class="lab-attic-sign-chain lab-attic-sign-chain-right" aria-hidden="true"></span>
        <span class="lab-attic-sign-panel">Attic ↑</span>
      </button>

      <div class="lab-cabinet lab-cabinet-left" aria-hidden="true"></div>
      <div class="lab-cabinet lab-cabinet-right" aria-hidden="true"></div>

      <div class="lab-bench" aria-hidden="true">
        <div class="lab-bench-top"></div>
        <div class="lab-bench-front"></div>
        <div class="lab-bench-leg lab-bench-leg-left"></div>
        <div class="lab-bench-leg lab-bench-leg-right"></div>
      </div>

      <div class="lab-equipment" aria-hidden="true">
        <div class="lab-microscope"></div>
        <div class="lab-beaker lab-beaker-a"></div>
        <div class="lab-beaker lab-beaker-b"></div>
      </div>

      <div class="art-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Lab</h2>
        <p class="collection-room-lead">A workspace for technical analysis and material investigation, where objects are examined through close visual study and conservation methods.</p>
      </div>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence lab-attic-sequence" id="lab-attic-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-lab-attic-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog lab-attic-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="lab-attic-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close attic access information" data-lab-attic-close>×</button>
        <p class="welcome-sequence-step">Ceiling Access</p>
        <h2 class="welcome-sequence-title" id="lab-attic-title">Attic</h2>
        <p class="welcome-sequence-message">ArchIvory tests everyday items that people may discover locked away in their attic at home. We can identify not only the nature of lost treasures, we can determine their origin and the experiences of the animals that produced them.</p>
        <div class="welcome-sequence-actions lab-attic-sequence-actions">
          <a class="welcome-sequence-button welcome-sequence-button-primary" href="{{ '/pages/rooms/attic.html' | relative_url }}">Go to Attic</a>
          <button class="welcome-sequence-button welcome-sequence-button-secondary" type="button" id="lab-attic-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    const trigger = document.querySelector('.lab-attic-sign');
    const overlay = document.getElementById('lab-attic-sequence');
    const close = document.getElementById('lab-attic-close');
    const closeButtons = document.querySelectorAll('[data-lab-attic-close]');

    if (!trigger || !overlay || !close) return;

    function openLabAttic() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeLabAttic() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    trigger.addEventListener('click', openLabAttic);
    close.addEventListener('click', closeLabAttic);
    closeButtons.forEach((button) => button.addEventListener('click', closeLabAttic));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeLabAttic();
    });
  })();
</script>
