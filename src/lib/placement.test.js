import { describe, it, expect } from "vitest";
import {
  buildPlacementLevel, placementResult, placementSummary, shouldContinue,
  PLACEMENT_LEVELS, PASS, FLOOR, OPTIONS,
} from "./placement.js";

const words = (n, prefix = "w") =>
  Array.from({ length: n }, (_, i) => ({ t: `${prefix}${i}`, e: `meaning ${prefix}${i}` }));

describe("buildPlacementLevel", () => {
  it("asks for the meaning, with four options one of which is right", () => {
    const qs = buildPlacementLevel(words(20), "A1");
    expect(qs).toHaveLength(6);
    for (const q of qs) {
      expect(q.options).toHaveLength(OPTIONS);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(OPTIONS);   // no duplicate meanings
    }
  });

  it("draws distractors from the same level, so difficulty is comparable", () => {
    const qs = buildPlacementLevel(words(20, "b1"), "B1");
    const glosses = new Set(words(20, "b1").map((w) => w.e));
    for (const q of qs) for (const o of q.options) expect(glosses.has(o)).toBe(true);
  });

  it("never offers the same meaning twice, even when two words share a gloss", () => {
    const list = [
      { t: "partir", e: "to leave" }, { t: "quitter", e: "to leave" },
      { t: "manger", e: "to eat" }, { t: "boire", e: "to drink" },
      { t: "voir", e: "to see" }, { t: "aller", e: "to go" },
    ];
    for (const q of buildPlacementLevel(list, "A1")) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("skips words with no usable gloss rather than asking an unanswerable question", () => {
    const list = [...words(6), { t: "x", e: "(no gloss)" }, { t: "y" }];
    const qs = buildPlacementLevel(list, "A1");
    for (const q of qs) {
      expect(q.answer).toBeTruthy();
      expect(q.answer).not.toBe("(no gloss)");
    }
  });

  it("returns nothing rather than a broken question when the level is too small", () => {
    expect(buildPlacementLevel(words(3), "C1")).toEqual([]);
  });

  it("gives a different sample for a different seed, so a retake is not the same test", () => {
    const a = buildPlacementLevel(words(40), "A1", { seed: 1 }).map((q) => q.word.t);
    const b = buildPlacementLevel(words(40), "A1", { seed: 99 }).map((q) => q.word.t);
    expect(a).not.toEqual(b);
  });

  it("is deterministic for one seed, so a re-render does not reshuffle mid-test", () => {
    const a = buildPlacementLevel(words(40), "A1", { seed: 7 });
    const b = buildPlacementLevel(words(40), "A1", { seed: 7 });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a[0].options).toEqual(b[0].options);
  });
});

describe("shouldContinue", () => {
  it("stops once a level is clearly past the learner", () => {
    expect(shouldContinue(0.17)).toBe(false);
    expect(shouldContinue(FLOOR)).toBe(false);
  });
  it("carries on while there is still evidence of knowledge", () => {
    expect(shouldContinue(0.5)).toBe(true);
  });
});

describe("placementResult", () => {
  const sizes = { A1: 100, A2: 200, B1: 300, B2: 400, C1: 500 };

  it("recommends the highest level actually passed, not the highest attempted", () => {
    /* Strong at B1, guessed at B2. A B1 learner, not a B2 one. */
    const r = placementResult({
      A1: { right: 6, asked: 6 }, A2: { right: 6, asked: 6 },
      B1: { right: 5, asked: 6 }, B2: { right: 1, asked: 6 },
    }, sizes);
    expect(r.level).toBe("B1");
  });

  it("starts at A1 when even A1 is not passed — there is nowhere lower", () => {
    expect(placementResult({ A1: { right: 1, asked: 6 } }, sizes).level).toBe("A1");
  });

  it("scales each level's sample to that level's size", () => {
    /* All of A1 (100) and half of A2 (200) = 100 + 100. */
    const r = placementResult({ A1: { right: 6, asked: 6 }, A2: { right: 3, asked: 6 } }, sizes);
    expect(r.estimate).toBe(200);
  });

  it("counts levels never reached as zero rather than guessing at them", () => {
    const r = placementResult({ A1: { right: 6, asked: 6 } }, sizes);
    expect(r.estimate).toBe(100);
    expect(r.tested).toEqual(["A1"]);
  });

  it("reports how many words it actually asked, so the estimate can be read honestly", () => {
    const r = placementResult({ A1: { right: 6, asked: 6 }, A2: { right: 2, asked: 6 } }, sizes);
    expect(r.asked).toBe(12);
  });

  it("survives a test that was never started", () => {
    const r = placementResult({}, sizes);
    expect(r).toMatchObject({ level: "A1", estimate: 0, asked: 0 });
  });

  it("keeps the levels in course order however they were recorded", () => {
    const r = placementResult({ B1: { right: 4, asked: 6 }, A1: { right: 6, asked: 6 } }, sizes);
    expect(r.rows.map((x) => x.level)).toEqual(["A1", "B1"]);
  });

  it("treats the pass mark as inclusive", () => {
    const asked = 10;
    const r = placementResult({ A1: { right: Math.ceil(PASS * asked), asked } }, sizes);
    expect(r.level).toBe("A1");
  });
});

describe("placementSummary", () => {
  it("says nothing for a test that was not taken", () => {
    expect(placementSummary(placementResult({}))).toBe("");
  });

  it("names the level and the sample size, and does not call it a grade", () => {
    const s = placementSummary(placementResult({ A1: { right: 6, asked: 6 }, A2: { right: 5, asked: 6 } }, {}));
    expect(s).toMatch(/A2/);
    expect(s).toMatch(/12 words sampled/);
    expect(s).toMatch(/not a grade/);
  });

  it("is encouraging rather than blunt when nothing was passed", () => {
    const s = placementSummary(placementResult({ A1: { right: 1, asked: 6 } }, {}));
    expect(s).toMatch(/A1/);
    expect(s).not.toMatch(/fail/i);
  });

  it("quotes the score of the level it names, not the last one tested", () => {
    /* Caught on screen: the sentence said "2 of 6 at A1" directly above a
     * table reading "A1 — 3 of 6", because it was quoting the A2 row. */
    const s = placementSummary(placementResult({
      A1: { right: 3, asked: 6 },
      A2: { right: 2, asked: 6 },
    }, {}));
    expect(s).toMatch(/3 of 6 at A1/);
    expect(s).not.toMatch(/2 of 6/);
  });
});

describe("the level list", () => {
  it("is the course's own levels, in order", () => {
    expect(PLACEMENT_LEVELS).toEqual(["A1", "A2", "B1", "B2", "C1"]);
  });
});
