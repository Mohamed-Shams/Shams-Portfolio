/* Focused integrated release QA for the editorial, signature and RTL fixes.
 * Runs against the local Cloudflare Worker preview or the deployed URL.
 * Does not rewrite/modify any content.
 */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const BASE = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const OUT = path.resolve(process.env.POLISH_QA_OUT || "screenshots/final-polish");
fs.mkdirSync(OUT, { recursive: true });
const sluglist = ["ncec-air-quality", "dohler-cloudy-line", "ground-water",
  "modon-poc", "drilling-equipment", "water-network", "modon-testing"];

async function focusSection(page, section, name) {
  await page.locator(section).first().evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(OUT, name + ".png") });
}
const stat = async page => page.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  errors: [],
  font: document.fonts.status,
  arabicContactSpacing: getComputedStyle(document.querySelector(".contact-copy h2")).letterSpacing,
  contactFont: getComputedStyle(document.querySelector(".contact-copy h2")).fontFamily,
  contactH2Height: document.querySelector(".contact-copy h2").getBoundingClientRect().height,
  signatureImages: document.querySelectorAll("#about .signature img").length,
  nameMark: document.querySelector("#about .name-mark-text")?.textContent,
  topHeadline: document.querySelector(".hero h1")?.textContent,
  featured: document.querySelectorAll(".featured-credentials-grid > .cert-card").length,
  certificates: document.querySelectorAll(".certificate-document").length,
  tickerItems: document.querySelectorAll(".platform-ticker-set:first-child .platform-ticker-item").length,
  flowVisible: !!document.querySelector(".flow-showcase:not(details) .flow-steps"),
  footer: document.querySelector("footer")?.textContent,
}));
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true,
  });
  const results = [];
  try {
    for (const locale of ["en", "ar"]) for (const viewport of [
      { width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 },
    ]) {
      const tag = locale + "-" + (viewport.width === 1440 ? "desktop" : viewport.width === 768 ? "tablet" : "mobile");
      const ctx = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push("page: " + e.message));
      page.on("console", m => { if(m.type() === "error" || /hydration/i.test(m.text())) errors.push("console: " + m.text()); });
      page.on("response", r => { if(r.status() >= 400) errors.push("HTTP " + r.status() + " " + r.url()); });
      try {
        await page.goto(BASE + "/" + locale, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play") &&
          !document.querySelector(".portfolio-intro"), null, { timeout: 15000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(450);
        const intro = await stat(page);
        assert.equal(intro.signatureImages, 0, tag + " no false autotraced signature");
        assert(intro.nameMark && intro.nameMark.length > 9, tag + " crisp typeset name");
        assert.equal(intro.featured, 4, tag + " four featured credential highlights");
        assert.equal(intro.certificates, 10, tag + " ten actual PDF files remain");
        assert.equal(intro.tickerItems, 13, tag + " original platform ticker intact");
        assert.equal(intro.flowVisible, true, tag + " data path is permanently rendered");
        assert(intro.overflow <= 1, tag + " no initial overflow: " + intro.overflow);
        if(locale === "ar") {
          assert(intro.contactFont.includes("Alexandria"), tag + " Arabic contact font");
          assert(intro.arabicContactSpacing === "normal" || intro.arabicContactSpacing === "0px",
            tag + " normal Arabic letter spacing: " + intro.arabicContactSpacing);
          assert.equal(await page.locator(".contact h3[lang='ar']").count(), 0,
            tag + " duplicate Arabic CTA removed");
        }
        const img = page.locator(".hero-portrait img");
        assert(await img.evaluate(e => e.complete && e.naturalWidth > 0), tag + " hero loaded");
        await focusSection(page, "#about", tag + "-about");
        await focusSection(page, "#skills", tag + "-skills");
        assert.equal(await page.locator(".flow-showcase summary").count(), 0,
          tag + " data path not hidden behind disclosure");
        assert(await page.locator(".flow-showcase-heading").isVisible(),
          tag + " flow title always visible");
        const expandedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(expandedOverflow <= 1, tag + " expanded data-flow does not overflow the page");
        await page.screenshot({ path: path.join(OUT, tag + "-integration.png") });
        const connectivity = locale === "en" ? "Connectivity" : "الاتصال";
        await page.getByRole("button", { name: connectivity, exact: true }).click();
        assert((await page.locator(".skill-tile").count()) > 0, tag + " category filter works");
        await page.getByRole("button", { name: locale === "en" ? "All" : "الكل", exact: true }).click();
        await focusSection(page, "#certifications", tag + "-certs");
        const ticker = page.locator(".platform-ticker-track");
        const start = await ticker.evaluate(el => getComputedStyle(el).transform);
        await page.waitForTimeout(380);
        assert.notEqual(start, await ticker.evaluate(el => getComputedStyle(el).transform), tag + " ticker moves");
        await focusSection(page, "#certificate-library", tag + "-library");
        const pdfs = await page.locator(".certificate-document a[target='_blank']").evaluateAll(nodes =>
          nodes.map(x => new URL(x.href).pathname));
        assert.equal(new Set(pdfs).size, 10, tag + " unique genuine PDFs");
        const missingPdfClaims = await page.locator(".cert-card").evaluateAll(cards => cards.filter(c =>
          /AVEVA Application Server|WinCC Unified Essentials/.test(c.textContent) &&
          c.querySelector('a[href$=".pdf"]')).length);
        assert.equal(missingPdfClaims, 0, tag + " no fabricated AVEVA/WinCC certificate PDF");
        // Two essential download/navigation affordances remain valid as URLs,
        // including URLs from the seven-case-study project index.
        const links = await page.locator("header a, .hero .actions a, .project-card").evaluateAll(nodes =>
          nodes.map(e => new URL(e.href).pathname));
        assert(links.some(x => x.startsWith("/" + locale + "/projects/")),
          tag + " project navigation is not broken");
        assert(links.some(x => x.toLowerCase().endsWith(".pdf")),
          tag + " CV download link exists");
        await focusSection(page, "#contact", tag + "-contact");
        await page.locator("footer").evaluate(e => e.scrollIntoView({ behavior: "instant", block: "end" }));
        await page.waitForTimeout(260);
        await page.screenshot({ path: path.join(OUT, tag + "-footer.png") });
        const end = await stat(page);
        assert(end.overflow <= 1, tag + " no footer overflow: " + end.overflow);
        assert(await page.locator(".globe-art[data-interactive-ready='true']").count() === 1,
          tag + " interactive globe activated");
        assert(await page.locator(".globe-beacon--egypt").count() === 1,
          tag + " Egypt beacon still visible");
        assert.equal(errors.length, 0, tag + " no runtime errors: " + JSON.stringify(errors.slice(0,4)));
        console.log("PASS", tag, "content, name, RTL, filters, ticker, PDFs, globe, layout, runtime");
        results.push({ tag, pass: true, initial: intro, final: end, errors });
      } finally { await ctx.close(); }
    }
    // Seven actual project pages in both languages, real browser navigation.
    const ctx = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    const page = await ctx.newPage();
    for(const locale of ["en","ar"]) for(const slug of sluglist) {
      const url = BASE + "/" + locale + "/projects/" + slug;
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      assert.equal(response.status(), 200, url + " HTTP 200");
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".case-hero").evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
      await page.waitForFunction(() => [...document.querySelectorAll(".case-hero img")]
        .some(i => i.complete && i.naturalWidth > 0), null, { timeout: 12000 });
      const project = await page.evaluate(() => ({
        headline: document.querySelector(".case-heading h1")?.textContent,
        cover: [...document.querySelectorAll(".case-hero img")].some(i => i.complete && i.naturalWidth > 0),
        overflow: document.documentElement.scrollWidth - innerWidth,
      }));
      assert(project.headline?.length > 6 && project.cover && project.overflow <= 1,
        url + " project detail and gallery render: " + JSON.stringify(project));
      console.log("PASS project", locale, slug);
    }
    await ctx.close();
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, results, caseStudies: 14 }, null, 2));
    console.log("FINAL POLISH QA PASSED 6 HOMEPAGE VARIANTS + 14 PROJECT PAGES");
  } finally { await browser.close(); }
})().catch(e => {console.error("FAILED:", e);process.exitCode=1});
