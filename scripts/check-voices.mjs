/* Offline checks for the recorded voices.
 *
 * Four ways a voice manifest goes wrong, none of them visible on screen — the
 * app would simply fall back to the synthesiser and nobody would know a
 * recording was meant to be there:
 *
 *   - an entry whose file is missing from public/audio, so playback fails and
 *     silently degrades;
 *   - an entry with no speaker or licence, which is a licence breach the
 *     moment the app ships it, because CC BY-SA requires attribution;
 *   - a key that is not a headword in the deck, which can never be looked up;
 *   - a file small enough to be an error page rather than audio.
 *
 * It also prints coverage, so "voices: 312 of 2,916" is a number that moves
 * rather than an intention.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DATA } from "../src/data/vocab.js";
import { voiceKey } from "../src/lib/voice-key.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const MIN_BYTES = 800;
const problems = [];
const fail = (m) => problems.push(m);

let total = 0;
const report = [];
for (const lang of ["fr", "de"]) {
  const path = `${ROOT}src/data/voices/${lang}.json`;
  if (!existsSync(path)) { fail(`${lang}: no manifest at src/data/voices/${lang}.json`); continue; }
  const manifest = JSON.parse(readFileSync(path, "utf8"));

  /* Every headword the deck teaches, by the key the app looks up with. */
  const deck = new Map();
  for (const lv of Object.keys(DATA[lang] || {}))
    for (const drawer of DATA[lang][lv] || [])
      for (const w of drawer.words || []) deck.set(voiceKey(w.t), lv);

  const levels = {};
  let bytes = 0;
  for (const [word, entry] of Object.entries(manifest)) {
    const at = `${lang} "${word}"`;
    if (!entry.file) { fail(`${at}: no file`); continue; }
    if (!entry.speaker) fail(`${at}: no speaker — CC BY-SA needs one`);
    if (!entry.licence) fail(`${at}: no licence recorded`);
    if (!entry.source) fail(`${at}: no source page`);

    const file = `${ROOT}public/audio/${lang}/${entry.file}`;
    if (!existsSync(file)) { fail(`${at}: ${entry.file} is in the manifest but not on disk`); continue; }
    const size = statSync(file).size;
    bytes += size;
    if (size < MIN_BYTES) fail(`${at}: ${entry.file} is ${size} bytes — too small to be audio`);

    const lv = deck.get(voiceKey(word));
    if (!lv) fail(`${at}: not a headword in the deck, so nothing will ever ask for it`);
    else levels[lv] = (levels[lv] || 0) + 1;
  }

  const deckSize = deck.size;
  const n = Object.keys(manifest).length;
  total += n;
  report.push(`${lang}: ${n} of ${deckSize} headwords (${Object.entries(levels).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}) · ${(bytes / 1e6).toFixed(1)} MB`);
}

if (problems.length) {
  console.error(`check-voices: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-voices: ${total} recordings OK`);
for (const line of report) console.log(`  ${line}`);
