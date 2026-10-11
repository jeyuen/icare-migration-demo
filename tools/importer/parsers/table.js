/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table. Base: table. Sources:
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/what-is-premium-capping-and-how-does-it-work
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-experience-rated
 * Instance selector: .l-main .cm-rich-text table
 *
 * Source shapes (all handled): CKEditor tables with heavy inline styles, <colgroup>, <span> wrappers
 * (table.ck-table-resized); table.js-responsive-table with th classes and rich cells (p/ul/a);
 * plain tables with th ids and data-header attributes. First row is a <th> header row; 2-7 columns.
 *
 * UE model (blocks/table/_table.json) - container block, rows chosen dynamically by column count:
 *   parent model "table": filter (select) -> single-cell parent row: table | table-N-columns
 *   child rows: table-row (1 col) / table-col-N (N cols), fields column1text..columnNtext
 * md2jcr defaults child rows to the first allowed component (table-row, 1 field), so every row
 * starts with its component id cell (table-col-N); md2jcr strips that cell when mapping fields.
 * The header row is emitted as the first child row; the block renders it as <th> cells.
 */
const MAX_COLS = 8;

function cleanCell(cell, document) {
  const frag = document.createDocumentFragment();
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
  clone.querySelectorAll('colgroup, col, script, style').forEach((el) => el.remove());
  // Named anchors without href (e.g. <a name="ccc"></a>) carry no content.
  clone.querySelectorAll('a:not([href])').forEach((a) => a.replaceWith(...a.childNodes));
  // Presentational spans: unwrap.
  clone.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
  // Trailing <br> at the end of a cell/paragraph adds nothing.
  const trimTrailingBr = (el) => {
    let last = el.lastChild;
    while (last && ((last.nodeType === 3 && !last.textContent.replace(/ /g, ' ').trim()) || (last.nodeType === 1 && last.tagName === 'BR'))) {
      const prev = last.previousSibling;
      last.remove();
      last = prev;
    }
  };
  trimTrailingBr(clone);
  clone.querySelectorAll('p, li').forEach(trimTrailingBr);
  [...clone.childNodes].forEach((n) => frag.appendChild(n));
  return frag;
}

const isEmptyCell = (cell) => !cell.textContent.replace(/ /g, ' ').trim() && !cell.querySelector('img, picture');

export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Direct rows only (thead/tbody/tfoot or bare tr), never rows of nested tables.
  const rows = [...table.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr, :scope > tr')];
  const grid = rows.map((tr) => {
    const out = [];
    [...tr.children].filter((c) => c.matches('th, td')).forEach((c) => {
      out.push(c);
      const span = parseInt(c.getAttribute('colspan') || '1', 10);
      for (let i = 1; i < span; i += 1) out.push(null); // keep column alignment
    });
    return out;
  }).filter((r) => r.length && r.some((c) => c && !isEmptyCell(c)));

  if (!grid.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const sourceCols = Math.max(...grid.map((r) => r.length));
  const cols = Math.min(sourceCols, MAX_COLS);
  const filterValue = cols === 1 ? 'table' : `table-${cols}-columns`;
  const rowComponent = cols === 1 ? 'table-row' : `table-col-${cols}`;

  const cells = [];
  const filterCell = document.createDocumentFragment();
  filterCell.appendChild(document.createComment(' field:filter '));
  filterCell.appendChild(document.createTextNode(filterValue));
  cells.push([filterCell]);

  grid.forEach((r) => {
    const rowCells = [rowComponent];
    for (let i = 0; i < cols; i += 1) {
      // Columns beyond the model maximum are merged into the last column.
      const sources = i === cols - 1 ? r.slice(i) : [r[i]];
      const filled = sources.filter((c) => c && !isEmptyCell(c));
      if (!filled.length) {
        // md2jcr seeds every row with the definition template defaults (column1text: "Column1", ...),
        // so a truly empty cell would publish the visible text "ColumnN". A zero-width space
        // (html2md keeps it; whitespace such as &nbsp; is stripped) keeps the cell visually blank.
        // Remove this once the table-col-* templates in blocks/table/_table.json drop those defaults.
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(` field:column${i + 1}text `));
        const p = document.createElement('p');
        p.textContent = '\u200B';
        frag.appendChild(p);
        rowCells.push(frag);
      } else {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(` field:column${i + 1}text `));
        filled.forEach((c) => frag.appendChild(cleanCell(c, document)));
        rowCells.push(frag);
      }
    }
    cells.push(rowCells);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table', cells });
  element.replaceWith(block);
}
