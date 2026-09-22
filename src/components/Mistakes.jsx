import { useState, useRef } from "react";
import { TriangleAlert, ArrowRight, BookOpen, Check, X, Trash2 } from "lucide-react";
import { C, TINT } from "../theme.js";
import AccentKeys from "./AccentKeys.jsx";
import { insertAt } from "../lib/textbox.js";
import { ruleInfo, ruleKeyOf } from "../lib/errors.js";
import Emphasised from "./Emphasised.jsx";

/* Your mistakes — the screen the app could not have shown before.
 *
 * Everything here is the learner's own: the patterns are counted from their
 * writing and their drills, the examples are sentences they actually wrote,
 * and the drill asks them to fix those sentences rather than invented ones.
 * That is the whole argument for it. A generic exercise on the dative teaches
 * the dative; re-fixing the sentence where *you* got the dative wrong last
 * Tuesday teaches you.
 *
 * The count deliberately does not fall when you finish a drill. It is a record
 * of what you do when you are writing for real, and it comes down by itself —
 * the weighting fades old mistakes — when you stop making it.
 */

const PRIMARY = { backgroundColor: C.gold, color: C.ink };
const QUIET = { border: `1px solid ${C.line}`, color: C.ink };

/* The explanations are written with **bold** around the part that matters,
 * because the part that matters is usually two words inside a long sentence. */
function Drill({ mistake, lang, check, onDone, hasKeys }) {
  const items = (mistake.examples || []).filter((e) => e.text);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fixed, setFixed] = useState(0);
  const boxRef = useRef(null);
  const item = items[idx];
  const info = ruleInfo(mistake.rule);

  async function submit() {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      const r = await check(input.trim());
      const still = (r.issues || []).find((i) => ruleKeyOf(i) === mistake.rule);
      const other = (r.issues || []).filter((i) => ruleKeyOf(i) !== mistake.rule && (i.kind === "grammar" || i.kind === "spelling"));
      if (!still) setFixed((n) => n + 1);
      setResult({ ok: !still, still, other, offline: r.status !== "ok" });
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      setInput("");
      setResult(null);
      return;
    }
    onDone(fixed, items.length);
  }

  if (!item) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <p className="font-serif text-sm" style={{ color: C.muted }}>
          No sentences of your own are stored for this one yet — it was counted from a drill rather than from your writing.
        </p>
        <button type="button" onClick={() => onDone(0, 0)} className="mt-3 px-4 py-2 rounded-md font-semibold text-sm" style={QUIET}>Back</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
          {info.title} · {idx + 1} of {items.length}
        </span>
        <span className="flex-1" />
        <span className="text-xs" style={{ color: C.muted }}>You wrote this on {item.at}</span>
      </div>

      <p className="font-serif text-[1rem] rounded-md p-3" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink, lineHeight: 1.7 }}>
        {item.text}
      </p>
      <p className="font-serif text-sm" style={{ color: C.muted }}>Write it again, correctly.</p>

      <textarea
        ref={boxRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || e.shiftKey) return;
          e.preventDefault();
          if (result) next(); else submit();
        }}
        rows={3}
        lang={lang}
        spellCheck={false}
        placeholder="Your corrected sentence…"
        className="w-full p-3 rounded-md font-serif text-[0.9375rem]"
        style={{ border: `1px solid ${C.line}`, backgroundColor: C.paper, color: C.ink, lineHeight: 1.6, resize: "vertical" }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <AccentKeys lang={lang} onInsert={(ch) => insertAt(boxRef, input, setInput, ch)} />
        <span className="flex-1" />
        {result ? (
          <button type="button" onClick={next} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={PRIMARY}>
            {idx + 1 < items.length ? "Next" : "Finish"} <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!input.trim() || busy} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={PRIMARY}>
            {busy ? "Checking…" : "Check"}
          </button>
        )}
      </div>

      {result && (
        <div className="rounded-md p-3" style={{ backgroundColor: result.ok ? TINT : C.paper, border: `1px solid ${result.ok ? C.green : C.red}` }}>
          <div className="flex items-center gap-1.5 font-semibold text-sm mb-1" style={{ color: result.ok ? C.green : C.red }}>
            {result.ok ? <><Check size={15} /> Fixed — that pattern is gone from this sentence.</> : <><X size={15} /> Still there.</>}
          </div>
          {result.still && <p className="font-serif text-sm" style={{ color: C.ink }}>{result.still.message}</p>}
          {!result.still && item.fix && (
            <p className="font-serif text-sm" style={{ color: C.muted }}>The checker suggested “{item.fix}” at the time.</p>
          )}
          {result.other.length > 0 && (
            <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>
              Other things the checker noticed: {result.other.map((i) => i.short || i.message).slice(0, 2).join(" · ")}
            </p>
          )}
          {result.offline && (
            <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>
              LanguageTool could not be reached, so only the offline rules ran.
            </p>
          )}
        </div>
      )}
      {hasKeys && <p className="text-[0.6875rem] font-serif" style={{ color: C.muted }}>Enter to check, then Enter to continue.</p>}
    </div>
  );
}

