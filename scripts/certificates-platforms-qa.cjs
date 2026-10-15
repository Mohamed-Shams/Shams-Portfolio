/* Focused test of the old portfolio's migrated platform ticker and PDF assets. */
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const base = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const out = path.resolve("screenshots/certificates-platforms-qa");
fs.mkdirSync(out, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const lang of ["en", "ar"]) for (const viewport of [
      { width: 1440, height: 900 }, { width: 390, height: 844 },
    ]) {
      const tag = lang + (viewport.width === 390 ? "-mobile" : "-desktop");
      const context = await browser.newContext({
        viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text()); });
      page.on("response", r => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
      try {
        await page.goto(base + "/" + lang, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play") &&
          !document.querySelector(".portfolio-intro"), null, { timeout: 12000 });
        await page.locator("#certifications").evaluate(e => e.scrollIntoView({ behavior: "instant", block: "start" }));
        await page.waitForTimeout(750);
        const ticker = page.locator("[data-platform-ticker]");
        assert.equal(await ticker.count(), 1, tag + " ticker exists");
        const allBadges = ticker.locator(".platform-ticker-item");
        assert.equal(await allBadges.count(), 26, tag + " 13 distinct badges + seamless duplicates");
        assert.equal(await ticker.locator(".platform-ticker-item:not([tabindex='-1'])").count(), 13,
          tag + " exactly 13 keyboard accessible badges");
        const initialTransform = await ticker.locator(".platform-ticker-track").evaluate(e => getComputedStyle(e).transform);
        await page.waitForTimeout(480);
        const laterTransform = await ticker.locator(".platform-ticker-track").evaluate(e => getComputedStyle(e).transform);
        assert.notEqual(initialTransform, laterTransform, tag + " ticker visibly advances");
        await page.screenshot({ path: path.join(out, tag + "-ticker.png") });
        await ticker.evaluate(e => e.scrollIntoView({ behavior: "instant", block: "center" }));
        const box = await ticker.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(170);
        const playState = await ticker.locator(".platform-ticker-track")
          .evaluate(e => getComputedStyle(e).animationPlayState);
        assert.equal(playState, "running", tag + " ticker keeps scrolling on hover");
        await ticker.getByRole("button", { name: lang === "en"
          ? "Pause platform scrolling" : "إيقاف حركة المنصات مؤقتًا" }).click();
        assert.equal(await ticker.locator(".platform-ticker-track")
          .evaluate(e => getComputedStyle(e).animationPlayState), "paused",
          tag + " explicit pause control works");
        await ticker.getByRole("button", { name: lang === "en"
          ? "Resume platform scrolling" : "تشغيل حركة المنصات" }).click();
        assert.equal(await ticker.locator(".platform-ticker-track")
          .evaluate(e => getComputedStyle(e).animationPlayState), "running",
          tag + " scrolling resumes after Play");
        const logos = await ticker.locator(".platform-ticker-set:first-child img").evaluateAll(
          els => els.map(e => {
            const box = e.getBoundingClientRect();
            return {
              visible: box.right > 0 && box.left < innerWidth &&
                box.bottom > 0 && box.top < innerHeight,
              loaded: e.complete && e.naturalWidth > 0,
            };
          }),
        );
        assert(logos.filter(x => x.visible).length >= 2, tag + " several logos in viewport");
        assert(logos.filter(x => x.visible).every(x => x.loaded),
          tag + " visible ticker logos load " + JSON.stringify(logos));

        const docCards = page.locator(".certificate-document");
        assert.equal(await docCards.count(), 10, tag + " all 10 original PDF records");
        const rail = page.locator(".certificate-library-rail");
        const railGeom = await rail.evaluate(e => ({ width: e.clientWidth, scroll: e.scrollWidth }));
        assert(railGeom.scroll > railGeom.width + 500, tag + " horizontal shelf scrolls");
        await rail.evaluate(e => e.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForTimeout(230);
        await page.screenshot({ path: path.join(out, tag + "-pdf-shelf.png") });
        const pdfUrls = await docCards.locator("a[target='_blank']").evaluateAll(els =>
          els.map(e => new URL(e.href).pathname));
        assert.equal(new Set(pdfUrls).size, 10, tag + " 10 unique PDF links");
        if (lang === "en" && viewport.width === 1440) {
          for (const pdf of pdfUrls) {
            const response = await page.request.get(base + pdf);
            assert.equal(response.status(), 200, pdf + " serves publicly");
            assert((await response.body()).subarray(0, 4).toString() === "%PDF", pdf + " valid PDF magic");
          }
          for (const asset of [
            "aveva.png", "aws-logo.png", "docker.svg", "mqtt.png", "mqtt.svg",
            "mssql.svg", "mysql.svg", "nodered.png", "nodered.svg", "opcua.png",
            "postgresql.png", "python.png", "scikit-learn.png",
            "aws-ai-practitioner.png", "dataiku-logo.png", "ignition-logo.png",
          ]) {
            const response = await page.request.get(base + "/assets/platforms/" + asset);
            assert.equal(response.status(), 200, "Original icon " + asset);
          }
        }
        const docPos = await rail.evaluate(el => el.scrollLeft);
        await rail.evaluate(el => { el.scrollLeft += (getComputedStyle(el).direction === "rtl" ? -210 : 210); });
        await page.waitForTimeout(100);
        assert.notEqual(await rail.evaluate(el => el.scrollLeft), docPos, tag + " shelf scrolls in reading direction");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(overflow <= 1, tag + " no horizontal page overflow " + overflow);
        assert.deepEqual(errors, [], tag + " no browser/hydration/network errors");
        results.push({ tag, pass: true, uniqueCertificates: pdfUrls.length, badgeCount: 13, overflow, errors });
        console.log("PASS", tag, "ticker autoscrolls and pause/play works, assets, 10 PDF documents, shelf, layout, no errors");
      } finally {
        await context.close();
      }
    }
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ base, results }, null, 2));
    console.log("CERTIFICATE / PLATFORM MIGRATION QA PASSED");
  } finally { await browser.close(); }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
