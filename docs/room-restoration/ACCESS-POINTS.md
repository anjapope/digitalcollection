# ArchIvory editable access-point reference

Audit date: 2026-09-17  
Source branch: `main`  
Source of truth: `_data/exhibit_slots.csv`, `_data/placements.csv`, `_data/rooms.csv`, `_data/room_anchors.json`, and the room pages under `pages/rooms/`.

This document is the editor-facing vocabulary for the room editorial workbook. It describes the prepared locations, not a new database. Keep `slot_id`, `room_id`, `anchor_id`, and `placement_id` stable when editing content. Change a placement's `content_id`, `content_type`, `sort_order`, or `published` value only when the slot's capacity and supported type permit it.

## Audit result

- **48 enabled editable access points** are defined.
- All 48 belong to the eight enabled rooms in `_data/rooms.csv`.
- All 48 have one unique anchor in `_data/room_anchors.json`.
- All 48 anchors match their slot and room IDs and have valid geometry, except the intentional nested component mount documented below.
- All active placements reference an existing slot and existing content or timeline.
- No slot IDs, anchor IDs, or placement IDs are duplicated.
- No slot is counted twice because of duplicate geometry.
- Timeline activities are represented by four explicit timeline slots. Their event rows remain separate in `_data/timeline_events.csv`.
- The restored Vestibule -> Gallery -> Conservation Lab route remains present in the room pages.

The 48 locations are editorial access points, not 48 rooms. Empty locations are reserved and do not create a visitor control until a valid published placement is supplied.

## Count by room

| `room_id` | Display name | Enabled slots |
|---|---|---:|
| `vestibule` | Vestibule | 1 |
| `gallery` | Gallery | 7 |
| `conservation_lab` | Conservation Lab | 4 |
| `historical_society` | Historical Society | 6 |
| `attic` | Attic | 6 |
| `natural_history` | Natural History Museum | 12 |
| `conservators_office` | Conservator's Office | 6 |
| `lab` | Lab | 6 |
| **Total** |  | **48** |

## How to read the tables

- **Used** means at least one placement for the slot is currently `published=true`; `reserved` means the slot is valid but has no active placement.
- **Supported content** is the slot type normally expected by the resolver. Collection slots may also accept ordinary detail records, which is how the current Gallery and Conservation Lab research records are bound.
- **Anchor** is the stable geometry key. The anchor's `mount` is the existing room-page element where the placement layer is attached. A non-empty `selector` means the placement reuses an existing authored control instead of creating a new polygon.
- **Nested component** means the location belongs to an existing tool component. It is not a second wall location.

## Presentation and visual-media semantics

`presentation_mode` and `inline_content` are complementary anchor metadata; neither duplicates the other.

- `presentation_mode` controls interaction: `detail` opens the assigned detail record, `collection` opens the slot's research list, `timeline` opens the chronology activity, and `tool` opens or routes to its authored tool.
- `inline_content` controls visual rendering. A published placement whose resolved content has an image renders that image in the anchor's `content_bounds` only when `inline_content=true`. `false` leaves the slot interaction-only.
- `content_bounds`, `mount`, and, where present, `selector` position the visual and its existing clickable target. `fit` controls aspect-ratio behavior. `media_presentation` may opt a mount into a subtle shadow treatment; it preserves transparent source assets and does not remove baked-in backgrounds.

### Controlled capability audit

The visual editable mounts are `gallery_wall_03`, `gallery_case_02`, `historical_society_case_01`, `historical_society_case_02`, `attic_trunk_01`, `attic_trunk_02`, `attic_shelves_01`, `attic_table_01`, `natural_history_panel_02`, `natural_history_timeline_02`, `natural_history_table_01`, `natural_history_table_02`, `conservators_office_shelves_01`, `conservators_office_shelves_02`, and `conservators_office_shelves_03`. Their anchors use `inline_content=true`; an image-bearing placement uses the existing geometry without changing the room background.

