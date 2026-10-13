/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards. Source:
 *   https://www.icare.nsw.gov.au/employers/make-a-claim/notify-us-of-an-injury-or-make-a-claim
 * Instance selector: .l-main > div.mobile-only:has(section.cm-cta-module)
 *   (the duplicate desktop sidebar copy aside.l-complementary is removed by the cleanup transformer)
 *
 * Source tile:
 *   <section class="cm cm-cta-module is-theme-purple|is-theme-teal">
 *     <a href="..." class="cm-image-block-link"><div class="content">
 *       <h3>Title</h3> <p>optional text (often empty)</p>
 *       <span class="faux-link"><span class="vh">Read more</span></span>
 *     </div></a></section>
 *
 * UE model (blocks/cards-promo/_cards-promo.json): cards-promo-item -> text (richtext)
 * Rows: one per tile -> [ <h3>Title</h3> <p>text</p> <p><a href>Read more</a></p> ]
 * Tile colour is positional in the block (first purple, rest teal), matching the source order.
 * Iteration is keyed on the inner block wrapper (.content), never on the anchors; the href is
 * read off the wrapping anchor and re-attached as the tile's link.
 */
const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('section.cm-cta-module .content')];
  if (!items.length) items = [...element.querySelectorAll('section.cm-cta-module')];
  if (!items.length) items = [...element.querySelectorAll(':scope > a[href], :scope > section')];

  const cells = [];
  items.forEach((item) => {
    const tile = item.closest('section.cm-cta-module') || item;
    const anchor = item.closest('a[href]') || tile.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const headingSrc = item.querySelector('h2, h3, h4');
    const title = clean(headingSrc && headingSrc.textContent);

    const texts = [...item.querySelectorAll('p')]
      .filter((p) => !p.closest('.faux-link') && clean(p.textContent));

    if (!title && !texts.length && !href) return;

    const cell = document.createDocumentFragment();
    cell.appendChild(document.createComment(' field:text '));

    if (title) {
      const h = document.createElement(headingSrc.tagName.toLowerCase());
      h.textContent = title;
      cell.appendChild(h);
    }

    texts.forEach((p) => cell.appendChild(p));

    if (href) {
      const more = item.querySelector('.faux-link');
      const label = clean(more && more.textContent) || 'Read more';
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      p.appendChild(a);
      cell.appendChild(p);
    }

    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
