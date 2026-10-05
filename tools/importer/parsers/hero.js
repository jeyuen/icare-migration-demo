/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base: hero. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .hero-banner-container .homepage-hero-banner
 * UE model (blocks/hero/_hero.json): image (+imageAlt collapsed), text (richtext)
 * Rows: 1) image  2) text (heading, subheading, CTA)
 *
 * Source has a desktop copy (.show-on-full-width) and a duplicate mobile copy (.show-on-mobile).
 * The cleanup transformer removes .show-on-mobile; we scope to .show-on-full-width anyway so the
 * parser never picks up duplicate content if it runs without the transformer.
 */
export default function parse(element, { document }) {
  const scope = element.querySelector(':scope > .show-on-full-width') || element;

  // Image: <div class="image-container"><img class="image" ...></div>
  const image = scope.querySelector('.image-container img, img.image, img');

  // Text: <div class="content"><h1 class="hero-banner-heading"> + <p>
  const content = scope.querySelector('.content') || scope;
  const heading = content.querySelector('h1, h2, .hero-banner-heading');
  const paragraphs = [...content.querySelectorAll(':scope > p')];
  const ctas = [...content.querySelectorAll('a')].filter((a) => !paragraphs.some((p) => p.contains(a)));

  if (!image && !heading && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image
  if (image) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(image);
    cells.push([imgFrag]);
  } else {
    cells.push(['']);
  }

  // Row 2: text
  const textEls = [];
  if (heading) textEls.push(heading);
  textEls.push(...paragraphs);
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.appendChild(a);
    textEls.push(p);
  });
  if (textEls.length) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    textEls.forEach((el) => textFrag.appendChild(el));
    cells.push([textFrag]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