The interaction-only hotspots are all seven introduction slots, `vestibule_welcome_01`, `gallery_wall_01`, `gallery_wall_02`, `gallery_case_01`, `conservation_lab_table_01`, `conservation_lab_timeline_01`, `conservation_lab_media_01`, `historical_society_timeline_01`, `historical_society_piano_01`, `historical_society_table_01`, `attic_timeline_01`, `natural_history_specimen_01`, `natural_history_specimen_01_label`, `natural_history_panel_01`, `natural_history_map_01`, `natural_history_timeline_01`, `natural_history_inquiry_01`, `conservators_office_terminal_01`, `conservators_office_panel_01`, `lab_bench_01`, `lab_equipment_01`, `lab_cabinet_01`, `lab_cabinet_02`, and `lab_attic_context_01`. These remain `inline_content=false` because they are interpretation, tools, authored scenery, or existing illustrated furnishings rather than editorial media mounts.

`natural_history_map_02` is the one special-case component mount: it is a nested control inside the deep-time explorer rather than a standalone room surface. It remains interaction-only.

## Vestibule

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `vestibule_welcome_01` | `Est. 1992` area at the lower-left of the Vestibule scene | 1 | `tool` | `vestibule_welcome_01_anchor` / `.house-backdrop`; selector `.vestibule-welcome-trigger` | used; `welcome-sequence` | Reuses the responsive SVG welcome hotspot. Preserve the welcome/check-in behavior and its existing visitor-storage identifiers. |

## Gallery

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `gallery_intro` | Gallery introduction poster/label area near the lower center of the gallery | 1 | `detail` | `gallery_intro_anchor` / `.gallery-hall` | used; `gallery_intro` | Ordinary detail content. This is interpretive copy for the room, not proof of identity for painted scenery. |
| `gallery_wall_01` | Near left-wall relief, the tall relief at the far-left wall | 8 | `collection` or `detail` | `gallery_wall_01_anchor` / `.gallery-hall` | used; `gallery-fixed-wall_01`, `art-susanna-sequence` | The painted relief identity is unverified. Current records are comparative research and must not be presented as identification of the illustrated object. |
| `gallery_wall_02` | Far left-wall relief, the smaller relief farther along the left wall | 8 | `collection` or `detail` | `gallery_wall_02_anchor` / `.gallery-hall` | used; `gallery-fixed-wall_02`, `art-relief-sequence` | The painted relief identity is unverified. Keep comparative-research language unless curatorial evidence changes. |
| `gallery_case_01` | Front glass case spanning the foreground center | 8 | `collection` or `detail` | `gallery_case_01_anchor` / `.gallery-hall` | used; `gallery-fixed-fan` | The illustrated fan is fixed scenery. It is not the New Harmony fan record and should not inherit that object's provenance. |
| `gallery_case_02` | Rear round display/case toward the center-rear of the gallery | 8 | `collection` or `detail` | `gallery_case_02_anchor` / `.gallery-hall` | reserved; none | Reserved empty furnishing. Publish only supported research; do not infer an object identity from the painted display. |
| `gallery_wall_03` | Small rear-wall frame at the right/rear wall | 1 | `detail` | `gallery_wall_03_anchor` / `.gallery-hall`; selector `.art-sconce-trigger` | used; `gallery-roman-wall-sconce` | Reuses the existing sconce control and evidence lightbox. An image in the placement record can replace the photograph inside this frame without changing geometry. |

## Conservation Lab

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `conservation_lab_intro` | Conservation Lab introduction poster on the upper wall | 1 | `detail` | `conservation_lab_intro_anchor` / `.art-hall` | used; `conservation_lab_intro` | Interpretive room introduction. Do not use it to claim that painted figures are identified objects. |
| `conservation_lab_table_01` | Central table/display of painted ivory figures | 12 | `collection` or `detail` | `conservation_lab_table_01_anchor` / `.art-hall`; selector `.art-table-overlay-trigger` | used; `ChineseUVIvoryCollection` | The painting shows six figures, but capacity is twelve research records. The current record is the IU Eskenazi collection record; related research does not identify the painted figures without evidence. |
| `conservation_lab_timeline_01` | Ivory Through the Ages activity area on the lower/right display | 1 | `timeline` | `conservation_lab_timeline_01_anchor` / `.art-hall` | used; `ivory_ages` | Timeline activity slot. Its event rows live in `timeline_events.csv`; the dates and teaching sequence require curatorial review before being presented as object history. |
| `conservation_lab_media_01` | Rear analysis workbench | 1 | `tool` | `conservation_lab_media_01_anchor` / `.art-hall` | used; `conservation-methods` | Opens the existing analysis workbench notice. No additional analysis media should be implied until supplied. |

