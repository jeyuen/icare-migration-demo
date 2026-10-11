import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Related downloads list: each row is one document,
 * [optional icon image | linked title, meta line (size, type, date), description].
 * When no icon image is authored, a file-type icon is derived from the link's extension.
 */

const KNOWN_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'txt', 'rtf'];

/**
 * Derives a file type from the link URL, falling back to a "(PDF)" style token in the meta text.
 * @param {HTMLAnchorElement|null} link
 * @param {string} text
 * @returns {string}
 */
function getFileType(link, text) {
  if (link) {
    try {
      const { pathname } = new URL(link.href, window.location.href);
      const ext = pathname.split('.').pop().toLowerCase();
      if (pathname.includes('.') && KNOWN_TYPES.includes(ext)) return ext;
    } catch (e) {
      // ignore malformed URLs
    }
  }
  const match = text.match(/\(\s*([a-z]{2,4})\s*\)/i);
  if (match && KNOWN_TYPES.includes(match[1].toLowerCase())) return match[1].toLowerCase();
  return 'file';
}

/**
 * Builds the generic document icon used when no icon image is authored.
 * @param {string} type
 * @returns {HTMLSpanElement}
 */
function buildFileIcon(type) {
  const icon = document.createElement('span');
  icon.className = 'cards-downloads-file-icon';
  icon.setAttribute('aria-hidden', 'true');
  // document outline (from the source's file-type icon); PDFs also get the acrobat mark
  const pdfMark = type === 'pdf'
    ? '<path d="M14.94 18a14.54 14.54 0 0 1-2.15-3.21c.61-2.62.17-3.19 0-3.41A1 1 0 0 0 12 11a1.24 1.24 0 0 0-.39.07 1.2 1.2 0 0 0-.74.69c-.29.67-.11 1.74.54 3.18a30.4 30.4 0 0 1-1.66 4.7C8 20.44 7 21.26 6.94 22.1a1.37 1.37 0 0 0 .62 1.27 1 1 0 0 0 .6.2 2 2 0 0 0 1.5-1.07 13.07 13.07 0 0 0 1.07-1.9 21.81 21.81 0 0 1 3.77-1.21 3.17 3.17 0 0 0 2 1 1.48 1.48 0 0 0 1.24-.66 1.16 1.16 0 0 0 .2-1.27 1.59 1.59 0 0 0-1.57-.66 8.75 8.75 0 0 0-1.43.2zm-6.77 4.53a.34.34 0 0 1-.17-.31A2.6 2.6 0 0 1 9.39 21c-.75 1.33-1.15 1.51-1.22 1.53zm3.65-10.4a.17.17 0 0 1 .12-.13 2.77 2.77 0 0 1 0 1.49 2.35 2.35 0 0 1-.11-1.35zM11 19.37a32.87 32.87 0 0 0 1.23-3.47A15.75 15.75 0 0 0 14 18.45a23 23 0 0 0-3 .92zm6-.37a.66.66 0 0 1-.1.19.45.45 0 0 1-.39.22 1.78 1.78 0 0 1-.95-.44 6.35 6.35 0 0 1 .82-.06A1.43 1.43 0 0 1 17 19z"/>'
    : '';
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 31.32" fill="currentColor" focusable="false">
    <path d="M25 7.15a.25.25 0 0 0 0-.07.52.52 0 0 0-.12-.18L18.09.16 18 .09h-.1L17.84 0H.56A.55.55 0 0 0 0 .55v30.21a.56.56 0 0 0 .56.55h23.88a.56.56 0 0 0 .56-.55V7.29a.45.45 0 0 0 0-.14zm-6.74-5.26l4.85 4.84h-4.85V1.89zm5.63 28.31H1.11V1.11h16v6.18a.55.55 0 0 0 .56.55h6.19v22.37z"/>
    ${pdfMark}
  </svg>`;
  icon.dataset.fileType = type;
  return icon;
}

/**
 * Splits a "0.13 MB (pdf) | Uploaded 1 Oct 2026" meta line so the file type
 * can be shown upper-case and the upload date hidden on small screens, as on the source.
 * @param {HTMLParagraphElement} meta
 */
function decorateMeta(meta) {
  if (meta.children.length) return; // leave rich authored markup untouched
  const text = meta.textContent;
  const sep = text.indexOf('|');
  const main = sep >= 0 ? text.slice(0, sep).trimEnd() : text;
  const date = sep >= 0 ? text.slice(sep) : '';
  const typeMatch = main.match(/\(\s*[a-z0-9]{2,5}\s*\)/i);

  meta.textContent = '';
  if (typeMatch) {
    // the source sets the type flush against the size: "0.13 MB(PDF)"
    const [token] = typeMatch;
    meta.append(main.slice(0, typeMatch.index).trimEnd());
    const type = document.createElement('span');
    type.className = 'cards-downloads-file-type';
    type.textContent = token;
    meta.append(type, main.slice(typeMatch.index + token.length));
  } else {
    meta.append(main);
  }
  if (date) {
    const dateSpan = document.createElement('span');
    dateSpan.className = 'cards-downloads-date';
    dateSpan.textContent = ` ${date}`;
    meta.append(dateSpan);
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-downloads-item';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    let iconCell = null;
    let bodyCell = null;
    [...li.children].forEach((cell) => {
      const hasPicture = cell.querySelector('picture');
      const hasText = cell.textContent.trim() !== '';
      if (hasPicture && !hasText && !iconCell) {
        iconCell = cell;
      } else if (!hasText && !hasPicture) {
        cell.remove();
      } else if (!bodyCell) {
        bodyCell = cell;
      } else {
        // extra authored cells are merged into the body
        while (cell.firstChild) bodyCell.append(cell.firstChild);
        cell.remove();
      }
    });

    if (!bodyCell) {
      if (!iconCell) return;
      bodyCell = document.createElement('div');
      li.append(bodyCell);
    }
    bodyCell.className = 'cards-downloads-body';

    const link = bodyCell.querySelector('a[href]');
    const type = getFileType(link, bodyCell.textContent);
    li.dataset.fileType = type;
    li.classList.add(`cards-downloads-type-${type}`);

    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.classList.add('cards-downloads-link');
      const titleWrap = link.closest('p, h2, h3, h4, h5, h6');
      if (titleWrap) {
        titleWrap.classList.remove('button-container');
        titleWrap.classList.add('cards-downloads-title');
      }
      // paragraphs after the title: first is the size/type/date meta line, the rest describe it
      const after = titleWrap
        ? [...bodyCell.children].slice([...bodyCell.children].indexOf(titleWrap) + 1)
        : [];
      const paras = after.filter((el) => el.tagName === 'P' && el.textContent.trim());
      if (paras.length > 1) {
        paras[0].classList.add('cards-downloads-meta');
        decorateMeta(paras[0]);
      }
      paras.slice(paras.length > 1 ? 1 : 0)
        .forEach((p) => p.classList.add('cards-downloads-description'));
    }

    if (iconCell) {
      iconCell.className = 'cards-downloads-icon';
    } else {
      iconCell = document.createElement('div');
      iconCell.className = 'cards-downloads-icon';
      iconCell.append(buildFileIcon(type));
      li.prepend(iconCell);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '64' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
