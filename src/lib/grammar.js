/* Grammar checking for written answers — with no language model in it.
 *
 * Two layers, because neither is enough alone.
 *
 * 1. LanguageTool (languagetool.org) — an open-source checker made of several
 *    thousand hand-written rules. Its free public API sends CORS headers, so it
 *    is called straight from the browser and the shared static build needs no
 *    server. On a set of typical learner errors (tested 2026-09-11) it caught
 *    9 of 9 in French with no false alarms — and 2 of 9 in German, where it
 *    passed verb-second, the verb-final subordinate clause, case after a
 *    preposition, subject–verb agreement and adjective endings.
 *
 * 2. Drawer rules — exactly those German errors, checked offline against the
 *    app's own verb tables and the deck's noun genders. They are narrow on
 *    purpose: a checker that cries wolf teaches the learner to ignore it, so
 *    every rule is held to zero flags across every German sentence in the app
 *    (scripts/check-reading.mjs), and a pattern that cannot be told apart from
 *    correct German is left alone rather than guessed at.
 *
 * The public API's terms (dev.languagetool.org/public-http-api): 20 requests a
 * minute per IP, 20 KB per request, a visible link back to languagetool.org,
 * and no automated requests — every call here is one the learner pressed a
 * button for. Set VITE_LT_URL to use a self-hosted LanguageTool instead.
 */

export const LT_URL = import.meta.env?.VITE_LT_URL || "https://api.languagetool.org/v2/check";
const LT_LANG = { fr: "fr", de: "de-DE" };
export const LT_PER_MINUTE = 20;
export const LT_MAX_BYTES = 20_000;
const MINUTE = 60_000;
/* Headroom under the published limit, so a burst of re-checks never earns the
 * learner's address a refusal. */
const SPARE = 2;

let sentAt = [];
const cache = new Map();
const CACHE_SIZE = 60;

/** Forget the rate window and the cache. For tests. */
export function resetLanguageTool() {
  sentAt = [];
  cache.clear();
}

/** How many checks are left this minute, and how long until the next one. */
export function ltBudget(now = Date.now()) {
  sentAt = sentAt.filter((t) => now - t < MINUTE);
  const left = LT_PER_MINUTE - SPARE - sentAt.length;
  return { left, waitMs: left > 0 ? 0 : MINUTE - (now - sentAt[0]) };
}

export const KIND_LABEL = { grammar: "Grammar", spelling: "Spelling", punctuation: "Punctuation", style: "Style" };

/* What counts against the grammar score. Punctuation and style are shown as
 * tips: French typography wants a thin space before "?", and docking a learner
 * for that would make the score about typesetting. */
export const COUNTED = new Set(["grammar", "spelling"]);

const TIP_CATEGORIES = new Set([
  "PUNCTUATION", "TYPOGRAPHY", "CAT_TYPOGRAPHIE", "CASING",
  "STYLE", "CAT_STYLE", "REDUNDANCY", "COLLOQUIALISMS", "REPETITIONS",
  "REPETITIONS_STYLE", "TEXT_ANALYSIS", "PLAIN_ENGLISH",
]);

/** Sort one LanguageTool match into grammar / spelling / punctuation / style. */
export function kindOf(match) {
  const type = match?.rule?.issueType || "";
  const cat = match?.rule?.category?.id || "";
  if (type === "misspelling" || cat === "TYPOS") return "spelling";
  if (type === "typographical" || type === "whitespace"
    || cat === "PUNCTUATION" || cat === "TYPOGRAPHY" || cat === "CAT_TYPOGRAPHIE" || cat === "CASING") return "punctuation";
  if (type === "style" || type === "register" || type === "locale-violation" || TIP_CATEGORIES.has(cat)) return "style";
  return "grammar";
}

/** LanguageTool's response, as the issue shape the rest of the app uses. */
export function fromLanguageTool(json, text) {
  return (json?.matches || []).map((m) => ({
    start: m.offset,
    end: m.offset + m.length,
    text: text.slice(m.offset, m.offset + m.length),
    message: m.message || "",
    short: m.shortMessage || "",
    fixes: (m.replacements || []).slice(0, 3).map((r) => r.value),
    kind: kindOf(m),
    rule: m.rule?.id || "",
    /* The category, not just the rule: LanguageTool has thousands of rule ids
     * and FRENCH_AGREEMENT_1 and _2 are the same lesson, so the error ledger
     * counts by category. */
    category: m.rule?.category?.id || "",
    source: "lt",
  }));
}

