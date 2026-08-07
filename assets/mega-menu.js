(function () {
  var mobileQuery = window.matchMedia('(max-width: 990px)');

  document.querySelectorAll('[data-mega-menu]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-mega-trigger]');
    var panel = wrap.querySelector('[data-mega-panel]');
    var catLinks = wrap.querySelectorAll('[data-mega-cat-link]');
    var views = wrap.querySelectorAll('[data-mega-view]');
    if (!trigger || !panel) return;

    function open() {
      /* Close any other open mega menu first so only one is ever visible. */
      document.querySelectorAll('[data-mega-menu].is-open').forEach(function (other) {
        if (other !== wrap) other.classList.remove('is-open');
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

    /* Switching categories within an already-open panel still responds to
       hover on desktop (a nicer feel once you're already inside the
       panel) — this is independent from what opens/closes the panel
       itself, which is click-only below. */
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

    /* Click-only open/close, same on desktop and mobile — no hover
       trigger at all, so the panel only ever appears from an explicit
       click on the word itself, never from the cursor merely passing
       near or under it. */
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !wrap.classList.contains('is-open');
      if (willOpen) { reset(); open(); } else { close(); }
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });

    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); reset(); trigger.focus(); }
    });
  });
})();
