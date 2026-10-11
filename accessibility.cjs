const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs");
(async () => {
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const results = [];
  for (const locale of ["en", "ar"]) {
    const context = await b.newContext({
      viewport: { width: 390, height: 844 },
    });
    const p = await context.newPage();
    await p.goto("http://localhost:3000/" + locale);
    const r = await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    results.push({
      locale,
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
    await p.close();
  }
  fs.writeFileSync(
    "screenshots/accessibility.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await b.close();
})();
