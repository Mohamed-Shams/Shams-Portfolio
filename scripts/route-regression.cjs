// Quick Stage-1 regression check: every case-study route (7 slugs x EN/AR)
// returns 200 with zero console/page errors, home + CV still 200.
// Usage: node scripts/route-regression.cjs [BASE_URL]
const { chromium } = require("@playwright/test");
const base = process.argv[2] || "http://localhost:4321";
const slugs = [
  "ncec-air-quality",
  "dohler-cloudy-line",
  "ground-water",
  "modon-poc",
  "drilling-equipment",
  "water-network",
  "modon-testing",
];
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  let fail = 0;
  for (const locale of ["en", "ar"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    for (const slug of slugs) {
      const url = `${base}/${locale}/projects/${slug}`;
      const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
      const ok = resp && resp.status() === 200;
      if (!ok || errors.length) {
        fail++;
        console.log(`FAIL ${url} status=${resp && resp.status()} ${errors.slice(0, 3).join(" | ")}`);
      }
      // gallery interaction: click next, confirm counter changed
      const counterText = await page
        .locator(".case-counter")
        .textContent()
        .catch(() => "");
      await page.locator(".case-nav").nth(1).click().catch(() => {});
      await page.waitForTimeout(250);
      const after = await page
        .locator(".case-counter")
        .textContent()
        .catch(() => "");
      if (!counterText || counterText === after) {
        console.log(`WARN gallery nav unchanged on ${slug} (${locale})`);
      }
    }
    // home + CV
    await page.goto(`${base}/${locale}`, { waitUntil: "domcontentloaded" });
    console.log(`${locale}: home ${page.url().includes(locale) ? "ok" : "FAIL"}`);
    const cv = await page.request.get(`${base}/assets/MohamedAhmedShams_CV.pdf`);
    console.log(`${locale}: cv ${cv.status()}`);
    if (cv.status() !== 200) fail++;
    await page.close();
  }
  await browser.close();
  console.log(fail ? `${fail} FAILURES` : "all case-study routes ok, no errors");
  if (fail) process.exitCode = 1;
})();
