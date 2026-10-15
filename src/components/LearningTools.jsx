import { useLocalDraft } from "../hooks/useLocalDraft.js";
import { useEffect, useRef, useState } from "react";
import {
  addDays,
  todayKey,
  isReady,
  scheduleCard,
  newCard,
  LEARNING_GAP_MS,
} from "../lib/srs.js";
import { MISSIONS, PRONUNCIATION_PAIRS } from "../data/missions.js";
import { recordingFor } from "../lib/voice.js";
import { eventId } from "../lib/progress.js";
import PhotoAttachment from "./PhotoAttachment.jsx";
import Recorder from "./Recorder.jsx";
import WritingFeedback from "./WritingFeedback.jsx";

export function PhraseNotebook({ lang, phrases, onChange, onWork }) {
  const rows = phrases.filter((p) => p.lang === lang),
    due = rows.filter((p) => p.translation && isReady(p.card));
  const [studying, setStudying] = useState(false),
    [studyId, setStudyId] = useState(""),
    [input, setInput] = useState(""),
    [shown, setShown] = useState(false),
    [hint, setHint] = useState(false),
    [result, setResult] = useState(null),
    [edit, setEdit] = useState(""),
    [meaning, setMeaning] = useState("");
  const item = rows.find((p) => p.id === studyId);
  const fold = (s) =>
    s
      .normalize("NFC")
      .toLocaleLowerCase(lang)
      .replace(/’/g, "'")
      .replace(/[.,!?;:…«»"“”]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  function support(kind) {
    if (!item) return;
    if (kind === "hint") setHint(true);
    else setShown(true);
    onChange(
      phrases.map((p) =>
        p.id === item.id
          ? {
              ...p,
              card: {
                ...newCard(),
                ...p.card,
                seenAt: Date.now(),
                readyAt: Date.now() + LEARNING_GAP_MS,
              },
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
  }
  function grade() {
    if (!input.trim() || !item || result) return;
    setResult({ ok: fold(input) === fold(item.text) });
    onWork?.("phrases");
  }
  function next() {
    if (item && result && !hint && !shown)
      onChange(
        phrases.map((p) =>
          p.id === item.id
            ? {
                ...p,
                card: scheduleCard(p.card, result.ok ? "good" : "again", p.id),
                reviewedAt: Date.now(),
              }
            : p,
        ),
      );
    setStudyId("");
    setStudying(false);
    setInput("");
    setResult(null);
    setHint(false);
    setShown(false);
  }
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Phrase notebook</h1>
        <p>
          Keep useful wording with its meaning and source. Recall the wording
          without a hint to earn a scheduled review; supported practice stays
          separate.
        </p>
        <button
          className="vd-button vd-primary"
          disabled={!due.length}
          onClick={() => {
            setStudying(true);
            setStudyId(due[0]?.id || "");
          }}
        >
          Recall {due.length} ready phrase{due.length === 1 ? "" : "s"}
        </button>
      </section>
      {studying && item && (
        <section className="vd-panel">
          <h2>Recall this phrase’s wording</h2>
          <p>{item.translation}</p>
          <p className="vd-muted">From {item.source || "your notebook"}</p>
          <label className="vd-field">
            Your answer
            <input
              lang={lang}
              className="vd-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (result) next();
                  else grade();
                }
              }}
            />
          </label>
          <div className="vd-toolbar">
            <button className="vd-button" onClick={grade}>
              Check wording
            </button>
            <button className="vd-button" onClick={() => support("hint")}>
              First-word hint
            </button>
            <button className="vd-button" onClick={() => support("model")}>
              Show model
            </button>
          </div>
          {hint && <p>{item.text.split(/\s+/)[0]}…</p>}
          {shown && <p lang={lang}>{item.text}</p>}
          {result && (
            <div role="status">
              <p>
                {result.ok
                  ? "Matches the saved phrase."
                  : `The saved wording is: ${item.text}`}
              </p>
              <p>
                {hint || shown
                  ? "This was supported practice; it does not advance recall, and a second look waits for a short gap."
                  : "A failed recall returns after a short gap; an independent success is scheduled."}
              </p>
              <button className="vd-button vd-primary" onClick={next}>
                Save result
              </button>
            </div>
          )}
        </section>
      )}
      <div className="vd-grid">
        {!studying &&
          rows.map((p) => (
            <section className="vd-panel" key={p.id}>
              <p className="vd-caption" lang={lang}>
                {p.text}
              </p>
              <p>
                {p.translation || "Add a meaning before practicing recall."}
              </p>
              <p className="vd-muted">
                {p.source || "Personal phrase"}
                {p.start != null ? ` · ${Math.floor(p.start)} seconds` : ""}
              </p>
              {p.card?.readyAt > Date.now() && (
                <p className="vd-muted">
                  Second look in about{" "}
                  {Math.ceil((p.card.readyAt - Date.now()) / 60000)} minutes.
                </p>
              )}
              <div className="vd-toolbar">
                <button
                  className="vd-button"
                  onClick={() => {
                    setEdit(p.id);
                    setMeaning(p.translation || "");
                  }}
                >
                  Edit meaning
                </button>
                <button
                  className="vd-button"
                  onClick={() =>
                    onChange(
                      phrases.map((row) =>
                        row.id === p.id
                          ? {
                              ...row,
                              card: {
                                ...row.card,
                                suspended: !row.card?.suspended,
                              },
                            }
                          : row,
                      ),
                    )
                  }
                >
                  {p.card?.suspended ? "Resume reviews" : "Pause reviews"}
                </button>
              </div>
              {edit === p.id && (
                <label className="vd-field">
                  Meaning
                  <input
                    className="vd-input"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                  />
                  <button
                    className="vd-button"
                    onClick={() => {
                      onChange(
                        phrases.map((row) =>
                          row.id === p.id
                            ? {
                                ...row,
                                translation: meaning.trim(),
                                updatedAt: Date.now(),
                              }
                            : row,
                        ),
                      );
                      setEdit("");
                    }}
                  >
                    Save meaning
                  </button>
                </label>
              )}
            </section>
          ))}
      </div>
      {!rows.length && (
        <p className="vd-notice">
          Save a phrase in a mission or Media Studio. Its context and meaning
          will come with it.
        </p>
      )}
    </div>
  );
}

