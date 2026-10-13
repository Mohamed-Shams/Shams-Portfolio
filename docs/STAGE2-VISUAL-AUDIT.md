# Stage 2 visual audit — about, skills, experience, certifications

Baseline: commit `b4ca5f2` (the Stage 1 result) on `feature/portfolio-refinement-v2`.
Nothing was pushed and nothing was committed for this stage.

Every number below comes from a real browser render — Playwright driving local
Chrome — at 1440x900, 1280x800, 1024x800, 768x1024 and 390x844, in both locales,
against the production build (`npm run build` + `next start`). Where a pixel value
matters it was read out of the captured PNG, not estimated.

Stage 1 (hero and project grid) was treated as frozen. `scripts/verify-stage1.cjs`
still passes with byte-identical geometry (largest uncovered grid span 22px at
1440/1280, 18px at 768, 0px single column, in both locales), and no rule added
here selects into `.hero`, `.projects-grid` or `.project-card`.

## What the baseline was actually doing

### The About statistics never rendered

`.stats span` was written for the caption under each figure, but the value is
also a `<span>` — nested inside `<strong>`. Element rules beat inheritance, so the
intended `.stats strong` treatment (`font-size: 56px`, amber gradient with
`background-clip: text`) was overridden by the caption rule on the value itself:

| viewport | `.stats strong` | the value span actually rendered |
| --- | --- | --- |
| 1440 | 56px, gradient, `color: transparent` | **17px, `rgb(196,203,210)`** |
| 1024 | 56px, gradient | **14px, `rgb(196,203,210)`** |
| 768 | 30px, amber | **12px, `rgb(196,203,210)`** |
| 390 | 34px, amber | **11px, `rgb(196,203,210)`** |

A pixel scan of `screenshots/stage2-before/en-about-1440.png` found the numeral
band contained 68 amber pixels — all of them the statement card's corner bracket —
and no saturated amber anywhere else in the section. "7K+", "10K+" and "1.3K+"
were painted at exactly the same size and colour as the captions beneath them.

### The portrait "frame" was a grey slab

`.about-image:before` was `inset: 65px -42px -45px 42px; background: #19212a` — a
solid mid-grey rectangle offset down and right behind the portrait. Against the
near-black page it read as a stray panel: a vertical grey bar down the right of
the portrait and a horizontal band under it. In Arabic the offsets are physical,
so the same bar landed on the page-centre side.

### The certification cards

- **Heights:** 139px and 147.7px inside the same three-column grid, because a
  one-line title and a two-line title produced different card content.
- **Brand art:** the plates were `86x94` at 1440 (65x75 at 1024, and *no* rule at
  601–850, so they inherited the 68px base). The five supplied marks are 33–40px
  wide, so each logo was magnified **2.15x**, and the AWS shield's aspect ratio
  made the image box 86x109.5 — **15.5px taller than its own plate**.
- **Plate:** `.cert-brand { border: 0 !important; background: transparent
  !important; border-radius: 0 !important }` neutralised the per-brand variants,
  and those `!important` flags also defeated the later "solid tile behind mark"
  rule, so on phones the plate had a colour but no radius and no border.
- **Hierarchy:** the issuer and date rendered at 10px (9px on phones) directly
  under a 17px title.

### The skills grid

- 15 tools in a `repeat(4, 1fr)` grid left **one whole empty cell** in the last
  row (and the same in the two-column phone grid, 7 rows of 2 plus 1).
- Two pairs of tiles shared a glyph — both SQL and InfluxDB drew the same
  cylinder, Industrial IoT and AWS the same cloud — and the Python tile carried a
  lone `Py` badge no other tile had.
- Tiles were centre-aligned, so a one-line title and a two-line title in the same
  row had their first lines **21.5px apart** (11.9px in Arabic).
- The integration diagram is an SVG with a fixed `viewBox`, so its 12-unit labels
  scaled with the drawing: **3.5px of rendered text at 390px**, ~7px at 768px and
  ~9px at 1024px.

### The experience timeline

- The education block was offset `margin-left: 50px` from the timeline it belongs
  to — a physical offset, so in Arabic it reduced the block from its outer edge
  instead of from the rail.
- The employer wordmark was pinned to fixed 170/130/120px columns, so its
  `border-bottom` underline was wider than the word and the "by solutions" line
  (centred inside the column) sat ~17px off-centre from the word in Arabic.
- Project dates were 10px and the employer sub-line 10px on phones.

### The desktop gutter

The four sections disagreed about where the page content starts, while the
approved projects grid and the certifications grid both used 34px:

