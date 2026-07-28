(function () {
  document.querySelectorAll('[data-mega-menu]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-mega-trigger]');
    var cats = wrap.querySelectorAll('[data-mega-cat]');
    var groups = wrap.querySelectorAll('[data-mega-group]');
    if (!trigger) return;

    function open() {
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function showCategory(index) {
      cats.forEach(function (cat) {
        cat.classList.toggle('is-active', cat.getAttribute('data-mega-cat') === index);
      });
      groups.forEach(function (group) {
        if (group.getAttribute('data-mega-group') === index) {
          group.removeAttribute('hidden');
        } else {
          group.setAttribute('hidden', '');
        }
      });
    }

    wrap.addEventListener('mouseenter', open);
    wrap.addEventListener('mouseleave', close);
    wrap.addEventListener('focusin', open);
    wrap.addEventListener('focusout', function (e) {
      if (!wrap.contains(e.relatedTarget)) close();
    });

    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });

    cats.forEach(function (cat) {
      var index = cat.getAttribute('data-mega-cat');
      cat.addEventListener('mouseenter', function () { showCategory(index); });
      cat.addEventListener('focus', function () { showCategory(index); });
    });
  });
})();
