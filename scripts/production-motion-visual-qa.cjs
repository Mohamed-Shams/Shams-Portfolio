/* Actual production visual QA. Verify pixels and elapsed-time motion, not
   merely CSS animation declarations or synthetic SVG timeline jumps.
   MOTION_URL=https://... node scripts/production-motion-visual-qa.cjs */
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
    if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) +
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 36) changed++;
  }
  return changed;
}

async function signal(page) {
  return page.evaluate(() => {
    const svg = document.querySelector(".flow-diagram");
    const mobile = getComputedStyle(svg).display === "none";
    const selector = mobile ? ".flow-link" : ".flow-svg-energy";
    const segments = Array.from(document.querySelectorAll(selector)).map(el => {
      const style = getComputedStyle(el, mobile ? "::after" : null);
      return {
        opacity: Number(style.opacity),
        animation: style.animationName,
        position: mobile ? parseFloat(style.top) : parseFloat(style.strokeDashoffset),
      };
    });
    return { mobile, segments, active: segments.findIndex(s => s.opacity > .45) };
  });
}

async function tickerState(page) {
  return page.evaluate(() => {
    const ticker = document.querySelector(".platform-ticker");
    const track = ticker.querySelector(".platform-ticker-track");
    const sets = Array.from(track.querySelectorAll(".platform-ticker-set"));
    return {
      left: track.getBoundingClientRect().left,
      play: getComputedStyle(track).animationPlayState,
      animation: getComputedStyle(track).animationName,
      sets: sets.map(set => set.getBoundingClientRect().width),
      items: ticker.querySelectorAll(".platform-ticker-set:first-child .platform-ticker-item").length,
      buttons: ticker.querySelectorAll("button").length,
    };
  });
}

