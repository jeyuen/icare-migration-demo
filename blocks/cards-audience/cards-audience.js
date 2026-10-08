import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Audience tiles: each row is [icon image | linked heading].
 * The whole tile becomes clickable by stretching the heading link over the tile,
 * which avoids nesting interactive elements.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-audience-tile';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture')
        && cell.textContent.trim() === '';
      cell.className = onlyPicture ? 'cards-audience-tile-icon' : 'cards-audience-tile-body';
    });

    // Drop empty cells authors may leave behind.
    li.querySelectorAll(':scope > div').forEach((cell) => {
      if (!cell.children.length && !cell.textContent.trim()) cell.remove();
    });

    // Text-only tiles (no icon authored) use a tighter, heading-led layout.
    if (!li.querySelector('.cards-audience-tile-icon')) li.classList.add('cards-audience-tile-no-icon');

    const link = li.querySelector('.cards-audience-tile-body a[href]');
    if (link) {
      link.classList.remove('button');
      link.classList.add('cards-audience-tile-link');
      link.closest('.button-wrapper')?.classList.remove('button-wrapper');
      li.classList.add('is-linked');
    }

    const arrow = document.createElement('span');
    arrow.className = 'cards-audience-tile-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    li.append(arrow);

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
