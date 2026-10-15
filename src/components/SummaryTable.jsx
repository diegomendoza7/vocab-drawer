import { ArrowRight, RotateCcw, Settings2 } from "lucide-react";
import { C, TINT } from "../theme.js";

/* What happened to each word, and when it comes back.
 *
 * The score card this replaces reported one percentage, which says nothing
 * about what to do next. A per-word row with its real next-due date makes
 * "mastered" concrete: you can see that the two you fumbled return tomorrow
 * while the rest are gone for three days.
 */
function dueLabel(days, learning) {
  /* A new word is deliberately kept for a second look before the schedule
   * starts, so "today" would undersell what is happening. */
  if (learning) return "later today";
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

export default function SummaryTable({ title, caption, rows, missCount, onNext, nextLabel, onPractiseMisses, onHome, homeLabel }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>{title}</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>{caption}</span>
      </div>

      <div className="rounded-lg overflow-hidden mb-5" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
        <div
          className="grid gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
          style={{ gridTemplateColumns: "1fr 1fr 96px 90px 100px", color: C.muted, borderBottom: `1px solid ${C.line}` }}
        >
          <span>Word</span><span>Meaning</span><span>Asked</span><span>First try</span><span>Next due</span>
        </div>

        {rows.map((r) => (
          <div
            key={r.cardId}
            className="grid gap-3 px-4 py-2.5 items-baseline font-serif text-sm"
            style={{
              gridTemplateColumns: "1fr 1fr 96px 90px 100px",
              borderTop: `1px solid ${C.line}`,
              backgroundColor: r.firstTry ? "transparent" : TINT,
            }}
          >
            <span className="font-type" style={{ color: C.ink }}>{r.display}</span>
            <span style={{ color: C.muted }}>{r.word.e}</span>
            {/* Which half of the word: two rows for one word is not a bug,
              * it is the point — reading it and saying it come back apart. */}
            <span className="text-xs" style={{ color: r.direction === "produce" ? C.ink : C.muted }}>
              {r.direction === "produce" ? "to produce" : "to recognise"}
            </span>
            <span style={{ color: r.firstTry ? C.green : C.red }}>{r.firstTry ? "✓" : `×${r.misses}`}</span>
            <span style={{ color: r.learning ? C.accent : C.muted }}>{dueLabel(r.dueInDays, r.learning)}</span>
          </div>
        ))}
      </div>

      {rows.some((r) => r.learning) && (
        <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "70ch", lineHeight: 1.6 }}>
          The words marked <b style={{ color: C.ink }}>later today</b> are new, and come back once more
          before the schedule starts — the second look, a little while after the first, is what decides
          whether a word is still there tomorrow.
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={onNext} className="px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
          {nextLabel} <ArrowRight size={16} />
        </button>
        {missCount > 0 && (
          <button onClick={onPractiseMisses} className="px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            <RotateCcw size={15} /> Practise the {missCount} {missCount === 1 ? "miss" : "misses"}
          </button>
        )}
        <button onClick={onHome} className="px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          <Settings2 size={15} /> {homeLabel}
        </button>
      </div>
    </div>
  );
}
