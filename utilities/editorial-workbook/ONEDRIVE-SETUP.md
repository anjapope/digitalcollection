# OneDrive-first publishing workflow

This is the supported simple workflow for shared editorial publishing. It uses
the normal locally synced OneDrive folder on the maintainer's computer. The
workbook does not publish itself.

## Configure the workbook path

Set the environment variable `ARCHIVORY_SHARED_WORKBOOK` to the full path of
the synced workbook, or pass `--workbook` for a one-time override:

```powershell
$env:ARCHIVORY_SHARED_WORKBOOK = 'C:\Users\your-name\OneDrive\ArchIvory Editorial Workbook.xlsx'
```

Do not commit a personal path. The example above is intentionally generic.
The configured file must be the `.xlsx` workbook, not an Excel lock file such
as `~$ArchIvory Editorial Workbook.xlsx`.

## Curator workflow

1. Open the shared **ArchIvory Editorial Workbook.xlsx** in OneDrive/Excel.
2. Edit Content, Placements, Timelines, or Events as described on the Guide sheet.
3. Save normally.
4. Wait until OneDrive finishes syncing and Excel is no longer saving the file.
5. Close the workbook if possible before asking the maintainer to publish.

The curator does not need GitHub, Jekyll, Python, or access to the project
repository.

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
2. Reject missing, unreadable, corrupt, temporary, or still-changing files.
3. Confirm the workbook preserves the established 45 slot IDs.
4. Run `workbook.py check`.
5. If valid, run `workbook.py apply`; the importer creates a recoverable
   timestamped CSV backup before writing.
6. Confirm slot IDs remain unchanged and run the workbook check again.
7. Run `node --test utilities/test-room-placement.cjs`.
8. Run the Jekyll build with `_config.yml,_config.local.yml`.

The command prints each stage and stops on the first failure. It never deletes
or overwrites the shared workbook, commits changes, pushes Git, or deploys.

## Failure and recovery behavior

- Validation failure stops before import, tests, or build. Repository data is
  unchanged.
- An unreadable or changing workbook stops before validation.
- Import failures are guarded by the existing importer backup and rollback
  behavior.
- A post-import test or build failure stops before deployment. The imported
  repository CSVs and timestamped backup remain available for review or
  restoration; no deployment is attempted.
- Review the printed error and the backup under
  `docs/room-restoration/editorial-backups/` before retrying.

## Deployment boundary

After a successful local build, deploy using the existing GitHub Pages workflow
according to the project's normal maintainer process. This command deliberately
does not commit or push imported data and does not trigger deployment, so a
maintainer can inspect the build first.

## Teams/SharePoint status

`sharepoint_sync.py` and `TEAMS-SETUP.md` remain in the repository as
experimental, optional integration code. Microsoft Graph, Teams, SharePoint,
Entra applications, service principals, and GitHub OIDC are **not required**
for this OneDrive workflow. The local synced workbook is the source used by
`publish_from_shared.py`.
