# Stage 3 visual audit — motion, contact CTA, responsive and bilingual QA

Baseline: commit `17d281b` (the Stage 2 result) on `feature/portfolio-refinement-v2`.
Nothing was pushed. Stage 3 is delivered as one commit on the same branch, ready
for review.

Scope, per the approved refinement specification: sophisticated but lightweight
visual effects on the approved design, an improved Contact globe and CTA, and a
comprehensive responsive and bilingual QA pass. The Stage 1 hero and project grid
and the Stage 2 sections stay frozen — after the Stage 3 changes,
`scripts/verify-stage1.cjs` and `scripts/verify-stage2.cjs` still pass with the
same numbers (grid coverage, gutters, stat numerals, plate sizes), because every
added animation animates only `opacity` and `transform` (plus two paint-cheap
`background-position` shimmers on 1px connectors). No rule in the Stage 3 block
changes layout.

## What the baseline was actually doing

### The reveal system existed but was mostly unwired

Stage 1 shipped `useReveal` + `.reveal d0–d3` CSS, but only the hero used an
entrance (framer-motion). Sections, grids and case-study pages rendered
statically. Worse, the flow-diagram dots were gated on `.flow-wrap.in` — and
nothing in the codebase ever added `.in` to `.flow-wrap`, so the gate was dead
and the four signal dots sat at `opacity: 0` forever. The SCADA data-flow
animation was invisible in every production render.

### The below-1151px integration path was static text

Stage 2 known issue #4: the real-text flow chips (tablets and phones) had no
counterpart to the SVG's moving dots — the path had no motion.

### The contact globe was fully static

The three amber signal arcs painted at once; the orbit ellipse sat still; the
pin never moved. The contact CTA row was a mailto link, an external-site link
and a phone link with no copy affordance for the email address.

## Stage 3 changes

All of it is in `src/app/fidelity.css` (one clearly-marked Stage 3 block at the
end), `src/components/motion.tsx`, `src/components/Portfolio.tsx`,
`src/components/TechnicalVisuals.tsx`, plus two Stage 3 scripts.
`src/app/globals.css` was not touched. The now-unused `useReveal` hook was
removed so exactly one reveal system remains.

### 1 · One-shot scroll reveal (`RevealManager` + `data-reveal`)

- 22 elements per page opt in with `data-reveal="up"` (fade + 16px rise) or
  `"fade"`; optional 0.08/0.16/0.24s staggers inside a section.
- `RevealManager` renders nothing; on mount it adds `reveal-ready` to `<html>`
  and observes the opt-ins with one IntersectionObserver (threshold 0.05,
  rootMargin −6%), adding `.in` once and unobserving — one-shot, no reverse
  work while scrolling back up.
- The hidden pre-reveal state only applies under `.reveal-ready`, so without
  JavaScript the page renders complete (verified with JS disabled).
- Under `prefers-reduced-motion` the manager reveals everything immediately and
  starts no observer; `globals.css` already strips all transitions/animations.
- `@media print` forces the final state.
- Locale switches remount the page; each mount re-observes its own elements.

### 2 · SCADA data-flow motion made real

- The Stage 1 dot gate now works: dots stay `animation-play-state: paused`
  (zero animation work off-screen) until `.flow-wrap` reveals, then run their
  4.2s loops. Measured: paused before scroll, running after, at 1440, both
  locales.
- The text integration path below 1151px got the same "current": its 1px
  connectors became dashed lines shimmering at 2.6s, direction-aware in RTL and
  vertical below 600px. This closes Stage 2 known issue #4.
- The SCADA status dot breathes (3.6s opacity/halo pulse).

### 3 · Contact globe

- The three signal arcs draw themselves once the contact section reveals
  (`stroke-dashoffset` 620 → 0 over 1.7s, staggered 0.2/0.5/0.8s, `forwards` —
  they draw one-shot and stay; before that they are invisible only while
  JavaScript is running, same no-JS guarantee as the reveals).
- Four amber hub nodes pulse gently (5.6s, staggered).
- The orbit became a dashed cyan ring rotating once every 90s. Its geometry was
  adjusted for the dashed style (rx 246→256, ry 95→78, −44°→−24°) — a
  deliberate, decorative change inside the approved contact art.
- The pin floats ±4px over 6.5s and gained a soft amber halo; the float lives
  on an inner `<g>` so the CSS transform never clobbers the outer SVG
  `translate`.

### 4 · Refined hover states (transform/colour only)

Buttons (shadow lift, real press state `scale(0.985)`, outline border
brighten), skill tiles (−2px, border brighten, glyph follows), certification
cards (−3px, amber border tint, shadow), gallery thumbnails, contact links
(icon-chip lift plus a one-way amber underline slide, `transform-origin`
mirrored in RTL), text-link arrows nudging along the reading direction,
language chips, footer and timeline links. `@media (hover: none)` removes the
lifts on touch devices.

### 5 · Contact CTA

