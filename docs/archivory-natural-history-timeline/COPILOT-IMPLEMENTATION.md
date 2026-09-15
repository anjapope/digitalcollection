# Copilot Implementation Instructions — ArchIvory Natural History Timeline

Implement the supplied custom Natural History proboscidean timeline as a new room module. Do not use a third-party timeline library.

## Preserve the current timeline first
Create `archive/legacy-collection-timeline/` and copy the current CollectionBuilder timeline implementation there, including the current timeline page, `_layouts/timeline.html`, and `_includes/js/timeline-js.html` or their actual equivalents. Add a README stating that this is the original CollectionBuilder item-date timeline retained for later reuse. Do not delete the currently functioning timeline until the new module is verified.

## Install the new module
Use these package files as source and place them at:
- `_includes/proboscidean-timeline.html`
- `assets/js/proboscidean-timeline.js`
- `assets/data/proboscidean-timeline.json`
- either `assets/css/proboscidean-timeline.css` or merge the CSS into `_sass/_custom.scss`

Preserve the museum-instrument visual language. Do not convert it into generic Bootstrap cards or a normal web slider.

## Natural History room integration
Insert `{% include proboscidean-timeline.html %}` at the intended timeline location.

Before loading the JS, define:
```html
<script>
window.ARCHIVORY_TIMELINE_DATA_URL =
  "{{ '/assets/data/proboscidean-timeline.json' | relative_url }}";
</script>
```

Then load:
```liquid
<script src="{{ '/assets/js/proboscidean-timeline.js' | relative_url }}"></script>
```

The module must work both locally and under the GitHub Pages `/digitalcollection/` base path.

## Stable state IDs
Do not rename:
- `early-proboscideans`
- `miocene-dispersal`
- `pleistocene-diversity`
- `late-extinctions`
- `2000-bc`
- `1600-ad`
- `1850-1900`

## Event contracts
Preserve these events:
- `archivory:timeline-state-change`
- `archivory:open-map-state`
- `archivory:open-question`

The timeline must not directly manipulate maps, directly award points, or directly open other room modules. It emits state; ArchIvory decides what happens.

## Hash navigation
Preserve hashes like `#apt-miocene-dispersal` and `#apt-1850-1900`. Do not reuse the old CollectionBuilder `#y1850` convention.

Preserve:
```js
window.ArchIvoryTimeline.setStateById("miocene-dispersal");
window.ArchIvoryTimeline.getState();
```

## Data-driven design
Treat `assets/data/proboscidean-timeline.json` as curator-editable content. Do not hard-code exhibit copy into JavaScript.

## Content caution
The supplied text is starter interpretive copy, not final vetted scholarship. Do not silently expand or alter historical/scientific claims. Flag anything that needs curator verification.

## Initial verification
Confirm:
1. module loads locally;
2. module loads under GitHub Pages base path;
3. all 7 markers render;
4. markers update state copy;
5. Previous/Next work;
6. URL hash updates;
7. direct load with `#apt-1850-1900` selects that state;
8. `archivory:timeline-state-change` fires;
9. map button fires `archivory:open-map-state`;
10. question button fires `archivory:open-question`;
11. no score is directly awarded;
12. no map is directly opened;
13. existing SVG room behavior remains untouched.

Do not implement habitation maps yet.
Do not connect scoring yet.
Do not remove the old CollectionBuilder timeline yet.

When finished, report all files added/modified, all files archived, test results, and any conflicts with the old timeline.
