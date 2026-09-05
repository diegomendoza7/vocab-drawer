import { Timer, Zap, RotateCcw, ArrowRight, TrendingUp } from "lucide-react";
import { C, TINT } from "../theme.js";
import { ROUND_SECONDS, MIN_POOL, MIN_ACCURACY_FOR_BEST } from "../lib/fluency.js";

/* Fluency: one minute, known words only, as fast as you can go.
 *
 * The design brief is unusually strict, because the exercise stops working if
 * it drifts. It has to stay *easy* — so the screen carries no new vocabulary,
 * no spelling, and no penalty worth fearing. It has to stay *fast* — so an
 * answer advances immediately with no confirm step, and the feedback is a
 * colour rather than a sentence to read. And the number has to be visible, and
 * the same number every time, or "am I getting faster?" has no answer.
 */

function Bar({ runs, best }) {
  if (!runs.length) return null;
  const top = Math.max(best || 0, ...runs.map((r) => r.s), 1);
  return (
    <div className="flex items-end gap-1" style={{ height: 44 }}>
      {runs.slice(-24).map((r, i) => (
        <div key={i} title={`${r.d}: ${r.s}/min at ${r.a}%`}
          style={{
            width: 7,
            height: `${Math.max(4, (r.s / top) * 44)}px`,
            backgroundColor: r.a >= MIN_ACCURACY_FOR_BEST * 100 ? C.gold : C.line,
            borderRadius: 2,
          }} />
      ))}
    </div>
  );
}

/* The number badge, matching the one the choose and sentence screens use so a
 * learner who has met it once recognises it here. */
function Cap({ n }) {
  return (
    <span className="inline-flex items-center justify-center rounded text-[11px] font-semibold shrink-0"
      style={{ width: 18, height: 18, lineHeight: 1, border: `1px solid ${C.line}`, color: C.muted, opacity: 0.85 }}
      aria-hidden="true">{n}</span>
  );
}

