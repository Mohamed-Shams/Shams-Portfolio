/* Lightweight contact globe visual QA against a built Cloudflare preview.
   Usage: $env:MOTION_URL='http://127.0.0.1:4322'; node scripts/contact-globe-qa.cjs
   Recorded videos and screenshots are kept under ignored screenshots/. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const BASE = (process.env.MOTION_URL || 'http://127.0.0.1:4322').replace(/\/$/, '');
const OUT = path.resolve('screenshots/contact-globe-qa');
fs.mkdirSync(OUT, { recursive: true });

async function sample(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('svg.globe-art');
    const beacon = (name) => {
      const group = document.querySelector('.globe-beacon[data-country="' + name + '"]');
      const center = new DOMPoint(0, 0).matrixTransform(group.getScreenCTM());
      const ring = group.querySelector('.globe-beacon-ripple');
      return {
        x: center.x, y: center.y,
        ringTransform: getComputedStyle(ring).transform,
        ringAnimation: getComputedStyle(ring).animationName,
        label: group.querySelector('.globe-beacon-label').textContent,
        aria: group.getAttribute('aria-label'),
      };
    };
    const traveller = document.querySelector('.globe-region-traveller');
    const travellerPosition = new DOMPoint(0, 0).matrixTransform(traveller.getScreenCTM());
    return {
      egypt: beacon('egypt'), saudi: beacon('saudi'),
      svgLabel: svg.getAttribute('aria-label'),
      regionTrailAnimation: getComputedStyle(document.querySelector('.globe-region-trail')).animationName,
      travellerCount: document.querySelectorAll('.globe-region-traveller animateMotion').length,
      traveller: { x: travellerPosition.x, y: travellerPosition.y },
      orbitAnimation: getComputedStyle(document.querySelector('.globe-orbit')).animationName,
      overflow: document.documentElement.scrollWidth - innerWidth,
      dir: document.documentElement.dir,
      svgWidth: svg.getBoundingClientRect().width,
    };
  });
}

(async () => {
  const executablePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const records = [];
  try {
    for (const lang of ['en', 'ar']) for (const [width, height] of [[1440, 900], [390, 844]]) {
      const tag = lang + '-' + (width === 1440 ? 'desktop' : 'mobile');
      const context = await browser.newContext({
        viewport: { width, height }, reducedMotion: 'no-preference',
        recordVideo: { dir: OUT, size: { width, height } },
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      try {
        await page.goto(BASE + '/' + lang, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() =>
          !document.documentElement.hasAttribute('data-intro-play') &&
          !document.querySelector('.portfolio-intro'), null, { timeout: 12000 });
        // The globe breathes continuously, so Playwright's stable-element
        // scroll action never settles. Scroll the stable section in page JS.
        await page.locator('#contact').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(500);
        const a = await sample(page);
        await page.screenshot({ path: path.join(OUT, tag + '-initial.png') });
        await page.waitForTimeout(650);
        const b = await sample(page);
        await page.screenshot({ path: path.join(OUT, tag + '-motion.png') });
        assert(a.egypt.x < a.saudi.x, tag + ' Egypt must be west of Saudi Arabia');
        for (const loc of [a.egypt, a.saudi]) {
          assert(loc.x > 0 && loc.x < width, tag + ' beacon must be within viewport: ' + JSON.stringify(loc));
          assert(loc.ringAnimation.includes('globe-beacon-ripple'), tag + ' ripple runs');
        }
        assert.notEqual(a.egypt.ringTransform, b.egypt.ringTransform, tag + ' ring must actually move');
        assert(Math.hypot(a.traveller.x - b.traveller.x, a.traveller.y - b.traveller.y) > 1,
          tag + ' glowing signal must travel on regional arc');
        assert(a.regionTrailAnimation.includes('globe-region-flow'), tag + ' connection flows');
        assert(a.orbitAnimation.includes('globe-orbit-spin'), tag + ' globe orbits');
        assert.equal(a.travellerCount, 1, tag + ' travelling signal');
        assert(a.overflow <= 1 && b.overflow <= 1, tag + ' no horizontal overflow');
        assert.equal(a.dir, lang === 'ar' ? 'rtl' : 'ltr', tag + ' RTL direction');
        assert.equal(a.egypt.label, lang === 'ar' ? 'مصر' : 'Egypt');
        assert.equal(a.saudi.label, lang === 'ar' ? 'السعودية' : 'Saudi Arabia');
        await page.locator('.globe-beacon--egypt').focus();
        await page.waitForTimeout(340);
        const focusOpacity = await page.locator('.globe-beacon--egypt .globe-beacon-label')
          .evaluate(e => Number(getComputedStyle(e).opacity));
        assert(focusOpacity > .9, tag + ' keyboard focus reveals country label');
        await page.screenshot({ path: path.join(OUT, tag + '-focused.png') });
        await page.waitForTimeout(750);
        assert.deepEqual(errors, [], tag + ' browser/network errors');
        records.push({ tag, a, b, focusOpacity, errors, pass: true });
        console.log('PASS', tag, 'beacons visible, rings animated, connection active, keyboard label, no overflow');
      } finally {
        const video = page.video();
        await page.close();
        if (video) {
          await video.saveAs(path.join(OUT, tag + '.webm'));
          await video.delete();
        }
        await context.close();
      }
    }
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, records }, null, 2));
    fs.writeFileSync(path.join(OUT, 'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Contact Globe — Egypt and Saudi Arabia</title>' +
      '<style>body{background:#080d12;color:#eef4f8;font:16px system-ui;max-width:1100px;margin:auto;padding:20px}' +
      'h1,h2{color:#f1a342}section{margin:32px 0;padding-top:18px;border-top:1px solid #35475b}' +
      'video{max-width:100%;max-height:700px}img{max-width:100%;height:auto;border:1px solid #35475b}</style>' +
      '<h1>Contact globe — live SVG motion review</h1><p>Egypt and Saudi Arabia beacons, animated link, English/Arabic desktop/mobile.</p>' +
      records.map(r => '<section><h2>' + r.tag + '</h2><video controls playsinline preload="metadata" src="' +
        r.tag + '.webm"></video><p><img src="' + r.tag + '-focused.png" alt="Focused beacon — ' +
        r.tag + '"></p></section>').join('') + '</html>');
    console.log('PASS: contact globe across EN/AR desktop/mobile');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error('FAIL:', e); process.exitCode = 1; });
