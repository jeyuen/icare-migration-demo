/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base: hero. Source: https://www.icare.nsw.gov.au/
 * Instance selectors: .hero-banner-container .homepage-hero-banner (homepage),
 *   header.hero-composite-section (content-detail; no image -> empty image row),
 *   section.cm-campaign-hero-banner (section-overview-hub: img.hero-img + .text-content h1/p),
 *   section.cm-hero-image-module (hero-image-content-with-sidebar: img.module-background only;
 *   the page H1 is default content in the next section -> empty text row)
 * UE model (blocks/hero/_hero.json): image (+imageAlt collapsed), text (richtext)
 * Rows: 1) image  2) text (heading, subheading, CTA)
 *
 * Source has a desktop copy (.show-on-full-width) and a duplicate mobile copy (.show-on-mobile).
 * The cleanup transformer removes .show-on-mobile; we scope to .show-on-full-width anyway so the
 * parser never picks up duplicate content if it runs without the transformer.
 *
 * Campaign banner images are served through the Next.js optimiser
 * (/_next/image?url=<encoded original>&w=..&q=..) in src and/or srcset. The decoded original
 * (edge.sitecorecloud.io) URL is used so the import references the real asset.
 */
function decodeNextImage(url) {
  if (!url || !url.includes('/_next/image')) return url;
  try {
    const original = new URL(url, 'https://www.icare.nsw.gov.au/').searchParams.get('url');
    if (!original) return url;
    return original.startsWith('/') ? `https://www.icare.nsw.gov.au${original}` : original;
  } catch (e) {
    return url;
  }
}

function normaliseImage(img) {
  const srcset = img.getAttribute('srcset') || '';
  const candidates = srcset.split(',').map((c) => c.trim().split(/\s+/)[0]).filter(Boolean);
  const raw = (img.getAttribute('src') || candidates[candidates.length - 1] || '').replace(/&amp;/g, '&');
  const src = decodeNextImage(raw);
  if (src && src !== raw) {
    img.setAttribute('src', src);
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  }
  return img;
}

export default function parse(element, { document }) {
  const scope = element.querySelector(':scope > .show-on-full-width') || element;

  // Image: <div class="image-container"><img class="image" ...></div>
  // Campaign banner: <img class="hero-img" src="/_next/image?url=...">
  const image = scope.querySelector('.image-container img, img.image, img.hero-img, img');
  if (image) normaliseImage(image);

  // Text: homepage <div class="content"><h1 class="hero-banner-heading"> + <p>
  // Detail pages (header.hero-composite-section): .content > .content-inner > h1.hero-composite-title + <p>
  // Campaign banner: .l-padding > .text-content > h1.heading + p.paragraph
  const content = scope.querySelector('.content-inner') || scope.querySelector('.content')
    || scope.querySelector('.text-content') || scope;
  const heading = content.querySelector('h1, h2, .hero-banner-heading, .hero-composite-title');
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
