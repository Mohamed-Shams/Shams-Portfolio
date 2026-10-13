const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const folder = 'screenshots/stage-a-v4';
  fs.mkdirSync(folder, { recursive: true });
  const results = [];
  for (const locale of ['en', 'ar']) {
    for (const viewport of [{ width: 1440, height: 900, name: 'desktop' }, { width: 390, height: 844, name: 'mobile' }]) {
      const ctx = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      const errors = [];
      const badRequests = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('response', response => { if (response.status() >= 400) badRequests.push(`${response.status()} ${response.url()}`); });
      await page.goto(`http://localhost:3147/${locale}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(140);
      const introAtStart = await page.locator('.portfolio-intro').count();
      if (introAtStart) await page.screenshot({ path: `${folder}/${locale}-${viewport.name}-intro.png` });
      await page.waitForTimeout(1600);
      await page.screenshot({ path: `${folder}/${locale}-${viewport.name}.png`, fullPage: false });
      const introDismissed = await page.locator('.portfolio-intro').count() === 0;
      const headings = await page.locator('.hero h1').allTextContents();
      const rtl = await page.locator('html').getAttribute('dir');
      const pageWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(140);
      const introOnReload = await page.locator('.portfolio-intro').count();
      await page.locator('.hero .actions a[href="#projects"]').click();
      const sectionNavigation = await page.evaluate(() => window.location.hash === '#projects');
      const reducedCtx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const reducedPage = await reducedCtx.newPage();
      await reducedPage.goto(`http://localhost:3147/${locale}`, { waitUntil: 'domcontentloaded' });
      await reducedPage.waitForTimeout(200);
      const introReduced = await reducedPage.locator('.portfolio-intro').count();
      results.push({ locale, viewport: viewport.name, introAtStart, introDismissed, introOnReload, introReduced, sectionNavigation, headings, rtl, pageWidth, errors, badRequests });
      await reducedCtx.close();
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(err => { console.error(err); process.exitCode = 1; });
