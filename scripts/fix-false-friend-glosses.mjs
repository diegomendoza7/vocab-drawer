/* Move false-friend warnings out of the meaning and into the note.
 *
 *   node scripts/fix-false-friend-glosses.mjs [--write]
 *
 * The C1 generator folded "NOT \"lecture\"" into the gloss itself, so the app
 * displays what a word does *not* mean as though it were part of what it does.
 * `splitSenses` already refuses to accept those clauses as typed answers, but
 * they still show on the card, in the choice list and in the summary.
 *
 * A few also carry the generator's other artefact: the same sense repeated on
 * both sides of a slash ("reading, interpretation / reading").
 *
 * Idempotent. Prints a diff and changes nothing unless --write is passed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const FILES = ["vocab-fr-c1.js", "vocab-de-c1.js"];
const write = process.argv.includes("--write");

/** Split a gloss into senses at top level, ignoring separators inside quotes. */
function senses(gloss) {
  const out = [];
  let cur = "", depth = 0, quoted = false;
  for (const ch of gloss) {
    if (ch === '"') quoted = !quoted;
    if (!quoted) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (depth === 0 && (ch === "," || ch === ";" || ch === "/" || ch === "—")) {
        out.push(cur.trim()); cur = ""; continue;
      }
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}

let changed = 0, scanned = 0;
for (const file of FILES) {
  const p = path.join(DIR, file);
  let src = fs.readFileSync(p, "utf8");

  src = src.replace(/e: "((?:[^"\\]|\\.)*)"/g, (whole, raw) => {
    scanned++;
    if (!/\bNOT\b/i.test(raw)) return whole;
    const gloss = raw.replace(/\\"/g, '"');

    // Drop the warning clauses, then the duplicates the slash-join left behind.
    const kept = [];
    for (const s of senses(gloss)) {
      if (/^(usually |often |rarely )?NOT\b/i.test(s)) continue;
      if (!kept.some((k) => k.toLowerCase() === s.toLowerCase())) kept.push(s);
    }
    if (!kept.length) return whole;                 // nothing but a warning: leave it alone

    const cleaned = kept.join(", ").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    if (cleaned === raw) return whole;
    changed++;
    if (changed <= 12) console.log(`  ${raw}\n    → ${cleaned}`);
    return `e: "${cleaned}"`;
  });

  if (write) fs.writeFileSync(p, src);
}

console.log(`\n${scanned} glosses scanned, ${changed} rewritten${write ? " (written)" : " (dry run — pass --write)"}`);
