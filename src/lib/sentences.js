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
/* What each verb may take as its object.
 *
 * `topics` is a broad net cast over whole drawers; `words` is a curated list of
 * headwords. A rule may carry both, and the pool is the union — which is how a
 * verb like `finir` gets every food in the deck *plus* the handful of work
 * nouns that also make sense.
 *
 * The lists matter more than they look. The object phrase is always a definite
 * article plus the noun, so a word only belongs here if "faire **le** X" is
 * something a French speaker says: `faire le lit` yes, `faire le progrès` no —
 * that one needs a plural. Every entry below was chosen against that test.
 */
const OBJECT_TOPICS = {
  fr: {
    avoir:   { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    vendre:  { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    vouloir: { topics: ["Animals", "Food & Drink", "Home & Objects", "Travel & Transport"] },
    prendre: { topics: ["Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    voir:    { topics: ["Family & People", "Animals", "Home & Objects", "Directions & Home", "Travel & Transport", "Weather"], animate: true, place: true },
    /* faire is fussy about its object but takes a lot of them once you go
     * looking: half of these are set phrases a learner needs anyway. */
    /* An entry may be [headword, englishVerb]. faire is glossed "to do / make"
     * and the generator takes the first sense, so without this every object
     * gets "done" — and "we have done the bed" is not English. The French is
     * one verb; the English is several, and the object decides which. */
    faire:   { words: ["travail", "tâche", "formation",
                       ["lit", "to make"], ["valise", "to pack"], ["café", "to make"],
                       ["pain", "to make"], ["jardin", "to do"], ["réunion", "to hold"],
                       ["pause", "to take"], ["réforme", "to carry out"]] },
    /* `cuisine` is deliberately absent: "faire la cuisine" is to do the
     * *cooking*, and the noun's own gloss is "kitchen", so the prompt would
     * read "we have done the kitchen". An idiom the object gloss cannot carry
     * is better left out than mistranslated. */
    finir:   { topics: ["Food & Drink"],
               words: ["travail", "tâche", "livre", "réunion", "formation", "recherche"] },
  },
  de: {
    haben:   { topics: ["Animals", "Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    geben:   { topics: ["Food & Drink"],
               words: ["Buch", "Geld", "Fahrkarte", "Reisepass", "Koffer", "Adresse"] },
    nehmen:  { topics: ["Food & Drink", "Home & Objects", "Shopping & Money", "Travel & Transport"] },
    wollen:  { topics: ["Animals", "Food & Drink", "Home & Objects", "Travel & Transport"] },
    sehen:   { topics: ["Family & People", "Animals", "Home & Objects", "Directions & Home", "Travel & Transport", "Weather"], animate: true, place: true },
    /* Drinks are in the Food & Drink drawer and you cannot eat them. */
    essen:   { topics: ["Food & Drink"], drink: false },
    machen:  { words: ["Arbeit", "Aufgabe", "Ausbildung",
                       ["Bett", "to make"], ["Kaffee", "to make"], ["Reise", "to take"],
                       ["Erfahrung", "to have"], ["Besprechung", "to hold"],
                       ["Pause", "to take"], ["Reform", "to carry out"]] },
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

/* Drinks, which share the Food & Drink drawer with things you chew. Most verbs
 * do not care — you can have, want, sell or finish a coffee — so unlike the
 * animate and place rules this one is opt-*out*, and only eating verbs set it.
 * Without it the engine happily built "Ich esse das Wasser". */
const DRINK_WORDS = new Set(["eau", "café", "Wasser", "Milch", "Kaffee"]);

function isDrink(word) {
  return DRINK_WORDS.has(word.t);
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
  /* A `topics` rule is a broad net and needs the level gate to stay concrete.
   * A `words` rule is already curated one headword at a time, so gating it by
   * level would only hide entries that were chosen deliberately — which is why
   * every level is searched for those. */
  /* Entries are a headword, or [headword, englishVerb]. */
  const wordOf = (e) => (Array.isArray(e) ? e[0] : e);
  const enVerbFor = (t) => {
    const hit = (rule.words || []).find((e) => wordOf(e) === t);
    return Array.isArray(hit) ? hit[1] : null;
  };
  const wordList = (rule.words || []).map(wordOf);
  const wordLevels = rule.words ? Object.keys(data[lang]) : levels;
  const seen = new Set();
  const out = [];
  for (const lvl of new Set([...levels, ...wordLevels]))
    for (const drawer of data[lang][lvl] || [])
      for (const w of drawer.words) {
        if (!isUsableNoun(lang, w)) continue;
        const byWord = wordList.includes(w.t);
        const byTopic = levels.includes(lvl) && (rule.topics?.includes(drawer.topic) ?? false);
        if (!byWord && !byTopic) continue;
        if (isAnimate(drawer.topic, w) && !rule.animate) continue;
        if (isPlace(w) && !rule.place) continue;
        /* Only an explicit `drink: false` excludes them; see DRINK_WORDS. */
        if (isDrink(w) && rule.drink === false) continue;
        if (seen.has(w.t)) continue;
        seen.add(w.t);
        out.push({ topic: drawer.topic, word: w, enVerb: enVerbFor(w.t) });
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

/* Grammatical gender, spelled out — the whole reason a tile was the wrong one. */
const DE_GENDER_NAME = { der: "masculine", die: "feminine", das: "neuter" };

/**
 * The object phrase, as tiles carrying their own explanation.
 *
 * Two tiles normally, so that choosing "le" over "la" is part of the exercise.
 * Elision genuinely fuses the two into one word — "l'oiseau" — and a tile that
 * could be split at the apostrophe would be a lie about the language.
 */
function objectTiles(lang, noun) {
  const sense = firstSense(noun.e) || noun.e;
  if (lang === "de") {
    const art = DE_ACC[noun.g] || "das";
    const gender = DE_GENDER_NAME[noun.g] || "neuter";
    const surface = accusative(noun);
    return [
      { tok: art, gloss: `"the" — ${gender} accusative, because it is the object` },
      {
        tok: surface,
        gloss: surface === noun.t
          ? `${noun.g} ${noun.t} — ${sense}`
          : `${noun.g} ${noun.t} — ${sense} (weak noun: takes -${surface.slice(noun.t.length)} outside the nominative)`,
      },
    ];
  }
  const fem = (noun.gen || (noun.art === "une" || noun.art === "la" ? "f" : "m")) === "f";
  const article = fem ? "la" : "le";
  if (VOWEL.test(noun.t)) {
    return [{
      tok: `${article.slice(0, -1)}'${noun.t}`,
      gloss: `${article} + ${noun.t} — the ${sense}; the article elides before a vowel`,
    }];
  }
  return [
    { tok: article, gloss: `"the" — ${fem ? "feminine" : "masculine"}` },
    { tok: noun.t, gloss: `${article} ${noun.t} — ${sense}` },
  ];
}

/* Tenses built with an auxiliary plus a non-finite form. */
const PERFECT_TENSES = new Set(["passe", "perfekt"]);

/* ---------------------------------------------------------------------- */
/* Difficulty                                                              */
/* ---------------------------------------------------------------------- */

/**
 * The ladder, easiest first.
 *
 * These are not arbitrary tiers of "more words". Each one is a specific thing
 * word order does, chosen because tiles teach it better than a rule does — and
 * because in three of the five, French and German behave *differently*, which
 * is the whole reason to drag the pieces around rather than read about them:
 *
 *   plain        the neutral order, so everything after has a baseline
 *   time         a filled front field, which in German pushes the subject
 *                after the verb and in French does not
 *   negative     French wraps the verb in ne … pas; German puts nicht at the end
 *   modal        German sends the infinitive to the end of the clause; French
 *                keeps it next to the modal
 *   subordinate  German sends the *finite* verb to the end; French does not move
 */
export const SENTENCE_SHAPES = [
  { id: "plain", label: "Simple", blurb: "Subject, verb, object. The neutral order." },
  { id: "time", label: "Time first", blurb: "A time phrase in front — which moves the German subject behind the verb." },
  { id: "negative", label: "Negative", blurb: "French wraps the verb in ne … pas; German puts nicht at the end." },
  { id: "modal", label: "With a modal", blurb: "want / can / must — and German throws the second verb to the end." },
  { id: "subordinate", label: "Two clauses", blurb: "A that-clause, where German sends the verb right to the end." },
];

/** One main clause to hang a two-clause sentence off. */
export function pickOpener(lang, i = 0) {
  const list = OPENERS[lang] || [];
  return list.length ? list[((i % list.length) + list.length) % list.length] : null;
}

/** A modal, already conjugated for this subject. */
export function pickModal(lang, verbs, personIdx, i = 0) {
  const infs = MODAL_INFS[lang] || [];
  const usable = infs.map((inf) => verbs.find((v) => v.inf === inf)).filter(Boolean);
  if (!usable.length) return null;
  const v = usable[((i % usable.length) + usable.length) % usable.length];
  return { inf: v.inf, en: firstSense(v.en) || v.en, form: v.pres[personIdx] };
}

export function shapeInfo(id) {
  return SENTENCE_SHAPES.find((x) => x.id === id) || SENTENCE_SHAPES[0];
}

/** The modal verbs each language can build a level-4 sentence with. */
export const MODAL_INFS = { fr: ["vouloir", "pouvoir", "devoir"], de: ["wollen", "können", "müssen"] };

/* The main clause a two-clause sentence hangs off. Kept to verbs of thinking
 * so the subordinate clause is a statement rather than a question or a command,
 * which would change its word order again. */
const OPENERS = {
  fr: [
    { subj: "je", p: 0, en: "I think", verb: "pense", inf: "penser" },
    { subj: "je", p: 0, en: "I believe", verb: "crois", inf: "croire" },
  ],
  de: [
    { subj: "ich", p: 0, en: "I think", verb: "denke", inf: "denken" },
    { subj: "ich", p: 0, en: "I believe", verb: "glaube", inf: "glauben" },
  ],
};

/* How to name a tense in a tooltip. */
const TENSE_NOTE = {
  present: "present", praesens: "present",
  imparfait: "imperfect", praeteritum: "simple past",
  passe: "perfect", perfekt: "perfect",
  futur: "future",
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------------------------------------------------------------- */
/* The harder shapes                                                       */
/* ---------------------------------------------------------------------- */

/**
 * Negation, which the two languages do in genuinely different places.
 *
 * French clamps the verb between two words — `ne … pas` — and in a compound
 * tense it is the *auxiliary* that gets clamped, not the participle: "je n'ai
 * pas vu". German instead drops `nicht` after the object. A learner who has
 * only ever seen one of these will put the other in the wrong place, which is
 * exactly what the tiles make visible.
 */
function negatedParts({ lang, T, gSubject, gFinite, gAfter, obj, post, gTail, finite }) {
  if (lang === "de") {
    return {
      parts: [gSubject, gFinite, ...obj, T("nicht", "the negator — after the object, before any verb at the end"), ...post, ...gTail],
      alternates: [],
    };
  }
  /* "ne" elides to "n'" before a vowel, and "je" fuses with the verb only when
   * nothing sits between them — which negation does, so the merge is off here. */
  const ne = VOWEL.test(finite) ? "n'" + finite : null;
  const neTile = ne
    ? T(ne, `ne + ${finite} — "ne" elides before a vowel`)
    : T("ne", "the first half of the negation, before the verb");
  const parts = ne
    ? [gSubject, neTile, T("pas", "the second half — French negates with two words"), ...gAfter, ...obj, ...post]
    : [gSubject, neTile, gFinite, T("pas", "the second half — French negates with two words"), ...gAfter, ...obj, ...post];
  return { parts, alternates: [] };
}

/**
 * A modal plus an infinitive — the clearest case of the German verb bracket.
 *
 * French keeps the two verbs together: "je veux voir l'avion". German splits
 * them around everything else: "ich will das Flugzeug sehen". Same meaning,
 * same two verbs, and the object ends up in a different place.
 */
function modalParts({ lang, T, gSubject, obj, post, modal, verb, label, vSense }) {
  const modalTile = T(modal.form, `from ${modal.inf} — ${modal.en} (present)`);
  const infTile = T(verb.inf, `${label} — ${vSense}, left as an infinitive because the modal is carrying the tense`);
  if (lang === "de") {
    return {
      parts: [gSubject, modalTile, ...obj, ...post, infTile],
      alternates: [],
    };
  }
  return { parts: [gSubject, modalTile, infTile, ...obj, ...post], alternates: [] };
}

/**
 * A that-clause. German sends the finite verb to the very end of it.
 *
 * The comma rides on the opener's verb tile rather than becoming a tile of its
 * own: German punctuation requires it, but a floating comma tile is a puzzle
 * about typography rather than about word order.
 */
function subordinateParts({ lang, T, gSubject, gFinite, gAfter, obj, post, gTail, opener }) {
  const openSubj = T(opener.subj, opener.en.split(" ")[0]);
  const openVerb = T(lang === "de" ? `${opener.verb},` : opener.verb,
    `from ${opener.inf} — ${opener.en}${lang === "de" ? "; German puts a comma before the clause" : ""}`);
  const conj = T(lang === "de" ? "dass" : "que", '"that" — it opens the clause');
  if (lang === "de") {
    /* Verb last, after the object and after anything the plain shape would
     * have parked at the end. */
    return {
      parts: [openSubj, openVerb, conj, gSubject, ...obj, ...post, ...gTail, gFinite],
      alternates: [],
    };
  }
  return { parts: [openSubj, openVerb, conj, gSubject, gFinite, ...gAfter, ...obj, ...post], alternates: [] };
}

/** Shared tail end of every shape: tokens, glosses, display, English. */
function finish({ parts, alternates = [] }, ctx) {
  const tokens = parts.map((x) => x.tok);
  return {
    tokens,
    glosses: parts.map((x) => x.gloss),
    display: ctx.capitalize(tokens.join(" ")) + ".",
    english: ctx.englishFor({
      lang: ctx.lang, verb: ctx.verb, tenseKey: ctx.tenseKey, subject: ctx.subject,
      noun: ctx.noun, time: ctx.time, enVerb: ctx.enVerb,
      shape: ctx.shape, modal: ctx.modal, opener: ctx.opener,
    }),
    alternates,
    verb: ctx.verb,
    noun: ctx.noun,
    tenseKey: ctx.tenseKey,
    shape: ctx.shape,
  };
}

/**
 * Build one item.
 *
 * Returns the canonical token order plus any other order that is equally
 * correct — German allows the object in the front field just as readily as the
 * time phrase, and rejecting a learner's grammatical sentence because it
 * wasn't the one we happened to generate teaches nothing.
 */
export function buildSentence({
  lang, verb, tenseKey, subject, noun, time = null, enVerb = null,
  shape = "plain", modal = null, opener = null,
}) {
  const p = subject.p;
  const { finite, after, tail } = verbParts(lang, verb, tenseKey, p);
  const obj = objectTiles(lang, noun);
  const vSense = firstSense(verb.en) || verb.en;
  const label = verb.label || verb.inf;
  const note = TENSE_NOTE[tenseKey] || "present";
  /* Compound tenses put an auxiliary in the finite slot, so the tile the
   * learner sees is not the verb they were asked to use. Saying so is the
   * point of the tooltip. */
  const compound = PERFECT_TENSES.has(tenseKey) || (lang === "de" && tenseKey === "futur");
  const auxName = lang === "de" && tenseKey === "futur" ? "werden" : verb.aux;
  const nonFinite = lang === "de" && tenseKey === "futur" ? "infinitive" : "past participle";

  const T = (tok, gloss) => ({ tok, gloss });
  const gSubject = T(subject.tok, subject.en);
  const gTime = time ? T(time.tok, time.en) : null;
  const gFinite = T(finite, compound
    ? `from ${auxName} — the auxiliary that forms the ${note}`
    : `from ${label} — ${vSense} (${note})`);
  const gTail = tail.map((x) => T(x, `from ${label} — ${vSense} (${nonFinite})`));
  const gAfter = after ? [T(after, `from ${label} — ${vSense} (past participle)`)] : [];
  const post = verb.post ? [T(verb.post, `part of the fixed phrase "${label}"`)] : [];

  let parts;
  const alternates = [];
  const toks = (a) => a.map((x) => x.tok);

  /* ---- the harder shapes ----
   *
   * Each returns early with its own layout. They share verbParts and
   * objectTiles with the plain shape, so a noun or tense fix reaches all of
   * them, but the ORDER is the whole lesson and cannot be parameterised. */

  if (shape === "negative") {
    const negated = negatedParts({ lang, T, gSubject, gFinite, gAfter, obj, post, gTail, finite });
    return finish(negated, { lang, verb, tenseKey, subject, noun, time: null, enVerb, shape, modal, opener, capitalize, englishFor });
  }
  if (shape === "modal" && modal) {
    const built = modalParts({ lang, T, gSubject, obj, post, modal, verb, label, vSense });
    return finish(built, { lang, verb, tenseKey, subject, noun, time: null, enVerb, shape, modal, opener, capitalize, englishFor });
  }
  if (shape === "subordinate" && opener) {
    const built = subordinateParts({ lang, T, gSubject, gFinite, gAfter, obj, post, gTail, opener });
    return finish(built, { lang, verb, tenseKey, subject, noun, time: null, enVerb, shape, modal, opener, capitalize, englishFor });
  }

  if (lang === "de") {
    if (time) {
      // Front field filled -> finite verb second, subject third.
      parts = [gTime, gFinite, gSubject, ...obj, ...post, ...gTail];
      // The object may take the front field instead; the verb stays second.
      alternates.push(toks([...obj, gFinite, gSubject, gTime, ...post, ...gTail]));
      alternates.push(toks([gSubject, gFinite, gTime, ...obj, ...post, ...gTail]));
    } else {
      parts = [gSubject, gFinite, ...obj, ...post, ...gTail];
      alternates.push(toks([...obj, gFinite, gSubject, ...post, ...gTail]));
    }
  } else {
    /* "je" + a vowel fuses into one word, so it is one tile — and its tooltip
     * has to account for both halves, since neither is visible on its own. */
    const merged = subject.tok === "je" && VOWEL.test(finite);
    const core = merged
      ? [T(`j'${finite}`, `je + ${finite} — "${subject.en}" and ${compound ? `the auxiliary ${auxName}` : label} run together`), ...gAfter]
      : [gSubject, gFinite, ...gAfter];
    parts = time ? [gTime, ...core, ...obj, ...post] : [...core, ...obj, ...post];
    if (time) alternates.push(toks([...core, ...obj, ...post, gTime]));
  }

  const tokens = toks(parts);
  const english = englishFor({ lang, verb, tenseKey, subject, noun, time, enVerb });
  return {
    tokens,
    /* Parallel to `tokens`. Tiles pick their gloss up by index at creation, so
     * it survives shuffling and reordering. */
    glosses: parts.map((x) => x.gloss),
    display: capitalize(tokens.join(" ")) + ".",
    english,
    alternates,
    verb,
    noun,
    tenseKey,
  };
}

/* Adverbs that pin the event to finished past time. */
const PAST_ADVERBS = new Set(["hier", "gestern"]);

/* The bare English verb — "to see" → "see". content.js has this privately; one
 * line is cheaper to repeat than a new export nothing else wants. */
const bareEn = (en) => String(en || "").split(/[,/;(]/)[0].trim().replace(/^to\s+/i, "").trim();

function englishFor({ lang, verb, tenseKey, subject, noun, time, enVerb, shape, modal, opener }) {
  /* French and German use the perfect where English cannot: "hier tu as fait"
   * is right, but "yesterday you have done" is not — English demands the
   * simple past once the time is fixed. The prompt has to be natural English,
   * so it switches; the target sentence is unaffected. */
  const enTense = time && PAST_ADVERBS.has(time.tok) && PERFECT_TENSES.has(tenseKey) ? "praeteritum" : tenseKey;
  /* Dropping enPast/enPP matters: they belong to the verb's own gloss, so
   * keeping faire's "did/done" while swapping the base to "make" would render
   * "we have done". Cleared, the irregular table supplies made/made. */
  const enSubject = enVerb ? { ...verb, en: enVerb, enPast: undefined, enPP: undefined } : verb;
  const phrase = conjugateEnglish(lang, enSubject, enTense, subject.p, subject.en);
  const object = `the ${firstSense(noun.e)}`;

  /* The prompt is the only statement of what the tiles are meant to say, so it
   * has to be English somebody would produce — not the plain sentence with a
   * word bolted on. Each shape says it differently. */
  if (shape === "negative") {
    const third = subject.p === 2;
    const negated = PERFECT_TENSES.has(tenseKey)
      ? `${subject.en} ${third ? "has not" : "have not"} ${conjugateEnglish(lang, enSubject, "passe", subject.p, "").trim().split(/\s+/).slice(-1)[0]}`
      : `${subject.en} ${third ? "does not" : "do not"} ${bareEn(enSubject.en)}`;
    return capitalize(`${negated} ${object}`) + ".";
  }
  if (shape === "modal" && modal) {
    const MODAL_EN = { vouloir: "want to", pouvoir: "can", devoir: "must", wollen: "want to", "können": "can", "müssen": "must" };
    const m = MODAL_EN[modal.inf] || "want to";
    /* "can" and "must" never take a third-person -s; "want to" does. */
    const inflected = m === "want to" && subject.p === 2 ? "wants to" : m;
    return capitalize(`${subject.en} ${inflected} ${bareEn(enSubject.en)} ${object}`) + ".";
  }
  if (shape === "subordinate" && opener) {
    return capitalize(`${opener.en} that ${phrase} ${object}`) + ".";
  }

  const body = `${phrase} ${object}`;
  const s = time ? `${capitalize(time.en)} ${body}` : capitalize(body);
  return s + ".";
}
