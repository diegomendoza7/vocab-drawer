/* Local measures for a written answer — everything a check can say without
 * the network: did it answer the question, is it a sentence, how much of it
 * was lifted from the passage, and what its vocabulary looks like.
 *
 * Grammar is the headline score (grammar.js); these sit beside it. The
 * vocabulary profile in particular is secondary by design — a learner who
 * reaches for rare words and gets them wrong has not written better than one
 * who used plain words correctly, and a score that said otherwise would push
 * towards exactly the wrong habit.
 */

/** Case, accents, ß and ligatures flattened — for matching, never for display. */
export function fold(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/ß/g, "ss")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const WORD = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;

/** The words of a text with their offsets. "l'homme" and "peut-être" are one word each. */
export function wordsIn(text) {
  return [...String(text || "").matchAll(WORD)].map((m) => ({ w: m[0], start: m.index, end: m.index + m[0].length }));
}

/* The frequency list splits French elision the way subtitles are tokenised:
 * "l'" and "homme" are separate entries. "aujourd'hui" is one word, and is
 * not matched here because "aujourd" is not an elided clitic. */
const ELISION = /^(l|d|j|n|s|t|c|m|qu|jusqu|lorsqu|puisqu|quelqu)'(.+)$/;

/** Word forms as the frequency list spells them: lower case, elision split off. */
export function lexicalForms(text, lang) {
  const out = [];
  for (const { w, start, end } of wordsIn(text)) {
    const lo = w.toLowerCase().replace(/’/g, "'");
    const m = lang === "fr" ? lo.match(ELISION) : null;
    if (m) {
      const cut = start + m[1].length + 1;
      out.push({ form: `${m[1]}'`, start, end: cut });
      out.push({ form: m[2], start: cut, end });
    } else {
      out.push({ form: lo, start, end });
    }
  }
  return out;
}

const spaced = (s) => ` ${fold(s).replace(/[^a-z0-9]+/g, " ").trim()} `;

/**
 * Which of a question's key ideas an answer contains.
 *
 * `groups` is a list of alternatives per idea: [["retard", "tard"], ["neige"]].
 * An alternative of four letters or more matches the start of a word, so
 * "retard" finds "retardé" and "Schul" finds "Schule"; shorter ones must be
 * the whole word, or "mer" would be found in "merci".
 *
 * This checks content, not truth — "le train n'était pas en retard" still
 * contains the idea. It is a prompt to look at the model answer, not a grade.
 */
export function keyIdeas(answer, groups = []) {
  const hay = spaced(answer);
  const found = [];
  const missing = [];
  groups.forEach((variants, i) => {
    const hit = variants.some((v) => {
      const needle = spaced(v).trim();
      if (!needle) return false;
      return needle.length >= 4 ? hay.includes(` ${needle}`) : hay.includes(` ${needle} `);
    });
    (hit ? found : missing).push(i);
  });
  return { found, missing, total: groups.length };
}

/** A copied run this long is copying, not answering. */
export const COPY_LIMIT = 8;

/** The longest run of consecutive words the answer shares with the source. */
export function copiedStretch(answer, source) {
  const a = wordsIn(answer);
  const af = a.map((x) => fold(x.w));
  const bf = wordsIn(source).map((x) => fold(x.w));
  let best = 0;
  let end = 0;
  let prev = new Array(bf.length + 1).fill(0);
  for (let i = 1; i <= af.length; i += 1) {
    const cur = new Array(bf.length + 1).fill(0);
    for (let j = 1; j <= bf.length; j += 1) {
      if (af[i - 1] !== bf[j - 1]) continue;
      cur[j] = prev[j - 1] + 1;
      if (cur[j] > best) { best = cur[j]; end = i; }
    }
    prev = cur;
  }
  return best ? { words: best, text: answer.slice(a[end - best].start, a[end - 1].end) } : { words: 0, text: "" };
}

/**
 * Whether an answer has the shape of a sentence. Only `short` withholds the
 * full-sentence credit; a missing capital or full stop is pointed out but is
 * orthography, and LanguageTool reports it with the other tips.
 */
