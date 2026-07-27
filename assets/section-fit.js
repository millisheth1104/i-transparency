(function () {
  function fitSections() {
    var header = document.querySelector('[data-header]');
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var available = window.innerHeight - headerHeight;
    var sections = document.querySelectorAll('main#MainContent > .shopify-section');

    sections.forEach(function (section) {
      // Featured Collections manages its own multi-screen pinned scroll
      // effect (position:fixed math against the viewport) -- scaling an
      // ancestor would create a new containing block and break the pin.
      if (section.querySelector('[data-fc-track]')) return;

      section.style.transform = '';
      section.style.transformOrigin = '';
      section.style.height = '';
      section.style.minHeight = '';

      var natural = section.scrollHeight;
      if (natural > available && available > 0) {
        var scale = available / natural;
        section.style.transformOrigin = 'top center';
        section.style.transform = 'scale(' + scale + ')';
        section.style.height = available + 'px';
      } else {
        section.style.minHeight = available + 'px';
      }
    });
  }

  fitSections();
  window.addEventListener('resize', fitSections);
  window.addEventListener('load', fitSections);
})();
