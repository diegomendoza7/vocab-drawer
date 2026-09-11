/* Offline checks for the reading library, the writing prompts, and the German
 * grammar rules.
 *
 * Four failures here would be invisible on screen:
 *
 *   - A passage outside its level's length band. An "A1" page of 300 words
 *     is not an A1 page.
 *   - A model answer that misses its own key ideas. A learner who wrote the
 *     model answer word for word would be told they left something out.
 *   - A key idea the question gives away. If an alternative for an idea
 *     appears in the question, restating the question "finds" it.
 *   - A model answer that is not itself a full sentence, in an exercise whose
 *     whole point is answering in full sentences.
 *
 * And one that would be worse than invisible:
 *
 *   - A German rule that fires on correct German. Every German sentence the
 *     app holds — the deck's 1,500-odd examples, and every passage, question,
 *     model answer and prompt here — must come back clean. A checker that
 *     objects to the model text teaches the learner to ignore the checker.
 */
import { DATA, LEVELS } from "../src/data/vocab.js";
import { DE_VERBS } from "../src/data/content.js";
import { DE_C1_VERBS } from "../src/data/verbs-c1.js";
import { PASSAGES, GENRES, LEVEL_WORDS, MIN_ANSWER_WORDS, passageText, wordCount } from "../src/data/reading/index.js";
import { WRITING_PROMPTS } from "../src/data/writing-prompts.js";
import { keyIdeas, sentenceShape, vocabProfile, loadRanks } from "../src/lib/writing.js";
import { germanLexicon, germanIssues } from "../src/lib/grammar.js";

const PER_LEVEL = 3;                  // passages per level per language, at least
const problems = [];
const fail = (m) => problems.push(m);
const ids = new Set();

for (const lang of ["fr", "de"]) {
  for (const lv of LEVELS) {
    const n = PASSAGES[lang].filter((p) => p.level === lv).length;
    if (n < PER_LEVEL) fail(`${lang} ${lv}: ${n} passages, want at least ${PER_LEVEL}`);
  }

  for (const p of PASSAGES[lang]) {
    const at = p.id || "(no id)";
    if (ids.has(p.id)) fail(`${at}: duplicate id`);
    ids.add(p.id);
    if (!LEVELS.includes(p.level)) fail(`${at}: unknown level ${p.level}`);
    else if (!p.id.startsWith(`${lang}-${p.level.toLowerCase()}-`)) fail(`${at}: id should start "${lang}-${p.level.toLowerCase()}-"`);
    if (!GENRES[p.genre]) fail(`${at}: unknown genre "${p.genre}"`);
    if (!p.title || !p.titleEn) fail(`${at}: needs title and titleEn`);
    (p.paras || []).forEach((pair, i) => {
      if (!Array.isArray(pair) || !pair[0]?.trim() || !pair[1]?.trim()) fail(`${at} ¶${i + 1}: needs the text and its English`);
    });

    const words = wordCount(passageText(p));
    const [lo, hi] = LEVEL_WORDS[p.level] || [0, Infinity];
    if (words < lo || words > hi) fail(`${at}: ${words} words — ${p.level} wants ${lo}–${hi}`);

    const wantQ = p.level === "A1" || p.level === "A2" ? 3 : 4;
    if ((p.questions || []).length < wantQ) fail(`${at}: ${(p.questions || []).length} questions, want ${wantQ}`);
    (p.questions || []).forEach((q, i) => {
      const qat = `${at} Q${i + 1}`;
      if (!q.q || !q.en || !q.answer || !Array.isArray(q.key) || !q.key.length) {
        fail(`${qat}: needs q, en, answer and key`);
        return;
      }
      const own = keyIdeas(q.answer, q.key);
      if (own.missing.length) fail(`${qat}: the model answer misses its own key idea ${own.missing.map((m) => JSON.stringify(q.key[m])).join(", ")}`);
      q.key.forEach((group, gi) => {
        const given = group.filter((v) => keyIdeas(q.q, [[v]]).found.length);
        if (given.length) fail(`${qat}: key idea ${gi + 1} is given away by the question (${given.join(", ")})`);
      });
      const shape = sentenceShape(q.answer, MIN_ANSWER_WORDS[p.level]);
      if (shape.short || !shape.capital || !shape.ends) fail(`${qat}: the model answer is not a full sentence — "${q.answer}"`);
    });

    if (!p.write?.q || !p.write?.en || !(p.write?.min > 0)) fail(`${at}: needs a writing prompt (q, en, min)`);
  }
}

