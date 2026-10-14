"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Cinematic first-paint intro, inspired by the original portfolio's longer
 * GSAP handoff. A deliberate ~3.4-second story is visible on each hard reload
 * of the homepage, while client-side project navigation never remounts it.
 *
 * An inline bootstrap script in the root layout decides synchronously,
 * before the page paints, whether the intro plays at all and stamps
 * `data-intro-play` + `data-intro-t0` (ms epoch) on <html>. The overlay
 * below is part of the server HTML, so its CSS scene animations begin at
 * first paint instead of waiting for hydration. React joins the running
 * timeline on mount: every timer is anchored to data-intro-t0, never to
 * "now", so late hydration continues the sequence instead of restarting
 * it. Decisions (homepage route / reduced motion / URL hash / preview) all
 * happen in the bootstrap script; this component only follows
 * `data-intro-play`.
 */

const SESSION_KEY = "shams-portfolio-intro-v5";
const HERO_MS = 2470; // hero begins while the title is still visible
const EXIT_MS = 2750; // overlay lifts after the main intro scene has played
const CLEANUP_MS = 3440; // graceful exit completes, scrolling unlocks
const GRACE_MS = 1250; // window-focus clicks must not cancel the identity reveal
const EXIT_FADE_MS = 690; // matches the CSS root exit timing

export function PortfolioIntro({
  locale,
  onFinished,
}: {
  locale: "en" | "ar";
  onFinished: (ready: boolean) => void;
}) {
  const [gone, setGone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [pct, setPct] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0Attr = Number(html.getAttribute("data-intro-t0")) || Date.now();

    const finish = () => {
      if (!finished.current) {
        finished.current = true;
        onFinished(true);
      }
    };
    const cleanupDom = () => {
      html.removeAttribute("data-intro-play");
      html.classList.remove("intro-lock");
    };

    // No intro (reduced motion, deep link, stale bfcache):
    // reveal the page immediately and drop the SSR overlay.
    if (
      reduce ||
      !html.hasAttribute("data-intro-play") ||
      Date.now() - t0Attr > 4500
    ) {
      cleanupDom();
      finish();
      setGone(true);
      return;
    }

    html.classList.add("intro-lock");
    const elapsed = () => Date.now() - t0Attr;
    const at = (ms: number) => Math.max(0, ms - elapsed());
    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    // Decorative progress is explicitly labelled "Preparing experience" and
    // synchronized with its CSS sweep (0.95s → 2.6s from first paint).
    let raf = 0;
    const tick = () => {
      if (cancelled) return;
      const p = Math.min(1, Math.max(0, (elapsed() - 950) / 1650));
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    schedule(finish, at(HERO_MS));
    schedule(() => setExiting(true), at(EXIT_MS));
    schedule(() => {
      cleanupDom();
      setGone(true);
    }, at(CLEANUP_MS));

    // The greeting is decorative: real interaction intent skips the rest.
    // Armed only after GRACE_MS so the window-focus click that often lands
    // on a freshly opened tab does not erase the intro before it is seen.
    let armed = false;
    const armT = window.setTimeout(() => {
      armed = true;
    }, at(GRACE_MS));
    const dismiss = () => {
      if (!armed || cancelled || finished.current) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.clearTimeout(armT);
      finish();
      setExiting(true);
      schedule(() => {
        cleanupDom();
        setGone(true);
      }, EXIT_FADE_MS);
    };
    window.addEventListener("keydown", dismiss, true);
    window.addEventListener("pointerdown", dismiss, true);
    // A casual scroll attempt should not silently cancel the short intro.
    // Keyboard/pointer intent can still dismiss after the grace period.

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.clearTimeout(armT);
      window.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("pointerdown", dismiss, true);
      html.classList.remove("intro-lock");
    };
  }, [onFinished]);

  if (gone) return null;
  return (
    <div
      className={"portfolio-intro" + (exiting ? " intro-exit" : "")}
      aria-hidden="true"
    >
      <div className="intro-spotlight" />
      <div className="intro-orb" />
      <div className="portfolio-intro-rings" />
      <svg
        className="portfolio-intro-signals"
        viewBox="0 0 840 520"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M0 156H224L272 204H342M840 365H627L590 328H496" />
        <path d="M0 318H174L222 270H310M840 168H688L624 232H540" />
        <circle cx="342" cy="204" r="3" />
        <circle cx="496" cy="328" r="3" />
        <circle cx="310" cy="270" r="3" />
        <circle cx="540" cy="232" r="3" />
      </svg>
      <span className="intro-frame tl" />
      <span className="intro-frame tr" />
      <span className="intro-frame bl" />
      <span className="intro-frame br" />
      <div className="portfolio-intro-content">
        <div className="intro-badge">
          <span className="intro-badge-ring" />
          <b className="intro-mark">MS</b>
        </div>
        <strong className="intro-name">
          {locale === "ar" ? "محمد أحمد شمس" : "Mohamed Ahmed Shams"}
        </strong>
        <span className="intro-role">
          {locale === "ar"
            ? "مهندس أنظمة · سكادا · إنترنت الأشياء الصناعي"
            : "Systems Engineer | SCADA | Industrial IoT"}
        </span>
        <div className="intro-progress">
          <div className="portfolio-intro-line">
            <i />
          </div>
          <div className="intro-progress-meta">
            <span>
              {locale === "ar" ? "جارٍ تجهيز التجربة" : "Preparing experience"}
            </span>
            <b className="intro-pct">{pct}%</b>
          </div>
        </div>
      </div>
    </div>
  );
}
