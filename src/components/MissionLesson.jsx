import { useLocalDraft } from "../hooks/useLocalDraft.js";
import { CHALLENGES } from "../data/challenges.js";
import { useEffect, useRef, useState } from "react";
import { missionsFor } from "../data/missions.js";
import { downloadPack, packAvailable } from "../lib/offline.js";
import LookupText from "./LookupText.jsx";
import Recorder from "./Recorder.jsx";
import WritingFeedback from "./WritingFeedback.jsx";

const STAGES = ["Learn", "Listen", "Understand", "Use it", "Reflect"];
export default function MissionLesson({
  lang,
  level,
  missionId,
  mode = "missions",
  records = {},
  onRecord,
  onComplete,
  onSavePhrase,
  onWork,
  glossOf,
  check,
  goal = "everyday",
  onHome,
}) {
  const available =
    mode === "challenge"
      ? CHALLENGES[lang].filter(
          (c) =>
            ["A1", "A2", "B1", "B2", "C1"].indexOf(c.level) <=
            ["A1", "A2", "B1", "B2", "C1"].indexOf(level),
        )
      : missionsFor(lang, level, goal);
  const [selected, setSelected] = useState(missionId || "");
  const mission = available.find((m) => m.id === selected);
  const [stage, setStage] = useState(0),
    [showText, setShowText] = useState(false),
    [showEnglish, setShowEnglish] = useState(false),
    [picked, setPicked] = useState(null),
    [checked, setChecked] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [lookup, setLookup] = useState(null),
    [offline, setOffline] = useState(false),
    [download, setDownload] = useState(""),
    [remembered, setRemembered] = useState(false);
  const [draft, setDraft, draftError] = useLocalDraft(
    `vocabdrawer:mission-draft:${lang}:${selected}`,
    records[selected]?.draft || "",
  );
  const audio = useRef(),
    request = useRef(0),
    recordsRef = useRef(records);
  recordsRef.current = records;
  const audioPath = mission?.audio;
  useEffect(() => {
    setSelected(missionId || "");
  }, [missionId, lang]);
  useEffect(() => {
    setStage(
      mode === "listeningLab"
        ? 1
        : Math.min(recordsRef.current[selected]?.stage || 0, 4),
    );
    setShowText(false);
    setShowEnglish(false);
    setPicked(null);
    setChecked(null);
    setRemembered(false);
  }, [selected, mode]);
  useEffect(() => {
    if (audioPath) packAvailable([audioPath]).then(setOffline);
  }, [audioPath]);
  useEffect(
    () => () => {
      request.current++;
    },
    [lang, selected],
  );
  function open(m) {
    setSelected(m.id);
    onRecord(m.id, { lang, stage: 0, draft: "", title: m.title });
  }
  function move(n) {
    audio.current?.pause();
    setStage(n);
    onRecord(mission.id, { lang, stage: n, draft });
    onWork?.(
      n === 1 || n === 2
        ? "listeningMeaning"
        : n === 3
          ? "writing"
          : "missions",
    );
  }
  async function assess() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError("");
    const id = ++request.current;
    try {
      const result = await check(draft);
      if (id === request.current) {
        setChecked({ text: draft, result });
        onWork?.("writing");
      }
    } catch (e) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  async function saveOffline() {
    setDownload("Downloading…");
    try {
      const result = await downloadPack([
        mission.audio,
        mission.captions,
        mission.englishCaptions,
      ]);
      setOffline(true);
      setDownload(`Ready offline · ${(result.bytes / 1024).toFixed(0)} KB`);
    } catch (e) {
      setDownload(e.message);
    }
  }
  if (!mission)
    return (
      <div className="vd-stack">
        <section className="vd-panel">
          <h1>
            {mode === "listeningLab"
              ? "Listen for meaning"
              : mode === "challenge"
                ? "Unseen challenges"
                : "Practical missions"}
          </h1>
          <p>
            {mode === "challenge"
              ? "Try a different situation after a delay. Your response is assessed separately from familiar practice."
              : "Learn a useful pattern, follow a short dialogue, then use it for something you mean."}
          </p>
          <div className="vd-toolbar">
            <button className="vd-button" onClick={onHome}>
              Today
            </button>
          </div>
        </section>
        <div className="vd-grid">
          {available.map((m) => (
            <button
              className="vd-panel"
              style={{ textAlign: "left" }}
              key={m.id}
              onClick={() => open(m)}
            >
              <div className="vd-kicker">
                {m.level} · {m.minutes} minutes · {m.goal}
              </div>
              <h2>{m.title}</h2>
              <p>{m.canDo}</p>
              <span className="vd-muted">
                {records[m.id]?.completedAt
                  ? "Revisit in a new situation"
                  : records[m.id]?.stage
                    ? "Resume your mission"
                    : "Begin"}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  const challenge = mode === "challenge";
  const answers = mission.question.options;
  const rotation = (mission.order + 1) % answers.length;
  const options = answers
    .map((text, i) => ({ text, id: i }))
    .slice(rotation)
    .concat(answers.map((text, i) => ({ text, id: i })).slice(0, rotation));
  const completion = () => {
    onComplete({
      id: mission.id,
      lang,
      title: mission.title,
      canDo: mission.canDo,
      evidence: challenge
        ? "unseen-personal-response"
        : "guided-personal-response",
      verified: false,
      selfReported: true,
      response: draft,
      comprehension: picked == null ? null : picked === mission.question.answer,
      assessment:
        checked?.text === draft ? checked.result.assessment : undefined,
    });
    setStage(4);
    onRecord(mission.id, {
      lang,
      stage: 4,
      draft,
      completedAt: new Date().toISOString(),
      title: mission.title,
    });
  };
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <div className="vd-toolbar">
          <h1 style={{ flex: 1 }}>{mission.title}</h1>
          <button
            className="vd-button"
            onClick={() => {
              onRecord(mission.id, { lang, stage, draft });
              setSelected("");
            }}
          >
            Mission library
          </button>
        </div>
        <p>{mission.canDo}</p>
        <div className="vd-toolbar">
          <span className="vd-tag">{mission.level}</span>
          <span className="vd-muted">{mission.source.audio}</span>
          <button className="vd-button" onClick={saveOffline}>
            {offline ? "Download again" : "Download this lesson"}
          </button>
          <span role="status" className="vd-muted">
            {download || (offline ? "Audio ready offline" : "")}
          </span>
        </div>
      </section>
      <ol className="vd-stage-tabs" aria-label="Mission stages">
        {STAGES.map((name, i) => (
          <li key={name}>
            <button
              className="vd-button"
              aria-current={stage === i ? "step" : undefined}
              onClick={() => move(i)}
            >
              {i + 1}. {name}
            </button>
          </li>
        ))}
      </ol>
      {stage === 0 && (
        <section className="vd-panel">
          <h2>Three useful patterns</h2>
          <p>{mission.pattern}</p>
          <div className="vd-grid">
            {mission.chunks.map((c) => (
              <div key={c.text} className="vd-panel">
                <p lang={lang} className="vd-caption">
                  {c.text}
                </p>
                <p>{c.en}</p>
                <button
                  className="vd-button"
                  onClick={() =>
                    onSavePhrase({
                      text: c.text,
                      translation: c.en,
                      source: mission.title,
                    })
                  }
                >
                  Save phrase
                </button>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>
            First read the patterns. Then listen for the situation without
            reading every word.
          </p>
          <button className="vd-button vd-primary" onClick={() => move(1)}>
            Listen to the dialogue
          </button>
        </section>
      )}
      {stage === 1 && (
        <section className="vd-panel">
          <h2>
            {challenge ? "Listen to a new situation" : "Listen for the meaning"}
          </h2>
          <audio
            ref={audio}
            controls
            src={mission.audio}
            aria-label={`${mission.title} dialogue`}
            onPlay={() => onWork?.("listeningMeaning")}
            onError={() =>
              setError(
                "Audio could not load. Reconnect or download this lesson before going offline.",
              )
            }
          />
          <p className="vd-muted">
            Two synthetic voices. Listen once for the gist; replay for details.{" "}
            {challenge ? "Try responding without opening the transcript." : ""}
          </p>
          <div className="vd-toolbar">
            <button
              className="vd-button"
              onClick={() => setShowText((v) => !v)}
            >
              {showText ? "Hide transcript" : "Reveal transcript"}
            </button>
            <button
              className="vd-button"
              onClick={() => setShowEnglish((v) => !v)}
            >
              {showEnglish ? "Hide English" : "Show English"}
            </button>
            <button
              className="vd-button"
              onClick={() => {
                if (audio.current) audio.current.playbackRate = 0.8;
              }}
            >
              Slower playback
            </button>
          </div>
          {showText &&
            mission.lines.map((line, i) => (
              <div key={i} className="vd-reading" style={{ marginTop: 12 }}>
                <span className="vd-muted">{line.speaker}: </span>
                <LookupText
                  text={line.text}
                  lang={lang}
                  onLookup={(word) => setLookup({ word, gloss: glossOf(word) })}
                />
                {showEnglish && <p className="vd-muted">{line.en}</p>}
              </div>
            ))}
          {lookup && (
            <p role="status">
              {lookup.word}:{" "}
              {lookup.gloss ||
                "No offline definition. Save the whole phrase with its supplied translation."}
            </p>
          )}
          <div className="vd-toolbar" style={{ marginTop: 18 }}>
            <button className="vd-button vd-primary" onClick={() => move(2)}>
              Check the meaning
            </button>
          </div>
        </section>
      )}
      {stage === 2 && (
        <section className="vd-panel">
          <h2>{mission.question.prompt}</h2>
          <div className="vd-stack">
            {options.map((o) => (
              <button
                key={o.id}
                className="vd-button"
                disabled={picked != null}
                onClick={() => {
                  setPicked(o.id);
                  onWork?.("listeningMeaning");
                }}
              >
                {o.text}
              </button>
            ))}
          </div>
          {picked != null && (
            <div role="status" className="vd-notice" style={{ marginTop: 16 }}>
              {picked === mission.question.answer
                ? "That matches the dialogue."
                : `Listen again for the detail: ${answers[mission.question.answer]}.`}
            </div>
          )}
          <p>
            This checks one detail. It does not by itself establish a language
            level.
          </p>
          <button className="vd-button vd-primary" onClick={() => move(3)}>
            Use it for yourself
          </button>
        </section>
      )}
      {stage === 3 && (
        <section className="vd-panel">
          <h2>{mission.personal}</h2>
          <p>
            {challenge
              ? "Change the situation: imagine a different person, place, or time. Use the pattern without copying the original lines."
              : "Say it aloud first, then write your own response. You can use the patterns above as support."}
          </p>
          <Recorder label="Record your response" />
          <label className="vd-field" style={{ marginTop: 18 }}>
            Your personal response
            <textarea
              aria-label="Your personal response"
              lang={lang}
              className="vd-input"
              value={draft}
              onChange={(e) => {
                request.current++;
                setBusy(false);
                setDraft(e.target.value);
                setChecked(null);
              }}
              onBlur={() => onRecord(mission.id, { lang, stage, draft })}
            />
          </label>
          <div className="vd-toolbar">
            <button
              className="vd-button"
              disabled={!draft.trim() || busy}
              onClick={assess}
            >
              {busy ? "Checking…" : "Check grammar"}
            </button>
            <span className="vd-muted">
              Grammar checking sends this text to LanguageTool; it may be
              unavailable offline.
            </span>
          </div>
          {checked && <WritingFeedback lang={lang} entry={checked} />}
          <label className="vd-check">
            <input
              type="checkbox"
              checked={remembered}
              onChange={(e) => setRemembered(e.target.checked)}
            />
            I expressed my own meaning and checked it against the task.
          </label>
          <button
            className="vd-button vd-primary"
            disabled={!draft.trim() || !remembered}
            onClick={completion}
          >
            Finish this mission
          </button>
          <p className="vd-muted">
            Task completion is self-reported. Grammar feedback and listening
            answers are recorded separately.
          </p>
        </section>
      )}
      {stage === 4 && (
        <section className="vd-panel">
          <h2>A useful step completed</h2>
          <p>You worked on: {mission.canDo.toLowerCase()}.</p>
          <p>
            Come back tomorrow and use these patterns for a different situation.
            Your skill passport records this task as practice evidence, with its
            assessment source.
          </p>
          <div className="vd-toolbar">
            <button className="vd-button vd-primary" onClick={onHome}>
              Back to Today
            </button>
            <button className="vd-button" onClick={() => move(3)}>
              Try another personal response
            </button>
          </div>
        </section>
      )}
      {draftError && <p role="alert">{draftError}</p>}
      {error && (
        <p role="alert" className="vd-notice">
          {error}
        </p>
      )}
    </div>
  );
}
