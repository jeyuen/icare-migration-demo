/* eslint-disable */
/* global WebImporter */
/**
 * Parser for list (dynamic page-link list). Base: list (project block).
 * Instance selector: .excat-list-block - a holder the homepage import script fills with copies
 * of the "I want to..." links (.cta-long-wrapper .cta-long-section a), placed below that section.
 * UE model (blocks/list/_list.json): list-item -> link (aem-content) + linkText (collapsed into
 * the link). Rows: one per link -> [<a href>text</a>].
 * Links to icare pages are emitted without a title (text = href) so the block shows the linked
 * page's title; external links keep the source text as their title (their page title can't be read).
 */
const SITE_HOSTS = /^(www\.)?icare\.nsw\.gov\.au$/i;

function toSitePath(href, document) {
  try {
    const url = new URL(href, 'https://www.icare.nsw.gov.au/');
    if (!SITE_HOSTS.test(url.hostname)) return null;
    return `${url.pathname.replace(/\/$/, '') || '/'}${url.search}${url.hash}`;
  } catch (e) {
    return null;
  }
}

export default function parse(element, { document }) {
  const links = [...element.querySelectorAll('a[href]')];
  const cells = [];
  links.forEach((source) => {
    const href = source.getAttribute('href');
    if (!href) return;
    const text = source.textContent.replace(/\s+/g, ' ').trim();
    const sitePath = toSitePath(href, document);

    const a = document.createElement('a');
    if (sitePath) {
      a.href = sitePath;
      a.textContent = sitePath;
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
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'list', cells });
  element.replaceWith(block);
}
