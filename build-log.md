# Build Log

## 2026-08-07 — Mobile-responsiveness audit (hero content-clipping fix)

**Task**: Sitewide mobile-responsiveness audit per 15-point checklist (Shop/Collections, hero, images, cropped sections, horizontal overflow, product cards, typography, buttons, footer, sliders, CLS, breakpoints 320-768px).

**Root cause found and fixed**:
- `sections/hero.liquid` — `.hero__media` had a fixed `aspect-ratio:1152/565` + `overflow:hidden` at all widths, with `.hero__content` absolutely positioned `inset:0`. At 375px viewport the card resolved to ~160px tall, but the stacked eyebrow/heading/subtext/buttons need ~300px+ — excess content was silently clipped. Fix scoped to `@media (max-width:700px)`: card now grows to fit content (`aspect-ratio:unset; min-height:420px`, image made an absolute cover layer, `.hero__content` switched to normal flow with padding). Desktop untouched.

**Verified live** (post-push, Shopify GitHub sync):
- Hero content-height vs card-height matched at 320px (599≈599), 375px (560.7≈561), 768px (345.8≈346) — no clipping at any tested width.
- Horizontal-overflow sweep (`bodyScrollWidth > viewport`) clean at 320/375/768px on: home, `/collections/bedcover`, `/cart`, `/pages/contact`, `/pages/corporate`, a product page. Only pre-approved intentional scroll strips (`bs-row`, `tm-row`, `rel__track`, `mc-hero__cats`) flagged, no genuine overflow.

**Not fixed / flagged, non-blocking**: `.fc__dots` (featured-collections) carries ~20px of invisible scroll slack pre-reveal (opacity:0 state before its IntersectionObserver `.is-revealed` class fires) — not visually broken, couldn't force-verify resolution via synthetic scroll in headless preview; ask user to confirm on a real device if they want it chased further.

**Scope note**: prior sessions (see project `memory.md`) already fixed most of the 15-point checklist (main-product grid, popup, contact map, featured-collections title, sleepscape hover/tap, mc-grid). This session's live sweep across 6 page types × 3 breakpoints found no further genuine issues beyond the hero bug — this is a spot-check, not an exhaustive line-by-line pass of every remaining checklist item (product-card/typography/buttons/footer/CLS across every template).

**Git**: commit `1bf5464` (hero fix) + merge `a2da5f8` (routine `shopify[bot]` settings sync). Pushed clean to `origin/main`.

## 2026-09-17 — Product Dimensions + Thread Count added to product descriptions (live Admin API, no code changes)

**Task**: client-supplied spreadsheet (294 spec rows, 6 tabs) mapped to live products; append `Product Dimensions` and `Thread Count` paragraphs to each matching product's `descriptionHtml` via `productUpdate` GraphQL mutation, without disturbing existing description text.

**Result**:
- Store: `0ww0zm-c1.myshopify.com` — verified via `{ shop { name myshopifyDomain } }` before any write.
- 106 total products fetched (paginated `products(first:50)`).
- **96 updated successfully**, 0 `userErrors` across all 96 `productUpdate` calls.
- **8 skipped** as leftover test/duplicate products (6× `Woven Harmony *-copy*` handles, 1× `blanket` handle w/ title "WOVEN HARMONY", 1× bare DRAFT "Woven Harmony" with empty description) — none written to.
- **2 matched but had no dimensions/thread_count in the source sheet** (Ornate Greek Key Border, Ornate Royal Chain Border) — left as-is.
- **10 products got Product Dimensions only, no Thread Count** — the sheet's thread_count cell for these was non-numeric junk (`"Higher TC"` ×6, `"3800grms"` ×4 rows collapsing to these products) rather than a number; omitted per the "plain number" formatting rule instead of writing bad data live. Flagged for client to supply real thread-count values.
- Matching done via a Python fuzzy-match script (normalize + Jaccard + SequenceMatcher, threshold 0.55) comparing product title to spreadsheet design_name, since Shopify consolidates color variants into one product while the sheet has one row per color.

**No git commits** — this task was 100% Shopify Admin content (GraphQL), not theme/code, so nothing to push.

Full narrative + data-quality findings logged in `memory.md` under "2026-09-17 — Product Dimensions + Thread Count appended to all product descriptions".

## 2026-09-11 to 2026-09-18 — Razorpay integration, product-card colour swatches, misc content/CSS fixes

**Razorpay Payments**: activated "01 Cards, UPI, NB, Wallets by Razorpay" as a payment provider (found under Settings → Payments → Additional payment providers → Add provider, NOT the card-only "Choose a provider" list), linked the merchant's Razorpay account via its own OAuth-style confirmation popup, verified with a real test-mode Razorpay checkout (test card, payment captured, confirmed via Razorpay CLI). Fixed Domestic "Standard" shipping rate: renamed from Hindi "मानक" → "Standard" and set to free (₹0) via `deliveryProfileUpdate`. Removed COD/returns wording from product page Terms & Conditions. Updated WhatsApp number to `918657944323`.

**Product-card colour swatches** (new feature): every product card across the site now shows up to 6 colour swatch dots with three fallback tiers (shade metafield → colour word in title → client-side photo colour-sampling), a "+N" overflow badge, colour-filtered collection pages show the matching variant's photo per card, and clicking a swatch now swaps that card's own image in place (no navigation) while keeping the existing hover-cycle effect working afterward. New files: `snippets/swatch-hex.liquid`, `swatch-hex-real.liquid`, `url-with-variant.liquid`, `assets/product-card-swatch-fallback.js`, `product-card-swatch-preview.js`.

**Bugs found and fixed along the way**: (1) single-colour/photo-sampled products had an unassigned `filtered_url` → `<a href="">` → clicking looked like the page reloading; (2) infinite-scroll spinner flashed on every collection load regardless of whether more pages existed, due to a CSS specificity bug where `#shopify-section-{id} .mc-load-spinner{display:flex}` outranked the browser's default `[hidden]{display:none}`; (3) colour-filtered card/swatch links produced a broken doubled `variant=` query param since Shopify already auto-appends its own to `product.url` inside a filtered collection.

**GST/tax investigation (informational, no changes)**: client wants GST rate to depend on product price (≤₹2499 → 5%, >₹2499 → 18%) with tax-inclusive pricing shown separately at checkout. Confirmed `shop.taxesIncluded` is already `true` (checkout already shows included-tax breakdown for free). Confirmed via full Admin API `Mutation` schema dump that Shopify has **no API for tax rate configuration at all** (Admin-UI-only) and, more fundamentally, **no price-conditional tax rate concept** — proposed a two-collection (5%/18%) + manual override + auto-sync script approach instead, pending client go-ahead.

Full narrative in `memory.md` under "2026-09-11 to 2026-09-18 — Razorpay payment gateway, product-card colour swatches, misc fixes".
