import { useState } from "react";
import { cardId, prodCardId, LEARNING_GAP_MS } from "../lib/srs.js";
import { useLocalDraft } from "../hooks/useLocalDraft.js";
export default function WordRepair({
  lang,
  entries,
  cards,
  onChange,
  onPractice,
  onSavePhrase,
}) {
  const [selected, setSelected] = useState(""),
    [status, setStatus] = useState("");
  const rows = entries.filter(
    (e) =>
      cards[cardId(lang, e.level, e.word.t)] ||
      cards[prodCardId(lang, e.level, e.word.t)],
  );
  const entry =
    rows.find((e) => cardId(lang, e.level, e.word.t) === selected) || rows[0];
  const [example, setExample, error] = useLocalDraft(
    `vocabdrawer:word-repair:${lang}:${entry?.word.t || ""}`,
    "",
  );
  function update(changes) {
    if (!entry) return;
    const ids = [
      cardId(lang, entry.level, entry.word.t),
      prodCardId(lang, entry.level, entry.word.t),
    ];
    onChange(
      Object.fromEntries(
        ids
          .filter((id) => cards[id])
          .map((id) => [
            id,
            { ...cards[id], ...changes, updatedAt: Date.now() },
          ]),
      ),
    );
  }
  return (
    <section className="vd-panel vd-stack">
      <h1>Repair a difficult word</h1>
      <p>
        Keep its meaning, compare a useful context, then make a smaller phrase
        of your own. Independent checks after a gap can restore harder practice
        while keeping the history of earlier lapses.
      </p>
      {entry ? (
        <>
          <label className="vd-field">
            Word
            <select
              aria-label="Word to repair"
              className="vd-input"
              value={cardId(lang, entry.level, entry.word.t)}
              onChange={(e) => {
                setSelected(e.target.value);
                setStatus("");
              }}
            >
              {rows.map((e) => (
                <option
                  key={cardId(lang, e.level, e.word.t)}
                  value={cardId(lang, e.level, e.word.t)}
                >
                  {e.word.t} · {e.level}
                </option>
              ))}
            </select>
          </label>
          <h2 lang={lang}>{entry.word.t}</h2>
          <p>{entry.word.e}</p>
          {entry.word.s && (
            <p lang={lang} className="vd-caption">
              {entry.word.s}
            </p>
          )}
          <p>{entry.word.se}</p>
          <label className="vd-field">
            A short phrase for your own situation
            <textarea
              className="vd-input"
              lang={lang}
              value={example}
              onChange={(e) => setExample(e.target.value)}
            />
          </label>
          <p className="vd-muted">
            Compare your wording with the supplied example. Saving a new phrase
            does not verify its grammar.
          </p>
          <div className="vd-toolbar">
            <button
              className="vd-button"
              disabled={!example.trim()}
              onClick={() => {
                onSavePhrase({
                  text: example.trim(),
                  translation: "",
                  source: `Personal repair: ${entry.word.t}`,
                });
                setStatus(
                  "Saved to your phrase notebook. Add its meaning there before recall.",
                );
              }}
            >
              Save personal phrase
            </button>
            <button
              className="vd-button"
              onClick={() => {
                update({
                  seenAt: Date.now(),
                  readyAt: Date.now() + LEARNING_GAP_MS,
                });
                setStatus(
                  "Return in ten minutes for an independent check. This teaching step did not count as a successful review.",
                );
              }}
            >
              Plan a delayed second look
            </button>
            <button
              className="vd-button"
              onClick={() => {
                const paused = [
                  cards[cardId(lang, entry.level, entry.word.t)],
                  cards[prodCardId(lang, entry.level, entry.word.t)],
                ].some((c) => c?.suspended);
                update({ suspended: !paused });
                setStatus(
                  paused
                    ? "Reviews resumed."
                    : "Reviews paused; your history is kept.",
                );
              }}
            >
              {[
                cards[cardId(lang, entry.level, entry.word.t)],
                cards[prodCardId(lang, entry.level, entry.word.t)],
              ].some((c) => c?.suspended)
                ? "Resume word reviews"
                : "Pause word reviews"}
            </button>
            <button
              className="vd-button vd-primary"
              onClick={() => onPractice(entry)}
            >
              Practice this word
            </button>
          </div>
        </>
      ) : (
        <p>
          Study some words first. Difficult words and paused cards will be
          available here.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <p role="status">{status}</p>
    </section>
  );
}
