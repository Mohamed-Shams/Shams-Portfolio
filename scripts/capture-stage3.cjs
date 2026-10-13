/* Stage 3 capture harness: every section + case study + full page.
   Usage: node scripts/capture-stage3.cjs <outDir> [BASE_URL]
   Writes one element screenshot per section per locale per viewport plus a
   full-page shot and the flagship case study, then <outDir>/sheet.html: a
   self-contained contact sheet (images inlined as data URIs). */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || "screenshots/stage3";
const base = process.argv[3] || process.env.BASE_URL || "http://localhost:3000";
fs.mkdirSync(out, { recursive: true });
const captured = [];

const viewports = [
  [1440, 900],
  [768, 1024],
  [390, 844],
];
const sections = [
  "home",
  "about",
  "projects",
  "skills",
  "experience",
  "certifications",
  "contact",
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
      await page.waitForSelector("#about h2");
      // Element screenshots otherwise paint the fixed header and the scroll
      // hairline across the middle of every section.
      await page.addStyleTag({
        content: ".header,.scroll-progress{display:none !important}",
      });
      // Walk the page so every reveal fires and lazily loaded art decodes.
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 450) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, 0);
        await Promise.all(
          [...document.images]
            .filter((i) => !i.complete)
            .map((i) => new Promise((res) => { i.onload = i.onerror = res; })),
        );
      });
      await page.waitForTimeout(900);
      for (const id of sections) {
        const el = await page.$(id === "home" ? ".hero" : "#" + id);
        if (!el) continue;
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        const file =
          id === "home"
            ? `${out}/${locale}-hero-${width}.png`
            : `${out}/${locale}-${id}-${width}.png`;
        await el.screenshot({ path: file });
        captured.push(file);
      }
      // Full page for overall rhythm.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const full = `${out}/${locale}-full-${width}.png`;
      await page.screenshot({ path: full, fullPage: true });
      captured.push(full);
      await page.close();

      // Flagship case study at desktop width only.
      if (width === 1440) {
        const cs = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: 1,
        });
        await cs.goto(`${base}/${locale}/projects/dohler-cloudy-line`, {
          waitUntil: "networkidle",
        });
        await cs.addStyleTag({
          content: ".header,.scroll-progress{display:none !important}",
        });
        await cs.waitForTimeout(900);
        const file = `${out}/${locale}-case-study-${width}.png`;
        await cs.screenshot({ path: file, fullPage: true });
        captured.push(file);
        await cs.close();
      }
    }
    // Readability reference: contact at 2x on a phone.
    const zoom = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    await zoom.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    await zoom.addStyleTag({
      content: ".header,.scroll-progress{display:none !important}",
    });
    await zoom.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 450) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
    });
    await zoom.waitForTimeout(800);
    const el = await zoom.$("#contact");
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await zoom.waitForTimeout(600);
      const file = `${out}/${locale}-contact-390@2x.png`;
      await el.screenshot({ path: file });
      captured.push(file);
    }
    await zoom.close();
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
    "captured stage3 ->",
    out,
    `(${captured.length} screenshots + sheet.html)`,
  );
})();
