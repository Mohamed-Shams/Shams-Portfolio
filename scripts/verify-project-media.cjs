/* Acceptance checks for shared project covers and signature.
   Usage: node scripts/verify-project-media.cjs [baseUrl] */
const { chromium } = require("@playwright/test");

const BASE = process.argv[2] || "http://127.0.0.1:4321";
const SLUGS = [
  "dohler-cloudy-line",
  "ncec-air-quality",
  "ground-water",
  "modon-poc",
  "drilling-equipment",
  "water-network",
  "modon-testing",
];
const failures = [];
const check = (value, message) => {
  if (!value) failures.push(message);
};

const canonicalSource = (url) => {
  const parsed = new URL(url, BASE);
  return parsed.pathname === "/_next/image"
    ? decodeURIComponent(parsed.searchParams.get("url") || "")
    : parsed.pathname;
};

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });

  for (const locale of ["en", "ar"]) {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      const failedResponses = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
      const projects = page.locator("#projects");
      await projects.scrollIntoViewIfNeeded();
      const grid = projects.locator(".projects-grid");
      await grid.scrollIntoViewIfNeeded();
      await page
        .waitForFunction(
          () => document.querySelector("#projects .projects-grid")?.classList.contains("in"),
          null,
          { timeout: 10000 },
        )
        .catch(() => {});
      const toggle = projects.locator(".text-link");
      if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
      await page.waitForTimeout(400);

      const expandedVisual = await grid.evaluate((grid) => ({
        className: grid.className,
        expanded: grid.getAttribute("data-expanded"),
        opacity: Number.parseFloat(getComputedStyle(grid).opacity),
      }));
      check(expandedVisual.className.includes("in"), `${locale}@${width}: expanded grid lost reveal class`);
      check(expandedVisual.expanded === "true", `${locale}@${width}: expanded state attribute missing`);
      check(expandedVisual.opacity > 0.9, `${locale}@${width}: expanded grid opacity ${expandedVisual.opacity}`);

      const cards = projects.locator(".project-card");
      check((await cards.count()) === 7, `${locale}@${width}: expected seven project cards`);
      for (const slug of SLUGS) {
        const expected = `/assets/projects/${slug}/cover.webp`;
        const card = projects.locator(`a[href$="/projects/${slug}"]`);
        const image = card.locator(".project-cover-image");
        check((await image.count()) === 1, `${locale}@${width}/${slug}: homepage cover missing`);
        if (await image.count()) {
          const current = canonicalSource(await image.evaluate((img) => img.currentSrc || img.src));
          check(current === expected, `${locale}@${width}/${slug}: homepage source ${current}`);
        }
      }

      const signature = page.locator("#about .signature img");
      await signature.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const signatureSrc = canonicalSource(await signature.evaluate((img) => img.currentSrc || img.src));
      check(signatureSrc === "/assets/signature.svg", `${locale}@${width}: signature source ${signatureSrc}`);
      const signatureNatural = await signature.evaluate((img) => [img.naturalWidth, img.naturalHeight]);
      check(signatureNatural[0] === 1104 && signatureNatural[1] === 264, `${locale}@${width}: signature intrinsic ${signatureNatural.join("x")}`);
      check(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
        `${locale}@${width}: homepage horizontal overflow`,
      );
      check(errors.length === 0, `${locale}@${width}: page errors ${errors.join(" | ")}`);
      check(failedResponses.length === 0, `${locale}@${width}: failed responses ${failedResponses.join(" | ")}`);
      await page.close();

      for (const slug of SLUGS) {
        const detail = await browser.newPage({ viewport: { width, height } });
        const detailErrors = [];
        const detailFailed = [];
        detail.on("pageerror", (e) => detailErrors.push(String(e)));
        detail.on("console", (message) => {
          if (message.type() === "error") detailErrors.push(message.text());
        });
        detail.on("response", (response) => {
          if (response.status() >= 400) detailFailed.push(`${response.status()} ${response.url()}`);
        });
        const response = await detail.goto(`${BASE}/${locale}/projects/${slug}`, {
          waitUntil: "networkidle",
        });
        check(response?.status() === 200, `${locale}@${width}/${slug}: route ${response?.status()}`);
        const expected = `/assets/projects/${slug}/cover.webp`;
        const stageImage = detail.locator(".case-stage .case-cover-image");
        check((await stageImage.count()) === 1, `${locale}@${width}/${slug}: primary cover missing`);
        if (await stageImage.count()) {
          const current = canonicalSource(await stageImage.evaluate((img) => img.currentSrc || img.src));
          check(current === expected, `${locale}@${width}/${slug}: detail source ${current}`);
        }

        const thumbs = detail.locator(".thumbnails button");
        check((await thumbs.count()) === 4, `${locale}@${width}/${slug}: expected four thumbnails`);
        const firstThumbImage = thumbs.first().locator("img");
        if (await firstThumbImage.count()) {
          const current = canonicalSource(await firstThumbImage.evaluate((img) => img.currentSrc || img.src));
          check(current === expected, `${locale}@${width}/${slug}: first thumbnail source ${current}`);
        } else {
          check(false, `${locale}@${width}/${slug}: first thumbnail cover missing`);
        }

        const counter = detail.locator(".case-counter");
        check((await counter.textContent()).trim() === "1 / 4", `${locale}@${width}/${slug}: initial counter`);
        await detail.locator(".case-stage").focus();
        await detail.keyboard.press("ArrowRight");
        check((await counter.textContent()).trim() === "2 / 4", `${locale}@${width}/${slug}: ArrowRight`);
        await detail.keyboard.press("ArrowLeft");
        check((await counter.textContent()).trim() === "1 / 4", `${locale}@${width}/${slug}: ArrowLeft`);
        check(
          !(await detail.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `${locale}@${width}/${slug}: horizontal overflow`,
        );
        check(detailErrors.length === 0, `${locale}@${width}/${slug}: errors ${detailErrors.join(" | ")}`);
        check(detailFailed.length === 0, `${locale}@${width}/${slug}: failed responses ${detailFailed.join(" | ")}`);
        await detail.close();
      }
    }
  }

  const requestPage = await browser.newPage();
  for (const slug of SLUGS) {
    const url = `${BASE}/assets/projects/${slug}/cover.webp`;
    const response = await requestPage.request.get(url);
    check(response.status() === 200, `${slug}: direct cover HTTP ${response.status()}`);
    check(
      (response.headers()["content-type"] || "").startsWith("image/webp"),
      `${slug}: direct cover MIME ${response.headers()["content-type"]}`,
    );
  }
  const signatureResponse = await requestPage.request.get(`${BASE}/assets/signature.svg`);
  check(signatureResponse.status() === 200, `signature: HTTP ${signatureResponse.status()}`);
  check(
    (signatureResponse.headers()["content-type"] || "").includes("image/svg+xml"),
    `signature: MIME ${signatureResponse.headers()["content-type"]}`,
  );
  await requestPage.close();
  await browser.close();

  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`${failures.length} project-media failures`);
    process.exit(1);
  }
  console.log("project-media: all shared-cover, gallery, signature, asset and responsive checks passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
