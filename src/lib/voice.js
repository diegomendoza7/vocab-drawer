/* A real voice when there is one, the synthesiser when there is not.
 *
 * Every speak button in the app goes through here now. The manifest maps a
 * headword to a recording of a named human saying it (harvested from
 * Wiktionary — see scripts/voices/harvest.mjs); anything not in it falls
 * straight back to speech synthesis, so coverage can grow one word at a time
 * without any screen knowing the difference.
 *
 * The licence is CC BY-SA, so the speaker's name travels with the file and the
 * app credits them. That is why the manifest stores `speaker` and `source`
 * rather than just a filename.
 */
import FR from "../data/voices/fr.json";
import DE from "../data/voices/de.json";
import { voiceKey } from "./voice-key.js";

const MANIFESTS = { fr: FR, de: DE };
const BASE = "/audio";

export { voiceKey } from "./voice-key.js";

const indexOf = (() => {
  const cache = {};
  return (lang) => {
    if (cache[lang]) return cache[lang];
    const byKey = new Map();
    for (const [word, entry] of Object.entries(MANIFESTS[lang] || {})) {
      byKey.set(voiceKey(word), { ...entry, word, url: `${BASE}/${lang}/${entry.file}` });
    }
    return (cache[lang] = byKey);
  };
})();

/** The recording for a piece of text, or null. */
export function recordingFor(lang, text) {
  return indexOf(lang).get(voiceKey(text)) || null;
}

export function hasRecording(lang, text) {
  return !!recordingFor(lang, text);
}

/** Everyone whose voice is in the app, for the credits the licence requires. */
export function voiceCredits(lang) {
  const by = new Map();
  for (const entry of Object.values(MANIFESTS[lang] || {})) {
    const key = `${entry.speaker}|${entry.licence}`;
    by.set(key, { speaker: entry.speaker, licence: entry.licence, count: (by.get(key)?.count || 0) + 1 });
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}

export function voiceCount(lang) {
  return Object.keys(MANIFESTS[lang] || {}).length;
}

let current = null;

/**
 * Play a recording. Resolves true when it played, false when it could not —
 * the caller falls back to the synthesiser rather than leaving silence.
 */
export function playRecording(url) {
  return new Promise((resolve) => {
    if (typeof Audio === "undefined" || !url) { resolve(false); return; }
    try {
      if (current) { current.pause(); current = null; }
      const audio = new Audio(url);
      current = audio;
      let settled = false;
      const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
      audio.addEventListener("ended", () => done(true));
      audio.addEventListener("error", () => done(false));
      /* A file that never starts must not hang the caller — the synthesiser is
       * a better answer than silence. */
      setTimeout(() => done(audio.currentTime > 0), 4000);
      audio.play().catch(() => done(false));
    } catch {
      resolve(false);
    }
  });
}

/** Stop whatever is playing, for the same reason `speakWith` cancels. */
export function stopRecording() {
  if (current) { current.pause(); current = null; }
}