export default function Mistakes({
  lang, langName, mistakes, onClear, onPractised, check, noteTitles = [], onOpenNote, hasKeys,
}) {
  const [drilling, setDrilling] = useState(null);
  const [done, setDone] = useState(null);

  /* Derived, not stored: if the pattern disappears from the list underneath
   * the drill — cleared in another tab, or faded out — this falls back to the
   * list rather than setting state during a render. */
  const mistake = drilling ? mistakes.find((m) => m.id === drilling) : null;
  if (mistake) {
    return (
      <div>
        <button type="button" onClick={() => setDrilling(null)} className="px-3 py-1.5 rounded-md text-xs font-semibold mb-3" style={QUIET}>
          ← All mistakes
        </button>
        <div style={{ maxWidth: "44rem" }}>
          <Drill
            mistake={mistake}
            lang={lang}
            check={check}
            hasKeys={hasKeys}
            onDone={(fixed, total) => {
              if (total > 0) onPractised(mistake.id);
              setDone({ title: ruleInfo(mistake.rule).title, fixed, total });
              setDrilling(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Your mistakes</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>{langName}</span>
      </div>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "70ch" }}>
        Counted from your own writing and drills, heaviest first. Old mistakes fade on their own — a pattern leaves
        this list when you stop making it, not when you practise it.
      </p>

      {done && (
        <div className="rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          <Check size={15} style={{ color: C.green }} />
          <span className="font-serif text-sm" style={{ color: C.ink }}>
            {done.total ? `${done.title}: you fixed ${done.fixed} of ${done.total}.` : `${done.title}: nothing stored to drill yet.`}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={() => setDone(null)} className="text-xs" style={{ color: C.muted }}>Dismiss</button>
        </div>
      )}

      {mistakes.length === 0 ? (
        <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <p className="font-serif text-sm" style={{ color: C.ink, maxWidth: "62ch" }}>
            Nothing here yet. Answer a few questions in the Reading Room or write a piece in the Writing Desk — every
            check you run is recorded here, and a pattern appears once you have made it twice.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3" style={{ maxWidth: "52rem" }}>
          {mistakes.map((m) => {
            const info = ruleInfo(m.rule);
            const note = info.note && noteTitles.includes(info.note) ? info.note : null;
            return (
              <div key={m.id} className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.red}` }}>
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <TriangleAlert size={15} style={{ color: C.red, alignSelf: "center" }} />
                  <span className="font-type text-lg" style={{ color: C.ink }}>{info.title}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.paper, color: C.muted, border: `1px solid ${C.line}` }}>
                    {m.count}× · last {m.last}
                  </span>
                  {m.practised?.length > 0 && (
                    <span className="text-xs" style={{ color: C.muted }}>practised {m.practised.length}×</span>
                  )}
                </div>

                {info.why && (
                  <p className="font-serif text-[0.9375rem] mb-2" style={{ color: C.muted, lineHeight: 1.65, maxWidth: "62ch" }}>
                    <Emphasised text={info.why} />
                  </p>
                )}

                {m.examples?.length > 0 && (
                  <ul className="flex flex-col gap-1 mb-3">
                    {m.examples.slice(0, 2).map((e, i) => (
                      <li key={i} className="font-serif text-sm rounded-md px-3 py-2" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                        {e.text}
                        {e.fix && <span style={{ color: C.muted }}> → “{e.fix}”</span>}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => { setDone(null); setDrilling(m.id); }} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={PRIMARY}>
                    Fix these sentences <ArrowRight size={13} />
                  </button>
                  {note && (
                    <button type="button" onClick={() => onOpenNote(note)} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
                      <BookOpen size={13} /> Read the note
                    </button>
                  )}
                  <button type="button" onClick={() => onClear(m.id)} title="Remove this pattern from the list" className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
                    <Trash2 size={13} /> I've got this
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
