/* Visual verification captures for the design pass. */
const { chromium } = require("@playwright/test");

const base = "http://localhost:3000";
const out = "screenshots/refine";
const fs = require("fs");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const shots = [
    ["en", 1440, 900, "hero"],
    ["ar", 1440, 900, "hero"],
    ["en", 1280, 800, "hero"],
    ["ar", 1280, 800, "hero"],
    ["en", 768, 1024, "hero"],
    ["ar", 768, 1024, "hero"],
    ["en", 390, 844, "hero"],
    ["ar", 390, 844, "hero"],
    ["en", 360, 800, "hero"],
    ["ar", 360, 800, "hero"],
  ];
  for (const [locale, width, height, kind] of shots) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".hero h1");
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${locale}-${kind}-${width}.png` });
    if (width === 1440) {
      await page.screenshot({ path: `${out}/${locale}-about-1440.png`, fullPage: false });
      await page.evaluate(() => document.getElementById("about").scrollIntoView());
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${locale}-section-about.png` });
      await page.evaluate(() => document.getElementById("projects").scrollIntoView());
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${locale}-section-projects.png` });
      await page.evaluate(() => document.getElementById("contact").scrollIntoView());
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${locale}-section-contact.png` });
    }
    await page.close();
  }
  await browser.close();
  console.log("done");
})();

/* Extra pass: case study + section captures */
(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const fs = require("fs");
  fs.mkdirSync("screenshots/refine", { recursive: true });
  for (const locale of ["en", "ar"]) {
    for (const [width, tag] of [[1440, "d"], [390, "m"]]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
      await page.goto(`http://localhost:3000/${locale}/projects/dohler-cloudy-line`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `screenshots/refine/case-${locale}-${tag}.png` });
      await page.goto(`http://localhost:3000/${locale}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      for (const sec of ["projects", "skills", "experience"]) {
        await page.evaluate((id) => document.getElementById(id).scrollIntoView(), sec);
        await page.waitForTimeout(450);
        await page.screenshot({ path: `screenshots/refine/sec-${sec}-${locale}-${tag}.png` });
      }
      await page.close();
    }
  }
  await browser.close();
  console.log("sections done");
})();