export function LanguageJournal({ lang, entries, onChange, onWork, check }) {
  const [text, setText, draftError] = useLocalDraft(
    `vocabdrawer:journal-draft:${lang}`,
    "",
  );
  const [captureBusy, setCaptureBusy] = useState(false),
    [photoBusy, setPhotoBusy] = useState(false);
  const [photo, setPhoto] = useState(null),
    [draftSerial, setDraftSerial] = useState(0);
  const [recording, setRecording] = useState(null),
    [current, setCurrent] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(null),
    [showOriginal, setShowOriginal] = useState(false);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [lang],
  );
  async function assess() {
    if (!text.trim() || busy) return;
    const id = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await check(text);
      if (id === request.current) {
        setCurrent({ text, result });
        onWork?.("writing");
      }
    } catch (e) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  function save() {
    const at = new Date().toISOString(),
      id = eventId();
    const entry = {
      id,
      lang,
      text: text.trim(),
      at,
      recording: recording?.id || null,
      reviewOn: addDays(todayKey(), 1),
      photo: photo?.id || revision?.photo || null,
      assessment:
        current?.text === text
          ? current.result.assessment
          : { verified: false, coverage: "not-checked" },
      accuracy:
        current?.text === text ? (current.result.score.accuracy ?? null) : null,
      revisionOf: revision?.id || null,
    };
    onChange((latest) =>
      [
        entry,
        ...latest.map((e) =>
          e.id === revision?.id ? { ...e, revisedAt: at } : e,
        ),
      ].slice(0, 120),
    );
    onWork?.("writing");
    setText("");
    setPhoto(null);
    setDraftSerial((n) => n + 1);
    setCurrent(null);
    setRecording(null);
    setRevision(null);
  }
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Your language journal</h1>
        <p>
          Describe something real: a moment today, a photo, a plan, or an
          opinion. Say it first, write it, and revisit it after a gap.
        </p>
        {revision && (
          <div className="vd-notice">
            Rewrite the idea from {new Date(revision.at).toLocaleDateString()}{" "}
            without copying it.
            <button onClick={() => setShowOriginal((v) => !v)}>
              {showOriginal ? "Hide original" : "Compare with original"}
            </button>
            {showOriginal && <p lang={lang}>{revision.text}</p>}
          </div>
        )}
        <Recorder
          key={`${revision?.id || "new"}:${draftSerial}`}
          label="Record a voice note"
          onBusyChange={setCaptureBusy}
          onSave={setRecording}
        />
        <PhotoAttachment
          key={`photo:${draftSerial}`}
          onSave={setPhoto}
          onBusyChange={setPhotoBusy}
          onRemove={() => setPhoto(null)}
        />
        {revision?.photo && (
          <PhotoAttachment
            savedId={revision.photo}
            description="Photo for the idea you are rewriting"
          />
        )}
        <label className="vd-field" style={{ marginTop: 16 }}>
          Your own words
          <textarea
            aria-label="Your own words"
            className="vd-input"
            rows={8}
            lang={lang}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              request.current++;
              setBusy(false);
              setCurrent(null);
            }}
          />
        </label>
        <div className="vd-toolbar">
          <button
            className="vd-button"
            disabled={!text.trim() || busy}
            onClick={assess}
          >
            {busy ? "Checking…" : "Check grammar"}
          </button>
          <button
            className="vd-button vd-primary"
            disabled={!text.trim() || captureBusy || photoBusy}
            onClick={save}
          >
            Save and revisit tomorrow
          </button>
        </div>
        <p className="vd-muted">
          Checking sends the text to LanguageTool. Unavailable or partial checks
          are never counted as clean writing.
        </p>
        {draftError && <p role="alert">{draftError}</p>}
        {current && <WritingFeedback lang={lang} entry={current} />}{" "}
        {error && <p role="alert">{error}</p>}
      </section>
      <div className="vd-grid">
        {entries
          .filter((e) => e.lang === lang)
          .map((e) => (
            <section className="vd-panel" key={e.id}>
              <div className="vd-kicker">
                {new Date(e.at).toLocaleDateString()} ·{" "}
                {e.assessment?.verified
                  ? "Grammar checked"
                  : "Unassessed or partial check"}
              </div>
              <p lang={lang} className="vd-reading">
                {e.text}
              </p>
              {e.recording && (
                <Recorder
                  savedId={e.recording}
                  onRemove={(id) =>
                    onChange((latest) =>
                      latest.map((row) =>
                        row.recording === id
                          ? { ...row, recording: null, updatedAt: Date.now() }
                          : row,
                      ),
                    )
                  }
                />
              )}
              {e.photo && (
                <PhotoAttachment
                  savedId={e.photo}
                  onRemove={(id) =>
                    onChange((latest) =>
                      latest.map((row) =>
                        row.photo === id
                          ? { ...row, photo: null, updatedAt: Date.now() }
                          : row,
                      ),
                    )
                  }
                  description="Your photo for this journal entry"
                />
              )}
              <button
                className="vd-button"
                onClick={() => {
                  setRevision(e);
                  setText("");
                  request.current++;
                  setBusy(false);
                  setCurrent(null);
                  setShowOriginal(false);
                }}
              >
                Rewrite this idea
              </button>
            </section>
          ))}
      </div>
    </div>
  );
}

