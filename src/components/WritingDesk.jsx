import { useState, useRef, useEffect, useMemo } from "react";
import { Check, RotateCcw, PenLine } from "lucide-react";
import { C, TINT } from "../theme.js";
import AccentKeys from "./AccentKeys.jsx";
import { insertAt } from "../lib/textbox.js";
import WritingFeedback from "./WritingFeedback.jsx";
import { LevelTabs } from "./ReadingRoom.jsx";
import { FREE_TOPIC, promptsFor, promptById } from "../data/writing-prompts.js";
import { wordCount } from "../data/reading/index.js";
import { applyFixToCheck } from "../lib/checkWriting.js";

/* The Writing Desk: free writing, checked.
 *
 * The Reading Room asks for writing about a passage; this is writing with no
 * passage at all — a prompt by level, or a blank page. A check gives the same
 * feedback as there: grammar and spelling first, vocabulary described second.
 * Saving a piece puts it in a journal with its scores, and that is the point
 * of the page over time: the row of bars is the learner's accuracy, piece by
 * piece, and it should rise.
 *
 * The draft survives a reload (localStorage, per language). Saved pieces live
 * in the progress record, so they travel with an export.
 */

const DRAFT_KEY = (lang) => `vocabdrawer:writing-draft:${lang}`;

function readDraft(lang) {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY(lang)) || "null"); } catch { return null; }
}
function writeDraft(lang, draft) {
  try { localStorage.setItem(DRAFT_KEY(lang), JSON.stringify(draft)); } catch { /* storage unavailable: the draft lasts the session */ }
}
function shortDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }); } catch { return ""; }
}

function Trend({ entries }) {
  if (entries.length < 2) return null;
  return (
    <div className="flex items-end gap-1 h-12 mb-3" title="Share of clean sentences in your last pieces, oldest first">
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex-1 rounded-sm"
          style={{ height: `${Math.max(6, e.accuracy ?? 0)}%`, backgroundColor: e.accuracy === 100 ? C.green : C.gold, opacity: e.accuracy == null ? 0.3 : 1 }}
        />
      ))}
    </div>
  );
}

