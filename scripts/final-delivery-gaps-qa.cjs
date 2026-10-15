/**
 * Focused late-stage regression coverage for defects that previous suites
 * did not test: mobile menu Tab/Escape/outside-close, case-study skip/footer,
 * localized case dates, and OS reduced-motion marquee accessibility.
 * Run with MOTION_URL against OpenNext preview then live Cloudflare.
 */
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const output = path.resolve(process.env.GAPS_QA_OUT || "screenshots/final-delivery-gaps");
fs.mkdirSync(output, { recursive: true });
const slugs = [
  "ncec-air-quality", "dohler-cloudy-line", "ground-water",
  "modon-poc", "drilling-equipment", "water-network", "modon-testing",
];

async function load(page, href) {
  const response = await page.goto(base + href, { waitUntil: "domcontentloaded", timeout: 60000 });
  assert.equal(response.status(), 200, href + " must return HTTP 200");
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play") &&
    !document.querySelector(".portfolio-intro"), null, { timeout: 13000 });
}
async function test() {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const records = [];
  try {
    for (const locale of ["en", "ar"]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => {
        if (m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text());
      });
      page.on("response", r => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
      try {
        await load(page, "/" + locale + "#projects");
        const menu = page.locator("button.menu");
        await menu.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(160);
        assert.equal(await menu.getAttribute("aria-expanded"), "true", locale + " menu opens");
        const first = await page.evaluate(() => {
          const nav = document.querySelector("#portfolio-main-navigation");
          return { id: document.activeElement?.textContent?.trim(),
            insideNav: nav?.contains(document.activeElement) };
        });
        assert(first.insideNav, locale + " opening moves focus to the nav links " + JSON.stringify(first));
        await page.keyboard.press("Tab");
        assert(await page.evaluate(() =>
          document.querySelector("#portfolio-main-navigation").contains(document.activeElement)),
          locale + " Tab navigates menu items, not hero CTA");
        await page.screenshot({ path: path.join(output, locale + "-menu-open.png") });
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false", locale + " Escape closes nav");
        assert(await menu.evaluate(e => document.activeElement === e), locale + " focus returns to menu trigger");
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"), "true", locale + " reopen nav");
        await page.mouse.click(376, 360);
        assert.equal(await menu.getAttribute("aria-expanded"), "false", locale + " outside pointer click closes nav");
        records.push({ test: locale + "-mobile-menu", passed: true });

        for (const slug of slugs) {
          await load(page, "/" + locale + "/projects/" + slug);
          assert.equal(await page.locator('a.skip-link[href="#main"]').count(), 1,
            locale + " " + slug + " skip-to-content available");
          assert.equal(await page.locator("main#main").count(), 1,
            locale + " " + slug + " skip target exists");
          assert.equal(await page.locator("footer").count(), 1,
            locale + " " + slug + " shared site footer exists");
          assert.equal(await page.locator("footer a").last().getAttribute("href"), "/" + locale + "#projects",
            locale + " " + slug + " footer returns to projects");
          if (slug === "ncec-air-quality") {
            const gallery = page.locator(".case-stage");
            await gallery.focus();
            const initialImage = (await page.locator(".case-counter").textContent()).trim();
            await page.keyboard.press("ArrowLeft");
            const imageAfterLeft = (await page.locator(".case-counter").textContent()).trim();
            assert.notEqual(imageAfterLeft, initialImage, locale + " gallery arrow changes image");
            assert(imageAfterLeft.startsWith(locale === "ar" ? "2 /" : "4 /"),
              locale + " gallery keyboard follows visual RTL/LTR direction: " + imageAfterLeft);
            await page.keyboard.press("ArrowRight");
            assert.equal((await page.locator(".case-counter").textContent()).trim(), initialImage,
              locale + " opposite arrow returns to initial image");
            const dates = await page.locator(".case-meta bdi, .case-facts dd bdi").allTextContents();
            assert.equal(dates.length, 2, locale + " NCEC two period fields");
            assert(dates.every(d => d.includes(locale === "ar" ? "حتى الآن" : "Present")),
              locale + " NCEC period localized: " + JSON.stringify(dates));
            if (locale === "ar") assert(dates.every(d => !d.includes("Present")), "no stray English Present");
            await page.screenshot({ path: path.join(output, locale + "-ncec-footer.png"), fullPage: true });
          }
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          assert(overflow <= 1, locale + " " + slug + " no page overflow");
        }
        assert.deepEqual(errors, [], locale + " no page/browser/network errors " + JSON.stringify(errors.slice(0, 4)));
        records.push({ test: locale + "-seven-case-footers", passed: true });
      } finally { await context.close(); }
    }
    for (const locale of ["en", "ar"]) {
      for (const motion of ["no-preference", "reduce"]) {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: motion });
        const page = await ctx.newPage();
        try {
          await load(page, "/" + locale + "#certifications");
          const ticker = page.locator(".platform-ticker");
          await ticker.evaluate(e => e.scrollIntoView({ block: "center", behavior: "instant" }));
          const data = await ticker.evaluate(el => {
            const track = el.querySelector(".platform-ticker-track");
            const win = el.querySelector(".platform-ticker-window");
            const first = el.querySelector(".platform-ticker-item");
            const repeat = el.querySelector(".platform-ticker-set[aria-hidden='true']");
            return {
              title: el.querySelector(".platform-ticker-head span").textContent,
              animation: getComputedStyle(track).animationName,
              duration: getComputedStyle(track).animationDuration,
              width: first.getBoundingClientRect().width,
              icons: el.querySelectorAll(".platform-ticker-set:first-child .platform-ticker-item").length,
              repeatDisplay: getComputedStyle(repeat).display,
              scrollWidth: win.scrollWidth,
              clientWidth: win.clientWidth,
              overflow: getComputedStyle(win).overflowX,
            };
          });
          assert.equal(data.animation, "platform-marquee", locale + " " + motion + " ticker autoplay");
          assert(Math.abs(data.width - 111) < .1,
            locale + " " + motion + " prominent 111px card width preserved");
          assert.equal(data.icons, 13, locale + " " + motion + " all 13 platforms preserved");
          assert.notEqual(data.repeatDisplay, "none",
            locale + " " + motion + " duplicate row visible for uninterrupted marquee");
          assert.equal(data.overflow, "hidden",
            locale + " " + motion + " automatic marquee, not manual scroll");
          records.push({ test: locale + "-ticker-" + motion, passed: true, data });
        } finally { await ctx.close(); }
      }
    }
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ base, records }, null, 2));
    console.log("PASS: mobile menu, 14 case pages, dates, footer and reduced/normal ticker");
  } finally { await browser.close(); }
}
test().catch(e => { console.error("FAIL:", e); process.exitCode = 1; });