export function PronunciationLab({ lang, onWork }) {
  const pairs = PRONUNCIATION_PAIRS[lang],
    [at, setAt] = useState(0),
    [target, setTarget] = useState(0),
    [result, setResult] = useState(null);
  const pair = pairs[at] || pairs[0],
    model = target ? pair.b : pair.a;
  const recorded = recordingFor(lang, model);
  const path = recorded?.url || `/listen/sounds/${lang}-${model}.mp3`;
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Sound contrasts</h1>
        <p>
          Listen for a meaningful difference. Then record both words and
          compare. This is guided self-review, not an automatic pronunciation
          score.
        </p>
        <label className="vd-field">
          Contrast
          <select
            className="vd-input"
            value={at}
            onChange={(e) => {
              setAt(Number(e.target.value));
              setTarget(Math.random() < 0.5 ? 0 : 1);
              setResult(null);
            }}
          >
            {pairs.map((p, i) => (
              <option key={p.a} value={i}>
                {p.a} / {p.b}
              </option>
            ))}
          </select>
        </label>
        <audio
          key={path}
          controls
          src={path}
          aria-label="Sound contrast model"
          onPlay={() => onWork?.("pronunciation")}
        />
        <p className="vd-muted">
          {recorded
            ? `Human recording: ${recorded.speaker} · ${recorded.licence}`
            : "Synthetic example · eSpeak NG"}
        </p>
        <div className="vd-toolbar">
          {[pair.a, pair.b].map((word) => (
            <button
              className="vd-button"
              key={word}
              onClick={() => {
                setResult(word === model);
                onWork?.("pronunciation");
              }}
            >
              {word}
            </button>
          ))}
          <button
            className="vd-button"
            onClick={() => {
              setTarget(Math.random() < 0.5 ? 0 : 1);
              setResult(null);
            }}
          >
            Another sound
          </button>
        </div>
        {result != null && (
          <p role="status">
            {result ? "That matches the model." : `The model was ${model}.`}{" "}
            {pair.tip}
          </p>
        )}
        <Recorder key={`${lang}-${at}`} label="Record both words" />
      </section>
    </div>
  );
}

