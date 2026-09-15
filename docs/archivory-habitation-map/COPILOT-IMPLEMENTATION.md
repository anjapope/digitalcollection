# Copilot Implementation Instructions — Embedded ArchIvory Habitation Map

## Objective

Integrate the supplied habitation map **inside the existing Proboscidean Timeline instrument**.

Do not create a separate map page.

When a visitor clicks the timeline's existing **View habitation map** button, the lower timeline workspace should switch from the normal interpretation panel to the embedded map panel while the timeline rail/markers remain visible above it.

While the map is open, changing the active timeline state must immediately update the map.

## Technology

Use MapLibre GL JS.

Do not use an iframe.
Do not create a second page.
Do not use Google Maps.
Do not couple the map directly to timeline internals.

The timeline emits events; the map listens.

## Install files

Recommended destinations:

- `_includes/habitation-map.html`
- `assets/js/habitation-map.js`
- `assets/css/habitation-map.css` OR merge into `_sass/_custom.scss`
- `assets/data/habitation-map/map-states.json`
- `assets/data/habitation-map/geojson/*.geojson`

Preserve the supplied directory/data separation.

## MapLibre dependencies

Load MapLibre GL JS and its CSS once, using the project's existing asset strategy.

If MapLibre is already present in the repository, reuse it rather than loading a duplicate copy.

The map component expects `window.maplibregl`.

## Embed inside timeline workspace

The existing timeline currently has:
- timeline rail / markers;
- interpretation/state panel;
- View habitation map button.

Modify the timeline include only enough to create two lower workspace views:

1. interpretation view;
2. map view.

The timeline rail remains visible in both.

When `archivory:open-map-state` fires:
- hide the interpretation workspace;
- show the embedded habitation map workspace;
- open the requested map state;
- keep the timeline rail visible.

When the map close button is clicked:
- hide the map workspace;
- restore the interpretation workspace;
- do not change the active timeline state.

Do not navigate away from the Natural History room.

## Existing timeline event integration

The timeline already emits:

`archivory:open-map-state`

and:

`archivory:timeline-state-change`

The supplied map JS listens for both.

Do not replace these event contracts.

When the map is already open and the visitor selects another timeline marker, the map must update immediately to the new `mapState`.

Example:

`miocene-dispersal` → `miocene-range`

then selecting:

`pleistocene-diversity` → `pleistocene-range`

must update the same MapLibre canvas without closing it.

## Modes

Preserve three display modes:

- Evidence
- Reconstruction
- Combined

Evidence mode:
- show evidence points;
- hide reconstructed range polygons.

Reconstruction mode:
- show reconstructed range polygons;
- hide evidence points.

Combined mode:
- show both.

Historical network lines may remain visible in later states when present.

Do not imply that reconstructed polygons are direct evidence.

Preserve the note:

“Reconstructed ranges are interpretations of available evidence, not precise historical borders.”

## Map state IDs

Preserve these IDs exactly because they match the timeline data:

- `early-africa`
- `miocene-range`
- `pleistocene-range`
- `late-extinction`
- `elephant-range-2000bc`
- `west-africa-1600`
- `east-africa-ivory-1850`

Do not rename them.

## Data architecture

`map-states.json` controls:
- label;
- display date;
- summary;
- center;
- zoom;
- evidence GeoJSON;
- range GeoJSON;
- optional historical network GeoJSON;
- inquiry question.

GeoJSON files control spatial content.

Do not hard-code ranges or evidence locations into JavaScript.

## Placeholder data warning

Every supplied GeoJSON file is **placeholder implementation data** intended only to verify the map engine and state transitions.

Do not present it as vetted scholarship.

Do not silently convert the placeholder polygons or points into production data.

Keep obvious curator notes/placeholder indicators until vetted datasets replace them.

## Evidence popups

Evidence-point popups may show:
- label;
- approximate date;
- evidence type;
- short note.

Continue escaping popup text before insertion.

Do not allow arbitrary HTML from data files.

## Visual design

Keep the map embedded in the museum-instrument aesthetic of the timeline.

The base map should be visually subdued so evidence and reconstructions remain primary.

Do not make the interface look like Google Maps or a generic GIS dashboard.

Preserve the timeline's wood/brass/parchment language.

## State/event boundaries

The map must not:
- award points;
- alter timeline scoring;
- modify the Inquiry Terminal directly;
- change timeline question data;
- control room navigation.

The architectural rule remains:

**Modules emit state. ArchIvory decides what happens.**

## Events emitted by the map

Preserve:

- `archivory:habitation-map-state-change`
- `archivory:map-mode-change`
- `archivory:habitation-map-close`

## Public API

Preserve:

```js
window.ArchIvoryHabitationMap.open("miocene-range");
window.ArchIvoryHabitationMap.setState("east-africa-ivory-1850");
window.ArchIvoryHabitationMap.setMode("evidence");
window.ArchIvoryHabitationMap.close();
```

## Base-path handling

Before loading `habitation-map.js`, set URLs using Jekyll `relative_url`:

```html
<script>
window.ARCHIVORY_MAP_STATES_URL =
  "{{ '/assets/data/habitation-map/map-states.json' | relative_url }}";

window.ARCHIVORY_MAP_GEOJSON_BASE_URL =
  "{{ '/assets/data/habitation-map/geojson/' | relative_url }}";
</script>
```

The module must work:
- on localhost;
- on GitHub Pages under `/digitalcollection/`.

## Important MapLibre resize requirement

Because the map starts hidden inside the timeline workspace, call `map.resize()` immediately after the map panel becomes visible.

The supplied JS already schedules this after opening.

Do not remove it.

## Verification

Test all of the following:

1. Timeline still works normally before map is opened.
2. View habitation map opens the map **inside the timeline**, not a new page.
3. Timeline rail remains visible.
4. Close restores the interpretation panel.
5. MapLibre initializes only once.
6. Miocene state loads `miocene-range`.
7. Selecting Pleistocene while map is open updates to `pleistocene-range`.
8. Selecting 1850–1900 updates to `east-africa-ivory-1850`.
9. Evidence mode hides reconstruction.
10. Reconstruction mode hides evidence.
11. Combined mode shows both.
12. Evidence markers open escaped-text popups.
13. Historical network lines appear only where data exists.
14. No points are directly awarded.
15. No page navigation occurs.
16. No existing SVG room hotspot behavior changes.
17. Localhost base paths work.
18. GitHub Pages `/digitalcollection/` base paths work.

## Report back

Report:
- files added;
- timeline files modified;
- where MapLibre was loaded;
- whether the embedded view switch works;
- whether all seven timeline states update the map;
- whether the three map modes work;
- any console errors;
- any conflicts with existing MapLibre/Leaflet code.

Do not research or replace the placeholder geography yet.
Do not add animation yet.
Do not connect scoring yet.
