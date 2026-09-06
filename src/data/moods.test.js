import { describe, it, expect } from "vitest";
import {
  FR_VERBS, DE_VERBS, FR_TENSES, DE_TENSES, conjugate, conjugateEnglish,
  personsFor, hasTense, ALL_PERSONS, spokenForm,
} from "./content.js";
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

describe("French impératif", () => {
  it("has tu, nous and vous — and nothing else", () => {
    expect(personsFor("fr", "imperatif")).toEqual([1, 3, 4]);
    const out = forms("fr", fr("parler"), "imperatif");
    expect(out).toEqual([null, "parle", null, "parlons", "parlez", null]);
  });

  it("drops the -s from -er verbs and aller, and keeps it elsewhere", () => {
    /* "parles" answers a question; "parle" gives an order. The -ir and -re
     * verbs keep theirs, which is the half of the rule usually forgotten. */
    expect(forms("fr", fr("parler"), "imperatif")[1]).toBe("parle");
    expect(forms("fr", fr("manger"), "imperatif")[1]).toBe("mange");
    expect(forms("fr", fr("aller"), "imperatif")[1]).toBe("va");
    expect(forms("fr", fr("finir"), "imperatif")[1]).toBe("finis");
    expect(forms("fr", fr("vendre"), "imperatif")[1]).toBe("vends");
    expect(forms("fr", fr("prendre"), "imperatif")[1]).toBe("prends");
  });

  it("uses the subjunctive stem for the four verbs that do", () => {
    expect(forms("fr", fr("être"), "imperatif")[1]).toBe("sois");
    expect(forms("fr", fr("avoir"), "imperatif")[1]).toBe("aie");
    expect(forms("fr", fr("savoir"), "imperatif")[1]).toBe("sache");
    expect(forms("fr", fr("vouloir"), "imperatif")[4]).toBe("veuillez");
    // vouloir keeps the regular nous — "veuillons" is not a form anyone says.
    expect(forms("fr", fr("vouloir"), "imperatif")[3]).toBe("voulons");
  });

  it("moves the reflexive pronoun behind the verb, and te becomes toi", () => {
    /* Everywhere else in French the pronoun precedes. The affirmative
     * imperative is the one place it does not, and the one place "te" is
     * stressed. */
    expect(forms("fr", fr("lever"), "imperatif")).toEqual(
      [null, "lève-toi", null, "levons-nous", "levez-vous", null]);
  });
});

describe("German Imperativ", () => {
  it("has du, wir, ihr and Sie", () => {
    expect(personsFor("de", "imperativ")).toEqual([1, 3, 4, 5]);
  });

  it("keeps the e→i stem change but undoes the a→ä umlaut", () => {
    /* The half of the rule that is actually hard: sprichst gives "sprich",
     * but fährst gives "fahr", not "fähr". */
    expect(forms("de", de("sprechen"), "imperativ")[1]).toBe("sprich");
    expect(forms("de", de("geben"), "imperativ")[1]).toBe("gib");
    expect(forms("de", de("nehmen"), "imperativ")[1]).toBe("nimm");
    expect(forms("de", de("helfen"), "imperativ")[1]).toBe("hilf");
    expect(forms("de", de("sehen"), "imperativ")[1]).toBe("sieh");
    expect(forms("de", de("fahren"), "imperativ")[1]).toBe("fahr");
  });

  it("falls back to the infinitive stem when the present form is not a base", () => {
    // hast → "ha" and wirst → "wir" are not stems; both must come off the infinitive.
    expect(forms("de", de("haben"), "imperativ")[1]).toBe("hab");
    expect(forms("de", de("werden"), "imperativ")[1]).toBe("werde");
    expect(forms("de", de("sein"), "imperativ")[1]).toBe("sei");
  });

  it("adds -e only where the stem needs it", () => {
    expect(forms("de", de("warten"), "imperativ")[1]).toBe("warte");
    expect(forms("de", de("beenden"), "imperativ")[1]).toBe("beende");
    // …and not after a doubled sonorant, where it would be wrong.
    expect(forms("de", de("kommen"), "imperativ")[1]).toBe("komm");
    expect(forms("de", de("lernen"), "imperativ")[1]).toBe("lern");
  });

  it("builds wir and Sie from the infinitive plus the pronoun", () => {
    expect(forms("de", de("gehen"), "imperativ")[3]).toBe("gehen wir");
    expect(forms("de", de("gehen"), "imperativ")[5]).toBe("gehen Sie");
    expect(forms("de", de("sein"), "imperativ")[5]).toBe("seien Sie");
  });

  it("sends a separable prefix to the end in all four persons", () => {
    expect(forms("de", de("aufstehen"), "imperativ"))
      .toEqual([null, "steh auf", null, "stehen wir auf", "steht auf", "stehen Sie auf"]);
  });

  it("gives the modals no imperative at all", () => {
    /* "kann!" is not something a German speaker can say, so the cell has to be
     * absent rather than filled with a derived form. */
    expect(hasTense("de", de("können"), "imperativ")).toBe(false);
    expect(hasTense("de", de("gehen"), "imperativ")).toBe(true);
    expect(forms("de", de("wollen"), "imperativ")).toEqual([null, null, null, null, null, null]);
  });
});

