import { Volume2, RotateCcw, ArrowRight, Check, X, Eye, Keyboard } from "lucide-react";
import { C, TINT } from "../theme.js";

/* The last stage of a batch at ≥1024px.
 *
 * Mobile asks you to type the whole sentence into a bare box. That is the
 * hardest possible form of the exercise and it is the *first* time the word has
 * been asked for in a sentence — so a miss here is often a word-order problem
 * rather than a vocabulary one, and the box cannot tell you which.
 *
 * A word bank separates those. Getting the chips in the wrong order is a
 * grammar mistake you can see; typing is still one click away for anyone who
 * wants the harder version, and both go through the same grader.
 *
 * The right rail holds the card for the word being practised. It is the one
 * thing the phone never had room for, and the reason the stage felt like a
 * test rather than the end of a lesson.
 */
export default function SentenceStage({
  breadcrumb, streak, retired, total, revisit,
  english, word, gloss, meta, note,
  mode, onMode,
  bank, placed, onPlace, onUnplace, onClearPlaced,
  input, onInput, inputRef,
  result, blankNudge, retry,
  onCheck, onRetry, onNext, onReveal, onSkipToSummary,
  canSpeak, onSay, onSayWord,
  stages, slipText, glossed, diffGlossed,
}) {
  const chips = mode === "chips";
  const answered = Boolean(result);

  return (
    <div className="grid gap-0 items-stretch" style={{ gridTemplateColumns: "1fr 268px", minHeight: "60vh" }}>
      {/* ---------------- stage ---------------- */}
      <div className="min-w-0" style={{ padding: "0 26px 0 0" }}>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-xs" style={{ color: C.muted }}>
            {breadcrumb} · sentence stage · {retired} of {total}
          </span>
          <span className="flex-1" />
          {revisit > 0 && <span className="font-serif text-xs" style={{ color: C.gold }}>{revisit} to revisit</span>}
          {streak > 1 && <span className="font-serif text-xs" style={{ color: C.muted }}>{streak} in a row</span>}
        </div>

        <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
          <div className="font-serif text-sm mb-1" style={{ color: C.muted }}>Say this in {meta.langName}</div>
          <div className="font-type text-[22px] mb-4" style={{ color: C.ink }}>{english}</div>

          {chips ? (
            <>
              {/* the answer being built */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 mb-3"
                style={{ minHeight: 46, borderBottom: `1px solid ${C.line}` }}>
                {placed.map((tok, i) => (
                  <button key={`${tok}-${i}`} onClick={() => !answered && onUnplace(i)} disabled={answered}
                    className="px-2.5 py-1.5 rounded-md font-serif text-sm"
                    style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}>
                    {tok}
                  </button>
                ))}
                {!answered && (
                  <span className="rounded-md" style={{ width: 54, height: 30, border: `1px dashed ${C.muted}` }} />
                )}
                {placed.length > 0 && !answered && (
                  <button onClick={onClearPlaced} className="ml-1 font-serif text-xs" style={{ color: C.muted }}>clear</button>
                )}
              </div>

              {!answered && (
                <>
                  <div className="font-serif text-sm mb-1.5" style={{ color: C.muted }}>Word bank</div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bank.map((tok, i) => (
                      <button key={`${tok}-${i}`} onClick={() => onPlace(i)}
                        className="px-2.5 py-1.5 rounded-md font-serif text-sm"
                        style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}>
                        {tok}
                      </button>
                    ))}
                    {bank.length === 0 && (
                      <span className="font-serif text-sm" style={{ color: C.muted }}>All placed — check it.</span>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <input
              ref={inputRef} type="text" value={input} disabled={answered}
              onChange={(e) => onInput(e.target.value)}
              placeholder={meta.placeholder}
              autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              className="w-full px-3 py-2.5 rounded-md font-serif text-base mb-3"
              style={{ backgroundColor: C.paper, border: `1px solid ${result ? (result.ok ? C.green : C.red) : C.line}`, color: C.ink }}
            />
          )}

          {retry && !answered && (
            <div className="font-serif text-xs mb-2" style={{ color: C.gold }}>From memory — build it again.</div>
          )}
          {blankNudge && !answered && (
            <div className="font-serif text-xs mb-2" style={{ color: C.red }}>
              {chips ? "Place some words first — nothing was marked." : "Write the sentence first — nothing was marked."}
            </div>
          )}

          {/* ---------------- result, in the same card ---------------- */}
          {answered && (
            <div className="mb-3">
              <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: result.ok ? C.green : C.red }}>
                {result.ok ? <Check size={15} /> : <X size={15} />}
                {result.ok
                  ? result.retry ? "That is it — it will come round again"
                    : result.slips.length ? "Right — with a couple of details" : "Exactly right"
                  : "Not quite"}
              </div>

              {!result.ok && diffGlossed}

              <div className="font-serif text-base" style={{ color: C.ink }}>{glossed}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>{english}</div>
              <div className="font-serif text-xs mt-1" style={{ color: C.muted }}>Hover any word to see what it means.</div>

              {result.slips.length > 0 && (
                <div className="mt-3 rounded-md px-3 py-2 font-serif text-sm" style={{ backgroundColor: TINT, border: `1px solid ${C.line}`, color: C.ink }}>
                  {result.slips.map((s, i) => (
                    <div key={i}>{slipText[s.kind]}: <span className="font-type">{s.word}</span></div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!answered ? (
              <>
                <button onClick={onCheck} className="px-5 py-2 rounded-md font-semibold text-sm"
                  style={{ border: `1px solid ${C.gold}`, color: C.gold }}>Check</button>
                <button onClick={() => onMode(chips ? "typing" : "chips")}
                  className="px-3 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
                  style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Keyboard size={14} /> {chips ? "Type it instead" : "Use the word bank"}
                </button>
                <button onClick={onReveal} className="px-3 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
                  style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Eye size={14} /> Reveal
                </button>
              </>
            ) : !result.ok && !result.retry ? (
              <button onClick={onRetry} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
                style={{ backgroundColor: C.gold, color: C.ink }}>
                <RotateCcw size={14} /> Try it again
              </button>
            ) : (
              <button onClick={onNext} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
                style={{ backgroundColor: C.gold, color: C.ink }}>
                {revisit > 0 || !(result.ok && !result.retry) ? "Next" : "See results"} <ArrowRight size={14} />
              </button>
            )}
            <span className="flex-1" />
            {canSpeak && (
              <button onClick={onSay} className="px-3 py-2 rounded-md flex items-center gap-1.5"
                style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Volume2 size={14} />
              </button>
            )}
          </div>

          {chips && !answered && (
            <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
              The bank holds the sentence plus a few near-misses. Typing accepts the same answer, with accents required.
            </p>
          )}
        </div>

        <button onClick={onSkipToSummary} className="mt-3 font-serif text-xs" style={{ color: C.muted }}>
          End the batch here and see the summary
        </button>
      </div>

      {/* ---------------- the word's own card ---------------- */}
      <aside className="p-4" style={{ backgroundColor: TINT, borderLeft: `1px solid ${C.line}` }}>
        <div className="font-serif text-xs mb-1" style={{ color: C.muted }}>The word being practised</div>
        <div className="font-type text-[21px]" style={{ color: C.ink }}>{word}</div>
        <div className="font-serif text-[15px]" style={{ color: C.ink }}>{gloss}</div>
        <div className="font-serif text-xs mb-3" style={{ color: C.muted }}>{meta.line}</div>
        {canSpeak && (
          <button onClick={onSayWord} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            <Volume2 size={13} /> hear word
          </button>
        )}

        <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
          <div className="font-serif text-xs mb-1" style={{ color: C.muted }}>Seen this batch</div>
          <div className="font-serif text-sm" style={{ color: C.ink }}>
            {stages.map((st, i) => (
              <span key={st.key}>
                {i > 0 && <span style={{ color: C.muted }}> · </span>}
                <span style={{ color: st.done ? C.ink : C.muted }}>{st.label}</span>
                {st.done && <span style={{ color: C.green }}> ✓</span>}
              </span>
            ))}
          </div>
          <p className="font-serif text-xs mt-1.5" style={{ color: C.muted }}>
            Sentence is the last stage before the word is scheduled.
          </p>
        </div>

        {note && (
          <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
            <div className="font-serif text-xs mb-1" style={{ color: C.muted }}>Note</div>
            <p className="font-serif text-sm" style={{ color: C.ink }}>{note}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
