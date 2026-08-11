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