async function visibleCard(page) {
  return page.locator(".platform-ticker-item").evaluateAll(items => {
    const area = document.querySelector(".platform-ticker-window").getBoundingClientRect();
    for (const item of items) {
      const r = item.getBoundingClientRect();
      if (r.left >= area.left + 25 && r.right <= area.right - 25) {
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
    return null;
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const records = [];
  try {
    for (const locale of ["en", "ar"]) for (const width of [1440, 390]) {
      for (const preference of ["no-preference", "reduce"]) {
        const tag = `${locale}-${width}-${preference}`;
        const context = await browser.newContext({
          viewport: { width, height: width === 1440 ? 900 : 844 },
          reducedMotion: preference,
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
        page.on("response", res => { if (res.status() >= 400) errors.push(res.status() + " " + res.url()); });
        try {
          await page.goto(`${BASE}/${locale}#skills`, { waitUntil: "domcontentloaded", timeout: 60000 });
          const flow = page.locator(".flow-showcase");
          const ticker = page.locator(".platform-ticker");
          assert.equal(await flow.locator("button").count(), 0, tag + " flow has no pause button");
          assert.equal(await ticker.locator("button").count(), 0, tag + " ticker has no pause button");
          assert.equal(await flow.locator(".flow-throughline, .flow-svg-packet, .flow-svg-halo").count(), 0,
            tag + " no overlay crossing technology cards");
          assert.equal(await flow.locator(".flow-svg-energy").count(), 4);
          assert.equal(await flow.locator(".flow-link").count(), 4);
          const confined = await flow.locator("svg").evaluate(svg => {
            const nodes = Array.from(svg.querySelectorAll(".flow-svg-node rect"));
            const energies = Array.from(svg.querySelectorAll(".flow-svg-energy"));
            return energies.every((line, index) => {
              const start = Number(line.getAttribute("x1"));
              const end = Number(line.getAttribute("x2"));
              const leftNodeEdge = Number(nodes[index].getAttribute("x")) +
                Number(nodes[index].getAttribute("width"));
              const rightNodeEdge = Number(nodes[index + 1].getAttribute("x"));
              return start > leftNodeEdge && end < rightNodeEdge;
            });
          });
          assert(confined, tag + " four moving signals stay outside card rectangles");
          assert(await flow.locator(".flow-svg-node").first().evaluate(el =>
            getComputedStyle(el).animationName === "none"),
            tag + " nodes are not animated");

          await flow.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
          const initial = await signal(page);
          assert.equal(initial.mobile, width === 390);
          assert(initial.segments.every(s => s.animation ===
            (width === 1440 ? "flow-segment-travel" : "flow-vertical-segment")),
            tag + " connector animations installed");
          const frame1 = await flow.screenshot();
          await page.waitForTimeout(1800);
          const frame2 = await flow.screenshot();
          const changed = await changedPixels(frame1, frame2);
          assert(changed > 35, tag + " visible pixels change along connectors: " + changed);

          // The four connector signals must illuminate in order, looping.
          // The full-cycle check is applied to both orientations under reduced
          // motion and normal motion, rather than forcing the SVG clock.
          const seen = [];
          if (locale === "en") {
            for (let n = 0; n < 42; n++) {
              const sample = await signal(page);
              if (sample.active >= 0 && seen.at(-1) !== sample.active) seen.push(sample.active);
              await page.waitForTimeout(215);
            }
            for (let i = 0; i < 4; i++) assert(seen.includes(i), tag + " stage " + i + " energized");
            for (let i = 1; i < seen.length; i++) assert.equal(seen[i], (seen[i - 1] + 1) % 4,
              tag + " signal travels sequentially: " + seen.join(","));
          }
          if (locale === "en") {
            fs.writeFileSync(path.join(OUT, tag + "-flow-first.png"), frame1);
            fs.writeFileSync(path.join(OUT, tag + "-flow-later.png"), frame2);
          }

          await ticker.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
          await page.mouse.move(2, 2);
          await page.waitForTimeout(100);
          const first = await tickerState(page);
          assert.equal(first.items, 13, tag + " all 13 platforms");
          assert.equal(first.animation, "platform-marquee");
          assert.equal(first.play, "running", tag + " autoplay without interaction");
          assert(Math.abs(first.sets[0] - first.sets[1]) < 1, tag + " seamless sets");
          const tickerFirst = await ticker.screenshot();
          await page.waitForTimeout(950);
          const second = await tickerState(page);
          const tickerLater = await ticker.screenshot();
          const shift = Math.abs(second.left - first.left);
          assert(shift > 10, tag + " actual autoplay movement " + shift);
          assert(await changedPixels(tickerFirst, tickerLater) > 300, tag + " actual ticker pixel change");
          if (locale === "en") {
            fs.writeFileSync(path.join(OUT, tag + "-ticker-first.png"), tickerFirst);
            fs.writeFileSync(path.join(OUT, tag + "-ticker-later.png"), tickerLater);
          }

          const card = await visibleCard(page);
          assert(card, tag + " at least one fully visible platform");
          await page.mouse.move(card.x, card.y);
          await page.waitForTimeout(130);
          const hovered = await tickerState(page);
          assert.equal(hovered.play, "paused", tag + " hovering a system pauses slider");
          await page.waitForTimeout(550);
          const hoveredLater = await tickerState(page);
          assert(Math.abs(hoveredLater.left - hovered.left) < 1,
            tag + " hovered card stops movement");
          await page.mouse.move(2, 2);
          await page.waitForTimeout(140);
          const afterLeave = await tickerState(page);
          assert.equal(afterLeave.play, "running", tag + " mouse leave resumes autoplay");
          await page.waitForTimeout(650);
          const afterResume = await tickerState(page);
          assert(Math.abs(afterResume.left - afterLeave.left) > 5,
            tag + " slider physically resumes moving after mouse leave");

          await page.reload({ waitUntil: "domcontentloaded" });
          assert.equal((await tickerState(page)).play, "running", tag + " autoplay after reload");
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1),
            true, tag + " no horizontal page overflow");
          assert.deepEqual(errors, [], tag + " no browser or network errors");
          records.push({ tag, passed: true, flowPixelsChanged: changed,
            tickerMovementPx: Math.round(shift), sequence: seen });
          console.log("PASS", tag, "connector pixels", changed, "ticker pixels moved", shift.toFixed(1),
            "sequence", seen.join("->") || "sampled");
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, records }, null, 2));
  console.log("PRODUCTION CONNECTOR/HOVER QA:", records.length + "/8 PASS");
})().catch(e => { console.error("FAIL", e); process.exitCode = 1; });
