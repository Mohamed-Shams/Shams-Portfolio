# Validation results

- Production build and TypeScript: passed; English and Arabic homepages and 14 case-study routes prerendered.
- Playwright/Chrome: both locales at 1440×900, 1280×800, 768×1024, 390×844, 360×800. No horizontal overflow or page JavaScript exceptions.
- Functional checks: seven project destinations per locale, six-to-seven project expansion, connectivity filter, case-study image selection, menu open/close, locale switching and original PDF HTTP 200.
- axe-core WCAG 2 A/AA and 2.1 AA automated scan: no violations in either mobile homepage after Dataiku contrast correction. Automated checks do not replace an assistive-technology audit.
- npm audit: zero vulnerabilities after compatible PostCSS override.
- Visual correction loop: desktop/section screenshots inspected against board; English mobile name spacing corrected; cropped button fragment removed from plant asset; mobile Arabic composition inspected at 390 and 360 widths; tablet description width narrowed to keep copy away from portrait; Next development indicator disabled in screenshots.
- Screenshot differences are documented in DESIGN.md. Original industrial photography and layered hero artwork were not supplied, so pixel-identical recreation is not claimed.

Final reference comparison also corrected desktop hero type scale and header spacing, and increased Arabic mobile text sizes.

