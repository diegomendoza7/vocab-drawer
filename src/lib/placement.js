/* Where to start, for someone who is not starting from nothing.
 *
 * The app had one answer for a new learner and it was A1, drawer one, word
 * one. Someone arriving with two years of school French had no way to say so
 * except to click past hundreds of words they already knew, and nothing in the
 * app ever formed an opinion about what they could already do.
 *
 * This is a short adaptive check of *recognition* vocabulary, level by level,
 * in the tradition of the yes/no vocabulary size tests (Meara & Buxton 1987) —
 * except that it asks for the meaning rather than for a self-report, because
 * self-reports are reliably generous and a multiple choice is self-verifying.
 *
 * Two things it deliberately does NOT do:
 *
 *   - It does not write SM-2 cards. Marking six hundred words "known" from a
 *     thirty-word sample would be inventing evidence, and the scheduler would
 *     then be pacing reviews off numbers nobody earned. It recommends a level
 *     and records an estimate; the cards are still earned one at a time.
 *   - It does not claim precision. The estimate is a sample scaled to a level,
 *     and is shown with the sample size attached so it reads as the rough
 *     measure it is.
 */

export const PLACEMENT_LEVELS = ["A1", "A2", "B1", "B2", "C1"];

/** Questions asked per level. Six is enough to separate 0.33 from 0.83. */
export const PER_LEVEL = 6;

/** Share correct needed to count a level as held. */
export const PASS = 0.6;

/** Below this the ceiling has been found and the test stops. */
export const FLOOR = 0.34;

export const OPTIONS = 4;

/* A small deterministic shuffle, so a test can predict the sample and a
 * retake with a different seed gets different words. */
function shuffled(list, seed) {
  const out = [...list];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const glossOf = (w) => (w?.e && w.e !== "(no gloss)" ? w.e : null);

/**
 * One level's questions: a word, and four meanings to choose between.
 *
 * Distractors come from the same level, so the choice is between words of
 * comparable difficulty — drawing them from across the deck would let someone
 * pass a C1 item by eliminating three A1 meanings.
 */
export function buildPlacementLevel(words, level, { perLevel = PER_LEVEL, seed = 1 } = {}) {
  const usable = words.filter((w) => w?.t && glossOf(w));
  /* Distinct meanings only: two words that both gloss as "to leave" make a
   * question with two right answers. */
  const byGloss = new Map();
  for (const w of usable) if (!byGloss.has(glossOf(w))) byGloss.set(glossOf(w), w);
  const pool = [...byGloss.values()];
  if (pool.length < OPTIONS) return [];

  const picked = shuffled(pool, seed).slice(0, Math.min(perLevel, pool.length));
  return picked.map((word, i) => {
    const others = shuffled(pool.filter((w) => w !== word), seed + i + 1)
      .slice(0, OPTIONS - 1)
      .map(glossOf);
    return {
      id: `${level}::${word.t}`,
      word,
      level,
      answer: glossOf(word),
      options: shuffled([glossOf(word), ...others], seed + 97 + i),
    };
  });
}

/** Has the test found its ceiling — is there any point asking the next level? */
export function shouldContinue(share) {
  return share > FLOOR;
}

/**
 * What a completed test says.
 *
 * `byLevel` is `{ A1: {right, asked}, … }` for the levels actually asked;
 * `sizes` is how many words each level holds, for scaling the sample up.
 *
 * The recommended level is the highest one *passed*, not the highest one
 * attempted — someone who scores 5/6 at B1 and 1/6 at B2 is a B1. When even
 * A1 is not passed, the answer is A1: there is nowhere lower to start, and
 * telling someone they are below the first level helps nobody.
 */
export function placementResult(byLevel, sizes = {}) {
  const rows = PLACEMENT_LEVELS.filter((lv) => byLevel[lv]?.asked).map((lv) => {
    const { right, asked } = byLevel[lv];
    return { level: lv, right, asked, share: asked ? right / asked : 0 };
  });
  if (!rows.length) return { level: "A1", rows: [], estimate: 0, asked: 0, tested: [] };

  const passed = rows.filter((r) => r.share >= PASS);
  const level = passed.length ? passed[passed.length - 1].level : "A1";

  /* Scale each level's sample to that level's size. Levels never reached are
   * counted as zero rather than guessed at — the test stopped because the
   * evidence said it would find nothing there. */
  const estimate = rows.reduce((n, r) => n + Math.round(r.share * (sizes[r.level] || 0)), 0);

  return {
    level,
    rows,
    estimate,
    asked: rows.reduce((n, r) => n + r.asked, 0),
    tested: rows.map((r) => r.level),
  };
}

/** One sentence for what the result means, in plain words. */
export function placementSummary(result) {
  if (!result?.asked) return "";
  if (result.rows.every((r) => r.share < PASS)) {
    /* Quote the *first* level's score, since that is the one being named.
     * Reading the last row here reported the A2 score as though it were the
     * A1 one, and contradicted the table printed directly beneath it. */
    const first = result.rows[0];
    return `Starting at ${first.level}. You got ${first.right} of ${first.asked} at ${first.level}, so there is real ground to cover — which is what the first drawers are for.`;
  }
  return `Starting at ${result.level}. Based on ${result.asked} words sampled across ${result.tested.length} level${result.tested.length === 1 ? "" : "s"} — a rough measure, not a grade.`;
}
