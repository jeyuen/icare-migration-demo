/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards. Source: https://www.icare.nsw.gov.au/
 * Instance selectors: .sl-list.has-feature-left (homepage, one row per .sl-item),
 *   .l-main > section.cm-featured-content-module (section-overview-hub, single featured card;
 *   live DOM carries the image as background-image in the .module-background style attribute),
 *   div.l-layout + div section.content-hero .sl-list (hero-image-content-with-sidebar related
 *   content: .sl-list.has-4-items, text-only tiles; empty placeholder .sl-item divs are skipped)
 * UE model (blocks/cards-news/_cards-news.json): cards-news-item -> image (featured only), text
 * Rows: one per card -> [image | eyebrow (category/date), heading, teaser, Read more link]
 *
 * Source item: <div class="sl-item"><section class="cm ..."><a class="cm-image-block-link" href>
 *   [<div class="module-background"><img></div>]  (featured first card only)
 *   <div class="content"><p class="subheading"><strong class="content-type">News</strong>
 *   <span class="subtitle">29 Sept</span></p><h3>..</h3><p>teaser</p><span class="faux-link">Read more</span>
 *   </div></a></section></div>
 * Iteration is keyed on the block-level .sl-item wrappers (never on the anchors); the card href
 * is read off the wrapping anchor and re-attached to the "Read more" link. Cards without a
 * background image get an empty image cell (the block treats the image-bearing card as featured).
 *
 * Dates: the site renders each card's date client-side from authorDate (midnight UTC) in the
 * browser's timezone, so a non-Australian import browser shows the previous day. When the
 * Next.js page data is available, the date is re-derived from authorDate in Australia/Sydney.
 */
function getSydneyDate(document, pageData, title) {
  if (!title) return '';
  const data = document.getElementById('__NEXT_DATA__');
  // The bulk importer strips scripts from the DOM; the import script captures the data in onLoad.
  const json = (data && data.textContent) || pageData || '';
  const needle = JSON.stringify(title).slice(1, -1);
  const at = json.indexOf(needle);
  if (at < 0) return '';
  const match = json.slice(at, at + 4000).match(/"authorDate":\{"jsonValue":\{"value":"([^"]+)"/);
  let value = match ? match[1] : '';
  // Related-content cards (e.g. claim pages) store the page item as
  // "Title":{"value":..} ... "AuthorDate":{"value":..} right after one of the title's occurrences;
  // unset dates are "0001-01-01".
  for (let i = at; !value && i >= 0; i = json.indexOf(needle, i + 1)) {
    const near = json.slice(i, i + 600).match(/"AuthorDate":\{(?:"jsonValue":\{)?"value":"([^"]+)"/);
    if (near && !near[1].startsWith('0001')) [, value] = near;
  }
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) return '';
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'Australia/Sydney' });
}

export default function parse(element, { document, pageData }) {
  let items = [...element.querySelectorAll(':scope > .sl-item')];
  // Section-overview-hub: the instance is a single featured card
  // (.l-main > section.cm-featured-content-module > a.cm-image-block-link > .module-background + .content)
  if (!items.length && element.matches('section.cm-featured-content-module, section.cm')) items = [element];
  if (!items.length) items = [...element.querySelectorAll('.content')].map((c) => c.closest('section, div') || c);

  const cells = [];
  items.forEach((item) => {
    const content = item.querySelector('.content') || item;
    const anchor = item.querySelector('a.cm-image-block-link[href]') || content.closest('a[href]') || item.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const heading = content.querySelector('h2, h3, h4');

    // Featured background image: an <img> inside .module-background (scraped/cleaned DOM)
    // or an inline style background-image on .module-background (live DOM).
    let bgImg = item.querySelector('.module-background img');
    if (!bgImg) {
      const bgEl = item.querySelector('.module-background, [style*="background-image"]');
      const style = bgEl ? bgEl.getAttribute('style') || '' : '';
      const match = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
      if (match && match[2]) {
        bgImg = document.createElement('img');
        bgImg.src = match[2].replace(/&amp;/g, '&');
        bgImg.alt = heading ? heading.textContent.trim() : '';
      }
    }
    const body = [];

    // Eyebrow: category + date
    const sub = content.querySelector('.subheading');
    if (sub) {
      const category = (sub.querySelector('.content-type')?.textContent || '').trim();
      const date = getSydneyDate(document, pageData, heading ? heading.textContent.trim() : '')
        || (sub.querySelector('.subtitle')?.textContent || '').trim();
      if (category || date) {
        const p = document.createElement('p');
        if (category) {
          const strong = document.createElement('strong');
          strong.textContent = category;
          p.appendChild(strong);
          if (date) p.appendChild(document.createTextNode(' '));
        }
        if (date) p.appendChild(document.createTextNode(date));
        body.push(p);
      }
    }

    if (heading) body.push(heading);

    content.querySelectorAll(':scope > p:not(.subheading)').forEach((p) => {
      if (p.textContent.trim()) body.push(p);
    });

    // Read more CTA -> real link to the card target
    const more = content.querySelector('.faux-link');
    const moreText = (more ? more.textContent : '').trim() || 'Read more';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = moreText;
      p.appendChild(a);
      body.push(p);
    }

    if (!heading && !bgImg) return;

    let imageCell = '';
    if (bgImg) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(bgImg);
    }

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    body.forEach((el) => textCell.appendChild(el));

    cells.push([imageCell, body.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
