import { describe, it, expect } from "vitest";
import {
  ruleKeyOf, recordIssues, recordMiss, weightOf, topMistakes, clearMistake,
  ruleInfo, conjRuleKey, markPractised, KEEP_EXAMPLES, HALF_LIFE_DAYS,
} from "./errors.js";

const issue = (over) => ({ kind: "grammar", start: 8, end: 16, text: "sie hat", fixes: ["hat sie"], ...over });
const drawer = issue({ source: "drawer", rule: "de-verb-second" });
const lt = issue({ source: "lt", rule: "FRENCH_AGREEMENT_2", category: "CAT_GRAMMAIRE" });

describe("what a mistake is counted under", () => {
  it("keeps a drawer rule as itself — it is already one lesson", () => {
    expect(ruleKeyOf(drawer)).toBe("de-verb-second");
  });
  it("folds LanguageTool's thousands of rule ids into their category", () => {
    expect(ruleKeyOf(lt)).toBe("lt:CAT_GRAMMAIRE");
    expect(ruleKeyOf(issue({ source: "lt", rule: "X", category: "AGREEMENT" }))).toBe("lt:AGREEMENT");
  });
  it("falls back to the kind when there is no category at all", () => {
    expect(ruleKeyOf(issue({ source: "lt", kind: "spelling" }))).toBe("kind:spelling");
  });
});

describe("recording a check", () => {
  const text = "Gestern sie hat einen Tee getrunken.";
  it("counts a rule once per check, however often it occurs", () => {
    /* Three agreement slips in one paragraph are one lesson. Counting each
     * would let a single bad night dominate the list for weeks. */
    const led = recordIssues({}, { lang: "de", issues: [drawer, drawer, drawer], text, today: "2026-09-21" });
    expect(led["de:de-verb-second"].count).toBe(1);
  });
  it("accumulates across checks and tracks first and last", () => {
    let led = recordIssues({}, { lang: "de", issues: [drawer], text, today: "2026-09-01" });
    led = recordIssues(led, { lang: "de", issues: [drawer], text, today: "2026-09-21" });
    expect(led["de:de-verb-second"]).toMatchObject({ count: 2, first: "2026-09-01", last: "2026-09-21" });
  });
  it("keeps the learner's own sentence as evidence, newest first and capped", () => {
    let led = {};
    for (const d of ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"]) {
      led = recordIssues(led, { lang: "de", issues: [drawer], text, today: d });
    }
    const ex = led["de:de-verb-second"].examples;
    expect(ex).toHaveLength(KEEP_EXAMPLES);
    expect(ex[0].at).toBe("2026-09-04");
    expect(ex[0].text).toContain("sie hat");
    expect(ex[0].fix).toBe("hat sie");
  });
  it("ignores punctuation and style, which are not errors here", () => {
    const tips = [issue({ kind: "punctuation" }), issue({ kind: "style" })];
    expect(recordIssues({}, { lang: "fr", issues: tips, text, today: "2026-09-21" })).toEqual({});
  });
  it("keeps the two languages apart", () => {
    let led = recordIssues({}, { lang: "de", issues: [drawer], text, today: "2026-09-21" });
    led = recordIssues(led, { lang: "fr", issues: [lt], text, today: "2026-09-21" });
    expect(Object.keys(led).sort()).toEqual(["de:de-verb-second", "fr:lt:CAT_GRAMMAIRE"]);
  });
});

describe("misses from a drill", () => {
  it("records a tense as its own pattern", () => {
    const led = recordMiss({}, { lang: "de", rule: conjRuleKey("praeteritum"), prompt: "ich (gehen)", answer: "ging", today: "2026-09-21" });
    expect(led["de:conj:praeteritum"]).toMatchObject({ count: 1, examples: [{ fix: "ging" }] });
  });
});

describe("which patterns matter now", () => {
  const today = "2026-09-21";
  it("fades an old mistake rather than forgetting it", () => {
    const old = { count: 4, last: "2026-08-31" };            // 21 days = one half-life
    expect(weightOf(old, today)).toBeCloseTo(2, 1);
    expect(weightOf({ count: 4, last: today }, today)).toBe(4);
    expect(HALF_LIFE_DAYS).toBe(21);
  });
  it("ranks by recency-weighted count, not raw count", () => {
    const led = {
      "de:old-but-many": { rule: "old-but-many", lang: "de", count: 8, last: "2026-06-21", examples: [] },
      "de:few-but-now": { rule: "few-but-now", lang: "de", count: 4, last: today, examples: [] },
    };
    expect(topMistakes(led, "de", { today })[0].rule).toBe("few-but-now");
  });
  it("will not call a single slip a pattern", () => {
    const led = { "de:once": { rule: "once", lang: "de", count: 1, last: today, examples: [] } };
    expect(topMistakes(led, "de", { today })).toEqual([]);
    expect(topMistakes(led, "de", { today, minCount: 1 })).toHaveLength(1);
  });
  it("only reports the language being studied", () => {
    const led = {
      "fr:lt:AGREEMENT": { rule: "lt:AGREEMENT", lang: "fr", count: 3, last: today, examples: [] },
      "de:de-case": { rule: "de-case", lang: "de", count: 3, last: today, examples: [] },
    };
    expect(topMistakes(led, "fr", { today }).map((m) => m.rule)).toEqual(["lt:AGREEMENT"]);
  });
  it("drops one when the learner says they have it", () => {
    const led = { "de:de-case": { count: 3 }, "de:de-gender": { count: 2 } };
    expect(Object.keys(clearMistake(led, "de:de-case"))).toEqual(["de:de-gender"]);
  });
});

describe("explanations", () => {
  it("explains every rule the German checker can raise", () => {
    for (const r of ["de-verb-second", "de-verb-final", "de-agreement", "de-case", "de-gender", "de-adjective-ending"]) {
      expect(ruleInfo(r).why.length).toBeGreaterThan(40);
    }
  });
  it("has something to say about a conjugation tense", () => {
    expect(ruleInfo(conjRuleKey("passe")).title).toBe("Verb forms");
  });
  it("falls back without inventing an explanation", () => {
    expect(ruleInfo("lt:NEVER_SEEN", "Something else")).toEqual({ title: "Something else", why: "", note: null });
  });
});

describe("practising a pattern", () => {
  it("records the practice without wiping the count", () => {
    /* The ledger is a record of what you do in your own writing. Drilling a
     * pattern is not evidence that you have stopped making it. */
    const led = { "de:de-case": { rule: "de-case", lang: "de", count: 5, last: "2026-09-21", examples: [] } };
    const after = markPractised(led, "de:de-case", "2026-09-21");
    expect(after["de:de-case"].count).toBe(5);
    expect(after["de:de-case"].practised).toEqual(["2026-09-21"]);
  });
  it("ignores a pattern that is not there", () => {
    expect(markPractised({}, "de:nope", "2026-09-21")).toEqual({});
  });
});
