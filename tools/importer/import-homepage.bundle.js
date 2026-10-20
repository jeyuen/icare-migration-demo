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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
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

  // tools/importer/parsers/search-banner.js
  function parse2(element, { document: document2 }) {
    const form = element.matches("form") ? element : element.querySelector("form");
    const input = (form || element).querySelector('input.input-searchbox, input[type="search"], input');
    if (!form && !input) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const action = form && form.getAttribute("action");
    const href = action && action.trim() && action.trim() !== "#" ? action.trim() : "/searchresults";
    const placeholder = input && input.getAttribute("placeholder") && input.getAttribute("placeholder").trim();
    const link = document2.createElement("a");
    link.href = href;
    link.textContent = placeholder || "Search";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(" field:link "));
    frag.appendChild(link);
    const cells = [[frag]];
    if (placeholder) {
      const placeholderFrag = document2.createDocumentFragment();
      placeholderFrag.appendChild(document2.createComment(" field:placeholder "));
      placeholderFrag.appendChild(document2.createTextNode(placeholder));
      cells.push([placeholderFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "search-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-audience.js
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".tab-content")];
    if (!items.length) items = [...element.querySelectorAll(".service-item .link-item > .content, .service-item .content")].filter((el, i, arr) => arr.indexOf(el) === i);
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
  function parse4(element, { document: document2 }) {
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

  // tools/importer/parsers/columns-campaign.js
  function linkedHeading(document2, srcHeading, href) {
    const h = document2.createElement(srcHeading ? srcHeading.tagName.toLowerCase() : "h3");
    const text = srcHeading ? srcHeading.textContent.trim() : "";
    if (href) {
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = text;
      h.appendChild(a);
    } else {
      h.textContent = text;
    }
    return h;
  }
  function parse5(element, { document: document2 }) {
    const primary = element.querySelector(".campaign-primary");
    const introCell = [];
    if (primary) {
      const heading = primary.querySelector("h1, h2, h3, .campaign-primary-heading");
      if (heading) introCell.push(heading);
      primary.querySelectorAll(":scope > p").forEach((p) => introCell.push(p));
      primary.querySelectorAll(":scope > a[href], :scope > .cta").forEach((a) => {
        const p = document2.createElement("p");
        p.appendChild(a);
        introCell.push(p);
      });
    }
    let panels = [...element.querySelectorAll(".campaign-secondary")];
    if (!panels.length) panels = [...element.querySelectorAll("a.cm-image-block-link")];
    const panelCell = [];
    panels.forEach((panel) => {
      const anchor = panel.matches("a") ? panel : panel.closest("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const srcHeading = panel.querySelector("h2, h3, h4, .campaign-secondary-heading");
      const paras = [...panel.querySelectorAll("p")];
      if (!srcHeading && !paras.length) return;
      if (srcHeading) panelCell.push(linkedHeading(document2, srcHeading, href));
      paras.forEach((p) => panelCell.push(p));
    });
    if (!introCell.length && !panelCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[introCell.length ? introCell : "", panelCell.length ? panelCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-campaign", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-story.js
  function textParagraph(document2, srcEl) {
    const p = document2.createElement("p");
    p.textContent = srcEl.textContent.replace(/\s+/g, " ").trim();
    return p;
  }
  function linkParagraph(document2, a) {
    const p = document2.createElement("p");
    const link = document2.createElement("a");
    link.href = a.getAttribute("href");
    link.textContent = a.textContent.replace(/\s+/g, " ").trim();
    if (a.getAttribute("title")) link.title = a.getAttribute("title");
    p.appendChild(link);
    return p;
  }
  function parse6(element, { document: document2 }) {
    element.querySelectorAll("hr").forEach((hr) => hr.remove());
    const feature = element.querySelector(".content-paralympic") || element.querySelector(".sl-item:not(.paralympic-right)");
    const featureCell = [];
    if (feature) {
      const heading = feature.querySelector("h1, h2, h3, .story-title");
      if (heading) featureCell.push(heading);
      const img = feature.querySelector(".parent-left-image img, img.paralympic-left-image, img");
      if (img) featureCell.push(img);
      feature.querySelectorAll(".paralympic-text").forEach((t) => {
        const blocks = [...t.querySelectorAll(":scope > div, :scope > p")];
        (blocks.length ? blocks : [t]).forEach((b) => {
          if (b.textContent.trim()) featureCell.push(textParagraph(document2, b));
        });
      });
      feature.querySelectorAll("a[href]").forEach((a) => {
        if (a.textContent.trim()) featureCell.push(linkParagraph(document2, a));
      });
    }
    const listCell = [];
    element.querySelectorAll(".paralympic-right-section").forEach((section) => {
      const img = section.querySelector("img.paralympic-right-image, img");
      const headline = section.querySelector(".paralympic-headline, h2, h3, h4");
      const textWrap = section.querySelector(".paralympic-multi-text") || section;
      const paras = [...textWrap.querySelectorAll("p")].filter((p) => !p.querySelector("a[href]") && p.textContent.trim());
      const links = [...textWrap.querySelectorAll("a[href]")].filter((a) => a.textContent.trim());
      if (!img && !headline && !paras.length) return;
      if (img) listCell.push(img);
      if (headline && headline.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = headline.textContent.trim();
        listCell.push(h3);
      }
      paras.forEach((p) => listCell.push(p));
      links.forEach((a) => listCell.push(linkParagraph(document2, a)));
    });
    if (!featureCell.length && !listCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[featureCell.length ? featureCell : "", listCell.length ? listCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function getSydneyDate(document2, pageData2, title) {
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
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" });
  }
  function parse7(element, { document: document2, pageData: pageData2 }) {
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
      const body = [];
      const sub = content.querySelector(".subheading");
      if (sub) {
        const category = (((_a = sub.querySelector(".content-type")) == null ? void 0 : _a.textContent) || "").trim();
        const date = getSydneyDate(document2, pageData2, heading ? heading.textContent.trim() : "") || (((_b = sub.querySelector(".subtitle")) == null ? void 0 : _b.textContent) || "").trim();
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

  // tools/importer/parsers/cards-resources.js
  function siblingBefore(el, selector) {
    let prev = el.previousElementSibling;
    while (prev) {
      if (prev.matches(selector)) return prev;
      if (prev.matches("h1, h2, h3, h4, h5, h6")) return null;
      prev = prev.previousElementSibling;
    }
    return null;
  }
  function siblingAfter(el, selector) {
    let next = el.nextElementSibling;
    while (next) {
      if (next.matches(selector)) return next;
      if (next.matches("h1, h2, h3, h4, h5, h6")) return null;
      next = next.nextElementSibling;
    }
    return null;
  }
  var SOURCE_ORIGIN = "https://www.icare.nsw.gov.au";
  var MEDIA_CDN = "https://edge.sitecorecloud.io/insuranceanf0c2-xmcprodf24d-xmprod74a5-5eb4/media/";
  var MEDIA_PATH = /^https?:\/\/(www\.)?icare\.nsw\.gov\.au\/-\/media\//i;
  function absolutizeImage(document2, img) {
    let src = (img.getAttribute("src") || "").trim();
    if (!src || /^data:/i.test(src)) return;
    if (!/^https?:/i.test(src)) {
      let base = SOURCE_ORIGIN;
      try {
        const b = new URL(document2.baseURI || "");
        if (/^https?:$/.test(b.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(b.hostname)) base = b.origin;
      } catch (e) {
      }
      try {
        src = new URL(src.startsWith("/") ? src : `/${src}`, base).href;
      } catch (e) {
      }
    }
    src = src.replace(MEDIA_PATH, MEDIA_CDN);
    if (/\.svg$/i.test(src)) src += "?iar=0";
    img.setAttribute("src", src);
  }
  function parse8(element, { document: document2 }) {
    const cardAnchors = [...element.querySelectorAll("a.icare-resource-card[href]")];
    let titles = [...element.querySelectorAll(".icare-resource-title")];
    if (!titles.length) titles = [...element.querySelectorAll("h3, h2, h4")];
    const cells = [];
    titles.forEach((title, idx) => {
      var _a;
      const iconWrap = siblingBefore(title, ".icare-resource-icon, div");
      const icon = iconWrap ? iconWrap.querySelector("img") : null;
      const body = siblingAfter(title, ".icare-resource-body, p");
      const cta = siblingAfter(title, ".icare-resource-cta, span");
      const anchor = title.closest("a[href]");
      const href = ((_a = cardAnchors.length === titles.length ? cardAnchors[idx] : anchor) == null ? void 0 : _a.getAttribute("href")) || anchor && anchor.getAttribute("href") || "";
      const textEls = [];
      const h = document2.createElement(title.tagName.toLowerCase());
      h.textContent = title.textContent.trim();
      textEls.push(h);
      if (body && body.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = body.textContent.replace(/\s+/g, " ").trim();
        textEls.push(p);
      }
      const ctaText = cta ? ((cta.querySelector("span:not(.icare-resource-cta-icon)") || cta).textContent || "").replace("\u2192", "").trim() : "";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaText || h.textContent;
        p.appendChild(a);
        textEls.push(p);
      }
      let imageCell = "";
      if (icon) {
        absolutizeImage(document2, icon);
        imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(icon);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      textEls.forEach((el) => textCell.appendChild(el));
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-resources", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/list.js
  var SITE_HOSTS = /^(www\.)?icare\.nsw\.gov\.au$/i;
  function toSitePath(href, document2) {
    try {
      const url = new URL(href, "https://www.icare.nsw.gov.au/");
      if (!SITE_HOSTS.test(url.hostname)) return null;
      return `${url.pathname.replace(/\/$/, "") || "/"}${url.search}${url.hash}`;
    } catch (e) {
      return null;
    }
  }
  function parse9(element, { document: document2 }) {
    const links = [...element.querySelectorAll("a[href]")];
    const cells = [];
    links.forEach((source) => {
      const href = source.getAttribute("href");
      if (!href) return;
      const text = source.textContent.replace(/\s+/g, " ").trim();
      const sitePath = toSitePath(href, document2);
      const a = document2.createElement("a");
      if (sitePath) {
        a.href = sitePath;
        a.textContent = sitePath;
      } else {
        a.href = href;
        a.textContent = text || href;
      }
      const cell = document2.createDocumentFragment();
      cell.appendChild(document2.createComment(" field:link "));
      cell.appendChild(a);
      cells.push([cell]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "list", cells });
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
    }
    if (hookName === TransformHook.afterTransform) {
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "search-banner": parse2,
    "cards-audience": parse3,
    "columns-links": parse4,
    "columns-campaign": parse5,
    "columns-story": parse6,
    "cards-news": parse7,
    "cards-resources": parse8,
    "list": parse9
  };
  var PAGE_TEMPLATE = {
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
        "name": "list",
        "instances": [
          ".excat-list-block"
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
        "id": "4b",
        "name": "I want to... dynamic list",
        "selector": [
          ".excat-list-block"
        ],
        "style": null,
        "blocks": [
          "list"
        ],
        "defaultContent": []
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
  var import_homepage_default = {
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
      const iWantTo = document2.querySelector(".cta-long-wrapper");
      if (iWantTo && !document2.querySelector(".excat-list-block")) {
        const holder = document2.createElement("div");
        holder.className = "excat-list-block";
        iWantTo.querySelectorAll(".cta-long-section a[href]").forEach((a) => holder.append(a.cloneNode(true)));
        iWantTo.after(holder);
      }
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
      WebImporter.rules.createMetadata(main, document2);
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
  return __toCommonJS(import_homepage_exports);
})();
