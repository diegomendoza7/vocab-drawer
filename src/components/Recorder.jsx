import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage.js";
export default function Recorder({
  onSave,
  onBusyChange,
  onRemove,
  label = "Record yourself",
  savedId,
}) {
  const capture = useRef(),
    stream = useRef(),
    url = useRef(),
    generation = useRef(0),
    saved = useRef(onSave);
  saved.current = onSave;
  const [savingAudio, setSavingAudio] = useState(false);
  const busyCallback = useRef(onBusyChange);
  busyCallback.current = onBusyChange;
  const [recording, setRecording] = useState(false),
    [starting, setStarting] = useState(false),
    [playback, setPlayback] = useState(""),
    [recordId, setRecordId] = useState(savedId || ""),
    [error, setError] = useState("");
  useEffect(() => {
    busyCallback.current?.(recording || starting || savingAudio);
  }, [recording, starting, savingAudio]);
  useEffect(
    () => () => {
      busyCallback.current?.(false);
    },
    [],
  );
  useEffect(() => {
    const lifetime = generation;
    const token = ++lifetime.current;
    setRecordId(savedId || "");
    setPlayback("");
    if (savedId)
      storage
        .get(`recording:${savedId}`)
        .then((row) => {
          if (token !== generation.current) return;
          if (!row?.value)
            throw new Error("This recording is not stored on this device.");
          url.current = URL.createObjectURL(row.value);
          setPlayback(url.current);
        })
        .catch((e) => {
          if (token === generation.current) setError(e.message);
        });
    return () => {
      lifetime.current++;
      if (capture.current?.state === "recording") capture.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, [savedId]);
  async function start() {
    const token = generation.current;
    setError("");
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder)
        throw new Error(
          "Recording is unavailable in this browser. You can still practice aloud.",
        );
      const live = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (token !== generation.current) {
        live.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = live;
      const chunks = [],
        recorder = new MediaRecorder(live);
      capture.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        live.getTracks().forEach((t) => t.stop());
        if (token !== generation.current) return;
        setSavingAudio(true);
        setRecording(false);
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (url.current) URL.revokeObjectURL(url.current);
        url.current = URL.createObjectURL(blob);
        setPlayback(url.current);
        const id = crypto.randomUUID();
        try {
          await storage.set(`recording:${id}`, blob);
          if (token !== generation.current) return;
          setRecordId(id);
          saved.current?.({ id, bytes: blob.size, type: blob.type });
        } catch {
          if (token === generation.current)
            setError(
              "Playback is available here, but the recording could not be saved.",
            );
        } finally {
          if (token === generation.current) setSavingAudio(false);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (token === generation.current) setError(e.message);
    } finally {
      if (token === generation.current) setStarting(false);
    }
  }
  async function remove() {
    try {
      if (recordId) await storage.remove(`recording:${recordId}`);
      onRemove?.(recordId);
      setRecordId("");
      setPlayback("");
      if (url.current) URL.revokeObjectURL(url.current);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="vd-stack">
      <div className="vd-toolbar">
        {(!savedId || onSave) && (
          <button
            disabled={starting || savingAudio}
            className="vd-button"
            onClick={() => {
              if (recording) {
                if (capture.current?.state === "recording")
                  capture.current.stop();
              } else start();
            }}
          >
            {starting
              ? "Opening microphone…"
              : recording
                ? "Stop recording"
                : label}
          </button>
        )}
        <span className="vd-muted">Recording stays on this device.</span>
      </div>
      {playback && (
        <>
          <audio controls src={playback} aria-label="Your recording" />
          <div className="vd-toolbar">
            <a
              className="vd-button"
              href={playback}
              download={`${recordId || "recording"}.webm`}
            >
              Download this recording
            </a>
            <button className="vd-button" onClick={remove}>
              Delete this recording from this device
            </button>
          </div>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
