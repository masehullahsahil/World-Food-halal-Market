# Post-Optimization Audit

Follow-up to `docs/ui-ux-audit.md`. Covers what PR #9 fixed, what this pass fixed, and what is left.

**Measurement note.** All figures come from headless Chromium against a local server, scrolling each page to the bottom so every lazy image loads. The sandbox blocks Google Fonts and Google Maps, and this Chromium build cannot decode H.264, so those three are excluded from error counts rather than reported as site defects.

---

## 1. What PR #9 already solved

| Audit item | Outcome |
|---|---|
| Bakery video had no pause control | `controls` added, `autoplay` removed, playback started from JS only when reduced motion is not requested |
| Homepage 15.4 screens on a phone | 27.7% shorter at 390px |
| Products page duplicated its categories | Six redundant cards removed; 26.0% shorter at 390px, 52.4% at 768px |
| Nav wrapped between 901 and 965px | Fixed; nav row height steady at 24px |
| Menu toggle below minimum touch target | 30px to 44px |
| Card titles at body-text size | 16px to 20px |
| Clickable pills indistinguishable from tags | Pills are now filled green buttons, tags stay pale |
| Suqaar cuts buried at the end of the meat grid | Grid now leads with them |
| Invisible white-on-white bakery button | Uses the outline variant |

---

## 2. What this pass solves

### Responsive images (audit P1, the largest remaining win)

Before this pass the site had **no `srcset` at all**: a phone and a 1920px desktop downloaded byte-for-byte the same images. 45 downscaled WebP variants plus two JPEG hero variants were generated from the existing photographs, and `srcset` + `sizes` were added to 43 `<picture>` elements across six pages.

No original file was modified, and no new visual content was created. Every variant is a straight Lanczos downscale of a file already in the repository, encoded at WebP quality 82. Spot-checked against an ideal downscale, mean channel deviation is 3.5 to 5.0 out of 255, below the perceptual threshold for photographic content at these sizes.

### Semantic headings (audit P2)

42 card and department titles moved from `h2` to `h3`. Sibling `h2` counts per page dropped from 20–24 to 4–11. One `h1` per page, no level skips.

### Accessibility

- Homepage info-strip Directions link: 20px tall text link becomes a bordered 44px target. Its contrast also improved, and it is no longer the tightest ratio on the site.
- Sticky action bar: `div` becomes `<nav aria-label="Quick actions">`.
- Sticky bar DOM order: moved from just before the footer to just after the header. It is `position: fixed`, so layout is unaffected, but it is now **tab stop 4** instead of roughly stop 20. A keyboard user reaches Call and Directions almost immediately.

### CSS hygiene

Removed the two genuinely dead `.dark .reviews-panel` rules. Of 196 selectors, 187 match on at least one page. The nine that do not are all legitimate: `:root` (custom properties), state-dependent selectors (`.nav-links.open`, `.faq-item[open]`), and the five dormant `.special-card` rules deliberately retained for real weekly specials.

---

## 3. Measured before/after

Image bytes transferred over a full scroll, all seven routes:

| Profile | Before | After | Saved |
|---|---|---|---|
| Phone 390px @1x | 4,940 KB | 1,457 KB | **-70.5%** |
| Phone 390px @2x | 4,940 KB | 2,633 KB | **-46.7%** |
| Desktop 1440px @1x | 4,940 KB | 2,085 KB | **-57.8%** |

Per page, phone 390px @1x:

| Route | Before | After | Change |
|---|---|---|---|
| `/` | 1,601 KB | 385 KB | **-76.0%** |
| `/products/` | 2,099 KB | 450 KB | **-78.6%** |
| `/afghan-bakery-richfield/` | 487 KB | 237 KB | -51.4% |
| `/specials/` | 251 KB | 81 KB | -67.7% |
| `/about/` | 248 KB | 96 KB | -61.3% |
| `/halal-meat-richfield/` | 240 KB | 195 KB | -19.0% |
| `/contact/` | 13 KB | 13 KB | 0% |

Two results deserve explanation rather than celebration:

- **The meat page barely moves (-19%).** Its cut-out product photographs are already tiny as WebP (3 to 16 KB each), and two of its images deliberately received no variants (see section 5). There were few bytes to save.
- **The bakery page shows no saving at 2x.** Its cookie photographs are 800px sources rendered into roughly 716 device-pixel slots on a 2x phone, so the original is already the correct size. Nothing to save is the right answer.

Repository cost: 45 new files, 2,875 KB, taking `assets/images` from 11.25 MB to 14.06 MB. This is repository weight, not visitor weight; visitors download less than before on every page.

---

## 4. Regression results

