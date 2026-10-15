import { useState } from "react";
import { ArrowRight, Shuffle, Volume2, BookOpen } from "lucide-react";
import SpeakButton from "./SpeakButton.jsx";
import Emphasised from "./Emphasised.jsx";
import { C, TINT } from "../theme.js";

/* One frame for choosing a verb, choosing a tense, and working through the
 * table — replacing a six-screen wizard that asked those as separate questions
 * and then navigated away from the answer.
 *
 * The table stays on screen while you work: one cell is blanked in place
 * rather than the table being swapped for a question, so the thing being
 * learned and the thing being asked are never in different places.
 *
 * Answers here are scheduled, one cell at a time — this is the default way
 * into verbs on desktop, so practising in it has to count. Revealing a form is
 * a lookup rather than an attempt and is left ungraded.
 */
export default function GrammarWorkbench({
  verbs, dueByVerb, selectedVerb, onSelectVerb,
  tenses, tense, onSelectTense,
  rows, blankIdx, input, onInput, result, onCheck, onReveal, onNext,
  stats, note, onDrillVerb, onOpenMatrix, onOpenNotes, onOpenNote, noteTitles = [], canSpeak, onSay, onSayForm, dueTotal,
  drillScope, onDrillScope, scopeCounts,
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
                {due > 0 && <span className="text-[0.625rem] shrink-0" style={{ color: active ? C.ink : C.accent }}>{due} due</span>}
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
        {/* A dot marks a tense this verb already has a card in. It is the
          * same fact the "Started" drill scope uses, shown where the choice
          * is made — otherwise "which tenses do I actually know for this
          * verb" is only answerable by clicking through all seven. */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {tenses.map((t) => {
            const absent = !scopeCounts.availableKeys.includes(t.key);
            const started = scopeCounts.startedKeys.includes(t.key);
            return (
              <button key={t.key} onClick={() => onSelectTense(t.key)} disabled={absent}
                title={absent ? `${selectedVerb} has no ${t.label}` : started ? "started" : "not started yet"}
                className="px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-35"
                style={{
                  backgroundColor: tense === t.key ? C.gold : "transparent",
                  border: `1px solid ${tense === t.key ? C.gold : C.line}`,
                  color: C.ink,
                }}>
                {t.label}
                {started && (
                  <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: tense === t.key ? C.ink : C.gold }} />
                )}
              </button>
            );
          })}
          <span className="font-serif text-xs" style={{ color: C.muted }}>
            <span style={{ color: C.accent }}>•</span> started · {dueTotal} due on the verb track
          </span>
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
            /* `blankIdx` is a person index, not a row position — the imperative
             * has no first person, so the two stopped being the same number. */
            const isBlank = r.idx === blankIdx;
            const blankRow = rows.findIndex((x) => x.idx === blankIdx);
            const hidden = !result && blankIdx !== null && blankRow >= 0 && i > blankRow;
            return (
              <div key={i} className="grid gap-3 px-4 py-2 items-center font-serif"
                style={{
                  gridTemplateColumns: "110px 1fr 1fr",
                  borderTop: i ? `1px solid ${C.line}` : "none",
                  backgroundColor: isBlank ? TINT : "transparent",
                }}>
                <span className="text-sm" style={{ color: C.muted }}>{r.pronoun}</span>
                {isBlank ? (
                  <span className="flex items-center gap-2">
                    <input
                      aria-label={`Conjugate ${selectedVerb} for ${r.pronoun}`} autoFocus type="text" value={input} disabled={!!result}
                      onChange={(e) => onInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key !== "Enter") return; if (result) onNext(); else onCheck(); }}
                      className="px-2 py-1 rounded-md font-serif text-base w-32"
                      style={{ backgroundColor: C.paper, border: `1px dashed ${result ? (result.ok ? C.green : C.red) : C.line}`, color: C.ink }}
                    />
                    <span className="text-xs flex items-baseline gap-2" style={{ color: C.muted }}>
                      {result ? (result.ok ? "✓" : r.form) : "← type it"}
                      {result && <SpeakButton ready={canSpeak} onSay={() => onSayForm(r.spoken)} title={`Hear ${r.spoken}`} />}
                    </span>
                  </span>
                ) : (
                  <span className="text-base flex items-baseline gap-2" style={{ color: hidden ? C.muted : C.ink }}>
                    {hidden ? <span className="text-xs font-serif italic">hidden until you answer</span> : r.form}
                    {/* Only on a form that is actually on screen. A speaker on a
                      * hidden row would read out the answer the row is hiding. */}
                    {!hidden && (
                      <SpeakButton ready={canSpeak} onSay={() => onSayForm(r.spoken)} title={`Hear ${r.spoken}`} />
                    )}
                  </span>
                )}
                <span className="text-sm" style={{ color: C.muted }}>{r.english}</span>
              </div>
            );
          })}

          <div className="flex items-center gap-2 px-4 py-3 flex-wrap" style={{ borderTop: `1px solid ${C.line}` }}>
            <span className="font-serif text-xs" style={{ color: result && !result.ok ? C.red : C.muted }}>
              {result ? (result.ok ? "Right." : result.note || `It is “${rows.find((r) => r.idx === blankIdx)?.form}”.`) : "One cell at a time, in place."}
            </span>
            <span className="flex-1" />
            {!result ? (
              <>
                <button onClick={onReveal} className="px-3 py-1.5 rounded-md text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>Reveal</button>
                <button onClick={onCheck} className="px-4 py-1.5 rounded-md text-sm font-semibold" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
              </>
            ) : (
              <button onClick={onNext} className="px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                Next cell <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="shrink-0 rounded-lg" style={{ width: 236, border: `1px solid ${C.line}`, backgroundColor: C.card, padding: 14 }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Note</div>
        <p className="font-serif text-sm mb-3" style={{ color: C.ink }}>{note?.text}</p>

        {/* How the tense is built, beside the table rather than on a miss.
          * The drill interrupts with this because it has just told you that
          * you were wrong; here the table is open in front of you and the
          * aside is already the explaining column, so it simply stays up. */}
        {note?.form && (
          <div className="pt-3 mb-3" style={{ borderTop: `1px dashed ${C.line}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>How it is built</div>
            <p className="font-serif text-[0.8125rem]" style={{ color: C.muted, lineHeight: 1.6 }}>
              <Emphasised text={note.form} />
            </p>
            {note.noteTitle && noteTitles.includes(note.noteTitle) && onOpenNote && (
              <button
                onClick={() => onOpenNote(note.noteTitle)}
                className="mt-2 px-2 py-1 rounded text-[0.6875rem] font-semibold inline-flex items-center gap-1 text-left"
                style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}
              >
                <BookOpen size={11} /> Read: {note.noteTitle}
              </button>
            )}
          </div>
        )}

        <div className="pt-3 mb-3" style={{ borderTop: `1px dashed ${C.line}` }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>This session</div>
          <p className="font-serif text-sm" style={{ color: C.ink }}>
            {stats.answered} {stats.answered === 1 ? "cell" : "cells"} answered · {stats.right} first try
          </p>
          <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>Each answer is scheduled. Revealing a form is not counted.</p>
        </div>

        {/* What "Drill" means has to be a choice, not an assumption.
          * It used to build a queue across every tense the verb has, which
          * meant asking for the subjunctive of a verb you had only ever seen
          * in the present — the drill was harder than anything you had
          * studied, for no reason you could see or change. */}
        <div className="pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Drill scope</div>
          <div className="flex rounded-md overflow-hidden mb-2" style={{ border: `1px solid ${C.line}` }}>
            {[
              ["tense", "This tense", scopeCounts.tense],
              ["started", "Started", scopeCounts.started],
              ["all", "All", scopeCounts.all],
            ].map(([key, label, n], i) => (
              <button
                key={key}
                onClick={() => onDrillScope(key)}
                disabled={n === 0}
                title={n === 0 ? "No tense qualifies yet" : `${n} ${n === 1 ? "tense" : "tenses"}`}
                className="flex-1 py-1.5 text-[0.6875rem] font-semibold disabled:opacity-35"
                style={{
                  backgroundColor: drillScope === key ? TINT : "transparent",
                  color: C.ink,
                  borderLeft: i ? `1px solid ${C.line}` : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="font-serif text-xs mb-2" style={{ color: C.muted }}>
            {drillScope === "tense"
              ? "Only the tense open above."
              : drillScope === "started"
              ? "Only tenses you have answered at least once."
              : "Every tense this verb has, including ones you have not opened."}
          </p>

          <button
            onClick={onDrillVerb}
            disabled={scopeCounts[drillScope] === 0}
            className="w-full py-2 rounded-md text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: C.gold, color: C.onGold }}
          >
            Drill {selectedVerb} · {scopeCounts[drillScope]} {scopeCounts[drillScope] === 1 ? "tense" : "tenses"}
          </button>
          <button onClick={onOpenNotes} className="w-full mt-2 py-2 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            Grammar notes →
          </button>
        </div>
      </aside>
    </div>
  );
}
