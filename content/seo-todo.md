# SEO owner review checklist

Do not publish guesses as engineering results, certifications, clients or dates.
The metadata, bios and project summaries are based on existing portfolio records.

## Required review and missing inputs

- [ ] **Arabic copy approval:** Have an Arabic-speaking owner review all Arabic
  titles/descriptions, bio, project introductions, FAQ text, video descriptions,
  breadcrumbs and notes ideas for regional relevance and technical accuracy.
- [ ] **Name spelling and positioning:** Confirm exact public spelling of
  Mohamed Ahmed Shams / محمد أحمد شمس, employer, role, Egypt/Saudi project
  coverage and whether the brand variants should appear in external bios.
- [ ] **Each project:** Confirm permission to name the organization and describe
  the work publicly, exact personal responsibilities, real project outcomes,
  deployed vs proof-of-concept status, supported dates and whether screenshots
  may be used. Do not invent performance percentages.
- [ ] **Döhler:** Confirm public attribution of production process, concentration
  specification and any first-of-its-kind claim already present in the source.
- [ ] **NCEC:** Confirm scope of the published station/platform work and any
  nonpublic infrastructure or security details that must remain excluded.
- [ ] **Groundwater / MODON / drilling:** Verify exact scope and numerical scale
  before highlighting figures as outcomes. Only source-documented scale remains.
- [ ] **Water network:** Confirm RTU testing/commissioning phases, field sites
  and whether district metered area terminology matches the actual contract.
- [ ] **MODON testing:** Confirm QA scope and public client naming.
- [ ] **Credentials:** Confirm exact issuer, certificate name, credential ID and
  verification URL for each credential. Current schema reflects only the name and
  issuer listed on this site; IDs are intentionally omitted.
- [ ] **Video uploads:** Dates were copied from the old site's six visible video
  cards. Cross-check with YouTube Studio before treating them as authoritative.
  No VideoObject contentUrl is included because a YouTube watch-page URL is not
  a direct downloadable video asset.
- [ ] **Web analytics:** Set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN from the actual
  Cloudflare Web Analytics site token. Do not commit the token to the repository.
- [ ] **Google:** Supply Search Console DNS TXT/HTML verification token and
  verify the correct property.
- [ ] **Bing:** Supply Webmaster Tools verification method/token or import
  authorization from verified Google Search Console.
- [ ] **Older portfolio Worker:** Configure the existing shams-systems Worker to
  issue permanent 301 redirects to the canonical shams-portfolio URL; this
  requires access to the OLD Worker's Cloudflare account/deployment.
- [ ] **Domain/www:** There is currently no custom www hostname on the
  workers.dev URL. If a custom domain is added, configure DNS, redirect www
  to the selected canonical host and update seo/config.ts.
- [ ] **LinkedIn and YouTube profiles:** Align name, role, primary expertise and
  canonical portfolio link with the verified identity; external profiles cannot
  be edited from this repository.
- [ ] **Article drafts:** Complete, technically review, date and approve each
  MDX article before making it indexable. Do not publish TODO templates.
- [ ] **Media:** Review illustrative project photographs for suitability.
  Replace with approved authentic project visuals only if permitted. Do not
  mislabel illustrative images as project-site photographs.
- [ ] **Core Web Vitals:** Monitor 28-day field LCP, CLS and INP in Search Console
  and Cloudflare Web Analytics; lab Lighthouse cannot establish field INP.
- [ ] **sitemap lastmod:** The current fixed lastmod indicates this site's
  October 2026 revision, not a project's completion. Update from actual site
  edit timestamps in future releases.

## SEO content editorial constraints

- Avoid inventing employer-wide, project-wide or client-wide metrics.
- Never write ratings, testimonials or reviews that do not exist in source.
- FAQ markup corresponds exactly to the questions visible on the homepage;
  search engines may not award FAQ rich results to portfolio websites.
- Use the YouTube watch URLs as watch links, not VideoObject raw content URLs.
- All Open Graph graphics are branded editorial images, not project photographs.
