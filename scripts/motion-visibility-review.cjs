/* Evidence of actual first-visit motion under production or local Next.js. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const base = process.env.MOTION_URL || "http://127.0.0.1:3000";
const output = path.resolve("screenshots/motion-v4-final");
fs.mkdirSync(output, { recursive: true });
const cases = [
  { name: "01-english-first", lang: "en", width: 1440, height: 900, motion: "no-preference", expected: "intro" },
  { name: "02-arabic-first", lang: "ar", width: 1440, height: 900, motion: "no-preference", expected: "intro" },
  { name: "03-english-returning", lang: "en", width: 1440, height: 900, motion: "no-preference", expected: "return" },
  { name: "04-reduced-motion", lang: "en", width: 1440, height: 900, motion: "reduce", expected: "reduced" },
  { name: "05-mobile-first", lang: "en", width: 390, height: 844, motion: "no-preference", expected: "intro" },
  { name: "06-arabic-mobile-first", lang: "ar", width: 390, height: 844, motion: "no-preference", expected: "intro" },
];
const result = [];
const pageUrl = lang => base.replace(/\/$/, "") + "/" + lang;
const wait = async (page, ms) => page.waitForTimeout(ms);

async function sample(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector(".hero h1");
    const trace = document.querySelector(".scada-trace");
    const intro = document.querySelector(".portfolio-intro");
    const active = document.querySelector(".portfolio-intro-mark");
    const css = el => el ? getComputedStyle(el) : null;
    const opacity = el => el ? Number(css(el).opacity) : null;
    return {
      intro: Boolean(intro),
      introOpacity: opacity(intro),
      monogramOpacity: opacity(active),
      heroOpacity: opacity(h1),
      scadaAnimation: css(trace)?.animationName ?? null,
      scadaDash: css(trace)?.strokeDashoffset ?? null,
      motionReady: document.querySelector(".hero")?.classList.contains("motion-ready"),
      session: sessionStorage.getItem("shams-portfolio-intro-v4"),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      dir: document.documentElement.dir,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      documentTitle: document.title,
      visibleHeroText: h1?.innerText,
      imageLoaded: [...document.querySelectorAll(".hero-portrait img")].every(i => i.complete && i.naturalWidth > 0),
      shift: window.__motionLayoutShift || 0,
    };
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true, executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  try {
    // Reuse a single browser process and warm production assets before capturing.
    const warm = await browser.newPage();
    await warm.goto(pageUrl("en"), { waitUntil: "domcontentloaded", timeout: 60000 });
    await warm.close();
    for (const conf of cases) {
      const context = await browser.newContext({
        viewport: { width: conf.width, height: conf.height },
        reducedMotion: conf.motion,
        recordVideo: { dir: output, size: {width: conf.width, height: conf.height} },
      });
      await context.addInitScript(() => {
        window.__motionLayoutShift = 0;
        if (typeof PerformanceObserver === "function") {
          try {
            new PerformanceObserver(list => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) window.__motionLayoutShift += entry.value;
              }
            }).observe({ type: "layout-shift", buffered: true });
          } catch {}
        }
      });
      const page = await context.newPage();
      const errors = [], requests = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => {if (m.type() === "error") errors.push(m.text());});
      page.on("response", res => {if(res.status() >= 400) requests.push(res.status() + " " + res.url());});
      page.on("requestfailed", req => {
        if (!["net::ERR_ABORTED"].includes(req.failure()?.errorText))
          requests.push(req.url() + " " + req.failure()?.errorText);
      });
      if (conf.expected === "return") {
        // A second visit in the same context must skip the introduction.
        await page.goto(pageUrl(conf.lang), {waitUntil:"domcontentloaded"});
        await wait(page, 2200);
      }
      await page.goto(pageUrl(conf.lang), { waitUntil: "commit", timeout: 60000 });
      if (conf.expected === "intro") {
        await page.locator(".portfolio-intro").waitFor({state:"attached", timeout:10000});
      } else {
        await page.locator(".hero h1").waitFor({state:"attached", timeout:10000});
      }
      const first = await sample(page);
      await page.screenshot({ path: path.join(output, conf.name + "-initial.png") });
      await wait(page, 530);
      const during = await sample(page);
      await page.screenshot({ path: path.join(output, conf.name + "-during.png") });
      await wait(page, 760);
      const handoff = await sample(page);
      await page.screenshot({ path: path.join(output, conf.name + "-handoff.png") });
      await wait(page, 1400);
      const settled = await sample(page);
      await page.screenshot({ path: path.join(output, conf.name + "-settled.png") });
      assert.equal(settled.dir, conf.lang === "ar" ? "rtl" : "ltr");
      assert.equal(settled.scrollWidth <= settled.viewportWidth + 1, true, "horizontal overflow");
      assert.equal(settled.heroOpacity, 1, "Hero must reach full visibility");
      assert.equal(settled.intro, false, "Intro must eventually dismiss");
      assert.equal(settled.imageLoaded, true, "Portrait must load");
      assert(settled.shift < 0.11, "unexpected layout shift: " + settled.shift);
      if (conf.expected === "intro") {
        assert(first.intro, "fresh session should show intro");
        assert(during.intro, "preloader should remain visible at 530ms");
        assert(handoff.intro || handoff.heroOpacity > 0, "visible handoff gap");
        assert.equal(during.session, "seen", "intro session storage not set");
      } else {
        assert(!first.intro && !during.intro, "intro incorrectly replayed");
        if(conf.expected === "reduced") {
          assert(first.reduced, "reduced motion not set");
          assert.equal(Number.parseFloat(settled.scadaDash), 0, "SCADA path must be visible in reduced motion");
        }
      }
      const video = page.video();
      await page.close();
      if(video) {
        await video.saveAs(path.join(output, conf.name + ".webm"));
        await video.delete();
      }
      await context.close();
      const entry = { ...conf, first, during, handoff, settled, errors, requests };
      result.push(entry);
      console.log(conf.name + ": visible=" + during.intro + " hero=" + settled.heroOpacity +
        " layoutShift=" + settled.shift + " browserErrors=" + errors.length + " failedRequests=" + requests.length);
      if (errors.length || requests.length) throw new Error(JSON.stringify({name:conf.name, errors, requests}));
    }
    // Interaction and progressive-rendering checks: decorative intro cannot
    // prevent keyboard navigation or leave the no-JavaScript Hero invisible.
    const interaction = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const keyboardPage = await interaction.newPage();
    await keyboardPage.goto(pageUrl("en"), { waitUntil: "commit" });
    await keyboardPage.locator(".portfolio-intro").waitFor({ state: "attached" });
    await keyboardPage.keyboard.press("Tab");
    await keyboardPage.locator(".portfolio-intro").waitFor({ state: "detached", timeout: 1200 });
    assert.equal(await keyboardPage.evaluate(() => document.activeElement?.classList.contains("skip-link")), true,
      "keyboard did not focus skip link");
    await keyboardPage.locator('.hero .actions a[href="#projects"]').click();
    assert.equal(new URL(keyboardPage.url()).hash, "#projects", "projects navigation broken");
    const href = await keyboardPage.locator('a[href*="/projects/"]').first().getAttribute("href");
    assert(href, "project route missing");
    await keyboardPage.goto(base.replace(/\/$/, "") + href, { waitUntil: "domcontentloaded" });
    assert.equal(await keyboardPage.locator("main").count(), 1);
    await keyboardPage.goto(pageUrl("en"), { waitUntil: "domcontentloaded" });
    assert.equal(await keyboardPage.locator(".portfolio-intro").count(), 0,
      "intro replayed after project navigation");
    await interaction.close();
    const pointerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pointerPage = await pointerContext.newPage();
    await pointerPage.goto(pageUrl("en"), { waitUntil: "commit" });
    await pointerPage.locator(".portfolio-intro").waitFor({ state: "attached" });
    await pointerPage.mouse.click(25, 30);
    await pointerPage.locator(".portfolio-intro").waitFor({ state: "detached", timeout: 1200 });
    await pointerContext.close();
    const noJsContext = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(pageUrl("en"), { waitUntil: "domcontentloaded" });
    assert.equal(await noJsPage.locator(".hero h1").evaluate(el => getComputedStyle(el).opacity), "1",
      "no-JavaScript Hero hidden");
    await noJsContext.close();
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({base, result}, null, 2));
    const cards = cases.map(c => `<section><h2>${c.name}</h2>
    <video controls playsinline preload="metadata" src="${c.name}.webm"></video>
    <div class="grid">${["initial","during","handoff","settled"].map(n => `
      <figure><img src="${c.name}-${n}.png" alt="${c.name} ${n} frame"><figcaption>${n}</figcaption></figure>`).join("")}</div></section>`).join("");
    fs.writeFileSync(path.join(output, "index.html"), `<!DOCTYPE html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Shams Portfolio — V4 Motion Evidence</title>
    <style>body{background:#080d12;color:#f8f5ee;font:16px/1.5 system-ui;margin:0 auto;padding:24px;max-width:1200px}
    h1{color:#f1a342}section{border-top:1px solid #52616c;margin:48px 0;padding-top:18px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    video{width:100%;max-width:850px}figure{margin:0}img{width:100%;display:block}figcaption{padding:8px;color:#f1a342}
    @media(max-width:700px){.grid{grid-template-columns:1fr}}</style>
    <h1>Motion visibility audit — recorded browser evidence</h1>
    <p>Fresh-session, returning, reduced-motion, English/Arabic and mobile recordings captured from ${base}.</p>${cards}</html>`);
    console.log("PASSED: " + result.length + " real-browser motion recordings and checks.");
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exitCode=1;});
