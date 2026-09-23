/* Offline checks for the lessons.
 *
 * A lesson makes dozens of promises to itself — this sentence is made of
 * these chunks, this rebuild can be done in these orders, this model answer
 * passes this checker — and every one of them fails *silently* on screen. A
 * rebuild whose accepted order uses a chunk that is not in the bank can never
 * be answered correctly; a model translation that fails its own key ideas
 * would mark the teacher's answer wrong; a definition that contains its own
 * answer gives the game away. None of that shows up until a learner hits it.
 *
 * So this holds every lesson to its own internal consistency, and holds the
 * German model answers to the same standard as every other German sentence in
 * the app: the offline German rules must be silent on them, or the checker
 * would flag the teacher's own model as a mistake.
 */
import { LESSONS, LESSON_STAGES } from "../src/data/lessons.js";
import { GRAMMAR, FR_TENSES, DE_TENSES, DE_VERBS } from "../src/data/content.js";
import { DATA } from "../src/data/vocab.js";
import { DE_C1_VERBS } from "../src/data/verbs-c1.js";
import { germanLexicon, germanIssues } from "../src/lib/grammar.js";
import {
  normalizeAnswer, keyIdeas, checkInto, checkTyped, usesMissing, wordCount, lessonGloss,
} from "../src/lib/lessons.js";

const problems = [];
const fail = (m) => problems.push(m);

const TENSES = { fr: FR_TENSES, de: DE_TENSES };
const ROLES = new Set(["subject", "verb", "object", "complement", "adverbial", "clause", "agent"]);
const words = (s) => normalizeAnswer(s).split(" ").filter(Boolean);
const sorted = (a) => [...a].sort().join("|");

/* Every German noun in the deck, for the rebuild-opener guard below. */
const DE_NOUNS = new Set();
for (const lv of Object.keys(DATA.de)) for (const d of DATA.de[lv]) for (const w of d.words || []) if (w.g) DE_NOUNS.add(w.t);

let lessons = 0;
let items = 0;
const german = [];

