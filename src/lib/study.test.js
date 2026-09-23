import { describe, it, expect } from "vitest";
import { scheduleResults, buildBatchLedger, buildSummaryRows, matrixCell, weakestCards, drillScopeTenses, effectiveScope, kindsForCard, nextAction, accuracyTrend, mergeProgress, estimateMinutes, prefixReach, typeAhead, commitTypeAhead, frequencyReach } from "./study.js";
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


describe("drillScopeTenses", () => {
  /* The bug this exists to stop: "Drill être" built a queue across every tense
   * the verb has, so a learner who had only ever opened the present was asked
   * for the subjunctive. The scope is a choice now, and each option has to
   * resolve to exactly what its label promises. */
  const TENSES = [
    { key: "present" }, { key: "passe" }, { key: "imparfait" },
    { key: "futur" }, { key: "conditionnel" }, { key: "subjonctif" }, { key: "imperatif" },
  ];
  const base = {
    verb: { inf: "être" },
    tenseKey: "present",
    tenses: TENSES,
    cardIdFor: (k) => `fr:conj:être:${k}`,
    hasTense: () => true,
  };

  it("scopes to the tense on screen by default", () => {
    const out = drillScopeTenses({ ...base, cards: {} });
    expect(out.tense).toEqual(["present"]);
    expect(out.all).toHaveLength(7);
  });

  it("counts a tense as started once it has a card — not once it is due", () => {
    const cards = { "fr:conj:être:present": { reps: 1 }, "fr:conj:être:passe": { reps: 3 } };
    expect(drillScopeTenses({ ...base, cards }).started).toEqual(["present", "passe"]);
  });

  it("is empty for started until something has been answered", () => {
    expect(drillScopeTenses({ ...base, cards: {} }).started).toEqual([]);
  });

  it("leaves out a tense the verb does not have", () => {
    // A German modal has no imperative at all.
    const out = drillScopeTenses({ ...base, cards: {}, hasTense: (k) => k !== "imperatif" });
    expect(out.all).not.toContain("imperatif");
    expect(out.all).toHaveLength(6);
  });

  it("gives no tense to drill when the open tense is one the verb lacks", () => {
    const out = drillScopeTenses({ ...base, tenseKey: "imperatif", cards: {}, hasTense: (k) => k !== "imperatif" });
    expect(out.tense).toEqual([]);
  });
});

describe("effectiveScope", () => {
  it("keeps a scope that has something in it", () => {
    expect(effectiveScope("all", { tense: ["a"], started: [], all: ["a", "b"] })).toBe("all");
  });

  it("falls back when the chosen scope has emptied", () => {
    /* Switching to a verb you have never drilled must not leave "Started"
     * selected with a dead button and no explanation. */
    expect(effectiveScope("started", { tense: ["a"], started: [], all: ["a"] })).toBe("tense");
  });
});


describe("kindsForCard", () => {
  /* The queue used to hand every word all three kinds, so a word met a minute
   * ago and a word known for a month were asked identically — and a ten-word
   * drawer became thirty typed questions. */
  const withCloze = { hasCloze: () => true };
  const noCloze = { hasCloze: () => false };
  const word = { t: "chat" };

  it("asks a brand-new word only to recognise", () => {
    expect(kindsForCard(word, undefined, withCloze)).toEqual(["toEnglish"]);
  });

  it("adds production once the word has come back once", () => {
    expect(kindsForCard(word, { reps: 1, interval: 1 }, withCloze)).toEqual(["toEnglish", "toTarget"]);
  });

  it("only asks for a cloze once the word has stuck for a few days", () => {
    expect(kindsForCard(word, { reps: 3, interval: 2 }, withCloze)).not.toContain("fillBlank");
    expect(kindsForCard(word, { reps: 3, interval: 3 }, withCloze)).toContain("fillBlank");
  });

  it("never asks for a cloze the entry cannot supply", () => {
    expect(kindsForCard(word, { reps: 5, interval: 30 }, noCloze)).not.toContain("fillBlank");
  });

  it("walks a leech back to recognition", () => {
    /* Asking someone to produce a word they have failed eight times is how a
     * card stays stuck. */
    expect(kindsForCard(word, { reps: 4, interval: 10, lapses: 8 }, withCloze)).toEqual(["toEnglish"]);
  });
});

