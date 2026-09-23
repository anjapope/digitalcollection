# ArchIvory restoration work log

## Baseline

Restored checkout: `C:/Users/anjap/OneDrive/Desktop/fresh clone/digitalcollection`, commit `985b53c`. Git status was clean before work; no uncommitted source work needed stashing. No AGENTS.md was found in the checkout or its immediate parents. CONTRIBUTING.md requests simple, progressive, documented changes.

No host process listened on port 3000. `_config.local.yml` reserves its URL for the inquiry API. Port 4000 was discovered to serve a different, older exhibition with `rooms-v2` artwork and placement scripts. It is not the baseline. This checkout is previewed on `http://127.0.0.1:4010` using Jekyll. Nothing is published.

Baseline screenshots use 1440 × 1000 and 390 × 844 viewports, saved under `screenshots/before-*`. Existing narrow-screen stretching, cornice navigation, welcome control and CSS Lab scenery are baseline behavior, not new scene transformations.

## Architecture and file impact

- Source: `pages/vestibule.md`, `pages/rooms/*.md`, `_layouts/vestibule.html`. `_site` is generated, never an editing source.
- Presentation: `_sass/_custom.scss`, original `assets/img/*Interior*` files; Natural History has its own 1402 × 1122 stage. Other image rooms use their existing backdrop sizing. Lab is CSS scenery.
- Editorial storage: CollectionBuilder CSV files in `_data`, read directly by Jekyll. New Rooms, ExhibitSlots, Placements, activity and event CSVs extend that pipeline. JSON is a generated transport, not a second editorial database.
- Geometry: versioned room manifests in `_data/room_anchors.json`, separate from placement rows.
- Runtime: scoped placement CSS, a pure validation/resolution module, room adapters and one reusable chronology dialog.
- Preserve: original object dialogs and evidence lightbox, `proboscidean-timeline.js`, habitation map events, inquiry terminal, welcome/check-in and existing notebook storage identifiers.
- Earlier placement code is absent from this checkout's Git history. The other preview is reference only. No earlier approved Gallery doorway was found in the checkout or targeted nearby project searches.

## Artwork constraints

Original raster assets stay unchanged. Edited assets must preserve their dimensions and be compared outside an explicitly recorded edit rectangle. Gallery's illustrated fan is fixed scenery: it is not automatically the New Harmony fan. The two wall relief identities need curator verification. Lab has no illustrated room background in the baseline.

## Delivered artwork

All paths below are relative to `assets/img`. ImageGen supplied localized scenery candidates; the user approved deterministic compositing on 2026-09-16. `utilities/compose-room-artwork.ps1` copies only the declared rectangle, feathers inward by 12 pixels, preserves the original canvas, and checks every exterior pixel. Each delivered composite passed with **zero changed exterior pixels**. Originals are retained byte-for-byte in Git.

| Original | Versioned edit | Canvas | Edit rectangle x, y, width, height |
| --- | --- | --- | --- |
| `Gallery Interior 12.png` | `room-edits/gallery-door-v1.png` | 1445 × 1089 | 828, 338, 208, 260 |
| `Art Museum Interior 12.png` | `room-edits/conservation-lab-poster-v1.png` | 1448 × 1086 | 237, 279, 157, 375 |
| `Historical Society Interior 12.png` | `room-edits/historical-society-poster-v1.png` | 1441 × 1091 | 386, 313, 168, 200 |
| `Attic Interior 12.png` | `room-edits/attic-board-v1.png` | 1535 × 1024 | 430, 300, 177, 205 |

The Gallery doorway has depth, a frame, and a Conservation Lab plaque. Its invisible SVG link occupies the opening. The Conservation Lab poster stays on the left wall, short of the corner. Historical Society's poster sits left of the piano; Attic's board sits left of the round window. Generated dates were rejected; event dates and extended text are editable data in the dialog. The office already had a painted monitor: its red locator was removed and its hit region aligned to the monitor, with no raster edit.

Natural History reuses its recessed lower panel and specimen plaque for restrained dynamic text. Gallery's small empty frame contains a replaceable photograph. Other painted objects remain fixed exhibits; assigning research to their panels never visually replaces them.

## Editing placements

