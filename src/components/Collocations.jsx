import { Check, X, ArrowRight, Lightbulb, RotateCcw } from "lucide-react";
import { C, TINT } from "../theme.js";
import SpeakButton from "./SpeakButton.jsx";

/* Collocations: which verb this noun takes.
 *
 * The screen shows the noun and three verbs, because that is the shape of the
 * real error — a learner reaching for a verb and English handing them the
 * wrong one. Answering reveals the trap, which is the actual teaching: the
 * pairing is arbitrary, so the only thing that makes it stick is being told
 * what your own language does instead.
 */
export default function Collocations({
  langName, list, quiz, picked, onPick, onNext, onStart, phase,
  stats, missed, onSay, canSpeak, hasKeys,
}) {
  if (phase === "idle") {
    return (
      <div style={{ maxWidth: "38.75rem" }}>
        <h2 className="font-type text-2xl mb-1" style={{ color: C.ink }}>Collocations</h2>
        <p className="font-serif text-[0.9375rem] mb-4" style={{ color: C.muted }}>
          Which verb a noun insists on. You can know every word in
          <span className="font-type" style={{ color: C.ink }}> une décision </span>
          and still say <em>faire</em> one, because English makes decisions and French takes them.
        </p>

        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          <p className="font-serif text-sm" style={{ color: C.ink }}>
            Nothing in a dictionary warns you about these. The pairing is arbitrary, frequent, and
            invisible until you get it wrong out loud — which is why they are worth learning as pairs
            rather than as words.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4 font-serif text-sm" style={{ color: C.muted }}>
          <span>{list.length} pairs in {langName}</span>
          {stats.asked > 0 && <span>last round {stats.right}/{stats.asked}</span>}
        </div>

        <button onClick={onStart} className="px-6 py-3 rounded-md font-semibold flex items-center gap-2"
          style={{ backgroundColor: C.gold, color: C.ink }}>
          Start <ArrowRight size={16} />
        </button>
        {hasKeys && (
          <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>enter to start · then answer with 1, 2 and 3</p>
        )}

        <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="font-serif text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>All of them</div>
          <div className="flex flex-col gap-1">
            {list.map((c) => (
              <div key={`${c.verb}-${c.noun}`} className="flex items-baseline gap-2 flex-wrap font-serif text-sm">
                <span className="font-type text-[0.9375rem]" style={{ color: C.ink }}>{c.verb} {c.noun}</span>
                <SpeakButton ready={canSpeak} onSay={() => onSay(`${c.verb} ${c.noun}`)} title={`Hear ${c.verb} ${c.noun}`} />
                <span style={{ color: C.muted }}>{c.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{ maxWidth: "38.75rem" }}>
        <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>Round complete</div>
          <div className="font-type text-4xl mb-1" style={{ color: C.ink }}>{stats.right}/{stats.asked}</div>
          <p className="font-serif text-sm" style={{ color: C.muted }}>
            {stats.right === stats.asked ? "Every pairing right." : "The ones below are the ones English gets wrong for you."}
          </p>
        </div>

        {missed.length > 0 && (
          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="font-serif text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>Worth a second look</div>
            {missed.map((m) => (
              <div key={`${m.verb}-${m.noun}`} className="mb-2">
                <div className="font-type text-[0.9375rem]" style={{ color: C.ink }}>{m.verb} {m.noun}
                  <span className="font-serif text-sm ml-2" style={{ color: C.muted }}>{m.en}</span>
                </div>
                <div className="font-serif text-xs" style={{ color: C.muted }}>{m.trap}</div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onStart} className="px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2"
          style={{ backgroundColor: C.gold, color: C.ink }}>
          <RotateCcw size={15} /> Go again
        </button>
      </div>
    );
  }

  if (!quiz) return null;
  const right = picked && picked === quiz.answer;

  return (
    <div style={{ maxWidth: "38.75rem" }}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-serif text-sm" style={{ color: C.muted }}>{stats.asked + 1} of {list.length}</span>
        <span className="flex-1" />
        <span className="font-serif text-sm" style={{ color: C.muted }}>{stats.right} right</span>
      </div>

      <div className="rounded-lg p-5 mb-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
        <div className="font-serif text-sm mb-1" style={{ color: C.muted }}>Which verb goes with</div>
        <div className="font-type text-[1.625rem] mb-1" style={{ color: C.ink }}>{quiz.prompt}</div>
        <div className="font-serif text-sm mb-4" style={{ color: C.muted }}>“{quiz.en}”</div>

        <div className="flex flex-col gap-2">
          {quiz.options.map((o, i) => {
            const isAnswer = o === quiz.answer;
            const chosen = picked === o;
            const border = picked ? (isAnswer ? C.green : chosen ? C.red : C.line) : C.line;
            return (
              <button key={o} onClick={() => !picked && onPick(o)} disabled={Boolean(picked)}
                className="px-3 py-2.5 rounded-md text-left flex items-center gap-2.5"
                style={{ backgroundColor: chosen ? TINT : C.paper, border: `1px solid ${border}` }}>
                {hasKeys && !picked && (
                  <span className="inline-flex items-center justify-center rounded text-[0.6875rem] font-semibold shrink-0"
                    style={{ width: 18, height: 18, border: `1px solid ${C.line}`, color: C.muted }} aria-hidden="true">{i + 1}</span>
                )}
                <span className="font-type text-[1.0625rem]" style={{ color: C.ink }}>{o}</span>
                {picked && isAnswer && <Check size={15} style={{ color: C.green }} />}
                {picked && chosen && !isAnswer && <X size={15} style={{ color: C.red }} />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="mt-4">
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="font-type text-[1.1875rem]" style={{ color: right ? C.green : C.ink }}>
                {quiz.answer} {quiz.prompt}
              </span>
              <SpeakButton ready={canSpeak} onSay={() => onSay(`${quiz.answer} ${quiz.prompt}`)} title="Hear it" />
            </div>
            {/* The trap is the lesson — an arbitrary pairing only sticks once
              * you are told what your own language does instead. */}
            <p className="font-serif text-sm flex items-baseline gap-1.5" style={{ color: C.muted }}>
              <Lightbulb size={13} style={{ color: C.gold, flexShrink: 0, position: "relative", top: 2 }} />
              {quiz.trap}
            </p>
            <button onClick={onNext} className="mt-4 px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
              style={{ backgroundColor: C.gold, color: C.ink }}>
              Next <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
