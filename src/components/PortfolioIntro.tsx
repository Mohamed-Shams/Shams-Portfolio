"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "shams-portfolio-intro-v4";

/** Decorative first-visit greeting. The real page is always rendered and usable. */
export function PortfolioIntro({
  locale,
  onFinished,
}: {
  locale: "en" | "ar";
  onFinished: (ready: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);
  const shouldPlay = useRef<boolean | null>(null);

  useEffect(() => {
    if (shouldPlay.current === null) {
      const skip = window.matchMedia("(prefers-reduced-motion: reduce)").matches || Boolean(window.location.hash);
      shouldPlay.current = !skip;
      if (!skip) {
        try {
          if (window.sessionStorage.getItem(SESSION_KEY)) shouldPlay.current = false;
          else window.sessionStorage.setItem(SESSION_KEY, "seen");
        } catch {
          // Optional session storage may be unavailable in private browsing.
        }
      }
    }
    if (!shouldPlay.current) {
      onFinished(true);
      return;
    }
    // Keep the initial decision across React Strict Mode's effect replay.
    // Its first cleanup cancels the timer, so the replay must schedule it again.
    setVisible(true);
    // Overlap the Hero entrance with the final fraction of the intro.
    // Otherwise its own stagger produces a dark gap after the overlay fades.
    const heroTimer = window.setTimeout(() => onFinished(true), 710);
    const dismissTimer = window.setTimeout(() => setVisible(false), 950);
    return () => {
      window.clearTimeout(heroTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [onFinished]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="portfolio-intro"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="portfolio-intro-rings" />
          <motion.div
            className="portfolio-intro-content"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portfolio-intro-mark">MS</div>
            <strong>{locale === "ar" ? "محمد أحمد شمس" : "Mohamed Ahmed Shams"}</strong>
            <span>{locale === "ar" ? "مهندس أنظمة / إنترنت الأشياء الصناعي" : "Systems Engineer / Industrial IoT"}</span>
            <div className="portfolio-intro-line"><i /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
