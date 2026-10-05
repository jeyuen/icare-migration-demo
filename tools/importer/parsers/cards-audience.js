/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-audience. Base: cards. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .all-category-home-tile-wrapper .home-tile-wrapper
 * UE model (blocks/cards-audience/_cards-audience.json): cards-audience-item -> image, text
 * Rows: one per tile -> [icon image | linked heading]
 *
 * Source tile: <a class="cm-home-tile faux-link Tab" href="..."><div class="tab-content">
 *   <img icon> <div class="main-tile-headding"><h2 class="tile-headding">..</h2></div>
 *   <div class="home-tile-link"><span><img arrow></span></div></div></a>
 * Iteration is keyed on the inner block wrapper (.tab-content), not the sibling anchors,
 * so html2md's inline-merge preprocessing cannot collapse the tiles. The href is read off the
 * wrapping anchor and re-attached to the heading. The decorative arrow icon is dropped.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.tab-content')];
  if (!items.length) items = [...element.querySelectorAll(':scope > a.cm-home-tile, :scope > a')];

  const cells = [];
  items.forEach((item) => {
    const anchor = item.closest('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    // Icon: first image that is not inside the arrow container
    const icon = [...item.querySelectorAll('img')].find((img) => !img.closest('.home-tile-link'));

    const headingSrc = item.querySelector('h2, h3, h4, .tile-headding');
    const title = (headingSrc ? headingSrc.textContent : (anchor && anchor.getAttribute('title')) || '').trim();
    if (!icon && !title) return;

    const imageCell = document.createDocumentFragment();
    if (icon) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(icon);
    }

    const textCell = document.createDocumentFragment();
    if (title) {
      const heading = document.createElement(headingSrc ? headingSrc.tagName.toLowerCase() : 'h2');
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = title;
        heading.appendChild(link);
      } else {
        heading.textContent = title;
      }
      textCell.appendChild(document.createComment(' field:text '));
      textCell.appendChild(heading);
    }

    cells.push([icon ? imageCell : '', title ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-audience', cells });
  element.replaceWith(block);
}
