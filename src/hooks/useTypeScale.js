import { useCallback, useEffect, useState } from "react";

/* How big the text is, as a multiplier on the browser's own font size.
 *
 * Deliberately a *scale*, not a pixel size: the base is `100%`, which is
 * whatever the reader has set in their browser, so someone who has already
 * raised their default keeps that and this multiplies it. Everything in the
 * app is sized in rem (Tailwind's scale, and the app's own `text-[…rem]`
 * values), so one variable moves type, padding and the columns that hold text
 * together — the alternative, scaling glyphs inside fixed boxes, is how you
 * get clipped buttons at the top setting.
 *
 * Stored in localStorage beside the theme, and for the same reason: it has to
 * be readable before the first paint, and it belongs to this device rather
 * than to the deck.
 */
const KEY = "vocabdrawer:type-scale";
export const TYPE_SCALES = ["s", "m", "l", "xl"];
const DEFAULT = "m";

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return TYPE_SCALES.includes(v) ? v : DEFAULT;
  } catch {
    // Private browsing, or storage disabled — take the default and move on.
    return DEFAULT;
  }
}

export function useTypeScale() {
  const [scale, setScaleState] = useState(read);

  useEffect(() => {
    const root = document.documentElement;
    // "m" is the absence of an override, so the CSS default stands.
    if (scale === DEFAULT) root.removeAttribute("data-type-scale");
    else root.setAttribute("data-type-scale", scale);
    try { localStorage.setItem(KEY, scale); } catch { /* nothing to do */ }
  }, [scale]);

  const setScale = useCallback((next) => {
    setScaleState(TYPE_SCALES.includes(next) ? next : DEFAULT);
  }, []);

  return [scale, setScale];
}
