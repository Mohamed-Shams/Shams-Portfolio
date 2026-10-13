"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SESSION_KEY = "shams-portfolio-intro-v4";

/** Decorative first-visit greeting. The real page is always rendered and usable. */
export function PortfolioIntro({ locale }: { locale: "en" | "ar" }) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || window.location.hash) return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, "seen");
    } catch {
      // Private browsing can deny storage; the greeting remains optional.
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 950);
    return () => window.clearTimeout(timer);
  }, [reduced]);

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
