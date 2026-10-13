const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  /* Stage 3 reveal system: below-the-fold content is transparent until it
     enters the viewport. Walk each page (instant steps) so every one-shot
     reveal fires and lazily loaded art decodes before any screenshot or
     geometry read; otherwise section captures come out blank. */
  const settle = async (page) => {
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += 400) {
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 70));
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
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
  };
  const report = [];
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["laptop", 1280, 800],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["small-mobile", 360, 800],
  ]) {
    for (const locale of ["en", "ar"]) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`http://localhost:3000/${locale}`, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      await settle(page);
      await page.screenshot({
        path: `screenshots/${locale}-${name}.png`,
        fullPage: true,
      });
      await page.screenshot({ path: `screenshots/${locale}-${name}-hero.png` });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      report.push({
        locale,
        name,
        overflow,
        errors,
        dir: await page.locator("html").getAttribute("dir"),
      });
      if (name === "desktop") {
        for (const section of [
          "about",
          "projects",
          "skills",
          "experience",
          "certifications",
          "contact",
        ]) {
          await page
            .locator(`#${section}`)
            .screenshot({ path: `screenshots/${locale}-${section}.png` });
        }
        await page.locator(".section-heading button").click();
        if ((await page.locator(".project-card").count()) !== 7)
          throw Error("project expansion");
        await page.locator(".filters button").nth(2).click();
        if ((await page.locator(".skill-tile").count()) !== 3)
          throw Error("filter");
        for (const link of await page
          .locator(".project-card")
          .evaluateAll((links) => links.map((l) => l.href))) {
          const response = await page.request.get(link);
          if (response.status() !== 200) throw Error(link);
        }
        await page.goto(
          `http://localhost:3000/${locale}/projects/dohler-cloudy-line`,
        );
        await page.evaluate(() => document.fonts.ready);
        await settle(page);
        await page.screenshot({
          path: `screenshots/${locale}-case-study.png`,
          fullPage: true,
        });
        await page.locator(".thumbnails button").nth(1).click();
        if (
          (await page
            .locator(".thumbnails button")
            .nth(1)
            .getAttribute("aria-pressed")) !== "true"
        )
          throw Error("gallery");
      }
      if (name === "mobile") {
        await page.locator(".menu").click();
        if (!(await page.locator(".nav").isVisible())) throw Error("menu");
        await page.locator(".nav a").nth(1).click();
        if (
          (await page.locator(".menu").getAttribute("aria-expanded")) !==
          "false"
        )
          throw Error("menu close");
        await page
          .locator(".language a")
          .filter({ hasText: locale === "en" ? "AR" : "EN" })
          .click();
        await page.waitForURL("**/" + (locale === "en" ? "ar" : "en"));
      }
      const pdf = await page.request.get(
        "http://localhost:3000/assets/MohamedAhmedShams_CV.pdf",
      );
      if (pdf.status() !== 200) throw Error("CV");
      await page.close();
    }
  }
  fs.writeFileSync(
    "screenshots/validation.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
