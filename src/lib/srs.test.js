import { describe, it, expect } from "vitest";
import { scheduleCard, gradeFromWrongCount, isDue, cardStage, newCard, todayKey, addDays } from "./srs.js";

describe("gradeFromWrongCount", () => {
  it("maps misses to SM-2 grades", () => {
    expect(gradeFromWrongCount(0)).toBe("good");
    expect(gradeFromWrongCount(1)).toBe("hard");
    expect(gradeFromWrongCount(2)).toBe("again");
    expect(gradeFromWrongCount(9)).toBe("again");
  });
});

describe("scheduleCard", () => {
  it("sends a brand-new card one day out", () => {
    const c = scheduleCard(undefined, "good");
    expect(c.reps).toBe(1);
    expect(c.interval).toBe(1);
    expect(c.due).toBe(addDays(todayKey(), 1));
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
    let c = scheduleCard(scheduleCard(newCard(), "good"), "good");
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
