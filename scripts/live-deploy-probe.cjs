/* Live-deployment probe: confirms the V5 intro→hero motion actually executes
   on the production Cloudflare Worker, not only on local builds. */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

const BASE = "https://shams-portfolio.mshams0174.workers.dev";
async function launch() {
  for (const p of [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ]) {
    if (require("node:fs").existsSync(p)) return chromium.launch({ executablePath: p, headless: true });
  }
  return chromium.launch({ headless: true });
}
async function main() {
  const browser = await launch();
  for (const locale of ["en", "ar"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
    await page.goto(`${BASE}/${locale}?motionPreview=1`, { waitUntil: "commit", timeout: 60000 });
    await page.locator(".portfolio-intro").waitFor({ state: "attached", timeout: 15000 });
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute("data-intro-play") &&
        Boolean(document.querySelector(".hero.motion-ready")),
      null, { timeout: 20000 },
    );
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => ({
      heroH1: Number.parseFloat(getComputedStyle(document.querySelector(".hero h1")).opacity),
      portrait: [...document.querySelectorAll(".hero-portrait img")]
        .every((img) => img.complete && img.naturalWidth > 0),
      cinematic: document.querySelector(".hero")?.classList.contains("is-cinematic"),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      dir: document.documentElement.dir,
    }));
    assert.equal(v.heroH1, 1, locale + " hero h1 visible");
    assert.ok(v.portrait, locale + " portrait loaded");
    assert.ok(v.cinematic, locale + " cinematic entrance ran");
    assert.ok(v.overflow <= 1, locale + " no horizontal overflow");
    assert.equal(v.dir, locale === "ar" ? "rtl" : "ltr", locale + " direction");
    assert.deepEqual(errors, [], locale + " no page/network errors: " + errors.join(" | "));
    console.log(`LIVE PASS ${locale}: intro→hero motion ran, hero visible, dir=${v.dir}, overflow=${v.overflow}`);
    await ctx.close();
  }
  await browser.close();
}
main().then(() => console.log("Live deployment verified")).catch((e) => { console.error("LIVE FAIL", e); process.exitCode = 1; });
