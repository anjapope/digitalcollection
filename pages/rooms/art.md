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
      <a class="art-cornice-link art-cornice-link-left" href="{{ '/pages/vestibule.html' | relative_url }}">Back to Hall</a>
      <a class="art-cornice-link art-cornice-link-right" href="{{ '/pages/rooms/gallery.html' | relative_url }}">Gallery</a>
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

      <svg class="art-room-hotspots" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Art room links">
        <a xlink:href="{{ '/pages/rooms/gallery.html' | relative_url }}" aria-label="Enter the Gallery" target="_self">
          <polygon class="art-room-hotspot" points="315,286 418,286 418,613 315,613" />
          <text class="art-room-hotspot-label" x="367" y="570" text-anchor="middle">Enter Gallery</text>
        </a>
        <a xlink:href="{{ '/pages/rooms/natural-history.html' | relative_url }}" aria-label="Enter the Natural History Museum" target="_self">
          <polygon class="art-room-hotspot" points="35,238 145,270 145,720 35,788" />
            <text class="art-room-hotspot-label" x="90" y="625" text-anchor="middle">Natural History</text>
        </a>
        <a class="art-table-overlay-trigger" xlink:href="#" aria-label="Open IU Eskenazi ivories information" target="_self">
          <polygon class="art-room-hotspot" points="483,607 731,604 797,681 468,687" />
          <text class="art-room-hotspot-label" x="580" y="657" text-anchor="middle">Eskenazi Ivories</text>
        </a>
      </svg>

      <div class="art-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Art</h2>
        <p class="collection-room-lead">A room for ivory as medium, workmanship, display, and the artistic traditions that make these objects compelling and contested.</p>
      </div>

      <div class="house-rug"></div>
    </div>
  </div>
</section>

<div class="collection-sequence art-table-sequence" id="art-table-sequence" hidden>
  <div class="welcome-sequence-backdrop" data-art-table-close></div>
  <div class="welcome-sequence-dialog collection-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-table-title">
    <button class="welcome-sequence-close" type="button" aria-label="Close ivories information" data-art-table-close>×</button>
    <p class="welcome-sequence-step">Art Object Research</p>
    <h2 class="welcome-sequence-title" id="art-table-title">IU Eskenazi Museum Ivories</h2>
    <img src="{{ '/assets/img/UVIvories.jpg' | relative_url }}" alt="Ivory objects at the IU Eskenazi Museum of Art" style="display:block; width:100%; max-width:420px; margin:0.5rem auto 1rem; border-radius:8px;" />
    <p class="welcome-sequence-message">These ivories are held at the IU Eskenazi Museum of Art. Our team has performed tests on them to better understand their materials and historical context.</p>
    <div class="welcome-sequence-actions">
      <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-table-close">Close</button>
    </div>
  </div>
</div>

<script>
  (() => {
    const trigger = document.querySelector('.art-table-overlay-trigger');
    const overlay = document.getElementById('art-table-sequence');
    const closeButton = document.getElementById('art-table-close');
    const closeButtons = document.querySelectorAll('[data-art-table-close]');

    if (!trigger || !overlay || !closeButton) return;

    function openSequence() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      closeButton.focus();
    }

    function closeSequence() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openSequence();
    });
    closeButton.addEventListener('click', closeSequence);
    closeButtons.forEach((button) => button.addEventListener('click', closeSequence));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeSequence();
    });
  })();
</script>
