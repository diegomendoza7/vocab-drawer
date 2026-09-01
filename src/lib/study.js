/* Derivations behind the desktop study surfaces.
 *
 * These were inline in the component, which meant the only way to check them
 * was to drive a browser through a whole drill. They are pure functions of
 * their inputs, so they live here and are tested directly.
 */

import { cardId, daysUntil, cardStage, isDue } from "./srs.js";

/** Stage order, so the ledger can say how far a word has got. */
const STATUS = { unseen: 0, seen: 1, matched: 2, chosen: 3, typed: 4 };

/**
 * Every word in the current sitting, with how far it has got and how often it
 * has been missed.
 *
 * The per-stage records this reads are keyed three different ways — question
 * ids (`level::headword::kind`) in the choose and typing sets, bare headwords
 * in `matchedIds`, and `cardId` in the results map — so the reconciling
 * happens here rather than in each caller.
 */
export function buildBatchLedger({
  entries, lang, screen, stepIndex, learnIdx,
  matchedIds = [], chooseSeen = new Set(), practiceSeen = new Set(), results = new Map(),
}) {
  return entries.map(({ word, level }, i) => {
    const id = cardId(lang, level, word.t);
    const prefix = `${level}::${word.t}::`;
    const hit = (set) => {
      for (const x of set) if (typeof x === "string" && x.startsWith(prefix)) return true;
      return false;
    };

    let status = "unseen";
    /* Past Learn every word has been shown at least once; during it, position
     * in the deck is what says so. */
    if (stepIndex > 0 || (screen === "learn" && i <= learnIdx)) status = "seen";
    if (matchedIds.includes(word.t)) status = "matched";
    if (hit(chooseSeen)) status = "chosen";
    if (hit(practiceSeen)) status = "typed";

    return {
      cardId: id,
      word,
      level,
      status,
      rank: STATUS[status],
      misses: results.get(id)?.wrongCount ?? 0,
      display: lang === "de" && word.g ? `${word.g} ${word.t}` : word.t,
    };
  });
}

/**
 * The end-of-sitting record, one row per word.
 *
 * `scheduled` is what `commitSession` actually wrote, captured at commit time.
 * Re-deriving the due date here would be wrong: committing and navigating to
 * the summary happen in one handler, so by the time this runs the stored card
 * is already scheduled and running the scheduler over it again would advance
 * every interval a second time.
 */
export function buildSummaryRows({ results, scheduled = {}, cards = {}, lang }) {
  return [...results.entries()].map(([id, r]) => {
    const card = scheduled[id] || cards[id];
    return {
      cardId: id,
      word: r.word,
      level: r.level,
      firstTry: r.wrongCount === 0,
      misses: r.wrongCount,
      dueInDays: card ? daysUntil(card.due) : 0,
      display: lang === "de" && r.word.g ? `${r.word.g} ${r.word.t}` : r.word.t,
    };
  });
}

/**
 * One cell of the verb × tense coverage map.
 *
 * `drilled` is tracked separately from `due` because `isDue(undefined)` is
 * true — a card you have never seen is due by definition. Testing `isDue`
 * alone would paint every untouched cell as due, and a map where "never
 * drilled" and "ready for review" look identical answers no question.
 */
export function matrixCell(card) {
  return {
    drilled: !!card,
    stage: card ? cardStage(card) : null,
    due: !!card && isDue(card),
  };
}
