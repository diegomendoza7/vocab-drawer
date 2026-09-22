/* What the learner keeps getting wrong — the ledger the app never kept.
 *
 * Word recall has always been remembered properly: every answer moves an SM-2
 * card. Every *other* diagnosis was thrown away. The writing checker names the
 * exact rule broken — "de-verb-second", "CAT_GRAMMAIRE" — and then forgets it
 * the moment the panel closes; a missed Präteritum form is graded as a card
 * and never as a tense. So the app could tell you that you were wrong, over
 * and over, and never that you were wrong *in the same way*.
 *
 * This keeps a count per rule, per language, with a few of the learner's own
 * sentences as evidence. Two things then become possible that were not:
 * telling someone what their pattern is, and drilling that pattern with
 * sentences they actually wrote.
 *
 * Kept deliberately small and pure: it is a fold over check results, so it can
 * be unit-tested without a browser, and it stores excerpts rather than whole
 * pieces of writing so the progress record does not grow without bound.
 */
import { COUNTED } from "./grammar.js";

export const KEEP_EXAMPLES = 3;
/** How fast an old mistake stops counting. Three weeks to half weight. */
export const HALF_LIFE_DAYS = 21;
const EXCERPT = 120;

const asDate = (key) => new Date(`${key}T00:00:00`);
export function daysBetween(from, to) {
  const ms = asDate(to) - asDate(from);
  return Math.max(0, Math.round(ms / 86400000));
}

/**
 * The key a mistake is counted under.
 *
 * Drawer rules are already the right size — "the verb goes second" is one
 * teachable thing. LanguageTool's rule ids are not: there are thousands, and
 * FRENCH_AGREEMENT_1 and FRENCH_AGREEMENT_2 are the same lesson, so they fold
 * to their category. Anything without a category falls back to its kind, which
 * at least separates spelling from grammar.
 */
export function ruleKeyOf(issue) {
  if (!issue) return null;
  if (issue.source === "drawer" && issue.rule) return issue.rule;
  if (issue.category) return `lt:${issue.category}`;
  return `kind:${issue.kind || "grammar"}`;
}

function excerpt(text, issue) {
  const t = String(text || "");
  if (!t) return "";
  if (issue?.start == null) return t.slice(0, EXCERPT);
  // Enough either side of the error to be recognisable as your own sentence.
  const from = Math.max(0, issue.start - 45);
  const to = Math.min(t.length, issue.end + 45);
  return `${from > 0 ? "…" : ""}${t.slice(from, to).trim()}${to < t.length ? "…" : ""}`;
}

/** Fold one check's issues into the ledger. Returns a new ledger. */
export function recordIssues(ledger, { lang, issues = [], text = "", today }) {
  const next = { ...(ledger || {}) };
  /* One entry per rule per check, not per occurrence: three agreement slips in
   * one sentence are one lesson, and counting them three times would let a
   * single bad paragraph dominate the list for weeks. */
  const seen = new Set();
  for (const issue of issues) {
    if (!COUNTED.has(issue.kind)) continue;
    const rule = ruleKeyOf(issue);
    if (!rule || seen.has(rule)) continue;
    seen.add(rule);
    const id = `${lang}:${rule}`;
    const prev = next[id] || { rule, lang, count: 0, first: today, last: today, examples: [] };
    next[id] = {
      ...prev,
      count: prev.count + 1,
      first: prev.first || today,
      last: today,
      examples: [
        { text: excerpt(text, issue), wrong: issue.text || "", fix: issue.fixes?.[0] || "", at: today },
        ...prev.examples,
      ].slice(0, KEEP_EXAMPLES),
    };
  }
  return next;
}

/**
 * Fold in a miss that did not come from the writing checker — a conjugation
 * drill, say, where the rule is the tense rather than a grammar rule.
 */
export function recordMiss(ledger, { lang, rule, prompt = "", answer = "", today }) {
  if (!rule) return ledger || {};
  const next = { ...(ledger || {}) };
  const id = `${lang}:${rule}`;
  const prev = next[id] || { rule, lang, count: 0, first: today, last: today, examples: [] };
  next[id] = {
    ...prev,
    count: prev.count + 1,
    first: prev.first || today,
    last: today,
    examples: [{ text: prompt, wrong: "", fix: answer, at: today }, ...prev.examples].slice(0, KEEP_EXAMPLES),
  };
  return next;
}

/** Recency-weighted weight of one entry: old mistakes fade rather than vanish. */
export function weightOf(entry, today) {
  if (!entry?.count) return 0;
  const age = daysBetween(entry.last || today, today);
  return entry.count * 0.5 ** (age / HALF_LIFE_DAYS);
}

/**
 * The patterns worth working on now, heaviest first.
 *
 * `minCount` is what keeps this honest: one slip is not a pattern, and a list
 * that names every one-off would be a list of noise rather than a diagnosis.
 */