export default function FluencyRound({
  poolSize, settledCount, readiness, onStudy, direction, onDirection, hasKeys,
  phase, secondsLeft, item, streak, answered,
  onAnswer, onStart, onAgain, onHome,
  score, verdict, record, langName, lastWrong,
}) {
  /* Not enough known words. Saying so plainly, with the number, is more use
   * than an empty screen — and it is a real answer, not a failure: fluency work
   * on half-learned words is the one thing it must not be. */
  if (poolSize < MIN_POOL) {
    const short = MIN_POOL - poolSize;
    const nearly = readiness?.almost ?? 0;
    return (
      <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, maxWidth: 560 }}>
        <h2 className="font-type text-2xl mb-2" style={{ color: C.ink }}>Almost</h2>
        <p className="font-serif text-[15px] mb-3" style={{ color: C.ink }}>
          Speed work only helps on words you already know — racing half-learned ones
          teaches you to guess quickly, which is the opposite of the point.
        </p>

        <div className="rounded-md px-3 py-2.5 mb-4" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
          <div className="font-serif text-sm" style={{ color: C.ink }}>
            <span className="font-type">{poolSize}</span> of <span className="font-type">{MIN_POOL}</span> {langName} words ready.
          </div>
          {nearly > 0 ? (
            <div className="font-serif text-sm mt-1" style={{ color: C.muted }}>
              <span className="font-type" style={{ color: C.ink }}>{nearly}</span> more {nearly === 1 ? "is" : "are"} one
              correct review away — do your reviews and {nearly >= short ? "this opens" : "you will be closer"}.
            </div>
          ) : (
            <div className="font-serif text-sm mt-1" style={{ color: C.muted }}>
              {readiness?.studied
                ? "Keep reviewing what you have started."
                : `Study a drawer, review it tomorrow, and ${MIN_POOL} words will be enough to open this.`}
            </div>
          )}
        </div>

        {/* The honest timeline, because "not yet" without a "when" is a dead end. */}
        <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
          A word joins the pool after two correct reviews — normally the day after you first
          study it. One ten-word drawer today and its review tomorrow is enough.
        </p>

        <div className="flex gap-2">
          {onStudy && (
            <button onClick={onStudy} className="px-4 py-2 rounded-md font-semibold text-sm"
              style={{ backgroundColor: C.gold, color: C.ink }}>Study a drawer</button>
          )}
          <button onClick={onHome} className="px-4 py-2 rounded-md font-semibold text-sm"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}>Not now</button>
        </div>
      </div>
    );
  }

  if (phase === "running" && item) {
    const urgent = secondsLeft <= 10;
    return (
      <div style={{ maxWidth: 560 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="font-type text-3xl tabular-nums" style={{ color: urgent ? C.red : C.ink }}>
            {secondsLeft}
          </div>
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
            <div className="h-1.5 rounded-full" style={{
              width: `${(secondsLeft / ROUND_SECONDS) * 100}%`,
              backgroundColor: urgent ? C.red : C.gold,
              transition: "width 1s linear",
            }} />
          </div>
          <div className="font-serif text-sm tabular-nums" style={{ color: C.muted }}>{answered} done</div>
        </div>

        <div className="rounded-lg p-6 mb-3 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
          <div className="font-type text-[30px] leading-tight" style={{ color: C.ink }}>{item.prompt}</div>
          {streak >= 3 && (
            <div className="font-serif text-xs mt-1" style={{ color: C.gold }}>{streak} in a row</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {item.options.map((o, i) => (
            <button key={o} onClick={() => onAnswer(o)}
              className="px-4 py-3 rounded-md font-serif text-[17px] text-left flex items-center gap-2.5"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.ink }}>
              {hasKeys && <Cap n={i + 1} />}
              {o}
            </button>
          ))}
        </div>
        {hasKeys && (
          <p className="font-serif text-xs mt-2 text-center" style={{ color: C.muted }}>
            {/* The whole point is measuring recall, not mouse travel. */}
            press 1, 2 or 3 — reaching for the mouse measures your aim, not your French
          </p>
        )}

        {/* One line, and only the correction — reading anything longer costs
          * more time than the mistake did. */}
        <div className="font-serif text-sm mt-3 text-center" style={{ color: C.red, minHeight: 20 }}>
          {lastWrong ? `${lastWrong.prompt} = ${lastWrong.answer}` : ""}
        </div>
      </div>
    );
  }

  if (phase === "done" && score) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>A minute of {langName}</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-type text-5xl" style={{ color: C.ink }}>{score.perMinute}</span>
            <span className="font-serif text-lg" style={{ color: C.muted }}>a minute</span>
          </div>
          <div className="font-serif text-sm mb-3" style={{ color: C.muted }}>
            {score.correct} right of {score.attempted} · {Math.round(score.accuracy * 100)}% accurate
          </div>
          <p className="font-serif text-[15px]" style={{ color: C.ink }}>{verdict}</p>
        </div>

        {record?.runs?.length > 1 && (
          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-baseline gap-2 mb-2">
              <TrendingUp size={14} style={{ color: C.gold }} />
              <span className="font-serif text-xs uppercase tracking-wide" style={{ color: C.muted }}>Your last rounds</span>
              <span className="flex-1" />
              <span className="font-serif text-xs" style={{ color: C.muted }}>best {record.best}/min</span>
            </div>
            <Bar runs={record.runs} best={record.best} />
            <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
              Grey bars are rounds under {Math.round(MIN_ACCURACY_FOR_BEST * 100)}% — they do not count towards the record.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onAgain} className="px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2"
            style={{ backgroundColor: C.gold, color: C.ink }}>
            <RotateCcw size={15} /> Go again {hasKeys && <Cap n="↵" />}
          </button>
          <button onClick={onHome} className="px-4 py-2.5 rounded-md font-semibold text-sm"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}>Done</button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div style={{ maxWidth: 560 }}>
      <h2 className="font-type text-2xl mb-1" style={{ color: C.ink }}>Fluency</h2>
      <p className="font-serif text-[15px] mb-4" style={{ color: C.muted }}>
        One minute, as fast as you can. Only words you already know — nothing here is new,
        and nothing you do counts against your review schedule.
      </p>

      <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
        <p className="font-serif text-sm" style={{ color: C.ink }}>
          Knowing a word in six seconds and knowing it in one are different abilities, and only
          the second survives a conversation. This is the one that trains the second.
        </p>
      </div>

      <div className="flex rounded-md overflow-hidden mb-4" style={{ border: `1px solid ${C.line}` }}>
        {[["recognise", `${langName} → English`], ["produce", `English → ${langName}`]].map(([id, label], i) => (
          <button key={id} onClick={() => onDirection(id)}
            className="flex-1 px-3 py-2 text-sm font-semibold"
            style={{ backgroundColor: direction === id ? TINT : "transparent", color: C.ink,
              borderLeft: i ? `1px solid ${C.line}` : "none" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4 font-serif text-sm" style={{ color: C.muted }}>
        <span className="flex items-center gap-1.5"><Timer size={14} /> {ROUND_SECONDS} seconds</span>
        {/* Settled words are better material than freshly-learned ones, so the
          * mix is stated rather than hidden behind a single total. */}
        <span className="flex items-center gap-1.5">
          <Zap size={14} /> {poolSize} words in play
          {settledCount < poolSize && (
            <span style={{ opacity: 0.75 }}>· {settledCount} settled</span>
          )}
        </span>
        {record?.best > 0 && <span>best {record.best}/min</span>}
      </div>

      {record?.runs?.length > 1 && (
        <div className="mb-4"><Bar runs={record.runs} best={record.best} /></div>
      )}

      <button onClick={onStart} className="px-6 py-3 rounded-md font-semibold flex items-center gap-2"
        style={{ backgroundColor: C.gold, color: C.ink }}>
        Start <ArrowRight size={16} />
      </button>
      {hasKeys && (
        <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
          enter to start · then answer with 1, 2 and 3
        </p>
      )}
    </div>
  );
}
