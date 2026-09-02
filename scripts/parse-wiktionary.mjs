/* Turn cached Wiktionary wikitext into the four facts the deck cares about:
 * part of speech, gender, glosses, and example sentences that could serve as a
 * cloze.
 *
 *   node scripts/parse-wiktionary.mjs --lang fr > scripts/c1-cache/parsed-fr.json
 *
 * The parse is deliberately conservative. A sentence is only offered as a
 * candidate if it contains the headword in the exact surface form the deck
 * teaches — `makeCloze` blanks by literal match, so an inflected citation
 * would produce a blank that cannot be filled by the answer being drilled.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "c1-cache");
const args = process.argv.slice(2);
const lang = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : "fr";

const cache = JSON.parse(fs.readFileSync(path.join(DIR, `wiktionary-${lang}.json`), "utf8"));

/** Strip wiki markup down to running text. */
function clean(s) {
  return s
    .replace(/\{\{w\|([^|}]*)(\|[^}]*)?\}\}/g, "$1")         // {{w|Balzac}} → Balzac
    .replace(/\{\{lien\|([^|}]*)(\|[^}]*)?\}\}/g, "$1")
    .replace(/\{\{[^{}]*\}\}/g, "")                            // any other template
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2")             // [[a|b]] → b
    .replace(/\[\[([^\]]*)\]\]/g, "$1")
    .replace(/'''/g, "").replace(/''/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const POS_FR = {
  nom: "noun", "locution nominale": "noun", verbe: "verb", "locution verbale": "verb",
  adjectif: "adjective", "locution adjectivale": "adjective", adverbe: "adverb",
  "locution adverbiale": "adverb", préposition: "preposition", conjonction: "conjunction",
  "locution conjonctive": "conjunction", pronom: "pronoun", interjection: "interjection",
};
const POS_DE = {
  Substantiv: "noun", Verb: "verb", Adjektiv: "adjective", Adverb: "adverb",
  Redewendung: "phrase", Wortverbindung: "phrase", Präposition: "preposition",
  Konjunktion: "conjunction", Subjunktion: "conjunction", Partizip: "participle",
};

function parseFr(title, wikitext) {
  /* Only the French section — many pages carry a dozen languages. The heading
   * is not consistently spaced ("== {{langue|fr}}==" is common), so this has
   * to be a pattern rather than a literal. */
  const start = wikitext.search(/==\s*\{\{langue\|fr\}\}\s*==/);
  if (start < 0) return null;
  const rest = wikitext.slice(start + 4);
  const end = rest.search(/\n== \{\{langue\|(?!fr\}\})/);
  const body = end < 0 ? rest : rest.slice(0, end);

  const pos = [...body.matchAll(/===\s*\{\{S\|([^|}]+)\|fr/g)]
    .map((m) => POS_FR[m[1].trim()]).filter(Boolean);

  /* Gender rides on the headword line, not the POS heading. */
  const headLine = new RegExp(`'''${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'''[^\\n]*`).exec(body);
  let gender = null;
  if (headLine) {
    if (/\{\{f\}\}/.test(headLine[0])) gender = "f";
    else if (/\{\{m\}\}/.test(headLine[0])) gender = "m";
    else if (/\{\{mf\}\}|\{\{m\|équiv=/.test(headLine[0])) gender = "mf";
  }

  const senses = [...body.matchAll(/^# (?!\*)(.+)$/gm)].map((m) => clean(m[1])).filter(Boolean).slice(0, 6);

  const examples = [];
  for (const m of body.matchAll(/\{\{exemple\s*\|([\s\S]*?)\}\}(?=\s*(?:\n|$))/g)) {
    const parts = m[1].split(/\n?\s*\|\s*/);
    for (const p of parts) {
      if (/^(lang|source|sens|traduction|lien)\s*=/.test(p) || /^\s*$/.test(p)) continue;
      const s = clean(p);
      if (s.length > 12) { examples.push(s); break; }
    }
  }
  /* The older `#* ''sentence''` form, still very common. */
  for (const m of body.matchAll(/^#\*\s*''(.+?)''\s*(?:\{\{source|—|$)/gm)) {
    const s = clean(m[1]);
    if (s.length > 12) examples.push(s);
  }
  return { pos: [...new Set(pos)], gender, senses, examples: [...new Set(examples)] };
}

function parseDe(title, wikitext) {
  const start = wikitext.search(/==\s*[^\n=]*\(\{\{Sprache\|Deutsch\}\}\)\s*==/);
  if (start < 0) return null;
  const rest = wikitext.slice(start + 4);
  const end = rest.search(/\n==\s*[^\n=]*\(\{\{Sprache\|(?!Deutsch\}\})/);
  const body = end < 0 ? rest : rest.slice(0, end);

  const pos = [...body.matchAll(/\{\{Wortart\|([^|}]+)\|Deutsch\}\}/g)]
    .map((m) => POS_DE[m[1].trim()]).filter(Boolean);

  let gender = null;
  const gm = /\{\{Wortart\|Substantiv\|Deutsch\}\}[^\n]*?\{\{([mfn])\}\}/.exec(body);
  if (gm) gender = { m: "der", f: "die", n: "das" }[gm[1]];

  const senses = [];
  const bed = /\{\{Bedeutungen\}\}([\s\S]*?)(?=\n\{\{|\n===|$)/.exec(body);
  if (bed) for (const m of bed[1].matchAll(/^:\s*(?:\[[\d\w, .–-]*\])?\s*(.+)$/gm)) {
    const s = clean(m[1]);
    if (s) senses.push(s);
  }

  const examples = [];
  const bei = /\{\{Beispiele\}\}([\s\S]*?)(?=\n\{\{[A-Z]|\n===|$)/.exec(body);
  if (bei) for (const m of bei[1].matchAll(/^:\s*(?:\[[\d\w, .–-]*\])?\s*(.+)$/gm)) {
    const s = clean(m[1]).replace(/^[„"']|["'“]$/g, "").trim();
    if (s.length > 12) examples.push(s);
  }
  return { pos: [...new Set(pos)], gender, senses: senses.slice(0, 6), examples: [...new Set(examples)] };
}

/* Wiktionary redirects one spelling to another ("Druck ausüben auf" →
 * "Druck ausüben"). Following it in the cache costs nothing and recovers a
 * few dozen entries that would otherwise read as absent. */
function resolve(title, depth = 0) {
  const text = cache[title];
  if (!text || depth > 2) return text || null;
  const r = /^#\s*(?:REDIRECT|WEITERLEITUNG|REDIRECTION)\s*\[\[([^\]|#]+)/i.exec(text.trim());
  return r ? resolve(r[1].trim(), depth + 1) : text;
}

const out = {};
for (const title of Object.keys(cache)) {
  const wikitext = resolve(title);
  if (!wikitext) { out[title] = null; continue; }
  try {
    out[title] = lang === "fr" ? parseFr(title, wikitext) : parseDe(title, wikitext);
  } catch { out[title] = null; }
}
console.log(JSON.stringify(out));
