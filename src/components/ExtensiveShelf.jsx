import { useState } from "react";
import { PASSAGES } from "../data/reading/index.js";
import { downloadPack } from "../lib/offline.js";
import LookupText from "./LookupText.jsx";

export default function ExtensiveShelf({
  lang,
  level,
  onWork,
  glossOf,
  onRead,
  onAction,
}) {
  const [selected, setSelected] = useState(""),
    [translation, setTranslation] = useState(false),
    [lookup, setLookup] = useState(null),
    [status, setStatus] = useState("");
  const passage = PASSAGES[lang].find((p) => p.id === selected);
  if (!passage)
    return (
      <div className="vd-stack">
        <section className="vd-panel">
          <h1>Read for pleasure and meaning</h1>
          <p>
            Choose an easy text. Follow the story without stopping at every
            unknown word. Detailed questions remain available in the Reading
            Room.
          </p>
        </section>
        <div className="vd-grid">
          {PASSAGES[lang]
            .filter((p) => p.level === level)
            .map((p) => (
              <button
                key={p.id}
                className="vd-panel"
                style={{ textAlign: "left" }}
                onClick={() => {
                  setSelected(p.id);
                  onWork?.("reading");
                }}
              >
                <h2>{p.title}</h2>
                <p>{p.titleEn}</p>
                <span className="vd-tag">
                  {p.level} · {p.genre}
                </span>
              </button>
            ))}
        </div>
      </div>
    );
  const audio = `/listen/reading/${passage.id}.mp3`;
  async function download() {
    setStatus("Downloading this text’s audio…");
    try {
      await downloadPack([
        audio,
        `/listen/reading/${passage.id}.vtt`,
        `/listen/reading/${passage.id}.en.vtt`,
      ]);
      setStatus("This text’s audio is ready offline.");
    } catch (e) {
      setStatus(e.message);
    }
  }
  return (
    <section className="vd-panel vd-stack">
      <div className="vd-toolbar">
        <h1 style={{ flex: 1 }}>{passage.title}</h1>
        <button className="vd-button" onClick={() => setSelected("")}>
          Reading shelf
        </button>
      </div>
      <audio
        controls
        src={audio}
        aria-label={`${passage.title} synthetic reading`}
        onPlay={() => onWork?.("listeningMeaning")}
      />
      <p className="vd-muted">
        Synthetic reading voice. Listen while following the text, or hide
        translation and enjoy the meaning first.
      </p>
      <div className="vd-toolbar">
        <button className="vd-button" onClick={() => setTranslation((v) => !v)}>
          {translation ? "Hide English" : "Show English"}
        </button>
        <button className="vd-button" onClick={download}>
          Download this reading
        </button>
      </div>
      {passage.paras.map(([text, en], i) => (
        <div key={i} className="vd-reading">
          <LookupText
            lang={lang}
            text={text}
            onLookup={(word) => setLookup({ word, gloss: glossOf(word) })}
          />
          {translation && (
            <p lang="en" className="vd-muted">
              {en}
            </p>
          )}
        </div>
      ))}
      {lookup && (
        <p role="status">
          {lookup.word}:{" "}
          {lookup.gloss ||
            "No offline definition. Keep reading for the overall meaning, or use Reading Room for deeper study."}
        </p>
      )}
      <div className="vd-toolbar">
        <button
          className="vd-button vd-primary"
          onClick={() => {
            onRead(passage.id);
            setStatus(
              "Reading practice recorded. Comprehension has not been graded.",
            );
          }}
        >
          I followed the main idea
        </button>
        <button
          className="vd-button"
          onClick={() => onAction({ action: "journal" })}
        >
          Write a short response
        </button>
      </div>
      <p role="status">{status}</p>
    </section>
  );
}
