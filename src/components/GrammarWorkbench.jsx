import { useState } from "react";
import { ArrowRight, Shuffle, Volume2 } from "lucide-react";
import { C } from "../theme.js";

/* One frame for choosing a verb, choosing a tense, and working through the
 * table — replacing a six-screen wizard that asked those as separate questions
 * and then navigated away from the answer.
 *
 * The table stays on screen while you work: one cell is blanked in place
 * rather than the table being swapped for a question, so the thing being
 * learned and the thing being asked are never in different places.
 *
 * This surface is practice, not assessment — the same split the app already
 * makes, where the table and matching stages carry no score and the drill
 * does. "Drill this verb" hands over to the graded flow.
 */
export default function GrammarWorkbench({
  verbs, dueByVerb, selectedVerb, onSelectVerb,
  tenses, tense, onSelectTense,
  rows, blankIdx, input, onInput, result, onCheck, onReveal, onNext,
  stats, note, onDrillVerb, onOpenMatrix, onOpenNotes, canSpeak, onSay, dueTotal,
}) {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const shown = verbs.filter((v) => !q || v.key.toLowerCase().includes(q));

  return (
    <div className="flex gap-5 items-start">
      <aside className="shrink-0 rounded-lg" style={{ width: 210, border: `1px solid ${C.line}`, backgroundColor: C.card, padding: 12 }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Verbs</div>
        <input
          type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder={`filter ${verbs.length} verbs`}
          className="w-full px-2 py-1.5 mb-2 rounded-md font-serif text-xs"
          style={{ backgroundColor: C.paper, border: `1px dashed ${C.line}`, color: C.ink }}
        />
        <div className="flex flex-col gap-0.5 max-h-[26rem] overflow-y-auto">
          {shown.slice(0, 40).map((v) => {
            const due = dueByVerb.get(v.key) || 0;
            const active = v.key === selectedVerb;
            return (
              <button key={v.key} onClick={() => onSelectVerb(v.key)}
                className="text-left px-2 py-1.5 rounded-md font-serif text-sm flex items-baseline justify-between gap-2"
                style={{ backgroundColor: active ? C.gold : "transparent", color: C.ink }}>
                <span className="truncate">{v.key}</span>
                {due > 0 && <span className="text-[10px] shrink-0" style={{ color: active ? C.ink : C.gold }}>{due} due</span>}
              </button>
            );
          })}
          {shown.length > 40 && <span className="px-2 py-1 font-serif text-xs" style={{ color: C.muted }}>…{shown.length - 40} more</span>}
          {shown.length === 0 && <span className="px-2 py-1 font-serif text-xs" style={{ color: C.muted }}>No verb matches that.</span>}
        </div>
        <button onClick={onOpenMatrix} className="w-full mt-2 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          <Shuffle size={13} /> Coverage map
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {tenses.map((t) => (
            <button key={t.key} onClick={() => onSelectTense(t.key)}
              className="px-3 py-1.5 rounded-md text-sm font-semibold"
              style={{
                backgroundColor: tense === t.key ? C.gold : "transparent",
                border: `1px solid ${tense === t.key ? C.gold : C.line}`,
                color: C.ink,
              }}>
              {t.label}
            </button>
          ))}
          <span className="font-serif text-xs" style={{ color: C.muted }}>{dueTotal} due on the verb track</span>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
          <div className="flex items-baseline gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.line}` }}>
            <span className="font-type text-xl" style={{ color: C.ink }}>{selectedVerb}</span>
            <span className="font-serif text-sm" style={{ color: C.muted }}>{note?.gloss}</span>
            <span className="flex-1" />
            {canSpeak && (
              <button onClick={onSay} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.ink }}>
                <Volume2 size={13} /> hear all
              </button>
            )}
          </div>

          {rows.map((r, i) => {
            const isBlank = i === blankIdx;
            const hidden = !result && blankIdx !== null && i > blankIdx;
            return (
              <div key={i} className="grid gap-3 px-4 py-2 items-center font-serif"
                style={{
                  gridTemplateColumns: "110px 1fr 1fr",
                  borderTop: i ? `1px solid ${C.line}` : "none",
                  backgroundColor: isBlank ? "rgba(182,130,53,.10)" : "transparent",
                }}>
                <span className="text-sm" style={{ color: C.muted }}>{r.pronoun}</span>
                {isBlank ? (
                  <span className="flex items-center gap-2">
                    <input
                      autoFocus type="text" value={input} disabled={!!result}
                      onChange={(e) => onInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") (result ? onNext() : onCheck()); }}
                      className="px-2 py-1 rounded-md font-serif text-base w-32"
                      style={{ backgroundColor: C.paper, border: `1px dashed ${result ? (result.ok ? C.green : C.red) : C.line}`, color: C.ink }}
                    />
                    <span className="text-xs" style={{ color: C.muted }}>{result ? (result.ok ? "✓" : r.form) : "← type it"}</span>
                  </span>
                ) : (
                  <span className="text-base" style={{ color: hidden ? C.muted : C.ink }}>
                    {hidden ? <span className="text-xs font-serif italic">hidden until you answer</span> : r.form}
                  </span>
                )}
                <span className="text-sm" style={{ color: C.muted }}>{r.english}</span>
              </div>
            );
          })}

          <div className="flex items-center gap-2 px-4 py-3 flex-wrap" style={{ borderTop: `1px solid ${C.line}` }}>
            <span className="font-serif text-xs" style={{ color: result && !result.ok ? C.red : C.muted }}>
              {result ? (result.ok ? "Right." : result.note || `It is “${rows[blankIdx]?.form}”.`) : "One cell at a time, in place."}
            </span>
            <span className="flex-1" />
            {!result ? (
              <>
                <button onClick={onReveal} className="px-3 py-1.5 rounded-md text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>Reveal</button>
                <button onClick={onCheck} className="px-4 py-1.5 rounded-md text-sm font-semibold" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
              </>
            ) : (
              <button onClick={onNext} className="px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.ink }}>
                Next cell <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="shrink-0 rounded-lg" style={{ width: 236, border: `1px solid ${C.line}`, backgroundColor: C.card, padding: 14 }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Note</div>
        <p className="font-serif text-sm mb-3" style={{ color: C.ink }}>{note?.text}</p>

        <div className="pt-3 mb-3" style={{ borderTop: `1px dashed ${C.line}` }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>This session</div>
          <p className="font-serif text-sm" style={{ color: C.ink }}>
            {stats.answered} {stats.answered === 1 ? "cell" : "cells"} answered · {stats.right} first try
          </p>
          <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>Practice only — nothing is scheduled here.</p>
        </div>

        <div className="pt-3 flex flex-col gap-2" style={{ borderTop: `1px dashed ${C.line}` }}>
          <button onClick={onDrillVerb} className="w-full py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: C.gold, color: C.ink }}>
            Drill {selectedVerb}
          </button>
          <button onClick={onOpenNotes} className="w-full py-2 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            Grammar notes →
          </button>
        </div>
      </aside>
    </div>
  );
}
