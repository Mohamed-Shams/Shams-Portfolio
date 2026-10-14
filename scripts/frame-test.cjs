const { chromium } = require("@playwright/test");
const OUT = "C:\\Users\\mohamed.shams\\AppData\\Roaming\\AutoClaw-oversea-official\\accounts\\a0fc35bc57291d09225c40a360927e63689615f38c4f8525b454473e5b316dad\\projects\\Default\\scratch\\frames";
const fs = require("fs");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3001/en?motionPreview=1", { waitUntil: "commit" });
  const t0 = Date.now();
  for (const t of [300, 700, 1000, 1300, 1700, 2100, 2400, 2900, 3600]) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    try { await page.screenshot({ path: OUT + "\\en-" + String(t).padStart(4, "0") + ".png" }); }
    catch (e) { console.log("shot fail " + t + ": " + String(e).slice(0, 140)); }
  }
  console.log("frames: " + fs.readdirSync(OUT).length);
  await browser.close();
})();