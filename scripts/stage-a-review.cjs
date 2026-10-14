/* Reproducible Stage A visual review of committed main vs current feature. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const dir = path.resolve("screenshots/stage-a-v4-review");
fs.mkdirSync(dir, { recursive: true });
const browsers = { before: 3148, after: 3147 };
const sizes = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};
const cases = [
  ["en", "desktop"], ["ar", "desktop"],
  ["en", "mobile"], ["ar", "mobile"],
];
const evidence = [];

async function capture(browser, locale, device, revision) {
  const context = await browser.newContext({
    viewport: sizes[device],
    reducedMotion: "no-preference",
    ...(revision === "after" && ((locale === "en" && device === "desktop") ||
      (locale === "ar" && device === "mobile"))
      ? { recordVideo: { dir, size: sizes[device] } }
      : {}),
  });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", request => {
    requests.push(request.url() + " " + (request.failure()?.errorText || ""));
  });
  page.on("response", response => {
    if (response.status() >= 400) requests.push(response.status() + " " + response.url());
  });
  await page.goto(`http://127.0.0.1:${browsers[revision]}/${locale}`, {
    // A streaming Next.js response can hydrate before DOMContentLoaded.
    // Anchor the intro capture to its appearance, not to document parsing.
    waitUntil: revision === "after" ? "commit" : "domcontentloaded",
  });
  if (revision === "after") {
    await page.locator(".portfolio-intro").waitFor({ state: "attached", timeout: 7000 });
    await page.waitForTimeout(250);
  } else {
    await page.waitForTimeout(450);
  }
  const intro = await page.locator(".portfolio-intro").count();
  const earlyHeroOpacity = await page.locator(".hero h1").evaluate(el => getComputedStyle(el).opacity);
  await page.screenshot({ path: path.join(dir, `${locale}-${device}-${revision}-early.png`) });
  if (revision === "after") {
    await page.screenshot({ path: path.join(dir, `${locale}-${device}-intro.png`) });
  }
  await page.waitForTimeout(2100);
  const imageFile = `${locale}-${device}-${revision}.png`;
  await page.screenshot({ path: path.join(dir, imageFile) });
  const result = await page.evaluate(() => ({
    dir: document.documentElement.getAttribute("dir"),
    heading: document.querySelector(".hero h1")?.textContent?.replace(/\s+/g, " ").trim(),
    overflowPixels: document.documentElement.scrollWidth - window.innerWidth,
    portraitLoaded: [...document.querySelectorAll(".hero-portrait img")].every(i => i.complete && i.naturalWidth > 0),
    visibleHero: getComputedStyle(document.querySelector(".hero h1")).opacity,
    introRemaining: Boolean(document.querySelector(".portfolio-intro")),
    mainCount: document.querySelectorAll("main").length,
  }));
  assert.equal(result.dir, locale === "ar" ? "rtl" : "ltr");
  assert(result.overflowPixels <= 1, `${locale} ${device} horizontal overflow`);
  assert.equal(result.visibleHero, "1");
  assert.equal(result.portraitLoaded, true);
  assert.equal(result.mainCount, 1);
  if (revision === "after") {
    assert.equal(intro, 1, `${locale} ${device} intro missing`);
    assert.equal(result.introRemaining, false, "intro did not dismiss");
  }
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(path.join(dir, `${locale}-${device}-transition.webm`));
  await context.close();
  if (video) await video.delete();
  const entry = { locale, device, revision, intro, earlyHeroOpacity, imageFile, ...result, errors, requests };
  evidence.push(entry);
  console.log(`${revision} ${locale} ${device}: intro=${intro}, earlyHero=${earlyHeroOpacity}, errors=${errors.length} failed=${requests.length}`);
}

async function regression(browser, locale, device) {
  const context = await browser.newContext({ viewport: sizes[device] });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:3147/${locale}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1400);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(280);
  assert.equal(await page.locator(".portfolio-intro:visible").count(), 0, "intro replayed after refresh");
  await page.locator('.hero .actions a[href="#projects"]').click();
  assert.equal(new URL(page.url()).hash, "#projects");
  const href = await page.locator('a[href*="/projects/"]').first().getAttribute("href");
  assert(href && href.includes("/projects/"), "project link unavailable");
  await page.goto(`http://127.0.0.1:3147${href}`, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("main").count(), 1);
  await page.goto(`http://127.0.0.1:3147/${locale}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".portfolio-intro:visible").count(), 0, "intro replayed on returning from project");
  await context.close();
  const reduced = await browser.newContext({ viewport: sizes[device], reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(`http://127.0.0.1:3147/${locale}`, { waitUntil: "domcontentloaded" });
  // The reduced-motion state must be visible before effects run or timers fire.
  assert.equal(await reducedPage.locator(".hero h1").evaluate(el => getComputedStyle(el).opacity), "1");
  await reducedPage.waitForTimeout(350);
  assert.equal(await reducedPage.locator(".portfolio-intro:visible").count(), 0, "reduced motion intro visible");
  assert.equal(await reducedPage.locator(".hero h1").evaluate(el => getComputedStyle(el).opacity), "1");
  await reducedPage.screenshot({ path: path.join(dir, `${locale}-${device}-reduced-motion.png`) });
  await reduced.close();
  const noJs = await browser.newContext({ viewport: sizes[device], javaScriptEnabled: false });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(`http://127.0.0.1:3147/${locale}`, { waitUntil: "domcontentloaded" });
  const noJsVisibility = await noJsPage.locator(".hero h1").evaluate(el => getComputedStyle(el).opacity);
  assert.equal(noJsVisibility, "1", "Hero hidden without JavaScript");
  await noJs.close();

  // The overlay is decorative and must yield instantly when a visitor interacts.
  for (const method of ["keyboard", "pointer"]) {
    const interactive = await browser.newContext({ viewport: sizes[device] });
    const interactivePage = await interactive.newPage();
    await interactivePage.goto(`http://127.0.0.1:3147/${locale}`, { waitUntil: "domcontentloaded" });
    await interactivePage.locator(".portfolio-intro").waitFor({ state: "attached" });
    const origin = await interactivePage.locator(".portfolio-intro-line i").evaluate(el => getComputedStyle(el).transformOrigin);
    const expectedOrigin = locale === "ar" ? "160px" : "0px";
    assert(origin.startsWith(expectedOrigin), `${locale} intro progress direction ${origin}`);
    if (method === "keyboard") {
      await interactivePage.keyboard.press("Tab");
      assert.equal(await interactivePage.evaluate(() => document.activeElement?.tagName), "A", "Tab focus not visible");
    } else {
      await interactivePage.mouse.click(sizes[device].width - 8, sizes[device].height - 8);
    }
    await interactivePage.waitForTimeout(350);
    assert.equal(await interactivePage.locator(".portfolio-intro").count(), 0, `${locale} ${method} failed to dismiss intro`);
    await interactive.close();
  }
}

function writeReview() {
  const panels = cases.map(([locale, device]) => `<section>
    <h2>${locale.toUpperCase()} / ${device} (${sizes[device].width}×${sizes[device].height})</h2>
    <h3>At first visit, around 450ms</h3>
    <div class="pair">
      <figure><img src="${locale}-${device}-before-early.png" alt="Original main early Hero frame ${locale} ${device}"/><figcaption>Before · Hero is already entering</figcaption></figure>
      <figure><img src="${locale}-${device}-after-early.png" alt="Stage A intro frame ${locale} ${device}"/><figcaption>After · MS introductory screen</figcaption></figure>
    </div><h3>Settled Hero, around 2.5 seconds</h3><div class="pair">
      <figure><img src="${locale}-${device}-before.png" alt="Original main branch ${locale} ${device}"/><figcaption>Before · main 95cbe7a</figcaption></figure>
      <figure><img src="${locale}-${device}-after.png" alt="Stage A final ${locale} ${device}"/><figcaption>After · Stage A</figcaption></figure>
    </div>
    <figure class="intro"><img src="${locale}-${device}-intro.png" alt="Intro ${locale} ${device}"/><figcaption>Branded preloader</figcaption></figure>
    ${fs.existsSync(path.join(dir, `${locale}-${device}-transition.webm`))
      ? `<video controls playsinline preload="metadata" src="${locale}-${device}-transition.webm"></video><p>Recorded actual first-visit transition (WebM)</p>`
      : ""}
  </section>`).join("");
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Shams Portfolio V4 · Stage A Visual QA</title>
  <style>
  *{box-sizing:border-box}body{background:#080d12;color:#f4f5f6;font:16px/1.55 system-ui;margin:0;padding:2rem}
  h1{color:#f1a342}p{color:#b4bdc6}section{border-top:1px solid #33404e;margin:3rem 0;padding-top:1rem}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figure img{width:100%;height:auto;border:1px solid #33404e}
  figcaption{padding:.6rem;color:#f1a342}.intro{max-width:650px;margin:2rem auto}
  video{width:100%;max-width:900px;border:1px solid #33404e}
  @media(max-width:750px){.pair{grid-template-columns:1fr}body{padding:1rem}}
  </style><h1>Stage A · Before / After</h1><p>Source: detached main 95cbe7a. Feature: v4 Stage A. Screenshots at 1440×900 and 390×844. Videos are actual browser recordings.</p>
  ${panels}</html>`);
}

async function main() {
  const browser = await chromium.launch({
    headless: true, executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  try {
    // Warm each server first to avoid Next.js development compilation in recordings.
    for (const port of Object.values(browsers)) {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/en`, { waitUntil: "domcontentloaded" });
      await page.close();
    }
    for (const [locale, device] of cases) {
      await capture(browser, locale, device, "before");
      await capture(browser, locale, device, "after");
      await regression(browser, locale, device);
    }
    fs.writeFileSync(path.join(dir, "results.json"), JSON.stringify(evidence, null, 2));
    const errs = evidence.flatMap(e => [...e.errors, ...e.requests]);
    if (errs.length) throw new Error("Browser errors: " + errs.slice(0, 10).join("; "));
    writeReview();
    console.log("SUCCESS: screenshots, two videos, and browser review HTML generated in " + dir);
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
