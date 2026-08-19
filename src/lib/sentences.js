/* The sentence-construction engine.
 *
 * Builds a translate-this-sentence item deterministically from parts the app
 * already has: a verb from the conjugation tables, a noun from a vocabulary
 * drawer, and a tense. Nothing is generated at runtime and nothing is fetched,
 * so a sentence is always grammatical and always in the tense that was asked
 * for — which matters more here than anywhere else in the app, because the
 * word order *is* the answer key. A subtly wrong sentence would teach the
 * mistake rather than catch it.
 *
 * The pattern set is deliberately small:
 *   plain     Ich esse das Brot.          — subject, verb, object
 *   fronted   Heute esse ich das Brot.    — a time phrase in the front field
 *
 * The fronted pattern exists for German, where filling the front field forces
 * the subject after the finite verb. That inversion is the single hardest
 * habit for English speakers and tiles teach it well, because getting it wrong
 * leaves a tile stranded.
 */

import {
  FR_IMPF_ENDINGS, FR_FUT_ENDINGS, FR_AUX, DE_AUX, DE_WERDEN,
  conjugateEnglish,
} from "../data/content.js";
import { firstSense } from "./gloss.js";

/* Subjects usable in a sentence. The drills show "il/elle" as one pronoun
 * tile; a sentence has to pick one, and its English has to agree. `p` is the
 * person index into the conjugation tables. */
export const SUBJECTS = {
  fr: [
    { tok: "je", p: 0, en: "I" }, { tok: "tu", p: 1, en: "you" },
    { tok: "il", p: 2, en: "he" }, { tok: "elle", p: 2, en: "she" },
    { tok: "nous", p: 3, en: "we" }, { tok: "vous", p: 4, en: "you" },
    { tok: "ils", p: 5, en: "they" },
  ],
  de: [
    { tok: "ich", p: 0, en: "I" }, { tok: "du", p: 1, en: "you" },
    { tok: "er", p: 2, en: "he" }, { tok: "sie", p: 2, en: "she" },
    { tok: "wir", p: 3, en: "we" }, { tok: "ihr", p: 4, en: "you" },
    { tok: "sie", p: 5, en: "they" },
  ],
};

/* Time phrases for the fronted pattern.
 *
 * Each names the tenses it can appear with. "Tomorrow he saw the bathroom" is
 * a grammatical sentence and a wrong one, so a phrase is only offered for
 * tenses whose time reference it matches. Every tense keeps at least one.
 */
export const TIME_PHRASES = {
  fr: [
    { tok: "aujourd'hui", en: "today", tenses: ["present", "passe", "futur"] },
    { tok: "demain", en: "tomorrow", tenses: ["futur", "present"] },
    { tok: "maintenant", en: "now", tenses: ["present"] },
    { tok: "hier", en: "yesterday", tenses: ["passe", "imparfait"] },
    { tok: "souvent", en: "often", tenses: ["present", "imparfait"] },
  ],
  de: [
    { tok: "heute", en: "today", tenses: ["praesens", "perfekt", "futur"] },
    { tok: "morgen", en: "tomorrow", tenses: ["futur", "praesens"] },
    { tok: "jetzt", en: "now", tenses: ["praesens"] },
    { tok: "gestern", en: "yesterday", tenses: ["praeteritum", "perfekt"] },
    { tok: "oft", en: "often", tenses: ["praesens", "praeteritum"] },
  ],
};

/** The time phrases that make sense in a given tense. */
export function timePhrasesFor(lang, tenseKey) {
  return TIME_PHRASES[lang].filter((t) => t.tenses.includes(tenseKey));
}

/** German definite article in the accusative — the case a direct object takes. */
const DE_ACC = { der: "den", die: "die", das: "das" };

/* French elides its article and `je` before a vowel. The list of words that
 * begin with an aspirated h (le héros, not l'héros) is short and none of them
 * are in the deck, so a leading h counts as mute. */
const VOWEL = /^[aeiouyàâäéèêëîïôöùûüh]/i;

/**
 * Article + noun, as tiles.
 *
 * Two tiles normally, so that choosing "le" over "la" is part of the exercise.
 * Elision genuinely fuses the two into one word — "l'oiseau" — and a tile that
 * could be split at the apostrophe would be a lie about the language.
 */
function articleTiles(article, word) {
  return VOWEL.test(word) ? [`${article.slice(0, -1)}'${word}`] : [article, word];
}

