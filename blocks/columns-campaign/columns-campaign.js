const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

function isLinkedHeading(el) {
  return el.matches(HEADING_SELECTOR) && !!el.querySelector('a[href]');
}

/**
 * Groups a cell's children into panels: each panel starts at a heading that
 * contains a link and collects the following siblings until the next one.
 * The heading link is stretched over the panel, so the whole panel is clickable
 * without nesting interactive content.
 * @param {Element} cell
 */
function buildPanels(cell) {
  const children = [...cell.children];
  const panels = [];
  let current = null;
  children.forEach((child) => {
    if (isLinkedHeading(child)) {
      current = document.createElement('div');
      current.className = 'columns-campaign-panel';
      panels.push(current);
      const link = child.querySelector('a[href]');
      link.classList.add('columns-campaign-panel-link');
      const bar = document.createElement('span');
      bar.className = 'columns-campaign-panel-arrow';
      bar.setAttribute('aria-hidden', 'true');
      const body = document.createElement('div');
      body.className = 'columns-campaign-panel-body';
      current.append(body, bar);
    }
    if (current) current.querySelector('.columns-campaign-panel-body').append(child);
  });
  if (panels.length) {
    // Keep any leading content that preceded the first linked heading.
    cell.append(...panels);
  }
  return panels.length;
}

/**
 * Marks the intro's standalone link paragraph(s) as the CTA. Authored content
 * carries a plain link (no bold/italic), so the global decorateButtons() leaves
 * it as text; the block flags it so it renders as the outlined CTA in the source.
 * @param {Element} cell
 */
function decorateIntroCta(cell) {
  cell.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.textContent.trim() !== links[0].textContent.trim()) return;
    p.classList.add('columns-campaign-cta-wrapper');
    links[0].classList.add('columns-campaign-cta');
  });
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-campaign-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const linkedHeadings = [...cell.children].filter(isLinkedHeading).length;
      // The panel column is the one whose headings are links; the other is the intro.
      if (linkedHeadings && buildPanels(cell)) {
        cell.classList.add('columns-campaign-panels');
      } else {
        cell.classList.add('columns-campaign-intro');
        decorateIntroCta(cell);
      }
    });
  });
}