/**
 * Ask LanguageTool. Never throws: the status says what happened, and every
 * status other than "ok" still returns an empty issue list, so the offline
 * layers can report on their own.
 */
export async function checkWithLanguageTool(text, lang, { fetchImpl = globalThis.fetch, now = Date.now(), url = LT_URL } = {}) {
  /* A NUL separator cannot occur in either half, so no pair of
   * (lang, text) values can collide on the joined key. Written as an
   * escape rather than a literal NUL: the literal makes this file look
   * binary to grep and ripgrep, which then silently match nothing in it. */
  const key = `${lang}\u0000${text}`;
  if (cache.has(key)) return { status: "ok", issues: cache.get(key) };
  if (new TextEncoder().encode(text).length > LT_MAX_BYTES) return { status: "too-long", issues: [] };
  const budget = ltBudget(now);
  if (budget.left <= 0) return { status: "rate", waitMs: budget.waitMs, issues: [] };
  sentAt.push(now);

  let res;
  try {
    res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      /* motherTongue switches on the false-friend rules — "actuellement" used
       * to mean "actually" is an English speaker's error in particular. */
      body: new URLSearchParams({ text, language: LT_LANG[lang] || lang, motherTongue: "en-US", level: "default" }).toString(),
    });
  } catch {
    return { status: "offline", issues: [] };
  }
  if (res.status === 429) return { status: "rate", waitMs: MINUTE, issues: [] };
  if (!res.ok) return { status: "error", code: res.status, issues: [] };

  let issues;
  try {
    issues = fromLanguageTool(await res.json(), text);
  } catch {
    return { status: "error", issues: [] };
  }
  cache.set(key, issues);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value);
  return { status: "ok", issues };
}

/* ---------------------------------------------------------------------- */
/* Drawer rules — German learner errors the free rules pass                 */
/* ---------------------------------------------------------------------- */

export const RULE_LABEL = {
  "de-verb-second": "Word order: verb second",
  "de-verb-final": "Word order: verb at the end",
  "de-agreement": "Subject–verb agreement",
  "de-case": "Case after a preposition",
  "de-gender": "Article gender",
  "de-adjective-ending": "Adjective ending",
};

const PRONOUNS = { ich: [0], du: [1], er: [2], es: [2], sie: [2, 5], wir: [3], ihr: [4], man: [2] };

/* Adverbials that fill the first slot on their own, pushing the verb into the
 * second. Deliberately no focus particles: "Auch ich habe Hunger" is correct,
 * because "auch ich" is one constituent. */
const FRONT = new Set([
  "gestern", "heute", "morgen", "dann", "danach", "jetzt", "später", "oft", "manchmal",
  "immer", "nie", "niemals", "leider", "zuerst", "schließlich", "endlich", "deshalb",
  "deswegen", "darum", "trotzdem", "außerdem", "damals", "früher", "bald", "hier", "dort",
  "abends", "morgens", "mittags", "nachmittags", "nachts", "vormittags", "plötzlich",
  "natürlich", "vielleicht", "normalerweise", "meistens", "übermorgen", "vorgestern",
  "montags", "dienstags", "mittwochs", "donnerstags", "freitags", "samstags", "sonntags",
]);
/* Two-word openers: "Am Montag", "Letzte Woche", "Zum Glück", "Heute Abend". */
const FRONT_PAIR = new Set([
  "am", "im", "zum", "letzte", "letzten", "letztes", "jeden", "jede", "jedes",
  "nächste", "nächsten", "nächstes", "diese", "diesen", "dieses", "heute", "morgen", "gestern",
]);
const QUESTION = new Set(["was", "wann", "wo", "warum", "wie", "wohin", "woher", "wer", "wen", "wem", "wieso", "weshalb"]);
const SUBORDINATORS = new Set([
  "weil", "dass", "ob", "wenn", "obwohl", "als", "bevor", "nachdem", "damit", "während",
  "bis", "sobald", "falls", "seitdem", "sodass", "indem", "ehe",
]);
const COORD = new Set(["und", "aber", "oder", "denn", "sondern"]);

/* Subordinators whose clause, placed first, can be trusted to be a clause even
 * when its verb is not in the verb tables (rule 1b). « wenn » and « falls »
 * are not here: a relevance conditional ("Wenn du Durst hast, im Kühlschrank
 * ist Bier") stands loose in front and is correct, so for those the rule still
 * insists on recognising the verb. */
