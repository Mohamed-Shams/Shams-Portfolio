/* Locate the actual face pixels inside the hero portrait per locale/viewport. */
const { chromium } = require("@playwright/test");
const sharp = null; // not available; use PIL offline instead

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/" + locale, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `screenshots/refine/face-${locale}.png` });
    await page.close();
  }
  await browser.close();
  console.log("captured");
})();
