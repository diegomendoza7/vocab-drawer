import { describe, it, expect } from "vitest";
import {
  normalizeAnswer, foldAccents, checkTyped, checkOrder, keyIdeas, checkInto,
  usesMissing, wordCount, lessonGloss, shuffleChunks, lessonTotal,
} from "./lessons.js";

describe("normalizeAnswer", () => {
  it("ignores case, punctuation, quotes and spacing", () => {
    expect(normalizeAnswer("  « Je  m’endors. » ")).toBe("je m'endors");
  });
  it("keeps accents and ß — that is the strict form", () => {
    expect(normalizeAnswer("Égaux")).toBe("égaux");
    expect(normalizeAnswer("verstößt")).toBe("verstößt");
  });
  it("keeps a hyphen inside a word but not one standing alone", () => {
    expect(normalizeAnswer("moi-même — ici")).toBe("moi-même ici");
  });
  it("drops an apostrophe used as a quotation mark, keeping one inside a word", () => {
    /* Caught by check-lessons: a translation typed in quotes — 'What has
     * happened?' — failed to match "what", because the quote mark read as
     * part of the word. */
    expect(normalizeAnswer("'What has happened to me?' he thought.")).toBe("what has happened to me he thought");
    expect(normalizeAnswer("l'homme doesn't")).toBe("l'homme doesn't");
  });

  it("treats a non-breaking space as a space", () => {
    expect(normalizeAnswer("dire\u00a0:")).toBe("dire");
  });
});

describe("foldAccents", () => {
  it("folds accents and ß for the lenient comparison", () => {
    expect(foldAccents("Égaux")).toBe("egaux");
    expect(foldAccents("verstößt")).toBe("verstosst");
  });
});

describe("checkTyped", () => {
  it("accepts an exact answer", () => {
    expect(checkTyped("égales", { accept: ["égales"] })).toMatchObject({ ok: true, verdict: "right" });
  });

  it("accepts an accent-only slip, and says so", () => {
    const r = checkTyped("egales", { accept: ["égales"] });
    expect(r).toMatchObject({ ok: true, verdict: "accent" });
    expect(r.note).toMatch(/égales/);
  });

  it("does not accept a wrong ending — agreement is the point of the drill", () => {
    expect(checkTyped("égale", { accept: ["égales"] }).ok).toBe(false);
    expect(checkTyped("fondés", { accept: ["fondées"] }).ok).toBe(false);
  });

  it("ignores a French article the learner added", () => {
    expect(checkTyped("la borne", { accept: ["borne"] }, "fr").ok).toBe(true);
    expect(checkTyped("l'abus", { accept: ["abus"] }, "fr").ok).toBe(true);
  });

  it("accepts a German noun with no article", () => {
    expect(checkTyped("Würde", { accept: ["Würde"], g: "die" }, "de").ok).toBe(true);
  });

  it("accepts a German noun with the right article", () => {
    expect(checkTyped("die Würde", { accept: ["Würde"], g: "die" }, "de")).toMatchObject({ ok: true, verdict: "right" });
  });

  it("names a wrong German article rather than calling the word wrong", () => {
    const r = checkTyped("der Würde", { accept: ["Würde"], g: "die" }, "de");
    expect(r).toMatchObject({ ok: false, verdict: "gender" });
    expect(r.note).toMatch(/die Würde/);
  });

  it("accepts a synonym the text did not use, with a note naming the text's word", () => {
    const r = checkTyped("rester", { accept: ["demeurer"], also: { rester: "the text uses « demeurer »" } });
    expect(r).toMatchObject({ ok: true, verdict: "also" });
    expect(r.note).toMatch(/demeurer/);
  });

  it("is not fooled by a German article on a verb answer", () => {
    expect(checkTyped("schützen", { accept: ["schützen"] }, "de").ok).toBe(true);
  });

  it("calls an empty answer empty, not wrong", () => {
    expect(checkTyped("  ", { accept: ["x"] }).verdict).toBe("empty");
  });
});

describe("checkOrder", () => {
  const accept = ["jeder darf frei sprechen soweit er anderen nicht schadet", "soweit er anderen nicht schadet darf jeder frei sprechen"];
  it("accepts any order the lesson declares correct", () => {
    expect(checkOrder(["Jeder", "darf", "frei", "sprechen", "soweit", "er", "anderen", "nicht", "schadet"], accept).ok).toBe(true);
    expect(checkOrder(["soweit", "er", "anderen", "nicht", "schadet", "darf", "Jeder", "frei", "sprechen"], accept).ok).toBe(true);
  });
  it("rejects the English order after a fronted clause", () => {
    expect(checkOrder(["soweit", "er", "anderen", "nicht", "schadet", "Jeder", "darf", "frei", "sprechen"], accept).ok).toBe(false);
  });
});

