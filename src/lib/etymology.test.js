import { describe, it, expect } from "vitest";
import {
  bareForm, sameEtymon, chainRungs, branchPoint, forkedTree,
  buildFamilies, crossLingual, buildLawQuiz, gradeLawAnswer, lawsTouching,
  mergeChains, trunkEnd, rootAt,
} from "./etymology.js";
import { LAWS } from "../data/etymology.js";

/* The two chains below are what Wiktionary actually returns for père and
 * Vater, trimmed to the ancestry steps. They are the worked example the whole
 * section is built on, so the tests use them rather than invented data. */
const pere = [
  { kind: "inh", lang: "frm", form: "pere" },
  { kind: "inh", lang: "fro", form: "pedre" },
  { kind: "inh", lang: "la", form: "pater" },
  { kind: "inh", lang: "itc-pro", form: "*patēr" },
  { kind: "inh", lang: "ine-pro", form: "*ph₂tḗr" },
];
const vater = [
  { kind: "inh", lang: "gmh", form: "vater" },
  { kind: "inh", lang: "goh", form: "fater" },
  { kind: "inh", lang: "gmw-pro", form: "*fader" },
  { kind: "inh", lang: "gem-pro", form: "*fadēr" },
  { kind: "inh", lang: "ine-pro", form: "*ph₂tḗr" },
];

describe("bareForm / sameEtymon", () => {
  it("drops the reconstruction asterisk and any alternate citation", () => {
    expect(bareForm("*ph₂tḗr")).toBe("ph₂tḗr");
    expect(bareForm("pater,patrem")).toBe("pater");
  });
  it("matches the same etymon written with or without the asterisk", () => {
    expect(sameEtymon("*fadēr", "fadēr")).toBe(true);
    expect(sameEtymon("*ph₂tḗr", "*ph₂tḗr")).toBe(true);
  });
  it("does not match two different roots, or nothing at all", () => {
    expect(sameEtymon("pater", "mater")).toBe(false);
    expect(sameEtymon("", "")).toBe(false);
  });
});

describe("chainRungs", () => {
  it("puts the oldest ancestor first, because that is how descent reads", () => {
    const r = chainRungs(pere, "fr");
    expect(r.map((x) => x.layer)).toEqual(["pie", "itc", "la", "fro", "frm", "fr"]);
  });
  it("ends at the modern word itself", () => {
    const r = chainRungs(vater, "de");
    expect(r[r.length - 1]).toMatchObject({ layer: "de", leaf: true });
  });
  it("marks reconstructions, which are the ones that get an asterisk on screen", () => {
    const r = chainRungs(pere, "fr");
    expect(r.find((x) => x.layer === "pie").reconstructed).toBe(true);
    expect(r.find((x) => x.layer === "la").reconstructed).toBe(false);
  });
  it("drops rungs it has no label for rather than drawing a blank box", () => {
    const r = chainRungs([{ kind: "inh", lang: "xyz-pro", form: "*q" }, ...pere], "fr");
    expect(r.some((x) => x.layer === "xyz-pro")).toBe(false);
  });
});

describe("branchPoint", () => {
  it("finds where French and German parted company", () => {
    const fork = branchPoint(chainRungs(pere, "fr"), chainRungs(vater, "de"));
    expect(fork).toEqual({ layer: "pie", form: "ph₂tḗr" });
  });
  it("returns null for words that only look related", () => {
    /* Two independent borrowings share no ancestor, and saying so is more
     * useful than inventing one. */
    const a = chainRungs([{ kind: "bor", lang: "ar", form: "qahwa" }], "fr");
    const b = chainRungs([{ kind: "bor", lang: "la", form: "unrelated" }], "de");
    expect(branchPoint(a, b)).toBe(null);
  });
});

describe("forkedTree", () => {
  const t = forkedTree(chainRungs(pere, "fr"), chainRungs(vater, "de"));
  it("draws the shared trunk once, not twice", () => {
    expect(t.shared.map((r) => r.layer)).toEqual(["pie"]);
  });
  it("hands each language only the rungs below the fork", () => {
    expect(t.left.map((r) => r.layer)).toEqual(["itc", "la", "fro", "frm", "fr"]);
    expect(t.right.map((r) => r.layer)).toEqual(["gem", "gmw", "goh", "gmh", "de"]);
  });
  it("keeps both limbs whole when there is no fork", () => {
    const u = forkedTree(chainRungs(pere, "fr"), chainRungs([{ kind: "bor", lang: "ar", form: "x" }], "de"));
    expect(u.fork).toBe(null);
    expect(u.left.length).toBeGreaterThan(0);
    expect(u.right.length).toBeGreaterThan(0);
  });
});

