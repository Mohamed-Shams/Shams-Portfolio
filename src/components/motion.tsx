"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Wires the one-shot scroll reveal for every element carrying [data-reveal]
 * and every staggered group carrying [data-reveal-group] (children opt in
 * with [data-reveal-item]; the manager assigns an incremental --ri index so
 * CSS can stagger them). Renders nothing. Mounted once per page (Portfolio
 * and CaseStudy):
 *  - adds `reveal-ready` to <html>, so the hidden pre-reveal state only ever
 *    applies while JavaScript is running (no-JS visitors see the final page);
 *  - reveals elements/groups once as they enter the viewport (one shared
 *    IntersectionObserver, unobserved after reveal);
 *  - under prefers-reduced-motion reveals everything immediately, with no
 *    observer at all (the CSS reduce block strips transitions itself).
 * Re-running on remount (locale switch) is safe and required: fresh DOM
 * starts without `.in`, so every mount re-observes its own elements.
 */
export function RevealManager() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const groups = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-group]"),
    );
    for (const group of groups) {
      group
        .querySelectorAll<HTMLElement>(":scope > [data-reveal-item]")
        .forEach((el, i) => {
          /* Cap the cascade so very long lists do not feel sluggish. */
          el.style.setProperty("--ri", String(Math.min(i, 7)));
        });
    }
    if (!els.length && !groups.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      groups.forEach((g) => g.classList.add("in"));
      return;
    }
    const settleTimers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("in");
            // After the entrance settles, remove the stagger delay so
            // pointer and keyboard feedback on cards responds immediately.
            if (target.hasAttribute("data-reveal-group")) {
              settleTimers.push(window.setTimeout(() => {
                target.classList.add("reveal-settled");
              }, 1300));
            }
            io.unobserve(entry.target);
          }
        }
      },
      /* A low ratio keeps tall sections (the project grid on phones) from
         needing most of themselves visible before they may reveal, while the
         negative bottom margin delays the trigger until the section has
         genuinely entered the viewport — otherwise reveals fire before the
         visitor can see them. */
      { threshold: 0.06, rootMargin: "0px 0px -9% 0px" },
    );
    els.forEach((el) => io.observe(el));
    groups.forEach((g) => io.observe(g));
    return () => {
      io.disconnect();
      settleTimers.forEach(window.clearTimeout);
    };
  }, []);
  return null;
}

/**
 * Count-up for the about statistics. Runs once when visible; honors
 * prefers-reduced-motion by jumping straight to the final value.
 * `startDelay` staggers sibling counters so they do not tick in unison.
 * Final rendered strings exactly match the original hard-coded values.
 */
export function useCountUp(
  target: string,
  duration = 1200,
  startDelay = 0,
): { ref: React.RefObject<HTMLSpanElement | null>; text: string } {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [text, setText] = useState(target);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setText(target);
      return;
    }
    const parse = /([\d.]+)\s*([KM+]+)?/i.exec(target);
    if (!parse) return;
    const value = parseFloat(parse[1]);
    if (Number.isNaN(value)) return;
    const suffix = parse[2] ?? "";

    let started = false;
    let cancelled = false;
    let raf = 0;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started || cancelled) return;
        started = true;
        io.disconnect();
        timer = window.setTimeout(() => {
          if (cancelled) return;
          const t0 = performance.now();
          const tick = (now: number) => {
            if (cancelled) return;
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const current =
              value >= 1000
                ? Math.round(value * eased).toLocaleString("en-US")
                : (value * eased).toFixed(value % 1 ? 1 : 0);
            setText(current + suffix);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setText(target);
          };
          raf = requestAnimationFrame(tick);
        }, startDelay);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, startDelay]);

  return { ref, text };
}
