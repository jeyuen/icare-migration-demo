/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video. Base: columns. Source:
 *   https://www.icare.nsw.gov.au/employers/industry-and-partners/small-business-hub
 * Instance selector: .l-main .content-hero .l-padding > div.sl
 * UE model (blocks/columns-video/_columns-video.json): columns block -> no field hints.
 * Rows: 1 row, one cell per .sl-item (2 on the representative page).
 *   Text cell:  .cm-rich-text -> h3, paragraphs, a.cta ("View upcoming events") as its own <p>
 *   Video cell: section.cm-video iframe (YouTube embed with enablejsapi/origin params)
 *               -> a single clean https://www.youtube.com/watch?v=<id> link (iframe title kept
 *               as the link title). blocks/columns-video/columns-video.js detects the video cell
 *               only when the cell holds nothing but that link.
 *
 * Representative source:
 *   <div class="sl"><div class="sl-list has-2-items">
 *     <div class="sl-item"><div class="cm cm-rich-text"><div><h3>..</h3><p>..</p><p>&nbsp;</p>
 *       <p>&nbsp;<a href=".." class="cta">View upcoming events</a></p></div></div></div>
 *     <div class="sl-item"><section class="cm cm-video youtube"><div class="intrinsic">
 *       <div class="intrinsic-wrap"><iframe src="https://www.youtube.com/embed/ID?enablejsapi=1&origin=.."
 *       title=".."></iframe></div></div></section></div>
 *   </div></div>
 *
 * The same selector also matches 4-up news tile grids (section.cm-content-tile >
 * a.cm-image-block-link) on other section-overview-hub pages, so each .sl-item is normalised
 * with the same generic normaliser as columns-panels (wrappers flattened, card href re-attached
 * to the .faux-link label, /_next/image URLs decoded, &nbsp; spacers and <hr> dropped).
 * Iteration is keyed on the block-level .sl-item wrappers. The block keeps its variant name
 * (fix-columns-jcr.mjs restores it in JCR).
 */
const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const BLOCK_TAGS = new Set(['P', 'DIV', 'SECTION', 'HEADER', 'FOOTER', 'ARTICLE', 'ASIDE', 'FIGURE',
  'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE', 'HR',
  'IMG', 'PICTURE', 'IFRAME', 'VIDEO', 'FORM', 'NAV']);
const BLOCK_SELECTOR = 'p, div, section, header, figure, h1, h2, h3, h4, h5, h6, ul, ol, table, img, picture, iframe, hr, .faux-link';
const DECORATIVE = '.related-links-arrow, .icon, .redirectImg, script, style, noscript, button';

function decodeNextImage(url) {
  if (!url || !url.includes('/_next/image')) return url;
  try {
    const original = new URL(url, 'https://www.icare.nsw.gov.au/').searchParams.get('url');
    if (!original) return url;
    return original.startsWith('/') ? `https://www.icare.nsw.gov.au${original}` : original;
  } catch (e) {
    return url;
  }
}

function makeImage(document, src, alt) {
  const img = document.createElement('img');
  img.src = decodeNextImage(src.replace(/&amp;/g, '&'));
  img.alt = alt || '';
  return img;
}

function imageFrom(document, img) {
  const srcset = img.getAttribute('srcset') || '';
  const last = srcset.split(',').map((c) => c.trim().split(/\s+/)[0]).filter(Boolean).pop();
  const src = img.getAttribute('src') || img.getAttribute('data-src') || last || '';
  if (!src || src.startsWith('data:')) return null;
  return makeImage(document, src, img.getAttribute('alt'));
}

function backgroundImage(document, el) {
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
  return m && m[2] ? makeImage(document, m[2], '') : null;
}

// https://www.youtube.com/embed/ID?enablejsapi=1&origin=... -> https://www.youtube.com/watch?v=ID
function toCanonicalVideoUrl(raw) {
  if (!raw) return '';
  try {
    const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw, 'https://www.icare.nsw.gov.au/');
    const host = url.hostname.replace(/^www\.|^m\./, '');
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const [, kind, id] = url.pathname.split('/');
      const vid = url.searchParams.get('v') || (['embed', 'v', 'shorts', 'live'].includes(kind) ? id : '');
      if (vid) {
        const start = url.searchParams.get('start') || url.searchParams.get('t');
        return `https://www.youtube.com/watch?v=${vid}${start ? `&t=${parseInt(start, 10) || 0}` : ''}`;
      }
    }
    if (host === 'player.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p));
      if (id) return `https://vimeo.com/${id}`;
    }
    return url.href;
  } catch (e) {
    return raw;
  }
}

function linkParagraph(document, href, text, title) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  if (title) a.title = title;
  p.appendChild(a);
  return p;
}

const isBlockish = (el) => BLOCK_TAGS.has(el.tagName)
  || el.classList.contains('faux-link')
  || /background-image/i.test(el.getAttribute('style') || '')
  || !!el.querySelector(BLOCK_SELECTOR);

/**
 * Normalises one column's source DOM into a flat list of default-content elements.
 */