describe("keyIdeas", () => {
  const key = [["only", "solely", "except"], ["social"], ["common good", "utility"]];

  it("passes a translation that carries every idea, however it is worded", () => {
    expect(keyIdeas("Social distinctions may be founded solely on common utility.", key).ok).toBe(true);
  });

  it("reports the idea that went missing — the misreading of ne … que", () => {
    const r = keyIdeas("Social distinctions cannot be based on the common good.", key);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual([0]);
  });

  it("matches on word boundaries, so a short word does not hide inside a longer one", () => {
    expect(keyIdeas("it was so", [["as"]]).ok).toBe(false);
    expect(keyIdeas("as he woke", [["as"]]).ok).toBe(true);
  });

  it("lets a stem cover its forms", () => {
    expect(keyIdeas("he was metamorphosed", [["metamorphos"]]).ok).toBe(true);
  });

  it("fails an empty answer rather than passing an empty key", () => {
    expect(keyIdeas("", []).ok).toBe(false);
  });
});

describe("checkInto", () => {
  const item = {
    accept: ["la loi ne peut être changée que par le peuple"],
    must: [
      { any: ["ne peut"], hint: "ne before the verb" },
      { any: ["que par"], hint: "que before the restriction" },
      { any: ["changée", "modifiée"], hint: "agreement" },
    ],
  };

  it("verifies a known-good version", () => {
    expect(checkInto("La loi ne peut être changée que par le peuple.", item)).toMatchObject({ ok: true, verdict: "right" });
  });

  it("accepts an accent-only slip", () => {
    expect(checkInto("la loi ne peut etre changee que par le peuple", item).ok).toBe(true);
  });

  it("names exactly what is missing from a wrong version", () => {
    const r = checkInto("La loi peut seulement être changé par le peuple.", item);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(["ne before the verb", "que before the restriction", "agreement"]);
  });

  it("does not call an unseen but plausible sentence wrong — it says it could not verify it", () => {
    const r = checkInto("La loi ne peut être modifiée que par le peuple souverain.", item);
    expect(r.ok).toBe(false);
    expect(r.verdict).toBe("unverified");
    expect(r.missing).toEqual([]);
  });

  it("checks a verb-last requirement against the last word only", () => {
    const de = { accept: [], must: [{ any: ["achtet"], atEnd: true, hint: "verb last" }] };
    expect(checkInto("Jeder ist frei, soweit er das Gesetz achtet.", de).missing).toEqual([]);
    expect(checkInto("Jeder ist frei, soweit er achtet das Gesetz.", de).missing).toEqual(["verb last"]);
  });
});

describe("usesMissing", () => {
  const uses = [{ re: "\\bn(?:e\\s|['’])[^.!?]*?\\bqu(?:e\\b|['’])", msg: "no ne … que" }];
  it("finds ne … que, including with elision", () => {
    expect(usesMissing("On ne peut le limiter que par la loi.", uses)).toEqual([]);
    expect(usesMissing("Je n'ai qu'une idée.", uses)).toEqual([]);
  });
  it("reports it absent when it is", () => {
    expect(usesMissing("Je ne sais pas.", uses)).toEqual(["no ne … que"]);
  });
});

describe("small helpers", () => {
  it("counts words, treating elided and hyphenated forms as one", () => {
    expect(wordCount("L'homme est moi-même.")).toBe(3);
  });

  it("finds a gloss through an elided article", () => {
    expect(lessonGloss({ utilité: "usefulness" }, "l'utilité")).toBe("usefulness");
    expect(lessonGloss({ utilité: "usefulness" }, "L’utilité")).toBe("usefulness");
    expect(lessonGloss({}, "rien")).toBe(null);
  });

  it("never hands out a chunk bank already in a correct order", () => {
    const chunks = ["Il", "me", "semblait", "que", "j'étais", "le livre"];
    const accept = ["il me semblait que j'étais le livre"];
    for (let seed = 1; seed < 40; seed += 1) {
      const order = shuffleChunks(chunks, seed, accept).map((c) => c.t);
      expect(normalizeAnswer(order.join(" "))).not.toBe(accept[0]);
      expect([...order].sort()).toEqual([...chunks].sort());
    }
  });

  it("totals graded stages only", () => {
    expect(lessonTotal({ understand: [3, 4], words: null, grammar: [7, 9] })).toEqual({ right: 10, total: 13, share: 10 / 13 });
    expect(lessonTotal({}).share).toBe(null);
  });
});
