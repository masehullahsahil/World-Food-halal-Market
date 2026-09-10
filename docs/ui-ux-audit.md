# UI/UX and Conversion Audit

**Site:** wfhalal.com — World Foods Halal Market, 6626 Penn Ave S, Richfield, MN 55423
**Reviewed:** `main` after PR #7 (`40c7558`)
**Scope:** analysis only. No production HTML, CSS or JavaScript was changed by this audit.

**Method.** All seven routes were rendered in headless Chromium at 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px. Section and element boxes were measured from the live layout. Contrast was measured by screenshotting each of 530 text elements and sampling the painted backdrop pixel-by-pixel, rather than reading CSS values, so text over gradients and photographs is measured correctly. Image resolution was compared against rendered CSS size. Layout shift and paint timing were captured with `PerformanceObserver`.

**One caveat on the numbers.** The sandbox blocks Google Fonts, so measurements were taken with the fallback stack (Georgia for Playfair Display, system-ui for Inter). Box sizes for cards, sections and images are unaffected. Text line counts may shift by a line or two in production, which slightly changes total page heights but not the conclusions.

---

## 1. Executive assessment

The site is technically healthy and factually disciplined. It loads fast, holds zero layout shift, passes WCAG AA contrast on every measured element, has no horizontal overflow at any width, and carries no fabricated claims. That is a better starting position than most local retail sites.

The problem is not correctness. It is **density and emphasis**. The homepage is 15.4 screens tall on a phone, and a third of that is a single grid of eight category cards that mostly repeat what the navigation already offers. The products page is another 15.4 screens and shows the same six categories twice on one page. Meanwhile the two things that actually differentiate this store — meat cut to order at the counter, and naan baked in the building — are described in text but never *shown* with the visual weight they deserve. The suqaar cuts, a genuine differentiator named in the business priorities, are represented by the lowest-resolution image on the site and sit in the last position of the meat grid.

There is also one defect that undercuts everything else: **the logo file has a transparency checkerboard baked into its pixels**. It renders as a grey-and-white tiled square behind the mark in the header and footer of all seven pages. On a black header it is unmissable. For a business asking strangers to trust its meat counter, that single artifact does more brand damage than any layout issue in this report.

The fix path does not require a redesign. It requires re-exporting two image files, compressing three over-long grids, giving the meat and bakery pages a proper visual lead, and adding one HTML attribute to the bakery video. Everything recommended here stays static, dependency-free and Cloudflare Pages compatible.

---

## 2. What already works well

Verified, not assumed. These should be protected in any future work.

| Area | Measured result |
|---|---|
| Layout stability | CLS **0.000** on all seven routes at 390 px |
| Colour contrast | **0 failures** across 530 text elements; tightest margin 4.95 against a 4.5 requirement |
| Horizontal overflow | **None** at any of nine widths from 320 to 1920 px |
| Heading structure | No level skips on any page; exactly one `h1` per page |
| Landmarks | `header`, `nav`, `main`, `footer` present on all seven pages; `lang="en"` set |
| Keyboard | Skip link is the first tab stop; focus outline is a solid 3 px on every stop; Escape closes the mobile menu and returns focus to the toggle |
| Mobile menu | Correctly removed from the tab order while closed |
| Payload | CSS 19 KB, JS 0.8 KB, 168 of 179 selectors in use |
| Images | `width`/`height` on every `<img>`, WebP `<source>` throughout, lazy loading below the fold, `fetchpriority="high"` on the hero |
| Video | `preload="metadata"` with a poster and explicit dimensions, so it costs nothing until played |

Beyond the metrics, the **store photography is a real asset**. The storefront shot and the four aisle photographs in "Visit Our Store" are authentic, well-lit and specific to this business. The awning in the storefront photo reads "GROCERY, BAKERY, AND HALAL MEAT", which communicates the offer better than any headline on the page. The naan photograph on the bakery page is genuinely appetising. This is not stock imagery, and it is the site's strongest persuasive material.

The mobile Call Store / Directions bar is well built: 48 px tap targets, correctly pinned, never covered, with body padding that keeps the footer clear.

> **Guardrail for whoever implements this.** The storefront photograph contains a window decal reading "HALAL ZABIHA". A decal in a photograph is not documentation. It must not be used to justify reintroducing certification language that PR #5 deliberately removed.

