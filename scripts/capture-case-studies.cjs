/* Case-study capture harness: viewport + full-page screenshots of two project
   case studies in English and Arabic at desktop (1440) and mobile (390)
   widths, plus a gallery interaction check (thumb click, next button and
   arrow keys all move the counter; page must stay error-free).
   Usage: node scripts/capture-case-studies.cjs [outDir] [baseUrl] */
const { chromium } = require("@playwright/test");
const fs = require("fs");

const OUT = process.argv[2] || "screenshots/case-studies";
const BASE = process.argv[3] || "http://localhost:3000";
const SLUGS = ["dohler-cloudy-line", "ground-water"];

const settle = async (page) => {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("[data-reveal]")].every((e) =>
          e.classList.contains("in"),
        ),
      { timeout: 10000 },
    )
    .catch(() => {});
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  let failed = false;
  for (const slug of SLUGS) {
    for (const locale of ["en", "ar"]) {
      for (const [vw, vh] of [
        [1440, 900],
        [390, 844],
      ]) {
        const page = await browser.newPage({
          viewport: { width: vw, height: vh },
        });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        const res = await page.goto(
          `${BASE}/${locale}/projects/${slug}`,
          { waitUntil: "networkidle" },
        );
        if (!res || res.status() !== 200) {
          console.error(`FAIL ${locale}/${slug} status ${res && res.status()}`);
          failed = true;
        }
        await page.evaluate(() => document.fonts.ready);
        await settle(page);
        await page.screenshot({
          path: `${OUT}/${locale}-${slug}-${vw}-viewport.png`,
        });
        await page.screenshot({
          path: `${OUT}/${locale}-${slug}-${vw}-full.png`,
          fullPage: true,
        });

        /* Gallery behaviour: thumbnails, next button and arrow keys. */
        if (vw === 1440) {
          const counter = page.locator(".case-counter");
          const c0 = (await counter.textContent()).trim();
          await page.locator(".thumbnails button").nth(1).click();
          const c1 = (await counter.textContent()).trim();
          const pressed = await page
            .locator(".thumbnails button")
            .nth(1)
            .getAttribute("aria-pressed");
          await page.locator(".case-nav").nth(1).click();
          const c2 = (await counter.textContent()).trim();
          await page.locator(".case-stage").focus();
          await page.keyboard.press("ArrowLeft");
          const c3 = (await counter.textContent()).trim();
          const ok =
            c0 === "1 / 4" &&
            c1 === "2 / 4" &&
            pressed === "true" &&
            c2 === "3 / 4" &&
            c3 === "2 / 4";
          if (!ok) {
            console.error(
              `FAIL gallery ${locale}/${slug}: ${c0} -> ${c1} (${pressed}) -> ${c2} -> ${c3}`,
            );
            failed = true;
          }
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        if (overflow) {
          console.error(`FAIL overflow ${locale}/${slug}@${vw}`);
          failed = true;
        }
        if (errors.length) {
          console.error(`FAIL errors ${locale}/${slug}@${vw}:`, errors);
          failed = true;
        }
        await page.close();
      }
    }
  }
  await browser.close();
  console.log(failed ? "capture: FAILURES" : `capture: all ok -> ${OUT}`);
  process.exit(failed ? 1 : 0);
})();
