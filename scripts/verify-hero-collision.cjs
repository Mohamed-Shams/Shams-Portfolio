/* Verify no hero text collides with the portrait face in either locale. */
const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const results = {};
  for (const locale of ["en", "ar"]) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({ viewport });
      await page.goto("http://localhost:3000/" + locale, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const data = await page.evaluate(() => {
        const copy = document.querySelector(".hero-copy").getBoundingClientRect();
        const h1 = document.querySelector(".hero h1").getBoundingClientRect();
        const h2 = document.querySelector(".hero h2").getBoundingClientRect();
        const actions = document.querySelector(".hero .actions").getBoundingClientRect();
        const portrait = document.querySelector(".hero-portrait").getBoundingClientRect();
        const eyebrow = document.querySelector(".hero .eyebrow").getBoundingClientRect();
        // Face occupies roughly the central-upper band of the portrait. Assume
        // face box: portrait center ±15% width, top 10%..55% height.
        const face = {
          x0: portrait.x + portrait.width * 0.35,
          x1: portrait.x + portrait.width * 0.65,
          y0: portrait.y + portrait.height * 0.1,
          y1: portrait.y + portrait.height * 0.55,
        };
        const textRects = (el) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          return [...r.getClientRects()].map((x) => ({
            l: x.left,
            r: x.right,
            t: x.top,
            b: x.bottom,
          }));
        };
        const h1Rects = textRects(document.querySelector(".hero h1"));
        const h2Rects = textRects(document.querySelector(".hero h2"));
        const eyebrowRects = textRects(document.querySelector(".hero .eyebrow"));
        const descRects = textRects(document.querySelector(".hero-description"));
        const rolesRects = textRects(document.querySelector(".roles"));
        const overlapOne = (rects) =>
          rects.some((r) => !(r.r < face.x0 || r.l > face.x1 || r.b < face.y0 || r.t > face.y1));
        const actionsFaceOverlap = (() => {
          const f = { x0: face.x0, x1: face.x1, y0: face.y0 + 80, y1: face.y1 };
          const rr = { l: actions.left, r: actions.right, t: actions.top, b: actions.bottom };
          return !(rr.r < f.x0 || rr.l > f.x1 || rr.b < f.y0 || rr.t > f.y1);
        })();
        const overflowX =
          document.documentElement.scrollWidth > window.innerWidth;
        return {
          copy: { l: Math.round(copy.left), r: Math.round(copy.right) },
          h1: { l: Math.round(h1.left), r: Math.round(h1.right), t: Math.round(h1.top) },
          h2: { l: Math.round(h2.left), r: Math.round(h2.right) },
          actions: { l: Math.round(actions.left), r: Math.round(actions.right) },
          portrait: { l: Math.round(portrait.left), r: Math.round(portrait.right) },
          face: { x0: Math.round(face.x0), x1: Math.round(face.x1) },
          overflowFace:
            overlapOne(h1Rects) ||
            overlapOne(h2Rects) ||
            overlapOne(eyebrowRects) ||
            overlapOne(descRects) ||
            overlapOne(rolesRects) ||
            actionsFaceOverlap,
          overflowX,
        };
      });
      results[`${locale}-${viewport.width}`] = data;
      await page.close();
    }
  }
  await browser.close();
  const failed = Object.entries(results).filter(
    ([k, v]) => v.overflowFace || v.overflowX,
  );
  console.log(JSON.stringify(results, null, 1));
  if (failed.length) {
    console.error("FAILURES:", failed.map(([k]) => k).join(", "));
    process.exit(1);
  }
  console.log("ALL CLEAR");
})();
