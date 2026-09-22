import { GitBranch, Waves, Blocks, Check, X, ArrowRight, Volume2 } from "lucide-react";
import { C, TINT } from "../theme.js";
import { LAYERS } from "../data/etymology.js";
import WordTree from "./WordTree.jsx";
import WordBuilder, { BuilderList } from "./WordBuilder.jsx";
import SpeakButton from "./SpeakButton.jsx";

/* Etymology at ≥1024px.
 *
 * Three ways in, because they answer different questions. **Building** takes a
 * root apart and shows the eight or nine words made from it — the most
 * immediately useful of the three, and the reason it comes first. **Ancestry**
 * goes backwards instead, to the fork where French and German stopped
 * agreeing. **Sound laws** starts from the change itself and shows the words
 * it produced.
 *
 * Building and Ancestry are easy to confuse and worth keeping apart: one is
 * how a word is assembled today, the other is where it came from. A learner
 * can use the first this afternoon.
 *
 * The practice at the end is the part that matters. Reading "Latin p ↔ Germanic
 * f" and nodding is not learning it; being handed a Latin word you have not
 * seen and asked for the German is. So the drill keeps the worked examples on
 * screen and hides only the answer — it is testing whether you can run the
 * rule, not whether you memorised the list.
 */

const LANG_NAME = { la: "Latin", fr: "French", de: "German", en: "English" };

/* The pairs table.
 *
 * The four language columns all mean the row's meaning — that is the claim the
 * layout makes, and it has to hold in every cell. The last column makes a
 * different claim, which is exactly why it is a different column: a word grown
 * from the same root that then went somewhere else. Latin calidus is "hot";
 * English cauldron descends from it and is a pot. Both are worth showing, and
 * printing cauldron under a heading that says "hot" tells a lie about one.
 */