const FRONTED_SUB = new Set(["als", "weil", "obwohl", "nachdem", "bevor", "sobald", "seitdem"]);
const SEP = new Set([
  "ab", "an", "auf", "aus", "bei", "ein", "fest", "fort", "her", "hin", "los", "mit", "nach",
  "vor", "weg", "zu", "zurück", "zusammen", "weiter", "heim", "fern",
]);
const AUX_MODAL = new Set(["sein", "haben", "werden", "können", "müssen", "wollen", "mögen", "dürfen", "sollen"]);
const DAT_PREPS = new Set(["aus", "bei", "mit", "nach", "seit", "von", "zu", "gegenüber"]);
const ACC_PREPS = new Set(["durch", "für", "gegen", "ohne"]);
const TWO_WAY = new Set(["in", "an", "auf", "über", "unter", "vor", "hinter", "neben", "zwischen"]);
/* Determiner forms that are never dative. "sein" and "ihr" are left out: "zu
 * sein" is an infinitive and "mit ihr" is "with her". */
const NOT_DATIVE = new Set([
  "die", "das", "ein", "eine", "einen", "kein", "keine", "mein", "meine", "dein", "deine",
  "seine", "ihre", "unser", "unsere", "euer", "eure", "diese", "dieses", "jene", "jenes",
  "welche", "welches",
]);
const NOT_ACC = new Set([
  "dem", "einem", "keinem", "meinem", "deinem", "seinem", "ihrem", "unserem", "eurem",
  "diesem", "jenem", "welchem", "der", "einer", "keiner", "meiner", "deiner", "seiner",
  "ihrer", "unserer", "eurer", "dieser", "jener", "welcher",
]);
const FIXED_EIN = new Set(["bisschen", "paar", "wenig"]);        // "mit ein bisschen Glück"
const DEM_CONTRACT = { zum: "zur", vom: "von der", beim: "bei der", im: "in der", am: "an der" };
const DAS_CONTRACT = { ins: "in", ans: "an" };
const JOIN = { "zu dem": "zum", "zu der": "zur", "von dem": "vom", "bei dem": "beim" };
/* Verbs whose fronted noun is usually a dative object, not the subject:
 * "Der Frau hilft niemand" is correct. */
const DATIVE_VERBS = new Set([
  "helfen", "danken", "gefallen", "gehören", "antworten", "folgen", "glauben", "passen",
  "schmecken", "fehlen", "gratulieren", "begegnen", "vertrauen", "zuhören",
]);
const DATIVE_FEEL = new Set(["kalt", "warm", "heiß", "schlecht", "übel", "schwindlig", "langweilig", "egal", "recht", "klar"]);
const NOBODY = new Set(["niemand", "jemand", "keiner", "man", "nichts", "alles", "etwas"]);
const BARE_EIN = new Set(["ein", "kein", "mein", "dein", "sein", "ihr", "unser", "euer"]);
const NOT_ADJ = new Set([
  "gerne", "bitte", "alle", "beide", "ohne", "eine", "keine", "meine", "deine", "seine",
  "ihre", "unsere", "eure", "diese", "jede", "welche", "manche", "einige", "viele", "wenige",
]);

const GKEY = { der: "m", die: "f", das: "n" };
const GNAME = { m: "masculine", f: "feminine", n: "neuter" };
const DEF = {
  nom: { m: "der", f: "die", n: "das", pl: "die" },
  acc: { m: "den", f: "die", n: "das", pl: "die" },
  dat: { m: "dem", f: "der", n: "dem", pl: "den" },
};
const DER_END = {
  nom: { m: "er", f: "e", n: "es", pl: "e" },
  acc: { m: "en", f: "e", n: "es", pl: "e" },
  dat: { m: "em", f: "er", n: "em", pl: "en" },
};
const EIN_END = {
  nom: { m: "", f: "e", n: "", pl: "e" },
  acc: { m: "en", f: "e", n: "", pl: "e" },
  dat: { m: "em", f: "er", n: "em", pl: "en" },
};
const DEF_FORMS = new Set(["der", "die", "das", "den", "dem", "des"]);
const DER_STEMS = ["dies", "jed", "jen", "welch"];
const EIN_STEMS = ["ein", "kein", "mein", "dein", "sein", "ihr", "unser", "euer"];
const INFLECTED = ["e", "en", "em", "er", "es"];

const isCap = (s) => /^\p{Lu}/u.test(s || "");
const matchCase = (model, s) => (s && isCap(model) ? s[0].toUpperCase() + s.slice(1) : s);

