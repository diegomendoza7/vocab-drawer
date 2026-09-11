import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Volume2, Plus, X, ExternalLink, PenLine } from "lucide-react";
import { C, TINT } from "../theme.js";
import SpeakButton from "./SpeakButton.jsx";
import AccentKeys from "./AccentKeys.jsx";
import { insertAt } from "../lib/textbox.js";
import WritingFeedback from "./WritingFeedback.jsx";
import { GENRES, MIN_ANSWER_WORDS, passageText, readingMinutes, wordCount } from "../data/reading/index.js";
import { keyIdeas, copiedStretch, sentenceShape, summarize, vocabProfile, loadRanks } from "../lib/writing.js";
import { applyFixToCheck } from "../lib/checkWriting.js";
import { lookupWiktionary, wiktionaryUrl } from "../lib/wiktionary.js";
import { segmentSentence, stripElision } from "../lib/dictionary.js";

/* The Reading Room.
 *
 * Replaces the Reading Corner, which was one fairy tale told four times with a
 * word blanked per sentence — recognition dressed up as reading. Here a
 * passage is followed by questions answered in the learner's own words, in a
 * full sentence, and then by a piece of their own writing that grows out of
 * the passage. Every answer is checked for grammar first (LanguageTool, plus
 * the German rules), for the question's key ideas second, and its vocabulary
 * is described last.
 *
 * At desktop width the passage stays beside the questions, and any word in it
 * can be clicked for a meaning: the deck's own gloss when it has one,
 * Wiktionary's when it does not.
 */

const PRIMARY = { backgroundColor: C.gold, color: C.ink };
const QUIET = { border: `1px solid ${C.line}`, color: C.ink };

export function LevelTabs({ levels, level, onChange, counts }) {
  return (
    <div className="flex rounded-md overflow-hidden w-fit" style={{ border: `1px solid ${C.line}` }}>
      {levels.map((lv, i) => (
        <button
          key={lv}
          type="button"
          onClick={() => onChange(lv)}
          className="px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: lv === level ? TINT : "transparent", color: C.ink, borderLeft: i ? `1px solid ${C.line}` : "none" }}
        >
          {lv}
          {counts ? <span style={{ color: C.muted }}> · {counts[lv] || 0}</span> : null}
        </button>
      ))}
    </div>
  );
}

