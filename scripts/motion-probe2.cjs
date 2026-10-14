const { chromium } = require("@playwright/test");
const URL = "https://shams-portfolio.mshams0174.workers.dev/en";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  page.goto(URL, { waitUntil: "commit" }).catch(() => {});
  let hydratedAt = null, introAt = null, heroAt = null;
  for (let i = 0; i < 90; i++) {
    await sleep(100);
    const s = await page.evaluate(() => ({
      ready: document.readyState,
      session: (() => { try { return sessionStorage.getItem("shams-portfolio-intro-v4"); } catch { return null; } })(),
      intro: !!document.querySelector(".portfolio-intro"),
      hero: !!document.querySelector("section.hero.motion-ready"),
      h1opacity: (() => { const h = document.querySelector("h1"); return h ? getComputedStyle(h).opacity : null; })(),
      revealReady: document.documentElement.classList.contains("reveal-ready"),
    })).catch(() => null);
    if (!s) continue;
    if (hydratedAt === null && s.session === "seen") hydratedAt = Date.now() - t0;
    if (introAt === null && s.intro) introAt = Date.now() - t0;
    if (heroAt === null && s.hero) heroAt = Date.now() - t0;
    if (i % 5 === 0) console.log((Date.now() - t0) + "ms " + JSON.stringify(s));
    if (heroAt !== null && i > 30) break;
  }
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    return { domContentLoaded: Math.round(n.domContentLoadedEventEnd), loadEvent: Math.round(n.loadEventEnd), transferSize: n.transferSize };
  }).catch(() => ({}));
  console.log(" hydratedAt=" + hydratedAt + " introAt=" + introAt + " heroReadyAt=" + heroAt);
  console.log(" navigation: " + JSON.stringify(nav));
  await browser.close();
})();