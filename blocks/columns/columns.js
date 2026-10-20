import { loadCSS } from '../../scripts/aem.js';

/**
 * "Columns Links": every cell holds a single list whose items are links only.
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

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

/**
 * Two-cell layout of a single row, or null.
 * @param {Element} block
 * @returns {Element[]|null}
 */
function twoCells(block) {
  if (block.children.length !== 1) return null;
  const cells = [...block.firstElementChild.children];
  return cells.length === 2 ? cells : null;
}

const isLinkOnly = (el) => {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
};

/**
 * "Columns Story" (homepage Safety Speakers Program): a feature cell with a heading and an
 * image, beside a list of at least two image + heading items.
 * @param {Element} block
 * @returns {boolean}
 */
function isStoryColumns(block) {
  const cells = twoCells(block);
  if (!cells) return false;
  const [feature, list] = cells;
  const listHeadings = list.querySelectorAll(':scope > :is(h2, h3, h4)');
  const listPictures = list.querySelectorAll(':scope > p > picture, :scope > picture');
  return !!feature.querySelector(`:scope > :is(${HEADINGS})`)
    && !!feature.querySelector('picture')
    && listHeadings.length >= 2
    && listPictures.length >= 2;
}

/**
 * "Columns Campaign" (homepage Feedback and complaints): an intro cell with a heading and
 * text, beside at least two linked tiles (linked headings, which AEM publishes inside
 * columns as link-only paragraphs). No images in either cell.
 * @param {Element} block
 * @returns {boolean}
 */
function isCampaignColumns(block) {
  const cells = twoCells(block);
  if (!cells || block.querySelector('picture')) return false;
  const [intro, tiles] = cells;
  const tileTitles = [...tiles.children].filter((el) => (el.matches(HEADINGS)
    ? !!el.querySelector('a[href]')
    : el.tagName === 'P' && isLinkOnly(el)));
  return !!intro.querySelector(`:scope > :is(${HEADINGS})`)
    && !tiles.querySelector(`:scope > :is(${HEADINGS}):not(:has(a[href]))`)
    && tileTitles.length >= 2;
}

/**
 * Re-badges the block as a columns variant and hands it to that block's decorator.
 * @param {Element} block
 * @param {string} name variant block name, e.g. "columns-links"
 */
async function decorateAs(block, name) {
  block.classList.replace('columns', name);
  block.dataset.blockName = name;
  block.parentElement?.classList.replace('columns-wrapper', `${name}-wrapper`);
  block.closest('.section')?.classList.add(`${name}-container`);
  const [{ default: decorateVariant }] = await Promise.all([
    import(`../${name}/${name}.js`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`),
  ]);
  await decorateVariant(block);
}

export default async function decorate(block) {
  // helix-md2jcr publishes every columns variant as "columns": recognise the variants by
  // their content and hand them to their own block
  if (isLinkColumns(block)) {
    await decorateAs(block, 'columns-links');
    return;
  }
  if (isStoryColumns(block)) {
    await decorateAs(block, 'columns-story');
    return;
  }
  if (isCampaignColumns(block)) {
    await decorateAs(block, 'columns-campaign');
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
