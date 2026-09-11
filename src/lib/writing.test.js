import { describe, it, expect } from "vitest";
import { keyIdeas, copiedStretch, sentenceShape, vocabProfile, lexicalForms, summarize, fold, rankOf } from "./writing.js";

describe("key ideas", () => {
  it("finds an idea through inflection and elision", () => {
    const r = keyIdeas("Le train était retardé à cause de l'orage.", [["retard", "tard"], ["orage", "tempête"]]);
    expect(r).toEqual({ found: [0, 1], missing: [], total: 2 });
  });
  it("reports what is missing", () => {
    expect(keyIdeas("Il fait beau.", [["pluie"], ["beau"]]).missing).toEqual([0]);
  });
  it("needs a whole word for short alternatives", () => {
    expect(keyIdeas("Nous partons mercredi.", [["mer"]]).found).toEqual([]);
    expect(keyIdeas("Nous allons à la mer.", [["mer"]]).found).toEqual([0]);
  });
  it("folds umlauts and ß", () => {
    const r = keyIdeas("Er war müde, weil er schlecht geschlafen hat. Die Straße war laut.", [["müde"], ["schlaf"], ["strasse"]]);
    expect(r.found).toEqual([0, 2]);
    expect(r.missing).toEqual([1]);                // "geschlafen" does not start with "schlaf"
  });
});

describe("copying", () => {
  it("finds the longest run shared with the passage", () => {
    const source = "Le matin, Claire prend le bus de sept heures pour aller au travail.";
    const r = copiedStretch("Claire prend le bus de sept heures pour aller au bureau.", source);
    expect(r.words).toBe(10);                     // "au" is shared too
    expect(r.text).toBe("Claire prend le bus de sept heures pour aller au");
  });
  it("is zero when nothing is shared", () => {
    expect(copiedStretch("Bonjour.", "Au revoir.").words).toBe(0);
  });
});

describe("sentence shape", () => {
  it("wants enough words to be a sentence", () => {
    expect(sentenceShape("Oui.").short).toBe(true);
    expect(sentenceShape("Il est parti hier soir.")).toEqual({ words: 5, short: false, capital: true, ends: true });
  });
  it("notices a missing capital and full stop", () => {
    expect(sentenceShape("il est parti hier soir")).toMatchObject({ capital: false, ends: false });
  });
});

describe("vocabulary", () => {
  it("splits French elision the way the frequency list does", () => {
    expect(lexicalForms("L'homme qu'il aime aujourd'hui", "fr").map((t) => t.form))
      .toEqual(["l'", "homme", "qu'", "il", "aime", "aujourd'hui"]);
  });
  it("sorts words into frequency bands", () => {
    const ranks = new Map([["le", 5], ["chat", 900], ["dort", 1500], ["paisiblement", 7000]]);
    const p = vocabProfile("Le chat dort paisiblement.", "fr", { ranks });
    expect(p.bands).toEqual({ k1: 2, k2: 1, k5: 0, k10: 1, off: 0 });
    expect(p.beyond2k).toBe(0.25);
    expect(p.beyondWords).toEqual(["paisiblement"]);
  });
  it("leaves out spans it is told to skip, such as misspellings", () => {
    const ranks = new Map([["le", 5], ["chat", 900]]);
    const p = vocabProfile("Le chat mnage.", "fr", { ranks, skip: (s) => s === 8 });
    expect(p.tokens).toBe(2);
  });
  it("lists the drawer words used", () => {
    const known = (f) => ({ chat: "chat", dort: "dormir" })[f] || null;
    expect(vocabProfile("Le chat dort.", "fr", { knownLemma: known }).drawerWords).toEqual(["chat", "dormir"]);
  });
  it("ranks a hyphenated word by its rarer part", () => {
    expect(rankOf("peut-être", new Map([["peut", 50], ["être", 30]]))).toBe(50);
  });
  it("folds for matching only", () => {
    expect(fold("Sœur Straße Élan")).toBe("soeur strasse elan");
  });
});

describe("summary", () => {
  it("totals sentences and ideas over a sitting", () => {
    const s = summarize([
      { score: { sentences: 2, errorFree: 1, words: 12 }, ideas: { found: [0], total: 2 } },
      { score: { sentences: 1, errorFree: 1, words: 6 }, ideas: { found: [0, 1], total: 2 } },
      null,
    ]);
    expect(s).toEqual({ sentences: 3, errorFree: 2, accuracy: 67, found: 3, total: 4, words: 18 });
  });
});
