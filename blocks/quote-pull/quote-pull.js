/*
 * quote-pull block
 * Based on the AEM Block Collection quote block:
 * https://www.aem.live/developer/block-collection/quote
 *
 * Content model (one cell per row):
 *   row 1: quotation (one or more paragraphs)
 *   row 2: attribution (optional, plain text; em dash is added by CSS)
 */
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Returns the content cell of a row (the row itself if it has no child div).
 * @param {Element} row
 * @returns {Element|null}
 */
function getCell(row) {
  if (!row) return null;
  return row.querySelector(':scope > div') || row;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [quotationRow, attributionRow] = [...block.children];
  const quotationCell = getCell(quotationRow);
  const attributionCell = getCell(attributionRow);

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-pull-quotation';
  if (quotationCell) {
    moveInstrumentation(quotationCell, blockquote);
    const hasElements = [...quotationCell.children].length > 0;
    if (hasElements) {
      blockquote.append(...quotationCell.childNodes);
    } else if (quotationCell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = quotationCell.textContent.trim();
      blockquote.append(p);
    }
  }

  const elements = [blockquote];
  const attributionValue = attributionCell ? attributionCell.textContent.trim() : '';
  if (attributionValue) {
    const attribution = document.createElement('p');
    attribution.className = 'quote-pull-attribution';
    const cite = document.createElement('cite');
    cite.textContent = attributionValue;
    moveInstrumentation(attributionCell, cite);
    attribution.append(cite);
    elements.push(attribution);
  }

  block.replaceChildren(...elements);
}
