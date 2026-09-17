/* Beds & More — clicking a colour swatch on a product card swaps that card's
   own image in place instead of navigating to the product page. The swatch
   stays a real <a href> (works with JS off, or opens in a new tab on a
   middle-click / ctrl+click) -- only a plain left-click is intercepted.

   Conflict with product-card-cycle.js (the hover-to-cycle-through-photos
   effect): that script re-reads the card's frames on every mouseenter, and
   only cycles when there are 2+ of them. Once a swatch is picked, this
   script collapses the card down to a single frame showing the picked
   colour and removes data-pc-cycle from the media element, so a later
   hover has nothing to cycle through and can't stomp the picked colour
   back to the default photo. */
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

    // Stop any cycle already mid-flight and make sure a later hover can't
    // start a new one over this picked colour.
    if (media.dataset.pcTimer) {
      clearInterval(media.dataset.pcTimer);
      delete media.dataset.pcTimer;
    }
    media.removeAttribute('data-pc-cycle');

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
