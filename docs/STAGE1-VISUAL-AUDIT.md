# Stage 1 visual audit — hero and project grid

Baseline: branch `main` @ `40b3562`. Work branch: `feature/portfolio-refinement-v2`.
Nothing was pushed to `main`.

Every judgement below comes from a real browser render (Playwright driving local
Chrome at 1440x900, 1280x800, 768x1024, 390x844, 360x800, in both locales), not
from the composite reference board.

## What the baseline measured

**Project grid.** The grid was `repeat(4, 1fr)` with the flagship card spanning
2x2. Six cards therefore occupied 9 of the 12 available cells, leaving a visibly
empty three-cell hole in the bottom-right of the section. Row heights were
stretched unevenly, so the shorter cards ended in a block of dead space under
their tags, and `.card-copy h3 { min-height: 48px }` forced the blank area
whether or not a title needed two lines.

**Project images.** The card art was being magnified far beyond its source
resolution. Measured native sizes of the supplied crops:

| asset | native | displayed at (baseline) | magnification |
| --- | --- | --- | --- |
| `juice-card.webp` (flagship) | 159x76 | ~430x430 banner | ~4.7x |
| `air.webp` | 160x77 | ~275x175 | ~1.7x |
| `wells.webp` | 156x76 | ~275x175 | ~1.8x |
| `city.webp` | 160x54 | ~275x175 | ~1.7x |
| `drilling.webp` | 158x54 | ~275x175 | ~1.7x |
| `water.webp` | 156x54 | ~275x175 | ~1.7x |

All crops originate from one 1536x1024 composite board, so no higher-resolution
version of these subjects exists in the repository: the crops are already at
native resolution. `Mohamed-Shams-Portfolio-Source.zip` contains the same small
files. A licensed-source search (Wikimedia Commons, Openverse/Flickr) returned
either archival, off-subject or low-quality candidates, so inserting them would
have replaced a small photograph with a poor unrelated one.

**Hero.** The hero layered portrait + plant + refinery crops under a vignette.
Two defects were measurable: `.refinery` was a 76x150 crop stretched to ~288x464
(about 3.8x), which read as a blue smeared mesh over the portrait's shoulder, and
the SCADA element rendered as a bordered trend box plus a separate floating
label column with no visual connection between them. Typography spacing between
the name, the amber headline, the role line and the paragraph was uneven.

## Stage 1 changes

### Hero (`src/components/Portfolio.tsx`, `src/app/globals.css`, `src/app/fidelity.css`)

- One-shot staggered entrance for eyebrow, name, headline, role line, paragraph
  and the two CTAs (opacity + translate only, so nothing shifts layout). It is
  short-circuited by `useReducedMotion`, which is why the saved screenshots show
  final states — this machine reports reduced motion enabled.
- SCADA is now a single framed faceplate: `SCADA` panel title with an amber
  "live" dot, the trend box, and the channel list inside the same border with a
  full-height rail and the active channel (`IIoT`) in amber. Perspective tilt
  reduced from `-13deg` to `-9deg`.
- Atmosphere: a tonal gradient under the plant crop and a smaller, fainter
  refinery crop (15% wide, 42% tall, opacity 0.62) so both photographs merge into
  the page instead of ending on visible edges; the vignette gained a subtle
  right-side falloff; signal lines dropped to 0.42 opacity with a horizontal
  feather mask.
- Typographic rhythm: name tracking `-2.4px`, slightly larger gap under the name,
  role line raised to a 20px lead, description measure narrowed to 468px at
  line-height 1.75.

### Project grid (`src/components/Portfolio.tsx`, `src/app/globals.css`, `src/app/fidelity.css`)

- Real CSS Grid bento, no `nth-child` positioning: mobile-first single column,
  two even columns at 601–850px, and three columns above 851px where the
  CV-confirmed flagship (Döhler Cloudy Line) takes a 2x2 cell. The six initial
  projects fill the 3x3 area completely; `View all` drops the span for a uniform
  wrap that reveals the seventh project.
- Cards are equal-height flex columns: image band on top, copy stretched, tag row
  pinned to the bottom edge with `margin-top: auto`, and titles reserving exactly
  two lines. Filler `.card-copy h3` dead space and the legacy `nth-child` aspect
  overrides are gone.
- Card treatment: image zoom set to 1.045, softer border highlight, quiet lift,
  amber arrow fill on hover, larger padding, tag text raised to 10.5px (was 10px),
  image label to 9.5px (was 8px).
- The flagship card additionally carries the existing verified overview sentence
  from `src/lib/content.ts`, which turns what used to be empty space into
  substance.

### Card art (`public/assets/card/`)

The same six subjects, re-rendered for display instead of swapped out: each crop
is centre-cropped to the exact card aspect ratio, resampled once with Lanczos,
lightly sharpened (unsharp mask) and saved at 2x the largest size it is displayed
at. Measured side by side in the browser, this is visibly crisper than letting the
browser magnify the 159px original, and it removes the 4.7x blow-up of the
flagship. Effective source magnification is now about 2.7x for the flagship and
about 2.3x for the small cards.

## Verification

- `npm run typecheck` — clean.
- `npm run build` — clean; 23 static pages generated, all 14 project routes.
- `node scripts/verify-stage1.cjs http://localhost:4321` (production server) — all
  checks passed in both locales at all five viewports:
  - no horizontal scrolling (`scrollWidth - clientWidth <= 1`),
  - every card image loads (`naturalWidth > 0`),
  - six initial cards, flagship first and titled Döhler / دولر,
  - correct `dir` per locale, hero heading inside the hero box, zero page errors,
  - largest uncovered span inside any grid row band equals the column gap
    (22px at 1440/1280, 18px at 768, 0px single column), i.e. no empty cell,
  - `View all` reveals seven projects.
- Screenshots: `screenshots/stage1-before/` (baseline) and
  `screenshots/stage1-final/` (production build) including `sheet.html` contact
  sheets. Both folders are gitignored.

## Known remaining issues (not part of Stage 1)

1. **Card art is still low-resolution in absolute terms.** 160x77 crops cannot
   look like print photography. Replacing them with licensed high-resolution
   originals remains the single highest-value improvement for the projects
   section; the layout now bounds the magnification so the gap is far less
   visible, but it cannot be closed by CSS. Use at least 1600x1000 for the
   flagship slot and 800x500 for the small cards.
2. `water.webp` (DMAs / DMZs) is the weakest subject — flat and ambiguous for a
   water-network project. Flagged for replacement first.
3. `city.webp` is shared by the MODON Smart Cities project and the MODON testing
   project, so the two cards look identical in the expanded view.
4. The flagship image band is sized by the height of the two cards beside it, so
   its aspect ratio shifts by roughly 8% across 851–1150px. Acceptable, but it
   will drift if those cards' copy changes.
5. The interactive dev-server tab still shows Next.js's session error badge from
   a transient hot-reload state seen while editing. Fresh page loads report zero
   console errors and zero page errors, the badge does not appear in any captured
   screenshot, and the production build is clean.

## Deliberately out of scope for Stage 1

About, skills/technology icons, architecture diagram, experience timeline,
certifications, contact globe, and the global spacing/typography scale are
untouched and are the subject of the later stages.