describe("scheduleResults: the two cards move independently", () => {
  const REC = "de:A1:Haus";
  const PROD = "de:A1:Haus::prod";
  /* A word an existing learner knows well: one card, a month's interval. */
  const known = { ease: 2.3, interval: 30, reps: 6, lapses: 0, due: "2026-09-01", lastSeen: "2026-08-02" };

  it("seeds a first production answer from the card that covered both", () => {
    /* The invariant the whole split rests on. Starting from nothing would
     * give interval 1 and make every known word due again tomorrow. */
    const { cards } = scheduleResults({ [REC]: known }, [[PROD, { wrongCount: 0 }]]);
    expect(cards[PROD].reps).toBe(7);
    expect(cards[PROD].interval).toBeGreaterThan(30);
  });

  it("leaves the recognition card untouched when only production was answered", () => {
    const { cards } = scheduleResults({ [REC]: known }, [[PROD, { wrongCount: 2 }]]);
    expect(cards[REC]).toEqual(known);
  });

  it("lets production lapse while recognition advances", () => {
    const { cards } = scheduleResults(
      { [REC]: known },
      [[REC, { wrongCount: 0 }], [PROD, { wrongCount: 2 }]],
    );
    expect(cards[REC].interval).toBeGreaterThan(30);
    expect(cards[REC].lapses).toBe(0);
    expect(cards[PROD].interval).toBe(0);
    expect(cards[PROD].lapses).toBe(1);
  });

  it("stops seeding once production has a card of its own", () => {
    const prodCard = { ease: 1.9, interval: 4, reps: 2, lapses: 3, due: "2026-09-01", lastSeen: "2026-09-01" };
    const { cards } = scheduleResults({ [REC]: known, [PROD]: prodCard }, [[PROD, { wrongCount: 0 }]]);
    expect(cards[PROD].reps).toBe(3);        // continued its own history
    expect(cards[PROD].lapses).toBe(3);      // not the recognition card's 0
  });

  it("schedules a recognition answer exactly as it always did", () => {
    /* The no-regression check: nothing about an existing card's handling may
     * change for a learner who never answers a production question. */
    const { cards } = scheduleResults({ [REC]: known }, [[REC, { wrongCount: 1 }]]);
    expect(cards[REC]).toEqual(scheduleCard(known, "hard", REC));
  });

  it("reports only the cards it touched", () => {
    const other = { ease: 2.3, interval: 5, reps: 2, lapses: 0, due: "2026-09-30", lastSeen: null };
    const { scheduled } = scheduleResults({ [REC]: known, "de:A1:Hund": other }, [[REC, { wrongCount: 0 }]]);
    expect(Object.keys(scheduled)).toEqual([REC]);
  });

  it("does not mutate the cards it was handed", () => {
    const cards = { [REC]: { ...known } };
    scheduleResults(cards, [[REC, { wrongCount: 0 }], [PROD, { wrongCount: 0 }]]);
    expect(cards[REC]).toEqual(known);
    expect(cards[PROD]).toBeUndefined();
  });
});

describe("weakestCards across both directions", () => {
  const word = { t: "Haus", e: "house" };
  const entries = [{ word, level: "A1" }];

  it("finds a word that is only weak to produce", () => {
    /* Read perfectly, produced badly — the case that used to average out to
     * an unremarkable card and never surface as a weak spot at all. */
    const cards = {
      "de:A1:Haus": { reps: 6, interval: 30, lapses: 0, ease: 2.3 },
      "de:A1:Haus::prod": { reps: 1, interval: 1, lapses: 4, ease: 1.6 },
    };
    const [top] = weakestCards({ entries, lang: "de", cards });
    expect(top).toBeTruthy();
    expect(top.direction).toBe("produce");
    expect(top.lapses).toBe(4);
  });

  it("keeps the worse half when both are shaky", () => {
    const cards = {
      "de:A1:Haus": { reps: 2, interval: 2, lapses: 6, ease: 1.5 },
      "de:A1:Haus::prod": { reps: 2, interval: 2, lapses: 1, ease: 2.2 },
    };
    expect(weakestCards({ entries, lang: "de", cards })[0].direction).toBe("recognise");
  });

  it("still says nothing about a word with no trouble in either direction", () => {
    const cards = {
      "de:A1:Haus": { reps: 6, interval: 30, lapses: 0, ease: 2.3 },
      "de:A1:Haus::prod": { reps: 5, interval: 20, lapses: 0, ease: 2.3 },
    };
    expect(weakestCards({ entries, lang: "de", cards })).toEqual([]);
  });

  it("works for a learner who has no production cards yet", () => {
    const cards = { "de:A1:Haus": { reps: 2, interval: 2, lapses: 3, ease: 1.9 } };
    const [top] = weakestCards({ entries, lang: "de", cards });
    expect(top.direction).toBe("recognise");
  });
});

