# Build Log

## 2026-08-07 — Terra Weave & Knitscape bedspread images uploaded

- Mapped local design-code folders to Shopify products by visual pattern match:
  - W190101/2/3/4/5 → Terra Weave Broken Herringbone/Houndstooth/Stripes/Sandstone/Desert Flow (all 6 color variants each: Ivory, Linen, Beige, Mocha, Grey, Sage)
  - K3800103/104 → Knitscape Herringbone/Stripes
- Uploaded via Shopify staged uploads (stagedUploadsCreate → curl PUT → productCreateMedia → productVariantAppendMedia).
- Result:
  - Terra Weave: all 5 products, all 30 variant images attached.
  - Knitscape Herringbone: 3/5 variants imaged (Beige, Oatmeal, Tea) — Natural and Midlife Brown have no source photo locally.
  - Knitscape Stripes: 1/4 variants imaged (Beige) — Oatmeal, Green, Grey have no source photo locally.
- Converted oversized Knitscape TIFFs (>5000px) to JPEG and resized to 2400px max — originals failed Shopify media processing.

## 2026-08-11 — Bulk product_type categorization (97 products)

- Set `product_type` via `productUpdate` on all 97 products lacking it: 73 → "Bedsheet Set", 1 → "Fitted Sheet Set", 13 → "Bedspread", 1 → "Comforter", 3 → "Cushion Cover", 4 → "Duvet Cover Set", 2 → "Throw".
- Done in aliased-batch GraphQL mutations (~25 products/call) for speed.

## 2026-08-11 — Homepage content pass from "Website Images and content.docx"

- Source: client-provided docx with 18 reference/lifestyle images and inline review notes on the homepage.
- **Trust bar (`sections/hero.liquid`)**: bumped hardcoded CSS — text 12px→15px (mobile 11px→13px), icon 15px→19px (mobile →16px). No theme-editor setting existed for this; kept it a fixed CSS change per user's choice.
- **"Build your sleepscape" hotspot**: investigated the doc's claim that the bedspread hotspot should read "Woven Harmony" instead of "Knitscape". Found the wired product (`knitscape-stripes-bedspread`) is real and ACTIVE; every "Woven Harmony" product in the catalog (9 of them) is a DRAFT/zero-stock duplicate from earlier test data. Left the hotspot pointing at Knitscape per user decision — no safe active product to swap in.
- **"Shop by category" (`templates/index.json` → `sections.category_showcase`)**: was 5 blocks (Bed covers, Comforters, Throws, Pillow covers, Cushions). Per doc: swapped in new lifestyle images for Comforters, Throws, and Cushions (renamed "Cushions" → "Cushion Covers" to match doc wording), and added 2 new blocks — Bedsheet, Duvet Cover — using images extracted from the docx and uploaded via Shopify `stagedUploadsCreate` → curl PUT → `fileCreate` (registered as `shop_images/*_category.*`). "Bed covers" left untouched — doc explicitly noted "is fine".
- **"Bestsellers" section**: found it pulls live products dynamically from the `bedcover` collection (no per-block images/titles in the theme). The doc's 6 named bestseller images (Bamboo comforter, Green knitted, Woven harmony, Terra weave, Embroidery – linen thread, Statement tape) have no matching products in the catalog — not actionable via theme edit; would require creating/finding those products in Shopify admin first.
- **"Woven, not knitted" / "Bare Earth" sections**: doc only had "keep but need to change, thinking on this" — no concrete instruction. Left untouched per user decision.
- Committed and pushed to `origin/main` (merged cleanly with 2 routine `shopify[bot]` sync commits first, no conflicts).

## 2026-08-11 — Hover-to-swap secondary product image (all product cards)