export default function WritingDesk({ lang, langName, levels, startLevel, entries, onSave, check, canSpeak, say, hasKeys, noteTitles, onOpenNote }) {
  const [initial] = useState(() => readDraft(lang));
  const firstLevel = levels.includes(startLevel) ? startLevel : levels[0];
  const [level, setLevel] = useState(() => {
    const p = initial && promptById(initial.promptId);
    return p?.level && levels.includes(p.level) ? p.level : firstLevel;
  });
  const [promptId, setPromptId] = useState(() => initial?.promptId || promptsFor(firstLevel)[0]?.id || FREE_TOPIC.id);
  const [text, setText] = useState(initial?.text || "");
  const [current, setCurrent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [loadedFrom, setLoadedFrom] = useState(null);
  const boxRef = useRef(null);

  const prompt = promptById(promptId) || FREE_TOPIC;
  const isFree = prompt.id === FREE_TOPIC.id;
  const stale = !!current && current.text !== text.trim();
  const words = wordCount(text);
  const canSave = !!current && !stale && !current.fixed && !savedId;
  const history = useMemo(
    () => (entries || []).filter((e) => e.lang === lang).sort((a, b) => String(b.at).localeCompare(String(a.at))),
    [entries, lang],
  );

  useEffect(() => { writeDraft(lang, { promptId, text }); }, [lang, promptId, text]);

  async function runCheck() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const result = await check(t);
      setCurrent({ text: t, result, shape: null, copied: null, ideas: null });
      setSavedId(null);
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

  function save() {
    if (!canSave) return;
    const s = current.result.score;
    const pr = current.result.profile;
    const entry = {
      id: `w${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      lang,
      level: prompt.level || level,
      promptId: prompt.id,
      prompt: isFree ? "Your own topic" : prompt[lang] || prompt.en,
      text: current.text,
      words: s.words,
      sentences: s.sentences,
      errorFree: s.errorFree,
      accuracy: s.accuracy,
      errors: s.errors,
      assessment: current.result.assessment,
      checkStatus: current.result.status,
      beyond2k: pr?.tokens ? Math.round(pr.beyond2k * 100) : null,
      types: pr?.types ?? null,
    };
    onSave(entry);
    setSavedId(entry.id);
  }

  function pickPrompt(id) {
    setPromptId(id);
    setShowEn(false);
  }

  function clearPage() {
    setText("");
    setCurrent(null);
    setSavedId(null);
    setLoadedFrom(null);
    requestAnimationFrame(() => boxRef.current?.focus());
  }

  function load(e) {
    setText(e.text);
    setPromptId(promptById(e.promptId) ? e.promptId : FREE_TOPIC.id);
    if (e.level && levels.includes(e.level)) setLevel(e.level);
    setCurrent(null);
    setSavedId(null);
    setLoadedFrom(e.at);
  }

  function onBoxKey(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runCheck();
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Writing Desk</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {history.length} piece{history.length === 1 ? "" : "s"} in your journal
        </span>
      </div>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted, maxWidth: "72ch" }}>
        Write, then check: grammar and spelling first, vocabulary second. Save a piece to your journal to watch your
        accuracy change over time.
      </p>

      <div className="grid gap-6 lg:grid-cols-[13.75rem_minmax(0,1fr)_15rem] items-start">
        {/* ---------------- prompts ---------------- */}
        <aside className="flex flex-col gap-3">
          <LevelTabs levels={levels} level={level} onChange={setLevel} />
          <div className="flex flex-col gap-1.5">
            {promptsFor(level).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickPrompt(p.id)}
                className="text-left px-3 py-2 rounded-md text-sm font-serif"
                style={{ backgroundColor: p.id === promptId ? TINT : C.card, border: `1px solid ${p.id === promptId ? C.gold : C.line}`, color: C.ink, lineHeight: 1.45 }}
              >
                {p[lang]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => pickPrompt(FREE_TOPIC.id)}
              className="text-left px-3 py-2 rounded-md text-sm font-serif flex items-center gap-1.5"
              style={{ backgroundColor: isFree ? TINT : "transparent", border: `1px dashed ${isFree ? C.gold : C.line}`, color: C.ink }}
            >
              <PenLine size={13} /> Your own topic
            </button>
          </div>
        </aside>

        {/* ---------------- the page ---------------- */}
        <section aria-label="Writing workspace" className="min-w-0 flex flex-col gap-3">
          <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
            <div className="text-xs font-semibold mb-1" style={{ color: C.muted }}>
              {isFree ? "Your own topic" : `${prompt.level} · at least ${prompt.min} words`}
            </div>
            <p className="font-serif text-[1rem]" style={{ color: C.ink, lineHeight: 1.55 }}>
              {isFree ? "Write about anything you like." : prompt[lang]}
            </p>
            {!isFree && (
              <button type="button" onClick={() => setShowEn((v) => !v)} className="text-xs mt-1 text-left" style={{ color: C.muted }}>
                {showEn ? prompt.en : "Show in English"}
              </button>
            )}
            {loadedFrom && (
              <p className="text-xs font-serif mt-1" style={{ color: C.muted }}>
                Loaded from your journal ({shortDate(loadedFrom)}). Revise it and check again.
              </p>
            )}

            <textarea
              ref={boxRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onBoxKey}
              rows={12}
              lang={lang}
              spellCheck={false}
              placeholder="Start writing…"
              className="w-full mt-3 p-3 rounded-md font-serif text-[0.9375rem]"
              style={{ border: `1px solid ${C.line}`, backgroundColor: C.paper, color: C.ink, lineHeight: 1.7, resize: "vertical" }}
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <AccentKeys lang={lang} onInsert={(ch) => insertAt(boxRef, text, setText, ch)} />
              <span className="flex-1" />
              <span className="text-xs tabular-nums" style={{ color: !isFree && words >= prompt.min ? C.green : C.muted }}>
                {words}{isFree ? "" : ` / ${prompt.min}`} words
              </span>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button type="button" onClick={runCheck} disabled={!text.trim() || busy} className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.gold, color: C.onGold }}>
                {busy ? "Checking…" : current ? "Check again" : "Check my writing"}
              </button>
              <button type="button" onClick={save} disabled={!canSave} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                {savedId ? <><Check size={14} /> Saved</> : "Save to journal"}
              </button>
              <button type="button" onClick={clearPage} disabled={!text && !current} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <RotateCcw size={13} /> New page
              </button>
            </div>
            <p className="text-[0.6875rem] mt-2 font-serif" style={{ color: C.muted }}>
              {hasKeys ? "⌘/Ctrl+Enter to check. " : ""}Checking sends your text to{" "}
              <a href="https://languagetool.org" target="_blank" rel="noopener" className="underline">LanguageTool</a>.
              {current?.fixed ? " Check again before saving, so the score matches the text." : ""}
            </p>
          </div>

          {current && (
            <WritingFeedback
              lang={lang}
              entry={current}
              stale={stale}
              canSpeak={canSpeak}
              onSay={say}
              onApplyFix={applyOne}
              minWords={isFree ? null : prompt.min}
              noteTitles={noteTitles}
              onOpenNote={onOpenNote}
            />
          )}
        </section>

        {/* ---------------- journal ---------------- */}
        <aside className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="font-type text-lg mb-2" style={{ color: C.ink }}>Journal</div>
          {history.length === 0 ? (
            <p className="font-serif text-sm" style={{ color: C.muted }}>
              Pieces you save appear here with their scores, so you can see your accuracy change.
            </p>
          ) : (
            <>
              <Trend entries={history.slice(0, 12).reverse()} />
              <ul className="flex flex-col">
                {history.slice(0, 20).map((e) => (
                  <li key={e.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <button type="button" onClick={() => load(e)} className="text-left w-full py-2" title="Open this piece in the editor">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs" style={{ color: C.muted }}>{shortDate(e.at)}</span>
                        <span className="text-xs font-semibold" style={{ color: e.accuracy === 100 ? C.green : C.ink }}>
                          {e.accuracy == null ? "—" : `${e.accuracy}% clean`}
                        </span>
                      </div>
                      <div className="font-serif text-sm truncate" style={{ color: C.ink }}>{e.prompt}</div>
                      <div className="text-[0.6875rem]" style={{ color: C.muted }}>
                        {e.words} words{e.beyond2k != null ? ` · ${e.beyond2k}% beyond the top 2,000` : ""}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
