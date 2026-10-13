/* Stage 1 (hero + about) capture harness for the homepage elevation pass.
   Usage: node scripts/capture-hero-about.cjs <outDir> [BASE_URL]
   Captures EN+AR at 1440x900, 768x1024, 390x844, 360x800:
   - full hero viewport shot
   - hero atmosphere close-up (right half, where portrait/atmosphere meet)
   - SCADA faceplate element shot
   - About section element shot
   Also writes <outDir>/sheet.html contact sheet. */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || "screenshots/stage1";
const base = process.argv[3] || process.env.BASE_URL || "http://localhost:4321";
fs.mkdirSync(out, { recursive: true });
const captured = [];

const viewports = [
  [1440, 900],
  [768, 1024],
  [390, 844],
  [360, 800],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".hero h1");
      await page.waitForTimeout(1100);
      if (width <= 390) {
        const roles = await page.locator(".roles .role").evaluateAll((nodes) => {
          const container = document.querySelector(".roles").getBoundingClientRect();
          return nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { text: node.textContent, left: rect.left, right: rect.right,
              top: rect.top, bottom: rect.bottom, inside: rect.left >= container.left - 1 && rect.right <= container.right + 1,
              whiteSpace: getComputedStyle(node).whiteSpace };
          });
        });
        if (roles.length !== 3 || roles.some((r) => !r.inside || r.whiteSpace !== "nowrap")) {
          throw new Error(`${locale}@${width} roles overflow or wrap internally: ${JSON.stringify(roles)}`);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) throw new Error(`${locale}@${width} horizontal overflow: ${overflow}px`);
        console.log(`${locale}@${width}: role groups fit; ${new Set(roles.map((r) => Math.round(r.top))) .size} rows; no overflow`);
      }
      await page.screenshot({ path: `${out}/${locale}-hero-${width}.png` });
      captured.push(`${out}/${locale}-hero-${width}.png`);

      if (errors.length) {
        fs.writeFileSync(
          path.join(out, `${locale}-${width}-errors.txt`),
          errors.join("\n"),
        );
      }

      // SCADA faceplate element shot at desktop width.
      if (width === 1440) {
        const scada = await page.$(".scada");
        if (scada) {
          await scada.screenshot({
            path: `${out}/${locale}-scada-1440.png`,
          });
          captured.push(`${out}/${locale}-scada-1440.png`);
        }
      }

      // Trigger the stats' IntersectionObserver and count-up before shooting.
      await page.locator("#about .stats").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector("#about .stats")?.classList.contains("in"));
      await page.waitForTimeout(1650);
      await page.locator("#about").scrollIntoViewIfNeeded();
      const about = await page.$("#about");
      if (about) {
        await page.waitForTimeout(400);
        await about.screenshot({ path: `${out}/${locale}-about-${width}.png` });
        captured.push(`${out}/${locale}-about-${width}.png`);
      }
      await page.close();
    }
  }
  await browser.close();

  const cards = captured
    .filter((p) => fs.existsSync(p))
    .map((p) => {
      const b64 = fs.readFileSync(p).toString("base64");
      return `<figure><figcaption>${path.basename(
        p,
      )}</figcaption><img src="data:image/png;base64,${b64}" /></figure>`;
    })
    .join("\n");
  fs.writeFileSync(
    path.join(out, "sheet.html"),
    `<!doctype html><meta charset="utf-8"><title>${out}</title>
<style>body{margin:0;padding:14px;background:#11151a;color:#e6e9ee;font:13px/1.4 system-ui}
figure{margin:0 0 20px}figcaption{font:600 12px ui-monospace;color:#f1a342;margin-bottom:5px}
img{display:block;width:100%;max-width:1440px;height:auto;border:1px solid #2b3742}</style>
${cards}`,
  );
  console.log(
    "captured hero+about ->",
    out,
    `(${captured.length} screenshots + sheet.html)`,
  );
})();
