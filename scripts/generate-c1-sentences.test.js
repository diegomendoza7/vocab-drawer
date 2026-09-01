import { describe, it, expect } from "vitest";
import { entriesNeedingSentences, makeCloze } from "./generate-c1-sentences.mjs";

/* The generator itself needs a key, so what is checked here is everything that
 * decides *what gets written*: which entries are selected, and whether the
 * cloze it builds can find its own answer again. Those are the parts that
 * would corrupt the data file, and neither needs the network. */

describe("entriesNeedingSentences", () => {
  const FIXTURE = `
export const FR_C1 = [
  { topic: "Inquiry", icon: X, words: [
    { t: "démarche", e: "approach, methodology", art: "une", gen: "f" },
    { t: "constat", e: "observation", art: "un", gen: "m", s: "Le constat est clair.", b: "Le _____ est clair.", ba: "constat", se: "The finding is clear." },
    { t: "lecture", e: "reading", art: "une", gen: "f", n: "une lecture marxiste" },
  ]},
];`;

  it("selects only the entries with no sentence", () => {
    const out = entriesNeedingSentences(FIXTURE);
    expect(out.map((e) => e.t)).toEqual(["démarche", "lecture"]);
  });

  it("keeps the exact source text so it can be replaced in place", () => {
    const [first] = entriesNeedingSentences(FIXTURE);
    expect(FIXTURE).toContain(first.whole);
    expect(first.whole.endsWith("}")).toBe(true);
  });

  it("carries German gender through, so the prompt can show der/die/das", () => {
    const de = `{ t: "Erkenntnis", e: "insight", g: "die" },`;
    expect(entriesNeedingSentences(de)[0].g).toBe("die");
  });

  it("unescapes quotes in the gloss", () => {
    const src = String.raw`{ t: "lecture", e: "reading, NOT \"lecture\"" },`;
    expect(entriesNeedingSentences(src)[0].e).toBe('reading, NOT "lecture"');
  });

  it("is stable when run twice over its own output", () => {
    /* The run is resumable, so a word that has just been given a sentence must
     * not be picked up again on the next pass. */
    const after = FIXTURE.replace(
      '{ t: "démarche", e: "approach, methodology", art: "une", gen: "f" }',
      '{ t: "démarche", e: "approach, methodology", art: "une", gen: "f", s: "Une démarche rigoureuse.", b: "Une _____ rigoureuse.", ba: "démarche", se: "A rigorous approach." }',
    );
    expect(entriesNeedingSentences(after).map((e) => e.t)).toEqual(["lecture"]);
  });
});

describe("makeCloze", () => {
  it("blanks the headword where it appears", () => {
    expect(makeCloze("Une démarche rigoureuse s'impose.", "démarche"))
      .toBe("Une _____ rigoureuse s'impose.");
  });

  it("returns null when the word is not there, so the row can be rejected", () => {
    /* This is the check that matters. A sentence using an inflected form would
     * otherwise be stored with a cloze that still shows the answer, or none at
     * all — worse than leaving the word without an example. */
    expect(makeCloze("Une approche rigoureuse s'impose.", "démarche")).toBeNull();
  });

  it("blanks only the first occurrence", () => {
    expect(makeCloze("Le constat suit le constat.", "constat"))
      .toBe("Le _____ suit le constat.");
  });

  it("handles multi-word headwords", () => {
    expect(makeCloze("Il faut mettre en évidence ce lien.", "mettre en évidence"))
      .toBe("Il faut _____ ce lien.");
  });
});
