---
title: "Conservator's Office"
layout: vestibule
room_id: conservators_office
permalink: /pages/rooms/conservators-office.html
---

<section class="atrium-page collection-room-art-hall">
  <h1 class="visually-hidden">Conservator's Office</h1>

  <div class="house-scene">
    <div class="house-backdrop conservator-office-hall">
      <div class="house-cornice"></div>
      <a class="art-cornice-link art-cornice-link-left" href="{{ '/pages/rooms/gallery.html' | relative_url }}">Back to Gallery</a>
      <a class="art-cornice-link art-cornice-link-right" href="{{ '/pages/pathways-overview.html' | relative_url }}">Pathways Overview</a>
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


      <svg class="art-room-hotspots" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Conservator's Office room links">
        <a href="{{ '/pages/rooms/attic.html' | relative_url }}" aria-label="Enter the Attic" target="_self">
          <polygon class="art-room-hotspot" points="523,109 718,118 635,197 485,191" />
          <text class="art-room-hotspot-label" x="610" text-anchor="middle" font-size="9"><tspan x="610" y="154">Attic</tspan></text>
        </a>
        <a class="conservator-terminal-trigger" href="#" aria-label="Open the curation terminal" target="_self" data-notebook-id="conservator-terminal" data-notebook-title="Conservator's Office terminal" data-notebook-type="tool" data-notebook-description="The computer terminal is where visitors will eventually assemble their final curated exhibition." data-notebook-points="0">
          <polygon class="art-room-hotspot conservator-terminal-hotspot" points="220,455 391,455 391,565 220,565" />
          <text class="art-room-hotspot-label conservator-terminal-hotspot-label" x="306" text-anchor="middle" font-size="13"><tspan x="306" y="520">Terminal</tspan></text>
        </a>
        <a href="{{ '/pages/rooms/gallery.html' | relative_url }}" aria-label="Enter the Gallery" target="_self">
          <polygon class="art-room-hotspot" points="835,325 955,292 955,845 835,760" />
          <text class="art-room-hotspot-label" x="895" text-anchor="middle" font-size="8"><tspan x="895" y="620">Gallery</tspan></text>
        </a>
      </svg>

      <div class="art-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Conservator's Office</h2>
        <p class="collection-room-lead">A room for care, repair, and the behind-the-scenes preservation work that shapes how fragile ivory objects endure and are interpreted.</p>
      </div>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence conservator-terminal-sequence" id="conservator-terminal-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-conservator-terminal-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="conservator-terminal-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close terminal information" data-conservator-terminal-close>×</button>
        <p class="welcome-sequence-step">Curation Station</p>
        <h2 class="welcome-sequence-title" id="conservator-terminal-title">Computer Terminal</h2>
        <p class="welcome-sequence-message">This is the computer terminal where visitors will eventually assemble their own exhibition from the evidence they collect throughout the house.</p>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="conservator-terminal-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    const trigger = document.querySelector('.conservator-terminal-trigger');
    const locator = document.querySelector('.conservator-terminal-locator');
    const overlay = document.getElementById('conservator-terminal-sequence');
    const close = document.getElementById('conservator-terminal-close');
    const closeButtons = document.querySelectorAll('[data-conservator-terminal-close]');

    if ((!trigger && !locator) || !overlay || !close) return;

    function openTerminal(event) {
      if (event) event.preventDefault();
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeTerminal() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      if (locator) {
        locator.focus();
      } else if (trigger) {
        trigger.focus();
      }
    }

    if (trigger) trigger.addEventListener('click', openTerminal);
    if (locator) locator.addEventListener('click', openTerminal);
    close.addEventListener('click', closeTerminal);
    closeButtons.forEach((button) => button.addEventListener('click', closeTerminal));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeTerminal();
    });
  })();
</script>
