/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-links. Base: columns. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .cta-long-wrapper .cta-long-section
 * UE model (blocks/columns-links/_columns-links.json): columns block -> no field hints.
 * Rows: 1 row, one cell per .col-2 column; each cell holds a list of links.
 *
 * Source column: <div class="col-2"><div class="cta-coloumn-headding"><h2>I want to...</h2></div>
 *   <a class="cta-long" href="..."><div><div class="cta-content-headding"><span class="tile-headding">Label</span>
 *   </div><div class="cta-link">arrow img</div></div></a> ...</div>
 * Links are iterated via the inner block wrapper (.cta-content-headding) and the href is read
 * off the wrapping anchor, so html2md inline merging of sibling anchors cannot drop items.
 * The column heading ("I want to...") is section default content: it is moved in front of
 * the block instead of being placed in a cell. Decorative arrow images are dropped.
 */
export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .col-2')];
  if (!columns.length) columns = [...element.querySelectorAll(':scope > div')];

  const headings = [];
  const row = [];

  columns.forEach((col) => {
    // Section heading (default content) — keep only non-empty ones
    col.querySelectorAll('.cta-coloumn-headding h2, .cta-coloumn-headding h3, :scope > h2').forEach((h) => {
      if (h.textContent.trim()) headings.push(h);
    });

    let labels = [...col.querySelectorAll('.cta-content-headding')];
    if (!labels.length) labels = [...col.querySelectorAll('a.cta-long, a[href]')];

    const list = document.createElement('ul');
    labels.forEach((label) => {
      const anchor = label.matches('a') ? label : label.closest('a[href]');
      const textEl = label.querySelector('.tile-headding') || label;
      const text = textEl.textContent.trim();
      if (!text) return;
      const li = document.createElement('li');
      if (anchor && anchor.getAttribute('href')) {
        const a = document.createElement('a');
        a.href = anchor.getAttribute('href');
        a.textContent = text;
        li.appendChild(a);
      } else {
        li.textContent = text;
      }
      list.appendChild(li);
    });

    row.push(list.children.length ? list : '');
  });

  if (!row.some((c) => c)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-links', cells });
  headings.forEach((h) => element.before(h));
  element.replaceWith(block);
}