describe("the imperative's English is a command, not a statement", () => {
  it("drops the subject, and says let's for the first person plural", () => {
    // Rendering through the pronoun table would give "you are" for "sois".
    expect(conjugateEnglish("fr", fr("être"), "imperatif", 1)).toBe("be!");
    expect(conjugateEnglish("fr", fr("parler"), "imperatif", 3)).toBe("let's speak!");
    expect(conjugateEnglish("de", de("gehen"), "imperativ", 5)).toBe("go!");
    expect(conjugateEnglish("de", de("essen"), "imperativ", 3)).toBe("let's eat!");
  });
});

describe("every verb in every mood produces a usable form for every person it has", () => {
  /* The rules run over 190 French and 355 German verbs. A stem that does not
   * fit shows up as an empty or undefined cell rather than an error, so the
   * sweep is the only thing that would catch it.
   *
   * Since the imperative arrived this also asserts the other direction: a
   * person a mood does *not* have must be null, never an empty string. The
   * whole app distinguishes "absent" from "blank", and a "" here would read
   * as a data bug at every call site. */
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
          if (!hasTense(lang, v, t.key)) {
            if (out.some((f) => f !== null)) bad.push(`${v.inf}/${t.key}: has forms it should not`);
            continue;
          }
          const has = personsFor(lang, t.key);
          for (const i of has) {
            const f = out[i];
            if (!f || /undefined|NaN/.test(f)) bad.push(`${v.inf}/${t.key}[${i}] = ${f}`);
          }
          for (const i of ALL_PERSONS) {
            if (!has.includes(i) && out[i] !== null) bad.push(`${v.inf}/${t.key}[${i}] = ${JSON.stringify(out[i])}, want null`);
          }
          const en = conjugateEnglish(lang, v, t.key, has[0]);
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

describe("spokenForm", () => {
  const sayFr = (inf, tense, i) => spokenForm("fr", i, conjugate("fr", fr(inf), tense)[i], tense);
  const sayDe = (inf, tense, i) => spokenForm("de", i, conjugate("de", de(inf), tense)[i], tense);

  it("says the whole phrase, not the bare form", () => {
    /* Nobody utters "suis" on its own; the point of hearing it is the phrase. */
    expect(sayFr("être", "present", 0)).toBe("je suis");
    expect(sayDe("sein", "praesens", 0)).toBe("ich bin");
  });
  it("elides je before a vowel, with no space", () => {
    expect(sayFr("avoir", "present", 0)).toBe("j'ai");
  });
  it("speaks one pronoun where the table lists several", () => {
    /* The table writes "il/elle" and "er/sie/es" to show which persons share a
     * form. Read aloud that becomes "il slash elle". */
    expect(sayFr("être", "present", 2)).toBe("il est");
    expect(sayDe("sein", "praesens", 2)).toBe("er ist");
    expect(sayDe("sein", "praesens", 5)).toBe("sie sind");
  });
  it("gives the imperative no pronoun at all", () => {
    /* "Sois!" is the imperative. "Tu sois" is the subjunctive and means
     * something else, so adding the pronoun would teach the wrong form. */
    expect(sayFr("être", "imperatif", 1)).toBe("sois");
    expect(sayDe("sein", "imperativ", 1)).toBe("sei");
  });
  it("returns nothing for a person the tense does not have", () => {
    expect(spokenForm("fr", 0, null, "imperatif")).toBe("");
    expect(spokenForm("fr", 0, undefined, "present")).toBe("");
  });
});
