# SEO engineering audit — Shams Portfolio (2026-10-15)

## Baseline observations before edits

- English and Arabic home and tested project pages already supplied main
  text in their initial HTML, even with JavaScript disabled. One H1 was
  present per sampled page. Loader markup was in SSR HTML, but the visible
  first-visit experience covered the hero for approximately 3.4 seconds.
- Metadata had generic/long descriptions on project pages. Per-page
  canonical and reciprocal hreflang were absent. Homepage titles did not
  emphasize Ignition SCADA. Open Graph images lacked project-specific art.
- robots.txt and sitemap.xml had an obsolete netlify.app fallback hostname.
- No visible FAQ section or matching FAQPage schema, no VideoObject schema,
  no verified Person/CreativeWork/BreadcrumbList JSON-LD.
- Internal project links, project imagery and bilingual page content existed.
  Image alt values were primarily project-specific; decorative images
  intentionally used alt="". No missing required alt attributes were
  identified by the finished static validator.

## Implemented

- Single typed SEO configuration and bilingual keyword mapping in
  seo/config.ts, seo/keywords.ts, with unique page metadata.
- Factual bilingual engineering biography, six FAQ pairs, and project
  introductions before galleries; descriptive headings, breadcrumbs,
  related-project links and updated public footer identity.
- EN/AR canonicals, reciprocal hreflang, x-default, Open Graph, Twitter,
  sitemap/robots canonical URLs, and 1200x630 editorial project OG images.
- Person, WebSite, ProfilePage, FAQPage, CreativeWork, BreadcrumbList and
  VideoObject JSON-LD. Video dates copied from old portfolio; direct media
  contentUrl intentionally omitted rather than misusing YouTube watch links.
- Preloader changed to opt-in preview mode so normal visits no longer wait
  for the cinematic cover before the hero appears. Main text remains SSR.
- Localized notes index, unpublished MDX template, Article schema factory,
  404 page and HTTPS security-header declarations.
- Build-breaking seo:check script validates generated HTML from both locales.
- Cloudflare Web Analytics integration behind environment token, owner setup
  guide and old Worker redirect instructions.

## Follow-up

See content/seo-todo.md for Arabic copy sign-off, project outcomes, credential
IDs, external profiles, publishing permissions, Web Analytics token and old
Worker redirect. None were invented or changed in external accounts.

## Local validation results

- `npm run lint`: passed with no errors; four nonblocking warnings
  (pre-existing unused `SESSION_KEY`, unused ProjectArt index, and two Next.js
  font stylesheet placement advisories).
- `npm run build:next`: passed; all pages statically generated.
- `npm run seo:check`: **18/18** generated pages passed, including the
  intentionally noindex draft Notes indexes. The sitemap excludes these drafts.
- `node scripts/seo-browser-qa.cjs`: **15/15** local HTTP/SSR tests passed,
  including JS-disabled English/Arabic, true 404, 301 redirects, security
  response headers, sitemap and robots.
- `node scripts/youtube-social-qa.cjs`: **6/6** English/Arabic
  desktop/tablet/mobile checks passed; video thumbnails, links and contacts
  unaffected by SEO modifications.
- Lighthouse 12 mobile (local production Next build, lab conditions):
  after non-render-blocking Google Fonts, SEO **100**, accessibility **100**,
  performance **92**, CLS approximately **0.00035**, TBT approximately
  **130 ms**, LCP approximately **3.13 seconds**. LCP improved from the
  previous approximately 3.6-second lab reading but remains above 2.5 seconds.
  English and Arabic fonts were confirmed loaded after page render, with no
  mobile horizontal overflow or browser errors. Real-user field INP cannot
  be proven by Lighthouse.

### Limitations

- Old Worker redirects, search-console verification, external social profile
  edits and Cloudflare Web Analytics activation require owner account actions.
- The portfolio's non-verified numeric outcomes have not been introduced as
  SEO claims. Arabic copy is marked for owner approval.
- Exact Google/Bing indexing and rankings cannot be guaranteed by a deploy.
- Mobile field LCP and INP require production real-user measurement.
