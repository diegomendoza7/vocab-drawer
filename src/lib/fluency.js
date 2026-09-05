/* Fluency development: getting fast at what you already know.
 *
 * This is the strand the app was missing. Everything else here asks "do you
 * know this?"; nothing asked "can you get it in under two seconds?" — and those
 * are different abilities. A word retrieved in six seconds is known; a word
 * retrieved in one is usable in speech. Only the second survives a conversation.
 *
 * Nation's four conditions for fluency work, and how each one lands here:
 *
 *   1. The material must be EASY — no unknown language at all. So the pool is
 *      cards that have already survived a week, leeches excluded, and even the
 *      wrong options are drawn from words you know. A fluency round containing
 *      anything unlearned is just a test with a clock on it.
 *   2. The focus is on MEANING, not form. Three glosses, tap one; no spelling,
 *      no accents, nothing that measures typing speed instead of recall.
 *   3. There must be PRESSURE to go faster than usual — hence the countdown.
 *   4. There must be QUANTITY. The queue cycles rather than running out, so the
 *      clock is always what ends the round.
 *
 * The scheduler is deliberately untouched. A miss here is nearly always a speed
 * failure rather than a knowledge failure, and letting the clock damage a mature
 * card would punish the learner for doing the exercise correctly.
 */

import { cardStage, isLeech } from "./srs.js";

export const ROUND_SECONDS = 60;
/** Below this there is not enough known material for the round to be easy. */
export const MIN_POOL = 8;
/* The floor for "known well enough to race".
 *
 * This started at 7 days — the scheduler's own "young" line — and that was too
 * strict to be right. Reaching interval 7 takes three correct reviews spread
 * over four days, so a new learner met a locked door for most of their first
 * week, which is exactly when a visible win matters most.
 *
 * Condition 1 says the material must be EASY, not that it must be old. A word
 * answered correctly twice and still standing after a couple of days is easy;
 * what has to stay out is material never successfully retrieved at all, and
 * leeches. Interval 3 is reachable on day one and still means two clean
 * retrievals.
 */
export const KNOWN_INTERVAL = 3;
export const KNOWN_REPS = 2;
/** Above this a word is properly settled — better material, but not required. */
export const SETTLED_INTERVAL = 7;
export const OPTION_COUNT = 3;
/* Three options means guessing scores about a third. A personal best that can
 * be reached by tapping randomly is not a record of anything, so speed only
 * counts when the answers were mostly right. */
export const MIN_ACCURACY_FOR_BEST = 0.8;

/**
 * The words known well enough to practise for speed.
 *
 * Two clean retrievals and an interval of a few days — see KNOWN_INTERVAL for
 * why the bar sits there rather than at the scheduler's "young" line. Leeches
 * are excluded whatever their interval: a word that has lapsed eight times is
 * not known, and racing it teaches guessing.
 */
export function eligibleForFluency({ entries, lang, cards = {}, cardIdFor }) {
  const out = [];
  for (const entry of entries) {
    const word = entry.word || entry;
    const level = entry.level;
    if (!word?.t || !word?.e) continue;
    const card = cards[cardIdFor(lang, level, word.t)];
    if (!card || isLeech(card)) continue;
    if ((card.reps ?? 0) < KNOWN_REPS) continue;
    if ((card.interval ?? 0) < KNOWN_INTERVAL) continue;
    out.push({ word, level, settled: (card.interval ?? 0) >= SETTLED_INTERVAL, stage: cardStage(card) });
  }
  return out;
}

/**
 * How close a learner is to opening the section, and what to do about it.
 *
 * A locked feature that only says "not yet" is a dead end. This returns the
 * counts behind the gate so the screen can say which words are nearly there and
 * how many more are needed — the difference between a refusal and an
 * instruction.
 */
export function fluencyReadiness({ entries, lang, cards = {}, cardIdFor }) {
  let studied = 0, almost = 0;
  for (const entry of entries) {
    const word = entry.word || entry;
    if (!word?.t) continue;
    const card = cards[cardIdFor(lang, entry.level, word.t)];
    if (!card || (card.reps ?? 0) === 0) continue;
    studied += 1;
    /* Studied, not a leech, but not yet at the interval — one more correct
     * review moves each of these into the pool. */
    if (!isLeech(card) && (card.interval ?? 0) < KNOWN_INTERVAL) almost += 1;
  }
  return { studied, almost };
}

