import { useEffect, useState } from "react";

/* The desktop restructure only applies at Tailwind's default `lg` width.
 * Below it the app keeps its original single-column screens untouched, so this
 * is a hard branch rather than a styling tweak — hence a JS media query rather
 * than `lg:` classes.
 *
 * Reactive, not read-once: dragging a window across the boundary should swap
 * layouts, and it makes the boundary itself testable without a reload. */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(DESKTOP_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
