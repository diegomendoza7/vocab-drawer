import { describe, it, expect } from "vitest";
import { FR_VERBS, DE_VERBS, FR_TENSES, DE_TENSES, conjugate, conjugateEnglish } from "./content.js";
import { FR_C1_VERBS, DE_C1_VERBS } from "./verbs-c1.js";

const fr = (inf) => FR_VERBS.find((v) => v.inf === inf);
const de = (inf) => DE_VERBS.find((v) => v.inf === inf);
/* conjugate() returns bare forms — "wäre", and "ai parlé" for compounds. */
const forms = (lang, verb, tense) => conjugate(lang, verb, tense);

describe("French conditionnel", () => {
  it("is the future stem with imperfect endings", () => {
    expect(forms("fr", fr("parler"), "conditionnel"))
      .toEqual(["parlerais", "parlerais", "parlerait", "parlerions", "parleriez", "parleraient"]);
  });
  it("keeps the irregular future stems", () => {
    expect(forms("fr", fr("être"), "conditionnel")[0]).toBe("serais");
    expect(forms("fr", fr("avoir"), "conditionnel")[0]).toBe("aurais");
    expect(forms("fr", fr("aller"), "conditionnel")[0]).toBe("irais");
    expect(forms("fr", fr("faire"), "conditionnel")[2]).toBe("ferait");
    expect(forms("fr", fr("venir"), "conditionnel")[0]).toBe("viendrais");
  });
});

describe("French subjonctif", () => {
  it("derives regular verbs from the ils stem, across all three groups", () => {
    expect(forms("fr", fr("parler"), "subjonctif"))
      .toEqual(["parle", "parles", "parle", "parlions", "parliez", "parlent"]);
    expect(forms("fr", fr("finir"), "subjonctif"))
      .toEqual(["finisse", "finisses", "finisse", "finissions", "finissiez", "finissent"]);
    expect(forms("fr", fr("vendre"), "subjonctif"))
      .toEqual(["vende", "vendes", "vende", "vendions", "vendiez", "vendent"]);
  });

  it("uses the stored forms for the irregulars", () => {
    expect(forms("fr", fr("être"), "subjonctif"))
      .toEqual(["sois", "sois", "soit", "soyons", "soyez", "soient"]);
    expect(forms("fr", fr("avoir"), "subjonctif"))
      .toEqual(["aie", "aies", "ait", "ayons", "ayez", "aient"]);
    expect(forms("fr", fr("aller"), "subjonctif")[0]).toBe("aille");
    expect(forms("fr", fr("pouvoir"), "subjonctif")[0]).toBe("puisse");
    expect(forms("fr", fr("savoir"), "subjonctif")[0]).toBe("sache");
  });

  it("keeps the nous/vous stem change the irregulars actually have", () => {
    // vouloir is veuille but voulions — the trap the ils-stem rule would miss.
    expect(forms("fr", fr("vouloir"), "subjonctif")[3]).toBe("voulions");
    expect(forms("fr", fr("venir"), "subjonctif")[3]).toBe("venions");
  });
});

describe("German Konjunktiv II", () => {
  it("umlauts strong verbs", () => {
    expect(forms("de", de("sein"), "konjunktiv2")[0]).toBe("wäre");
    expect(forms("de", de("kommen"), "konjunktiv2")[0]).toBe("käme");
    expect(forms("de", de("fahren"), "konjunktiv2")[0]).toBe("führe");
    expect(forms("de", de("geben"), "konjunktiv2")[0]).toBe("gäbe");
    expect(forms("de", de("nehmen"), "konjunktiv2")[0]).toBe("nähme");
    expect(forms("de", de("haben"), "konjunktiv2")[0]).toBe("hätte");
    expect(forms("de", de("werden"), "konjunktiv2")[0]).toBe("würde");
  });

  it("leaves weak verbs identical to the Präteritum", () => {
    /* machte is both "made" and "would make" — the reason German reaches for
     * "würde machen". Umlauting it would invent a form that does not exist. */
    expect(forms("de", de("machen"), "konjunktiv2")[0]).toBe("machte");
    expect(forms("de", de("machen"), "konjunktiv2"))
      .toEqual(forms("de", de("machen"), "praeteritum"));
  });

  it("umlauts the modals that do, and not the ones that don't", () => {
    expect(forms("de", de("können"), "konjunktiv2")[0]).toBe("könnte");
    expect(forms("de", de("müssen"), "konjunktiv2")[0]).toBe("müsste");
    expect(forms("de", de("wollen"), "konjunktiv2")[0]).toBe("wollte");  // no umlaut
  });

  it("declines through all six persons", () => {
    expect(forms("de", de("sein"), "konjunktiv2"))
      .toEqual(["wäre", "wärest", "wäre", "wären", "wäret", "wären"]);
  });
});

