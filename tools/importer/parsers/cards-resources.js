/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-resources. Base: cards. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .icare-resources .icare-resources-grid
 * UE model (blocks/cards-resources/_cards-resources.json): cards-resources-item -> image, text
 * Rows: one per card -> [icon image | heading, body text, CTA link]
 *
 * Source card: <a class="icare-resource-card" href><div class="icare-resource-icon"><img></div>
 *   <h3 class="icare-resource-title"/><p class="icare-resource-body"/>
 *   <span class="icare-resource-cta"><span>Explore hub</span><span class="...-icon">→</span></span></a>
 * The cards are sibling anchors, which html2md's inline-merge preprocessing can fold together.
 * Iteration is keyed on the block-level titles (h3.icare-resource-title) and each card's parts are
 * paired by sibling traversal, so even a merged anchor yields one row per card. The href is read
 * off the closest anchor (or the card anchor at the same index) and re-attached to the CTA.
 */
function siblingBefore(el, selector) {
  let prev = el.previousElementSibling;
  while (prev) {
    if (prev.matches(selector)) return prev;
    if (prev.matches('h1, h2, h3, h4, h5, h6')) return null;
    prev = prev.previousElementSibling;
  }
  return null;
}

function siblingAfter(el, selector) {
  let next = el.nextElementSibling;
  while (next) {
    if (next.matches(selector)) return next;
    if (next.matches('h1, h2, h3, h4, h5, h6')) return null;
    next = next.nextElementSibling;
  }
  return null;
}

// Live markup uses document-relative icon paths without a leading slash
// (src="-/media/icare/...svg"), which html2md would turn into :icon: shortcodes.
// Resolve them to absolute URLs on the source origin.
const SOURCE_ORIGIN = 'https://www.icare.nsw.gov.au';
// www.icare.nsw.gov.au/-/media/* 308-redirects to the Sitecore media CDN with a
// same-origin resource policy, so browsers block it cross-origin. Point straight at the
// CDN (the host the site's other icons already use).
const MEDIA_CDN = 'https://edge.sitecorecloud.io/insuranceanf0c2-xmcprodf24d-xmprod74a5-5eb4/media/';
const MEDIA_PATH = /^https?:\/\/(www\.)?icare\.nsw\.gov\.au\/-\/media\//i;
function absolutizeImage(document, img) {
  let src = (img.getAttribute('src') || '').trim();
  if (!src || /^data:/i.test(src)) return;
  if (!/^https?:/i.test(src)) {
    let base = SOURCE_ORIGIN;
    try {
      const b = new URL(document.baseURI || '');
      if (/^https?:$/.test(b.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(b.hostname)) base = b.origin;
    } catch (e) { /* keep default */ }
    try {
      src = new URL(src.startsWith('/') ? src : `/${src}`, base).href;
    } catch (e) { /* leave as is */ }
  }
  src = src.replace(MEDIA_PATH, MEDIA_CDN);
  // html2md's convertIcons rule turns any <img> whose src ends with ".svg" into an :icon:
  // shortcode. These are authorable card images (model field "image"), so add the Sitecore
  // media query param (same convention as the site's other icon URLs) to keep them as images.
  if (/\.svg$/i.test(src)) src += '?iar=0';
  img.setAttribute('src', src);
}

export default function parse(element, { document }) {
  const cardAnchors = [...element.querySelectorAll('a.icare-resource-card[href]')];
  let titles = [...element.querySelectorAll('.icare-resource-title')];
  if (!titles.length) titles = [...element.querySelectorAll('h3, h2, h4')];

  const cells = [];
  titles.forEach((title, idx) => {
    const iconWrap = siblingBefore(title, '.icare-resource-icon, div');
    const icon = iconWrap ? iconWrap.querySelector('img') : null;
    const body = siblingAfter(title, '.icare-resource-body, p');
    const cta = siblingAfter(title, '.icare-resource-cta, span');

    const anchor = title.closest('a[href]');
    // If anchors were merged, closest() is shared across cards; prefer the indexed card anchor.
    const href = (cardAnchors.length === titles.length ? cardAnchors[idx] : anchor)?.getAttribute('href')
      || (anchor && anchor.getAttribute('href')) || '';

    const textEls = [];
    const h = document.createElement(title.tagName.toLowerCase());
    h.textContent = title.textContent.trim();
    textEls.push(h);
    if (body && body.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = body.textContent.replace(/\s+/g, ' ').trim();
      textEls.push(p);
    }
    const ctaText = cta
      ? ((cta.querySelector('span:not(.icare-resource-cta-icon)') || cta).textContent || '').replace('→', '').trim()
      : '';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaText || h.textContent;
      p.appendChild(a);
      textEls.push(p);
    }

    let imageCell = '';
    if (icon) {
      absolutizeImage(document, icon);
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(icon);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textEls.forEach((el) => textCell.appendChild(el));

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resources', cells });
  element.replaceWith(block);
}