describe("kindsForCard: recognition and production are separate", () => {
  const word = { t: "Haus", e: "house", b: "Das _____ ist alt.", ba: "Haus" };
  const withCloze = { hasCloze: () => true };
  const known = { reps: 4, interval: 10, lapses: 0 };

  it("asks only recognition until the word has come back once", () => {
    expect(kindsForCard(word, { rec: { reps: 0, interval: 0 }, prod: null }, withCloze)).toEqual(["toEnglish"]);
  });

  it("paces the cloze by the production card, not the recognition one", () => {
    /* Recognised for a month, produced only yesterday: the cloze is the
     * hardest question there is and must follow the weaker half. */
    const kinds = kindsForCard(word, { rec: { reps: 9, interval: 30 }, prod: { reps: 1, interval: 1 } }, withCloze);
    expect(kinds).toContain("toTarget");
    expect(kinds).not.toContain("fillBlank");
  });

  it("adds the cloze once production itself has stuck", () => {
    expect(kindsForCard(word, { rec: { reps: 9, interval: 30 }, prod: { reps: 3, interval: 5 } }, withCloze))
      .toContain("fillBlank");
  });

  it("drops production for a word whose production is a leech, keeping recognition", () => {
    /* The case the single shared card could not represent: you can read it
     * perfectly well and have failed to produce it eight times. */
    const kinds = kindsForCard(word, { rec: known, prod: { reps: 0, interval: 0, lapses: 8 } }, withCloze);
    expect(kinds).toEqual(["toEnglish"]);
  });

  it("falls back to the recognition card when production has never been graded", () => {
    /* An existing learner's word, before any production answer has been
     * recorded against the new card. Behaviour must be what it always was. */
    const split = kindsForCard(word, { rec: known, prod: null }, withCloze);
    expect(split).toEqual(kindsForCard(word, known, withCloze));
    expect(split).toContain("fillBlank");
  });
});

