# Shams-Portfolio final editorial/visual polish and QA

## Scope and constraints

Applied on `main` without modifying the read-only old `shams-systems`
repository, the seven project records, preloader/hero motion code, the
Natural Earth globe's geographic renderer, or the original certificate assets.
The pre-existing local `next-env.d.ts` difference was left untouched.

## Content and information architecture changes

- **Tools & Technologies** remains the canonical filterable skills grid.
  The data-integration path is retained inside an optional disclosure,
  helping technically curious visitors without showing two competing skills
  presentations at the same time.
- **Platforms & Technologies** keeps the owner's preferred **prominent**
  original horizontal slider. This is a 13-platform animated visual, not a
  second filterable grid. The post-polish shrink was explicitly reverted:
  desktop cards 111px with 55px icons (46-second loop), mobile cards 89px
  with 44px icons (56-second loop). Its original heading and full visual
  presence are preserved.
- **Selected Credentials** now features four highlights (Ignition Core,
  AWS AI Practitioner, AVEVA Application Server, and Dataiku Core/Advanced).
  Dataiku ML Practitioner remains discoverable in the full document library;
  WinCC Unified Essentials is listed under additional training.
- **Certificate Library** contains all ten original, byte-matched PDF files
  with working view and download links; document proofs are distinguished
  from featured credentials. No fake certificate files were introduced.
- The extra colloquial Arabic contact headline repeated the main CTA and
  appeared even on the English page. It has been removed to simplify the
  contact call to action and avoid unnecessary duplicate copy.
- Project-detail pages now share the localized footer with the homepage and
  offer a bottom link back to the project list; a skip-to-content link and
  target are present on each case-study route.
- Project dates localize the word `Present` as `حتى الآن` on the Arabic
  case-study heading and quick facts, consistent with the homepage timeline.

## Signature provenance and treatment

The only available original signature asset is `public/assets/signature.webp`
at **138×33 pixels**. Its `signature.svg` replacement is a jagged autotrace
of that low-resolution raster, not evidence of an independently captured
high-resolution handwritten signature. Producing a smooth new autograph
would alter authentic handwriting, so **neither a new signature nor invented
strokes were generated**. The About section now shows a readable, responsive
typographic **name mark** in English and Arabic, with the existing visual
motion language. The original assets remain archived in `public/assets`.
For a faithful handwritten autograph later, the owner should supply an
original pen-on-paper scan or vector capture.

## Arabic typography

- Contact, section headings and the footer use the already-loaded Alexandria
  Arabic font. Only Arabic-context text has normal letter/word spacing;
  English, code identifiers, email links, SVG icons, and the English typography
  are not affected by a site-wide override.
- Contact heading/paragraphs receive intentional RTL alignment, readable
  line heights and wrapping; the email address has its own LTR isolated span.
- Footer uses RTL text direction and safe bidi behavior for mixed numerals.
- Desktop, tablet, and mobile layouts were inspected in both languages.

## Remaining production accessibility and navigation defects addressed

- The hamburger menu now sends focus to its first link when opened; Tab moves
  among menu links. Escape closes it and restores focus to the trigger.
  Clicking/tapping outside or moving keyboard focus out of the header also
  closes it. The button has an `aria-controls` target.
- The full-size marquee runs normally for ordinary visitors. Only visitors
  who explicitly request reduced motion in their OS/browser receive a
  non-animated, horizontally scrollable presentation of the same 13 badges.
  Duplicated decorative ticker items are hidden in that alternate mode.
- All seven case-study pages now provide a skip link to their `main#main`
  landmark as well as the shared localized footer.

## Validation gates

These are checked against the Cloudflare/OpenNext production-preview Worker
and rechecked on live Cloudflare following successful automatic deployment:

- `npm run typecheck` and `npm run build`.
- `node scripts/final-polish-qa.cjs`: homepage EN/AR at
  1440×900, 768×1024 and 390×844 plus 14 localized case-study page loads,
  including decoded cover images, overflow, name mark, info hierarchy, filters,
  optional diagram, ticker motion, PDF document library, CV/project links,
  and live globe presence.
- `node scripts/final-accessibility-qa.cjs`: WCAG 2 A/AA and WCAG 2.1 A/AA
  checks on EN/AR desktop and mobile.
- Existing previously-passing targeted suites remain available:
  `scripts/interactive-globe-qa.cjs`,
  `scripts/globe-motion-continuity-qa.cjs` and
  `scripts/certificates-platforms-qa.cjs`. Their underlying features
  were not rewritten by this polish pass.
- `node scripts/final-delivery-gaps-qa.cjs`: tests mobile keyboard menu,
  escape/outside dismissal, all 14 localized case-page skip links/footers,
  Arabic NCEC period, normal ticker dimensions and reduced-motion scrolling.

## Available and unavailable certificate PDFs

All 10 real PDFs and 16 original migrated platform assets remain in place.
The following six achievements still lack corresponding authentic PDF files
in the previous portfolio: AVEVA Application Server, WinCC Unified
Essentials, IIoT/PLC Integrations, Docker & Kubernetes, Advanced & Basic
Automation Courses, and Complete RAG System. They remain text entries,
without invented PDF downloads.
