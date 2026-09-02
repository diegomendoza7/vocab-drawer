/* Splice authored example sentences into the C1 data files.
 *
 *   node scripts/apply-sentences.mjs scripts/c1-sentences/fr-01.json
 *   node scripts/apply-sentences.mjs scripts/c1-sentences/*.json --write
 *
 * Input is a JSON array of { t, s, se } — headword, the sentence, its English.
 * The cloze is derived here rather than supplied, so the blank and the answer
 * cannot disagree.
 *
 * The rejection rule is the one that matters and it is the same one
 * generate-c1-sentences.mjs uses: a sentence that does not contain the
 * headword in the exact surface form the deck teaches is thrown away. The
 * fill-in-the-blank stage blanks by literal match, so a sentence using an
 * inflected form would produce either a blank the answer cannot fill or none
 * at all — worse than leaving the word without an example.
 *
 * Existing sentences are never overwritten, so this is safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeCloze } from "./generate-c1-sentences.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const write = args.includes("--write");
const replace = args.includes("--replace");
const files = args.filter((a) => !a.startsWith("--"));
if (!files.length) throw new Error("usage: apply-sentences.mjs <batch.json…> [--write]");

const rows = files.flatMap((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const byLang = { fr: [], de: [] };
/* Which file a headword belongs to is decided by where it is, not by the batch
 * claiming a language — a typo in the batch would otherwise write French into
 * the German deck. */
const sources = {
  fr: path.join(ROOT, "src", "data", "vocab-fr-c1.js"),
  de: path.join(ROOT, "src", "data", "vocab-de-c1.js"),
};
const text = { fr: fs.readFileSync(sources.fr, "utf8"), de: fs.readFileSync(sources.de, "utf8") };

const esc = (v) => String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
/** The entry object for a headword, exactly as it appears in the file. */
function findEntry(src, t) {
  const re = new RegExp(`\\{ t: "${t.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}", e: "(?:[^"\\\\]|\\\\.)*"[^}]*\\}`);
  return re.exec(src)?.[0] ?? null;
}

const stats = { added: 0, already: 0, notFound: 0, rejected: 0 };
const rejects = [];

for (const row of rows) {
  const lang = findEntry(text.fr, row.t) ? "fr" : findEntry(text.de, row.t) ? "de" : null;
  if (!lang) { stats.notFound += 1; rejects.push(`${row.t}: not in either C1 file`); continue; }

  const whole = findEntry(text[lang], row.t);
  /* Existing sentences are kept by default so a re-run is safe. `--replace`
   * is for correcting one that has already been written — a sentence that
   * passed the mechanical checks but turned out to be bad language. */
  if (/\bs: "/.test(whole) && !replace) { stats.already += 1; continue; }

  /* Many of these headwords are connectors that naturally open a sentence, so
   * the surface form differs from the deck's only by its capital: "En somme"
   * for "en somme". The blank hides the capital, `ba` stays the lowercase
   * headword, and the app's answer matching is already case-insensitive — so
   * the match is made case-insensitively and the sentence keeps its capital. */
  const at = row.s?.toLowerCase().indexOf(row.t.toLowerCase()) ?? -1;
  if (at < 0) {
    stats.rejected += 1;
    rejects.push(`${row.t}: sentence does not contain the headword — "${row.s}"`);
    continue;
  }
  const surface = row.s.slice(at, at + row.t.length);
  const cloze = makeCloze(row.s, surface);
  if (!cloze) { stats.rejected += 1; rejects.push(`${row.t}: no cloze`); continue; }

  /* `makeCloze` blanks the first literal occurrence, which for a short
   * headword can land inside a longer word — "or" inside "encore" would blank
   * three letters of the wrong word and leave the real one in place. The
   * generator cannot see this; the check belongs here, where the sentence is
   * being chosen. */
  const before = row.s[at - 1] ?? " ";
  const after = row.s[at + row.t.length] ?? " ";
  const isLetter = (ch) => /[\p{L}\p{M}]/u.test(ch);
  if (isLetter(before) || isLetter(after)) {
    stats.rejected += 1;
    rejects.push(`${row.t}: first occurrence is inside another word — "${row.s.slice(Math.max(0, at - 12), at + row.t.length + 12)}"`);
    continue;
  }

  const fields = `, s: "${esc(row.s)}", b: "${esc(cloze)}", ba: "${esc(row.t)}", se: "${esc(row.se)}"`;
  const stripped = whole.replace(/, s: "(?:[^"\\]|\\.)*", b: "(?:[^"\\]|\\.)*", ba: "(?:[^"\\]|\\.)*", se: "(?:[^"\\]|\\.)*"/, "");
  text[lang] = text[lang].replace(whole, stripped.replace(/\s*\}$/, `${fields} }`));
  byLang[lang].push(row.t);
  stats.added += 1;
}

console.log(`${rows.length} row(s): ${stats.added} added (fr ${byLang.fr.length}, de ${byLang.de.length}), ${stats.already} already had one, ${stats.rejected} rejected, ${stats.notFound} not found`);
rejects.slice(0, 20).forEach((r) => console.log("  ✗ " + r));

if (write) {
  for (const lang of ["fr", "de"]) if (byLang[lang].length) fs.writeFileSync(sources[lang], text[lang]);
  console.log("written");
} else {
  console.log("dry run — pass --write");
}
