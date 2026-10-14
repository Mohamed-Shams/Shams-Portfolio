// Production-preview acceptance: EN/AR, desktop/mobile, real map reprojection,
// pointer drag, keyboard access, marker selection, zoom/reset and runtime errors.
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const out = path.resolve("screenshots/interactive-globe");
fs.mkdirSync(out, { recursive: true });

async function state(page) {
  return page.evaluate(() => {
    const globe = document.querySelector("svg.globe-art");
    const mark = key => {
      const node = globe.querySelector(".globe-beacon--" + key);
      return node ? {
        position: node.getAttribute("transform"),
        selected: node.getAttribute("aria-pressed"),
        label: node.querySelector("text.globe-beacon-label").textContent,
      } : null;
    };
    return {
      rotation: globe.getAttribute("data-rotation"),
      zoom: globe.getAttribute("data-zoom"),
      engine: globe.getAttribute("data-interactive-ready"),
      coast: globe.querySelector(".globe-coastline").getAttribute("d"),
      borders: globe.querySelector(".globe-country-borders").getAttribute("d"),
      egypt: mark("egypt"),
      saudi: mark("saudi"),
      link: getComputedStyle(globe.querySelector(".globe-region-connection")).display,
      orb: getComputedStyle(globe.querySelector(".globe-orbit")).animationName,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      htmlDir: document.documentElement.dir,
    };
  });
}
async function main() {
  const { geoOrthographic } = await import("d3-geo");
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const lang of ["en", "ar"]) {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
        const tag = lang + "-" + (viewport.width === 390 ? "mobile" : "desktop");
        const ctx = await browser.newContext({
          viewport,
          isMobile: viewport.width === 390,
          hasTouch: viewport.width === 390,
          recordVideo: { dir: out, size: viewport },
        });
        const page = await ctx.newPage();
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
          await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play") &&
            !document.querySelector(".portfolio-intro"), null, { timeout: 12000 });
          await page.locator("#contact").evaluate(e => e.scrollIntoView({ block: "center", behavior: "instant" }));
          await page.waitForFunction(() => document.querySelector("svg.globe-art")?.getAttribute("data-interactive-ready") === "true", null, { timeout: 20000 });
          const initial = await state(page);
          assert(initial.coast.length > 20000, tag + " accurate coastlines SSR");
          assert(initial.egypt && initial.saudi, tag + " initial geographic markers");
          assert.equal(initial.htmlDir, lang === "ar" ? "rtl" : "ltr");
          const globe = page.locator("svg.globe-art");
          await page.screenshot({ path: path.join(out, tag + "-initial.png") });
          await globe.focus();
          await page.keyboard.press("ArrowLeft");
          await page.waitForTimeout(180);
          const moved = await state(page);
          assert.notEqual(moved.rotation, initial.rotation, tag + " arrow keys rotate globe");
          assert.notEqual(moved.coast, initial.coast, tag + " continent geometry reprojection");
          assert.notEqual(moved.egypt?.position, initial.egypt.position, tag + " Egypt marker moves with geography");
          // Independent D3 projection check: after rotation the marker must
          // remain precisely on the same projected geography, not an overlay.
          const [longitude, latitude] = moved.rotation.split(",").map(Number);
          const projector = geoOrthographic()
            .rotate([-longitude, -latitude, 0])
            .scale(215 * Number(moved.zoom)).translate([240, 240])
            .angle(.25 * 180 / Math.PI).clipAngle(90).precision(.65);
          for(const [marker, coords] of [[moved.egypt,[30.8,26.8]],[moved.saudi,[45.1,24.2]]]) {
            const expected = projector(coords);
            const match = /^translate\(([-\d.]+) ([-\d.]+)\)$/.exec(marker.position);
            assert(match && expected, tag + " marker projection is available");
            assert(Math.hypot(Number(match[1])-expected[0],Number(match[2])-expected[1]) < .02,
              tag + " marker follows exact D3 coastline projection");
          }
          await page.screenshot({ path: path.join(out, tag + "-rotated.png") });
          const rect = await globe.boundingBox();
          const x = rect.x + rect.width * .44;
          const y = rect.y + rect.height * .58;
          await page.mouse.move(x, y);
          await page.mouse.down();
          for (let i = 0; i < 6; i++) {
            await page.mouse.move(x + i * 12, y + i * 4, { steps: 4 });
            await page.waitForTimeout(55);
          }
          await page.mouse.up();
          await page.waitForTimeout(180);
          const dragged = await state(page);
          assert.notEqual(dragged.rotation, moved.rotation, tag + " actual pointer drag changes rotation");
          assert.notEqual(dragged.coast, moved.coast, tag + " accurate coastlines turn under drag");
          if (viewport.width === 390) {
            // Exercise real touch pointer events, not merely mouse events
            // dispatched inside a mobile-sized desktop viewport.
            const cdp = await ctx.newCDPSession(page);
            const start = { x: rect.x + rect.width * .29, y: rect.y + rect.height * .63, id: 1 };
            await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
            for (let i = 1; i <= 5; i++) {
              await cdp.send("Input.dispatchTouchEvent", {
                type: "touchMove", touchPoints: [{ x: start.x + i * 8, y: start.y + i * 3, id: 1 }],
              });
              await page.waitForTimeout(55);
            }
            await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            const touched = await state(page);
            assert.notEqual(touched.rotation, dragged.rotation, tag + " real touch swipe rotates globe");
            assert.notEqual(touched.coast, dragged.coast, tag + " coastline moves under touch");
          }
          await page.screenshot({ path: path.join(out, tag + "-dragged.png") });
          await page.getByRole("button", { name: lang === "ar" ? "تكبير الكرة الأرضية" : "Zoom in globe" }).click();
          await page.waitForTimeout(180);
          const zoomed = await state(page);
          assert(Number(zoomed.zoom) > Number(dragged.zoom), tag + " zoom enlarges map");
          assert.notEqual(zoomed.coast, dragged.coast, tag + " zoom also updates map projection");
          await page.getByRole("button", { name: lang === "ar" ? "إعادة الكرة الأرضية لوضعها الأول" : "Reset globe view" }).click();
          const reset = await state(page);
          assert.equal(reset.rotation, initial.rotation, tag + " reset rotation");
          assert.equal(reset.zoom, initial.zoom, tag + " reset zoom");
          assert.equal(reset.coast, initial.coast, tag + " reset geography");
          await globe.locator(".globe-beacon--egypt").focus();
          await page.keyboard.press("Enter");
          assert.equal((await state(page)).egypt.selected, "true", tag + " country focus and selection");
          await page.waitForTimeout(380);
          const labelOpacity = await globe.locator(".globe-beacon--egypt .globe-beacon-label").evaluate(e => getComputedStyle(e).opacity);
          assert(Number(labelOpacity) > .9, tag + " selected country label");
          await page.screenshot({ path: path.join(out, tag + "-selected.png") });
          const finish = await state(page);
          assert(finish.overflow <= 1, tag + " no overflow");
          assert(finish.orb.includes("globe-orbit-spin"), tag + " continuous original globe orbit");
          assert.deepEqual(errors, [], tag + " no browser, hydration, or network errors");
          console.log("PASS", tag, "rotation/drag/reprojection/zoom/reset/marker/RTL/overflow/errors");
          results.push({ tag, passed: true, initialRotation: initial.rotation, draggedRotation: dragged.rotation, zoomed: zoomed.zoom, errors });
        } finally {
          const video = page.video();
          await page.close();
          if (video) { await video.saveAs(path.join(out, tag + ".webm")); await video.delete(); }
          await ctx.close();
        }
      }
    }
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ base, results }, null, 2));
    console.log("ALL INTERACTIVE GLOBE TESTS PASSED");
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