for (const lang of ["fr", "de"]) {
  const ids = new Set();
  const noteTitles = GRAMMAR[lang].map((n) => n.title);

  for (const L of LESSONS[lang]) {
    lessons += 1;
    const at = (part) => `${L.id} ${part}`;
    if (ids.has(L.id)) fail(`${L.id}: duplicate id`);
    ids.add(L.id);

    for (const f of ["title", "titleEn", "level", "source", "context", "goals", "extract", "glossary", "understand", "structure", "grammar", "words", "nameIt", "translate", "yourTurn"])
      if (!L[f]) fail(at(`has no ${f}`));
    if (!L.source?.url || !L.source?.licence) fail(at("source needs a url and a licence line"));

    const extract = L.extract.map((p) => p.text).join(" ");
    const extractNorm = normalizeAnswer(extract);
    const inExtract = (s) => extractNorm.includes(normalizeAnswer(s));

    /* Every glossary entry has to be reachable by clicking a word in the text,
     * or it is dead weight that looks like coverage. */
    const tokens = new Set((extract.match(/[\p{L}\p{M}][\p{L}\p{M}'’-]*/gu) || []).map((t) => t.toLowerCase()));
    for (const key of Object.keys(L.glossary)) {
      const reachable = [...tokens].some((tok) => lessonGloss({ [key]: 1 }, tok));
      if (!reachable) fail(at(`glossary "${key}" matches no word in the extract`));
    }

    /* Understand */
    L.understand.forEach((q, i) => {
      items += 1;
      if (!(q.answer >= 0 && q.answer < q.options.length)) fail(at(`understand ${i + 1}: answer index out of range`));
      if (new Set(q.options).size !== q.options.length) fail(at(`understand ${i + 1}: duplicate options`));
      if (!q.why) fail(at(`understand ${i + 1}: no explanation`));
    });

    /* Structure: the chunks must really make up a sentence of the text. */
    L.structure.sentences.forEach((s, i) => {
      items += 1;
      const joined = s.chunks.map((c) => c.t).join(" ");
      if (!inExtract(joined)) fail(at(`structure ${i + 1}: its chunks do not add up to a passage of the text — «${joined.slice(0, 60)}…»`));
      if (!s.chunks.some((c) => c.role === "verb")) fail(at(`structure ${i + 1}: nothing to find — no chunk has the role "verb"`));
      for (const c of s.chunks) if (!ROLES.has(c.role)) fail(at(`structure ${i + 1}: unknown role "${c.role}"`));
      if (!s.note) fail(at(`structure ${i + 1}: no note`));
    });
    L.structure.rebuild.forEach((r, i) => {
      items += 1;
      const bank = sorted(words(r.chunks.join(" ")));
      if (!r.accept.length) fail(at(`rebuild ${i + 1}: no accepted order`));
      for (const a of r.accept)
        if (sorted(words(a)) !== bank) fail(at(`rebuild ${i + 1}: accepted order «${a}» does not use exactly the chunks offered`));
      if (lang === "de") r.accept.forEach((a, k) => german.push([at(`rebuild ${i + 1}.${k + 1}`), a]));
      /* The player lower-cases the opening chunk so its capital is not a clue.
       * That is only safe if the opening word is not a German noun, which
       * would keep its capital anywhere in the sentence. */
      const opener = r.chunks.find((c) => normalizeAnswer(r.accept[0]).startsWith(normalizeAnswer(c)));
      const firstWord = String(opener || "").split(" ")[0];
      if (lang === "de" && DE_NOUNS.has(firstWord)) fail(at(`rebuild ${i + 1}: opens with the noun "${firstWord}", which the player would wrongly lower-case`));
    });

    /* Grammar */
    const g = L.grammar;
    if (g.note && !noteTitles.includes(g.note)) fail(at(`grammar links to "${g.note}", which is not a ${lang} note`));
    for (const key of g.tenses || []) {
      const t = TENSES[lang].find((x) => x.key === key);
      if (!t) fail(at(`grammar names tense "${key}", which does not exist`));
      else if (!t.form) fail(at(`tense "${key}" has no form line to show`));
    }
    for (const p of g.points) {
      if ((p.body.join(" ").match(/\*\*/g) || []).length % 2) fail(at(`grammar "${p.heading}": unclosed **`));
      for (const ex of p.examples || []) if (((ex.t || "").match(/\*\*/g) || []).length % 2) fail(at(`grammar example «${ex.t}»: unclosed **`));
    }
    g.drill.forEach((d, i) => {
      items += 1;
      if (!d.prompt.includes("___")) fail(at(`drill ${i + 1}: no blank in the prompt`));
      if (!d.accept?.length) fail(at(`drill ${i + 1}: no answer`));
      if (!d.why) fail(at(`drill ${i + 1}: no explanation`));
      if (lang === "de") german.push([at(`drill ${i + 1}`), d.prompt.replace("___", d.accept[0])]);
    });

    /* Words: each quotation has to be from the text. */
    for (const w of L.words) {
      if (!w.def || !w.e) fail(at(`word "${w.t}" needs a definition and a gloss`));
      for (const part of String(w.from || "").split("…").map((x) => x.trim()).filter(Boolean))
        if (!inExtract(part)) fail(at(`word "${w.t}": «${part}» is quoted as from the text and is not in it`));
      if (lang === "de" && /^[A-ZÄÖÜ]/.test(w.t) && !w.g && !w.t.includes(" ")) fail(at(`noun "${w.t}" has no gender`));
    }

    /* Name it: a definition must not contain any answer it accepts — the
     * text's own word *or* a synonym in `also`. The synonyms were the gap: on
     * screen, « Rester dans le même état » accepted « rester », so the answer
     * was the definition's first word. Matched as a whole-word sequence, so a
     * multi-word answer counts too. */
    L.nameIt.forEach((n, i) => {
      items += 1;
      if (!n.accept?.length) fail(at(`name-it ${i + 1}: no answer`));
      const def = ` ${normalizeAnswer(n.def)} `;
      const givesAway = (a) => {
        const w = normalizeAnswer(a).replace(/^(s'|les |le |la |l')/, "");
        return w.length >= 3 && def.includes(` ${w} `);
      };
      for (const a of [...n.accept, ...Object.keys(n.also || {})])
        if (givesAway(a)) fail(at(`name-it ${i + 1}: the definition contains an answer it accepts, "${a}"`));
      for (const a of n.accept) {
        if (!checkTyped(a, n, lang).ok) fail(at(`name-it ${i + 1}: its own answer "${a}" does not pass`));
      }
      for (const a of Object.keys(n.also || {})) {
        if (!checkTyped(a, n, lang).ok) fail(at(`name-it ${i + 1}: the synonym "${a}" it promises to accept does not pass`));
      }
      /* The Words stage tells the learner to study these exact definitions,
       * so each one has to be there, word for word. */
      if (!L.words.some((w) => w.def === n.def))
        fail(at(`name-it ${i + 1}: definition is not one the Words stage shows`));
      if (n.g) {
        if (!checkTyped(`${n.g} ${n.accept[0]}`, n, lang).ok) fail(at(`name-it ${i + 1}: the answer with its own article does not pass`));
      }
    });

    /* Translate — every model must pass the check the learner will face. */
    L.translate.fromText.forEach((tr, i) => {
      items += 1;
      if (!inExtract(tr.t)) fail(at(`translate ${i + 1}: «${tr.t.slice(0, 50)}…» is not a sentence of the text`));
      const r = keyIdeas(tr.model, tr.key);
      if (!r.ok) fail(at(`translate ${i + 1}: the model translation misses its own key ideas ${r.missing.map((m) => `[${tr.key[m].join("/")}]`).join(" ")}`));
    });
    L.translate.intoTarget.forEach((tr, i) => {
      items += 1;
      const m = checkInto(tr.model, tr);
      if (!m.ok) fail(at(`into-${lang} ${i + 1}: the model «${tr.model}» is not among its own accepted answers`));
      for (const a of tr.accept) {
        const r = checkInto(a, tr);
        if (r.missing?.length) fail(at(`into-${lang} ${i + 1}: accepted answer «${a}» fails its own requirement: ${r.missing.join("; ")}`));
      }
      if (lang === "de") german.push([at(`into-de ${i + 1} model`), tr.model]);
    });

    /* Your turn */
    const y = L.yourTurn;
    const miss = usesMissing(y.model, y.uses);
    if (miss.length) fail(at(`your-turn model fails its own requirement: ${miss.join("; ")}`));
    if (wordCount(y.model) < y.min) fail(at(`your-turn model is ${wordCount(y.model)} words, under its own minimum of ${y.min}`));
    for (const u of y.uses || []) {
      try { new RegExp(u.re, "iu"); } catch { fail(at(`your-turn pattern ${u.re} is not a valid expression`)); }
    }
    if (lang === "de") german.push([at("your-turn model"), y.model]);

    /* The extract itself, for German: the rules should not flag Kafka. */
    if (lang === "de") L.extract.forEach((p, i) => german.push([at(`extract ¶${i + 1}`), p.text]));
  }
}

/* The German rules against every German sentence a lesson presents as right. */
const lex = germanLexicon({ data: DATA, verbs: [...DE_VERBS, ...DE_C1_VERBS] });
let alarms = 0;
for (const [where, s] of german) {
  for (const i of germanIssues(s, lex)) {
    alarms += 1;
    fail(`false alarm (${i.rule}) in ${where}: «${i.text}» → ${i.fixes.join(" / ") || "—"}`);
  }
}

if (LESSON_STAGES.length !== 8) fail(`expected 8 stages, found ${LESSON_STAGES.length}`);

if (problems.length) {
  console.error(`check-lessons: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-lessons: ${lessons} lessons, ${items} graded items OK; German rules silent on ${german.length} model sentences (${alarms} alarms)`);
