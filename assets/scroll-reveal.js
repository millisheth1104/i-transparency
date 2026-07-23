/*
 * Site-wide scroll-reveal. Targets shared classes already used across
 * sections (headings, sub-text, media containers, icon rows) so it works
 * everywhere without touching each section's markup individually.
 * Uses IntersectionObserver only (no scroll listeners), fires once per
 * element (~15% visible, roughly the 70-80%-down-viewport point for most
 * section heights), and never re-triggers on scroll-up.
 *
 * Featured Collections (.fc) already has its own tailored reveal/stagger
 * logic, so it's excluded here to avoid double-handling the same elements.
 */
(function () {
  var TEXT_SELECTORS = [
    '.section-heading', '.eyebrow', '.section-sub',
    '.hero__eyebrow', '.hero__title', '.hero__text',
    '.mc-hero__title', '.mc-hero__sub',
    '.corp-hero__eyebrow', '.corp-hero__title',
    '.contactp__q', '.contactp__q-sub',
    '.error-404__title', '.error-404__text',
    '.corp-form__title', '.corp-form__sub',
    '.corp-process__title', '.corp-exp__title'
  ];

  var IMAGE_SELECTORS = [
    '.hero__media', '.mc-hero__media', '.mc-feature__media',
    '.sleepscape__stage', '.corp-form__media', '.contactp__map'
  ];

  var STAGGER_GROUPS = [
    '.mc-hero__cats', '.corp-strip', '.corp-exp__items', '.trust-bar'
  ];

  var EXCLUDE_PARENT = '.fc'; // Featured Collections handles its own reveal

  function isExcluded(el) {
    return !!el.closest(EXCLUDE_PARENT);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var textEls = Array.prototype.slice.call(document.querySelectorAll(TEXT_SELECTORS.join(',')))
      .filter(function (el) { return !isExcluded(el); });
    textEls.forEach(function (el) { el.classList.add('sr-text'); });

    var imageEls = Array.prototype.slice.call(document.querySelectorAll(IMAGE_SELECTORS.join(',')))
      .filter(function (el) { return !isExcluded(el); });
    imageEls.forEach(function (el) { el.classList.add('sr-image'); });

    var staggerEls = Array.prototype.slice.call(document.querySelectorAll(STAGGER_GROUPS.join(',')))
      .filter(function (el) { return !isExcluded(el); });
    staggerEls.forEach(function (el) {
      el.classList.add('sr-stagger');
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.transitionDelay = (i * 0.12) + 's';
      });
    });

    var allEls = textEls.concat(imageEls, staggerEls);
    if (!allEls.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      allEls.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    allEls.forEach(function (el) { io.observe(el); });
  });
})();
