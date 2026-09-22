/* Offline checks for the explanations shown at the moment of an error.
 *
 * The app now answers a mistake with the rule behind it, and offers the
 * grammar note that covers it. Both of those are links from one data file to
 * another — a rule id to an explanation, an explanation to a note title — and
 * a broken link of either kind is **invisible on screen**: the UI matches the
 * note title against the notes that exist and simply renders nothing when it
 * misses, so a renamed note silently removes the button rather than erroring.
 *
 * So four things are checked here that nothing else can catch:
 *
 *   - every drawer rule the German checker can emit has an explanation, or an
 *     error the app diagnosed precisely would be shown with no "why" at all;
 *   - every `note` an explanation points at is a real note title, in the
 *     language that rule belongs to — a German rule pointing at a French note
 *     renders no button, which looks exactly like "no note exists";
 *   - every tense says how it is built, since that is what the conjugation
 *     drill shows on a miss;
 *   - explanations do not contain an unclosed `**` emphasis marker, which
 *     would print the asterisks to the learner.
 */
import { RULE_INFO, ruleInfo } from "../src/lib/errors.js";
import { RULE_LABEL } from "../src/lib/grammar.js";
import { GRAMMAR, FR_TENSES, DE_TENSES } from "../src/data/content.js";

const problems = [];
const fail = (m) => problems.push(m);

const titles = { fr: GRAMMAR.fr.map((n) => n.title), de: GRAMMAR.de.map((n) => n.title) };

/* Which language's notes a rule's `note` must be found in.
 *
 * `de-*` are the drawer's own German rules. LanguageTool's `CAT_*` categories
 * are the French ones (CAT_GRAMMAIRE, CAT_HOMONYMES_PARONYMES…). Everything
 * else — TYPOS, GRAMMAR — is raised for both languages, so its note only has
 * to exist somewhere. */
function langOf(key) {
  if (key.startsWith("de-")) return "de";
  if (key.startsWith("lt:CAT_")) return "fr";
  return null;
}

/* 1. Every rule the German checker can emit is explained. */
for (const rule of Object.keys(RULE_LABEL)) {
  const info = RULE_INFO[rule];
  if (!info) fail(`${rule}: the checker can flag this and there is no explanation for it`);
  else if (!info.why) fail(`${rule}: has an entry but no "why", so the panel shows a heading and nothing else`);
}

/* 2. Every note reference resolves, in the right language. */
for (const [key, info] of Object.entries(RULE_INFO)) {
  if (!info.note) continue;
  const lang = langOf(key);
  const where = lang ? [lang] : ["fr", "de"];
  if (!where.some((l) => titles[l].includes(info.note)))
    fail(`${key}: note "${info.note}" is not a ${where.join(" or ")} grammar note — the link would silently not render`);
}

/* 3. Every tense explains how it is built, and its note resolves. */
for (const [lang, tenses] of [["fr", FR_TENSES], ["de", DE_TENSES]]) {
  for (const t of tenses) {
    if (!t.form) fail(`${lang} ${t.key}: no "form" — a missed conjugation would show the answer and no rule`);
    if (t.note && !titles[lang].includes(t.note))
      fail(`${lang} ${t.key}: note "${t.note}" is not a ${lang} grammar note`);
  }
}

/* 4. Emphasis markers are balanced, or the learner reads the asterisks. */
const emphasised = [
  ...Object.entries(RULE_INFO).map(([k, v]) => [`RULE_INFO ${k}`, v.why]),
  ...FR_TENSES.map((t) => [`fr ${t.key}`, t.form]),
  ...DE_TENSES.map((t) => [`de ${t.key}`, t.form]),
];
for (const [at, text] of emphasised) {
  if (!text) continue;
  const marks = (text.match(/\*\*/g) || []).length;
  if (marks % 2) fail(`${at}: an unclosed ** emphasis marker — the asterisks would be shown`);
}

/* 5. A rule with no entry still answers, rather than throwing. */
const fallback = ruleInfo("conj:praeteritum");
if (!fallback.title || !fallback.why) fail("ruleInfo fell through without a usable answer for a conj: key");

if (problems.length) {
  console.error(`check-explanations: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
const linked = Object.values(RULE_INFO).filter((i) => i.note).length;
console.log(
  `check-explanations: ${Object.keys(RULE_INFO).length} rules explained (${linked} linked to a note), ` +
  `${FR_TENSES.length + DE_TENSES.length} tenses say how they are built`,
);
