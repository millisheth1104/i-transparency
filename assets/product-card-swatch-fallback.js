/* Beds & More — colour dot for product cards that have no colour data at all.
   product-card.liquid already renders a dot from the Color option, the
   custom.shade metafield, or a colour word found in the title -- but some
   products (mostly printed/patterned pieces named after the design, e.g.
   "Woven Harmony Crossleave Bedspread", "Polo Heritage Duvet Cover Gift
   Set") carry NONE of that: no Color option, no shade metafield, no colour
   word anywhere, not even in their tags. Liquid has nothing left to read for
   those, so as a last resort this samples the card's own product photo --
   same principle as the hand-sampled hex map on the product page, just done
   in the browser instead of by eye, for the cards that would otherwise stay
   blank. */
(function () {
  function sampleCard(card) {
    if (card.querySelector('.product-card__swatches')) return; // Liquid already gave it one
    var img = card.querySelector('.product-card__media-frame');
    if (!img) return;

    var probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = function () {
      var size = 24;
      var canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        ctx.drawImage(probe, 0, 0, size, size);
        // Inner 50% only -- skips the light background/vignette a lot of
        // these product shots have right at the edges.
        var inset = Math.round(size * 0.25);
        var span = size - inset * 2;
        var data = ctx.getImageData(inset, inset, span, span).data;
        var r = 0, g = 0, b = 0, n = 0;
        for (var i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
        if (!n) return;
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        var hex = '#' + [r, g, b].map(function (c) { return c.toString(16).padStart(2, '0'); }).join('');

        var body = card.querySelector('.product-card__body');
        var title = card.querySelector('.product-card__title')?.closest('a');
        if (!body) return;
        var wrap = document.createElement('div');
        wrap.className = 'product-card__swatches';
        var dot = document.createElement('span');
        dot.className = 'product-card__swatch';
        dot.style.background = hex;
        wrap.appendChild(dot);
        if (title && title.nextSibling) {
          title.parentNode.insertBefore(wrap, title.nextSibling);
        } else {
          body.insertBefore(wrap, body.firstChild);
        }
      } catch (err) {
        // Tainted canvas (CDN didn't serve CORS headers for this asset) --
        // fail silently, the card just keeps no dot rather than breaking.
      }
    };
    probe.src = img.currentSrc || img.src;
  }

  function run() {
    document.querySelectorAll('.product-card').forEach(sampleCard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
