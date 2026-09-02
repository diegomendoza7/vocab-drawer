/* Regression guard for the two pure layers: gloss matching and the sentence
 * engine. Neither touches React, so both run under plain node.
 *
 *   node scripts/check-answers.mjs
 *
 * Exits non-zero on any failure. The gloss half exists because a single
 * missing split made 534 words unanswerable without anyone noticing; the
 * sentence half because a generated sentence's word order *is* the answer key,
 * so a silent grammar regression would teach the mistake.
 */
import { DATA } from "../src/data/vocab.js";
import { FR_VERBS, DE_VERBS, FR_TENSES, DE_TENSES, conjugateEnglish, personsFor } from "../src/data/content.js";
import { FR_C1_VERBS, DE_C1_VERBS } from "../src/data/verbs-c1.js";
import { splitSenses, acceptableEnglish } from "../src/lib/gloss.js";
import { buildDictionary, describe, segmentSentence, lookupKey, exactKey } from "../src/lib/dictionary.js";
import { buildSentence, SUBJECTS, timePhrasesFor, usableVerbs, nounPoolFor } from "../src/lib/sentences.js";

const VERBS = { fr: FR_VERBS, de: DE_VERBS };
const TENSES = { fr: FR_TENSES, de: DE_TENSES };
const fail = [];
const check = (cond, msg) => { if (!cond) fail.push(msg); };

/* ---- glosses: every sense a word lists must be an accepted answer ---- */
let words = 0, senses = 0;
for (const lang of Object.keys(DATA))
  for (const lvl of Object.keys(DATA[lang]))
    for (const drawer of DATA[lang][lvl])
      for (const w of drawer.words) {
        words++;
        const accepted = acceptableEnglish(w);
        check(accepted.includes(w.e), `${lang}/${lvl}/${w.t}: full gloss not accepted`);
        for (const s of splitSenses(w.e)) {
          senses++;
          check(accepted.includes(s), `${lang}/${lvl}/${w.t}: sense "${s}" not accepted`);
        }
      }
console.log(`glosses: ${words} words, ${senses} senses`);

/* ---- dictionary: the offline lookup behind the hover definitions ----
 *
 * Coverage is partial on purpose, so this asserts a floor rather than
 * completeness, plus the two collisions that actually bit: accent-flattening
 * merged "schon"/"schön", and stripping the œ ligature turned "sœur" into the
 * preposition "sur".
 */
