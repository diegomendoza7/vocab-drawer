import { describe, it, expect } from "vitest";
import { buildSentence, SUBJECTS, SENTENCE_SHAPES, pickModal, pickOpener, shapeInfo } from "./sentences.js";
import { FR_VERBS, DE_VERBS } from "../data/content.js";
import { DATA } from "../data/vocab.js";

const frVerb = FR_VERBS.find((v) => v.inf === "voir");
const deVerb = DE_VERBS.find((v) => v.inf === "sehen");
const frNoun = DATA.fr.A1.flatMap((g) => g.words).find((w) => w.t === "livre");
const deNoun = DATA.de.A1.flatMap((g) => g.words).find((w) => w.t === "Buch");
const frI = SUBJECTS.fr[0];
const deI = SUBJECTS.de[0];

const fr = (shape, extra = {}, tenseKey = "present") =>
  buildSentence({ lang: "fr", verb: frVerb, tenseKey, subject: frI, noun: frNoun, shape, ...extra });
const de = (shape, extra = {}, tenseKey = "praesens") =>
  buildSentence({ lang: "de", verb: deVerb, tenseKey, subject: deI, noun: deNoun, shape, ...extra });

describe("the difficulty ladder", () => {
  it("names five rungs, easiest first", () => {
    expect(SENTENCE_SHAPES.map((s) => s.id)).toEqual(["plain", "time", "negative", "modal", "subordinate"]);
    expect(shapeInfo("nonsense").id).toBe("plain");
  });
});

describe("negative", () => {
  it("wraps the French verb in ne … pas", () => {
    expect(fr("negative").display).toBe("Je ne vois pas le livre.");
  });
  it("elides ne before a vowel, in the perfect", () => {
    /* "je n'ai pas vu" — and it is the auxiliary that gets clamped, not the
     * participle, which is the mistake this level exists to prevent. */
    expect(fr("negative", {}, "passe").display).toBe("Je n'ai pas vu le livre.");
  });
  it("puts the German nicht after the object", () => {
    expect(de("negative").display).toBe("Ich sehe das Buch nicht.");
  });
  it("keeps the German participle last in the perfect", () => {
    expect(de("negative", {}, "perfekt").display).toBe("Ich habe das Buch nicht gesehen.");
  });
  it("says it in English the way an English speaker would", () => {
    expect(fr("negative").english).toBe("I do not see the book.");
  });
});

describe("modal", () => {
  const frModal = pickModal("fr", FR_VERBS, 0, 0);
  const deModal = pickModal("de", DE_VERBS, 0, 0);

  it("keeps the two French verbs together", () => {
    expect(fr("modal", { modal: frModal }).display).toBe("Je veux voir le livre.");
  });
  it("throws the German infinitive to the end — the verb bracket", () => {
    /* This is the whole reason the level exists: same two verbs, same meaning,
     * and the object lands between them in German and after them in French. */
    expect(de("modal", { modal: deModal }).display).toBe("Ich will das Buch sehen.");
    expect(de("modal", { modal: deModal }).tokens.slice(-1)[0]).toBe("sehen");
  });
  it("conjugates the modal for the subject, not the main verb", () => {
    const third = pickModal("de", DE_VERBS, 2, 0);
    expect(third.form).toBe("will");
    const s = buildSentence({ lang: "de", verb: deVerb, tenseKey: "praesens", subject: SUBJECTS.de[3], noun: deNoun, shape: "modal", modal: pickModal("de", DE_VERBS, 3, 0) });
    expect(s.tokens).toContain("wollen");
  });
  it("does not put an -s on can or must in the English", () => {
    const must = pickModal("fr", FR_VERBS, 2, 2);
    const s = buildSentence({ lang: "fr", verb: frVerb, tenseKey: "present", subject: SUBJECTS.fr[2], noun: frNoun, shape: "modal", modal: must });
    expect(s.english).toBe("He must see the book.");
  });
});

describe("subordinate", () => {
  it("sends the German finite verb to the very end", () => {
    const s = de("subordinate", { opener: pickOpener("de", 0) });
    expect(s.display).toBe("Ich denke, dass ich das Buch sehe.");
    expect(s.tokens[s.tokens.length - 1]).toBe("sehe");
  });
  it("leaves the French verb where it was", () => {
    expect(fr("subordinate", { opener: pickOpener("fr", 0) }).display)
      .toBe("Je pense que je vois le livre.");
  });
  it("carries the German comma on the opener rather than as its own tile", () => {
    /* A floating comma tile is a puzzle about typography, not word order. */
    const s = de("subordinate", { opener: pickOpener("de", 0) });
    expect(s.tokens).toContain("denke,");
    expect(s.tokens).not.toContain(",");
  });
});

describe("every shape stays buildable", () => {
  it("produces tokens, a gloss for each, and an English prompt", () => {
    for (const { id } of SENTENCE_SHAPES) {
      for (const [lang, verb, noun, subj, verbs, tense] of [
        ["fr", frVerb, frNoun, frI, FR_VERBS, "present"],
        ["de", deVerb, deNoun, deI, DE_VERBS, "praesens"],
      ]) {
        const s = buildSentence({
          lang, verb, tenseKey: tense, subject: subj, noun, shape: id,
          time: id === "time" ? { tok: lang === "fr" ? "aujourd'hui" : "heute", en: "today" } : null,
          modal: id === "modal" ? pickModal(lang, verbs, subj.p, 0) : null,
          opener: id === "subordinate" ? pickOpener(lang, 0) : null,
        });
        expect(s.tokens.length, `${lang}/${id}`).toBeGreaterThan(2);
        expect(s.glosses.length, `${lang}/${id}`).toBe(s.tokens.length);
        expect(s.english, `${lang}/${id}`).toMatch(/\.$/);
        expect(s.tokens.every((t) => t && t.trim()), `${lang}/${id}`).toBe(true);
      }
    }
  });
});
