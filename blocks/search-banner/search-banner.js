import { decorateIcons } from '../../scripts/aem.js';

const MIN_QUERY_LENGTH = 3;

/**
 * Reads the configured search target from the block's single link cell.
 * A `.json` link is treated as a query index (live results rendered in-block);
 * any other link is treated as a search results page (form submits `?q=`).
 * @param {Element} block
 * @returns {{ source: string, isIndex: boolean, placeholder: string }}
 */
function readConfig(block) {
  const link = block.querySelector('a[href]');
  const href = link?.getAttribute('href') || '';
  const fallback = `${window.hlx?.codeBasePath || ''}/query-index.json`;
  const source = href || fallback;
  // A descriptive link label (not the raw URL) doubles as the input placeholder.
  const linkText = link?.textContent.trim() || '';
  const isUrlLike = !linkText || linkText === href || /^(https?:|\/)/.test(linkText);
  const placeholder = isUrlLike ? 'Search' : linkText;
  let isIndex = false;
  try {
    isIndex = new URL(source, window.location.href).pathname.endsWith('.json');
  } catch {
    isIndex = source.endsWith('.json');
  }
  return { source, isIndex, placeholder };
}

async function fetchIndex(source) {
  try {
    const resp = await fetch(source);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

function filterResults(terms, data) {
  return data
    .map((item) => {
      const haystack = `${item.title || ''} ${item.description || ''} ${item.path || ''}`.toLowerCase();
      const hits = terms.filter((term) => haystack.includes(term)).length;
      return { item, hits };
    })
    .filter(({ hits }) => hits === terms.length)
    .map(({ item }) => item);
}

function renderResults(list, results) {
  list.replaceChildren();
  list.classList.toggle('no-results', results.length === 0);
  if (!results.length) {
    const li = document.createElement('li');
    li.textContent = 'No results found.';
    list.append(li);
    return;
  }
  results.slice(0, 20).forEach((result) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = result.path;
    a.textContent = result.title || result.path;
    li.append(a);
    if (result.description) {
      const p = document.createElement('p');
      p.textContent = result.description;
      li.append(p);
    }
    list.append(li);
  });
}

export default async function decorate(block) {
  const config = readConfig(block);

  const form = document.createElement('form');
  form.className = 'search-banner-form';
  form.setAttribute('role', 'search');

  const inputId = `search-banner-input-${Math.random().toString(36).slice(2, 8)}`;
  const label = document.createElement('label');
  label.className = 'search-banner-label';
  label.htmlFor = inputId;
  label.textContent = config.placeholder;

  const input = document.createElement('input');
  input.type = 'search';
  input.id = inputId;
  input.name = 'q';
  input.className = 'search-banner-input';
  input.placeholder = config.placeholder;
  input.autocomplete = 'off';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'search-banner-button';
  button.setAttribute('aria-label', 'Search');
  const icon = document.createElement('span');
  icon.className = 'icon icon-search';
  button.append(icon);

  const box = document.createElement('div');
  box.className = 'search-banner-box';
  box.append(input, button);
  form.append(label, box);

  const results = document.createElement('ul');
  results.className = 'search-banner-results';
  results.setAttribute('aria-live', 'polite');

  let indexData;
  const runSearch = async () => {
    const value = input.value.trim().toLowerCase();
    if (value.length < MIN_QUERY_LENGTH) {
      results.replaceChildren();
      results.classList.remove('no-results');
      return;
    }
    if (!indexData) indexData = await fetchIndex(config.source);
    const terms = value.split(/\s+/).filter(Boolean);
    renderResults(results, filterResults(terms, indexData));
  };

  if (config.isIndex) {
    input.addEventListener('input', runSearch);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch();
    });
  } else {
    // Results-page mode (e.g. /searchresults): native GET submit as ?q=<term>.
    // Ignore empty submissions so the button doesn't navigate to a blank search.
    form.action = config.source;
    form.method = 'get';
    form.addEventListener('submit', (e) => {
      if (!input.value.trim()) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  input.addEventListener('keyup', (e) => {
    if (e.code === 'Escape') {
      input.value = '';
      results.replaceChildren();
    }
  });

  block.replaceChildren(form);
  if (config.isIndex) block.append(results);

  const { search: queryString } = window.location;
  const q = new URLSearchParams(queryString).get('q');
  if (q) {
    // Reflect the current query back into the field (e.g. when placed on the results page).
    input.value = q;
    if (config.isIndex) runSearch();
  }

  decorateIcons(block);
}