export function topMistakes(ledger, lang, { today, limit = 6, minCount = 2 } = {}) {
  return Object.entries(ledger || {})
    .filter(([id, e]) => id.startsWith(`${lang}:`) && e.count >= minCount)
    .map(([id, e]) => ({ id, ...e, weight: weightOf(e, today) }))
    .sort((a, b) => b.weight - a.weight || b.count - a.count)
    .slice(0, limit);
}

/** Drop one pattern — for "I've got this now". */
export function clearMistake(ledger, id) {
  const next = { ...(ledger || {}) };
  delete next[id];
  return next;
}

/* ---------------------------------------------------------------------- */
/* What each pattern means, in one line                                    */
/*                                                                         */
/* The app has six grammar notes and never showed one at the moment it was  */
/* needed. `note` points at a note's title so the UI can link to it; `why`  */
/* is the version that fits under an error without navigating anywhere.     */
/* ---------------------------------------------------------------------- */
export const RULE_INFO = {
  "de-verb-second": {
    title: "Verb second",
    why: "In a German main clause the conjugated verb is the second element. Anything can come first — a time, a place, an object — but the verb keeps its seat, and the subject moves behind it: “Gestern **bin ich** ins Kino gegangen.”",
    note: "Word order: verb second, verb last",
  },
  "de-verb-final": {
    title: "Verb to the end",
    why: "After weil, dass, wenn, obwohl and the rest, the conjugated verb goes to the end of its clause: “weil ich **arbeiten muss**.” The modal or auxiliary is what lands last.",
    note: "Word order: verb second, verb last",
  },
  "de-agreement": {
    title: "Subject–verb agreement",
    why: "The verb ending follows the subject: ich bin, du bist, er ist, wir sind, ihr seid, sie sind. Worth saying the pronoun aloud with the form until the pair is one thing.",
  },
  "de-case": {
    title: "Case after a preposition",
    why: "Prepositions fix the case of what follows. mit, aus, bei, nach, seit, von, zu always take the dative; durch, für, gegen, ohne always the accusative — “mit **dem** Bus”, “für **den** Freund”.",
    note: "The four cases",
  },
  "de-gender": {
    title: "Article gender",
    why: "The article has to match the noun's gender, and as a subject it is nominative: die Frau, der Mann, das Kind. Learn the article *with* the noun — a noun learned bare is a noun you will get wrong.",
  },
  "de-adjective-ending": {
    title: "Adjective endings",
    why: "After a bare ein-word the adjective carries the information the article is missing: “mein **bester** Freund”, “ein **schönes** Haus”.",
    note: "Adjective endings",
  },
  "lt:CAT_GRAMMAIRE": {
    title: "French grammar",
    why: "Agreement and verb form — the participle after avoir/être, the subjunctive after que, a plural that did not carry through the phrase.",
  },
  "lt:AGREEMENT": {
    note: "Adjective agreement and placement",
    title: "Agreement",
    why: "Determiner, noun and adjective have to agree in gender and number. It is the commonest French slip and the easiest to re-read for.",
  },
  "lt:CAT_HOMONYMES_PARONYMES": {
    title: "Homophones",
    why: "Words that sound identical and are spelled differently: a/à, ces/ses, son/sont, ou/où. Your ear cannot catch these — only the grammar can.",
  },
  "lt:CAT_REGLES_DE_BASE": {
    title: "Basic rules",
    why: "Elision, hyphens, the verb that takes a different preposition. Small, mechanical, and worth fixing once rather than repeatedly.",
  },
  "lt:TYPOS": {
    title: "Spelling",
    why: "A misspelling is usually a sound you have never seen written. Look the word up once and write it out — recognising it is not the same as being able to spell it.",
  },
  "lt:GRAMMAR": {
    title: "German grammar",
    why: "The auxiliary, the participle or the case did not match what the sentence needed.",
  },
  "kind:spelling": { title: "Spelling", why: "Worth a second look before you submit — spelling is the one error you can always catch yourself." },
  "kind:grammar": { title: "Grammar", why: "The checker flagged the form rather than the word." },
};

/** Conjugation misses are keyed by tense, which is the teachable unit there. */
export const conjRuleKey = (tenseKey) => `conj:${tenseKey}`;

export function ruleInfo(rule, fallback = "") {
  if (RULE_INFO[rule]) return RULE_INFO[rule];
  if (rule?.startsWith("conj:")) {
    return { title: "Verb forms", why: "This tense is not settled yet. The table and the drill are in Grammar & Verbs.", note: null };
  }
  return { title: fallback || "Mistake", why: "", note: null };
}

/** Note that a pattern was drilled. The count stands — only real writing moves it. */
export function markPractised(ledger, id, today) {
  const entry = (ledger || {})[id];
  if (!entry) return ledger || {};
  return { ...ledger, [id]: { ...entry, practised: [today, ...(entry.practised || [])].slice(0, 10) } };
}
