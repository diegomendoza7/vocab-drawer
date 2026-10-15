import { describe, it, expect } from "vitest";
import {
  createProgress,
  logAnswer,
  mergeBackup,
  validateProgress,
  migrateProgress,
} from "./progress.js";
import { recoverSession } from "../hooks/useProgress.js";

describe("versioned progress and transfer", () => {
  it("counts an identical answer event once when two devices exchange files repeatedly", () => {
    const a = logAnswer(createProgress(), true, {
      id: "same-review",
      lang: "fr",
    });
    const b = logAnswer(createProgress(), false, {
      id: "other-review",
      lang: "fr",
    });
    const first = mergeBackup(a, b).progress,
      again = mergeBackup(first, b).progress;
    expect(Object.keys(again.reviewEvents)).toHaveLength(2);
    expect(
      Object.values(again.history).reduce((n, d) => n + d.reviews, 0),
    ).toBe(2);
    expect(again.history).toEqual(first.history);
  });
  it("retains the later same-day failure even though it has fewer repetitions", () => {
    const mine = {
      ...createProgress(),
      cards: {
        "fr:A1:chat": { reps: 5, lapses: 0, seenAt: 100, due: "2026-10-14" },
      },
    };
    const theirs = {
      ...createProgress(),
      cards: {
        "fr:A1:chat": { reps: 0, lapses: 1, seenAt: 200, due: "2026-10-14" },
      },
    };
    expect(
      mergeBackup(mine, theirs).progress.cards["fr:A1:chat"],
    ).toMatchObject({ reps: 0, lapses: 1, seenAt: 200 });
  });
  it("restores every supported learning field, including preferences and personal media captions", () => {
    const data = {
      ...createProgress(),
      dailyGoal: 40,
      preferences: { lang: "de", minutes: 10 },
      errors: { x: { count: 2 } },
      fluency: { x: { best: 8, runs: [] } },
      placement: { de: { level: "A2" } },
      missions: { x: { stage: 3 } },
      journal: [{ id: "j", lang: "de", text: "Hallo", at: "2026-10-13" }],
      phrasebook: [{ id: "p", text: "Guten Tag" }],
      mediaSessions: {
        m: { id: "m", cues: [{ start: 0, end: 1, text: "Hallo" }] },
      },
    };
    const restored = mergeBackup(createProgress(), data, {
      restore: true,
    }).progress;
    for (const field of [
      "dailyGoal",
      "preferences",
      "errors",
      "fluency",
      "placement",
      "missions",
      "journal",
      "phrasebook",
      "mediaSessions",
    ])
      expect(restored[field]).toEqual(data[field]);
  });
  it("does not duplicate legacy daily totals when event IDs were never recorded", () => {
    const old = {
      cards: {},
      history: { "2026-10-13": { reviews: 10, correct: 8 } },
    };
    const first = mergeBackup(createProgress(), old).progress;
    expect(mergeBackup(first, old).progress.history).toEqual(old.history);
  });
  it("rejects corrupt and future-version backups before applying them", () => {
    for (const bad of [
      null,
      { cards: [] },
      { cards: { x: null } },
      { cards: { x: { interval: NaN } } },
      { cards: {}, schemaVersion: 99 },
    ])
      expect(() => validateProgress(bad)).toThrow();
  });
  it("preserves unknown historic estimates rather than inventing production evidence", () => {
    const old = {
      cards: { "fr:A1:chat": { reps: 4, interval: 30 } },
      history: {},
    };
    const migrated = migrateProgress(old);
    expect(migrated.cards["fr:A1:chat"]).toEqual(old.cards["fr:A1:chat"]);
    expect(migrated.cards["fr:A1:chat::prod"]).toBeUndefined();
  });
});

describe("editable learning records across devices", () => {
  it("keeps newer phrase reviews and journal rewrites when their IDs already exist", () => {
    const local = {
      ...createProgress(),
      phrasebook: [
        { id: "p", text: "Bonjour", reviewedAt: 100, card: { seenAt: 100 } },
      ],
      journal: [{ id: "j", at: "2026-10-10", text: "Un souvenir." }],
    };
    const incoming = {
      ...createProgress(),
      phrasebook: [
        {
          id: "p",
          text: "Bonjour",
          reviewedAt: 200,
          card: { seenAt: 200, interval: 3 },
        },
      ],
      journal: [
        {
          id: "j",
          at: "2026-10-10",
          text: "Un souvenir.",
          revisedAt: "2026-10-14",
        },
      ],
    };
    const merged = mergeBackup(local, incoming).progress;
    expect(merged.phrasebook).toEqual(incoming.phrasebook);
    expect(merged.journal).toEqual(incoming.journal);
    expect(mergeBackup(merged, incoming).progress.phrasebook).toEqual(
      merged.phrasebook,
    );
  });
  it("preserves a newer pause even if an older card review has a higher seenAt", () => {
    const local = {
      ...createProgress(),
      cards: { "fr:A1:chat": { seenAt: 100, updatedAt: 300, suspended: true } },
    };
    const incoming = {
      ...createProgress(),
      cards: { "fr:A1:chat": { seenAt: 200, suspended: false } },
    };
    expect(
      mergeBackup(local, incoming).progress.cards["fr:A1:chat"].suspended,
    ).toBe(true);
  });
});

describe("interrupted review recovery", () => {
  it("applies a saved failure once, including conjugation, while rejecting another language", () => {
    const progress = {
      ...createProgress(),
      pendingSession: {
        id: "session",
        lang: "fr",
        results: [
          ["fr:A1:chat", { word: { t: "chat" }, level: "A1", wrongCount: 1 }],
          ["fr:conj:être:present", { conj: true, wrongCount: 1 }],
          ["de:A1:chat", { word: { t: "chat" }, wrongCount: 1 }],
        ],
      },
    };
    const recovered = recoverSession(progress);
    expect(recovered.cards["fr:A1:chat"].lapses).toBe(1);
    expect(recovered.cards["fr:conj:être:present"].lapses).toBe(1);
    expect(recovered.cards["de:A1:chat"]).toBeUndefined();
    expect(recovered.pendingSession).toBeNull();
    expect(
      recoverSession({ ...recovered, pendingSession: progress.pendingSession })
        .cards,
    ).toEqual(recovered.cards);
  });
});
