const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto("http://localhost:3000/ar", { waitUntil: "domcontentloaded" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "screenshots/ar-mobile-review.png" });
  await b.close();
})();
