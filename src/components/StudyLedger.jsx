import { C } from "../theme.js";

/* What each word in the batch has done so far.
 *
 * This replaces the "what did I get wrong?" suspense of the old summary
 * screen — the record is visible while it is still being earned, and a missed
 * word is marked the moment it is missed rather than at the end.
 */
const LABEL = { typed: "typed ✓", chosen: "chosen", matched: "matched", seen: "seen", unseen: "" };

export default function StudyLedger({ rows, onWordClick, peek, onClosePeek }) {
  return (
    <aside
      className="shrink-0 self-start"
      style={{ width: 244, borderLeft: `1px solid ${C.line}`, backgroundColor: C.card, padding: "16px 14px" }}
      aria-label="Words in this batch"
    >
      <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.muted }}>This batch</div>

      <ul className="flex flex-col gap-0.5">
        {rows.map((r) => {
          const missed = r.misses > 0;
          return (
            <li key={r.cardId}>
              <button
                onClick={() => onWordClick && onWordClick(r)}
                disabled={!onWordClick}
                className="w-full flex items-baseline justify-between gap-2 px-1.5 py-1 rounded text-left"
                style={{ cursor: onWordClick ? "pointer" : "default" }}
              >
                <span className="font-serif text-sm min-w-0 truncate" style={{ color: r.status === "unseen" ? C.muted : C.ink }}>
                  {r.display}
                </span>
                <span className="text-[11px] shrink-0" style={{ color: missed ? C.red : C.muted }}>
                  {missed ? `missed ×${r.misses}` : LABEL[r.status]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {peek && (
        /* A read-only look at the card, not a re-queue: re-injecting a word
         * into a live stage would change what the sitting is graded on. */
        <div className="mt-3 pt-3 rounded-md p-3" style={{ borderTop: `1px dashed ${C.line}`, backgroundColor: C.paper }}>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="font-type text-base" style={{ color: C.ink }}>{peek.display}</span>
            <button onClick={onClosePeek} className="text-[11px] font-semibold" style={{ color: C.muted }}>close</button>
          </div>
          <div className="font-serif text-sm mb-1" style={{ color: C.muted }}>{peek.word.e}</div>
          {peek.word.s && <div className="font-serif text-xs italic" style={{ color: C.ink }}>{peek.word.s}</div>}
          {peek.word.se && <div className="font-serif text-xs" style={{ color: C.muted }}>{peek.word.se}</div>}
        </div>
      )}

      {onWordClick && !peek && (
        <p className="text-[11px] font-serif italic mt-3 pt-2" style={{ color: C.muted, borderTop: `1px dashed ${C.line}` }}>
          Click any word to see its card again.
        </p>
      )}
    </aside>
  );
}