| section | content left edge at 1440 (section box starts at 160) |
| --- | --- |
| projects (approved) | 194 |
| certifications | 194 |
| experience | 202 |
| skills panel | 160 (no inset at all) |
| about | 236 |

So the page's left edge stepped in and out by up to 76px between sections.

## Stage 2 changes

All of it is in four places: `src/app/fidelity.css` (one new clearly-marked
Stage 2 block at the end, plus three in-place edits to the `.cert-brand` rules),
`src/components/TechnicalVisuals.tsx`, `src/components/Portfolio.tsx`, and the two
Stage 2 scripts. `src/app/globals.css` was not touched.

### About

- The value span is scoped back to its parent, so the numerals render at their
  designed size: 56px with the amber gradient clip above 851px, 30–34px amber
  below. Measured in the new capture, the numeral band now holds 3,598 amber
  pixels instead of 68.
- The offset slab became a concentric 1px ring (`inset: -22px`, `#23333f`,
  18px radius). Verified in the pixels: the ring reads as a single-pixel line 22px
  outside the portrait's edge on both sides, with no filled area behind it.
- The statement card, its two corner brackets and their offsets now mirror in
  RTL, so the card hangs off the portrait's outer edge in both locales instead of
  its inner edge in Arabic.
- The stats footnote is 11px on tablets (was 10px) and the caption 11px below
  420px (was 10.5px).

### Skills

- 15 distinct Lucide icons — InfluxDB gets `ChartLine`, Industrial IoT `Factory`
  — and the lone `Py` badge is gone.
- One gutter for every section (below), and the "Industrial IoT" umbrella tile
  spans two columns where that closes the last row (2- and 4-column layouts) and
  drops the span where 15 divides evenly (3 columns). Measured: the largest
  uncovered span inside any row band equals the column gap — 16px of 16 at 1440,
  12px of 12 at 768, 8px of 8 at 390, in both locales.
- Tile content is top-aligned and every title reserves exactly two lines, so the
  first line of every title in a row shares a baseline (spread ≤2px at all five
  viewports, both locales).
- Type scale: title 13px and qualifier 11px at 601–850 (was 12/10), title 12.5px
  and qualifier 11px at 600 and below (was 11/9), qualifier 11.5px at 851–1150
  (was 10).
- Below 1151px the integration path renders as the same five steps built from
  real text (13px monospace chips with dashed connectors, amber on the
  `Ignition SCADA` node) instead of the scaled drawing. The SVG remains above
  1151px with its labels raised from 12 to 14 viewBox units, which measures
  **12.1px rendered** at 1440. Exactly one of the two is ever displayed, so
  assistive technology receives a single description of the path.

### Experience

- The education block now uses the timeline's own 8px inline inset with logical
  properties: measured left edge 202px against the timeline's 202px (was 252 vs
  210) at 1440, and 32px vs 32px at 390, in both locales.
- The employer column is `max-content`, so the underline is exactly as wide as the
  word (132px at 1440, 120px at 768) and both the word and "by solutions" are
  centred; the Arabic sub-line is no longer off-centre.
- Project dates 11px and the employer sub-line 11.5px on phones (were 10px), the
  education copy 12px at 390 (was 11px).

### Certifications

- One plate for all five marks: 56px at 1440, 52px at 851–1150, 48px at 768 and
  46px at 600 and below, each with the same `1px #263745` border, 12px radius and
  `#131c25` fill. The per-brand colour variants are neutralised by listing them
  instead of using `!important`, which also un-breaks the phone plate.
- Marks are matched by height inside that plate, so the 0.95-ratio and 0.79-ratio
  logos no longer render 21% differently in size. Every mark is now **downsampled
  (0.80–0.86x)** — measured against its natural 33–40px width — instead of
  magnified 2.15x, and nothing overflows its plate (measured overflow 0px; it was
  15.5px on the AWS shield).
- `grid-auto-rows: 1fr` gives every card in a grid the same height: spread 0px at
  every viewport (was 8.7px at 1440).
- Hierarchy: title 16px, issuer 13px in `#9dc4d9`, date 12px monospace, chip 12px
  at desktop (from 17/10/10/13), rolling down to 12.5/11/11/11px on phones
  (from 11/9/9/10). The fixed `min-height: 180px` on phone cards is gone, so card
  height follows content (177.4px) instead of leaving ~70px of dead space.

### One content gutter

