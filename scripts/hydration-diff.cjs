// Detects hydration mismatches: fetches the server HTML and compares it with
// the post-hydration DOM for elements that commonly mismatch (framer-motion
// wrappers, images, portal hosts). Also logs every console message type.
// Usage: node scripts/hydration-diff.cjs [BASE_URL]
const { chromium } = require("@playwright/test");
const base = process.argv[2] || "http://localhost:4322";
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text().slice(0, 500)}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${String(e).slice(0, 500)}`));
  await page.goto(`${base}/en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);

  // raw SSR HTML for the same route
  const html = await page.evaluate(async (u) => {
    const r = await fetch(u, { cache: "no-store" });
    return await r.text();
  }, `${base}/en`);

  const result = await page.evaluate((ssrHtml) => {
    const ssr = new DOMParser().parseFromString(ssrHtml, "text/html");
    const sel = [".hero-copy", ".hero-copy .eyebrow", ".hero-copy h1", ".hero-copy h2", ".hero .actions", ".about-image", ".stats strong", ".scroll", ".micro"];
    const diffs = [];
    for (const s of sel) {
      const a = ssr.querySelector(s);
      const b = document.querySelector(s);
      if (!a || !b) {
        diffs.push(`${s}: missing (ssr=${!!a}, dom=${!!b})`);
        continue;
      }
      const sa = a.getAttribute("style") || "";
      const sb = b.getAttribute("style") || "";
      const norm = (v) => v.replace(/translate3d\([^)]*\)/g, "T3").replace(/translateY\([^)]*\)/g, "TY");
      if (norm(sa) !== norm(sb))
        diffs.push(`${s} style:\n  ssr: ${sa}\n  dom: ${sb}`);
      if (a.className !== b.className)
        diffs.push(`${s} class:\n  ssr: ${a.className}\n  dom: ${b.className}`);
    }
    return diffs.join("\n");
  }, html);
  console.log(result || "no structural diffs");
  console.log("\n--- console/pageerror log ---");
  console.log(logs.join("\n").slice(0, 3000) || "(none)");
  await browser.close();
})();
