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

Self-host on a Node server with `npm start` behind an HTTPS reverse proxy. Production output uses `.next`; development uses `.next-dev` to avoid Windows file-lock collisions. This standard production output path is required by the OpenNext Cloudflare adapter. Standalone server deployments must copy `public` and `.next/static` into the corresponding standalone directory. Do not expose development mode publicly.

### Cloudflare Workers deployment

The repository includes a pinned OpenNext adapter, Wrangler configuration, and Worker build scripts. These prevent Wrangler from trying to migrate the project dynamically on every deployment.

The existing Cloudflare Workers Builds settings work without changing the dashboard:

- **Build command:** `npm run build` (runs the full OpenNext build, including the underlying Next.js build, and creates both `.next` and `.open-next`)
- **Deploy command:** `npx wrangler deploy` (Wrangler detects the compiled OpenNext project and delegates to the OpenNext deploy command)

OpenNext calls `npm run build:next` internally to compile Next.js without recursively invoking itself. For local validation, run `npm run build:cloudflare` or `npm run preview:cloudflare`. `npm run deploy` is also supported for direct deployment with Cloudflare credentials. `npm run build:worker` is only for rebuilding the Worker from an already-existing `.next` output.

## Content and assets

- `src/lib/content.ts`: CV-derived bilingual project, skill, certificate and training data, including each project's gallery captions, verified four-step architecture, scale tiles and technology notes.
- `src/components/Portfolio.tsx`: section components, interactive filters/menu, accessible routed case studies with gallery controls (thumbnails, prev/next and arrow keys).
- `src/components/ProjectArt.tsx`: original vector artwork for the case-study galleries — a per-project site scene, the verified architecture path and an operations view built from the project's real tags and scale tiles. Labeled illustrative; no project photography is claimed.
- `src/components/BrandMarks.tsx`: CC0 brand marks (Simple Icons v16) for recognisable tools; concepts and brands without a permission-compatible source keep generic glyphs.
- `src/app/globals.css` and `src/app/fidelity.css`: responsive reference-derived visual tokens, layout, the desktop project bento, a marked Stage 2 block (about, skills, experience, certifications) and a marked Stage 3 block (scroll reveals, data-flow motion, hover polish, contact CTA).
- `public/assets/card/`: display-resolution card art (see `docs/STAGE1-VISUAL-AUDIT.md`).
- `public/assets/brand/*.svg`: vector issuer marks (AWS, Dataiku, Siemens) for the certification plates; `public/assets/cert-*.webp` keeps the Ignition and AVEVA crops, which have no permission-compatible vector source (see `docs/STAGE2-VISUAL-AUDIT.md`).
- `public/assets/MohamedAhmedShams_CV.pdf`: original downloadable CV.
- `docs/DESIGN.md`: reference analysis, component map, provenance and remaining differences.
- `screenshots/`: screenshots at all five requested dimensions, individual desktop sections and case studies; validation report.

All seven projects have English and Arabic detail routes. Six appear initially, with Döhler Factory Cloudy Line as the flagship; View All reveals the seventh. Training courses remain distinct from certifications. Only CV-confirmed professional URLs are included. Images derived from the supplied board remain illustrative; no actual project photographs are claimed. Homepage project cards keep their approved re-rendered crops (`public/assets/card/`), while every case-study gallery is original vector artwork — per-project scenes, the verified architecture path and an operations view, each with an explicit illustrative-artwork disclaimer. The contact section links the verified email address and this repository's GitHub profile; the redundant link back to this same portfolio was removed. The supplied primary portrait is retained.

Fonts load from Google Fonts. Default dark theme intentionally matches the reference; no light theme toggle. No analytics, forms, database or credentials are required. Contact opens the verified email address.

## Verification

`node scripts/verify-stage1.cjs [BASE_URL]` checks the hero and project grid in both locales at five viewports (no horizontal scroll, no broken card images, flagship ordering, no empty grid cells, View All revealing the seventh project). `node scripts/capture-stage1.cjs <outDir> [BASE_URL]` writes the matching screenshots plus a contact sheet.

`node scripts/verify-stage2.cjs [BASE_URL]` checks about, skills, experience and certifications in both locales at 1440/1280/1024/768/390: stat numerals rendering at their designed size, the portrait frame ring, section gutters matching the projects grid, a gap-free skills grid, tile baselines, the integration path's legibility, equal certification card heights, brand art that is never upscaled or overflowing, the education block aligning with the timeline rail, and no text below 11px except the shared eyebrow. `node scripts/capture-stage2.cjs <outDir> [BASE_URL]` writes the matching screenshots plus a contact sheet, and `node scripts/audit-stage2.cjs [BASE_URL]` prints the raw geometry those judgements come from.

`node scripts/verify-stage3.cjs [BASE_URL]` checks the Stage 3 reveal system, the SCADA/flow/globe motion, the contact copy CTA, prefers-reduced-motion and no-JS behaviour, all 14 case-study routes, language switching and a 6-width × 2-locale responsive sweep. `node scripts/capture-stage3.cjs <outDir> [BASE_URL]` writes the matching screenshots plus a contact sheet.

`node scripts/capture-case-studies.cjs <outDir> [BASE_URL]` captures viewport and full-page screenshots of two case studies in both locales at 1440px and 390px widths, and exercises the gallery controls (thumbnail click, next button and arrow keys) while asserting no page errors and no horizontal overflow.

`npm run build` includes TypeScript validation. Run `node validate.cjs` with the local server running to exercise all ten viewport/locale combinations, project routes, filters, project expansion, gallery, mobile menu, locale switching and PDF availability. The script uses locally installed Chrome on Windows; change executablePath for other operating systems. Screenshot review compares individual compositions rather than treating the composite reference board as a website screenshot. No numerical fidelity score is claimed.

## Strict visual audit
See [the ranked audit](docs/VISUAL-AUDIT.md) for all ten corrections and reference/before/after screenshots. Audit-specific geometry lives in src/app/fidelity.css; technical SVG components live in src/components/TechnicalVisuals.tsx.

## Staged refinement
[Stage 1](docs/STAGE1-VISUAL-AUDIT.md) covered the hero and the project grid. [Stage 2](docs/STAGE2-VISUAL-AUDIT.md) covers the about section, the technology icons and skills layout, the professional experience timeline and the certifications — including the About statistics that were rendering at 17px instead of 56px, the certification brand plates, and a single content gutter across the sections. [Stage 3](docs/STAGE3-VISUAL-AUDIT.md) wires the one-shot scroll reveals, adds the SCADA data-flow motion and refined hover states, animates the contact globe's signal arcs and adds a copy-email CTA — all transform/opacity-only, honouring prefers-reduced-motion and the no-JS path, with the Stage 1/2 geometry still frozen.

## Case-study depth
The latest pass leaves the approved homepage untouched and rebuilds the routed case studies: data-driven per-project galleries rendered as original vector plates (site scene, verified four-step architecture, operations view), prev/next + thumbnail + keyboard gallery controls, an at-a-glance rail of verified scale tiles, numbered responsibilities, technology cards with bilingual one-line descriptions, a wide architecture plate that becomes a text ladder below 851px, brand-accurate technology and certification marks (CC0 Simple Icons where available), and a verified GitHub profile link in place of the redundant self-portfolio link. Screenshot evidence lives in `screenshots/case-studies/`.
