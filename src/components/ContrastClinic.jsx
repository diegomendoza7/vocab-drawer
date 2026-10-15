import { useEffect, useRef, useState } from "react";
import { clinicLessons } from "../lib/personal-clinic.js";
import { useLocalDraft } from "../hooks/useLocalDraft.js";
import { ruleKeyOf } from "../lib/errors.js";
import WritingFeedback from "./WritingFeedback.jsx";
import Emphasised from "./Emphasised.jsx";
export default function ContrastClinic({
  lang,
  mistakes,
  check,
  onEvidence,
  onWork,
}) {
  const lessons = clinicLessons(lang, mistakes),
    [selected, setSelected] = useState(""),
    [picked, setPicked] = useState(null),
    [checked, setChecked] = useState(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [showModel, setShowModel] = useState(false);
  const lesson = lessons.find((l) => l.id === selected) || lessons[0];
  const [draft, setDraft, draftError] = useLocalDraft(
    `vocabdrawer:clinic-draft:${lang}:${lesson.id}`,
    "",
  );
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [lang, selected],
  );
  async function assess() {
    const id = ++request.current,
      text = draft;
    setBusy(true);
    setStatus("");
    try {
      const result = await check(text);
      if (id === request.current) setChecked({ text, result });
    } catch (e) {
      if (id === request.current) setStatus(e.message);
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  const ownRuleChecked =
    checked?.text === draft &&
    (checked.result.assessment?.verified ||
      (lesson.rule?.startsWith("de-") &&
        checked.result.assessment?.coverage === "selected-german-rules"));
  const ruleStillPresent = checked?.result.issues?.some(
    (issue) => ruleKeyOf(issue) === lesson.rule,
  );
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Contrast clinic</h1>
        <p>
          A short explanation, a contrast, and a new sentence of your own.
          Patterns from your own writing appear first when examples are
          available.
        </p>
        <label className="vd-field">
          Pattern
          <select
            aria-label="Pattern"
            className="vd-input"
            value={lesson.id}
            onChange={(e) => {
              request.current++;
              setBusy(false);
              setSelected(e.target.value);
              setPicked(null);
              setChecked(null);
              setShowModel(false);
              setStatus("");
            }}
          >
            {lessons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <h2>{lesson.title}</h2>
        <p>
          <Emphasised text={lesson.explanation} />
        </p>
        {lesson.personalError ? (
          <>
            <h3>Your earlier wording</h3>
            <p className="vd-caption" lang={lang}>
              {lesson.original}
            </p>
            {lesson.model && (
              <>
                <button
                  className="vd-button"
                  onClick={() => setShowModel((v) => !v)}
                >
                  {showModel
                    ? "Hide saved suggestion"
                    : "Compare with the saved suggestion"}
                </button>
                {showModel && <p lang={lang}>{lesson.model}</p>}
              </>
            )}
          </>
        ) : (
          <>
            <p className="vd-caption" lang={lang}>
              {lesson.model}
            </p>
            <p>{lesson.english}</p>
            <h3>{lesson.prompt}</h3>
            <div className="vd-toolbar">
              {lesson.options.map((o, i) => (
                <button
                  className="vd-button"
                  key={o}
                  disabled={picked != null}
                  onClick={() => {
                    setPicked(i);
                    onWork?.("mistakes");
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
            {picked != null && (
              <p role="status">
                {picked === lesson.answer
                  ? "That fits the pattern."
                  : "Compare with the model and its explanation."}
              </p>
            )}
          </>
        )}
        <label className="vd-field">
          {lesson.personal}
          <textarea
            aria-label="Your new clinic sentence"
            className="vd-input"
            lang={lang}
            value={draft}
            onChange={(e) => {
              request.current++;
              setBusy(false);
              setDraft(e.target.value);
              setChecked(null);
            }}
          />
        </label>
        <div className="vd-toolbar">
          <button
            className="vd-button"
            disabled={!draft.trim() || busy}
            onClick={assess}
          >
            {busy ? "Checking…" : "Check my new sentence"}
          </button>
          <button
            className="vd-button vd-primary"
            disabled={
              !draft.trim() || (!lesson.personalError && picked == null)
            }
            onClick={() => {
              onEvidence({
                lang,
                title: lesson.title,
                rule: lesson.rule,
                response: draft,
                canDo:
                  "Apply a grammatical or lexical contrast in a new sentence",
                evidence: lesson.personalError
                  ? "personal-mistake-and-new-response"
                  : "contrast-and-personal-response",
                selfReported: true,
                verified: false,
                comprehension: lesson.personalError
                  ? undefined
                  : picked === lesson.answer,
                assessment:
                  checked?.text === draft
                    ? checked.result.assessment
                    : undefined,
              });
              onWork?.("mistakes");
              setStatus(
                "Practice recorded. Try a different sentence tomorrow.",
              );
            }}
          >
            Save practice evidence
          </button>
        </div>
        {checked && <WritingFeedback lang={lang} entry={checked} />}{" "}
        {lesson.personalError && checked && (
          <p className="vd-muted">
            {!ownRuleChecked
              ? "The required rule has not been fully assessed."
              : ruleStillPresent
                ? "The checker still reports this pattern."
                : "The checker did not report that pattern in your new sentence. Review whether the meaning and task are also fulfilled."}
          </p>
        )}
        {draftError && <p role="alert">{draftError}</p>}
        <p role="status">{status}</p>
      </section>
    </div>
  );
}