---

## 3. Top 10 UI/UX problems ranked by impact

| # | Problem | Evidence | Priority |
|---|---|---|---|
| 1 | **Logo has a transparency checkerboard baked into its pixels.** `logo_transparent.png` is mode RGB with no alpha channel and 0% transparent pixels. A ~14 px grey/white checker is literal image data. Renders in header and footer on all seven pages, 14 placements. The WebP derivative inherits it. | `logo_transparent.png` alpha histogram: `{255: 1053440}`, 0.0% transparent | **P0** |
| 2 | **Homepage is 15.4 screens tall on a phone.** 12,351 px at 390 px wide. The category grid alone is 3,926 px, 34.6% of the page, and sits between the visitor and the specials, the store photos and the FAQ. | Section measurement, 390 px | **P0** |
| 3 | **Products page shows the same categories two and three times.** Its eight category cards duplicate the homepage's eight exactly; six of those eight then reappear as department rows on the same page. Result: 12,299 px, 15.4 screens. | Heading extraction, `products/index.html` | **P0** |
| 4 | **The suqaar cuts are represented by the worst image on the site.** `chicken_suqaar.jpg` is 218×123 px, rendered into a 262×196 slot on desktop and roughly 358 px wide on mobile. It is the only upscaled image on the site and it is visibly soft next to `beef_suqaar`. Suqaar is a named business differentiator. | 1.20× upscale at desktop, ~1.6× at 390 px, ~3.3× on a 2× phone | **P0** |
| 5 | **Bakery video autoplays and loops for 21.4 s with no way to stop it.** No `controls`, no pause. The `prefers-reduced-motion` block covers transitions only, not the video. WCAG 2.2.2 requires a pause, stop or hide mechanism above 5 s. | `assets/video/bakery_video.mp4`, 21.4 s, `autoplay muted loop`, no `controls` | **P0** |
| 6 | **Meat grid buries the differentiators and leaves an orphan.** Order is four chicken items, then beef, lamb, goat liver, then the two suqaar cuts last. In the four-column desktop grid, Beef Suqaar sits alone on row three with three empty cells. Goat is represented only by liver, with no goat meat card. | Visual review, 1280 px | **P1** |
| 7 | **Card images are roughly 4.4× larger than the slot they fill.** 1,200 px source files render into 262×196 slots. The products page loads 2.1 MB of images over a full scroll, the homepage 1.6 MB. | Intrinsic vs rendered measurement, all routes | **P1** |
| 8 | **Type hierarchy collapses between section and card level.** Section headings are 44.8 px; card titles are 16 px, the same size as body copy and the same size as FAQ summaries. Nothing occupies the range between. Pages carry 20 to 24 sibling `h2` elements with no intermediate grouping. | Computed styles, homepage | **P1** |
| 9 | **The same two calls to action repeat four times per page in near-identical containers.** The homepage has four Call/Directions clusters plus the sticky bar. The specials page has three clusters, six buttons, on a page that currently has no specials on it. | CTA cluster count per page | **P1** |
| 10 | **Navigation breaks between 901 and 965 px.** "Meat Counter" wraps to two lines and the nav row height doubles from 24 px to 48 px, throwing the header off its baseline. This band covers landscape tablets and small laptops. | Width sweep in 10 px steps | **P1** |

---

## 4. Homepage recommendations

**Current anatomy at 390 px** (main content 11,340 px across nine sections):

| Section | Height | Share |
|---|---|---|
| Hero | 1,159 px | 10.2% |
| Info strip | 303 px | 2.7% |
| Intro, four cards | 1,491 px | 13.1% |
| **Category grid, eight cards** | **3,926 px** | **34.6%** |
| Specials promo | 608 px | 5.4% |
| Photo gallery | 1,715 px | 15.1% |
| Google listing | 614 px | 5.4% |
| FAQ | 1,164 px | 10.3% |
| Map | 360 px | 3.2% |

**Is it too long?** Yes on mobile, and the cause is concentrated rather than spread. Two sections, the category grid and the photo gallery, are 50% of the page. The answer is visual compression, not deletion. Every recommendation below keeps the existing copy in the DOM.

