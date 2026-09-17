---
title: "The Natural History Museum"
layout: vestibule
room_id: natural_history
permalink: /pages/rooms/natural-history.html
custom-foot: js/archivory-inquiry-terminal.html
---

<section class="atrium-page collection-room-natural-history">
  <h1 class="visually-hidden">The Natural History Museum</h1>

  <div class="house-scene">
    <div class="house-backdrop natural-history-hall">
      <div class="natural-history-stage">
        <img class="natural-history-room-image" src="{{ '/assets/img/Natural History Museum Interior12.jpg' | relative_url }}" alt="" width="1402" height="1122" aria-hidden="true">
      <div class="house-cornice"></div>
      <a class="room-cornice-link room-cornice-link-left" href="{{ '/pages/vestibule.html' | relative_url }}">Back to Hall</a>
      <a class="room-cornice-link room-cornice-link-right" href="{{ '/pages/pathways-overview.html' | relative_url }}">Pathways Overview</a>
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

      <div class="natural-history-room-plaque">
        <p class="collection-room-kicker">Collection Room</p>
        <h2>The Natural History Museum</h2>
        <p class="collection-room-lead">A room for elephants, ivory as material, and the scientific and environmental histories that shape this collection.</p>
      </div>

      <svg class="natural-history-hotspots" viewBox="0 0 1402 1122" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Natural History room links">
        <a href="{{ '/map.html' | relative_url }}" aria-label="Open the map" target="_self" data-notebook-id="natural-history-map" data-notebook-title="Proboscidean world map" data-notebook-type="evidence" data-notebook-points="5" data-notebook-description="A spatial evidence tool for tracking ivory histories, elephant ranges, and trade geographies.">
          <rect class="natural-history-hotspot natural-history-hotspot-map" x="885" y="250" width="144" height="245" rx="20" ry="16" />
          <text class="natural-history-hotspot-label" x="956" y="385" text-anchor="middle">Map</text>
        </a>

        <a href="#" aria-label="Open the Ivory Inquiry Terminal" target="_self" data-hotspot="inquiry-tusk" data-notebook-id="natural-history-tusk" data-notebook-title="Ivory Inquiry Terminal" data-notebook-type="tool" data-notebook-points="10" data-notebook-description="Use the inquiry terminal to ask evidence-based questions about the tusk and the natural history of ivory.">
          <rect class="natural-history-hotspot-hitarea" x="336" y="478" width="729" height="289" rx="25" ry="20" />
          <polygon class="natural-history-hotspot natural-history-hotspot-tusk" points="336,478 1066,478 1066,767 336,767" />
          <text class="natural-history-hotspot-label natural-history-hotspot-label-small natural-history-hotspot-label-tusk" x="701" text-anchor="middle"><tspan x="701" y="623">Ask a</tspan><tspan x="701" dy="20">Question</tspan></text>
        </a>

        <a href="{{ '/pages/rooms/historical-society.html' | relative_url }}" aria-label="Go to the Historical Society room" target="_self">
           <polygon class="natural-history-hotspot natural-history-hotspot-doorway natural-history-hotspot-doorway-left" points="101,229 238,257 238,704 101,797" />
          <text class="natural-history-hotspot-label natural-history-hotspot-label-small" x="151" y="656" text-anchor="middle">Historical Society</text>
        </a>

        <a href="{{ '/pages/rooms/art.html' | relative_url }}" aria-label="Go to Conservation Lab" target="_self">
          <polygon class="natural-history-hotspot natural-history-hotspot-doorway" points="1141,221 1283,176 1283,780 1134,672" />
        </a>

        <a href="#" aria-label="Open the timeline" data-open-room-timeline data-notebook-id="natural-history-timeline" data-notebook-title="Natural history evidence timeline" data-notebook-type="evidence" data-notebook-points="8" data-notebook-description="A layered timeline linking extinction, habitat change, and expanding ivory extraction.">
          <polygon class="natural-history-hotspot natural-history-hotspot-timeline" points="1325,334 1396,330 1396,579 1325,557" />
          <text class="natural-history-hotspot-label natural-history-hotspot-label-small" x="1361" y="561" text-anchor="middle" transform="rotate(18 1361 561)">Timeline</text>
        </a>
      </svg>

      <div class="natural-history-timeline-exhibit natural-history-timeline-exhibit-inline natural-history-timeline-module-shell natural-history-timeline-module-shell-draggable is-dismissed" data-room-timeline-exhibit>
        <button class="natural-history-timeline-popup-close natural-history-timeline-module-close" type="button" aria-label="Close timeline" data-room-timeline-close>✕</button>
        {% include proboscidean-timeline.html %}
      </div>

      </div>

    </div>
  </div>
</section>

{% include archivory-inquiry-terminal.html %}

<script>
  (() => {
    const trigger = document.querySelector('[data-open-room-timeline]');
    const exhibit = document.querySelector('[data-room-timeline-exhibit]');
    if (!trigger || !exhibit) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'room-modal room-explorer-dialog';
    dialog.setAttribute('aria-label', 'Deep-time explorer');
    document.body.append(dialog);
    dialog.append(exhibit);
    const open = () => {
      exhibit.classList.remove('is-dismissed');
      if (!dialog.open) dialog.showModal();
    };
    trigger.addEventListener('click', event => { event.preventDefault(); open(); });
    exhibit.querySelector('[data-room-timeline-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); dialog.close(); });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
    dialog.addEventListener('close', () => {
      exhibit.classList.add('is-dismissed');
      document.querySelector('[data-slot-id="natural_history_timeline_01"]')?.focus();
    });
    new MutationObserver(() => {
      if (exhibit.classList.contains('is-dismissed') && dialog.open) dialog.close();
    }).observe(exhibit, { attributes:true, attributeFilter:['class'] });
    if (/^#apt-/.test(location.hash)) open();
    window.addEventListener('hashchange', () => { if (/^#apt-/.test(location.hash)) open(); });
  })();
</script>
