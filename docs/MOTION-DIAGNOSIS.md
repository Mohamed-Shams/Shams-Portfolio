# V5 Motion Diagnosis — why the site feels static (P0)

Date: 2026-10-14 · Branch: `feature/v5-cinematic-motion` · Probes: `scripts/motion-probe.cjs`, `scripts/motion-probe2.cjs`

## 1. Deployment is NOT the problem

Fresh fetch of `https://shams-portfolio.mshams0174.workers.dev/en`:

- 9 script chunks; markers found in deployed JS: `portfolio-intro`, `shams-portfolio-intro-v4`, `motion-ready`, `data-reveal`.
- Deployed CSS `787516b63c287266.css` contains the reveal + intro rules.

The V4 animation code is live. The static feel is behavioral.

## 2. Measured first-visit timeline (fresh headless Chromium, 1440×900)

| t (ms) | event |
|---|---|
| 0–1060 | Server HTML painted. Hero h1 is **opacity:0 inline** (Framer `initial` styles are SSR-rendered), intro overlay does not exist yet, no `.reveal-ready`. The visitor sees a **complete static page with an invisible hero headline**. |
| ~1178 | Hydration completes (`readyState=interactive`, DCL 1060 ms). **Only now** does the intro mount, sessionStorage is written, `reveal-ready` appears. |
| ~2155 | `heroReady` fires (hydration + 1030 ms); hero stagger starts. |
| ~2600 | Intro dismiss timer (hydration + 1430 ms) → 0.3 s fade. |

Probe runs showed hydration landing between **1.2 s and >3.2 s** (in one fresh run the intro had still not appeared at 3.2 s). Every animation clock starts at hydration, so on a cold Worker/3G the "cinematic intro" begins after the visitor has already been staring at a static page.

## 3. Root causes (ordered by impact)

1. **Everything is gated on hydration.** Intro, hero, and reveal system all mount client-side. First 1–3+ seconds are guaranteed static by construction.
2. **The intro is a blink.** Visible span = 1430 ms − hero overlap + 0.3 s exit. Old portfolio ran a **~3.5–4 s** GSAP timeline (verified in its bundle: `blur(10px)` content entrance → 2 s progress bar → exit scale 0.95, plus a 5.5 s safety timeout).
3. **Any `pointerdown` kills the intro instantly** — including the window-focus click a user makes when opening the site. Listeners attach with `capture: true` on `window` and fire from the very first frame after hydration.
4. **All section reveals are identical 16 px / 0.6 s one-shots** (`fidelity.css` `[data-reveal]`), and grids (projects, skills, certs, timeline, contact) animate as **one block** because a single wrapper carries `data-reveal`. Perceptually: nothing moves.
5. **Zero scroll-linked motion.** No parallax, no scroll-driven timeline progress, no sticky choreography. Framer Motion only powers the hero + scroll hairline.
6. **Above-fold reveals can fire before they are watched** — IO fires on mount for in-view elements, and `reveal-ready` lands at hydration, so the first sections are already settled when the user scrolls.
7. `?motionPreview` did not exist; `sessionStorage["shams-portfolio-intro-v4"]` blocks replay, and any URL hash skips the intro entirely — visual testing was effectively impossible on the live site.

## 4. What the old site actually did (reference extracted from its live bundle)

`shams-systems` repo is private/404; its deployed bundle contains the full preloader: GSAP timeline, spotlight + centered glow orb, breathing 112 px logo badge with `pulse-glow` + outer ring, name + uppercase tracking-widest "Systems Engineer", 0→100 % counter with "Loading %" readout, four corner frame marks, exit = content lift → root fade + scale 0.95. Total ≈ 3.5–4 s. The new V5 preloader recreates this shape in 5 scenes at 1.8–2.2 s with a first-paint start.

## 5. V5 architecture decision

- **First-paint intro**: a tiny inline bootstrap script (runs before first paint) decides once, synchronously: play / skip (reduced motion, session seen, URL hash) / `?motionPreview=1` force-replay. It stamps `data-intro-play` + `data-intro-t0` on `<html>` and pre-writes sessionStorage, so the cinematic overlay renders in the **server HTML** and animates from first paint — not from hydration.
- **CSS owns entrance choreography** (intro scenes, hero stagger, section reveals, ambient loops): animates at paint, zero hydration dependency, trivially reduced-motion-able.
- **Framer Motion owns interactivity and scroll**: skills filter re-layout (`AnimatePresence`/`layout` + `layoutId` pill), experience-timeline scroll progress (`useScroll`, index-only state updates), interactive hover feedback. No GSAP: every required effect is covered; a second runtime would duplicate observers and fight over the same properties.
- **Clocks are anchored to `data-intro-t0`**, so late hydration joins the running timeline instead of restarting it.
