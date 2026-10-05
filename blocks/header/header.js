// media query match that indicates desktop width (source header switches at 1024px)
const isDesktop = window.matchMedia('(width >= 1024px)');

const TRANSLATE_SCRIPT = 'https://translate.google.com/translate_a/element.js?cb=headerTranslateInit';

// toggles that stay open while other panels open/close inside them
const PERSISTENT_TOGGLES = '.nav-hamburger, .nav-login-accordion';

/**
 * Fetches the nav fragment. Local preview serves it under /content,
 * DA/EDS production serves it at the site root.
 * @returns {Promise<Element|null>} the parsed fragment wrapper
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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
  return wrapper;
}

/**
 * Brings published markup back to the authored shape: list items in "loose"
 * lists get their content wrapped in <p> by the delivery pipeline, and a linked
 * image followed by text is split into two links with the same href.
 * @param {Element} fragment the parsed nav fragment
 */
function normalizeNav(fragment) {
  fragment.querySelectorAll('li > p').forEach((p) => {
    p.replaceWith(document.createTextNode(' '), ...p.childNodes, document.createTextNode(' '));
  });
  fragment.querySelectorAll('li').forEach((li) => {
    const links = [...li.children].filter((el) => el.tagName === 'A');
    links.forEach((link, i) => {
      const next = links[i + 1];
      if (!next || !link.parentElement || next.getAttribute('href') !== link.getAttribute('href')) return;
      link.append(document.createTextNode(' '), ...next.childNodes);
      next.remove();
    });
  });
}

// direct text of an element (ignoring nested elements), removed from the element
function takeOwnText(el) {
  const nodes = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
  const text = nodes.map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
  nodes.forEach((n) => n.remove());
  return text;
}

function createButton(className, label, html = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  if (label) button.setAttribute('aria-label', label);
  button.innerHTML = html;
  return button;
}

function closeIcon() {
  return '<span class="nav-icon-close" aria-hidden="true"></span>';
}

/* ---------- open / close state ---------- */

function setExpanded(trigger, expanded) {
  trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function isExpanded(trigger) {
  return trigger.getAttribute('aria-expanded') === 'true';
}

function updateState(nav) {
  const header = nav.closest('header');
  const has = (selector) => nav.querySelector(selector) !== null;
  header.classList.toggle('is-open', has('.nav-sections .nav-drop > a[aria-expanded="true"], .nav-login-toggle[aria-expanded="true"]'));
  header.classList.toggle('is-login-open', has('.nav-login-toggle[aria-expanded="true"]'));
  header.classList.toggle('is-search-open', has('.nav-search-toggle[aria-expanded="true"]'));
  const menuOpen = has('.nav-hamburger[aria-expanded="true"]');
  header.classList.toggle('is-menu-open', menuOpen);
  document.body.style.overflowY = menuOpen && !isDesktop.matches ? 'hidden' : '';
}

function closeAll(nav, except) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((trigger) => {
    if (trigger === except || trigger.closest('.nav-panel-categories') || trigger.matches(PERSISTENT_TOGGLES)) return;
    setExpanded(trigger, false);
  });
  updateState(nav);
}

function toggle(nav, trigger) {
  const expanded = isExpanded(trigger);
  closeAll(nav, trigger);
  setExpanded(trigger, !expanded);
  updateState(nav);
}

/* ---------- translate (language selector) ---------- */

function loadTranslate() {
  if (document.querySelector(`script[src="${TRANSLATE_SCRIPT}"]`)) return;
  let target = document.getElementById('header-translate');
  if (!target) {
    target = document.createElement('div');
    target.id = 'header-translate';
    target.hidden = true;
    document.body.append(target);
  }
  window.headerTranslateInit = () => {
    // eslint-disable-next-line no-new, no-undef
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'header-translate');
  };
  const script = document.createElement('script');
  script.src = TRANSLATE_SCRIPT;
  document.head.append(script);
}

function currentLanguage() {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

function setLanguage(code) {
  const { hostname } = window.location;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if (!code || code === 'en') {
    document.cookie = `googtrans=; ${expire}; path=/`;
    document.cookie = `googtrans=; ${expire}; path=/; domain=${hostname}`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
  }
  window.location.reload();
}

/* ---------- builders ---------- */

function buildBrand(section) {
  section.className = 'nav-brand';
  const link = section.querySelector('a');
  const logo = section.querySelector('picture') || section.querySelector('img');
  if (link) {
    // the logo may be authored as its own image paragraph next to the home link
    if (logo && !link.contains(logo)) {
      const label = link.textContent.trim();
      const holder = logo.closest('p');
      link.textContent = '';
      link.append(logo);
      if (label) link.setAttribute('aria-label', label);
      if (holder && !holder.querySelector('a')) holder.remove();
    }
    if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'icare home');
  }
  return section;
}

