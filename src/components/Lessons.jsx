import LookupText from "./LookupText.jsx";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight, ArrowLeft, Check, X, Volume2, BookOpen, ExternalLink, RotateCcw, Plus, ScrollText, Eye, EyeOff,
} from "lucide-react";
import { C, TINT, GENDER, shade } from "../theme.js";
import { LESSON_STAGES } from "../data/lessons.js";
import {
  checkTyped, checkOrder, keyIdeas, checkInto, usesMissing, wordCount, lessonGloss, shuffleChunks,
  normalizeAnswer, lessonTotal,
} from "../lib/lessons.js";
import { applyFixToCheck } from "../lib/checkWriting.js";
import { COUNTED } from "../lib/grammar.js";
import Emphasised from "./Emphasised.jsx";
import AccentKeys from "./AccentKeys.jsx";
import SpeakButton from "./SpeakButton.jsx";
import WritingFeedback from "./WritingFeedback.jsx";

/* Lessons: one real text, taken all the way apart.
 *
 * The rest of the app tests, and explains only after a mistake. This is the
 * part that teaches first. A lesson is eight stages over one extract — read,
 * understand, see the structure, learn the grammar, learn the words, name
 * them from their definitions, translate both ways, write your own — and it
 * remembers where you stopped, so a forty-minute lesson survives being left
 * halfway.
 *
 * Every stage that can be graded is graded on the *first* attempt. A second
 * go is always allowed, because that is how practice works, but only the
 * first says what you knew.
 */

const QUIET = { border: `1px solid ${C.line}`, color: C.ink };
const GOLD = { backgroundColor: C.gold, color: C.onGold };

const ROLE = {
  subject: { label: "subject", bg: shade("10%") },
  verb: { label: "verb", bg: "var(--vd-gold)", ink: true },
  object: { label: "object", bg: shade("18%") },
  complement: { label: "complement", bg: shade("14%") },
  adverbial: { label: "adverbial", bg: TINT },
  clause: { label: "clause", bg: shade("6%") },
  agent: { label: "agent", bg: TINT },
};

/* -------------------------------------------------------------------- */
/* Small shared pieces                                                   */
/* -------------------------------------------------------------------- */

function Panel({ children, accent, style }) {
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: accent ? `4px solid ${accent}` : undefined, ...style }}>
      {children}
    </div>
  );
}

function Kicker({ children }) {
  return <div className="text-[0.6875rem] uppercase tracking-wide font-semibold mb-1.5" style={{ color: C.muted }}>{children}</div>;
}

function Verdict({ ok, children }) {
  return (
    <div className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: ok ? C.green : C.red }}>
      {ok ? <Check size={15} /> : <X size={15} />} {children}
    </div>
  );
}

function Next({ onClick, children = "Next", disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="px-4 py-2 rounded-md font-semibold text-sm inline-flex items-center gap-1.5 disabled:opacity-40" style={GOLD}>
      {children} <ArrowRight size={15} />
    </button>
  );
}

function Progress({ at, of }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
        <div className="h-1.5 rounded-full" style={{ width: `${(at / of) * 100}%`, backgroundColor: C.green }} />
      </div>
      <span className="text-xs tabular-nums" style={{ color: C.muted }}>{Math.min(at + 1, of)} / {of}</span>
    </div>
  );
}

/** A typed answer box with the accent keys a keyboard may not reach. */
function Answer({ lang, value, onChange, onEnter, disabled, placeholder = "Type your answer", multiline = false, inputRef }) {
  const local = useRef(null);
  const ref = inputRef || local;
  const insert = (ch) => {
    const el = ref.current;
    if (!el) { onChange(value + ch); return; }
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    onChange(value.slice(0, s) + ch + value.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + ch.length, s + ch.length); });
  };
  const common = {
    ref,
    value,
    disabled,
    placeholder,
    onChange: (e) => onChange(e.target.value),
    onKeyDown: (e) => {
      if (e.key !== "Enter") return;
      if (multiline && !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      onEnter?.();
    },
    autoComplete: "off",
    autoCapitalize: "off",
    autoCorrect: "off",
    spellCheck: false,
    className: "w-full px-3 py-2.5 rounded-md font-serif text-base",
    style: { backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink },
  };
  return (
    <div className="flex flex-col gap-2">
      {multiline ? <textarea rows={4} {...common} /> : <input type="text" {...common} />}
      {!disabled && <AccentKeys lang={lang} onInsert={insert} />}
    </div>
  );
}

