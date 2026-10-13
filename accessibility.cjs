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
    await p.goto("http://localhost:3000/" + locale, {
      waitUntil: "networkidle",
    });
    // The one-shot scroll reveals keep below-the-fold content transparent
    // until it enters the viewport, which axe would otherwise read as a
    // contrast failure on a transient state. Walk the page, let every
    // reveal settle, then scan the final rendered state.
    await p.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += 400) {
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 70));
      }
    });
    await p.waitForFunction(
      () =>
        [...document.querySelectorAll("[data-reveal]")].every((e) =>
          e.classList.contains("in"),
        ),
      { timeout: 10000 },
    );
    await p.waitForTimeout(1200);
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