function buildUtility(nav, section) {
  section.className = 'nav-utility';
  const list = section.querySelector(':scope > ul');
  if (!list) return section;
  list.classList.add('nav-utility-list');
  list.querySelectorAll(':scope > li').forEach((item) => {
    const submenu = item.querySelector(':scope > ul');
    if (!submenu) return;
    // a list item with a nested list is a language selector
    item.classList.add('nav-languages');
    const label = takeOwnText(item);
    const trigger = createButton('nav-languages-toggle', label);
    trigger.textContent = label;
    setExpanded(trigger, false);
    item.prepend(trigger);
    submenu.classList.add('nav-languages-panel');
    submenu.setAttribute('aria-label', 'select language');
    submenu.querySelectorAll('a').forEach((link) => {
      const hash = link.getAttribute('href') || '';
      if (!hash.startsWith('#')) {
        link.closest('li').classList.add('nav-languages-credit');
        link.target = '_blank';
        link.rel = 'noopener';
        return;
      }
      link.classList.add('notranslate');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setLanguage(hash.slice(1));
      });
    });
    trigger.addEventListener('click', () => toggle(nav, trigger));
  });
  return section;
}

/**
 * Native language select (small screens) built from the authored language links.
 * @param {Element} utilityList the utility list holding the language selector
 * @returns {Element|null} the select wrapper
 */
function buildLanguageSelect(utilityList) {
  const languages = utilityList.querySelector('.nav-languages');
  if (!languages) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-mobile-languages';
  const label = languages.querySelector('.nav-languages-toggle').textContent;
  wrapper.innerHTML = `<label for="header-language-select" class="nav-visually-hidden">${label}</label>`;
  const select = document.createElement('select');
  select.id = 'header-language-select';
  select.className = 'notranslate';
  const active = currentLanguage();
  languages.querySelectorAll('.nav-languages-panel a[href^="#"]').forEach((link) => {
    const code = link.getAttribute('href').slice(1);
    const option = document.createElement('option');
    option.value = code;
    option.textContent = link.textContent.trim();
    option.selected = code === active;
    select.append(option);
  });
  select.addEventListener('change', () => setLanguage(select.value));
  wrapper.append(select);
  const credit = languages.querySelector('.nav-languages-credit a');
  if (credit) {
    const creditCopy = credit.cloneNode(true);
    creditCopy.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
    wrapper.append(creditCopy);
  }
  return wrapper;
}

