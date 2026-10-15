export const MODEL_INSTALL_CACHE = "vocabdrawer:model-install:v1";
const path = "/models/manifest.json";
const valid = (value) =>
  value?.version === 1 &&
  Array.isArray(value.models) &&
  value.models.every(
    (model) =>
      typeof model.id === "string" && typeof model.revision === "string",
  );

// Keep only the installation descriptor here. Model binaries use the SDK's cache.
export async function localModelManifest() {
  try {
    const response = await fetch(path, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const manifest =
      response.ok && response.headers.get("content-type")?.includes("json")
        ? await response.json()
        : null;
    if ("caches" in globalThis) {
      try {
        const cache = await caches.open(MODEL_INSTALL_CACHE);
        if (valid(manifest))
          await cache.put(
            path,
            new Response(JSON.stringify(manifest), {
              headers: { "Content-Type": "application/json" },
            }),
          );
        else await cache.delete(path);
      } catch {
        /* A blocked cache must not prevent online use. */
      }
    }
    return valid(manifest) ? manifest : { models: [] };
  } catch {
    try {
      if ("caches" in globalThis) {
        const response = await (
          await caches.open(MODEL_INSTALL_CACHE)
        ).match(path);
        const manifest = response ? await response.json() : null;
        if (valid(manifest)) return manifest;
      }
    } catch {
      /* Subtitle imports stay usable if model storage is unavailable. */
    }
    return { models: [] };
  }
}
