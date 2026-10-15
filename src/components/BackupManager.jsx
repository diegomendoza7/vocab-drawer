import { useState } from "react";
import { validateProgress } from "../lib/progress.js";
import { storage } from "../lib/storage.js";

export default function BackupManager({ onExport, onApply }) {
  const [incoming, setIncoming] = useState(null),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  async function read(file) {
    if (!file) return;
    setStatus("");
    try {
      if (file.size > 25 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 25 MB.");
      const value = JSON.parse(await file.text());
      validateProgress(value);
      setIncoming(value);
    } catch (e) {
      setIncoming(null);
      setStatus(e.message);
    }
  }
  async function apply(mode) {
    setBusy(true);
    try {
      await onApply(incoming, mode);
      setStatus(
        mode === "restore"
          ? "Backup restored."
          : "Backup merged. Identical review events are counted once.",
      );
      setIncoming(null);
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function undo() {
    setBusy(true);
    try {
      const old = await storage.get("vocabdrawer:pre-import");
      if (!old?.value)
        throw new Error("No previous local snapshot is available.");
      await onApply(JSON.parse(old.value), "restore");
      setStatus("Previous local snapshot restored.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="vd-panel vd-stack">
      <h1>Backups and device transfer</h1>
      <p>
        Export a file here and import it on your other device. No account or
        cloud subscription is needed. The backup includes learning records,
        captions, phrases, and journals; local video, photos, and voice files
        stay on their original device.
      </p>
      <div className="vd-toolbar">
        <button className="vd-button" onClick={onExport}>
          Export progress
        </button>
        <button className="vd-button" disabled={busy} onClick={undo}>
          Restore previous local snapshot
        </button>
      </div>
      <label className="vd-field">
        Choose a progress backup
        <input
          className="vd-input"
          type="file"
          accept=".json,application/json"
          onChange={(e) => read(e.target.files?.[0])}
        />
      </label>
      {incoming && (
        <div className="vd-notice">
          <p>
            This backup contains {Object.keys(incoming.cards).length} cards and{" "}
            {Object.keys(incoming.reviewEvents || {}).length} identifiable
            answer events.
          </p>
          <p>
            Merge combines work. Restore replaces this device’s learning
            profile. A local snapshot is saved before either operation.
          </p>
          <div className="vd-toolbar">
            <button
              className="vd-button vd-primary"
              disabled={busy}
              onClick={() => apply("merge")}
            >
              Merge this backup
            </button>
            <button
              className="vd-button"
              disabled={busy}
              onClick={() => apply("restore")}
            >
              Restore this backup as my profile
            </button>
          </div>
        </div>
      )}
      <p role="status">{status}</p>
    </section>
  );
}
