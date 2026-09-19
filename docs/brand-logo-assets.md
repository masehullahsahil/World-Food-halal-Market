# Brand Logo Assets

## The problem that was fixed

The header and footer used to load `assets/images/logo_transparent.png` and
`assets/images/logo_transparent.webp`. Despite the filenames, neither file had a
transparency channel:

| File | Claimed | Actually was |
|---|---|---|
| `logo_transparent.png` | PNG with alpha | JPEG (`FF D8 FF E0 … JFIF`) renamed to `.png` — JPEG cannot store alpha |
| `logo_transparent.webp` | WebP with alpha | lossy VP8 WebP, no `ALPH` chunk |

Both had been exported with the image editor's grey-and-white transparency
checkerboard baked in as real pixels (corner samples read `#E3E3E3` / `#FFFFFF`).
Against the near-black header (`rgba(10,10,10,.97)`) and footer (`#0a0a0a`) that
rendered as a white checkered rectangle around the mark.

Both files have been deleted. Do not reintroduce a `.png` that is really a JPEG —
if a logo needs transparency it must be a true RGBA PNG or a lossless/alpha WebP.

## Current assets

All generated from `assets/images/logo.jpg`, the original lockup on a clean white
background (4047×2372). All have a real alpha channel.

| File | Size | Used by |
|---|---|---|
| `logo-mark.png` / `.webp` | 420×162 | the mark in its original colours, for light backgrounds |
| `logo-mark-light.png` / `.webp` | 420×162 | knockout variant — the site header and footer |
| `favicon-32.png` | 32×32 | browser tab icon |
| `favicon-180.png` | 180×180 | `apple-touch-icon` |

`logo.jpg` is kept as the source artwork. It is not referenced by any page.

### Why there is a knockout variant

In the original artwork the cart is mid-grey and the W is near-black. With real
transparency alone those two elements still vanish against the dark header. The
knockout variant maps neutral ink to white and lifts the deep-green stroke of the
M, so the whole mark reads on black. The red H, the green M and the blue globe
keep their brand colours.

### The old favicon

`favicon.png` was a gold `W` on a green square — colours that appear nowhere in
the logo. It was replaced with favicons cut from the actual mark.

## Regenerating

```sh
pip install Pillow numpy
python3 tools/build-logo-assets.py   # from the repository root
```

The script re-derives the alpha by keying out the white backdrop at full
resolution, bleeds the ink colour outward so downsampling leaves no pale halo,
then downsamples the mask to produce smooth anti-aliased edges. Tunable constants
(`WIDTH`, `PALETTE`, `MARK_ROWS`) are at the top of the file.

If the artwork is ever redrawn, replacing `logo.jpg` and rerunning the script is
enough — the markup references only the generated filenames.