/**
 * Which drawers a verb can take its object from.
 *
 * Grammar alone is not enough here. The engine will happily build "Ihr habt
 * den Regen gegessen" — flawless German, and a sentence no one should learn.
 * A verb is offered only if it appears below, and its object may only come
 * from the drawers listed, so `essen` eats food and `sehen` sees things that
 * can be seen. The drawer names are identical in both languages, so one table
 * serves French and German.
 *
 * The B1/B2 drawers are abstract nouns and are left out on purpose: the point
 * of the refresher list is concrete vocabulary — an animal, a food, an object.
 *
 * A few verbs name their objects outright instead of taking a whole drawer.
 * That is not fussiness: "faire" glosses as "to do", so the English prompt for
 * "faire le café" would read "do the coffee", and a prompt the learner cannot
 * translate back is worse than one verb fewer.
 */
const OBJECT_TOPICS = {
  fr: {
    avoir:   { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    vendre:  { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    vouloir: { topics: ["Animals", "Food & Drink", "Home & Objects", "Travel & Transport"] },
    prendre: { topics: ["Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    voir:    { topics: ["Family & People", "Animals", "Home & Objects", "Directions & Home", "Travel & Transport", "Weather"], animate: true, place: true },
    /* "faire" and "finir" are the two whose sense depends on the individual
     * noun rather than the drawer — "faire la cuisine" is idiomatic, "faire le
     * bureau" is not — so they name their objects outright. */
    faire:   { words: ["travail", "tâche"] },
    finir:   { words: ["travail", "tâche", "pain", "café"] },
  },
  de: {
    haben:   { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    geben:   { words: ["Buch", "Brot", "Milch", "Kaffee", "Apfel", "Käse", "Ei", "Geld", "Fahrkarte"] },
    nehmen:  { topics: ["Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    wollen:  { topics: ["Animals", "Food & Drink", "Home & Objects", "Travel & Transport"] },
    sehen:   { topics: ["Family & People", "Animals", "Home & Objects", "Directions & Home", "Travel & Transport", "Weather"], animate: true, place: true },
    essen:   { topics: ["Food & Drink"] },
    machen:  { words: ["Arbeit", "Aufgabe"] },
  },
};

/* People, wherever they are filed. Only a verb marked `animate` may take one
 * as its object: you can see a colleague, but "I sell the colleague" is not a
 * sentence to put in front of a learner. Animals are deliberately not here —
 * having, wanting and selling them are all ordinary. */
const ANIMATE_TOPICS = new Set(["Family & People"]);
const ANIMATE_WORDS = new Set(["collègue", "patron", "employeur", "médecin", "patient", "Kollege", "Chef", "Arbeitgeber", "Arzt", "Patient"]);

function isAnimate(topic, word) {
  return ANIMATE_TOPICS.has(topic) || ANIMATE_WORDS.has(word.t);
}

/* Buildings and locations, which sit in drawers that are otherwise full of
 * ownable things — a station and a suitcase are both "Travel & Transport".
 * You can see a station; you cannot have one, and "They have the airport" is
 * the kind of sentence that makes a learner distrust the whole exercise. */
const PLACE_WORDS = new Set([
  "école", "gare", "aéroport", "magasin", "marché", "caisse",
  "Schule", "Bahnhof", "Flughafen", "Geschäft", "Markt", "Kasse",
]);

function isPlace(word) {
  return PLACE_WORDS.has(word.t);
}

/** The drawers this verb may take an object from, or null if it takes none. */
export function objectTopicsFor(lang, verb) {
  return OBJECT_TOPICS[lang]?.[verb.inf] || null;
}

/** The verbs the section can build sentences with, in table order. */
export function usableVerbs(lang, verbs) {
  return verbs.filter((v) => objectTopicsFor(lang, v));
}

/** A noun the engine can build an object phrase from. */
export function isUsableNoun(lang, word) {
  if (!word || !word.t) return false;
  if (lang === "de") return !!word.g;
  return !!word.gen || !!word.art;
}

/**
 * Every noun a given verb may take, as {topic, word} pairs.
 *
 * `data` is the DATA map; only A1 and A2 are drawn on, which is where the
 * concrete vocabulary lives.
 */
export function nounPoolFor(lang, verb, data, levels = ["A1", "A2"]) {
  const rule = objectTopicsFor(lang, verb);
  if (!rule) return [];
  const out = [];
  for (const lvl of levels)
    for (const drawer of data[lang][lvl] || [])
      for (const w of drawer.words) {
        if (!isUsableNoun(lang, w)) continue;
        const allowed = rule.words ? rule.words.includes(w.t) : rule.topics.includes(drawer.topic);
        if (!allowed) continue;
        if (isAnimate(drawer.topic, w) && !rule.animate) continue;
        if (isPlace(w) && !rule.place) continue;
        out.push({ topic: drawer.topic, word: w });
      }
  return out;
}

/** The finite verb, and any part of it that must go to the end of the clause. */
function verbParts(lang, verb, tenseKey, p) {
  if (lang === "fr") {
    switch (tenseKey) {
      case "imparfait": return { finite: verb.impf + FR_IMPF_ENDINGS[p], tail: [] };
      case "futur": return { finite: verb.fut + FR_FUT_ENDINGS[p], tail: [] };
      /* French puts the participle straight after the auxiliary, so it is not
       * a clause-final element the way the German one is. */
      case "passe": return { finite: FR_AUX[verb.aux][p], after: verb.pp, tail: [] };
      default: return { finite: verb.pres[p], tail: [] };
    }
  }
  switch (tenseKey) {
    case "praeteritum": return { finite: verb.past[p], tail: [] };
    case "perfekt": return { finite: DE_AUX[verb.aux][p], tail: [verb.pp] };
    case "futur": return { finite: DE_WERDEN[p], tail: [verb.inf] };
    default: return { finite: verb.pres[p], tail: [] };
  }
}

/* Weak masculine nouns take -n or -en in every case but the nominative, so the
 * accusative of `der Kollege` is `den Kollegen`. There is no marker for this in
 * the data and the rule cannot be inferred from the form — `der Käse` is not
 * weak — so the ones that occur in the object drawers are named here. */
const DE_WEAK = new Set(["Hase", "Kollege", "Patient", "Mensch", "Junge", "Kunde", "Nachbar", "Student"]);

function accusative(noun) {
  if (noun.g !== "der" || !DE_WEAK.has(noun.t)) return noun.t;
  return noun.t.endsWith("e") ? `${noun.t}n` : `${noun.t}en`;
}

/** The object phrase, as tiles. */
function objectTiles(lang, noun) {
  if (lang === "de") return [DE_ACC[noun.g] || "das", accusative(noun)];
  const article = (noun.gen || (noun.art === "une" || noun.art === "la" ? "f" : "m")) === "f" ? "la" : "le";
  return articleTiles(article, noun.t);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Build one item.
 *
 * Returns the canonical token order plus any other order that is equally
 * correct — German allows the object in the front field just as readily as the
 * time phrase, and rejecting a learner's grammatical sentence because it
 * wasn't the one we happened to generate teaches nothing.
 */
export function buildSentence({ lang, verb, tenseKey, subject, noun, time = null }) {
  const p = subject.p;
  const { finite, after, tail } = verbParts(lang, verb, tenseKey, p);
  const obj = objectTiles(lang, noun);
  const post = verb.post ? [verb.post] : [];

  /* Tiles carry no sentence-initial capital. Baking one into the first token
   * strands it when the learner legitimately reorders — "die Fahrkarte hat sie
   * Heute gehabt" — so the capital is applied where it belongs, to whichever
   * tile ends up first. German nouns keep the capital they have in the data. */
  let tokens;
  let alternates = [];

  if (lang === "de") {
    if (time) {
      // Front field filled -> finite verb second, subject third.
      tokens = [time.tok, finite, subject.tok, ...obj, ...post, ...tail];
      // The object may take the front field instead; the verb stays second.
      alternates.push([...obj, finite, subject.tok, time.tok, ...post, ...tail]);
      alternates.push([subject.tok, finite, time.tok, ...obj, ...post, ...tail]);
    } else {
      tokens = [subject.tok, finite, ...obj, ...post, ...tail];
      alternates.push([...obj, finite, subject.tok, ...post, ...tail]);
    }
  } else {
    const head = subject.tok === "je" && VOWEL.test(finite) ? `j'${finite}` : null;
    const core = head
      ? [head, ...(after ? [after] : [])]
      : [subject.tok, finite, ...(after ? [after] : [])];
    tokens = time ? [time.tok, ...core, ...obj, ...post] : [...core, ...obj, ...post];
    if (time) alternates.push([...core, ...obj, ...post, time.tok]);
  }

  const english = englishFor({ lang, verb, tenseKey, subject, noun, time });
  return {
    tokens,
    display: capitalize(tokens.join(" ")) + ".",
    english,
    alternates,
    verb,
    noun,
    tenseKey,
  };
}

/* Tenses whose English is a present perfect — "I have eaten". */
const PERFECT_TENSES = new Set(["passe", "perfekt"]);
/* Adverbs that pin the event to finished past time. */
const PAST_ADVERBS = new Set(["hier", "gestern"]);

function englishFor({ lang, verb, tenseKey, subject, noun, time }) {
  /* French and German use the perfect where English cannot: "hier tu as fait"
   * is right, but "yesterday you have done" is not — English demands the
   * simple past once the time is fixed. The prompt has to be natural English,
   * so it switches; the target sentence is unaffected. */
  const enTense = time && PAST_ADVERBS.has(time.tok) && PERFECT_TENSES.has(tenseKey) ? "praeteritum" : tenseKey;
  const phrase = conjugateEnglish(lang, verb, enTense, subject.p, subject.en);
  const object = `the ${firstSense(noun.e)}`;
  const body = `${phrase} ${object}`;
  const s = time ? `${capitalize(time.en)} ${body}` : capitalize(body);
  return s + ".";
}
