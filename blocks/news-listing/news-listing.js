/*
 * News Listing Block
 * Dynamic news cards: each row is one News Card holding a page path to a news article.
 * The card's date, title, teaser and image are read from the linked article page.
 * The first card (when its article has an image) is the featured card, image as backdrop;
 * the others are text tiles, as in the homepage "News and stories" row.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// page titles carry the site name ("Reimagining your life | icare"); card titles drop it
const SITE_SUFFIX = /\s*\|\s*icare\s*$/i;
// local preview of imported pages (aem up --html-folder content) serves pages under /content
const PREVIEW_ROOT = '/content';
// AEM page paths picked in Universal Editor: /content/<site>/<path>[.html] (not DAM assets)
const AEM_PAGE = /^\/content\/(?!dam\/)[^/?#]+(\/[^?#]*?)?(?:\.html)?(?=[?#]|$)/;
// Universal Editor serves pages as /content/<site>/<path>.html, where those links work as authored
const AUTHOR_PAGE = /^\/content\/[^/]+.*\.html$/;
// article dates are authored as "Tuesday 25 February 2025"
const ARTICLE_DATE = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Turns an AEM page path (/content/<site>/<path>.html) into the page's address where the block
 * is shown: unchanged in Universal Editor, /<path> on the published site, /content/<path> in
 * the local preview of imported pages. Other links are returned unchanged.
 * Same rules as the list block.
 * @param {string} href
 * @returns {string}
 */
function resolveHref(href) {
  const match = href.match(AEM_PAGE);
  const { pathname } = window.location;
  if (!match || AUTHOR_PAGE.test(pathname)) return href;
  const path = match[1] && match[1] !== '/' ? match[1].replace(/\/$/, '') : '/';
  const rest = href.slice(match[0].length);
  const isPreview = pathname === PREVIEW_ROOT || pathname.startsWith(`${PREVIEW_ROOT}/`);
  if (!isPreview) return `${path}${rest}`;
  return `${PREVIEW_ROOT}${path === '/' ? '/index' : path}${rest}`;
}

/**
 * Reads an article date ("Tuesday 25 February 2025") into a Date (UTC midnight).
 * @param {string} text
 * @returns {Date|null}
 */
function parseDate(text) {
  const match = text.match(ARTICLE_DATE);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
}

/**
 * Fallback title from the URL, e.g. "/a/reimagining-your-life" -> "Reimagining your life".
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
 * Fetches a news article and reads the card content from it.
 * - title: og:title (without " | icare"), else the h1
 * - category: the page's "category" metadata (news article page properties)
 * - date: the paragraph above the h1 ("Tuesday 25 February 2025")
 * - teaser: the page description, else the first paragraph after the h1
 * - image: the first image in the article, else og:image
 * @param {URL} url article address
 * @returns {Promise<Object>}
 */
async function loadArticle(url) {
  const article = { title: labelFromUrl(url) };
  if (url.origin !== window.location.origin) return article;
  try {
    const resp = await fetch(url.pathname);
    if (!resp.ok) return article;
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const meta = (name) => doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content?.trim();
    const main = doc.querySelector('main') || doc.body;
    const h1 = main.querySelector('h1');

    const title = meta('og:title') || h1?.textContent.trim();
    if (title) article.title = title.replace(SITE_SUFFIX, '');
    article.category = meta('category') || '';

    let prev = h1?.previousElementSibling;
    while (prev && !article.date) {
      if (prev.tagName === 'P') article.date = parseDate(prev.textContent);
      prev = prev.previousElementSibling;
    }

    const next = h1?.nextElementSibling;
    article.teaser = meta('description')
      || (next?.tagName === 'P' && !next.querySelector('picture') ? next.textContent.trim() : '');

    const img = main.querySelector('picture img, img');
    const src = img?.getAttribute('src') || meta('og:image');
    if (src) {
      // media paths are relative to the article page
      article.image = new URL(src.replace(/&amp;/g, '&'), new URL(url.pathname, window.location.href)).href;
      article.imageAlt = img?.getAttribute('alt') || '';
    }
  } catch (e) {
    // keep the fallback title; the card still links to the article
  }
  return article;
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

/**
 * Builds one card: [image (featured only)] + eyebrow date, title, teaser, "Read more",
 * all inside a single link to the article.
 * @param {string} href
 * @param {Object} article
 * @param {boolean} featured
 * @returns {HTMLLIElement}
 */
function buildCard(href, article, featured) {
  const li = createElement('li', 'news-listing-card');
  const link = createElement('a', 'news-listing-card-link');
  link.href = href;

  if (featured) {
    li.classList.add('is-featured');
    const image = createElement('div', 'news-listing-card-image');
    image.append(createOptimizedPicture(article.image, article.imageAlt, false, [{ width: '900' }]));
    link.append(image);
  }

  const body = createElement('div', 'news-listing-card-body');
  if (article.category || article.date) {
    const eyebrow = createElement('p', 'news-listing-eyebrow');
    if (article.category) eyebrow.append(createElement('span', 'news-listing-category', article.category));
    if (article.date) {
      const time = createElement('time', 'news-listing-date', article.date.toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short', timeZone: 'UTC',
      }));
      time.dateTime = article.date.toISOString().slice(0, 10);
      eyebrow.append(time);
    }
    body.append(eyebrow);
  }
  body.append(createElement('h3', 'news-listing-title', article.title));
  if (article.teaser) body.append(createElement('p', 'news-listing-teaser', article.teaser));
  const more = createElement('p', 'news-listing-more-wrapper');
  more.append(createElement('span', 'news-listing-more', 'Read more'));
  body.append(more);

  link.append(body);
  li.append(link);
  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const ul = document.createElement('ul');

  const cards = [...block.children].map(async (row, i) => {
    const a = row.querySelector('a[href]');
    if (!a) return null;
    const href = resolveHref(a.getAttribute('href'));
    const article = await loadArticle(new URL(href, window.location.href));
    const li = buildCard(href, article, i === 0 && !!article.image);
    moveInstrumentation(row, li);
    return li;
  });

  ul.append(...(await Promise.all(cards)).filter(Boolean));
  block.replaceChildren(ul);
}
