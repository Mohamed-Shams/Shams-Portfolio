const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.AUDIT_URL || "https://shams-portfolio.mshams0174.workers.dev";
const dir = path.resolve("screenshots/motion-v4-live-audit");
fs.mkdirSync(dir, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  const records = [];
  for (const [name, locale, motion] of [
    ["english-first", "en", "no-preference"],
    ["arabic-first", "ar", "no-preference"],
    ["reduced-first", "en", "reduce"],
  ]) {
    const context = await browser.newContext({ reducedMotion: motion, viewport: {width: 1440,height: 900} });
    const page = await context.newPage();
    const errors = [], scripts = [], requests = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", e => {if (e.type() === "error") errors.push(e.text());});
    page.on("requestfailed", req => requests.push(req.url() + " " + req.failure()?.errorText));
    page.on("response", res => {
      if (res.status() >= 400) requests.push(res.status() + " " + res.url());
      if (res.url().includes("/_next/static/chunks/") && res.url().endsWith(".js")) scripts.push(res.url());
    });
    await page.goto(base + "/" + locale, {waitUntil:"domcontentloaded", timeout:45000});
    await page.waitForTimeout(380);
    const early = await page.evaluate(() => ({
      intro: !!document.querySelector(".portfolio-intro"),
      hero: getComputedStyle(document.querySelector(".hero h1")).opacity,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      session: sessionStorage.getItem("shams-portfolio-intro-v4"),
    }));
    await page.screenshot({path:path.join(dir,name+"-early.png")});
    await page.waitForTimeout(1700);
    const settled = await page.evaluate(() => ({
      intro: !!document.querySelector(".portfolio-intro"),
      hero: getComputedStyle(document.querySelector(".hero h1")).opacity,
      session: sessionStorage.getItem("shams-portfolio-intro-v4"),
    }));
    await page.screenshot({path:path.join(dir,name+"-settled.png")});
    let matching = [];
    for(const url of scripts.filter((x,i,arr)=>arr.indexOf(x)===i).slice(0,20)){
      try{
        const body = await (await context.request.get(url)).text();
        if(body.includes("shams-portfolio-intro-v4") || body.includes("portfolio-intro")) matching.push({url, hasKey:body.includes("shams-portfolio-intro-v4"), hasClass:body.includes("portfolio-intro")});
      } catch(e) { errors.push("asset scan: "+String(e));}
    }
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForTimeout(300);
    const revisit = await page.evaluate(()=>({intro:!!document.querySelector(".portfolio-intro"),session:sessionStorage.getItem("shams-portfolio-intro-v4")}));
    records.push({name,locale,motion,early,settled,revisit,matching,scriptCount:scripts.length,errors,requests});
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(dir,"audit.json"),JSON.stringify({url:base,records},null,2));
  console.log(JSON.stringify({url:base,records},null,2));
})().catch(err=>{console.error(err);process.exitCode=1;});