## Historical Society

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `historical_society_intro` | Historical Society introduction poster/label area near the center-left wall | 1 | `detail` | `historical_society_intro_anchor` / `.local-hall` | reserved; none | Valid reserved location with no active control. Add reviewed interpretive copy when ready. |
| `historical_society_timeline_01` | Local Lives activity area near the center display | 1 | `timeline` | `historical_society_timeline_01_anchor` / `.local-hall` | used; `local_lives` | Timeline activity. Current events are explicitly fictional teaching examples, not provenance for an exhibited object. |
| `historical_society_case_01` | Window-side display case | 8 | `collection` or `detail` | `historical_society_case_01_anchor` / `.local-hall` | reserved; none | Empty reserved case. Do not treat the case or room scenery as evidence of an object's maker, material, or ownership. |
| `historical_society_case_02` | Foreground-right display case | 8 | `collection` or `detail` | `historical_society_case_02_anchor` / `.local-hall` | reserved; none | Empty reserved case. Publish only records with an editor-supplied description and citation. |
| `historical_society_piano_01` | Illustrated piano in the foreground/right of the room | 1 | `detail` | `historical_society_piano_01_anchor` / `.local-hall` | used; `historical_society_piano_01` | The record is an interpretation of the illustrated furnishing. The artwork does not establish material, maker, or provenance. |
| `historical_society_table_01` | Illustrated billiards table in the foreground | 1 | `detail` | `historical_society_table_01_anchor` / `.local-hall` | used; `historical_society_table_01` | The record is an interpretation of the illustrated furnishing. No object record or material identification is currently assigned. |

## Attic

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `attic_intro` | Attic introduction board on the lower-left wall | 1 | `detail` | `attic_intro_anchor` / `.attic-hall` | reserved; none | Valid reserved location. Use evidence-aware language about inheritance, storage, rediscovery, and documentary gaps. |
| `attic_timeline_01` | Family Traces activity area | 1 | `timeline` | `attic_timeline_01_anchor` / `.attic-hall` | used; `family_traces` | Timeline activity. Current events are fictional teaching examples; the tied 1920s dates intentionally permit either order. |
| `attic_trunk_01` | Left open trunk | 8 | `collection` or `detail` | `attic_trunk_01_anchor` / `.attic-hall` | reserved; none | Prepared for future content. A new record needs a stable content ID, description, image/citation as appropriate, and a published placement. Do not invent an inheritance chain. |
| `attic_trunk_02` | Right open trunk | 8 | `collection` or `detail` | `attic_trunk_02_anchor` / `.attic-hall` | reserved; none | Empty furnishing; unpublished until supported content is assigned. |
| `attic_shelves_01` | Attic shelving along the wall | 8 | `collection` or `detail` | `attic_shelves_01_anchor` / `.attic-hall` | reserved; none | Empty furnishing; do not imply that visible storage proves ownership or transfer. |
| `attic_table_01` | Research table in the attic | 8 | `collection` or `detail` | `attic_table_01_anchor` / `.attic-hall` | reserved; none | Empty furnishing. Use for supported research records only. |