export function RetellingPractice({ lang, onEvidence, onWork }) {
  const [selected, setSelected] = useState(MISSIONS[lang][0].id),
    [round, setRound] = useState(0),
    [time, setTime] = useState(null),
    [shown, setShown] = useState(true),
    [keptMeaning, setKeptMeaning] = useState(false);
  const mission =
    MISSIONS[lang].find((m) => m.id === selected) || MISSIONS[lang][0];
  const limits = [60, 45, 30];
  useEffect(() => {
    if (time == null || time === 0) return;
    const timer = setTimeout(() => setTime((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [time]);
  return (
    <section className="vd-panel vd-stack">
      <h1>Retell it in your own words</h1>
      <p>
        Use a familiar situation. Tell the same idea in 60, 45, then 30 seconds,
        keeping the important meaning. Optional timing pressure should help flow
        rather than force guessing.
      </p>
      <label className="vd-field">
        Familiar situation
        <select
          className="vd-input"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setRound(0);
            setTime(null);
          }}
        >
          {MISSIONS[lang].map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </label>
      <audio controls src={mission.audio} aria-label="Retelling model" />
      <button className="vd-button" onClick={() => setShown((v) => !v)}>
        {shown ? "Hide the script" : "Review the script"}
      </button>
      {shown && (
        <p lang={lang} className="vd-reading">
          {mission.lines.map((l) => l.text).join(" ")}
        </p>
      )}
      <div className="vd-toolbar">
        <span role="timer" aria-live="off">
          {time == null
            ? `${limits[round]} seconds available`
            : `${time} seconds`}
        </span>
        <button
          className="vd-button"
          onClick={() => {
            setTime(limits[round]);
            setKeptMeaning(false);
            onWork?.("retelling");
          }}
        >
          Start round {round + 1}
        </button>
        <button className="vd-button" onClick={() => setTime(null)}>
          Practice without a timer
        </button>
      </div>
      <Recorder label="Record your retelling" />
      <label className="vd-check">
        <input
          type="checkbox"
          checked={keptMeaning}
          onChange={(e) => setKeptMeaning(e.target.checked)}
        />
        I kept the important ideas while using my own wording.
      </label>
      <button
        className="vd-button vd-primary"
        disabled={!keptMeaning}
        onClick={() => {
          onEvidence({
            lang,
            canDo: "Retell a familiar situation with less hesitation",
            title: mission.title,
            evidence: "retelling-self-review",
            verified: false,
            selfReported: true,
          });
          setRound((n) => Math.min(2, n + 1));
          setTime(null);
          setKeptMeaning(false);
        }}
      >
        Save self-review and continue
      </button>
    </section>
  );
}

export function SkillPassport({ lang, evidence, ability }) {
  const rows = evidence.filter((e) => e.lang === lang);
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Your skill passport</h1>
        <p>
          Tasks you have practiced, with their evidence and assessment source.
          These are can-do practice records, not a CEFR certificate.
        </p>
        <div className="vd-grid">
          <div>
            <h2>{ability?.recognise.holding || 0}</h2>
            <p>words recognized correctly after an observed week-long gap</p>
          </div>
          <div>
            <h2>{ability?.produce.holding || 0}</h2>
            <p>words produced independently after an observed week-long gap</p>
          </div>
        </div>
      </section>
      <div className="vd-grid">
        {rows
          .slice()
          .reverse()
          .map((row) => (
            <section key={row.id} className="vd-panel">
              <h2 style={{ fontSize: "1.3rem" }}>{row.canDo}</h2>
              <p>{row.title}</p>
              <p className="vd-muted">
                {new Date(row.at).toLocaleDateString()} ·{" "}
                {row.selfReported
                  ? "Task completion: self-reported"
                  : row.verified
                    ? "Verified task result"
                    : "Practice evidence"}
              </p>
              {row.comprehension != null && (
                <p>
                  One listening detail:{" "}
                  {row.comprehension ? "matched" : "needs another listen"}.
                </p>
              )}
              {row.assessment && (
                <p className="vd-muted">
                  Grammar:{" "}
                  {row.assessment.verified ? "checked" : "not fully assessed"}.
                </p>
              )}
            </section>
          ))}
      </div>
      {!rows.length && (
        <p className="vd-notice">
          Complete a practical mission or a retelling self-review to record a
          useful first step.
        </p>
      )}
    </div>
  );
}
