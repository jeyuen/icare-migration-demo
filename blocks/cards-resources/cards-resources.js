import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Resource hub cards: each row is [icon image | heading, body text, link].
 * The trailing link is the card's call to action ("Explore hub").
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-resources-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
      if (onlyPicture) {
        cell.className = 'cards-resources-card-icon';
      } else if (!cell.children.length && !cell.textContent.trim()) {
        cell.remove();
      } else {
        cell.className = 'cards-resources-card-body';
        const links = cell.querySelectorAll('a[href]');
        const last = links[links.length - 1];
        if (last) {
          last.classList.remove('button', 'primary', 'secondary', 'accent');
          last.classList.add('cards-resources-link');
          last.closest('p')?.classList.add('cards-resources-link-wrapper');
        }
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
