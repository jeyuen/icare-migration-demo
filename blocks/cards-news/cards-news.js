import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

/**
 * Splits an eyebrow paragraph into category + date parts.
 * Authored as `<p><strong>News</strong> 29 Sept</p>` (category in bold, then date)
 * or just `<p>26 Feb</p>` (date only, as on the featured card).
 * @param {Element} p
 */
function decorateEyebrow(p) {
  p.classList.add('cards-news-eyebrow');
  const strong = p.querySelector('strong, b');
  const category = strong?.textContent.trim() || '';
  if (strong) strong.remove();
  const date = p.textContent.replace(/\s+/g, ' ').trim();

  const parts = [];
  if (category) {
    const span = document.createElement('span');
    span.className = 'cards-news-category';
    span.textContent = category;
    parts.push(span);
  }
  if (date) {
    const span = document.createElement('span');
    span.className = 'cards-news-date';
    span.textContent = date;
    parts.push(span);
  }
  p.replaceChildren(...parts);
  if (!category) p.classList.add('no-category');
}

/**
 * News cards: each row is [image (optional) | eyebrow, heading, teaser, Read more].
 * A card that carries an image is treated as the featured card (image as backdrop).
 * @param {Element} body
 */
function decorateBody(body) {
  const heading = body.querySelector(HEADING_SELECTOR);
  if (heading) {
    // Paragraphs before the heading are the eyebrow (category / date).
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && prev.textContent.trim() && !prev.querySelector('a, picture')) {
        decorateEyebrow(prev);
      }
      prev = prev.previousElementSibling;
    }
    heading.classList.add('cards-news-title');
  }
  const links = body.querySelectorAll('a[href]');
  const last = links[links.length - 1];
  if (last) {
    last.classList.remove('button', 'primary', 'secondary', 'accent');
    last.classList.add('cards-news-link');
    last.closest('p')?.classList.add('cards-news-link-wrapper');
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-news-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
      if (onlyPicture) {
        cell.className = 'cards-news-card-image';
      } else if (!cell.children.length && !cell.textContent.trim()) {
        cell.remove();
      } else {
        cell.className = 'cards-news-card-body';
        decorateBody(cell);
      }
    });

    if (li.querySelector('.cards-news-card-image')) li.classList.add('is-featured');
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
