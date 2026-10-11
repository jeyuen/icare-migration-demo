/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion (existing project block). Sources:
 *   https://www.icare.nsw.gov.au/employers/premiums/calculating-the-cost-of-your-premium (FAQ list)
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-experience-rated
 *     (icon "explainer" variant: section.cm-accordion.cm-explainer-module)
 * Instance selector: .l-main section.cm-accordion
 *
 * Source:
 *   <section class="cm cm-accordion [cm-explainer-module]"><ul class="accordion-list"><li>
 *     <a class="js-ec-link accordion-item" role="button" href="#accordion-item-0">
 *       [<img alt="" src="...magenta.svg">] Question text <div class="ec"></div></a>
 *     <div class="js-ec expandcollapse-content">
 *       <div><p>..</p><ul>..</ul></div>            (FAQ: wrapped block content, sometimes .ck-content)
 *       | Call us on <a href="tel:134422">13 44 22</a> ...   (explainer: bare inline text)
 *     </div></li></ul></section>
 *
 * UE model (blocks/accordion/_accordion.json): accordion-item -> summary (text), text (richtext)
 * Rows: one per item -> [summary | panel content]
 * Iteration is keyed on the block-level panels (.expandcollapse-content), each paired with its
 * preceding trigger anchor, so html2md's sibling-anchor merging cannot collapse items.
 * The explainer's decorative icon (alt="") cannot be carried: "summary" is a plain-text field.
 */
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'BLOCKQUOTE', 'PRE', 'HR', 'PICTURE', 'FIGURE', 'DL']);

const isBlank = (node) => node.nodeType === 3 && !node.textContent.replace(/ /g, ' ').trim();

// Flatten wrapper divs and wrap runs of inline content in <p>, keeping block elements as-is.
function normalizeContent(root, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para && para.textContent.replace(/ /g, ' ').trim()) out.push(para);
    para = null;
  };
  const walk = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === 8) return; // comments
      if (node.nodeType === 1 && (node.tagName === 'DIV' || node.tagName === 'SECTION' || node.tagName === 'ARTICLE')) {
        flush();
        walk(node);
        flush();
        return;
      }
      if (node.nodeType === 1 && BLOCK_TAGS.has(node.tagName)) {
        flush();
        if (node.tagName === 'HR' || node.textContent.replace(/ /g, ' ').trim() || node.querySelector('img, picture')) {
          out.push(node);
        }
        return;
      }
      if (node.nodeType === 1 && node.tagName === 'BR' && !para) return;
      if (isBlank(node) && !para) return;
      if (!para) para = document.createElement('p');
      para.appendChild(node);
    });
  };
  walk(root);
  flush();
  return out;
}

function getSummary(trigger) {
  if (!trigger) return '';
  const clone = trigger.cloneNode(true);
  clone.querySelectorAll('img, picture, svg, .ec, [class*="icon"]').forEach((el) => el.remove());
  return clone.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let panels = [...element.querySelectorAll('.expandcollapse-content')];
  if (!panels.length) panels = [...element.querySelectorAll('[role="region"], .js-ec')];

  const cells = [];
  panels.forEach((panel) => {
    // Trigger: preceding sibling anchor/button in the same item, else by aria-controls/href.
    let trigger = panel.previousElementSibling;
    while (trigger && !trigger.matches('a, button, .accordion-item, [role="button"]')) {
      trigger = trigger.previousElementSibling;
    }
    if (!trigger && panel.id) {
      trigger = element.querySelector(`[aria-controls="${panel.id}"], a[href="#${panel.id}"]`);
    }

    const summaryText = getSummary(trigger);
    const content = normalizeContent(panel, document);
    if (!summaryText && !content.length) return;

    let summaryCell = '';
    if (summaryText) {
      summaryCell = document.createDocumentFragment();
      summaryCell.appendChild(document.createComment(' field:summary '));
      summaryCell.appendChild(document.createTextNode(summaryText));
    }

    let textCell = '';
    if (content.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      content.forEach((el) => textCell.appendChild(el));
    }

    cells.push([summaryCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
