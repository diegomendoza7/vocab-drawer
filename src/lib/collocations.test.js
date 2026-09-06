import { describe, it, expect } from "vitest";
import { collocationsFor, verbsIn, buildCollocationQuiz, gradeCollocation, scoreCollocations } from "./collocations.js";
import { COLLOCATIONS } from "../data/collocations.js";

describe("the set", () => {
  it("covers both languages", () => {
    expect(collocationsFor("fr").length).toBeGreaterThan(10);
    expect(collocationsFor("de").length).toBeGreaterThan(10);
  });
  it("gives every entry a trap, because the trap is the lesson", () => {
    /* The pairing is arbitrary; what makes it learnable is being told what
     * English does instead. An entry without that is just a phrase. */
    for (const c of COLLOCATIONS) {
      expect(c.trap, `${c.verb} ${c.noun}`).toBeTruthy();
      expect(c.en, `${c.verb} ${c.noun}`).toBeTruthy();
    }
  });
  it("never offers the right verb as one of its own wrong options", () => {
    for (const c of COLLOCATIONS) expect(c.wrong, `${c.verb} ${c.noun}`).not.toContain(c.verb);
  });
  it("gives every entry two plausible wrong verbs", () => {
    for (const c of COLLOCATIONS) expect(c.wrong.length, `${c.verb} ${c.noun}`).toBe(2);
  });
});

describe("buildCollocationQuiz", () => {
  const fr = collocationsFor("fr");

  it("asks for the verb, given the noun", () => {
    const q = buildCollocationQuiz(fr, 0);
    expect(q.prompt).toBe(fr[0].noun);
    expect(q.answer).toBe(fr[0].verb);
    expect(q.options).toContain(q.answer);
    expect(q.options).toHaveLength(3);
  });
  it("uses the entry's own wrong verbs, not random ones", () => {
    /* Random fillers would let a learner answer by elimination instead of by
     * knowing which verb the noun takes. */
    const q = buildCollocationQuiz(fr, 0);
    for (const o of q.options) {
      if (o !== q.answer) expect(fr[0].wrong).toContain(o);
    }
  });
  it("never repeats an option", () => {
    for (let i = 0; i < fr.length; i += 1) {
      const q = buildCollocationQuiz(fr, i);
      expect(new Set(q.options).size).toBe(3);
    }
  });
  it("walks the list and wraps", () => {
    const seen = new Set();
    for (let i = 0; i < fr.length; i += 1) seen.add(buildCollocationQuiz(fr, i).prompt);
    expect(seen.size).toBe(fr.length);
    expect(buildCollocationQuiz(fr, -1)).toBeTruthy();
  });
  it("declines an empty list", () => {
    expect(buildCollocationQuiz([], 0)).toBe(null);
  });
});

describe("gradeCollocation", () => {
  it("ignores case and accents", () => {
    expect(gradeCollocation("Prendre", "prendre")).toBe(true);
    expect(gradeCollocation("achten", "achten")).toBe(true);
  });
  it("rejects the wrong verb and an empty answer", () => {
    expect(gradeCollocation("faire", "prendre")).toBe(false);
    expect(gradeCollocation("", "prendre")).toBe(false);
  });
});

describe("scoreCollocations", () => {
  it("counts and keeps the misses for review", () => {
    const a = { ok: true, item: 1 }, b = { ok: false, item: 2 };
    expect(scoreCollocations([a, b, a])).toMatchObject({ asked: 3, right: 2, missed: [2] });
  });
  it("survives an empty round", () => {
    expect(scoreCollocations([])).toMatchObject({ asked: 0, right: 0, missed: [] });
  });
});

describe("verbsIn", () => {
  it("lists each verb once", () => {
    const v = verbsIn("de");
    expect(new Set(v).size).toBe(v.length);
    expect(v).toContain("treffen");
  });
});