- **P0 — Compress the category grid.** Below 480 px the grid drops to a single column, so eight cards become eight full-width blocks of roughly 460 px each. Switch the small-screen layout to a two-column grid of compact cards, image on top at a shorter aspect, title and one line of text. This alone should remove roughly 1,900 px, about 2.4 screens, without losing a single word or link. The existing `.cat-grid` rule already uses `auto-fit`; the change is to the 480 px breakpoint that forces `1fr`.
- **P0 — Move the specials promo above the category grid.** Weekly specials engagement is a stated business priority, yet the promo currently sits about 60% down the page, after eight cards. Placing it directly after the intro section puts it in the first two screens on mobile.
- **P1 — Give the photo gallery a call to action.** "Visit Our Store" is the most persuasive block on the page and it asks for nothing. It is the natural place for a Directions button, and it currently has none.
- **P1 — Compress the gallery on mobile.** Five stacked photos at 260 px each plus captions is 1,715 px. The four aisle photographs are similar in subject. A two-column grid below the storefront hero image, or a horizontally scrollable row, keeps all five images and their captions while removing roughly 700 px.
- **P1 — Reduce the hero paragraph at the smallest widths.** At 320 px the hero copy runs six lines and pushes "Get Directions" underneath the sticky bar on first paint. Tightening the line count at 320–360 px brings both buttons above the fold.
- **P1 — Merge the two dark CTA bands.** The intro section's CTA band and the specials promo band are visually near-identical dark rounded panels separated only by the category grid. Differentiating them, or dropping one, removes a repetition the visitor reads as filler.
- **P2 — Open the first FAQ item by default.** Nine collapsed accordion rows are visually monotonous and hide the answers, which are the useful content. Opening the first one shows the reader what the pattern contains.
- **P2 — Reconsider the Google listing block's footprint.** It occupies 510 px on desktop and 614 px on mobile to deliver one button. A compact band would serve the same purpose.

---

## 5. Navigation recommendations

- **P1 — Fix the 901–965 px wrap.** "Meat Counter" breaks to two lines and the nav row doubles in height. Options, in order of preference: reduce the `.nav-links` gap from 2rem in that band, shorten the visible label to "Meat", or raise the mobile-menu breakpoint from 900 px to about 980 px so the hamburger takes over before the wrap occurs.
- **P1 — Enlarge the hamburger button.** `.nav-toggle` measures 30 px tall against a 44 px minimum. Its three bars plus 0.45rem padding fall short. Increasing the padding fixes it without changing the visual weight.
- **P2 — Enlarge the info-strip "Get Directions" link.** It renders 20 px tall, well under 44 px, and its contrast margin of 4.95 against 4.5 is the tightest on the site. Making it a small button solves both.
- **P2 — Move the sticky bar earlier in the DOM.** It is visually pinned to the bottom of the viewport but sits near the end of the document, so a keyboard user must traverse the whole page to reach it. Placing it directly after the header, positioned by CSS as now, matches its visual prominence.
- **P2 — Label the sticky bar.** It is an unlabelled `div`. A `role="group"` with an `aria-label`, or a `nav` element with a label, describes its purpose to assistive technology. The individual links are already clearly named.
- **P2 — Seven items is at the practical limit.** Specials is correctly placed and visible. If anything is added later, About is the candidate to fold into the footer.

---

## 6. Meat counter recommendations

This is the strongest commercial page on the site and it currently reads as a catalogue rather than a reason to drive over. The custom-cutting section, which is the actual pitch, occupies 1,387 px while the product grid below it takes 5,179 px, 72% of the page.