At 851px and above, about, the skills panel, experience and certifications all
use the projects grid's 34px inset. Measured content left edges at 1440 in both
locales: **194 / 194 / 194 / 194**, against projects at 194 (was
194 / 236 / 160 / 202 / 194). At 1024: 62/62/62/62 against projects at 62. At 768
and 390 every section already shared 28px and 24px, and still does.

## Text legibility

Below 11px, counted across all four sections (the 9px tracked eyebrow is shared
with the hero and was deliberately left alone):

| viewport | before | after |
| --- | --- | --- |
| 390 EN | 51 nodes (qualifiers 9px, cert issuer/date 9px, dates 9–10px, footnote 10px) | **0** |
| 768 EN | 38 nodes (10px) | **0** |
| 1024 EN | 15 nodes (10px qualifiers) | **0** |
| 1440 EN | 0 | 0 |

## Verification

- `npm run typecheck` — clean (exit 0).
- `npm run build` — clean; 23 static pages, all 14 project routes.
- `node scripts/verify-stage2.cjs <BASE_URL>` — **all checks passed** against both
  the dev server and the production build, in EN and AR at 1440/1280/1024/768/390.
  It asserts: no horizontal scroll; the stat numeral matches its `<strong>` and is
  gradient-filled at desktop and amber on phones; the statement hangs off the
  portrait's outer edge (RTL included); the portrait frame is a ring, not a slab;
  section content left edges match the projects grid at desktop; the skill grid's
  largest uncovered span is within one column gap and the umbrella tile spans only
  where it closes the row; tile titles in a row share a baseline; exactly one of
  the flow diagram / flow list is displayed and its type is ≥ 12–13px; cert card
  heights vary by ≤1px; brand art never overflows or upscales; the education block
  aligns with the timeline rail; the employer column fits the word; and no text
  below 11px remains except the shared eyebrow.
- `node scripts/verify-stage1.cjs <BASE_URL>` — still passes, unchanged numbers.
- Captures: `screenshots/stage2-before/` (baseline) and `screenshots/stage2-final/`
  (production build, including `audit-after.txt` and `sheet.html` contact sheets)
  for both locales at 1440/768/390 plus a 2x phone pass. Both folders are
  gitignored. The harness now hides the fixed header and waits for lazy art before
  capturing, so section screenshots are no longer overprinted by the nav bar.

## Known remaining issues

1. **The five brand marks are 33–40px crops** taken from the same 1536x1024
   supplied board, so no sharper version exists in the repository. They are no
   longer *upscaled* — that gap is closed — but they are still tiny art inside a
   larger plate, and their baked-in backgrounds differ (the white Dataiku square,
   the blue Ignition disc), so the five plates are uniform in frame, not in
   artwork. Licensed brand SVGs are the real fix.
2. **The About stats row got taller.** Restoring the numerals to 56px added ~28px
   to the section at 1440 (~55px at 390). The left column now ends ~97px below the
   statement card's bottom edge, where it used to end ~32px below. It reads as
   breathing room rather than a hole, but it is a real change in the bottom-right
   balance and the statement's `-185px` overhang is the lever if it should be
   tightened.
3. **Skill rows are not all the same height.** The title of "MS SQL / MySQL /
   PostgreSQL" wraps to three lines in a 245px tile, so its row is ~30px taller
   than the others. Clamping it would hide part of a tool name, so the wrap is
   accepted; the row is internally consistent and the first lines align.
4. **The integration path below 1151px is static text.** The animated dots that
   exist in the SVG have no counterpart in the text version, so tablets and phones
   see the path without motion. That was deliberate — adding animation was out of
   scope for this stage.
5. **The eyebrow stays 9px on phones.** It is a tracked uppercase label shared
   with the hero, and raising it would have changed an approved section, so it was
   left as-is and excluded from the legibility count by name.
6. **Live-preview limitation.** The in-app browser panel stopped compositing new
   frames partway through this session (`webContents ... is not being composited`),
   so the visual pass here is the baseline screenshots that could be displayed,
   plus pixel analysis of the new captures (amber coverage, ring geometry, plate
   borders) and the measurement suite. The delivered contact sheets in
   `screenshots/stage2-final/sheet.html` are the intended human review surface.
7. `audit-stage2.cjs` reported a bogus `-160px` left overflow on sections holding a
   closed `<details>` (anything inside a closed `<details>` has a zero-area rect at
   0,0). The audit now ignores zero-area rects, and the gutter alignment is checked
   directly by `verify-stage2.cjs`.

## Deliberately out of scope for Stage 2

The hero and project grid (frozen, Stage 1), motion/animation work, and the
contact section — including the contact globe and its footer. Those are the next
stage.
