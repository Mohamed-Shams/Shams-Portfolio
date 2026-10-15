/* Browser / HTTP verification complementing the static-HTML seo:check gate.
   SEO_URL may point to local Next build or deployed Cloudflare Worker. */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const BASE = (process.env.SEO_URL || "http://127.0.0.1:4344").replace(/\/$/, "");
const folder = path.resolve(process.env.SEO_EVIDENCE_DIR || "screenshots/seo-browser-qa");
fs.mkdirSync(folder, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  let passes = 0;
  const records = [];
  try {
    for (const locale of ["en", "ar"]) {
      for (const pagePath of ["", "/projects/dohler-cloudy-line", "/projects/modon-testing", "/notes"]) {
        const pathName = "/" + locale + pagePath;
        const ctx = await browser.newContext({ javaScriptEnabled: false,
          viewport: { width: 390, height: 850 } });
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        try {
          // CSS arrives as a separate stylesheet; wait for load before testing
          // computed visibility in a JavaScript-disabled browser.
          const response = await page.goto(BASE + pathName, { waitUntil: "load", timeout: 60000 });
          assert.equal(response.status(), 200, pathName + " expected 200");
          const result = await page.evaluate(() => {
            const hero = document.querySelector(".hero");
            const intro = document.querySelector(".portfolio-intro");
            return {
              h1: document.querySelectorAll("h1").length,
              title: document.title,
              canonical: document.querySelector('link[rel="canonical"]')?.href,
              h2: document.querySelectorAll("h2").length,
              bodyChars: document.body.textContent?.length || 0,
              introDisplay: intro ? getComputedStyle(intro).display : "absent",
              heroVisible: hero ? getComputedStyle(hero).display !== "none" : true,
              videoCount: document.querySelectorAll(".youtube-video-card").length,
              faqCount: document.querySelectorAll("#faq details").length,
            };
          });
          assert.equal(result.h1, 1, pathName + " one heading");
          assert(result.bodyChars > 1000, pathName + " SSR content visible without JS");
          if (!pagePath) {
            assert.equal(result.introDisplay, "none", pathName + " intro doesn't delay hero");
            assert.equal(result.videoCount, 6, pathName + " 6 public videos");
            assert.equal(result.faqCount, 6, pathName + " 6 FAQs");
            assert(result.heroVisible, pathName + " hero shown");
          }
          assert.deepEqual(errors, [], pathName + " browser errors");
          records.push({ page: pathName, ...result });
          passes++;
        } finally { await ctx.close(); }
      }
    }
    const request = await browser.newContext();
    const unknown = await request.request.get(BASE + "/en/projects/not-a-project");
    assert.equal(unknown.status(), 404, "Unknown project must return actual 404");
    passes++;
    for (const route of ["/en/", "/EN", "/ar/projects/Dohler-cloudy-line/"]) {
      const res = await request.request.get(BASE + route, { maxRedirects: 0 });
      assert.equal(res.status(), 301, route + " canonical 301");
      passes++;
    }
    const main = await request.request.get(BASE + "/en");
    const headers = main.headers();
    for (const name of ["strict-transport-security", "x-content-type-options", "referrer-policy"])
      assert(headers[name], name + " header missing");
    passes++;
    const xml = await request.request.get(BASE + "/sitemap.xml");
    assert.equal(xml.status(), 200);
    const sitemap = await xml.text();
    assert(sitemap.includes("shams-portfolio.mshams0174.workers.dev/en/projects/"));
    assert(!sitemap.includes("netlify.app"));
    assert(sitemap.includes('hreflang="ar"'));
    passes++;
    const robot = await request.request.get(BASE + "/robots.txt");
    assert((await robot.text()).includes("shams-portfolio.mshams0174.workers.dev/sitemap.xml"));
    passes++;
    await request.close();
    fs.writeFileSync(path.join(folder, "results.json"), JSON.stringify({ base: BASE, records, passes }, null, 2));
    console.log("SEO BROWSER QA", passes, "PASS");
  } finally { await browser.close(); }
})().catch(error => { console.error("SEO BROWSER QA FAIL", error); process.exitCode = 1; });
