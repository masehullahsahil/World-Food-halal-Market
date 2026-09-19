#!/usr/bin/env python3
"""Rebuild the WHM logo assets from the original artwork.

Background
----------
The site used to ship `logo_transparent.png` / `.webp`. Neither one was
transparent: the PNG was actually a JPEG that had been renamed, and the WebP
was lossy VP8 with no alpha channel. Both had the image editor's
grey-and-white transparency checkerboard baked in as real pixels, so on the
near-black header and footer the logo rendered as a white checkered box.

This script regenerates the assets properly from `assets/images/logo.jpg`,
the original lockup on a clean white background, and writes real RGBA files.

Outputs (all with a true alpha channel):
    logo-mark.png / .webp        WHM mark in its original colours (light backgrounds)
    logo-mark-light.png / .webp  knockout variant for the dark header and footer
    favicon-32.png, favicon-180.png

Run from the repository root:  python3 tools/build-logo-assets.py
Requires: Pillow, numpy.
"""
from PIL import Image
import numpy as np
import os

SRC = 'assets/images/logo.jpg'
OUT = 'assets/images'
MARK_ROWS = (46, 1524)   # the WHM mark; below this the source holds the wordmark badge
WIDTH = 420              # ~3x the largest on-page render (124px in the footer)
PALETTE = 32             # the artwork is flat colour, so this only strips JPEG noise

WHITE_MIN = 216          # a pixel this light and this neutral is background
WHITE_SAT = 24


def ink_mask(rgb):
    """True where the artwork is, False on the white backdrop."""
    mx, mn = rgb.max(2), rgb.min(2)
    return ~((mn > WHITE_MIN) & ((mx - mn) < WHITE_SAT))


def bleed(rgb, mask, rounds=14):
    """Grow the ink colour outward into the backdrop.

    Without this, downsampling averages edge pixels against white and leaves a
    pale halo around the mark once it sits on a dark background.
    """
    out, known = rgb.copy(), mask.copy()
    for _ in range(rounds):
        acc = np.zeros_like(out)
        cnt = np.zeros(known.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc += np.roll(out, (dy, dx), (0, 1)) * np.roll(known, (dy, dx), (0, 1))[..., None]
            cnt += np.roll(known, (dy, dx), (0, 1)).astype(np.float32)
        fill = (~known) & (cnt > 0)
        if not fill.any():
            break
        out[fill] = (acc / np.where(cnt > 0, cnt, 1)[..., None])[fill]
        known |= fill
    return out


def reverse_for_dark(rgb, mask):
    """Knockout variant.

    The cart and the W are charcoal and mid-grey, which disappear on the
    near-black header. Neutral ink becomes white; dark saturated ink (the deep
    green of the M) is lifted just enough to hold contrast against black.
    """
    out = rgb.copy()
    mx, mn = rgb.max(2), rgb.min(2)
    sat = mx - mn
    lum = rgb @ np.array([.299, .587, .114], np.float32)

    out[(sat < 46) & mask] = 255.0

    dark_col = (sat >= 46) & (lum < 118) & mask
    if dark_col.any():
        px = out[dark_col]
        scale = np.maximum((140.0 / np.maximum(px.max(1), 1))[:, None], 1.0)
        out[dark_col] = np.clip(px * scale, 0, 255)
    return out


def build(src, name, rows, width, light=False):
    rgb = src[rows[0]:rows[1]].copy()
    m = ink_mask(rgb)
    ys, xs = np.where(m.sum(1) > 0)[0], np.where(m.sum(0) > 0)[0]
    rgb = rgb[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

    if light:
        rgb = reverse_for_dark(rgb, m)
    rgb = bleed(rgb, m)

    height = max(1, round(width * rgb.shape[0] / rgb.shape[1]))
    colour = Image.fromarray(rgb.astype(np.uint8)).resize((width, height), Image.LANCZOS)
    colour = colour.quantize(colors=PALETTE, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    alpha = Image.fromarray((m * 255).astype(np.uint8)).resize((width, height), Image.LANCZOS)

    out = colour.convert('RGBA')
    out.putalpha(alpha)
    out.save(os.path.join(OUT, name + '.png'), optimize=True)
    out.save(os.path.join(OUT, name + '.webp'), lossless=True, quality=95, method=6)

    png_kb = os.path.getsize(os.path.join(OUT, name + '.png')) // 1024
    webp_kb = os.path.getsize(os.path.join(OUT, name + '.webp')) // 1024
    print(f'{name:18} {width}x{height}  png {png_kb}KB  webp {webp_kb}KB')
    return out


def main():
    if not os.path.exists(SRC):
        raise SystemExit(f'{SRC} not found - run this from the repository root.')

    src = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
    mark = build(src, 'logo-mark', MARK_ROWS, WIDTH)
    build(src, 'logo-mark-light', MARK_ROWS, WIDTH, light=True)

    side = max(mark.size)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.paste(mark, ((side - mark.size[0]) // 2, (side - mark.size[1]) // 2), mark)
    for px in (32, 180):
        square.resize((px, px), Image.LANCZOS).save(os.path.join(OUT, f'favicon-{px}.png'), optimize=True)
    print('favicon-32.png, favicon-180.png')


if __name__ == '__main__':
    main()
