/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-banner. Base: search. Source: https://www.icare.nsw.gov.au/
 * Instance selector: .banner-search form
 * UE model (blocks/search-banner/_search-banner.json): link (aem-content)
 * Rows: 1) link to the search index (.json) or a search results page.
 *
 * The source is a JS-driven form (form#search-form-submit > .search-input > input + button)
 * with no action attribute and no authorable text. The search target is taken from the
 * form action / input placeholder when present, falling back to the site's /searchresults page.
 * Icons inside the button are decorative and are intentionally not migrated.
 */
export default function parse(element, { document }) {
  const form = element.matches('form') ? element : element.querySelector('form');
  const input = (form || element).querySelector('input.input-searchbox, input[type="search"], input');
  if (!form && !input) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const action = form && form.getAttribute('action');
  const href = action && action.trim() && action.trim() !== '#' ? action.trim() : '/searchresults';
  const placeholder = input && input.getAttribute('placeholder') && input.getAttribute('placeholder').trim();

  const link = document.createElement('a');
  link.href = href;
  link.textContent = placeholder || 'Search';

  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(' field:link '));
  frag.appendChild(link);

  const cells = [[frag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'search-banner', cells });
  element.replaceWith(block);
}
