# Mirror the Repo to a GitHub Enterprise Org as `icare` and Repoint Code Sync

The repo is **copied** (mirrored) from `github.com/jeyuen/icare-migration-demo` to a new, empty repo `github.com/{enterprise-org}/icare` on an enterprise org on github.com. The old repo stays where it is. `{enterprise-org}` is a placeholder for the new org name.

The news content fragments plan is still saved, unchanged, in `.migration/plans/news-content-fragment-models.md`.

## Mirror vs transfer: what's different

| | Mirror (this plan) | Transfer |
|---|---|---|
| Git history, branches, tags | Copied; commit IDs stay the same | Moved |
| Pull requests, issues, wiki, releases, discussions | **Not copied**; they stay on the old repo | Moved |
| Branch protection, webhooks, collaborators/teams, Actions secrets and variables | **Not copied**; set them up again | Mostly moved |
| Old repo URL | Still works, pointing at the old repo (no redirect) | Redirects to the new repo |
| Old repo afterwards | Still exists; **archive it** so nobody commits to the wrong one | Gone from `jeyuen` |
| Rollback | Easy: the old repo and old site are untouched | Transfer it back |

Everything after the copy is the same for both methods. That covers code sync, `fstab.yaml`, the AEM configuration, republishing and verification.

## How the site is tied to the repo today

| What | Where | Current value | New value |
|---|---|---|---|
| Code sync | AEM Code Sync GitHub app | `jeyuen/icare-migration-demo` | `{enterprise-org}/icare` |
| Site URLs | Built from the repo name and owner | `main--icare-migration-demo--jeyuen.aem.page` / `.aem.live` | `main--icare--{enterprise-org}.aem.page` / `.aem.live` |
| Content source | `fstab.yaml` mountpoint (the path includes owner, repo and branch) | `…/bin/franklin.delivery/jeyuen/icare-migration-demo/main` | `…/bin/franklin.delivery/{enterprise-org}/icare/main` |
| Publishing from AEM | AEM author: Edge Delivery Services cloud configuration for `/conf/icare-migration-demo` | Organization `jeyuen`, site `icare-migration-demo` | Organization `{enterprise-org}`, site `icare` |
| Local tooling | git remote, `.migration/project.json` (`previewOrg`, `previewSite`), local preview `--url`, README | `jeyuen` / `icare-migration-demo` | `{enterprise-org}` / `icare` |

An Edge Delivery site is identified by **repo + owner**, so the copy becomes a **new site** at `main--icare--{enterprise-org}`. Code sync follows once the app is installed. Content does not move by itself: AEM must be repointed and every page previewed and published again on the new site.

### What does not change
- **The AEM site in author** stays at `/content/icare-migration-demo`, and its assets stay at `/content/dam/icare-migration-demo`.
- **References to that path stay valid**, because they point to AEM content and not to the repo:
  - the list and News Listing blocks
  - the News Card picker restriction (`/content/icare-migration-demo/news-and-stories`)
  - the importer parsers
  - the authored page links
- **Renaming the AEM site path to `/content/icare`** would be a separate, much larger change. It is not part of this plan.

## Approach

Because the new location is an enterprise org on github.com, the standard **AEM Code Sync** GitHub app works as usual. Adobe's "Bring Your Own Git" setup through Cloud Manager is not needed.

## Steps

### 1. Prepare (you, before the copy)
- Make sure you're an **owner** of `{enterprise-org}`, or have someone who can create the repo and approve the app install.
- Check the enterprise policies:
  - **GitHub Apps:** third-party apps must be allowed. Some enterprises require owner approval for each app.
  - **IP allow list:** if the enterprise has one, AEM Code Sync must be allowed.
  - **Actions:** the repo's `.github` workflows (lint checks) must be permitted to run.
- **Merge or close open PRs** on the old repo. PRs aren't copied, so anything still open would need raising again on the new repo.
- **Make a note of** the old repo's settings, so you can recreate them in step 3:
  - branch protection
  - collaborators and teams
  - webhooks
  - Actions secrets and variables
  - installed apps (AEM Code Sync, Renovate, PageSpeed Insights check)
- Agree a **code and content freeze** for the switchover:
  - **Code:** no pushes to the old repo after the copy.
  - **Content:** no Universal Editor publishing until step 5 is done, because AEM still publishes to the old site until then.
