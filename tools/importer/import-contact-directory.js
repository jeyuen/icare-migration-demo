/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import embedIframeParser from './parsers/embed-iframe.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';

// PARSER REGISTRY
const parsers = {
  'embed-iframe': embedIframeParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "contact-directory",
  "description": "Directory-style page with simple content header, rich text intro, grid of icon tile links and an accordion explainer",
  "urls": [
    "https://www.icare.nsw.gov.au/builders-and-homeowners/builders-and-distributors/premiums/premium-calculator"
  ],
  "blocks": [
    {
      "name": "embed-iframe",
      "instances": [
        ".l-main > div.cm-iframe"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Page intro and portal CTA",
      "selector": [
        ".l-main > div.sl"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main > div.sl header.content-header h1",
        ".l-main > div.sl header.content-header p.intro",
        ".l-main > div.sl .cm-rich-text p",
        ".l-main > div.sl .cm-rich-text > a.cta-is-secondary"
      ]
    },
    {
      "id": "2",
      "name": "Premium calculator embed",
      "selector": [
        ".l-main > div.cm-iframe"
      ],
      "style": null,
      "blocks": [
        "embed-iframe"
      ],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "Tags",
      "selector": [
        ".l-main > div.tags"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main > div.tags strong",
        ".l-main > div.tags ul"
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

export default {
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
            document, url, html, params,
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
    if (tags && meta) {
      // Rebuild the metadata block with Tags added
      const metadataBlock = [...main.querySelectorAll(':scope > table')]
        .find((t) => /^metadata$/i.test((t.querySelector('th, td') || {}).textContent?.trim() || ''));
      if (metadataBlock) {
        meta.Tags = tags;
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
