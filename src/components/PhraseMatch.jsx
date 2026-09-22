import { ArrowRight } from "lucide-react";
import { C, TINT } from "../theme.js";

/* Phrase Match at ≥1024px — the two halves side by side.
 *
 * On a phone the French column and the English column stack, so making a match
 * means scrolling from one to the other and back, holding the candidate in your
 * head while you go. Facing columns are the whole point of the extra width.
 *
 * A solved pair drops into the ledger below *with its literal reading*. That is
 * the part worth seeing at the moment of the match — "to have other cats to
 * whip" is why the idiom is memorable — and holding it back for a results
 * screen, as the mobile flow does, spends it on the wrong moment.
 */
export default function PhraseMatch({
  langName, level, levels, onLevelChange,
  left, right, matched, pending, wrongFlash, wrongTries,
  onSelect, onNextLevel, byPhrase,
}) {
  const done = matched.length;
  const total = left.length;

  const tile = (p, side, label) => {
    const isMatched = matched.includes(p.phrase);
    const isSel = pending[side] === p.phrase;
    return (
      <button
        key={p.phrase + side}
        disabled={isMatched}
        onClick={() => onSelect(side, p.phrase)}
        className={`text-left px-3 py-2.5 rounded-md text-sm font-serif flex items-baseline justify-between gap-2 ${isSel && wrongFlash ? "shake" : ""}`}
        style={{
          backgroundColor: isMatched ? "transparent" : isSel ? TINT : C.card,
          color: isMatched ? C.muted : C.ink,
          border: isMatched ? `1px dashed ${C.line}` : `1px solid ${isSel ? C.gold : C.line}`,
          borderLeft: isSel && !isMatched ? `3px solid ${C.gold}` : undefined,
          opacity: isMatched ? 0.55 : 1,
        }}
      >
        <span>{label}</span>
        {isMatched && side === "left" && <span className="text-xs shrink-0" style={{ color: C.muted }}>paired</span>}
      </button>
    );
  };

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Phrase Match</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {level} · idioms, six at a time
        </span>
        <span className="flex-1" />
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {done} of {total} paired{wrongTries > 0 ? ` · ${wrongTries} wrong ${wrongTries === 1 ? "try" : "tries"}` : ""}
        </span>
      </div>

      <div className="grid gap-[18px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div className="font-serif text-sm mb-2" style={{ color: C.muted }}>The {langName}</div>
          <div className="flex flex-col gap-2">{left.map((p) => tile(p, "left", p.phrase))}</div>
        </div>
        <div>
          <div className="font-serif text-sm mb-2" style={{ color: C.muted }}>What it means</div>
          <div className="flex flex-col gap-2">{right.map((p) => tile(p, "right", p.meaning))}</div>
        </div>
      </div>

      <p className="font-serif text-sm mt-3" style={{ color: C.muted }}>
        Click one from each column. Wrong pairs flash and stay; right pairs grey out here and appear below with the literal.
      </p>

      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
        <h3 className="font-type text-xl mb-2" style={{ color: C.ink }}>Paired so far</h3>
        {done === 0 ? (
          <p className="font-serif text-sm" style={{ color: C.muted }}>Nothing yet — the literal reading of each idiom appears here as you pair it.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {matched.map((id) => {
              const p = byPhrase(id);
              if (!p) return null;
              return (
                <div key={id}>
                  <div className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>{p.phrase}</div>
                  <div className="font-serif text-xs" style={{ color: C.muted }}>{p.meaning} · {p.literal}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-6 flex-wrap">
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {levels.join(" · ")} — {levels.length * total} idioms per language
        </span>
        <span className="flex-1" />
        <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {levels.map((lv) => (
            <button key={lv} onClick={() => onLevelChange(lv)} className="px-3 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: lv === level ? TINT : "transparent", color: C.ink, borderLeft: lv === levels[0] ? "none" : `1px solid ${C.line}` }}>
              {lv}
            </button>
          ))}
        </div>
        <button onClick={onNextLevel} disabled={done < total}
          className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 disabled:opacity-40"
          style={{ border: `1px solid ${C.gold}`, color: C.gold }}>
          Next six <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