- **P0 — Replace `chicken_suqaar.jpg`.** At 218×123 px it is upscaled everywhere it appears and visibly soft beside the beef suqaar photograph. Since suqaar is a headline differentiator, this image should be re-shot at the counter at 1,200 px or wider. Until then it is the weakest link on the most important page.
- **P1 — Reorder the grid around the differentiators.** Lead with the two suqaar cuts and ground beef, then beef, lamb and goat, then chicken. Four chicken items currently occupy the entire first row, and the two suqaar cuts are last.
- **P1 — Fix the orphan row.** Nine cards in a four-column grid leaves Beef Suqaar alone with three empty cells. Either add a tenth card or make the final card span the remaining width as a "custom cuts, ask at the counter" prompt, which converts dead space into a conversion moment.
- **P1 — Add a photograph to the custom-cutting section.** It is currently four text cards. A single image of meat being cut to order would carry the message far better than the copy does, and there is no such photograph on the site today.
- **P1 — Drop the nine identical "Halal Meat" tag pills.** They repeat the same word nine times, add visual noise and carry no information a visitor does not already have from the page title. If a tag is useful, make it say something varied and specific, such as the animal or the cut type.
- **P1 — Reconcile the goat gap.** The page promises goat, and the only goat card is Goat Liver. Either add a goat meat card or make the copy explicit that goat is cut to order at the counter.
- **P2 — Unify the product photography.** Whole Chicken, Chicken Breast, Drumsticks, Chicken Legs, Lamb and Chicken Suqaar are cut-out shots on pure white; Ground Beef, Goat Liver and Beef Suqaar are photographed in trays or on surfaces. On white cards the cut-outs lose their edges and read as supplier catalogue images rather than this store's counter. Counter photographs would be both more consistent and more persuasive.
- **P2 — Raise the card title size.** 16 px titles under 50 px page headings is too large a jump for a page whose product names are the scannable content.

---

## 7. Afghan bakery recommendations

The page communicates in-store baking well in copy. "Traditional Afghan naan is baked in store, not delivered in" is the right sentence, and the video is the proof. The weakness is that the proof is placed and styled as a secondary element.

- **P0 — Add `controls` to the video.** A 21.4 s clip that autoplays and loops with no pause control is a WCAG 2.2.2 failure. Adding the `controls` attribute is a one-attribute HTML change with no JavaScript and no dependency. Pairing it with a `prefers-reduced-motion` rule that suppresses autoplay would be better still.
- **P1 — Give the video more prominence.** It is capped at 330 px wide and sits below the feature block. It is the single best evidence that naan is baked in the building, which is the page's entire proposition. Moving it up beside the feature copy, or widening it, puts the proof where the claim is.
- **P1 — Fix the invisible secondary button.** "See Weekly Specials" uses `.btn-secondary`, which is white on a white section, so it renders as plain green text with no button shape. This is the only instance of this problem on the site. The `.btn-outline` variant that already exists elsewhere solves it.
- **P1 — Re-export `afghani_bread.jpg`.** At 540×266 px it is essentially rendered at native size in the feature block, so it will be soft on any 2× phone. Its 2.03 aspect also loses about 34% of the frame when cropped into the 4:3 product card. A wider re-export, and a separate crop for the card, fixes both.
- **P2 — Drop the six identical "Bakery" tag pills**, for the same reason as the meat page.
- **P2 — Add a photograph of the oven or the baker.** The naan photograph shows the product; nothing shows the process. One image of bread coming out of the oven would make the in-store claim self-evident to a visitor who does not play the video.

---

## 8. Products recommendations

At 12,299 px on mobile this is tied with the homepage as the longest page on the site, and most of that length is repetition rather than content.

- **P0 — Remove the duplicated category grid.** The eight category cards at the top are identical to the homepage's eight. Six of them then reappear as department rows further down the same page. Keep the two that lead somewhere new, Fresh Halal Meat and Afghan Bread & Bakery, and let the department list carry the rest. This removes roughly 3,900 px, about five screens, and deletes no product information whatsoever.
- **P1 — Make the department rows denser.** On desktop each row is a 260 px image beside text and tag pills, leaving substantial empty space to the right. Two columns of department cards would halve the page height while keeping all eleven departments and every pill.
- **P1 — Distinguish on-page anchors from page links.** The top cards mix links to other pages with jump links to anchors further down the same page, with no visual difference between them. A visitor clicking "View Produce" expects a page, not a scroll.
- **P2 — Reconsider the amber notice box.** The "Selection changes week to week" panel is the only amber element on the entire site. The message is valuable and should stay; the styling is a one-off that does not belong to the design system.
- **P2 — Review category count.** Eleven departments is defensible for a store this varied, and the content is genuinely useful for search. No department should be deleted. The fix is layout density, not fewer categories.

---

## 9. Weekly specials recommendations

