import { describe, it, expect, beforeEach } from "vitest";
import {
  germanLexicon, germanIssues, splitSentences, scoreGrammar, kindOf, fromLanguageTool,
  mergeIssues, checkWithLanguageTool, checkGrammar, resetLanguageTool, ltBudget, applyFix, LT_PER_MINUTE,
} from "./grammar.js";
import { DE_VERBS } from "../data/content.js";

/* A hand-picked lexicon, so the tests say which genders they rely on rather
 * than depending on whatever the deck happens to hold. */
const NOUNS = [
  ["Auto", "das"], ["Frau", "die"], ["Bus", "der"], ["Freund", "der"], ["Schule", "die"],
  ["Haus", "das"], ["Hund", "der"], ["Buch", "das"], ["Kind", "das"], ["Bahnhof", "der"],
  ["Mädchen", "das"], ["Idee", "die"], ["Zeit", "die"], ["Glück", "das"],
];
const lex = germanLexicon({ data: { de: { A1: [{ words: NOUNS.map(([t, g]) => ({ t, g })) }] } }, verbs: DE_VERBS });
const issues = (s) => germanIssues(s, lex);
const rules = (s) => issues(s).map((i) => i.rule);
const fixes = (s) => issues(s).flatMap((i) => i.fixes);

describe("German word order", () => {
  it("wants the verb second after a fronted adverb", () => {
    expect(rules("Gestern ich bin ins Kino gegangen.")).toContain("de-verb-second");
    expect(fixes("Gestern ich bin ins Kino gegangen.")).toContain("bin ich");
    expect(fixes("Am Montag ich gehe zur Schule.")).toContain("gehe ich");
  });
  it("wants the verb straight after a clause that opens the sentence", () => {
    expect(fixes("Wenn ich Zeit habe, ich gehe ins Kino.")).toContain("gehe ich");
  });
  it("catches it even when the opening clause's verb is not in the tables", () => {
    /* « aufwachen » is not in the verb tables, so the rule used to stay
     * silent here — on the very mistake Lesson 2 teaches. */
    expect(fixes("Als er aufwachte, er sah seinen Bauch.")).toContain("sah er");
    expect(fixes("Nachdem wir gegessen hatten, wir sind gegangen.")).toContain("sind wir");
  });
  it("still leaves the correct order alone", () => {
    expect(rules("Als er aufwachte, sah er seinen Bauch.")).toEqual([]);
  });
  it("does not mistake a phrase for a clause", () => {
    expect(rules("Bis bald, ich freue mich.")).toEqual([]);
    expect(rules("Als Kind war ich oft krank.")).toEqual([]);
  });
  it("leaves a relevance conditional alone when it cannot see a verb", () => {
    expect(rules("Wenn du Durst hast, im Kühlschrank ist Bier.")).toEqual([]);
  });
  it("sends the conjugated verb to the end of a subordinate clause", () => {
    expect(fixes("Ich habe keine Zeit, weil ich muss arbeiten.")).toContain("arbeiten muss");
    expect(fixes("Ich weiß, dass er hat keine Zeit.")).toContain("keine Zeit hat");
    expect(fixes("Ich bleibe zu Hause, weil der Bus ist spät.")).toContain("spät ist");
  });
  it("rejoins a separable prefix when it moves the verb", () => {
    expect(fixes("Ich bin müde, weil ich stehe früh auf.")).toContain("früh aufstehe");
  });
});

describe("German agreement", () => {
  it("matches a pronoun to its verb form", () => {
    expect(fixes("Du bin mein Freund.")).toContain("Du bist");
    expect(fixes("Ich hast einen Hund.")).toContain("Ich habe");
    expect(fixes("Wir geht nach Hause.")).toContain("Wir gehen");
  });
  it("checks inverted questions", () => {
    expect(fixes("Kannst ich kommen?")).toContain("Kann ich");
  });
});

describe("German case and gender", () => {
  it("wants the dative after mit, zu, von", () => {
    expect(fixes("Ich fahre mit das Auto.")).toContain("mit dem");
    expect(fixes("Ich fahre mit der Bus.")).toContain("mit dem");
    expect(fixes("Ich gehe zu die Schule.")).toContain("zur");
  });
  it("wants the accusative after für", () => {
    expect(fixes("Das Geschenk ist für dem Freund.")).toContain("für den");
  });
  it("catches contractions that carry the wrong gender", () => {
    expect(fixes("Ich gehe zum Schule.")).toContain("zur");
    expect(fixes("Ich gehe ins Schule.")).toContain("in die");
    expect(fixes("Wir fahren zur Bahnhof.")).toContain("zum");
  });
  it("checks the article on a sentence-initial subject", () => {
    expect(fixes("Der Frau ist nett.")).toContain("Die");
    expect(fixes("Das Hund ist groß.")).toContain("Der");
  });
  it("wants the strong adjective ending after a bare ein-word", () => {
    expect(fixes("Du bist mein beste Freund.")).toContain("bester");
    expect(fixes("Das ist ein schöne Haus.")).toContain("schönes");
  });
  it("flags a masculine object without guessing the fix", () => {
    const hit = issues("Ich habe ein neue Hund.").find((i) => i.rule === "de-adjective-ending");
    expect(hit).toBeTruthy();
    expect(hit.fixes).toEqual([]);
    expect(hit.message).toContain("einen neuen Hund");
  });
});