1. Edit the UTF-8 CSVs in `_data` using a spreadsheet or CSV editor. Preserve headers and stable IDs; export consistent line endings. No credentials or live database are required.
2. `rooms.csv` enables rooms and records routes/assets. `exhibit_slots.csv` defines capacities and supported presentation types. `display_description` optionally explains the physical display independently of the number of research records.
3. Add or update a `room_content.csv` record. Existing collection metadata remains in `demo-metadata.csv`; the transport joins it by unchanged `objectid`, including `ChineseUVIvoryCollection`. Existing researched dialogs are accessed by their adapter IDs rather than copied into a second database.
4. Change only `content_id` in the appropriate `placements.csv` row to reassign content. Keep `placement_id` and `slot_id` stable. `content_type` must match the record and slot, except collection slots accept supported non-timeline records. Set `published` to `false` to leave the furnishing inactive. Multiple placement rows can reference one content record.
5. Build, run the focused tests, and inspect that room at both viewport sizes. Do not edit `_site` or regenerate the art to change a description or date.

Example: `gallery_wall_03_1` assigns `gallery-roman-wall-sconce` to `gallery_wall_03`. Changing its content ID opens different research from the same frame. An `image` path renders inside this prepared empty frame; an absent image leaves it empty. Existing notebook attributes are preserved only when they identify the assigned record, preventing a swapped object from receiving the former object's evidence credit. No visitor storage keys are changed.

Supported adapters are an existing dialog element ID, `trigger:<selector>` for an existing tool, or `route:<local path>`. New ordinary records need no adapter: their title, description, image and citation open in a shared dialog. New tool behavior requires a deliberate adapter; an editorial label does not implement a tool. Generic new placements do not automatically award notebook points.

## Adding or revising a chronology

`room_timelines.csv` holds the base activity copy plus optional title, deep question, date bounds, `scale_mode`, weighted `scale_config`, publication, and completion reflection. Its events are matching rows in `timeline_events.csv`, joined by `timeline_id`; no duplicated events array is stored. Events retain `sortKey` for normalized chronology and `displayedDate` for visitor-facing BCE/CE, range, or uncertainty labels, with optional post-placement reveal text, prompt, and publication state.

The shared chronology supports two demonstrated scale strategies: **guided/segmented** weighting for Natural History's `deep_time_evidence`, where very large historical intervals need readable compression, and **linear/proportional** spacing for Conservation Lab's `ivory_ages`, where signed numeric BCE/CE values preserve continuous chronological distance. Both use the same chronology engine and workbook data model.

Use at least two events with unique IDs and numeric sort keys. Dates shown to visitors are independent of sort keys. Give equivalent or indistinguishable dates the same key: either relative order is accepted. Explain uncertainty in the displayed date and extended explanation. The Natural History keys represent broad interval onsets for this teaching sequence, not precise dates of individual specimens. Do not imply a total chronology that the evidence cannot support.

Create a timeline placement using `content_type=timeline` and a timeline slot. The shared `ArchIvoryChronology.mount(host, config, events)` creates independent instances, so a later comparative activity can place two scales side by side. Pointer handles support mouse/touch, arrow keys and Earlier/Later buttons reorder events, Check Timeline reports positions, and Shuffle and retry starts another attempt. Success explains the scale's interpretive significance. The optional `archivory:chronology-complete` event does not modify notebook progress.

## Geometry and debugging

`room_anchors.json` is the geometry authority: each anchor records its room, stable slot, artwork version, source dimensions, polygon, content bounds, optional label bounds, layer, mount, presentation mode and fit. Coordinates scale with the existing artwork container and its existing presentation. There is no new shared scene-sizing rule. Existing CSS Lab furnishings bind directly to their DOM selectors.

The habitation map uses `component_mount=true` inside the deep-time explorer. It does not create another wall hit region. For a new perspective surface, author and verify suitable content geometry before enabling inline imagery; this implementation's replaceable Gallery frame is front-facing and uses SVG fit bounds.

In a development build, append `?anchors=1` to a room URL to see outlines and slot IDs, including reserved empty locations. Development console diagnostics report invalid references, duplicate IDs, unsupported types, invalid geometry and capacity overflow. Invalid bindings are skipped. A production build sets `data-development=false`, disabling both outlines and editorial diagnostics.

## Local checks

```powershell
bundle exec jekyll build --config _config.yml,_config.local.yml
node --test utilities/test-room-placement.cjs
bundle exec jekyll serve --config _config.yml,_config.local.yml --host 127.0.0.1 --port 4010 --skip-initial-build --no-watch
```

The preview uses manual rebuilds to avoid overlapping watcher builds. Jekyll still emits the pre-existing sanitized-filename notice for `ChineseUVIvoryCollection`; its content ID has intentionally been preserved.

See [validation and limitations](VALIDATION.md), [exact file inventory](FILES.md), and [screenshots](screenshots/).
