# Mohamed Ahmed Shams — bilingual portfolio

Next.js App Router, React, TypeScript, Tailwind CSS v4, Motion, Lucide, next-intl. Complete source is in this directory.

## Run locally

Requires Node.js 20.9+ (Node 22 recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000/en or http://localhost:3000/ar.

## Production

```sh
npm ci
npm run build
npm start
```

Vercel: import this directory as a Next.js project, use `npm run build`, retain automatic Next.js settings. Netlify: use its Next.js runtime integration and `npm run build`; do not deploy this repository as plain static HTML. Set `NEXT_PUBLIC_SITE_URL` to your final HTTPS origin before building so social metadata uses the correct domain. The fallback is the existing portfolio URL verified in the supplied CV.

Self-host on a Node server with `npm start` behind an HTTPS reverse proxy. Production output uses `.next-production`; development uses `.next-dev` to avoid Windows file-lock collisions. Standalone server deployments must copy `public` and `.next-production/static` into the corresponding standalone directory. Do not expose development mode publicly.

## Content and assets

- `src/lib/content.ts`: CV-derived bilingual project, skill, certificate and training data.
- `src/components/Portfolio.tsx`: section components, interactive filters/menu, accessible routed case studies and image gallery.
- `src/app/globals.css` and `src/app/fidelity.css`: responsive reference-derived visual tokens, layout, the desktop project bento and a final marked Stage 2 block (about, skills, experience, certifications).
- `public/assets/card/`: display-resolution card art (see `docs/STAGE1-VISUAL-AUDIT.md`).
- `public/assets/cert-*.webp`: the five certification marks (33–40px crops; see `docs/STAGE2-VISUAL-AUDIT.md`).
- `public/assets/MohamedAhmedShams_CV.pdf`: original downloadable CV.
- `docs/DESIGN.md`: reference analysis, component map, provenance and remaining differences.
- `screenshots/`: screenshots at all five requested dimensions, individual desktop sections and case studies; validation report.

All seven projects have English and Arabic detail routes. Six appear initially, with Döhler Factory Cloudy Line as the flagship; View All reveals the seventh. Training courses remain distinct from certifications. Only CV-confirmed professional URLs are included. Images derived from the supplied board are illustrative; no actual project photographs are claimed. The card art in `public/assets/card/` re-renders those same crops at display resolution; replacing them with licensed high-resolution originals is still the highest-value remaining improvement (see `docs/STAGE1-VISUAL-AUDIT.md`). The supplied primary portrait is retained.

Fonts load from Google Fonts. Default dark theme intentionally matches the reference; no light theme toggle. No analytics, forms, database or credentials are required. Contact opens the verified email address.

## Verification

`node scripts/verify-stage1.cjs [BASE_URL]` checks the hero and project grid in both locales at five viewports (no horizontal scroll, no broken card images, flagship ordering, no empty grid cells, View All revealing the seventh project). `node scripts/capture-stage1.cjs <outDir> [BASE_URL]` writes the matching screenshots plus a contact sheet.

`node scripts/verify-stage2.cjs [BASE_URL]` checks about, skills, experience and certifications in both locales at 1440/1280/1024/768/390: stat numerals rendering at their designed size, the portrait frame ring, section gutters matching the projects grid, a gap-free skills grid, tile baselines, the integration path's legibility, equal certification card heights, brand art that is never upscaled or overflowing, the education block aligning with the timeline rail, and no text below 11px except the shared eyebrow. `node scripts/capture-stage2.cjs <outDir> [BASE_URL]` writes the matching screenshots plus a contact sheet, and `node scripts/audit-stage2.cjs [BASE_URL]` prints the raw geometry those judgements come from.

`npm run build` includes TypeScript validation. Run `node validate.cjs` with the local server running to exercise all ten viewport/locale combinations, project routes, filters, project expansion, gallery, mobile menu, locale switching and PDF availability. The script uses locally installed Chrome on Windows; change executablePath for other operating systems. Screenshot review compares individual compositions rather than treating the composite reference board as a website screenshot. No numerical fidelity score is claimed.

## Strict visual audit
See [the ranked audit](docs/VISUAL-AUDIT.md) for all ten corrections and reference/before/after screenshots. Audit-specific geometry lives in src/app/fidelity.css; technical SVG components live in src/components/TechnicalVisuals.tsx.

## Staged refinement
[Stage 1](docs/STAGE1-VISUAL-AUDIT.md) covered the hero and the project grid. [Stage 2](docs/STAGE2-VISUAL-AUDIT.md) covers the about section, the technology icons and skills layout, the professional experience timeline and the certifications — including the About statistics that were rendering at 17px instead of 56px, the certification brand plates, and a single content gutter across the sections. Motion and the contact section are not part of either stage.