The current empty state is honest and correctly avoids inventing offers. Visually it under-delivers: a modest white card floating in a large light band, followed by a cross-link section that occupies 65% of the mobile page. The page is 2,023 px of "look at other departments" and 511 px of actual specials messaging.

- **P1 — Make the empty state fill its space with intent.** Widen the panel, give it a heading with the weight of a real section heading, and state plainly when specials change, if the owner can confirm a cadence. An empty state reads as intentional when it looks designed, not when it looks small.
- **P1 — Cut one of the three CTA clusters.** Hero, empty state and closing band each carry Call plus Directions. Six buttons for two actions on a page with no content is noise. Two clusters is sufficient.
- **P2 — Reduce the cross-link section.** Three large cards are more than a short page needs. A compact row would leave the specials content as the page's centre of gravity.
- **P2 — Replace the meat cross-link image.** It uses the whole-chicken cut-out, which is not the most appetising or representative lead for an entire meat department.

### Proposed card anatomy for real specials

For when the owner supplies actual offers. **Nothing below may be filled in from assumption.** Any field the owner does not supply should be omitted from the markup rather than estimated, and no percentage discount should ever be computed and displayed unless both prices are owner-supplied.

| Field | Required | Notes |
|---|---|---|
| Product image | Optional | Omit the image element entirely if none is supplied. Do not substitute a generic category photo for a specific product. |
| Product name | **Required** | The only field that is always present. |
| Sale price | **Required** | Exactly as supplied, including currency. |
| Regular price | Optional | Render only if the owner supplies it. Never infer it. |
| Unit | Optional | lb, bag, case, each. |
| Sale badge | Optional | A short owner-supplied label. Do not generate "SAVE 30%" from arithmetic. |
| Valid-through date | Optional | Render as a real date. If absent, omit the line rather than writing "while supplies last". |
| Availability note | **Required** | The existing "Selection and availability may vary" line, shown once per page rather than per card. |

The `.specials-board`, `.special-card` and `.special-price` CSS rules already exist and are currently dormant, so this layout needs no new stylesheet work beyond a badge and a date line. The existing `<!-- WEEKLY SPECIALS: EDIT ITEMS BELOW -->` comment block and its numbered instructions should be kept and extended to cover the new optional fields, since a non-technical owner is the intended editor.

A practical addition: the instructions should state that a card with a price but no valid-through date is acceptable, and that stale specials must be removed rather than left up, because an expired price is the one error on this page that damages trust with a customer standing at the till.

---

## 10. Mobile recommendations

Measured page heights, in screens of scrolling at an 800 px viewport:

| Route | 320 px | 360 px | 390 px | 430 px | 768 px |
|---|---|---|---|---|---|
| Home | 15.9 | 15.6 | **15.4** | 15.5 | 12.0 |
| Products | 15.2 | 15.0 | **15.4** | 15.6 | 14.7 |
| Meat counter | 10.2 | 10.1 | 10.3 | 10.4 | 6.8 |
| Bakery | 8.6 | 8.7 | 8.7 | 8.8 | 6.4 |
| Specials | 5.2 | 5.1 | 5.2 | 5.2 | 4.0 |
| Contact | 4.6 | 4.4 | 4.3 | 4.2 | 4.1 |
| About | 4.6 | 4.4 | 4.3 | 4.2 | 3.7 |

- **P0 — Excessive scrolling on the two longest pages.** Addressed by the homepage and products recommendations above. Target is roughly 9 screens for the homepage and 8 for products, achievable through layout density alone.
- **P1 — 768 px is the worst-served width.** The products page is still 14.7 screens there because departments have already stacked to one column while the viewport is wide enough for two. A tablet-specific two-column rule for `.department` would fix it.
- **P1 — The 320 px hero.** "Get Directions" lands underneath the sticky bar on first paint because the hero paragraph runs six lines. Worth tightening, as 320 px remains a real floor for older and budget Android devices.
- **P2 — Button wrapping is handled correctly.** Below 480 px `.hero-actions` and `.cta-row` switch to column and buttons go full width. No change needed.
- **Verified working, do not regress:** no horizontal overflow at any width; the menu opens, reports correct ARIA state, shows all seven links and closes on Escape; the sticky bar stays pinned with 48 px targets that nothing covers; images and typography scale correctly throughout.

