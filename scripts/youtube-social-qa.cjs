/* Regressions for the migrated 6-video YouTube section and verified social profiles.
 * Usage: MOTION_URL=http://127.0.0.1:4344 node scripts/youtube-social-qa.cjs */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = (process.env.MOTION_URL || "http://127.0.0.1:4344").replace(/\/$/, "");
const output = path.resolve(process.env.VIDEO_QA_DIR || "screenshots/youtube-social-qa");
const ids = ["GE4CouSUliU", "2ppJlu0Q-Xc", "ZLcIaFrONpU",
  "JfH1uBpWu-I", "piYA62DbKOo", "HRTRF1iY6Xw"];
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const locale of ["en", "ar"]) {
      for (const width of [1440, 768, 390]) {
        const tag = locale + "-" + width;
        const ctx = await browser.newContext({
          viewport: { width, height: width <= 768 ? 900 : 960 },
          reducedMotion: width === 768 ? "reduce" : "no-preference",
        });
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));
        page.on("console", m => { if (m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text()); });
        page.on("response", r => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
        try {
          const response = await page.goto(base + "/" + locale + "#videos",
            { waitUntil: "domcontentloaded", timeout: 60000 });
          assert.equal(response.status(), 200, tag + " home page");
          await page.locator("#videos").scrollIntoViewIfNeeded();
          const videos = page.locator("#videos .youtube-video-card");
          assert.equal(await videos.count(), 6, tag + " all 6 videos");
          assert.equal(await page.locator(".project-card").count(), 6,
            tag + " separate existing case studies unchanged");
          assert.equal(await page.locator('nav a[href="/' + locale + '#videos"]').count(), 1,
            tag + " Videos nav item");
          assert.equal(await page.locator("#videos .youtube-channel-link").getAttribute("href"),
            "https://www.youtube.com/@MAShams1");
          for (let i = 0; i < ids.length; i++) {
            const video = videos.nth(i);
            assert.equal(await video.getAttribute("data-video-id"), ids[i]);
            assert.equal(await video.getAttribute("href"), "https://www.youtube.com/watch?v=" + ids[i]);
            assert.equal(await video.getAttribute("target"), "_blank");
            assert.equal(await video.locator(".youtube-video-duration").count(), 1);
            // The lower row is intentionally lazy-loaded by Next/Image; scroll
            // the actual card into view before asserting the browser fetched it.
            await video.scrollIntoViewIfNeeded();
            await page.waitForFunction(id => {
              const image = document.querySelector('[data-video-id="' + id + '"] img');
              return image && image.complete && image.naturalWidth > 0;
            }, ids[i], { timeout: 12000 });
            const loaded = await video.locator("img").evaluate(image =>
              image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
            assert(loaded, tag + " local thumbnail loaded: " + ids[i]);
            const imgSrc = await video.locator("img").evaluate(image => new URL(image.currentSrc).pathname);
            assert.equal(imgSrc, "/assets/youtube/" + ids[i] + ".jpg",
              tag + " source JPEG served directly without Cloudflare optimizer: " + ids[i]);
            if (locale === "en" && width === 1440) {
              const img = await page.request.get(base + "/assets/youtube/" + ids[i] + ".jpg");
              assert.equal(img.status(), 200, ids[i] + " publicly served from portfolio");
              assert((await img.body()).length > 3000, ids[i] + " nonempty image");
            }
          }
          assert.equal(await page.locator('#contact a[href*="github.com"]').count(), 0,
            tag + " GitHub removed from connections");
          const linkedin = page.locator('#contact a[href="https://www.linkedin.com/in/mashams"]');
          const channel = page.locator('#contact a[href="https://www.youtube.com/@MAShams1"]');
          assert.equal(await linkedin.count(), 1, tag + " verified LinkedIn");
          assert.equal(await channel.count(), 1, tag + " verified YouTube");
          assert.equal(await page.locator('#contact a[href^="mailto:"]').count(), 1,
            tag + " existing email remains");
          assert.equal(await page.locator('#contact a[download]').count(), 1,
            tag + " existing CV remains");
          // Existing scroll-reveal transitions can temporarily extend beyond
          // the viewport; measure the settled layout, not mid-transform frames.
          await page.waitForTimeout(850);
          const layout = await page.evaluate(() => {
            const header = document.querySelector("header");
            const nav = header.querySelector("nav");
            const section = document.querySelector("#videos");
            const grid = section.querySelector(".youtube-video-grid");
            return {
              pageOverflow: document.documentElement.scrollWidth - innerWidth,
              navOverflow: nav.scrollWidth - nav.clientWidth,
              headerOverflow: header.scrollWidth - header.clientWidth,
              videosRight: section.getBoundingClientRect().right,
              videoCardsRight: Math.max(...Array.from(section.querySelectorAll(".youtube-video-card"))
                .map(el => el.getBoundingClientRect().right)),
              columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
            };
          });
          assert(layout.videosRight <= width + 1 && layout.videoCardsRight <= width + 1,
            tag + " video section and cards stay inside viewport");
          assert(layout.headerOverflow <= 1, tag + " no header overflow " + layout.headerOverflow);
          assert.equal(layout.columns, width === 1440 ? 3 : width === 768 ? 2 : 1,
            tag + " responsive video grid");
          await page.locator("#videos").evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
          await page.waitForTimeout(850);
          await page.screenshot({ path: path.join(output, tag + "-videos.png") });
          await page.locator("#contact").scrollIntoViewIfNeeded();
          await page.waitForFunction(() => document.querySelector('.contact-copy')?.classList.contains('in'),
            null, { timeout: 5000 });
          await page.waitForTimeout(1850);
          const connectionsVisible = await page.locator('.social-connection-links').evaluate(el => ({
            opacity: Number(getComputedStyle(el).opacity),
            displayed: getComputedStyle(el).display !== 'none',
            height: el.getBoundingClientRect().height,
          }));
          assert(connectionsVisible.opacity >= .95 && connectionsVisible.displayed && connectionsVisible.height > 30,
            tag + ' connection links are visible after reveal ' + JSON.stringify(connectionsVisible));
          await page.screenshot({ path: path.join(output, tag + "-contact.png") });
          assert.deepEqual(errors, [], tag + " no browser/network errors");
          results.push({ tag, passed: true, layout });
          console.log("PASS", tag, "6 videos, verified socials, no GitHub, responsive, no errors");
        } finally {
          await ctx.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ base, results }, null, 2));
  console.log("YOUTUBE + SOCIAL PRODUCTION QA", results.length + "/6 PASSED");
})().catch(e => { console.error("FAIL", e); process.exitCode = 1; });
