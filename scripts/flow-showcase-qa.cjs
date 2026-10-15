/* Production-like validation for the connector-only industrial path.
 * No moving light or highlighted animation should cross the five cards.
 * Usage: MOTION_URL=http://127.0.0.1:4322 node scripts/flow-showcase-qa.cjs
 */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const BASE = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const OUT = path.resolve(process.env.FLOW_QA_OUT || "screenshots/flow-showcase-qa");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const locale of ["en", "ar"]) for (const width of [1440, 768, 390]) {
      const tag = locale + "-" + (width === 1440 ? "desktop" : width === 768 ? "tablet" : "mobile");
      const ctx = await browser.newContext({
        viewport: { width, height: width === 768 ? 1024 : width === 390 ? 844 : 900 },
        recordVideo: { dir: OUT, size: { width, height: width === 768 ? 1024 : width === 390 ? 844 : 900 } },
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if(m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text()); });
      page.on("response", r => { if(r.status() >= 400) errors.push("HTTP "+r.status()+" "+r.url()); });
      try {
        const res = await page.goto(BASE + "/" + locale, { waitUntil: "domcontentloaded", timeout: 60000 });
        assert.equal(res.status(), 200);
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play"), null, { timeout: 13000 });
        const flow = page.locator(".flow-showcase");
        assert.equal(await flow.count(), 1);
        assert.equal(await flow.locator("summary").count(), 0, tag + " not collapsed");
        await flow.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForTimeout(400);
        if (process.env.FLOW_INJECT_LOCAL_CSS === "1") {
          await page.addStyleTag({ path: "src/app/flow-showcase.css" });
        }
        assert(await flow.isVisible(), tag + " flow always visible");
        const desktop = width > 1150;
        const svg = flow.locator("svg.flow-diagram");
        const steps = flow.locator(".flow-steps");
        assert.equal(await svg.isVisible(), desktop, tag + " correct SVG/text responsive mode");
        assert.equal(await steps.isVisible(), !desktop, tag + " readable responsive steps");
        assert.equal(await flow.locator(".flow-step").count(), 5);
        assert.equal(await flow.locator("button, .flow-throughline, .flow-svg-packet, .flow-svg-halo").count(),
          0, tag + " no pause button or moving elements crossing cards");
        if (desktop) {
          assert.equal(await flow.locator(".flow-svg-energy").count(), 4);
          const energy = flow.locator(".flow-svg-energy");
          const before = await energy.evaluateAll(nodes =>
            nodes.map(node => getComputedStyle(node).strokeDashoffset));
          await page.waitForTimeout(520);
          const after = await energy.evaluateAll(nodes =>
            nodes.map(node => getComputedStyle(node).strokeDashoffset));
          assert(before.some((value, i) => value !== after[i]),
            tag + " one of four energized connector pulses travels");
          assert.equal(await energy.first().evaluate(e => getComputedStyle(e).animationName),
            "flow-segment-travel", tag + " connector-only animation");
        } else {
          const css = await flow.locator(".flow-link").first()
            .evaluate(e => getComputedStyle(e, "::after").animationName);
          assert.equal(css, "flow-vertical-segment", tag + " vertical connection signal");
          const state = await flow.locator(".flow-step.accent .flow-chip")
            .evaluate(e => getComputedStyle(e).animationName);
          assert.equal(state, "none", tag + " cards do not animate");
          if (width === 390 && process.env.FLOW_CHECK_MOBILE_CONNECTORS === "1") {
            const connector = await flow.locator(".flow-link").first().evaluate(el => {
              const rect = el.getBoundingClientRect();
              return {
                width: rect.width,
                height: rect.height,
                motion: getComputedStyle(el, "::after").animationName,
              };
            });
            assert(connector.width >= 2 && connector.height >= 17,
              tag + " mobile flow connector visible");
            assert.equal(connector.motion, "flow-vertical-segment",
              tag + " packet is confined to a connection gap");
          }
        }
        await page.screenshot({ path: path.join(OUT, tag + ".png") });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(overflow <= 1, tag + " no overflow: " + overflow);
        assert.equal(await page.locator(".platform-ticker-set:first-child .platform-ticker-item").count(), 13);
        assert.equal(await page.locator(".certificate-document").count(), 10);
        assert.deepEqual(errors, [], tag + " console/network/hydration errors");
        console.log("PASS", tag, "always-visible flow, live motion, responsive, assets, no errors");
        results.push({ tag, passed: true, overflow, errors });
      } finally {
        const video = page.video();
        await page.close();
        if (video) {
          await video.saveAs(path.join(OUT, tag + ".webm"));
          await video.delete();
        }
        await ctx.close();
      }
    }
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, results }, null, 2));
    console.log("FLOW SHOWCASE: 6/6 PASS");
  } finally { await browser.close(); }
})().catch(e => { console.error("FAIL:", e); process.exitCode = 1; });