---

## 11. Image-quality findings

**Repository totals:** 65 files, 11.25 MB. Full-scroll payload by page (WebP path): products 2.1 MB, homepage 1.6 MB, bakery 452 KB, specials 250 KB, about 247 KB, meat 239 KB, contact 12 KB.

### Specific defects

| File | Problem | Priority |
|---|---|---|
| `logo_transparent.png` | Mode RGB, **no alpha channel**, 0.0% transparent pixels. A ~14 px grey/white transparency checkerboard is baked into the image data. Appears in the header and footer of all seven pages. | **P0** |
| `logo_transparent.webp` | Same checkerboard, inherited from the PNG. | **P0** |
| `chicken_suqaar.jpg` / `.webp` | 218×123 px. The only upscaled image on the site: 1.20× at desktop, ~1.6× at 390 px, ~3.3× on a 2× phone. Also loses ~25% of the frame to the 4:3 card crop. | **P0** |
| `afghani_bread.jpg` / `.webp` | 540×266 px, rendered at 528×260 in the bakery feature, so effectively native and soft on any high-density screen. Its 2.03 aspect loses ~34% of the frame in the 4:3 card. | **P1** |
| `drinks1.*`, `perfume.*` | Portrait sources at 0.75 aspect forced into 4:3 landscape card slots. **~44% of each frame is cropped away.** | **P1** |
| `meat_chicken_whole.jpg` | 368 KB JPEG against a 15.8 KB WebP of identical dimensions. A 23× gap suggests the JPEG was never optimised. Non-WebP browsers pay the full cost. | **P2** |
| `meat_ground_beef.jpg` | 186 KB for a 500×500 image, and 500 px is low for a card that renders at 358 px on mobile. | **P2** |
| `storefront.jpg` | 1.4 MB at 3741×2104. The WebP is 1600×900 at 235 KB. This is the hero LCP image, so non-WebP clients take a 1.4 MB hit on first paint. | **P2** |

### Systematic inefficiency

Every card image is roughly **4.4× oversized for its slot**: 1,200 px source files rendering into 262×196 CSS pixels on desktop. A single 640 px variant with a `sizes` attribute would serve both desktop and 2× mobile correctly. Rough estimate, and it is an estimate: this would cut the products page from about 2.1 MB to about 600 KB, and the homepage from about 1.6 MB to about 500 KB. **P1.**

### Unused files

Never referenced by any HTML, roughly 1.6 MB of repository weight: `drinks2.jpg`, `drinks2.webp`, `drinks3.jpg`, `drinks3.webp`, `logo.jpg` (556 KB), `logo.webp`, and `bakery_video_poster.webp` (the `poster` attribute points at the `.jpg` only). These are not served to visitors, so this is repository hygiene rather than a performance issue. **P2.**

### Photography direction

The store photography is the site's strongest material and should be extended rather than replaced. The gap is that **no photograph shows a person doing anything**. There is no image of meat being cut, no image of bread coming out of the oven, no image of the counter in use. For a business whose two differentiators are both *services* rather than products, this is the most valuable photography that does not yet exist. **P1**, and it needs the owner, not a developer.

---

## 12. Design-system recommendations

The system is small, coherent and cheap to maintain: 19 KB of CSS, 179 selector rules, 168 in use. The eleven unmatched rules are mostly the dormant specials-card styles waiting for real content, plus state-dependent selectors that only match when open. Only `.dark .reviews-panel` is genuinely dead. This is a healthy baseline and the recommendations below are refinements, not a rebuild.

**Measured type scale, desktop homepage:**

| Element | Size / weight | Line height |
|---|---|---|
| `.hero h1` | 75.2 px / 700 | 88.7 px |
| `.section-heading h2` | 44.8 px / 700 | 52.9 px |
| `.split-heading h2` | 39.2 px / 700 | 46.3 px |
| `.hero p` | 17.6 px / 400 | 30.8 px |
| `.section-heading p` | 16.8 px / 400 | 25.2 px |
| `.cat-body h2` | **16 px** / 700 | 18.9 px |
| `.faq-item summary` | 16 px / 700 | 24 px |
| `.cat-body p` | 14.4 px / 400 | 21.6 px |
| `.info-strip h2` | 15.2 px / 700 | 17.9 px |

