import { useEffect, useState } from "react";
import { MODEL_CATALOG } from "../data/model-catalog.js";
import {
  localModelManifest,
  MODEL_INSTALL_CACHE,
} from "../lib/local-models.js";
export default function ModelSettings({ busy, onPrepare }) {
  const [ready, setReady] = useState([]),
    [usage, setUsage] = useState(null),
    [message, setMessage] = useState("");
  async function refresh() {
    try {
      const names = "caches" in globalThis ? await caches.keys() : [];
      const cacheNames = names.filter(
        (n) => n === "transformers-cache" || n === "transformers-cache-v1",
      );
      const paths = [];
      for (const name of cacheNames)
        for (const request of await (await caches.open(name)).keys())
          paths.push(request.url);
      const installed = await localModelManifest();
      setReady(
        MODEL_CATALOG.filter(
          (m) =>
            installed.models?.some(
              (i) =>
                i.id === m.id &&
                i.revision === m.revision &&
                i.variant === m.variant,
            ) ||
            m.files
              .filter(
                (f) =>
                  f.path.endsWith(".onnx") ||
                  [
                    "config.json",
                    "tokenizer.json",
                    "preprocessor_config.json",
                  ].includes(f.path),
              )
              .every((f) =>
                paths.some(
                  (p) =>
                    p.includes(m.id + "/resolve/" + m.revision + "/") &&
                    p.endsWith("/" + f.path),
                ),
              ),
        ).map((m) => m.key),
      );
      if (navigator.storage?.estimate)
        setUsage(await navigator.storage.estimate());
    } catch (e) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, [busy]);
  async function clear() {
    try {
      if ("caches" in globalThis)
        for (const name of await caches.keys())
          if (
            name === "transformers-cache" ||
            name === "transformers-cache-v1" ||
            name === MODEL_INSTALL_CACHE
          )
            await caches.delete(name);
      setMessage(
        "Browser model downloads cleared. Files prepared by this app’s installation remain available.",
      );
      await refresh();
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <div className="vd-stack">
      <h3>Free models on this device</h3>
      <p className="vd-muted">
        A model can be downloaded before you need it. Prepared models are reused
        locally. Your audio and subtitles are not uploaded for inference.
        English speech captions use both the speech model and your language's
        translation model.
      </p>
      {MODEL_CATALOG.map((m) => (
        <div key={m.key} className="vd-toolbar">
          <span style={{ flex: 1 }}>
            {m.label} · {(m.bytes / 1048576).toFixed(0)} MB ·{" "}
            {ready.includes(m.key) ? "Prepared or cached" : "Not prepared"}
          </span>
          <button
            className="vd-button"
            disabled={busy}
            onClick={() => onPrepare(m.key)}
          >
            Prepare {m.key === "speech" ? "speech" : m.key + " translation"}
          </button>
        </div>
      ))}
      {usage && (
        <p className="vd-muted">
          Approximate site storage: {(usage.usage / 1048576).toFixed(1)} MB used
          of {(usage.quota / 1048576).toFixed(0)} MB available.
        </p>
      )}
      <button className="vd-button" disabled={busy} onClick={clear}>
        Clear downloaded browser models
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