/** Which declension family a determiner belongs to, or null. */
function familyOf(lo) {
  if (DEF_FORMS.has(lo)) return { type: "def" };
  for (const s of DER_STEMS) if (lo.startsWith(s) && INFLECTED.includes(lo.slice(s.length))) return { type: "der", stem: s };
  for (const bare of EIN_STEMS) {
    const stem = bare === "euer" ? "eur" : bare;
    if (lo === bare || (lo.startsWith(stem) && INFLECTED.includes(lo.slice(stem.length)))) return { type: "ein", stem, bare };
  }
  return null;
}

/** The same determiner, declined for another case and gender. */
function inflect(fam, kase, g) {
  if (!fam) return null;
  if (fam.type === "def") return DEF[kase][g];
  if (fam.type === "der") return fam.stem + DER_END[kase][g];
  if (fam.stem === "ein" && g === "pl") return null;              // "ein" has no plural
  const end = EIN_END[kase][g];
  return end === "" ? fam.bare : fam.stem + end;
}

function joinPrep(prep, art) {
  const plain = `${prep.toLowerCase()} ${art}`;
  return matchCase(prep, JOIN[plain] || plain);
}

/**
 * What the rules know about German: every finite form in the verb tables
 * (with its persons), the infinitives and participles those forms can be
 * confused with, and the gender of every noun in the deck.
 */
export function germanLexicon({ data, verbs }) {
  const finite = new Map();
  const infinitives = new Set();
  const participles = new Set();
  for (const v of verbs || []) {
    const inf = String(v.inf || "").split(/\s+/).pop().toLowerCase();
    if (inf) infinitives.add(inf);
    /* A separable verb's forms are those of its base: "stehe" belongs to
     * aufstehen, and "stehen" is an infinitive too. */
    if (v.sep && v.pres?.[3]) infinitives.add(v.pres[3].toLowerCase());
    if (v.pp && !/\s/.test(v.pp)) participles.add(v.pp.toLowerCase());
    for (const set of ["pres", "past", "k2"]) {
      (v[set] || []).forEach((form, i) => {
        if (!form || /\s/.test(form)) return;
        const k = form.toLowerCase();
        let e = finite.get(k);
        if (!e) finite.set(k, (e = { persons: new Set(), src: [] }));
        e.persons.add(i);
        e.src.push({ verb: v, set, i });
      });
    }
  }

  const gender = new Map();
  const clash = new Set();
  for (const level of Object.values(data?.de || {}))
    for (const drawer of level || [])
      for (const w of drawer.words || []) {
        if (!GKEY[w.g] || !/^\p{Lu}[\p{L}-]*$/u.test(w.t || "")) continue;
        if (gender.has(w.t) && gender.get(w.t) !== w.g) clash.add(w.t);
        else gender.set(w.t, w.g);
      }
  /* der See / die See, der Leiter / die Leiter — a noun with two genders
   * cannot be used to call either one wrong. */
  for (const t of clash) gender.delete(t);
  return { finite, infinitives, participles, gender };
}