- **P1 — Add a step between 44.8 px and 16 px.** Card titles currently sit at body-text size while section headings are nearly three times larger. A 20–24 px step for card and product titles would restore the middle of the hierarchy and make product names scannable, which matters most on the meat page.
- **P1 — Constrain line length.** `.section-heading p` runs about 90 characters per line and `.split-heading p` about 88. Comfortable reading is 45 to 75. A `max-width` around 60ch fixes both without touching the copy.
- **P1 — Resolve the green pill ambiguity.** The same green pill styling means two different things: a call to action in `.cat-body span` ("Shop Meat Counter"), and a passive content tag in `.tag` and `.check-list li` ("Halal Meat", "Leafy greens"). A visitor cannot tell which are clickable. Give the CTA variant a distinct treatment, such as an arrow or a link colour, and leave tags flat.
- **P1 — Give `.btn-secondary` a border, or use `.btn-outline` on light backgrounds.** `.btn-secondary` is white-filled and vanishes on white sections. This currently affects one button but the trap will recur.
- **P2 — `.info-strip h2` at 15.2 px is smaller than body copy elsewhere.** A heading should not be the smallest text in its own section.
- **P2 — Retire the one-off amber `.notice` panel** or promote it to a proper system component if the availability message is going to be reused.
- **P2 — Delete the dead `.dark .reviews-panel` rules.**

**Direction.** The current palette of deep green, gold accent and near-black, with a serif display face over a neutral sans, reads as a considered neighbourhood market rather than a SaaS product or a luxury brand. That judgement is correct and should be preserved. The risk is not the palette; it is that the card treatment (uniform white, 1 px border, 8 px radius, identical shadows everywhere) is generic enough to drift corporate. The antidote is not new colours but more of the store's own photography and less uniform card repetition.

---

## 13. Accessibility and performance findings

### Passing, verified

Zero contrast failures across 530 elements. Zero heading level skips. Full landmark structure and `lang` on all seven pages. Skip link first in tab order. Solid 3 px focus outline on every interactive element. Escape closes the mobile menu and restores focus to the toggle. Menu links correctly excluded from the tab order while hidden. Map iframes carry descriptive `title` attributes and lazy loading. CLS is 0.000 on every route.

### Issues

| Finding | Detail | Priority |
|---|---|---|
| Video has no pause control | 21.4 s autoplaying loop, no `controls`, and `prefers-reduced-motion` does not suppress it. WCAG 2.2.2. | **P0** |
| `.nav-toggle` is 30 px tall | Below the 44 px minimum, on all seven pages. WCAG 2.5.8. | **P1** |
| `.strip-link` is 20 px tall | Homepage info strip Directions link. Also the tightest contrast on the site at 4.95. | **P2** |
| 20–24 sibling `h2` per page | No level skips, but heading-based navigation offers a flat list of up to 24 peers. Card titles should be `h3` under a section `h2`. | **P2** |
| Five `target="_blank"` links with no warning | Maps and directions links open new tabs with no indication. WCAG 3.2.5 advisory. | **P2** |
| Sticky bar is an unlabelled `div` | Individual links are clearly named, so this is a refinement, not a failure. | **P2** |
| Sticky bar late in DOM order | Keyboard users must traverse the page to reach a control that is always visible. | **P2** |

### Core Web Vitals risk

**CLS is solved** and the explicit `width`/`height` attributes that achieve it must be preserved through any layout change. **LCP** carries the main residual risk: `storefront.jpg` is 1.4 MB for clients without WebP support, and the hero `<source>` declares `sizes="100vw"` while offering only a single srcset candidate, so no responsive selection can occur. Adding two or three width variants would benefit every mobile visitor. **INP** is not a concern: 0.8 KB of JavaScript with a single click handler and no third-party scripts.

The heaviest realistic cost today is a full scroll of the products page at roughly 2.1 MB of images. Right-sizing the card images, item 7 in the top ten, is the single highest-leverage performance change available and it requires no architectural change at all.

---

## 14. Recommended implementation plan

