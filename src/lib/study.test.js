import { describe, it, expect } from "vitest";
import { buildBatchLedger, buildSummaryRows, matrixCell, weakestCards } from "./study.js";
import { scheduleCard, gradeFromWrongCount, todayKey, addDays, cardId } from "./srs.js";

const w = (t, extra = {}) => ({ t, e: `${t}-gloss`, ...extra });
const entries = [w("chat"), w("chien"), w("vache")].map((word) => ({ word, level: "A1" }));
const qid = (t, kind) => `A1::${t}::${kind}`;

describe("buildBatchLedger", () => {
  const base = { entries, lang: "fr", screen: "learn", stepIndex: 0, learnIdx: 0 };

  it("marks only the cards reached so far during Learn", () => {
    const rows = buildBatchLedger({ ...base, learnIdx: 1 });
    expect(rows.map((r) => r.status)).toEqual(["seen", "seen", "unseen"]);
  });

  it("treats every word as seen once Learn is behind you", () => {
    const rows = buildBatchLedger({ ...base, screen: "matching", stepIndex: 1 });
    expect(rows.every((r) => r.status === "seen")).toBe(true);
  });

  it("reports the furthest stage a word has reached", () => {
    const rows = buildBatchLedger({
      ...base,
      screen: "practice",
      stepIndex: 3,
      matchedIds: ["chat", "chien", "vache"],
      chooseSeen: new Set([qid("chien", "toEnglish"), qid("vache", "toTarget")]),
      practiceSeen: new Set([qid("vache", "fillBlank")]),
    });
    // matched < chosen < typed — the later stage wins.
    expect(rows.map((r) => r.status)).toEqual(["matched", "chosen", "typed"]);
  });

  it("matches question ids by word, not by substring of another word", () => {
    // "chat" must not be matched by an id belonging to "chatte".
    const rows = buildBatchLedger({
      ...base,
      screen: "choose",
      stepIndex: 2,
      chooseSeen: new Set(["A1::chatte::toEnglish"]),
    });
    expect(rows[0].status).toBe("seen");
  });

  it("carries the miss count from the session results", () => {
    const results = new Map([[cardId("fr", "A1", "chien"), { wrongCount: 2 }]]);
    const rows = buildBatchLedger({ ...base, results });
    expect(rows.find((r) => r.word.t === "chien").misses).toBe(2);
    expect(rows.find((r) => r.word.t === "chat").misses).toBe(0);
  });

  it("shows the German article as part of the word", () => {
    const rows = buildBatchLedger({
      ...base,
      lang: "de",
      entries: [{ word: w("Katze", { g: "die" }), level: "A1" }],
    });
    expect(rows[0].display).toBe("die Katze");
  });

  it("follows a review session's own list rather than the open drawer", () => {
    // The caller decides the list; the ledger must not assume the batch.
    const rows = buildBatchLedger({ ...base, entries: [{ word: w("seul"), level: "B2" }] });
    expect(rows).toHaveLength(1);
    expect(rows[0].cardId).toBe("fr:B2:seul");
  });
});

describe("buildSummaryRows", () => {
  const results = new Map([
    [cardId("fr", "A1", "chat"), { word: w("chat"), level: "A1", wrongCount: 0 }],
    [cardId("fr", "A1", "chien"), { word: w("chien"), level: "A1", wrongCount: 2 }],
  ]);

  it("reports first-try only when nothing was missed", () => {
    const rows = buildSummaryRows({ results, lang: "fr" });
    expect(rows.find((r) => r.word.t === "chat").firstTry).toBe(true);
    expect(rows.find((r) => r.word.t === "chien").firstTry).toBe(false);
  });

  it("reads the due date the commit actually wrote", () => {
    const scheduled = { [cardId("fr", "A1", "chat")]: { due: addDays(todayKey(), 3) } };
    const rows = buildSummaryRows({ results, scheduled, lang: "fr" });
    expect(rows.find((r) => r.word.t === "chat").dueInDays).toBe(3);
  });

  it("does not schedule a second time when the stored card is already committed", () => {
    /* The regression this guards: committing and navigating happen in one
     * handler, so `cards` already holds the scheduled card by the time the
     * summary renders. Re-running the scheduler over it would advance the
     * interval twice. Reading `scheduled` is what keeps the shown date equal
     * to the written one.
     *
     * Graded "hard" rather than "again" on purpose — "again" relearns today
     * whether you schedule once or twice, so it cannot tell the two apart. */
    const id = cardId("fr", "A1", "chien");
    const oneMiss = new Map([[id, { word: w("chien"), level: "A1", wrongCount: 1 }]]);
    const before = { ease: 2.3, interval: 1, reps: 1, lapses: 0, due: todayKey(), lastSeen: null };

    const committed = scheduleCard(before, gradeFromWrongCount(1));
    const doubled = scheduleCard(committed, gradeFromWrongCount(1));
    expect(daysBetween(committed.due)).not.toBe(daysBetween(doubled.due));  // the two are distinguishable

    const rows = buildSummaryRows({
      results: oneMiss, scheduled: { [id]: committed }, cards: { [id]: committed }, lang: "fr",
    });
    expect(rows[0].dueInDays).toBe(daysBetween(committed.due));
    expect(rows[0].dueInDays).not.toBe(daysBetween(doubled.due));
  });

  function daysBetween(due) {
    return Math.round((new Date(due + "T00:00:00") - new Date(todayKey() + "T00:00:00")) / 86400000);
  }
});

