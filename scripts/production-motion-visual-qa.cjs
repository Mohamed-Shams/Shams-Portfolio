/* Genuine on-screen motion QA for the deployed Shams portfolio.
 * No CSS name-only checks or scripted SVG clock jumps: sample live geometry
 * and compare actual screen pixels several seconds apart in fresh browsers.
 * MOTION_URL=https://... node scripts/production-motion-visual-qa.cjs
 */
const { chromium } = require("@playwright/test");
const sharp = require("sharp");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const BASE = (process.env.MOTION_URL || "https://shams-portfolio.mshams0174.workers.dev").replace(/\/$/, "");
const OUT = path.resolve(process.env.MOTION_EVIDENCE_DIR || "screenshots/production-motion-visual");
fs.mkdirSync(OUT, { recursive: true });

async function changedPixels(before, after) {
  const a = await sharp(before).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(after).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(a.info.width, b.info.width);
  assert.equal(a.info.height, b.info.height);
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 3) {
    if (Math.abs(a.data[i] - b.data[i]) +
        Math.abs(a.data[i + 1] - b.data[i + 1]) +
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 36) changed++;
  }
  return { changed, fraction: changed / (a.info.width * a.info.height) };
}

async function probe(page) {
  return page.evaluate(() => {
    const ticker = document.querySelector(".platform-ticker");
    const track = ticker.querySelector(".platform-ticker-track");
    const svg = document.querySelector(".flow-diagram");
    const packet = svg.querySelector(".flow-svg-packet");
    const chipList = document.querySelector(".flow-steps");
    const mobile = getComputedStyle(svg).display === "none";
    const motion = mobile
      ? { kind: "mobile", position: parseFloat(getComputedStyle(chipList, "::after").top),
          visible: getComputedStyle(chipList, "::after").display !== "none" }
      : { kind: "desktop", position: packet.getBoundingClientRect().left,
          visible: getComputedStyle(packet).display !== "none" };
    const a = ticker.querySelector(".platform-ticker-set:first-child");
    const b = ticker.querySelector(".platform-ticker-set:last-child");
    return {
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      override: document.documentElement.dataset.portfolioMotion,
      motion,
      trackX: track.getBoundingClientRect().left,
      animation: getComputedStyle(track).animationName,
      running: getComputedStyle(track).animationPlayState,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      tickerFirstWidth: a.getBoundingClientRect().width,
      tickerSecondWidth: b.getBoundingClientRect().width,
      items: a.querySelectorAll("a").length,
      scrollMode: getComputedStyle(ticker.querySelector(".platform-ticker-window")).overflowX,
    };
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const locale of ["en", "ar"]) {
      for (const width of [1440, 390]) {
        for (const preference of ["no-preference", "reduce"]) {
          const reduced = preference === "reduce";
          const tag = `${locale}-${width}-${reduced ? "reduce" : "normal"}`;
          const context = await browser.newContext({
            viewport: { width, height: width === 1440 ? 900 : 844 },
            reducedMotion: preference,
          });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", error => errors.push(error.message));
          page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
          page.on("response", response => {
            if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
          });
          try {
            await page.goto(`${BASE}/${locale}#skills`, { waitUntil: "domcontentloaded", timeout: 60000 });
            const initial = await probe(page);
            assert.equal(initial.reduced, reduced);
            assert.equal(initial.items, 13, tag + " 13 unique icons");
            assert(Math.abs(initial.tickerFirstWidth - initial.tickerSecondWidth) < 1,
              tag + " equal-width duplicated ticker sets for seamless loop");
            assert(initial.horizontalOverflow <= 1, tag + " no horizontal page overflow");
            assert.equal(initial.animation, "platform-marquee",
              tag + " must autoplay without clicking, regardless of device setting");
            assert.equal(initial.scrollMode, "hidden", tag + " not a manual-scroll-only rail");
            assert(initial.motion.visible, tag + " signal is visible without opt-in");

            const active = await probe(page);
            assert(Math.abs(active.tickerFirstWidth - active.tickerSecondWidth) < 1,
              tag + " equal-width duplicated ticker sets while animating");
            const flow = page.locator(".flow-showcase");
            await flow.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
            await page.waitForTimeout(220);
            const f1 = await probe(page);
            const shot1 = await flow.screenshot();
            await page.waitForTimeout(1900);
            const f2 = await probe(page);
            const shot2 = await flow.screenshot();
            const delta = Math.abs(f2.motion.position - f1.motion.position);
            assert(f1.motion.visible && f2.motion.visible, tag + " signal visibly present");
            assert(delta > (width === 1440 ? 35 : 14),
              tag + " real time-based moving signal, delta=" + delta);
            const flowPixels = await changedPixels(shot1, shot2);
            assert(flowPixels.changed > 80, tag + " flow visible pixels changed");
            const flowToggle = flow.locator(".flow-showcase-toggle");
            await flowToggle.click();
            const pausedFlow1 = await probe(page);
            await page.waitForTimeout(400);
            const pausedFlow2 = await probe(page);
            assert(Math.abs(pausedFlow2.motion.position - pausedFlow1.motion.position) < 1,
              tag + " flow Pause freezes moving signal");
            await flowToggle.click();
            const resumedFlow1 = await probe(page);
            await page.waitForTimeout(650);
            const resumedFlow2 = await probe(page);
            assert(Math.abs(resumedFlow2.motion.position - resumedFlow1.motion.position) > 4,
              tag + " flow Play restarts signal movement");
            // Allow a complete 9-second cycle to run in real time (no
            // SVG.setCurrentTime). Verify the packet visits the far-right
            // Dashboards end and wraps to the PLC end for the next cycle.
            if (locale === "en" && width === 1440) {
              const samples = [f2.motion.position];
              for (let n = 0; n < 16; n++) {
                await page.waitForTimeout(675);
                samples.push((await probe(page)).motion.position);
              }
              const travel = Math.max(...samples) - Math.min(...samples);
              const hasWrap = samples.some((x, i) =>
                i > 0 && samples[i - 1] - x > 380);
              assert(travel > 600, tag + " signal visits both endpoint stages; span=" + travel);
              assert(hasWrap, tag + " moving signal resets after Dashboards to begin next cycle");
            }
            if (locale === "en") {
              fs.writeFileSync(path.join(OUT, tag + "-flow-first.png"), shot1);
              fs.writeFileSync(path.join(OUT, tag + "-flow-later.png"), shot2);
            }

            const ticker = page.locator(".platform-ticker");
            await ticker.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
            const box = await ticker.boundingBox();
            if (width === 1440) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const t1 = await probe(page);
            const tickShot1 = await ticker.screenshot();
            await page.waitForTimeout(1600);
            const t2 = await probe(page);
            const tickShot2 = await ticker.screenshot();
            const tickerPixels = await changedPixels(tickShot1, tickShot2);
            assert(Math.abs(t2.trackX - t1.trackX) > 14,
              tag + " continuous automatic motion, actual delta=" + (t2.trackX - t1.trackX));
            assert(tickerPixels.changed > 500, tag + " visible marquee pixels changed");
            assert.equal(t2.running, "running", tag + " hover must not stop autoplay");
            if (locale === "en") {
              fs.writeFileSync(path.join(OUT, tag + "-ticker-first.png"), tickShot1);
              fs.writeFileSync(path.join(OUT, tag + "-ticker-later.png"), tickShot2);
            }
            const toggle = ticker.locator("button.platform-ticker-toggle");
            await toggle.click();
            const paused = await probe(page);
            await page.waitForTimeout(350);
            const pausedLater = await probe(page);
            assert.equal(paused.running, "paused", tag + " Pause control");
            assert(Math.abs(paused.trackX - pausedLater.trackX) < 1, tag + " Pause really freezes position");
            await toggle.click();
            const resumed = await probe(page);
            await page.waitForTimeout(550);
            const resumedLater = await probe(page);
            assert(Math.abs(resumed.trackX - resumedLater.trackX) > 5,
              tag + " Play resumes visible movement");

            await page.reload({ waitUntil: "domcontentloaded" });
            assert.equal((await probe(page)).animation, "platform-marquee",
              tag + " autoplay restarts without interaction on refresh");
            if (locale === "en" && width === 1440) {
              await page.goto(`${BASE}/en/projects/dohler-cloudy-line`, { waitUntil: "domcontentloaded" });
              await page.goBack({ waitUntil: "domcontentloaded" });
              assert.equal((await probe(page)).animation, "platform-marquee",
                tag + " autoplay survives navigation");
            }
            assert.deepEqual(errors, [], tag + " no browser, network or hydration errors");
            results.push({ tag, passed: true,
              flowPixels, flowMovement: Math.round(delta),
              tickerPixels, tickerMovement: Math.round(t2.trackX - t1.trackX),
              seamlessSets: [initial.tickerFirstWidth, initial.tickerSecondWidth] });
            console.log("PASS", tag, "flow shift", delta.toFixed(1),
              "ticker shift", (t2.trackX - t1.trackX).toFixed(1),
              "pixel diffs", flowPixels.changed, tickerPixels.changed);
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, results }, null, 2));
  console.log("PRODUCTION VISUAL MOTION QA:", results.length + "/8 PASSED");
})().catch(error => { console.error("FAIL:", error); process.exitCode = 1; });
