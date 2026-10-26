/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: icare (www.icare.nsw.gov.au) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html (homepage capture).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Floating feedback / compliment / complaint widget inside main#main
    // Found: <div class="feedback-overlay "> + <section class="cm cm-floating-form close is-small" id="main-feedback">
    // (contains forms, textareas and reCAPTCHA iframes that could confuse block parsing)
    WebImporter.DOMUtils.remove(element, [
      '.feedback-overlay',
      '#main-feedback',
    ]);

    // Site-wide alert banner (temporary notices, e.g. "Scam Alert: icare impersonation Scam")
    // Found: <div class="cm cm-sitewide-message is-medium"><div class="l-padding"><p>..</p><p>..</p><a>Learn more</a>
    // above the homepage hero - a site-wide notice, not page content.
    WebImporter.DOMUtils.remove(element, ['.cm-sitewide-message']);

    // Hidden duplicate mobile hero content (same image/h1/p as the desktop copy)
    // Found: <section class="hero-banner-section homepage-hero-banner">
    //          <div class="l-padding show-on-full-width">...</div>
    //          <div class="l-padding show-on-mobile">...duplicate...</div>
    // Only the mobile duplicate is removed; the desktop copy stays for the hero parser.
    WebImporter.DOMUtils.remove(element, [
      '.homepage-hero-banner > .show-on-mobile',
    ]);

    // Translation disclaimer modal + overlays
    // Found: <div class="modal-container js-modal-container"><div id="modal-multilingual-disclaimer" class="modal">,
    //        <div class="modal-bg">, <div class="shade-bg">
    WebImporter.DOMUtils.remove(element, [
      '.modal-container.js-modal-container',
      '.modal-bg',
      '.shade-bg',
    ]);

    // ReadSpeaker "Listen" widget at the top of main#main (content-detail pages)
    // Found: <div id="readspeaker_button1" class="rs_skip rsbtn rs_preserve mega_toggle">
    //          (button.rsbtn_tooltoggle, div#readspeaker_button1_toolpanel, a.rsbtn_play)
    // Removed before parsing so its link is never swept into default content.
    WebImporter.DOMUtils.remove(element, [
      '#readspeaker_button1',
      '.rsbtn',
    ]);

    // Salesforce Embedded Messaging chat widget (guide pages, end of body)
    // Found: <iframe class="embeddedMessagingSiteContextFrame" id="embeddedMessagingSiteContextFrame">,
    //        <div id="embedded-messaging" class="embedded-messaging"> (button "Chat with the team" + inline svg img)
    WebImporter.DOMUtils.remove(element, [
      '#embedded-messaging',
      '#embeddedMessagingSiteContextFrame',
    ]);

    // Empty CTA module placeholder (contact-directory pages)
    // Found: <div class="sl-item"><section class="cm cm-cta-module is-theme-purple"></section></div>
    // Only removed when it has no text and no media; its now-empty .sl-item wrapper goes too.
    element.querySelectorAll('section.cm-cta-module').forEach((el) => {
      const hasText = el.textContent.replace(/ /g, ' ').trim().length > 0;
      const hasMedia = el.querySelector('img, picture, video, iframe, a');
      if (hasText || hasMedia) return;
      const wrapper = el.parentElement;
      el.remove();
      if (wrapper && wrapper !== element && wrapper.classList.contains('sl-item')
        && !wrapper.textContent.trim() && !wrapper.children.length) {
        wrapper.remove();
      }
    });

    // Duplicate sidebar promo tiles (hero-image-content-with-sidebar pages)
    // Found: <main class="l-main"> ... <div class="mobile-only"><section class="cm cm-cta-module ...">x3</div>
    //   and  <aside class="l-complementary desktop-only"><section class="cm cm-cta-module ...">x3 (same tiles)
    // The .l-main > div.mobile-only copy is the cards-promo block; the desktop sidebar copy is dropped,
    // but ONLY when every sidebar tile (href + heading) also exists in the mobile copy. Sidebars on pages
    // without a populated mobile copy are left untouched.
    const ctaKey = (cta) => {
      const a = cta.querySelector('a[href]');
      const h = cta.querySelector('h2, h3, h4');
      return `${a ? a.getAttribute('href') : ''}|${h ? h.textContent.replace(/\s+/g, ' ').trim() : ''}`;
    };
    element.querySelectorAll('aside.l-complementary.desktop-only').forEach((aside) => {
      const asideTiles = [...aside.querySelectorAll('section.cm-cta-module')];
      if (!asideTiles.length) return;
      const mobileKeys = new Set();
      element.querySelectorAll('.l-main > div.mobile-only section.cm-cta-module')
        .forEach((cta) => mobileKeys.add(ctaKey(cta)));
      if (!mobileKeys.size) return;
      if (asideTiles.every((cta) => mobileKeys.has(ctaKey(cta)))) aside.remove();
    });

    // Duplicate page H1 (section-overview-hub pages)
    // Found: <section class="cm cm-campaign-hero-banner ..."> ... <h1 class="heading">Small business hub</h1>
    //   and  <main id="main" class="l-main"><header class="content-header "><h1>Small business hub</h1><p class="intro">...</p>
    // The hero block carries the H1, so the content-header copy is dropped. Only applies when the campaign
    // hero is present; the header element and its lead paragraph are kept (it is a section boundary).
    if (element.querySelector('section.cm-campaign-hero-banner')) {
      WebImporter.DOMUtils.remove(element, ['.l-main > header.content-header > h1']);
    }

    // Body copy authored as a heading (section-overview-hub pages)
    // Found: <h3><span style="font-weight: 400; font-size: 16px; color: #555555;">Your policy helps cover ...</span></h3>
    // The inline style makes it render as a normal paragraph on the source, so it becomes a <p>.
    // Only rich-text headings whose whole content is one span styled weight 400 at 18px or smaller.
    element.querySelectorAll('.l-main .cm-rich-text :is(h2, h3, h4), .l-main .ck-content :is(h2, h3, h4)').forEach((h) => {
      const span = h.children.length === 1 ? h.firstElementChild : null;
      if (!span || span.tagName !== 'SPAN' || span.textContent.trim() !== h.textContent.trim()) return;
      const style = span.getAttribute('style') || '';
      const size = parseFloat((style.match(/font-size:\s*([\d.]+)px/i) || [])[1]);
      if (!/font-weight:\s*(400|normal)/i.test(style) || !(size <= 18)) return;
      const p = element.ownerDocument.createElement('p');
      p.append(...span.childNodes);
      h.replaceWith(p);
    });

    // Inline <style> elements authored inside rich text (section-overview-hub pages)
    WebImporter.DOMUtils.remove(element, [
      '.ck-content > style',
      '.cm-rich-text style',
    ]);

    // Live-chat / script-only wrappers at the end of main (section-overview-hub pages)
    // Found: <main class="l-main"> ... <div></div><div></div><div class="tags"> - plain, class-less divs
    // that only held inline <script> (document.addEventListener ...) on the live page.
    // Only direct, class/id-less <div> children of .l-main with no media and no text other than script code.
    element.querySelectorAll('.l-main > div:not([class]):not([id])').forEach((div) => {
      if (div.querySelector('img, picture, video, iframe, table, a, h1, h2, h3, h4, h5, h6, ul, ol')) return;
      const clone = div.cloneNode(true);
      clone.querySelectorAll('script, style').forEach((s) => s.remove());
      const text = clone.textContent.replace(/ /g, ' ').trim();
      if (!text || /^document\.addEventListener\s*\(/.test(text)) div.remove();
    });

    // News story pages (news-story-with-video template) - gated on the dated article header,
    // which no other template has: <main class="l-main"><header class="content-header has-date">
    if (element.querySelector('.l-main > header.content-header.has-date')) {
      // Empty hero spacer above the article column
      // Found: <div class="l-layout l-two-column-left cf"><section class="cm cm-hero-image-module"></section>
      // Only removed when it has no text and no media (populated hero modules on other templates are untouched).
      element.querySelectorAll('div.l-layout > section.cm-hero-image-module').forEach((el) => {
        const hasText = el.textContent.replace(/ /g, ' ').trim().length > 0;
        if (!hasText && !el.querySelector('img, picture, video, iframe, a')) el.remove();
      });

      // Empty heading left after the tags list (shine-magazine page)
      // Found: <div class="tags">...</div><h2></h2><div class="cm cm-rich-text is-medium "></div>
      element.querySelectorAll('.l-main > :is(h1, h2, h3, h4, h5, h6)').forEach((h) => {
        const hasText = h.textContent.replace(/ /g, ' ').trim().length > 0;
        if (!hasText && !h.querySelector('img, picture')) h.remove();
      });

      // Publication date sits loose between the H1 and the intro paragraph
      // Found: <header class="content-header has-date"><h1>..</h1><time datetime="2025-02-25">Tuesday 25 February 2025</time><p class="intro">
      // Wrapped in its own <p> and placed before the H1, where the source displays it.
      element.querySelectorAll('.l-main > header.content-header.has-date > time').forEach((time) => {
        const p = element.ownerDocument.createElement('p');
        p.append(time.cloneNode(true));
        time.remove();
        const h1 = element.querySelector('.l-main > header.content-header.has-date > h1');
        if (h1) h1.before(p);
        else element.querySelector('.l-main > header.content-header.has-date').prepend(p);
      });

      // Inline quotations: the source renders <q> with curly quotes, which the import would drop
      // Found: <p><q>Along with enforcement of the recent ban on engineered stone, ...</q></p>
      element.querySelectorAll('.l-main q').forEach((q) => {
        q.replaceWith(element.ownerDocument.createTextNode(`“${q.textContent.trim()}”`));
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Empty paragraphs in main rich text (section-overview-hub pages)
    // Found: <div class="cm cm-rich-text ..."> ... <p>&nbsp;</p>, <p>\n</p>, <p><strong>&nbsp;</strong><strong>&nbsp;</strong></p>
    // Only <p> with no visible text and no media/links; paragraphs inside parsed block tables are untouched.
    element.querySelectorAll('.l-main .cm-rich-text p, .l-main .ck-content p').forEach((p) => {
      if (p.closest('table')) return;
      if (p.querySelector('img, picture, video, iframe, a')) return;
      if (p.textContent.replace(/ /g, ' ').trim()) return;
      p.remove();
    });

    // Skip links. Found: <ul id="top" class="accessibility-links">
    WebImporter.DOMUtils.remove(element, ['ul.accessibility-links']);

    // Global header, primary nav, global search popover, mobile offscreen nav
    // Found: <header class="global-header global-header-full-width is-sticky"> (contains nav#nav),
    //        <div class="global-search " id="global-search">,
    //        <div class="offscreen-container primary-offscreen-container"> (nav.mobile-toolbar, nav#nav-offscreen)
    WebImporter.DOMUtils.remove(element, [
      'header.global-header',
      '#global-search',
      '.offscreen-container.primary-offscreen-container',
      '#nav-offscreen',
      'nav.mobile-toolbar',
    ]);

    // Global footer. Found: <footer class="global-footer">
    WebImporter.DOMUtils.remove(element, ['footer.global-footer']);

    // Breadcrumb trail above the hero (content-detail pages)
    // Found: <div id="skip-to-main"><nav class="breadcrumbs breadcrumbs-cm">
    // NOTE: the sibling <header class="hero-composite-section"> is the hero block and must be kept;
    // header removal above is scoped to header.global-header only.
    WebImporter.DOMUtils.remove(element, ['nav.breadcrumbs']);

    // Empty rich-text containers (content-detail pages)
    // Found in main#main: <div class="cm cm-rich-text is-large"></div> and
    //   <div class="cm cm-rich-text is-large"><div><div class="ck-content"></div></div></div>
    // Only removed when they contain no text and no media.
    element.querySelectorAll('.cm-rich-text').forEach((el) => {
      const hasText = el.textContent.replace(/ /g, ' ').trim().length > 0;
      const hasMedia = el.querySelector('img, picture, video, table, iframe, hr');
      if (!hasText && !hasMedia) el.remove();
    });

    // Empty responsive placeholder (guide pages)
    // Found in main#main right after the ReadSpeaker widget: <div class="mobile-only"></div>
    // Only removed when it contains no text and no media, so populated mobile-only content is untouched.
    element.querySelectorAll('div.mobile-only').forEach((el) => {
      const hasText = el.textContent.replace(/ /g, ' ').trim().length > 0;
      const hasMedia = el.querySelector('img, picture, video, table, iframe, hr');
      if (!hasText && !hasMedia) el.remove();
    });

    // Google Translate leftovers
    // Found: <div class="skiptranslate"> (top of body), <div id="google_translate_element">,
    //        <div id="goog-gt-tt" class="VIpgJd-yAWNEb-L7lbkb skiptranslate">,
    //        <div class="VIpgJd-ZVi9od-aZ2wEe-wOHMyf">, iframe.skiptranslate "Language Translate Widget"
    WebImporter.DOMUtils.remove(element, [
      '.skiptranslate',
      '#google_translate_element',
      '#goog-gt-tt',
      '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
    ]);

    // reCAPTCHA leftovers
    // Found: <div id="invisible-recaptcha"><div class="grecaptcha-badge">,
    //        trailing <div><div></div><div><iframe title="recaptcha challenge expires in two minutes"></div></div>
    element.querySelectorAll('iframe[title^="recaptcha challenge"]').forEach((iframe) => {
      const wrapper = iframe.parentElement && iframe.parentElement.parentElement;
      if (wrapper && wrapper !== element && wrapper.tagName === 'DIV' && !wrapper.className && !wrapper.id) {
        wrapper.remove();
      } else {
        iframe.remove();
      }
    });
    WebImporter.DOMUtils.remove(element, [
      '#invisible-recaptcha',
      '.grecaptcha-badge',
    ]);

    // Next.js / Sitecore runtime artifacts
    // Found: <next-route-announcer>, <byoc-registration>
    WebImporter.DOMUtils.remove(element, [
      'next-route-announcer',
      'byoc-registration',
    ]);

    // Standalone outlined CTA left as default content -> secondary button (<em>-wrapped link)
    // Found (contact-directory): <div class="cm-rich-text is-medium">...<a class="cta-is-secondary">HBCF portal</a></div>
    // Runs after parsing, so only CTAs not consumed by a block parser are affected.
    element.querySelectorAll('a.cta-is-secondary').forEach((a) => {
      if (a.closest('table') || a.closest('em')) return;
      a.removeAttribute('class');
      const em = document.createElement('em');
      a.replaceWith(em);
      em.append(a);
      if (em.parentElement && em.parentElement.tagName !== 'P') {
        const p = document.createElement('p');
        em.replaceWith(p);
        p.append(em);
      }
    });

    // Standalone filled CTA left as default content -> primary button (<strong>-wrapped link)
    // Found (guide pages): <div class="cm-rich-text">...<p><a class="cta">Find out what ... covers</a></p></div>
    // Only links whose sole class is "cta"; modifier variants (is-secondary, ...) are left alone.
    element.querySelectorAll('a[class="cta"]').forEach((a) => {
      if (a.closest('table') || a.closest('strong, em')) return;
      a.removeAttribute('class');
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
      if (strong.parentElement && strong.parentElement.tagName !== 'P') {
        const p = document.createElement('p');
        strong.replaceWith(p);
        p.append(strong);
      }
    });

    // Non-authorable elements. Found: many <link href=...> preloads at top of body, empty <iframe>, <meta>
    // Iframes inside parsed block tables (e.g. embed-iframe from div.cm-iframe) are preserved;
    // Google Translate / reCAPTCHA iframes are removed above or here.
    WebImporter.DOMUtils.remove(element, [
      'link',
      'noscript',
      'meta',
    ]);
    element.querySelectorAll('iframe').forEach((iframe) => {
      if (!iframe.closest('table')) iframe.remove();
    });
  }
}
