/* Regression test for continuous platform autoplay and one full data-flow.
   Run with MOTION_URL=https://... node scripts/autoplay-flow-qa.cjs.
   Keep a single Edge browser and write screenshots/results to screenshots/.
 */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = (process.env.MOTION_URL || "http://127.0.0.1:4344").replace(/\/$/, "");
const out = path.resolve(process.env.AUTOPLAY_QA_OUT || "screenshots/autoplay-flow-qa");
fs.mkdirSync(out, { recursive: true });
const gap = ms => new Promise(resolve => setTimeout(resolve, ms));

async function status(ticker) {
  return ticker.locator(".platform-ticker-track").evaluate(node => ({
    play: getComputedStyle(node).animationPlayState,
    name: getComputedStyle(node).animationName,
    duration: getComputedStyle(node).animationDuration,
    matrix: getComputedStyle(node).transform,
  }));
}
async function run() {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const lang of ["en", "ar"]) for (const width of [1440, 390]) {
      const tag = lang + (width === 1440 ? "-desktop" : "-mobile");
      const context = await browser.newContext({
        viewport: { width, height: width === 1440 ? 900 : 844 },
        isMobile: width === 390,
        hasTouch: width === 390,
        reducedMotion: "no-preference",
        recordVideo: { dir: out, size: { width, height: width === 1440 ? 900 : 844 } },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => {
        if (m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text());
      });
      page.on("response", r => {
        if (r.status() >= 400) errors.push("HTTP " + r.status() + " " + r.url());
      });
      try {
        await page.goto(base + "/" + lang, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => !document.querySelector(".portfolio-intro"),
          null, { timeout: 16000 });
        const flow = page.locator(".flow-showcase");
        await flow.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForTimeout(380);
        assert.equal(await flow.locator("summary").count(), 0, tag + " always visible");
        assert.equal(await flow.locator(".flow-step").count(), 5, tag + " five stages");
        if (width === 1440) {
          const svg = flow.locator("svg.flow-diagram");
          assert(await svg.isVisible(), tag + " desktop vector");
          assert.equal(await svg.locator(".flow-svg-packet").count(), 1,
            tag + " exactly ONE sequential packet");
          const positions = await svg.evaluate(node => {
            const packet = node.querySelector(".flow-svg-packet");
            return [0, 2.2, 4.4, 6.6, 8.85].map(t => {
              node.setCurrentTime(t);
              return packet.getCTM()?.e;
            });
          });
          assert(positions.every((v, i) => Number.isFinite(v) &&
            (i === 0 || v > positions[i - 1] + 100)),
            tag + " packet moves from PLC to Dashboards in order: " + positions);
        } else {
          assert(await flow.locator(".flow-steps").isVisible(), tag + " readable mobile steps");
          const before = await flow.locator(".flow-steps").evaluate(e =>
            parseFloat(getComputedStyle(e, "::after").top));
          await page.waitForTimeout(850);
          const after = await flow.locator(".flow-steps").evaluate(e =>
            parseFloat(getComputedStyle(e, "::after").top));
          assert(after > before + 5, tag + " one mobile packet goes from top to bottom");
          const vertical = await flow.locator(".flow-link").first().evaluate(e => ({
            height: e.getBoundingClientRect().height,
            width: e.getBoundingClientRect().width,
          }));
          assert(vertical.height >= 17 && vertical.width >= 2,
            tag + " mobile vertical links are visible");
        }
        await page.screenshot({ path: path.join(out, tag + "-flow.png") });
        const ticker = page.locator("[data-platform-ticker]");
        await ticker.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForTimeout(180);
        const box = await ticker.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        const moving = await status(ticker);
        assert.equal(moving.play, "running", tag + " AUTOPLAY even while mouse hovers");
        assert.equal(moving.name, "platform-marquee", tag + " marquee defined");
        const next = await (async () => {
          await page.waitForTimeout(840);
          return status(ticker);
        })();
        assert.notEqual(moving.matrix, next.matrix, tag + " actually scrolls by itself");
        assert.equal(await ticker.locator(".platform-ticker-set:first-child a").count(), 13);
        await ticker.getByRole("button", { name: lang === "en" ?
          "Pause platform scrolling" : "إيقاف حركة المنصات مؤقتًا" }).click();
        const paused = await status(ticker);
        assert.equal(paused.play, "paused", tag + " pause button pauses");
        await page.waitForTimeout(350);
        assert.equal((await status(ticker)).matrix, paused.matrix, tag + " stays paused");
        await ticker.getByRole("button", { name: lang === "en" ?
          "Resume platform scrolling" : "تشغيل حركة المنصات" }).click();
        await page.waitForTimeout(650);
        assert.equal((await status(ticker)).play, "running", tag + " play button resumes");
        assert.notEqual((await status(ticker)).matrix, paused.matrix, tag + " resumes moving");
        await page.screenshot({ path: path.join(out, tag + "-ticker.png") });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(overflow <= 1, tag + " no page overflow " + overflow);
        assert.equal(await page.locator(".certificate-document").count(), 10,
          tag + " certificate files preserved");
        assert.deepEqual(errors, [], tag + " no hydration/network/runtime errors");
        console.log("PASS", tag, "end-to-end data flow, autoplay hover, pause/play, 13 icons, 10 PDFs");
        results.push({ tag, pass: true });
      } finally {
        const video = page.video();
        await page.close();
        if (video) {
          await video.saveAs(path.join(out, tag + ".webm"));
          await video.delete();
        }
        await context.close();
      }
    }
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ base, results }, null, 2));
    console.log("AUTOPLAY/FLOW PRODUCTION TESTS: 4/4 PASS");
  } finally { await browser.close(); }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
