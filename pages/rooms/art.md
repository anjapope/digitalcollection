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
          <polygon class="art-room-hotspot" points="335,286 445,286 445,609 335,609" />
          <text class="art-room-hotspot-label" x="390" y="587" text-anchor="middle">Enter Gallery</text>
        </a>
        <a xlink:href="{{ '/pages/rooms/natural-history.html' | relative_url }}" aria-label="Enter the Natural History Museum" target="_self">
            <polygon class="art-room-hotspot" points="35,261 145,286 145,609 35,634" />
            <text class="art-room-hotspot-label" x="90" y="587" text-anchor="middle">Natural History</text>
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