function normalizeCell(root, document) {
  root.querySelectorAll(DECORATIVE).forEach((el) => el.remove());
  // visually-hidden helper text: keep only when it is the element's sole label (e.g. faux-link)
  root.querySelectorAll('.vh').forEach((vh) => {
    const parent = vh.parentElement;
    if (parent && clean(parent.textContent) !== clean(vh.textContent)) vh.remove();
  });

  const out = [];
  let para = null;
  const flush = () => {
    if (para && (clean(para.textContent) || para.querySelector('img'))) out.push(para);
    para = null;
  };
  const push = (el) => { flush(); if (el) out.push(el); };

  const buildList = (list) => {
    const ul = document.createElement(list.tagName.toLowerCase());
    [...list.children].filter((li) => li.tagName === 'LI').forEach((li) => {
      const text = clean(li.textContent);
      if (!text) return;
      const item = document.createElement('li');
      const links = [...li.querySelectorAll('a[href]')].filter((a) => a.getAttribute('href') && clean(a.textContent));
      if (links.length === 1 && clean(links[0].textContent) === text) {
        const a = document.createElement('a');
        a.href = links[0].getAttribute('href');
        const label = links[0].querySelector('strong, .faux-link');
        a.textContent = clean((label || links[0]).textContent) || text;
        item.appendChild(a);
      } else {
        [...li.childNodes].forEach((n) => item.appendChild(n));
      }
      ul.appendChild(item);
    });
    return ul.children.length ? ul : null;
  };

  const walk = (parent, card) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        if (clean(node.textContent)) {
          if (!para) para = document.createElement('p');
          para.appendChild(node);
        }
        return;
      }
      if (node.nodeType !== 1) return;
      const el = node;
      const tag = el.tagName;

      if (!isBlockish(el)) {
        // inline run (text, strong, em, inline links)
        if (!clean(el.textContent) && tag !== 'BR') return;
        if (!para) para = document.createElement('p');
        para.appendChild(el);
        return;
      }

      const bg = backgroundImage(document, el);
      if (bg) {
        const p = document.createElement('p');
        p.appendChild(bg);
        push(p);
      }

      if (tag === 'HR') { flush(); return; }
      if (/^H[1-6]$/.test(tag)) {
        const text = clean(el.textContent);
        if (!text) return;
        const h = document.createElement(tag.toLowerCase());
        h.textContent = text;
        if (card) card.headings.push(h);
        push(h);
        return;
      }
      if (tag === 'UL' || tag === 'OL') { push(buildList(el)); return; }
      if (tag === 'TABLE') { push(el); return; }
      if (tag === 'IMG' || tag === 'PICTURE') {
        const img = imageFrom(document, tag === 'IMG' ? el : el.querySelector('img') || el);
        if (img) {
          const p = document.createElement('p');
          p.appendChild(img);
          push(p);
        }
        return;
      }
      if (tag === 'IFRAME' || tag === 'VIDEO') {
        const raw = ['src', 'data-src', 'data-lazy-src'].map((a) => (el.getAttribute(a) || '').trim())
          .find((v) => v && v !== 'about:blank' && !v.startsWith('javascript:'))
          || (el.querySelector && el.querySelector('source')?.getAttribute('src')) || '';
        const href = toCanonicalVideoUrl(raw);
        if (href) push(linkParagraph(document, href, href, clean(el.getAttribute('title'))));
        return;
      }
      if (el.classList.contains('faux-link') && card && card.href) {
        // label of a card link -> real link to the card target
        push(linkParagraph(document, card.href, clean(el.textContent) || 'Read more'));
        card.linked = true;
        return;
      }
      if (tag === 'A') {
        const href = el.getAttribute('href') || '';
        const ctx = href ? { href, headings: [], linked: false } : card;
        walk(el, ctx);
        flush();
        if (href && !ctx.linked) {
          const [heading] = ctx.headings;
          if (heading) {
            const a = document.createElement('a');
            a.href = href;
            a.textContent = heading.textContent;
            heading.textContent = '';
            heading.appendChild(a);
          } else {
            push(linkParagraph(document, href, clean(el.getAttribute('title')) || 'Learn more'));
          }
        }
        return;
      }
      if (tag === 'P') {
        const text = clean(el.textContent);
        const links = [...el.querySelectorAll('a[href]')].filter((a) => a.getAttribute('href') && clean(a.textContent));
        if (!text && !el.querySelector('img, picture, iframe')) { flush(); return; } // spacer
        if (links.length && text === links.map((a) => clean(a.textContent)).join(' ')) {
          // paragraph made only of links -> one clean link paragraph per link
          links.forEach((a) => push(linkParagraph(document, a.getAttribute('href'), clean(a.textContent))));
          return;
        }
        if (el.querySelector('img, picture, iframe')) { flush(); walk(el, card); flush(); return; }
        if (el.classList.contains('subheading')) {
          // eyebrow: <strong class="content-type">Information</strong><span>7 Oct</span> -> "**Information** 7 Oct"
          const p = document.createElement('p');
          [...el.children].forEach((c) => {
            const t = clean(c.textContent);
            if (!t) return;
            if (p.childNodes.length) p.appendChild(document.createTextNode(' '));
            if (c.tagName === 'STRONG' || c.tagName === 'B') {
              const strong = document.createElement('strong');
              strong.textContent = t;
              p.appendChild(strong);
            } else {
              p.appendChild(document.createTextNode(t));
            }
          });
          push(p.childNodes.length ? p : el);
          return;
        }
        push(el);
        return;
      }
      // generic wrapper (div, section, header, figure, span.faux-link without card, ...)
      flush();
      walk(el, card);
      flush();
    });
  };

  walk(root, null);
  flush();
  return out;
}


export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .sl-list > .sl-item')];
  if (!items.length) items = [...element.querySelectorAll(':scope > .sl-item, .sl-item')];

  const row = items.map((item) => {
    const cell = normalizeCell(item, document);
    return cell.length ? cell : '';
  });

  if (!row.some((c) => c)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
