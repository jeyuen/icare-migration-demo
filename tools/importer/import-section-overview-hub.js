/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsAudienceParser from './parsers/cards-audience.js';
import cardsNewsParser from './parsers/cards-news.js';
import embedVideoParser from './parsers/embed-video.js';
import columnsVideoParser from './parsers/columns-video.js';
import columnsPanelsParser from './parsers/columns-panels.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards-audience': cardsAudienceParser,
  'cards-news': cardsNewsParser,
  'embed-video': embedVideoParser,
  'columns-video': columnsVideoParser,
  'columns-panels': columnsPanelsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "section-overview-hub",
  "description": "Section hub with image hero banner, intro with related-links sidebar, feature card and stacked topic rows each paired with a side promo card",
  "urls": [
    "https://icare.nsw.gov.au/about-us",
    "https://icare.nsw.gov.au/about-us/improvement-at-icare",
    "https://icare.nsw.gov.au/crisis-support",
    "https://icare.nsw.gov.au/employers/industry-and-partners/broker-hub",
    "https://icare.nsw.gov.au/employers/industry-and-partners/small-business-hub",
    "https://icare.nsw.gov.au/employers/manage-your-policy/whats-new-in-policy",
    "https://icare.nsw.gov.au/employers/understanding-workers-insurance",
    "https://icare.nsw.gov.au/government-agencies/risk-education-express",
    "https://icare.nsw.gov.au/injured-or-ill-people/motor-accident-injuries/shine-magazine",
    "https://icare.nsw.gov.au/mental-health-claims-hub/employers",
    "https://icare.nsw.gov.au/practitioners-and-providers/allied-health-e-newsletter-form",
    "https://icare.nsw.gov.au/practitioners-and-providers/invoicing-and-payment/digital-invoicing",
    "https://icare.nsw.gov.au/social-connections-toolkit"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        "section.cm-campaign-hero-banner"
      ]
    },
    {
      "name": "cards-audience",
      "instances": [
        ".l-main .broker-hub-quicklinks .service-Block"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        ".l-main > section.cm-featured-content-module"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        ".l-main > section.cm-video .intrinsic"
      ]
    },
    {
      "name": "columns-video",
      "instances": [
        ".l-main .content-hero .l-padding > div.sl"
      ]
    },
    {
      "name": "columns-panels",
      "instances": [
        ".l-main > div.sl"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Campaign hero banner",
      "selector": [
        "section.cm-campaign-hero-banner"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Intro",
      "selector": [
        ".l-main > header.content-header"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main > header.content-header",
        ".l-main > div.cm-rich-text:first-of-type .ck-content > p",
        ".l-main > div.cm-rich-text:first-of-type .ck-content > ul"
      ]
    },
    {
      "id": "3",
      "name": "Survey callout panel",
      "selector": [
        ".l-main > div.cm-rich-text section.grouped-highlight"
      ],
      "style": "highlight",
      "blocks": [],
      "defaultContent": [
        ".l-main > div.cm-rich-text section.grouped-highlight"
      ]
    },
    {
      "id": "4",
      "name": "Quick links",
      "selector": [
        ".l-main > div.cm-rich-text section.grouped-highlight + h2",
        ".l-main .ck-content > h2.scroll-to-broker-quicklink"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main .ck-content > h2.scroll-to-broker-quicklink",
        ".l-main .ck-content > h2.scroll-to-broker-quicklink + p"
      ]
    },
    {
      "id": "5",
      "name": "Manage your premium",
      "selector": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(1)"
      ],
      "style": "grey",
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(1) .broker-hub-quicklinks > h3"
      ]
    },
    {
      "id": "6",
      "name": "What is included in my premium?",
      "selector": [
        ".l-main > h2:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main > h2:nth-of-type(1)",
        ".l-main > h2:nth-of-type(1) + div.cm-rich-text"
      ]
    },
    {
      "id": "7",
      "name": "Safety and prevention",
      "selector": [
        ".l-main > h2:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        ".l-main > h2:nth-of-type(2)",
        ".l-main > h2:nth-of-type(2) + div.cm-rich-text"
      ]
    },
    {
      "id": "8",
      "name": "Safety tiles, Make a claim, Claims resources",
      "selector": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(3)"
      ],
      "style": "grey",
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(3) .cm-rich-text",
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(3) .broker-hub-quicklinks > h3"
      ]
    },
    {
      "id": "9",
      "name": "Video - The first few weeks of a worker's claim",
      "selector": [
        ".l-main > section.cm-video"
      ],
      "style": null,
      "blocks": [
        "embed-video"
      ],
      "defaultContent": [
        ".l-main > section.cm-video .video-desc"
      ]
    },
    {
      "id": "10",
      "name": "Education and events + For new employers",
      "selector": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(5)"
      ],
      "style": "grey",
      "blocks": [
        "columns-video",
        "cards-audience"
      ],
      "defaultContent": [
        ".l-main > section.content-hero.has-alt-bg:nth-of-type(5) .cm-rich-text"
      ]
    },
    {
      "id": "11",
      "name": "Contact us",
      "selector": [
        ".l-main > h2:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "columns-panels"
      ],
      "defaultContent": [
        ".l-main > h2:nth-of-type(3)",
        ".l-main > h2:nth-of-type(3) + div.cm-rich-text"
      ]
    },
    {
      "id": "12",
      "name": "Tags",
      "selector": [
        ".l-main > div.tags"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".l-main > div.tags"
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
