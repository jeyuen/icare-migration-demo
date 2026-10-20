/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsAudienceParser from './parsers/cards-audience.js';
import columnsLinksParser from './parsers/columns-links.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsDownloadsParser from './parsers/cards-downloads.js';
import accordionParser from './parsers/accordion.js';
import columnsParser from './parsers/columns.js';
import tableParser from './parsers/table.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import formulaParser from './parsers/formula.js';

// TRANSFORMER IMPORTS
import icareCleanupTransformer from './transformers/icare-cleanup.js';
import icareSectionsTransformer from './transformers/icare-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards-audience': cardsAudienceParser,
  'columns-links': columnsLinksParser,
  'embed-video': embedVideoParser,
  'cards-downloads': cardsDownloadsParser,
  'accordion': accordionParser,
  'columns': columnsParser,
  'table': tableParser,
  'cards-feature': cardsFeatureParser,
  'formula': formulaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "guide-with-page-nav",
  "urls": [
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages",
    "https://icare.nsw.gov.au/workers-compensation/employers/apprentice-incentive-scheme",
    "https://icare.nsw.gov.au/workers-compensation/employers/classifying-your-workers",
    "https://icare.nsw.gov.au/workers-compensation/employers/forms-and-resources",
    "https://icare.nsw.gov.au/workers-compensation/employers/how-much-will-it-cost",
    "https://icare.nsw.gov.au/workers-compensation/employers/insurance-for-related-businesses",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/cancel-your-workers-insurance-policy",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/download-a-certificate-of-currency",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/faqs-wage-audit-process",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/how-to-access-your-monthly-cost-of-claims-report",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/premium-disputes",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/renew-your-policy",
    "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/update-your-policy-details",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/2026-premium-rate-freeze",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/claims-performance-adjustment-rates",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/how-to-lower-your-premium",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/how-to-pay-your-premium",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/loss-prevention-and-recovery",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/multiple-business-activities-and-wic-classification",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-experience-rated",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/premium-calculation-for-small-employers",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/take-out-a-policy",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/understanding-wics-and-premium-rates",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/understanding-your-cover",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/understanding-your-premium",
    "https://icare.nsw.gov.au/workers-compensation/employers/new-policy/what-is-premium-capping-and-how-does-it-work",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/adssi-limited",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/asbjv",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/ebos-group",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/expert-consultation",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/injury-prevention",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/metcash",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/the-safety-locker",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/training-programs",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/weathertex",
    "https://icare.nsw.gov.au/workers-compensation/employers/understanding-icare-and-workers-compensation",
    "https://icare.nsw.gov.au/workers-compensation/employers/whats-covered",
    "https://icare.nsw.gov.au/workers-compensation/employers/whats-new",
    "https://icare.nsw.gov.au/workers-compensation/employers/who-needs-a-policy",
    "https://icare.nsw.gov.au/workers-compensation/employers/workers-compensation-reform-faqs",
    "https://icare.nsw.gov.au/workers-compensation/employers/your-responsibilities-as-an-employer",
    "https://icare.nsw.gov.au/workers-compensation/employers/prevention-and-education/injury-prevention-resource-hub"
  ],
  "coverageGaps": [],
  "description": "Coloured breadcrumb banner, on-this-page anchor list, quick-link cards, long guide content with video, accordions and related downloads",
  "blocks": [
    {
      "name": "hero",
      "instances": [
        "header.hero-composite-section"
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
      "name": "embed-video",
      "instances": [
        ".cm-video .intrinsic"
      ]
    },
    {
      "name": "cards-downloads",
      "instances": [
        "section.cm-links-downloads > ul"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".l-main section.cm-accordion"
      ]
    },
    {
      "name": "columns",
      "instances": [
        ".grouped-highlight .sl-list"
      ]
    },
    {
      "name": "table",
      "instances": [
        ".l-main .cm-rich-text table"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".l-main > div.sl"
      ]
    },
    {
      "name": "formula",
      "instances": [
        ".l-main .premium-formula-holder"
      ]
    }
  ],
  "representativeUrl": "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages",
  "sections": [
    {
      "id": "1",
      "name": "Page intro banner",
      "selector": [
        "header.hero-composite-section"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "On this page",
      "selector": [
        "nav.on-this-page"
      ],
      "style": "on-this-page",
      "blocks": [],
      "defaultContent": [
        "nav.on-this-page .on-this-page__title",
        "nav.on-this-page .on-this-page__list"
      ]
    },
    {
      "id": "3",
      "name": "Quick links",
      "selector": [
        "section.all-category-home-tile-wrapper:has(~ div.l-layout)",
        "div.l-layout > section.all-category-home-tile-wrapper"
      ],
      "style": "grey",
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": [
        "section.all-category-home-tile-wrapper:has(~ div.l-layout) .home-tile-content-header",
        "div.l-layout > section.all-category-home-tile-wrapper .home-tile-content-header"
      ]
    },
    {
      "id": "4",
      "name": "Guide body",
      "selector": [
        "div.l-layout:not(:has(header.hero-composite-section)):not(:has(> section.all-category-home-tile-wrapper))",
        "div.l-layout > div.l-content-container"
      ],
      "style": "content-column",
      "blocks": [
        "embed-video",
        "cards-downloads",
        "accordion",
        "columns",
        "table",
        "formula"
      ],
      "defaultContent": [
        ".l-main .cm-rich-text",
        ".l-main .cm-video .video-desc",
        ".l-main section.cm-image",
        ".l-main section.cm-links-downloads > h2",
        ".l-main section.cm-links-related"
      ]
    },
    {
      "id": "4a",
      "name": "Calculation example panel",
      "selector": [
        ".l-main section.grouped-highlight"
      ],
      "style": "content-column, panel",
      "blocks": [
        "columns"
      ],
      "defaultContent": [
        ".l-main section.grouped-highlight > h2"
      ]
    },
    {
      "id": "4b",
      "name": "Guide body (after panel)",
      "selector": [
        ".l-main section.grouped-highlight + *",
        ".l-main .cm-rich-text:has(section.grouped-highlight) + *"
      ],
      "style": "content-column",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "5",
      "name": "Getting started links",
      "selector": [
        ".l-main > section.cta-long-wrapper"
      ],
      "style": null,
      "blocks": [
        "columns-links"
      ],
      "defaultContent": [
        ".l-main > section.cta-long-wrapper .col-2:first-child .cta-coloumn-headding h2"
      ]
    },
    {
      "id": "6",
      "name": "In-page quick task tiles",
      "selector": [
        ".l-main > section.all-category-home-tile-wrapper"
      ],
      "style": "grey",
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": [
        ".l-main > section.all-category-home-tile-wrapper .home-tile-content-header"
      ]
    },
    {
      "id": "7",
      "name": "Help and resources",
      "selector": [
        ".l-main > section.all-category-home-tile-wrapper + *"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": [
        ".l-main > h2",
        ".l-main > div.tags"
      ]
    },
    {
      "id": "8",
      "name": "Related content",
      "selector": [
        "div.l-layout ~ section.all-category-home-tile-wrapper"
      ],
      "style": "grey",
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": [
        "div.l-layout ~ section.all-category-home-tile-wrapper .home-tile-content-header"
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
// Breadcrumb labels below Home. The source renders the trail client-side from each ancestor's
// navigation title, and labels differ page to page ("Manage Your Policy" / "Manage your policy").
let breadcrumbLabels = [];

function readBreadcrumb(document) {
  const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
  if (!nav || !nav.querySelector('a')) return [];
  return [...nav.querySelectorAll('a, .breadcrumb-current-text')]
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    .filter((text, i) => !(i === 0 && /^home$/i.test(text)));
}

export default {
  onLoad: async ({ document }) => {
    const data = document.getElementById('__NEXT_DATA__');
    pageData = (data && data.textContent) || '';
    for (let i = 0; i < 40 && !readBreadcrumb(document).length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => { setTimeout(r, 250); });
    }
    breadcrumbLabels = readBreadcrumb(document);
    if (!breadcrumbLabels.length) {
      // fall back to the page's own navigation title (current item only)
      const nav = pageData.match(/"NavigationTitle":\{"value":"([^"]*)"/);
      if (nav && nav[1]) breadcrumbLabels = [JSON.parse(`"${nav[1]}"`)];
    }
  },

  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    // Page tags ("Tagged in") come from og:content-tags - read before cleanup strips <meta>
    const tagsMeta = document.querySelector('meta[property="og:content-tags"], meta[name="og:content-tags"]');
    const tags = (tagsMeta && tagsMeta.content.trim()) || '';
    // only when the intro opens the body (nothing but whitespace before it in its rich text)
    const intro = document.querySelector('.l-main p.intro');
    const hasIntro = !!intro && !intro.previousElementSibling;

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

    // Lead paragraph: the source styles the body's opening <p class="intro"> as a large lead;
    // the guide body section gets the "lead" style, which styles its first paragraph that way.
    if (hasIntro) {
      const bodyMeta = [...main.querySelectorAll('table')].find((t) => {
        const cells = [...t.querySelectorAll('td, th')].map((c) => c.textContent.trim());
        return /^section metadata$/i.test(cells[0] || '') && cells.includes('content-column');
      });
      if (bodyMeta) {
        const cell = [...bodyMeta.querySelectorAll('td')].find((c) => c.textContent.trim() === 'content-column');
        cell.textContent = 'content-column, lead';
      }
    }

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
        if (breadcrumbLabels.length) meta.Breadcrumb = breadcrumbLabels.join(' | ');
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
