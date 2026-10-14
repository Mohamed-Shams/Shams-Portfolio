/* V5 browser regression + real WebM evidence.
 * PowerShell: $env:MOTION_URL="http://127.0.0.1:3000"; node scripts/v5-motion-regression.cjs
 * Optional:   $env:MOTION_OUT="screenshots/motion-v5-final"
 * Evidence is ignored by git through screenshots/.
 */
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const BASE = (process.env.MOTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = path.resolve(process.env.MOTION_OUT || "screenshots/motion-v5-final");
const SESSION_KEY = "shams-portfolio-intro-v5";
const SLUGS = [
  "dohler-cloudy-line", "ncec-air-quality", "ground-water",
  "modon-poc", "drilling-equipment", "water-network", "modon-testing",
];
const SIZES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const findings = [];
const checks = [];
fs.mkdirSync(OUT, { recursive: true });

function check(condition, name, detail = "") {
  const pass = Boolean(condition);
  checks.push({ name, pass, detail });
  console.log((pass ? "PASS " : "FAIL ") + name + (detail && !pass ? ": " + detail : ""));
  if (!pass) findings.push(name + (detail ? ": " + detail : ""));
}
function track(page, name) {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", response => {
    if (response.status() >= 400) errors.push(response.status() + " " + response.url());
  });
  page.on("requestfailed", request => {
    const reason = request.failure()?.errorText;
    if (reason !== "net::ERR_ABORTED") errors.push((reason || "request failed") + " " + request.url());
  });
  return () => check(errors.length === 0, name + " browser/network errors", errors.slice(0, 4).join(" | "));
}
async function state(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const el = selector => document.querySelector(selector);
    const opacity = selector => {
      const node = el(selector);
      return node ? Number.parseFloat(getComputedStyle(node).opacity) : null;
    };
    const intro = el(".portfolio-intro");
    const bar = el(".portfolio-intro-line i");
    const age = Number(html.getAttribute("data-intro-t0"));
    const origin = bar ? Number.parseFloat(getComputedStyle(bar).transformOrigin) : null;
    // Layout width stays stable while the progress bar is transformed by
    // scaleX(); its visual bounding box does not equal the transform origin.
    const barWidth = bar ? bar.offsetWidth : null;
    return {
      age: Number.isFinite(age) && age > 0 ? Date.now() - age : null,
      session: sessionStorage.getItem("shams-portfolio-intro-v5"),
      play: html.hasAttribute("data-intro-play"),
      locked: html.classList.contains("intro-lock"),
      intro: Boolean(intro),
      introVisible: Boolean(intro && getComputedStyle(intro).display !== "none" &&
        Number.parseFloat(getComputedStyle(intro).opacity) > 0.01),
      introDisplay: intro ? getComputedStyle(intro).display : null,
      badge: opacity(".intro-badge"),
      name: opacity(".intro-name"),
      role: opacity(".intro-role"),
      progress: el(".intro-pct")?.textContent?.trim() || null,
      progressOrigin: origin,
      progressWidth: barWidth,
      hero: opacity(".hero h1"),
      ready: Boolean(el(".hero.motion-ready")),
      dir: html.dir, lang: html.lang,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      overflow: html.scrollWidth - window.innerWidth,
      portrait: [...document.querySelectorAll(".hero-portrait img")]
        .every(img => img.complete && img.naturalWidth > 0),
    };
  });
}
async function frameAt(page, filename, targetMs) {
  const age = await page.evaluate(() => Number(document.documentElement.getAttribute("data-intro-t0")) || 0);
  const remaining = age ? targetMs - (Date.now() - age) : 0;
  if (remaining > 0) await page.waitForTimeout(remaining);
  const sample = await state(page);
  await page.screenshot({ path: path.join(OUT, filename + ".png") });
  return sample;
}
async function screenshot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + ".png") });
}
async function imageOK(locator) {
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate(async img => {
    try { await img.decode(); } catch {}
    const rect = img.getBoundingClientRect();
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 &&
      rect.width > 0 && rect.height > 0;
  });
}
async function verifyReveals(page, name) {
  await page.waitForFunction(() => document.documentElement.classList.contains("reveal-ready"),
    null, { timeout: 8000 });
  const about = page.locator("#about .about-image");
  const before = await about.evaluate(el => Number.parseFloat(getComputedStyle(el).opacity));
  check(before <= 0.05, name + " about starts hidden before entering viewport", String(before));
  await about.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("#about .about-image")?.classList.contains("in"),
    null, { timeout: 8000 });
  const intermediate = await about.evaluate(async el => {
    const samples = [];
    const until = performance.now() + 520;
    while (performance.now() < until) {
      samples.push(Number.parseFloat(getComputedStyle(el).opacity));
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  check(intermediate.some(v => v > 0.04 && v < 0.96),
    name + " about fade has visible intermediate frames",
    "samples=" + JSON.stringify(intermediate.filter((_, i) => i % 6 === 0)));
  await page.waitForTimeout(700);
  check(await about.evaluate(el => getComputedStyle(el).opacity === "1"),
    name + " about image reveal settled");
  const flow = page.locator("#skills .flow-wrap");
  await flow.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("#skills .flow-wrap")?.classList.contains("in"),
    null, { timeout: 8000 });
  await page.waitForTimeout(700);
  check(await flow.evaluate(el => getComputedStyle(el).opacity === "1"),
    name + " skills data-flow reveal settled");
  const stats = page.locator("#about .stats");
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  const statValues = await stats.locator("strong span").allTextContents();
  check(JSON.stringify(statValues) === JSON.stringify(["7K+", "10K+", "1.3K+"]),
    name + " about statistics finish at their exact values", JSON.stringify(statValues));
  const projects = page.locator("#projects .projects-grid");
  await projects.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1050);
  check(await projects.evaluate(el => el.classList.contains("in") &&
      [...el.querySelectorAll(".project-card")].every(card => getComputedStyle(card).opacity === "1")),
    name + " project grid completes staggered card reveal");
  const timeline = page.locator("#experience .timeline");
  await timeline.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1050);
  check(await timeline.evaluate(el => el.classList.contains("in") &&
      [...el.querySelectorAll("[data-reveal-item]")].every(item => getComputedStyle(item).opacity === "1") &&
      !!el.querySelector(".timeline-progress")),
    name + " experience milestones and progress rail appear");
  const certificates = page.locator("#certifications .cert-grid[data-reveal-group]");
  await certificates.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  check(await certificates.evaluate(el => el.classList.contains("in") &&
      [...el.querySelectorAll(".cert-card")].every(card => getComputedStyle(card).opacity === "1")),
    name + " certification cards reveal completely");
  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  // Globe arcs start when contact copy intersects; allow the last stroke
  // to finish its 1.7s draw after scroll/reveal choreography settles.
  await page.waitForTimeout(2900);
  const arcs = await page.locator(".globe-signal").evaluateAll(nodes =>
    nodes.map(node => Number.parseFloat(getComputedStyle(node).strokeDashoffset)));
  check(arcs.length === 3 && arcs.every(v => v === 0),
    name + " contact globe arcs visible", JSON.stringify(arcs));
}
async function verifyHomeInteractions(page, name) {
  const project = page.locator("#projects");
  await project.scrollIntoViewIfNeeded();
  const cards = project.locator(".project-card");
  check((await cards.count()) === 6, name + " six featured projects");
  await project.locator(".section-heading button").click();
  check((await cards.count()) === 7, name + " expand all seven projects");
  check(await project.locator(".projects-grid").getAttribute("data-expanded") === "true",
    name + " expanded project state");
  for (const slug of SLUGS) {
    const cover = project.locator('a[href$="/projects/' + slug + '"] .project-cover-image');
    check((await cover.count()) === 1 && await imageOK(cover),
      name + " homepage cover " + slug);
  }
  const skills = page.locator("#skills");
  await skills.scrollIntoViewIfNeeded();
  const initial = await skills.locator(".skill-tile").count();
  await skills.locator(".filters button").nth(3).click();
  const selected = await skills.locator(".skill-tile").count();
  check(initial > selected && selected > 0, name + " skills filter changes tiles",
    "initial=" + initial + " filtered=" + selected);
  check(await skills.locator(".filters button").nth(3).getAttribute("aria-pressed") === "true",
    name + " skills selected state");
  if (name.endsWith("-desktop")) {
    // The filtered entrance must release its transform after the last frame,
    // or the hover elevation silently stops working despite visible borders.
    await page.waitForTimeout(900);
    const firstTile = skills.locator(".skill-tile").first();
    await firstTile.hover();
    await page.waitForTimeout(350);
    const lift = await firstTile.evaluate(el =>
      new DOMMatrix(getComputedStyle(el).transform).m42);
    check(lift < -0.5, name + " filtered skill tile retains hover elevation",
      String(lift));
  }
  await skills.locator(".filters button").first().click();
  check(await skills.locator(".skill-tile").count() === initial, name + " skills filter resets");
  const otherLocale = name.startsWith("ar-") ? "en" : "ar";
  await page.locator(".language a[href^='/" + otherLocale + "']").click();
  await page.waitForURL(new RegExp("/" + otherLocale + "(?:#.*)?$"));
  check(await page.locator("html").getAttribute("dir") === (otherLocale === "ar" ? "rtl" : "ltr"),
    name + " language switching updates document direction");
  const originalLocale = otherLocale === "ar" ? "en" : "ar";
  await page.locator(".language a[href^='/" + originalLocale + "']").click();
  await page.waitForURL(new RegExp("/" + originalLocale + "(?:#.*)?$"));
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    name + " no horizontal overflow after interactions");
}
async function verifyJourney(browser, locale, size) {
  const tag = locale + "-" + size.name;
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    reducedMotion: "no-preference",
    recordVideo: { dir: OUT, size: { width: size.width, height: size.height } },
  });
  const page = await ctx.newPage();
  const assertNoErrors = track(page, tag);
  try {
    await page.goto(BASE + "/" + locale, { waitUntil: "commit", timeout: 60000 });
    await page.locator(".portfolio-intro").waitFor({ state: "attached", timeout: 12000 });
    const first = await frameAt(page, tag + "-intro-0420", 420);
    // Stylesheets can start a few frames after the inline first-paint clock,
    // especially in a cold Worker/browser context. Track both the entrance
    // and handoff frames so cold mobile startup remains measurable.
    const middle = await frameAt(page, tag + "-intro-1450", 1450);
    const handoff = await frameAt(page, tag + "-handoff-2050", 2050);
    check(first.session === "seen" && first.play, tag + " fresh visit starts V5 intro", JSON.stringify(first));
    check(first.introVisible, tag + " overlay visible near first paint", JSON.stringify(first));
    check(first.age !== null && middle.age !== null && middle.badge > 0.3 &&
      (middle.name > 0.15 || handoff.name > 0.35),
      tag + " visible badge and name before handoff",
      JSON.stringify({ middle, handoff }));
    check(middle.progressOrigin !== null && middle.progressWidth !== null &&
      (locale === "ar" ? Math.abs(middle.progressOrigin - middle.progressWidth) < 1 :
        Math.abs(middle.progressOrigin) < 1),
      tag + " progress bar follows reading direction",
      "origin=" + middle.progressOrigin + " width=" + middle.progressWidth);
    check(handoff.ready || handoff.introVisible, tag + " continuous handoff", JSON.stringify(handoff));
    await page.waitForFunction(() =>
      !document.querySelector(".portfolio-intro") &&
      !document.documentElement.hasAttribute("data-intro-play") &&
      Boolean(document.querySelector(".hero.motion-ready")),
      null, { timeout: 12000 });
    await page.waitForTimeout(700);
    const end = await state(page);
    await screenshot(page, tag + "-hero-settled");
    check(end.hero === 1 && end.portrait && end.overflow <= 1, tag + " fully visible settled hero",
      JSON.stringify(end));
    check(!end.locked && !end.intro, tag + " intro releases scroll");
    check(end.dir === (locale === "ar" ? "rtl" : "ltr") && end.lang === locale,
      tag + " locale and reading direction");
    if (size.name === "desktop") {
      const heroCTA = page.locator(".hero .actions a.button").first();
      await heroCTA.hover();
      await page.waitForTimeout(350);
      const lift = await heroCTA.evaluate(el =>
        new DOMMatrix(getComputedStyle(el).transform).m42);
      check(lift < -0.5, tag + " Hero CTA retains hover after entrance",
        String(lift));
    }
    await verifyReveals(page, tag);
    await verifyHomeInteractions(page, tag);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(300);
    const returning = await state(page);
    await screenshot(page, tag + "-returning");
    check(!returning.play && !returning.introVisible && returning.session === "seen",
      tag + " returning session skips intro", JSON.stringify(returning));
    check(returning.hero === 1 && returning.overflow <= 1,
      tag + " returning hero directly visible", JSON.stringify(returning));
    if (locale === "en" && size.name === "desktop") {
      await page.goto(BASE + "/en?motionPreview=1", { waitUntil: "commit" });
      await page.locator(".portfolio-intro").waitFor({ state: "attached" });
      const preview = await frameAt(page, tag + "-preview", 620);
      check(preview.play && preview.introVisible, "motionPreview overrides seen session",
        JSON.stringify(preview));
    }
  } finally {
    assertNoErrors();
    const video = page.video();
    await page.close();
    if (video) {
      await video.saveAs(path.join(OUT, tag + "-journey.webm"));
      await video.delete();
    }
    await ctx.close();
  }
}
async function verifyReduced(browser, locale, size) {
  const tag = locale + "-" + size.name + "-reduced";
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height }, reducedMotion: "reduce",
    recordVideo: { dir: OUT, size: { width: size.width, height: size.height } },
  });
  const page = await ctx.newPage();
  const assertNoErrors = track(page, tag);
  try {
    await page.goto(BASE + "/" + locale, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const v = await state(page);
    await screenshot(page, tag);
    check(v.reduced && !v.play && !v.introVisible && v.hero === 1 && v.overflow <= 1,
      tag + " skips intro and shows hero", JSON.stringify(v));
    await page.waitForFunction(() => document.documentElement.classList.contains("reveal-ready"),
      null, { timeout: 8000 });
    const reveal = await page.locator("[data-reveal]").evaluateAll(els =>
      els.every(el => getComputedStyle(el).opacity === "1"));
    check(reveal, tag + " all sections statically visible");
    const animations = await page.evaluate(() => document.getAnimations().length);
    check(animations === 0, tag + " zero active animations", String(animations));
  } finally {
    assertNoErrors();
    const video = page.video();
    await page.close();
    if (video) {
      await video.saveAs(path.join(OUT, tag + ".webm"));
      await video.delete();
    }
    await ctx.close();
  }
}
async function verifyNoJS(browser, locale, size) {
  const tag = locale + "-" + size.name + "-nojs";
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height }, javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + "/" + locale, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const v = await page.evaluate(() => ({
      hero: Number.parseFloat(getComputedStyle(document.querySelector(".hero h1")).opacity),
      intro: getComputedStyle(document.querySelector(".portfolio-intro")).display,
      reveal: [...document.querySelectorAll("[data-reveal]")]
        .every(el => getComputedStyle(el).opacity === "1"),
      dir: document.documentElement.dir,
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    await screenshot(page, tag);
    check(v.hero === 1 && v.intro === "none" && v.reveal && v.overflow <= 1 &&
      v.dir === (locale === "ar" ? "rtl" : "ltr"),
    tag + " content visible without JavaScript", JSON.stringify(v));
  } finally { await ctx.close(); }
}
async function verifyRoutes(browser, locale, size) {
  const tagSize = locale + "-" + size.name;
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height }, reducedMotion: "reduce",
  });
  const assertNoErrors = track(page, tagSize + "-routes");
  try {
    for (const slug of SLUGS) {
      const tag = tagSize + "/" + slug;
      const response = await page.goto(BASE + "/" + locale + "/projects/" + slug,
        { waitUntil: "domcontentloaded", timeout: 60000 });
      check(response?.status() === 200 && await page.locator("main.case").count() === 1,
        tag + " case route HTTP 200");
      const cover = page.locator(".case-cover-image");
      check(await cover.count() === 1 && await imageOK(cover), tag + " case-study cover loads");
      const counter = page.locator(".case-counter");
      const before = (await counter.innerText()).trim();
      await page.locator(".case-nav").nth(1).click();
      const after = (await counter.innerText()).trim();
      check(after !== before, tag + " gallery next navigation", before + " -> " + after);
      check(await page.locator(".case-stage svg.project-art").count() === 1,
        tag + " gallery architecture artwork renders");
      await page.locator(".thumbnails button").nth(2).click();
      check(await page.locator(".thumbnails button").nth(2).getAttribute("aria-pressed") === "true",
        tag + " thumbnail selection");
      check(await page.locator(".case-stage svg.project-art").count() === 1,
        tag + " selected gallery artwork renders");
      await page.locator(".case-stage").focus();
      const beforeKey = (await counter.innerText()).trim();
      await page.keyboard.press("ArrowRight");
      check((await counter.innerText()).trim() !== beforeKey, tag + " keyboard gallery navigation");
      check(await page.locator(".case-stage svg.project-art").count() === 1,
        tag + " keyboard selected gallery artwork renders");
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        tag + " no horizontal overflow");
    }
    const cv = await page.request.get(BASE + "/assets/MohamedAhmedShams_CV.pdf");
    check(cv.status() === 200, tagSize + " CV link HTTP 200", String(cv.status()));
    await page.goto(BASE + "/" + locale, { waitUntil: "domcontentloaded" });
    check(await page.locator("a[href='/assets/MohamedAhmedShams_CV.pdf']").count() > 0,
      tagSize + " CV link present");
  } finally {
    assertNoErrors();
    await page.close();
  }
}
async function verifyDismiss(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + "/en", { waitUntil: "commit" });
    await page.locator(".portfolio-intro").waitFor({ state: "attached", timeout: 12000 });
    const elapsed = await page.evaluate(() =>
      Date.now() - Number(document.documentElement.getAttribute("data-intro-t0")));
    await page.waitForTimeout(Math.max(0, 650 - elapsed));
    await page.keyboard.press("Tab");
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play"),
      null, { timeout: 1600 });
    check(await page.locator(".hero.motion-ready").count() === 1,
      "keyboard interaction dismisses intro after grace period");
  } finally { await ctx.close(); }
}
async function launch() {
  for (const executablePath of [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ]) {
    if (!fs.existsSync(executablePath)) continue;
    try { return await chromium.launch({ executablePath, headless: true }); }
    catch (error) { console.log("Browser unavailable: " + executablePath + " " + error.message); }
  }
  return chromium.launch({ headless: true });
}
function writeIndex() {
  const panels = [];
  for (const locale of ["en", "ar"]) {
    for (const size of SIZES) {
      const tag = locale + "-" + size.name;
      panels.push('<section><h2>' + tag + '</h2>' +
        '<video controls playsinline preload="metadata" src="' + tag + '-journey.webm"></video>' +
        '<div class="frames">' +
        ["intro-0420", "intro-1450", "handoff-2050", "hero-settled", "returning"].map(frame =>
          '<figure><img loading="lazy" src="' + tag + '-' + frame + '.png" alt="' +
          tag + ' ' + frame + '"><figcaption>' + frame + '</figcaption></figure>').join("") +
        '</div><h3>Reduced motion</h3><video controls playsinline preload="metadata" src="' +
        tag + '-reduced.webm"></video><img class="small" loading="lazy" src="' +
        tag + '-reduced.png" alt="' + tag + ' reduced motion screenshot"></section>');
    }
  }
  fs.writeFileSync(path.join(OUT, "index.html"), '<!doctype html><html lang="en"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>V5 Motion QA</title>' +
    '<style>body{background:#0b1016;color:#e9edf2;font:15px/1.5 system-ui;max-width:1200px;margin:0 auto;padding:24px}' +
    'section{border-top:1px solid #38434d;margin:48px 0;padding-top:20px}h1,h2{color:#f1a342}' +
    'video{width:100%;max-width:1000px}.frames{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}' +
    'figure{margin:0}img{display:block;width:100%}.small{max-width:400px}' +
    'figcaption{padding:8px;color:#c9a981}@media(max-width:700px){.frames{grid-template-columns:1fr}}</style>' +
    '<h1>Portfolio V5 motion evidence</h1><p>Real browser videos and timed screenshots. See results.json for assertions.</p>' +
    panels.join("") + "</html>");
}
async function main() {
  const browser = await launch();
  try {
    const warm = await browser.newPage();
    await warm.goto(BASE + "/en", { waitUntil: "domcontentloaded", timeout: 60000 });
    await warm.close();
    for (const locale of ["en", "ar"]) {
      for (const size of SIZES) {
        for (const [label, fn] of [
          ["journey", verifyJourney], ["reduced", verifyReduced], ["no-JavaScript", verifyNoJS],
        ]) {
          try { await fn(browser, locale, size); }
          catch (error) {
            check(false, locale + "-" + size.name + " " + label + " crashed",
              String(error.stack || error).slice(0, 800));
          }
        }
      }
    }
    for (const locale of ["en", "ar"]) for (const size of SIZES) {
      try { await verifyRoutes(browser, locale, size); }
      catch (error) {
        check(false, locale + "-" + size.name + " routes crashed",
          String(error.stack || error).slice(0, 800));
      }
    }
    try { await verifyDismiss(browser); }
    catch (error) { check(false, "interaction dismissal crashed", String(error.stack || error).slice(0, 800)); }
  } finally {
    await browser.close();
    const report = { base: BASE, time: new Date().toISOString(), checks, findings };
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));
    writeIndex();
    console.log("V5 motion regression: " + (checks.length - findings.length) + "/" +
      checks.length + " passed; " + findings.length + " failures");
    console.log("Videos, frames and results: " + OUT);
    if (findings.length) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
