/* Regression for browsers whose OS requests reduced motion. The site follows
 * accessibility settings by default, but visitors can explicitly opt in to
 * the flow and the ecosystem ticker using either section's control.
 * Run: MOTION_URL=http://127.0.0.1:4344 node scripts/portfolio-motion-override-qa.cjs
 */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

const base = (process.env.MOTION_URL || "http://127.0.0.1:4344").replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    for (const locale of ["en", "ar"]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        try {
          await page.goto(`${base}/${locale}#skills`, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.locator(".flow-motion-control button").waitFor();
          const ticker = page.locator(".platform-ticker-track");
          const flow = page.locator(".flow-svg-packet");
          const state = async () => page.evaluate(() => ({
            animation: getComputedStyle(document.querySelector(".platform-ticker-track")).animationName,
            overflow: getComputedStyle(document.querySelector(".platform-ticker-window")).overflowX,
            packet: getComputedStyle(document.querySelector(".flow-svg-packet")).display,
            glow: getComputedStyle(document.querySelector(".flow-svg-halo")).display,
            flow: getComputedStyle(document.querySelector(".flow-svg-node")).animationName,
            setting: document.documentElement.dataset.portfolioMotion,
          }));
          let css = await state();
          assert.equal(css.animation, "none");
          assert.equal(css.overflow, "auto");
          assert.equal(css.packet, "none");
          assert.equal(css.setting, "auto");

          const enable = page.getByRole("button", { name:
            locale === "en" ? "Enable automatic platform scrolling" : "تفعيل التمرير التلقائي" });
          await enable.click();
          css = await state();
          assert.equal(css.animation, "platform-marquee");
          assert.equal(css.overflow, "hidden");
          assert.notEqual(css.packet, "none");
          assert.notEqual(css.glow, "none");
          assert.equal(css.flow, "flow-stage-arrival");
          assert.equal(css.setting, "on");
          const a = await ticker.evaluate(el => getComputedStyle(el).transform);
          await page.waitForTimeout(650);
          const b = await ticker.evaluate(el => getComputedStyle(el).transform);
          assert.notEqual(a, b, "ticker moves under reduced-motion opt-in");
          if (width === 1440) {
            const svg = page.locator(".flow-diagram");
            const positions = await svg.evaluate(el => {
              el.setCurrentTime(0);
              const circle = el.querySelector(".flow-svg-packet");
              const x1 = circle.getCTM().e;
              el.setCurrentTime(7);
              return [x1, circle.getCTM().e];
            });
            assert(positions[1] > positions[0] + 500, "packet traverses the full desktop route");
          } else {
            assert.equal(await page.locator(".flow-steps").isVisible(), true);
            assert.equal(await page.locator(".flow-steps").evaluate(el =>
              getComputedStyle(el, "::after").animationName), "flow-mobile-throughline");
          }

          await page.reload({ waitUntil: "domcontentloaded" });
          await page.locator(".flow-motion-control button").waitFor();
          assert.equal((await state()).setting, "on", "opt-in persists after reload");
          assert.equal((await state()).animation, "platform-marquee");

          await page.locator(".flow-motion-control button").click();
          css = await state();
          assert.equal(css.setting, "auto");
          assert.equal(css.animation, "none");
          assert.equal(css.packet, "none");
          console.log(`PASS ${locale}-${width}: OS preference, manual opt-in, autoplay, flow, persistence, restore`);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
