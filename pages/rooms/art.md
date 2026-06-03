---
title: "Art Room"
layout: vestibule
permalink: /pages/rooms/art.html
---

<section class="atrium-page collection-room-art-hall">
  <h1 class="visually-hidden">Art room</h1>

  <div class="house-scene">
    <div class="house-backdrop art-hall">
      <div class="house-cornice"></div>
      <a class="art-cornice-link art-cornice-link-left" href="/digitalcollection/pages/vestibule.html">Back to Hall</a>
      <a class="art-cornice-link art-cornice-link-right" href="/digitalcollection/pages/pathways-overview.html">Pathways Overview</a>
      <div class="house-medallion"></div>
      <div class="house-chandelier">
        <span class="chandelier-chain"></span>
        <span class="chandelier-stem"></span>
        <span class="chandelier-arm chandelier-arm-left"></span>
        <span class="chandelier-arm chandelier-arm-right"></span>
        <span class="chandelier-arm chandelier-arm-center-left"></span>
        <span class="chandelier-arm chandelier-arm-center-right"></span>
        <span class="chandelier-bowl"></span>
        <span class="chandelier-crystal chandelier-crystal-left"></span>
        <span class="chandelier-crystal chandelier-crystal-center"></span>
        <span class="chandelier-crystal chandelier-crystal-right"></span>
      </div>

      <div class="art-wall-frame art-wall-frame-left" aria-hidden="true">
        <span class="artwork-mat"></span>
        <span class="artwork-surface artwork-surface-study"></span>
      </div>
      <div class="art-wall-frame art-wall-frame-right" aria-hidden="true">
        <span class="artwork-mat"></span>
        <span class="artwork-surface artwork-surface-ivory"></span>
      </div>

      <div class="art-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Art</h2>
        <p class="collection-room-lead">A room for ivory as medium, workmanship, display, and the artistic traditions that make these objects compelling and contested.</p>
      </div>

      <div class="art-gallery-display" aria-hidden="true">
        <div class="art-gallery-frame art-gallery-frame-left"><span>Craft</span></div>
        <div class="art-gallery-frame art-gallery-frame-center art-gallery-frame-el-greco">
          <span class="art-gallery-painting art-gallery-painting-el-greco"></span>
          <span>Assumption</span>
        </div>
        <div class="art-gallery-frame art-gallery-frame-right"><span>Debate</span></div>
      </div>

      <button class="art-relief-stand art-relief-trigger" type="button" aria-haspopup="dialog" aria-controls="art-relief-sequence" aria-label="Open relief information">
        <div class="art-relief-panel">
          <span class="art-relief-surface"></span>
        </div>
        <div class="art-relief-pedestal"></div>
        <div class="art-relief-base"></div>
      </button>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence art-relief-sequence" id="art-relief-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-relief-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-relief-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-relief-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close relief information" data-art-relief-close>×</button>
        <p class="welcome-sequence-step">Art Object</p>
        <h2 class="welcome-sequence-title" id="art-relief-title">Ivory Relief</h2>
        <img class="art-relief-popup-image" src="/digitalcollection/assets/img/Barberini%20Ivory.jpg" alt="Large view of the Barberini Ivory relief" />
        <p class="welcome-sequence-message" id="art-relief-message">Artisans of Late Antiquity created highly detailed relief sculptures from ivory, including this piece- the Barberini Ivory- from 6th century Constantinople. Now held in the Louvre, it depicts the emperor (likely Justinian) achieving victory over his barbarian foes. While it is the only such extant piece that celebrates secular power, the presence of angels in the background reveal the supremacy of ecclesiastical authority.</p>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-relief-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    const trigger = document.querySelector('.art-relief-trigger');
    const overlay = document.getElementById('art-relief-sequence');
    const close = document.getElementById('art-relief-close');
    const closeButtons = document.querySelectorAll('[data-art-relief-close]');

    if (!trigger || !overlay || !close) return;

    function openRelief() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeRelief() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    trigger.addEventListener('click', openRelief);
    close.addEventListener('click', closeRelief);
    closeButtons.forEach((button) => button.addEventListener('click', closeRelief));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeRelief();
    });
  })();
</script>