## Natural History Museum

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `natural_history_intro` | Natural History introduction panel near the lower center | 1 | `detail` | `natural_history_intro_anchor` / `.natural-history-stage` | reserved; none | Valid reserved location. The room copy should distinguish environmental/material history from an individual specimen's provenance. |
| `natural_history_specimen_01` | Large tusk specimen in the central display | 1 | `detail` | `natural_history_specimen_01_anchor` / `.natural-history-stage` | used; `natural-history-specimen` | The illustration is a specimen presentation, not an accession record. Do not infer an individual animal, locality, or collecting history. |
| `natural_history_specimen_01_label` | Specimen label immediately associated with the tusk | 1 | `detail` | `natural_history_specimen_01_label_anchor` / `.natural-history-stage` | used; `natural-history-specimen` | Intentionally reuses the specimen interpretation as a separate visible label location. It is not a duplicate physical object slot. |
| `natural_history_panel_01` | Elephant interpretation panel beside the specimen | 1 | `detail` | `natural_history_panel_01_anchor` / `.natural-history-stage` | used; `natural_history_intro` | Uses the Natural History introduction record. Keep room-level interpretation distinct from claims about the pictured specimen. |
| `natural_history_panel_02` | Central recessed wall panel | 8 | `collection` or `detail` | `natural_history_panel_02_anchor` / `.natural-history-stage` | used; `geib-flute` | Replaceable editorial media mount. The Geib Flute image renders within this existing recessed-panel geometry; the panel remains independent from the chronology display below. |
| `natural_history_map_01` | Wall map on the right side of the room | 1 | `tool` | `natural_history_map_01_anchor` / `.natural-history-stage`; selector `a[aria-label="Open the map"]` | used; `natural-history-map` | Reuses the authored map link and routes to the existing map page. Preserve that route when editing. |
| `natural_history_timeline_01` | Deep-time explorer on the right-side timeline display | 1 | `tool` | `natural_history_timeline_01_anchor` / `.natural-history-stage`; selector `[data-open-room-timeline]` | used; `proboscidean-timeline` | Reuses the authored explorer trigger. It is a tool slot, not the separate evidence-ordering chronology slot. |
| `natural_history_map_02` | Habitation map nested inside the deep-time explorer | 1 | `tool` | `natural_history_map_02_anchor` / `.natural-history-stage`; selector `[data-apt-map-action]`; **nested component** | used; `habitation-map` | This is intentionally a component mount, not a second wall location. Do not count it as another standalone map or move it to a room-level polygon. |
| `natural_history_timeline_02` | Arrange the evidence panel in the lower central recessed display | 1 | `timeline` | `natural_history_timeline_02_anchor` / `.natural-history-stage` | used; `deep_time_evidence` | Separate chronology activity from the deep-time explorer. The activity compares broad interval onsets and is not an exact specimen chronology. |
| `natural_history_inquiry_01` | Ivory inquiry/tusk question area across the central display | 1 | `tool` | `natural_history_inquiry_01_anchor` / `.natural-history-stage`; selector `[data-hotspot="inquiry-tusk"]` | used; `natural-history-tusk` | Reuses the authored inquiry-terminal hotspot. Keep the inquiry terminal and its backend behavior separate from ordinary editorial detail records. |

## Conservator's Office

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `conservators_office_intro` | Conservator's Office introduction panel near the lower/center wall | 1 | `detail` | `conservators_office_intro_anchor` / `.conservator-office-hall` | reserved; none | Valid reserved location. Exhibition-builder copy remains a separate planned feature. |
| `conservators_office_terminal_01` | Desk computer terminal on the left/center desk area | 1 | `tool` | `conservators_office_terminal_01_anchor` / `.conservator-office-hall`; selector `.conservator-terminal-trigger` | used; `conservator-terminal` | Reuses the existing terminal dialog. It is currently an explicit placeholder for future exhibition assembly, not a functioning curator builder. |
| `conservators_office_shelves_01` | Left shelving | 8 | `collection` or `detail` | `conservators_office_shelves_01_anchor` / `.conservator-office-hall` | reserved; none | Reserved empty furnishing. Do not imply that displayed storage establishes provenance. |
| `conservators_office_shelves_02` | Rear shelving | 8 | `collection` or `detail` | `conservators_office_shelves_02_anchor` / `.conservator-office-hall` | reserved; none | Reserved empty furnishing. |
| `conservators_office_shelves_03` | Right shelving | 8 | `collection` or `detail` | `conservators_office_shelves_03_anchor` / `.conservator-office-hall` | reserved; none | Reserved empty furnishing. |
| `conservators_office_panel_01` | Elephant wall panel | 1 | `detail` | `conservators_office_panel_01_anchor` / `.conservator-office-hall` | used; `conservators_office_intro` | Uses the office introduction record. It is an interpretive panel, not an identified object display. |

