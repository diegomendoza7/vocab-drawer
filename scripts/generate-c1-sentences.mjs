/* Write an example sentence for every C1 word that has none.
 *
 *   node scripts/generate-c1-sentences.mjs --lang fr            # dry run, 5 words
 *   node scripts/generate-c1-sentences.mjs --lang fr --all      # dry run, everything
 *   node scripts/generate-c1-sentences.mjs --lang fr --all --write
 *
 * Why this exists: all 945 C1 words ship without `s`, and the app quietly does
 * less for them as a result. `buildPracticeQueue` skips fill-in-the-blank when
 * a word has no cloze, `goToSentence` skips the sentence stage, dictation has
 * nothing to read out, and Sentence Constructions cannot use them. None of that
 * is visible as an error — the C1 levels simply drill two question kinds
 * instead of three and no one is told why.
 *
 * Needs ANTHROPIC_API_KEY in .env and the API server running (`./dev.sh`),
 * because it goes through the same proxy the app does rather than holding a key
 * of its own.
 *
 * Safety, in order of how much it matters:
 *   - Dry run by default. Nothing is written without --write.
 *   - Every sentence must contain the headword, or the row is rejected: a
 *     cloze that cannot find its answer is worse than no sentence, because
 *     `makeCloze` would return null and the word would end up back where it
 *     started, only with a wrong-looking example attached.
 *   - Existing sentences are never overwritten, so a partial run resumes.
 *   - Writes are per-batch, so an interrupted run keeps what it earned.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const API = process.env.VOCAB_API || "http://localhost:5174/api";
const BATCH = 12;

const args = process.argv.slice(2);
const lang = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : "fr";
const write = args.includes("--write");
const all = args.includes("--all");
if (import.meta.url === pathToFileURL(process.argv[1] || "").href && !["fr", "de"].includes(lang)) {
  throw new Error('--lang must be "fr" or "de"');
}

const FILE = path.join(DIR, `vocab-${lang}-c1.js`);
const LANG_NAME = lang === "fr" ? "French" : "German";

/* Parse the entries out of the source rather than importing it: the file has to
 * be edited in place, and its formatting is worth preserving. */
export function entriesNeedingSentences(src) {
  const out = [];
  const re = /\{ t: "((?:[^"\\]|\\.)*)", e: "((?:[^"\\]|\\.)*)"([^}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const [whole, t, e, rest] = m;
    if (/\bs: "/.test(rest)) continue;               // already has one
    const g = /\bg: "(der|die|das)"/.exec(rest)?.[1];
    out.push({ t: t.replace(/\\"/g, '"'), e: e.replace(/\\"/g, '"'), g, index: m.index, whole });
  }
  return out;
}

const prompt = (rows) => `You are writing example sentences for a ${LANG_NAME} vocabulary trainer at C1 level.

For each entry, write ONE natural ${LANG_NAME} sentence that uses the headword, and its English translation.

Rules:
- The sentence MUST contain the headword exactly as given, in that surface form. Do not inflect it.
- 8 to 16 words. Register should suit C1: journalistic or academic, not textbook-simple.
- The sentence should make the word's meaning inferable from context.
- Do not define the word or mention that it is an example.

Entries:
${rows.map((r, i) => `${i + 1}. ${r.g ? r.g + " " : ""}${r.t} — ${r.e}`).join("\n")}`;

const SCHEMA = {
  type: "object",
  properties: {
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          sentence: { type: "string" },
          english: { type: "string" },
        },
        required: ["term", "sentence", "english"],
        additionalProperties: false,
      },
    },
  },
  required: ["rows"],
  additionalProperties: false,
};

async function ask(rows) {
  const res = await fetch(`${API}/gloss`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt(rows), schema: SCHEMA }),
  });
  if (!res.ok) throw new Error(`${API}/gloss returned ${res.status} — is the API server running with a key?`);
  const data = await res.json();
  return data.rows || data.result?.rows || [];
}

/** The sentence with the headword blanked, as the fill-in-the-blank prompt. */
export function makeCloze(sentence, surface) {
  const i = sentence.indexOf(surface);
  return i < 0 ? null : sentence.slice(0, i) + "_____" + sentence.slice(i + surface.length);
}

/* Only run when invoked directly — importing this file for its helpers must
 * not start making API calls. */
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  let src = fs.readFileSync(FILE, "utf8");
  const pending = entriesNeedingSentences(src);
  const todo = all ? pending : pending.slice(0, 5);
  console.log(`${LANG_NAME} C1: ${pending.length} words without a sentence; processing ${todo.length}.`);
  if (!todo.length) process.exit(0);

  let added = 0, rejected = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    let rows;
    try {
      rows = await ask(batch);
    } catch (err) {
      console.error(`\nbatch ${i / BATCH + 1} failed: ${err.message}`);
      break;
    }

    for (const row of rows) {
      const entry = batch.find((b) => b.t === row.term);
      if (!entry) continue;
      if (!row.sentence?.includes(entry.t)) {
        rejected++;
        console.log(`  rejected ${entry.t}: sentence does not contain the headword`);
        continue;
      }
      const cloze = makeCloze(row.sentence, entry.t);
      if (!cloze) { rejected++; continue; }

      const esc = (v) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const fields = `, s: "${esc(row.sentence)}", b: "${esc(cloze)}", ba: "${esc(entry.t)}", se: "${esc(row.english)}"`;
      const updated = entry.whole.replace(/\s*\}$/, `${fields} }`);
      if (write) src = src.replace(entry.whole, updated);
      added++;
      if (added <= 5) console.log(`  ${entry.t}: ${row.sentence}`);
    }

    if (write) fs.writeFileSync(FILE, src);          // per batch, so an interrupt keeps progress
    console.log(`batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(todo.length / BATCH)} — ${added} added, ${rejected} rejected`);
  }

  console.log(`\n${added} sentences added, ${rejected} rejected${write ? " (written)" : " (dry run — pass --write)"}`);
  if (!write) console.log("Re-run with --write once the samples above look right.");
}
