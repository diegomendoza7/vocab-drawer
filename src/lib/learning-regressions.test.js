import { describe, it, expect } from "vitest";
import {
  scheduleCard,
  isReady,
  isLeech,
  LEARNING_GAP_MS,
  newCard,
} from "./srs.js";
import { abilityFrom } from "./ability.js";
import { scheduleResults } from "./study.js";
import { checkGrammar, resetLanguageTool } from "./grammar.js";
import { speechEvidence } from "./speech-evidence.js";
import { fitDailyRoute } from "./daily-route.js";
import { recordActivity, strandBalance } from "./strands.js";

describe("learning evidence stays honest", () => {
  it("does not call a future assigned interval an observed week-long retention", () => {
    const cards = { "fr:A1:chat": { ...newCard(), interval: 365, reps: 20 } };
    const result = abilityFrom({
      entries: [{ level: "A1", word: { t: "chat" } }],
      lang: "fr",
      cards,
    });
    expect(result.recognise.holding).toBe(0);
    expect(result.produce.holding).toBe(0);
    expect(result.estimated.recognise).toBe(1);
  });
  it("records a real seven-day independent gap and clears that evidence after a failure", () => {
    const now = Date.now(),
      card = { ...newCard(), reps: 3, interval: 7, seenAt: now - 7 * 86400000 };
    const good = scheduleCard(card, "good", "word", now);
    expect(good.retainedDays).toBe(7);
    expect(
      scheduleCard(good, "again", "word", now + 86400000).retainedDays,
    ).toBe(0);
  });
  it("holds back both first learning and relearning after a lapse", () => {
    const now = Date.now();
    const fresh = scheduleCard(null, "good", "word", now),
      failed = scheduleCard({ ...newCard(), reps: 4 }, "again", "word", now);
    for (const card of [fresh, failed]) {
      expect(isReady(card, now + 1000)).toBe(false);
      expect(isReady(card, now + LEARNING_GAP_MS)).toBe(true);
    }
  });
  it("does not advance a schedule for assisted answers or successful early practice", () => {
    const cards = { word: { ...newCard(), reps: 5, interval: 20 } };
    for (const row of [
      { assisted: true, wrongCount: 0 },
      { independent: false, wrongCount: 0 },
      { practiceOnly: true, wrongCount: 0 },
    ])
      expect(scheduleResults(cards, [["word", row]]).cards).toEqual(cards);
  });
  it("keeps lifetime lapse history while allowing rehabilitation", () => {
    const now = Date.now();
    let card = {
      ...newCard(),
      lapses: 8,
      recentLapses: 8,
      seenAt: now - LEARNING_GAP_MS,
    };
    expect(isLeech(card)).toBe(true);
    card = scheduleCard(card, "good", "word", now);
    expect(isLeech(card)).toBe(true);
    card = scheduleCard(card, "good", "word", now + LEARNING_GAP_MS);
    expect(isLeech(card)).toBe(false);
    expect(card.lapses).toBe(8);
  });
  it("gives no clean grammar score when a remote check fails", async () => {
    resetLanguageTool();
    const result = await checkGrammar("Je suis aller au marché.", "fr", {
      fetchImpl: () => Promise.reject(new Error("offline")),
    });
    expect(result.score.accuracy).toBeNull();
    expect(result.score.errorFree).toBeNull();
    expect(result.assessment.verified).toBe(false);
  });
  it("refuses transcript overlap when negation or a critical number changes", () => {
    expect(
      speechEvidence("Ich esse keinen Fisch.", "Ich esse Fisch.").matches,
    ).toBe(false);
    expect(
      speechEvidence("Ich esse Fisch.", "Ich esse keinen Fisch.").matches,
    ).toBe(false);
    expect(
      speechEvidence("Der Zug fährt um 14 Uhr.", "Der Zug fährt um 4 Uhr.")
        .matches,
    ).toBe(false);
    expect(
      speechEvidence(
        "Bonjour, je voudrais un café.",
        "Bonjour je voudrais un café",
      ).matches,
    ).toBe(true);
  });
  it("keeps a five-minute route within its chosen time", () => {
    const route = fitDailyRoute(
      [
        { action: "learn" },
        { action: "listen" },
        { action: "write" },
        { action: "repair" },
      ],
      5,
    );
    expect(route).toHaveLength(2);
    expect(route.reduce((n, t) => n + t.minutes, 0)).toBe(5);
  });
  it("counts actual touched dates per strand without double-counting same-day activities", () => {
    let activity = recordActivity({}, "fr:study", "2026-10-13");
    activity = recordActivity(activity, "fr:grammar", "2026-10-13");
    activity = recordActivity(activity, "de:reading", "2026-10-13");
    const rows = strandBalance(activity, "2026-10-13", { lang: "fr" });
    expect(rows.find((r) => r.strand === "form").days).toBe(1);
    expect(rows.find((r) => r.strand === "input").days).toBe(0);
  });
});
