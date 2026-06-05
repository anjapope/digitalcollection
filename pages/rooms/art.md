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
      <a class="art-cornice-link art-cornice-link-center" href="{{ '/pages/rooms/archive.html' | relative_url }}">Archive Court</a>
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

      <div class="art-wall-frame art-wall-frame-left" aria-hidden="true">
        <span class="artwork-mat"></span>
        <span class="artwork-surface artwork-surface-study"></span>
      </div>
      <button class="art-sconce-frame art-sconce-trigger" type="button" aria-haspopup="dialog" aria-controls="art-sconce-sequence" aria-label="Open Roman wall sconce information">
        <img src="{{ '/assets/img/RomanWallSconce_cutout.png' | relative_url }}" alt="" />
      </button>
      <button class="art-wall-frame art-wall-frame-right art-wall-frame-trigger art-relief-trigger" type="button" aria-haspopup="dialog" aria-controls="art-relief-sequence" aria-label="Open Barberini Ivory information">
        <span class="artwork-mat"></span>
        <span class="artwork-surface artwork-surface-ivory"></span>
      </button>

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

      <button class="art-kiosk art-kiosk-trigger" type="button" aria-haspopup="dialog" aria-controls="art-kiosk-sequence" aria-label="Open global ivory database information kiosk">
        <span class="art-kiosk-screen" aria-hidden="true"></span>
        <span class="art-kiosk-neck" aria-hidden="true"></span>
        <span class="art-kiosk-stand-base" aria-hidden="true"></span>
      </button>

      <div class="house-rug"></div>
    </div>

    <div class="collection-sequence art-relief-sequence" id="art-relief-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-relief-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-relief-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-relief-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close relief information" data-art-relief-close>×</button>
        <p class="welcome-sequence-step">Art Object</p>
        <h2 class="welcome-sequence-title" id="art-relief-title">Ivory Relief</h2>
        <img class="art-relief-popup-image" src="{{ '/assets/img/barberini%20ivory1.jpg' | relative_url }}" alt="Large view of the Barberini Ivory relief" />
        <p class="welcome-sequence-message" id="art-relief-message">Artisans of Late Antiquity created highly detailed relief sculptures from ivory, including this piece- the Barberini Ivory- from 6th century Constantinople. Now held in the Louvre, it depicts the emperor (likely Justinian) achieving victory over his barbarian foes. While it is the only such extant piece that celebrates secular power, the presence of angels in the background reveal the supremacy of ecclesiastical authority.</p>
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
        <img class="art-sconce-popup-image" src="{{ '/assets/img/RomanWallSconce%20-%2003-06-2026%2014-41-38.jpeg' | relative_url }}" alt="Large view of the Roman wall sconce" />
        <p class="welcome-sequence-message">This Roman wall sconce is located at the Eskenazi Museum of Art at Indiana University. Listed as likely ivory, this piece has characteristics that are more reflective of bone. The bubbling structures seen on the underside and the dull coloring provide strong visual cues for this hypothesis, and similar finds at the Louvre are reported to be bone as well. Further testing is required.</p>
        <div class="art-sconce-thumbnails">
          <button class="art-sconce-thumbnail-btn art-sconce-bubbles-trigger" type="button" aria-haspopup="dialog" aria-controls="art-sconce-bubbles-sequence" aria-label="View bubbling structures detail">
            <img class="art-sconce-thumbnail" src="{{ '/assets/img/sconcebubbles.jpeg' | relative_url }}" alt="Thumbnail of bubbling structures" />
          </button>
          <button class="art-sconce-thumbnail-btn art-sconce-measured-trigger" type="button" aria-haspopup="dialog" aria-controls="art-sconce-measured-sequence" aria-label="View measurement detail">
            <img class="art-sconce-thumbnail" src="{{ '/assets/img/SconceMeasured.jpeg' | relative_url }}" alt="Thumbnail of measurement detail" />
          </button>
        </div>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-sconce-close">Close</button>
        </div>
      </div>
    </div>

    <div class="collection-sequence art-kiosk-sequence" id="art-kiosk-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-kiosk-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-kiosk-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="art-kiosk-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close kiosk information" data-art-kiosk-close>×</button>
        <p class="welcome-sequence-step">Interactive Kiosk</p>
        <h2 class="welcome-sequence-title" id="art-kiosk-title">Global Ivory Objects Database</h2>
        <p class="welcome-sequence-message">Our data science team is developing an interactive database connecting data from approximately 80,000 ivory objects across museums worldwide.</p>
        <p class="welcome-sequence-message">This kiosk will link to the live database portal for comparative research, object tracking, and material analysis as soon as it is released.</p>
        <div class="welcome-sequence-actions">
          <a class="welcome-sequence-button welcome-sequence-button-primary art-kiosk-link" href="https://example.org/ivory-database" target="_blank" rel="noopener noreferrer">Open Database Portal</a>
          <button class="welcome-sequence-button" type="button" id="art-kiosk-close">Close</button>
        </div>
      </div>
    </div>
    <div class="collection-sequence art-sconce-bubbles-sequence" id="art-sconce-bubbles-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-sconce-bubbles-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-sconce-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="art-sconce-bubbles-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close bubbles detail" data-art-sconce-bubbles-close>×</button>
        <h2 class="welcome-sequence-title" id="art-sconce-bubbles-title">Bubbling Structures</h2>
        <img src="{{ '/assets/img/sconcebubbles.jpeg' | relative_url }}" alt="Detail of bubbling structures on sconce" class="art-sconce-detail-image" />
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-sconce-bubbles-close">Close</button>
        </div>
      </div>
    </div>

    <div class="collection-sequence art-sconce-measured-sequence" id="art-sconce-measured-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-art-sconce-measured-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog art-sconce-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="art-sconce-measured-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close measurement detail" data-art-sconce-measured-close>×</button>
        <h2 class="welcome-sequence-title" id="art-sconce-measured-title">Measurement Detail</h2>
        <img src="{{ '/assets/img/SconceMeasured.jpeg' | relative_url }}" alt="Measurement detail of sconce" class="art-sconce-detail-image" />
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="art-sconce-measured-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    function setupSequence({ triggerSelector, overlayId, closeId, closeSelector }) {
      const triggers = document.querySelectorAll(triggerSelector);
      const overlay = document.getElementById(overlayId);
      const close = document.getElementById(closeId);

      if (!triggers.length || !overlay || !close) return;

      const closeButtons = overlay.querySelectorAll(closeSelector);
      let activeTrigger = triggers[0];

      function openSequence(event) {
        if (event?.currentTarget) {
          activeTrigger = event.currentTarget;
        }
        overlay.hidden = false;
        document.body.classList.add('welcome-sequence-open');
        close.focus();
      }

      function closeSequence() {
        overlay.hidden = true;
        document.body.classList.remove('welcome-sequence-open');
        if (activeTrigger) {
          activeTrigger.focus();
        }
      }

      triggers.forEach((trigger) => trigger.addEventListener('click', openSequence));
      close.addEventListener('click', closeSequence);
      closeButtons.forEach((button) => button.addEventListener('click', closeSequence));

      document.addEventListener('keydown', (event) => {
        if (overlay.hidden) return;
        if (event.key === 'Escape') closeSequence();
      });
    }

    setupSequence({
      triggerSelector: '.art-relief-trigger',
      overlayId: 'art-relief-sequence',
      closeId: 'art-relief-close',
      closeSelector: '[data-art-relief-close]'
    });

    setupSequence({
      triggerSelector: '.art-sconce-trigger',
      overlayId: 'art-sconce-sequence',
      closeId: 'art-sconce-close',
      closeSelector: '[data-art-sconce-close]'
    });

    setupSequence({
      triggerSelector: '.art-kiosk-trigger',
      overlayId: 'art-kiosk-sequence',
      closeId: 'art-kiosk-close',
      closeSelector: '[data-art-kiosk-close]'
    });

    setupSequence({
      triggerSelector: '.art-sconce-bubbles-trigger',
      overlayId: 'art-sconce-bubbles-sequence',
      closeId: 'art-sconce-bubbles-close',
      closeSelector: '[data-art-sconce-bubbles-close]'
    });

    setupSequence({
      triggerSelector: '.art-sconce-measured-trigger',
      overlayId: 'art-sconce-measured-sequence',
      closeId: 'art-sconce-measured-close',
      closeSelector: '[data-art-sconce-measured-close]'
    });
  })();
</script>
