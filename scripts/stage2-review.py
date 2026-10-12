"""Compose per-section review boards from a Stage 2 screenshot folder.

Usage: python scripts/stage2-review.py <dir> [outdir]

One board per section (about / skills / experience / certifications) holding the
EN and AR captures at desktop and mobile widths side by side, each panel scaled to
the same target width and labelled, so a whole section can be judged in one look.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

src = Path(sys.argv[1] if len(sys.argv) > 1 else "screenshots/stage2-before")
out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else src
out_dir.mkdir(parents=True, exist_ok=True)

PANEL_W = 700
GUTTER = 24
LABEL_H = 26
BG = "#141a20"
FG = "#f1a342"

sections = ["about", "skills", "experience", "certifications"]
panels = [
    ("en", 1440),
    ("ar", 1440),
    ("en", 390),
    ("ar", 390),
]


def load(locale: str, section: str, width: int):
    path = src / f"{locale}-{section}-{width}.png"
    if not path.exists():
        return None
    return Image.open(path).convert("RGB")


for section in sections:
    tiles = []
    for locale, width in panels:
        img = load(locale, section, width)
        if img is None:
            continue
        h = max(1, round(img.height * PANEL_W / img.width))
        tiles.append((f"{locale} @ {width}", img.resize((PANEL_W, h), Image.LANCZOS)))

    if not tiles:
        continue

    # Two panels per row keeps the board readable when sections are tall.
    per_row = 2
    rows = [tiles[i : i + per_row] for i in range(0, len(tiles), per_row)]
    row_heights = [max(t[1].height for t in row) + LABEL_H for row in rows]

    canvas_h = GUTTER + sum(rh + GUTTER for rh in row_heights)
    canvas_w = GUTTER + per_row * PANEL_W + (per_row - 1) * GUTTER + GUTTER
    canvas = Image.new("RGB", (canvas_w, canvas_h), BG)
    draw = ImageDraw.Draw(canvas)

    y = GUTTER
    for row, rh in zip(rows, row_heights):
        x = GUTTER
        for label, tile in row:
            draw.text((x, y), f"{section.upper()}  ·  {label}", fill=FG)
            canvas.paste(tile, (x, y + LABEL_H))
            x += PANEL_W + GUTTER
        y += rh + GUTTER

    out = out_dir / f"review-{section}.jpg"
    canvas.save(out, quality=88)
    print("wrote", out, canvas.size)