## Lab

| Slot ID | Display name and visual location | Capacity | Supported content | Anchor / mount | Used / current placement | Editor notes and warnings |
|---|---|---:|---|---|---|---|
| `lab_intro` | Lab introduction area at the upper center of the CSS room scene | 1 | `detail` | `lab_intro_anchor` / `.collection-room-lab` | reserved; none | Lab uses baseline CSS scenery rather than a versioned illustrated room background. Do not redesign the room through editorial placement. |
| `lab_bench_01` | Analysis bench across the lower/center foreground | 8 | `collection` or `detail` | `lab_bench_01_anchor` / `.collection-room-lab`; selector `.lab-bench` | reserved; none | Baseline CSS furnishing. A placement may add supported research without replacing the bench geometry. |
| `lab_equipment_01` | Microscope and equipment area on the center/right bench | 8 | `collection` or `detail` | `lab_equipment_01_anchor` / `.collection-room-lab`; selector `.lab-equipment` | reserved; none | Baseline CSS furnishing. No illustrated replacement is authorized by this vocabulary. |
| `lab_cabinet_01` | Left cabinet | 8 | `collection` or `detail` | `lab_cabinet_01_anchor` / `.collection-room-lab`; selector `.lab-cabinet-left` | reserved; none | Baseline CSS furnishing; publish only evidence-backed records. |
| `lab_cabinet_02` | Right cabinet | 8 | `collection` or `detail` | `lab_cabinet_02_anchor` / `.collection-room-lab`; selector `.lab-cabinet-right` | reserved; none | Baseline CSS furnishing; publish only evidence-backed records. |
| `lab_attic_context_01` | Hanging Attic access sign at the top of the Lab | 1 | `tool` | `lab_attic_context_01_anchor` / `.collection-room-lab`; selector `.lab-attic-sign` | used; `lab-attic-sequence` | Reuses the authored Attic context dialog and navigation. Preserve the Lab -> Attic route. |

## Warnings, limitations, and non-slot locations

1. **Nested map:** `natural_history_map_02` is explicitly modeled as a component mount inside `natural_history_timeline_01`. It has a stable slot and anchor for editorial validation, but it must not be treated as a second standalone wall location.
2. **Separate chronology activities:** the four timeline slots are real editable access points because the current data explicitly models them as slots. Their event rows are separate records and must not be added as extra exhibit slots.
3. **Reused content is intentional:** `natural_history_specimen` is used for both the tusk and its label, and room introductions can be used in a panel as well as room-level copy. This is not duplicate slot geometry.
4. **Empty reserved locations:** several cases, trunks, shelves, panels, and introductions are visible furnishings with stable geometry but no active published control. This is intentional and prevents fabricated content.
5. **Fixed scenery:** painted reliefs, the Gallery fan, the Conservation Lab figures, and the Natural History tusk are not automatically identified by the research records assigned to nearby access points.
6. **Not modeled as editable slots:** room doorways, cornices, chandeliers, portraits, rugs, and ordinary navigation links remain authored room/page behavior. They should not be added to the workbook unless a future requirement explicitly makes them editorial content locations.

## Validation commands

From the repository root:

```powershell
node --test utilities/test-room-placement.cjs
bundle exec jekyll build --config _config.yml,_config.local.yml
```

The machine-readable transport remains `assets/data/room-editorial.json`, generated from the CSV/JSON sources by Jekyll. It should not be edited directly and is not a second source of truth.
