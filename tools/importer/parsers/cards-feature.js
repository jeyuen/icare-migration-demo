/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.icare.nsw.gov.au/builders-and-homeowners/builders-and-distributors
 * Instance selector: .l-main > div.sl
 * UE model (blocks/cards-feature/_cards-feature.json): cards-feature-item -> image, text
 * Rows: one per .sl-item -> [image | h3 heading, description, CTA link]
 *
 * Source item: <div class="sl-item"><section class="cm cm-image-block-link ...">
 *   <a href="..." class="cm-image-block-link" title="..."><div class="image"><img></div>
 *   <div class="content"><h3>..</h3><div class="content-tile"><div>desc</div></div>
 *   <div class="faux-link-container">..<span class="faux-link">CTA label</span>..</div></div></a></section></div>
 * Iteration is keyed on the block-level .sl-item wrapper (not the anchors) so html2md inline
 * merging cannot collapse cards. The whole-card href is read off the anchor and re-attached as
 * the CTA link in the text cell (label from .faux-link, falling back to the anchor title/heading).
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.sl-item')];
  if (!items.length) items = [...element.querySelectorAll('.cm-content-tile, .cm-image-block-link:not(a)')];
  if (!items.length) items = [...element.querySelectorAll('a[href]')];

  const cells = [];
  items.forEach((item) => {
    const anchor = item.matches('a[href]') ? item : item.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const img = item.querySelector('.image img, img');
    const headingSrc = item.querySelector('h1, h2, h3, h4, h5, h6');
    const descSrc = item.querySelector('.content-tile');
    const ctaSrc = item.querySelector('.faux-link');

    const title = headingSrc ? headingSrc.textContent.trim() : '';
    const desc = descSrc ? descSrc.textContent.replace(/\s+/g, ' ').trim() : '';
    const ctaLabel = (ctaSrc && ctaSrc.textContent.trim())
      || (anchor && anchor.getAttribute('title'))
      || title;

    if (!img && !title && !desc) return;

    // Image cell
    let imageCell = '';
    if (img) {
      if (!img.getAttribute('alt')) img.setAttribute('alt', img.getAttribute('title') || title || '');
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Text cell: heading, description, CTA link
    const textEls = [];
    if (title) {
      const h = document.createElement(headingSrc.tagName.toLowerCase());
      h.textContent = title;
      textEls.push(h);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      textEls.push(p);
    }
    if (href && ctaLabel) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaLabel;
      p.appendChild(a);
      textEls.push(p);
    }

    let textCell = '';
    if (textEls.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      textEls.forEach((el) => textCell.appendChild(el));
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
