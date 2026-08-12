(function () {
  function init(sentinel) {
    var sectionId = sentinel.dataset.sectionId;
    var grids = document.querySelectorAll('#shopify-section-' + sectionId + ' .mc-grid');
    var targetGrid = grids[grids.length - 1];
    var spinner = document.querySelector('#shopify-section-' + sectionId + ' [data-mc-infinite-spinner]');
    if (!targetGrid) return;

    var loading = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadNext();
      });
    }, { rootMargin: '600px 0px' });

    observer.observe(sentinel);

    function finish() {
      observer.disconnect();
      sentinel.remove();
      if (spinner) spinner.remove();
    }

    function loadNext() {
      var nextUrl = sentinel.dataset.nextUrl;
      if (!nextUrl || loading) return;
      loading = true;
      if (spinner) spinner.hidden = false;

      var sep = nextUrl.indexOf('?') > -1 ? '&' : '?';
      fetch(nextUrl + sep + 'section_id=' + sectionId)
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var newCards = doc.querySelectorAll('.mc-grid .product-card');
          newCards.forEach(function (card) { targetGrid.appendChild(card); });

          var newSentinel = doc.querySelector('[data-mc-infinite]');
          var newNextUrl = newSentinel ? newSentinel.dataset.nextUrl : '';
          // No cards, no next url, or the next url didn't advance — treat as end of content.
          if (!newCards.length || !newNextUrl || newNextUrl === nextUrl) {
            finish();
          } else {
            sentinel.dataset.nextUrl = newNextUrl;
            loading = false;
            if (spinner) spinner.hidden = true;
          }
        })
        .catch(function () {
          finish();
        });
    }
  }

  document.querySelectorAll('[data-mc-infinite]').forEach(init);
})();
