/* eslint-disable */
/* global WebImporter */
/**
 * Parser for list (dynamic page-link list). Base: list (project block).
 * Instance selector (homepage): .cta-long-wrapper .cta-long-section - the "I want to..." links
 *   <div class="cta-long-section"><div class="col-2"><div class="cta-coloumn-headding"><h2>I want to...</h2></div>
 *   <a class="cta-long" href="...">Declare wages ...</a> ...</div><div class="col-2">...</div></div>
 * The column heading ("I want to...") is section default content: it is moved in front of the block.
 * UE model (blocks/list/_list.json): list-item -> link (aem-content) + linkText (collapsed into
 * the link). Rows: one per link -> [<a href>text</a>].
 * Links to icare pages are authored as AEM page paths (/content/<site>/<path>.html, as the UE
 * page picker stores them) without a title, so the block shows the linked page's title; external
 * links keep the source text as their title (their page title can't be read).
 */
const SITE_HOSTS = /^(www\.)?icare\.nsw\.gov\.au$/i;
const AEM_SITE_PATH = '/content/icare-migration-demo';

function toAemPagePath(href) {
  try {
    const url = new URL(href, 'https://www.icare.nsw.gov.au/');
    if (!SITE_HOSTS.test(url.hostname)) return null;
    const path = url.pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    return `${AEM_SITE_PATH}${path}.html${url.search}${url.hash}`;
  } catch (e) {
    return null;
  }
}

export default function parse(element, { document }) {
  // Section heading (default content) - keep only non-empty ones, placed before the block
  const headings = [...element.querySelectorAll('.cta-coloumn-headding h2, .cta-coloumn-headding h3')]
    .filter((h) => h.textContent.trim());

  const links = [...element.querySelectorAll('a[href]')]
    .filter((a) => !a.closest('.cta-coloumn-headding'));
  const cells = [];
  links.forEach((source) => {
    const href = source.getAttribute('href');
    if (!href) return;
    const text = source.textContent.replace(/\s+/g, ' ').trim();
    const pagePath = toAemPagePath(href);

    const a = document.createElement('a');
    if (pagePath) {
      a.href = pagePath;
      a.textContent = pagePath;
    } else {
      a.href = href;
      a.textContent = text || href;
    }
    const cell = document.createDocumentFragment();
    cell.appendChild(document.createComment(' field:link '));
    cell.appendChild(a);
    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...headings);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'list', cells });
  headings.forEach((h) => element.before(h));
  element.replaceWith(block);
}
