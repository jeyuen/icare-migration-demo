/* eslint-disable */
/* global WebImporter */
/**
 * Parser for formula. Base: formula (new project block).
 * Sources:
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-experience-rated
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-for-small-employers
 * Instance selector: .l-main .premium-formula-holder (inside .cm-rich-text .ck-content)
 *
 * Source (experience rated):
 *   <div class="premium-formula-holder">
 *     <div class="first-block magenta-block formula-block"><p><span class="formula-label">P</span></p><p>Premium</p></div>
 *     <div class="equals-block"><span class="formula-label">=</span></div>
 *     <div class="calculation-block formula-block">
 *       <div class="col-two"><p><span class="formula-label">(APP x CPA)</span></p>
 *         <div class="description"><p>..</p></div><div class="description"><p>..</p></div></div>
 *       <div class="group-formula"><div class="equals-small"><span class="formula-label">+</span></div>
 *         <div class="col-one"><p><span class="formula-label">D</span></p><div class="description"><p>..</p></div></div>
 *         ... nested .group-formula ...
 *         (last .col-one also holds <p><style>..</style></p> - the component's inline CSS)
 * Source (small employers): .calculation-block > .formula-block-one, .equals-block ("-"),
 *   .formula-block-two (terms + .charges-disclaimer footnote); the <style> is a sibling of the holder.
 *
 * UE model (blocks/formula/_formula.json): formula-item -> symbol (text), description (richtext), split (boolean)
 * Rows, in DOM order: [symbol | description paragraphs | split]
 *   term      -> [label | one <p> per .description]
 *   operator  -> [label | '' | '' ]   (.equals-small, and the first .equals-block "=")
 *   divider   -> [label | '' | true]  (any later .equals-block: splits the grey panels)
 *   footnote  -> ['' | <p>note</p> | '']  (.charges-disclaimer)
 * Comments, <style>, <script> are never read; all text is rebuilt from textContent.
 */
const TERM_SEL = '.first-block, .col-one, .col-two';
const OPERATOR_SEL = '.equals-block, .equals-small';
const NOTE_SEL = '.charges-disclaimer';
const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META']);

// Text of a node, ignoring <style>/<script> content and comments.
function textOf(node) {
  if (!node) return '';
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1 || SKIP_TAGS.has(node.tagName)) return '';
  return [...node.childNodes].map(textOf).join('');
}

const clean = (text) => (text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function field(document, name, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${name} `));
  nodes.forEach((n) => frag.appendChild(typeof n === 'string' ? document.createTextNode(n) : n));
  return frag;
}

function termDescriptions(term) {
  // .col-one / .col-two: one paragraph per .description (or per <p> inside it)
  const descs = [...term.querySelectorAll('.description')];
  if (descs.length) {
    return descs.flatMap((d) => {
      const ps = [...d.querySelectorAll('p')];
      return (ps.length ? ps : [d]).map((p) => clean(textOf(p)));
    }).filter(Boolean);
  }
  // .first-block: paragraphs that are not the symbol
  return [...term.children]
    .filter((c) => !SKIP_TAGS.has(c.tagName) && !c.querySelector('.formula-label') && !c.matches('.formula-label'))
    .map((c) => clean(textOf(c)))
    .filter(Boolean);
}

// The component's own CSS, shipped as a <style> next to the holder (small employers page).
function removeSiblingStyles(element) {
  [element.previousElementSibling, element.nextElementSibling].forEach((sib) => {
    if (sib && sib.tagName === 'STYLE' && /premium-formula|formula-block|formula-label/.test(sib.textContent)) sib.remove();
  });
  // also when wrapped in a <p> (rich-text editors wrap stray <style> tags)
  [element.previousElementSibling, element.nextElementSibling].forEach((sib) => {
    if (sib && sib.tagName === 'P' && sib.children.length === 1 && sib.firstElementChild.tagName === 'STYLE'
      && !clean(textOf(sib)) && /premium-formula|formula-block|formula-label/.test(sib.textContent)) sib.remove();
  });
}

export default function parse(element, { document }) {
  removeSiblingStyles(element);
  const rows = [];
  let seenMajor = false;

  const walk = (parent) => {
    [...parent.children].forEach((el) => {
      if (SKIP_TAGS.has(el.tagName)) return;
      if (el.matches(OPERATOR_SEL)) {
        const symbol = clean(textOf(el.querySelector('.formula-label') || el));
        if (!symbol) return;
        const major = el.matches('.equals-block');
        const split = major && seenMajor;
        if (major) seenMajor = true;
        rows.push([
          field(document, 'symbol', [symbol]),
          '',
          split ? field(document, 'split', ['true']) : '',
        ]);
        return;
      }
      if (el.matches(NOTE_SEL)) {
        const note = clean(textOf(el));
        if (note) rows.push(['', field(document, 'description', [para(document, note)]), '']);
        return;
      }
      if (el.matches(TERM_SEL)) {
        const symbol = clean(textOf(el.querySelector('.formula-label')));
        const descs = termDescriptions(el);
        if (!symbol && !descs.length) return;
        rows.push([
          symbol ? field(document, 'symbol', [symbol]) : '',
          descs.length ? field(document, 'description', descs.map((t) => para(document, t))) : '',
          '',
        ]);
        return;
      }
      walk(el);
    });
  };
  walk(element);

  if (!rows.length) {
    element.querySelectorAll('style, script').forEach((s) => s.remove());
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'formula', cells: rows });
  element.replaceWith(block);
}