- `snippets/product-card.liquid`: when a product has a 2nd image (`p.images[1]`), render it as an absolutely-positioned `.product-card__media-alt` `<img>` on top of the primary image.
- `assets/base.css`: `.product-card__media-alt` starts at `opacity:0`, crossfades to `opacity:1` on `.product-card:hover`. Single-image products are unaffected (no alt element rendered) and keep the existing hover-zoom only.
- Applies everywhere this snippet is used: Bestsellers, Related products, Shop grid, Search, Wishlist.
- Verified in a standalone static HTML mock (real markup + real CSS, served via `python -m http.server` through `.claude/launch.json`) rather than the live theme — no local Shopify dev server/storefront credentials available this session. Hover crossfade confirmed visually; committed and pushed to `origin/main`.

## 2026-08-11 — Extended hover swap to auto-cycle through all images (3rd, 4th, ...)

- Replaced the single alt-image crossfade with a full cycling gallery: `snippets/product-card.liquid` now renders up to 5 of the product's images as stacked `.product-card__media-frame` elements (first marked `.is-active`).
- New `assets/product-card-cycle.js` (event-delegated, same pattern as `wishlist.js`): on hover, steps `.is-active` to the next frame every 900ms, looping; on mouse-leave, clears the interval and resets to frame 1. Loaded site-wide via `layout/theme.liquid`.
- `assets/base.css`: frames are `position:absolute;inset:0;opacity:0`, `.is-active` gets `opacity:1`; inactive frames get `pointer-events:none`.
- Products with only 1 image render a single frame and never get `data-pc-cycle` — no JS cost, unaffected behavior.
- Verified in the same static HTML mock, confirmed frame-advance, wrap-around, and reset-on-leave all work. Committed and pushed to `origin/main`.

## 2026-08-11 — Shop mega-menu resize + category merge

- Client sent a Figma export with exact target measurements for the "Shop" mega-menu: panel 628×254, sub-collection icon grid 271×153, category list 112×203, sub-item cell 113×94.
- `assets/mega-menu.css`: panel width restored to 628px (was reduced to 460px in an earlier session). Sub-collection grid (`.mega-menu__grid`) capped at `max-width:271px` with `column-gap:45px; row-gap:24px` — solving the two Figma measurements as simultaneous equations (2-row span 113×94, full 3-row grid 271×153) gives column width 113px, row height ~35px, row-gap 24px, which is what's now implemented; comes out to 271×156, effectively exact.
- Panel/list height (254/203) intentionally **not** forced to the literal px value — the Figma mock was measured against a 5-category list, and forcing that height with the original 7-category list would have clipped "Duvet Cover Set"/"Cushion Covers" text. Resolved properly instead (see below) by actually trimming to 5 categories, which the client then separately requested mid-task.
- **Category merge (client catalog request)**: client asked to merge "Cushion Covers" into "Pillows" and "Duvet Cover Set" into "Comforters", in the mega-menu specifically. Added Cushion Covers' 3 products to the Pillows collection and Duvet Cover Set's 4 products to the Comforters collection via `collectionAddProducts` (both manual/non-smart collections — safe to dual-add without breaking rules). Then edited the **"Shop Menu Root" collection's `custom.sub_collections` metafield** (`gid://shopify/Collection/311863148751` — the actual data source for the mega-menu's left-column category list, found via the `main-menu`'s "Shop" nav item) to drop the Duvet Cover Set and Cushion Covers collection references, leaving exactly 5: Bedsheets, Bed Covers, Comforters, Throws, Pillows. Did **not** delete the now-orphaned Duvet Cover Set/Cushion Covers collections themselves (non-destructive — their pages still exist, just unlinked from this nav).
- **Data-source gotcha worth remembering**: this theme's mega-menu category list is NOT hardcoded in a template/section — it's entirely metafield-driven per top-level nav link (`sections/header.liquid` reads `link.object.metafields.custom.sub_collections.value`). There are at least 3 similarly-named collections that easily get confused: "Bedsheets" (handle `frontpage`, id ...108175, its own metafield holds ITS sub-categories: Printed/Jacquards/Bamboo/Embroidery/Solid — a red herring if you're looking for the main category list), "Collections Menu Root" (`collections-menu-root`, a different nav item, catch-all smart collection), and "Shop Menu Root" (`shop-menu-root`, id ...148751 — the actual one backing the "Shop" nav's mega-menu). Always trace from the live `menus(first:10)` GraphQL query → the specific nav item's `resourceId` → that collection's own metafield, rather than assuming by name.
- Verified the new dimensions in a static HTML mock (real `mega-menu.css` linked, real markup) via the Browser pane. **Gotcha hit while doing this**: the Browser pane's default viewport (734px) is under the mega-menu's own `@media (max-width:990px)` mobile breakpoint, so the panel showed `position:static`/wrong width until explicitly resized wider (`resize_window` to 1280×900) — worth remembering for any future desktop-only component preview in this repo.
- Theme CSS change committed/pushed to `origin/main`. Catalog/metafield changes (product-collection adds, sub_collections edit) applied live immediately via Admin API — no theme deploy needed for those.
- Follow-up: client asked to fully delete the now-orphaned "Duvet Cover Set" (`gid://shopify/Collection/311862919375`) and "Cushion Covers" (`gid://shopify/Collection/311989731535`) collections. Deleted via `collectionDelete` — their products remain intact (already copied into Comforters/Pillows beforehand), only the collection groupings themselves are gone.

