(function () {
  var mobileQuery = window.matchMedia('(max-width: 990px)');
  var CLOSE_DELAY = 250; // ms grace period before actually closing
  /* The panel renders directly beneath the header with an opaque
     background, and on collection pages the filter bar sits right there
     too -- a cursor merely passing near/over the trigger word on its way
     down to a filter control was lingering just long enough to open the
     panel and block the filter bar underneath it. 400ms requires an
     actual pause (real browsing intent) rather than a quick pass-through,
     while still feeling immediate for someone deliberately hovering Shop. */
  var OPEN_DELAY = 400;  // ms of sustained hover before the menu commits to opening

  var allWraps = [];

  document.querySelectorAll('[data-mega-menu]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-mega-trigger]');
    var panel = wrap.querySelector('[data-mega-panel]');
    var catLinks = wrap.querySelectorAll('[data-mega-cat-link]');
    var views = wrap.querySelectorAll('[data-mega-view]');
    if (!trigger || !panel) return;

    var closeTimer = null;
    var openTimer = null;

    function clearTimers() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    }

    function openNow() {
      clearTimers();
      allWraps.forEach(function (other) {
        if (other !== wrap) other.forceClose();
      });
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function reset() {
      // Back to the default: first category active, its panel shown.
      activate(catLinks.length ? catLinks[0].getAttribute('data-panel') : null);
    }

    function activate(panelName) {
      if (!panelName) return;
      catLinks.forEach(function (l) {
        var isMatch = l.getAttribute('data-panel') === panelName;
        l.classList.toggle('is-active', isMatch);
        l.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
      views.forEach(function (v) {
        v.classList.toggle('is-active', v.getAttribute('data-mega-view') === panelName);
      });
    }

    catLinks.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (mobileQuery.matches) return;
        activate(el.getAttribute('data-panel'));
      });
      el.addEventListener('focus', function () {
        if (mobileQuery.matches) return;
        activate(el.getAttribute('data-panel'));
      });
    });

    // Exposed so a sibling wrap can shut this one instantly once IT commits
    // to opening (after its own OPEN_DELAY), rather than on mere mouseenter.
    wrap.forceClose = function () {
      clearTimers();
      close();
      reset();
    };

    if (mobileQuery.matches) {
      // Mobile: click-to-open accordion, no hover state-switching (first
      // category's panel is shown as the initial/default content only).
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !wrap.classList.contains('is-open');
        if (willOpen) { reset(); openNow(); } else { close(); }
      });
    } else {
      /* Desktop: hover-only, scoped to this wrap's own bounding box (the
         trigger word — the panel itself is a descendant, so moving into
         it doesn't fire mouseleave). Clicking the word still navigates
         normally to its own collection page, since nothing here calls
         preventDefault on desktop.

         Both open and close are debounced so that a mouse path which
         briefly grazes a sibling trigger on the way into THIS wrap's own
         panel (e.g. reaching a subcategory means crossing the header row
         where the next nav item's trigger sits) doesn't (a) instantly
         close this one on the graze-out, or (b) instantly open the
         sibling and steal it. Only a hover that's still there after the
         delay commits. */
      wrap.addEventListener('mouseenter', function () {
        clearTimers();
        if (wrap.classList.contains('is-open')) { openNow(); return; }
        openTimer = setTimeout(openNow, OPEN_DELAY);
      });
      wrap.addEventListener('mouseleave', function () {
        clearTimers();
        closeTimer = setTimeout(function () { close(); reset(); }, CLOSE_DELAY);
      });
      wrap.addEventListener('focusin', openNow);
      wrap.addEventListener('focusout', function (e) {
        if (!wrap.contains(e.relatedTarget)) { close(); reset(); }
      });
      wrap.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(); reset(); trigger.focus(); }
      });
    }

    allWraps.push(wrap);
  });

  /* On collection pages the filter bar (.mc-bar) sits directly beneath the
     header, inside the "Shop" panel's own opaque footprint -- so an open
     panel doesn't just sit near the filters, it is the topmost element at
     those screen coordinates. That means the filter bar's own mouseenter
     never fires while the panel is open (the browser delivers the event to
     whatever the panel is showing at that point -- e.g. an <img> -- not to
     the covered element underneath), so listening on the filter bar itself
     can never detect the cursor arriving. Instead, track real cursor
     coordinates at the document level and compare against the filter bar's
     rect directly; that works regardless of which element is visually on
     top. */
  var filterBar = document.querySelector('.mc-bar');
  if (filterBar && allWraps.length) {
    document.addEventListener('mousemove', function (e) {
      if (!allWraps.some(function (w) { return w.classList.contains('is-open'); })) return;
      var r = filterBar.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        allWraps.forEach(function (wrap) { wrap.forceClose(); });
      }
    });
  }
})();
