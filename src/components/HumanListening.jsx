import { useState } from "react";
import { HUMAN_LISTENING } from "../data/human-listening.js";
import { downloadPack } from "../lib/offline.js";
import { useLocalDraft } from "../hooks/useLocalDraft.js";
import Recorder from "./Recorder.jsx";
export default function HumanListening({ lang, onWork, onEvidence, onAction }) {
  const [selected, setSelected] = useState(""),
    [answers, setAnswers] = useState({}),
    [showChecks, setShowChecks] = useState(false),
    [status, setStatus] = useState("");
  const track = HUMAN_LISTENING.find(
    (t) => t.lang === lang && t.id === selected,
  );
  const [reflection, setReflection, error] = useLocalDraft(
    `vocabdrawer:human-listening:${lang}:${selected}`,
    "",
  );
  async function download() {
    setStatus("Downloading the original recording…");
    try {
      const result = await downloadPack([track.audio]);
      setStatus(
        `Recording ready offline · ${(result.bytes / 1048576).toFixed(1)} MB`,
      );
    } catch (e) {
      setStatus(e.message);
    }
  }
  if (!track)
    return (
      <div className="vd-stack">
        <section className="vd-panel">
          <h1>Human listening library</h1>
          <p>
            Real readers, original recordings, and clear source credits. Enjoy a
            short fable or a longer fairy tale. The literary language is a
            challenge; these starting-point labels are guidance, not a
            calibrated test.
          </p>
        </section>
        <div className="vd-grid">
          {HUMAN_LISTENING.filter((t) => t.lang === lang).map((t) => (
            <button
              key={t.id}
              className="vd-panel"
              style={{ textAlign: "left" }}
              onClick={() => {
                setSelected(t.id);
                setAnswers({});
                setShowChecks(false);
                setStatus("");
              }}
            >
              <h2 lang={lang}>{t.title}</h2>
              <p>{t.english}</p>
              <p>{t.description}</p>
              <span className="vd-tag">
                {t.level} · Human reader · {t.license}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  return (
    <section className="vd-panel vd-stack">
      <div className="vd-toolbar">
        <h1 lang={lang} style={{ flex: 1 }}>
          {track.title}
        </h1>
        <button className="vd-button" onClick={() => setSelected("")}>
          Human listening library
        </button>
      </div>
      <p>{track.description}</p>
      <audio
        controls
        src={track.audio}
        aria-label={`${track.title} human recording`}
        onPlay={() => onWork?.("listeningMeaning")}
      />
      <p className="vd-muted">
        {track.author} · {track.reader} ·{" "}
        <a href={track.source} target="_blank" rel="noreferrer">
          Recording source
        </a>{" "}
        ·{" "}
        <a href={track.licenseUrl} target="_blank" rel="noreferrer">
          {track.license}
        </a>{" "}
        · Original recording, unchanged.
      </p>
      <div className="vd-toolbar">
        <button className="vd-button" onClick={download}>
          Download this recording
        </button>
        <button
          className="vd-button"
          onClick={() => onAction({ action: "media", humanId: track.id })}
        >
          Study it in Media Studio
        </button>
        <button className="vd-button" onClick={() => setShowChecks((v) => !v)}>
          {showChecks
            ? "Hide comprehension prompts"
            : "Try gist and detail prompts"}
        </button>
      </div>
      {showChecks &&
        track.questions.map((q, i) => (
          <div key={q.prompt}>
            <h2 style={{ fontSize: "1.2rem" }}>{q.prompt}</h2>
            <div className="vd-toolbar">
              {q.options
                .map((option, j) => ({ option, j }))
                .sort(
                  (a, b) =>
                    ((a.j + i + track.id.length) % q.options.length) -
                    ((b.j + i + track.id.length) % q.options.length),
                )
                .map(({ option, j }) => (
                  <button
                    className="vd-button"
                    key={option}
                    disabled={answers[i] != null}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [i]: j }));
                      onWork?.("listeningMeaning");
                    }}
                  >
                    {option}
                  </button>
                ))}
            </div>
            {answers[i] != null && (
              <p role="status">
                {answers[i] === q.answer
                  ? "That matches the story."
                  : "Try listening for that part again."}{" "}
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      <h2>Retell the meaning</h2>
      <p>
        {track.reflection ||
          "Describe the important events and one detail you caught. Listen again, then see whether your own summary changes."}
      </p>
      <Recorder label="Record a story retelling" />
      <label className="vd-field">
        Your listening notes
        <textarea
          aria-label="Your listening notes"
          className="vd-input"
          lang={lang}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </label>
      <button
        className="vd-button vd-primary"
        disabled={!reflection.trim()}
        onClick={() => {
          onEvidence({
            lang,
            title: track.title,
            canDo: "Follow and retell a literary recording",
            evidence: "human-listening-and-personal-summary",
            selfReported: true,
            verified: false,
            response: reflection,
            details: track.questions.map((q, i) =>
              answers[i] == null ? null : answers[i] === q.answer,
            ),
          });
          setStatus("Listening and your self-reported summary recorded.");
        }}
      >
        Save listening practice
      </button>
      {error && <p role="alert">{error}</p>}
      <p role="status">{status}</p>
    </section>
  );
}
