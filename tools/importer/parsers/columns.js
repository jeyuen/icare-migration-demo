/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns. Base: columns (existing project block). Source:
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-experience-rated
 * Instance selector: .grouped-highlight .sl-list
 *
 * Source:
 *   <div class="sl-list has-2-items">
 *     <div class="sl-item"><div class="content"><img src alt> Inline text with <a>link</a> ...</div></div>
 *     <div class="sl-item"><p><strong>..</strong></p><p>..<br>..</p><p>..</p></div>
 *   </div>
 *
 * Block structure (blocks/columns/columns.js, xwalk "columns" component): one row, one cell per
 * .sl-item. Columns blocks take default content only and carry no field hints.
 * Images are lifted into their own paragraph so the block's image-column handling sees them;
 * runs of inline text are wrapped in <p>.
 */
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'BLOCKQUOTE', 'PRE', 'HR', 'FIGURE', 'DL']);
const WRAPPER_TAGS = new Set(['DIV', 'SECTION', 'ARTICLE', 'SPAN']);
const hasText = (n) => n.textContent.replace(/ /g, ' ').trim().length > 0;

function normalizeContent(root, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para && (hasText(para) || para.querySelector('img, picture'))) out.push(para);
    para = null;
  };
  const pushMedia = (node) => {
    flush();
    const p = document.createElement('p');
    p.appendChild(node);
    out.push(p);
  };
  const walk = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === 8) return;
      if (node.nodeType === 1) {
        if (node.tagName === 'IMG' || node.tagName === 'PICTURE') { pushMedia(node); return; }
        if (WRAPPER_TAGS.has(node.tagName) && node.querySelector('p, ul, ol, h1, h2, h3, h4, h5, h6, table, img, picture, div')) {
          flush(); walk(node); flush(); return;
        }
        if (node.tagName === 'DIV' || node.tagName === 'SECTION' || node.tagName === 'ARTICLE') {
          flush(); walk(node); flush(); return;
        }
        if (BLOCK_TAGS.has(node.tagName)) {
          flush();
          // Images nested inside a paragraph become their own paragraph.
          if (node.tagName === 'P') {
            node.querySelectorAll('img, picture').forEach((m) => {
              const media = m.tagName === 'IMG' && m.closest('picture') ? m.closest('picture') : m;
              const p = document.createElement('p');
              p.appendChild(media);
              out.push(p);
            });
          }
          if (node.tagName === 'HR' || hasText(node) || node.querySelector('img, picture')) out.push(node);
          return;
        }
        if (node.tagName === 'BR' && !para) return;
      } else if (node.nodeType === 3 && !para && !hasText(node)) {
        return;
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
  let items = [...element.querySelectorAll(':scope > .sl-item')];
  if (!items.length) items = [...element.children].filter((c) => hasText(c) || c.querySelector('img, picture'));

  const row = items
    .map((item) => normalizeContent(item, document))
    .filter((content) => content.length);

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
