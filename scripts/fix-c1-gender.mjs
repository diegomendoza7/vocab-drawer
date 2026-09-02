/* Apply the gender corrections the Wiktionary audit turned up.
 *
 *   node scripts/fix-c1-gender.mjs [--write]
 *
 * Fifteen German nouns in the false-friends drawer shipped with no `g` at all,
 * so they could not be colour-coded and could not be drilled for der/die/das —
 * half of what the German deck is for. One, Burn-out, had the wrong article.
 *
 * Idempotent: a word that already carries the gender being set is skipped, so
 * the script can be re-run after a future audit without churning the file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "vocab-de-c1.js");
const write = process.argv.includes("--write");

/* Genders confirmed against de.wiktionary.org by scripts/audit-c1.mjs. */
const GENDER = {
  Konzept: "das", Kritik: "die", Argument: "das", Fabrik: "die", Rezept: "das",
  Chef: "der", Direktor: "der", Dose: "die", Kaution: "die", Provision: "die",
  Milliarde: "die", Formular: "das", Notiz: "die", Meinung: "die", Ordnung: "die",
};

/* Duden gives both articles for Burn-out and leads with das. */
const RETAG = { "Burn-out": "das" };

/* Adjectival nouns: der Angeklagte and die Angeklagte are both correct, and
 * the ending changes with the article. `der` stays as the citation form; the
 * note is what stops the card from teaching half the truth. */
const NOTE = {
  Angeklagte: "adjectival noun — der Angeklagte / die Angeklagte, ein Angeklagter",
  Beschuldigte: "adjectival noun — der Beschuldigte / die Beschuldigte, ein Beschuldigter",
};

let src = fs.readFileSync(FILE, "utf8");
const changes = [];

for (const [t, g] of Object.entries(GENDER)) {
  const re = new RegExp(`(\\{ t: "${t}", e: "(?:[^"\\\\]|\\\\.)*")((?![^}]*\\bg: ")[^}]*\\})`);
  const m = re.exec(src);
  if (!m) continue;                                  // already has one, or gone
  src = src.replace(re, `$1, g: "${g}"$2`);
  changes.push(`${t} → g: "${g}"`);
}

for (const [t, g] of Object.entries(RETAG)) {
  const re = new RegExp(`(\\{ t: "${t}",[^}]*?)g: "(der|die|das)"`);
  const m = re.exec(src);
  if (m && m[2] !== g) { src = src.replace(re, `$1g: "${g}"`); changes.push(`${t}: ${m[2]} → ${g}`); }
}

for (const [t, note] of Object.entries(NOTE)) {
  const re = new RegExp(`(\\{ t: "${t}", e: "(?:[^"\\\\]|\\\\.)*")((?![^}]*\\bn: ")[^}]*\\})`);
  if (re.test(src)) { src = src.replace(re, `$1, n: "${note}"$2`); changes.push(`${t} → note`); }
}

console.log(`${changes.length} change(s)`);
changes.forEach((c) => console.log("  " + c));
if (write) { fs.writeFileSync(FILE, src); console.log("written"); }
else console.log("dry run — pass --write");
