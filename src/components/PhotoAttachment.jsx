import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage.js";
export default function PhotoAttachment({
  savedId,
  onSave,
  onBusyChange,
  onRemove,
  description = "Your journal photo",
}) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [assetId, setAssetId] = useState(savedId || "");
  const busyCallback = useRef(onBusyChange);
  busyCallback.current = onBusyChange;
  useEffect(() => {
    busyCallback.current?.(busy);
  }, [busy]);
  useEffect(
    () => () => {
      busyCallback.current?.(false);
    },
    [],
  );
  const currentUrl = useRef(),
    generation = useRef(0);
  useEffect(() => {
    const lifetime = generation;
    const token = ++lifetime.current;
    if (savedId)
      storage
        .get(`photo:${savedId}`)
        .then((row) => {
          if (token !== generation.current) return;
          if (!row?.value)
            throw new Error("This photo is not stored on this device.");
          currentUrl.current = URL.createObjectURL(row.value);
          setUrl(currentUrl.current);
          setAssetId(savedId);
        })
        .catch((e) => {
          if (token === generation.current) setError(e.message);
        });
    return () => {
      lifetime.current++;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    };
  }, [savedId]);
  async function choose(file) {
    if (!file) return;
    const token = generation.current;
    setBusy(true);
    setError("");
    try {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error(
          "Choose a JPEG, PNG, or WebP photo smaller than 10 MB.",
        );
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 40000000)
        throw new Error("Choose a photo under 40 megapixels.");
      const id = crypto.randomUUID();
      await storage.set(`photo:${id}`, file);
      if (token !== generation.current) return;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
      currentUrl.current = URL.createObjectURL(file);
      setUrl(currentUrl.current);
      setAssetId(id);
      onSave?.({ id, name: file.name, bytes: file.size, type: file.type });
    } catch (e) {
      if (token === generation.current) setError(e.message);
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }
  async function remove() {
    try {
      await storage.remove(`photo:${assetId}`);
      onRemove?.(assetId);
      setUrl("");
      setAssetId("");
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="vd-stack">
      {onSave && (
        <label className="vd-field">
          Attach a photo to describe
          <input
            aria-label="Attach a photo to describe"
            className="vd-input"
            type="file"
            disabled={busy}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </label>
      )}
      {url && (
        <>
          <img
            src={url}
            alt={description}
            style={{
              maxWidth: "100%",
              maxHeight: 320,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
          <div className="vd-toolbar">
            <a className="vd-button" href={url} download="journal-photo">
              Download this photo
            </a>
            {(onRemove || onSave) && (
              <button className="vd-button" onClick={remove}>
                Remove this photo from this device
              </button>
            )}
          </div>
        </>
      )}
      {busy && <p role="status">Saving photo on this device…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