export function sentenceShape(text, minWords = 4) {
  const t = String(text || "").trim();
  const n = wordsIn(t).length;
  return {
    words: n,
    short: n < minWords,
    capital: /^[\p{Lu}\d«"„“]/u.test(t),
    ends: /[.!?…]["»“”)]?$/.test(t),
  };
}

/* Frequency bands, after Laufer & Nation's Lexical Frequency Profile (1995):
 * the share of a text's words that fall beyond the most common 2,000 is the
 * part of vocabulary that grows with proficiency. */
export const BANDS = [
  { key: "k1", upTo: 1000, label: "top 1,000" },
  { key: "k2", upTo: 2000, label: "1,001–2,000" },
  { key: "k5", upTo: 5000, label: "2,001–5,000" },
  { key: "k10", upTo: 10000, label: "5,001–10,000" },
  { key: "off", upTo: Infinity, label: "beyond 10,000" },
];

/** A form's frequency rank, trying the parts of a hyphenated word. */
export function rankOf(form, ranks) {
  if (!ranks) return undefined;
  const r = ranks.get(form);
  if (r) return r;
  if (form.includes("-")) {
    const parts = form.split("-").filter(Boolean).map((p) => ranks.get(p));
    if (parts.length && parts.every(Boolean)) return Math.max(...parts);
  }
  return undefined;
}

/**
 * The vocabulary of a piece of writing.
 *
 *   ranks      Map form → rank, from loadRanks
 *   knownLemma form → the deck headword it belongs to, or null
 *   skip       (start, end) → true for spans to leave out — misspellings,
 *              which would otherwise count as rare words
 */
export function vocabProfile(text, lang, { ranks, knownLemma, skip } = {}) {
  const bands = { k1: 0, k2: 0, k5: 0, k10: 0, off: 0 };
  const types = new Set();
  const beyond = new Map();
  const drawer = new Set();
  let tokens = 0;
  for (const t of lexicalForms(text, lang)) {
    if (skip && skip(t.start, t.end)) continue;
    if (t.form.length < 2 && !/^[aày]$/.test(t.form)) continue;
    tokens += 1;
    types.add(t.form);
    const r = rankOf(t.form, ranks);
    const band = BANDS.find((b) => (r || Infinity) <= b.upTo);
    bands[band.key] += 1;
    if (!r || r > 2000) beyond.set(t.form, r || null);
    const lemma = knownLemma?.(t.form);
    if (lemma) drawer.add(lemma);
  }
  return {
    tokens,
    types: types.size,
    bands,
    beyond2k: tokens ? (bands.k5 + bands.k10 + bands.off) / tokens : 0,
    beyondWords: [...beyond.entries()].sort((a, b) => (b[1] || Infinity) - (a[1] || Infinity)).map(([w]) => w),
    drawerWords: [...drawer],
  };
}

const RANKS = {};

/** The frequency list for a language, loaded on first use. */
export async function loadRanks(lang) {
  if (RANKS[lang]) return RANKS[lang];
  const mod = lang === "de" ? await import("../data/freq/de.js") : await import("../data/freq/fr.js");
  const map = new Map();
  mod.WORDS.split("\n").forEach((w, i) => { if (w && !map.has(w)) map.set(w, i + 1); });
  RANKS[lang] = map;
  return map;
}

/** Totals over a sitting's answers, for the end-of-passage card. */
export function summarize(entries) {
  let sentences = 0, errorFree = 0, found = 0, total = 0, words = 0;
  for (const e of entries || []) {
    if (!e) continue;
    sentences += e.score?.sentences || 0;
    errorFree += e.score?.errorFree || 0;
    words += e.score?.words || 0;
    found += e.ideas?.found?.length || 0;
    total += e.ideas?.total || 0;
  }
  return { sentences, errorFree, accuracy: sentences ? Math.round((errorFree / sentences) * 100) : null, found, total, words };
}
