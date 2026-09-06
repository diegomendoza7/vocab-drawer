/* Collocations: choosing the verb the noun demands.
 *
 * The drill is deliberately one-directional. Given `une décision`, produce
 * `prendre` — because that is the direction the error runs in: a learner
 * reaching for a verb, and English handing them the wrong one. Asking the
 * reverse ("what does prendre une décision mean?") tests comprehension, which
 * was never the problem.
 */

import { COLLOCATIONS } from "../data/collocations.js";

export function collocationsFor(lang) {
  return COLLOCATIONS.filter((c) => c.lang === lang);
}

/** Every distinct verb in a language's set — the pool a wrong option can use. */
export function verbsIn(lang) {
  return [...new Set(collocationsFor(lang).map((c) => c.verb))];
}

/**
 * One question: the noun, and three verbs to choose between.
 *
 * The wrong options are the ones the entry declares, because they are the
 * verbs a learner actually reaches for — the English calque and a near
 * synonym. Filling the slots with random verbs would make the question
 * answerable by elimination rather than by knowing the pairing.
 */
export function buildCollocationQuiz(list, index) {
  if (!list.length) return null;
  const i = ((index % list.length) + list.length) % list.length;
  const item = list[i];
  const wrong = (item.wrong || []).filter((w) => w && w !== item.verb).slice(0, 2);
  if (wrong.length < 2) return null;
  /* Rotated by the index rather than shuffled, so a re-render cannot move the
   * options under the cursor between reading them and clicking one. */
  const options = [item.verb, ...wrong]
    .map((v, k) => ({ v, k: (i + k * 7) % 3 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);
  return { item, prompt: item.noun, answer: item.verb, options, en: item.en, trap: item.trap };
}

/** Case- and accent-insensitive, since the point is the verb, not the spelling. */
export function gradeCollocation(input, answer) {
  const norm = (s) => String(s || "").trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  return norm(input) === norm(answer) && norm(input).length > 0;
}

/** How many of a round were right, and which entries to show again. */
export function scoreCollocations(answers) {
  const right = answers.filter((a) => a.ok).length;
  return { asked: answers.length, right, missed: answers.filter((a) => !a.ok).map((a) => a.item) };
}
