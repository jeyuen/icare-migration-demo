# list

Dynamic list of links to content pages, styled like the homepage "I want to..." links
(bordered rows with a green arrow; two columns, filled top to bottom, from 1200px).

## Authoring (Universal Editor)

Add a **List** block, then one **List Item** per link:

- **Page** - the content page to link to. AEM page paths picked in the editor
  (`/content/icare-migration-demo/<path>.html`) are turned into the page's address on the
  published site (`/<path>`), and kept as-is in Universal Editor, where they work. Normal paths,
  external URLs and DAM assets (`/content/dam/...`) are left unchanged.
- **Title (optional)** - link text. Leave it empty to use the linked page's title
  (the page's metadata title without the " | icare" suffix).

Titles are read from the query index (`/query-index.json`, `title` column, see `helix-query.yaml`),
or from the page itself when it isn't indexed yet. Links to other sites can't be read, so give
them a title; without one the label is derived from the URL.

## Supported variations

No variations.
