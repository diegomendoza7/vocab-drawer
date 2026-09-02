import { Volume2, Eye, EyeOff, Plus, ArrowRight } from "lucide-react";
import { C, TINT } from "../theme.js";

/* Reading Corner at ≥1024px — the passage on the left, the questions beside it.
 *
 * The mobile flow is readingSelect → readingQuiz → readingDone, which hides the
 * passage exactly when you are being asked about it: the question shows one
 * sentence with a blank and the surrounding text is gone. At this width there
 * is room to stop doing that, so the passage holds the left column and only the
 * question card advances.
 *
 * The four asked-about words are underlined in the passage. That is the whole
 * reason the passage is worth keeping on screen — you can see where the
 * question came from before you answer it.
 */
export default function ReadingCorner({
  langName, level, levels, onLevelChange,
  lesson, readCount, totalLessons,
  idx, item, choices, picked, selected, onSelect, onCheck, onSkip, onNext,
  log, showEnglish, onToggleEnglish, canSpeak, onSay,
  unknownWords, onAddUnknown, nextUp,
}) {
  const asked = new Set((lesson?.items || []).map((i) => i.blank));
  const total = lesson?.items.length || 0;
  const answered = picked != null;

  /* The passage is one string; the words the questions ask about are marked in
   * it by matching on the answer. Splitting on the words themselves keeps the
   * punctuation and spacing of the original intact. */
  const marked = () => {
    const parts = String(lesson?.passage || "").split(/(\s+)/);
    return parts.map((tok, i) => {
      const bare = tok.replace(/[^\p{L}\p{M}'’-]/gu, "");
      if (!bare || !asked.has(bare)) return tok;
      return (
        <span key={i} style={{ borderBottom: `1px solid ${C.gold}` }}>{tok}</span>
      );
    });
  };

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Reading Corner</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {level} · {readCount} of {totalLessons} passages read
        </span>
        <span className="flex-1" />
        <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {levels.map((lv) => (
            <button key={lv} onClick={() => onLevelChange(lv)}
              className="px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: lv === level ? TINT : "transparent",
                color: C.ink,
                borderLeft: lv === levels[0] ? "none" : `1px solid ${C.line}`,
              }}>
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* ---------------- passage ---------------- */}
        <div className="min-w-0">
          <h3 className="font-type text-[26px] leading-tight" style={{ color: C.ink }}>{lesson?.title}</h3>
          <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>{lesson?.source}</p>

          <p className="font-serif" style={{ color: C.ink, maxWidth: "56ch", textAlign: "justify", lineHeight: 1.85 }}>
            {marked()}
          </p>
          {showEnglish && (
            <p className="font-serif italic mt-3" style={{ color: C.muted, maxWidth: "56ch", lineHeight: 1.7 }}>
              {lesson?.passageEn}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button onClick={onToggleEnglish} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              {showEnglish ? <EyeOff size={13} /> : <Eye size={13} />} {showEnglish ? "Hide English" : "Show English"}
            </button>
            {canSpeak && (
              <button onClick={onSay} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
                style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Volume2 size={13} /> Read aloud
              </button>
            )}
            <span className="font-serif text-xs" style={{ color: C.muted }}>underlined = asked about</span>
          </div>

          {unknownWords.length > 0 && (
            <div className="flex items-center gap-3 mt-6 pt-3 flex-wrap" style={{ borderTop: `1px solid ${C.line}` }}>
              <span className="font-serif text-sm" style={{ color: C.muted }}>
                {unknownWords.length} word{unknownWords.length === 1 ? "" : "s"} here {unknownWords.length === 1 ? "is" : "are"} not in your deck: {unknownWords.join(", ")}
              </span>
              <span className="flex-1" />
              <button onClick={onAddUnknown} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0"
                style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Plus size={13} /> Add {unknownWords.length} to My Words
              </button>
            </div>
          )}
        </div>

        {/* ---------------- questions ---------------- */}
        <div className="flex flex-col gap-3">
          {item ? (
            <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
              <div className="text-xs font-semibold mb-2" style={{ color: C.muted }}>Question {idx + 1} of {total}</div>
              <p className="font-serif text-[15px] mb-3" style={{ color: C.ink, lineHeight: 1.6 }}>
                {item.text.split("_____").map((chunk, i, arr) => (
                  <span key={i}>
                    {chunk}
                    {i < arr.length - 1 && (
                      <span className="inline-block align-middle mx-1" style={{ minWidth: 58, borderBottom: `1px dashed ${C.muted}`, height: "1.1em" }} />
                    )}
                  </span>
                ))}
              </p>

              <div className="flex flex-col gap-1.5 mb-3">
                {choices.map((c, i) => {
                  const isCorrect = c === item.blank;
                  const isSel = c === selected;
                  let bg = C.paper, border = C.line, color = C.ink;
                  if (answered) {
                    if (isCorrect) { bg = C.green; border = C.green; color = C.card; }
                    else if (c === picked) { bg = C.red; border = C.red; color = C.card; }
                  } else if (isSel) { bg = TINT; border = C.gold; }
                  return (
                    <button key={c} onClick={() => !answered && onSelect(c)} disabled={answered}
                      className="px-3 py-2 rounded-md text-sm font-serif text-left flex items-baseline gap-2"
                      style={{ backgroundColor: bg, border: `1px solid ${border}`, color }}>
                      <span className="text-[10px] tabular-nums shrink-0" style={{ opacity: 0.55 }}>{i + 1}</span>
                      {c}
                    </button>
                  );
                })}
              </div>

              {answered ? (
                <button onClick={onNext} className="w-full py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: C.gold, color: C.ink }}>
                  {idx + 1 < total ? "Next question" : "Finish"} <ArrowRight size={14} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={onCheck} disabled={selected == null}
                    className="flex-1 py-2 rounded-md font-semibold text-sm disabled:opacity-40"
                    style={{ border: `1px solid ${C.gold}`, color: C.gold }}>
                    Check
                  </button>
                  <button onClick={onSkip} className="px-4 py-2 rounded-md font-semibold text-sm"
                    style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    Skip
                  </button>
                </div>
              )}
              <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
                1–{choices.length} to pick · enter to check. The passage stays put; only this card advances.
              </p>
            </div>
          ) : (
            <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="font-serif text-sm" style={{ color: C.muted }}>Passage finished.</div>
            </div>
          )}

          <div className="rounded-lg p-4" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
            <div className="font-type text-lg mb-2" style={{ color: C.ink }}>This passage</div>
            {(lesson?.items || []).map((q, i) => {
              const entry = log[i];
              const state = i === idx && !answered ? "answering…"
                : entry?.skipped ? "skipped"
                : entry ? (entry.correct ? "first try" : "missed")
                : "not yet";
              const tone = entry?.correct ? C.green : entry && !entry.skipped ? C.red : C.muted;
              return (
                <div key={i} className="flex items-baseline justify-between gap-2 py-0.5">
                  <span className="font-serif text-sm truncate" style={{ color: i === idx ? C.gold : C.ink }}>
                    {i + 1}. {q.blank}
                  </span>
                  <span className="font-serif text-xs shrink-0" style={{ color: i === idx && !answered ? C.gold : tone }}>{state}</span>
                </div>
              );
            })}
          </div>

          {nextUp && (
            <div className="rounded-lg p-3" style={{ border: `1px solid ${C.line}` }}>
              <span className="font-serif text-xs" style={{ color: C.muted }}>Next: {nextUp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