function Stat({ value, label, strong }) {
  return (
    <div className="rounded-md p-3" style={{ backgroundColor: strong ? TINT : C.paper, border: `1px solid ${C.line}` }}>
      <div className="font-type text-2xl tabular-nums" style={{ color: C.ink }}>{value}</div>
      <div className="font-serif text-xs" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

export default function ReadingRoom({
  lang, langName, passages, levels, startLevel, records, onRecord, today,
  check, glossOf, canSpeak, say, onSaveWords, hasKeys,
}) {
  const [level, setLevel] = useState(levels.includes(startLevel) ? startLevel : levels[0]);
  const [openId, setOpenId] = useState(null);
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [checks, setChecks] = useState({});
  const [busy, setBusy] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [qEn, setQEn] = useState(false);
  const [gloss, setGloss] = useState(null);
  const [saved, setSaved] = useState([]);
  const [passageProfile, setPassageProfile] = useState(null);
  const boxRef = useRef(null);
  const keyRef = useRef(null);

  const passage = useMemo(() => passages.find((p) => p.id === openId) || null, [passages, openId]);
  const tasks = useMemo(() => (passage ? [
    ...passage.questions.map((q) => ({ kind: "q", ...q })),
    { kind: "write", q: passage.write.q, en: passage.write.en, min: passage.write.min },
  ] : []), [passage]);
  const done = !!passage && step >= tasks.length;
  const task = done ? null : tasks[step] || null;
  const draft = drafts[step] || "";
  const current = checks[step] || null;
  const stale = !!current && current.text !== draft.trim();
  const summary = useMemo(
    () => summarize(tasks.map((_, i) => (checks[i] ? { score: checks[i].result.score, ideas: checks[i].ideas } : null))),
    [tasks, checks],
  );
  const counts = useMemo(
    () => Object.fromEntries(levels.map((lv) => [lv, passages.filter((p) => p.level === lv).length])),
    [levels, passages],
  );
  const profileHere = passageProfile && passage && passageProfile.id === passage.id ? passageProfile : null;

  const focusBox = () => requestAnimationFrame(() => boxRef.current?.focus());
  const setDraft = (v) => setDrafts((d) => ({ ...d, [step]: v }));

  function open(p) {
    setOpenId(p.id);
    setLevel(p.level);
    setStep(0);
    setDrafts({});
    setChecks({});
    setGloss(null);
    setShowEn(false);
    setQEn(false);
    loadRanks(lang)
      .then((ranks) => setPassageProfile({ id: p.id, ...vocabProfile(passageText(p), lang, { ranks }) }))
      .catch(() => {});
    window.scrollTo?.({ top: 0 });
  }

  async function runCheck() {
    const text = draft.trim();
    if (!text || busy || !task) return;
    const at = step;
    setBusy(true);
    try {
      const result = await check(text);
      setChecks((c) => ({
        ...c,
        [at]: {
          text,
          result,
          shape: task.kind === "q" ? sentenceShape(text, MIN_ANSWER_WORDS[passage.level]) : null,
          copied: copiedStretch(text, passageText(passage)),
          ideas: task.kind === "q" ? keyIdeas(text, task.key) : null,
        },
      }));
    } finally {
      setBusy(false);
    }
  }

  function applyOne(issue, fix) {
    if (!current) return;
    const next = applyFixToCheck(current, issue, fix);
    setChecks((c) => ({ ...c, [step]: next }));
    setDraft(next.text);
  }

  function advance() {
    if (!passage) return;
    if (step + 1 < tasks.length) {
      setStep(step + 1);
      setQEn(false);
      focusBox();
      return;
    }
    const prev = records?.[passage.id];
    onRecord(passage.id, {
      at: today,
      level: passage.level,
      accuracy: summary.accuracy,
      sentences: summary.sentences,
      errorFree: summary.errorFree,
      found: summary.found,
      total: summary.total,
      words: summary.words,
      best: summary.accuracy == null ? prev?.best ?? null : Math.max(prev?.best ?? 0, summary.accuracy),
      times: (prev?.times || 0) + 1,
    });
    setStep(tasks.length);
  }

  function jump(i) {
    setStep(i);
    setQEn(false);
    if (i < tasks.length) focusBox();
  }

  /* The next passage: an unread one at this level if there is one, otherwise
   * the next in order, otherwise the first of the next level up. */
  function openNext() {
    if (!passage) return;
    const same = passages.filter((p) => p.level === passage.level);
    const at = same.findIndex((p) => p.id === passage.id);
    const unread = [...same.slice(at + 1), ...same.slice(0, at)].find((p) => !records?.[p.id]);
    const following = unread || same[at + 1];
    if (following) { open(following); return; }
    const up = levels[levels.indexOf(passage.level) + 1];
    const first = up && passages.find((p) => p.level === up);
    if (first) open(first);
    else setOpenId(null);
  }

  async function lookUp(word) {
    const deck = glossOf?.(word);
    if (deck) { setGloss({ word, lines: [deck], source: "deck" }); return; }
    setGloss({ word, loading: true });
    const defs = await lookupWiktionary(stripElision(word), lang);
    setGloss((g) => (g?.word !== word ? g
      : defs === null ? { word, offline: true }
        : { word, source: "wiktionary", lines: defs.map((d) => (d.pos ? `${d.pos.toLowerCase()} · ${d.text}` : d.text)) }));
  }
  const savedForm = (w) => (lang === "fr" ? stripElision(w).toLowerCase() : w);
  const saveWord = (w) => setSaved((s) => (s.includes(savedForm(w)) ? s : [...s, savedForm(w)]));

  /* Enter in an answer checks it, and once it is checked moves on. In the
   * writing task a plain Enter is a new paragraph, so it takes ⌘/Ctrl+Enter. */
  function onBoxKey(e) {
    if (e.key !== "Enter" || !task) return;
    const write = task.kind === "write";
    if (write ? !(e.metaKey || e.ctrlKey) : e.shiftKey) return;
    e.preventDefault();
    if (current && !stale) advance();
    else runCheck();
  }

  /* Enter anywhere else continues: to the next task once this one is checked,
   * to the next passage from the finished card. */
  useEffect(() => {
    keyRef.current = (e) => {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const el = document.activeElement;
      if (el && (["INPUT", "TEXTAREA", "BUTTON", "A", "SELECT"].includes(el.tagName) || el.isContentEditable)) return;
      if (!passage) return;
      if (done) { e.preventDefault(); openNext(); }
      else if (current && !stale) { e.preventDefault(); advance(); }
    };
  });
  useEffect(() => {
    const onKey = (e) => keyRef.current?.(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------------------------ library */
  if (!passage) {
    const list = passages.filter((p) => p.level === level);
    const readCount = passages.filter((p) => records?.[p.id]).length;
    return (
      <div>
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <h2 className="font-type text-2xl" style={{ color: C.ink }}>Reading Room</h2>
          <span className="font-serif text-sm" style={{ color: C.muted }}>{langName} · {readCount} of {passages.length} read</span>
        </div>
        <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "72ch" }}>
          Read a passage, answer its questions in full sentences, then write a piece of your own. Every answer is
          checked for grammar first; its vocabulary is described second.
        </p>
        <div className="mb-4"><LevelTabs levels={levels} level={level} onChange={setLevel} counts={counts} /></div>
        {list.length === 0 ? (
          <p className="font-serif text-sm" style={{ color: C.muted }}>No passages at this level yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => {
              const rec = records?.[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => open(p)}
                  className="text-left p-4 rounded-lg flex flex-col gap-1.5"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${rec ? C.green : C.gold}` }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                    <span>{GENRES[p.genre]}</span><span>·</span>
                    <span>{wordCount(passageText(p))} words</span><span>·</span>
                    <span>~{readingMinutes(p)} min</span>
                  </div>
                  <div className="font-type text-lg leading-snug" style={{ color: C.ink }}>{p.title}</div>
                  <div className="font-serif text-sm italic" style={{ color: C.muted }}>{p.titleEn}</div>
                  <div className="font-serif text-xs mt-1" style={{ color: rec ? C.green : C.muted }}>
                    {rec
                      ? `Read${rec.times > 1 ? ` ${rec.times}×` : ""} · ${rec.accuracy == null ? "answers not checked" : `${rec.accuracy}% of sentences clean`}`
                      : `${p.questions.length} questions and a writing task`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------ passage */
  const writing = checks[tasks.length - 1];
  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <button type="button" onClick={() => setOpenId(null)} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
          <ArrowLeft size={13} /> Library
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
          {langName} · {passage.level} · {GENRES[passage.genre]} · {wordCount(passageText(passage))} words
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] items-start">
        {/* ---------------- the passage ---------------- */}
        <article className="min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
          <h3 className="font-type text-[26px] leading-tight" style={{ color: C.ink }}>{passage.title}</h3>
          <p className="font-serif text-sm italic mb-3" style={{ color: C.muted }}>{passage.titleEn}</p>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button type="button" onClick={() => setShowEn((v) => !v)} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
              {showEn ? <EyeOff size={13} /> : <Eye size={13} />} {showEn ? "Hide English" : "Show English"}
            </button>
            {canSpeak && (
              <button type="button" onClick={() => say(passageText(passage))} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
                <Volume2 size={13} /> Read aloud
              </button>
            )}
            <span className="font-serif text-xs" style={{ color: C.muted }}>Click any word for its meaning.</span>
          </div>

          {passage.paras.map(([text, en], i) => (
            <div key={i} className="mb-4">
              <p className="font-serif text-[16px]" style={{ color: C.ink, maxWidth: "62ch", lineHeight: 1.85, whiteSpace: "pre-line" }}>
                {segmentSentence(text).map((seg, j) => (seg.type === "word" ? (
                  <span
                    key={j}
                    onClick={() => lookUp(seg.v)}
                    className="cursor-pointer rounded-sm hover:underline"
                    style={{ backgroundColor: gloss?.word === seg.v ? TINT : "transparent", textUnderlineOffset: 3 }}
                  >
                    {seg.v}
                  </span>
                ) : <span key={j}>{seg.v}</span>))}
              </p>
              {showEn && (
                <p className="font-serif italic text-sm mt-1" style={{ color: C.muted, maxWidth: "62ch", lineHeight: 1.6, whiteSpace: "pre-line" }}>{en}</p>
              )}
            </div>
          ))}

          {gloss && (
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}`, maxWidth: "62ch" }}>
              <div className="flex items-center gap-2">
                <span className="font-type text-lg" style={{ color: C.ink }}>{gloss.word}</span>
                <SpeakButton onSay={() => say(gloss.word)} ready={canSpeak} size={13} title="Hear it" />
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => saveWord(gloss.word)}
                  disabled={saved.includes(savedForm(gloss.word))}
                  className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                  style={QUIET}
                >
                  {saved.includes(savedForm(gloss.word)) ? <><Check size={12} /> Kept</> : <><Plus size={12} /> Keep</>}
                </button>
                <button type="button" onClick={() => setGloss(null)} aria-label="Close" className="p-1 rounded" style={{ color: C.muted }}>
                  <X size={14} />
                </button>
              </div>
              <div className="font-serif text-sm mt-1" style={{ color: C.ink, lineHeight: 1.55 }}>
                {gloss.loading ? <span style={{ color: C.muted }}>Looking it up…</span>
                  : gloss.offline ? <span style={{ color: C.muted }}>Offline — Wiktionary can't be reached.</span>
                    : gloss.lines?.length ? <ul className="flex flex-col gap-0.5">{gloss.lines.map((l) => <li key={l}>{l}</li>)}</ul>
                      : <span style={{ color: C.muted }}>No entry found.</span>}
              </div>
              {gloss.source === "wiktionary" && (
                <a href={wiktionaryUrl(stripElision(gloss.word), lang)} target="_blank" rel="noopener" className="text-[11px] inline-flex items-center gap-1 mt-1 underline" style={{ color: C.muted }}>
                  Wiktionary (CC BY-SA) <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}

          {saved.length > 0 && (
            <div className="flex items-center gap-3 pt-3 flex-wrap" style={{ borderTop: `1px solid ${C.line}`, maxWidth: "62ch" }}>
              <span className="font-serif text-sm" style={{ color: C.muted }}>Kept: {saved.join(", ")}</span>
              <span className="flex-1" />
              <button type="button" onClick={() => onSaveWords(saved)} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5" style={QUIET}>
                <Plus size={13} /> Add {saved.length} to My Words
              </button>
            </div>
          )}
        </article>

        {/* ---------------- the tasks ---------------- */}
        <section className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tasks.map((t, i) => {
              const c = checks[i];
              const clean = c && c.result.score.sentences > 0 && c.result.score.errorFree === c.result.score.sentences;
              const here = i === step;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jump(i)}
                  title={t.kind === "q" ? `Question ${i + 1}` : "Writing task"}
                  className="h-7 min-w-7 px-2 rounded-full text-xs font-semibold flex items-center justify-center"
                  style={{
                    backgroundColor: here ? C.ink : clean ? C.green : "transparent",
                    color: here || clean ? C.card : C.ink,
                    border: `1px solid ${here ? C.ink : c ? (clean ? C.green : C.gold) : C.line}`,
                  }}
                >
                  {t.kind === "q" ? i + 1 : <PenLine size={12} />}
                </button>
              );
            })}
            {done && (
              <span className="h-7 px-2 rounded-full text-xs font-semibold flex items-center gap-1" style={{ backgroundColor: C.green, color: C.card }}>
                <Check size={12} /> Done
              </span>
            )}
          </div>

          {task && (
            <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
              <div className="text-xs font-semibold mb-1" style={{ color: C.muted }}>
                {task.kind === "q" ? `Question ${step + 1} of ${passage.questions.length}` : `Your turn to write · at least ${task.min} words`}
              </div>
              <p className="font-serif text-[16px]" style={{ color: C.ink, lineHeight: 1.55 }}>{task.q}</p>
              <button type="button" onClick={() => setQEn((v) => !v)} className="text-xs mt-1 text-left" style={{ color: C.muted }}>
                {qEn ? task.en : "Show in English"}
              </button>

              <textarea
                ref={boxRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onBoxKey}
                rows={task.kind === "q" ? 3 : 9}
                lang={lang}
                spellCheck={false}
                placeholder={task.kind === "q" ? "Answer in a full sentence…" : "Write here…"}
                className="w-full mt-3 p-3 rounded-md font-serif text-[15px]"
                style={{ border: `1px solid ${C.line}`, backgroundColor: C.paper, color: C.ink, lineHeight: 1.6, resize: "vertical" }}
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <AccentKeys lang={lang} onInsert={(ch) => insertAt(boxRef, draft, setDraft, ch)} />
                <span className="flex-1" />
                <span className="text-xs tabular-nums" style={{ color: task.kind === "write" && wordCount(draft) >= task.min ? C.green : C.muted }}>
                  {wordCount(draft)}{task.kind === "write" ? ` / ${task.min}` : ""} words
                </span>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {current && !stale ? (
                  <>
                    <button type="button" onClick={advance} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={PRIMARY}>
                      {step + 1 < tasks.length ? "Next" : "Finish"} <ArrowRight size={14} />
                    </button>
                    {current.fixed > 0 && (
                      <button type="button" onClick={runCheck} disabled={busy} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={QUIET}>
                        {busy ? "Checking…" : "Check again"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button type="button" onClick={runCheck} disabled={!draft.trim() || busy} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={PRIMARY}>
                      {busy ? "Checking…" : current ? "Check again" : "Check"}
                    </button>
                    <button type="button" onClick={advance} className="px-4 py-2 rounded-md font-semibold text-sm" style={QUIET}>
                      {current ? "Next anyway" : "Skip"}
                    </button>
                  </>
                )}
              </div>
              <p className="text-[11px] mt-2 font-serif" style={{ color: C.muted }}>
                {hasKeys ? (task.kind === "q" ? "Enter to check, then Enter to continue · Shift+Enter for a new line. " : "⌘/Ctrl+Enter to check. ") : ""}
                Checking sends your answer to{" "}
                <a href="https://languagetool.org" target="_blank" rel="noopener" className="underline">LanguageTool</a>.
              </p>
            </div>
          )}

          {task && current && (
            <WritingFeedback
              lang={lang}
              entry={current}
              stale={stale}
              model={task.kind === "q" ? task.answer : null}
              canSpeak={canSpeak}
              onSay={say}
              onApplyFix={applyOne}
              passageProfile={task.kind === "write" ? profileHere : null}
              minWords={task.kind === "write" ? task.min : null}
              minSentenceWords={task.kind === "q" ? MIN_ANSWER_WORDS[passage.level] : null}
            />
          )}

          {done && (
            <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.green}` }}>
              <div className="font-type text-xl mb-3" style={{ color: C.ink }}>Passage finished</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Stat value={summary.sentences ? `${summary.errorFree}/${summary.sentences}` : "—"} label="sentences with no errors" strong />
                <Stat value={summary.total ? `${summary.found}/${summary.total}` : "—"} label="key ideas covered" />
                <Stat value={summary.words} label="words written" />
              </div>
              {summary.sentences === 0 && (
                <p className="font-serif text-sm mb-2" style={{ color: C.muted }}>Nothing was checked this time — skipped answers aren't scored.</p>
              )}
              {writing?.result.profile?.tokens > 0 && profileHere && (
                <p className="font-serif text-sm mb-2" style={{ color: C.ink }}>
                  Your writing: {Math.round(writing.result.profile.beyond2k * 100)}% of words beyond the 2,000 most common — the passage: {Math.round(profileHere.beyond2k * 100)}%.
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <button type="button" onClick={openNext} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={PRIMARY}>
                  Next passage <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => jump(0)} className="px-4 py-2 rounded-md font-semibold text-sm" style={QUIET}>Review answers</button>
                <button type="button" onClick={() => setOpenId(null)} className="px-4 py-2 rounded-md font-semibold text-sm" style={QUIET}>Library</button>
              </div>
              {hasKeys && <p className="text-[11px] mt-2 font-serif" style={{ color: C.muted }}>Enter for the next passage.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
