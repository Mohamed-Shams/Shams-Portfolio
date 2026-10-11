# Reconstruction specification

The 1536×1024 reference is a presentation board, not one website screen. Implement its panels as separate sections and a routed case study. Desktop hero: left copy, right supplied portrait, black-to-transparent blends, amber industrial horizon, cyan SCADA overlay. Mobile: portrait above centered Arabic copy, stacked full-width actions. Container 1200px; wide hero 1440px. Desktop sections have generous 88px vertical spacing to translate the compressed board to a usable website.

Tokens: background #080d12, surface #101820, elevated #151f29, white #f4f5f6, muted #a6b0bb, amber #f1a342, cyan #1688b5. Type: Space Grotesk headings, Inter body, Alexandria Arabic, JetBrains Mono technical details. Cards use 7–10px radii, 1px blue-gray borders. Six project cards at three columns desktop, two mobile. Technology filters and 4-column tiles desktop. Timeline and compact credential tiles. SVG contact globe.

Component map: Header, Portfolio (Hero, About, Projects, Technologies, Journey, Credentials, Contact), Scada, GlobeArt, CaseStudy. Locale content lives in src/lib/content.ts; next-intl provides locale context; explicit /en and /ar routes set document language/direction.

Source of professional facts: full three-page supplied CV. Seven projects, five certifications, seven courses, education and languages. No unverified LinkedIn or certificate URLs. 7K+, 10K+, 1.3K+ are team project scale. Employer start September 2024 and POC start June 2024 preserved as supplied, without inference.

Asset provenance: portrait.webp is the original attached portrait, converted losslessly in composition (WebP compression only). Industrial images and secondary monochrome portrait are extracted from the user-supplied reference board. Industrial crops are labeled illustrative, never actual project photos. They are low resolution and will not match high-resolution source photography. No new portrait or invented project photography was generated. Google Fonts supplies requested fonts.

Known visual differences: supplied portrait has different lighting/crop/background than the composited desktop reference; original face preserved. Industrial thumbnail crops are low-resolution; hero blends these with the supplied portrait rather than claiming recovery of the original layered artwork. About portrait uses reference crop. Technology/certification symbols are lightweight text treatments rather than official brand logo assets. Contact globe is a geometric SVG approximation. Reference case-study thumbnails are replaced by available illustrative industrial crops. No theme toggle: dark reference is preserved.

## Subsequent strict audit
The original implementation notes above describe the first delivery. The corrected dimensions, asset usage, and remaining differences are recorded in VISUAL-AUDIT.md. The audit replaces the sparse globe, text-only credential identifiers, hero composition, and section geometry described above.
