/*
 * Columns Video
 * Two columns: a text column (heading, paragraphs, pill CTA) beside a video column
 * whose YouTube/Vimeo link is turned into a responsive 16:9 player.
 * The embed approach follows blocks/embed-video/embed-video.js.
 *
 * Content model: 1 row x 2 cells: [heading, text, CTA link | video link (or plain URL)].
 * Either cell may hold the video; the first cell containing a video URL becomes the
 * video column, every other cell is a text column.
 */

const URL_PATTERN = /^https?:\/\/\S+$/i;

/**
 * Parses an http(s) URL, returning null for anything else (e.g. javascript: URLs).
 * @param {string} value
 * @returns {URL|null}
 */
function parseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value.trim(), window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch (e) {
    return null;
  }
}

/**
 * Extracts a YouTube video id from watch, youtu.be, shorts, live and embed URLs.
 * @param {URL} url
 * @returns {string}
 */
function getYoutubeId(url) {
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') return url.pathname.split('/')[1] || '';
  if (!host.endsWith('youtube.com') && !host.endsWith('youtube-nocookie.com')) return '';
  const v = url.searchParams.get('v');
  if (v) return v;
  const [, kind, id] = url.pathname.split('/');
  return ['embed', 'shorts', 'live', 'v'].includes(kind) && id ? id : '';
}

/**
 * Resolves the iframe src for a supported video URL, or null when unsupported.
 * @param {URL} url
 * @returns {string|null}
 */
function getEmbedSrc(url) {
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    const params = new URLSearchParams({ rel: '0' });
    const start = url.searchParams.get('t') || url.searchParams.get('start');
    if (start) params.set('start', parseInt(start, 10) || 0);
    return `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${params}`;
  }
  if (url.hostname.replace(/^www\./, '').endsWith('vimeo.com')) {
    const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
    if (id) return `https://player.vimeo.com/video/${id}`;
  }
  return null;
}

/**
 * Finds the video URL authored in a cell, as a link or as a plain-text URL.
 * @param {Element} cell
 * @returns {{ src: string, link: Element|null }|null}
 */
function findVideo(cell) {
  // a video cell holds only the video link/URL (and optionally a poster-less caption-free wrapper)
  if (cell.querySelector('h1, h2, h3, h4, h5, h6, picture')) return null;
  const links = cell.querySelectorAll('a[href]');
  const cellText = cell.textContent.trim();

  if (links.length === 1) {
    const [link] = links;
    const url = parseUrl(link.getAttribute('href'));
    const src = url && getEmbedSrc(url);
    return src && cellText === link.textContent.trim() ? { src, link } : null;
  }
  if (links.length === 0 && URL_PATTERN.test(cellText)) {
    const url = parseUrl(cellText);
    const src = url && getEmbedSrc(url);
    return src ? { src, link: null } : null;
  }
  return null;
}

/**
 * Turns the cell into a responsive 16:9 frame, loading the iframe near the viewport.
 * @param {Element} cell
 * @param {{ src: string, link: Element|null }} video
 * @param {string} fallbackTitle
 */
function buildVideo(cell, { src, link }, fallbackTitle) {
  const linkText = link ? link.textContent.trim() : '';
  const title = (linkText && !URL_PATTERN.test(linkText) && linkText)
    || link?.title?.trim()
    || fallbackTitle
    || 'Embedded video';

  const frame = document.createElement('div');
  frame.className = 'columns-video-frame';
  cell.replaceChildren(frame);
  cell.classList.add('columns-video-media');

  const load = () => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.loading = 'lazy';
    // fullscreen is granted via the allow list; allowfullscreen would be ignored (and warn)
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.append(iframe);
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(frame);
}

/**
 * Flags a standalone link paragraph as the pill CTA when the author did not bold it
 * (bold links are already turned into primary buttons by decorateButtons()).
 * @param {Element} cell
 */
function decorateCta(cell) {
  cell.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.querySelector('picture')) return;
    const a = links[0];
    if (a.classList.contains('button')) return;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('button-wrapper');
    a.classList.add('button', 'primary');
  });
  // drop empty spacer paragraphs carried over from the source (&nbsp; only)
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('picture, img, a, iframe')) p.remove();
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-video-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    let videoFound = false;
    cells.forEach((cell) => {
      const video = !videoFound ? findVideo(cell) : null;
      if (video) {
        videoFound = true;
        buildVideo(cell, video, heading?.textContent.trim());
      } else {
        cell.classList.add('columns-video-text');
        decorateCta(cell);
      }
    });
  });
}
