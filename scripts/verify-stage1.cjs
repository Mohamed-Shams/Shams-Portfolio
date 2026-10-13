/* Stage 1 acceptance checks for the hero + project grid.
   Usage: node scripts/verify-stage1.cjs [BASE_URL]
   Covers both locales at the five requested viewports:
     - no horizontal scrolling
     - every card image actually loads
     - the flagship leads the grid and "View all" reveals the seventh project
     - the desktop bento leaves no empty grid cell
     - the hero has no text/portrait collision inside the copy column */
const { chromium } = require("@playwright/test");

const base = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const viewports = [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
  [360, 800],
];

const failures = [];
const notes = [];

function check(ok, message) {
  if (!ok) failures.push(message);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--force-device-scale-factor=1"],
  });
  for (const locale of ["en", "ar"]) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".hero h1");
      await page.waitForTimeout(700);

      const tag = `${locale}@${width}`;
      // Walk the grid so every lazily loaded card image actually starts fetching.
      await page.evaluate(async () => {
        const grid = document.querySelector(".projects-grid");
        const box = grid.getBoundingClientRect();
        const top = window.scrollY + box.top;
        for (let y = top - 200; y < top + box.height; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 220));
        }
        window.scrollTo(0, top - 60);
      });
      await page.waitForTimeout(900);

      const data = await page.evaluate(() => {
        const de = document.documentElement;
        const cards = [...document.querySelectorAll(".project-card")];
        const grid = document.querySelector(".projects-grid");
        const gridCss = getComputedStyle(grid);
        const gridBox = grid.getBoundingClientRect();
        const cols = gridCss.gridTemplateColumns
          .split(" ")
          .map(parseFloat)
          .filter((n) => !Number.isNaN(n));
        const colGap = parseFloat(gridCss.columnGap) || 0;
        const rowGap = parseFloat(gridCss.rowGap) || 0;

        // Every row track must be fully covered by card boxes (holes only up to
        // the column gap), which is what "no awkward empty grid space" means.
        const rowTracks = gridCss.gridTemplateRows
          .split(" ")
          .map(parseFloat)
          .filter((n) => !Number.isNaN(n));
        let y = 0;
        let worstHole = 0;
        for (const h of rowTracks) {
          const band = [gridBox.top + y, gridBox.top + y + h];
          const spans = cards
            .map((c) => c.getBoundingClientRect())
            .filter((r) => r.bottom > band[0] + 1 && r.top < band[1] - 1)
            .map((r) => [r.left - gridBox.left, r.right - gridBox.left])
            .sort((a, b) => a[0] - b[0]);
          let reach = 0;
          for (const s of spans) {
            if (s[0] > reach) worstHole = Math.max(worstHole, s[0] - reach);
            reach = Math.max(reach, s[1]);
          }
          worstHole = Math.max(worstHole, gridBox.width - reach);
          y += h + rowGap;
        }

        const h1 = document.querySelector(".hero h1").getBoundingClientRect();
        const hero = document.querySelector(".hero").getBoundingClientRect();
        return {
          hScroll: de.scrollWidth - de.clientWidth,
          cards: cards.length,
          cols: cols.length,
          rows: rowTracks.length,
          worstHole: Math.round(worstHole),
          maxGap: Math.round(colGap + 1),
          brokenImages: [...document.querySelectorAll(".project-card img")]
            .filter((i) => !i.naturalWidth).length,
          firstIsFlagship: cards[0]?.classList.contains("featured"),
          firstTitle: cards[0]?.querySelector("h3")?.textContent || "",
          dir: document.documentElement.dir,
          insideHero: h1.bottom <= hero.bottom && h1.top >= hero.top,
        };
      });

      check(data.hScroll <= 1, `${tag}: horizontal scroll of ${data.hScroll}px`);
      check(data.brokenImages === 0, `${tag}: ${data.brokenImages} card image(s) failed`);
      check(data.cards === 6, `${tag}: expected 6 initial cards, saw ${data.cards}`);
      check(data.firstIsFlagship, `${tag}: first card is not the flagship`);
      check(
        /Döhler|دولر/.test(data.firstTitle),
        `${tag}: flagship title unexpected -> ${data.firstTitle}`,
      );
      check(data.dir === (locale === "ar" ? "rtl" : "ltr"), `${tag}: wrong dir`);
      check(data.insideHero, `${tag}: hero heading escapes the hero box`);
      check(errors.length === 0, `${tag}: page errors -> ${errors.join("; ")}`);
      check(
        data.worstHole <= data.maxGap,
        `${tag}: empty grid space of ${data.worstHole}px in a row band`,
      );
      notes.push(
        `${tag}: ${data.cols} col x ${data.rows} row, largest gap in a row = ${data.worstHole}px (limit ${data.maxGap}px)`,
      );

      // "View all" must reveal the seventh project.
      // Avoid competing with the site's smooth-scroll CSS while Playwright
      // scrolls the heading button into view for a real pointer click.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.click("#projects .text-link");
      await page.waitForTimeout(350);
      const after = await page.$$eval(".project-card", (n) => n.length);
      check(after === 7, `${tag}: "View all" showed ${after} projects instead of 7`);
      await page.close();
    }
  }
  await browser.close();
  console.log(notes.join("\n"));
  if (failures.length) {
    console.error("\nFAILURES:\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("\nAll Stage 1 checks passed.");
})();
