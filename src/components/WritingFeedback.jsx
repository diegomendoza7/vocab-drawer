import { useState } from "react";
import { ExternalLink, WifiOff, Clock, Check, X, BookOpen } from "lucide-react";
import { C, TINT, shade } from "../theme.js";
import { KIND_LABEL, COUNTED, accuracyLabel } from "../lib/grammar.js";
import { ruleInfo, ruleKeyOf } from "../lib/errors.js";
import { COPY_LIMIT, BANDS } from "../lib/writing.js";
import SpeakButton from "./SpeakButton.jsx";
import Emphasised from "./Emphasised.jsx";

/* What a check found, in the order it matters.
 *
 * Grammar leads, because it is the score the learner asked for first: the
 * share of sentences with no grammar or spelling error, then every issue in
 * place. The model answer and the key ideas come next — comprehension. The
 * vocabulary profile is last and set smaller, on purpose: it describes the
 * writing, it does not grade it, and a learner who swaps a plain word for a
 * rare one they cannot use has not improved.
 */

const KIND_TONE = { grammar: C.red, spelling: C.red, punctuation: C.gold, style: C.muted };
const BAND_TONE = { k1: C.line, k2: shade(0.22), k5: shade(0.42), k10: shade(0.62), off: shade(0.82) };

function Marked({ text, issues, active, onPick }) {
  const out = [];
  let at = 0;
  [...issues].sort((a, b) => a.start - b.start).forEach((i, n) => {
    if (i.start < at) return;
    if (i.start > at) out.push(<span key={`t${n}`}>{text.slice(at, i.start)}</span>);
    out.push(
      <button
        key={`i${n}`}
        type="button"
        onClick={() => onPick(i)}
        style={{
          textDecorationLine: "underline",
          textDecorationStyle: COUNTED.has(i.kind) ? "wavy" : "dotted",
          textDecorationColor: KIND_TONE[i.kind],
          textUnderlineOffset: 4,
          backgroundColor: active === i ? TINT : "transparent",
          color: "inherit",
          font: "inherit",
          padding: 0,
        }}
      >
        {text.slice(i.start, i.end) || "␣"}
      </button>,
    );
    at = Math.max(at, i.end);
  });
  if (at < text.length) out.push(<span key="end">{text.slice(at)}</span>);
  return (
    <p className="font-serif text-[0.9375rem] rounded-md p-3" style={{ color: C.ink, lineHeight: 1.85, whiteSpace: "pre-wrap", backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
      {out}
    </p>
  );
}

function Status({ status, waitMs, lang }) {
  const extra = lang === "de" ? " The German word-order and case rules ran offline." : "";
  if (status === "ok") {
    return (
      <span>
        Grammar and spelling checked by{" "}
        <a href="https://languagetool.org" target="_blank" rel="noopener" className="underline inline-flex items-center gap-0.5" style={{ color: C.ink }}>
          LanguageTool <ExternalLink size={10} />
        </a>
        {lang === "de" ? ", plus Vocab Drawer's German word-order and case rules." : "."}
      </span>
    );
  }
  if (status === "rate") {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock size={11} /> The free checker allows 20 checks a minute — try again in {Math.max(1, Math.ceil((waitMs || 0) / 1000))} s.{extra}
      </span>
    );
  }
  if (status === "offline") {
    return <span className="inline-flex items-center gap-1"><WifiOff size={11} /> LanguageTool couldn't be reached, so grammar and spelling weren't checked.{extra}</span>;
  }
  if (status === "too-long") return <span>Too long for the free checker (20 KB).{extra}</span>;
  return <span>LanguageTool returned an error, so grammar and spelling weren't checked.{extra}</span>;
}

/* The rule behind one flagged error, offered rather than forced.
 *
 * LanguageTool's own message says what is wrong with *this* sentence ("le
 * should be la here"). It never says what the rule is, so the same error
 * arrives again next week having taught nothing. The explanation is folded
 * shut because a panel of six open essays is a panel nobody reads — but it is
 * one click away at the exact moment the learner is looking at their own
 * mistake, which is the only moment a grammar note is genuinely wanted.
 */
function Why({ issue, noteTitles, onOpenNote }) {
  const info = ruleInfo(ruleKeyOf(issue));
  if (!info.why) return null;
  const note = info.note && noteTitles.includes(info.note) ? info.note : null;
  return (
    <details className="mt-0.5">
      <summary className="text-[0.6875rem] font-semibold cursor-pointer inline-flex items-center gap-1" style={{ color: C.muted }}>
        Why — {info.title}
      </summary>
      <div className="mt-1 pl-2" style={{ borderLeft: `2px solid ${C.line}` }}>
        <p className="font-serif text-[0.8125rem]" style={{ color: C.muted, lineHeight: 1.6, maxWidth: "60ch" }}>
          <Emphasised text={info.why} />
        </p>
        {note && onOpenNote && (
          <button
            type="button"
            onClick={() => onOpenNote(note)}
            className="mt-1.5 px-2 py-1 rounded text-[0.6875rem] font-semibold inline-flex items-center gap-1"
            style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}
          >
            <BookOpen size={11} /> Read: {note}
          </button>
        )}
      </div>
    </details>
  );
}

