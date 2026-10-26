/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-pull. Base: quote (new project block). Sources:
 *   https://www.icare.nsw.gov.au/news-and-stories/2025/icare-safeguards-nsw-workers-with-new-lung-health-mobile-clinic
 *   https://www.icare.nsw.gov.au/news-and-stories/2024/reimagining-your-life (also annabelle-shares-...,
 *     shine-magazine-summer-2024-edition-is-out-now)
 * Instance selector: .l-main .cm-rich-text > div > blockquote
 *
 * Source (bare quote text, attribution in a footer, &nbsp; noise around both):
 *   <blockquote>“A lung health check could save your life.” <footer>Britt Coombe,&nbsp;Group
 *     Executive of General Insurance and Care</footer></blockquote>
 *
 * UE model (blocks/quote-pull/_quote-pull.json): quotation (richtext), attribution (text)
 * Rows: [ <p>quotation</p> ], [ attribution text ]  (attribution row omitted when no footer)
 * Bare inline quote content is wrapped in <p>; inline formatting and links are kept,
 * &nbsp;-only paragraphs are dropped. The em dash before the attribution is added by the block CSS.
 */
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'PRE', 'DL']);
const norm = (s) => (s || '').replace(/\u00a0/g, ' ');
const hasText = (n) => norm(n.textContent).trim().length > 0;

// Trim leading/trailing whitespace (incl. &nbsp;) and <br>s inside a paragraph
function trimEdges(p) {
  const edge = (first) => {
    let n = first ? p.firstChild : p.lastChild;
    while (n) {
      if (n.nodeType === 1 && n.tagName === 'BR') {
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      } else if (n.nodeType === 3) {
        const t = first ? norm(n.textContent).replace(/^\s+/, '') : norm(n.textContent).replace(/\s+$/, '');
        if (t) { n.textContent = t; return; }
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      } else {
        return;
      }
    }
  };
  edge(true);
  edge(false);
  return p;
}

// Quote content as a list of block elements: bare inline runs wrapped in <p>
function quoteContent(root, footer, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para && hasText(para)) out.push(trimEdges(para));
    para = null;
  };
  const walk = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === 8) return;
      if (node.nodeType === 1) {
        if (node === footer || node.tagName === 'FOOTER') return;
        if (node.tagName === 'DIV' || node.tagName === 'SECTION') { flush(); walk(node); flush(); return; }
        if (BLOCK_TAGS.has(node.tagName)) {
          flush();
          if (hasText(node)) out.push(node.tagName === 'P' ? trimEdges(node) : node);
          return;
        }
      }
      if (!para) para = document.createElement('p');
      para.appendChild(node);
    });
  };
  walk(root);
  flush();
  return out;
}

export default function parse(element, { document }) {
  const footer = element.querySelector(':scope > footer, :scope > cite');
  const footerParts = footer ? [...footer.querySelectorAll('p')] : [];
  const attribution = norm((footerParts.length ? footerParts : [footer].filter(Boolean))
    .map((n) => n.textContent).join(' ')).replace(/\s+/g, ' ').trim();
  const content = quoteContent(element, footer, document);

  if (!content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const quoteCell = document.createDocumentFragment();
  quoteCell.appendChild(document.createComment(' field:quotation '));
  content.forEach((el) => quoteCell.appendChild(el));
  cells.push([quoteCell]);

  if (attribution) {
    const attrCell = document.createDocumentFragment();
    attrCell.appendChild(document.createComment(' field:attribution '));
    attrCell.appendChild(document.createTextNode(attribution));
    cells.push([attrCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-pull', cells });
  element.replaceWith(block);
}
