/* eslint-disable */
/* global WebImporter */
/**
 * Parser for news-listing (dynamic news cards). Base: cards (project block).
 * Instance selector (homepage): .sl-list.has-feature-left - the "News and stories" row
 *   <div class="sl-list has-feature-left"><div class="sl-item"><section class="cm ...">
 *   <a class="cm-image-block-link" href="/news-and-stories/2025/...">...</a></section></div>...</div>
 * UE model (blocks/news-listing/_news-listing.json): news-card -> link (aem-content).
 * Rows: one per .sl-item -> [<a href>AEM page path</a>]. Only the article path is authored;
 * the block reads the card's category, date, title, teaser and image from the linked page, so
 * the source card text and image are not imported.
 * Article links are authored as AEM page paths (/content/<site>/<path>.html, as the UE page
 * picker stores them). Cards linking off-site are skipped (the block can't read those pages).
 */
const SITE_HOSTS = /^(www\.)?icare\.nsw\.gov\.au$/i;
const AEM_SITE_PATH = '/content/icare-migration-demo';

function toAemPagePath(href) {
  try {
    const url = new URL(href, 'https://www.icare.nsw.gov.au/');
    if (!SITE_HOSTS.test(url.hostname)) return null;
    const path = url.pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    if (!path) return null;
    return `${AEM_SITE_PATH}${path}.html`;
  } catch (e) {
    return null;
  }
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .sl-item')];
  if (!items.length) items = [element];

  const cells = [];
  items.forEach((item) => {
    // Card target: the tile's wrapping anchor (never iterate on anchors - one card per item)
    const anchor = item.querySelector('a.cm-image-block-link[href]') || item.querySelector('a[href]');
    const pagePath = anchor ? toAemPagePath(anchor.getAttribute('href')) : null;
    if (!pagePath) return;

    const a = document.createElement('a');
    a.href = pagePath;
    a.textContent = pagePath;
    const cell = document.createDocumentFragment();
    cell.appendChild(document.createComment(' field:link '));
    cell.appendChild(a);
    cells.push([cell]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'news-listing', cells });
  element.replaceWith(block);
}
