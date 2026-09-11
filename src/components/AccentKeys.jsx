import { C } from "../theme.js";

/* The characters a keyboard without a French or German layout cannot reach.
 * Buttons take the mouse-down so the textarea keeps its focus and its cursor —
 * clicking one inserts where you were typing, not at the end. */
const KEYS = {
  fr: ["à", "â", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "œ", "«", "»"],
  de: ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü", "„", "“"],
};

export default function AccentKeys({ lang, onInsert }) {
  return (
    <div className="flex flex-wrap gap-1" aria-label="Insert a character">
      {(KEYS[lang] || []).map((ch) => (
        <button
          key={ch}
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(ch)}
          className="w-7 h-7 rounded text-sm font-serif"
          style={{ border: `1px solid ${C.line}`, color: C.ink, backgroundColor: C.card }}
        >
          {ch}
        </button>
      ))}
    </div>
  );
}
