/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import searchBannerParser from './parsers/search-banner.js';
import cardsAudienceParser from './parsers/cards-audience.js';
import columnsLinksParser from './parsers/columns-links.js';
import columnsCampaignParser from './parsers/columns-campaign.js';
import columnsStoryParser from './parsers/columns-story.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsResourcesParser from './parsers/cards-resources.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'search-banner': searchBannerParser,
  'cards-audience': cardsAudienceParser,
  'columns-links': columnsLinksParser,
  'columns-campaign': columnsCampaignParser,
  'columns-story': columnsStoryParser,
  'cards-news': cardsNewsParser,
  'cards-resources': cardsResourcesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "homepage",
  "description": "Landing page with full-width hero banner, image-led feature section and tabbed audience content with links and lists",
  "urls": [
    "https://www.icare.nsw.gov.au/"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".hero-banner-container .homepage-hero-banner"
      ]
    },
    {
      "name": "search-banner",
      "instances": [
        ".banner-search form"
      ]
    },
    {
      "name": "cards-audience",
      "instances": [
        ".all-category-home-tile-wrapper .home-tile-wrapper"
      ]
    },
    {
      "name": "columns-links",
      "instances": [
        ".cta-long-wrapper .cta-long-section"
      ]
    },
    {
      "name": "columns-campaign",
      "instances": [
        "section.cm-campaign-module"
      ]
    },
    {
      "name": "columns-story",
      "instances": [
        ".cm-story-module > .sl"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        ".sl-list.has-feature-left"
      ]
    },
    {
      "name": "cards-resources",
      "instances": [
        ".icare-resources .icare-resources-grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Hero banner",
      "selector": [
        ".hero-banner-container"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Search banner",
      "selector": [
        ".banner-search"
      ],
      "style": null,
      "blocks": [
        "search-banner"
      ],
      "defaultContent": [
        ".banner-search .search-box-headding"
      ]
    },
    {
      "id": "3",
      "name": "Audience tiles",
      "selector": [
        ".all-category-home-tile-wrapper"
      ],
      "style": null,
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": []
    },
    {
      "id": "4",
      "name": "I want to... quick links",
      "selector": [
        ".cta-long-wrapper"
      ],
      "style": null,
      "blocks": [
        "columns-links"
      ],
      "defaultContent": [
        ".cta-long-wrapper .col-2:first-child .cta-coloumn-headding h2"
      ]
    },
    {
      "id": "5",
      "name": "Feedback and complaints",
      "selector": [
        ".l-main > section.breakout-area"
      ],
      "style": "grey",
      "blocks": [
        "columns-campaign"
      ],
      "defaultContent": []
    },
    {
      "id": "6",
      "name": "Safety Speakers Program feature",
      "selector": [
        ".cm-story-module"
      ],
      "style": null,
      "blocks": [
        "columns-story"
      ],
      "defaultContent": []
    },
    {
      "id": "7",
      "name": "News and stories",
      "selector": [
        "section.content-hero.has-alt-bg:has(.sl-list.has-feature-left)",
        ".l-layout > section.content-hero.has-alt-bg:nth-of-type(3)"
      ],
      "style": "grey",
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "section.content-hero.has-alt-bg:has(.has-feature-left) > .l-padding > h2",
        "section.content-hero.has-alt-bg:has(.has-feature-left) > .l-padding > a.cta.is-secondary"
      ]
    },
    {
      "id": "8",
      "name": "Resources and Acknowledgement",
      "selector": [
        "section.content-hero.has-alt-bg:has(.icare-resources)",
        ".l-layout > section.content-hero.has-alt-bg:nth-of-type(4)"
      ],
      "style": "grey",
      "blocks": [
        "cards-resources"
      ],
      "defaultContent": [
        ".icare-resources .icare-section-title",
        ".icare-resources ~ h3",
        ".icare-resources ~ p"
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
    WebImporter.rules.createMetadata(main, document);
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
