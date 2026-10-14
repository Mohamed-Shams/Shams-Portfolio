/* Focused continuation QA: release inertia, idle geographic drift,
 * natural vertical touch scrolling, marker tap and preserved asset links.
 * Run against local OpenNext preview, then public Cloudflare Worker.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const base = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const output = path.resolve(process.env.GLOBE_QA_OUT || "screenshots/globe-motion-continuity");
fs.mkdirSync(output, { recursive: true });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function details(page) {
  return page.locator("svg.globe-art").evaluate(svg => {
    const mark = name => svg.querySelector(".globe-beacon--" + name);
    return {
      rotation: svg.getAttribute("data-rotation").split(",").map(Number),
      coast: svg.querySelector(".globe-coastline").getAttribute("d"),
      borders: svg.querySelector(".globe-country-borders").getAttribute("d"),
      egypt: mark("egypt")?.getAttribute("transform"),
      saudi: mark("saudi")?.getAttribute("transform"),
      ripple: getComputedStyle(mark("egypt")?.querySelector(".globe-beacon-ripple")).animationName,
      traveller: svg.querySelector(".globe-region-traveller")?.getScreenCTM()?.e,
      orbit: getComputedStyle(svg.querySelector(".globe-orbit")).animationName,
      touchAction: getComputedStyle(svg).touchAction,
      scroll: window.scrollY,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
}

(async () => {
  const { geoOrthographic } = await import("d3-geo");
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const lang of ["en", "ar"]) for (const mobile of [false, true]) {
      const tag = lang + "-" + (mobile ? "mobile" : "desktop");
      const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
      const context = await browser.newContext({
        viewport, isMobile: mobile, hasTouch: mobile,
        recordVideo: { dir: output, size: viewport },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => {
        if (m.type() === "error" || /hydration/i.test(m.text())) errors.push(m.text());
      });
      page.on("response", r => {
        if (r.status() >= 400) errors.push(r.status() + " " + r.url());
      });
      try {
        await page.goto(base + "/" + lang, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() =>
          !document.documentElement.hasAttribute("data-intro-play") &&
          !document.querySelector(".portfolio-intro"), null, { timeout: 15000 });
        await page.locator("#contact").evaluate(e => e.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForFunction(() =>
          document.querySelector(".globe-art")?.getAttribute("data-interactive-ready") === "true",
          null, { timeout: 20000 });
        const globe = page.locator("svg.globe-art");
        const initial = await details(page);
        assert(initial.coast.length > 20000 && initial.borders.length > 10000,
          tag + " retains detailed Natural Earth paths");
        assert(initial.egypt && initial.saudi && initial.ripple.includes("globe-beacon-ripple"),
          tag + " both country markers and golden pulse");
        assert(initial.touchAction.includes("pan-y"), tag + " allows vertical touch scrolling");

        const rect = await globe.boundingBox();
        const x = rect.x + rect.width * .43;
        const y = rect.y + rect.height * .57;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + 26, y + 7, { steps: 2 });
        await page.waitForTimeout(48);
        await page.mouse.move(x + 110, y + 28, { steps: 3 });
        await page.mouse.up();
        const released = await details(page);
        await page.waitForTimeout(260);
        const coasted = await details(page);
        assert(Math.abs(coasted.rotation[0] - released.rotation[0]) > .12,
          tag + " short inertial continuation after pointer release " +
          JSON.stringify({ released: released.rotation, coasted: coasted.rotation }));
        assert.notEqual(coasted.coast, released.coast, tag + " coastlines continue moving with inertia");
        assert.notEqual(coasted.egypt, released.egypt, tag + " marker follows coastlines during inertia");

        // Stop hovering/focusing, allow an idle-resume interval; capture a
        // bounded geographic drift (not just CSS orbit movement).
        await page.mouse.move(4, 4);
        await page.evaluate(() => {
          const a = document.activeElement;
          if (a instanceof HTMLElement || a instanceof SVGElement) a.blur();
        });
        await page.waitForTimeout(3650);
        const idleA = await details(page);
        await page.waitForTimeout(740);
        const idleB = await details(page);
        assert(Math.abs(idleB.rotation[0] - idleA.rotation[0]) > .08,
          tag + " gentle automatic geographic motion resumes after inactivity " +
          JSON.stringify({ a: idleA.rotation, b: idleB.rotation }));
        assert(Math.abs(idleB.rotation[0] - coasted.rotation[0]) < 3.1,
          tag + " idle drift is restrained and doesn't spin the globe away");
        await page.screenshot({ path: path.join(output, tag + "-idle.png") });

        // Hit reset: its geographic center and both experience markers should
        // return precisely to the default projection and remain visible.
        await page.getByRole("button", { name: lang === "en" ? "Reset globe view" :
          "إعادة الكرة الأرضية لوضعها الأول" }).click();
        const reset = await details(page);
        assert.deepEqual(reset.rotation, [20, 0], tag + " reset returns default orientation");
        const projection = geoOrthographic()
          .rotate([-20, 0, 0]).scale(215).translate([240, 240])
          .angle(.25 * 180 / Math.PI).clipAngle(90);
        for (const [name, coords] of [
          ["egypt", [30.8, 26.8]], ["saudi", [45.1, 24.2]],
        ]) {
          const actual = reset[name]?.match(/^translate\(([-\d.]+) ([-\d.]+)\)$/);
          const expected = projection(coords);
          assert(actual && expected &&
            Math.hypot(Number(actual[1]) - expected[0], Number(actual[2]) - expected[1]) < .02,
            tag + " " + name + " stays geographically aligned");
        }
        await page.screenshot({ path: path.join(output, tag + "-reset.png") });

        if (mobile) {
          const cdp = await context.newCDPSession(page);
          // Vertical swipe across the globe must scroll the actual document.
          // The globe is in the bottom section, so create 200px of room first.
          await page.evaluate(() => window.scrollBy({ top: -210, behavior: "instant" }));
          await page.waitForTimeout(160);
          const beforeScroll = await page.evaluate(() => scrollY);
          const p = { x: Math.min(viewport.width - 55, x), y: Math.max(145, y), id: 1 };
          await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [p] });
          for (let i = 1; i <= 8; i++) {
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x: p.x, y: p.y - i * 16, id: 1 }],
            });
            await sleep(27);
          }
          await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await page.waitForTimeout(400);
          const afterScroll = await page.evaluate(() => scrollY);
          assert(afterScroll > beforeScroll + 20,
            tag + " vertical swipe scrolls page instead of rotating globe " +
            JSON.stringify({ beforeScroll, afterScroll }));
          await page.locator("#contact").evaluate(e => e.scrollIntoView({ behavior: "instant", block: "center" }));
          await page.waitForTimeout(180);
          const marker = page.locator(".globe-beacon--egypt .globe-beacon-core");
          // Tap the small, stable core: do not start a globe drag.
          const center = await marker.evaluate(e => {
            const m = e.getScreenCTM();
            return { x: m.e, y: m.f };
          });
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchStart", touchPoints: [{ x: center.x, y: center.y, id: 2 }],
          });
          await sleep(70);
          await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await page.waitForTimeout(170);
          assert.equal(await page.locator(".globe-beacon--egypt").getAttribute("aria-pressed"), "true",
            tag + " actual touch tap selects Egypt without triggering drag");
          await page.screenshot({ path: path.join(output, tag + "-selected.png") });
        } else {
          await page.locator(".globe-beacon--saudi").focus();
          await page.keyboard.press("Enter");
          assert.equal(await page.locator(".globe-beacon--saudi").getAttribute("aria-pressed"), "true",
            tag + " keyboard marker selection");
        }

        assert((await details(page)).overflow <= 1, tag + " no horizontal page overflow");
        assert.equal(await page.locator(".certificate-document").count(), 10,
          tag + " certificate document library preserved");
        assert.equal(await page.locator(".platform-ticker-item").count(), 26,
          tag + " platform ticker preserved");
        assert.deepEqual(errors, [], tag + " no errors, failed requests or hydration warnings");
        console.log("PASS", tag, "inertia, idle, accurate markers, marker select, scroll, assets, no errors");
        results.push({ tag, pass: true, errors });
      } finally {
        const video = page.video();
        await page.close();
        if (video) {
          await video.saveAs(path.join(output, tag + ".webm"));
          await video.delete();
        }
        await context.close();
      }
    }
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ base, results }, null, 2));
    console.log("ALL GLOBE CONTINUITY CHECKS PASSED");
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
