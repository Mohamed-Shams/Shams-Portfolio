const { chromium } = require("@playwright/test");
const URL = process.env.PROBE_URL || "http://localhost:3001/en";
const OUT = process.env.FRAME_DIR || "D:\\New New-portfolio\\.zwork\\frames";
const fs = require("fs");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page) {
  try {
    return await page.evaluate(() => ({
      play: document.documentElement.hasAttribute("data-intro-play"),
      introDisplay: (() => { const el = document.querySelector(".portfolio-intro"); return el ? getComputedStyle(el).display : "none"; })(),
      heroReady: !!document.querySelector("section.hero.motion-ready"),
      pct: (() => { const el = document.querySelector(".intro-pct"); return el ? el.textContent : null; })(),
    }));
  } catch { return null; }
}

(async () => {
  const browser = await chromium.launch();

  // RUN A — fresh first visit, timeline metrics
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(URL, { waitUntil: "commit" });
    const t0 = Date.now();
    let playAt = null, visibleAt = null, heroAt = null, goneAt = null;
    for (let i = 0; i < 55; i++) {
      await sleep(100);
      const s = await snap(page);
      if (!s) continue;
      const t = Date.now() - t0;
      if (playAt === null && s.play) playAt = t;
      if (visibleAt === null && s.introDisplay !== "none") visibleAt = t;
      if (heroAt === null && s.heroReady) heroAt = t;
      if (playAt !== null && goneAt === null && s.introDisplay === "none") goneAt = t;
      if (goneAt !== null) break;
    }
    console.log("RUN A:", JSON.stringify({ playAt, visibleAt, heroAt, goneAt, errors: errors.slice(0, 3) }));
    await ctx.close();
  }

  // RUN B — deterministic frame captures
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "commit" });
    const t0 = Date.now();
    for (const t of [250, 500, 800, 1100, 1400, 1700, 2000, 2300, 2700, 3400]) {
      const wait = t - (Date.now() - t0);
      if (wait > 0) await sleep(wait);
      await page.screenshot({ path: OUT + "\\en-" + String(t).padStart(4, "0") + ".png" }).catch(() => {});
    }
    const state = await snap(page);
    console.log("RUN B final:", JSON.stringify(state));
    await ctx.close();
  }

  // RUN C — motionPreview replays after seen; plain visit skips
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem("shams-portfolio-intro-v5", "seen"); } catch {} });
    const page = await ctx.newPage();
    await page.goto(URL + "?motionPreview=1", { waitUntil: "commit" });
    await sleep(700);
    console.log("RUN C preview:", JSON.stringify(await snap(page)));
    await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx2.addInitScript(() => { try { sessionStorage.setItem("shams-portfolio-intro-v5", "seen"); } catch {} });
    const page2 = await ctx2.newPage();
    await page2.goto(URL, { waitUntil: "commit" });
    await sleep(700);
    console.log("RUN C seen-skip:", JSON.stringify(await snap(page2)));
    await ctx2.close();
  }

  // RUN D — reduced motion: overlay never shows, content fully visible
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "commit" });
    await sleep(800);
    try {
      const s = await page.evaluate(() => ({
        play: document.documentElement.hasAttribute("data-intro-play"),
        display: (() => { const el = document.querySelector(".portfolio-intro"); return el ? getComputedStyle(el).display : "none"; })(),
        h1opacity: getComputedStyle(document.querySelector("h1")).opacity,
      }));
      console.log("RUN D reduced:", JSON.stringify(s));
    } catch (e) { console.log("RUN D err", String(e).slice(0, 120)); }
    await ctx.close();
  }

  await browser.close();
  console.log("PROBE DONE");
})();