function buildTools(nav, section) {
  section.className = 'nav-tools';
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const searchLink = paragraphs.find((p) => p.querySelector('a') && !p.querySelector('img'));
  // login label and icon: one paragraph when authored, or split in two when published
  const loginIconPara = paragraphs.find((p) => p.querySelector('img'));
  const loginTextPara = paragraphs.find((p) => !p.querySelector('a, img') && p.textContent.trim());
  const loginLabel = loginIconPara || loginTextPara;
  const loginList = section.querySelector(':scope > ul');

  // search: toggle button + panel with form built from the authored link
  if (searchLink) {
    const link = searchLink.querySelector('a');
    const action = new URL(link.href, window.location.href).pathname;
    const placeholder = link.textContent.trim();
    const toggleBtn = createButton(
      'nav-search-toggle',
      'Toggle search',
      `<span class="nav-icon-search" aria-hidden="true"></span>${closeIcon()}`,
    );
    setExpanded(toggleBtn, false);
    const panel = document.createElement('div');
    panel.className = 'nav-search-panel';
    panel.setAttribute('role', 'search');
    panel.innerHTML = `<form action="${action}" method="get">
        <label for="header-search-keyword" class="nav-search-label">${placeholder}</label>
        <input id="header-search-keyword" type="search" name="keyword" autocomplete="off" placeholder="${placeholder}">
        <button type="submit" class="nav-search-submit" aria-label="Search button" disabled><span class="nav-icon-search" aria-hidden="true"></span></button>
        <button type="button" class="nav-search-close" aria-label="click to close search dropdown menu">${closeIcon()}<span>Close</span></button>
      </form>`;
    const input = panel.querySelector('input');
    const submit = panel.querySelector('.nav-search-submit');
    input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
    panel.querySelector('.nav-search-close').addEventListener('click', () => {
      nav.querySelectorAll('.nav-search-toggle').forEach((t) => setExpanded(t, false));
      updateState(nav);
      toggleBtn.focus();
    });
    toggleBtn.addEventListener('click', () => {
      toggle(nav, toggleBtn);
      if (isExpanded(toggleBtn)) input.focus();
    });
    searchLink.replaceWith(toggleBtn);
    nav.append(panel);
  }

  // login: button + slide-in drawer with the authored portal list
  if (loginLabel && loginList) {
    const label = [loginIconPara, loginTextPara]
      .filter((p, i, all) => p && all.indexOf(p) === i)
      .map((p) => p.textContent.trim())
      .filter(Boolean)
      .join(' ');
    const toggleBtn = createButton('nav-login-toggle', `Click to open the ${label} menu`);
    const icon = loginIconPara && (loginIconPara.querySelector('picture') || loginIconPara.querySelector('img'));
    if (icon) {
      icon.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      if (icon.tagName === 'IMG') icon.alt = '';
      toggleBtn.append(icon);
    }
    toggleBtn.append(Object.assign(document.createElement('span'), { textContent: label }));
    if (loginTextPara && loginTextPara !== loginLabel) loginTextPara.remove();
    setExpanded(toggleBtn, false);
    const drawer = document.createElement('div');
    drawer.className = 'nav-login-panel';
    drawer.setAttribute('role', 'region');
    drawer.setAttribute('aria-label', label);
    const top = document.createElement('div');
    top.className = 'nav-login-panel-top';
    top.innerHTML = `<p>${label}</p>`;
    const close = createButton('nav-login-close', `Click to close the ${label} menu`, closeIcon());
    close.addEventListener('click', () => {
      setExpanded(toggleBtn, false);
      updateState(nav);
      toggleBtn.focus();
    });
    top.append(close);
    loginList.classList.add('nav-login-list');
    loginList.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    loginList.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    drawer.append(top, loginList);
    toggleBtn.addEventListener('click', () => toggle(nav, toggleBtn));
    loginLabel.replaceWith(toggleBtn);
    nav.append(drawer);
  }
  return section;
}

// screen-reader hint on items that open a sub-level (mirrors the source markup)
function addChildPagesHint(link) {
  const hint = document.createElement('span');
  hint.className = 'nav-visually-hidden';
  hint.textContent = ' child pages';
  const chevron = document.createElement('span');
  chevron.className = 'nav-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  link.append(hint, chevron);
}

// "back" control for the small-screen slide-in levels
function createBackButton(label, onBack) {
  const back = createButton(
    'nav-back',
    '',
    `<span class="nav-visually-hidden">Currently showing child pages of </span>${label}<span class="nav-visually-hidden">. Tap to go back to previous navigation level.</span>`,
  );
  back.addEventListener('click', (e) => {
    e.preventDefault();
    onBack();
  });
  return back;
}

function selectCategory(panel, item) {
  panel.querySelectorAll('.nav-panel-categories > li').forEach((li) => {
    const active = li === item;
    li.classList.toggle('is-active', active);
    li.classList.remove('is-drilled');
    const link = li.querySelector(':scope > a');
    if (link) setExpanded(link, active);
  });
}

function drillCategory(item, open) {
  item.classList.toggle('is-drilled', open);
  const link = item.querySelector(':scope > a');
  if (link) setExpanded(link, open);
}

