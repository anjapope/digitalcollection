---
title: "Natural History Timeline"
layout: vestibule
permalink: /pages/rooms/natural-history-timeline.html
custom-foot: js/archivory-inquiry-terminal.html
---

<section class="atrium-page natural-history-timeline-page">
  <h1 class="visually-hidden">Natural History timeline</h1>

  <div class="house-scene">
    <div class="house-backdrop natural-history-hall natural-history-timeline-hall">
      <div class="house-cornice"></div>
      <a class="room-cornice-link room-cornice-link-left" href="{{ '/pages/rooms/natural-history.html' | relative_url }}">Back to The Natural History Museum</a>
      <a class="room-cornice-link room-cornice-link-right" href="{{ '/pages/vestibule.html' | relative_url }}">Back to Hall</a>
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

      <div class="natural-history-room-plaque natural-history-timeline-plaque">
        <p class="collection-room-kicker">Natural History Timeline</p>
        <h2>Elephants Through Deep Time</h2>
        <p class="collection-room-lead">A focused timeline tracing the ecological power of proboscideans, the extinction of their ancient relatives, and the historical pressures placed on modern elephants.</p>
      </div>

      <div class="natural-history-timeline-exhibit natural-history-timeline-module-shell">
        {% include proboscidean-timeline.html %}
      </div>

      <div class="house-rug"></div>
    </div>
  </div>
</section>

{% include archivory-inquiry-terminal.html %}
