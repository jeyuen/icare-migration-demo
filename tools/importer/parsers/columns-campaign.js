/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-campaign. Base: columns. Source: https://www.icare.nsw.gov.au/
 * Instance selector: section.cm-campaign-module
 * UE model (blocks/columns-campaign/_columns-campaign.json): columns block -> no field hints.
 * Rows: 1 row, 2 cells.
 *   Cell 1 (intro):  .campaign-primary -> heading, paragraph, CTA link
 *   Cell 2 (panels): each .campaign-secondary -> heading wrapped in its panel link + paragraph
 *
 * The panels are wrapped in sibling <a class="cm-image-block-link"> anchors. Iteration is keyed
 * on the inner block wrapper (.campaign-secondary) and the href is read off the wrapping anchor
 * and re-attached to the heading (the block JS expects linked headings as panel starts).
 */
function linkedHeading(document, srcHeading, href) {
  const h = document.createElement(srcHeading ? srcHeading.tagName.toLowerCase() : 'h3');
  const text = srcHeading ? srcHeading.textContent.trim() : '';
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    h.appendChild(a);
  } else {
    h.textContent = text;
  }
  return h;
}

export default function parse(element, { document }) {
  // ---- Cell 1: primary / intro column
  const primary = element.querySelector('.campaign-primary');
  const introCell = [];
  if (primary) {
    const heading = primary.querySelector('h1, h2, h3, .campaign-primary-heading');
    if (heading) introCell.push(heading);
    primary.querySelectorAll(':scope > p').forEach((p) => introCell.push(p));
    primary.querySelectorAll(':scope > a[href], :scope > .cta').forEach((a) => {
      const p = document.createElement('p');
      p.appendChild(a);
      introCell.push(p);
    });
  }

  // ---- Cell 2: secondary panels
  let panels = [...element.querySelectorAll('.campaign-secondary')];
  if (!panels.length) panels = [...element.querySelectorAll('a.cm-image-block-link')];
  const panelCell = [];
  panels.forEach((panel) => {
    const anchor = panel.matches('a') ? panel : panel.closest('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';
    const srcHeading = panel.querySelector('h2, h3, h4, .campaign-secondary-heading');
    const paras = [...panel.querySelectorAll('p')];
    if (!srcHeading && !paras.length) return;
    if (srcHeading) panelCell.push(linkedHeading(document, srcHeading, href));
    paras.forEach((p) => panelCell.push(p));
  });

  if (!introCell.length && !panelCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[introCell.length ? introCell : '', panelCell.length ? panelCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-campaign', cells });
  element.replaceWith(block);
}
