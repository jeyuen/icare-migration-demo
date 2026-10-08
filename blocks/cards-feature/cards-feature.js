import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Feature cards: each row is [landscape image | heading, description, call-to-action link].
 * The image sits full-width on top; the trailing link is the card's call to action and is
 * stretched so the whole card is clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-feature-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const hasText = cell.textContent.trim() !== '';
      const hasMedia = !!cell.querySelector('picture, img');
      if (hasMedia && !hasText) {
        cell.className = 'cards-feature-card-image';
      } else if (!hasMedia && !hasText) {
        // empty cell (e.g. no image authored, or only empty <p>) — drop it
        cell.remove();
      } else {
        cell.className = 'cards-feature-card-body';
        const links = cell.querySelectorAll('a[href]');
        const last = links[links.length - 1];
        if (last) {
          last.classList.remove('button', 'primary', 'secondary', 'accent');
          last.closest('.button-container')?.classList.remove('button-container');
          last.classList.add('cards-feature-link');
          last.closest('p')?.classList.add('cards-feature-link-wrapper');
        }
      }
    });

    // keep the image on top even if an author swaps the cell order
    const image = li.querySelector(':scope > .cards-feature-card-image');
    if (image && image !== li.firstElementChild) li.prepend(image);

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
