"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Shared scroll-reveal helper.
 * Adds classes when elements enter the viewport; reverses nothing by default
 * (one-shot reveals avoid repeated animation work while scrolling).
 * When the user prefers reduced motion, returns `true` immediately so
 * callers can render final-state without any transition.
 */
export function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, shown };
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
