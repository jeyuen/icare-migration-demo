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

    // Non-authorable elements. Found: many <link href=...> preloads at top of body, empty <iframe>, <meta>
    WebImporter.DOMUtils.remove(element, [
      'link',
      'iframe',
      'noscript',
      'meta',
    ]);
  }
}
