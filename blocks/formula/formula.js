/*
 * Formula Block
 * Renders an equation graphic such as "P = (APP x CPA) + D + M - SER ...".
 * One row per item, in reading order: [symbol | description | optional "split" flag].
 * - Row 1 is the result term, shown as the highlighted (blue) block.
 * - Operator items (=, +, -, x, /) have a symbol and no description.
 *   The first operator after the result, and any operator flagged "split", render large and
 *   separate grey panels; all others render small, between terms inside a panel.
 * - A row with a description but no symbol is a footnote for the current panel.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

const OPERATOR_RE = /^[=+\-−–x×*/÷]$/i;
const OPERATOR_LABELS = {
  '=': 'equals',
  '+': 'plus',
  '-': 'minus',
  '−': 'minus',
  '–': 'minus',
  x: 'times',
  '×': 'times',
  '*': 'times',
  '/': 'divided by',
  '÷': 'divided by',
};

const clean = (text) => (text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Reads one authored row into an item description.
 * @param {Element} row
 */
function readRow(row) {
  const [symbolCell, descCell, splitCell] = [...row.children];
  const symbol = clean(symbolCell && symbolCell.textContent);
  let paragraphs = [];
  if (descCell) {
    paragraphs = [...descCell.querySelectorAll('p')].filter((p) => clean(p.textContent));
    if (!paragraphs.length && clean(descCell.textContent)) {
      const p = document.createElement('p');
      p.append(...descCell.childNodes);
      paragraphs = [p];
    }
  }
  const split = clean(splitCell && splitCell.textContent).toLowerCase() === 'true';
  let type = 'term';
  if (!symbol && paragraphs.length) type = 'note';
  else if (!paragraphs.length && OPERATOR_RE.test(symbol)) type = 'operator';
  else if (!symbol) type = 'empty';
  return {
    row, symbol, paragraphs, split, type,
  };
}

function buildSymbol(text) {
  const span = document.createElement('span');
  span.className = 'formula-symbol';
  span.textContent = text;
  return span;
}

function buildTerm(item, className) {
  const term = document.createElement('div');
  term.className = className;
  moveInstrumentation(item.row, term);
  if (item.symbol) term.append(buildSymbol(item.symbol));
  if (item.paragraphs.length) {
    const descs = document.createElement('div');
    descs.className = 'formula-descriptions';
    item.paragraphs.forEach((p) => {
      p.classList.add('formula-description');
      descs.append(p);
    });
    term.append(descs);
    if (item.paragraphs.length > 1) term.classList.add('formula-term-wide');
  }
  return term;
}

function buildOperator(item, major) {
  const op = document.createElement('div');
  op.className = major ? 'formula-operator formula-operator-major' : 'formula-operator';
  moveInstrumentation(item.row, op);
  const symbol = buildSymbol(item.symbol);
  const label = OPERATOR_LABELS[item.symbol.toLowerCase()];
  if (label) {
    symbol.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'formula-sr-only';
    sr.textContent = label;
    op.append(sr);
  }
  op.append(symbol);
  return op;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const items = [...block.children].map(readRow).filter((item) => item.type !== 'empty');
  if (!items.length) return;

  const out = [];
  let panel = null;
  let units = 0;
  const closePanel = () => {
    if (panel) panel.style.setProperty('--formula-units', Math.max(units, 1));
    panel = null;
    units = 0;
  };
  const openPanel = () => {
    panel = document.createElement('div');
    panel.className = 'formula-panel';
    out.push(panel);
  };

  // first row is the result term (unless the author started with an operator)
  let start = 0;
  if (items[0].type === 'term') {
    out.push(buildTerm(items[0], 'formula-result'));
    start = 1;
  }

  items.slice(start).forEach((item, i) => {
    if (item.type === 'operator') {
      const major = item.split || (i === 0 && start === 1);
      if (major) {
        closePanel();
        out.push(buildOperator(item, true));
        return;
      }
      if (!panel) openPanel();
      panel.append(buildOperator(item, false));
      return;
    }
    if (!panel) openPanel();
    if (item.type === 'note') {
      const note = document.createElement('div');
      note.className = 'formula-note';
      moveInstrumentation(item.row, note);
      note.append(...item.paragraphs);
      panel.append(note);
      return;
    }
    const term = buildTerm(item, 'formula-term');
    units += Math.max(item.paragraphs.length, 1);
    panel.append(term);
  });
  closePanel();

  block.replaceChildren(...out);
}
