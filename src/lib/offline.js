import { LISTEN_VERSION } from "../data/listening-version.js";
export const DOWNLOAD_CACHE = `vd-downloads-${LISTEN_VERSION}`;
export async function downloadPack(urls, onProgress = () => {}) {
  if (!("caches" in globalThis))
    throw new Error("This browser cannot store offline downloads.");
  const cache = await caches.open(DOWNLOAD_CACHE);
  const unique = [...new Set(urls)];
  let bytes = 0;
  for (let i = 0; i < unique.length; i++) {
    const url = unique[i];
    if (!url.startsWith("/") || url.startsWith("//"))
      throw new Error("Only this app’s learning files can be downloaded.");
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok)
      throw new Error(
        "A learning file could not be downloaded. Try again when online.",
      );
    bytes += (await response.clone().arrayBuffer()).byteLength;
    await cache.put(url, response);
    onProgress({ done: i + 1, total: unique.length, bytes });
  }
  return { bytes, files: unique.length };
}
export async function packAvailable(urls) {
  if (!("caches" in globalThis)) return false;
  const cache = await caches.open(DOWNLOAD_CACHE);
  return (await Promise.all(urls.map((url) => cache.match(url)))).every(
    Boolean,
  );
}
export async function clearDownloads() {
  if ("caches" in globalThis) await caches.delete(DOWNLOAD_CACHE);
}
