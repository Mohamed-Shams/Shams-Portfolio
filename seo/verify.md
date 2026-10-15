# Search engine setup and measurement guide

Canonical website: https://shams-portfolio.mshams0174.workers.dev

## 1. Google Search Console

1. Open https://search.google.com/search-console and sign in with the account
   that will maintain this portfolio.
2. For a **Domain property**, add a domain you own and place the supplied DNS
   TXT verification token in its DNS provider. The workers.dev subdomain is
   controlled by Cloudflare, so use a **URL-prefix property** for the current
   workers.dev URL if you cannot verify the parent domain.
3. For the **URL-prefix property**, enter
   https://shams-portfolio.mshams0174.workers.dev/ exactly. Complete one of
   the supported methods: HTML tag (requires a Next.js verification metadata
   code), verification HTML file, or eligible Google Analytics/Tag Manager
   account. Do not put private verification tokens into public notes.
4. Submit https://shams-portfolio.mshams0174.workers.dev/sitemap.xml.
5. Use URL Inspection on /en, /ar and key English/Arabic project pages.
   Test live URL first; request indexing where appropriate. Recheck the
   canonical and discovered alternate languages.
6. Watch Pages/Indexing and Core Web Vitals reports after Google has crawled.
   A successful sitemap submission is not a guarantee of ranking or indexing.

## 2. Bing Webmaster Tools

1. Open https://www.bing.com/webmasters/.
2. Import your verified Google property if eligible, or add the URL-prefix
   property manually.
3. Use the provided XML file, HTML tag or DNS token to verify ownership.
4. Submit the same sitemap.xml. Check Index Explorer and URL Inspection.
5. IndexNow is optional and should only be configured after verification.

## 3. Cloudflare Analytics / security headers

1. Create a Web Analytics site for the canonical host in Cloudflare.
2. Set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN in Cloudflare build environment
   and deploy. The site loads the cookieless Cloudflare beacon only when
   that token is configured.
3. Check security response headers: Strict-Transport-Security,
   X-Content-Type-Options and Referrer-Policy. The Next.js configuration
   supplies these; a Cloudflare Transform Rule can enforce them if a Worker
   deployment or CDN route strips them.
4. Record mobile field LCP (<2.5 s), CLS (<0.1) and INP (<200 ms) after
   enough real-user samples. Lighthouse provides lab proxies, not field INP.

## 4. Old-website permanent redirects (requires old Worker access)

Current old site: https://shams-systems.mshams0174.workers.dev
New site: https://shams-portfolio.mshams0174.workers.dev

In the **old** Cloudflare Worker only, add a route-compatible redirect handler:

```js
export default {
  fetch(request) {
    const old = new URL(request.url);
    // Old site had single-page anchors; default to the English homepage.
    const mapped = old.pathname === "/" ? "/en" : old.pathname;
    const url = new URL(mapped + old.search, "https://shams-portfolio.mshams0174.workers.dev");
    return Response.redirect(url, 301);
  },
};
```

Check every known old path manually. Do **not** replace the old site with this
handler until the old Cloudflare account/deployment has been confirmed.
Fragments are never sent to the server; they cannot be preserved in HTTP 301.
The new portfolio's own middleware redirects trailing-slash/uppercase routes.
A www redirect only exists if a custom domain and DNS record are configured.

## 5. Weekly review (15–20 minutes)

- Check canonical indexing and sitemap warnings in Google and Bing.
- Compare branded (Mohamed Ahmed Shams, محمد أحمد شمس) and topical SCADA
  queries, impressions and clicks by English/Arabic landing page.
- Inspect crawl errors, unexpected 404s, lost rich-result eligibility and
  metadata/hreflang mistakes.
- Measure actual field Core Web Vitals, conversions to LinkedIn/YouTube,
  project-page engagement and broken external videos.
- Review any new publication for accurate dates, consent, citations,
  internal links, alt text and unique metadata before indexing.

## 6. Quality gates before every deploy

```bash
npm ci
npm run seo:og
npm run lint
npm run build:next
# Next build runs seo:check automatically. Optional explicit rerun:
npm run seo:check
```

The checker reads all generated SSG HTML without JavaScript. It validates
unique page titles (<=60), descriptions (<=160), a single H1, canonical URLs,
EN/AR/x-default alternates, 1200x630 OG images and the JSON-LD types used.
It validates linked static assets and known internal routes. It cannot verify
recruiter interest, rankings, outside account settings or schema rich-result
eligibility. Google Rich Results Test can supplement the local validation.
