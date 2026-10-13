/* Stage 1 (hero + project grid) capture harness.
   Usage: node scripts/capture-stage1.cjs <outDir> [BASE_URL]
   BASE_URL defaults to http://localhost:3000 so it matches the other scripts.
   Also writes <outDir>/sheet.html: a self-contained contact sheet (images
   inlined as data URIs) so a whole before/after pass can be reviewed in one
   request without a second static file server. */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || "screenshots/stage1";
const base = process.argv[3] || process.env.BASE_URL || "http://localhost:3000";
fs.mkdirSync(out, { recursive: true });
const captured = [];

const viewports = [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
  [360, 800],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".hero h1");
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/${locale}-hero-${width}.png` });
      captured.push(`${out}/${locale}-hero-${width}.png`);

      // Hero atmosphere close-up (seam inspection) at desktop widths only.
      if (width >= 1280) {
        await page.screenshot({
          path: `${out}/${locale}-hero-detail-${width}.png`,
          clip: { x: 0, y: 430, width: Math.min(760, width), height: 400 },
        });
        captured.push(`${out}/${locale}-hero-detail-${width}.png`);
      }

      // Projects section, clipped to its own box so the grid fills the frame.
      const box = await page.evaluate(() => {
        const el = document.getElementById("projects");
        if (!el) return null;
        el.scrollIntoView({ block: "start" });
        return null;
      });
      void box;
      await page.waitForTimeout(600);
      const grid = await page.$("#projects");
      if (grid) {
        await grid.screenshot({ path: `${out}/${locale}-projects-${width}.png` });
        captured.push(`${out}/${locale}-projects-${width}.png`);
      }

      // Grid-only shot at 1x and 2x for sharpness review.
      const gridOnly = await page.$(".projects-grid");
      if (gridOnly) {
        await gridOnly.screenshot({
          path: `${out}/${locale}-grid-${width}.png`,
        });
        captured.push(`${out}/${locale}-grid-${width}.png`);
      }
      await page.close();

      if (width === 1440) {
        const page2 = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: 2,
        });
        await page2.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
        await page2.waitForTimeout(700);
        const g2 = await page2.$(".projects-grid");
        if (g2) {
          await g2.screenshot({ path: `${out}/${locale}-grid-1440@2x.png` });
          captured.push(`${out}/${locale}-grid-1440@2x.png`);
        }
        await page2.close();
      }
    }
  }
  await browser.close();

  const cards = captured
    .filter((p) => fs.existsSync(p))
    .map((p) => {
      const b64 = fs.readFileSync(p).toString("base64");
      return `<figure><figcaption>${path.basename(p)}</figcaption><img src="data:image/png;base64,${b64}" /></figure>`;
    })
    .join("\n");
  fs.writeFileSync(
    path.join(out, "sheet.html"),
    `<!doctype html><meta charset="utf-8"><title>${out}</title>
<style>body{margin:0;padding:14px;background:#11151a;color:#e6e9ee;font:13px/1.4 system-ui}
figure{margin:0 0 20px}figcaption{font:600 12px ui-monospace;color:#f1a342;margin-bottom:5px}
img{display:block;width:100%;max-width:1440px;height:auto;border:1px solid #2b3742}</style>
${cards}`,
  );
  console.log("captured stage1 ->", out, `(${captured.length} screenshots + sheet.html)`);
})();
