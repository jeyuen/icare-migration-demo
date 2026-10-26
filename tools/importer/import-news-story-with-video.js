/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsPromoParser from './parsers/cards-promo.js';
import columnsParser from './parsers/columns.js';
import quoteBorderedParser from './parsers/quote-bordered.js';
import quotePullParser from './parsers/quote-pull.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsNewsParser from './parsers/cards-news.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';


// PARSER REGISTRY
const parsers = {
  'cards-promo': cardsPromoParser,
  'columns': columnsParser,
  'quote-bordered': quoteBorderedParser,
  'quote-pull': quotePullParser,
  'embed-video': embedVideoParser,
  'cards-news': cardsNewsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "news-story-with-video",
  "urls": [
    "https://icare.nsw.gov.au/news-and-stories/2024/adaptive-sports-helps-jarrod-reimagine-whats-possible",
    "https://icare.nsw.gov.au/news-and-stories/2024/annabelle-shares-her-passion-for-adaptive-sports",
    "https://icare.nsw.gov.au/news-and-stories/2024/reimagining-your-life",
    "https://icare.nsw.gov.au/news-and-stories/2024/shine-magazine-summer-2024-edition-is-out-now",
    "https://icare.nsw.gov.au/news-and-stories/2025/icare-safeguards-nsw-workers-with-new-lung-health-mobile-clinic"
  ],
  "coverageGaps": [],
  "description": "News story article: date, title and intro, lead image, rich text with pull and bordered quotes, image pairs and embedded video, sidebar CTA tile, tags, then a grey Related content band",
  "blocks": [
    {
      "name": "cards-promo",
      "instances": [
        ".l-main > div.mobile-only:has(section.cm-cta-module)"
      ]
    },
    {
      "name": "columns",
      "instances": [
        ".l-main div.sl > .sl-list:has(> .sl-item > section.cm-image)"
      ]
    },
    {
      "name": "quote-bordered",
      "instances": [
        ".l-main .ck-content blockquote"
      ]
    },
    {
      "name": "quote-pull",
      "instances": [
        ".l-main .cm-rich-text > div > blockquote"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        ".l-main .cm-video .intrinsic"
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
      "name": "Article content column",
      "selector": [
        "div.l-layout > div.l-content-container"
      ],
      "style": "content-column",
      "blocks": [
        "cards-promo",
        "columns",
        "quote-bordered",
        "quote-pull",
        "embed-video"
      ],
      "defaultContent": [
        ".l-main > header.content-header",
        ".l-main section.cm-image",
        ".l-main .cm-rich-text",
        ".l-main .cm-video .video-desc",
        ".l-main > div.tags"
      ]
    },
    {
      "id": "2",
      "name": "Related content",
      "selector": [
        "div.l-layout + div:has(> section.content-hero)",
        "div.l-layout ~ div:has(section.content-hero)"
      ],
      "style": "grey",
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "div.l-layout ~ div section.content-hero h2"
      ]
    }
  ],
  "representativeUrl": "https://www.icare.nsw.gov.au/news-and-stories/2025/icare-safeguards-nsw-workers-with-new-lung-health-mobile-clinic"
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
// importer strips scripts. Parsers use it for values the page renders client-side
// (cards-news re-derives card dates in Australia/Sydney from it).
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