function buildPanel(nav, item) {
  const trigger = item.querySelector(':scope > a');
  const categories = item.querySelector(':scope > ul');
  if (!trigger || !categories) return;
  item.classList.add('nav-drop');
  const triggerLabel = trigger.textContent.trim();
  trigger.setAttribute('role', 'button');
  addChildPagesHint(trigger);
  setExpanded(trigger, false);

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    toggle(nav, trigger);
    if (!isDesktop.matches) categories.querySelectorAll(':scope > li').forEach((li) => drillCategory(li, false));
  });

  categories.classList.add('nav-panel-categories');
  categories.querySelectorAll(':scope > li').forEach((category) => {
    const link = category.querySelector(':scope > a');
    const links = category.querySelector(':scope > ul');
    if (!link || !links) return;
    const categoryLabel = link.textContent.trim();
    link.setAttribute('role', 'button');
    link.classList.add('nav-panel-item-title');
    addChildPagesHint(link);
    links.classList.add('nav-panel-links');
    links.querySelectorAll('a').forEach((a) => a.classList.add('nav-panel-item-title'));
    links.querySelectorAll(':scope > li').forEach((li) => {
      // a list item with a heading and nested list is a quick-link group
      const heading = li.querySelector(':scope > strong');
      const group = li.querySelector(':scope > ul');
      if (heading && group) {
        li.classList.add('nav-panel-quicklinks');
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent;
        heading.replaceWith(h3);
      }
    });
    const backItem = document.createElement('li');
    backItem.className = 'nav-back-item';
    backItem.append(createBackButton(categoryLabel, () => drillCategory(category, false)));
    links.prepend(backItem);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDesktop.matches) selectCategory(panel, category);
      else drillCategory(category, true);
    });
  });
  const back = createBackButton(triggerLabel, () => {
    setExpanded(trigger, false);
    updateState(nav);
  });
  const close = createButton('nav-panel-close', '', `${closeIcon()}<span class="nav-visually-hidden">Close navigation menu</span>`);
  close.addEventListener('click', () => {
    setExpanded(trigger, false);
    updateState(nav);
    trigger.focus();
  });
  panel.append(back, categories, close);
  item.append(panel);
  selectCategory(panel, categories.querySelector(':scope > li'));
}

function buildSections(nav, section) {
  // the primary list sits directly under the nav element (as on the source site)
  const list = section.querySelector(':scope > ul') || document.createElement('ul');
  list.classList.add('nav-sections');
  list.querySelectorAll(':scope > li').forEach((item) => buildPanel(nav, item));
  return list;
}

/**
 * Bottom tab bar (small screens) from the mobile-only section: plain items become
 * the menu / search toggles, links keep their icon and label.
 */