/** The extract with every word clickable, and the gloss for the last one clicked. */
function Extract({ lesson, glossOf, canSpeak, say, compact = false }) {
  const [picked, setPicked] = useState(null);
  const gloss = picked ? (lessonGloss(lesson.glossary, picked) || glossOf?.(picked) || null) : null;
  return (
    <div>
      {lesson.extract.map((p, i) => (
        <div key={i} className={compact ? "mb-2" : "mb-4"}>
          {p.label && <Kicker>{p.label}</Kicker>}
          <p className="font-serif" style={{ color: C.ink, maxWidth: "64ch", lineHeight: compact ? 1.7 : 1.9, fontSize: compact ? "0.9375rem" : "1.0625rem" }}>
            <LookupText text={p.text} lang={lesson.id.startsWith("fr")?"fr":"de"} selected={picked} onLookup={setPicked} />
          </p>
        </div>
      ))}
      {picked && (
        <div className="rounded-md p-3 mt-1" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}`, maxWidth: "64ch" }}>
          <div className="flex items-center gap-2">
            <span className="font-type text-lg" style={{ color: C.ink }}>{picked}</span>
            <SpeakButton onSay={() => say(picked)} ready={canSpeak} size={13} title="Hear it" />
            <span className="flex-1" />
            <button type="button" onClick={() => setPicked(null)} aria-label="Close" className="p-1" style={{ color: C.muted }}><X size={14} /></button>
          </div>
          <div className="font-serif text-sm mt-0.5" style={{ color: gloss ? C.ink : C.muted }}>
            {gloss || "Not in this lesson's glossary — the Reading Room can look it up on Wiktionary."}
          </div>
        </div>
      )}
    </div>
  );
}

/** The text, folded away, for stages that ask about it. */
function TextAside({ lesson, glossOf, canSpeak, say }) {
  return (
    <details className="mb-4 rounded-md" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
      <summary className="px-3 py-2 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5" style={{ color: C.muted }}>
        <ScrollText size={13} /> The text
      </summary>
      <div className="px-4 pb-3"><Extract lesson={lesson} glossOf={glossOf} canSpeak={canSpeak} say={say} compact /></div>
    </details>
  );
}

/* -------------------------------------------------------------------- */
/* 1 · Read                                                              */
/* -------------------------------------------------------------------- */

function ReadStage({ lesson, glossOf, canSpeak, say, onDone }) {
  const s = lesson.source;
  const text = lesson.extract.map((p) => p.text).join(" ");
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.muted }}>
          Lesson {lesson.n} · {lesson.level} · about {lesson.minutes} min
        </div>
        <h2 className="font-type text-3xl" style={{ color: C.ink }}>{lesson.title}</h2>
        <p className="font-serif italic" style={{ color: C.muted }}>{lesson.titleEn} — {lesson.focusLine}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <Panel accent={C.gold}>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-serif text-sm" style={{ color: C.ink }}>
              {s.author}, <i>{s.work}</i> ({s.year}) — {s.part}
            </span>
            <a href={s.url} target="_blank" rel="noopener" className="text-[0.6875rem] inline-flex items-center gap-1 underline" style={{ color: C.muted }}>
              {s.licence} <ExternalLink size={10} />
            </a>
          </div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {canSpeak && (
              <button type="button" onClick={() => say(text)} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
                <Volume2 size={13} /> Read aloud
              </button>
            )}
            <span className="font-serif text-xs" style={{ color: C.muted }}>Click any word for its meaning in this text.</span>
          </div>
          <Extract lesson={lesson} glossOf={glossOf} canSpeak={canSpeak} say={say} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <Kicker>Why this text</Kicker>
            {lesson.context.map((c, i) => (
              <p key={i} className="font-serif text-sm mb-2" style={{ color: C.ink, lineHeight: 1.65 }}>{c}</p>
            ))}
          </Panel>
          <Panel>
            <Kicker>In this lesson</Kicker>
            <ul className="flex flex-col gap-1.5">
              {lesson.goals.map((g) => (
                <li key={g} className="font-serif text-sm flex gap-2" style={{ color: C.ink, lineHeight: 1.55 }}>
                  <span style={{ color: C.accent }}>•</span><span>{g}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div><Next onClick={() => onDone(null)}>I have read it — on to the questions</Next></div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 2 · Understand                                                        */
/* -------------------------------------------------------------------- */

function UnderstandStage({ lesson, glossOf, canSpeak, say, onDone }) {
  const qs = lesson.understand;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const q = qs[i];

  function pick(k) {
    if (picked != null) return;
    setPicked(k);
    if (k === q.answer) setRight((r) => r + 1);
  }
  function next() {
    if (i + 1 < qs.length) { setI(i + 1); setPicked(null); }
    else onDone([right, qs.length]);
  }

  return (
    <div style={{ maxWidth: "46rem" }}>
      <TextAside lesson={lesson} glossOf={glossOf} canSpeak={canSpeak} say={say} />
      <Progress at={i} of={qs.length} />
      <Panel accent={C.ink}>
        <Kicker>Understanding</Kicker>
        <p className="font-serif text-lg mb-4" style={{ color: C.ink }}>{q.q}</p>
        <div className="flex flex-col gap-2">
          {q.options.map((o, k) => {
            const show = picked != null;
            const isAnswer = k === q.answer;
            return (
              <button
                key={o}
                type="button"
                disabled={show}
                onClick={() => pick(k)}
                className="text-left px-3 py-2.5 rounded-md font-serif text-sm flex items-center justify-between gap-2"
                style={{
                  backgroundColor: show && isAnswer ? TINT : "transparent",
                  border: `1px solid ${show && isAnswer ? C.green : show && picked === k ? C.red : C.line}`,
                  color: C.ink,
                }}
              >
                {o}
                {show && isAnswer && <Check size={15} style={{ color: C.green }} />}
                {show && picked === k && !isAnswer && <X size={15} style={{ color: C.red }} />}
              </button>
            );
          })}
        </div>
        {picked != null && (
          <div className="mt-4">
            <p className="font-serif text-sm mb-3" style={{ color: C.muted, lineHeight: 1.65 }}><Emphasised text={q.why} /></p>
            <Next onClick={next}>{i + 1 < qs.length ? "Next question" : "On to the structure"}</Next>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 3 · Structure                                                         */
/* -------------------------------------------------------------------- */

/** Put a declared-correct order back together from the chunks, for display. */
function orderFor(chunks, accepted) {
  let rest = normalizeAnswer(accepted);
  const left = [...chunks];
  const out = [];
  while (rest && left.length) {
    const k = left.findIndex((c) => {
      const n = normalizeAnswer(c);
      return rest === n || rest.startsWith(`${n} `);
    });
    if (k < 0) return chunks;
    out.push(left[k]);
    rest = rest.slice(normalizeAnswer(left[k]).length).trim();
    left.splice(k, 1);
  }
  return out;
}

function Anatomy({ sentence, onDone, last }) {
  const verbs = sentence.chunks.map((c, k) => (c.role === "verb" ? k : -1)).filter((k) => k >= 0);
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState([]);
  const revealed = verbs.every((k) => found.includes(k));

  function tap(k) {
    if (revealed || found.includes(k) || wrong.includes(k)) return;
    if (sentence.chunks[k].role === "verb") setFound((f) => [...f, k]);
    else setWrong((w) => [...w, k]);
  }

  return (
    <Panel accent={C.ink}>
      <Kicker>Anatomy of a sentence</Kicker>
      <p className="font-serif text-sm mb-3" style={{ color: C.muted }}>
        {revealed ? "Here is how it is built." : <>Tap <b style={{ color: C.ink }}>{sentence.find}</b>.</>}
      </p>

      {!revealed ? (
        <p className="font-serif text-lg flex flex-wrap gap-x-1.5 gap-y-2" style={{ color: C.ink, lineHeight: 1.7 }}>
          {sentence.chunks.map((c, k) => (
            <button
              key={k}
              type="button"
              onClick={() => tap(k)}
              className="rounded px-1 text-left"
              style={{
                backgroundColor: found.includes(k) ? C.gold : "transparent",
                textDecoration: wrong.includes(k) ? "line-through" : "none",
                textDecorationColor: C.red,
                color: wrong.includes(k) ? C.muted : C.ink,
                border: `1px dashed ${C.line}`,
              }}
            >
              {c.t}
            </button>
          ))}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 items-stretch">
          {sentence.chunks.map((c, k) => {
            const r = ROLE[c.role] || ROLE.clause;
            return (
              <div key={k} className="rounded-md px-2.5 py-1.5 flex flex-col" style={{ backgroundColor: r.bg, border: `1px solid ${C.line}` }}>
                <span className="font-serif text-base" style={{ color: C.ink }}>{c.t}</span>
                <span className="text-[0.625rem] uppercase tracking-wide font-semibold mt-0.5" style={{ color: r.ink ? C.ink : C.muted }}>
                  {r.label}{c.detail ? ` · ${c.detail}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {wrong.length > 0 && !revealed && (
        <p className="text-xs font-serif mt-2" style={{ color: C.red }}>Not that one — look for the word that changes with the subject and tense.</p>
      )}

      {revealed && (
        <div className="mt-4">
          <p className="font-serif text-sm mb-3" style={{ color: C.muted, lineHeight: 1.65, maxWidth: "64ch" }}><Emphasised text={sentence.note} /></p>
          <Next onClick={() => onDone(wrong.length === 0)}>{last ? "On to rebuilding" : "Next sentence"}</Next>
        </div>
      )}
    </Panel>
  );
}

/* A sentence-initial capital is a clue, not a spelling.
 *
 * The chunk that opens the sentence is the only one written with a capital,
 * so leaving it capitalised in the bank tells the learner where to start — and
 * moving it mid-sentence prints « Er fand sich Eines Morgens », which is wrong
 * German. So the opening chunk loses that positional capital, and whichever
 * chunk the learner actually puts first gains one. Nouns keep theirs: only the
 * first letter of the opening chunk is touched, and no lesson opens a rebuild
 * with a noun (a German noun would keep its capital anywhere). */
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Rebuild({ item, seed, onDone, last }) {
  const opener = useMemo(() => item.chunks.indexOf(orderFor(item.chunks, item.accept[0])[0]), [item]);
  const base = (c) => (c.i === opener ? lowerFirst(c.t) : c.t);
  const shown = (c, pos) => (pos === 0 ? upperFirst(base(c)) : base(c));
  const bank0 = useMemo(() => shuffleChunks(item.chunks, seed, item.accept), [item, seed]);
  const [built, setBuilt] = useState([]);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const bank = bank0.filter((c) => !built.some((b) => b.i === c.i));

  function check() {
    const r = checkOrder(built.map((b) => b.t), item.accept);
    setResult(r);
    setAttempts((a) => a + 1);
  }
  function again() { setBuilt([]); setResult(null); }

  const model = orderFor(item.chunks, item.accept[0]).map((t0, pos) => {
    const idx = item.chunks.indexOf(t0);
    return shown({ t: t0, i: idx }, pos);
  });
  const firstTry = result?.ok && attempts === 1;

  return (
    <Panel accent={C.ink}>
      <Kicker>Rebuild it</Kicker>
      <p className="font-serif text-lg mb-4" style={{ color: C.ink }}>{item.en}</p>

      <div className="rounded-md p-3 mb-3 flex flex-wrap gap-2 min-h-[3.25rem]" style={{ backgroundColor: C.paper, border: `1px solid ${result ? (result.ok ? C.green : C.red) : C.line}` }}>
        {built.length === 0 && <span className="font-serif text-sm" style={{ color: C.muted }}>Tap the pieces below in order.</span>}
        {built.map((c, pos) => (
          <button key={c.i} type="button" disabled={!!result} onClick={() => setBuilt((b) => b.filter((x) => x.i !== c.i))}
            className="px-2.5 py-1 rounded font-serif text-base" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.ink }}>
            {shown(c, pos)}
          </button>
        ))}
      </div>

      {!result && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bank.map((c) => (
            <button key={c.i} type="button" onClick={() => setBuilt((b) => [...b, c])}
              className="px-2.5 py-1 rounded font-serif text-base" style={{ border: `1px dashed ${C.line}`, color: C.ink }}>
              {base(c)}
            </button>
          ))}
        </div>
      )}

      {!result ? (
        <button type="button" onClick={check} disabled={bank.length > 0} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.ink, color: C.card }}>
          Check the order
        </button>
      ) : (
        <div>
          <Verdict ok={result.ok}>{result.ok ? (firstTry ? "Right first time" : "Right") : "Not in that order"}</Verdict>
          {!result.ok && (
            <p className="font-serif text-base mt-1" style={{ color: C.ink }}>{model.join(" ")}</p>
          )}
          <p className="font-serif text-sm mt-2 mb-3" style={{ color: C.muted, lineHeight: 1.65, maxWidth: "64ch" }}><Emphasised text={item.why} /></p>
          <div className="flex gap-2 flex-wrap">
            {!result.ok && (
              <button type="button" onClick={again} className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-1.5" style={QUIET}>
                <RotateCcw size={14} /> Try it again
              </button>
            )}
            <Next onClick={() => onDone(attempts === 1 && result.ok)}>{last ? "On to the grammar" : "Next sentence"}</Next>
          </div>
        </div>
      )}
    </Panel>
  );
}

