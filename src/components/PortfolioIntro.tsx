"use client";

import { useEffect, useRef, useState } from "react";

/*
 * V5 cinematic intro — five scenes, ~2.05 s, starts at FIRST PAINT.
 *
 * An inline bootstrap script in the root layout decides synchronously,
 * before the page paints, whether the intro plays at all and stamps
 * `data-intro-play` + `data-intro-t0` (ms epoch) on <html>. The overlay
 * below is part of the server HTML, so its CSS scene animations begin at
 * first paint instead of waiting for hydration. React joins the running
 * timeline on mount: every timer is anchored to data-intro-t0, never to
 * "now", so late hydration continues the sequence instead of restarting
 * it. Decisions (session seen / reduced motion / URL hash / preview) all
 * happen in the bootstrap script; this component only follows
 * `data-intro-play`.
 */

const SESSION_KEY = "shams-portfolio-intro-v5";
const HERO_MS = 1800; // hero starts under the still-visible overlay (seamless handoff)
const EXIT_MS = 2050; // overlay exit animation begins
const CLEANUP_MS = 2800; // overlay unmounted, scroll unlocked
const GRACE_MS = 550; // minimum intro visibility before interaction may dismiss it
const EXIT_FADE_MS = 750; // JS-side safety matching the CSS exit duration

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

    // No intro (reduced motion, already seen, deep link, stale bfcache):
    // reveal the page immediately and drop the SSR overlay.
    if (
      reduce ||
      !html.hasAttribute("data-intro-play") ||
      Date.now() - t0Attr > 4000
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

    // Honest decorative progress readout, synchronized with the CSS bar
    // (both span 0.85s → 1.9s from first paint).
    let raf = 0;
    const tick = () => {
      if (cancelled) return;
      const p = Math.min(1, Math.max(0, (elapsed() - 850) / 1050));
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
    window.addEventListener("wheel", dismiss, { capture: true, passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.clearTimeout(armT);
      window.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("wheel", dismiss, true);
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
