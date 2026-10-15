"use client";

import { useEffect, useState } from "react";

/* The default follows the visitor's OS setting. A conscious opt-in only
   overrides reduced motion for the two industrial/technology demonstrations. */
const STORAGE_KEY = "shams-portfolio-demo-motion";
const MOTION_EVENT = "shams-portfolio-motion-change";

type MotionState = { ready: boolean; reduced: boolean; override: boolean };

export function usePortfolioMotion() {
  const [state, setState] = useState<MotionState>({
    ready: false,
    reduced: false,
    override: false,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      let override = document.documentElement.dataset.portfolioMotion === "on";
      try {
        override = window.localStorage.getItem(STORAGE_KEY) === "on";
      } catch {
        // Session-only opt-in still works if the browser blocks storage.
      }
      document.documentElement.dataset.portfolioMotion = override ? "on" : "auto";
      setState({ ready: true, reduced: media.matches, override });
    };

    sync();
    media.addEventListener("change", sync);
    window.addEventListener(MOTION_EVENT, sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener(MOTION_EVENT, sync);
    };
  }, []);

  const setMotionOverride = (enabled: boolean) => {
    document.documentElement.dataset.portfolioMotion = enabled ? "on" : "auto";
    try {
      if (enabled) window.localStorage.setItem(STORAGE_KEY, "on");
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Keep the explicit setting for this tab even without persistent storage.
    }
    window.dispatchEvent(new Event(MOTION_EVENT));
  };

  return {
    ...state,
    blockedBySystem: state.ready && state.reduced && !state.override,
    setMotionOverride,
  };
}