/** A small deterministic shuffle, so a round is reproducible from its seed. */
function seeded(list, seed) {
  return list
    .map((item, i) => ({ item, k: (i * 2654435761 + seed * 40503) % 100000 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item);
}

const senseOf = (w) => String(w.e || "").split(/[,;/(]/)[0].trim();

/**
 * One question: a prompt, the right answer, and two wrong ones.
 *
 * The distractors come from the same eligible pool — words the learner also
 * knows — because an unknown word among the options reintroduces exactly the
 * difficulty this exercise exists to remove. They are also filtered so no two
 * options mean the same thing, which would make the question unanswerable.
 */
export function buildFluencyItem(pool, index, direction) {
  if (pool.length < OPTION_COUNT) return null;
  const target = pool[index % pool.length];
  const answer = direction === "produce" ? target.word.t : senseOf(target.word);
  const seenSense = new Set([senseOf(target.word).toLowerCase()]);
  const seenForm = new Set([target.word.t.toLowerCase()]);

  const others = [];
  for (let step = 1; others.length < OPTION_COUNT - 1 && step < pool.length; step += 1) {
    const cand = pool[(index + step * 7 + 3) % pool.length];
    const sense = senseOf(cand.word).toLowerCase();
    const form = cand.word.t.toLowerCase();
    if (seenSense.has(sense) || seenForm.has(form)) continue;
    seenSense.add(sense);
    seenForm.add(form);
    others.push(cand);
  }
  if (others.length < OPTION_COUNT - 1) return null;

  const options = seeded(
    [target, ...others].map((c) => (direction === "produce" ? c.word.t : senseOf(c.word))),
    index + 1,
  );
  return {
    key: `${target.level}:${target.word.t}`,
    prompt: direction === "produce" ? senseOf(target.word) : target.word.t,
    answer,
    options,
    word: target.word,
    level: target.level,
  };
}

/**
 * The round, long enough that the clock is what ends it.
 *
 * Condition 4 is quantity, so this cycles the pool rather than stopping at its
 * end — a fast learner with twelve known words should still be answering when
 * the timer runs out, not sitting on an empty queue.
 */
export function buildFluencyRound(pool, direction, seed = 0, length = 60) {
  const order = seeded(pool, seed + 1);
  const items = [];
  for (let i = 0; items.length < length && i < length * 3; i += 1) {
    const item = buildFluencyItem(order, i, direction);
    if (item) items.push(item);
  }
  return items;
}

/** Correct answers per minute, with the accuracy that produced them. */
export function scoreRound(answers, seconds = ROUND_SECONDS) {
  const attempted = answers.length;
  const correct = answers.filter((a) => a.ok).length;
  const accuracy = attempted ? correct / attempted : 0;
  const perMinute = seconds > 0 ? (correct / seconds) * 60 : 0;
  return { attempted, correct, accuracy, perMinute: Math.round(perMinute * 10) / 10 };
}

/** A record only stands if the answers behind it were mostly right. */
export function qualifiesAsBest(score) {
  return score.attempted > 0 && score.accuracy >= MIN_ACCURACY_FOR_BEST;
}

/**
 * Merge a finished round into the saved record for this language and direction.
 *
 * Keeps the best qualifying score and a short history — the history is the
 * point, because the whole claim of fluency work is that speed moves, and a
 * learner has no way to feel that without seeing it plotted.
 */
export function recordRound(prev, score, today, keep = 30) {
  const base = prev || { best: 0, runs: [] };
  const runs = [...base.runs, { d: today, s: score.perMinute, a: Math.round(score.accuracy * 100) }].slice(-keep);
  const best = qualifiesAsBest(score) ? Math.max(base.best || 0, score.perMinute) : base.best || 0;
  return { best, runs };
}

/** What the round is worth saying afterwards, in one line. */
export function roundVerdict(score, prevBest) {
  if (!score.attempted) return "No answers — the clock ran out before anything was tapped.";
  if (!qualifiesAsBest(score)) {
    return `${Math.round(score.accuracy * 100)}% right. Speed only counts when the answers do — slow down until you are above ${Math.round(MIN_ACCURACY_FOR_BEST * 100)}%.`;
  }
  if (prevBest && score.perMinute > prevBest) return `A new best: ${score.perMinute} a minute, up from ${prevBest}.`;
  if (prevBest) return `${score.perMinute} a minute. Your best is ${prevBest}.`;
  return `${score.perMinute} a minute — that is the number to beat.`;
}