describe("buildFamilies", () => {
  const entries = [
    { lang: "fr", t: "père", e: "father", level: "A1", chain: pere },
    { lang: "de", t: "Vater", e: "father", level: "A1", chain: vater },
    { lang: "fr", t: "paternel", e: "paternal", level: "B2", chain: [{ kind: "der", lang: "la", form: "pater" }] },
    { lang: "fr", t: "chat", e: "cat", level: "A1", chain: [{ kind: "inh", lang: "la", form: "cattus" }] },
  ];
  const fams = buildFamilies(entries);

  it("groups words under every ancestor they share", () => {
    const latin = fams.find((f) => f.layer === "la" && f.form === "pater");
    expect(latin.members.map((m) => m.t).sort()).toEqual(["paternel", "père"]);
  });
  it("drops an ancestor with only one descendant — a family of one teaches nothing", () => {
    expect(fams.some((f) => f.form === "cattus")).toBe(false);
  });
  it("does not treat the modern languages as ancestors of themselves", () => {
    expect(fams.some((f) => f.layer === "fr" || f.layer === "de")).toBe(false);
  });
  it("puts the biggest family first", () => {
    expect(fams[0].members.length).toBeGreaterThanOrEqual(fams[fams.length - 1].members.length);
  });
  it("finds the families that cross the fork", () => {
    const cross = crossLingual(fams);
    expect(cross.some((f) => f.layer === "pie")).toBe(true);
    expect(cross.every((f) => f.members.some((m) => m.lang === "fr") && f.members.some((m) => m.lang === "de"))).toBe(true);
  });
});

describe("buildLawQuiz", () => {
  const law = LAWS.find((l) => l.id === "grimm-p-f");

  it("asks for the form it hid, and leaves the other examples on screen", () => {
    const q = buildLawQuiz(law, 0, "de");
    expect(q.answer).toBeTruthy();
    expect(q.examples.every((p) => p[q.ask] !== q.answer)).toBe(true);
    expect(q.examples.length).toBeGreaterThan(0);
  });
  it("never asks for a form the language does not have", () => {
    /* "few" has no German descendant; asking for it would have no answer. */
    for (let i = 0; i < law.pairs.length + 3; i += 1) {
      expect(buildLawQuiz(law, i, "de").answer).not.toBe("—");
    }
  });
  it("cycles through the pairs as the index advances, and wraps", () => {
    const seen = new Set();
    for (let i = 0; i < 12; i += 1) seen.add(buildLawQuiz(law, i, "de").answer);
    expect(seen.size).toBeGreaterThan(1);
    expect(buildLawQuiz(law, -1, "de")).toBeTruthy();
  });
  it("gives up rather than pose an unanswerable question", () => {
    expect(buildLawQuiz({ pairs: [{ g: "x", de: "—" }] }, 0, "de")).toBe(null);
  });
});

describe("gradeLawAnswer", () => {
  it("ignores case, accents and ß, which are not what is being tested", () => {
    expect(gradeLawAnswer("fuss", "Fuß")).toBe(true);
    expect(gradeLawAnswer("VATER", "Vater")).toBe(true);
    expect(gradeLawAnswer("pere", "père")).toBe(true);
  });
  it("ignores an article the learner adds", () => {
    expect(gradeLawAnswer("der Vater", "Vater")).toBe(true);
  });
  it("still rejects the wrong word, and an empty one", () => {
    expect(gradeLawAnswer("Mutter", "Vater")).toBe(false);
    expect(gradeLawAnswer("", "Vater")).toBe(false);
    expect(gradeLawAnswer("   ", "Vater")).toBe(false);
  });
});

