/* Focused visual capture for project-media consistency.
   Usage: node scripts/capture-project-media.cjs [outDir] [baseUrl]
   Captures EN/AR at 1440x900 and 390x844:
   - expanded homepage project gallery
   - About signature context
   - primary gallery image for every case study
   - one English desktop full-page reference */
const { chromium } = require("@playwright/test");
const fs = require("fs");

const OUT = process.argv[2] || "screenshots/project-media";
const BASE = process.argv[3] || "http://127.0.0.1:4321";
const SLUGS = [
  "dohler-cloudy-line",
  "ncec-air-quality",
  "ground-water",
  "modon-poc",
  "drilling-equipment",
  "water-network",
  "modon-testing",
];
const VIEWPORTS = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
];

const waitForImages = async (locator) => {
  const images = locator.locator("img");
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (img) => {
      await img.decode();
      const rect = img.getBoundingClientRect();
      if (!img.complete || !img.naturalWidth || !img.naturalHeight || !rect.width || !rect.height ||
          getComputedStyle(img).visibility === "hidden" || getComputedStyle(img).opacity === "0") {
        throw new Error(`Invalid image: ${img.currentSrc}`);
      }
    });
  }
};

const revealPage = async (page) => {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 520) {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 55));
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  });
  await page.waitForTimeout(500);
};

const stabilizeCapture = (page) =>
  page.addStyleTag({
    content: `
      .header,.scroll-progress,.skip-link{visibility:hidden!important}
      [data-reveal]{opacity:1!important;transform:none!important;transition:none!important}
    `,
  });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const files = [];

  for (const locale of ["en", "ar"]) {
    for (const [label, width, height] of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      const projects = page.locator("#projects");
      await projects.scrollIntoViewIfNeeded();
      await page.evaluate(() =>
        document
          .querySelector("#projects .projects-grid")
          ?.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await waitForImages(projects);
      const chromeStyle = await stabilizeCapture(page);
      const featuredFile = `${locale}-${label}-projects-featured.png`;
      await projects.screenshot({ path: `${OUT}/${featuredFile}` });
      files.push(featuredFile);

      const toggle = projects.locator(".text-link");
      if ((await toggle.getAttribute("aria-expanded")) === "false") {
        await toggle.click();
      }
      await page.waitForTimeout(350);
      await waitForImages(projects);
      const projectsFile = `${locale}-${label}-projects.png`;
      await projects.screenshot({ path: `${OUT}/${projectsFile}` });
      files.push(projectsFile);

      const signature = page.locator("#about .signature");
      await signature.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await waitForImages(signature);
      const about = page.locator("#about .about-copy");
      const signatureFile = `${locale}-${label}-signature.png`;
      await about.screenshot({ path: `${OUT}/${signatureFile}` });
      files.push(signatureFile);
      await chromeStyle.evaluate((style) => style.remove());

      if (locale === "en" && label === "desktop") {
        await revealPage(page);
        const fullFile = "en-desktop-full.png";
        await page.screenshot({ path: `${OUT}/${fullFile}`, fullPage: true });
        files.push(fullFile);
      }
      await page.close();

      for (const slug of SLUGS) {
        const detail = await browser.newPage({ viewport: { width, height } });
        await detail.goto(`${BASE}/${locale}/projects/${slug}`, {
          waitUntil: "networkidle",
        });
        await detail.evaluate(() => document.fonts.ready);
        const stage = detail.locator(".case-stage");
        await stage.scrollIntoViewIfNeeded();
        await detail.waitForTimeout(400);
        await waitForImages(stage);
        const detailChrome = await stabilizeCapture(detail);
        const file = `${locale}-${label}-${slug}-primary.png`;
        await stage.screenshot({ path: `${OUT}/${file}` });
        files.push(file);
        await detailChrome.evaluate((style) => style.remove());
        await detail.close();
      }
    }
  }

  await browser.close();
  const tiles = files
    .map(
      (file) =>
        `<figure><img src="${file}" loading="lazy"><figcaption>${file}</figcaption></figure>`,
    )
    .join("\n");
  fs.writeFileSync(
    `${OUT}/sheet.html`,
    `<!doctype html><meta charset="utf-8"><title>Project media captures</title><style>body{margin:24px;background:#081018;color:#d9e3ea;font:13px system-ui}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px}figure{margin:0;background:#101922;padding:10px;border-radius:10px}img{display:block;width:100%;height:auto;border-radius:6px}figcaption{padding-top:8px}</style><main>${tiles}</main>`,
  );
  console.log(`project-media captures: ${files.length} -> ${OUT}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
