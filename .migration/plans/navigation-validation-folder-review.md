# Plan: Saving this session's context for next time

**Status:** read-only review. Writing notes, creating the zip, or opening a pull request needs **Execute mode**.

## How context carries over today

| What | Where it lives | Survives a new session? |
|---|---|---|
| **This conversation** | Only in this session | ❌ Not carried over. A new session starts without this chat history. |
| **Code** (14 homepage blocks, importer, header/nav, Noto Sans font) | Git: branch `aem-20261005-1636`, commit "Migrate navigation"; the homepage migration was merged in before it. Already pushed to GitHub. | ✅ Yes, but only on that branch, not `main` |
| **Page content** (`index`, `nav`, `footer` and images) | The site's content folder, outside git | ✅ On this workspace's storage. Not version-controlled, and not uploaded to AEM yet. |
| **Site catalog** (`catalog/`: templates, blocks, report) | Workspace disk, ignored by git | ⚠️ Only while this workspace exists |
| **Migration working files** (`migration-work/`: plan, analysis, nav validation evidence) | Workspace disk, ignored by git | ⚠️ Only while this workspace exists |
| **Saved plans** | `.migration/plans/`, which currently holds only the navigation-validation folder review | ⚠️ On disk, but not committed |
| **My memory notes** | Project memory folder | ❌ Empty. Nothing is saved yet. |

## Risks to be aware of
- **New sessions branch from `main`.** The platform started this navigation work on a new branch from `main`, so the homepage blocks seemed to disappear until I merged them back in. If the next session branches from `main` again, it won't have the homepage or navigation work until those changes reach `main`, through a pull request or a merge.
- **Workspace-only files.** `catalog/` and `migration-work/` aren't in git. If the workspace is reset, they're gone, so the zip backup below matters.
- **Content isn't in AEM yet.** The imported homepage and the nav and footer content exist only locally, until they're uploaded to the AEM author or Document Authoring.

## Proposed actions

### 1. Save memory notes for the next session
These are short notes that load automatically next time. They'd cover:
- **Project state:** the site and the AEM author instance; which branch has the latest work (`aem-20261005-1636`), and that `main` doesn't have it yet.
- **What's done:**
  - site catalog: 4 templates
  - homepage migrated: 14 blocks plus the importer
  - news dates read in Sydney time
  - search points to `/searchresults`
  - header migrated for desktop and mobile
- **Known issues and decisions:**
  - the full-text nav check is left failing (screen-reader hints)
  - the deep drill and mobile panel checks can't read this menu structure
  - the 1024px breakpoint is a documented exception
  - the campaign block's classes were renamed to `tile`
  - the completeness score is distorted by the feedback widget
- **Next steps:** design migration, the other 3 templates, the footer, uploading content to AEM, and the pull request to `main`.

### 2. Back up the workspace-only files (the zip from the earlier plan)
- Create `migration-work-2026-10-05.zip` at the project root: about 5.2 MB, 158 files, folder structure kept. It's built with Python, since `zip` isn't installed.
- Optionally add `catalog/` to the same zip, or put it in a second one; it holds the templates, block catalog and report.
- Add `migration-work-*.zip` to `.gitignore` and `.hlxignore`.
- Download it from the workspace files panel. I can't attach files to the chat.

### 3. Update the migration plan file
Add a "Navigation migration" section and a "Next steps" section to `migration-work/migration-plan.md`, so the file on disk matches the real state.

### 4. Make the work durable in git (needs your OK; this changes what others see)
- Open a pull request from `aem-20261005-1636` into `main`, with a preview link to the homepage, so future sessions start with this work.
- Optionally commit `.migration/plans/` so saved plans travel with the repo.

## Checklist
- [ ] Switch to Execute mode.
- [ ] Write memory notes: project state, completed work, known issues and decisions, next steps.
- [ ] Update `migration-work/migration-plan.md` with the navigation migration and next steps.
- [ ] Create `migration-work-2026-10-05.zip`, with `catalog/` too if you'd like, and verify it opens with the expected file count.
- [ ] Add `migration-work-*.zip` to `.gitignore` and `.hlxignore`.
- [ ] Download the zip from the workspace files panel.
- [ ] Decide whether to open a pull request to merge `aem-20261005-1636` into `main` (recommended, so the next session starts from the current work).
- [ ] Decide whether to commit `.migration/plans/`.

Optional add-ons are available: forms migration (for example the Contact page's enquiry form), commerce page detection, and Figma import. I can turn any of these on if you ask.
