import { describe, it, expect } from "vitest";
import { abilityFrom, productionGap, reachSentence, HOLDING_DAYS, SOLID_DAYS } from "./ability.js";

const entry = (t, level = "A1") => ({ word: { t, e: t }, level });
const card = (interval) => ({ interval, retainedDays:interval,reps: 3, lapses: 0, ease: 2.3, due: "2026-10-01" });

describe("abilityFrom", () => {
  it("counts a word as held only once it has survived a real gap", () => {
    const entries = [entry("a"), entry("b"), entry("c")];
    const cards = {
      "fr:A1:a": card(1),                 // met, not held
      "fr:A1:b": card(HOLDING_DAYS),      // held
      "fr:A1:c": card(SOLID_DAYS),        // held and solid
    };
    const ab = abilityFrom({ entries, lang: "fr", cards });
    expect(ab.recognise).toEqual({ met: 3, holding: 2, solid: 1 });
  });

  it("counts recognition and production separately", () => {
    const entries = [entry("a"), entry("b")];
    const cards = {
      "fr:A1:a": card(30), "fr:A1:a::prod": card(1),
      "fr:A1:b": card(30), "fr:A1:b::prod": card(30),
    };
    const ab = abilityFrom({ entries, lang: "fr", cards });
    expect(ab.recognise.holding).toBe(2);
    expect(ab.produce.holding).toBe(1);
  });

  it("keeps legacy recognition separate from unmeasured production", () => {
    /* Their single card covered both directions, so reporting zero produced
     * would be wrong about history the app actually has. */
    const ab = abilityFrom({ entries: [entry("a")], lang: "fr", cards: { "fr:A1:a": card(30) } });
    expect(ab.produce.holding).toBe(0);
  });

  it("counts nothing for a word never studied", () => {
    const ab = abilityFrom({ entries: [entry("a")], lang: "fr", cards: {} });
    expect(ab.recognise).toEqual({ met: 0, holding: 0, solid: 0 });
    expect(ab.produce).toEqual({ met: 0, holding: 0, solid: 0 });
  });

  it("reports the frequency bands when it is given ranks", () => {
    const entries = [entry("the"), entry("mid"), entry("rare")];
    const cards = { "fr:A1:the": card(30), "fr:A1:mid": card(30), "fr:A1:rare": card(30) };
    const rankOf = (_l, t) => ({ the: 12, mid: 1500, rare: 9000 })[t] || null;
    const ab = abilityFrom({ entries, lang: "fr", cards, rankOf });
    expect(ab.bands.top1000.holding).toBe(1);
    expect(ab.bands.top2000.holding).toBe(2);   // includes the top-1000 word
  });

  it("leaves the bands empty rather than guessing when no ranks are given", () => {
    const ab = abilityFrom({ entries: [entry("a")], lang: "fr", cards: { "fr:A1:a": card(30) } });
    expect(ab.bands.top2000).toEqual({ met: 0, holding: 0, solid: 0 });
  });
});

describe("productionGap", () => {
  it("is not called wide on a handful of words", () => {
    const ab = { recognise: { holding: 6 }, produce: { holding: 1 } };
    expect(productionGap(ab).wide).toBe(false);
  });

  it("is wide when half the words recognised cannot be produced", () => {
    const ab = { recognise: { holding: 100 }, produce: { holding: 20 } };
    const g = productionGap(ab);
    expect(g.wide).toBe(true);
    expect(g.share).toBeCloseTo(0.2);
  });

  it("does not divide by zero before anything is held", () => {
    expect(productionGap({ recognise: { holding: 0 }, produce: { holding: 0 } })).toEqual({ share: 0, wide: false });
  });
});

describe("reachSentence", () => {
  it("says what is measured — words held, not a coverage percentage", () => {
    const s = reachSentence({ bands: { top1000: { holding: 300 }, top2000: { holding: 700 } } });
    expect(s).toMatch(/300 of the 1,000/);
    expect(s).toMatch(/700/);
    expect(s).not.toMatch(/%/);
  });

  it("invites a start rather than reporting a zero", () => {
    expect(reachSentence({ bands: { top1000: { holding: 0 }, top2000: { holding: 0 } } })).toMatch(/fill in/);
  });
});
