/* How a lesson's answers are judged.
 *
 * Every check here is offline and deterministic — the same answer gets the
 * same verdict every time, and none of it needs a model. What each one can and
 * cannot know is stated at the point it is used, because a checker that
 * overclaims teaches the learner to distrust it:
 *
 *   - a typed single word or phrase is compared exactly, and a slip that is
 *     *only* an accent is accepted with a note rather than failed — the same
 *     policy as the rest of the app;
 *   - a German noun typed with the wrong article is not accepted: the gender
 *     is half of what the word is, and "right word, wrong gender" is a real
 *     mistake worth naming;
 *   - a rebuilt sentence is compared against every order the lesson declares
 *     correct, and scripts/check-lessons.mjs makes sure those orders only use
 *     the chunks offered;
 *   - a translation *into English* is judged by key ideas, not wording, since
 *     a good translation has many correct forms;
 *   - a translation *into* the language is judged against known-good versions,
 *     and when it matches none of them the checker says what it could verify
 *     (the required forms, the grammar) and leaves the final call to the
 *     learner — because it genuinely cannot tell a wrong sentence from a right
 *     one it has not seen.
 */

const ARTICLES = {
  fr: /^(?:le|la|les|un|une|des|l')\s*/,
  de: /^(?:der|die|das|ein|eine|einen|den|dem)\s+/,
};

/**
 * Lower-case, unify apostrophes, drop punctuation and quotes, collapse
 * spaces. Accents and ß are kept: this is the strict form.
 */
export function normalizeAnswer(s) {
  return String(s || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u00a0\u202f]/g, " ")
    // punctuation and quotation marks, but not a hyphen inside a word or an apostrophe
    .replace(/[.,;:!?«»"„“”‚()[\]…—–]/g, " ")
    .replace(/(^|\s)-+|-+(\s|$)/g, " ")
    /* An apostrophe between letters is part of the word (l'homme, doesn't);
     * one at the edge of a word is a quotation mark ('What …'). */
    .replace(/(^|\s)'+|'+(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The same, with accents and ß folded away — for the lenient comparison. */
export function foldAccents(s) {
  return normalizeAnswer(s)
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitArticle(norm, lang) {
  const re = ARTICLES[lang];
  if (!re) return { article: null, bare: norm };
  const m = norm.match(re);
  if (!m) return { article: null, bare: norm };
  return { article: m[0].trim(), bare: norm.slice(m[0].length) };
}

/**
 * A single typed word or short phrase.
 *
 * `accept` holds the right answers; `also` maps other acceptable answers to a
 * note (a correct synonym the text did not use); `g` is a German noun's
 * article, checked when the learner supplies one.
 *
 * Verdicts: right · accent (right, one accent off) · also (a synonym) ·
 * gender (right noun, wrong article) · wrong.
 */
export function checkTyped(input, { accept = [], also = {}, g = null } = {}, lang = "fr") {
  const raw = normalizeAnswer(input);
  if (!raw) return { ok: false, verdict: "empty", expected: accept[0] || "" };

  const { article, bare } = splitArticle(raw, lang);
  const expected = accept[0] || "";

  const same = (a, b) => a === b;
  const loose = (a, b) => foldAccents(a) === foldAccents(b);
  const candidates = [raw, bare];

  for (const want of accept) {
    const w = normalizeAnswer(want);
    const { bare: wBare } = splitArticle(w, lang);
    const hit = candidates.some((c) => same(c, w) || same(c, wBare));
    const nearly = !hit && candidates.some((c) => loose(c, w) || loose(c, wBare));
    if (!hit && !nearly) continue;

    /* Right word, wrong article: say so. Only for German, where the article is
     * the gender, and only when the learner actually typed one. */
    if (lang === "de" && g && article && ["der", "die", "das"].includes(article) && article !== g) {
      return { ok: false, verdict: "gender", expected: `${g} ${want}`, note: `Right word — but it is « ${g} ${want} ».` };
    }
    if (hit) return { ok: true, verdict: "right", expected: want };
    return { ok: true, verdict: "accent", expected: want, note: `Mind the accents: « ${want} ».` };
  }

  for (const [alt, note] of Object.entries(also || {})) {
    const a = normalizeAnswer(alt);
    if (candidates.some((c) => loose(c, a))) return { ok: true, verdict: "also", expected, note };
  }
  return { ok: false, verdict: "wrong", expected };
}

/** A rebuilt sentence, from the chunks the learner put in order. */
export function checkOrder(chunks, accept = []) {
  const built = normalizeAnswer(chunks.join(" "));
  const ok = accept.some((a) => normalizeAnswer(a) === built);
  return { ok, built };
}

/* A key-idea alternative, matched on word boundaries so "as" does not match
 * inside "was". Longer alternatives match as a prefix, which lets a stem like
 * "metamorphos" cover metamorphosed and metamorphosis. */
function altPattern(alt) {
  const a = normalizeAnswer(alt).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}'])${a}${alt.length <= 3 ? "(?![\\p{L}])" : ""}`, "u");
}

/**
 * A translation into English, judged by its ideas.
 *
 * `key` is a list of idea groups; a group is found when any of its
 * alternatives appears. A missing group is reported back, which is the useful
 * part — "you left out *only*" teaches ne … que better than a score does.
 */
export function keyIdeas(text, key = []) {
  const norm = normalizeAnswer(text);
  const found = [];
  const missing = [];
  key.forEach((group, i) => {
    (group.some((alt) => altPattern(alt).test(norm)) ? found : missing).push(i);
  });
  return { found, missing, ok: missing.length === 0 && norm.length > 0 };
}

/**
 * A translation into the language being learned.
 *
 * An exact match with a known-good version is the only thing that counts as
 * verified. Otherwise the result carries what *could* be checked: which of the
 * required forms are missing. It never claims a sentence is wrong just
 * because it is new.
 */
export function checkInto(input, { accept = [], must = [] } = {}) {
  const norm = normalizeAnswer(input);
  if (!norm) return { ok: false, verdict: "empty", missing: [] };
  const exact = accept.some((a) => normalizeAnswer(a) === norm);
  const nearly = !exact && accept.some((a) => foldAccents(a) === foldAccents(norm));

  const words = norm.split(" ");
  const missing = must.filter((m) => {
    const alts = m.any || [];
    if (m.atEnd) return !alts.some((alt) => words[words.length - 1] === normalizeAnswer(alt));
    return !alts.some((alt) => altPattern(alt).test(norm));
  }).map((m) => m.hint);

  if (exact) return { ok: true, verdict: "right", missing: [] };
  if (nearly) return { ok: true, verdict: "accent", missing: [], note: "Right — mind the accents." };
  return { ok: false, verdict: missing.length ? "missing" : "unverified", missing };
}

/** Required patterns a free-writing task asked for and the text lacks. */
export function usesMissing(text, uses = []) {
  return uses.filter((u) => !new RegExp(u.re, "iu").test(String(text || ""))).map((u) => u.msg);
}

/** Words in a text, for the minimum-length nudge. */
export function wordCount(text) {
  return (String(text || "").match(/[\p{L}\p{M}][\p{L}\p{M}'’-]*/gu) || []).length;
}

/**
 * The gloss for a word clicked in a lesson's extract.
 *
 * The lesson's own glossary wins — it was written for *this* sentence, so it
 * can say « bornes: limits (literally a boundary stone) » where a dictionary
 * lists six senses. The elided article is stripped first so « l'utilité »
 * finds « utilité ».
 */
export function lessonGloss(glossary, word) {
  const w = String(word || "").toLowerCase().replace(/[’]/g, "'");
  if (glossary?.[w]) return glossary[w];
  const bare = w.replace(/^(l|d|j|n|s|t|c|m|qu)'/, "");
  return glossary?.[bare] || null;
}

/**
 * The same deterministic shuffle the placement test uses, so a re-render does
 * not reorder the chunk bank under the learner's cursor — and so the bank is
 * never, by bad luck, already in the right order.
 */
export function shuffleChunks(chunks, seed = 1, accept = []) {
  const out = chunks.map((t, i) => ({ t, i }));
  let s = seed || 1;
  for (let k = 0; k < 6; k += 1) {
    for (let i = out.length - 1; i > 0; i -= 1) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    const asBuilt = normalizeAnswer(out.map((c) => c.t).join(" "));
    if (!accept.some((a) => normalizeAnswer(a) === asBuilt)) return out;
  }
  return out.slice(1).concat(out.slice(0, 1));
}

/**
 * A stage's score as [right, total], and the lesson's as a whole.
 *
 * Stages with nothing graded (reading, the word list) carry no score and do
 * not dilute the total. The writing task scores its error-free sentences.
 */
export function lessonTotal(scores = {}) {
  let right = 0;
  let total = 0;
  for (const s of Object.values(scores)) {
    if (!Array.isArray(s) || !s[1]) continue;
    right += s[0];
    total += s[1];
  }
  return { right, total, share: total ? right / total : null };
}
