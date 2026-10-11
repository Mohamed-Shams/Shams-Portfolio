/* Final QA pass: full-page + hero captures across 6 sizes x 2 locales. */
const { chromium } = require("@playwright/test");
const fs = require("fs");

const base = "http://localhost:3000";
const out = "screenshots/final";
fs.mkdirSync(out, { recursive: true });

const sizes = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 800],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    for (const [w, h] of sizes) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      // fire all reveals so full-page shot isn't blank below the fold
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/${locale}-full-${w}.png`, fullPage: true });
      await page.screenshot({ path: `${out}/${locale}-hero-${w}.png` });
      // overflow check
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      if (overflow) console.log(`OVERFLOW: ${locale} ${w}x${h}`);
      await page.close();
    }
    // case study at desktop + mobile
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto(`${base}/${locale}/projects/dohler-cloudy-line`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/${locale}-case-${w}.png`, fullPage: true });
      await page.close();
    }
  }
  await browser.close();
  console.log("captures complete");
})();
