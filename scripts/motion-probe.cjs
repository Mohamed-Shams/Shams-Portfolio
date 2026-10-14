const { chromium } = require("@playwright/test");
const URL = "https://shams-portfolio.mshams0174.workers.dev/en";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page) {
  try {
    return await page.evaluate(() => ({
      url: location.pathname + location.hash,
      intro: !!document.querySelector(".portfolio-intro"),
      heroReady: !!document.querySelector("section.hero.motion-ready"),
      revealTotal: document.querySelectorAll("[data-reveal]").length,
      revealIn: document.querySelectorAll("[data-reveal].in").length,
      scrollY: Math.round(window.scrollY),
      session: sessionStorage.getItem("shams-portfolio-intro-v4"),
    }));
  } catch { return { url: "about:blank" }; }
}

async function probe(label, ctxOptions, action) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOptions });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const log = [];
  page.goto(URL, { waitUntil: "domcontentloaded" }).catch(() => {});
  for (const t of [300, 700, 1100, 1500, 1900, 2500, 3200]) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    if (action) await action(page, t0);
    log.push([t, await snap(page)]);
  }
  const probeData = await page.evaluate(() => {
    const el = document.querySelector('[data-reveal="up"]');
    const cs = el ? getComputedStyle(el) : null;
    return { transition: cs ? cs.transition : null };
  }).catch(() => ({}));
  console.log("=== " + label + " ===");
  for (const [t, s] of log) console.log(t + "ms " + JSON.stringify(s));
  console.log("computed: " + JSON.stringify(probeData));
  await browser.close();
}

(async () => {
  await probe("RUN1 fresh visit", {});
  await probe("RUN2 focus-click at ~300ms", {}, async (page) => {
    if (!global.__clicked) { global.__clicked = true; try { await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.up(); } catch {} }
  });
  await probe("RUN3 reduced motion", { reducedMotion: "reduce" });
  console.log("=== RUN4 with #projects hash ===");
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL + "#projects", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  console.log(JSON.stringify(await snap(page)));
  await browser.close();
})();