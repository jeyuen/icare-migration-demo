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

  // tools/importer/import-section-overview-hub.js
  var import_section_overview_hub_exports = {};
  __export(import_section_overview_hub_exports, {
    default: () => import_section_overview_hub_default
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

  // tools/importer/parsers/cards-audience.js
  function parse2(element, { document: document2 }) {
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
  function parse3(element, { document: document2, pageData: pageData2 }) {
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

  // tools/importer/parsers/columns-video.js
  var clean = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  var BLOCK_TAGS = /* @__PURE__ */ new Set([
    "P",
    "DIV",
    "SECTION",
    "HEADER",
    "FOOTER",
    "ARTICLE",
    "ASIDE",
    "FIGURE",
    "FIGCAPTION",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "UL",
    "OL",
    "TABLE",
    "BLOCKQUOTE",
    "HR",
    "IMG",
    "PICTURE",
    "IFRAME",
    "VIDEO",
    "FORM",
    "NAV"
  ]);
  var BLOCK_SELECTOR = "p, div, section, header, figure, h1, h2, h3, h4, h5, h6, ul, ol, table, img, picture, iframe, hr, .faux-link";
  var DECORATIVE = ".related-links-arrow, .icon, .redirectImg, script, style, noscript, button";
  function decodeNextImage2(url) {
    if (!url || !url.includes("/_next/image")) return url;
    try {
      const original = new URL(url, "https://www.icare.nsw.gov.au/").searchParams.get("url");
      if (!original) return url;
      return original.startsWith("/") ? `https://www.icare.nsw.gov.au${original}` : original;
    } catch (e) {
      return url;
    }
  }
  function makeImage(document2, src, alt) {
    const img = document2.createElement("img");
    img.src = decodeNextImage2(src.replace(/&amp;/g, "&"));
    img.alt = alt || "";
    return img;
  }
  function imageFrom(document2, img) {
    const srcset = img.getAttribute("srcset") || "";
    const last = srcset.split(",").map((c) => c.trim().split(/\s+/)[0]).filter(Boolean).pop();
    const src = img.getAttribute("src") || img.getAttribute("data-src") || last || "";
    if (!src || src.startsWith("data:")) return null;
    return makeImage(document2, src, img.getAttribute("alt"));
  }
  function backgroundImage(document2, el) {
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    return m && m[2] ? makeImage(document2, m[2], "") : null;
  }
  function toCanonicalVideoUrl2(raw) {
    if (!raw) return "";
    try {
      const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw, "https://www.icare.nsw.gov.au/");
      const host = url.hostname.replace(/^www\.|^m\./, "");
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        const [, kind, id] = url.pathname.split("/");
        const vid = url.searchParams.get("v") || (["embed", "v", "shorts", "live"].includes(kind) ? id : "");
        if (vid) {
          const start = url.searchParams.get("start") || url.searchParams.get("t");
          return `https://www.youtube.com/watch?v=${vid}${start ? `&t=${parseInt(start, 10) || 0}` : ""}`;
        }
      }
      if (host === "player.vimeo.com") {
        const id = url.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
        if (id) return `https://vimeo.com/${id}`;
      }
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function linkParagraph(document2, href, text, title) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = text;
    if (title) a.title = title;
    p.appendChild(a);
    return p;
  }
  var isBlockish = (el) => BLOCK_TAGS.has(el.tagName) || el.classList.contains("faux-link") || /background-image/i.test(el.getAttribute("style") || "") || !!el.querySelector(BLOCK_SELECTOR);
  function normalizeCell(root, document2) {
    root.querySelectorAll(DECORATIVE).forEach((el) => el.remove());
    root.querySelectorAll(".vh").forEach((vh) => {
      const parent = vh.parentElement;
      if (parent && clean(parent.textContent) !== clean(vh.textContent)) vh.remove();
    });
    const out = [];
    let para = null;
    const flush = () => {
      if (para && (clean(para.textContent) || para.querySelector("img"))) out.push(para);
      para = null;
    };
    const push = (el) => {
      flush();
      if (el) out.push(el);
    };
    const buildList = (list) => {
      const ul = document2.createElement(list.tagName.toLowerCase());
      [...list.children].filter((li) => li.tagName === "LI").forEach((li) => {
        const text = clean(li.textContent);
        if (!text) return;
        const item = document2.createElement("li");
        const links = [...li.querySelectorAll("a[href]")].filter((a) => a.getAttribute("href") && clean(a.textContent));
        if (links.length === 1 && clean(links[0].textContent) === text) {
          const a = document2.createElement("a");
          a.href = links[0].getAttribute("href");
          const label = links[0].querySelector("strong, .faux-link");
          a.textContent = clean((label || links[0]).textContent) || text;
          item.appendChild(a);
        } else {
          [...li.childNodes].forEach((n) => item.appendChild(n));
        }
        ul.appendChild(item);
      });
      return ul.children.length ? ul : null;
    };
    const walk = (parent, card) => {
      [...parent.childNodes].forEach((node) => {
        var _a;
        if (node.nodeType === 3) {
          if (clean(node.textContent)) {
            if (!para) para = document2.createElement("p");
            para.appendChild(node);
          }
          return;
        }
        if (node.nodeType !== 1) return;
        const el = node;
        const tag = el.tagName;
        if (!isBlockish(el)) {
          if (!clean(el.textContent) && tag !== "BR") return;
          if (!para) para = document2.createElement("p");
          para.appendChild(el);
          return;
        }
        const bg = backgroundImage(document2, el);
        if (bg) {
          const p = document2.createElement("p");
          p.appendChild(bg);
          push(p);
        }
        if (tag === "HR") {
          flush();
          return;
        }
        if (/^H[1-6]$/.test(tag)) {
          const text = clean(el.textContent);
          if (!text) return;
          const h = document2.createElement(tag.toLowerCase());
          h.textContent = text;
          if (card) card.headings.push(h);
          push(h);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          push(buildList(el));
          return;
        }
        if (tag === "TABLE") {
          push(el);
          return;
        }
        if (tag === "IMG" || tag === "PICTURE") {
          const img = imageFrom(document2, tag === "IMG" ? el : el.querySelector("img") || el);
          if (img) {
            const p = document2.createElement("p");
            p.appendChild(img);
            push(p);
          }
          return;
        }
        if (tag === "IFRAME" || tag === "VIDEO") {
          const raw = ["src", "data-src", "data-lazy-src"].map((a) => (el.getAttribute(a) || "").trim()).find((v) => v && v !== "about:blank" && !v.startsWith("javascript:")) || el.querySelector && ((_a = el.querySelector("source")) == null ? void 0 : _a.getAttribute("src")) || "";
          const href = toCanonicalVideoUrl2(raw);
          if (href) push(linkParagraph(document2, href, href, clean(el.getAttribute("title"))));
          return;
        }
        if (el.classList.contains("faux-link") && card && card.href) {
          push(linkParagraph(document2, card.href, clean(el.textContent) || "Read more"));
          card.linked = true;
          return;
        }
        if (tag === "A") {
          const href = el.getAttribute("href") || "";
          const ctx = href ? { href, headings: [], linked: false } : card;
          walk(el, ctx);
          flush();
          if (href && !ctx.linked) {
            const [heading] = ctx.headings;
            if (heading) {
              const a = document2.createElement("a");
              a.href = href;
              a.textContent = heading.textContent;
              heading.textContent = "";
              heading.appendChild(a);
            } else {
              push(linkParagraph(document2, href, clean(el.getAttribute("title")) || "Learn more"));
            }
          }
          return;
        }
        if (tag === "P") {
          const text = clean(el.textContent);
          const links = [...el.querySelectorAll("a[href]")].filter((a) => a.getAttribute("href") && clean(a.textContent));
          if (!text && !el.querySelector("img, picture, iframe")) {
            flush();
            return;
          }
          if (links.length && text === links.map((a) => clean(a.textContent)).join(" ")) {
            links.forEach((a) => push(linkParagraph(document2, a.getAttribute("href"), clean(a.textContent))));
            return;
          }
          if (el.querySelector("img, picture, iframe")) {
            flush();
            walk(el, card);
            flush();
            return;
          }
          if (el.classList.contains("subheading")) {
            const p = document2.createElement("p");
            [...el.children].forEach((c) => {
              const t = clean(c.textContent);
              if (!t) return;
              if (p.childNodes.length) p.appendChild(document2.createTextNode(" "));
              if (c.tagName === "STRONG" || c.tagName === "B") {
                const strong = document2.createElement("strong");
                strong.textContent = t;
                p.appendChild(strong);
              } else {
                p.appendChild(document2.createTextNode(t));
              }
            });
            push(p.childNodes.length ? p : el);
            return;
          }
          push(el);
          return;
        }
        flush();
        walk(el, card);
        flush();
      });
    };
    walk(root, null);
    flush();
    return out;
  }
  function parse5(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .sl-list > .sl-item")];
    if (!items.length) items = [...element.querySelectorAll(":scope > .sl-item, .sl-item")];
    const row = items.map((item) => {
      const cell = normalizeCell(item, document2);
      return cell.length ? cell : "";
    });
    if (!row.some((c) => c)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-panels.js
  var clean2 = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set([
    "P",
    "DIV",
    "SECTION",
    "HEADER",
    "FOOTER",
    "ARTICLE",
    "ASIDE",
    "FIGURE",
    "FIGCAPTION",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "UL",
    "OL",
    "TABLE",
    "BLOCKQUOTE",
    "HR",
    "IMG",
    "PICTURE",
    "IFRAME",
    "VIDEO",
    "FORM",
    "NAV"
  ]);
  var BLOCK_SELECTOR2 = "p, div, section, header, figure, h1, h2, h3, h4, h5, h6, ul, ol, table, img, picture, iframe, hr, .faux-link";
  var DECORATIVE2 = ".related-links-arrow, .icon, .redirectImg, script, style, noscript, button";
  function decodeNextImage3(url) {
    if (!url || !url.includes("/_next/image")) return url;
    try {
      const original = new URL(url, "https://www.icare.nsw.gov.au/").searchParams.get("url");
      if (!original) return url;
      return original.startsWith("/") ? `https://www.icare.nsw.gov.au${original}` : original;
    } catch (e) {
      return url;
    }
  }
  function makeImage2(document2, src, alt) {
    const img = document2.createElement("img");
    img.src = decodeNextImage3(src.replace(/&amp;/g, "&"));
    img.alt = alt || "";
    return img;
  }
  function imageFrom2(document2, img) {
    const srcset = img.getAttribute("srcset") || "";
    const last = srcset.split(",").map((c) => c.trim().split(/\s+/)[0]).filter(Boolean).pop();
    const src = img.getAttribute("src") || img.getAttribute("data-src") || last || "";
    if (!src || src.startsWith("data:")) return null;
    return makeImage2(document2, src, img.getAttribute("alt"));
  }
  function backgroundImage2(document2, el) {
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    return m && m[2] ? makeImage2(document2, m[2], "") : null;
  }
  function toCanonicalVideoUrl3(raw) {
    if (!raw) return "";
    try {
      const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw, "https://www.icare.nsw.gov.au/");
      const host = url.hostname.replace(/^www\.|^m\./, "");
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        const [, kind, id] = url.pathname.split("/");
        const vid = url.searchParams.get("v") || (["embed", "v", "shorts", "live"].includes(kind) ? id : "");
        if (vid) {
          const start = url.searchParams.get("start") || url.searchParams.get("t");
          return `https://www.youtube.com/watch?v=${vid}${start ? `&t=${parseInt(start, 10) || 0}` : ""}`;
        }
      }
      if (host === "player.vimeo.com") {
        const id = url.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
        if (id) return `https://vimeo.com/${id}`;
      }
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function linkParagraph2(document2, href, text, title) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = text;
    if (title) a.title = title;
    p.appendChild(a);
    return p;
  }
  var isBlockish2 = (el) => BLOCK_TAGS2.has(el.tagName) || el.classList.contains("faux-link") || /background-image/i.test(el.getAttribute("style") || "") || !!el.querySelector(BLOCK_SELECTOR2);
  function normalizeCell2(root, document2) {
    root.querySelectorAll(DECORATIVE2).forEach((el) => el.remove());
    root.querySelectorAll(".vh").forEach((vh) => {
      const parent = vh.parentElement;
      if (parent && clean2(parent.textContent) !== clean2(vh.textContent)) vh.remove();
    });
    const out = [];
    let para = null;
    const flush = () => {
      if (para && (clean2(para.textContent) || para.querySelector("img"))) out.push(para);
      para = null;
    };
    const push = (el) => {
      flush();
      if (el) out.push(el);
    };
    const buildList = (list) => {
      const ul = document2.createElement(list.tagName.toLowerCase());
      [...list.children].filter((li) => li.tagName === "LI").forEach((li) => {
        const text = clean2(li.textContent);
        if (!text) return;
        const item = document2.createElement("li");
        const links = [...li.querySelectorAll("a[href]")].filter((a) => a.getAttribute("href") && clean2(a.textContent));
        if (links.length === 1 && clean2(links[0].textContent) === text) {
          const a = document2.createElement("a");
          a.href = links[0].getAttribute("href");
          const label = links[0].querySelector("strong, .faux-link");
          a.textContent = clean2((label || links[0]).textContent) || text;
          item.appendChild(a);
        } else {
          [...li.childNodes].forEach((n) => item.appendChild(n));
        }
        ul.appendChild(item);
      });
      return ul.children.length ? ul : null;
    };
    const walk = (parent, card) => {
      [...parent.childNodes].forEach((node) => {
        var _a;
        if (node.nodeType === 3) {
          if (clean2(node.textContent)) {
            if (!para) para = document2.createElement("p");
            para.appendChild(node);
          }
          return;
        }
        if (node.nodeType !== 1) return;
        const el = node;
        const tag = el.tagName;
        if (!isBlockish2(el)) {
          if (!clean2(el.textContent) && tag !== "BR") return;
          if (!para) para = document2.createElement("p");
          para.appendChild(el);
          return;
        }
        const bg = backgroundImage2(document2, el);
        if (bg) {
          const p = document2.createElement("p");
          p.appendChild(bg);
          push(p);
        }
        if (tag === "HR") {
          flush();
          return;
        }
        if (/^H[1-6]$/.test(tag)) {
          const text = clean2(el.textContent);
          if (!text) return;
          const h = document2.createElement(tag.toLowerCase());
          h.textContent = text;
          if (card) card.headings.push(h);
          push(h);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          push(buildList(el));
          return;
        }
        if (tag === "TABLE") {
          push(el);
          return;
        }
        if (tag === "IMG" || tag === "PICTURE") {
          const img = imageFrom2(document2, tag === "IMG" ? el : el.querySelector("img") || el);
          if (img) {
            const p = document2.createElement("p");
            p.appendChild(img);
            push(p);
          }
          return;
        }
        if (tag === "IFRAME" || tag === "VIDEO") {
          const raw = ["src", "data-src", "data-lazy-src"].map((a) => (el.getAttribute(a) || "").trim()).find((v) => v && v !== "about:blank" && !v.startsWith("javascript:")) || el.querySelector && ((_a = el.querySelector("source")) == null ? void 0 : _a.getAttribute("src")) || "";
          const href = toCanonicalVideoUrl3(raw);
          if (href) push(linkParagraph2(document2, href, href, clean2(el.getAttribute("title"))));
          return;
        }
        if (el.classList.contains("faux-link") && card && card.href) {
          push(linkParagraph2(document2, card.href, clean2(el.textContent) || "Read more"));
          card.linked = true;
          return;
        }
        if (tag === "A") {
          const href = el.getAttribute("href") || "";
          const ctx = href ? { href, headings: [], linked: false } : card;
          walk(el, ctx);
          flush();
          if (href && !ctx.linked) {
            const [heading] = ctx.headings;
            if (heading) {
              const a = document2.createElement("a");
              a.href = href;
              a.textContent = heading.textContent;
              heading.textContent = "";
              heading.appendChild(a);
            } else {
              push(linkParagraph2(document2, href, clean2(el.getAttribute("title")) || "Learn more"));
            }
          }
          return;
        }
        if (tag === "P") {
          const text = clean2(el.textContent);
          const links = [...el.querySelectorAll("a[href]")].filter((a) => a.getAttribute("href") && clean2(a.textContent));
          if (!text && !el.querySelector("img, picture, iframe")) {
            flush();
            return;
          }
          if (links.length && text === links.map((a) => clean2(a.textContent)).join(" ")) {
            links.forEach((a) => push(linkParagraph2(document2, a.getAttribute("href"), clean2(a.textContent))));
            return;
          }
          if (el.querySelector("img, picture, iframe")) {
            flush();
            walk(el, card);
            flush();
            return;
          }
          if (el.classList.contains("subheading")) {
            const p = document2.createElement("p");
            [...el.children].forEach((c) => {
              const t = clean2(c.textContent);
              if (!t) return;
              if (p.childNodes.length) p.appendChild(document2.createTextNode(" "));
              if (c.tagName === "STRONG" || c.tagName === "B") {
                const strong = document2.createElement("strong");
                strong.textContent = t;
                p.appendChild(strong);
              } else {
                p.appendChild(document2.createTextNode(t));
              }
            });
            push(p.childNodes.length ? p : el);
            return;
          }
          push(el);
          return;
        }
        flush();
        walk(el, card);
        flush();
      });
    };
    walk(root, null);
    flush();
    return out;
  }
  function parse6(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .sl-list > .sl-item")];
    if (!items.length) items = [...element.querySelectorAll(":scope > .sl-item, .sl-item")];
    const row = items.map((item) => {
      const cell = normalizeCell2(item, document2);
      return cell.length ? cell : "";
    });
    if (!row.some((c) => c)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-panels", cells });
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

  // tools/importer/import-section-overview-hub.js
  var parsers = {
    "hero": parse,
    "cards-audience": parse2,
    "cards-news": parse3,
    "embed-video": parse4,
    "columns-video": parse5,
    "columns-panels": parse6
  };
  var PAGE_TEMPLATE = {
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
  var import_section_overview_hub_default = {
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
  return __toCommonJS(import_section_overview_hub_exports);
})();
