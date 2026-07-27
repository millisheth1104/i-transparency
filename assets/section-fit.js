(function () {
  var MIN_MEDIA_HEIGHT = 160;
  var MIN_SECTION_PAD = 24;

  function availableHeight() {
    var header = document.querySelector('[data-header]');
    var h = header ? header.getBoundingClientRect().height : 0;
    return window.innerHeight - h;
  }

  function reset(section) {
    section.style.minHeight = '';
    var sectionEl = section.querySelector('.section');
    if (sectionEl) {
      sectionEl.style.paddingTop = '';
      sectionEl.style.paddingBottom = '';
    }
    section.querySelectorAll('[data-fit-media]').forEach(function (el) {
      el.style.height = '';
    });
  }

  var suppressOwn = false;

  function fitSections() {
    if (suppressOwn) return;
    var available = availableHeight();
    if (available <= 0) return;
    var sections = document.querySelectorAll('main#MainContent > .shopify-section');
    var touchedMedia = false;

    sections.forEach(function (section) {
      // Featured Collections manages its own multi-screen pinned scroll
      // effect (position:fixed math against the viewport) -- shrinking an
      // ancestor's box would fight that, so it's left alone entirely.
      if (section.querySelector('[data-fc-track]')) return;

      reset(section);
      var natural = section.scrollHeight;

      if (natural <= available) {
        section.style.minHeight = available + 'px';
        return;
      }

      var excess = natural - available;

      // 1) Claw back the section's own top/bottom padding first -- it's
      // pure whitespace, safest thing to shrink before touching content.
      var sectionEl = section.querySelector('.section');
      if (sectionEl && excess > 0) {
        var cs = getComputedStyle(sectionEl);
        var padTop = parseFloat(cs.paddingTop) || 0;
        var padBottom = parseFloat(cs.paddingBottom) || 0;
        var reducibleTop = Math.max(0, padTop - MIN_SECTION_PAD);
        var reducibleBottom = Math.max(0, padBottom - MIN_SECTION_PAD);
        var reducible = reducibleTop + reducibleBottom;
        if (reducible > 0) {
          var cut = Math.min(excess, reducible);
          var ratio = cut / reducible;
          sectionEl.style.paddingTop = (padTop - reducibleTop * ratio) + 'px';
          sectionEl.style.paddingBottom = (padBottom - reducibleBottom * ratio) + 'px';
          excess -= cut;
        }
      }

      // 2) Whatever's left, shave off the section's own media/stage boxes
      // (photos) by height only -- width never changes, object-fit:cover
      // just shows a shorter crop of the image. Text/buttons are never
      // touched, so nothing is cropped or distorted, just a smaller photo.
      if (excess > 0.5) {
        var media = section.querySelectorAll('[data-fit-media]');
        if (media.length) {
          var perItem = excess / media.length;
          media.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            var newH = Math.max(MIN_MEDIA_HEIGHT, rect.height - perItem);
            if (newH !== rect.height) {
              el.style.height = newH + 'px';
              touchedMedia = true;
            }
          });
        }
      }
    });

    // Sections with their own JS layout driven off measured pixel sizes
    // (e.g. category-showcase's card stack) need a nudge to re-read the
    // now-shorter box instead of using stale dimensions from page load.
    if (touchedMedia) {
      suppressOwn = true;
      window.dispatchEvent(new Event('resize'));
      suppressOwn = false;
    }
  }

  fitSections();
  window.addEventListener('resize', fitSections);
  window.addEventListener('load', fitSections);
})();
