import { describe, it, expect } from "vitest";
import { scheduleCard, gradeFromWrongCount, isDue, cardStage, newCard, todayKey, addDays, isLeech, LEECH_LAPSES, daysUntil, cardId, prodCardId, isProdId, baseCardId, idForKind, PRODUCTION_KINDS, LEARNING_GAP_MS, isLearning, isReady } from "./srs.js";

describe("gradeFromWrongCount", () => {
  it("maps misses to SM-2 grades", () => {
    expect(gradeFromWrongCount(0)).toBe("good");
    expect(gradeFromWrongCount(1)).toBe("hard");
    expect(gradeFromWrongCount(2)).toBe("again");
    expect(gradeFromWrongCount(9)).toBe("again");
  });
});

describe("scheduleCard", () => {
  it("keeps a brand-new card for a second look the same day", () => {
    /* It used to go straight to a one-day interval, which made the whole
     * first encounter with a word one sitting and then nothing. */
    const c = scheduleCard(undefined, "good");
    expect(c.reps).toBe(0);
    expect(c.learning).toBe(1);
    expect(c.interval).toBe(0);
    expect(c.due).toBe(todayKey());
  });

  it("sends it one day out once it has been recalled a second time, later", () => {
    const t0 = Date.parse("2026-09-22T09:00:00Z");
    const first = scheduleCard(undefined, "good", "id", t0);
    const second = scheduleCard(first, "good", "id", t0 + LEARNING_GAP_MS);
    expect(second.reps).toBe(1);
    expect(second.interval).toBe(1);
    expect(second.due).toBe(addDays(todayKey(), 1));
    expect(second.learning).toBe(0);
  });

  it("does not let an answer seconds later count as the second look", () => {
    /* Clicking "review due" straight after a batch would otherwise graduate
     * every word in it — massed repetition dressed as spaced repetition. */
    const t0 = Date.parse("2026-09-22T09:00:00Z");
    const first = scheduleCard(undefined, "good", "id", t0);
    const again = scheduleCard(first, "good", "id", t0 + 30_000);
    expect(again.reps).toBe(0);
    expect(again.learning).toBe(1);
    expect(again.due).toBe(todayKey());
  });

  it("lets 'easy' skip the steps — no second look was asked for", () => {
    const c = scheduleCard(undefined, "easy");
    expect(c.reps).toBe(1);
    expect(c.interval).toBe(3);
  });

  it("sends a lapsed card back through the steps rather than onto the schedule", () => {
    const mature = { ease: 2.3, interval: 40, reps: 7, lapses: 0, due: todayKey(), lastSeen: null };
    const lapsed = scheduleCard(mature, "again", "id");
    expect(lapsed.learning).toBe(0);
    expect(lapsed.interval).toBe(0);
    const t0 = Date.now();
    const back = scheduleCard(lapsed, "good", "id", t0);
    expect(back.reps).toBe(0);          // still consolidating
    expect(back.due).toBe(todayKey());
  });

  it("calls a card in its learning steps 'learning', not 'new'", () => {
    const c = scheduleCard(undefined, "good");
    expect(cardStage(c)).toBe("learning");
    expect(isLearning(c)).toBe(true);
    expect(cardStage(undefined)).toBe("new");
  });

  it("leaves a card that has already graduated alone", () => {
    /* An existing learner's card has no `learning` field at all; it must not
     * be pulled back into the steps by its absence. */
    const known = { ease: 2.3, interval: 30, reps: 6, lapses: 0, due: todayKey(), lastSeen: null };
    const next = scheduleCard(known, "good", "id");
    expect(next.reps).toBe(7);
    expect(next.interval).toBeGreaterThan(30);
  });

  it("relearns today on a lapse, and records it", () => {
    const c = scheduleCard({ ...newCard(), reps: 4, interval: 20 }, "again");
    expect(c.interval).toBe(0);
    expect(c.reps).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.due).toBe(todayKey());
  });

  it("keeps ease inside its bounds however often you miss", () => {
    let c = newCard();
    for (let i = 0; i < 40; i++) c = scheduleCard(c, "again");
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
    let e = newCard();
    for (let i = 0; i < 40; i++) e = scheduleCard(e, "easy");
    expect(e.ease).toBeLessThanOrEqual(2.8);
  });

  it("graduates a repeatedly-hard card instead of plateauing", () => {
    /* interval * 1.2 rounds back to itself at small values, so without the
     * max(interval + 1, …) floor a "hard" card would never grow. */
    /* Walk it out of the learning steps first — the plateau this guards
     * against is a property of the schedule proper, not of the steps. */
    const t0 = Date.now();
    let c = scheduleCard(newCard(), "good", "", t0);
    c = scheduleCard(c, "good", "", t0 + LEARNING_GAP_MS);
    c = scheduleCard(c, "good", "", t0 + 2 * LEARNING_GAP_MS);
    const seen = [];
    for (let i = 0; i < 6; i++) { c = scheduleCard(c, "hard"); seen.push(c.interval); }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThan(seen[i - 1]);
  });

  it("never schedules beyond the cap", () => {
    let c = newCard();
    for (let i = 0; i < 60; i++) c = scheduleCard(c, "easy");
    expect(c.interval).toBeLessThanOrEqual(365);
  });

  it("does not mutate the card it is given", () => {
    const before = { ...newCard(), reps: 2, interval: 6 };
    const snapshot = JSON.stringify(before);
    scheduleCard(before, "good");
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe("isDue", () => {
  it("treats a card that has never been studied as due", () => {
    expect(isDue(undefined)).toBe(true);
  });
  it("is due on the day itself, not only after it", () => {
    expect(isDue({ due: todayKey() })).toBe(true);
  });
  it("is not due while it is still scheduled ahead", () => {
    expect(isDue({ due: addDays(todayKey(), 1) })).toBe(false);
  });
});

describe("cardStage", () => {
  it("buckets by interval, with unreviewed cards counting as new", () => {
    expect(cardStage(undefined)).toBe("new");
    expect(cardStage({ reps: 0, interval: 99 })).toBe("new");
    expect(cardStage({ reps: 1, interval: 6 })).toBe("learning");
    expect(cardStage({ reps: 1, interval: 7 })).toBe("young");
    expect(cardStage({ reps: 1, interval: 21 })).toBe("mature");
  });
});


describe("leeches", () => {
  it("flags a card only once it has lapsed enough times to be stuck", () => {
    expect(isLeech({ lapses: LEECH_LAPSES - 1 })).toBe(false);
    expect(isLeech({ lapses: LEECH_LAPSES })).toBe(true);
  });

  it("treats a card with no lapse history, or none at all, as fine", () => {
    expect(isLeech({ reps: 20 })).toBe(false);
    expect(isLeech(undefined)).toBe(false);
  });
});

describe("interval fuzz", () => {
  /* Reviews studied together come due together, so one heavy sitting used to
   * recreate itself as one heavy day every interval. The jitter breaks that up
   * — but it must not make the schedule unpredictable. */
  it("leaves short intervals exactly where they were", () => {
    // Moving a 1-day interval is noise, not spread.
    const c = scheduleCard(undefined, "good", "fr:A1:chat");
    expect(daysUntil(c.due)).toBe(c.interval);
  });

  it("keeps the due date within a few per cent of the interval", () => {
    let worst = 0;
    for (const key of ["fr:A1:chat", "de:B2:Ansatz", "fr:C1:enjeu", "de:C1:Ansatz", "x", ""]) {
      let c = { ...newCard(), reps: 5, interval: 40 };
      c = scheduleCard(c, "good", key);
      worst = Math.max(worst, Math.abs(daysUntil(c.due) - c.interval));
    }
    expect(worst).toBeGreaterThan(0);            // it does something
    expect(worst).toBeLessThanOrEqual(6);        // 5% of ~100, generously
  });

  it("does not compound: the interval itself is never fuzzed", () => {
    /* Only the landing date moves. If the fuzz fed back into `interval` the
     * schedule would drift further from the algorithm on every review. */
    let a = { ...newCard(), reps: 5, interval: 40 };
    let b = { ...a };
    a = scheduleCard(a, "good", "seed-one");
    b = scheduleCard(b, "good", "seed-two");
    expect(a.interval).toBe(b.interval);
  });

  it("is stable for the same card and answer", () => {
    // A re-render or a replayed action must not move the due date.
    const base = { ...newCard(), reps: 5, interval: 40 };
    const first = scheduleCard({ ...base }, "good", "fr:C1:enjeu");
    const again = scheduleCard({ ...base }, "good", "fr:C1:enjeu");
    expect(first.due).toBe(again.due);
  });
});

describe("the two cards a word has", () => {
  it("leaves the recognition id exactly as it was — every earned card stays put", () => {
    expect(cardId("de", "A1", "Haus")).toBe("de:A1:Haus");
  });

  it("gives production its own id", () => {
    expect(prodCardId("de", "A1", "Haus")).toBe("de:A1:Haus::prod");
    expect(prodCardId("de", "A1", "Haus")).not.toBe(cardId("de", "A1", "Haus"));
  });

  it("can tell the two apart, and find the recognition id behind either", () => {
    expect(isProdId("de:A1:Haus::prod")).toBe(true);
    expect(isProdId("de:A1:Haus")).toBe(false);
    expect(baseCardId("de:A1:Haus::prod")).toBe("de:A1:Haus");
    expect(baseCardId("de:A1:Haus")).toBe("de:A1:Haus");
  });

  it("sends each question kind to the card it is evidence about", () => {
    expect(idForKind("toEnglish", "de", "A1", "Haus")).toBe("de:A1:Haus");
    for (const kind of ["toTarget", "fillBlank", "sentence", "dictation", "speaking"]) {
      expect(idForKind(kind, "de", "A1", "Haus"), kind).toBe("de:A1:Haus::prod");
    }
  });

  it("treats an unknown kind as recognition rather than inventing a card", () => {
    expect(idForKind("something-new", "de", "A1", "Haus")).toBe("de:A1:Haus");
  });

  it("schedules the two independently from the same starting point", () => {
    /* The seed is the id, so the two cards of one word must not land on an
       identical fuzzed due date forever. */
    const shared = { ease: 2.3, interval: 30, reps: 5, lapses: 0, due: todayKey(), lastSeen: null };
    const rec = scheduleCard(shared, "good", cardId("de", "A1", "Haus"));
    const prod = scheduleCard(shared, "again", prodCardId("de", "A1", "Haus"));
    expect(prod.lapses).toBe(1);
    expect(rec.lapses).toBe(0);
    expect(prod.interval).toBe(0);
    expect(rec.interval).toBeGreaterThan(30);
  });

  it("holds every production kind the queue can emit", () => {
    expect(PRODUCTION_KINDS.has("toEnglish")).toBe(false);
    expect(PRODUCTION_KINDS.size).toBeGreaterThanOrEqual(5);
  });
});

describe("isReady", () => {
  const t0 = Date.parse("2026-09-22T09:00:00Z");

  it("holds back a word met minutes ago, however due the calendar says it is", () => {
    const fresh = scheduleCard(undefined, "good", "id", t0);
    expect(isDue(fresh)).toBe(true);              // by the calendar, yes
    expect(isReady(fresh, t0 + 60_000)).toBe(false);  // in practice, not yet
  });

  it("releases it once the gap has passed", () => {
    const fresh = scheduleCard(undefined, "good", "id", t0);
    expect(isReady(fresh, t0 + LEARNING_GAP_MS)).toBe(true);
  });

  it("does not hold back a card that is on the schedule proper", () => {
    const graduated = { reps: 3, interval: 10, due: todayKey(), seenAt: t0 };
    expect(isReady(graduated, t0 + 1000)).toBe(true);
  });

  it("treats a word never studied as ready", () => {
    expect(isReady(undefined, t0)).toBe(true);
  });

  it("never calls a card scheduled ahead ready", () => {
    expect(isReady({ reps: 2, interval: 5, due: addDays(todayKey(), 3) }, t0)).toBe(false);
  });
});
