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
  }

  if (hookName === TransformHook.afterTransform) {
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
