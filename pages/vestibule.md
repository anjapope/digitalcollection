---
title: "Vestibule Welcome"
layout: vestibule
permalink: /pages/vestibule.html
---

<section class="atrium-page">
  <h1 class="visually-hidden">Victorian house vestibule layout</h1>
  <div class="house-scene">
    <div class="house-backdrop">
      <div class="house-cornice"></div>
      <div class="house-paneling"></div>
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
      <a class="room-cornice-link room-cornice-link-center" href="{{ '/pages/rooms/archive.html' | relative_url }}">Archive Court</a>
      <button class="door-sign door-sign-natural-history" type="button" data-collection-sign="natural-history">Natural History</button>
      <button class="door-sign door-sign-art" type="button" data-collection-sign="art">Art</button>
      <button class="door-sign door-sign-local" type="button" data-collection-sign="local">Local</button>
      <button class="door-sign door-sign-attic" type="button" data-collection-sign="attic">Attic</button>
      <button class="door-sign door-sign-lab" type="button" data-collection-sign="lab">Lab</button>
      <a class="house-doorway house-doorway-left" href="{{ '/pages/rooms/natural-history.html' | relative_url }}" aria-label="Enter the Natural History room"></a>
      <a class="house-doorway house-doorway-left-inner" href="{{ '/pages/rooms/art.html' | relative_url }}" aria-label="Enter the Art room"></a>
      <a class="house-doorway house-doorway-right-inner" href="{{ '/pages/rooms/local.html' | relative_url }}" aria-label="Enter the Local room"></a>
      <a class="house-doorway house-doorway-right-front" href="{{ '/pages/rooms/attic.html' | relative_url }}" aria-label="Enter the Attic room"></a>
      <div class="house-sconce house-sconce-left"></div>
      <div class="house-sconce house-sconce-right"></div>
      <div class="house-portrait house-portrait-left"></div>
      <div class="house-portrait house-portrait-right"></div>
      <button class="house-console welcome-mantle" type="button" aria-haspopup="dialog" aria-controls="welcome-sequence" aria-label="Open welcome messages">
        <span class="welcome-mantle-label">Welcome</span>
      </button>
      <div class="house-rug"></div>
    </div>

    <div class="welcome-sequence" id="welcome-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-welcome-close></div>
      <div class="welcome-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-sequence-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close welcome messages" data-welcome-close>×</button>
        <p class="welcome-sequence-step" id="welcome-sequence-step">1 of 4</p>
        <h2 class="welcome-sequence-title" id="welcome-sequence-title">Welcome</h2>
        <p class="welcome-sequence-message" id="welcome-sequence-message"></p>
        <div class="welcome-sequence-actions">
          <button class="welcome-sequence-button welcome-sequence-button-secondary" type="button" id="welcome-prev">Back</button>
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="welcome-next">Next</button>
        </div>
      </div>
    </div>

    <div class="collection-sequence" id="collection-sequence" hidden>
      <div class="welcome-sequence-backdrop" data-collection-close></div>
      <div class="welcome-sequence-dialog collection-sequence-dialog" role="dialog" aria-modal="true" aria-labelledby="collection-sequence-title">
        <button class="welcome-sequence-close" type="button" aria-label="Close collection description" data-collection-close>×</button>
        <p class="welcome-sequence-step">Collection Pathway</p>
        <h2 class="welcome-sequence-title" id="collection-sequence-title">Collection</h2>
        <p class="welcome-sequence-message" id="collection-sequence-message"></p>
        <div class="welcome-sequence-actions">
          <a class="welcome-sequence-button welcome-sequence-button-secondary" id="collection-go-to-lab" href="{{ '/pages/rooms/lab.html' | relative_url }}" hidden>Go to Lab</a>
          <button class="welcome-sequence-button welcome-sequence-button-primary" type="button" id="collection-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  (() => {
    const messages = [
      {
        title: 'Welcome',
        text: 'Welcome to ArchIvory. This hall is your point of orientation before you choose a room to enter.'
      },
      {
        title: 'How to move through the house',
        text: 'Each doorway leads to a different pathway. You may begin anywhere and return here whenever you want to change direction.'
      },
      {
        title: 'What this exhibition asks',
        text: 'As you move through the rooms, look for the tension between beauty, collecting, memory, and the histories of extraction behind ivory objects.'
      },
      {
        title: 'When you are ready',
        text: 'Choose the doorway that draws you first. The rooms are distinct, but the stories between them remain connected.'
      }
    ];

    const trigger = document.querySelector('.welcome-mantle');
    const overlay = document.getElementById('welcome-sequence');
    const title = document.getElementById('welcome-sequence-title');
    const message = document.getElementById('welcome-sequence-message');
    const step = document.getElementById('welcome-sequence-step');
    const next = document.getElementById('welcome-next');
    const prev = document.getElementById('welcome-prev');
    const closeButtons = document.querySelectorAll('[data-welcome-close]');

    if (!trigger || !overlay || !title || !message || !step || !next || !prev) return;

    let currentIndex = 0;

    function renderMessage() {
      const item = messages[currentIndex];
      title.textContent = item.title;
      message.textContent = item.text;
      step.textContent = `${currentIndex + 1} of ${messages.length}`;
      prev.disabled = currentIndex === 0;
      next.textContent = currentIndex === messages.length - 1 ? 'Finish' : 'Next';
    }

    function openSequence() {
      currentIndex = 0;
      renderMessage();
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      next.focus();
    }

    function closeSequence() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      trigger.focus();
    }

    trigger.addEventListener('click', openSequence);

    next.addEventListener('click', () => {
      if (currentIndex === messages.length - 1) {
        closeSequence();
        return;
      }
      currentIndex += 1;
      renderMessage();
    });

    prev.addEventListener('click', () => {
      if (currentIndex === 0) return;
      currentIndex -= 1;
      renderMessage();
    });

    closeButtons.forEach((button) => button.addEventListener('click', closeSequence));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') {
        closeSequence();
      }
    });
  })();

  (() => {
    const collectionContent = {
      'natural-history': {
        title: 'Natural History',
        text: 'This pathway explores elephants, ivory as a biological material, and the scientific and environmental histories that shape how these objects are understood.'
      },
      art: {
        title: 'Art',
        text: 'This pathway focuses on ivory as a medium of craftsmanship, design, and display, while asking how beauty and technique are entangled with harder histories.'
      },
      local: {
        title: 'Local',
        text: 'This pathway follows the local lives of ivory objects through homes, communities, collectors, and regional institutions, tracing how global histories become intimate ones.'
      },
      attic: {
        title: 'Attic',
        text: 'This pathway approaches ivory through storage, inheritance, rediscovery, and memory, treating the attic as a space where forgotten objects gather new meanings.'
      },
      lab: {
        title: 'Lab',
        text: 'The Lab is where we do testing. This pathway focuses on analysis, microscopy, and technical methods used to distinguish ivory, bone, and related materials across collections.'
      }
    };

    const signButtons = document.querySelectorAll('[data-collection-sign]');
    const overlay = document.getElementById('collection-sequence');
    const title = document.getElementById('collection-sequence-title');
    const message = document.getElementById('collection-sequence-message');
    const close = document.getElementById('collection-close');
    const goToLab = document.getElementById('collection-go-to-lab');
    const closeButtons = document.querySelectorAll('[data-collection-close]');
    let activeTrigger = null;

    if (!signButtons.length || !overlay || !title || !message || !close || !goToLab) return;

    function openCollection(key, trigger) {
      const item = collectionContent[key];
      if (!item) return;
      activeTrigger = trigger;
      title.textContent = item.title;
      message.textContent = item.text;
      goToLab.hidden = key !== 'lab';
      overlay.hidden = false;
      document.body.classList.add('welcome-sequence-open');
      close.focus();
    }

    function closeCollection() {
      overlay.hidden = true;
      document.body.classList.remove('welcome-sequence-open');
      if (activeTrigger) activeTrigger.focus();
    }

    signButtons.forEach((button) => {
      button.addEventListener('click', () => openCollection(button.dataset.collectionSign, button));
    });

    close.addEventListener('click', closeCollection);
    closeButtons.forEach((button) => button.addEventListener('click', closeCollection));

    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeCollection();
    });
  })();
</script>
