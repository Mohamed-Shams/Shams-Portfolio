"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "shams-portfolio-intro-v4";
const HERO_REVEAL_MS = 1030;
const INTRO_DISMISS_MS = 1430;

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
    let heroStarted = false;
    let dismissed = false;
    const revealHero = () => {
      if (heroStarted) return;
      heroStarted = true;
      onFinished(true);
    };
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      revealHero();
      setVisible(false);
    };
    const heroTimer = window.setTimeout(revealHero, HERO_REVEAL_MS);
    const dismissTimer = window.setTimeout(dismiss, INTRO_DISMISS_MS);

    // The greeting is decorative: anyone who tries to use the page should
    // immediately see the action and its focus indicator instead of the overlay.
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", dismiss, true);
    return () => {
      window.clearTimeout(heroTimer);
      window.clearTimeout(dismissTimer);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
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
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="portfolio-intro-rings" />
          <svg className="portfolio-intro-signals" viewBox="0 0 840 520" preserveAspectRatio="xMidYMid meet">
            <path d="M0 156H224L272 204H342M840 365H627L590 328H496" />
            <path d="M0 318H174L222 270H310M840 168H688L624 232H540" />
            <circle cx="342" cy="204" r="3" />
            <circle cx="496" cy="328" r="3" />
            <circle cx="310" cy="270" r="3" />
            <circle cx="540" cy="232" r="3" />
          </svg>
          <motion.div
            className="portfolio-intro-content"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.17, delayChildren: 0.12 } } }}
          >
            <motion.div
              className="portfolio-intro-mark"
              variants={{
                hidden: { opacity: 0, scale: 0.78, y: 20, filter: "blur(6px)" },
                show: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.67, ease: [0.16, 1, 0.3, 1] } },
              }}
            >MS</motion.div>
            <motion.strong variants={{
              hidden: { opacity: 0, y: 22 },
              show: { opacity: 1, y: 0, transition: { duration: 0.56, ease: [0.16, 1, 0.3, 1] } },
            }}>{locale === "ar" ? "محمد أحمد شمس" : "Mohamed Ahmed Shams"}</motion.strong>
            <motion.span variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
            }}>{locale === "ar" ? "مهندس أنظمة / إنترنت الأشياء الصناعي" : "Systems Engineer / Industrial IoT"}</motion.span>
            <div className="portfolio-intro-line"><i /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
