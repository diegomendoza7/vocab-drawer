import { Check, X, ArrowRight, Compass } from "lucide-react";
import { C, TINT } from "../theme.js";
import { PASS, placementSummary } from "../lib/placement.js";

/* The short check that says where to start.
 *
 * Three states in one component because they are one flow: the offer, the
 * questions, and the result. It is deliberately plain — no score, no
 * celebration, no percentage in large type. A placement test that feels like
 * an exam gets abandoned halfway, and a half-finished placement test is worse
 * than none because it places the learner too low.
 */
export default function Placement({
  langName, stage, question, asked, total, level, result, lastResult,
  onStart, onAnswer, onNext, onAccept, onKeep, picked,
}) {
  if (stage === "offer") {
    return (
      <div style={{ maxWidth: "44rem" }}>
        <div className="flex items-center gap-2 mb-2">
          <Compass size={20} style={{ color: C.accent }} />
          <h2 className="font-type text-2xl" style={{ color: C.ink }}>Where should you start?</h2>
        </div>
        <p className="font-serif mb-4" style={{ color: C.muted, lineHeight: 1.7, maxWidth: "62ch" }}>
          A few {langName} words, four meanings each. It works up through the levels and stops as
          soon as the words stop being familiar, so it is short — usually a couple of minutes.
          Nothing is marked as learned by taking it: it recommends a level and gives you a rough
          sense of your vocabulary, and the words themselves are still earned one at a time.
        </p>
        {lastResult && (
          <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
            You last placed at <b style={{ color: C.ink }}>{lastResult.level}</b> on {lastResult.at}
            {lastResult.estimate ? <> — roughly {lastResult.estimate.toLocaleString()} words.</> : "."}
          </p>
        )}
        <button onClick={onStart} className="px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
          Start the check <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  if (stage === "asking" && question) {
    return (
      <div style={{ maxWidth: "40rem" }}>
        <div className="flex justify-between items-baseline text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
          <span>Placement · {question.level}</span>
          <span>{asked + 1} of {total} at this level</span>
        </div>
        <div className="w-full h-1.5 rounded-full mb-6" style={{ backgroundColor: C.line }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${(asked / total) * 100}%`, backgroundColor: C.green }} />
        </div>

        <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
          <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>What does this mean?</div>
          <div className="font-type text-3xl mb-5" style={{ color: C.ink }}>{question.word.t}</div>

          <div className="flex flex-col gap-2">
            {question.options.map((o) => {
              const chosen = picked === o;
              const isAnswer = o === question.answer;
              const show = picked != null;
              return (
                <button
                  key={o}
                  disabled={show}
                  onClick={() => onAnswer(o)}
                  className="px-3 py-2.5 rounded-md font-serif text-left text-sm flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: show && isAnswer ? TINT : "transparent",
                    border: `1px solid ${show && isAnswer ? C.green : chosen ? C.red : C.line}`,
                    color: C.ink,
                  }}
                >
                  {o}
                  {show && isAnswer && <Check size={15} style={{ color: C.green }} />}
                  {show && chosen && !isAnswer && <X size={15} style={{ color: C.red }} />}
                </button>
              );
            })}
          </div>

          {picked != null && (
            <div className="flex justify-end mt-5">
              <button onClick={onNext} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* No running score. Seeing "2/6" mid-test invites people to stop. */}
        <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
          Guessing is fine — the test stops on its own once the words stop being familiar.
        </p>
      </div>
    );
  }

  if (stage === "done" && result) {
    return (
      <div style={{ maxWidth: "44rem" }}>
        <h2 className="font-type text-2xl mb-1" style={{ color: C.ink }}>
          {langName} — you placed at {result.level}
        </h2>
        <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "62ch", lineHeight: 1.7 }}>
          {placementSummary(result)}
        </p>

        <div className="rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
          <div className="grid gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ gridTemplateColumns: "70px 1fr 90px", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
            <span>Level</span><span>Recognised</span><span>Held</span>
          </div>
          {result.rows.map((r) => (
            <div key={r.level} className="grid gap-3 px-4 py-2.5 items-center font-serif text-sm"
              style={{ gridTemplateColumns: "70px 1fr 90px", borderTop: `1px solid ${C.line}` }}>
              <span className="font-type" style={{ color: C.ink }}>{r.level}</span>
              <span style={{ color: C.muted }}>
                {r.right} of {r.asked}
                <span className="inline-block align-middle ml-2 rounded-full overflow-hidden" style={{ width: 90, height: 5, backgroundColor: C.paper }}>
                  <span className="block h-full" style={{ width: `${r.share * 100}%`, backgroundColor: r.share >= PASS ? C.green : C.line }} />
                </span>
              </span>
              <span style={{ color: r.share >= PASS ? C.green : C.muted }}>{r.share >= PASS ? "yes" : "not yet"}</span>
            </div>
          ))}
        </div>

        {result.estimate > 0 && (
          <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "62ch", lineHeight: 1.7 }}>
            Scaled across the deck that is roughly <b style={{ color: C.ink }}>{result.estimate.toLocaleString()}</b> words
            you already recognise. A sample of {result.asked} stands behind that number, so treat it as a bearing rather than a count.
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={onAccept} className="px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
            Start at {result.level} <ArrowRight size={16} />
          </button>
          <button onClick={onKeep} className="px-4 py-2.5 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            Stay on {level}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
