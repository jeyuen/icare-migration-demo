/*
 * Embed Iframe Block
 * Embeds a third-party app or form (e.g. a calculator) in a full-width, tall iframe.
 * Based on the Block Collection embed block: https://www.aem.live/developer/block-collection/embed
 *
 * Content model: 1 row x 1 cell containing a link (or plain-text URL) to the embed URL,
 * an optional placeholder picture, and optional title text.
 */

const URL_PATTERN = /^https?:\/\/\S+$/i;
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 20000;

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
 * Reads the embed URL, title and placeholder from the authored block.
 * @param {Element} block
 */
function readConfig(block) {
  const link = block.querySelector('a[href]');
  let url = link ? parseUrl(link.getAttribute('href')) : null;
  const texts = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div')]
    .filter((el) => !el.querySelector('p, div, picture, a') && el.textContent.trim())
    .map((el) => el.textContent.trim());

  if (!url) {
    const urlText = texts.find((t) => URL_PATTERN.test(t));
    url = parseUrl(urlText);
  }

  const linkText = link ? link.textContent.trim() : '';
  const textTitle = texts.find((t) => !URL_PATTERN.test(t) && t !== linkText);
  let title = textTitle || '';
  if (!title && linkText && !URL_PATTERN.test(linkText)) title = linkText;
  if (!title && link && link.title) title = link.title.trim();
  if (!title && url) title = `Content from ${url.hostname}`;

  return { url, title, placeholder: block.querySelector('picture') };
}

/**
 * Builds the visible "open in new tab" fallback link.
 * @param {URL} url
 * @param {string} title
 */
function buildFallback(url, title) {
  const p = document.createElement('p');
  p.className = 'embed-iframe-fallback';
  const a = document.createElement('a');
  a.href = url.href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = `Open ${title} in a new tab`;
  p.append('Having trouble viewing this content? ', a);
  return p;
}

/**
 * Extracts a height from an iframe-resizer style (or simple object) postMessage payload.
 * @param {*} data
 * @returns {number|null}
 */
function getMessageHeight(data) {
  let height = null;
  if (typeof data === 'string' && data.startsWith('[iFrameSizer]')) {
    // iframe-resizer v4 format: [iFrameSizer]id:height:width:type
    const [, rawHeight] = data.slice('[iFrameSizer]'.length).split(':');
    height = parseFloat(rawHeight);
  } else if (data && typeof data === 'object') {
    height = parseFloat(data.height ?? data.frameHeight);
  }
  if (!Number.isFinite(height) || height < MIN_HEIGHT) return null;
  return Math.min(Math.ceil(height), MAX_HEIGHT);
}

/**
 * Creates the iframe and wires up auto-height messages from its origin.
 * @param {Element} block
 * @param {URL} url
 * @param {string} title
 */
function loadIframe(block, url, title) {
  if (block.classList.contains('embed-iframe-is-loaded')) return;
  const frameWrap = document.createElement('div');
  frameWrap.className = 'embed-iframe-frame';

  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = title;
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'fullscreen');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frameWrap.append(iframe);

  const onMessage = (event) => {
    if (!iframe.isConnected) {
      window.removeEventListener('message', onMessage);
      return;
    }
    if (event.source !== iframe.contentWindow || event.origin !== url.origin) return;
    const height = getMessageHeight(event.data);
    if (height) {
      iframe.style.height = `${height}px`;
      block.classList.add('embed-iframe-resized');
    }
  };
  window.addEventListener('message', onMessage);

  const placeholder = block.querySelector('.embed-iframe-placeholder');
  if (placeholder) placeholder.replaceWith(frameWrap);
  else block.prepend(frameWrap);
  block.classList.add('embed-iframe-is-loaded');
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { url, title, placeholder } = readConfig(block);
  block.textContent = '';
  if (!url) return;

  block.append(buildFallback(url, title));

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-iframe-placeholder';
    const play = document.createElement('div');
    play.className = 'embed-iframe-placeholder-play';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = `Load ${title}`;
    button.setAttribute('aria-label', `Load ${title}`);
    play.append(button);
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => loadIframe(block, url, title));
    block.prepend(wrapper);
  } else {
    loadIframe(block, url, title);
  }
}
