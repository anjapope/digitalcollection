---
title: "Historical Society Room"
layout: vestibule
permalink: /pages/rooms/historical-society.html
---

<section class="atrium-page collection-room-local-hall">
  <h1 class="visually-hidden">Historical Society room</h1>

  <div class="house-scene">
    <div class="house-backdrop local-hall">
      <div class="house-cornice"></div>
      <a class="room-cornice-link room-cornice-link-left" href="{{ '/pages/vestibule.html' | relative_url }}">Back to Hall</a>
      <a class="room-cornice-link room-cornice-link-right" href="{{ '/pages/pathways-overview.html' | relative_url }}">Pathways Overview</a>

      <button class="local-attic-sign" type="button" aria-haspopup="dialog" aria-controls="local-attic-sequence" aria-label="Open attic access information">
        <span class="local-attic-sign-chain local-attic-sign-chain-left" aria-hidden="true"></span>
        <span class="local-attic-sign-chain local-attic-sign-chain-right" aria-hidden="true"></span>
        <span class="local-attic-sign-panel">Attic ↑</span>
      </button>

      <a class="local-side-sign local-side-sign-left" href="{{ '/pages/rooms/art.html' | relative_url }}" aria-label="Go to the Art History room from the left side">
        <span class="local-side-sign-label">← Art History</span>
      </a>

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

      <div class="house-sconce house-sconce-left"></div>
      <div class="house-sconce house-sconce-right"></div>
      <div class="house-portrait house-portrait-left"></div>
      <div class="house-portrait house-portrait-right"></div>

      <div class="local-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Historical Society</h2>
        <p class="collection-room-lead">A room for community memory, collecting practices, and the local lives of ivory objects in homes, institutions, and regional histories.</p>
      </div>

      <div class="local-history-display" aria-hidden="true">
        <div class="local-history-board">
          <span class="local-note local-note-left">Homes</span>
          <span class="local-note local-note-center">Institutions</span>
          <span class="local-note local-note-right">Communities</span>
        </div>
      </div>

      <div class="local-filing-cabinet local-filing-cabinet-left" aria-hidden="true"></div>
      <div class="local-filing-cabinet local-filing-cabinet-right" aria-hidden="true"></div>

      <div class="local-service-desk" aria-hidden="true">
        <div class="local-service-desk-top"></div>
        <div class="local-service-desk-front"></div>
        <div class="local-service-desk-window"></div>
      </div>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence local-attic-sequence" id="local-attic-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-local-attic-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog local-attic-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="local-attic-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close attic access information" data-local-attic-close>×</button>
        <p class="welcome-sequence-step">Ceiling Access</p>
        <h2 class="welcome-sequence-title" id="local-attic-title">Attic</h2>
        <p class="welcome-sequence-message">ArchIvory partners with local history and cultural heritage institutions to do research on their collections and document the cultural memory and impact of the ivory trade.</p>
        <div class="welcome-sequence-actions local-attic-sequence-actions">
          <a class="welcome-sequence-button welcome-sequence-button-primary" href="{{ '/pages/rooms/attic.html' | relative_url }}">Go to Attic</a>
          <button class="welcome-sequence-button welcome-sequence-button-secondary" type="button" id="local-attic-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    const trigger = document.querySelector('.local-attic-sign');
    const overlay = document.getElementById('local-attic-sequence');
    const close = document.getElementById('local-attic-close');
    const closeButtons = document.querySelectorAll('[data-local-attic-close]');

    if (!trigger || !overlay || !close) return;

    function openLocalAttic() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeLocalAttic() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    trigger.addEventListener('click', openLocalAttic);
    close.addEventListener('click', closeLocalAttic);
    closeButtons.forEach((button) => button.addEventListener('click', closeLocalAttic));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeLocalAttic();
    });
  })();
</script>