function StructureStage({ lesson, onDone }) {
  const { intro, sentences, rebuild } = lesson.structure;
  const total = sentences.length + rebuild.length;
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);

  function done(ok) {
    const r = right + (ok ? 1 : 0);
    setRight(r);
    if (i + 1 < total) setI(i + 1);
    else onDone([r, total]);
  }

  return (
    <div style={{ maxWidth: "50rem" }}>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted, lineHeight: 1.65, maxWidth: "68ch" }}>{intro}</p>
      <Progress at={i} of={total} />
      {i < sentences.length ? (
        <Anatomy key={`a${i}`} sentence={sentences[i]} onDone={done} last={i === sentences.length - 1} />
      ) : (
        <Rebuild
          key={`r${i}`}
          item={rebuild[i - sentences.length]}
          seed={i * 7 + lesson.n * 13 + 1}
          onDone={done}
          last={i === total - 1}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 4 · Grammar                                                           */
/* -------------------------------------------------------------------- */

function GrammarStage({ lesson, lang, tenses, noteTitles, onOpenNote, onDone }) {
  const g = lesson.grammar;
  const [phase, setPhase] = useState("learn");
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [right, setRight] = useState(0);
  const note = g.note && noteTitles.includes(g.note) ? g.note : null;
  const tenseRows = (g.tenses || []).map((k) => tenses.find((t) => t.key === k)).filter((t) => t?.form);

  if (phase === "learn") {
    return (
      <div className="flex flex-col gap-4" style={{ maxWidth: "52rem" }}>
        <h3 className="font-type text-2xl" style={{ color: C.ink }}>{g.title}</h3>
        {g.points.map((p) => (
          <Panel key={p.heading}>
            <div className="font-type text-lg mb-2" style={{ color: C.ink }}>{p.heading}</div>
            {p.body.map((b, k) => (
              <p key={k} className="font-serif text-[0.9375rem] mb-2.5" style={{ color: C.ink, lineHeight: 1.7, maxWidth: "70ch" }}><Emphasised text={b} /></p>
            ))}
            {p.examples?.length > 0 && (
              <div className="mt-2 rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
                {p.examples.map((ex, k) => (
                  <div key={k} className="grid gap-3 px-3 py-2 font-serif text-sm" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", borderTop: k ? `1px solid ${C.line}` : "none", backgroundColor: C.paper }}>
                    <span style={{ color: C.ink }}><Emphasised text={ex.t} /></span>
                    <span style={{ color: C.muted }}>{ex.e}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        ))}

        {tenseRows.length > 0 && (
          <Panel>
            <Kicker>How the tenses in this text are built</Kicker>
            {tenseRows.map((t) => (
              <div key={t.key} className="mb-2.5">
                <div className="font-type text-base" style={{ color: C.ink }}>{t.label} <span className="font-serif text-xs italic" style={{ color: C.muted }}>— {t.hint}</span></div>
                <p className="font-serif text-sm" style={{ color: C.muted, lineHeight: 1.6 }}><Emphasised text={t.form} /></p>
              </div>
            ))}
          </Panel>
        )}

        <div className="flex gap-2 flex-wrap">
          <Next onClick={() => setPhase("drill")}>Practise it — {g.drill.length} items</Next>
          {note && onOpenNote && (
            <button type="button" onClick={() => onOpenNote(note)} className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-1.5" style={QUIET}>
              <BookOpen size={14} /> The grammar note: {note}
            </button>
          )}
        </div>
      </div>
    );
  }

  const d = g.drill[i];
  const [before, after] = d.prompt.split("___");

  function check() {
    if (result || !input.trim()) return;
    const r = checkTyped(input, { accept: d.accept }, lang);
    setResult(r);
    if (r.ok) setRight((n) => n + 1);
  }
  function next() {
    if (i + 1 < g.drill.length) { setI(i + 1); setInput(""); setResult(null); }
    else onDone([right, g.drill.length]);
  }

  return (
    <div style={{ maxWidth: "46rem" }}>
      <button type="button" onClick={() => setPhase("learn")} className="text-xs underline mb-3" style={{ color: C.muted }}>
        Back to the explanation
      </button>
      <Progress at={i} of={g.drill.length} />
      <Panel accent={C.ink}>
        <Kicker>{g.title}</Kicker>
        <p className="font-serif text-xl mb-1" style={{ color: C.ink, lineHeight: 1.6 }}>
          {before}
          <span className="inline-block px-2 mx-0.5 rounded" style={{ minWidth: "4rem", borderBottom: `2px solid ${result ? (result.ok ? C.green : C.red) : C.gold}`, color: result ? (result.ok ? C.green : C.red) : C.muted }}>
            {result ? (result.ok ? input.trim() : d.accept[0]) : "…"}
          </span>
          {after}
        </p>
        {d.hint && <p className="font-serif text-sm italic mb-3" style={{ color: C.muted }}>({d.hint})</p>}
        <Answer lang={lang} value={input} onChange={setInput} onEnter={result ? next : check} disabled={!!result} />
        {!result ? (
          <div className="mt-3">
            <button type="button" onClick={check} disabled={!input.trim()} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
          </div>
        ) : (
          <div className="mt-3">
            <Verdict ok={result.ok}>{result.ok ? (result.note || "Right") : `It is « ${d.accept[0]} »`}</Verdict>
            <p className="font-serif text-sm mt-1.5 mb-3" style={{ color: C.muted, lineHeight: 1.65 }}><Emphasised text={d.why} /></p>
            <Next onClick={next}>{i + 1 < g.drill.length ? "Next" : "On to the words"}</Next>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 5 · Words                                                             */
/* -------------------------------------------------------------------- */

function headword(w) {
  if (w.g) return <><span style={{ color: GENDER[w.g] || C.muted }}>{w.g}</span> {w.t}</>;
  if (w.art) return <><span style={{ color: C.muted }}>{w.art}{w.art.endsWith("'") ? "" : " "}</span>{w.t}</>;
  return w.t;
}

function WordsStage({ lesson, canSpeak, say, onAddWords, added, onDone }) {
  return (
    <div style={{ maxWidth: "58rem" }}>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "70ch", lineHeight: 1.65 }}>
        The words this text depends on, each defined in {lesson.id.startsWith("fr") ? "French" : "German"} — the next stage
        asks you to name them from those definitions, so read the definitions, not only the English.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {lesson.words.map((w) => (
          <div key={w.t} className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-type text-xl" style={{ color: C.ink }}>{headword(w)}</span>
              <SpeakButton onSay={() => say(w.g ? `${w.g} ${w.t}` : w.t)} ready={canSpeak} size={13} title="Hear it" />
              <span className="font-serif text-sm" style={{ color: C.muted }}>{w.e}</span>
            </div>
            <p className="font-serif text-[0.9375rem] italic mt-1" style={{ color: C.ink }}>{w.def}</p>
            {w.from && <p className="font-serif text-sm mt-1" style={{ color: C.muted }}>« {w.from} »</p>}
            {w.family && <p className="text-xs mt-1.5" style={{ color: C.muted }}><b style={{ color: C.ink }}>Family:</b> {w.family}</p>}
            {w.note && <p className="text-xs mt-1.5" style={{ color: C.muted }}>{w.note}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap mt-5 items-center">
        <button type="button" onClick={onAddWords} disabled={added} className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60" style={QUIET}>
          {added ? <><Check size={14} /> In My Words</> : <><Plus size={14} /> Add these {lesson.words.length} words to My Words</>}
        </button>
        <span className="font-serif text-xs" style={{ color: C.muted }}>
          {added ? "They will come back in your reviews on the usual schedule." : "So they come back on a schedule, instead of being met once."}
        </span>
      </div>
      <div className="mt-5"><Next onClick={() => onDone(null)}>Name them from their definitions</Next></div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 6 · Name it                                                           */
/* -------------------------------------------------------------------- */

function NameItStage({ lesson, lang, onDone }) {
  const items = lesson.nameIt;
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [right, setRight] = useState(0);
  const n = items[i];
  const answer = n.g ? `${n.g} ${n.accept[0]}` : n.accept[0];

  function check(giveUp = false) {
    if (result) return;
    if (!giveUp && !input.trim()) return;
    const r = giveUp ? { ok: false, verdict: "gave-up" } : checkTyped(input, n, lang);
    setResult(r);
    if (r.ok) setRight((k) => k + 1);
  }
  function next() {
    if (i + 1 < items.length) { setI(i + 1); setInput(""); setResult(null); }
    else onDone([right, items.length]);
  }

  return (
    <div style={{ maxWidth: "44rem" }}>
      <Progress at={i} of={items.length} />
      <Panel accent={C.ink}>
        <Kicker>Which word is this?</Kicker>
        <p className="font-serif text-xl italic mb-4" style={{ color: C.ink, lineHeight: 1.55 }}>{n.def}</p>
        <Answer lang={lang} value={input} onChange={setInput} onEnter={result ? next : () => check()} disabled={!!result}
          placeholder={lang === "de" ? "The word — with its article, if it is a noun" : "The word"} />
        {!result ? (
          <div className="mt-3 flex gap-2 flex-wrap">
            <button type="button" onClick={() => check()} disabled={!input.trim()} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
            <button type="button" onClick={() => check(true)} className="px-3 py-2 rounded-md text-sm" style={QUIET}>Show me</button>
          </div>
        ) : (
          <div className="mt-3">
            <Verdict ok={result.ok}>
              {result.ok ? (result.verdict === "right" ? "Right" : "Accepted") : result.verdict === "gender" ? "Right word, wrong gender" : `It is « ${answer} »`}
            </Verdict>
            {result.note && <p className="font-serif text-sm mt-1" style={{ color: C.muted }}>{result.note}</p>}
            {result.ok && <p className="font-serif text-base mt-1" style={{ color: C.ink }}>{answer}</p>}
            <div className="mt-3"><Next onClick={next}>{i + 1 < items.length ? "Next" : "On to translation"}</Next></div>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 7 · Translate                                                         */
/* -------------------------------------------------------------------- */

function TranslateStage({ lesson, lang, langName, canSpeak, say, checkQuiet, onDone }) {
  const { fromText, intoTarget } = lesson.translate;
  const total = fromText.length + intoTarget.length;
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [grammar, setGrammar] = useState(null);
  const [right, setRight] = useState(0);
  const [self, setSelf] = useState(0);
  const into = i >= fromText.length;
  const item = into ? intoTarget[i - fromText.length] : fromText[i];

  async function check() {
    if (result || !input.trim()) return;
    if (!into) {
      const r = keyIdeas(input, item.key);
      setResult(r);
      if (r.ok) setRight((k) => k + 1);
      return;
    }
    const r = checkInto(input, item);
    setResult(r);
    if (r.ok) { setRight((k) => k + 1); return; }
    /* Not one of the versions the lesson knows. Say what can actually be
     * checked — the grammar — rather than pretending to judge the meaning. */
    setGrammar({ loading: true });
    try {
      const g = await checkQuiet(input.trim());
      setGrammar({ status: g.status, issues: (g.issues || []).filter((x) => COUNTED.has(x.kind)) });
    } catch {
      setGrammar({ status: "error", issues: [] });
    }
  }
  function next(markedRight = false) {
    const r = right + (markedRight ? 1 : 0);
    const s = self + (markedRight ? 1 : 0);
    if (markedRight) { setRight(r); setSelf(s); }
    if (i + 1 < total) { setI(i + 1); setInput(""); setResult(null); setGrammar(null); }
    else onDone([r, total], s);
  }

  return (
    <div style={{ maxWidth: "48rem" }}>
      <Progress at={i} of={total} />
      <Panel accent={C.ink}>
        <Kicker>{into ? `Into ${langName}` : "Into English"}</Kicker>
        {!into ? (
          <div className="flex items-start gap-2 mb-4">
            <p className="font-serif text-xl" style={{ color: C.ink, lineHeight: 1.55 }}>{item.t}</p>
            <SpeakButton onSay={() => say(item.t)} ready={canSpeak} size={14} title="Hear it" />
          </div>
        ) : (
          <p className="font-serif text-xl mb-4" style={{ color: C.ink, lineHeight: 1.55 }}>{item.en}</p>
        )}

        <Answer
          lang={into ? lang : "en"}
          value={input}
          onChange={setInput}
          onEnter={result ? () => next() : check}
          disabled={!!result}
          multiline={!into}
          placeholder={into ? `Your ${langName}` : "Your English — ⌘/Ctrl+Enter to check"}
        />

        {!result ? (
          <div className="mt-3">
            <button type="button" onClick={check} disabled={!input.trim()} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
          </div>
        ) : !into ? (
          <div className="mt-3">
            <Verdict ok={result.ok}>{result.ok ? "Every key idea is there" : `${result.found.length} of ${item.key.length} key ideas`}</Verdict>
            {!result.ok && (
              <p className="font-serif text-sm mt-1" style={{ color: C.ink }}>
                Missing: {result.missing.map((m) => `« ${item.key[m][0]} »`).join(", ")}
                <span style={{ color: C.muted }}> — or a word meaning the same.</span>
              </p>
            )}
            <div className="rounded-md p-3 mt-3" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
              <Kicker>A model translation</Kicker>
              <p className="font-serif text-base" style={{ color: C.ink }}>{item.model}</p>
              {item.note && <p className="font-serif text-sm mt-2" style={{ color: C.muted, lineHeight: 1.6 }}>{item.note}</p>}
            </div>
            <div className="mt-3"><Next onClick={() => next()}>{i + 1 < total ? "Next" : "On to your own writing"}</Next></div>
          </div>
        ) : (
          <div className="mt-3">
            {result.ok ? (
              <Verdict ok>{result.note || "Right — that is one of the versions this lesson knows."}</Verdict>
            ) : (
              <>
                <div className="font-semibold text-sm" style={{ color: result.missing.length ? C.red : C.accent }}>
                  {result.missing.length ? "Something the sentence needs is missing" : "Not one of the versions this lesson knows — it may still be right"}
                </div>
                {result.missing.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {result.missing.map((m) => (
                      <li key={m} className="font-serif text-sm flex gap-1.5" style={{ color: C.ink }}><span style={{ color: C.red }}>•</span> {m}</li>
                    ))}
                  </ul>
                )}
                <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
                  {grammar?.loading ? "Checking the grammar…"
                    : grammar?.status && grammar.status !== "ok" && !grammar.issues.length ? "The grammar checker couldn't be reached, so only the required forms were checked."
                      : grammar?.issues?.length ? `The grammar checker flagged: ${grammar.issues.map((x) => `« ${input.trim().slice(x.start, x.end)} » — ${x.message}`).join("; ")}`
                        /* When the lesson has already named something missing, "no error"
                         * would contradict it. LanguageTool passes « les femmes … égaux »
                         * outright — which is exactly why the lesson checks agreement
                         * itself — so say what is true: it found nothing *else*. */
                        : grammar ? (result.missing.length
                          ? "The general grammar checker found nothing else — it misses slips like this one, which is why the lesson checks for them itself."
                          : "The grammar checker found no error in it.") : ""}
                </p>
              </>
            )}
            <div className="rounded-md p-3 mt-3" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
              <Kicker>The model</Kicker>
              <p className="font-serif text-base" style={{ color: C.ink }}>{item.model}</p>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {!result.ok && !result.missing.length && (
                <button type="button" onClick={() => next(true)} className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-1.5" style={QUIET}>
                  <Check size={14} /> Mine means the same
                </button>
              )}
              <Next onClick={() => next()}>{i + 1 < total ? "Next" : "On to your own writing"}</Next>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 8 · Your turn                                                         */
/* -------------------------------------------------------------------- */

function YourTurnStage({ lesson, lang, check, canSpeak, say, noteTitles, onOpenNote, onDone }) {
  const y = lesson.yourTurn;
  const [text, setText] = useState("");
  const [current, setCurrent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const stale = !!current && current.text !== text.trim();
  const n = wordCount(text);
  const nudges = current ? usesMissing(current.text, y.uses) : [];

  async function run() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const result = await check(t);
      setCurrent({ text: t, result, shape: null, copied: null, ideas: null });
    } finally {
      setBusy(false);
    }
  }
  function applyOne(issue, fix) {
    if (!current) return;
    const next = applyFixToCheck(current, issue, fix);
    setCurrent(next);
    setText(next.text);
  }

  return (
    <div style={{ maxWidth: "52rem" }}>
      <Panel accent={C.gold}>
        <Kicker>Your turn</Kicker>
        <p className="font-serif text-lg mb-1" style={{ color: C.ink, lineHeight: 1.55 }}>{y.prompt}</p>
        <button type="button" onClick={() => setShowEn((v) => !v)} className="text-xs inline-flex items-center gap-1 mb-2" style={{ color: C.muted }}>
          {showEn ? <EyeOff size={12} /> : <Eye size={12} />} {showEn ? "Hide English" : "Show in English"}
        </button>
        {showEn && <p className="font-serif text-sm italic mb-2" style={{ color: C.muted }}>{y.en}</p>}
        <ul className="flex flex-col gap-1 mb-3">
          {y.tips.map((t) => (
            <li key={t} className="font-serif text-sm flex gap-1.5" style={{ color: C.muted }}><span style={{ color: C.accent }}>•</span> {t}</li>
          ))}
        </ul>
        <Answer lang={lang} value={text} onChange={setText} onEnter={run} multiline placeholder="Write here — ⌘/Ctrl+Enter to check" />
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button type="button" onClick={run} disabled={!text.trim() || busy} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={GOLD}>
            {busy ? "Checking…" : current ? "Check again" : "Check my writing"}
          </button>
          <span className="text-xs tabular-nums" style={{ color: n >= y.min ? C.green : C.muted }}>{n} / {y.min} words</span>
          <span className="text-[0.6875rem] font-serif" style={{ color: C.muted }}>
            Checking sends your text to <a href="https://languagetool.org" target="_blank" rel="noopener" className="underline">LanguageTool</a>.
          </span>
        </div>
      </Panel>

      {current && (
        <div className="mt-4 flex flex-col gap-3">
          {nudges.length > 0 && (
            <ul className="flex flex-col gap-1">
              {nudges.map((m) => (
                <li key={m} className="font-serif text-sm flex gap-1.5" style={{ color: C.ink }}><span style={{ color: C.accent }}>•</span> {m}</li>
              ))}
            </ul>
          )}
          <WritingFeedback
            lang={lang}
            entry={current}
            stale={stale}
            model={y.model}
            canSpeak={canSpeak}
            onSay={say}
            onApplyFix={applyOne}
            minWords={y.min}
            noteTitles={noteTitles}
            onOpenNote={onOpenNote}
          />
          <div>
            <Next onClick={() => onDone(current.result.score.errorFree == null ? null : [current.result.score.errorFree, current.result.score.sentences])} disabled={stale}>
              Finish the lesson
            </Next>
            {stale && <span className="text-xs ml-2" style={{ color: C.accent }}>Check again first, so the score matches what you wrote.</span>}
          </div>
        </div>
      )}
      {!current && (
        <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
          <button type="button" onClick={() => onDone(null)} className="underline">Skip the writing</button> — it will not be scored.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Summary                                                               */
/* -------------------------------------------------------------------- */

const SCORE_LABEL = {
  understand: "Understanding",
  structure: "Sentence structure",
  grammar: "Grammar",
  nameIt: "Naming from definitions",
  translate: "Translation",
  yourTurn: "Your writing — sentences with no error",
};

function Summary({ lesson, scores, onStage, nextLesson, onOpen, onList }) {
  const total = lessonTotal(scores);
  const weakest = Object.entries(scores)
    .filter(([k, s]) => Array.isArray(s) && s[1] && SCORE_LABEL[k])
    .map(([k, s]) => ({ k, share: s[0] / s[1] }))
    .sort((a, b) => a.share - b.share)[0];

  return (
    <div style={{ maxWidth: "46rem" }}>
      <h2 className="font-type text-2xl mb-1" style={{ color: C.ink }}>{lesson.title} — done</h2>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
        {total.total ? `${total.right} of ${total.total} right on the first attempt.` : "Nothing scored this time."}
        {scores.translateSelf ? ` ${scores.translateSelf} translation${scores.translateSelf === 1 ? "" : "s"} you marked right yourself.` : ""}
      </p>

      <div className="rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
        {Object.entries(SCORE_LABEL).map(([k, label], idx) => {
          const s = scores[k];
          const stageIdx = LESSON_STAGES.findIndex((st) => st.key === k);
          return (
            <div key={k} className="grid gap-3 px-4 py-2.5 items-center font-serif text-sm"
              style={{ gridTemplateColumns: "1fr 90px 110px", borderTop: idx ? `1px solid ${C.line}` : "none" }}>
              <span style={{ color: C.ink }}>{label}</span>
              <span className="tabular-nums" style={{ color: C.muted }}>{Array.isArray(s) ? `${s[0]} / ${s[1]}` : "—"}</span>
              <button type="button" onClick={() => onStage(stageIdx)} className="text-xs underline text-left" style={{ color: C.muted }}>go back to it</button>
            </div>
          );
        })}
      </div>

      {weakest && weakest.share < 0.8 && (
        <p className="font-serif text-sm mb-4" style={{ color: C.ink, lineHeight: 1.6 }}>
          The part to go back to: <b>{SCORE_LABEL[weakest.k].toLowerCase()}</b>. Doing it again tomorrow — not straight
          away — is what makes it stick.
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        {nextLesson && <Next onClick={() => onOpen(nextLesson.id)}>Lesson {nextLesson.n}: {nextLesson.title}</Next>}
        <button type="button" onClick={onList} className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-1.5" style={QUIET}>
          <ArrowLeft size={14} /> All lessons
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* The player                                                            */
/* -------------------------------------------------------------------- */

function LessonPlayer({
  lesson, lang, langName, record, onRecord, onWork, check, checkQuiet, glossOf, canSpeak, say,
  noteTitles, onOpenNote, tenses, onAddWords, nextLesson, onOpen, onList,
}) {
  /* Resume where the learner stopped — unless the lesson was finished, in
   * which case start over: a second pass is a review, not a continuation. */
  const [stage, setStage] = useState(() => (record && !record.done ? Math.min(record.stage || 0, LESSON_STAGES.length - 1) : 0));
  const [scores, setScores] = useState(() => (record && !record.done ? record.scores || {} : {}));
  const [finished, setFinished] = useState(false);
  const [added, setAdded] = useState(false);
  const [reached, setReached] = useState(() => (record && !record.done ? record.stage || 0 : 0));

  function complete(key, score, extra) {
    const nextScores = { ...scores, [key]: score };
    if (key === "translate") nextScores.translateSelf = extra || 0;
    setScores(nextScores);
    onWork(key === "read" ? "reading" : "lessons");
    const nextStage = stage + 1;
    const done = nextStage >= LESSON_STAGES.length;
    const far = Math.max(reached, nextStage);
    setReached(far);
    onRecord(lesson.id, { stage: done ? LESSON_STAGES.length - 1 : far, scores: nextScores, done });
    if (done) setFinished(true);
    else setStage(nextStage);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function addWords() {
    onAddWords(lesson.words.map((w) => ({
      t: w.t,
      e: w.e,
      g: lang === "de" && w.g ? w.g : undefined,
      s: String(w.from || "").replace(/…/g, "").trim() || undefined,
      src: `Lesson ${lesson.n} — ${lesson.title}`,
      at: new Date().toISOString().slice(0, 10),
      /* Curated for the lesson, not typed in by the learner — so it does not
       * need the paid fact-check, and should not be counted as unchecked. */
      ver: { st: "lesson", at: new Date().toISOString().slice(0, 10), by: "lesson", note: `From Lesson ${lesson.n}, ${lesson.title}` },
    })));
    setAdded(true);
  }

  const key = LESSON_STAGES[stage].key;
  const shared = { lesson, lang, onDone: (score, extra) => complete(key, score, extra) };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button type="button" onClick={onList} className="text-xs inline-flex items-center gap-1 mr-2" style={{ color: C.muted }}>
          <ArrowLeft size={13} /> Lessons
        </button>
        {LESSON_STAGES.map((st, k) => {
          const scored = scores[st.key];
          const here = !finished && k === stage;
          const open = k <= reached || finished;
          return (
            <button
              key={st.key}
              type="button"
              disabled={!open}
              onClick={() => { setFinished(false); setStage(k); }}
              className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40"
              style={{
                backgroundColor: here ? C.gold : "transparent",
                border: `1px solid ${here ? C.gold : C.line}`,
                color: C.ink,
              }}
              title={open ? st.label : "Finish the stages before it first"}
            >
              {(k < reached || finished) && scored !== undefined && <Check size={11} style={{ color: C.green }} />}
              {k + 1}. {st.label}
            </button>
          );
        })}
      </div>

      {finished ? (
        <Summary lesson={lesson} scores={scores} onStage={(k) => { setFinished(false); setStage(k); }} nextLesson={nextLesson} onOpen={onOpen} onList={onList} />
      ) : key === "read" ? (
        <ReadStage {...shared} glossOf={glossOf} canSpeak={canSpeak} say={say} />
      ) : key === "understand" ? (
        <UnderstandStage key={`u${stage}`} {...shared} glossOf={glossOf} canSpeak={canSpeak} say={say} />
      ) : key === "structure" ? (
        <StructureStage key={`s${stage}`} {...shared} />
      ) : key === "grammar" ? (
        <GrammarStage key={`g${stage}`} {...shared} tenses={tenses} noteTitles={noteTitles} onOpenNote={onOpenNote} />
      ) : key === "words" ? (
        <WordsStage {...shared} canSpeak={canSpeak} say={say} onAddWords={addWords} added={added} />
      ) : key === "nameIt" ? (
        <NameItStage key={`n${stage}`} {...shared} />
      ) : key === "translate" ? (
        <TranslateStage key={`t${stage}`} {...shared} langName={langName} canSpeak={canSpeak} say={say} checkQuiet={checkQuiet} />
      ) : (
        <YourTurnStage key={`y${stage}`} {...shared} check={check} canSpeak={canSpeak} say={say} noteTitles={noteTitles} onOpenNote={onOpenNote} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* The list                                                              */
/* -------------------------------------------------------------------- */

export default function Lessons(props) {
  const { lessons, records = {}, langName } = props;
  const [openId, setOpenId] = useState(null);
  const open = lessons.find((l) => l.id === openId);

  if (open) {
    const at = lessons.indexOf(open);
    return (
      <LessonPlayer
        key={open.id}
        {...props}
        lesson={open}
        record={records[open.id]}
        nextLesson={lessons[at + 1] || null}
        onOpen={setOpenId}
        onList={() => setOpenId(null)}
      />
    );
  }

  return (
    <div style={{ maxWidth: "60rem" }}>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Lessons</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>{langName} · {lessons.length} lessons</span>
      </div>
      <p className="font-serif text-sm mb-5" style={{ color: C.muted, maxWidth: "72ch", lineHeight: 1.65 }}>
        Each lesson takes one real, famous text and works all the way through it: reading it, understanding it, taking its
        sentences apart, learning the grammar it demonstrates, learning its words and naming them from their definitions,
        translating in both directions, and writing something of your own in the same pattern. Few lessons, each one dense —
        plan on forty minutes, and it remembers where you stopped.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l) => {
          const rec = records[l.id];
          const total = rec ? lessonTotal(rec.scores) : null;
          const status = !rec ? "Not started" : rec.done ? `Done${total?.total ? ` · ${total.right}/${total.total}` : ""}` : `Stopped at ${LESSON_STAGES[rec.stage || 0].label}`;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setOpenId(l.id)}
              className="text-left rounded-lg p-5 flex flex-col gap-2"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${rec?.done ? C.green : C.gold}` }}
            >
              <div className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                Lesson {l.n} · {l.level} · {l.minutes} min
              </div>
              <div className="font-type text-2xl" style={{ color: C.ink }}>{l.title}</div>
              <div className="font-serif text-sm italic" style={{ color: C.muted }}>{l.titleEn} — {l.focusLine}</div>
              <div className="font-serif text-sm" style={{ color: C.ink }}>
                {l.source.author}, <i>{l.source.work}</i> ({l.source.year})
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs" style={{ color: rec?.done ? C.green : C.muted }}>{status}</span>
                <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: C.ink }}>
                  {!rec ? "Start" : rec.done ? "Go through it again" : "Continue"} <ArrowRight size={14} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
