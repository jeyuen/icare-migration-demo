/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-story. Base: columns. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .cm-story-module > .sl
 * UE model (blocks/columns-story/_columns-story.json): columns block -> no field hints.
 * Rows: 1 row, 2 cells.
 *   Cell 1 (feature): .content-paralympic -> h2.story-title, image, text, CTA
 *   Cell 2 (list):    each .paralympic-right-section -> image, headline (as h3), paragraphs, link
 *
 * The right column separates items with <hr class="paralympic-separation">. Those are purely
 * decorative and would become section breaks ("---") in the import, so they are never copied
 * into a cell and are explicitly removed from the source element. The block JS starts a new
 * story item at each image, so no separator is needed.
 */
function textParagraph(document, srcEl) {
  const p = document.createElement('p');
  p.textContent = srcEl.textContent.replace(/\s+/g, ' ').trim();
  return p;
}

function linkParagraph(document, a) {
  const p = document.createElement('p');
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
  if (a.getAttribute('title')) link.title = a.getAttribute('title');
  p.appendChild(link);
  return p;
}

export default function parse(element, { document }) {
  // Never let the decorative separators leak out as section breaks
  element.querySelectorAll('hr').forEach((hr) => hr.remove());

  // ---- Cell 1: feature
  const feature = element.querySelector('.content-paralympic')
    || element.querySelector('.sl-item:not(.paralympic-right)');
  const featureCell = [];
  if (feature) {
    const heading = feature.querySelector('h1, h2, h3, .story-title');
    if (heading) featureCell.push(heading);
    const img = feature.querySelector('.parent-left-image img, img.paralympic-left-image, img');
    if (img) featureCell.push(img);
    feature.querySelectorAll('.paralympic-text').forEach((t) => {
      const blocks = [...t.querySelectorAll(':scope > div, :scope > p')];
      (blocks.length ? blocks : [t]).forEach((b) => {
        if (b.textContent.trim()) featureCell.push(textParagraph(document, b));
      });
    });
    feature.querySelectorAll('a[href]').forEach((a) => {
      if (a.textContent.trim()) featureCell.push(linkParagraph(document, a));
    });
  }

  // ---- Cell 2: stacked story list
  const listCell = [];
  element.querySelectorAll('.paralympic-right-section').forEach((section) => {
    const img = section.querySelector('img.paralympic-right-image, img');
    const headline = section.querySelector('.paralympic-headline, h2, h3, h4');
    const textWrap = section.querySelector('.paralympic-multi-text') || section;
    const paras = [...textWrap.querySelectorAll('p')].filter((p) => !p.querySelector('a[href]') && p.textContent.trim());
    const links = [...textWrap.querySelectorAll('a[href]')].filter((a) => a.textContent.trim());
    if (!img && !headline && !paras.length) return;

    if (img) listCell.push(img);
    if (headline && headline.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = headline.textContent.trim();
      listCell.push(h3);
    }
    paras.forEach((p) => listCell.push(p));
    links.forEach((a) => listCell.push(linkParagraph(document, a)));
  });

  if (!featureCell.length && !listCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[featureCell.length ? featureCell : '', listCell.length ? listCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-story', cells });
  element.replaceWith(block);
}