/* Writing prompts: both languages, every level. */
const promptIds = new Set();
for (const w of WRITING_PROMPTS) {
  if (promptIds.has(w.id)) fail(`prompt ${w.id}: duplicate id`);
  promptIds.add(w.id);
  if (!LEVELS.includes(w.level)) fail(`prompt ${w.id}: unknown level ${w.level}`);
  if (!w.en || !w.fr || !w.de) fail(`prompt ${w.id}: needs en, fr and de`);
  if (!(w.min > 0)) fail(`prompt ${w.id}: needs a minimum length`);
}
for (const lv of LEVELS) {
  const n = WRITING_PROMPTS.filter((w) => w.level === lv).length;
  if (n < 3) fail(`prompts ${lv}: ${n}, want at least 3`);
}

/* The German rules against every German sentence in the app. */
const lex = germanLexicon({ data: DATA, verbs: [...DE_VERBS, ...DE_C1_VERBS] });
const german = [];
for (const lv of Object.keys(DATA.de))
  for (const d of DATA.de[lv])
    for (const w of d.words || []) if (w.s) german.push([`deck ${lv} "${w.t}"`, w.s]);
for (const p of PASSAGES.de) {
  p.paras.forEach(([t], i) => german.push([`${p.id} ¶${i + 1}`, t]));
  p.questions.forEach((q, i) => {
    german.push([`${p.id} Q${i + 1}`, q.q]);
    german.push([`${p.id} A${i + 1}`, q.answer]);
  });
  german.push([`${p.id} write`, p.write.q]);
}
for (const w of WRITING_PROMPTS) german.push([`prompt ${w.id}`, w.de]);
let alarms = 0;
for (const [where, s] of german) {
  for (const i of germanIssues(s, lex)) {
    alarms += 1;
    fail(`false alarm (${i.rule}) in ${where}: «${i.text}» → ${i.fixes.join(" / ") || "—"} — ${s.slice(0, 100)}`);
  }
}

/* The vocabulary should get rarer as the level rises. Not a strict order —
 * a C1 column can be plainer than a B2 essay — but the ends must differ, or
 * the levels are labels and not levels. */
const profileLine = [];
for (const lang of ["fr", "de"]) {
  const ranks = await loadRanks(lang);
  const mean = (lv) => {
    const ps = PASSAGES[lang].filter((p) => p.level === lv);
    return ps.reduce((s, p) => s + vocabProfile(passageText(p), lang, { ranks }).beyond2k, 0) / (ps.length || 1);
  };
  const byLevel = LEVELS.map((lv) => [lv, mean(lv)]);
  profileLine.push(`${lang} ${byLevel.map(([lv, m]) => `${lv} ${(m * 100).toFixed(0)}%`).join(" · ")}`);
  if (byLevel[byLevel.length - 1][1] <= byLevel[0][1]) fail(`${lang}: C1 passages use no rarer vocabulary than A1 ones`);
}

const total = PASSAGES.fr.length + PASSAGES.de.length;
const questions = [...PASSAGES.fr, ...PASSAGES.de].reduce((n, p) => n + p.questions.length, 0);
if (problems.length) {
  console.error(`check-reading: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-reading: ${total} passages, ${questions} questions, ${WRITING_PROMPTS.length} prompts OK; `
  + `German rules silent on ${german.length} correct sentences (${alarms} alarms)`);
console.log(`  words beyond the top 2,000 — ${profileLine.join(" | ")}`);
