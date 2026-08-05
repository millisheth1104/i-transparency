(function () {
  var mobileQuery = window.matchMedia('(max-width: 990px)');

  document.querySelectorAll('[data-mega-menu]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-mega-trigger]');
    var panel = wrap.querySelector('[data-mega-panel]');
    var catLinks = wrap.querySelectorAll('[data-mega-cat-link]');
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

    if (mobileQuery.matches) {
      // Mobile: click-to-open accordion, no hover state-switching (first
      // category's panel is shown as the initial/default content only).
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
