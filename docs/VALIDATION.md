# Validation results

- Production build and TypeScript: passed; English and Arabic homepages and 14 case-study routes prerendered.
- Playwright/Chrome: both locales at 1440×900, 1280×800, 768×1024, 390×844, 360×800. No horizontal overflow or page JavaScript exceptions.
- Functional checks: seven project destinations per locale, six-to-seven project expansion, connectivity filter, case-study image selection, menu open/close, locale switching and original PDF HTTP 200.
- axe-core WCAG 2 A/AA and 2.1 AA automated scan: no violations in either mobile homepage after Dataiku contrast correction. Automated checks do not replace an assistive-technology audit.
- npm audit: zero vulnerabilities after compatible PostCSS override.
- Visual correction loop: desktop/section screenshots inspected against board; English mobile name spacing corrected; cropped button fragment removed from plant asset; mobile Arabic composition inspected at 390 and 360 widths; tablet description width narrowed to keep copy away from portrait; Next development indicator disabled in screenshots.
- Screenshot differences are documented in DESIGN.md. Original industrial photography and layered hero artwork were not supplied, so pixel-identical recreation is not claimed.

Final reference comparison also corrected desktop hero type scale and header spacing, and increased Arabic mobile text sizes.

## Stage 3 (motion, contact CTA, responsive and bilingual QA)

- Production build and TypeScript: passed; 23 static pages, all 14 case-study routes.
- `scripts/verify-stage3.cjs` (three runs): all checks passed — 22/22 reveal elements settle at opacity 1 in EN/AR at 1440/768/390; flow dots paused until the diagram reveals, then running; the below-1151px text path shimmers; globe arcs draw to stroke-dashoffset 0 with node/orbit/pin animations live; copy-email writes the clipboard and flips/resets its label bilingually; view-all shows 7 cards with the seventh animating in.
- Accessibility of the motion itself: under `prefers-reduced-motion` all content is visible without scrolling, `document.getAnimations()` is 0, the globe arcs render fully drawn and static; with JavaScript disabled there is no reveal gate and nothing is hidden; `@media print` forces the final state.
- Routes, links, language switching: 7 distinct slugs × 2 locales all return 200, CV PDF 200, EN-to-AR and AR-to-EN switching keeps the route on home and case studies, next-project navigation and the back-to-top anchor work.
- Responsive sweep: 1440/1280/1024/768/390/360 × EN/AR — no horizontal overflow, nothing left unrevealed, zero page errors. `validate.cjs`: 10/10 combos clean.
- axe-core WCAG 2 A/AA and 2.1 AA scan (after reveals settle): zero violations in both locales.
- Stage 1 and Stage 2 verifiers still pass with unchanged numbers: no approved layout geometry moved (Stage 3 animates opacity/transform only).
- Screenshots: gitignored `screenshots/stage3-before/` (HEAD build) and `screenshots/stage3-after/` (Stage 3 build), 52 shots + contact sheet each. `validate.cjs` — the generator of the tracked root screenshots — now settles every reveal before shooting, and the tracked set has been regenerated from the final build (its earlier captures came out blank for below-fold sections).