- Check whether a production domain or CDN points at `main--icare-migration-demo--jeyuen.aem.live`. If so, its origin changes in step 8.

### 2. Create the empty repo and copy the code (you, or me after approval)
- In `{enterprise-org}`, create a new repo named **`icare`**. Leave it **empty**: no README, .gitignore or licence, so nothing conflicts with the copy.
- Copy all branches, tags and history from a temporary folder:
  ```sh
  git clone --mirror https://github.com/jeyuen/icare-migration-demo.git
  cd icare-migration-demo.git
  git push --mirror https://github.com/{enterprise-org}/icare.git
  ```
- GitHub may show errors for `refs/pull/*` ("deny updating a hidden ref"). These are expected and harmless, because PR references can't be pushed. To avoid them, run `git push https://github.com/{enterprise-org}/icare.git --all` and then `git push https://github.com/{enterprise-org}/icare.git --tags` instead.
- **Large files:** if the repo used Git LFS, `git lfs push --all` would also be needed. This repo doesn't appear to use it, which will be confirmed before the copy.
- In the new repo's Settings, check that the **default branch is `main`**.
- I can run the copy in Execute mode **only after your explicit approval**. My git credentials (Settings → LLM Permissions) need read access to `jeyuen/icare-migration-demo` and write access to `{enterprise-org}/icare`.

### 3. Set up the new repo (you, in GitHub)
- Install the **AEM Code Sync** app (github.com/apps/aem-code-sync) on `{enterprise-org}`, giving it access to `icare`.
- Reinstall the other apps: Renovate (`.renovaterc.json`) and the PageSpeed Insights PR check.
- Recreate branch protection, collaborators and teams, webhooks, and Actions secrets and variables.
- Re-raise any PRs or issues that still matter.

### 4. Retire the old repo (you, in GitHub)
- **Archive** `jeyuen/icare-migration-demo` (Settings → Danger zone → Archive this repository). It becomes read-only, so nobody can push to the wrong repo or update the old site by mistake.
- You can uninstall AEM Code Sync from the old repo as well. Its site then stops syncing code but keeps serving its last version.
- Optionally, add a note at the top of the old README pointing to `{enterprise-org}/icare` **before** archiving.

### 5. Repoint the content and publishing (repo changes plus AEM author)
- **Repo:** set the `fstab.yaml` mountpoint to
  `https://author-p9606-e71941.adobeaemcloud.com/bin/franklin.delivery/{enterprise-org}/icare/main`
  and commit it to `main` in the **new** repo.
- **AEM author** (Tools → Cloud Services → Edge Delivery Services Configuration → `icare-migration-demo`): set **Organization** to `{enterprise-org}`, **Site/repository** to **`icare`**, and keep branch `main`. After this, Universal Editor "Publish" sends pages to the new site.
- **Site configuration (if any):** check whether the old site has settings in the Edge Delivery configuration service (`admin.hlx.page/config/jeyuen/sites/icare-migration-demo.json`). If it does, recreate them as `{enterprise-org}/sites/icare`. Sites set up through `fstab.yaml` normally don't have any.

### 6. Republish all content to the new site
- Preview and then publish every page on `{enterprise-org}/icare`, including `nav`, `footer` and all migrated pages. Two ways to do it:
  - from AEM author: select the site tree, then **Manage Publication / Quick Publish**
  - with the Edge Delivery admin API bulk preview/publish for `{enterprise-org}/icare/main`. This needs your explicit go-ahead.
- The search index and sitemap rebuild on the new site from `helix-query.yaml` and `helix-sitemap.yaml`.

### 7. Update local tooling (repo, Execute mode)
- Run `git remote set-url origin https://github.com/{enterprise-org}/icare.git`. Commit IDs are the same, so the current local branches carry on as they are. **Anyone else with a clone** must run the same command, because the old URL doesn't redirect.
- In `.migration/project.json`, set `previewOrg` to `{enterprise-org}` and `previewSite` to `icare`. Keep `aemSitePath`, `aemSiteName` and `aemAssetsFolderPath` unchanged.
- Point the local preview's `--url` at `https://main--icare--{enterprise-org}.aem.page`.
- **README:** fill in the Environments links as `https://main--icare--{enterprise-org}.aem.page/` and `.aem.live/`, and replace the boilerplate title with the project name.
- **Assistant access:** for me to push to the new repo, the git credentials under Settings → LLM Permissions must be authorised for `{enterprise-org}`. That means SSO authorisation and org approval if it's a fine-grained token. Never paste a token in chat.

