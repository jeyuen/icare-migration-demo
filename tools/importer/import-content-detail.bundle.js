/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-content-detail.js
  var import_content_detail_exports = {};
  __export(import_content_detail_exports, {
    default: () => import_content_detail_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const scope = element.querySelector(":scope > .show-on-full-width") || element;
    const image = scope.querySelector(".image-container img, img.image, img");
    const content = scope.querySelector(".content-inner") || scope.querySelector(".content") || scope;
    const heading = content.querySelector("h1, h2, .hero-banner-heading, .hero-composite-title");
    const paragraphs = [...content.querySelectorAll(":scope > p")];
    const ctas = [...content.querySelectorAll("a")].filter((a) => !paragraphs.some((p) => p.contains(a)));
    if (!image && !heading && !paragraphs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imgFrag = document2.createDocumentFragment();
      imgFrag.appendChild(document2.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textEls = [];
    if (heading) textEls.push(heading);
    textEls.push(...paragraphs);
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.appendChild(a);
      textEls.push(p);
    });
    if (textEls.length) {
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      textEls.forEach((el) => textFrag.appendChild(el));
      cells.push([textFrag]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-audience.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".tab-content")];
    if (!items.length) items = [...element.querySelectorAll(":scope > a.cm-home-tile, :scope > a")];
    const cells = [];
    items.forEach((item) => {
      const anchor = item.closest("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const icon = [...item.querySelectorAll("img")].find((img) => !img.closest(".home-tile-link"));
      const headingSrc = item.querySelector("h2, h3, h4, .tile-headding");
      const title = (headingSrc ? headingSrc.textContent : anchor && anchor.getAttribute("title") || "").trim();
      if (!icon && !title) return;
      const imageCell = document2.createDocumentFragment();
      if (icon) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(icon);
      }
      const textCell = document2.createDocumentFragment();
      if (title) {
        const heading = document2.createElement(headingSrc ? headingSrc.tagName.toLowerCase() : "h2");
        if (href) {
          const link = document2.createElement("a");
          link.href = href;
          link.textContent = title;
          heading.appendChild(link);
        } else {
          heading.textContent = title;
        }
        textCell.appendChild(document2.createComment(" field:text "));
        textCell.appendChild(heading);
      }
      cells.push([icon ? imageCell : "", title ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-audience", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-links.js
  function parse3(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .col-2")];
    if (!columns.length) columns = [...element.querySelectorAll(":scope > div")];
    const headings = [];
    const row = [];
    columns.forEach((col) => {
      col.querySelectorAll(".cta-coloumn-headding h2, .cta-coloumn-headding h3, :scope > h2").forEach((h) => {
        if (h.textContent.trim()) headings.push(h);
      });
      let labels = [...col.querySelectorAll(".cta-content-headding")];
      if (!labels.length) labels = [...col.querySelectorAll("a.cta-long, a[href]")];
      const list = document2.createElement("ul");
      labels.forEach((label) => {
        const anchor = label.matches("a") ? label : label.closest("a[href]");
        const textEl = label.querySelector(".tile-headding") || label;
        const text = textEl.textContent.trim();
        if (!text) return;
        const li = document2.createElement("li");
        if (anchor && anchor.getAttribute("href")) {
          const a = document2.createElement("a");
          a.href = anchor.getAttribute("href");
          a.textContent = text;
          li.appendChild(a);
        } else {
          li.textContent = text;
        }
        list.appendChild(li);
      });
      row.push(list.children.length ? list : "");
    });
    if (!row.some((c) => c)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-links", cells });
    headings.forEach((h) => element.before(h));
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".sl-item")];
    if (!items.length) items = [...element.querySelectorAll(".cm-content-tile, .cm-image-block-link:not(a)")];
    if (!items.length) items = [...element.querySelectorAll("a[href]")];
    const cells = [];
    items.forEach((item) => {
      const anchor = item.matches("a[href]") ? item : item.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const img = item.querySelector(".image img, img");
      const headingSrc = item.querySelector("h1, h2, h3, h4, h5, h6");
      const descSrc = item.querySelector(".content-tile");
      const ctaSrc = item.querySelector(".faux-link");
      const title = headingSrc ? headingSrc.textContent.trim() : "";
      const desc = descSrc ? descSrc.textContent.replace(/\s+/g, " ").trim() : "";
      const ctaLabel = ctaSrc && ctaSrc.textContent.trim() || anchor && anchor.getAttribute("title") || title;
      if (!img && !title && !desc) return;
      let imageCell = "";
      if (img) {
        if (!img.getAttribute("alt")) img.setAttribute("alt", img.getAttribute("title") || title || "");
        imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textEls = [];
      if (title) {
        const h = document2.createElement(headingSrc.tagName.toLowerCase());
        h.textContent = title;
        textEls.push(h);
      }
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        textEls.push(p);
      }
      if (href && ctaLabel) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaLabel;
        p.appendChild(a);
        textEls.push(p);
      }
      let textCell = "";
      if (textEls.length) {
        textCell = document2.createDocumentFragment();
        textCell.appendChild(document2.createComment(" field:text "));
        textEls.forEach((el) => textCell.appendChild(el));
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/icare-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".feedback-overlay",
        "#main-feedback"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".homepage-hero-banner > .show-on-mobile"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".modal-container.js-modal-container",
        ".modal-bg",
        ".shade-bg"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#readspeaker_button1",
        ".rsbtn"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["ul.accessibility-links"]);
      WebImporter.DOMUtils.remove(element, [
        "header.global-header",
        "#global-search",
        ".offscreen-container.primary-offscreen-container",
        "#nav-offscreen",
        "nav.mobile-toolbar"
      ]);
      WebImporter.DOMUtils.remove(element, ["footer.global-footer"]);
      WebImporter.DOMUtils.remove(element, ["nav.breadcrumbs"]);
      element.querySelectorAll(".cm-rich-text").forEach((el) => {
        const hasText = el.textContent.replace(/ /g, " ").trim().length > 0;
        const hasMedia = el.querySelector("img, picture, video, table, iframe, hr");
        if (!hasText && !hasMedia) el.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        ".skiptranslate",
        "#google_translate_element",
        "#goog-gt-tt",
        ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf"
      ]);
      element.querySelectorAll('iframe[title^="recaptcha challenge"]').forEach((iframe) => {
        const wrapper = iframe.parentElement && iframe.parentElement.parentElement;
        if (wrapper && wrapper !== element && wrapper.tagName === "DIV" && !wrapper.className && !wrapper.id) {
          wrapper.remove();
        } else {
          iframe.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        "#invisible-recaptcha",
        ".grecaptcha-badge"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "next-route-announcer",
        "byoc-registration"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "link",
        "iframe",
        "noscript",
        "meta"
      ]);
    }
  }

  // tools/importer/transformers/icare-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-content-detail.js
  var parsers = {
    "hero": parse,
    "cards-audience": parse2,
    "columns-links": parse3,
    "cards-feature": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "content-detail",
    "description": "Detail page with breadcrumbs, composite hero header, on-this-page anchor navigation and long-form rich text sections with call-to-action panels",
    "urls": [
      "https://www.icare.nsw.gov.au/builders-and-homeowners/builders-and-distributors"
    ],
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
        "name": "cards-feature",
        "instances": [
          ".l-main > div.sl"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Page hero",
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
        "name": "I want to (quick task tiles)",
        "selector": [
          ".l-one-column > section.all-category-home-tile-wrapper"
        ],
        "style": "grey",
        "blocks": [
          "cards-audience"
        ],
        "defaultContent": [
          ".l-one-column > section.all-category-home-tile-wrapper .home-tile-content-header"
        ]
      },
      {
        "id": "3",
        "name": "Getting started with (link rows)",
        "selector": [
          ".l-main > section.cta-long-wrapper"
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
        "id": "4",
        "name": "Already with icare (quick task tiles)",
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
        "id": "5",
        "name": "Help and Resources",
        "selector": [
          ".l-main > h2"
        ],
        "style": null,
        "blocks": [
          "cards-feature"
        ],
        "defaultContent": [
          ".l-main > h2",
          ".l-main > div.tags"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var pageData = "";
  var import_content_detail_default = {
    onLoad: (_0) => __async(void 0, [_0], function* ({ document: document2 }) {
      const data = document2.getElementById("__NEXT_DATA__");
      pageData = data && data.textContent || "";
    }),
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      const tagsMeta = document2.querySelector('meta[property="og:content-tags"], meta[name="og:content-tags"]');
      const tags = tagsMeta && tagsMeta.content.trim() || "";
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, {
              document: document2,
              url,
              html,
              params,
              pageData
            });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.rules.createMetadata(main, document2);
      if (tags && meta) {
        const metadataBlock = [...main.querySelectorAll(":scope > table")].find((t) => {
          var _a;
          return /^metadata$/i.test(((_a = (t.querySelector("th, td") || {}).textContent) == null ? void 0 : _a.trim()) || "");
        });
        if (metadataBlock) {
          meta.Tags = tags;
          metadataBlock.replaceWith(WebImporter.Blocks.getMetadataBlock(document2, meta));
        }
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_content_detail_exports);
})();
