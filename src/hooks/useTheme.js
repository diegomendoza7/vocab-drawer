import { useCallback, useEffect, useState } from "react";

/* Light, dark, or whatever the device says.
 *
 * "System" is the default and a real third state, not a synonym for light: a
 * phone that flips to dark at sunset should take the app with it. Only an
 * explicit choice writes `data-theme`, which is what lets the CSS treat an
 * explicit setting as beating `prefers-color-scheme` in both directions.
 *
 * Stored in localStorage rather than with the rest of the progress in
 * IndexedDB, deliberately: it has to be readable synchronously before the
 * first paint, and it is a per-device preference rather than part of the deck.
 */
const KEY = "vocabdrawer:theme";
export const THEMES = ["system", "light", "dark"];

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return THEMES.includes(v) ? v : "system";
  } catch {
    // Private browsing, or storage disabled — follow the system and move on.
    return "system";
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch { /* nothing to do */ }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(THEMES.includes(next) ? next : "system");
  }, []);

  return [theme, setTheme];
}
