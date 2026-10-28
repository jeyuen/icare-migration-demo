# news-listing

Dynamic news cards, styled like the homepage "News and stories" row: the first card is a
featured image card (blue overlay panel), the others are white text tiles. Each card links to
its article.

## Authoring (Universal Editor)

Add a **News Listing** block, then one **News Card** per article:

- **News article** (required) - content path of the news and stories page to show
  (e.g. `/content/icare-migration-demo/news-and-stories/2025/<article>.html`). The picker opens
  in, and is limited to, `/content/icare-migration-demo/news-and-stories`.

Nothing else is authored on the card; its content is read from the linked page:

- **Category** - the article's **Category** page property (News, Articles or Information), set in
  the page properties of `news-story-with-video` pages (model `news-story-with-video-metadata` in
  `models/_page.json`, rendered as `<meta name="category">`). Left out when not set.
- **Date** - the article's date line above its heading ("Tuesday 25 February 2025"), shown as "25 Feb"
- **Title** - the page's og:title (without " | icare"), else its heading
- **Teaser** - the page description, else the first paragraph after the heading
- **Image** - the first image in the article (featured card only)

The first card is featured when its article has an image. AEM page paths are resolved the same
way as in the list block: kept as-is in Universal Editor, `/<path>` on the published site.
If an article can't be read, its card still links to it, titled from its URL.

## Supported variations

No variations.
