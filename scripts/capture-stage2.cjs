/* Stage 2 (about, skills, experience, certifications) capture harness.
   Usage: node scripts/capture-stage2.cjs <outDir> [BASE_URL]
   Writes one element screenshot per section per locale per viewport, plus
   <outDir>/sheet.html: a self-contained contact sheet (images inlined as data
   URIs) so a whole before/after pass can be reviewed in one request. */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || "screenshots/stage2";
const base = process.argv[3] || process.env.BASE_URL || "http://localhost:3000";
fs.mkdirSync(out, { recursive: true });
const captured = [];

const viewports = [
  [1440, 900],
  [768, 1024],
  [390, 844],
];
const sections = ["about", "skills", "experience", "certifications"];

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
      await page.waitForSelector("#about h2");
      // Element screenshots otherwise paint the fixed header and the scroll
      // hairline across the middle of every section, which reads as damage.
      await page.addStyleTag({
        content: ".header,.scroll-progress{display:none !important}",
      });
      // Walk the page so lazily loaded art has decoded before capturing.
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
        await Promise.all(
          [...document.images]
            .filter((i) => !i.complete)
            .map((i) => new Promise((res) => { i.onload = i.onerror = res; })),
        );
      });
      await page.waitForTimeout(800);
      for (const id of sections) {
        const el = await page.$("#" + id);
        if (!el) continue;
        await el.scrollIntoViewIfNeeded();
        // Let the one-shot reveal transition settle before capturing.
        await page.waitForTimeout(700);
        const file = `${out}/${locale}-${id}-${width}.png`;
        await el.screenshot({ path: file });
        captured.push(file);
      }
      // Readability reference: the smallest copy in these sections at 2x.
      if (width === 390) {
        await page.close();
        const zoom = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: 2,
        });
        await zoom.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
        await zoom.addStyleTag({
          content: ".header,.scroll-progress{display:none !important}",
        });
        await zoom.evaluate(async () => {
          const h = document.documentElement.scrollHeight;
          for (let y = 0; y < h; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 70));
          }
          window.scrollTo(0, 0);
        });
        await zoom.waitForTimeout(800);
        const el = await zoom.$("#about");
        if (el) {
          await el.scrollIntoViewIfNeeded();
          await zoom.waitForTimeout(600);
          const file = `${out}/${locale}-about-390@2x.png`;
          await el.screenshot({ path: file });
          captured.push(file);
        }
        await zoom.close();
      } else {
        await page.close();
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
  console.log(
    "captured stage2 ->",
    out,
    `(${captured.length} screenshots + sheet.html)`,
  );
})();
