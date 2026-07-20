---
title: "Gallery Room"
layout: vestibule
permalink: /pages/rooms/gallery.html
---

<section class="atrium-page collection-room-art-hall">
  <h1 class="visually-hidden">Gallery room</h1>

  <div class="house-scene">
    <div class="house-backdrop gallery-hall">
      <div class="house-cornice"></div>
      <a class="art-cornice-link art-cornice-link-left" href="{{ '/pages/rooms/art.html' | relative_url }}">Back to Art</a>
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

      <svg class="art-room-hotspots" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Gallery room links">
        <a xlink:href="{{ '/pages/rooms/art.html' | relative_url }}" aria-label="Exit to the Art Museum" target="_self">
          <polygon class="art-room-hotspot" points="829,322 899,295 899,640 829,603" />
          <text class="art-room-hotspot-label" x="864" text-anchor="middle" font-size="9"><tspan x="864" y="534">Art</tspan><tspan x="864" dy="13">Museum</tspan></text>
        </a>
      </svg>

      <button class="art-wall-sconce-display art-sconce-trigger" type="button" aria-haspopup="dialog" aria-controls="art-sconce-sequence" aria-label="Open Roman wall sconce information" style="position:absolute; right:11.8%; top:25.6rem; width:38px; height:45.6px; z-index:8; padding:0.12rem; border-radius:6px; background:transparent; border:2px solid rgba(181,137,84,0.95); box-shadow:inset 0 0 0 1px rgba(255,231,194,0.45), 0 4px 8px rgba(0,0,0,0.35); cursor:pointer;">
        <img class="art-wall-sconce-image" src="{{ '/assets/img/RomanWallSconce - 03-06-2026 14-41-38.jpeg' | relative_url | replace: ' ', '%20' }}" alt="Roman wall sconce on display" style="display:block; width:100%; height:100%; object-fit:contain; border-radius:4px; background:transparent;" />
      </button>

      <div class="art-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>Gallery</h2>
        <p class="collection-room-lead">Featured objects: Barberini Ivory, Roman Wall Sconce, and Susanna and the Elders.</p>
      </div>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence art-relief-sequence" id="art-relief-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-relief-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-relief-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-relief-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close relief information" data-art-relief-close>×</button>
        <p class="welcome-sequence-step">Art Object</p>
        <h2 class="welcome-sequence-title" id="art-relief-title">Ivory Relief</h2>
        <img class="art-relief-popup-image" src="{{ '/assets/img/barberini ivory1.jpg' | relative_url | replace: ' ', '%20' }}" alt="Large view of the Barberini Ivory relief" />
        <p class="welcome-sequence-message" id="art-relief-message">Artisans in Late Antiquity excelled at carved reliefs made from ivory. This 6th-century image from Constantinople, now held in the Louvre, features the emperor (likely Justinian) achieving victory over his barbarian foes. It is the only extant item from this period that celebrates secular power, but the angels above the scene foreground the unseen supremacy of ecclesiastical authority.</p>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-relief-close">Close</button>
        </div>
      </div>
    </div>

    <div class="collection-sequence art-sconce-sequence" id="art-sconce-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-sconce-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-sconce-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-sconce-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close Roman wall sconce information" data-art-sconce-close>×</button>
        <p class="welcome-sequence-step">Art Object</p>
        <h2 class="welcome-sequence-title" id="art-sconce-title">Roman Wall Sconce</h2>
        <img class="art-sconce-popup-image" src="{{ '/assets/img/RomanWallSconce - 03-06-2026 14-41-38.jpeg' | relative_url | replace: ' ', '%20' }}" alt="Roman wall sconce detail" />
        <p class="welcome-sequence-message" id="art-sconce-message">This object is held at the Eskenazi Museum of Art at Indiana University. It has been listed as possibly being ivory, but our team believes it is some other bone material based on visual analysis, including its dull coloring and the bubble pattern on the underside.</p>
        <div class="art-sconce-evidence-grid">
          <button class="art-sconce-evidence-button" type="button" data-art-sconce-evidence="{{ '/assets/img/sconcebubbles.jpeg' | relative_url }}" data-art-sconce-alt="Bubble pattern visible on underside of the Roman wall sconce">
            <img src="{{ '/assets/img/sconcebubbles.jpeg' | relative_url }}" alt="Bubble pattern on underside" />
            <span>Underside bubble pattern</span>
          </button>
          <button class="art-sconce-evidence-button" type="button" data-art-sconce-evidence="{{ '/assets/img/SconceMeasured.jpeg' | relative_url }}" data-art-sconce-alt="Measured reference image of the Roman wall sconce">
            <img src="{{ '/assets/img/SconceMeasured.jpeg' | relative_url }}" alt="Measured Roman wall sconce" />
            <span>Measured reference</span>
          </button>
        </div>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-sconce-close">Close</button>
        </div>
      </div>
    </div>

    <div class="collection-sequence art-sconce-lightbox" id="art-sconce-lightbox" hidden>
      <div class="welcome-sequence-backdrop" data-art-sconce-lightbox-close></div>
      <div class="welcome-sequence-dialog art-sconce-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="art-sconce-lightbox-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close evidence image" data-art-sconce-lightbox-close>×</button>
        <h3 class="welcome-sequence-title" id="art-sconce-lightbox-title">Evidence Image</h3>
        <img class="art-sconce-lightbox-image" id="art-sconce-lightbox-image" src="" alt="" />
      </div>
    </div>

    <div class="collection-sequence art-susanna-sequence" id="art-susanna-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-susanna-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-susanna-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-susanna-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close Susanna and the Elders information" data-art-susanna-close>×</button>
        <p class="welcome-sequence-step">Art Object</p>
        <h2 class="welcome-sequence-title" id="art-susanna-title">Susanna and the Elders</h2>
        <img class="art-susanna-popup-image" src="{{ '/assets/img/Susanna and the Elders-2.jpeg' | relative_url | replace: ' ', '%20' }}" alt="Sculpture of Susanna and the Elders" />
        <p class="welcome-sequence-message" id="art-susanna-message">This sculpture depicts the biblical story of Susanna being spied upon by two lecherous elders. Created by Flemish sculptor named Van Bossuit, the work captures a dramatic moment of vulnerability and transgression. The artist's skilled carving reveals the tension and emotion of the narrative through careful attention to pose, gesture, and composition, exploring themes of power, shame, and divine justice.</p>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-susanna-close">Close</button>
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
    const artworkImage = document.querySelector('.artwork-image');

    if (!overlay || !close || (!trigger && !artworkImage)) return;

    function openRelief() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeRelief() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      if (artworkImage) {
        artworkImage.focus();
      } else if (trigger) {
        trigger.focus();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', openRelief);
    }
    if (artworkImage) {
      artworkImage.addEventListener('click', openRelief);
      artworkImage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRelief(); }
      });
    }
    close.addEventListener('click', closeRelief);
    closeButtons.forEach((button) => button.addEventListener('click', closeRelief));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeRelief();
    });
  })();

  (() => {
    const trigger = document.querySelector('.art-sconce-trigger');
    const overlay = document.getElementById('art-sconce-sequence');
    const close = document.getElementById('art-sconce-close');
    const closeButtons = document.querySelectorAll('[data-art-sconce-close]');
    const evidenceButtons = document.querySelectorAll('.art-sconce-evidence-button');
    const lightbox = document.getElementById('art-sconce-lightbox');
    const lightboxImage = document.getElementById('art-sconce-lightbox-image');
    const lightboxCloseButtons = document.querySelectorAll('[data-art-sconce-lightbox-close]');

    if (!trigger || !overlay || !close || !lightbox || !lightboxImage) return;

    function openSconce() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeSconce() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    function openLightbox(src, alt) {
      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightbox.hidden = false;
      document.body.classList.add('welcome-sequence-open');
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImage.src = '';
      lightboxImage.alt = '';
      if (overlay.hidden) {
        document.body.classList.remove('welcome-sequence-open');
      }
    }

    trigger.addEventListener('click', openSconce);
    close.addEventListener('click', closeSconce);
    closeButtons.forEach((button) => button.addEventListener('click', closeSconce));

    evidenceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        openLightbox(button.dataset.artSconceEvidence, button.dataset.artSconceAlt || 'Evidence image');
      });
    });

    lightboxCloseButtons.forEach((button) => button.addEventListener('click', closeLightbox));

    document.addEventListener('keydown', (event) => {
      if (!lightbox.hidden && event.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (!overlay.hidden && event.key === 'Escape') {
        closeSconce();
      }
    });
  })();

  (() => {
    const artworkImage = document.querySelector('.artwork-image-left');
    const overlay = document.getElementById('art-susanna-sequence');
    const close = document.getElementById('art-susanna-close');
    const closeButtons = document.querySelectorAll('[data-art-susanna-close]');

    if (!overlay || !close || !artworkImage) return;

    function openSusanna() {
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeSusanna() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      artworkImage.focus();
    }

    artworkImage.addEventListener('click', openSusanna);
    artworkImage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSusanna(); }
    });
    close.addEventListener('click', closeSusanna);
    closeButtons.forEach((button) => button.addEventListener('click', closeSusanna));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeSusanna();
    });
  })();
</script>
