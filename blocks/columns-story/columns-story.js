import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

function hasPicture(el) {
  return el.matches('picture') || !!el.querySelector('picture');
}

/**
 * Splits a rich-text cell into stacked story items. A new item starts at each
 * image, or at a heading when no image opened the current item yet.
 * Each item becomes [media | body].
 * @param {Element} cell
 */
function buildItems(cell) {
  const items = [];
  let current = null;
  [...cell.children].forEach((child) => {
    const isPic = hasPicture(child) && child.textContent.trim() === '';
    const isHeading = child.matches(HEADING_SELECTOR);
    const startsNew = isPic
      || !current
      || (isHeading && current.body.querySelector(HEADING_SELECTOR));
    if (startsNew) {
      const item = document.createElement('div');
      item.className = 'columns-story-item';
      const media = document.createElement('div');
      media.className = 'columns-story-item-media';
      const body = document.createElement('div');
      body.className = 'columns-story-item-body';
      item.append(media, body);
      current = { item, media, body };
      items.push(current);
    }
    if (isPic && !current.media.children.length) current.media.append(child);
    else current.body.append(child);
  });

  items.forEach(({ item, media }) => {
    if (!media.children.length) {
      media.remove();
      item.classList.add('no-media');
    }
    const links = item.querySelectorAll('.columns-story-item-body a[href]');
    const last = links[links.length - 1];
    if (last) last.classList.add('columns-story-item-link');
  });

  cell.replaceChildren(...items.map(({ item }) => item));
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-story-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell, i) => {
      if (i === 0) {
        // Feature column: heading, promo image, text, CTA — kept in authored order.
        cell.classList.add('columns-story-feature');
        cell.querySelectorAll('picture').forEach((pic) => {
          pic.closest('p')?.classList.add('columns-story-feature-media');
        });
        // Standalone link paragraph = the feature's pill CTA. Authored as a plain
        // link, so global decorateButtons() skips it; flag it here instead.
        cell.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a[href]');
          if (links.length !== 1 || p.querySelector('picture')) return;
          if (p.textContent.trim() !== links[0].textContent.trim()) return;
          p.classList.add('columns-story-feature-cta-wrapper');
          links[0].classList.add('columns-story-feature-cta');
        });
      } else {
        cell.classList.add('columns-story-list');
        buildItems(cell);
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const inList = !!img.closest('.columns-story-list');
    const width = inList ? '300' : '900';
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
