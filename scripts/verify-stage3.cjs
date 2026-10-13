/* Stage 3 verification: reveal system, data-flow motion, contact CTA,
   reduced-motion and no-JS behaviour, routes, language switching, links.
   Usage: node scripts/verify-stage3.cjs [BASE_URL]
   Exits non-zero on any failed check; prints one line per check. */
const { chromium } = require("@playwright/test");

const base = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const EMAIL = "mohamed.ah.shams@gmail.com";
let failures = 0;
const check = (name, ok, detail) => {
  if (ok) console.log(`  ok    ${name}`);
  else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
};
const scrollThrough = async (page) => {
  // Wait for hydration to attach RevealManager's IntersectionObserver. A
  // networkidle navigation can settle before the client's effect runs.
  await page.waitForFunction(
    () => document.documentElement.classList.contains("reveal-ready"),
    null,
    { timeout: 10000 },
  );
  // Move rapidly through the page without CSS smooth scrolling.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  // A 400px/70ms automated jump can skip a short target while the browser is
  // busy painting. Revisit *only* missed targets through real scrolling and
  // require their actual IntersectionObserver-driven `.in` state. This never
  // sets the class itself, so an unreachable/defective target still fails.
  const targets = page.locator("[data-reveal]");
  const count = await targets.count();
  for (let i = 0; i < count; i++) {
    const el = targets.nth(i);
    if (await el.evaluate((node) => node.classList.contains("in"))) continue;
    await el.scrollIntoViewIfNeeded();
    await page
      .waitForFunction(
        (index) => document.querySelectorAll("[data-reveal]")[index]?.classList.contains("in"),
        i,
        { timeout: 4000 },
      )
      .catch(() => {});
  }
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("[data-reveal]")].every((e) =>
          e.classList.contains("in"),
        ),
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1100);
};

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  /* ── A · Reveal + motion + CTA (JS on, real scrolling) ──────────────── */
  console.log("A · reveals, data-flow motion, contact CTA (en + ar)");
  for (const locale of ["en", "ar"]) {
    for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        permissions: ["clipboard-read", "clipboard-write"],
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      const tag = `${locale}@${w}`;

      // html gets the JS gate; the gate is added in a post-hydration effect,
      // so wait for it instead of racing networkidle (first AR load can still
      // be hydrating when the network goes quiet). Before the gate exists the
      // page simply renders unhidden — the designed no-JS/pre-hydration state.
      await page
        .waitForFunction(
          () =>
            document.documentElement.classList.contains("reveal-ready"),
          { timeout: 8000 },
        )
        .catch(() => {});
      check(
        `${tag}: reveal-ready gate set`,
        await page.evaluate(() =>
          document.documentElement.classList.contains("reveal-ready"),
        ),
      );
      if (w === 1440)
        check(
          `${tag}: flow dots paused before the diagram reveals`,
          await page.evaluate(
            () =>
              getComputedStyle(document.querySelector(".flow-dot"))
                .animationPlayState === "paused",
          ),
        );

      // scroll through: every opt-in element must end revealed
      await scrollThrough(page);
      const revealed = await page.evaluate(() => {
        const els = [...document.querySelectorAll("[data-reveal]")];
        return {
          total: els.length,
          missing: els.filter((e) => !e.classList.contains("in")).length,
          invisible: els.filter((e) => getComputedStyle(e).opacity !== "1")
            .length,
        };
      });
      check(
        `${tag}: all ${revealed.total} data-reveal elements revealed`,
        revealed.missing === 0 && revealed.invisible === 0,
        `${revealed.missing} without .in, ${revealed.invisible} still transparent`,
      );

      // motion by breakpoint: SVG dots ≥1151px, shimmering text path below
      if (w === 1440) {
        const dots = await page.evaluate(() => {
          const wrap = document.querySelector(".flow-wrap");
          const dot = document.querySelector(".flow-dot");
          return {
            wrapIn: wrap.classList.contains("in"),
            state: getComputedStyle(dot).animationPlayState,
            count: dot.getAnimations().length,
          };
        });
        check(
          `${tag}: flow dots running after reveal`,
          dots.wrapIn && dots.state === "running" && dots.count > 0,
          JSON.stringify(dots),
        );
        // globe arcs: wait out the one-shot draw (1.7s + up to 0.8s stagger)
        let arcsDrawn = true;
        try {
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll(".globe-signal")].every(
                (a) =>
                  parseFloat(getComputedStyle(a).strokeDashoffset) === 0,
              ),
            { timeout: 8000 },
          );
        } catch {
          arcsDrawn = false;
        }
        const arcs = await page.evaluate(
          () =>
            [...document.querySelectorAll(".globe-signal")].map(
              (a) => getComputedStyle(a).strokeDashoffset,
            ),
        );
        check(
          `${tag}: globe signal arcs fully drawn (3 arcs)`,
          arcsDrawn && arcs.length === 3,
          JSON.stringify(arcs),
        );
        const globe = await page.evaluate(() => ({
          node: document.querySelector(".globe-node")?.getAnimations().length ?? -1,
          orbit: document.querySelector(".globe-orbit")?.getAnimations().length ?? -1,
          pin: document.querySelector(".globe-pin")?.getAnimations().length ?? -1,
        }));
        check(
          `${tag}: globe node/orbit/pin animations live`,
          globe.node > 0 && globe.orbit > 0 && globe.pin > 0,
          `node=${globe.node} orbit=${globe.orbit} pin=${globe.pin}`,
        );
        const stepsDisplay = await page.evaluate(() =>
          getComputedStyle(document.querySelector(".flow-steps")).display,
        );
        check(
          `${tag}: text-path hidden while the SVG diagram shows`,
          stepsDisplay === "none",
          `.flow-steps display=${stepsDisplay}`,
        );
      } else if (w === 768) {
        const path = await page.evaluate(() => ({
          svg: getComputedStyle(document.querySelector(".flow-diagram")).display,
          link: getComputedStyle(document.querySelector(".flow-link"))
            .animationName,
          chipFont: parseFloat(
            getComputedStyle(document.querySelector(".flow-chip")).fontSize,
          ),
        }));
        check(
          `${tag}: text path replaces SVG and shimmers at real size`,
          path.svg === "none" &&
            /^flow-shimmer/.test(path.link) &&
            path.chipFont >= 12,
          JSON.stringify(path),
        );
      }

      // contact CTA: copy email writes the clipboard and flips the label
      const copied = locale === "ar" ? "تم النسخ" : "Copied";
      const btn = page.locator(".copy-email");
      await btn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await btn.click();
      await page.waitForTimeout(150);
      const btnText = (await btn.innerText()).trim();
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      check(
        `${tag}: copy-email flips to "${copied}" and writes clipboard`,
        btnText.includes(copied) && clip === EMAIL,
        `text="${btnText}" clipboard="${clip}"`,
      );
      await page.waitForTimeout(2200);
      const resetText = (await btn.innerText()).trim();
      check(
        `${tag}: copy-email resets after 2s`,
        !resetText.includes(copied),
        `still "${resetText}"`,
      );

      // details disclosures open; content ends fully visible
      const det = await page.evaluate(() => {
        const d = document.querySelector("details.education");
        d.open = true;
        const p = d.querySelector("p");
        return getComputedStyle(p).opacity === "1" || p.getAnimations().length > 0;
      });
      check(`${tag}: education disclosure opens`, det);

      // no JS errors, no horizontal scroll
      check(`${tag}: no page errors`, errors.length === 0, errors.join("; "));
      check(
        `${tag}: no horizontal scroll`,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      );
      await ctx.close();
    }
  }

  /* ── B · View-all seventh card ──────────────────────────────────────── */
  console.log("B · view-all expansion (en@1440)");
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${base}/en`, { waitUntil: "networkidle" });
    await page.locator(".section-heading button").click();
    await page.waitForTimeout(120);
    const count = await page.locator(".projects-grid .project-card").count();
    const anim = await page.evaluate(() => {
      const seventh = document.querySelectorAll(
        ".projects-grid .project-card",
      )[6];
      return {
        name: getComputedStyle(seventh).animationName,
        gridIn: document.querySelector(".projects-grid").classList.contains("in"),
      };
    });
    check(
      "7 cards after expansion; seventh animates in",
      count === 7 && anim.name === "details-in" && anim.gridIn,
      JSON.stringify(anim),
    );
    await page.close();
  }

  /* ── C · Reduced motion ─────────────────────────────────────────────── */
  console.log("C · prefers-reduced-motion (en + ar @1440)");
  for (const locale of ["en", "ar"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal]")];
      return {
        hidden: els.filter((e) => getComputedStyle(e).opacity !== "1").length,
        total: els.length,
        anims: document.getAnimations().length,
        progress: getComputedStyle(document.querySelector(".scroll-progress"))
          .display,
        arcOffset: getComputedStyle(document.querySelector(".globe-signal"))
          .strokeDashoffset,
      };
    });
    check(
      `${locale}: all reveal content visible without scrolling`,
      state.hidden === 0,
      `${state.hidden}/${state.total} hidden`,
    );
    check(
      `${locale}: zero running animations/transitions`,
      state.anims === 0,
      `${state.anims} running`,
    );
    check(
      `${locale}: scroll progress hidden`,
      state.progress === "none",
      state.progress,
    );
    check(
      `${locale}: globe arcs fully drawn (static)`,
      parseFloat(state.arcOffset) === 0,
      state.arcOffset,
    );
    await ctx.close();
  }

  /* ── D · No JavaScript ──────────────────────────────────────────────── */
  console.log("D · JavaScript disabled (en + ar @1440)");
  for (const locale of ["en", "ar"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      javaScriptEnabled: false,
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/${locale}`, { waitUntil: "load" });
    const state = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal]")];
      return {
        gate: document.documentElement.classList.contains("reveal-ready"),
        hidden: els.filter((e) => getComputedStyle(e).opacity !== "1").length,
        total: els.length,
        arcOffset: getComputedStyle(document.querySelector(".globe-signal"))
          .strokeDashoffset,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      };
    });
    check(
      `${locale}: no reveal gate, all content visible`,
      !state.gate && state.hidden === 0,
      `gate=${state.gate} hidden=${state.hidden}/${state.total}`,
    );
    check(
      `${locale}: globe arcs static-visible`,
      parseFloat(state.arcOffset) === 0,
      state.arcOffset,
    );
    check(
      `${locale}: no horizontal scroll`,
      state.scrollW <= state.innerW,
      `${state.scrollW} > ${state.innerW}`,
    );
    await ctx.close();
  }

  /* ── E · Routes, links, language switching ──────────────────────────── */
  console.log("E · routes, links, language switching");
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    // derive the real slugs from the page itself (the journey lists all 7)
    await page.goto(`${base}/en`, { waitUntil: "networkidle" });
    const slugs = await page.evaluate(() =>
      [...document.querySelectorAll('.career li a[href*="/projects/"]')]
        .map((a) => a.getAttribute("href").split("/projects/")[1])
        .filter((s, i, a) => a.indexOf(s) === i),
    );
    check("journey lists 7 distinct projects", slugs.length === 7, slugs.join(", "));
    const bad = [];
    for (const locale of ["en", "ar"])
      for (const slug of slugs) {
        const res = await page.request.get(`${base}/${locale}/projects/${slug}`);
        if (res.status() !== 200) bad.push(`${locale}/${slug}:${res.status()}`);
      }
    check(
      `all ${slugs.length * 2} case-study routes return 200`,
      bad.length === 0,
      bad.join(", "),
    );
    const pdf = await page.request.get(`${base}/assets/MohamedAhmedShams_CV.pdf`);
    check("CV PDF returns 200", pdf.status() === 200, String(pdf.status()));

    // language switching from home
    await page.goto(`${base}/en`, { waitUntil: "networkidle" });
    await page.locator(".language a", { hasText: "AR" }).click();
    await page.waitForURL("**/ar");
    check(
      "home: EN→AR switches URL and direction",
      (await page.locator("html").getAttribute("dir")) === "rtl",
    );
    // language switching from a case study page
    await page.goto(`${base}/ar/projects/dohler-cloudy-line`, {
      waitUntil: "networkidle",
    });
    await page.locator(".language a", { hasText: "EN" }).click();
    await page.waitForURL("**/en/projects/dohler-cloudy-line");
    check(
      "case study: AR→EN keeps the route",
      page.url().endsWith("/en/projects/dohler-cloudy-line") &&
        (await page.locator("html").getAttribute("dir")) === "ltr",
    );
    // next-project navigation from a case study
    await page.locator(".next-project a").click();
    await page.waitForTimeout(600);
    check(
      "next-project link navigates to another case study",
      /\/en\/projects\/[a-z-]+$/.test(page.url()),
      page.url(),
    );
    // back-to-top anchor exists on home
    await page.goto(`${base}/en`, { waitUntil: "networkidle" });
    check(
      "footer back-to-top anchor present",
      (await page.locator('footer a[href="#home"]').count()) === 1,
    );

    /* responsive sweep: 6 widths × 2 locales */
    console.log("F · responsive sweep");
    for (const [w, h] of [
      [1440, 900],
      [1280, 800],
      [1024, 800],
      [768, 1024],
      [390, 844],
      [360, 800],
    ]) {
      for (const locale of ["en", "ar"]) {
        const p = await browser.newPage({
          viewport: { width: w, height: h },
        });
        const errors = [];
        p.on("pageerror", (e) => errors.push(e.message));
        await p.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
        await scrollThrough(p);
        const st = await p.evaluate(() => ({
          overflow:
            document.documentElement.scrollWidth > window.innerWidth,
          missing: [...document.querySelectorAll("[data-reveal]")].filter(
            (e) => !e.classList.contains("in"),
          ).length,
          contactVisible:
            getComputedStyle(document.querySelector("#contact")).opacity ===
            "1",
        }));
        check(
          `${locale}@${w}: no overflow · all revealed · contact visible`,
          !st.overflow && st.missing === 0 && st.contactVisible && errors.length === 0,
          `overflow=${st.overflow} missing=${st.missing} errors=${errors.length}`,
        );
        await p.close();
      }
    }
    await page.close();
  }

  await browser.close();
  if (failures) {
    console.log(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log("\nAll Stage 3 checks passed.");
})();
