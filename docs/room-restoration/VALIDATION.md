# Validation and remaining content

## Completed locally

- Jekyll development build and 12 Node tests pass. Tests cover all eight rooms and 45 stable slots, the `art` alias, no Library, matching artwork references, nested map mount, content swaps, unpublished/disabled/empty slots, invalid references/types/geometry/capacity, duplicate IDs, missing dates, ties, and shuffling.
- A separate local production build passed and emitted `data-development=false`. The development Gallery preview rendered seven outline layers with `?anchors=1`. No production deployment was performed.
- Original artwork files have no Git modifications. All four exact-size composites passed the compositor's exhaustive exterior-pixel comparison with zero differences.
- Chrome screenshots cover all eight rooms before and after at 1440 × 1000 and 390 × 844. Images were inspected for composition, poster wall planes, unobstructed doors, monitor position, and dialog overflow. Narrow rooms retain the baseline's existing stretched presentation. The office narrow baseline was recaptured from an isolated build of original commit `985b53c` after an earlier capture was incomplete.
- Clicked Vestibule → Gallery → painted Conservation Lab doorway; verified other SVG entrances expose real accessible links. Clicked Lab's attic sign and its Go to Attic link. Fixed the Lab navigation SVG intercepting mouse clicks on its sign.
- Welcome messages, Next, Check in, and closing/refocus work; the Field Notebook remains available across navigation. Existing storage names and evidence behavior are retained. Tests activated the notebook in the local browser profile.
- Gallery sconce research and nested evidence-image lightbox open. Existing ivories collection, office terminal placeholder, piano interpretation and Lab attic context open in native modal wrappers. Native dialogs block the background and return focus; Escape closes the active shared dialog.
- Chronologies were exercised with incorrect checks, mouse dragging, keyboard arrow moves, Earlier/Later controls, solved feedback, equivalent Attic dates in either order, and retry. The narrow Attic dialog scrolls with a reachable Close control and no header overlap.
- Natural History's explorer remains separate from evidence ordering. Its habitation map opened and updated for Miocene. Its inquiry connection opened the terminal with the selected question prefilled.
- A temporary edit to `placements.csv` replaced the small Gallery frame's sconce binding with Barberini research without editing room code or geometry. Unpublishing the same row removed the control and photograph. The original placement file was restored. A stale notebook-attribution issue found in this test was fixed.

## Limits and curatorial work

- Physical touchscreen hardware was unavailable. Mouse pointer dragging and keyboard ordering were tested; touch uses the same pointer-capture handlers with `touch-action:none`, but a physical-device touch test remains outstanding.
- No inquiry API was listening on port 3000. Opening, prefill, and explorer connections were checked; live answers were not submitted or verified.
- The office's exhibition builder remains its original explicit placeholder. The Conservation Lab analysis workbench contains a clear availability notice, not invented working analysis media.
- Local Lives, Ivory Through the Ages and Family Traces use clearly labeled fictional teaching events. Replace them with reviewed historical records and citations before presenting them as collection history. Natural History reuses existing explorer research; its source attribution is to that existing data file, not invented external citations.
- The Gallery's two painted reliefs have unverified identities. Barberini and Susanna are comparative research choices behind explicit identity notices. The painted fan is fixed scenery and is not assigned the New Harmony fan record. The central Conservation Lab painting shows six figures; the panel currently contains one existing collection record, with capacity for more research records.
- Empty cases, trunks, shelves, several introduction locations and Lab furnishings have stable reserved slots but no fabricated content or active placeholder controls. Their notes and manifests document their status. A published research panel is distinct from a claim that its record identifies a painted object.
- Lab's baseline is CSS scenery, not illustrated artwork. It was retained to honor the no-redesign requirement. New illustrated Lab scenery would be a separate art task.
- The original Natural History raster still contains its historical painted “Art Museum & Conservation Lab” sign; its accessible route label is Conservation Lab. Original artwork outside the four documented patches was retained.
- No publishing, deployment, commit, or migration of visitor storage was performed.

## Screenshot naming

`before-<room>-desktop.png` / `after-<room>-desktop.png` and corresponding `narrow` files cover `vestibule`, `gallery`, `conservation_lab`, `historical_society`, `attic`, `natural_history`, `conservators_office`, and `lab`. Additional screenshots show chronology dialogs, a solved sequence, the habitation map, and the development anchor view. The notebook badge in after images reflects the test check-in state.