describe("nextAction", () => {
  const none = { dueCount: 0, weakCount: 0, leechCount: 0, unstartedDrawer: null, untouchedTense: null, dueToday: 0, goal: 20 };

  it("puts scheduled work first — that is what the intervals are for", () => {
    expect(nextAction({ ...none, dueCount: 7, weakCount: 3, unstartedDrawer: "Animals" }).kind).toBe("due");
  });

  it("prefers stuck words over merely weak ones", () => {
    expect(nextAction({ ...none, leechCount: 2, weakCount: 9 }).label).toMatch(/stuck/);
  });

  it("suggests new material only when nothing needs revisiting", () => {
    expect(nextAction({ ...none, unstartedDrawer: "Animals" }).label).toBe("Start Animals");
  });

  it("names the tense before falling through to a shrug", () => {
    expect(nextAction({ ...none, untouchedTense: "Subjonctif" }).label).toBe("Try Subjonctif");
  });

  it("says you are finished once the goal is met and nothing is scheduled", () => {
    expect(nextAction({ ...none, dueToday: 20, goal: 20 }).kind).toBe("done");
  });

  it("always returns something actionable", () => {
    expect(nextAction({ ...none }).label).toBeTruthy();
  });

  /* The strand gap is the only way anything outside vocabulary can ever be
   * recommended, so what it must and must not outrank is worth pinning. */
  const readingGap = { strand: "input", section: "reading", activity: "reading", invite: "Read a passage", never: false, days: 9 };

  it("recommends a neglected strand ahead of new vocabulary", () => {
    const a = nextAction({ ...none, unstartedDrawer: "Animals", strandGap: readingGap });
    expect(a.kind).toBe("strand");
    expect(a.label).toBe("Read a passage");
    expect(a.section).toBe("reading");
  });

  it("still puts due work first — a strand gap is not urgent", () => {
    expect(nextAction({ ...none, dueCount: 4, strandGap: readingGap }).kind).toBe("due");
  });

  it("does not let a strand gap hide a pattern being got wrong", () => {
    expect(nextAction({ ...none, mistakeCount: 3, strandGap: readingGap }).kind).toBe("mistakes");
  });

  it("defers to the concrete suggestion when the neglected strand is study itself", () => {
    /* "Start Animals" is a better sentence than "Study words", and means the
     * same thing — so the generic invitation must not displace it. */
    const formGap = { strand: "form", section: "study", activity: "study", invite: "Study words", never: false, days: 5 };
    expect(nextAction({ ...none, unstartedDrawer: "Animals", strandGap: formGap }).label).toBe("Start Animals");
    expect(nextAction({ ...none, untouchedTense: "Subjonctif", strandGap: formGap }).label).toBe("Try Subjonctif");
  });

  it("uses the study gap when there is no drawer or tense left to name", () => {
    const formGap = { strand: "form", section: "phrases", activity: "phrases", invite: "Match some idioms", never: true, days: null };
    expect(nextAction({ ...none, strandGap: formGap }).label).toBe("Match some idioms");
  });

  it("carries a section the caller can navigate to", () => {
    expect(nextAction({ ...none, strandGap: readingGap }).section).toBeTruthy();
  });

  it("brings back a lesson left halfway, naming the stage it stopped at", () => {
    const a = nextAction({ ...none, strandGap: readingGap, unfinishedLesson: { n: 1, title: "Libres et égaux", stage: "Grammar" } });
    expect(a.kind).toBe("lesson");
    expect(a.label).toBe("Finish Lesson 1: Libres et égaux");
    expect(a.why).toMatch(/Grammar/);
    expect(a.section).toBe("lessons");
  });

  it("offers the first lesson to someone who has only ever been tested", () => {
    const a = nextAction({ ...none, unstartedDrawer: "Animals", strandGap: readingGap, firstLesson: { n: 1, title: "Libres et égaux" } });
    expect(a.label).toBe("Take Lesson 1: Libres et égaux");
  });

  it("never lets a lesson outrank due work or a mistake pattern", () => {
    const lesson = { unfinishedLesson: { n: 1, title: "x", stage: "Read" }, firstLesson: { n: 1, title: "x" } };
    expect(nextAction({ ...none, ...lesson, dueCount: 3 }).kind).toBe("due");
    expect(nextAction({ ...none, ...lesson, mistakeCount: 2 }).kind).toBe("mistakes");
  });
});

describe("mergeProgress: the activity record", () => {
  const base = { cards: { a: { lastSeen: "2026-09-01", reps: 1 } }, history: {} };

  it("brings across work the other device did and this one never has", () => {
    const { progress } = mergeProgress(
      { ...base, activity: {} },
      { cards: {}, activity: { reading: { first: "2026-09-01", last: "2026-09-02", days: 2 } } },
    );
    expect(progress.activity.reading.days).toBe(2);
  });

  it("adds the days of both devices", () => {
    const { progress } = mergeProgress(
      { ...base, activity: { reading: { first: "2026-09-01", last: "2026-09-03", days: 2 } } },
      { cards: {}, activity: { reading: { first: "2026-09-05", last: "2026-09-06", days: 2 } } },
    );
    expect(progress.activity.reading).toMatchObject({ days: 4, first: "2026-09-01", last: "2026-09-06" });
  });

  it("cannot count more days than have elapsed — re-importing must not inflate it", () => {
    /* The same two days of reading, imported from a copy of itself. Adding
     * blindly would claim four days of reading inside a two-day span. */
    const record = { reading: { first: "2026-09-01", last: "2026-09-02", days: 2 } };
    const { progress } = mergeProgress({ ...base, activity: record }, { cards: {}, activity: record });
    expect(progress.activity.reading.days).toBe(2);
  });

  it("ignores an activity key it does not recognise", () => {
    const { progress } = mergeProgress(
      { ...base, activity: {} },
      { cards: {}, activity: { sabotage: { last: "2026-09-02", days: 99 } } },
    );
    expect(progress.activity.sabotage).toBeUndefined();
  });

  it("survives a file written before activity existed", () => {
    const { progress } = mergeProgress({ ...base }, { cards: {} });
    expect(progress.activity).toEqual({});
  });
});

