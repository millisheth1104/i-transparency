/* Beds & More — auto-cycles a product card's images on hover.
   Cards with 2+ images render all frames as .product-card__media-frame
   (snippets/product-card.liquid), first one .is-active. While the pointer
   stays over .product-card__media[data-pc-cycle], step to the next frame
   on an interval, looping; on mouse-leave, snap back to the first frame. */
(function () {
  var INTERVAL_MS = 900;

  document.addEventListener('mouseenter', function (e) {
    var media = e.target.closest && e.target.closest('[data-pc-cycle]');
    if (!media || media.dataset.pcTimer) return;
    var frames = media.querySelectorAll('.product-card__media-frame');
    if (frames.length < 2) return;

    var index = 0;
    function advance() {
      index = (index + 1) % frames.length;
      frames.forEach(function (frame, i) { frame.classList.toggle('is-active', i === index); });
    }
    advance(); // swap to the 2nd image immediately -- don't wait a full interval for the first change
    media.dataset.pcTimer = setInterval(advance, INTERVAL_MS);
  }, true);

  document.addEventListener('mouseleave', function (e) {
    var media = e.target.closest && e.target.closest('[data-pc-cycle]');
    if (!media || !media.dataset.pcTimer) return;
    clearInterval(media.dataset.pcTimer);
    delete media.dataset.pcTimer;
    var frames = media.querySelectorAll('.product-card__media-frame');
    frames.forEach(function (frame, i) { frame.classList.toggle('is-active', i === 0); });
  }, true);
})();
