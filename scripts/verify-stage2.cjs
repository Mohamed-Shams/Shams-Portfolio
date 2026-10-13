/* Stage 2 acceptance checks: about, skills, experience, certifications.
   Usage: node scripts/verify-stage2.cjs [BASE_URL]
   Every assertion is a measurement taken in the live page, so a regression in
   any of the four sections fails the run. Hero and projects are out of scope
   except where a shared rule could have leaked into them. */
const { chromium } = require("@playwright/test");

const base = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const viewports = [
  [1440, 900],
  [1280, 800],
  [1024, 800], // the 851–1150 band, where the cert plate and skill grid differ
  [768, 1024],
  [390, 844],
];

const failures = [];
const notes = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      await page.waitForSelector("#about h2");
      // Walk the page so lazily loaded art has actually decoded before we measure.
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);

      const tag = `${locale}@${width}`;
      const d = await page.evaluate(() => {
        const px = (n) => Math.round(n * 10) / 10;
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height), right: px(r.right), bottom: px(r.bottom) };
        };
        const cs = (el, p) => getComputedStyle(el)[p];
        const out = {};

        // ── about: stat numerals ────────────────────────────────────────────
        const strong = document.querySelector(".stats strong");
        const value = strong.querySelector("span");
        out.stat = {
          strongFs: cs(strong, "fontSize"),
          valueFs: cs(value, "fontSize"),
          valueColor: cs(value, "color"),
          valueClip: cs(value, "webkitBackgroundClip") || cs(value, "backgroundClip"),
          valueBg: cs(value, "backgroundImage").slice(0, 20),
          valueH: px(value.getBoundingClientRect().height),
          labelFs: cs(document.querySelector(".stats > div > span:last-child"), "fontSize"),
          sectionFs: (() => {
            const s = getComputedStyle(document.querySelector(".stats p")).fontSize;
            return s;
          })(),
        };

        // ── gutter alignment ────────────────────────────────────────────────
        const lead = (id) => {
          const el = document.getElementById(id);
          const kids = [...el.children];
          const xs = kids.map((k) => k.getBoundingClientRect().left);
          return px(Math.min(...xs));
        };
        out.gutters = {
          projects: lead("projects"),
          about: lead("about"),
          skills: px(document.querySelector(".tech-panel").getBoundingClientRect().left),
          experience: lead("experience"),
          certifications: lead("certifications"),
        };

        // ── skills: grid fill + title baseline ──────────────────────────────
        const tiles = [...document.querySelectorAll(".skill-tile")];
        const grid = document.querySelector(".skills-grid");
        const gb = grid.getBoundingClientRect();
        const gcs = getComputedStyle(grid);
        const colGap = parseFloat(gcs.columnGap) || 0;
        const rowGap = parseFloat(gcs.rowGap) || 0;
        const trackRows = gcs.gridTemplateRows
          .split(" ")
          .map(parseFloat)
          .filter((n) => !Number.isNaN(n));
        // Walk every row track and measure the widest uncovered span: a grid with
        // a dangling cell shows a hole wider than one column gap.
        let worstHole = 0;
        let y = 0;
        for (const h of trackRows) {
          const band = [gb.top + y, gb.top + y + h];
          const spans = tiles
            .map((t) => t.getBoundingClientRect())
            .filter((r) => r.bottom > band[0] + 1 && r.top < band[1] - 1)
            .map((r) => [r.left - gb.left, r.right - gb.left])
            .sort((a, b) => a[0] - b[0]);
          let reach = 0;
          for (const s of spans) {
            if (s[0] > reach) worstHole = Math.max(worstHole, s[0] - reach);
            reach = Math.max(reach, s[1]);
          }
          worstHole = Math.max(worstHole, gb.width - reach);
          y += h + rowGap;
        }
        const rows = {};
        for (const t of tiles) {
          const key = Math.round(t.getBoundingClientRect().top);
          rows[key] = rows[key] || [];
          rows[key].push(px(t.querySelector("h3").getBoundingClientRect().top));
        }
        out.skills = {
          tiles: tiles.length,
          cols: gcs.gridTemplateColumns.split(" ").filter(Boolean).length,
          worstHole: px(worstHole),
          holeLimit: px(colGap + 1),
          maxH3Spread: Object.values(rows).reduce(
            (m, r) => Math.max(m, Math.max(...r) - Math.min(...r)),
            0,
          ),
          umbrellaSpan: cs(tiles[tiles.length - 1], "gridColumnStart"),
          h3Fs: cs(tiles[0].querySelector("h3"), "fontSize"),
          smallFs: cs(tiles[0].querySelector("small"), "fontSize"),
        };

        // ── flow path ──────────────────────────────────────────────────────
        const svg = document.querySelector(".flow-diagram");
        const list = document.querySelector(".flow-steps");
        const svgShown = cs(svg, "display") !== "none";
        const svgW = svg.getBoundingClientRect().width;
        out.flow = {
          svgShown,
          listShown: cs(list, "display") !== "none",
          svgEffectiveLabel: px(14 * (svgW / 1080)),
          chipFs: cs(list.querySelector(".flow-chip"), "fontSize"),
          chips: list.querySelectorAll(".flow-chip").length,
        };

        // ── certifications ────────────────────────────────────────────────
        const grids = [...document.querySelectorAll(".cert-grid")];
        out.certs = grids.map((g) => {
          const cards = [...g.children];
          const hs = cards.map((c) => px(c.getBoundingClientRect().height));
          const topRow = {};
          for (const c of cards) {
            const k = Math.round(c.getBoundingClientRect().top);
            topRow[k] = (topRow[k] || 0) + 1;
          }
          return {
            cards: cards.length,
            heightSpread: px(Math.max(...hs) - Math.min(...hs)),
            rows: Object.values(topRow),
            colCount: cs(g, "gridTemplateColumns").split(" ").filter(Boolean).length,
          };
        });
        const brand = document.querySelector(".cert-brand");
        const brandImg = brand.querySelector("img");
        out.brand = {
          plate: box(brand),
          radius: cs(brand, "borderTopLeftRadius"),
          border: cs(brand, "borderTopWidth"),
          img: box(brandImg),
          natural: brandImg.naturalWidth + "x" + brandImg.naturalHeight,
          overflowY: px(brandImg.getBoundingClientRect().bottom - brand.getBoundingClientRect().bottom),
          scaleX: px(brandImg.getBoundingClientRect().width / brandImg.naturalWidth),
        };
        out.cert = {
          h3: cs(document.querySelector("#certifications .cert-card h3"), "fontSize"),
          p: cs(document.querySelector("#certifications .cert-card p"), "fontSize"),
          time: cs(document.querySelector("#certifications .cert-card time"), "fontSize"),
        };

        // ── experience ────────────────────────────────────────────────────
        const tl = document.querySelector(".timeline");
        const edu = document.querySelector(".education");
        const emp = document.querySelector(".employer");
        out.exp = {
          timelineX: px(tl.getBoundingClientRect().left),
          educationX: px(edu.getBoundingClientRect().left),
          employerW: px(emp.getBoundingClientRect().width),
          employerWordW: (() => {
            const r = document.createRange();
            r.selectNodeContents(emp.firstChild);
            return px(r.getBoundingClientRect().width);
          })(),
          smallAlign: cs(emp.querySelector("small"), "textAlign"),
          listSpanFs: cs(document.querySelector(".career li span"), "fontSize"),
          smallFs: cs(emp.querySelector("small"), "fontSize"),
        };

        // ── about composition ──────────────────────────────────────────────
        const img = document.querySelector(".about-image");
        const st = document.querySelector(".statement");
        const ib = img.getBoundingClientRect();
        const sb = st.getBoundingClientRect();
        const rtl = document.documentElement.dir === "rtl";
        out.about = {
          statementHangsOutward: rtl ? sb.left < ib.left - 1 : sb.right > ib.right + 1,
          ringInset: cs(img, "position") ? getComputedStyle(img, "::before").inset : "",
          ringBg: getComputedStyle(img, "::before").backgroundColor,
          ringBorder: getComputedStyle(img, "::before").borderTopWidth,
        };

        // ── information text below 11px in the four sections (eyebrow exempt) ──
        const tiny = [];
        for (const el of document.querySelectorAll(
          "#about *, #skills *, #experience *, #certifications *",
        )) {
          if (el.tagName === "svg" || el.closest("svg")) continue;
          if (el.childElementCount) continue;
          const t = (el.textContent || "").trim();
          if (!t) continue;
          if (el.classList.contains("eyebrow")) continue;
          const fs = parseFloat(cs(el, "fontSize"));
          if (fs < 11)
            tiny.push(`${el.tagName.toLowerCase()}.${el.className || "-"} ${fs}px "${t.slice(0, 18)}"`);
        }
        out.tiny = tiny;
        out.hScroll = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        return out;
      });

      // ── assertions ──────────────────────────────────────────────────────
      const desktop = width >= 851;
      const wide = width >= 601;
      check(d.hScroll <= 1, `${tag}: horizontal scroll ${d.hScroll}px`);
      check(errors.length === 0, `${tag}: page errors -> ${errors.join("; ")}`);

      // About numerals
      const statFs = parseFloat(d.stat.valueFs);
      check(
        statFs === parseFloat(d.stat.strongFs),
        `${tag}: stat numeral is ${d.stat.valueFs}, its <strong> is ${d.stat.strongFs}`,
      );
      check(
        desktop ? parseFloat(d.stat.valueFs) >= 40 : parseFloat(d.stat.valueFs) >= 26,
        `${tag}: stat numeral renders at ${d.stat.valueFs}`,
      );
      if (desktop) {
        check(
          d.stat.valueColor === "rgba(0, 0, 0, 0)" && /gradient/.test(d.stat.valueBg),
          `${tag}: stat numeral is not the gradient fill (${d.stat.valueColor} / ${d.stat.valueBg})`,
        );
      } else {
        check(
          d.stat.valueColor === "rgb(241, 163, 66)",
          `${tag}: stat numeral colour is ${d.stat.valueColor}`,
        );
      }
      if (wide) {
        check(
          d.about.statementHangsOutward,
          `${tag}: the statement card is not hanging off the portrait's outer edge`,
        );
      }
      check(
        d.about.ringBg === "rgba(0, 0, 0, 0)" && parseFloat(d.about.ringBorder) > 0,
        `${tag}: portrait frame is a filled slab, not a ring`,
      );
      check(parseFloat(d.stat.sectionFs) >= 11, `${tag}: stats footnote is ${d.stat.sectionFs}`);

      // Gutters
      if (desktop) {
        const target = d.gutters.projects;
        for (const k of ["about", "skills", "experience", "certifications"]) {
          check(
            Math.abs(d.gutters[k] - target) <= 1,
            `${tag}: ${k} content starts at ${d.gutters[k]}px, projects at ${target}px`,
          );
        }
      }

      // Skills
      check(d.skills.tiles === 15, `${tag}: ${d.skills.tiles} skill tiles`);
      check(
        d.skills.worstHole <= d.skills.holeLimit,
        `${tag}: ${d.skills.cols}-column skill grid has an empty span of ${d.skills.worstHole}px (limit ${d.skills.holeLimit}px)`,
      );
      // 15 tools divide evenly into three columns but not two or four, so the
      // umbrella tile spans only where it is needed to close the last row.
      check(
        d.skills.cols === 3
          ? d.skills.umbrellaSpan === "auto"
          : d.skills.umbrellaSpan === "span 2",
        `${tag}: umbrella span is "${d.skills.umbrellaSpan}" in a ${d.skills.cols}-column grid`,
      );
      check(
        d.skills.maxH3Spread <= 2,
        `${tag}: tile titles in a row differ by ${d.skills.maxH3Spread}px vertically`,
      );
      check(
        parseFloat(d.skills.h3Fs) >= (desktop ? 14 : 12),
        `${tag}: skill title is ${d.skills.h3Fs}`,
      );
      check(
        parseFloat(d.skills.smallFs) >= (desktop ? 11 : 11),
        `${tag}: skill qualifier is ${d.skills.smallFs}`,
      );

      // Flow path
      check(
        d.flow.svgShown !== d.flow.listShown,
        `${tag}: flow diagram and flow list visibility overlap`,
      );
      check(d.flow.chips === 5, `${tag}: ${d.flow.chips} flow steps`);
      if (!d.flow.svgShown) {
        check(parseFloat(d.flow.chipFs) >= 12, `${tag}: flow chip type is ${d.flow.chipFs}`);
      } else {
        check(
          d.flow.svgEffectiveLabel >= 11,
          `${tag}: SVG flow labels render at ${d.flow.svgEffectiveLabel}px`,
        );
      }

      // Certifications
      d.certs.forEach((g, i) => {
        check(
          g.heightSpread <= 1,
          `${tag}: cert grid ${i} card heights vary by ${g.heightSpread}px`,
        );
        check(
          g.rows.every((n) => n <= g.colCount),
          `${tag}: cert grid ${i} has ${g.rows.join("/")} in ${g.colCount} columns`,
        );
      });
      check(
        d.brand.overflowY <= 0.5,
        `${tag}: brand art overflows its plate by ${d.brand.overflowY}px`,
      );
      check(
        d.brand.scaleX <= 1.05,
        `${tag}: brand art is upscaled ${d.brand.scaleX}x`,
      );
      check(
        parseFloat(d.brand.border) > 0 && parseFloat(d.brand.radius) > 0,
        `${tag}: brand plate has no border/radius`,
      );
      check(parseFloat(d.cert.p) >= 11, `${tag}: cert issuer is ${d.cert.p}`);
      check(parseFloat(d.cert.time) >= 11, `${tag}: cert date is ${d.cert.time}`);

      // Experience
      check(
        Math.abs(d.exp.educationX - d.exp.timelineX) <= 1,
        `${tag}: education starts at ${d.exp.educationX}px, the timeline at ${d.exp.timelineX}px`,
      );
      if (width >= 601) {
        check(
          d.exp.employerW + 1 >= d.exp.employerWordW,
          `${tag}: employer column ${d.exp.employerW}px is narrower than the word ${d.exp.employerWordW}px`,
        );
        check(
          d.exp.smallAlign === "center",
          `${tag}: employer sub-line is ${d.exp.smallAlign}-aligned`,
        );
      }
      check(parseFloat(d.exp.listSpanFs) >= 11, `${tag}: project date is ${d.exp.listSpanFs}`);
      check(parseFloat(d.exp.smallFs) >= 11, `${tag}: employer sub-line is ${d.exp.smallFs}`);

      check(d.tiny.length === 0, `${tag}: text under 11px -> ${d.tiny.join(" | ")}`);

      notes.push(
        `${tag}: stat ${d.stat.valueFs} · gutters ${d.gutters.about}/${d.gutters.projects} · ` +
          `${d.skills.cols} cols hole ${d.skills.worstHole}px (limit ${d.skills.holeLimit}) · ` +
          `flow ${d.flow.svgShown ? "svg " + d.flow.svgEffectiveLabel + "px" : "list " + d.flow.chipFs} · ` +
          `cert spread ${d.certs.map((g) => g.heightSpread).join("/")} · brand ×${d.brand.scaleX} · tiny ${d.tiny.length}`,
      );
      await page.close();
    }
  }
  await browser.close();
  console.log(notes.join("\n"));
  if (failures.length) {
    console.error("\nFAILURES:\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("\nAll Stage 2 checks passed.");
})();