describe("accuracyTrend", () => {
  const addDaysFn = (key, n) => {
    const d = new Date(key + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  it("returns one entry per day asked for, oldest first", () => {
    const out = accuracyTrend({}, 7, "2026-09-01", addDaysFn);
    expect(out).toHaveLength(7);
    expect(out[0].date).toBe("2026-08-26");
    expect(out[6].date).toBe("2026-09-01");
  });

  it("reports a day you did not study as missing, not as zero", () => {
    /* Drawing an unstudied day as 0% would misreport a weekend off as a
     * collapse in accuracy. */
    const out = accuracyTrend({ "2026-09-01": { reviews: 10, correct: 8 } }, 2, "2026-09-01", addDaysFn);
    expect(out[0].pct).toBeNull();
    expect(out[1].pct).toBe(80);
  });
});

describe("mergeProgress", () => {
  const base = { cards: {}, history: {}, imported: { fr: {}, de: {} }, streak: 3, longest: 5 };

  it("refuses a file that is not a progress export", () => {
    expect(() => mergeProgress(base, null)).toThrow(/not a progress export/);
    expect(() => mergeProgress(base, { hello: 1 })).toThrow(/no cards/);
  });

  it("adds cards this device has never seen", () => {
    const { progress, stats } = mergeProgress(base, { cards: { "fr:A1:chat": { reps: 2, lastSeen: "2026-08-01" } } });
    expect(progress.cards["fr:A1:chat"].reps).toBe(2);
    expect(stats.added).toBe(1);
  });

  it("keeps whichever side was reviewed more recently", () => {
    /* A card's schedule is a claim about a moment of recall, so the newer
     * claim wins — taking the longer interval instead would let a stale
     * device push real reviews away. */
    const mine = { ...base, cards: { x: { reps: 9, interval: 40, lastSeen: "2026-08-30" } } };
    const older = mergeProgress(mine, { cards: { x: { reps: 1, interval: 1, lastSeen: "2026-08-01" } } });
    expect(older.progress.cards.x.reps).toBe(9);
    expect(older.stats.kept).toBe(1);

    const newer = mergeProgress(mine, { cards: { x: { reps: 1, interval: 1, lastSeen: "2026-09-01" } } });
    expect(newer.progress.cards.x.reps).toBe(1);
    expect(newer.stats.updated).toBe(1);
  });

  it("sums a day both devices studied", () => {
    const mine = { ...base, history: { "2026-09-01": { reviews: 10, correct: 8 } } };
    const { progress } = mergeProgress(mine, { cards: {}, history: { "2026-09-01": { reviews: 5, correct: 5 } } });
    expect(progress.history["2026-09-01"]).toEqual({ reviews: 15, correct: 13 });
  });

  it("never deletes anything the local device had", () => {
    const mine = { ...base, cards: { keep: { reps: 1, lastSeen: "2026-01-01" } } };
    const { progress } = mergeProgress(mine, { cards: {} });
    expect(progress.cards.keep).toBeDefined();
  });

  it("keeps the local copy of a word saved on both sides", () => {
    // The local one may carry a fact-check verdict the other device never ran.
    const mine = { ...base, imported: { fr: { chat: { t: "chat", ver: { st: "ok" } } }, de: {} } };
    const { progress } = mergeProgress(mine, { cards: {}, imported: { fr: { chat: { t: "chat" } } } });
    expect(progress.imported.fr.chat.ver).toEqual({ st: "ok" });
  });
});

describe("estimateMinutes", () => {
  it("never claims a session takes zero minutes", () => {
    expect(estimateMinutes(0)).toBe(1);
    expect(estimateMinutes(1)).toBe(1);
  });
  it("scales with the queue", () => {
    expect(estimateMinutes(60)).toBeGreaterThan(estimateMinutes(20));
  });
});

describe("prefixReach", () => {
  it("counts characters of the word as displayed, not as folded", () => {
    expect(prefixReach("Schule", "sch")).toBe(3);
    expect(prefixReach("Schule", "")).toBe(0);
  });
  it("ignores case and accents, so the chip can be picked from a plain keyboard", () => {
    expect(prefixReach("Schärfe", "scha")).toBe(4);
    expect(prefixReach("être", "et")).toBe(2);
    expect(prefixReach("Ärger", "ar")).toBe(2);
  });
  it("lets one letter reach a character that folds to two", () => {
    /* "heis" has reached the ß — highlighting it only on the second s would
     * mean a letter that lights up one keystroke late. */
    expect(prefixReach("heißen", "heis")).toBe(4);
    expect(prefixReach("heißen", "heiss")).toBe(4);
    expect(prefixReach("heißen", "heisse")).toBe(5);
    /* Three keystrokes, but two characters lit: "s" and the ligature. */
    expect(prefixReach("sœur", "soe")).toBe(2);
    expect(prefixReach("sœur", "sou")).toBe(-1);
  });
  it("rejects a prefix that does not match, or runs past the end", () => {
    expect(prefixReach("Schule", "st")).toBe(-1);
    expect(prefixReach("de", "des")).toBe(-1);
    expect(prefixReach("heißen", "heit")).toBe(-1);
  });
});

describe("typeAhead", () => {
  const bank = ["des", "de", "Schärfe", "Schule", "heißen"];

  it("places as soon as one word is left", () => {
    expect(typeAhead(bank, "scha").place).toBe(2);
    expect(typeAhead(bank, "h").place).toBe(4);
  });
  it("holds and reports what to highlight while more than one matches", () => {
    const { place, candidates } = typeAhead(bank, "sch");
    expect(place).toBe(null);
    expect(candidates).toEqual([{ index: 2, reach: 3 }, { index: 3, reach: 3 }]);
  });
  it("refuses a keystroke that matches nothing", () => {
    /* The buffer keeps its old value, so one stray letter cannot strand it in
     * a state no further typing can rescue. */
    expect(typeAhead(bank, "z")).toEqual({ ok: false, place: null, candidates: [] });
  });
  it("places one of two identical chips rather than waiting forever", () => {
    /* A sentence with a repeated word gives the bank two of them. No keystroke
     * can tell them apart, and either will do. */
    expect(typeAhead(["de", "le", "de"], "d").place).toBe(0);
  });
  it("does nothing on an empty prefix", () => {
    expect(typeAhead(bank, "")).toEqual({ ok: true, place: null, candidates: [] });
  });
});

describe("commitTypeAhead", () => {
  const bank = ["des", "de", "Schule"];

  it("takes the completed word when one word starts another", () => {
    // "de" is fully typed and still ambiguous against "des" — space settles it.
    expect(commitTypeAhead(bank, "de")).toBe(1);
  });
  it("otherwise takes the leftmost chip still in the running", () => {
    expect(commitTypeAhead(bank, "d")).toBe(0);
  });
  it("has nothing to commit when nothing matches", () => {
    expect(commitTypeAhead(bank, "z")).toBe(null);
    expect(commitTypeAhead(bank, "")).toBe(null);
  });
});

describe("frequencyReach", () => {
  const cardIdFor = (lang, level, t) => `${lang}:${level}:${t}`;
  const list = [
    { word: { t: "être" }, level: "A1" },
    { word: { t: "maison" }, level: "A1" },
    { word: { t: "obscur" }, level: "C1" },
    { word: { t: "jamais" }, level: "A2" },
  ];
  const ranks = { être: 50, maison: 180, jamais: 1500 };   // obscur unranked
  const rankOf = (_l, t) => ranks[t];

  it("counts only words actually studied", () => {
    /* A drawer you have never opened buys no coverage, however big it is. */
    const cards = { "fr:A1:être": {}, "fr:A1:maison": {} };
    const r = frequencyReach({ entries: list, lang: "fr", cards, cardIdFor, rankOf });
    expect(r.studied).toBe(2);
    expect(r.bands[1000]).toBe(2);
  });
  it("sorts studied words into their bands", () => {
    const cards = Object.fromEntries(list.map((e) => [cardIdFor("fr", e.level, e.word.t), {}]));
    const r = frequencyReach({ entries: list, lang: "fr", cards, cardIdFor, rankOf });
    expect(r.bands).toMatchObject({ 1000: 2, 2000: 1, 5000: 0, beyond: 1 });
  });
  it("treats an unranked word as beyond, not as an error", () => {
    const cards = { "fr:C1:obscur": {} };
    expect(frequencyReach({ entries: list, lang: "fr", cards, cardIdFor, rankOf }).bands.beyond).toBe(1);
  });
  it("reports nothing for an untouched deck", () => {
    expect(frequencyReach({ entries: list, lang: "fr", cards: {}, cardIdFor, rankOf }).studied).toBe(0);
  });
});
