import { Check, X, ArrowRight, Lightbulb } from "lucide-react";
import { C, TINT } from "../theme.js";
import { ENGLISH_DEMO } from "../data/morphology.js";
import { familyWords, affixesUsed } from "../lib/morphology.js";
import WordParts from "./WordParts.jsx";

/* Word building: one root, and everything the language makes out of it.
 *
 * The etymology tree answers "where did this come from". This answers the more
 * immediately useful question — "what else do I now get for free" — and the
 * answer is usually eight or nine words. German verbs take about sixteen
 * productive prefixes, so a learner who knows `sprechen` and the prefix table
 * can read `widersprechen` without ever having met it.
 *
 * The English demo at the top is not filler. Everyone already does this in
 * their own language without noticing; showing unbecoming pulled apart is the
 * shortest way to say "now do that to German".
 */

function Affixes({ affixes, onOpen, openId }) {
  if (!affixes.length) return null;
  return (
    <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="font-serif text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>
        The parts at work here — what each one does
      </div>
      <div className="flex flex-col gap-1.5">
        {affixes.map((a) => {
          const open = openId === a.id;
          return (
            <div key={a.id}>
              <button onClick={() => onOpen(open ? null : a.id)}
                className="w-full text-left px-3 py-2 rounded-md flex items-baseline gap-2"
                style={{ backgroundColor: open ? TINT : C.card, border: `1px solid ${C.line}` }}>
                <span className="font-type text-[15px]" style={{ color: C.gold, minWidth: 74 }}>{a.form}</span>
                <span className="font-serif text-sm flex-1" style={{ color: C.ink }}>{a.sense}</span>
                {a.en && a.en !== "—" && (
                  <span className="font-serif text-xs shrink-0" style={{ color: C.muted }}>≈ {a.en}</span>
                )}
              </button>
              {open && (
                <div className="px-3 py-2 rounded-b-md" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, borderTop: "none" }}>
                  {a.ex.map(([from, to, gloss]) => (
                    <div key={to} className="font-serif text-sm py-0.5" style={{ color: C.ink }}>
                      <span style={{ color: C.muted }}>{from}</span>
                      <span style={{ color: C.muted }}> → </span>
                      <span className="font-type">{to}</span>
                      <span style={{ color: C.muted }}> — {gloss}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FamilyDetail({ family, lang, onPractise, openAffix, onOpenAffix }) {
  const words = familyWords(family);
  const affixes = affixesUsed(family, lang);
  return (
    <div>
      <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>Root</div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-3xl" style={{ color: C.ink }}>{family.root}</h2>
        <span className="font-serif text-[17px]" style={{ color: C.muted }}>“{family.gloss}”</span>
      </div>
      <p className="font-serif text-[15px] mb-4" style={{ color: C.muted }}>
        {words.length} words in this family. Learn the root once and the rest are the root plus a part you already know.
      </p>

      {family.note && (
        <p className="font-serif text-sm mb-4 rounded-md px-3 py-2" style={{ color: C.ink, backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          {family.note}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {words.map((w) => (
          <div key={w.w} className="flex items-baseline gap-3 flex-wrap px-3 py-2 rounded-md"
            style={{ backgroundColor: w.base ? TINT : C.card, border: `1px solid ${w.base ? C.gold : C.line}` }}>
            <WordParts notation={w.p} size={16} />
            <span className="font-serif text-[15px]" style={{ color: C.ink }}>
              {w.g && <span style={{ color: C.muted }}>{w.g} </span>}
              {w.e}
            </span>
            {w.base && <span className="font-serif text-xs" style={{ color: C.gold }}>the root itself</span>}
            {w.n && (
              <span className="font-serif text-xs w-full flex items-baseline gap-1.5" style={{ color: C.muted }}>
                <Lightbulb size={12} style={{ color: C.gold, flexShrink: 0, position: "relative", top: 2 }} /> {w.n}
              </span>
            )}
          </div>
        ))}
      </div>

      <button onClick={onPractise} className="mt-4 px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-2"
        style={{ backgroundColor: C.gold, color: C.ink }}>
        Practise this family <ArrowRight size={14} />
      </button>

      <Affixes affixes={affixes} onOpen={onOpenAffix} openId={openAffix} />
    </div>
  );
}

function Quiz({ quiz, picked, onPick, onNext, onBack, stats }) {
  return (
    <div>
      <button onClick={onBack} className="font-serif text-xs mb-3" style={{ color: C.muted }}>← back to the family</button>

      <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
        <div className="font-serif text-sm mb-2" style={{ color: C.muted }}>
          You know <span className="font-type" style={{ color: C.ink }}>{quiz.base.w}</span> — “{quiz.base.e}”.
        </div>
        <div className="font-type text-[21px] mb-4" style={{ color: C.ink }}>
          Which word means “{quiz.ask}”?
        </div>

        <div className="flex flex-col gap-1.5">
          {quiz.options.map((o) => {
            const right = o.w === quiz.answer;
            const chosen = picked === o.w;
            const border = picked ? (right ? C.green : chosen ? C.red : C.line) : C.line;
            return (
              <button key={o.w} onClick={() => !picked && onPick(o.w)} disabled={Boolean(picked)}
                className="px-3 py-2 rounded-md text-left flex items-baseline gap-3"
                style={{ backgroundColor: chosen ? TINT : C.paper, border: `1px solid ${border}` }}>
                <WordParts notation={o.p} size={15} />
                {picked && (
                  <span className="font-serif text-sm" style={{ color: right ? C.green : C.muted }}>{o.e}</span>
                )}
                {picked && right && <Check size={14} style={{ color: C.green }} />}
                {picked && chosen && !right && <X size={14} style={{ color: C.red }} />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-4">
          {picked && (
            <button onClick={onNext} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
              style={{ backgroundColor: C.gold, color: C.ink }}>
              Next <ArrowRight size={14} />
            </button>
          )}
          <span className="flex-1" />
          <span className="font-serif text-sm" style={{ color: C.muted }}>{stats.right} of {stats.asked} right</span>
        </div>
      </div>

      <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
        Every option is built on the same root, so the prefix is the only thing telling them apart. That is the point.
      </p>
    </div>
  );
}

/* The picker, exported on its own so the section keeps ONE sidebar.
 * Nesting a second list inside the workbench's would leave two columns of
 * navigation and no obvious rule about which one owns the selection. */
export function BuilderList({ families, selectedFamily, onSelectFamily }) {
  const avg = Math.round(families.reduce((n, f) => n + f.members.length + 1, 0) / Math.max(1, families.length));
  return (
    <>
      <div className="font-serif text-xs mb-2" style={{ color: C.muted }}>
        {families.length} roots, carrying {avg} words each on average.
      </div>
      <div className="flex flex-col gap-0.5">
        {families.map((f) => {
          const active = selectedFamily === f.id;
          return (
            <button key={f.id} onClick={() => onSelectFamily(f.id)}
              className="px-2.5 py-1.5 rounded-md text-left"
              style={{ backgroundColor: active ? TINT : "transparent", border: `1px solid ${active ? C.line : "transparent"}` }}>
              <div className="font-type text-[15px] leading-tight" style={{ color: C.ink }}>{f.root}-</div>
              <div className="font-serif text-[11px] leading-tight" style={{ color: C.muted }}>
                {f.gloss} · {f.members.length + 1} words
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function WordBuilder({
  lang, families, selectedFamily,
  quiz, picked, onPick, onNextQuiz, onPractise, onEndQuiz, quizStats,
  openAffix, onOpenAffix,
}) {
  const family = families.find((f) => f.id === selectedFamily) || null;
  if (quiz) {
    return <Quiz quiz={quiz} picked={picked} onPick={onPick} onNext={onNextQuiz} onBack={onEndQuiz} stats={quizStats} />;
  }
  if (family) {
    return <FamilyDetail family={family} lang={lang} onPractise={onPractise}
      openAffix={openAffix} onOpenAffix={onOpenAffix} />;
  }
  return (
    <div>
      {/* Everyone already does this in the language they think in. */}
      <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
        <div className="font-serif text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>
          You already do this
        </div>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <WordParts notation={ENGLISH_DEMO.p} size={20} showKinds />
          <span className="font-serif text-[15px]" style={{ color: C.muted }}>{ENGLISH_DEMO.gloss}</span>
        </div>
        <p className="font-serif text-[15px] mb-3" style={{ color: C.ink }}>{ENGLISH_DEMO.point}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {ENGLISH_DEMO.family.map((w) => (
            <span key={w.w} className="flex items-baseline gap-1.5">
              <WordParts notation={w.p} size={14} />
              <span className="font-serif text-xs" style={{ color: C.muted }}>{w.e}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="font-serif text-sm" style={{ color: C.muted }}>
        Pick a root on the left to do the same to {lang === "fr" ? "French" : "German"}.
      </p>
    </div>
  );
}
