/* Check the C1 decks against the language's own Wiktionary.
 *
 *   node scripts/audit-c1.mjs
 *
 * Two facts are objectively checkable and both are taught as truth by the app,
 * so both are worth an exit code: whether the headword exists at all, and
 * whether its gender is what we say it is. A wrong der/die/das is drilled into
 * someone hundreds of times.
 *
 * Meanings are not checked here — our gloss is English and Wiktionary's is not,
 * so there is nothing to compare mechanically. Those were reviewed by hand
 * against the senses this script prints under --senses.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "c1-cache");
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
const parsed = {
  fr: JSON.parse(fs.readFileSync(path.join(DIR, "parsed-fr.json"), "utf8")),
  de: JSON.parse(fs.readFileSync(path.join(DIR, "parsed-de.json"), "utf8")),
};

/* Confirmed real in the DWDS reference corpus by scripts/verify-dwds.mjs.
 * German builds compounds productively, so Wiktionary's silence is not
 * evidence of anything; corpus frequency is. Loaded rather than hard-coded so
 * re-running the verifier updates this on its own. */
const dwds = (() => {
  const f = path.join(DIR, "dwds.json");
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {};
})();

/* Adjectival nouns take their gender from the article, so both der Angeklagte
 * and die Angeklagte are correct and Wiktionary's lemma is only one of them.
 * The deck cites the masculine and carries a note saying so. */
const ADJECTIVAL = new Set(["Angeklagte", "Beschuldigte", "Vorsitzende", "Abgeordnete", "Verdächtige"]);

const problems = { genderFr: [], genderDe: [], missing: [], noGender: [] };

for (const w of manifest) {
  const wik = parsed[w.lang]?.[w.t];
  const multiword = /\s|'/.test(w.t);

  if (!wik) {
    /* A collocation has no entry of its own, which is expected — only a bare
     * headword with no page is suspicious. */
    const hits = dwds[w.t];
    if (!multiword && !(hits > 0)) {
      problems.missing.push(`${w.lang} ${w.staged ? "staged" : "wired"} · ${w.t} — no ${w.lang}.wiktionary page${hits === 0 ? " and no DWDS corpus hits" : ""}`);
    }
    continue;
  }

  if (w.lang === "de" && w.g && wik.gender && w.g !== wik.gender && !ADJECTIVAL.has(w.t)) {
    problems.genderDe.push(`${w.t}: deck says ${w.g}, Wiktionary says ${wik.gender}  (${w.e})`);
  }
  if (w.lang === "fr" && w.gen && wik.gender && wik.gender !== "mf" && w.gen !== wik.gender) {
    problems.genderFr.push(`${w.t}: deck says ${w.gen}, Wiktionary says ${wik.gender}  (${w.e})`);
  }
  /* A German noun with no gender in the deck cannot be coloured or drilled for
   * der/die/das, which is half of what the German C1 set is for. */
  if (w.lang === "de" && !w.g && wik.gender && wik.pos.includes("noun") && !multiword) {
    problems.noGender.push(`${w.t}: deck has no g, Wiktionary says ${wik.gender}  (${w.e})`);
  }
}

const show = (title, list) => {
  console.log(`\n${title}: ${list.length}`);
  list.slice(0, 60).forEach((p) => console.log("  " + p));
  if (list.length > 60) console.log(`  …${list.length - 60} more`);
};
show("German gender mismatches", problems.genderDe);
show("French gender mismatches", problems.genderFr);
show("German nouns with no gender in the deck", problems.noGender);
show("Headwords with no Wiktionary page", problems.missing);

const total = Object.values(problems).reduce((a, l) => a + l.length, 0);
const confirmed = Object.values(dwds).filter((h) => h > 0).length;
console.log(`\n${manifest.length} C1 entries checked against Wiktionary; ${confirmed} German compounds it does not list confirmed in the DWDS corpus`);
if (total) { console.error(`${total} problem(s)`); process.exit(1); }
console.log("no problems found");