function Pairs({ pairs, hide, onSay, canSpeak }) {
  const cols = ["la", "fr", "de", "en"];
  const anyKin = pairs.some((p) => p.kin);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="font-serif text-xs font-normal pb-1.5 pr-3" style={{ color: C.muted }}>meaning</th>
            {cols.map((c) => (
              <th key={c} className="font-serif text-xs font-normal pb-1.5 pr-3" style={{ color: C.muted }}>{LANG_NAME[c]}</th>
            ))}
            {anyKin && (
              <th className="font-serif text-xs font-normal pb-1.5" style={{ color: C.gold }}>
same root, different meaning
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={p.g} style={{ borderTop: `1px solid ${C.line}` }}>
              <td className="font-serif text-sm py-1.5 pr-3" style={{ color: C.muted }}>{p.g}</td>
              {cols.map((c) => {
                const blank = !p[c] || p[c] === "—";
                const hidden = hide === c;
                return (
                  <td key={c} className="font-type text-[0.9375rem] py-1.5 pr-3"
                    style={{ color: blank ? C.muted : hidden ? C.gold : C.ink, opacity: blank ? 0.5 : 1 }}>
                    {hidden ? "?" : (p[c] || "—")}
                    {/* Only the two the device can actually pronounce. */}
                    {!hidden && !blank && (c === "fr" || c === "de") && (
                      <span className="ml-1"><SpeakButton ready={canSpeak?.(c)} onSay={() => onSay(c, p[c])} title={`Hear ${p[c]}`} /></span>
                    )}
                  </td>
                );
              })}
              {anyKin && (
                <td className="py-1.5">
                  {p.kin ? p.kin.map(([word, sense, lang]) => (
                    <div key={word} className="leading-tight">
                      <span className="font-type text-[0.9375rem]" style={{ color: C.ink }}>{word}</span>
                      {lang && lang !== "en" && (
                        <span className="font-serif text-[0.625rem] uppercase tracking-wide ml-1" style={{ color: C.gold }}>{lang}</span>
                      )}
                      <span className="font-serif text-xs ml-1.5" style={{ color: C.muted }}>{sense}</span>
                    </div>
                  )) : (
                    <span className="font-type text-[0.9375rem]" style={{ color: C.muted, opacity: 0.4 }}>—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LawDetail({ law, onPractise, canSpeak, onSay, sayIn, canSayIn }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>{law.name}</h2>
        <span className="font-type text-sm px-2 py-0.5 rounded" style={{ backgroundColor: TINT, color: C.gold, border: `1px solid ${C.line}` }}>
          {law.from} → {law.to}
        </span>
      </div>

      <p className="font-serif text-[1.0625rem] mb-3" style={{ color: C.ink }}>{law.rule}</p>

      <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
        <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>Why</div>
        <p className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>{law.why}</p>
        {law.watch && (
          <>
            <div className="font-serif text-xs uppercase tracking-wide mt-3 mb-1" style={{ color: C.muted }}>Watch for</div>
            <p className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>{law.watch}</p>
          </>
        )}
      </div>

      <div className="font-serif text-sm mb-2" style={{ color: C.muted }}>
        The same change, {law.pairs.length} times. A dash means that language kept no descendant.
      </div>
      <Pairs pairs={law.pairs} onSay={sayIn} canSpeak={canSayIn} />

      <div className="flex items-center gap-2 mt-5">
        <button onClick={onPractise} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-2"
          style={{ backgroundColor: C.gold, color: C.ink }}>
          Practise this rule <ArrowRight size={14} />
        </button>
        {canSpeak && (
          <button onClick={onSay} className="px-3 py-2 rounded-md flex items-center gap-1.5"
            style={{ border: `1px solid ${C.line}`, color: C.ink }} aria-label="Hear the examples">
            <Volume2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function Quiz({ quiz, input, onInput, result, onCheck, onNext, onBack, stats, inputRef, sayIn, canSayIn }) {
  return (
    <div>
      <button onClick={onBack} className="font-serif text-xs mb-3" style={{ color: C.muted }}>← back to the rule</button>

      <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
        <div className="font-serif text-sm mb-3" style={{ color: C.muted }}>{quiz.rule}</div>

        <div className="font-serif text-sm mb-1" style={{ color: C.muted }}>
          {LANG_NAME[quiz.from.lang]} <span className="font-type text-[1.1875rem]" style={{ color: C.ink }}>{quiz.from.form}</span> — “{quiz.gloss}”
        </div>
        <div className="font-type text-[1.1875rem] mb-3" style={{ color: C.ink }}>
          What is the {LANG_NAME[quiz.ask]}?
        </div>

        <input
          ref={inputRef} type="text" value={input} disabled={Boolean(result)}
          onChange={(e) => onInput(e.target.value)}
          placeholder={`The ${LANG_NAME[quiz.ask]} word…`}
          autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          className="w-full px-3 py-2.5 rounded-md font-serif text-base mb-3"
          style={{ backgroundColor: C.paper, color: C.ink,
            border: `1px solid ${result ? (result.ok ? C.green : C.red) : C.line}` }}
        />

        {result && (
          <div className="mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: result.ok ? C.green : C.red }}>
              {result.ok ? <Check size={15} /> : <X size={15} />}
              {result.ok ? "That is the one" : "Not this time"}
            </div>
            <div className="font-type text-[1.1875rem] flex items-baseline gap-2" style={{ color: C.ink }}>
              {quiz.answer}
              <SpeakButton ready={canSayIn?.(quiz.ask)} onSay={() => sayIn(quiz.ask, quiz.answer)} title={`Hear ${quiz.answer}`} />
            </div>
            <div className="font-serif text-sm" style={{ color: C.muted }}>{quiz.gloss}</div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!result ? (
            <button onClick={onCheck} className="px-5 py-2 rounded-md font-semibold text-sm"
              style={{ border: `1px solid ${C.gold}`, color: C.gold }}>Check</button>
          ) : (
            <button onClick={onNext} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5"
              style={{ backgroundColor: C.gold, color: C.ink }}>
              Next <ArrowRight size={14} />
            </button>
          )}
          <span className="flex-1" />
          <span className="font-serif text-sm" style={{ color: C.muted }}>
            {stats.right} of {stats.asked} right
          </span>
        </div>
      </div>

      {/* The worked examples stay up. The exercise is running the rule on a new
        * word, not recalling which words were on the list. */}
      <div className="font-serif text-sm mb-2" style={{ color: C.muted }}>The rule at work — the column you are being asked for is hidden.</div>
      <Pairs pairs={quiz.examples} hide={quiz.ask} onSay={sayIn} canSpeak={canSayIn} />
    </div>
  );
}

function FamilyDetail({ family, tree, treeWords, laws, onSelectLaw, sayIn, canSayIn }) {
  const meta = LAYERS[family.layer] || {};
  const fr = family.members.filter((m) => m.lang === "fr");
  const de = family.members.filter((m) => m.lang === "de");
  return (
    <div>
      <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>
        {meta.label || family.layer} · {meta.era || ""}
      </div>
      <h2 className="font-type text-3xl mb-1" style={{ color: C.ink }}>
        {family.layer === "pie" || family.layer === "gem" ? "*" : ""}{family.form}
      </h2>
      <p className="font-serif text-[0.9375rem] mb-4" style={{ color: C.muted }}>
        {family.members[0]?.e} — {family.members.length} word{family.members.length === 1 ? "" : "s"} in your decks come from it.
      </p>

      {meta.note && (
        <p className="font-serif text-sm mb-4 rounded-md px-3 py-2" style={{ color: C.ink, backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          {meta.note}
        </p>
      )}

      <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <WordTree
          tree={tree}
          words={treeWords}
          onSay={sayIn}
          canSpeak={Boolean(canSayIn)}
          forkNote={tree.form
            ? `All of these are still ${tree.form} at this point. Everything below the bar is one language doing something the others did not.`
            : null}
        />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div className="font-serif text-xs uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>In your French deck</div>
          {fr.length ? fr.map((m) => (
            <div key={m.t} className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>
              {m.t} <span style={{ color: C.muted }}>— {m.e} · {m.level}</span>
            </div>
          )) : <div className="font-serif text-sm" style={{ color: C.muted }}>Nothing yet.</div>}
        </div>
        <div>
          <div className="font-serif text-xs uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>In your German deck</div>
          {de.length ? de.map((m) => (
            <div key={m.t} className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>
              {m.t} <span style={{ color: C.muted }}>— {m.e} · {m.level}</span>
            </div>
          )) : <div className="font-serif text-sm" style={{ color: C.muted }}>Nothing yet.</div>}
        </div>
      </div>

      {laws.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="font-serif text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>The changes that pulled these apart</div>
          <div className="flex flex-wrap gap-1.5">
            {laws.map((l) => (
              <button key={l.id} onClick={() => onSelectLaw(l.id)}
                className="px-2.5 py-1.5 rounded-md font-serif text-sm text-left"
                style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EtymologyWorkbench({
  view, onView,
  families, selectedFamily, onSelectFamily, tree, treeWords, familyLaws,
  groups, selectedLaw, onSelectLaw,
  quiz, quizInput, onQuizInput, quizResult, onQuizCheck, onQuizNext,
  onPractise, onEndQuiz, quizStats, quizInputRef,
  canSpeak, onSay, sayIn, canSayIn,
  build,
}) {
  const roots = view === "roots";

  return (
    <div className="grid gap-0 items-stretch" style={{ gridTemplateColumns: "248px 1fr", minHeight: "60vh" }}>
      {/* ---------------- picker ---------------- */}
      <aside className="pr-4" style={{ borderRight: `1px solid ${C.line}` }}>
        <div className="flex rounded-md overflow-hidden mb-3" style={{ border: `1px solid ${C.line}` }}>
          {[["build", "Building", Blocks], ["roots", "Ancestry", GitBranch], ["laws", "Changes", Waves]].map(([id, label, Icon], i) => (
            <button key={id} onClick={() => onView(id)}
              className="flex-1 px-1.5 py-1.5 text-[0.6875rem] font-semibold flex items-center justify-center gap-1"
              style={{ backgroundColor: view === id ? TINT : "transparent", color: C.ink,
                borderLeft: i ? `1px solid ${C.line}` : "none" }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {view === "build" ? (
          <BuilderList families={build.families} selectedFamily={build.selectedFamily} onSelectFamily={build.onSelectFamily} />
        ) : roots ? (
          <>
            <div className="font-serif text-xs mb-2" style={{ color: C.muted }}>
              {families.length} roots with a word in <em>both</em> decks.
            </div>
            <div className="flex flex-col gap-0.5">
              {families.map((f) => {
                const active = selectedFamily === `${f.layer}:${f.form}`;
                const fr = f.members.find((m) => m.lang === "fr");
                const de = f.members.find((m) => m.lang === "de");
                return (
                  <button key={`${f.layer}:${f.form}`} onClick={() => onSelectFamily(`${f.layer}:${f.form}`)}
                    className="px-2.5 py-1.5 rounded-md text-left"
                    style={{ backgroundColor: active ? TINT : "transparent", border: `1px solid ${active ? C.line : "transparent"}` }}>
                    <div className="font-type text-[0.875rem] leading-tight" style={{ color: C.ink }}>
                      {fr?.t} <span style={{ color: C.muted }}>·</span> {de?.t}
                    </div>
                    <div className="font-serif text-[0.6875rem] leading-tight" style={{ color: C.muted }}>
                      {LAYERS[f.layer]?.short} {f.form}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <div key={g.id}>
                <div className="font-serif text-xs uppercase tracking-wide" style={{ color: C.gold }}>{g.label}</div>
                <div className="font-serif text-[0.6875rem] mb-1.5" style={{ color: C.muted }}>{g.when}</div>
                <div className="flex flex-col gap-0.5">
                  {g.laws.map((l) => {
                    const active = selectedLaw === l.id;
                    return (
                      <button key={l.id} onClick={() => onSelectLaw(l.id)}
                        className="px-2.5 py-1.5 rounded-md text-left"
                        style={{ backgroundColor: active ? TINT : "transparent", border: `1px solid ${active ? C.line : "transparent"}` }}>
                        <div className="font-type text-[0.875rem] leading-tight" style={{ color: C.ink }}>{l.from} → {l.to}</div>
                        <div className="font-serif text-[0.6875rem] leading-tight" style={{ color: C.muted }}>{l.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ---------------- detail ---------------- */}
      <div className="min-w-0 pl-6">
        {view === "build" ? (
          <WordBuilder {...build} />
        ) : quiz ? (
          <Quiz quiz={quiz} input={quizInput} onInput={onQuizInput} result={quizResult}
            onCheck={onQuizCheck} onNext={onQuizNext} onBack={onEndQuiz} stats={quizStats} inputRef={quizInputRef}
            sayIn={sayIn} canSayIn={canSayIn} />
        ) : roots ? (
          selectedFamily && tree
            ? <FamilyDetail family={families.find((f) => `${f.layer}:${f.form}` === selectedFamily)}
                tree={tree} treeWords={treeWords} laws={familyLaws} onSelectLaw={onSelectLaw}
                sayIn={sayIn} canSayIn={canSayIn} />
            : <p className="font-serif text-sm" style={{ color: C.muted }}>Pick a root to see where the two languages parted.</p>
        ) : (
          selectedLaw
            ? <LawDetail law={groups.flatMap((g) => g.laws).find((l) => l.id === selectedLaw)}
                onPractise={onPractise} canSpeak={canSpeak} onSay={onSay} sayIn={sayIn} canSayIn={canSayIn} />
            : <p className="font-serif text-sm" style={{ color: C.muted }}>Pick a sound change to see the words it made.</p>
        )}
      </div>
    </div>
  );
}