Four stages, ordered so the highest-impact and lowest-risk work lands first. Nothing here introduces a framework, a build step, a backend or a dependency. Every change is static HTML, CSS or a replacement image file, and all of it remains Cloudflare Pages compatible.

### Stage 1 — Correctness and trust (P0, small diff, high impact)

| Change | Files |
|---|---|
| Re-export the logo with a real alpha channel, no checkerboard | `assets/images/logo_transparent.png`, `assets/images/logo_transparent.webp` |
| Replace the suqaar photograph at 1,200 px or wider | `assets/images/chicken_suqaar.jpg`, `assets/images/chicken_suqaar.webp` |
| Add `controls` to the bakery video; suppress autoplay under `prefers-reduced-motion` | `afghan-bakery-richfield/index.html`, `assets/css/styles.css` |
| Fix the invisible "See Weekly Specials" button | `afghan-bakery-richfield/index.html` |

*No HTML changes are needed for the two image replacements: same filenames, same dimensions in the case of the logo.*

### Stage 2 — Page length and density (P0/P1, the conversion work)

| Change | Files |
|---|---|
| Two-column compact category cards below 480 px | `assets/css/styles.css` |
| Move the specials promo above the category grid | `index.html` |
| Remove the duplicated category grid from the products page | `products/index.html` |
| Two-column department rows, including a 768 px rule | `assets/css/styles.css`, `products/index.html` |
| Compress the photo gallery on mobile; add a Directions CTA | `index.html`, `assets/css/styles.css` |
| Reorder the meat grid; resolve the orphan card | `halal-meat-richfield/index.html` |
| Merge or differentiate the duplicated homepage CTA bands | `index.html` |

### Stage 3 — Design system and navigation (P1)

| Change | Files |
|---|---|
| Add a 20–24 px card-title step; constrain line length to ~60ch | `assets/css/styles.css` |
| Distinguish CTA pills from content tags | `assets/css/styles.css`, `index.html`, `products/index.html`, `specials/index.html` |
| Remove repeated identical tag pills | `halal-meat-richfield/index.html`, `afghan-bakery-richfield/index.html` |
| Fix the 901–965 px nav wrap; enlarge `.nav-toggle` to 44 px | `assets/css/styles.css` |
| Give `.btn-secondary` a border for light backgrounds | `assets/css/styles.css` |
| Strengthen the specials empty state; cut one CTA cluster | `specials/index.html`, `assets/css/styles.css` |

### Stage 4 — Performance and polish (P1/P2)

| Change | Files |
|---|---|
| Generate 640 px card variants; add `srcset`/`sizes` to card images | all seven page files, plus new files under `assets/images/` |
| Add responsive variants for the hero image | `index.html`, `assets/images/storefront.*` |
| Re-optimise the oversized JPEG fallbacks | `assets/images/meat_chicken_whole.jpg`, `meat_ground_beef.jpg`, `storefront.jpg` |
| Delete unused image files | `assets/images/drinks2.*`, `drinks3.*`, `logo.jpg`, `logo.webp`, `bakery_video_poster.webp` |
| Card titles from `h2` to `h3`; label the sticky bar; move it earlier in the DOM | all seven page files |
| Enlarge `.strip-link`; remove dead CSS | `index.html`, `assets/css/styles.css` |

### Owner-dependent, cannot be implemented by a developer

These are blocked on the business, not on code.

1. **Counter and oven photography.** Meat being cut, bread coming out of the oven. The highest-value asset the site does not have, and the only way to *show* rather than assert the two differentiators.
2. **A replacement suqaar photograph**, if a re-shoot is preferred over re-exporting existing material.
3. **The official "Ask for reviews" link** from the Google Business Profile dashboard, still outstanding from PR #7 and recorded in `docs/google-business-listing-link.md`.
4. **Confirmation of a specials cadence**, if one exists, so the empty state can say when to check back.

### Regression guardrails

Any implementation of this plan must preserve, and should be re-measured against: CLS of 0.000; zero contrast failures; no horizontal overflow from 320 to 1920 px; one `h1` per page with no heading level skips; the skip link, focus outlines and Escape-to-close behaviour; `width`/`height` on every image; WebP sources and lazy loading; the sticky bar's 48 px tap targets; and the factual guardrails established in PR #5 and PR #7, which no visual change may erode.
