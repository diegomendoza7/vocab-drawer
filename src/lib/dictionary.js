/* Offline word lookup, for showing what a word in a sentence means.
 *
 * Built from three sources, because no single one covers a sentence:
 *
 *   1. The deck itself — every headword, its sentence surface form (`ba`) and
 *      any variant. This is the vocabulary being studied, so its own gloss is
 *      the most relevant answer when it applies.
 *   2. Conjugated forms, generated from the verb tables. "est" and "ist" are
 *      the two most common unresolved words in the whole corpus; generating
 *      them from `conjugate()` costs nothing and keeps them honest.
 *   3. A hand-written closed-class table. Articles, pronouns, prepositions and
 *      negation are exactly the words a learner misses, and no generator
 *      produces them.
 *
 * Deck and conjugation alone resolve 41% of the words in the example
 * sentences; the function-word table takes it to about 79%. The rest are
 * inflected content words with no entry, and they simply get no tooltip —
 * every caller must handle a miss.
 */

import { conjugate } from "../data/content.js";
import { firstSense } from "./gloss.js";

/**
 * Split a sentence into word and gap segments, keeping every character.
 *
 * Joining the words back would lose the punctuation and spacing, so gaps are
 * preserved as their own segments and the caller can render the sentence
 * verbatim while making only the words interactive.
 */