## 2026-08-11 — "Collections" mega-menu: fixed 0-product pattern collections + trimmed a dead nesting level

- Client pointed at a design screenshot showing the "Collections" nav's mega-menu (Digital Prints/Jacquards/Bamboo/Embroidery/Solid) with a "FEATURED" header, "View all" link, and real product images — the live site showed this list with empty/no-image content instead.
- **Root cause**: all 5 pattern collections (Printed/Jacquards/Bamboo/Embroidery/Solid, e.g. `gid://shopify/Collection/311862984911`) are smart collections whose rule checked `TYPE EQUALS "Digital Prints"` etc. — but `product_type` on real products holds a different taxonomy (Bedsheet Set/Bedspread/etc., see the 2026-08-11 bulk product_type session above); the actual pattern is stored as a **tag** instead (confirmed via `products(query:"tag:'Digital Prints'")` — real products already tagged correctly). Fixed by `collectionUpdate`-ing all 5 rule sets from `TYPE EQUALS` to `TAG EQUALS` the same condition string. Product counts went from 0/0/0/0/0 to 45/3/1/22/4 immediately.
- **Second issue found while verifying**: each of those 5 collections *also* had its own `custom.sub_collections` metafield (e.g. Printed → Essence/Ornate/Plush/Reflect design-line collections), so the mega-menu's existing logic (`sections/header.liquid`/`mega-menu.liquid`: sub_collections present → show nested icon-grid; else → show featured-products) was taking the nested-grid branch instead of the featured-products-with-images branch the design called for. Confirmed with the user before changing (this removes a real menu level, not just a style tweak) — cleared all 5 `custom.sub_collections` metafields to `[]` via `metafieldsSet`, which now lets the existing (already-correct, unmodified) `mega-menu-featured-products.liquid` fallback render Featured/View all + images as designed. **No template/CSS code changes were needed at all** — this was purely a catalog-data fix (collection rules + metafields).
- Verified live via the Browser pane against `https://0ww0zm-c1.myshopify.com` (JS-forced `.is-open` class, since synthesized CDP hover wasn't reliably triggering the real `mouseenter` listener on this nav — see gotcha below) — screenshot now matches the client's target exactly.
- **Gotcha**: `computer{action:"hover"}` on the live storefront's nav trigger did not reliably fire the site's real `mouseenter` listener (mega-menu stayed closed across several attempts/coordinates). Worked around by using `javascript_tool` to directly add the `.is-open` class the same way `mega-menu.js`'s `open()` does, which correctly reflected the real CSS/markup. Worth trying this JS-class-toggle shortcut first next time a hover-triggered UI won't open via synthetic `computer` hover.
- The Essence/Ornate/Plush/Reflect etc. sub-collections still exist and are still directly reachable by URL — only their mega-menu nesting was removed, nothing was deleted.
