import { describe, it, expect } from "vitest";
import {
  eligibleForFluency, fluencyReadiness, buildFluencyItem, buildFluencyRound, scoreRound,
  qualifiesAsBest, recordRound, roundVerdict,
  ROUND_SECONDS, OPTION_COUNT, MIN_ACCURACY_FOR_BEST,
} from "./fluency.js";

const cardIdFor = (lang, level, t) => `${lang}:${level}:${t}`;
const w = (t, e) => ({ t, e });
const entries = [
  { word: w("chat", "cat"), level: "A1" },
  { word: w("chien", "dog"), level: "A1" },
  { word: w("cheval", "horse"), level: "A1" },
  { word: w("vache", "cow"), level: "A1" },
  { word: w("oiseau", "bird"), level: "A1" },
];
const card = (interval, lapses = 0) => ({ reps: 5, interval, lapses });

describe("eligibleForFluency", () => {
  it("takes words with two clean retrievals and a few days behind them", () => {
    /* Condition 1 asks for material that is EASY, not material that is old.
     * Two correct reviews is easy; one is not, and never studied certainly is
     * not. */
    const cards = {
      "fr:A1:chat": card(30),                        // settled
      "fr:A1:chien": card(10),                       // settled
      "fr:A1:cheval": card(3),                       // in, and only just
      "fr:A1:vache": { reps: 1, interval: 1 },       // one review — too early
      "fr:A1:oiseau": { reps: 0, interval: 0 },      // never studied
    };
    const got = eligibleForFluency({ entries, lang: "fr", cards, cardIdFor }).map((x) => x.word.t);
    expect(got.sort()).toEqual(["chat", "cheval", "chien"]);
  });
  it("marks which of them are properly settled", () => {
    const cards = { "fr:A1:chat": card(30), "fr:A1:chien": card(3) };
    const got = eligibleForFluency({ entries, lang: "fr", cards, cardIdFor });
    expect(got.find((x) => x.word.t === "chat").settled).toBe(true);
    expect(got.find((x) => x.word.t === "chien").settled).toBe(false);
  });
  it("drops leeches, which are by definition not known", () => {
    const cards = { "fr:A1:chat": card(30, 8), "fr:A1:chien": card(30) };
    const got = eligibleForFluency({ entries, lang: "fr", cards, cardIdFor }).map((x) => x.word.t);
    expect(got).toEqual(["chien"]);
  });
  it("returns nothing for a learner who has not studied", () => {
    expect(eligibleForFluency({ entries, lang: "fr", cards: {}, cardIdFor })).toEqual([]);
  });
});

describe("buildFluencyItem", () => {
  const pool = entries.map((e) => ({ ...e, stage: "mature" }));

  it("asks for the meaning, with the answer among the options", () => {
    const item = buildFluencyItem(pool, 0, "recognise");
    expect(item.options).toHaveLength(OPTION_COUNT);
    expect(item.options).toContain(item.answer);
  });
  it("reverses cleanly for production", () => {
    const item = buildFluencyItem(pool, 0, "produce");
    expect(item.prompt).toBe("cat");
    expect(item.answer).toBe("chat");
    expect(item.options).toContain("chat");
  });
  it("never offers two options meaning the same thing", () => {
    /* Two right answers is an unanswerable question, and under a clock the
     * learner has no time to work out that it was our fault. */
    const dupes = [
      { word: w("voiture", "car"), level: "A1" },
      { word: w("auto", "car"), level: "A1" },
      { word: w("chien", "dog"), level: "A1" },
      { word: w("chat", "cat"), level: "A1" },
    ];
    for (let i = 0; i < 8; i += 1) {
      const item = buildFluencyItem(dupes, i, "recognise");
      if (item) expect(new Set(item.options).size).toBe(item.options.length);
    }
  });
  it("draws its wrong options from the same known pool, never inventing one", () => {
    const known = new Set(pool.map((p) => p.word.e));
    const item = buildFluencyItem(pool, 2, "recognise");
    for (const o of item.options) expect(known.has(o)).toBe(true);
  });
  it("declines when there are too few words to make a question", () => {
    expect(buildFluencyItem(pool.slice(0, 2), 0, "recognise")).toBe(null);
  });
});

describe("buildFluencyRound", () => {
  const pool = entries.map((e) => ({ ...e, stage: "mature" }));

  it("cycles rather than running out, so the clock ends the round", () => {
    /* Condition 4 is quantity. Five known words must still keep a fast
     * learner busy for the full minute. */
    const round = buildFluencyRound(pool, "recognise", 0, 40);
    expect(round.length).toBe(40);
  });
  it("is reproducible from its seed", () => {
    const a = buildFluencyRound(pool, "recognise", 7, 10).map((i) => i.prompt);
    const b = buildFluencyRound(pool, "recognise", 7, 10).map((i) => i.prompt);
    expect(a).toEqual(b);
  });
  it("gives a different round for a different seed", () => {
    const a = buildFluencyRound(pool, "recognise", 1, 10).map((i) => i.prompt).join();
    const b = buildFluencyRound(pool, "recognise", 2, 10).map((i) => i.prompt).join();
    expect(a).not.toBe(b);
  });
});

