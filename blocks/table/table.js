/*
 * Table Block
 * Recreates a data table from block rows: each row is a table row, each cell a table cell,
 * and the first row is the header row (unless the "no-header" class is set).
 * Based on the Block Collection table block: https://www.aem.live/developer/block-collection/table
 *
 * On small screens each body row stacks into a card of "Header: value" pairs; the header
 * text is copied onto each cell as data-label for that.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = ['no-header'];

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const hasHeader = !active.includes('no-header');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const labels = [];

  // Imported (pre-publish) markup still carries the UE model's filter row ("table-4-columns")
  // and a leading column-type cell per row ("table-col-4"); AEM strips both when publishing.
  const rows = [...block.children];
  if (rows[0] && rows[0].children.length === 1 && /^table-\d+-columns$/.test(rows[0].textContent.trim())) {
    rows.shift().remove();
  }
  rows.forEach((row) => {
    const first = row.firstElementChild;
    if (first && row.children.length > 1 && /^table-col-\d+$/.test(first.textContent.trim())) first.remove();
  });

  rows.forEach((row, i) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const isHeader = i === 0 && hasHeader;
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    cells.forEach((cell, col) => {
      const td = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) {
        td.setAttribute('scope', 'col');
        labels[col] = cell.textContent.trim().replace(/\s+/g, ' ');
      } else if (labels[col]) {
        td.dataset.label = labels[col];
      }
      moveInstrumentation(cell, td);
      while (cell.firstChild) td.append(cell.firstChild);
      tr.append(td);
    });

    if (isHeader) thead.append(tr);
    else tbody.append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);

  // scroll container so wide tables never overflow the content column
  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  const caption = labels.filter(Boolean).slice(0, 3).join(', ');
  scroller.setAttribute('aria-label', caption ? `Table: ${caption}` : 'Table');
  scroller.append(table);

  if (labels.some(Boolean)) block.classList.add('table-has-labels');
  block.replaceChildren(scroller);
}
