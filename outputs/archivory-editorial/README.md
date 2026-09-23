# ArchIvory team editing

Open **ArchIvory Editorial Workbook.xlsx**. Start with **Content** to add material, then **Placements** to select where it goes. Every existing access point appears in **Slots**. Empty locations already have an unpublished prompt row in Placements.

## Guided editor views

The workbook opens with simpler, read-only planning views before the normalized backend sheets:

- **Edit Items** summarizes visitor-facing titles, locations, descriptions, images, display types, and publication state.
- **Timeline Cards** presents each card's historical date, post-placement reveal, interpretive prompt, image, and publication state.
- **Room Overview** lists the prepared locations in each room and identifies reserved mounts.
- **Publishing** provides a plain-language view of what is currently visible to visitors.

These views explain the editorial relationships in plain language. Continue to make imported website changes in the backend **Content**, **Placements**, **Timelines**, and **Events** sheets; the guided views deliberately preserve the normalized system rather than replacing it.

The workbook includes the current content unchanged. Your team supplies the descriptions, images, citations and timeline material. A content record may be placed in several rooms. Keep its ID stable and create a separate placement for each location.

The workbook is an editing interface for the existing CSVs, not a second live database. Share one working copy with the team and return it for import. Rows 2–501 have dropdown assistance; the importer reads additional rows too. Extend dropdowns if needed. Amber cells are editable. Gray technical fields and IDs should remain stable.

Start on the **Guide** sheet. In **Placements**, choose a slot from the dropdown; the room ID, room name, human-readable location, supported type, and capacity are calculated automatically from **Slots**. There is deliberately no separate editable room field: the selected stable slot defines the room and prevents a room/slot mismatch. Red highlighting indicates a likely unknown slot or conflicting active ordering; run `workbook.py check` before sharing the workbook.

For shared publishing from a normal synced OneDrive folder, see
[`utilities/editorial-workbook/ONEDRIVE-SETUP.md`](../../utilities/editorial-workbook/ONEDRIVE-SETUP.md).
The workbook does not publish itself; a maintainer runs the documented local
publishing command after OneDrive finishes syncing.

## Tables

| Sheet | Purpose | Website source |
| --- | --- | --- |
| Placements | Which record appears at each access point, order, and visibility | `_data/placements.csv` |
| Content | Titles, descriptions, images, citations, and existing tool bindings | `_data/room_content.csv` |
| Timelines | Room-specific activity introductions, deep question, scale configuration, and completion reflection | `_data/room_timelines.csv` |
| Events | Timeline cards, human-readable dates, numeric ordering, reveal text, prompts, and publication state | `_data/timeline_events.csv` |
| Rooms | Existing rooms and routes | `_data/rooms.csv` |
| Slots | Prepared locations, capacity, type, and geometry reference | `_data/exhibit_slots.csv` |
| Collection | Original CollectionBuilder object metadata | `_data/demo-metadata.csv` |

Descriptions for ordinary new records appear directly in their popup. Title, description, and content type are required for Content rows; image and citation are optional but recommended for research. Keep `adapter` blank for new ordinary items. Existing adapter-backed dialogs/tools still use their established room-page content. Their adapter values are retained; changing their summary in Content does not replace the built-in dialog text. The existing Chinese ivories description comes from Collection. New research items can use ordinary Content records and coexist with the original dialogs.

For interpretive timelines, `sortKey` remains the normalized numeric chronology used to validate order. `displayedDate` remains the visitor-facing date and may use BCE, CE, ranges, or uncertainty. A timeline may use `linear`, `segmented`, or `guided` `scale_mode`; guided and segmented definitions store their weighted segments in `scale_config` JSON. `revealText` and `promptText` appear only after a card is placed correctly. `published=false` excludes a card from the activity.

For a new item in the left Attic trunk, create a Content row with an original ID, title, description, `content_type=detail`, image path and citation. In its prepared Placements row, choose that content ID, keep `content_type=detail` and `sort_order=1`, and change `published` to `true`. The collection opens the item from the same trunk location. There is no need to edit room markup or geometry.

## Validate and import

From the project directory, using Python 3 (standard library only):

```powershell
python utilities/editorial-workbook/workbook.py check "outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx"
python utilities/editorial-workbook/workbook.py apply "outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx"
bundle exec jekyll build --config _config.yml,_config.local.yml
node --test utilities/test-room-placement.cjs
```

`check` changes nothing. It checks headers, required fields, unique IDs, room/slot/anchor references, content and slot types, capacities, disabled targets, duplicate active sort orders or content assignments, timeline references, dates, and geometry references. Blank unpublished prompt rows are omitted. `apply` backs up all seven CSVs under `docs/room-restoration/editorial-backups/`, then updates them. It refuses to overwrite sources that changed since the workbook was created. Reconcile those changes or request a fresh workbook. Saving Excel alone does not update or publish the website.

For a fresh editing copy, the maintainer can run `workbook.py prepare outputs/archivory-editorial/source.json`, then run `build.mjs` with the bundled Node runtime and artifact-tool dependency. Keep the workbook source snapshots intact.
