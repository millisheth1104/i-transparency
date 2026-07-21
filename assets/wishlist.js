/* Beds & More — client-side wishlist via localStorage.
   Heart buttons across the site use .product-card__wish[data-wishlist="{id}"].
   Stored as a JSON array of product ids under key "bm_wishlist". */
(function () {
  var KEY = 'bm_wishlist';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
    document.dispatchEvent(new CustomEvent('wishlist:change', { detail: ids }));
  }
  function has(id) { return read().indexOf(String(id)) !== -1; }
  function toggle(id) {
    id = String(id);
    var ids = read();
    var i = ids.indexOf(id);
    if (i === -1) ids.push(id); else ids.splice(i, 1);
    write(ids);
    return ids.indexOf(id) !== -1;
  }

  /* Inject active-heart styling without editing base.css */
  var style = document.createElement('style');
  style.textContent =
    '.product-card__wish.is-active svg{fill:#e0245e;stroke:#e0245e}' +
    '.product-card__wish.is-active{background:#fff}';
  document.head.appendChild(style);

  /* Sync + wire every heart button on the page */
  function syncHearts(root) {
    (root || document).querySelectorAll('.product-card__wish[data-wishlist]').forEach(function (btn) {
      var id = btn.getAttribute('data-wishlist');
      btn.classList.toggle('is-active', has(id));
      if (btn.dataset.wishInit) return;
      btn.dataset.wishInit = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var active = toggle(id);
        btn.classList.toggle('is-active', active);
      });
    });
  }

  /* Wishlist page: reveal only saved cards, handle empty state + actions */
  function renderPage() {
    var page = document.querySelector('[data-wishlist-page]');
    if (!page) return;
    var ids = read();
    var cards = page.querySelectorAll('[data-wishlist-card]');
    var shown = 0;
    cards.forEach(function (card) {
      var keep = ids.indexOf(card.getAttribute('data-wishlist-card')) !== -1;
      card.hidden = !keep;
      if (keep) shown++;
    });
    var empty = page.querySelector('[data-wishlist-empty]');
    var grid = page.querySelector('[data-wishlist-grid]');
    var toolbar = page.querySelector('[data-wishlist-toolbar]');
    if (empty) empty.hidden = shown !== 0;
    if (grid) grid.hidden = shown === 0;
    if (toolbar) toolbar.hidden = shown === 0;
  }

  function wirePageActions() {
    var page = document.querySelector('[data-wishlist-page]');
    if (!page) return;

    var moveAll = page.querySelector('[data-wishlist-moveall]');
    if (moveAll) moveAll.addEventListener('click', function () {
      var forms = page.querySelectorAll('[data-wishlist-card]:not([hidden]) form[action*="/cart/add"]');
      if (!forms.length) return;
      var done = 0;
      moveAll.disabled = true;
      forms.forEach(function (form) {
        var data = new FormData(form);
        fetch('/cart/add.js', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
          .catch(function () {})
          .finally(function () { if (++done === forms.length) window.location.href = '/cart'; });
      });
    });

    var share = page.querySelector('[data-wishlist-share]');
    if (share) share.addEventListener('click', function () {
      var url = window.location.origin + window.location.pathname + '?w=' + encodeURIComponent(read().join(','));
      if (navigator.share) {
        navigator.share({ title: 'My Wishlist', url: url }).catch(function () {});
      } else {
        navigator.clipboard.writeText(url).then(function () {
          share.classList.add('is-copied');
          setTimeout(function () { share.classList.remove('is-copied'); }, 1600);
        });
      }
    });
  }

  /* Merge a shared ?w= list into local storage */
  function mergeShared() {
    var m = new URLSearchParams(window.location.search).get('w');
    if (!m) return;
    var incoming = m.split(',').filter(Boolean);
    if (!incoming.length) return;
    var ids = read();
    incoming.forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
    write(ids);
  }

  function init() {
    mergeShared();
    syncHearts();
    renderPage();
    wirePageActions();
    document.addEventListener('wishlist:change', function () { syncHearts(); renderPage(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