function buildTabBar(nav, section, hamburger, searchToggle) {
  const tabbar = document.createElement('div');
  tabbar.className = 'nav-tabbar';
  const list = section && section.querySelector(':scope > ul');
  if (!list) return tabbar;
  list.classList.add('nav-tabbar-list');
  const controls = [...list.children].filter((li) => !li.querySelector('a'));
  const [menuItem, searchItem] = controls;
  if (menuItem) {
    hamburger.innerHTML = `<span class="nav-tab-icon" aria-hidden="true"></span><span class="nav-tab-label">${menuItem.textContent.trim()}</span>`;
    menuItem.textContent = '';
    menuItem.append(hamburger);
  }
  if (searchItem && searchToggle) {
    const searchTab = createButton(
      'nav-search-toggle nav-tab-search',
      'Toggle search',
      `<span class="nav-tab-icon" aria-hidden="true"></span><span class="nav-tab-label">${searchItem.textContent.trim()}</span>`,
    );
    setExpanded(searchTab, false);
    searchTab.addEventListener('click', () => {
      setExpanded(hamburger, false);
      toggle(nav, searchTab);
      if (isExpanded(searchTab)) nav.querySelector('.nav-search-panel input').focus();
    });
    searchItem.textContent = '';
    searchItem.append(searchTab);
  }
  list.querySelectorAll('a').forEach((link) => {
    link.querySelectorAll('img').forEach((img) => {
      img.alt = '';
      img.classList.add('nav-tab-icon');
    });
    [...link.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).forEach((n) => {
      const label = document.createElement('span');
      label.className = 'nav-tab-label';
      label.textContent = n.textContent.trim();
      n.replaceWith(label);
    });
  });
  tabbar.append(list);
  return tabbar;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;
  normalizeNav(fragment);
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  const sections = [...fragment.querySelectorAll(':scope > div')];
  const [brandSection, utilitySection, toolsSection, navSection, mobileSection] = sections;

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  nav.append(bar);
  if (brandSection) bar.append(buildBrand(brandSection));
  if (utilitySection) bar.append(buildUtility(nav, utilitySection));
  if (toolsSection) bar.append(buildTools(nav, toolsSection));
  const sectionsList = navSection ? buildSections(nav, navSection) : null;
  if (sectionsList) nav.insertBefore(sectionsList, bar.nextSibling);

  // small screens: menu toggle in the bottom tab bar
  const hamburger = createButton('nav-hamburger', 'Toggle navigation');
  setExpanded(hamburger, false);
  const resetMenuLevels = () => {
    if (!sectionsList) return;
    sectionsList.querySelectorAll('.nav-drop > a').forEach((t) => setExpanded(t, false));
    sectionsList.querySelectorAll('.nav-panel-categories > li').forEach((li) => drillCategory(li, false));
  };
  hamburger.addEventListener('click', () => {
    const open = !isExpanded(hamburger);
    closeAll(nav);
    resetMenuLevels();
    setExpanded(hamburger, open);
    updateState(nav);
  });
  const tabbar = buildTabBar(nav, mobileSection, hamburger, nav.querySelector('.nav-search-toggle'));
  const tabHrefs = [...tabbar.querySelectorAll('a')].map((a) => a.getAttribute('href'));

  // small screens: full-height menu panel (login accordion + menu levels + utility + languages)
  const mobilePanel = document.createElement('div');
  mobilePanel.className = 'nav-mobile-panel';
  const loginRow = document.createElement('div');
  loginRow.className = 'nav-mobile-login';
  const mobileBody = document.createElement('div');
  mobileBody.className = 'nav-mobile-body';
  const utilityList = nav.querySelector('.nav-utility-list');
  const loginList = nav.querySelector('.nav-login-list');
  const loginDrawer = nav.querySelector('.nav-login-panel');
  if (loginList) {
    const loginLabel = nav.querySelector('.nav-login-toggle span').textContent;
    const accordion = createButton('nav-login-accordion', '', `<span>${loginLabel}</span>`);
    setExpanded(accordion, false);
    accordion.addEventListener('click', () => setExpanded(accordion, !isExpanded(accordion)));
    loginRow.append(accordion);
  }
  if (utilityList) {
    // utility links duplicated in the tab bar are not repeated in the menu
    utilityList.querySelectorAll(':scope > li > a').forEach((a) => {
      if (tabHrefs.includes(a.getAttribute('href'))) a.parentElement.classList.add('nav-in-tabbar');
    });
  }
  const languageSelect = utilityList ? buildLanguageSelect(utilityList) : null;
  mobilePanel.append(loginRow, mobileBody);
  nav.append(mobilePanel, tabbar);

  // move shared lists between the desktop and small-screen layouts
  const placeForViewport = () => {
    if (isDesktop.matches) {
      if (sectionsList) nav.insertBefore(sectionsList, bar.nextSibling);
      if (utilityList) nav.querySelector('.nav-utility').append(utilityList);
      if (loginList && loginDrawer) loginDrawer.append(loginList);
    } else {
      [sectionsList, utilityList, languageSelect]
        .filter(Boolean)
        .forEach((el) => mobileBody.append(el));
      if (loginList) loginRow.append(loginList);
    }
  };
  placeForViewport();

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => {
    nav.querySelectorAll('[aria-expanded="true"]').forEach((t) => {
      if (!t.closest('.nav-panel-categories')) setExpanded(t, false);
    });
    updateState(nav);
  });

  // close on click outside of the open desktop control
  document.addEventListener('click', (e) => {
    if (block.contains(e.target) || !isDesktop.matches) return;
    const open = [...nav.querySelectorAll('.nav-sections .nav-drop > a[aria-expanded="true"], .nav-languages-toggle[aria-expanded="true"], .nav-login-toggle[aria-expanded="true"]')];
    open.forEach((t) => setExpanded(t, false));
    if (open.length) updateState(nav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop > a[aria-expanded="true"], .nav-login-toggle[aria-expanded="true"], .nav-search-toggle[aria-expanded="true"], .nav-hamburger[aria-expanded="true"]');
    if (!open) return;
    setExpanded(open, false);
    if (open === hamburger) resetMenuLevels();
    updateState(nav);
    open.focus();
  });

  // reset open state and re-home shared lists when crossing the breakpoint
  isDesktop.addEventListener('change', () => {
    nav.querySelectorAll('[aria-expanded="true"]').forEach((t) => {
      if (!t.closest('.nav-panel-categories')) setExpanded(t, false);
    });
    resetMenuLevels();
    nav.querySelectorAll('.nav-sections .nav-panel').forEach((panel) => {
      selectCategory(panel, panel.querySelector('.nav-panel-categories > li'));
    });
    placeForViewport();
    updateState(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav, overlay);
  // the login drawer sits above the page overlay, outside the nav stacking context
  if (loginDrawer) navWrapper.append(loginDrawer);
  block.append(navWrapper);

  if (document.cookie.includes('googtrans=/en/')) loadTranslate();
}