for (const lang of ["fr", "de"]) {
  const dict = buildDictionary(lang, DATA, VERBS[lang], TENSES[lang]);
  let tokens = 0, resolved = 0, c1Tokens = 0, c1Resolved = 0;
  for (const lvl of Object.keys(DATA[lang]))
    for (const drawer of DATA[lang][lvl])
      for (const w of drawer.words) {
        if (!w.s) continue;
        for (const seg of segmentSentence(w.s)) {
          if (seg.type !== "word") continue;
          if (lvl === "C1") { c1Tokens++; if (describe(dict, seg.v)) c1Resolved++; }
          else { tokens++; if (describe(dict, seg.v)) resolved++; }
        }
        // Rendering must never lose or duplicate a character.
        check(segmentSentence(w.s).map((x) => x.v).join("") === w.s, `${lang}/${w.t}: segmentation is not lossless`);
      }
  const pct = Math.round((resolved / tokens) * 100);
  const c1Pct = c1Tokens ? Math.round((c1Resolved / c1Tokens) * 100) : null;
  console.log(`dictionary ${lang}: ${dict.size} entries, ${pct}% of A1–B2 sentence words resolve${c1Pct === null ? "" : `, ${c1Pct}% of C1`}`);
  check(pct >= 70, `${lang}: A1–B2 dictionary coverage fell to ${pct}% (floor is 70%)`);
  /* C1 is measured separately and against a lower floor on purpose. Its
   * sentences are journalistic and academic by design, so they legitimately
   * contain words the deck does not teach — a C1 example that only used deck
   * vocabulary would not be a C1 example. The floor still catches a real
   * regression, such as segmentation breaking. */
  if (c1Pct !== null) check(c1Pct >= 45, `${lang}: C1 dictionary coverage fell to ${c1Pct}% (floor is 45%)`);
}
for (const [lang, word, want] of [
  ["fr", "sur", "on"],
  ["fr", "sœur", "sœur — sister"],
  ["de", "schon", "schon — already"],
  ["de", "schön", "schön — beautiful"],
]) {
  const dict = buildDictionary(lang, DATA, VERBS[lang], TENSES[lang]);
  const got = describe(dict, word);
  check(got === want, `${lang}/${word}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}
check(lookupKey("sœur") !== lookupKey("sur"), "ligature collision: sœur and sur share a key");
check(exactKey("Schön") === "schön", "exactKey must keep accents");

/* ---- English renderings: no verb may inflect its phrase instead of its head ----
 *
 * "have" -> "haves" and "have to" -> "have toes" both shipped. The rule is
 * that only the first word of a gloss inflects, so these patterns must never
 * appear across any verb, tense or person. C1 verbs are included because they
 * are where the multi-word glosses live.
 */
const BROKEN = [/\btoes\b/, /\bhaves\b/, /\bbes\b/, /\bbeing able\b/, /\b(?:I|you|we|they[^]*?) be\b(?! (?:able|due|due))/];
const ALL_VERBS = { fr: [...FR_VERBS, ...FR_C1_VERBS], de: [...DE_VERBS, ...DE_C1_VERBS] };
let rendered = 0;
for (const lang of ["fr", "de"])
  for (const verb of ALL_VERBS[lang])
    for (const t of TENSES[lang])
      for (const p of personsFor(lang, t.key)) {
        const out = conjugateEnglish(lang, verb, t.key, p);
        rendered++;
        const at = `${lang}/${verb.label || verb.inf}/${t.key}/p${p}`;
        check(out && !/\s{2,}/.test(out), `${at}: malformed rendering "${out}"`);
        for (const re of BROKEN.slice(0, 4))
          check(!re.test(out), `${at}: broken inflection "${out}"`);
      }
for (const [lang, inf, tense, p, want] of [
  ["fr", "avoir", "present", 2, "he/she has"],
  ["fr", "pouvoir", "present", 0, "I am able to"],
  ["fr", "devoir", "present", 2, "he/she has to"],
  ["de", "haben", "praesens", 2, "he/she has"],
  ["de", "sein", "praesens", 0, "I am"],
]) {
  const verb = ALL_VERBS[lang].find((v) => v.inf === inf);
  const got = conjugateEnglish(lang, verb, tense, p);
  check(got === want, `${lang}/${inf}/${tense}/p${p}: got "${got}", want "${want}"`);
}
console.log(`english: ${rendered} renderings`);

/* ---- sentences: every combination must be well formed ---- */
let built = 0;
for (const lang of ["fr", "de"]) {
  const verbs = usableVerbs(lang, VERBS[lang]);
  check(verbs.length > 0, `${lang}: no usable verbs`);
  for (const verb of verbs) {
    const pool = nounPoolFor(lang, verb, DATA);
    check(pool.length > 0, `${lang}/${verb.inf}: empty noun pool`);
    for (const t of TENSES[lang])
      for (const subject of SUBJECTS[lang])
        for (const { word: noun } of pool)
          for (const time of [null, ...timePhrasesFor(lang, t.key)]) {
            const r = buildSentence({ lang, verb, tenseKey: t.key, subject, noun, time });
            built++;
            const at = `${lang}/${verb.inf}/${t.key}/${subject.tok}/${noun.t}${time ? "+" + time.tok : ""}`;
            check(r.tokens.every((x) => x && x === x.trim() && !x.includes("undefined")), `${at}: malformed tile`);
            check(r.tokens.length >= 2, `${at}: fewer than two tiles`);
            // Every tile must be able to explain itself when hovered.
            check(r.glosses.length === r.tokens.length, `${at}: gloss count does not match tiles`);
            check(r.glosses.every((g) => g && g.trim() && !g.includes("undefined")), `${at}: missing or malformed gloss`);
            check(r.english && !r.english.includes("undefined"), `${at}: malformed English`);
            check(!time || time.tenses.includes(t.key), `${at}: time phrase disagrees with tense`);
            // German puts the non-finite part last, and the subject third once
            // the front field is filled.
            if (lang === "de" && t.key === "perfekt") check(r.tokens.at(-1) === verb.pp, `${at}: participle not clause-final`);
            if (lang === "de" && t.key === "futur") check(r.tokens.at(-1) === verb.inf, `${at}: infinitive not clause-final`);
            if (lang === "de" && time) check(r.tokens[2] === subject.tok, `${at}: subject not third after fronting`);
            // An alternate is a reordering, so it must use exactly the same tiles.
            const bag = (a) => [...a].map((x) => x.toLowerCase()).sort().join("|");
            for (const alt of r.alternates) check(bag(alt) === bag(r.tokens), `${at}: alternate changes the tiles`);
          }
  }
}
console.log(`sentences: ${built} built`);

if (fail.length) {
  console.error(`\n${fail.length} failure(s):`);
  fail.slice(0, 20).forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\nall checks passed");
