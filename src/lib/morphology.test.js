import { describe, it, expect } from "vitest";
import { segment, spell, familyWords, affixesUsed, buildFamilyQuiz, countKind } from "./morphology.js";
import { FAMILIES, ENGLISH_DEMO } from "../data/morphology.js";

describe("segment", () => {
  it("reads the sigils into kinds", () => {
    expect(segment("<ver =sprech .en")).toEqual([
      { text: "ver", kind: "prefix" },
      { text: "sprech", kind: "root" },
      { text: "en", kind: "ending" },
    ]);
  });
  it("handles a suffix and a bare root", () => {
    expect(segment("=port >able")).toEqual([
      { text: "port", kind: "root" },
      { text: "able", kind: "suffix" },
    ]);
  });
  it("treats an unmarked piece as the root, since every word has one", () => {
    expect(segment("voir")).toEqual([{ text: "voir", kind: "root" }]);
  });
  it("survives empty input rather than throwing", () => {
    expect(segment("")).toEqual([]);
    expect(segment(undefined)).toEqual([]);
  });
});

describe("spell", () => {
  it("reassembles the word the segmentation describes", () => {
    expect(spell("<ver =sprech .en")).toBe("versprechen");
    expect(spell("<trans =port")).toBe("transport");
    expect(spell(ENGLISH_DEMO.p)).toBe("unbecoming");
  });
});

describe("familyWords", () => {
  const fam = FAMILIES.find((f) => f.id === "de-sprech");
  it("puts the base verb first and marks it", () => {
    const all = familyWords(fam);
    expect(all[0].w).toBe("sprechen");
    expect(all[0].base).toBe(true);
  });
  it("keeps every member", () => {
    expect(familyWords(fam)).toHaveLength(fam.members.length + 1);
  });
});

describe("affixesUsed", () => {
  it("finds the prefixes a family actually contains", () => {
    const fam = FAMILIES.find((f) => f.id === "de-sprech");
    const forms = affixesUsed(fam, "de").map((a) => a.form);
    expect(forms).toContain("ver-");
    expect(forms).toContain("be-");
    expect(forms).toContain("aus-");
  });
  it("matches an affix listed with variants", () => {
    /* "re- / ré-" has to be found from either spelling. */
    const fam = FAMILIES.find((f) => f.id === "fr-ven");
    expect(affixesUsed(fam, "fr").map((a) => a.id)).toContain("fr-re");
  });
  it("does not offer the other language's affixes", () => {
    const fam = FAMILIES.find((f) => f.id === "fr-port");
    expect(affixesUsed(fam, "fr").every((a) => a.id.startsWith("fr-"))).toBe(true);
  });
});

describe("buildFamilyQuiz", () => {
  const fam = FAMILIES.find((f) => f.id === "de-komm");

  it("asks for a word by its meaning and includes the answer", () => {
    const q = buildFamilyQuiz(fam, 0);
    expect(q.options.some((o) => o.w === q.answer)).toBe(true);
    expect(q.ask).toBeTruthy();
  });
  it("draws the wrong options from the same family, so only the prefix separates them", () => {
    const q = buildFamilyQuiz(fam, 1);
    const inFamily = new Set(fam.members.map((m) => m.w));
    expect(q.options.every((o) => inFamily.has(o.w))).toBe(true);
  });
  it("never offers the same word twice", () => {
    for (let i = 0; i < 10; i += 1) {
      const q = buildFamilyQuiz(fam, i);
      expect(new Set(q.options.map((o) => o.w)).size).toBe(q.options.length);
    }
  });
  it("walks the family as the index advances, and wraps on a negative", () => {
    const seen = new Set();
    for (let i = 0; i < 12; i += 1) seen.add(buildFamilyQuiz(fam, i).answer);
    expect(seen.size).toBeGreaterThan(2);
    expect(buildFamilyQuiz(fam, -1)).toBeTruthy();
  });
  it("declines rather than pose a question with too few options", () => {
    expect(buildFamilyQuiz({ members: [{ w: "a", e: "a" }] }, 0)).toBe(null);
  });
});

describe("countKind", () => {
  it("counts parts by kind", () => {
    expect(countKind("<ver =sprech .en", "prefix")).toBe(1);
    expect(countKind("<ver =sprech .en", "root")).toBe(1);
    expect(countKind("=port >able", "suffix")).toBe(1);
  });
});
