/*
 * List Block
 * A list of links to content pages. Each item is one row: [page link (+ optional title)].
 * The "Page" and "Title" fields collapse into one link; when no title is authored the link
 * shows its own URL, and the block replaces it with the linked page's title.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

// page titles carry the site name ("How to pay your premium | icare"); link text drops it
const SITE_SUFFIX = /\s*\|\s*icare\s*$/i;
// local preview of imported pages (aem up --html-folder content) serves pages under /content
const PREVIEW_ROOT = '/content';

let indexTitles;

/**
 * Page titles from the query index (one request for all items), keyed by path.
 * @returns {Promise<Map<string, string>>}
 */
function loadIndexTitles() {
  if (!indexTitles) {
    indexTitles = fetch('/query-index.json')
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then(({ data = [] }) => new Map(data
        .filter((row) => row.title)
        .map((row) => [row.path, row.title])))
      .catch(() => new Map());
  }
  return indexTitles;
}

/**
 * Reads the title of a page by fetching it (pages not in the query index yet).
 * @param {string} path same-origin page path
 * @returns {Promise<string>}
 */
async function fetchPageTitle(path) {
  const candidates = [path];
  if (window.location.pathname.startsWith(`${PREVIEW_ROOT}/`) && !path.startsWith(`${PREVIEW_ROOT}/`)) {
    candidates.unshift(`${PREVIEW_ROOT}${path}`);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(candidate);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
        const title = doc.querySelector('meta[property="og:title"]')?.content || doc.title;
        if (title) return title;
      }
    } catch (e) {
      // try the next candidate
    }
  }
  return '';
}

/**
 * Fallback label from the URL, e.g. "/a/how-to-pay-your-premium" -> "How to pay your premium".
 * @param {URL} url
 * @returns {string}
 */
function labelFromUrl(url) {
  const name = url.pathname.replace(/(\.plain)?\.html$/, '').split('/').filter(Boolean).pop();
  if (!name) return url.hostname;
  const label = decodeURIComponent(name).replace(/-+/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * True when the link text is just its URL, i.e. no title was authored.
 * @param {HTMLAnchorElement} a
 */
function hasNoTitle(a) {
  const text = a.textContent.trim();
  return !text || text === a.getAttribute('href') || text === a.href || /^(https?:\/\/|\/)\S*$/.test(text);
}

/**
 * Link text for an item without an authored title: the page title (internal pages),
 * otherwise a label derived from the URL.
 * @param {HTMLAnchorElement} a
 * @returns {Promise<string>}
 */
async function resolveTitle(a) {
  const url = new URL(a.href, window.location.href);
  if (url.origin === window.location.origin) {
    const path = url.pathname.replace(/(\.plain)?\.html$/, '').replace(/\/$/, '') || '/';
    const fromIndex = (await loadIndexTitles()).get(path);
    const title = fromIndex || await fetchPageTitle(url.pathname);
    if (title) return title.replace(SITE_SUFFIX, '');
  }
  return labelFromUrl(url);
}

function buildLink(a, label) {
  const link = document.createElement('a');
  link.className = 'list-link';
  link.href = a.getAttribute('href');
  ['target', 'rel'].forEach((attr) => { if (a.hasAttribute(attr)) link.setAttribute(attr, a.getAttribute(attr)); });
  if (a.title && a.title !== label) link.title = a.title;

  const text = document.createElement('span');
  text.className = 'list-label';
  text.textContent = label;
  const arrow = document.createElement('span');
  arrow.className = 'list-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  link.append(text, arrow);
  return link;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'list-items';

  const items = [...block.children].map(async (row) => {
    const a = row.querySelector('a[href]');
    if (!a) return null;
    const label = hasNoTitle(a) ? await resolveTitle(a) : a.textContent.trim();
    const li = document.createElement('li');
    li.className = 'list-item';
    moveInstrumentation(row, li);
    li.append(buildLink(a, label));
    return li;
  });

  const lis = (await Promise.all(items)).filter(Boolean);
  ul.append(...lis);
  // two columns on wide screens fill top to bottom, like the source "I want to..." lists
  ul.style.setProperty('--list-rows', Math.ceil(lis.length / 2));
  block.replaceChildren(ul);
}
