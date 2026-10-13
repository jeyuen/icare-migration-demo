/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed. Source:
 *   https://www.icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages
 * Instance selector: .cm-video .intrinsic
 * Source: <div class="intrinsic"><div class="intrinsic-wrap intrinsic-16x9">
 *   <iframe class="intrinsic-el video" src="https://www.youtube.com/embed/{id}?enablejsapi=1&origin=..."
 *     title="..."></iframe></div></div>
 * The heading, description and audio-description link in the sibling .video-desc stay default content.
 *
 * UE model (blocks/embed-video/_embed-video.json), all fields grouped (embed_*) into ONE cell:
 *   embed_placeholder (+ embed_placeholderAlt collapsed) - optional poster (none in source)
 *   embed_uri   - video URL, emitted as a link (YouTube embed URLs normalised to watch URLs)
 *   embed_title - accessible title (iframe title attribute)
 * The element (and its iframe) is always replaced, so the cleanup transformer's
 * "remove iframes outside tables" rule cannot drop the video.
 */
function resolveUrl(raw, document) {
  if (!raw) return '';
  try {
    const base = (document.location && document.location.href) || 'https://www.icare.nsw.gov.au/';
    return new URL(raw.startsWith('//') ? `https:${raw}` : raw, base).href;
  } catch (e) {
    return raw;
  }
}

// https://www.youtube.com/embed/ID?enablejsapi=1&origin=... -> https://www.youtube.com/watch?v=ID
function toCanonicalVideoUrl(href) {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const [, kind, id] = url.pathname.split('/');
      const vid = url.searchParams.get('v') || (['embed', 'v', 'shorts', 'live'].includes(kind) ? id : '');
      if (vid) {
        const start = url.searchParams.get('start') || url.searchParams.get('t');
        return `https://www.youtube.com/watch?v=${vid}${start ? `&t=${parseInt(start, 10) || 0}` : ''}`;
      }
    }
    if (host === 'youtu.be') return url.href;
    if (host === 'player.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p));
      if (id) return `https://vimeo.com/${id}`;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const iframe = element.matches('iframe') ? element : element.querySelector('iframe');
  const video = !iframe ? element.querySelector('video') : null;

  const rawSrc = iframe
    ? ['src', 'data-src', 'data-lazy-src', 'data-original']
      .map((attr) => (iframe.getAttribute(attr) || '').trim())
      .find((v) => v && v !== 'about:blank' && !v.startsWith('javascript:'))
    : (video && (video.getAttribute('src') || video.querySelector('source')?.getAttribute('src'))) || '';

  const href = rawSrc ? toCanonicalVideoUrl(resolveUrl(rawSrc, document)) : '';

  if (!href) {
    if (iframe) iframe.remove();
    element.replaceWith(...element.childNodes);
    return;
  }

  const title = (
    (iframe && (iframe.getAttribute('title') || iframe.getAttribute('aria-label')))
    || (video && video.getAttribute('title'))
    || ''
  ).trim();

  // Optional poster image (not present on icare video embeds).
  const poster = element.querySelector('picture, img');

  const frag = document.createDocumentFragment();
  if (poster) {
    frag.appendChild(document.createComment(' field:embed_placeholder '));
    frag.appendChild(poster);
  }

  frag.appendChild(document.createComment(' field:embed_uri '));
  const linkP = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  linkP.appendChild(a);
  frag.appendChild(linkP);

  if (title) {
    frag.appendChild(document.createComment(' field:embed_title '));
    const titleP = document.createElement('p');
    titleP.textContent = title;
    frag.appendChild(titleP);
  }

  const cells = [[frag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