describe("scoreRound", () => {
  it("reports correct answers per minute", () => {
    const answers = Array.from({ length: 20 }, (_, i) => ({ ok: i < 15 }));
    const s = scoreRound(answers, ROUND_SECONDS);
    expect(s.correct).toBe(15);
    expect(s.attempted).toBe(20);
    expect(s.perMinute).toBe(15);
    expect(s.accuracy).toBeCloseTo(0.75);
  });
  it("scales when the round is not a full minute", () => {
    expect(scoreRound([{ ok: true }, { ok: true }], 30).perMinute).toBe(4);
  });
  it("survives a round with no answers", () => {
    const s = scoreRound([], ROUND_SECONDS);
    expect(s).toMatchObject({ attempted: 0, correct: 0, accuracy: 0, perMinute: 0 });
  });
});

describe("qualifiesAsBest", () => {
  it("refuses a score that could have come from guessing", () => {
    /* Three options make chance about a third, so a fast, wrong round must not
     * be able to set a record. */
    expect(qualifiesAsBest(scoreRound(Array.from({ length: 30 }, (_, i) => ({ ok: i % 3 === 0 }))))).toBe(false);
  });
  it("accepts an accurate one", () => {
    expect(qualifiesAsBest(scoreRound(Array.from({ length: 10 }, () => ({ ok: true }))))).toBe(true);
    expect(MIN_ACCURACY_FOR_BEST).toBeGreaterThan(1 / OPTION_COUNT);
  });
});

describe("recordRound", () => {
  const good = scoreRound(Array.from({ length: 12 }, () => ({ ok: true })));
  const sloppy = scoreRound(Array.from({ length: 40 }, (_, i) => ({ ok: i % 2 === 0 })));

  it("starts a record from nothing", () => {
    const r = recordRound(null, good, "2026-09-03");
    expect(r.best).toBe(good.perMinute);
    expect(r.runs).toHaveLength(1);
  });
  it("keeps the higher score", () => {
    const first = recordRound(null, good, "2026-09-03");
    const slower = scoreRound(Array.from({ length: 4 }, () => ({ ok: true })));
    expect(recordRound(first, slower, "2026-09-04").best).toBe(good.perMinute);
  });
  it("logs an inaccurate run but will not let it set the record", () => {
    const r = recordRound({ best: 9, runs: [] }, sloppy, "2026-09-03");
    expect(r.best).toBe(9);
    expect(r.runs).toHaveLength(1);
  });
  it("keeps the history bounded", () => {
    let r = null;
    for (let i = 0; i < 45; i += 1) r = recordRound(r, good, `d${i}`, 30);
    expect(r.runs).toHaveLength(30);
    expect(r.runs[r.runs.length - 1].d).toBe("d44");
  });
});

describe("roundVerdict", () => {
  it("says nothing happened when nothing did", () => {
    expect(roundVerdict(scoreRound([]), 0)).toMatch(/clock ran out/);
  });
  it("asks for accuracy before speed when the answers were poor", () => {
    const sloppy = scoreRound(Array.from({ length: 20 }, (_, i) => ({ ok: i % 3 === 0 })));
    expect(roundVerdict(sloppy, 10)).toMatch(/Speed only counts/);
  });
  it("names a new best", () => {
    const s = scoreRound(Array.from({ length: 20 }, () => ({ ok: true })));
    expect(roundVerdict(s, 12)).toMatch(/new best/);
  });
  it("gives a first-time learner a number to beat", () => {
    const s = scoreRound(Array.from({ length: 10 }, () => ({ ok: true })));
    expect(roundVerdict(s, 0)).toMatch(/number to beat/);
  });
});


describe("fluencyReadiness", () => {
  it("counts the words one correct review away from joining", () => {
    /* A locked screen that only says "not yet" is a dead end; this is what
     * lets it say how close you are and what to do. */
    const cards = {
      "fr:A1:chat": card(30),
      "fr:A1:chien": { reps: 1, interval: 1 },
      "fr:A1:cheval": { reps: 2, interval: 2 },
      "fr:A1:vache": { reps: 0, interval: 0 },
    };
    const r = fluencyReadiness({ entries, lang: "fr", cards, cardIdFor });
    expect(r.studied).toBe(3);
    expect(r.almost).toBe(2);
  });
  it("does not count a leech as nearly ready", () => {
    const cards = { "fr:A1:chat": { reps: 4, interval: 1, lapses: 9 } };
    expect(fluencyReadiness({ entries, lang: "fr", cards, cardIdFor }).almost).toBe(0);
  });
  it("reports nothing for an untouched deck", () => {
    expect(fluencyReadiness({ entries, lang: "fr", cards: {}, cardIdFor })).toEqual({ studied: 0, almost: 0 });
  });
});