describe("matrixCell", () => {
  it("separates never-drilled from due", () => {
    /* isDue(undefined) is true — a card you have never seen is due by
     * definition — so testing isDue alone would paint every untouched cell as
     * due and the coverage map would say nothing. */
    const untouched = matrixCell(undefined);
    expect(untouched.drilled).toBe(false);
    expect(untouched.due).toBe(false);
    expect(untouched.stage).toBeNull();
  });

  it("marks a drilled card that has come round again as due", () => {
    const cell = matrixCell({ reps: 2, interval: 5, due: addDays(todayKey(), -1) });
    expect(cell.drilled).toBe(true);
    expect(cell.due).toBe(true);
  });

  it("does not mark a card scheduled for the future", () => {
    const cell = matrixCell({ reps: 2, interval: 5, due: addDays(todayKey(), 4) });
    expect(cell.due).toBe(false);
  });

  it("reports maturity so the map can shade by it", () => {
    expect(matrixCell({ reps: 0, interval: 0, due: todayKey() }).stage).toBe("new");
    expect(matrixCell({ reps: 2, interval: 3, due: todayKey() }).stage).toBe("learning");
    expect(matrixCell({ reps: 5, interval: 10, due: todayKey() }).stage).toBe("young");
    expect(matrixCell({ reps: 9, interval: 40, due: todayKey() }).stage).toBe("mature");
  });
});

describe("weakestCards", () => {
  const card = (o) => ({ ease: 2.3, interval: 5, reps: 2, lapses: 0, due: todayKey(), ...o });
  const list = [w("chat"), w("chien"), w("vache"), w("oiseau")].map((word) => ({ word, level: "A1" }));
  const id = (t) => cardId("fr", "A1", t);

  it("ranks by lapses before ease, hardest first", () => {
    const cards = {
      [id("chat")]: card({ lapses: 3, ease: 2.3 }),
      [id("chien")]: card({ lapses: 0, ease: 1.7 }),   // ease dropped but never lapsed
      [id("vache")]: card({ lapses: 1, ease: 2.0 }),
    };
    const out = weakestCards({ entries: list, lang: "fr", cards });
    expect(out.map((r) => r.word.t)).toEqual(["chat", "vache", "chien"]);
  });

  it("leaves out cards that have never been studied", () => {
    /* Otherwise this becomes a second new-word queue: an untouched card has no
     * evidence of difficulty, only of absence. */
    const cards = { [id("chat")]: card({ lapses: 2 }) };
    const out = weakestCards({ entries: list, lang: "fr", cards });
    expect(out.map((r) => r.word.t)).toEqual(["chat"]);
  });

  it("leaves out cards answered cleanly every time", () => {
    const cards = { [id("chat")]: card({ lapses: 0, ease: 2.3 }) };
    expect(weakestCards({ entries: list, lang: "fr", cards })).toHaveLength(0);
  });

  it("ignores the due date — that is the point", () => {
    const cards = { [id("chat")]: card({ lapses: 4, due: addDays(todayKey(), 300) }) };
    const out = weakestCards({ entries: list, lang: "fr", cards });
    expect(out).toHaveLength(1);
    expect(out[0].word.t).toBe("chat");
  });

  it("honours the limit", () => {
    const cards = Object.fromEntries(list.map((e, i) => [id(e.word.t), card({ lapses: i + 1 })]));
    expect(weakestCards({ entries: list, lang: "fr", cards, limit: 2 })).toHaveLength(2);
  });
});
