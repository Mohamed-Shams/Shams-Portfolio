"""Hero pixel audit: face exposure, background separation, amber/cyan accents.

Measures, per hero screenshot:
  - portrait-region luminance percentiles (the right half of the hero),
  - the brightest 1% band (face) mean luminance and its contrast against
    the local background around it,
  - amber and cyan pixel counts across the hero,
  - a luminance histogram so "too dark/too flat" claims have numbers.

Usage: python scripts/audit-hero-pixels.py screenshots/stage1hp-before
"""
import sys
import os
import glob
from PIL import Image, ImageStat

def luma(px):
    r, g, b = px[0], px[1], px[2]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def region_luma_stats(img, box):
    crop = img.crop(box).convert("RGB")
    stat = ImageStat.Stat(crop)
    hist = crop.convert("L").histogram()
    total = sum(hist)
    # cumulative percentiles: p1, p10, p50, p90, p99
    out = {}
    for name, frac in (("p1", 0.01), ("p10", 0.10), ("p50", 0.50), ("p90", 0.90), ("p99", 0.99)):
        acc = 0
        val = 0
        for i, n in enumerate(hist):
            acc += n
            if acc >= total * frac:
                val = i
                break
        out[name] = val
    out["mean"] = stat.mean
    return out, hist

def count_hue(img, box, target, tol, inner_only=True):
    crop = img.crop(box).convert("RGB")
    w, h = crop.size
    data = crop.getdata()
    tr, tg, tb = target
    count = 0
    for (r, g, b) in data:
        if abs(r - tr) < tol and abs(g - tg) < tol and abs(b - tb) < tol:
            count += 1
    return count

def main(folder):
    files = sorted(glob.glob(os.path.join(folder, "*-hero-*.png")))
    for f in files:
        img = Image.open(f).convert("RGB")
        w, h = img.size
        # portrait region: right side in EN (face side). In AR >=601px the CSS
        # mirrors the portrait to the LEFT edge, so measure the left half there.
        rtl = os.path.basename(f).startswith("ar-") or "-ar-" in os.path.basename(f)
        if rtl and w >= 601:
            side = (int(w * 0.04), 0, int(w * 0.45), h)
        else:
            side = (int(w * 0.55), 0, w - int(w * 0.04), h)
        stats, hist = region_luma_stats(img, side)
        rows = img.crop(side).convert("L")
        # face = brightest 2% band mean
        px = list(rows.getdata())
        px_sorted = sorted(px, reverse=True)
        top = px_sorted[: max(1, int(len(px_sorted) * 0.02))]
        face_mean = sum(top) / len(top)
        dark = px_sorted[int(len(px_sorted) * 0.3)]
        amber = count_hue(img, (0, 0, w, h), (0xF1, 0xA3, 0x42), 36)
        cyan = count_hue(img, (0, 0, w, h), (0x6A, 0xCA, 0xFB), 36)
        print(
            f"{os.path.basename(f):34s} {w}x{h} rtl={rtl} "
            f"p1={stats['p1']:3d} p10={stats['p10']:3d} p50={stats['p50']:3d} "
            f"p90={stats['p90']:3d} p99={stats['p99']:3d} faceTop2%={face_mean:5.1f} "
            f"face30th-2nd={dark} amber={amber} cyan={cyan}"
        )

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "screenshots/stage1hp-before")
