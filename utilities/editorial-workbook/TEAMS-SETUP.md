# Teams to GitHub Pages setup

Status: experimental and optional. This integration is not required for the
supported OneDrive-first workflow and has not been verified end to end against
Microsoft Graph.
The workbook was visually confirmed in Teams on September 17, 2026.
The Images folder was created and visually confirmed beside the workbook.

## Team workflow after activation (optional)

For the supported workflow, use a normal locally synced OneDrive workbook and
run `publish_from_shared.py`; no Microsoft Graph or Teams setup is required.

Use the shared copy at **O365-Schlesinger- Ivory → General → Shared → ArchIvory GitHub Site**.
Keep the exact filename **ArchIvory Editorial Workbook.xlsx**.
Upload PNG or JPG images into the **Images** folder beside it.
In Content's `image` field, enter the exact filename, for example `ivory-detail.jpg`.
Use simple filenames with letters, numbers, spaces, hyphens, underscores or parentheses.
For Collection entries, the same filename convention works in `object_location`,
`image_small`, and `image_thumb`. Existing site paths and HTTPS URLs continue to work.
Images are limited to 25 MB each. Other file formats are not part of this first integration.

Use Placements to connect Content to a location. `published=true` makes that placement
visible; `false` hides its access point. This is NOT a private-draft storage mechanism:
the site's data files can contain unplaced records, and referenced images are copied
even when their placement is hidden. Keep only website-approved material in this workbook.
Changes to already published content go live on the next successful scheduled build.
Adapter-backed legacy dialogs still require the migration described in the workbook Guide.

After activation, GitHub checks about every 30 minutes (scheduled runs can be delayed).
An invalid sheet or missing referenced image fails the build before deployment;
the existing live site remains in place. Errors appear in GitHub Actions, not Teams.
No Teams notifications or workbook status writeback are configured.

## One-time administrator setup

An authorized Microsoft 365/Entra administrator must approve unattended read access.
No Microsoft account password or client secret belongs in the workbook or repository.

1. Register a single-tenant Entra application for ArchIvory publishing.
2. Configure a federated credential for GitHub Actions:
   - Issuer: `https://token.actions.githubusercontent.com`
   - Audience: `api://AzureADTokenExchange`
   - Subject: `repo:anjapope/digitalcollection:ref:refs/heads/main`
   - This matches the build job, which does not use a GitHub environment.
3. Grant the Microsoft Graph application permission `Sites.Selected`, with admin
   consent, and separately assign this application the `read` role on the SharePoint
   site backing this Team. Do not grant tenant-wide file access or a write role.
   Site selection permits reads throughout that selected site; the importer itself
   requests only this folder's workbook and referenced Images. If institutional
   policy requires folder-only access, have the administrator assess Microsoft's
   `Files.SelectedOperations.Selected` alternative and its inheritance implications.
4. Obtain the SharePoint document-library drive ID and the driveItem ID of the
   **ArchIvory GitHub Site** folder. These are Graph IDs, not sharing links.
5. Add GitHub repository Actions variables:

| Variable | Value |
| --- | --- |
| `MS_TENANT_ID` | Entra directory UUID |
| `MS_CLIENT_ID` | Registered application's client UUID |
| `SP_DRIVE_ID` | This document library's Graph drive ID |
| `SP_FOLDER_ID` | ArchIvory GitHub Site folder's Graph driveItem ID |
| `TEAMS_SYNC_ENABLED` | Leave unset until the validation run succeeds |

## Test and activate

Review and merge the prepared website work first. On `main`, run **Deploy Jekyll site
to Pages** manually with **Test the Teams workbook and images without deploying**
checked. This imports, validates, and builds an artifact, but skips deployment.
Inspect the resulting site artifact and import log. A real Graph validation run has
not yet been performed; local tests use a mock image source.

Only after approval to publish, set `TEAMS_SYNC_ENABLED=true`. Successful scheduled
and push builds will then publish shared content. Leave the variable unset to retain
the original repository-only build behavior. Remove the variable to stop automatic
Teams imports; note that a later ordinary repository deployment would then publish
the repository's older baseline content, not the latest Teams copy.

The importer runs only in a disposable Actions checkout. It never commits imported
CSVs or images, uploads back to Teams, or modifies the shared workbook. This keeps
the workbook's source-hash check valid across repeated builds. If someone changes
the seven baseline CSVs in Git, the guard deliberately stops the import: reconcile
and issue an updated workbook without losing the team's changes before resuming.

## References

- [Microsoft: selected permissions and explicit resource grants](https://learn.microsoft.com/en-us/graph/permissions-selected-overview)
- [Microsoft: federated trust configuration](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust)
- [Microsoft: client credentials with federated assertions](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow)
- [Microsoft: driveItem downloads](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0)
- [GitHub: OpenID Connect reference](https://docs.github.com/en/actions/reference/security/oidc)
