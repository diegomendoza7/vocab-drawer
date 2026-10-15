import { useEffect, useState, useMemo, useCallback } from "react";
import { storage } from "../lib/storage.js";
import { clearDownloads } from "../lib/offline.js";
export default function DeviceFiles({ progress, onRemoved }) {
  const [files, setFiles] = useState([]),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const refs = useMemo(() => {
    const refs = new Map();
    for (const entry of progress.journal || []) {
      if (entry.recording)
        refs.set("recording:" + entry.recording, "Journal voice note");
      if (entry.photo) refs.set("photo:" + entry.photo, "Journal photo");
    }
    for (const entry of Object.values(progress.mediaSessions || {}))
      if (entry.hasMedia) refs.set("media:" + entry.id, entry.title);
    return refs;
  }, [progress.journal, progress.mediaSessions]);
  const refresh = useCallback(async () => {
    try {
      const rows = [];
      for (const key of (await storage.keys()).filter((k) =>
        /^(media|recording|photo):/.test(k),
      )) {
        const value = (await storage.get(key))?.value;
        if (value instanceof Blob)
          rows.push({
            key,
            bytes: value.size,
            type: value.type,
            name: value.name || refs.get(key) || key.split(":")[0],
          });
      }
      setFiles(rows);
    } catch (e) {
      setStatus(e.message);
    }
  }, [refs]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  async function remove(key) {
    setBusy(true);
    try {
      await storage.remove(key);
      onRemoved(key);
      setFiles((rows) => rows.filter((f) => f.key !== key));
      setStatus("Device file deleted. Captions and learning history remain.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function download(key) {
    try {
      const blob = (await storage.get(key))?.value;
      if (!blob) throw new Error("The file is no longer stored here.");
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download =
        blob.name ||
        `${key.replace(":", "-")}.${blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : blob.type.startsWith("image/") ? blob.type.split("/")[1] : "webm"}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setStatus(e.message);
    }
  }
  return (
    <section className="vd-panel vd-stack">
      <h1>Files on this device</h1>
      <p>
        Photos, voice notes, and saved media stay here and are separate from
        JSON backups. Download a file to keep or transfer it, or delete it to
        free space.
      </p>
      <p>
        {files.length} files ·{" "}
        {(files.reduce((n, f) => n + f.bytes, 0) / 1048576).toFixed(1)} MB
      </p>
      {files.map((file) => (
        <section className="vd-panel" key={file.key}>
          <h2 style={{ fontSize: "1.1rem" }}>{file.name}</h2>
          <p className="vd-muted">
            {(file.bytes / 1048576).toFixed(2)} MB ·{" "}
            {refs.get(file.key) || "Not linked to a saved entry"}
          </p>
          <div className="vd-toolbar">
            <button className="vd-button" onClick={() => download(file.key)}>
              Download file
            </button>
            <button
              className="vd-button"
              disabled={busy}
              onClick={() => remove(file.key)}
            >
              Delete file from this device
            </button>
          </div>
        </section>
      ))}
      <button
        className="vd-button"
        onClick={async () => {
          try {
            await clearDownloads();
            setStatus(
              "Downloaded lessons cleared. Learning records and personal files remain.",
            );
          } catch (e) {
            setStatus(e.message);
          }
        }}
      >
        Clear downloaded lesson audio
      </button>
      <p role="status">{status}</p>
    </section>
  );
}
