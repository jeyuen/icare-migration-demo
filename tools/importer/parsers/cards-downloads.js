/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-downloads. Base: cards. Source:
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages
 * Instance selector: section.cm-links-downloads > ul
 * (the section's "Related downloads" h2 is outside the ul and stays default content)
 *
 * Source item:
 *   <li><a href="...pdf" class="link-item has-icon">
 *     <span class="icon svg-filetype-pdf-magenta"></span>       (CSS sprite icon, no img)
 *     <strong>Title</strong>
 *     <span class="link-item-type"> 1 MB<span class="file-type">(pdf)</span>
 *       <span class="hide-on-mobile"> | Uploaded 17 June 2026</span></span>
 *     <p class="hide-on-mobile">Description</p>
 *   </a></li>
 *
 * UE model (blocks/cards-downloads/_cards-downloads.json): cards-downloads-item -> image, text
 * Rows: one per document -> [icon image (empty: block derives a file-type icon) | text]
 *   text = <p><a href>Title</a></p> <p>1 MB (PDF) | Uploaded 17 June 2026</p> <p>Description</p>
 * Iteration is keyed on the block-level <li> wrappers (each anchor is inside its own li), so
 * html2md's sibling-anchor merging cannot collapse items.
 */
const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/*
 * Dates: the site renders "Uploaded <date>" client-side from each download's "Updated"
 * timestamp (UTC) in the browser's timezone, so a non-Australian import browser can show the
 * previous day. When the Next.js page data is available, the date is re-derived from
 * "Updated" in Australia/Sydney (same approach as the cards-news parser).
 */
function getSydneyUploaded(document, pageData, title) {
  if (!title) return '';
  const data = document.getElementById('__NEXT_DATA__');
  // The bulk importer strips scripts from the DOM; the import script captures the data in onLoad.
  const json = (data && data.textContent) || pageData || '';
  const key = `"Title":{"jsonValue":{"value":${JSON.stringify(title)}}}`;
  const at = json.indexOf(key);
  if (at < 0) return '';
  const match = json.slice(at, at + 2000).match(/"Updated":\{"jsonValue":\{"value":"([^"]+)"/);
  if (!match) return '';
  const date = new Date(match[1]);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) return '';
  return `Uploaded ${date.toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Sydney',
  })}`;
}

function buildMeta(typeEl, sydneyUploaded) {
  if (!typeEl) return '';
  const clone = typeEl.cloneNode(true);
  const fileTypeEl = clone.querySelector('.file-type');
  let fileType = fileTypeEl ? clean(fileTypeEl.textContent).replace(/[()]/g, '').trim() : '';
  if (fileTypeEl) fileTypeEl.remove();
  const uploadedEl = clone.querySelector('.hide-on-mobile, [class*="upload"]');
  const rendered = uploadedEl ? clean(uploadedEl.textContent).replace(/^\|\s*/, '') : '';
  const uploaded = rendered && sydneyUploaded ? sydneyUploaded : rendered;
  if (uploadedEl) uploadedEl.remove();
  const size = clean(clone.textContent);
  fileType = fileType ? `(${fileType})` : '';
  const first = [size, fileType].filter(Boolean).join(' ');
  return [first, uploaded].filter(Boolean).join(' | ');
}

export default function parse(element, { document, pageData }) {
  let items = [...element.querySelectorAll(':scope > li')];
  if (!items.length) items = [...element.querySelectorAll('li')];

  const cells = [];
  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    const titleEl = li.querySelector('strong, b, .link-item-title, h3, h4');
    const typeEl = li.querySelector('.link-item-type');
    const descEl = li.querySelector('p');

    const href = link ? link.getAttribute('href') : '';
    const title = clean(titleEl ? titleEl.textContent : (link && link.textContent));
    if (!title && !href) return;

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    const titleP = document.createElement('p');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title || href;
      titleP.appendChild(a);
    } else {
      titleP.textContent = title;
    }
    textCell.appendChild(titleP);

    const meta = buildMeta(typeEl, getSydneyUploaded(document, pageData, title));
    if (meta) {
      const metaP = document.createElement('p');
      metaP.textContent = meta;
      textCell.appendChild(metaP);
    }

    const desc = clean(descEl && descEl.textContent);
    if (desc) {
      const descP = document.createElement('p');
      descP.textContent = desc;
      textCell.appendChild(descP);
    }

    // Icon: authored <img> if the source ever provides one; the icare sprite span is not an image,
    // so the cell stays empty and the block renders its own file-type icon.
    const img = li.querySelector('img');
    let imageCell = '';
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-downloads', cells });
  element.replaceWith(block);
}
