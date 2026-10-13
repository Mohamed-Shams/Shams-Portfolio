// Lists every network response with status >= 400 on the homepage.
// Usage: node scripts/find-404s.cjs [BASE_URL]
const { chromium } = require("@playwright/test");
const base = process.argv[2] || "http://localhost:4321";
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const bad = new Map();
  for (const locale of ["en", "ar"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("response", (r) => {
      if (r.status() >= 400) bad.set(`${locale} ${r.url()}`, r.status());
    });
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    // walk the whole page so every image below the fold is requested too
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await page.waitForTimeout(1200);
    await page.close();
  }
  await browser.close();
  if (!bad.size) console.log("no 4xx/5xx responses");
  for (const [url, status] of bad) console.log(status, url);
})();
