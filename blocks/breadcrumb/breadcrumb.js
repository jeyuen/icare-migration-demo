import { decorateIcons } from '../../scripts/aem.js';

// Universal Editor serves pages as /content/<site>/<path>.html; that root is the home page
const AUTHOR_PAGE = /^\/content\/[^/]+.*\.html$/;
const AUTHOR_ROOT = /^\/content\/[^/]+/;
// local preview of imported pages (aem up --html-folder content) serves /content/<path>
const PREVIEW_ROOT = '/content';

// Section folders with no page of their own: on the source they redirect to the home page,
// so their trail item links home (as on www.icare.nsw.gov.au) and keeps the source label.
const SECTION_FOLDERS = {
  '/workers-compensation': { label: 'Workers Compensation', path: '/' },
  '/builders-and-homeowners': { label: 'Builders and homeowners', path: '/' },
};

/**
 * Turns a page name into a label, e.g. "who-needs-a-policy" -> "Who needs a policy".
 * @param {string} name
 * @returns {string}
 */
function labelFromName(name) {
  const label = decodeURIComponent(name).replace(/-+/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Splits the current URL into page names, and builds hrefs that work on the
 * published site (/a/b), in Universal Editor (/content/<site>/a/b.html)
 * and in the local preview of imported pages (/content/a/b).
 * @returns {{ names: string[], toHref: (path: string) => string }}
 */
function readLocation() {
  const { pathname } = window.location;
  const isAuthor = AUTHOR_PAGE.test(pathname);
  const path = pathname.replace(/(\.plain)?\.html$/, '');
  let root = '';
  if (isAuthor) [root] = path.match(AUTHOR_ROOT);
  else if (path.startsWith(`${PREVIEW_ROOT}/`)) root = PREVIEW_ROOT;

  const names = path.slice(root.length).split('/').filter(Boolean);
  const toHref = (pagePath) => {
    if (isAuthor) return `${root}${pagePath === '/' ? '' : pagePath}.html`;
    return `${window.hlx?.codeBasePath || ''}${root}${pagePath}`;
  };
  return { names, toHref };
}

function buildLink(href, label) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  return a;
}

/**
 * Builds the page trail from the page path, as the source does: Home, a link for
 * every level of the path, then the current page (not linked).
 * @param {Element} block
 */
export default function decorate(block) {
  const { names, toHref } = readLocation();
  if (!names.length) {
    block.remove();
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');

  const home = document.createElement('li');
  home.className = 'breadcrumb-home';
  const homeLink = buildLink(toHref('/'), 'Home');
  const icon = document.createElement('span');
  icon.className = 'icon icon-home-white';
  homeLink.prepend(icon);
  home.append(homeLink);
  list.append(home);

  names.slice(0, -1).forEach((name, i) => {
    const pagePath = `/${names.slice(0, i + 1).join('/')}`;
    const folder = SECTION_FOLDERS[pagePath];
    const item = document.createElement('li');
    item.append(buildLink(
      toHref(folder?.path || pagePath),
      folder?.label || labelFromName(name),
    ));
    list.append(item);
  });

  const current = document.createElement('li');
  current.className = 'breadcrumb-current';
  const currentLabel = document.createElement('span');
  currentLabel.textContent = labelFromName(names[names.length - 1]);
  currentLabel.setAttribute('aria-current', 'page');
  current.append(currentLabel);
  list.append(current);

  nav.append(list);
  decorateIcons(nav);
  block.replaceChildren(nav);
}