function tokenize(text) {
  const out = [];
  const re = /[\p{L}\p{M}][\p{L}\p{M}'’-]*|\d+|[.,;:!?…]/gu;
  let m;
  while ((m = re.exec(text))) {
    const v = m[0];
    out.push({ v, lo: v.toLowerCase(), start: m.index, end: m.index + v.length, punct: /^[.,;:!?…]$/.test(v) });
  }
  return out;
}

/** Sentences, each a list of clauses, each a list of word-token indices. */
function structure(toks) {
  const sentences = [[]];
  let clause = [];
  const flush = () => {
    if (clause.length) sentences[sentences.length - 1].push(clause);
    clause = [];
  };
  toks.forEach((t, i) => {
    if (!t.punct) { clause.push(i); return; }
    flush();
    if (/[.!?…]/.test(t.v)) sentences.push([]);
  });
  flush();
  return sentences.filter((s) => s.length);
}

function dedupe(list) {
  const sorted = [...list].sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  for (const i of sorted) if (!out.some((o) => i.start < o.end && i.end > o.start)) out.push(i);
  return out;
}

/** German errors LanguageTool's free rules miss. Offline; `lex` from germanLexicon. */
export function germanIssues(text, lex) {
  if (!lex || !text) return [];
  const toks = tokenize(text);
  const out = [];
  const fin = (t) => (t ? lex.finite.get(t.lo) || null : null);
  const isPron = (t) => !!t && Object.prototype.hasOwnProperty.call(PRONOUNS, t.lo);
  const genderOf = (t) => (t && isCap(t.v) ? lex.gender.get(t.v) || null : null);
  const adjLike = (t) => !!t && !isCap(t.v) && !fin(t) && !familyOf(t.lo) && !isPron(t) && t.v.length > 1 && !/^\d/.test(t.v);
  const verbish = (t) => !!t && (!!fin(t) || lex.infinitives.has(t.lo) || lex.participles.has(t.lo));
  const emit = (a, b, rule, message, fixes = []) => {
    const start = toks[a].start, end = toks[b].end;
    out.push({
      start, end, text: text.slice(start, end), message, short: RULE_LABEL[rule],
      fixes: fixes.filter(Boolean), kind: "grammar", rule, source: "drawer",
    });
  };

  for (const sentence of structure(toks)) {
    for (const clause of sentence) {
      const W = (k) => (k >= 0 && k < clause.length ? toks[clause[k]] : null);

      /* 1. Verb second after a fronted adverbial — "Gestern ich bin" — at the
       * start of the clause and after each coordinator inside it. */
      const starts = [0];
      clause.forEach((ti, k) => { if (k > 0 && COORD.has(toks[ti].lo)) starts.push(k + 1); });
      for (const s of starts) {
        const a = W(s), b = W(s + 1);
        if (!a) continue;
        let lead = 0;
        if (b && FRONT_PAIR.has(a.lo) && isCap(b.v) && !isPron(b)) lead = 2;
        else if (FRONT.has(a.lo)) lead = 1;
        if (!lead) continue;
        const p = W(s + lead);
        if (!isPron(p)) continue;
        const v = W(s + lead + 1);
        if (p.lo === "ihr" && v && isCap(v.v)) continue;          // "ihr Hund" — a possessive
        const leadText = text.slice(a.start, W(s + lead - 1).end);
        if (v && fin(v)) {
          emit(clause[s + lead], clause[s + lead + 1], "de-verb-second",
            `After “${leadText}” the conjugated verb comes second, before the subject: “${leadText} ${v.v} ${p.v} …”.`,
            [`${v.v} ${p.v}`]);
        } else {
          emit(clause[s + lead], clause[s + lead], "de-verb-second",
            `After “${leadText}” the conjugated verb comes second, before “${p.v}”.`);
        }
      }

      /* 2. The verb-final subordinate clause — "weil ich muss arbeiten". Only
       * when the subject is a pronoun or a determiner phrase, which is what
       * keeps "Als Kind war ich oft krank" (no subject after "als") clean. */
      clause.forEach((ti, k) => {
        const sub = toks[ti];
        if (!SUBORDINATORS.has(sub.lo)) return;
        const nx = W(k + 1);
        if (!nx) return;
        if (sub.lo === "als" && nx.lo === "ob") return;
        if (sub.lo === "während" && (nx.lo === "der" || nx.lo === "des")) return;   // the preposition
        let j = k + 1;
        if (isPron(nx)) j += 1;
        else if (familyOf(nx.lo)) {
          j += 1;
          while (adjLike(W(j))) j += 1;
          if (!W(j) || !isCap(W(j).v)) return;
          j += 1;
        } else return;
        const v = W(j);
        const f = fin(v);
        if (!f) return;
        const rest = clause.slice(j + 1);
        if (!rest.length) return;
        const last = toks[rest[rest.length - 1]];
        /* "weil wir essen gehen": "essen" is an infinitive here, and the
         * finite verb is already at the end. */
        if ((lex.infinitives.has(v.lo) || lex.participles.has(v.lo)) && verbish(last)) return;
        const subject = text.slice(nx.start, W(j - 1).end);
        const fixable = !rest.some((ri) => COORD.has(toks[ri].lo) || SUBORDINATORS.has(toks[ri].lo));
        let fix = null;
        if (fixable) {
          const first = toks[rest[0]];
          let verbText = v.v;
          let restText = text.slice(first.start, last.end);
          if (SEP.has(last.lo) && !f.src.some((x) => AUX_MODAL.has(x.verb.inf))) {
            verbText = last.lo + v.lo;                             // "stehe … auf" → "aufstehe"
            restText = rest.length > 1 ? text.slice(first.start, toks[rest[rest.length - 2]].end) : "";
          }
          fix = restText ? `${restText} ${verbText}` : verbText;
        }
        emit(clause[j], rest[rest.length - 1], "de-verb-final",
          `In a “${sub.lo}” clause the conjugated verb goes to the end${fix ? `: “${sub.lo} ${subject} ${fix}”` : ""}.`,
          fix ? [fix] : []);
      });

      /* 3. Pronoun–verb agreement — "du bin", "Kannst ich". */
      const verbSlot = (k) => {
        if (k === 0) return true;
        const a0 = W(0);
        if (k === 1) return FRONT.has(a0.lo) || QUESTION.has(a0.lo);
        if (k === 2) return FRONT_PAIR.has(a0.lo) && isCap(W(1).v);
        return false;
      };
      const agree = (pron, verb, f, ia, ib, pronFirst) => {
        const persons = PRONOUNS[pron.lo];
        if (persons.some((p) => f.persons.has(p))) return;
        if (pron.lo === "es" && [...f.persons].every((p) => p === 3 || p === 5)) return;   // "Es sind drei Kinder"
        /* "Er sagt, er habe keine Zeit" — Konjunktiv I, which shares its form
         * with the first person. */
        if (persons.includes(2) && verb.lo.endsWith("e") && f.src.some((x) => x.set === "pres" && x.i === 0)) return;
        const src = f.src[0];
        const want = [...new Set(persons.map((p) => src.verb[src.set]?.[p]).filter(Boolean))].map((w) => matchCase(verb.v, w));
        if (!want.length) return;
        emit(ia, ib, "de-agreement", `“${pron.v}” takes “${want.join("” or “")}”, not “${verb.v}”.`,
          want.map((w) => (pronFirst ? `${pron.v} ${w}` : `${w} ${pron.v}`)));
      };
      for (let k = 0; k + 1 < clause.length; k += 1) {
        const a = W(k), b = W(k + 1);
        if (isPron(a)) {
          /* "Kann ich kommen", "Hast du verstanden": forms that double as an
           * infinitive or a participle say nothing about agreement. */
          if (lex.infinitives.has(b.lo) || lex.participles.has(b.lo)) continue;
          const f = fin(b);
          if (f) agree(a, b, f, clause[k], clause[k + 1], true);
        } else if (isPron(b) && verbSlot(k)) {
          /* "Was ist Ihr Lieblingsessen?" — before a noun, "ihr" is a possessive. */
          if (b.lo === "ihr" && W(k + 2) && isCap(W(k + 2).v)) continue;
          const f = fin(a);
          if (f && !lex.participles.has(a.lo)) agree(b, a, f, clause[k], clause[k + 1], false);
        }
      }

      /* 4. Case after a preposition — "mit die Kinder", "für dem Freund",
       * "zum Schule". */
      for (let k = 0; k + 1 < clause.length; k += 1) {
        const p = W(k), a = W(k + 1);
        const g0 = genderOf(a);
        if (DEM_CONTRACT[p.lo] && g0 === "die") {
          const fix = matchCase(p.v, DEM_CONTRACT[p.lo]);
          emit(clause[k], clause[k], "de-case",
            `“${p.v}” contains “dem”, which is masculine or neuter — ${a.v} is feminine: “${fix} ${a.v}”.`, [fix]);
          continue;
        }
        if (p.lo === "zur" && (g0 === "der" || g0 === "das")) {
          const fix = matchCase(p.v, "zum");
          emit(clause[k], clause[k], "de-case",
            `“zur” is “zu der”, which is feminine — ${a.v} is ${GNAME[GKEY[g0]]}: “${fix} ${a.v}”.`, [fix]);
          continue;
        }
        if (DAS_CONTRACT[p.lo] && (g0 === "der" || g0 === "die")) {
          const fix = matchCase(p.v, `${DAS_CONTRACT[p.lo]} ${g0 === "der" ? "den" : "die"}`);
          emit(clause[k], clause[k], "de-case",
            `“${p.v}” contains “das”, which is neuter — ${a.v} is ${GNAME[GKEY[g0]]}: “${fix} ${a.v}”.`, [fix]);
          continue;
        }
        const dat = DAT_PREPS.has(p.lo), acc = ACC_PREPS.has(p.lo);
        if (!dat && !acc) continue;
        const fam = familyOf(a.lo);
        if (!fam) continue;
        let n = W(k + 2);
        if (adjLike(n)) n = W(k + 3);
        const g = genderOf(n);
        const gk = g ? GKEY[g] : null;
        const wrong = dat
          ? (NOT_DATIVE.has(a.lo) && !(a.lo === "ein" && FIXED_EIN.has(W(k + 2)?.lo)))
            || (gk && gk !== "f" && a.lo === "der")
            /* "mit den Mädchen" is a correct plural — nouns in -n take no
             * extra dative ending, so "den" before one proves nothing. */
            || (gk && a.lo === "den" && !/n$/.test(n.lo))
          : NOT_ACC.has(a.lo)
            || (gk && gk !== "m" && a.lo === "den")
            || (gk && gk !== "n" && a.lo === "das");
        if (!wrong) continue;
        const kase = dat ? "dat" : "acc";
        const arts = gk ? [inflect(fam, kase, gk)] : ["m", "f", "pl"].map((x) => inflect(fam, kase, x));
        const fixes = [...new Set(arts.filter(Boolean))].map((art) => joinPrep(p.v, art));
        const caseName = dat ? "dative" : "accusative";
        emit(clause[k], clause[k + 1], "de-case",
          gk
            ? `“${p.lo}” always takes the ${caseName} — ${n.v} is ${GNAME[gk]}, so “${fixes[0]} ${n.v}”.`
            : `“${p.lo}” always takes the ${caseName}: ${fixes.map((x) => `“${x}”`).join(", ")}, depending on the noun.`,
          fixes);
      }

      /* 6. Adjective ending after a bare ein-word — "mein beste Freund". */
      for (let k = 0; k + 2 < clause.length; k += 1) {
        const d = W(k), adj = W(k + 1), noun = W(k + 2);
        if (!BARE_EIN.has(d.lo)) continue;
        if (!adjLike(adj) || !adj.lo.endsWith("e") || NOT_ADJ.has(adj.lo)) continue;
        const g = genderOf(noun);
        if (g !== "der" && g !== "das") continue;
        const before = W(k - 1);
        /* After a preposition the case is set by it, and rule 4 speaks to it. */
        if (before && (DAT_PREPS.has(before.lo) || ACC_PREPS.has(before.lo) || TWO_WAY.has(before.lo))) continue;
        const stem = adj.v.slice(0, -1);
        if (g === "das") {
          const fix = `${stem}es`;
          emit(clause[k + 1], clause[k + 1], "de-adjective-ending",
            `After “${d.v}” with a neuter noun the adjective ends in -es: “${d.v} ${fix} ${noun.v}”.`, [fix]);
          continue;
        }
        /* A bare ein-word before a masculine noun is nominative — as the
         * object it would already be "einen". So the fix is only certain where
         * the noun is plainly the subject or follows "sein". */
        const nominative = k === 0 || (before && fin(before)?.src.some((x) => x.verb.inf === "sein" || x.verb.inf === "werden"));
        if (nominative) {
          const fix = `${stem}er`;
          emit(clause[k + 1], clause[k + 1], "de-adjective-ending",
            `After “${d.v}” with a masculine noun the adjective ends in -er: “${d.v} ${fix} ${noun.v}”.`, [fix]);
        } else {
          const obj = inflect(familyOf(d.lo), "acc", "m");
          emit(clause[k], clause[k + 1], "de-adjective-ending",
            `With a masculine noun: as the subject “${d.v} ${stem}er ${noun.v}”, as the object “${obj} ${stem}en ${noun.v}”.`);
        }
      }
    }

    /* 1b. A clause that opens the sentence is its first element, so the verb
     * follows the comma — "Wenn ich Zeit habe, ich gehe" is wrong. The opening
     * clause must be recognisably a clause, or "Bis bald, ich freue mich" would
     * trip it: either it holds a verb from the tables, or it opens with one of
     * the FRONTED_SUB words followed by a subject. The second way exists
     * because the tables are not every verb — "Als er aufwachte, er lag…"
     * went unflagged for want of « aufwachen », and it is the exact mistake
     * Lesson 2 teaches and then asks the learner to avoid in writing. */
    const opener = sentence[0];
    const sub = toks[opener[0]];
    const subject = toks[opener[1]];
    const clauseLike = opener.slice(1).some((ti) => fin(toks[ti]))
      || (FRONTED_SUB.has(sub.lo) && !!subject && (isPron(subject) || !!familyOf(subject.lo)));
    if (sentence.length > 1 && SUBORDINATORS.has(sub.lo) && opener.length >= 3 && clauseLike) {
      const main = sentence[1];
      const p = toks[main[0]], v = main.length > 1 ? toks[main[1]] : null;
      if (isPron(p) && v && fin(v)) {
        emit(main[0], main[1], "de-verb-second",
          `The “${toks[opener[0]].lo}” clause fills the first slot, so the verb comes straight after the comma: “…, ${v.v} ${p.v} …”.`,
          [`${v.v} ${p.v}`]);
      }
    }

    /* 5. Article gender on a sentence-initial subject — "Der Frau ist nett".
     * Skipped whenever the noun could be a fronted object: a pronoun, article
     * or "niemand" right after the verb means the subject is still to come. */
    const W0 = (k) => (k < opener.length ? toks[opener[k]] : null);
    const a = W0(0);
    const fam = a && familyOf(a.lo);
    if (fam) {
      const n = adjLike(W0(1)) && W0(2) && isCap(W0(2).v) ? 2 : 1;
      const noun = W0(n), g = genderOf(noun), v = W0(n + 1), f = fin(v), after = W0(n + 2);
      const objectFirst = after && (isPron(after) || familyOf(after.lo) || NOBODY.has(after.lo));
      if (g && f && f.persons.has(2) && !f.src.some((x) => DATIVE_VERBS.has(x.verb.inf))
        && !objectFirst && !DATIVE_FEEL.has(after?.lo)) {
        const want = inflect(fam, "nom", GKEY[g]);
        if (want && want !== a.lo) {
          const fix = matchCase(a.v, want);
          emit(opener[0], opener[0], "de-gender",
            `${noun.v} is ${GNAME[GKEY[g]]} — as the subject it takes “${fix}”: “${fix} ${n === 2 ? `${W0(1).v} ` : ""}${noun.v}”.`,
            [fix]);
        }
      }
    }
  }
  return dedupe(out);
}

/* ---------------------------------------------------------------------- */
/* Putting the layers together                                              */
/* ---------------------------------------------------------------------- */

/** LanguageTool first; a drawer rule only where LanguageTool said nothing. */
export function mergeIssues(remote, local) {
  const keep = (local || []).filter((l) => !(remote || []).some((r) => l.start < r.end && l.end > r.start));
  return [...(remote || []), ...keep].sort((a, b) => a.start - b.start);
}

/** Sentences with their offsets. Enough for learner prose; not for "z. B.". */
export function splitSentences(text) {
  const out = [];
  const re = /[^.!?…]+(?:[.!?…]+|$)/g;
  let m;
  while ((m = re.exec(String(text || "")))) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (/\p{L}/u.test(body)) out.push({ start: m.index + lead, end: m.index + lead + body.length, text: body });
  }
  return out;
}

