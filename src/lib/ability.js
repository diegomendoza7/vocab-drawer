/* What the learner can do — as opposed to what they have been doing.
 *
 * The progress screen counted activity: a streak, answers today, reviews
 * coming due, drawers started. All of that says you turned up. None of it
 * answers the question a learner actually has, which is "how far along am I".
 *
 * Everything here is *measured*, and the wording is chosen so that it stays
 * measured. The app knows which words have survived a gap and come back
 * correctly, and it now knows that separately for recognising a word and for
 * producing one — so it can say "you are holding 340 words, and can produce
 * 120 of them", which is a true sentence about ability. It does not say "you
 * know 340 words", because a card at a seven-day interval is not the same
 * claim, and the difference is exactly the kind of inflation that makes a
 * progress screen stop meaning anything.
 */
import { cardId, PROD_SUFFIX } from "./srs.js";

/* An interval is the only evidence of retention the app has: a card at seven
 * days has survived a week-long gap at least once. Twenty-one is the same
 * threshold `cardStage` already calls "mature", reused rather than invented. */
export const HOLDING_DAYS = 7;
export const SOLID_DAYS = 21;

const countsFor = (card) => ({
  met: !!card,
  holding: !!card && (card.interval || 0) >= HOLDING_DAYS,
  solid: !!card && (card.interval || 0) >= SOLID_DAYS,
});

/**
 * Words met, held and solid, in each direction.
 *
 * `rankOf` is optional; when given, the same counts are reported for the
 * 1,000 and 2,000 most frequent word forms — the bands that actually decide
 * whether ordinary text is readable, and a far better measure of reach than a
 * raw total that a thousand rare words could inflate.
 */
export function abilityFrom({ entries, lang, cards = {}, rankOf = null }) {
  const blank = () => ({ met: 0, holding: 0, solid: 0 });
  const recognise = blank();
  const produce = blank();
  const bands = { top1000: blank(), top2000: blank() };

  for (const entry of entries) {
    const word = entry.word || entry;
    if (!word?.t) continue;
    const id = cardId(lang, entry.level, word.t);
    const rec = countsFor(cards[id]);
    /* Production falls back to the recognition card exactly as the queue does:
     * before the split there was one card covering both, and reporting those
     * words as "never produced" would understate a real learner's history. */
    const prod = countsFor(cards[id + PROD_SUFFIX] ?? cards[id]);

    for (const k of ["met", "holding", "solid"]) {
      if (rec[k]) recognise[k] += 1;
      if (prod[k]) produce[k] += 1;
    }

    if (rankOf) {
      const r = rankOf(lang, word.t);
      if (r && r <= 2000) {
        for (const k of ["met", "holding", "solid"]) {
          if (!rec[k]) continue;
          if (r <= 1000) bands.top1000[k] += 1;
          bands.top2000[k] += 1;
        }
      }
    }
  }

  return { recognise, produce, bands, total: entries.length };
}

/**
 * The gap between recognising and producing, as a share.
 *
 * Normal and expected — everybody recognises more than they can produce — so
 * this exists to be *shown* rather than to be corrected. It is only worth
 * remarking on when it is wide.
 */
export function productionGap(ability) {
  const r = ability?.recognise?.holding || 0;
  const p = ability?.produce?.holding || 0;
  if (!r) return { share: 0, wide: false };
  return { share: p / r, wide: r >= 20 && p / r < 0.5 };
}

/**
 * One honest sentence about reach.
 *
 * Deliberately phrased as words held rather than as a coverage percentage.
 * The frequency data here is a rank list with no counts in it, so a "you can
 * read 84% of ordinary text" figure would be borrowed from the literature and
 * presented as if it had been measured on this learner. What *is* measured is
 * how many of the commonest words they are holding, and that is what it says.
 */
export function reachSentence(ability) {
  const held = ability?.bands?.top1000?.holding || 0;
  const held2 = ability?.bands?.top2000?.holding || 0;
  if (!held2) return "Hold a few of the commonest words and this will start to fill in.";
  return `You are holding ${held} of the 1,000 commonest words, and ${held2} of the commonest 2,000 — the band that decides whether ordinary text reads easily.`;
}
