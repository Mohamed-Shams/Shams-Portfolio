/* Small axe audit of key production layouts; outputs actionable elements. */
const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const path = require("node:path");
const BASE = (process.env.MOTION_URL || "http://127.0.0.1:4322").replace(/\/$/, "");
const OUT = path.resolve("screenshots/final-polish-accessibility.json");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true,
  });
  const results = [];
  try {
    for (const locale of ["en", "ar"]) for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
      const page = await context.newPage();
      await page.goto(BASE + "/" + locale, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro-play"), null,
        { timeout: 12000 });
      await page.evaluate(() => document.fonts.ready);
      const report = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
      const issues = report.violations.map(v => ({
        id: v.id, impact: v.impact, description: v.help, count: v.nodes.length,
        first: v.nodes.slice(0,4).map(n => ({ target: n.target, summary: n.failureSummary })),
      }));
      results.push({ locale, width, issues });
      console.log("AXE", locale, width, "violations", issues.length, JSON.stringify(issues).slice(0, 3800));
      await page.close();
      await context.close();
    }
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
