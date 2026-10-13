/*
 * Columns Panels
 * Equal-width light-grey panels side by side. Each cell is a panel holding a heading,
 * text and optional links; a paragraph that holds only a link is rendered as an
 * arrow link (link text followed by a circled arrow icon).
 *
 * Content model: 1 row x N cells (2 on the source): [H3, p, p>a, p>a | H3, p].
 */

/**
 * Turns standalone link paragraphs into arrow links and removes empty spacer paragraphs.
 * @param {Element} cell
 */
function decoratePanel(cell) {
  cell.classList.add('columns-panels-panel');

  cell.querySelectorAll(':scope > p').forEach((p) => {
    // drop spacer paragraphs carried over from the source (&nbsp; / empty <strong>)
    if (!p.textContent.trim() && !p.querySelector('picture, img, a')) {
      p.remove();
      return;
    }

    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1) return;
    const a = links[0];
    if (p.textContent.trim() !== a.textContent.trim()) return;
    // bold/italic links were made into buttons by decorateButtons(); keep those as-is
    if (a.classList.contains('button')) return;

    p.classList.add('columns-panels-link-wrapper');
    a.classList.add('columns-panels-link');
    if (!a.querySelector('.columns-panels-arrow')) {
      const label = document.createElement('span');
      label.className = 'columns-panels-label';
      label.append(...a.childNodes);
      const arrow = document.createElement('span');
      arrow.className = 'columns-panels-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      a.append(label, arrow);
    }
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-panels-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) {
        cell.classList.add('columns-panels-empty');
        return;
      }
      decoratePanel(cell);
    });
  });
}