describe("lawsTouching", () => {
  it("offers Grimm for a Germanic chain and the Gallo-Romance rules for a French one", () => {
    expect(lawsTouching(chainRungs(vater, "de")).some((l) => l.group === "grimm")).toBe(true);
    expect(lawsTouching(chainRungs(pere, "fr")).some((l) => l.group === "gallo")).toBe(true);
  });
  it("offers the High German shift only where the word passed through it", () => {
    expect(lawsTouching(chainRungs(vater, "de")).some((l) => l.group === "hg")).toBe(true);
    expect(lawsTouching(chainRungs(pere, "fr")).some((l) => l.group === "hg")).toBe(false);
  });
});

describe("mergeChains", () => {
  const father = [
    { kind: "inh", lang: "ang", form: "fæder" },
    { kind: "inh", lang: "gmw-pro", form: "*fader" },
    { kind: "inh", lang: "gem-pro", form: "*fadēr" },
    { kind: "inh", lang: "ine-pro", form: "*ph₂tḗr" },
  ];
  const tree = mergeChains([
    { lang: "fr", rungs: chainRungs(pere, "fr") },
    { lang: "de", rungs: chainRungs(vater, "de") },
    { lang: "en", rungs: chainRungs(father, "en") },
  ]);

  it("shares one trunk at the root all three descend from", () => {
    expect(tree.layer).toBe("pie");
    expect(tree.langs.sort()).toEqual(["de", "en", "fr"]);
  });
  it("splits Latin off first, keeping English and German together", () => {
    /* The whole reason English is worth adding: it is German's sibling, not
     * France's. Three equal columns would hide that. */
    expect(tree.children).toHaveLength(2);
    const germanic = tree.children.find((c) => c.layer === "gem");
    expect(germanic.langs.sort()).toEqual(["de", "en"]);
    const italic = tree.children.find((c) => c.layer === "itc");
    expect(italic.langs).toEqual(["fr"]);
  });
  it("splits English from German only at West Germanic", () => {
    const gmw = trunkEnd(tree.children.find((c) => c.layer === "gem"));
    expect(gmw.layer).toBe("gmw");
    expect(gmw.children.map((c) => c.layer).sort()).toEqual(["ang", "goh"]);
  });
  it("still works for two languages", () => {
    const t2 = mergeChains([
      { lang: "fr", rungs: chainRungs(pere, "fr") },
      { lang: "de", rungs: chainRungs(vater, "de") },
    ]);
    expect(t2.layer).toBe("pie");
    expect(t2.children).toHaveLength(2);
  });
  it("reports a forest rather than invent a shared parent", () => {
    const t = mergeChains([
      { lang: "fr", rungs: chainRungs(pere, "fr") },
      { lang: "de", rungs: chainRungs([{ kind: "bor", lang: "ar", form: "qahwa" }], "de") },
    ]);
    expect(t.forest).toBe(true);
    expect(t.children.length).toBeGreaterThan(1);
  });
});

describe("rootAt", () => {
  const deep = chainRungs(pere, "fr");
  it("starts the chain at the ancestor the family is named for", () => {
    const trimmed = rootAt(deep, "la", "pater");
    expect(trimmed[0].layer).toBe("la");
  });
  it("lets two chains of unequal depth still merge", () => {
    /* French bleu is traced to PIE, German blau stops at Proto-Germanic.
     * Raw, they produce two roots and no tree. */
    const frDeep = chainRungs([
      { kind: "inh", lang: "frk", form: "*blāu" },
      { kind: "inh", lang: "gem-pro", form: "*blēwaz" },
      { kind: "inh", lang: "ine-pro", form: "*bʰléh₁-" },
    ], "fr");
    const deShallow = chainRungs([
      { kind: "inh", lang: "goh", form: "blāo" },
      { kind: "inh", lang: "gem-pro", form: "*blēwaz" },
    ], "de");
    expect(mergeChains([{ lang: "fr", rungs: frDeep }, { lang: "de", rungs: deShallow }]).forest).toBe(true);
    const merged = mergeChains([
      { lang: "fr", rungs: rootAt(frDeep, "gem", "blēwaz") },
      { lang: "de", rungs: rootAt(deShallow, "gem", "blēwaz") },
    ]);
    expect(merged.forest).toBeUndefined();
    expect(merged.layer).toBe("gem");
  });
  it("leaves a chain alone when the ancestor is not in it", () => {
    expect(rootAt(deep, "grc", "nope")).toEqual(deep);
  });
});
