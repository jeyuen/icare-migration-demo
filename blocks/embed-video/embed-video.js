/*
 * Embed Video Block
 * Embeds a YouTube (or Vimeo) video in a responsive 16:9 frame at full content width.
 * Based on the Block Collection embed block: https://www.aem.live/developer/block-collection/embed
 *
 * Content model: 1 row x 1 cell containing an optional placeholder picture, a link
 * (or plain-text URL) to the video, and optional title text.
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
 * Resolves the iframe src for a video URL.
 * @param {URL} url
 * @param {boolean} autoplay
 * @returns {{ src: string, provider: string }}
 */
function getEmbedSrc(url, autoplay) {
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    const params = new URLSearchParams({ rel: '0' });
    const start = url.searchParams.get('t') || url.searchParams.get('start');
    if (start) params.set('start', parseInt(start, 10) || 0);
    if (autoplay) params.set('autoplay', '1');
    return {
      src: `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${params}`,
      provider: 'youtube',
    };
  }
  if (url.hostname.replace(/^www\./, '').endsWith('vimeo.com')) {
    const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
    if (id) {
      return {
        src: `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}`,
        provider: 'vimeo',
      };
    }
  }
  return { src: url.href, provider: 'other' };
}

/**
 * Reads the video URL, title and placeholder from the authored block.
 * @param {Element} block
 */
function readConfig(block) {
  const link = block.querySelector('a[href]');
  let url = link ? parseUrl(link.getAttribute('href')) : null;
  const texts = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div')]
    .filter((el) => !el.querySelector('p, div, picture, a') && el.textContent.trim())
    .map((el) => el.textContent.trim());

  if (!url) url = parseUrl(texts.find((t) => URL_PATTERN.test(t)));

  const linkText = link ? link.textContent.trim() : '';
  let title = texts.find((t) => !URL_PATTERN.test(t) && t !== linkText) || '';
  if (!title && linkText && !URL_PATTERN.test(linkText)) title = linkText;
  if (!title && link && link.title) title = link.title.trim();
  if (!title) title = 'Embedded video';

  return { url, title, placeholder: block.querySelector('picture') };
}

/**
 * Replaces the block content with the responsive video frame.
 * @param {Element} block
 * @param {URL} url
 * @param {string} title
 * @param {boolean} autoplay
 */
function loadVideo(block, url, title, autoplay = false) {
  if (block.classList.contains('embed-video-is-loaded')) return;
  const { src, provider } = getEmbedSrc(url, autoplay);

  const frame = document.createElement('div');
  frame.className = 'embed-video-frame';
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.append(iframe);

  block.replaceChildren(frame);
  block.classList.add('embed-video-is-loaded', `embed-video-${provider}`);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { url, title, placeholder } = readConfig(block);
  block.textContent = '';
  if (!url) return;

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-video-placeholder';
    const play = document.createElement('div');
    play.className = 'embed-video-placeholder-play';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = `Play ${title}`;
    button.setAttribute('aria-label', `Play ${title}`);
    play.append(button);
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => loadVideo(block, url, title, true));
    block.append(wrapper);
    return;
  }

  // reserve the 16:9 space up front, then load the iframe once the block nears the viewport
  block.classList.add('embed-video-pending');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      block.classList.remove('embed-video-pending');
      loadVideo(block, url, title);
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