`CopyEmail`: a small ghost button beside the mailto link that writes
`mohamed.ah.shams@gmail.com` to the clipboard (async Clipboard API with an
`execCommand` fallback), flips to a green "Copied" / "تم النسخ" state announced
via `aria-live="polite"`, and resets after two seconds (timer cleaned up on
unmount). The mailto link became `inline-flex` so the control shares its line
in both directions. Bilingual labels come from the same `t()` source as the
rest of the section.

### 6 · Disclosures and the revealed seventh card

`<details>` content and the seventh project card (View All) get a 0.35–0.4s
one-shot entrance, re-running only when the content remounts.

## Verification (all against the production standalone build)

`npm run typecheck` — clean. `npm run build` — clean; 23 static pages, all 14
case-study routes.

`node scripts/verify-stage3.cjs <BASE_URL>` — **all checks passed** (run three
times; one script-side race fixed on the way: the `reveal-ready` gate is added
in a post-hydration effect, so the first Arabic load could be checked before
hydration finished — the check now waits for the gate, which is the real
contract). It asserts, in EN and AR at 1440/768/390:

- 22/22 `data-reveal` elements end revealed with computed `opacity: 1`;
- flow dots paused before the diagram reveals, running after; text path
  shimmering at 768 with chips ≥12px; exactly one of SVG/text path displayed;
- globe arcs reach `stroke-dashoffset: 0` (3 arcs) and node/orbit/pin
  animations are live;
- CopyEmail writes the real clipboard (read back via
  `navigator.clipboard.readText`) and flips/resets its label in both languages;
- the education disclosure opens with content visible;
- zero page errors and no horizontal scroll at every checked viewport;
- view-all expansion shows 7 cards with the seventh animating in;
- `prefers-reduced-motion: reduce` — all content visible without scrolling,
  `document.getAnimations()` === 0, scroll-progress hidden, arcs fully drawn
  and static, in both locales;
- JavaScript disabled — no gate, all content visible, arcs static-visible, no
  horizontal scroll, in both locales;
- routes — 7 distinct slugs from the journey, all 14 locale/slug case-study
  routes return 200, CV PDF 200, EN→AR and AR→EN switching keeps the route
  (home and case study), next-project navigation works, back-to-top anchor
  present;
- responsive sweep — 1440/1280/1024/768/390/360 × EN/AR: no overflow, nothing
  left unrevealed, contact visible, zero page errors.

`node scripts/verify-stage1.cjs` and `node scripts/verify-stage2.cjs` — still
pass with the same numbers (frozen geometry untouched).

`node validate.cjs` — 10/10 viewport/locale combos: no overflow, no errors.

`node accessibility.cjs` (axe-core WCAG 2 A/AA + 2.1 AA, scanned after reveals
settle so transient states are not misread) — **zero violations in EN and AR**.

`npm audit` was not re-run this stage (no dependency changes; zero
vulnerabilities as of Stage 2).

## Screenshots

- `screenshots/stage3-before/` — captured from a clean build of HEAD
  (Stage 2 final): 52 element/full-page shots + `sheet.html` contact sheet,
  EN+AR at 1440/768/390 plus a 2× phone contact shot.
- `screenshots/stage3-after/` — same harness against the Stage 3 build, so the
  pairs are directly comparable. The visible deltas are exactly the intended
  ones: contact (new CTA row, drawn arcs, orbit, pin halo), hero/case-study
  reveal settle states, and full-page rhythm.
- Both folders are gitignored QA artifacts; the repo-tracked root screenshots
  were restored to their committed state. (The interrupted earlier session had
  re-captured several root screenshots mid-reveal — `en/ar-contact.png` were
  blank background — so those re-captures were discarded rather than committed.)
- `scripts/capture-stage3.cjs` walks each page first so every reveal has fired
  and lazy art has decoded before the element shots — the same fix the Stage 2
  harness made, applied to this stage's harness.

## Performance notes

Every added animation is `opacity`/`transform` except the two 1px connector
shimmers (`background-position` on a 1px strip). The flow dots pause
off-screen; reveals are one-shot and disconnect their observers; the longest
infinite loops are the 90s orbit, 5.6s node pulse, 6.5s pin float, 3.6s status
pulse and 2.6s shimmer. Framer-motion remains used only for the hero entrance.
First Load JS is unchanged (168 kB for locale pages).

## Known remaining issues

1. Certification brand marks are still 33–40px crops (Stage 2 issue #1).
   Licensed brand SVGs remain the real fix.
2. The About stats row height (Stage 2 issue #2) and the tall skill row
   (Stage 2 issue #3) are unchanged.
3. The tracked uppercase eyebrow stays 9px on phones (Stage 2 issue #5).
4. Before React hydrates, content is fully visible and entrance animations may
   be skipped for a fast scroller — the deliberate graceful path, identical to
   the no-JS experience.
5. The decorative orbit-ring geometry change noted above is the only intentional
   deviation inside approved artwork; it is a dashed ring in place of a solid
   one at a slightly different tilt.
6. Contact still uses the CV-verified URLs only; the copy control is client-side
   only (without JavaScript the mailto link remains the affordance).
7. Deployment was verified on the local production standalone server; no hosting
   credentials are available in this environment, so the public deploy target
   needed the owner's choice (see the delivery report).
