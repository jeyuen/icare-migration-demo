/**
 * Fetches the footer fragment. Local preview serves it under /content,
 * DA/EDS production serves it at the site root.
 * @returns {Promise<Element|null>} the parsed fragment wrapper
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // media paths are relative to the fragment, not the page that loads it
  const base = new URL(resp.url, window.location.href);
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  wrapper.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
  // list items in "loose" lists get their content wrapped in <p> on publish
  wrapper.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  return wrapper;
}

// a link whose only visible content is an image
function isImageLink(link) {
  return !!link.querySelector('img') && !link.textContent.trim();
}

function isExternal(link) {
  return new URL(link.href, window.location.href).origin !== window.location.origin;
}

/**
 * Classifies a fragment section by its content.
 * @param {Element} section top-level fragment section
 * @returns {string} brand | links | social | bottom
 */
function sectionType(section) {
  const links = [...section.querySelectorAll('a')];
  if (section.querySelector('ul') && links.length && links.every(isImageLink)) return 'social';
  if (section.querySelector('ul')) return 'links';
  if (links.length && links.every(isImageLink)) return 'brand';
  return 'bottom';
}

/**
 * Icon-only links get their accessible name from the image, render the
 * image as a background icon and, when pointing off-site, open in a new tab.
 * @param {Element} section the social section
 */
function decorateIconLinks(section) {
  section.querySelectorAll('a').forEach((link) => {
    const img = link.querySelector('img');
    if (img) {
      if (img.alt && !link.getAttribute('aria-label')) link.setAttribute('aria-label', img.alt);
      const icon = document.createElement('span');
      icon.className = 'footer-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.backgroundImage = `url("${img.src}")`;
      const width = img.getAttribute('width');
      const height = img.getAttribute('height');
      if (width && height) icon.style.aspectRatio = `${width} / ${height}`;
      (img.closest('picture') || img).replaceWith(icon);
    }
    if (isExternal(link)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const main = document.createElement('div');
  main.className = 'footer-main';
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  main.append(columns);

  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  [...fragment.children].forEach((section) => {
    const type = sectionType(section);
    section.classList.add(`footer-${type}`);
    if (type === 'social') decorateIconLinks(section);
    if (type === 'bottom') {
      bottom.append(...section.childNodes);
    } else {
      columns.append(section);
    }
  });

  block.append(main);
  if (bottom.children.length) block.append(bottom);
}