/**
 * The grammar score: the share of sentences with no grammar or spelling error.
 *
 * Error-free units are the standard accuracy measure in second-language
 * writing research (Wolfe-Quintero, Inagaki & Kim, 1998). They also read
 * honestly: "3 of 4 sentences clean" says exactly what happened, where an
 * error rate per hundred words punishes a learner for writing more.
 */
export function scoreGrammar(text, issues) {
  const sentences = splitSentences(text);
  const counted = (issues || []).filter((i) => COUNTED.has(i.kind));
  const bad = new Set();
  for (const i of counted) {
    const s = sentences.findIndex((x) => i.start < x.end && i.end > x.start);
    if (s >= 0) bad.add(s);
  }
  const words = (String(text || "").match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu) || []).length;
  return {
    sentences: sentences.length,
    errorFree: sentences.length - bad.size,
    errors: counted.length,
    tips: (issues || []).length - counted.length,
    words,
    accuracy: sentences.length ? Math.round(((sentences.length - bad.size) / sentences.length) * 100) : null,
  };
}

export function accuracyLabel(pct) {
  if (pct == null) return "—";
  if (pct === 100) return "Clean";
  if (pct >= 75) return "Strong";
  if (pct >= 50) return "Getting there";
  return "Needs work";
}

/** Replace one issue's span. Offsets after it shift, so re-check afterwards. */
export function applyFix(text, issue, replacement) {
  return text.slice(0, issue.start) + replacement + text.slice(issue.end);
}

/**
 * The whole check. The offline rules always run; LanguageTool's status says
 * whether its layer made it into `issues`.
 */
export async function checkGrammar(text, lang, { lexicon = null, ...opts } = {}) {
  const local = lang === "de" ? germanIssues(text, lexicon) : [];
  const remote = await checkWithLanguageTool(text, lang, opts);
  const issues = mergeIssues(remote.issues, local);
  return { status: remote.status, waitMs: remote.waitMs || 0, issues, score: scoreGrammar(text, issues) };
}
