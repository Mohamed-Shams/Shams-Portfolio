/* Stage 2 measurement audit: about, skills, experience, certifications.
   Usage: node scripts/audit-stage2.cjs [BASE_URL]
   Prints one block per locale/viewport with the numbers that drive the visual
   judgement (geometry, sub-11px text, ragged rows, clipped copy, overflow). */
const { chromium } = require("@playwright/test");

const base = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const viewports = [
  [1440, 900],
  [768, 1024],
  [390, 844],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  for (const locale of ["en", "ar"]) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      await page.waitForSelector("#about h2");
      // Walk the page first: measuring before scroll left lazy art undecoded and
      // gave elements stale rects (a section's "left overflow" read as -160px).
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);

      const report = await page.evaluate(() => {
        const px = (n) => Math.round(n * 10) / 10;
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return {
            x: px(r.left),
            y: px(r.top + window.scrollY),
            w: px(r.width),
            h: px(r.height),
          };
        };
        const sec = (id) => document.getElementById(id);
        const out = {};

        // Elements rendering text below 11px, grouped by selector shape.
        const tiny = {};
        for (const el of document.querySelectorAll(
          "#about *, #skills *, #experience *, #certifications *",
        )) {
          if (!el.childElementCount || el.tagName === "svg") {
            const text = (el.textContent || "").trim();
            if (!text) continue;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (fs < 11) {
              const key =
                el.tagName.toLowerCase() +
                (el.className && typeof el.className === "string"
                  ? "." + el.className.split(" ").filter(Boolean).join(".")
                  : "");
              tiny[key] = tiny[key] || { px: fs, count: 0, sample: text.slice(0, 34) };
              tiny[key].count++;
            }
          }
        }
        out.tinyText = tiny;

        // Per-section geometry + inner overflow.
        out.sections = {};
        for (const id of ["about", "skills", "experience", "certifications"]) {
          const el = sec(id);
          if (!el) continue;
          const r = rect(el);
          // Zero-area rects are excluded: anything inside a closed <details> (and
          // any display:none element) reports 0,0, which read as a bogus
          // "-160px left overflow" on the sections that hold a <details>.
          const boxes = [...el.querySelectorAll("*")]
            .map((c) => c.getBoundingClientRect())
            .filter((b) => b.width > 0 && b.height > 0);
          const minLeft = Math.min(...boxes.map((b) => b.left));
          const maxRight = Math.max(...boxes.map((b) => b.right));
          out.sections[id] = {
            ...r,
            overflowRight: px(maxRight - (el.getBoundingClientRect().right + 1)),
            overflowLeft: px(el.getBoundingClientRect().left - minLeft + 1),
          };
        }

        // About: does the floating statement / image frame escape the section?
        const st = document.querySelector(".statement");
        const ai = document.querySelector(".about-image");
        const about = sec("about");
        if (st && ai && about) {
          const s = st.getBoundingClientRect();
          const a = ai.getBoundingClientRect();
          const ab = about.getBoundingClientRect();
          out.about = {
            image: { w: px(a.width), h: px(a.height) },
            statement: { w: px(s.width), h: px(s.height) },
            statementInsideSection:
              s.left >= ab.left - 1 && s.right <= ab.right + 1,
            statementOverlapsImage:
              s.left < a.right - 1 && s.right > a.left + 1 && s.top < a.bottom - 1,
            statsLabelLines: [
              ...document.querySelectorAll(".stats span"),
            ].map((n) => Math.round(n.getBoundingClientRect().height / 15)),
            statsTopGap: px(
              document.querySelector(".stats").getBoundingClientRect().top -
                (document.querySelector(".about-copy") || ab).getBoundingClientRect().bottom,
            ),
            copyColumn: (() => {
              const c = document.querySelector(".about-copy").getBoundingClientRect();
              return { w: px(c.width), h: px(c.height) };
            })(),
            imageBottomVsSectionBottom: px(
              ab.bottom - document.querySelector(".about-image").getBoundingClientRect().bottom,
            ),
          };
        }

        // Skills: grid shape, uneven tiles, clipped text, diagram fit.
        const grid = document.querySelector(".skills-grid");
        const tiles = [...document.querySelectorAll(".skill-tile")];
        if (grid) {
          const gs = getComputedStyle(grid);
          out.skills = {
            tiles: tiles.length,
            gridCols: gs.gridTemplateColumns.split(" ").length,
            cols: gs.gridTemplateColumns
              .split(" ")
              .filter((s) => s && s !== "none").length,
            tileHeights: [...new Set(tiles.map((t) => px(t.getBoundingClientRect().height)))],
            tileWidth: tiles.length ? px(tiles[0].getBoundingClientRect().width) : 0,
            clipped: tiles.flatMap((t) =>
              [...t.querySelectorAll("h3, small")].filter(
                (n) => n.scrollWidth > n.clientWidth + 1,
              ).map((n) => (n.textContent || "").trim().slice(0, 40)),
            ),
            symbolSizes: [
              ...new Set(
                [...document.querySelectorAll(".tech-symbol")].map(
                  (n) => getComputedStyle(n).fontSize,
                ),
              ),
            ],
            symbolBoxes: [
              ...new Set(
                [...document.querySelectorAll(".tech-symbol")].map((n) => {
                  const r = n.getBoundingClientRect();
                  return px(r.width) + "x" + px(r.height);
                }),
              ),
            ],
            filters: [...document.querySelectorAll(".filters button")].map((b) => ({
              label: (b.textContent || "").trim(),
              w: px(b.getBoundingClientRect().width),
              pressed: b.getAttribute("aria-pressed") === "true",
            })),
            filtersPerRow: (() => {
              const rows = {};
              for (const b of document.querySelectorAll(".filters button")) {
                const y = Math.round(b.getBoundingClientRect().top);
                rows[y] = (rows[y] || 0) + 1;
              }
              return Object.values(rows);
            })(),
            lastRowFilled: (() => {
              const ys = {};
              for (const t of tiles) {
                const y = Math.round(t.getBoundingClientRect().top);
                ys[y] = (ys[y] || 0) + 1;
              }
              return Object.values(ys);
            })(),
            flow: (() => {
              const f = document.querySelector(".flow-wrap svg");
              if (!f) return null;
              const r = f.getBoundingClientRect();
              return { w: px(r.width), h: px(r.height) };
            })(),
            panel: (() => {
              const p = document.querySelector(".tech-panel");
              const r = p.getBoundingClientRect();
              return { w: px(r.width), pad: getComputedStyle(p).padding };
            })(),
          };
        }

        // Experience: timeline grid, employer type block, list rhythm.
        const tl = document.querySelector(".timeline");
        if (tl) {
          const cs = getComputedStyle(tl);
          const emp = document.querySelector(".employer").getBoundingClientRect();
          const items = [...document.querySelectorAll(".career li")];
          out.experience = {
            cols: cs.gridTemplateColumns,
            gap: cs.gap,
            employer: { w: px(emp.width), h: px(emp.height) },
            employerFont: getComputedStyle(document.querySelector(".employer")).fontSize,
            items: items.length,
            itemHeights: [...new Set(items.map((i) => px(i.getBoundingClientRect().height)))],
            railHeight: px(tl.getBoundingClientRect().height),
            educationLeft: px(
              document.querySelector(".education").getBoundingClientRect().left -
                document.getElementById("experience").getBoundingClientRect().left,
            ),
            h2Size: getComputedStyle(
              document.querySelector("#experience h2"),
            ).fontSize,
          };
          // Does the longest project title wrap onto two lines?
          out.experience.titleLines = items.map((i) => ({
            t: (i.querySelector("a")?.textContent || "").trim().slice(0, 28),
            lines: i.querySelector("a")
              ? Math.round(
                  i.querySelector("a").getBoundingClientRect().height /
                    parseFloat(getComputedStyle(i.querySelector("a")).lineHeight || 16),
                )
              : 0,
          }));
        }

        // Certifications: card grid, brand art fit, ragged last row.
        const cg = document.querySelector(".cert-grid");
        if (cg) {
          const cards = [...document.querySelectorAll("#certifications .cert-grid")[0].children];
          const brands = [...document.querySelectorAll(".cert-brand img")];
          out.certs = {
            cols: getComputedStyle(cg).gridTemplateColumns.split(" ").filter(Boolean).length,
            cards: cards.length,
            cardHeights: [...new Set(cards.map((c) => px(c.getBoundingClientRect().height)))],
            rows: (() => {
              const ys = {};
              for (const c of cards) {
                const y = Math.round(c.getBoundingClientRect().top);
                ys[y] = (ys[y] || 0) + 1;
              }
              return Object.values(ys);
            })(),
            brands: brands.map((b) => {
              const r = b.getBoundingClientRect();
              return {
                src: b.currentSrc.split("/").pop(),
                box: px(r.width) + "x" + px(r.height),
                natural: b.naturalWidth + "x" + b.naturalHeight,
                ratioDrift:
                  Math.round(
                    (Math.abs(
                      b.naturalWidth / b.naturalHeight - r.width / r.height,
                    ) /
                      (b.naturalWidth / b.naturalHeight)) *
                      100,
                  ) + "%",
              };
            }),
            titleHeights: [...document.querySelectorAll("#certifications .cert-card h3")].map(
              (h) => Math.round(h.getBoundingClientRect().height),
            ),
            trainingCount: document.querySelectorAll(".training .cert-card").length,
          };
        }
        return out;
      });

      console.log(`\n########## ${locale} @ ${width} ##########`);
      console.log(JSON.stringify(report, null, 1));
      await page.close();
    }
  }
  await browser.close();
})();
