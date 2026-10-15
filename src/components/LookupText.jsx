import { useRef, useState } from "react";
import { segmentSentence } from "../lib/dictionary.js";

// One tab stop per paragraph; arrow keys move the word cursor. Pointer lookup
// remains available without forcing keyboard users through hundreds of tabs.
export default function LookupText({ text, lang, onLookup, selected }) {
  const segments = segmentSentence(text);
  const [at, setAt] = useState(0);
  const [focused, setFocused] = useState(false);
  const words = segments.filter((s) => s.type === "word");
  const refs = useRef([]);
  let index = 0;
  function key(e) {
    if (!words.length) return;
    if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? words.length - 1
            : Math.max(
                0,
                Math.min(
                  words.length - 1,
                  at + (e.key === "ArrowRight" ? 1 : -1),
                ),
              );
      setAt(next);
      refs.current[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onLookup(words[at].v);
    }
  }
  return (
    <span
      lang={lang}
      role="group"
      tabIndex={0}
      aria-label="Passage. Arrow keys select a word; Enter opens its definition."
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={key}
      className="vd-lookup-text"
    >
      {segments.map((seg, i) => {
        if (seg.type !== "word") return <span key={i}>{seg.v}</span>;
        const n = index++;
        return (
          <span
            key={i}
            ref={(el) => (refs.current[n] = el)}
            onClick={() => {
              setAt(n);
              onLookup(seg.v);
            }}
            className="vd-lookup-word"
            style={{
              textDecoration: focused && n === at ? "underline" : undefined,
              background: selected === seg.v ? "var(--vd-tint)" : undefined,
            }}
          >
            {seg.v}
          </span>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {focused ? `Selected word: ${words[at]?.v || ""}` : ""}
      </span>
    </span>
  );
}