export default function WritingFeedback({
  lang, entry, stale, model, canSpeak, onSay, onApplyFix, passageProfile, minWords, minSentenceWords,
  noteTitles = [], onOpenNote,
}) {
  const [active, setActive] = useState(null);
  const { result, shape, copied, ideas, fixed, text } = entry;
  const { status, waitMs, issues, score, profile } = result;
  const errors = issues.filter((i) => COUNTED.has(i.kind));
  const tips = issues.filter((i) => !COUNTED.has(i.kind));
  const clean = score.sentences > 0 && score.errorFree === score.sentences;

  const nudges = [];
  if (shape?.short) nudges.push(`That isn't a full sentence yet — answer with a subject and a verb${minSentenceWords ? `, at least ${minSentenceWords} words` : ""}.`);
  if (shape && !shape.capital) nudges.push("Start with a capital letter.");
  if (shape && !shape.ends) nudges.push("End with a full stop, question mark or exclamation mark.");
  if (copied?.words >= COPY_LIMIT) nudges.push(`${copied.words} words in a row come straight from the text: “${copied.text}”. Try putting it your own way.`);
  if (minWords && score.words < minWords) nudges.push(`You wrote ${score.words} words; this task asks for at least ${minWords}.`);

  const Row = ({ i }) => (
    <li
      className="flex flex-col gap-1 py-2"
      style={{ borderTop: `1px solid ${C.line}`, backgroundColor: active === i ? TINT : "transparent" }}
      onMouseEnter={() => setActive(i)}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[0.625rem] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: KIND_TONE[i.kind], border: `1px solid ${C.line}` }}>
          {i.source === "drawer" ? i.short : KIND_LABEL[i.kind]}
        </span>
        <span className="font-serif text-sm" style={{ color: C.ink }}>{i.message}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-serif text-sm" style={{ color: C.muted }}>“{text.slice(i.start, i.end)}”</span>
        {i.fixes.length > 0 && <span className="text-xs" style={{ color: C.muted }}>→</span>}
        {i.fixes.map((f) => (
          <button
            key={f}
            type="button"
            disabled={stale || !onApplyFix}
            onClick={() => { onApplyFix(i, f); setActive(null); }}
            className="px-2 py-0.5 rounded text-sm font-serif disabled:opacity-50"
            style={{ border: `1px solid ${C.green}`, color: C.ink }}
            title={stale ? "You've edited the text since the check — check again first" : "Apply this fix"}
          >
            {f || "(remove)"}
          </button>
        ))}
      </div>
      {COUNTED.has(i.kind) && <Why issue={i} noteTitles={noteTitles} onOpenNote={onOpenNote} />}
    </li>
  );

  return (
    <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, opacity: stale ? 0.75 : 1 }}>
      {/* ---- grammar: the headline ---- */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-type text-3xl tabular-nums" style={{ color: clean ? C.green : C.ink }}>
          {score.errorFree == null ? '—' : score.errorFree}/{score.sentences}
        </span>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {score.accuracy==null?'sentence count · complete grammar score unavailable':<>sentence{score.sentences === 1 ? "" : "s"} with no grammar or spelling error</>}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: clean ? C.green : C.paper, color: clean ? C.card : C.ink, border: clean ? "none" : `1px solid ${C.line}` }}>
          {score.accuracy == null ? 'Not fully assessed' : accuracyLabel(score.accuracy)}
        </span>
      </div>
      <div className="text-[0.6875rem] font-serif" style={{ color: C.muted }}>
        <Status status={status} waitMs={waitMs} lang={lang} />
      </div>
      {(stale || fixed > 0) && (
        <div className="text-xs font-serif" style={{ color: C.accent }}>
          {stale ? "You've edited this since the check — " : `${fixed} fix${fixed === 1 ? "" : "es"} applied — `}check again to rescore.
        </div>
      )}

      <Marked text={text} issues={issues} active={active} onPick={setActive} />

      {errors.length > 0 && (
        <ul className="flex flex-col">
          {errors.map((i, n) => <Row key={`e${n}`} i={i} />)}
        </ul>
      )}
      {errors.length === 0 && status === "ok" && (
        /* After a fix the score above is the one from the last check, so a
         * green "no errors" here would contradict it. Say what is true: the
         * list is empty, the score is not yet earned. */
        <div className="flex items-center gap-1.5 text-sm font-serif" style={{ color: fixed > 0 ? C.muted : C.green }}>
          <Check size={15} /> {fixed > 0 ? "Nothing left from the last check — check again to rescore." : "No grammar or spelling errors found."}
        </div>
      )}
      {tips.length > 0 && (
        <details>
          <summary className="text-xs font-semibold cursor-pointer" style={{ color: C.muted }}>
            {tips.length} punctuation and style tip{tips.length === 1 ? "" : "s"} (not counted)
          </summary>
          <ul className="flex flex-col mt-1">{tips.map((i, n) => <Row key={`t${n}`} i={i} />)}</ul>
        </details>
      )}

      {nudges.length > 0 && (
        <ul className="flex flex-col gap-1">
          {nudges.map((n) => (
            <li key={n} className="font-serif text-sm flex gap-1.5" style={{ color: C.ink }}>
              <span style={{ color: C.accent }}>•</span> {n}
            </li>
          ))}
        </ul>
      )}

      {/* ---- comprehension ---- */}
      {ideas && (
        <div className="flex items-center gap-1.5 text-sm font-serif" style={{ color: ideas.missing.length ? C.ink : C.green }}>
          {ideas.missing.length ? <X size={15} style={{ color: C.accent }} /> : <Check size={15} />}
          {ideas.found.length} of {ideas.total} key idea{ideas.total === 1 ? "" : "s"} in your answer
          {ideas.missing.length > 0 && <span style={{ color: C.muted }}> — compare with the model answer</span>}
        </div>
      )}
      {model && (
        <div className="rounded-md p-3" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>A model answer</span>
            <SpeakButton onSay={() => onSay(model)} ready={canSpeak} size={12} title="Hear the model answer" />
          </div>
          <p className="font-serif text-[0.9375rem]" style={{ color: C.ink, lineHeight: 1.6 }}>{model}</p>
        </div>
      )}

      {/* ---- vocabulary: secondary ---- */}
      {profile && profile.tokens > 0 && (
        <div className="pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Vocabulary</span>
            <span className="text-[0.6875rem] font-serif" style={{ color: C.muted }}>— described, not graded; grammar comes first</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mb-1.5" title="Your words by frequency band">
            {BANDS.map((b) => profile.bands[b.key] > 0 && (
              <div key={b.key} style={{ width: `${(profile.bands[b.key] / profile.tokens) * 100}%`, backgroundColor: BAND_TONE[b.key] }} />
            ))}
          </div>
          <p className="font-serif text-xs" style={{ color: C.ink, lineHeight: 1.6 }}>
            {profile.tokens} words, {profile.types} different.{" "}
            <b>{Math.round(profile.beyond2k * 100)}%</b> beyond the 2,000 most common
            {passageProfile ? <> — the passage itself: {Math.round(passageProfile.beyond2k * 100)}%.</> : "."}
          </p>
          {profile.beyondWords.length > 0 && (
            <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>
              Less common words you used: {profile.beyondWords.slice(0, 10).join(", ")}
            </p>
          )}
          {profile.drawerWords.length > 0 && (
            <p className="font-serif text-xs mt-1" style={{ color: C.muted }}>
              From drawers you've studied: {profile.drawerWords.slice(0, 10).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
