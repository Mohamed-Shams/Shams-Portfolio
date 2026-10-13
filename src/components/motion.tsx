"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Wires the one-shot scroll reveal for every element carrying [data-reveal].
 * Renders nothing. Mounted once per page (Portfolio and CaseStudy):
 *  - adds `reveal-ready` to <html>, so the hidden pre-reveal state only ever
 *    applies while JavaScript is running (no-JS visitors see the final page);
 *  - reveals elements once as they enter the viewport (IntersectionObserver,
 *    disconnected per element after reveal);
 *  - under prefers-reduced-motion reveals everything immediately, with no
 *    observer at all (globals.css strips the transitions themselves).
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
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      /* A low ratio keeps tall sections (the project grid on phones) from
         needing most of themselves visible before they may reveal. */
      { threshold: 0.05, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/**
 * Count-up for the about statistics. Runs once when visible; honors
 * prefers-reduced-motion by jumping straight to the final value.
 * Final rendered strings exactly match the original hard-coded values.
 */
export function useCountUp(
  target: string,
  duration = 1200,
): { ref: React.RefObject<HTMLSpanElement | null>; text: string } {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [text, setText] = useState(target);
  const started = useRef(false);

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

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const current =
            value >= 1000
              ? Math.round(value * eased).toLocaleString("en-US")
              : (value * eased).toFixed(value % 1 ? 1 : 0);
          setText(current + suffix);
          if (p < 1) requestAnimationFrame(tick);
          else setText(target);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, text };
}
