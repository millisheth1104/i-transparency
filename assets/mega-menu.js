(function () {
  var mobileQuery = window.matchMedia('(max-width: 990px)');

  document.querySelectorAll('[data-mega-menu]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-mega-trigger]');
    var panel = wrap.querySelector('[data-mega-panel]');
    var sublist = wrap.querySelector('[data-mega-sublist]');
    var parentlist = wrap.querySelector('[data-mega-parentlist]');
    var subTriggers = wrap.querySelectorAll('[data-mega-sub-trigger]');
    var subLinks = wrap.querySelectorAll('[data-mega-sub-link]');
    var views = wrap.querySelectorAll('[data-mega-view]');
    if (!trigger || !panel) return;

    function open() {
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function reset() {
      // Back to "state 1": parent list visible, grid of sub-collections shown.
      if (sublist) sublist.hidden = true;
      if (parentlist) parentlist.hidden = false;
      showView('grid');
    }

    function showView(name) {
      views.forEach(function (v) {
        v.classList.toggle('is-active', v.getAttribute('data-mega-view') === name);
      });
    }

    function activateSub(panelName) {
      // Drill into "state 2": sub-collection list replaces the parent list,
      // matching item highlighted, right panel swaps to featured products.
      if (parentlist) parentlist.hidden = true;
      if (sublist) sublist.hidden = false;
      subLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('data-panel') === panelName);
      });
      showView(panelName);
    }

    subTriggers.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (mobileQuery.matches) return;
        activateSub(el.getAttribute('data-panel'));
      });
    });

    subLinks.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (mobileQuery.matches) return;
        activateSub(el.getAttribute('data-panel'));
      });
    });

    if (mobileQuery.matches) {
      // Mobile: click-to-open accordion, no hover state-switching (state 1
      // grid is shown as the initial/default content only).
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !wrap.classList.contains('is-open');
        if (willOpen) { reset(); open(); } else { close(); }
      });
    } else {
      wrap.addEventListener('mouseenter', open);
      wrap.addEventListener('mouseleave', function () { close(); reset(); });
      wrap.addEventListener('focusin', open);
      wrap.addEventListener('focusout', function (e) {
        if (!wrap.contains(e.relatedTarget)) { close(); reset(); }
      });
      wrap.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(); reset(); trigger.focus(); }
      });
    }
  });
})();
