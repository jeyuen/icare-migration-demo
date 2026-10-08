/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-iframe. Base: embed. Source:
 *   https://www.icare.nsw.gov.au/builders-and-homeowners/builders-and-distributors/premiums/premium-calculator
 * Instance selector: .l-main > div.cm-iframe
 * Source: <div class="cm-iframe"><iframe title="Premium Calculator" src="https://..."></iframe></div>
 * UE model (blocks/embed-iframe/_embed-iframe.json), all fields grouped (embed_*) into ONE cell:
 *   embed_placeholder (+ embed_placeholderAlt collapsed) - optional poster image (none in source)
 *   embed_uri   - link to the iframe src
 *   embed_title - accessible title (from iframe title attribute)
 * The element is always replaced so the cleanup transformer's iframe removal cannot drop it.
 */
export default function parse(element, { document }) {
  const iframe = element.matches('iframe') ? element : element.querySelector('iframe');

  // Resolve the embed URL: src, then common lazy-load attributes.
  const rawSrc = iframe
    ? ['src', 'data-src', 'data-lazy-src', 'data-original']
      .map((attr) => (iframe.getAttribute(attr) || '').trim())
      .find((v) => v && v !== 'about:blank' && !v.startsWith('javascript:'))
    : '';

  let href = '';
  if (rawSrc) {
    try {
      const base = (document.location && document.location.href) || 'https://www.icare.nsw.gov.au/';
      href = new URL(rawSrc.startsWith('//') ? `https:${rawSrc}` : rawSrc, base).href;
    } catch (e) {
      href = rawSrc;
    }
  }

  if (!href) {
    // Nothing embeddable - drop the wrapper but keep any fallback content.
    if (iframe) iframe.remove();
    element.replaceWith(...element.childNodes);
    return;
  }

  const title = (
    (iframe && (iframe.getAttribute('title') || iframe.getAttribute('aria-label') || iframe.getAttribute('name')))
    || ''
  ).trim();

  // Optional placeholder image if the source wrapper carries one (not present on icare pages).
  const placeholder = element.querySelector('picture, img');

  const frag = document.createDocumentFragment();
  if (placeholder) {
    frag.appendChild(document.createComment(' field:embed_placeholder '));
    frag.appendChild(placeholder);
  }

  frag.appendChild(document.createComment(' field:embed_uri '));
  const linkP = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  linkP.appendChild(a);
  frag.appendChild(linkP);

  if (title) {
    frag.appendChild(document.createComment(' field:embed_title '));
    const titleP = document.createElement('p');
    titleP.textContent = title;
    frag.appendChild(titleP);
  }

  const cells = [[frag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-iframe', cells });
  element.replaceWith(block);
}