| Check | Result |
|---|---|
| Horizontal overflow at 320, 360, 390, 480, 768, 900, 1024, 1280, 1440, 1920 | **None** |
| CLS, all seven routes, full scroll at 390px | **0.000** |
| Site-origin console errors | **None** on any route |
| Site-origin failed requests / broken assets | **None**; all 74 distinct `srcset` candidates resolve |
| Contrast, 509 text elements, pixel-sampled | **0 failures** |
| One `h1` per page, no heading level skips | Pass |
| Skip link first in tab order, focus outlines | Pass on all seven routes |
| Mobile menu open, ARIA state, 7 links, Escape, focus return | Pass on all seven routes |
| Sticky bar pinned, 48px targets, nothing covering | Pass on all seven routes |
| Place ID links (21 directions + 1 search) | Intact |
| GroceryStore schema | Present on 7/7 pages; no `FAQPage` reintroduced |
| Canonicals, `sitemap.xml`, `robots.txt` | Unchanged |
| Banned strings in rendered text | None on any route |
| `node --check`, `git diff --check` | Pass |

---

## 5. Remaining owner-dependent issues

### P0 — Two product photographs are watermarked stock comps

This was **not** in the original audit and was found while generating image variants.

| File | Evidence | Where it appears |
|---|---|---|
| `meat_chicken_breast.jpg` | Vertical strip reading **"Adobe Stock \| #221246591"** along the left edge, plus tiled "Adobe Stock" watermarking across the frame | Meat counter, "Chicken Breast" card |
| `beef_suqaar.png` | **"dreamstime"** watermark across the centre of the frame | Meat counter, **first card**, and the specials page cross-link |

Both are visible in the delivered images, not just in the source files. This is a licensing exposure as well as a credibility problem, and `beef_suqaar` occupies the first position on the meat page after PR #9 promoted the suqaar cuts.

No variants were generated from either file, deliberately, so that replacing them does not leave derived copies of unlicensed material behind. Their `<picture>` elements therefore have no `srcset`. When the owner supplies replacements, re-run the variant generation for those two stems and add `srcset`/`sizes` to match the neighbouring cards.

The remaining seven meat photographs and all bakery photographs were checked at high contrast boost and are clean.

### P0 — The logo still carries a baked-in checkerboard

`logo_transparent.png` is mode RGB with no alpha channel and 0.0% transparent pixels. Unchanged from the original audit, and noticeably worse on a 2x screen. Needs a re-export from the original artwork.

`logo.jpg` (4047×2372, 556 KB) is unused by any page but is very likely the highest-resolution source available and the right starting point for that re-export. **It was deliberately not deleted.**

### P1 — The suqaar photograph is still 218×123

Too small for any variant to help. Now in the first row of the meat grid.

### P1 — Action photography still does not exist

Nothing shows meat being cut or bread leaving the oven, for a business whose two differentiators are both services.

### P2 — The Google review link and real specials data

Both still outstanding, unchanged.

---

## 6. Remaining code issues

| Issue | Priority |
|---|---|
| Homepage still transfers 976 KB of images on desktop, mostly the five gallery photographs at 552–1120px. Further reduction means fewer or smaller gallery tiles, which is a design decision, not a technical one. | P2 |
| The JPEG fallback path is only optimised for the hero. Other pages still fall back to full-size JPEG/PNG for browsers without WebP, now under 1% of traffic. Originals were left untouched deliberately. | P2 |
| Footer links are 19px tall. They pass WCAG 2.5.8 through the spacing exception at 27.8px centre-to-centre, so they were left alone rather than inflating the footer. | P2 |
| Contact page still has nine sibling `h2` elements. There is no visible section heading above them, so demoting would create an `h1` to `h3` skip. Fixing it properly needs a visible heading, which is a design change. | P2 |
| `aspect-ratio` on card images plus `sizes` means the browser picks on width alone; portrait sources like `drinks1` and `perfume` still lose about 44% of the frame to the 4:3 crop. Art direction would need a different crop per breakpoint. | P2 |

---

## 7. Audit recommendations deliberately not implemented

1. **Deleting the "unused" image files.** `logo.jpg` and `logo.webp` are the likely source for the pending logo fix. `drinks2` and `drinks3` are genuine store photographs that may not exist elsewhere. `bakery_video_poster.webp` pairs with the poster JPEG in use. Deleting an owner's original photographs to save repository bytes is the wrong trade.
2. **Visible "opens in a new tab" warnings.** All 22 external links already carry `rel="noopener noreferrer"`, so the security treatment is consistent. Adding a visible or screen-reader warning to every Maps link would add noise to the site's main conversion path for little benefit.
3. **Card titles to `h3` on the contact page.** Would create a heading-level skip, as explained above.
4. **Re-encoding the original JPEG and PNG files.** Technically a win for the small non-WebP audience, but it means rewriting the owner's original photographs in place. New variants alongside untouched originals achieves the same delivery result with none of the risk.
