import { useEffect, useRef, useState } from "react";
import {
  parseSubtitles,
  cueAt,
  alignedTranslation,
  toVtt,
  transcriptCues,
} from "../lib/subtitles.js";
import { storage } from "../lib/storage.js";
import { MISSIONS } from "../data/missions.js";
import { languageNotes } from "../lib/language-notes.js";
import LookupText from "./LookupText.jsx";
import ModelSettings from "./ModelSettings.jsx";
import { HUMAN_LISTENING } from "../data/human-listening.js";
import Recorder from "./Recorder.jsx";

function downloadText(text, name) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/vtt;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const safeLink = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};
const stamp = (s) =>
  `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s)) % 60).padStart(2, "0")}`;

export default function MediaStudio({
  lang,
  initialHumanId,
  onRemoveSession,
  sessions = {},
  onSession,
  onSavePhrase,
  onWork,
  glossOf,
  onHome,
}) {
  const [sourceInfo, setSourceInfo] = useState(null);
  const [file, setFile] = useState(null),
    [url, setUrl] = useState(""),
    [cues, setCues] = useState([]),
    [english, setEnglish] = useState([]),
    [title, setTitle] = useState(""),
    [sessionId, setSessionId] = useState(""),
    [time, setTime] = useState(0),
    [selected, setSelected] = useState(0),
    [offset, setOffset] = useState(0),
    [englishOffset, setEnglishOffset] = useState(0),
    [speed, setSpeed] = useState(1),
    [loop, setLoop] = useState(false),
    [pauseLines, setPauseLines] = useState(false),
    [mode, setMode] = useState("watch"),
    [targetVisible, setTargetVisible] = useState(true),
    [translationVisible, setTranslationVisible] = useState(true),
    [search, setSearch] = useState(""),
    [lookup, setLookup] = useState(null),
    [answer, setAnswer] = useState(""),
    [verdict, setVerdict] = useState(null),
    [notes, setNotes] = useState(""),
    [remember, setRemember] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  const player = useRef(),
    job = useRef(),
    generation = useRef(0),
    lastPause = useRef(-1);
  const lineLock = useRef(null);
  const [remote, setRemote] = useState("");
  const activeIndex = cueAt(cues, time, offset);
  const index = activeIndex >= 0 ? activeIndex : selected;
  const cue = cues[index],
    translation = alignedTranslation(cue, english, englishOffset);
  const nativeVideo = file?.type?.startsWith("video/");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    if (file.remoteUrl) {
      setUrl(file.remoteUrl);
      return;
    }
    const source = URL.createObjectURL(file);
    setUrl(source);
    return () => URL.revokeObjectURL(source);
  }, [file]);
  useEffect(() => {
    if (player.current) player.current.playbackRate = speed;
  }, [speed, url]);
  useEffect(
    () => () => {
      generation.current++;
      job.current?.cancel();
    },
    [file, lang],
  );
  function clearPractice() {
    setAnswer("");
    setVerdict(null);
    setLookup(null);
    lastPause.current = -1;
  }
  async function openFile(media) {
    if (!media) return;
    player.current?.pause();
    generation.current++;
    job.current?.cancel();
    setBusy(false);
    setStatus("");
    setError("");
    setSourceInfo(null);
    setFile(media);
    setTitle(media.name.replace(/\.[^.]+$/, ""));
    setSessionId(crypto.randomUUID());
    setCues([]);
    setEnglish([]);
    setSelected(0);
    setTime(0);
    setNotes("");
    clearPractice();
  }
  async function openRemote() {
    try {
      const address = new URL(remote);
      if (address.protocol !== "https:")
        throw new Error("Use a direct HTTPS media URL.");
      await openFile({
        name:
          decodeURIComponent(address.pathname.split("/").at(-1)) ||
          "Online media",
        type: /\.(mp3|ogg|wav|m4a)(?:$|\?)/i.test(address.href)
          ? "audio/mpeg"
          : "video/mp4",
        remoteUrl: address.href,
      });
      setStatus(
        "Streaming directly from the supplied host. Subtitle files can be added separately.",
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function openSample() {
    const sample = MISSIONS[lang].find((m) => m.key === "cafe");
    setError("");
    try {
      const responses = await Promise.all(
        [sample.audio, sample.captions, sample.englishCaptions].map((path) =>
          fetch(path),
        ),
      );
      if (responses.some((r) => !r.ok))
        throw new Error("The sample could not load.");
      await openFile(
        new File([await responses[0].blob()], `${sample.id}.mp3`, {
          type: "audio/mpeg",
        }),
      );
      setTitle(sample.title);
      setCues(parseSubtitles(await responses[1].text()));
      setEnglish(parseSubtitles(await responses[2].text()));
      setStatus("Original practice dialogue · synthetic voices · CC BY 4.0.");
    } catch (e) {
      setError(e.message);
    }
  }
  async function openHuman(id) {
    const track = HUMAN_LISTENING.find((t) => t.id === id && t.lang === lang);
    if (!track) return;
    try {
      const response = await fetch(track.audio);
      if (!response.ok) throw new Error("The recording could not load.");
      await openFile(
        new File([await response.blob()], track.id + ".ogg", {
          type: "audio/ogg",
        }),
      );
      setTitle(track.title);
      setSourceInfo({
        reader: track.reader,
        author: track.author,
        license: track.license,
        source: track.source,
        licenseUrl: track.licenseUrl,
      });
      setStatus(
        `Human recording · ${track.reader} · ${track.license}. Add subtitles or generate a machine transcript below.`,
      );
    } catch (e) {
      setError(e.message);
    }
  }
  const openHumanRef = useRef(openHuman);
  openHumanRef.current = openHuman;
  useEffect(() => {
    if (initialHumanId) openHumanRef.current(initialHumanId);
  }, [initialHumanId]);
  async function prepareModel(key) {
    if (busy) return;
    const id = ++generation.current;
    setBusy(true);
    setError("");
    setStatus("Preparing the model on this device…");
    try {
      const { startTranscription } = await import("../lib/transcription.js");
      if (id !== generation.current) return;
      job.current = startTranscription(null, lang, {
        prepare: key,
        onProgress: (p) => {
          if (id === generation.current)
            setStatus(
              p.status === "progress"
                ? `Loading model files: ${Math.round(p.progress)}%`
                : "Preparing local model…",
            );
        },
      });
      await job.current.promise;
      if (id === generation.current)
        setStatus("Model prepared. It can now be reused on this device.");
    } catch (e) {
      if (id === generation.current) setError(e.message);
    } finally {
      if (id === generation.current) setBusy(false);
    }
  }
  async function loadSubs(subtitle, translated = false) {
    if (!subtitle) return;
    setError("");
    try {
      const parsed = parseSubtitles(await subtitle.text());
      if (translated) setEnglish(parsed);
      else {
        setCues(parsed);
        setSelected(0);
        clearPractice();
      }
      setStatus(
        `${parsed.length} ${translated ? "English" : "target-language"} subtitle lines loaded.`,
      );
    } catch (e) {
      setError(e.message);
    }
  }
  function seek(n, play = true) {
    const next = Math.max(0, Math.min(cues.length - 1, n));
    setSelected(next);
    clearPractice();
    lineLock.current = loop || pauseLines ? next : null;
    if (player.current && cues[next]) {
      const at = Math.max(0, cues[next].start + offset + 0.01);
      player.current.currentTime = at;
      setTime(at);
      if (play)
        player.current
          .play()
          .catch(() =>
            setError("Press Play to start playback in this browser."),
          );
    }
  }
  function tick() {
    const at = player.current?.currentTime || 0;
    setTime(at);
    const locked = lineLock.current != null ? cues[lineLock.current] : null;
    if (locked && at >= locked.end + offset && (loop || pauseLines)) {
      if (loop) {
        player.current.currentTime = Math.max(0, locked.start + offset + 0.01);
        setTime(player.current.currentTime);
        return;
      }
      player.current.pause();
      player.current.currentTime = Math.max(0, locked.end + offset - 0.01);
      setTime(player.current.currentTime);
      return;
    }
    const current = cueAt(cues, at - 0.05, offset);
    if (current >= 0) setSelected(current);
    const currentCue = cues[current >= 0 ? current : selected];
    if (
      currentCue &&
      at >= currentCue.end + offset - 0.03 &&
      lastPause.current !== currentCue.id
    ) {
      if (loop) {
        player.current.currentTime = Math.max(0, currentCue.start + offset);
        return;
      }
      if (pauseLines) {
        lastPause.current = currentCue.id;
        player.current.pause();
      }
    }
  }
  async function saveSession() {
    if (!sessionId) return;
    const data = {
      id: sessionId,
      sourceInfo,
      lang,
      title,
      cues,
      english,
      offset,
      englishOffset,
      time,
      notes,
      fileName: file.name,
      updatedAt: Date.now(),
      hasMedia: remember && !file.remoteUrl,
    };
    try {
      if (remember && !file.remoteUrl) {
        if (file.size > 500 * 1024 * 1024)
          throw new Error(
            "For on-device storage, choose media under 500 MB. Larger files can be reopened without storing them.",
          );
        await storage.set(`media:${sessionId}`, file);
      }
      onSession(data);
      setStatus(
        remember && !file.remoteUrl
          ? "Saved captions, notes, and media on this device."
          : "Saved captions and notes. Reopen the media file next time.",
      );
    } catch (e) {
      setError(
        e.message ||
          "Media storage is full. Captions and notes can still be saved.",
      );
    }
  }
  async function restoreSession(saved) {
    const id = ++generation.current;
    setError("");
    player.current?.pause();
    job.current?.cancel();
    setBusy(false);
    try {
      const media = await storage.get(`media:${saved.id}`);
      if (id !== generation.current) return;
      setFile(media?.value || null);
      setSessionId(saved.id);
      setSourceInfo(saved.sourceInfo || null);
      setTitle(saved.title);
      setCues(saved.cues || []);
      setEnglish(saved.english || []);
      setOffset(saved.offset || 0);
      setEnglishOffset(saved.englishOffset || 0);
      setNotes(saved.notes || "");
      setTime(saved.time || 0);
      setSelected(0);
      setStatus(
        media?.value
          ? "Reopened saved media."
          : "Captions restored. Choose the matching media file below.",
      );
    } catch {
      setError(
        "Saved media could not be reopened. You can choose the file again.",
      );
    }
  }
  async function reconnectFile(media) {
    if (!media) return;
    setFile(media);
    if (!sessionId) setSessionId(crypto.randomUUID());
    if (!title) setTitle(media.name);
    setError("");
  }
  async function transcribe(translate = false) {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setStatus("Preparing audio on your device…");
    const id = ++generation.current;
    try {
      const { decodeForTranscription, startTranscription } = await import(
        "../lib/transcription.js"
      );
      if (file.remoteUrl)
        throw new Error(
          "Choose a local clip for on-device transcription. Remote streaming still works with subtitle files.",
        );
      const decoded = await decodeForTranscription(file);
      if (id !== generation.current) return;
      job.current = startTranscription(decoded.audio, lang, {
        translate,
        onProgress: (p) => {
          if (id === generation.current)
            setStatus(
              p.status === "progress"
                ? `Downloading a local model: ${Math.round(p.progress)}%`
                : p.status === "translating"
                  ? `Translating recognized speech: ${Math.round(p.progress)}%`
                  : "Preparing the local speech model…",
            );
        },
      });
      const result = await job.current.promise;
      if (id !== generation.current) return;
      const parsed = transcriptCues(result, decoded.duration);
      if (!parsed.length)
        throw new Error("No speech found. Try a clearer or shorter clip.");
      if (translate) setEnglish(parsed);
      else setCues(parsed);
      setStatus(
        `${parsed.length} machine-generated lines ready. Check wording and timing; transcription and translation can make mistakes.`,
      );
    } catch (e) {
      if (id === generation.current) setError(e.message);
    } finally {
      if (id === generation.current) setBusy(false);
    }
  }
  async function translateCaptions() {
    if (!cues.length || busy) return;
    setBusy(true);
    setError("");
    setStatus("Preparing the local translation model…");
    const id = ++generation.current;
    try {
      const { startTranscription } = await import("../lib/transcription.js");
      if (id !== generation.current) return;
      job.current = startTranscription(null, lang, {
        texts: cues.map((c) => c.text),
        onProgress: (p) => {
          if (id === generation.current)
            setStatus(
              `${p.status === "translating" ? "Translating subtitles" : "Downloading translation model"}: ${Math.round(p.progress)}%`,
            );
        },
      });
      const translated = await job.current.promise;
      if (id !== generation.current) return;
      setEnglish(cues.map((c, i) => ({ ...c, text: translated[i] })));
      setStatus(
        "English subtitles generated locally. Check the translation; meaning can be lost or changed.",
      );
    } catch (e) {
      if (id === generation.current) setError(e.message);
    } finally {
      if (id === generation.current) setBusy(false);
    }
  }
  function checkDictation() {
    if (!cue || !answer.trim()) return;
    const fold = (s) =>
      s
        .normalize("NFC")
        .toLocaleLowerCase(lang)
        .replace(/[’]/g, "'")
        .replace(/[.,!?;:«»"“”]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const exact = fold(answer) === fold(cue.text);
    setVerdict({ exact, model: cue.text });
    onWork?.("dictation");
  }
  function savePhrase() {
    if (!cue) return;
    const selection = window.getSelection()?.toString().trim();
    const text =
      selection && cue.text.includes(selection) ? selection : cue.text;
    onSavePhrase({
      text,
      translation: selection ? null : translation,
      source: title || file?.name || "Media",
      start: cue.start,
      end: cue.end,
      mediaId: sessionId,
    });
    setStatus(
      "Phrase saved to your notebook. Add a meaning there if the selected phrase needs one.",
    );
  }
  const shown = search
    ? cues
        .map((c, i) => ({ ...c, index: i }))
        .filter((c) =>
          c.text
            .toLocaleLowerCase(lang)
            .includes(search.toLocaleLowerCase(lang)),
        )
        .slice(0, 100)
    : cues
        .slice(Math.max(0, index - 15), index + 45)
        .map((c, i) => ({ ...c, index: Math.max(0, index - 15) + i }));
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <div className="vd-toolbar">
          <h1 style={{ flex: 1 }}>Media Studio</h1>
          <button className="vd-button" onClick={onHome}>
            Today
          </button>
        </div>
        <p>
          Watch or listen with two subtitle tracks. Replay a line, unpack useful
          language, and keep phrases for later. No subscription is needed.
        </p>
        <p className="vd-muted">
          Open media you own or have permission to use. Local files stay in your
          browser; this player does not download protected streams. A normal
          video URL may fail when its host blocks browser access.
        </p>
        <div className="vd-grid">
          <label className="vd-field">
            Video or audio file
            <input
              className="vd-input"
              type="file"
              accept="audio/*,video/*"
              onChange={(e) =>
                cues.length && !file
                  ? reconnectFile(e.target.files?.[0])
                  : openFile(e.target.files?.[0])
              }
            />
          </label>
          <label className="vd-field">
            {lang === "fr" ? "French" : "German"} subtitles · SRT or VTT
            <input
              className="vd-input"
              type="file"
              accept=".srt,.vtt,text/vtt,text/plain"
              onChange={(e) => loadSubs(e.target.files?.[0])}
            />
          </label>
          <label className="vd-field">
            English subtitles · optional
            <input
              className="vd-input"
              type="file"
              accept=".srt,.vtt,text/vtt,text/plain"
              onChange={(e) => loadSubs(e.target.files?.[0], true)}
            />
          </label>
        </div>
        <details style={{ marginTop: 14 }}>
          <summary>Use a direct media URL</summary>
          <label className="vd-field">
            Public HTTPS audio/video URL
            <input
              className="vd-input"
              type="url"
              value={remote}
              onChange={(e) => setRemote(e.target.value)}
              placeholder="https://…/audio.mp3"
            />
          </label>
          <button className="vd-button" onClick={openRemote}>
            Open media URL
          </button>
          <p className="vd-muted">
            Use a direct file URL, not a streaming-service watch page. The host
            must permit playback. Its attribution and licensing still apply.
          </p>
        </details>
        <div className="vd-toolbar" style={{ marginTop: 14 }}>
          <label className="vd-field">
            Open a human recording
            <select
              aria-label="Open a human recording"
              className="vd-input"
              value=""
              onChange={(e) => openHuman(e.target.value)}
            >
              <option value="">Choose a recording</option>
              {HUMAN_LISTENING.filter((t) => t.lang === lang).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <button className="vd-button" onClick={openSample}>
            Try a bundled dialogue
          </button>
          {Object.values(sessions).filter((s) => s.lang === lang).length >
            0 && (
            <label className="vd-field">
              Reopen a session
              <select
                aria-label="Reopen a session"
                className="vd-input"
                defaultValue=""
                onChange={(e) =>
                  sessions[e.target.value] &&
                  restoreSession(sessions[e.target.value])
                }
              >
                <option value="">Choose saved captions</option>
                {Object.values(sessions)
                  .filter((s) => s.lang === lang)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </div>
      </section>
      {file && (
        <section className="vd-panel">
          <h2>{title || file.name}</h2>
          {sourceInfo && (
            <p className="vd-muted">
              {String(sourceInfo.author || "")} ·{" "}
              {String(sourceInfo.reader || "")} ·{" "}
              <a
                href={safeLink(sourceInfo.source)}
                target="_blank"
                rel="noreferrer"
              >
                Recording source
              </a>{" "}
              ·{" "}
              <a
                href={safeLink(sourceInfo.licenseUrl)}
                target="_blank"
                rel="noreferrer"
              >
                {String(sourceInfo.license || "")}
              </a>{" "}
              · Original recording, unchanged.
            </p>
          )}
          {nativeVideo ? (
            <video
              className="vd-media"
              ref={player}
              src={url}
              controls
              playsInline
              onTimeUpdate={tick}
              onLoadedMetadata={() => {
                if (player.current) player.current.currentTime = time;
              }}
              onPlay={() => {
                lastPause.current = -1;
                onWork?.("media");
              }}
            />
          ) : (
            <audio
              className="vd-media"
              style={{ height: 54 }}
              ref={player}
              src={url}
              controls
              onTimeUpdate={tick}
              onLoadedMetadata={() => {
                if (player.current) player.current.currentTime = time;
              }}
              onPlay={() => {
                lastPause.current = -1;
                onWork?.("media");
              }}
            />
          )}
          <div className="vd-toolbar" style={{ marginTop: 12 }}>
            <label className="vd-field">
              Playback speed
              <select
                className="vd-input"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                {[0.5, 0.75, 1, 1.25, 1.5].map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </label>
            <label className="vd-field">
              Subtitle shift · seconds
              <input
                className="vd-input"
                style={{ maxWidth: 130 }}
                type="number"
                min="-300"
                max="300"
                step=".25"
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
              />
            </label>
            <label className="vd-field">
              English shift · seconds
              <input
                className="vd-input"
                style={{ maxWidth: 130 }}
                type="number"
                min="-300"
                max="300"
                step=".25"
                value={englishOffset}
                onChange={(e) => setEnglishOffset(Number(e.target.value))}
              />
            </label>
            <label className="vd-check">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => {
                  setLoop(e.target.checked);
                  lineLock.current =
                    e.target.checked || pauseLines ? index : null;
                }}
              />
              Loop current line
            </label>
            <label className="vd-check">
              <input
                type="checkbox"
                checked={pauseLines}
                onChange={(e) => {
                  setPauseLines(e.target.checked);
                  lineLock.current = e.target.checked || loop ? index : null;
                }}
              />
              Pause after each line
            </label>
          </div>
        </section>
      )}
      {!!cues.length && (
        <div className="vd-split">
          <section className="vd-panel">
            <div className="vd-toolbar">
              {[
                ["watch", "Watch"],
                ["listen", "Listen first"],
                ["dictation", "Dictation"],
                ["shadow", "Shadow & retell"],
              ].map(([v, name]) => (
                <button
                  className="vd-button"
                  key={v}
                  aria-pressed={mode === v}
                  onClick={() => {
                    setMode(v);
                    setTargetVisible(v === "watch");
                    clearPractice();
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="vd-kicker" style={{ marginTop: 18 }}>
              Line {index + 1} of {cues.length} · {stamp(cue?.start || 0)}
            </div>
            <div className="vd-toolbar">
              <button
                className="vd-button"
                disabled={!file || index === 0}
                onClick={() => seek(index - 1)}
              >
                Previous
              </button>
              <button
                className="vd-button vd-primary"
                disabled={!file}
                onClick={() => seek(index)}
              >
                Replay line
              </button>
              <button
                className="vd-button"
                disabled={!file || index >= cues.length - 1}
                onClick={() => seek(index + 1)}
              >
                Next
              </button>
            </div>
            <div className="vd-caption" aria-live="off">
              {targetVisible && cue ? (
                <LookupText
                  text={cue.text}
                  lang={lang}
                  onLookup={(word) => setLookup({ word, gloss: glossOf(word) })}
                />
              ) : (
                <p className="vd-muted">
                  Listen for the meaning before revealing the line.
                </p>
              )}
            </div>
            <div className="vd-toolbar">
              <button
                className="vd-button"
                onClick={() => setTargetVisible((v) => !v)}
              >
                {targetVisible
                  ? "Hide target subtitles"
                  : "Reveal target subtitles"}
              </button>
              <button
                className="vd-button"
                disabled={!english.length}
                onClick={() => setTranslationVisible((v) => !v)}
              >
                {translationVisible ? "Hide English" : "Show English"}
              </button>
            </div>
            {translationVisible && english.length > 0 && (
              <p className="vd-reading" lang="en">
                {translation ||
                  "No English subtitle overlaps this line. Adjust the English shift if needed."}
              </p>
            )}
            {lookup && (
              <div role="status" className="vd-notice">
                {lookup.word}:{" "}
                {lookup.gloss ||
                  "No offline definition. Save the phrase and add a meaning yourself."}
              </div>
            )}
            {targetVisible &&
              languageNotes(cue?.text || "", lang).map((note) => (
                <details key={note.title}>
                  <summary>{note.title}</summary>
                  <p>{note.explanation}</p>
                </details>
              ))}
            {cue && (
              <details>
                <summary>Correct this subtitle’s wording</summary>
                <label className="vd-field">
                  Target subtitle
                  <textarea
                    lang={lang}
                    className="vd-input"
                    value={cue.text}
                    onFocus={() => player.current?.pause()}
                    onChange={(e) =>
                      setCues((rows) =>
                        rows.map((c, i) =>
                          i === index ? { ...c, text: e.target.value } : c,
                        ),
                      )
                    }
                  />
                </label>
              </details>
            )}
            {mode === "dictation" && (
              <div className="vd-stack">
                <label className="vd-field">
                  What did you hear?
                  <textarea
                    className="vd-input"
                    lang={lang}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </label>
                <button className="vd-button" onClick={checkDictation}>
                  Compare with subtitles
                </button>
                {verdict && (
                  <p role="status">
                    {verdict.exact
                      ? "Your transcription matches the supplied subtitle."
                      : "Compare the wording: " + verdict.model}{" "}
                    This is a listening practice check, not a vocabulary recall
                    grade.
                  </p>
                )}
              </div>
            )}
            {mode === "shadow" && (
              <div className="vd-stack">
                <p>
                  Listen, pause, and repeat the phrase. Then describe the scene
                  in your own words. Compare your recording with the model;
                  speech recognition is not a pronunciation judge.
                </p>
                <Recorder label="Record shadowing or retelling" />
              </div>
            )}
            <div className="vd-toolbar" style={{ marginTop: 18 }}>
              <button className="vd-button" onClick={savePhrase}>
                Save selected phrase or whole line
              </button>
              <button
                className="vd-button"
                onClick={() =>
                  downloadText(
                    toVtt(cues),
                    `${title || "subtitles"}.${lang}.vtt`,
                  )
                }
              >
                Export target subtitles
              </button>
              {english.length > 0 && (
                <button
                  className="vd-button"
                  onClick={() =>
                    downloadText(
                      toVtt(english),
                      `${title || "subtitles"}.en.vtt`,
                    )
                  }
                >
                  Export English subtitles
                </button>
              )}
            </div>
          </section>
          <aside className="vd-panel">
            <h2>Transcript</h2>
            <label className="vd-field">
              Search phrases
              <input
                className="vd-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <p className="vd-muted">
              {search
                ? "Up to 100 matches"
                : "Nearby lines; playback moves this window."}
            </p>
            <div className="vd-caption-list">
              {shown.map((c) => (
                <button
                  className="vd-caption-row"
                  key={c.id}
                  aria-current={c.index === index ? "true" : undefined}
                  onClick={() => seek(c.index, false)}
                >
                  <span className="vd-muted">{stamp(c.start)}</span>
                  <br />
                  <span lang={lang}>{c.text}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
      {file && (
        <details className="vd-panel">
          <summary>Create subtitles on this device · optional</summary>
          <p>
            The free speech model needs a large one-time download and can be
            slow. Audio is processed in your browser. Choose a clip under 15
            minutes and 200 MB; full shows can be watched using existing
            subtitle files.
          </p>
          <div className="vd-toolbar">
            <button
              className="vd-button"
              disabled={busy}
              onClick={() => transcribe(false)}
            >
              Transcribe in {lang === "fr" ? "French" : "German"}
            </button>
            <button
              className="vd-button"
              disabled={busy}
              onClick={() =>
                cues.length ? translateCaptions() : transcribe(true)
              }
            >
              Create English subtitles locally
            </button>
            <button
              className="vd-button"
              disabled={busy || !cues.length}
              onClick={translateCaptions}
            >
              Translate imported subtitles locally
            </button>
            {busy && (
              <button
                className="vd-button"
                onClick={() => {
                  generation.current++;
                  job.current?.cancel();
                  setBusy(false);
                  setStatus("Cancelled.");
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <ModelSettings busy={busy} onPrepare={prepareModel} />
          <p className="vd-muted">
            Machine-generated wording, timing, and translations need checking.
            Existing subtitle tracks remain available if the model cannot
            download.
          </p>
        </details>
      )}
      {(file || cues.length > 0) && (
        <section className="vd-panel">
          <label className="vd-field">
            Your notes or a short summary
            <textarea
              aria-label="Your notes or a short summary"
              className="vd-input"
              lang={lang}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {file && (
            <label className="vd-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Keep this media on this device for next time · up to 500 MB
            </label>
          )}
          <button className="vd-button" disabled={!file} onClick={saveSession}>
            Save study session
          </button>
          <p className="vd-muted">
            Progress backups include captions and notes. Media and voice
            recordings stay on the device and are not included in JSON backups.
          </p>
        </section>
      )}
      {sessions[sessionId] && (
        <button
          className="vd-button"
          onClick={async () => {
            try {
              await storage.remove(`media:${sessionId}`);
              onRemoveSession?.(sessionId);
              setStatus(
                "Saved session removed from this device. The currently open file remains playable.",
              );
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Remove saved study session from this device
        </button>
      )}
      {status && (
        <p role="status" className="vd-notice">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="vd-notice vd-error">
          {error}
        </p>
      )}
    </div>
  );
}
