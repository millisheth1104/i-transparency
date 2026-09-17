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
