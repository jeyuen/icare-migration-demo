import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Promo tiles: a vertical stack of solid-colour, whole-tile links.
 * Each row is one cell holding a heading, optional text and a link.
 * The first tile is purple and the rest are teal (colour by position, see CSS).
 * The link is stretched over the tile and rendered as a circled arrow,
 * so the tile is clickable without nesting interactive elements.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-promo-tile';
    moveInstrumentation(row, li);

    const body = document.createElement('div');
    body.className = 'cards-promo-tile-body';
    // Authors may split content over several cells; merge them into one body.
    [...row.children].forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });

    // Drop empty paragraphs (the source often ships an empty <p>).
    body.querySelectorAll('p').forEach((p) => {
      if (!p.children.length && !p.textContent.trim()) p.remove();
    });

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const link = body.querySelector('a[href]');

    if (link) {
      const label = link.textContent.trim() || heading?.textContent.trim() || 'Read more';
      link.className = 'cards-promo-tile-link';
      const wrapper = link.closest('.button-wrapper, .button-container');
      wrapper?.classList.remove('button-wrapper', 'button-container');

      // A link that is not inside the heading becomes the visual circled arrow;
      // its text stays available to assistive tech.
      if (!heading || !heading.contains(link)) {
        link.replaceChildren();
        const text = document.createElement('span');
        text.className = 'cards-promo-tile-link-text';
        text.textContent = label;
        link.append(text);
        if (heading && label !== heading.textContent.trim()) {
          link.setAttribute('aria-label', `${heading.textContent.trim()}: ${label}`);
        } else if (heading) {
          link.setAttribute('aria-label', heading.textContent.trim());
        }
        // decorateButtons() copies the link text ("Read more") into title; on a
        // whole-tile link that tooltip contradicts the aria-label, so drop it.
        if (link.title.trim() === label) link.removeAttribute('title');
        const p = link.closest('p');
        if (p) p.classList.add('cards-promo-tile-cta');
      }
      li.classList.add('is-linked');
    }

    const arrow = document.createElement('span');
    arrow.className = 'cards-promo-tile-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    body.append(arrow);

    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