### 8. Verify, then end the freeze
- **Code:** `https://main--icare--{enterprise-org}.aem.page/scripts/aem.js` loads, and a test commit to the new repo shows up within about a minute.
- **Preview and live:** the homepage renders on `main--icare--{enterprise-org}.aem.page` and `.aem.live`. Check the News Listing cards in particular, since they read the article pages, which must be published on the new site.
- **Universal Editor:** open a page, edit something, publish it, and confirm the change reaches the **new** site and not the old one.
- **PR checks:** `gh pr checks` shows the AEM Code Sync and PageSpeed checks on a test PR. New PR preview links use `https://{branch}--icare--{enterprise-org}.aem.page/`.
- **CDN or production domain:** if there is one, point its origin at `main--icare--{enterprise-org}.aem.live` and update its cache-clearing settings.
- **Old site:** `main--icare-migration-demo--jeyuen.*` keeps serving its last content. Once the new site is confirmed, either leave it or remove its content. Removing it is a separate step that needs your approval.

## Risks

- **Two live copies drifting apart:** until the old repo is archived and AEM is repointed, commits or publishes can still go to the old repo or old site. Keep the freeze in place until step 5 is done.
- **Lost history and settings:** PRs, issues, secrets and protection rules aren't copied. Close or record them first (step 1).
- **Mismatched names:** the repo name, the `fstab.yaml` path and the AEM cloud configuration must all say `{enterprise-org}`/`icare`. If any one still says `jeyuen`/`icare-migration-demo`, publishing goes to the wrong site.
- **Enterprise policy blocks:** blocked GitHub Apps or an IP allow list are the usual reasons code sync fails after a move.
- **Broken links:** anything that links to `…--icare-migration-demo--jeyuen.aem.live` or to the old repo URL needs updating, because neither redirects.
- **Rollback:** un-archive the old repo, then restore `fstab.yaml` and the AEM cloud configuration to `jeyuen`/`icare-migration-demo`. The old site never stopped working.

## Checklist

- [ ] Confirm the new org name `{enterprise-org}` and that you can create repos and approve apps there
- [ ] Check enterprise policies: GitHub Apps allowed, IP allow list, Actions enabled
- [ ] Merge or close open PRs on the old repo; record branch protection, collaborators, webhooks, secrets and apps
- [ ] Check for a production domain or CDN that points at the old `.aem.live` host
- [ ] Announce the code and content freeze
- [ ] Create an empty `{enterprise-org}/icare` repo (no README, .gitignore or licence)
- [ ] Mirror-copy all branches, tags and history to `{enterprise-org}/icare`, then check the default branch is `main` (run by me only after your approval)
- [ ] Install AEM Code Sync and the other apps on `{enterprise-org}/icare`
- [ ] Recreate branch protection, collaborators and teams, webhooks, and Actions secrets and variables
- [ ] Add a "moved" note to the old README, then archive `jeyuen/icare-migration-demo`
- [ ] Update the `fstab.yaml` mountpoint to `/bin/franklin.delivery/{enterprise-org}/icare/main` and commit it to `main` in the new repo
- [ ] Update the AEM Edge Delivery Services cloud configuration: Organization becomes `{enterprise-org}`, site/repo becomes `icare`
- [ ] Check for configuration-service site settings on the old site and recreate them as `{enterprise-org}/sites/icare` if they exist
- [ ] Bulk preview and publish all pages (including nav and footer) to `{enterprise-org}/icare`, using API calls only after explicit approval
- [ ] Update the git remote, `.migration/project.json` (`previewOrg`, `previewSite`), the local preview URL and the README Environments links
- [ ] Authorise the assistant's git credentials for `{enterprise-org}` in Settings → LLM Permissions
- [ ] Verify code sync, preview and live (including the News Listing cards), Universal Editor publishing and PR checks on `main--icare--{enterprise-org}`
- [ ] Repoint the CDN or production domain if there is one
- [ ] End the freeze; decide whether to keep or remove the old site's content

The repo changes in steps 5 and 7, and the mirror copy in step 2 once approved, run in Execute mode. Creating the repo, installing apps, recreating settings, archiving the old repo and the AEM author changes are done by you. Any bulk publish or content removal through the API happens only after your explicit approval.
