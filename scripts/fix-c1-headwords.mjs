/* Make two groups of C1 headwords drillable.
 *
 *   node scripts/fix-c1-headwords.mjs [--write]
 *
 * Nineteen "sentence routine" entries carry a trailing ellipsis in the
 * headword itself — `Il convient de souligner que…`. That renders fine on a
 * card, but nothing else in the app can use it: the typed answer would have to
 * include the ellipsis, and no example sentence can contain the string, so the
 * fill-in-the-blank and sentence stages skip the entry entirely. The ellipsis
 * belongs to the gloss, which keeps it, not to the answer.
 *
 * One entry, `aussi + inversion`, is a notation rather than a phrase and can
 * never appear in a sentence. It becomes the phrase its own note gives.
 *
 * Idempotent.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "vocab-fr-c1.js");
const write = process.argv.includes("--write");

let src = fs.readFileSync(FILE, "utf8");
const changes = [];

/* The trailing ellipsis only ever appears on these headwords, so a targeted
 * pass over `t:` is safe — the gloss keeps its own. */
src = src.replace(/\{ t: "([^"]*)…"/g, (whole, head) => {
  changes.push(`${head}… → ${head}`);
  return `{ t: "${head}"`;
});

const OLD = '{ t: "aussi + inversion", e: "therefore", n: "Aussi convient-il de…" }';
const NEW = '{ t: "aussi convient-il de", e: "therefore it is appropriate to", n: "inversion after aussi is what makes it mean \\"therefore\\" rather than \\"also\\"" }';
if (src.includes(OLD)) { src = src.replace(OLD, NEW); changes.push("aussi + inversion → aussi convient-il de"); }

console.log(`${changes.length} change(s)`);
changes.forEach((c) => console.log("  " + c));
if (write) { fs.writeFileSync(FILE, src); console.log("written"); }
else console.log("dry run — pass --write");

/* ---- German: parenthesised material inside the headword ----------------
 *
 * Fourteen German entries carry a bracketed fragment in `t` itself —
 * `beziffern (auf)`, `beziehungsweise (bzw.)`. As with the French ellipsis,
 * that is display text sitting where the answer should be: no example
 * sentence can contain the string, so the entry is invisible to the
 * fill-in-the-blank and sentence stages, and the typed answer would have to
 * include the brackets.
 *
 * The bracketed part is one of three things, and each has a field that
 * already exists for it: a governed preposition (→ `rek`, which the card
 * renders on the front), an abbreviation or alternative form (→ `alt`), or an
 * optional word (→ `n`).
 */
{
  const DE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "vocab-de-c1.js");
  let de = fs.readFileSync(DE_FILE, "utf8");
  const deChanges = [];

  /* field: which of rek / alt / n the bracketed part belongs in. */
  const MOVE = {
    "beziffern (auf)": ["beziffern", "rek", "auf + Akk."],
    "ersuchen (um)": ["ersuchen", "rek", "um + Akk."],
    "verankern (in)": ["verankern", "rek", "in + Dat."],
    "auffassen (als)": ["auffassen", "rek", "als + Akk."],
    "auslegen (als)": ["auslegen", "rek", "als + Akk."],
    "ansetzen (bei)": ["ansetzen", "rek", "bei + Dat."],
    "übertragen (auf)": ["übertragen", "rek", "auf + Akk."],
    "Schlüsse ziehen (aus)": ["Schlüsse ziehen", "rek", "aus + Dat."],
    "Auseinandersetzung (mit)": ["Auseinandersetzung", "rek", "mit + Dat."],
    "ableiten (aus)": ["ableiten", "rek", "aus + Dat."],
    "abgrenzen (von)": ["abgrenzen", "rek", "von + Dat."],
    "im Grunde (genommen)": ["im Grunde", "alt", "im Grunde genommen"],
    "beziehungsweise (bzw.)": ["beziehungsweise", "alt", "bzw."],
    "Datenschutzgrundverordnung (DSGVO)": ["Datenschutzgrundverordnung", "alt", "DSGVO"],
  };

  for (const [old, [head, field, value]] of Object.entries(MOVE)) {
    /* Plain string work rather than a constructed regex: the headwords
     * contain brackets and dots, and escaping them twice is how the first
     * attempt silently matched nothing. */
    const marker = `{ t: "${old}",`;
    const at = de.indexOf(marker);
    if (at < 0) continue;
    const close = de.indexOf("}", at);
    const entry = de.slice(at, close + 1);
    const already = entry.includes(`${field}: "`);
    const updated = entry
      .replace(marker, `{ t: "${head}",`)
      .replace(/\s*\}$/, `${already ? "" : `, ${field}: "${value}"`} }`);
    de = de.slice(0, at) + updated + de.slice(close + 1);
    deChanges.push(`${old} → ${head} (${field}: ${value})`);
  }

  console.log(`\n${deChanges.length} German change(s)`);
  deChanges.forEach((c) => console.log("  " + c));
  if (write) { fs.writeFileSync(DE_FILE, de); console.log("written"); }
}
