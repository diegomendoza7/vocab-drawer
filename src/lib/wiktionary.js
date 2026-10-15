/* Word lookup while reading, from English Wiktionary's definition API.
 *
 * The deck answers first — it is the vocabulary being studied. This is for the
 * words it does not hold, which in a C1 passage is most of the interesting
 * ones. The API sends CORS headers, so it works from the static build with no
 * server, and it answers inflected forms honestly ("plural of Schwierigkeit"),
 * which is exactly what a reader needs. Definitions are CC BY-SA; the card
 * that shows them links back to the entry.
 */
const BASE = "https://en.wiktionary.org/api/rest_v1/page/definition/";
const cache = new Map();

function strip(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** The first few definitions for one language out of the API's response. */
export function parseDefinitions(json, lang, limit = 3) {
  const out = [];
  for (const entry of json?.[lang] || []) {
    for (const d of entry.definitions || []) {
      const text = strip(d.definition);
      if (text) out.push({ pos: entry.partOfSpeech || "", text });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/**
 * Definitions for a word as the reader met it. Tries the form as written, then
 * lower case — a sentence-initial "Maison" has no entry of its own, while a
 * German noun must keep its capital. Returns [] when there is no entry and
 * null when the lookup could not be made at all (offline).
 */
export async function lookupWiktionary(word, lang, { fetchImpl = globalThis.fetch } = {}) {
  const forms = [...new Set([word, word.toLowerCase()])].filter(Boolean);
  for (const w of forms) {
    const key = `${lang}:${w}`;
    if (cache.has(key)) {
      if (cache.get(key).length) return cache.get(key);
      continue;
    }
    let res;
    try {
      res = await fetchImpl(BASE + encodeURIComponent(w), {signal:AbortSignal.timeout(12000)});
    } catch {
      return null;
    }
    let defs = [];
    if (res.ok) {
      try { defs = parseDefinitions(await res.json(), lang); } catch { defs = []; }
    }
    cache.set(key, defs);
    if (defs.length) return defs;
  }
  return [];
}

export function wiktionaryUrl(word, lang) {
  return `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#${lang === "de" ? "German" : "French"}`;
}
