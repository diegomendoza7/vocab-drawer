import { describe, it, expect } from "vitest";
import { clinicLessons } from "./personal-clinic.js";
import { createProgress, validateProgress } from "./progress.js";
describe("personal mistake lessons", () => {
  it("puts the learner’s own pattern and safely reconstructed suggestion before general lessons", () => {
    const lessons = clinicLessons("de", [
      {
        lang: "de",
        rule: "de-verb-second",
        examples: [
          {
            text: "Gestern ich war zu Hause.",
            wrong: "ich war",
            fix: "war ich",
          },
        ],
      },
    ]);
    expect(lessons[0]).toMatchObject({
      personalError: true,
      original: "Gestern ich war zu Hause.",
      model: "Gestern war ich zu Hause.",
      rule: "de-verb-second",
    });
    expect(lessons[0].explanation).toContain("second");
    expect(lessons.slice(1)).toHaveLength(3);
  });
  it("does not invent a correction when the original excerpt or suggestion is missing", () => {
    expect(
      clinicLessons("fr", [
        {
          lang: "fr",
          rule: "lt:GRAMMAR",
          examples: [{ text: "Je suis aller.", wrong: "absent", fix: "allé" }],
        },
      ])[0].model,
    ).toBeNull();
    expect(
      clinicLessons("fr", [
        { lang: "de", rule: "de-case", examples: [{ text: "Hallo" }] },
      ]),
    ).toHaveLength(3);
  });
});
describe("attachment and subtitle backup validation", () => {
  it("rejects malformed new learning records before they can reach a view", () => {
    for (const fields of [
      { missions: { x: null } },
      { missions: { x: { stage: 99 } } },
      { journal: [{ text: { bad: true } }] },
      { phrasebook: [{ text: "Bonjour", translation: [] }] },
      { cards: { x: { ease: "2.3" } } },
      { cards: { x: { learning: -1 } } },
      { cards: { x: { suspended: "false" } } },
      {
        mediaSessions: { m: { cues: [{ start: 0, end: -1, text: "Hallo" }] } },
      },
    ])
      expect(() =>
        validateProgress({ ...createProgress(), ...fields }),
      ).toThrow();
  });
  it("keeps valid local attachment references and parallel caption records", () => {
    const progress = {
      ...createProgress(),
      journal: [{ id: "j", text: "Une photo.", photo: "p", recording: "r" }],
      mediaSessions: {
        m: {
          cues: [{ start: 0, end: 1, text: "Bonjour" }],
          english: [{ start: 0, end: 1, text: "Hello" }],
        },
      },
    };
    expect(validateProgress(progress)).toBe(progress);
  });
});
