# OneDrive-first publishing workflow

This is the supported simple workflow for shared editorial publishing. It uses
the normal locally synced OneDrive folder on the maintainer's computer. The
workbook does not publish itself.

The shared folder should look like:

```text
ArchIvory Shared/
|-- ArchIvory Editorial Workbook.xlsx
`-- Images/
```

## Configure the workbook and media paths

Set the environment variable `ARCHIVORY_SHARED_WORKBOOK` to the full path of
the synced workbook, or pass `--workbook` for a one-time override:

```powershell
$env:ARCHIVORY_SHARED_WORKBOOK = 'C:\Users\your-name\OneDrive\ArchIvory Editorial Workbook.xlsx'
```

Do not commit a personal path. The example above is intentionally generic.
The configured file must be the `.xlsx` workbook, not an Excel lock file such
as `~$ArchIvory Editorial Workbook.xlsx`.

By default, the publisher uses an `Images` folder beside the configured
workbook. To use a different synced folder, set `ARCHIVORY_SHARED_MEDIA` or pass
`--media-root`:

```powershell
$env:ARCHIVORY_SHARED_MEDIA = 'C:\Users\your-name\OneDrive\ArchIvory Shared\Images'
```

Do not commit either personal path.

## Curator workflow

1. Put approved image files in the shared **Images** folder.
2. Enter the image filename, such as `ivory-detail.jpg`, in `Content.image`.
   A safe subfolder reference such as `gallery/ivory-detail.jpg` is also
   supported. Collection records use `object_location`, `image_small`, and
   `image_thumb`.
3. Save **ArchIvory Editorial Workbook.xlsx** normally.
4. Wait until OneDrive finishes synchronization and Excel is no longer saving
   the file.

The curator does not need GitHub, Jekyll, Python, or access to the project
repository, and does not enter the final repository asset path.

Supported files are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.gif`. Absolute
paths, drive-letter paths, URLs and URI schemes, backslashes, `..` traversal,
and references outside the configured Images folder are rejected.

## Maintainer workflow

From the repository root, run:

```powershell
python utilities/editorial-workbook/publish_from_shared.py
```

For a validation-only preview:

```powershell
python utilities/editorial-workbook/publish_from_shared.py --dry-run
```

The command performs, in order:

1. Locate and read the configured workbook.
2. Locate the configured shared media root.
3. Reject missing, unreadable, corrupt, temporary, or still-changing files.
4. Confirm the workbook preserves the established 45 slot IDs and run
   `workbook.py check`.
5. Validate every new or changed workbook media reference before modifying the
   repository. Missing, unsafe, unreadable, mislabeled, or unsupported media
   stops here.
6. Copy validated media into `assets/img/editorial/`.
7. Run `workbook.py apply`; the importer creates a recoverable
   timestamped CSV backup before writing.
8. Translate curator filenames to their generated site references, confirm slot
   IDs remain unchanged, and run post-import data/media validation.
9. Run `node utilities/test-room-placement.cjs`.
10. Run the Jekyll build with `_config.yml,_config.local.yml`.

The command prints each stage and stops on the first failure. It never deletes
or overwrites the shared workbook, commits changes, pushes Git, or deploys.

Imported filenames use the original stem plus the first 12 characters of the
file's SHA-256 digest, for example:

```text
ivory-detail.jpg
-> /assets/img/editorial/ivory-detail-a1b2c3d4e5f6.jpg
```

The content-addressed name makes repeat runs deterministic. An unchanged file
is reported as already current and is not recopied. Different content receives
a different destination instead of silently overwriting an existing asset.
Subfolders under Images remain subfolders under `assets/img/editorial/`, so
same-named files in different subfolders remain distinct. Any imported
editorial files no longer referenced by this workbook are reported and left in
place for deliberate maintainer cleanup.

## Failure and recovery behavior

- Validation failure stops before import, tests, or build. Repository data is
  unchanged.
- Media validation reports the exact sheet, record ID, field, and reference,
  then stops before media copy, workbook import, tests, or build.
- An unreadable or changing workbook stops before validation.
- Import failures are guarded by the existing importer backup and rollback
  behavior.
- A post-import test or build failure stops before deployment. The imported
  repository CSVs and timestamped backup remain available for review or
  restoration; no deployment is attempted.
- Review the printed error and the backup under
  `docs/room-restoration/editorial-backups/` before retrying.

## Dry run

`--dry-run` validates the workbook and all media references, then reports each
located source, intended destination, file that would be copied, file already
current, and unreferenced imported media count. It does not create directories,
copy media, import CSV data, run tests, or build the site.

## Deployment boundary

After a successful local build, review the validation/media summary and deploy
using the existing GitHub Pages workflow
according to the project's normal maintainer process. This command deliberately
does not commit or push imported data and does not trigger deployment, so a
maintainer can inspect the build first.

## Teams/SharePoint status

`sharepoint_sync.py` and `TEAMS-SETUP.md` remain in the repository as
experimental, optional integration code. Microsoft Graph, Teams, SharePoint,
Entra applications, service principals, and GitHub OIDC are **not required**
for this OneDrive workflow. The local synced workbook is the source used by
`publish_from_shared.py`.
