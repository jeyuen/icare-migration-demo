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

  // tools/importer/import-hero-image-content-with-sidebar.js
  var import_hero_image_content_with_sidebar_exports = {};
  __export(import_hero_image_content_with_sidebar_exports, {
    default: () => import_hero_image_content_with_sidebar_default
  });

  // tools/importer/parsers/hero.js
  function decodeNextImage(url) {
    if (!url || !url.includes("/_next/image")) return url;
    try {
      const original = new URL(url, "https://www.icare.nsw.gov.au/").searchParams.get("url");
      if (!original) return url;
      return original.startsWith("/") ? `https://www.icare.nsw.gov.au${original}` : original;
    } catch (e) {
      return url;
    }
  }
  function normaliseImage(img) {
    const srcset = img.getAttribute("srcset") || "";
    const candidates = srcset.split(",").map((c) => c.trim().split(/\s+/)[0]).filter(Boolean);
    const raw = (img.getAttribute("src") || candidates[candidates.length - 1] || "").replace(/&amp;/g, "&");
    const src = decodeNextImage(raw);
    if (src && src !== raw) {
      img.setAttribute("src", src);
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    }
    return img;
  }
  function parse(element, { document: document2 }) {
    const scope = element.querySelector(":scope > .show-on-full-width") || element;
    const image = scope.querySelector(".image-container img, img.image, img.hero-img, img");
    if (image) normaliseImage(image);
    const content = scope.querySelector(".content-inner") || scope.querySelector(".content") || scope.querySelector(".text-content") || scope;
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

  // tools/importer/parsers/cards-promo.js
  var clean = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll("section.cm-cta-module .content")];
    if (!items.length) items = [...element.querySelectorAll("section.cm-cta-module")];
    if (!items.length) items = [...element.querySelectorAll(":scope > a[href], :scope > section")];
    const cells = [];
    items.forEach((item) => {
      const tile = item.closest("section.cm-cta-module") || item;
      const anchor = item.closest("a[href]") || tile.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const headingSrc = item.querySelector("h2, h3, h4");
      const title = clean(headingSrc && headingSrc.textContent);
      const texts = [...item.querySelectorAll("p")].filter((p) => !p.closest(".faux-link") && clean(p.textContent));
      if (!title && !texts.length && !href) return;
      const cell = document2.createDocumentFragment();
      cell.appendChild(document2.createComment(" field:text "));
      if (title) {
        const h = document2.createElement(headingSrc.tagName.toLowerCase());
        h.textContent = title;
        cell.appendChild(h);
      }
      texts.forEach((p) => cell.appendChild(p));
      if (href) {
        const more = item.querySelector(".faux-link");
        const label = clean(more && more.textContent) || "Read more";
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        p.appendChild(a);
        cell.appendChild(p);
      }
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
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
  var ICON_NAMES = {
    location2: "location",
    location: "location",
    "copy-of-gel-icons-1/magenta": "community-activities"
  };
  function getIconToken(trigger) {
    const img = trigger && trigger.querySelector('img[src*="/icons/"]');
    if (!img) return "";
    const file = (img.getAttribute("src").match(/\/icons\/([a-z0-9/-]+)\.svg/i) || [])[1] || "";
    const name = ICON_NAMES[file.toLowerCase()];
    return name ? `:${name}: ` : "";
  }
  function getSummary(trigger) {
    if (!trigger) return "";
    const clone = trigger.cloneNode(true);
    clone.querySelectorAll('img, picture, svg, .ec, [class*="icon"]').forEach((el) => el.remove());
    const text = clone.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
    return text ? `${getIconToken(trigger)}${text}` : "";
  }
  function parse3(element, { document: document2 }) {
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
    const headings = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => !h.closest("li, .expandcollapse-content, .js-ec") && h.textContent.trim());
    const isExplainer = element.matches(".cm-explainer-module") || !!element.closest(".cm-explainer-module");
    const name = isExplainer ? "accordion (explainer)" : "accordion";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    headings.forEach((h) => element.before(h));
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-downloads.js
  var clean2 = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
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
      // the source pads the day ("Uploaded 01 July 2026")
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Australia/Sydney"
    })}`;
  }
  function buildMeta(typeEl, sydneyUploaded) {
    if (!typeEl) return "";
    const clone = typeEl.cloneNode(true);
    const fileTypeEl = clone.querySelector(".file-type");
    let fileType = fileTypeEl ? clean2(fileTypeEl.textContent).replace(/[()]/g, "").trim() : "";
    if (fileTypeEl) fileTypeEl.remove();
    const uploadedEl = clone.querySelector('.hide-on-mobile, [class*="upload"]');
    const rendered = uploadedEl ? clean2(uploadedEl.textContent).replace(/^\|\s*/, "") : "";
    const uploaded = rendered && sydneyUploaded ? sydneyUploaded : rendered;
    if (uploadedEl) uploadedEl.remove();
    const size = clean2(clone.textContent);
    fileType = fileType ? `(${fileType})` : "";
    const first = [size, fileType].filter(Boolean).join(" ");
    return [first, uploaded].filter(Boolean).join(" | ");
  }
  function parse4(element, { document: document2, pageData: pageData2 }) {
    let items = [...element.querySelectorAll(":scope > li")];
    if (!items.length) items = [...element.querySelectorAll("li")];
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      const titleEl = li.querySelector("strong, b, .link-item-title, h3, h4");
      const typeEl = li.querySelector(".link-item-type");
      const descEl = li.querySelector("p");
      const href = link ? link.getAttribute("href") : "";
      const title = clean2(titleEl ? titleEl.textContent : link && link.textContent);
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
      const desc = clean2(descEl && descEl.textContent);
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

  // tools/importer/parsers/cards-news.js
  function getSydneyDate(document2, pageData2, title, withYear) {
    if (!title) return "";
    const data = document2.getElementById("__NEXT_DATA__");
    const json = data && data.textContent || pageData2 || "";
    const needle = JSON.stringify(title).slice(1, -1);
    const at = json.indexOf(needle);
    if (at < 0) return "";
    const match = json.slice(at, at + 4e3).match(/"authorDate":\{"jsonValue":\{"value":"([^"]+)"/);
    let value = match ? match[1] : "";
    for (let i = at; !value && i >= 0; i = json.indexOf(needle, i + 1)) {
      const near = json.slice(i, i + 600).match(/"AuthorDate":\{(?:"jsonValue":\{)?"value":"([^"]+)"/);
      if (near && !near[1].startsWith("0001")) [, value] = near;
    }
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) return "";
    const format = withYear ? { day: "2-digit", month: "short", year: "numeric", timeZone: "Australia/Sydney" } : { day: "numeric", month: "short", timeZone: "Australia/Sydney" };
    return date.toLocaleDateString("en-AU", format);
  }
  function parse5(element, { document: document2, pageData: pageData2 }) {
    let items = [...element.querySelectorAll(":scope > .sl-item")];
    if (!items.length && element.matches("section.cm-featured-content-module, section.cm")) items = [element];
    if (!items.length) items = [...element.querySelectorAll(".content")].map((c) => c.closest("section, div") || c);
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const content = item.querySelector(".content") || item;
      const anchor = item.querySelector("a.cm-image-block-link[href]") || content.closest("a[href]") || item.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const heading = content.querySelector("h2, h3, h4");
      let bgImg = item.querySelector(".module-background img");
      if (!bgImg) {
        const bgEl = item.querySelector('.module-background, [style*="background-image"]');
        const style = bgEl ? bgEl.getAttribute("style") || "" : "";
        const match = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
        if (match && match[2]) {
          bgImg = document2.createElement("img");
          bgImg.src = match[2].replace(/&amp;/g, "&");
          bgImg.alt = heading ? heading.textContent.trim() : "";
        }
      }
      if (!bgImg) {
        bgImg = item.querySelector(".image img[src]");
        if (bgImg && !bgImg.getAttribute("alt") && bgImg.getAttribute("title")) {
          bgImg.alt = bgImg.getAttribute("title").trim();
        }
      }
      const body = [];
      const sub = content.querySelector(".subheading");
      if (sub) {
        const category = (((_a = sub.querySelector(".content-type")) == null ? void 0 : _a.textContent) || "").trim();
        const shownDate = (((_b = sub.querySelector(".subtitle")) == null ? void 0 : _b.textContent) || "").trim();
        const withYear = /\b\d{4}\b/.test(shownDate);
        const date = getSydneyDate(document2, pageData2, heading ? heading.textContent.trim() : "", withYear) || shownDate;
        if (category || date) {
          const p = document2.createElement("p");
          if (category) {
            const strong = document2.createElement("strong");
            strong.textContent = category;
            p.appendChild(strong);
            if (date) p.appendChild(document2.createTextNode(" "));
          }
          if (date) p.appendChild(document2.createTextNode(date));
          body.push(p);
        }
      }
      if (heading) body.push(heading);
      content.querySelectorAll(":scope > p:not(.subheading)").forEach((p) => {
        if (p.textContent.trim()) body.push(p);
      });
      const more = content.querySelector(".faux-link");
      const moreText = (more ? more.textContent : "").trim() || "Read more";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = moreText;
        p.appendChild(a);
        body.push(p);
      }
      if (!heading && !bgImg) return;
      let imageCell = "";
      if (bgImg) {
        imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(bgImg);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      body.forEach((el) => textCell.appendChild(el));
      cells.push([imageCell, body.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
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
      WebImporter.DOMUtils.remove(element, [".cm-sitewide-message"]);
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
        const hasText = el.textContent.replace(/ /g, " ").trim().length > 0;
        const hasMedia = el.querySelector("img, picture, video, iframe, a");
        if (hasText || hasMedia) return;
        const wrapper = el.parentElement;
        el.remove();
        if (wrapper && wrapper !== element && wrapper.classList.contains("sl-item") && !wrapper.textContent.trim() && !wrapper.children.length) {
          wrapper.remove();
        }
      });
      const ctaKey = (cta) => {
        const a = cta.querySelector("a[href]");
        const h = cta.querySelector("h2, h3, h4");
        return `${a ? a.getAttribute("href") : ""}|${h ? h.textContent.replace(/\s+/g, " ").trim() : ""}`;
      };
      element.querySelectorAll("aside.l-complementary.desktop-only").forEach((aside) => {
        const asideTiles = [...aside.querySelectorAll("section.cm-cta-module")];
        if (!asideTiles.length) return;
        const mobileKeys = /* @__PURE__ */ new Set();
        element.querySelectorAll(".l-main > div.mobile-only section.cm-cta-module").forEach((cta) => mobileKeys.add(ctaKey(cta)));
        if (!mobileKeys.size) return;
        if (asideTiles.every((cta) => mobileKeys.has(ctaKey(cta)))) aside.remove();
      });
      if (element.querySelector("section.cm-campaign-hero-banner")) {
        WebImporter.DOMUtils.remove(element, [".l-main > header.content-header > h1"]);
      }
      element.querySelectorAll(".l-main .cm-rich-text :is(h2, h3, h4), .l-main .ck-content :is(h2, h3, h4)").forEach((h) => {
        const span = h.children.length === 1 ? h.firstElementChild : null;
        if (!span || span.tagName !== "SPAN" || span.textContent.trim() !== h.textContent.trim()) return;
        const style = span.getAttribute("style") || "";
        const size = parseFloat((style.match(/font-size:\s*([\d.]+)px/i) || [])[1]);
        if (!/font-weight:\s*(400|normal)/i.test(style) || !(size <= 18)) return;
        const p = element.ownerDocument.createElement("p");
        p.append(...span.childNodes);
        h.replaceWith(p);
      });
      WebImporter.DOMUtils.remove(element, [
        ".ck-content > style",
        ".cm-rich-text style"
      ]);
      element.querySelectorAll(".l-main > div:not([class]):not([id])").forEach((div) => {
        if (div.querySelector("img, picture, video, iframe, table, a, h1, h2, h3, h4, h5, h6, ul, ol")) return;
        const clone = div.cloneNode(true);
        clone.querySelectorAll("script, style").forEach((s) => s.remove());
        const text = clone.textContent.replace(/ /g, " ").trim();
        if (!text || /^document\.addEventListener\s*\(/.test(text)) div.remove();
      });
      if (element.querySelector(".l-main > header.content-header.has-date")) {
        element.querySelectorAll("div.l-layout > section.cm-hero-image-module").forEach((el) => {
          const hasText = el.textContent.replace(/ /g, " ").trim().length > 0;
          if (!hasText && !el.querySelector("img, picture, video, iframe, a")) el.remove();
        });
        element.querySelectorAll(".l-main > :is(h1, h2, h3, h4, h5, h6)").forEach((h) => {
          const hasText = h.textContent.replace(/ /g, " ").trim().length > 0;
          if (!hasText && !h.querySelector("img, picture")) h.remove();
        });
        element.querySelectorAll(".l-main > header.content-header.has-date > time").forEach((time) => {
          const iso = (time.getAttribute("datetime") || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (iso) {
            const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
            const parts = Object.fromEntries(new Intl.DateTimeFormat("en-AU", {
              timeZone: "UTC",
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric"
            }).formatToParts(date).map((part) => [part.type, part.value]));
            time.textContent = `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
          }
          const p = element.ownerDocument.createElement("p");
          p.append(time.cloneNode(true));
          time.remove();
          const h1 = element.querySelector(".l-main > header.content-header.has-date > h1");
          if (h1) h1.before(p);
          else element.querySelector(".l-main > header.content-header.has-date").prepend(p);
        });
        element.querySelectorAll(".l-main section.cm-image figcaption").forEach((caption) => {
          const text = caption.textContent.replace(/\s+/g, " ").trim();
          if (!text) {
            caption.remove();
            return;
          }
          const p = element.ownerDocument.createElement("p");
          const em = element.ownerDocument.createElement("em");
          em.textContent = text;
          p.append(em);
          caption.replaceWith(p);
        });
        element.querySelectorAll(".l-main q").forEach((q) => {
          q.replaceWith(element.ownerDocument.createTextNode(`\u201C${q.textContent.trim()}\u201D`));
        });
      }
    }
    if (hookName === TransformHook.afterTransform) {
      const unwrapProxy = (value) => {
        try {
          const u = new URL(value, "https://www.icare.nsw.gov.au/");
          if (!/\/_next\/image\/?$/.test(u.pathname)) return value;
          const real = u.searchParams.get("url");
          return real ? new URL(real, "https://www.icare.nsw.gov.au/").href : value;
        } catch (e) {
          return value;
        }
      };
      element.querySelectorAll('img[src*="/_next/image"]').forEach((img) => {
        img.setAttribute("src", unwrapProxy(img.getAttribute("src")));
      });
      element.querySelectorAll('img[srcset*="/_next/image"], source[srcset*="/_next/image"]').forEach((el) => {
        const first = el.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
        el.setAttribute("srcset", unwrapProxy(first));
      });
      element.querySelectorAll(".l-main .cm-rich-text p, .l-main .ck-content p").forEach((p) => {
        if (p.closest("table")) return;
        if (p.querySelector("img, picture, video, iframe, a")) return;
        if (p.textContent.replace(/ /g, " ").trim()) return;
        p.remove();
      });
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
      element.querySelectorAll("div.mobile-only").forEach((el) => {
        const hasText = el.textContent.replace(/ /g, " ").trim().length > 0;
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

  // tools/importer/import-hero-image-content-with-sidebar.js
  var parsers = {
    "hero": parse,
    "cards-promo": parse2,
    "accordion": parse3,
    "cards-downloads": parse4,
    "cards-news": parse5
  };
  var PAGE_TEMPLATE = {
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
  var import_hero_image_content_with_sidebar_default = {
    onLoad: (_0) => __async(null, [_0], function* ({ document: document2 }) {
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
      if (meta) {
        const metadataBlock = [...main.querySelectorAll(":scope > table")].find((t) => {
          var _a;
          return /^metadata$/i.test(((_a = (t.querySelector("th, td") || {}).textContent) == null ? void 0 : _a.trim()) || "");
        });
        if (metadataBlock) {
          if (tags) meta.Tags = tags;
          meta.template = PAGE_TEMPLATE.name;
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
  return __toCommonJS(import_hero_image_content_with_sidebar_exports);
})();
