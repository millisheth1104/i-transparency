/* Beds & More — clicking a colour swatch on a product card swaps that card's
   own image in place instead of navigating to the product page. The swatch
   stays a real <a href> (works with JS off, or opens in a new tab on a
   middle-click / ctrl+click) -- only a plain left-click is intercepted.

   product-card-cycle.js's hover-to-cycle-through-photos effect keeps
   working after a swatch is picked -- data-pc-cycle is left alone on
   purpose. What changes is which photo frame 0 holds: it's overwritten
   with the picked colour's photo, so hovering still cycles through the
   card's other (colour-agnostic detail/lifestyle) shots as before, and
   mouseleave's reset-to-frame-0 lands back on the picked colour instead of
   the original default one. The only thing guarded against is a cycle
   interval already mid-flight at the moment of the click stomping the pick
   a fraction of a second later -- that gets stopped so the swap sticks
   until the next hover starts a fresh cycle. */
(function () {
  document.addEventListener('click', function (e) {
    var swatch = e.target.closest && e.target.closest('[data-swatch]');
    if (!swatch) return;

    // Middle-click, ctrl/cmd-click, shift-click: let the browser open the
    // variant link normally (new tab / new window) instead of hijacking it.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

    var previewImage = swatch.dataset.previewImage;
    if (!previewImage) return; // no known photo for this colour -- fall through to the real link

    e.preventDefault();

    var card = swatch.closest('.product-card');
    if (!card) return;
    var media = card.querySelector('.product-card__media');
    if (!media) return;

    var frames = media.querySelectorAll('.product-card__media-frame');
    if (!frames.length) return;

    // Stop a cycle that's already mid-flight so it doesn't immediately
    // advance past the frame we're about to set -- data-pc-cycle stays on
    // the element, so hovering again afterward starts a fresh cycle same
    // as always.
    if (media.dataset.pcTimer) {
      clearInterval(media.dataset.pcTimer);
      delete media.dataset.pcTimer;
    }

    frames.forEach(function (frame, i) {
      if (i === 0) {
        frame.src = previewImage;
        frame.classList.add('is-active');
      } else {
        frame.classList.remove('is-active');
      }
    });

    var swatchRow = swatch.closest('.product-card__swatches');
    if (swatchRow) {
      swatchRow.querySelectorAll('[data-swatch]').forEach(function (s) {
        s.classList.toggle('is-active', s === swatch);
      });
    }
  });
})();
