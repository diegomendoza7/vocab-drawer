/* Offline checks for the sentence-construction engine.
 *
 * Two failures here are invisible on screen and were both live until now.
 *
 * A **thin pool**: the round is eight sentences and each picks a random object,
 * so a verb with two possible objects produces eight sentences about two nouns,
 * and the words screen that opens the round lists exactly two words. Nothing
 * errors; the exercise is just threadbare.
 *
 * A **typo in a word list**: the rules name objects by headword, so a
 * misspelling matches nothing and silently removes that object. The pool gets
 * quietly smaller and no one finds out.
 */
import { DATA } from "../src/data/vocab.js";
import { FR_VERBS, DE_VERBS } from "../src/data/content.js";
import { nounPoolFor, usableVerbs, objectTopicsFor, isUsableNoun, buildSentence } from "../src/lib/sentences.js";

const ROUND = 8;                       // must match SENTC_ROUND in VocabDrawer
const problems = [];
const fail = (m) => problems.push(m);

/* Verbs whose object is capped by meaning, not by the rule. `essen` can only
 * take things you can chew, and the decks hold five of those. Listing it here
 * is a decision to accept that, not an oversight to trip over later. */
const CAPPED = { "de:essen": "only five edible nouns exist across the decks" };

let smallest = Infinity;
for (const [lang, verbs] of [["fr", FR_VERBS], ["de", DE_VERBS]]) {
  const all = new Map();
  for (const lvl of Object.keys(DATA[lang])) {
    for (const d of DATA[lang][lvl] || []) for (const w of d.words) if (!all.has(w.t)) all.set(w.t, w);
  }

  for (const v of usableVerbs(lang, verbs)) {
    const rule = objectTopicsFor(lang, v);
    const pool = nounPoolFor(lang, v, DATA);
    const key = `${lang}:${v.inf}`;
    smallest = Math.min(smallest, pool.length);

    if (pool.length < ROUND && !CAPPED[key]) {
      fail(`${key}: ${pool.length} objects — a round of ${ROUND} would repeat itself`);
    }
    if (pool.length < 3) fail(`${key}: ${pool.length} objects is not an exercise`);

    for (const entry of rule.words || []) {
      const t = Array.isArray(entry) ? entry[0] : entry;
      const en = Array.isArray(entry) ? entry[1] : null;
      const w = all.get(t);
      if (!w) fail(`${key}: lists "${t}", which is in no deck — a typo removes an object silently`);
      else if (!isUsableNoun(lang, w)) fail(`${key}: lists "${t}", which has no gender and cannot take an article`);
      if (Array.isArray(entry) && (entry.length !== 2 || !en?.startsWith("to "))) {
        fail(`${key}/${t}: an English override must be an infinitive like "to make", got ${JSON.stringify(en)}`);
      }
    }
    for (const topic of rule.topics || []) {
      const found = ["A1", "A2"].some((lvl) => (DATA[lang][lvl] || []).some((d) => d.topic === topic));
      if (!found) fail(`${key}: names drawer "${topic}", which does not exist at A1 or A2`);
    }
    /* Every prompt must be English somebody would say. The generator forms the
     * past from EN_IRREGULAR, so a verb missing from that table silently comes
     * out as "we have maked the bed" — which is how this check earned itself. */
    for (const pick of pool) {
      const sentence = buildSentence({
        lang, verb: v, tenseKey: lang === "fr" ? "passe" : "perfekt",
        subject: { p: 3, tok: lang === "fr" ? "nous" : "wir", en: "we" },
        noun: pick.word, enVerb: pick.enVerb,
      });
      if (/\b\w+(?:ed|d)ed\b|\bmaked\b|\btaked\b|\bgived\b|\bholded\b|\beated\b|\bseed\b|\bselled\b/.test(sentence.english)) {
        fail(`${key}/${pick.word.t}: "${sentence.english}" — the English past is wrong`);
      }
    }

    /* An eating verb must not be able to take a drink. */
    if (rule.drink === false) {
      const wet = pool.filter((x) => /water|milk|coffee|eau|café/i.test(x.word.e) || /Wasser|Milch|Kaffee/.test(x.word.t));
      if (wet.length) fail(`${key}: can still take ${wet.map((x) => x.word.t).join(", ")} as an object`);
    }
  }
}

if (problems.length) {
  console.error(`sentences: ${problems.length} problem(s)`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
const counts = [];
for (const [lang, verbs] of [["fr", FR_VERBS], ["de", DE_VERBS]]) {
  for (const v of usableVerbs(lang, verbs)) counts.push(nounPoolFor(lang, v, DATA).length);
}
console.log(`sentences ok — ${counts.length} verbs, ${Math.min(...counts)}–${Math.max(...counts)} objects each`);