export function segmentSentence(sentence) {
  const segs = [];
  let last = 0;
  const re = /[\p{L}\p{M}][\p{L}\p{M}'’-]*/gu;
  let m;
  while ((m = re.exec(sentence))) {
    if (m.index > last) segs.push({ type: "gap", v: sentence.slice(last, m.index) });
    segs.push({ type: "word", v: m[0] });
    last = m.index + m[0].length;
  }
  if (last < sentence.length) segs.push({ type: "gap", v: sentence.slice(last) });
  return segs;
}

/** "l'eau" -> "eau", "j'ai" -> "ai". Harmless for German. */
export function stripElision(w) {
  return String(w || "").replace(/^(l|d|j|n|s|t|c|m|qu)['’]/i, "");
}

/**
 * The exact-form key: case and elision flattened, accents kept.
 *
 * Tried before the loose key, because flattening accents merges words that are
 * genuinely different — "schon" (already) and "schön" (beautiful) are one key
 * once the umlaut goes, and answering one with the other is worse than saying
 * nothing.
 */
export function exactKey(w) {
  return stripElision(w).toLowerCase().replace(/[‘’]/g, "'").trim();
}

/** The loose key: elision removed, accents and case flattened. */
export function lookupKey(w) {
  return stripElision(w)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/ß/g, "ss")
    /* Ligatures are single characters that survive NFD, so they have to be
     * spelled out before the ASCII filter runs. Stripping them instead turned
     * "sœur" into "sur" — which then answered the preposition with "sister". */
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z'-]/g, "")
    .trim();
}

/* Closed-class words, with the grammatical detail that makes them worth
 * looking up — "den" is not just "the", it is the masculine accusative, which
 * is the whole reason it was the wrong tile. */
export const FUNCTION_WORDS = {
  fr: {
    // Articles & determiners
    le: "the (masc.)", la: "the (fem.)", les: "the (plural)",
    un: "a (masc.)", une: "a (fem.)", des: "some / of the",
    du: "of the / some (masc.)", de: "of / from", a: "to / at",
    au: "to the (masc.)", aux: "to the (plural)",
    ce: "this / it", cet: "this (masc.)", cette: "this (fem.)", ces: "these",
    // Pronouns
    je: "I", tu: "you", il: "he / it", elle: "she / it", on: "one / we",
    nous: "we / us", vous: "you (plural or formal)", ils: "they (masc.)",
    elles: "they (fem.)", me: "me", te: "you", se: "himself / herself",
    lui: "him / to him", y: "there / to it", en: "of it / from there",
    qui: "who / which", que: "that / which", quoi: "what",
    quel: "which / what (masc.)", quelle: "which / what (fem.)",
    cela: "that", ca: "that", tout: "all / everything", tous: "all",
    toute: "all (fem.)", personne: "nobody / person", rien: "nothing",
    // Possessives
    mon: "my (masc.)", ma: "my (fem.)", mes: "my (plural)",
    ton: "your (masc.)", ta: "your (fem.)", tes: "your (plural)",
    son: "his / her (masc.)", sa: "his / her (fem.)", ses: "his / her (plural)",
    notre: "our", nos: "our (plural)", votre: "your", vos: "your (plural)",
    leur: "their / to them", leurs: "their (plural)",
    // Prepositions
    dans: "in", sur: "on", sous: "under", avec: "with", sans: "without",
    pour: "for", par: "by / through", entre: "between", chez: "at the home of",
    vers: "towards", depuis: "since / for", avant: "before", apres: "after",
    pendant: "during", pres: "near", contre: "against",
    // Conjunctions
    et: "and", ou: "or", mais: "but", donc: "so / therefore", car: "because",
    si: "if", comme: "as / like", quand: "when", parce: "because (parce que)",
    // Negation & adverbs
    ne: "not (first half of ne… pas)", pas: "not", plus: "more / no more",
    jamais: "never", tres: "very", bien: "well", beaucoup: "a lot",
    peu: "little", trop: "too much", aussi: "also", encore: "still / again",
    deja: "already", toujours: "always", souvent: "often", maintenant: "now",
    ici: "here", la_adv: "there", oui: "yes", non: "no", meme: "same / even",
    // Very common irregular forms that are not in the verb tables
    faut: "must / is necessary (from falloir)",
    plait: "pleases (from plaire) — s'il te plaît = please",
  },
  de: {
    // Articles & determiners
    der: "the (masc. nominative)", die: "the (fem. or plural)",
    das: "the (neuter)", den: "the (masc. accusative / plural dative)",
    dem: "the (dative)", des: "the (genitive)",
    ein: "a (masc. or neuter)", eine: "a (fem.)", einen: "a (masc. accusative)",
    einem: "a (dative)", einer: "a (fem. dative or genitive)",
    kein: "no / not a", keine: "no / not any", keinen: "no (masc. accusative)",
    dieser: "this (masc.)", diese: "this / these (fem. or plural)",
    dieses: "this (neuter)", diesen: "this (masc. accusative)",
    diesem: "this (dative)",
    // Pronouns
    ich: "I", du: "you", er: "he", sie: "she / they / you (formal)", es: "it",
    wir: "we", ihr: "you (plural) / her / their", mich: "me (accusative)",
    mir: "me (dative)", dich: "you (accusative)", dir: "you (dative)",
    uns: "us", euch: "you (plural)", ihn: "him (accusative)",
    ihm: "him / it (dative)", ihnen: "them (dative)",
    sich: "himself / herself / themselves", man: "one / people / you",
    was: "what", wer: "who", wo: "where", wie: "how / like",
    warum: "why", wann: "when",
    // Possessives
    mein: "my", meine: "my (fem. or plural)", meinen: "my (masc. accusative)",
    meinem: "my (dative)", dein: "your", deine: "your (fem. or plural)",
    sein: "his / its", seine: "his / its (fem. or plural)",
    unser: "our", unsere: "our (fem. or plural)", ihre: "her / their",
    // Prepositions
    in: "in", auf: "on", an: "at / on", im: "in the", am: "at the / on the",
    ins: "into the", zu: "to", zum: "to the (masc./neuter)", zur: "to the (fem.)",
    mit: "with", von: "from / of", nach: "after / to", bei: "at / with",
    fur: "for", uber: "over / about", unter: "under",
    vor: "before / in front of", hinter: "behind", zwischen: "between",
    seit: "since / for", ohne: "without", gegen: "against",
    durch: "through", um: "around / at",
    // Conjunctions
    und: "and", oder: "or", aber: "but", denn: "because", weil: "because",
    dass: "that", wenn: "if / when", als: "when / than", ob: "whether",
    // Negation & adverbs
    nicht: "not", nichts: "nothing", niemand: "nobody", sehr: "very",
    viel: "much / a lot", mehr: "more", noch: "still / yet", schon: "already",
    immer: "always", oft: "often", jetzt: "now", hier: "here", dort: "there",
    heute: "today", morgen: "tomorrow / morning", gestern: "yesterday",
    auch: "also", nur: "only", wieder: "again", bald: "soon",
    alles: "everything", alle: "all", etwas: "something", gern: "gladly",
    anders: "differently", weiter: "further / onward",
  },
};

/* `la` is both the article and the adverb "there"; the article is far more
 * common, so the adverb is filed under a key no word produces and merged into
 * the article's gloss instead. */
delete FUNCTION_WORDS.fr.la_adv;
FUNCTION_WORDS.fr.la = "the (fem.) / there";

/**
 * Build the lookup table for a language.
 *
 * `data` is the DATA map, `verbs` the verb tables to conjugate, `tenses` the
 * tense list. Returns a Map from `lookupKey` to {lemma, gloss, kind}.
 */
export function buildDictionary(lang, data, verbs = [], tenses = []) {
  const loose = new Map();
  const exact = new Map();
  const add = (form, entry) => {
    const k = lookupKey(form);
    if (!k) return;
    if (!loose.has(k)) loose.set(k, entry);
    const e = exactKey(form);
    if (e && !exact.has(e)) exact.set(e, entry);
  };

  // 1. The deck.
  for (const level of Object.keys(data[lang] || {}))
    for (const drawer of data[lang][level] || [])
      for (const w of drawer.words) {
        const entry = { lemma: w.t, gloss: w.e, kind: "word", gender: w.g || null };
        add(w.t, entry);
        if (w.ba) add(w.ba, entry);
        if (w.alt) add(w.alt, entry);
      }

  // 2. Conjugated forms of the verb tables.
  for (const verb of verbs)
    for (const t of tenses)
      for (const form of conjugate(lang, verb, t.key).filter(Boolean))
        for (const tok of String(form).split(/\s+/))
          add(tok, {
            lemma: verb.inf,
            gloss: `${verb.en} — ${t.label.toLowerCase()}`,
            kind: "verb",
          });

  // 3. Function words, last, so a deck entry always wins.
  for (const [form, gloss] of Object.entries(FUNCTION_WORDS[lang] || {}))
    add(form, { lemma: form, gloss, kind: "function" });

  return { loose, exact, size: loose.size };
}

/** Look one word up. Returns null when nothing fits — callers must handle it. */
export function lookup(dict, word) {
  if (!dict || !word) return null;
  return dict.exact.get(exactKey(word)) || dict.loose.get(lookupKey(word)) || null;
}

/* Endings that regularly stand between a running-text word and the lemma the
 * deck stores. Not morphology — just enough to stop "jolie" being reported as
 * a word you have never met when "joli" is in your deck. Longest first, so
 * "petites" reduces past "petite" rather than stopping at it. */
const REDUCTIONS = {
  fr: ["es", "s", "e"],
  de: ["en", "es", "er", "em", "e", "n", "s"],
};

/**
 * Look a word up, trying the obvious inflected-to-lemma reductions.
 *
 * `lookup` is deliberately exact: it backs the hover glosses, where answering
 * a word with a different word is worse than saying nothing. This one is for
 * the opposite question — "is this word new to me?" — where a false "new" is
 * the expensive answer, because it puts words you already know into your
 * import list.
 */
export function lookupInflected(dict, word, lang = "fr") {
  const direct = lookup(dict, word);
  if (direct) return direct;
  const bare = stripElision(String(word || ""));
  for (const end of REDUCTIONS[lang] || []) {
    if (bare.length <= end.length + 2 || !bare.toLowerCase().endsWith(end)) continue;
    const stem = bare.slice(0, -end.length);
    const hit = lookup(dict, stem);
    if (hit) return hit;
    /* French doubles the final consonant before the feminine -e: bon → bonne,
     * gros → grosse. Undoing that is the difference between finding "bon" and
     * offering to import a word already in the deck. */
    if (lang === "fr" && /(.)\1$/.test(stem)) {
      const undoubled = lookup(dict, stem.slice(0, -1));
      if (undoubled) return undoubled;
    }
  }
  return null;
}

/** A one-line description suitable for a tooltip, or null. */
export function describe(dict, word) {
  const hit = lookup(dict, word);
  if (!hit) return null;
  const head = hit.gender ? `${hit.gender} ${hit.lemma}` : hit.lemma;
  const sense = hit.kind === "word" ? firstSense(hit.gloss) || hit.gloss : hit.gloss;
  // Don't repeat the word back at the reader when the lemma is the word itself.
  return lookupKey(head) === lookupKey(word) && hit.kind === "function"
    ? sense
    : `${head} — ${sense}`;
}
