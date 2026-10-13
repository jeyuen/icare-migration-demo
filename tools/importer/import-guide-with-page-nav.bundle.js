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

  // tools/importer/import-guide-with-page-nav.js
  var import_guide_with_page_nav_exports = {};
  __export(import_guide_with_page_nav_exports, {
    default: () => import_guide_with_page_nav_default
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

  // tools/importer/parsers/embed-video.js
  function resolveUrl(raw, document2) {
    if (!raw) return "";
    try {
      const base = document2.location && document2.location.href || "https://www.icare.nsw.gov.au/";
      return new URL(raw.startsWith("//") ? `https:${raw}` : raw, base).href;
    } catch (e) {
      return raw;
    }
  }
  function toCanonicalVideoUrl(href) {
    try {
      const url = new URL(href);
      const host = url.hostname.replace(/^www\.|^m\./, "");
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        const [, kind, id] = url.pathname.split("/");
        const vid = url.searchParams.get("v") || (["embed", "v", "shorts", "live"].includes(kind) ? id : "");
        if (vid) {
          const start = url.searchParams.get("start") || url.searchParams.get("t");
          return `https://www.youtube.com/watch?v=${vid}${start ? `&t=${parseInt(start, 10) || 0}` : ""}`;
        }
      }
      if (host === "youtu.be") return url.href;
      if (host === "player.vimeo.com") {
        const id = url.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
        if (id) return `https://vimeo.com/${id}`;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }
  function parse4(element, { document: document2 }) {
    var _a;
    const iframe = element.matches("iframe") ? element : element.querySelector("iframe");
    const video = !iframe ? element.querySelector("video") : null;
    const rawSrc = iframe ? ["src", "data-src", "data-lazy-src", "data-original"].map((attr) => (iframe.getAttribute(attr) || "").trim()).find((v) => v && v !== "about:blank" && !v.startsWith("javascript:")) : video && (video.getAttribute("src") || ((_a = video.querySelector("source")) == null ? void 0 : _a.getAttribute("src"))) || "";
    const href = rawSrc ? toCanonicalVideoUrl(resolveUrl(rawSrc, document2)) : "";
    if (!href) {
      if (iframe) iframe.remove();
      element.replaceWith(...element.childNodes);
      return;
    }
    const title = (iframe && (iframe.getAttribute("title") || iframe.getAttribute("aria-label")) || video && video.getAttribute("title") || "").trim();
    const poster = element.querySelector("picture, img");
    const frag = document2.createDocumentFragment();
    if (poster) {
      frag.appendChild(document2.createComment(" field:embed_placeholder "));
      frag.appendChild(poster);
    }
    frag.appendChild(document2.createComment(" field:embed_uri "));
    const linkP = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = href;
    linkP.appendChild(a);
    frag.appendChild(linkP);
    if (title) {
      frag.appendChild(document2.createComment(" field:embed_title "));
      const titleP = document2.createElement("p");
      titleP.textContent = title;
      frag.appendChild(titleP);
    }
    const cells = [[frag]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-downloads.js
  var clean = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function getSydneyUploaded(document2, pageData2, title) {
    if (!title) return "";
    const data = document2.getElementById("__NEXT_DATA__");
    const json = data && data.textContent || pageData2 || "";
    const key = `"Title":{"jsonValue":{"value":${JSON.stringify(title)}}}`;
    const at = json.indexOf(key);
    if (at < 0) return "";
    const match = json.slice(at, at + 2e3).match(/"Updated":\{"jsonValue":\{"value":"([^"]+)"/);
    if (!match) return "";
    const date = new Date(match[1]);
    if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) return "";
    return `Uploaded ${date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Australia/Sydney"
    })}`;
  }
  function buildMeta(typeEl, sydneyUploaded) {
    if (!typeEl) return "";
    const clone = typeEl.cloneNode(true);
    const fileTypeEl = clone.querySelector(".file-type");
    let fileType = fileTypeEl ? clean(fileTypeEl.textContent).replace(/[()]/g, "").trim() : "";
    if (fileTypeEl) fileTypeEl.remove();
    const uploadedEl = clone.querySelector('.hide-on-mobile, [class*="upload"]');
    const rendered = uploadedEl ? clean(uploadedEl.textContent).replace(/^\|\s*/, "") : "";
    const uploaded = rendered && sydneyUploaded ? sydneyUploaded : rendered;
    if (uploadedEl) uploadedEl.remove();
    const size = clean(clone.textContent);
    fileType = fileType ? `(${fileType})` : "";
    const first = [size, fileType].filter(Boolean).join(" ");
    return [first, uploaded].filter(Boolean).join(" | ");
  }
  function parse5(element, { document: document2, pageData: pageData2 }) {
    let items = [...element.querySelectorAll(":scope > li")];
    if (!items.length) items = [...element.querySelectorAll("li")];
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      const titleEl = li.querySelector("strong, b, .link-item-title, h3, h4");
      const typeEl = li.querySelector(".link-item-type");
      const descEl = li.querySelector("p");
      const href = link ? link.getAttribute("href") : "";
      const title = clean(titleEl ? titleEl.textContent : link && link.textContent);
      if (!title && !href) return;
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      const titleP = document2.createElement("p");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = title || href;
        titleP.appendChild(a);
      } else {
        titleP.textContent = title;
      }
      textCell.appendChild(titleP);
      const meta = buildMeta(typeEl, getSydneyUploaded(document2, pageData2, title));
      if (meta) {
        const metaP = document2.createElement("p");
        metaP.textContent = meta;
        textCell.appendChild(metaP);
      }
      const desc = clean(descEl && descEl.textContent);
      if (desc) {
        const descP = document2.createElement("p");
        descP.textContent = desc;
        textCell.appendChild(descP);
      }
      const img = li.querySelector("img");
      let imageCell = "";
      if (img) {
        imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-downloads", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "BLOCKQUOTE", "PRE", "HR", "PICTURE", "FIGURE", "DL"]);
  var isBlank = (node) => node.nodeType === 3 && !node.textContent.replace(/ /g, " ").trim();
  function normalizeContent(root, document2) {
    const out = [];
    let para = null;
    const flush = () => {
      if (para && para.textContent.replace(/ /g, " ").trim()) out.push(para);
      para = null;
    };
    const walk = (parent) => {
      [...parent.childNodes].forEach((node) => {
        if (node.nodeType === 8) return;
        if (node.nodeType === 1 && (node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "ARTICLE")) {
          flush();
          walk(node);
          flush();
          return;
        }
        if (node.nodeType === 1 && BLOCK_TAGS.has(node.tagName)) {
          flush();
          if (node.tagName === "HR" || node.textContent.replace(/ /g, " ").trim() || node.querySelector("img, picture")) {
            out.push(node);
          }
          return;
        }
        if (node.nodeType === 1 && node.tagName === "BR" && !para) return;
        if (isBlank(node) && !para) return;
        if (!para) para = document2.createElement("p");
        para.appendChild(node);
      });
    };
    walk(root);
    flush();
    return out;
  }
  function getSummary(trigger) {
    if (!trigger) return "";
    const clone = trigger.cloneNode(true);
    clone.querySelectorAll('img, picture, svg, .ec, [class*="icon"]').forEach((el) => el.remove());
    return clone.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse6(element, { document: document2 }) {
    let panels = [...element.querySelectorAll(".expandcollapse-content")];
    if (!panels.length) panels = [...element.querySelectorAll('[role="region"], .js-ec')];
    const cells = [];
    panels.forEach((panel) => {
      let trigger = panel.previousElementSibling;
      while (trigger && !trigger.matches('a, button, .accordion-item, [role="button"]')) {
        trigger = trigger.previousElementSibling;
      }
      if (!trigger && panel.id) {
        trigger = element.querySelector(`[aria-controls="${panel.id}"], a[href="#${panel.id}"]`);
      }
      const summaryText = getSummary(trigger);
      const content = normalizeContent(panel, document2);
      if (!summaryText && !content.length) return;
      let summaryCell = "";
      if (summaryText) {
        summaryCell = document2.createDocumentFragment();
        summaryCell.appendChild(document2.createComment(" field:summary "));
        summaryCell.appendChild(document2.createTextNode(summaryText));
      }
      let textCell = "";
      if (content.length) {
        textCell = document2.createDocumentFragment();
        textCell.appendChild(document2.createComment(" field:text "));
        content.forEach((el) => textCell.appendChild(el));
      }
      cells.push([summaryCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "BLOCKQUOTE", "PRE", "HR", "FIGURE", "DL"]);
  var WRAPPER_TAGS = /* @__PURE__ */ new Set(["DIV", "SECTION", "ARTICLE", "SPAN"]);
  var hasText = (n) => n.textContent.replace(/ /g, " ").trim().length > 0;
  function normalizeContent2(root, document2) {
    const out = [];
    let para = null;
    const flush = () => {
      if (para && (hasText(para) || para.querySelector("img, picture"))) out.push(para);
      para = null;
    };
    const pushMedia = (node) => {
      flush();
      const p = document2.createElement("p");
      p.appendChild(node);
      out.push(p);
    };
    const walk = (parent) => {
      [...parent.childNodes].forEach((node) => {
        if (node.nodeType === 8) return;
        if (node.nodeType === 1) {
          if (node.tagName === "IMG" || node.tagName === "PICTURE") {
            pushMedia(node);
            return;
          }
          if (WRAPPER_TAGS.has(node.tagName) && node.querySelector("p, ul, ol, h1, h2, h3, h4, h5, h6, table, img, picture, div")) {
            flush();
            walk(node);
            flush();
            return;
          }
          if (node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "ARTICLE") {
            flush();
            walk(node);
            flush();
            return;
          }
          if (BLOCK_TAGS2.has(node.tagName)) {
            flush();
            if (node.tagName === "P") {
              node.querySelectorAll("img, picture").forEach((m) => {
                const media = m.tagName === "IMG" && m.closest("picture") ? m.closest("picture") : m;
                const p = document2.createElement("p");
                p.appendChild(media);
                out.push(p);
              });
            }
            if (node.tagName === "HR" || hasText(node) || node.querySelector("img, picture")) out.push(node);
            return;
          }
          if (node.tagName === "BR" && !para) return;
        } else if (node.nodeType === 3 && !para && !hasText(node)) {
          return;
        }
        if (!para) para = document2.createElement("p");
        para.appendChild(node);
      });
    };
    walk(root);
    flush();
    return out;
  }
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .sl-item")];
    if (!items.length) items = [...element.children].filter((c) => hasText(c) || c.querySelector("img, picture"));
    const row = items.map((item) => normalizeContent2(item, document2)).filter((content) => content.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table.js
  var MAX_COLS = 8;
  function cleanCell(cell, document2) {
    const frag = document2.createDocumentFragment();
    const clone = cell.cloneNode(true);
    clone.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
    clone.querySelectorAll("colgroup, col, script, style").forEach((el) => el.remove());
    clone.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
    clone.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
    const trimTrailingBr = (el) => {
      let last = el.lastChild;
      while (last && (last.nodeType === 3 && !last.textContent.replace(/ /g, " ").trim() || last.nodeType === 1 && last.tagName === "BR")) {
        const prev = last.previousSibling;
        last.remove();
        last = prev;
      }
    };
    trimTrailingBr(clone);
    clone.querySelectorAll("p, li").forEach(trimTrailingBr);
    [...clone.childNodes].forEach((n) => frag.appendChild(n));
    return frag;
  }
  var isEmptyCell = (cell) => !cell.textContent.replace(/ /g, " ").trim() && !cell.querySelector("img, picture");
  function parse8(element, { document: document2 }) {
    const table = element.matches("table") ? element : element.querySelector("table");
    if (!table) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const rows = [...table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr, :scope > tr")];
    const grid = rows.map((tr) => {
      const out = [];
      [...tr.children].filter((c) => c.matches("th, td")).forEach((c) => {
        out.push(c);
        const span = parseInt(c.getAttribute("colspan") || "1", 10);
        for (let i = 1; i < span; i += 1) out.push(null);
      });
      return out;
    }).filter((r) => r.length && r.some((c) => c && !isEmptyCell(c)));
    if (!grid.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const sourceCols = Math.max(...grid.map((r) => r.length));
    const cols = Math.min(sourceCols, MAX_COLS);
    const filterValue = cols === 1 ? "table" : `table-${cols}-columns`;
    const rowComponent = cols === 1 ? "table-row" : `table-col-${cols}`;
    const cells = [];
    const filterCell = document2.createDocumentFragment();
    filterCell.appendChild(document2.createComment(" field:filter "));
    filterCell.appendChild(document2.createTextNode(filterValue));
    cells.push([filterCell]);
    grid.forEach((r) => {
      const rowCells = [rowComponent];
      for (let i = 0; i < cols; i += 1) {
        const sources = i === cols - 1 ? r.slice(i) : [r[i]];
        const filled = sources.filter((c) => c && !isEmptyCell(c));
        if (!filled.length) {
          const frag = document2.createDocumentFragment();
          frag.appendChild(document2.createComment(` field:column${i + 1}text `));
          const p = document2.createElement("p");
          p.textContent = "\u200B";
          frag.appendChild(p);
          rowCells.push(frag);
        } else {
          const frag = document2.createDocumentFragment();
          frag.appendChild(document2.createComment(` field:column${i + 1}text `));
          filled.forEach((c) => frag.appendChild(cleanCell(c, document2)));
          rowCells.push(frag);
        }
      }
      cells.push(rowCells);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "table", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse9(element, { document: document2 }) {
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
      WebImporter.DOMUtils.remove(element, [
        "#embedded-messaging",
        "#embeddedMessagingSiteContextFrame"
      ]);
      element.querySelectorAll("section.cm-cta-module").forEach((el) => {
        const hasText2 = el.textContent.replace(/ /g, " ").trim().length > 0;
        const hasMedia = el.querySelector("img, picture, video, iframe, a");
        if (hasText2 || hasMedia) return;
        const wrapper = el.parentElement;
        el.remove();
        if (wrapper && wrapper !== element && wrapper.classList.contains("sl-item") && !wrapper.textContent.trim() && !wrapper.children.length) {
          wrapper.remove();
        }
      });
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
        const hasText2 = el.textContent.replace(/ /g, " ").trim().length > 0;
        const hasMedia = el.querySelector("img, picture, video, table, iframe, hr");
        if (!hasText2 && !hasMedia) el.remove();
      });
      element.querySelectorAll("div.mobile-only").forEach((el) => {
        const hasText2 = el.textContent.replace(/ /g, " ").trim().length > 0;
        const hasMedia = el.querySelector("img, picture, video, table, iframe, hr");
        if (!hasText2 && !hasMedia) el.remove();
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
      element.querySelectorAll("a.cta-is-secondary").forEach((a) => {
        if (a.closest("table") || a.closest("em")) return;
        a.removeAttribute("class");
        const em = document.createElement("em");
        a.replaceWith(em);
        em.append(a);
        if (em.parentElement && em.parentElement.tagName !== "P") {
          const p = document.createElement("p");
          em.replaceWith(p);
          p.append(em);
        }
      });
      element.querySelectorAll('a[class="cta"]').forEach((a) => {
        if (a.closest("table") || a.closest("strong, em")) return;
        a.removeAttribute("class");
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
        if (strong.parentElement && strong.parentElement.tagName !== "P") {
          const p = document.createElement("p");
          strong.replaceWith(p);
          p.append(strong);
        }
      });
      WebImporter.DOMUtils.remove(element, [
        "link",
        "noscript",
        "meta"
      ]);
      element.querySelectorAll("iframe").forEach((iframe) => {
        if (!iframe.closest("table")) iframe.remove();
      });
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

  // tools/importer/import-guide-with-page-nav.js
  var parsers = {
    "hero": parse,
    "cards-audience": parse2,
    "columns-links": parse3,
    "embed-video": parse4,
    "cards-downloads": parse5,
    "accordion": parse6,
    "columns": parse7,
    "table": parse8,
    "cards-feature": parse9
  };
  var PAGE_TEMPLATE = {
    "name": "guide-with-page-nav",
    "description": "Coloured breadcrumb banner, on-this-page anchor list, quick-link cards, long guide content with video, accordions and related downloads",
    "urls": [
      "https://icare.nsw.gov.au/workers-compensation/employers/manage-your-policy/declaring-wages",
      "https://icare.nsw.gov.au/archive/wage-declarations",
      "https://icare.nsw.gov.au/employers/employer-obligations/injury-prevention",
      "https://icare.nsw.gov.au/employers/employer-obligations/injury-prevention/education-and-training",
      "https://icare.nsw.gov.au/employers/forms-and-resources",
      "https://icare.nsw.gov.au/employers/premiums/calculating-the-cost-of-your-premium",
      "https://icare.nsw.gov.au/employers/premiums/premium-reviews",
      "https://icare.nsw.gov.au/employers/premiums/premium-updates",
      "https://icare.nsw.gov.au/employers/premiums/ways-to-lower-your-premiums",
      "https://icare.nsw.gov.au/practitioners-and-providers/gps-and-treating-doctors/understanding-workers-compensation/the-nsw-workers-compensation-system",
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
      }
    ],
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
          "div.l-layout:not(:has(header.hero-composite-section))",
          "div.l-layout > div.l-content-container"
        ],
        "style": "content-column",
        "blocks": [
          "embed-video",
          "cards-downloads",
          "accordion",
          "columns",
          "table"
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
  var import_guide_with_page_nav_default = {
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
  return __toCommonJS(import_guide_with_page_nav_exports);
})();
