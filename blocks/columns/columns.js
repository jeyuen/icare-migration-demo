import { loadCSS } from '../../scripts/aem.js';

/**
 * helix-md2jcr publishes every columns variant as the core "columns" block, so a
 * "Columns Links" block can arrive here with its name stripped. Its content is
 * unmistakable: every cell holds a single list whose items are links only.
 * @param {Element} block
 * @returns {boolean}
 */
function isLinkColumns(block) {
  const cells = [...block.children].flatMap((row) => [...row.children]);
  return cells.length > 0 && cells.every((cell) => {
    const [list, ...rest] = cell.children;
    if (!list || rest.length || !list.matches('ul, ol') || !list.children.length) return false;
    return [...list.children].every((li) => {
      const a = li.querySelector(':scope > a[href]');
      return a && li.children.length === 1 && li.textContent.trim() === a.textContent.trim();
    });
  });
}

/**
 * Re-badges the block as columns-links and hands it to that block's decorator.
 * @param {Element} block
 */
async function decorateAsLinkColumns(block) {
  block.classList.replace('columns', 'columns-links');
  block.dataset.blockName = 'columns-links';
  block.parentElement?.classList.replace('columns-wrapper', 'columns-links-wrapper');
  block.closest('.section')?.classList.add('columns-links-container');
  const [{ default: decorateLinks }] = await Promise.all([
    import('../columns-links/columns-links.js'),
    loadCSS(`${window.hlx.codeBasePath}/blocks/columns-links/columns-links.css`),
  ]);
  decorateLinks(block);
}

export default async function decorate(block) {
  if (isLinkColumns(block)) {
    await decorateAsLinkColumns(block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