describe("German false alarms", () => {
  /* Each of these is correct German that a careless version of the rules
   * flagged. A rule that fires on one of them is worse than no rule. */
  const CLEAN = [
    "Ich bin gestern ins Kino gegangen.",
    "Gestern bin ich ins Kino gegangen.",
    "Weil es regnete, blieben wir zu Hause.",
    "Kann ich kommen?",
    "Hast du verstanden?",
    "Ich habe es gesehen.",
    "Es sind drei Kinder im Garten.",
    "Es waren einmal ein König und eine Königin.",
    "Er sagt, er habe keine Zeit.",
    "Als Kind war ich oft krank.",
    "Während der Ferien waren wir am Meer.",
    "Der Frau gebe ich das Buch.",
    "Mit ein bisschen Glück schaffen wir das.",
    "Auch ich habe Hunger.",
    "Mein bester Freund wohnt in Berlin.",
    "Ich fahre mit den Kindern.",
    "Wir spielen mit den Mädchen.",
    "Am besten gehst du jetzt.",
    "Ich weiß nicht, ob er kommt.",
    "Das ist größer, als ich dachte.",
    "Ich bin müde, weil ich früh aufstehe.",
    "Weil wir essen gehen, haben wir keine Zeit.",
    "Bis bald, ich freue mich.",
    "Der Frau ist kalt.",
    "Das Buch habe ich gelesen.",
    "Den Hund sieht er jeden Tag.",
    "Die Kinder, mit denen ich spiele, sind nett.",
    "Kommen Sie bitte herein.",
    "Heute Abend gehen wir ins Kino.",
    "Ich möchte, dass du mir hilfst.",
    "Wenn du Zeit hast, komm vorbei.",
    "Zum Glück habe ich meinen Schlüssel gefunden.",
    "Es ist schön, hier zu sein.",
    "Ich spreche oft mit ihr.",
    "Was ist Ihr Lieblingsessen?",
    "Wo ist ihr Auto?",
  ];
  for (const s of CLEAN) it(`leaves alone: ${s}`, () => expect(issues(s)).toEqual([]));
});

describe("LanguageTool layer", () => {
  beforeEach(() => resetLanguageTool());

  const match = (offset, length, issueType, cat, reps = []) => ({
    offset, length, message: "m", shortMessage: "s",
    replacements: reps.map((value) => ({ value })),
    rule: { id: "R", issueType, category: { id: cat } },
  });

  it("sorts matches into kinds, with typography as a tip", () => {
    expect(kindOf(match(0, 1, "misspelling", "TYPOS"))).toBe("spelling");
    expect(kindOf(match(0, 1, "grammar", "CAT_GRAMMAIRE"))).toBe("grammar");
    expect(kindOf(match(0, 1, "typographical", "CAT_TYPOGRAPHIE"))).toBe("punctuation");
    expect(kindOf(match(0, 1, "style", "STYLE"))).toBe("style");
  });
  it("normalises offsets, text and fixes", () => {
    const text = "Elle est allé au cinéma.";
    const [i] = fromLanguageTool({ matches: [match(9, 4, "grammar", "CAT_GRAMMAIRE", ["allée"])] }, text);
    expect(i).toMatchObject({ start: 9, end: 13, text: "allé", fixes: ["allée"], kind: "grammar", source: "lt" });
  });
  it("reports offline instead of throwing", async () => {
    const r = await checkWithLanguageTool("Bonjour.", "fr", { fetchImpl: () => Promise.reject(new Error("net")) });
    expect(r).toEqual({ status: "offline", issues: [] });
  });
  it("does not ask twice about the same text", async () => {
    let calls = 0;
    const fetchImpl = async () => { calls += 1; return { ok: true, status: 200, json: async () => ({ matches: [] }) }; };
    await checkWithLanguageTool("Je suis là.", "fr", { fetchImpl });
    await checkWithLanguageTool("Je suis là.", "fr", { fetchImpl });
    expect(calls).toBe(1);
  });
  it("stays under the per-minute limit", async () => {
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ matches: [] }) });
    const now = 1_000_000;
    let last;
    for (let i = 0; i < LT_PER_MINUTE; i += 1) last = await checkWithLanguageTool(`Texte ${i}.`, "fr", { fetchImpl, now });
    expect(last.status).toBe("rate");
    expect(ltBudget(now + 61_000).left).toBeGreaterThan(0);
  });
  it("prefers LanguageTool where both layers flag the same words", () => {
    const lt = [{ start: 0, end: 4, source: "lt" }];
    const local = [{ start: 2, end: 6, source: "drawer" }, { start: 10, end: 12, source: "drawer" }];
    expect(mergeIssues(lt, local).map((i) => i.start)).toEqual([0, 10]);
  });
  it("still runs the German rules when offline", async () => {
    const r = await checkGrammar("Gestern ich bin müde.", "de", { lexicon: lex, fetchImpl: () => Promise.reject(new Error("net")) });
    expect(r.status).toBe("offline");
    expect(r.issues.map((i) => i.rule)).toContain("de-verb-second");
  });
});

describe("the score", () => {
  it("splits sentences with their offsets", () => {
    const s = splitSentences("Je suis là. Tu viens ? Oui!");
    expect(s.map((x) => x.text)).toEqual(["Je suis là.", "Tu viens ?", "Oui!"]);
    expect("Je suis là. Tu viens ? Oui!".slice(s[1].start, s[1].end)).toBe("Tu viens ?");
  });
  it("counts error-free sentences, and not tips", () => {
    const text = "Je suis allé. Elle est allé. Tu viens ?";
    const found = [
      { start: 23, end: 27, kind: "grammar" },
      { start: 36, end: 38, kind: "punctuation" },
    ];
    expect(scoreGrammar(text, found)).toMatchObject({ sentences: 3, errorFree: 2, errors: 1, tips: 1, accuracy: 67 });
  });
  it("applies a fix by span", () => {
    expect(applyFix("Elle est allé.", { start: 9, end: 13 }, "allée")).toBe("Elle est allée.");
  });
});