describe("every verb in every mood produces six usable forms", () => {
  /* The rules run over 188 French and 351 German verbs. A stem that does not
   * fit shows up as an empty or undefined cell rather than an error, so the
   * sweep is the only thing that would catch it. */
  for (const [lang, verbs, tenses] of [
    ["fr", [...FR_VERBS, ...FR_C1_VERBS], FR_TENSES],
    ["de", [...DE_VERBS, ...DE_C1_VERBS], DE_TENSES],
  ]) {
    it(`${lang}: ${verbs.length} verbs × ${tenses.length} tenses`, () => {
      const bad = [];
      for (const v of verbs) {
        for (const t of tenses) {
          const out = conjugate(lang, v, t.key);
          if (out.length !== 6) bad.push(`${v.inf}/${t.key}: ${out.length} forms`);
          out.forEach((f, i) => {
            if (!f || /undefined|NaN/.test(f)) bad.push(`${v.inf}/${t.key}[${i}] = ${f}`);
          });
          const en = conjugateEnglish(lang, v, t.key, 0);
          if (!en || /undefined/.test(en)) bad.push(`${v.inf}/${t.key} english = ${en}`);
        }
      }
      expect(bad.slice(0, 10)).toEqual([]);
    });
  }
});

describe("the everyday verbs added for the vocabulary", () => {
  it("handles the -ger / -cer spelling change in the imperfect", () => {
    /* The soft consonant survives only before a and o. One stem cannot express
     * that, which is why these two carry six explicit forms. */
    expect(forms("fr", fr("manger"), "imparfait"))
      .toEqual(["mangeais", "mangeais", "mangeait", "mangions", "mangiez", "mangeaient"]);
    expect(forms("fr", fr("commencer"), "imparfait"))
      .toEqual(["commençais", "commençais", "commençait", "commencions", "commenciez", "commençaient"]);
  });

  it("keeps the stressed vowel out of nous/vous in the subjunctive", () => {
    // achetions, not achètions — the ils-stem rule would have carried the è over.
    expect(forms("fr", fr("acheter"), "subjonctif")[3]).toBe("achetions");
    expect(forms("fr", fr("payer"), "subjonctif")[3]).toBe("payions");
    expect(forms("fr", fr("boire"), "subjonctif")).toEqual(["boive", "boives", "boive", "buvions", "buviez", "boivent"]);
  });

  it("conjugates the new irregulars correctly", () => {
    expect(forms("fr", fr("boire"), "present")).toEqual(["bois", "bois", "boit", "buvons", "buvez", "boivent"]);
    expect(forms("fr", fr("comprendre"), "present")[5]).toBe("comprennent");
    expect(forms("fr", fr("comprendre"), "passe")[0]).toBe("ai compris");
    expect(forms("fr", fr("partir"), "passe")[0]).toBe("suis parti");   // être verb
  });

  it("puts the French reflexive pronoun in front, eliding where it must", () => {
    expect(forms("fr", fr("lever"), "present")[0]).toBe("me lève");
    expect(forms("fr", fr("lever"), "present")[3]).toBe("nous levons");
  });

  it("sends a German separable prefix to the end of the clause", () => {
    expect(forms("de", de("aufstehen"), "praesens")[0]).toBe("stehe auf");
    expect(forms("de", de("ankommen"), "praeteritum")[0]).toBe("kam an");
    // ...and folds it back into the participle.
    expect(forms("de", de("aufstehen"), "perfekt")[0]).toBe("bin aufgestanden");
  });

  it("conjugates the new German strong and mixed verbs correctly", () => {
    expect(forms("de", de("trinken"), "praeteritum")[0]).toBe("trank");
    expect(forms("de", de("helfen"), "praesens")[2]).toBe("hilft");
    expect(forms("de", de("wissen"), "praesens")[0]).toBe("weiß");
    expect(forms("de", de("denken"), "konjunktiv2")[0]).toBe("dächte");   // mixed
    expect(forms("de", de("mögen"), "konjunktiv2")[0]).toBe("möchte");
  });
});
