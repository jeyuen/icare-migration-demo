/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsPromoParser from './parsers/cards-promo.js';
import accordionParser from './parsers/accordion.js';
import cardsDownloadsParser from './parsers/cards-downloads.js';
import cardsNewsParser from './parsers/cards-news.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards-promo': cardsPromoParser,
  'accordion': accordionParser,
  'cards-downloads': cardsDownloadsParser,
  'cards-news': cardsNewsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "hero-image-content-with-sidebar",
  "description": "Full-width image banner, long rich text body with sidebar promo cards, document download list and related-content cards",
  "urls": [
    "https://icare.nsw.gov.au/about-us/our-story",
    "https://icare.nsw.gov.au/about-us/test-story",
    "https://icare.nsw.gov.au/employers/employer-obligations/notify-us-of-an-injury-or-make-a-claim",
    "https://icare.nsw.gov.au/employers/employer-obligations/payments-to-injured-workers",
    "https://icare.nsw.gov.au/employers/make-a-claim/notify-us-of-an-injury-or-make-a-claim",
    "https://icare.nsw.gov.au/employers/make-a-claim/payments/payments-for-your-employees",
    "https://icare.nsw.gov.au/government-agencies/our-funds-and-schemes/treasury-managed-fund",
    "https://icare.nsw.gov.au/injured-or-ill-people/work-related-dust-disease/guidelines-and-policies",
    "https://icare.nsw.gov.au/injured-or-ill-people/work-related-dust-disease/payments/for-workers",
    "https://icare.nsw.gov.au/injured-or-ill-people/work-related-dust-disease/reviews",
    "https://icare.nsw.gov.au/practitioners-and-providers/training-and-workshops",
    "https://icare.nsw.gov.au/workers-insurance-claims",
    "https://icare.nsw.gov.au/workers-insurance-claims/notify-us-of-an-injury-or-make-a-claim"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        "section.cm-hero-image-module"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        ".l-main > div.mobile-only:has(section.cm-cta-module)"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".l-main > section.cm-accordion"
      ]
    },
    {
      "name": "cards-downloads",
      "instances": [
        "section.cm-links-downloads > ul"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "div.l-layout ~ div section.content-hero .sl-list"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Image banner",
      "selector": [
        "section.cm-hero-image-module"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Main content column with right sidebar",
      "selector": [
        "div.l-layout > div.l-content-container"
      ],
      "style": "content-column",
      "blocks": [
        "cards-promo",
        "accordion",
        "cards-downloads"
      ],
      "defaultContent": [
        ".l-main > header.content-header",
        ".l-main > div.cm-rich-text",
        "section.cm-links-downloads > h2",
        ".l-main > div.tags"
      ]
    },
    {
      "id": "3",
      "name": "Related content",
      "selector": [
        "div.l-layout + div:has(> section.content-hero)"
      ],
      "style": "grey",
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "div.l-layout ~ div section.content-hero .l-padding > h2"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  icareCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [icareSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// Next.js page data (__NEXT_DATA__) captured from the live DOM in onLoad, before the
// importer strips scripts. Parsers use it for values the page renders client-side.
let pageData = '';

export default {
  onLoad: async ({ document }) => {
    const data = document.getElementById('__NEXT_DATA__');
    pageData = (data && data.textContent) || '';
  },

  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    // Page tags ("Tagged in") come from og:content-tags - read before cleanup strips <meta>
    const tagsMeta = document.querySelector('meta[property="og:content-tags"], meta[name="og:content-tags"]');
    const tags = (tagsMeta && tagsMeta.content.trim()) || '';

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, {
            document, url, html, params, pageData,
          });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    const meta = WebImporter.rules.createMetadata(main, document);
    if (meta) {
      // Rebuild the metadata block with Tags and Template (body class for template-scoped styles)
      const metadataBlock = [...main.querySelectorAll(':scope > table')]
        .find((t) => /^metadata$/i.test((t.querySelector('th, td') || {}).textContent?.trim() || ''));
      if (metadataBlock) {
        if (tags) meta.Tags = tags;
        meta.Template = PAGE_TEMPLATE.name;
        metadataBlock.replaceWith(WebImporter.Blocks.getMetadataBlock(document, meta));
      }
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path - root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
