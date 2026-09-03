/* Word building: how the languages assemble words out of parts.
 *
 * This is the sibling of the etymology section and answers a different
 * question. Etymology asks where a word came from — a fact about the past.
 * Morphology asks how it is *built right now*, which is a fact you can use:
 * knowing that `sprechen` is "speak" and `wider-` is "against" hands you
 * `widersprechen` without anyone teaching it to you.
 *
 * German is where this pays most. Its verbs take sixteen or so productive
 * prefixes, each with a sense, so one root reliably yields a dozen words a
 * learner would otherwise meet as a dozen unrelated items. French runs on
 * Latin prefixes instead — and those are the same ones English borrowed, so
 * every French entry here is also a free English one.
 *
 * Every form and gloss is checked against English Wiktionary by
 * scripts/morph/verify.mjs; the structural checks run offline in `npm run check`.
 */

/* Where a part attaches, and how it is drawn. `root` is the piece that carries
 * the meaning; the rest modify it. */
export const PART_KINDS = {
  prefix: { label: "prefix", hint: "goes in front and steers the meaning" },
  root:   { label: "root",   hint: "carries the meaning" },
  suffix: { label: "suffix", hint: "goes on the end and usually decides the part of speech" },
  ending: { label: "ending", hint: "grammar only — the infinitive, a plural, a case" },
};

export const AFFIX_GROUPS = {
  "de-insep": {
    lang: "de", label: "Inseparable prefixes", kind: "prefix",
    blurb: "These never leave the verb, and they never take the stress. They also block the ge- in the perfect: versprochen, not *geversprochen — which is how you can hear that a prefix is inseparable before you have learnt which list it is on.",
  },
  "de-sep": {
    lang: "de", label: "Separable prefixes", kind: "prefix",
    blurb: "These take the stress and get thrown to the end of the clause: ich spreche dich an. Most are prepositions doing exactly what they do on their own, which makes them the easiest half of German vocabulary to guess.",
  },
  "de-suffix": {
    lang: "de", label: "Suffixes", kind: "suffix",
    blurb: "German suffixes decide two things at once: the part of speech, and — for nouns — the gender. -ung is always feminine, -chen always neuter. That is a gender you never have to memorise.",
  },
  "fr-prefix": {
    lang: "fr", label: "Prefixes", kind: "prefix",
    blurb: "Almost all Latin, and almost all shared with English — English took them from Latin too. So each of these is two words learnt: importer and import, transporter and transport.",
  },
  "fr-suffix": {
    lang: "fr", label: "Suffixes", kind: "suffix",
    blurb: "French suffixes are reliable about gender as well: -tion and -ité are always feminine, -ment and -age always masculine. Four endings, no memorising.",
  },
};

/* One entry per productive affix. `en` is the English parallel where there is a
 * real one — it is the fastest way in for anyone who already speaks English,
 * and left blank rather than forced when no honest parallel exists. */
export const AFFIXES = [
  // ---- German, inseparable ----
  { id: "de-be", group: "de-insep", form: "be-", sense: "does the verb *to* something — it hands an intransitive verb a direct object",
    en: "be- in bespeak, bemoan", ex: [["sprechen", "besprechen", "to discuss (something)"], ["kommen", "bekommen", "to receive"], ["stehen", "bestehen", "to pass (an exam); to insist"]] },
  { id: "de-ver", group: "de-insep", form: "ver-", sense: "away, wrongly, or all the way to the end — the root taken somewhere it was not",
    en: "for- in forgive, forget", ex: [["sprechen", "versprechen", "to promise"], ["stehen", "verstehen", "to understand"], ["geben", "vergeben", "to forgive"]] },
  { id: "de-ent", group: "de-insep", form: "ent-", sense: "away from, or the undoing of",
    en: "un- or de-", ex: [["kommen", "entkommen", "to escape"], ["sprechen", "entsprechen", "to correspond to"], ["stehen", "entstehen", "to come into being"]] },
  { id: "de-er", group: "de-insep", form: "er-", sense: "reaching the result — the verb carried through to what it was for",
    en: "—", ex: [["halten", "erhalten", "to receive, to preserve"], ["ziehen", "erziehen", "to bring up, educate"], ["geben", "ergeben", "to yield, to result in"]] },
  { id: "de-zer", group: "de-insep", form: "zer-", sense: "to pieces",
    en: "—", ex: [["brechen", "zerbrechen", "to shatter"], ["stören", "zerstören", "to destroy"]] },
  { id: "de-miss", group: "de-insep", form: "miss-", sense: "wrongly, or the opposite",
    en: "mis-", ex: [["verstehen", "missverstehen", "to misunderstand"], ["trauen", "misstrauen", "to distrust"]] },

  // ---- German, separable ----
  { id: "de-an", group: "de-sep", form: "an-", sense: "at, onto, or the start of something",
    en: "on, at", ex: [["sprechen", "ansprechen", "to address someone"], ["kommen", "ankommen", "to arrive"], ["ziehen", "anziehen", "to put on (clothes); to attract"]] },
  { id: "de-auf", group: "de-sep", form: "auf-", sense: "up, or open",
    en: "up", ex: [["stehen", "aufstehen", "to get up"], ["nehmen", "aufnehmen", "to take up, record"], ["geben", "aufgeben", "to give up"]] },
  { id: "de-aus", group: "de-sep", form: "aus-", sense: "out",
    en: "out", ex: [["sprechen", "aussprechen", "to pronounce"], ["ziehen", "ausziehen", "to take off; to move out"], ["geben", "ausgeben", "to spend; to hand out"]] },
  { id: "de-ein", group: "de-sep", form: "ein-", sense: "in, into",
    en: "in", ex: [["steigen", "einsteigen", "to get in"], ["setzen", "einsetzen", "to insert, deploy"], ["laden", "einladen", "to invite"]] },
  { id: "de-mit", group: "de-sep", form: "mit-", sense: "along, together with",
    en: "with, along", ex: [["kommen", "mitkommen", "to come along"], ["nehmen", "mitnehmen", "to take along"], ["bringen", "mitbringen", "to bring along"]] },
  { id: "de-nach", group: "de-sep", form: "nach-", sense: "after — following, or doing it again in imitation",
    en: "after", ex: [["sprechen", "nachsprechen", "to repeat after"], ["denken", "nachdenken", "to think over"]] },
  { id: "de-vor", group: "de-sep", form: "vor-", sense: "before, or in front",
    en: "fore-, pre-", ex: [["stellen", "vorstellen", "to introduce; to imagine"], ["kommen", "vorkommen", "to occur"], ["bereiten", "vorbereiten", "to prepare"]] },
  { id: "de-zu", group: "de-sep", form: "zu-", sense: "towards, or shut",
    en: "to-", ex: [["hören", "zuhören", "to listen to"], ["sehen", "zusehen", "to watch"], ["nehmen", "zunehmen", "to increase, gain weight"]] },
  { id: "de-um", group: "de-sep", form: "um-", sense: "around, or over again differently",
    en: "re-", ex: [["ziehen", "umziehen", "to move house"], ["steigen", "umsteigen", "to change trains"], ["drehen", "umdrehen", "to turn around"]] },
  { id: "de-ab", group: "de-sep", form: "ab-", sense: "off, away, down",
    en: "off", ex: [["fahren", "abfahren", "to depart"], ["holen", "abholen", "to fetch, pick up"], ["nehmen", "abnehmen", "to lose weight; to take off"]] },

  // ---- German suffixes ----
  { id: "de-ung", group: "de-suffix", form: "-ung", sense: "turns a verb into the noun of its action. Always feminine.",
    en: "-ing, -tion", ex: [["bedeuten", "die Bedeutung", "meaning"], ["erziehen", "die Erziehung", "upbringing, education"], ["wohnen", "die Wohnung", "flat, dwelling"]] },
  { id: "de-heit", group: "de-suffix", form: "-heit / -keit", sense: "turns an adjective into the noun of that quality. Always feminine. -keit is the form used after -ig, -lich and -bar.",
    en: "-ness, -ity", ex: [["frei", "die Freiheit", "freedom"], ["möglich", "die Möglichkeit", "possibility"], ["schön", "die Schönheit", "beauty"]] },
  { id: "de-schaft", group: "de-suffix", form: "-schaft", sense: "the state of being that, or the whole body of them. Always feminine.",
    en: "-ship", ex: [["Freund", "die Freundschaft", "friendship"], ["Wissen", "die Wissenschaft", "science"], ["Mann", "die Mannschaft", "team"]] },
  { id: "de-lich", group: "de-suffix", form: "-lich", sense: "makes an adjective — having the quality of the root",
    en: "-ly, -ish", ex: [["Freund", "freundlich", "friendly"], ["Tag", "täglich", "daily"], ["Natur", "natürlich", "natural, of course"]] },
  { id: "de-bar", group: "de-suffix", form: "-bar", sense: "makes an adjective — able to be done",
    en: "-able", ex: [["essen", "essbar", "edible"], ["sehen", "sichtbar", "visible"], ["denken", "denkbar", "thinkable, conceivable"]] },
  { id: "de-los", group: "de-suffix", form: "-los", sense: "makes an adjective — without it",
    en: "-less", ex: [["Arbeit", "arbeitslos", "unemployed"], ["Sprache", "sprachlos", "speechless"], ["Sinn", "sinnlos", "pointless"]] },
  { id: "de-suf-er", group: "de-suffix", form: "-er", sense: "the one who does it, or the thing that does it. Always masculine.",
    en: "-er", ex: [["sprechen", "der Sprecher", "speaker"], ["lehren", "der Lehrer", "teacher"], ["backen", "der Bäcker", "baker"]] },
  { id: "de-chen", group: "de-suffix", form: "-chen / -lein", sense: "makes it small, or fond. Always neuter, whatever the noun was — and it umlauts the vowel.",
    en: "-let, -ie", ex: [["Haus", "das Häuschen", "little house"], ["Mädchen", "das Mädchen", "girl (literally: little maid)"], ["Brot", "das Brötchen", "bread roll"]] },

  // ---- French prefixes ----
  { id: "fr-re", group: "fr-prefix", form: "re- / ré-", sense: "again, or back",
    en: "re-", ex: [["venir", "revenir", "to come back"], ["voir", "revoir", "to see again"], ["prendre", "reprendre", "to take back, resume"]] },
  { id: "fr-de", group: "fr-prefix", form: "dé- / dés-", sense: "the undoing of it, or away",
    en: "de-, un-, dis-", ex: [["faire", "défaire", "to undo"], ["venir", "devenir", "to become"], ["poser", "déposer", "to put down, deposit"]] },
  { id: "fr-in", group: "fr-prefix", form: "in- / im-", sense: "two different prefixes wearing one spelling: *not* on an adjective, *into* on a verb",
    en: "in-, im-", ex: [["possible", "impossible", "impossible"], ["porter", "importer", "to import"], ["poser", "imposer", "to impose"]] },
  { id: "fr-pre", group: "fr-prefix", form: "pré-", sense: "before, in advance",
    en: "pre-", ex: [["voir", "prévoir", "to foresee"], ["venir", "prévenir", "to warn, prevent"], ["dire", "prédire", "to predict"]] },
  { id: "fr-con", group: "fr-prefix", form: "con- / com-", sense: "with, together",
    en: "con-, com-", ex: [["tenir", "contenir", "to contain"], ["poser", "composer", "to compose"], ["venir", "convenir", "to suit, to agree"]] },
  { id: "fr-ex", group: "fr-prefix", form: "ex-", sense: "out of",
    en: "ex-", ex: [["porter", "exporter", "to export"], ["poser", "exposer", "to display, expose"], ["primer", "exprimer", "to express"]] },
  { id: "fr-trans", group: "fr-prefix", form: "trans-", sense: "across, through",
    en: "trans-", ex: [["porter", "transporter", "to transport"], ["mettre", "transmettre", "to transmit"], ["former", "transformer", "to transform"]] },
  { id: "fr-sur", group: "fr-prefix", form: "sur-", sense: "over, above, or too much of it",
    en: "sur-, over-", ex: [["vivre", "survivre", "to survive"], ["prendre", "surprendre", "to surprise"], ["charger", "surcharger", "to overload"]] },
  { id: "fr-sous", group: "fr-prefix", form: "sous- / sou-", sense: "under, or from below",
    en: "sub-, under-", ex: [["estimer", "sous-estimer", "to underestimate"], ["tenir", "soutenir", "to support"], ["mettre", "soumettre", "to submit"]] },
  { id: "fr-par", group: "fr-prefix", form: "par-", sense: "through, and so all the way",
    en: "per-", ex: [["venir", "parvenir", "to reach, manage"], ["courir", "parcourir", "to travel through"]] },
  { id: "fr-entre", group: "fr-prefix", form: "entre-", sense: "between, or partly",
    en: "inter-", ex: [["voir", "entrevoir", "to glimpse"], ["tenir", "entretenir", "to maintain"], ["couper", "entrecouper", "to intersperse"]] },
  { id: "fr-inter", group: "fr-prefix", form: "inter-", sense: "between, among",
    en: "inter-", ex: [["venir", "intervenir", "to intervene"], ["dire", "interdire", "to forbid"], ["national", "international", "international"]] },
  { id: "fr-mal", group: "fr-prefix", form: "mal- / mé-", sense: "badly, or wrongly",
    en: "mis-, mal-", ex: [["heureux", "malheureux", "unhappy"], ["honnête", "malhonnête", "dishonest"], ["comprendre", "méprendre", "to mistake"]] },
  { id: "fr-a", group: "fr-prefix", form: "a- / ap-", sense: "towards, bringing it here",
    en: "ad-, ap-", ex: [["porter", "apporter", "to bring"], ["prendre", "apprendre", "to learn"], ["paraître", "apparaître", "to appear"]] },
  { id: "fr-em", group: "fr-prefix", form: "em- / en-", sense: "in, or away with it",
    en: "in-, em-", ex: [["porter", "emporter", "to carry away"], ["mener", "emmener", "to take (someone) away"], ["courager", "encourager", "to encourage"]] },

  // ---- French suffixes ----
  { id: "fr-tion", group: "fr-suffix", form: "-tion / -sion", sense: "the action or its result. Always feminine.",
    en: "-tion", ex: [["produire", "la production", "production"], ["décider", "la décision", "decision"], ["traduire", "la traduction", "translation"]] },
  { id: "fr-ment-adv", group: "fr-suffix", form: "-ment (adverb)", sense: "makes an adverb from the *feminine* form of an adjective",
    en: "-ly", ex: [["lent → lente", "lentement", "slowly"], ["heureux → heureuse", "heureusement", "fortunately"], ["vrai → vraie", "vraiment", "really"]] },
  { id: "fr-ment-noun", group: "fr-suffix", form: "-ment (noun)", sense: "the action or its result. Always masculine — the same four letters as the adverb, doing something else entirely.",
    en: "-ment", ex: [["changer", "le changement", "change"], ["sentir", "le sentiment", "feeling"], ["gouverner", "le gouvernement", "government"]] },
  { id: "fr-eur", group: "fr-suffix", form: "-eur / -euse", sense: "the one who does it, or the machine that does it",
    en: "-er, -or", ex: [["porter", "le porteur", "carrier"], ["chanter", "le chanteur", "singer"], ["laver", "le lave-vaisselle", "dishwasher"]] },
  { id: "fr-able", group: "fr-suffix", form: "-able / -ible", sense: "makes an adjective — able to be done",
    en: "-able, -ible", ex: [["porter", "portable", "portable"], ["manger", "mangeable", "edible"], ["lire", "lisible", "legible"]] },
  { id: "fr-age", group: "fr-suffix", form: "-age", sense: "the action, or the result of it. Always masculine.",
    en: "-age", ex: [["passer", "le passage", "passage"], ["laver", "le lavage", "washing"], ["porter", "le portage", "carrying"]] },
  { id: "fr-ite", group: "fr-suffix", form: "-ité", sense: "the quality, made into a noun. Always feminine.",
    en: "-ity", ex: [["possible", "la possibilité", "possibility"], ["réel", "la réalité", "reality"], ["libre", "la liberté", "freedom"]] },
  { id: "fr-eux", group: "fr-suffix", form: "-eux / -euse", sense: "makes an adjective — full of it",
    en: "-ous", ex: [["nerf", "nerveux", "nervous"], ["danger", "dangereux", "dangerous"], ["heure", "heureux", "happy"]] },
];

export function affixesInGroup(group) {
  return AFFIXES.filter((a) => a.group === group);
}

/* Word families: one root, and the words the language builds on it.
 *
 * Curated, not harvested. Wiktionary lists 46 derivatives of `kommen`,
 * including abhandenkommen and durcheinanderkommen — exhaustive is the enemy
 * of teachable. These are the members a learner actually meets, and every form
 * and gloss is checked against Wiktionary by scripts/morph/verify.mjs.
 *
 * `p` is the segmentation, in a small notation so it stays readable in source:
 *   <x  prefix        =x  root        >x  suffix        .x  grammatical ending
 * `n` is a note, used where a family contains a trap worth naming.
 */
export const FAMILIES = [
  // ------------------------------- German -------------------------------
  { id: "de-sprech", lang: "de", root: "sprech", gloss: "speak",
    base: { w: "sprechen", e: "to speak", p: "=sprech .en" },
    note: "The root shifts its vowel in some derivatives — sprech / sprach / spräch. German does this constantly, and it is the same ablaut that gives English sing / sang / sung.",
    members: [
      { w: "ansprechen", e: "to address someone", p: "<an =sprech .en" },
      { w: "aussprechen", e: "to pronounce", p: "<aus =sprech .en" },
      { w: "besprechen", e: "to discuss something", p: "<be =sprech .en" },
      { w: "entsprechen", e: "to correspond to", p: "<ent =sprech .en" },
      { w: "versprechen", e: "to promise", p: "<ver =sprech .en" },
      { w: "widersprechen", e: "to contradict", p: "<wider =sprech .en" },
      { w: "Sprache", e: "language", p: "=sprach .e", g: "die" },
      { w: "Sprecher", e: "speaker", p: "=sprech >er", g: "der" },
      { w: "Gespräch", e: "conversation", p: "<ge =spräch", g: "das" },
      { w: "sprachlos", e: "speechless", p: "=sprach >los" },
    ] },
  { id: "de-komm", lang: "de", root: "komm", gloss: "come",
    base: { w: "kommen", e: "to come", p: "=komm .en" },
    note: "The nouns take a different root, -kunft, which no longer looks like kommen at all. Ankunft, Zukunft and Herkunft are the same word as ankommen — arrival, the-time-coming-toward-you, and where-you-came-from.",
    members: [
      { w: "ankommen", e: "to arrive", p: "<an =komm .en" },
      { w: "bekommen", e: "to receive, to get", p: "<be =komm .en", n: "Not “to become”. That is werden — the classic English trap." },
      { w: "mitkommen", e: "to come along", p: "<mit =komm .en" },
      { w: "vorkommen", e: "to occur, to seem", p: "<vor =komm .en" },
      { w: "entkommen", e: "to escape", p: "<ent =komm .en" },
      { w: "umkommen", e: "to perish", p: "<um =komm .en" },
      { w: "Ankunft", e: "arrival", p: "<an =kunft", g: "die" },
      { w: "Zukunft", e: "future", p: "<zu =kunft", g: "die" },
      { w: "Herkunft", e: "origin", p: "<her =kunft", g: "die" },
    ] },
  { id: "de-steh", lang: "de", root: "steh", gloss: "stand",
    base: { w: "stehen", e: "to stand", p: "=steh .en" },
    note: "verstehen is not “stand wrongly” — ver- here is the older sense of standing *around* a thing, and English does exactly the same with under-stand.",
    members: [
      { w: "verstehen", e: "to understand", p: "<ver =steh .en" },
      { w: "bestehen", e: "to pass (an exam); to consist of", p: "<be =steh .en" },
      { w: "entstehen", e: "to come into being", p: "<ent =steh .en" },
      { w: "aufstehen", e: "to get up", p: "<auf =steh .en" },
      { w: "gestehen", e: "to confess", p: "<ge =steh .en" },
      { w: "Verstand", e: "intellect, reason", p: "<ver =stand", g: "der" },
      { w: "Zustand", e: "condition, state", p: "<zu =stand", g: "der" },
      { w: "Umstand", e: "circumstance", p: "<um =stand", g: "der" },
      { w: "verständlich", e: "understandable", p: "<ver =ständ >lich" },
    ] },
  { id: "de-zieh", lang: "de", root: "zieh", gloss: "pull",
    base: { w: "ziehen", e: "to pull", p: "=zieh .en" },
    members: [
      { w: "anziehen", e: "to put on (clothes); to attract", p: "<an =zieh .en" },
      { w: "ausziehen", e: "to take off; to move out", p: "<aus =zieh .en" },
      { w: "umziehen", e: "to move house", p: "<um =zieh .en" },
      { w: "beziehen", e: "to obtain; to refer to", p: "<be =zieh .en" },
      { w: "erziehen", e: "to bring up, to educate", p: "<er =zieh .en" },
      { w: "Zug", e: "train; pull, draught", p: "=zug", g: "der" },
      { w: "Erziehung", e: "upbringing, education", p: "<er =zieh >ung", g: "die" },
      { w: "Bezug", e: "reference; cover", p: "<be =zug", g: "der" },
    ] },
  { id: "de-halt", lang: "de", root: "halt", gloss: "hold",
    base: { w: "halten", e: "to hold; to stop", p: "=halt .en" },
    members: [
      { w: "behalten", e: "to keep", p: "<be =halt .en" },
      { w: "erhalten", e: "to receive; to preserve", p: "<er =halt .en" },
      { w: "unterhalten", e: "to entertain; to converse", p: "<unter =halt .en" },
      { w: "verhalten", e: "to behave", p: "<ver =halt .en" },
      { w: "enthalten", e: "to contain", p: "<ent =halt .en" },
      { w: "aufhalten", e: "to delay, to hold up", p: "<auf =halt .en" },
      { w: "Haltung", e: "posture; attitude", p: "=halt >ung", g: "die" },
      { w: "Verhalten", e: "behaviour", p: "<ver =halt .en", g: "das" },
    ] },
  { id: "de-nehm", lang: "de", root: "nehm", gloss: "take",
    base: { w: "nehmen", e: "to take", p: "=nehm .en" },
    note: "The noun root is -nahme, with the vowel shifted: Aufnahme is aufnehmen made into a thing.",
    members: [
      { w: "annehmen", e: "to accept; to assume", p: "<an =nehm .en" },
      { w: "aufnehmen", e: "to record; to take in", p: "<auf =nehm .en" },
      { w: "teilnehmen", e: "to take part", p: "<teil =nehm .en" },
      { w: "unternehmen", e: "to undertake", p: "<unter =nehm .en" },
      { w: "abnehmen", e: "to lose weight; to take off", p: "<ab =nehm .en" },
      { w: "zunehmen", e: "to increase, to gain weight", p: "<zu =nehm .en" },
      { w: "Aufnahme", e: "recording; admission", p: "<auf =nahm .e", g: "die" },
      { w: "Unternehmen", e: "company; undertaking", p: "<unter =nehm .en", g: "das" },
    ] },
  { id: "de-geb", lang: "de", root: "geb", gloss: "give",
    base: { w: "geben", e: "to give", p: "=geb .en" },
    members: [
      { w: "angeben", e: "to state; to show off", p: "<an =geb .en" },
      { w: "aufgeben", e: "to give up; to post", p: "<auf =geb .en" },
      { w: "ausgeben", e: "to spend; to hand out", p: "<aus =geb .en" },
      { w: "vergeben", e: "to forgive; to award", p: "<ver =geb .en" },
      { w: "ergeben", e: "to result in; to yield", p: "<er =geb .en" },
      { w: "übergeben", e: "to hand over", p: "<über =geb .en" },
      { w: "Aufgabe", e: "task; giving up", p: "<auf =gab .e", g: "die" },
      { w: "Ausgabe", e: "expense; edition", p: "<aus =gab .e", g: "die" },
    ] },
  { id: "de-fahr", lang: "de", root: "fahr", gloss: "travel, go by vehicle",
    base: { w: "fahren", e: "to drive, to travel", p: "=fahr .en" },
    members: [
      { w: "abfahren", e: "to depart", p: "<ab =fahr .en" },
      { w: "erfahren", e: "to find out; to experience", p: "<er =fahr .en" },
      { w: "verfahren", e: "to proceed", p: "<ver =fahr .en" },
      { w: "Erfahrung", e: "experience", p: "<er =fahr >ung", g: "die" },
      { w: "Abfahrt", e: "departure", p: "<ab =fahr .t", g: "die" },
      { w: "Einfahrt", e: "entrance, driveway", p: "<ein =fahr .t", g: "die" },
      { w: "Fahrer", e: "driver", p: "=fahr >er", g: "der" },
    ] },

  // ------------------------------- French -------------------------------
  { id: "fr-port", lang: "fr", root: "port", gloss: "carry",
    base: { w: "porter", e: "to carry, to wear", p: "=port >er" },
    note: "Every one of these has an English twin, because English took the same Latin verb with the same prefixes. Learn the French, get the English confirmation free.",
    members: [
      { w: "apporter", e: "to bring", p: "<ap =port >er" },
      { w: "emporter", e: "to carry away", p: "<em =port >er" },
      { w: "exporter", e: "to export", p: "<ex =port >er" },
      { w: "importer", e: "to import; to matter", p: "<im =port >er", n: "Two verbs sharing a spelling. “Peu importe” is “it hardly matters”, nothing to do with trade." },
      { w: "reporter", e: "to postpone; to carry over", p: "<re =port >er" },
      { w: "supporter", e: "to put up with, to bear", p: "<sup =port >er", n: "A false friend. It is not “to support” someone — that is soutenir or encourager." },
      { w: "transporter", e: "to transport", p: "<trans =port >er" },
      { w: "portable", e: "portable; mobile phone", p: "=port >able" },
      { w: "transport", e: "transport", p: "<trans =port", g: "le" },
    ] },
  { id: "fr-ven", lang: "fr", root: "ven", gloss: "come",
    base: { w: "venir", e: "to come", p: "=ven >ir" },
    note: "souvenir is sous- + venir — what comes up from underneath. A memory is a thing that surfaces.",
    members: [
      { w: "devenir", e: "to become", p: "<de =ven >ir" },
      { w: "revenir", e: "to come back", p: "<re =ven >ir" },
      { w: "prévenir", e: "to warn; to prevent", p: "<pré =ven >ir" },
      { w: "convenir", e: "to suit; to agree", p: "<con =ven >ir" },
      { w: "intervenir", e: "to intervene", p: "<inter =ven >ir" },
      { w: "parvenir", e: "to reach, to manage to", p: "<par =ven >ir" },
      { w: "survenir", e: "to occur unexpectedly", p: "<sur =ven >ir" },
      { w: "souvenir", e: "memory; to remember", p: "<sou =ven >ir", g: "le" },
      { w: "avenir", e: "future", p: "<a =ven >ir", g: "le" },
    ] },
  { id: "fr-met", lang: "fr", root: "met", gloss: "put",
    base: { w: "mettre", e: "to put", p: "=met >tre" },
    note: "The noun form switches the root to -miss-: permettre gives permission, transmettre gives transmission. English inherited both halves.",
    members: [
      { w: "admettre", e: "to admit", p: "<ad =met >tre" },
      { w: "permettre", e: "to allow", p: "<per =met >tre" },
      { w: "promettre", e: "to promise", p: "<pro =met >tre" },
      { w: "remettre", e: "to hand over; to postpone", p: "<re =met >tre" },
      { w: "soumettre", e: "to submit", p: "<sou =met >tre" },
      { w: "transmettre", e: "to transmit", p: "<trans =met >tre" },
      { w: "compromettre", e: "to compromise", p: "<com <pro =met >tre" },
      { w: "permission", e: "permission", p: "<per =miss >ion", g: "la" },
    ] },
  { id: "fr-ten", lang: "fr", root: "ten", gloss: "hold",
    base: { w: "tenir", e: "to hold", p: "=ten >ir" },
    members: [
      { w: "obtenir", e: "to obtain", p: "<ob =ten >ir" },
      { w: "contenir", e: "to contain", p: "<con =ten >ir" },
      { w: "maintenir", e: "to maintain", p: "=main =ten >ir", n: "A compound, not a prefix: main is “hand”. To maintain is to hold in the hand." },
      { w: "retenir", e: "to retain, to hold back", p: "<re =ten >ir" },
      { w: "soutenir", e: "to support", p: "<sou =ten >ir" },
      { w: "appartenir", e: "to belong", p: "<ap <par =ten >ir" },
      { w: "entretenir", e: "to maintain, to keep up", p: "<entre =ten >ir" },
      { w: "contenu", e: "content", p: "<con =ten >u", g: "le" },
    ] },
  { id: "fr-duire", lang: "fr", root: "duire", gloss: "lead",
    base: { w: "conduire", e: "to drive; to lead", p: "<con =duire" },
    note: "The root is Latin ducere, “lead”. The nouns switch to -duction, which is the form English borrowed whole: production, reduction, introduction.",
    members: [
      { w: "produire", e: "to produce", p: "<pro =duire" },
      { w: "réduire", e: "to reduce", p: "<ré =duire" },
      { w: "traduire", e: "to translate", p: "<tra =duire" },
      { w: "introduire", e: "to introduce, to insert", p: "<intro =duire" },
      { w: "séduire", e: "to seduce, to charm", p: "<sé =duire" },
      { w: "déduire", e: "to deduce; to deduct", p: "<dé =duire" },
      { w: "production", e: "production", p: "<pro =duct >ion", g: "la" },
      { w: "traduction", e: "translation", p: "<tra =duct >ion", g: "la" },
    ] },
  { id: "fr-pos", lang: "fr", root: "pos", gloss: "place, put",
    base: { w: "poser", e: "to put down, to place", p: "=pos >er" },
    members: [
      { w: "composer", e: "to compose; to dial", p: "<com =pos >er" },
      { w: "déposer", e: "to put down, to deposit", p: "<dé =pos >er" },
      { w: "exposer", e: "to display, to expose", p: "<ex =pos >er" },
      { w: "imposer", e: "to impose", p: "<im =pos >er" },
      { w: "proposer", e: "to propose, to offer", p: "<pro =pos >er" },
      { w: "supposer", e: "to suppose", p: "<sup =pos >er" },
      { w: "disposer", e: "to arrange; to have at one's disposal", p: "<dis =pos >er" },
      { w: "proposition", e: "proposal; clause", p: "<pro =pos >ition", g: "la" },
    ] },
  { id: "fr-voir", lang: "fr", root: "voir", gloss: "see",
    base: { w: "voir", e: "to see", p: "=voir" },
    members: [
      { w: "revoir", e: "to see again", p: "<re =voir" },
      { w: "prévoir", e: "to foresee, to plan for", p: "<pré =voir" },
      { w: "entrevoir", e: "to glimpse", p: "<entre =voir" },
      { w: "pourvoir", e: "to provide, to fill (a post)", p: "<pour =voir" },
      { w: "prévision", e: "forecast", p: "<pré =vis >ion", g: "la" },
      { w: "vision", e: "vision, sight", p: "=vis >ion", g: "la" },
    ] },
  { id: "fr-dire", lang: "fr", root: "dire", gloss: "say",
    base: { w: "dire", e: "to say", p: "=dire" },
    members: [
      { w: "contredire", e: "to contradict", p: "<contre =dire" },
      { w: "interdire", e: "to forbid", p: "<inter =dire" },
      { w: "prédire", e: "to predict", p: "<pré =dire" },
      { w: "redire", e: "to say again", p: "<re =dire" },
      { w: "médire", e: "to speak ill of", p: "<mé =dire" },
      { w: "contradiction", e: "contradiction", p: "<contra =dict >ion", g: "la" },
    ] },

  // ---------------------------- German, more ----------------------------
  { id: "de-schreib", lang: "de", root: "schreib", gloss: "write",
    base: { w: "schreiben", e: "to write", p: "=schreib .en" },
    note: "Borrowed from Latin scribere before Old High German, early enough that it then took German prefixes like a native verb.",
    members: [
      { w: "aufschreiben", e: "to write down", p: "<auf =schreib .en" },
      { w: "beschreiben", e: "to describe", p: "<be =schreib .en" },
      { w: "unterschreiben", e: "to sign", p: "<unter =schreib .en" },
      { w: "verschreiben", e: "to prescribe", p: "<ver =schreib .en" },
      { w: "abschreiben", e: "to copy; to write off", p: "<ab =schreib .en" },
      { w: "vorschreiben", e: "to prescribe, to dictate", p: "<vor =schreib .en" },
      { w: "Schrift", e: "writing, script", p: "=schrift", g: "die" },
      { w: "Beschreibung", e: "description", p: "<be =schreib >ung", g: "die" },
      { w: "Schreiber", e: "writer, scribe", p: "=schreib >er", g: "der" },
    ] },
  { id: "de-such", lang: "de", root: "such", gloss: "seek, search",
    base: { w: "suchen", e: "to search, to look for", p: "=such .en" },
    members: [
      { w: "besuchen", e: "to visit", p: "<be =such .en" },
      { w: "versuchen", e: "to try, to attempt", p: "<ver =such .en" },
      { w: "untersuchen", e: "to examine, to investigate", p: "<unter =such .en" },
      { w: "aufsuchen", e: "to go and see, to call on", p: "<auf =such .en" },
      { w: "durchsuchen", e: "to search through", p: "<durch =such .en" },
      { w: "Besuch", e: "visit", p: "<be =such", g: "der" },
      { w: "Versuch", e: "attempt; experiment", p: "<ver =such", g: "der" },
      { w: "Untersuchung", e: "examination, investigation", p: "<unter =such >ung", g: "die" },
    ] },
  { id: "de-schlag", lang: "de", root: "schlag", gloss: "strike, beat",
    base: { w: "schlagen", e: "to hit, to beat", p: "=schlag .en" },
    members: [
      { w: "vorschlagen", e: "to suggest, to propose", p: "<vor =schlag .en" },
      { w: "erschlagen", e: "to slay, to strike dead", p: "<er =schlag .en" },
      { w: "einschlagen", e: "to smash in; to take (a route)", p: "<ein =schlag .en" },
      { w: "nachschlagen", e: "to look up (in a book)", p: "<nach =schlag .en" },
      { w: "Vorschlag", e: "suggestion, proposal", p: "<vor =Schlag", g: "der" },
      { w: "Schlag", e: "blow, stroke", p: "=schlag", g: "der" },
      { w: "Anschlag", e: "attack; notice", p: "<an =schlag", g: "der" },
    ] },
  { id: "de-fall", lang: "de", root: "fall", gloss: "fall",
    base: { w: "fallen", e: "to fall", p: "=fall .en" },
    note: "gefallen means “to please” — what falls to you agreeably. English keeps the same image in “that suits me”.",
    members: [
      { w: "gefallen", e: "to please, to be liked", p: "<ge =fall .en" },
      { w: "auffallen", e: "to stand out, to be noticeable", p: "<auf =fall .en" },
      { w: "einfallen", e: "to occur to someone; to collapse", p: "<ein =fall .en" },
      { w: "ausfallen", e: "to be cancelled; to turn out", p: "<aus =fall .en" },
      { w: "zufallen", e: "to fall shut; to fall to someone", p: "<zu =fall .en" },
      { w: "Fall", e: "case; fall", p: "=fall", g: "der" },
      { w: "Unfall", e: "accident", p: "<un =fall", g: "der" },
      { w: "Einfall", e: "idea; invasion", p: "<ein =fall", g: "der" },
      { w: "Zufall", e: "coincidence, chance", p: "<zu =fall", g: "der" },
    ] },
  { id: "de-trag", lang: "de", root: "trag", gloss: "carry, bear",
    base: { w: "tragen", e: "to carry; to wear", p: "=trag .en" },
    members: [
      { w: "beitragen", e: "to contribute", p: "<bei =trag .en" },
      { w: "übertragen", e: "to transfer, to broadcast", p: "<über =trag .en" },
      { w: "vertragen", e: "to tolerate, to bear", p: "<ver =trag .en" },
      { w: "eintragen", e: "to enter, to register", p: "<ein =trag .en" },
      { w: "vortragen", e: "to present, to recite", p: "<vor =trag .en" },
      { w: "Vertrag", e: "contract, treaty", p: "<ver =trag", g: "der" },
      { w: "Auftrag", e: "order, assignment", p: "<auf =trag", g: "der" },
      { w: "Beitrag", e: "contribution", p: "<bei =trag", g: "der" },
    ] },
  { id: "de-denk", lang: "de", root: "denk", gloss: "think",
    base: { w: "denken", e: "to think", p: "=denk .en" },
    note: "The noun switches to -dank, and Dank “thanks” is the same root: to thank is to keep someone in mind.",
    members: [
      { w: "nachdenken", e: "to think over, to reflect", p: "<nach =denk .en" },
      { w: "bedenken", e: "to consider", p: "<be =denk .en" },
      { w: "erdenken", e: "to think up, to devise", p: "<er =denk .en" },
      { w: "gedenken", e: "to commemorate", p: "<ge =denk .en" },
      { w: "Gedanke", e: "thought", p: "<ge =dank .e", g: "der" },
      { w: "Dank", e: "thanks", p: "=dank", g: "der" },
      { w: "denkbar", e: "thinkable, conceivable", p: "=denk >bar" },
    ] },

  // ---------------------------- French, more ----------------------------
  { id: "fr-cevoir", lang: "fr", root: "cevoir", gloss: "take, receive",
    base: { w: "recevoir", e: "to receive", p: "<re =cevoir" },
    note: "The root is Latin capere, “to take”. The nouns switch to -ception, which English borrowed whole: reception, perception, deception.",
    members: [
      { w: "apercevoir", e: "to catch sight of, to perceive", p: "<aper =cevoir" },
      { w: "concevoir", e: "to conceive, to design", p: "<con =cevoir" },
      { w: "décevoir", e: "to disappoint", p: "<dé =cevoir", n: "A false friend. It is not “to deceive” — that is tromper." },
      { w: "percevoir", e: "to perceive; to collect (a tax)", p: "<per =cevoir" },
      { w: "réception", e: "reception", p: "<ré =cept >ion", g: "la" },
      { w: "déception", e: "disappointment", p: "<dé =cept >ion", g: "la", n: "Follows décevoir, so it is disappointment — not deception." },
      { w: "conception", e: "design, conception", p: "<con =cept >ion", g: "la" },
    ] },
  { id: "fr-sent", lang: "fr", root: "sent", gloss: "feel, sense",
    base: { w: "sentir", e: "to feel; to smell", p: "=sent >ir" },
    note: "Where a prefix ending in a vowel meets this root, French doubles the s — ressentir, pressentir — so the sound stays /s/ and does not soften to /z/ between vowels. The parts are unchanged; only the spelling of the join moves.",
    members: [
      { w: "ressentir", e: "to feel (an emotion)", p: "<re =sent >ir", shift: true },
      { w: "consentir", e: "to consent", p: "<con =sent >ir" },
      { w: "pressentir", e: "to have a premonition of", p: "<pre =sent >ir", shift: true },
      { w: "sentiment", e: "feeling", p: "=senti >ment", g: "le" },
      { w: "sensible", e: "sensitive", p: "=sens >ible", n: "A false friend: “sensible” in English is raisonnable." },
      { w: "sensation", e: "sensation, feeling", p: "=sens >ation", g: "la" },
    ] },
  { id: "fr-cour", lang: "fr", root: "cour", gloss: "run",
    base: { w: "courir", e: "to run", p: "=cour >ir" },
    note: "Latin currere. The nouns switch to -cours, which is why a course, a discourse and a competition are all the same word underneath.",
    members: [
      { w: "parcourir", e: "to travel through, to skim", p: "<par =cour >ir" },
      { w: "accourir", e: "to come running, to rush up", p: "<ac =cour >ir" },
      { w: "secourir", e: "to help out, to rescue", p: "<se =cour >ir" },
      { w: "concourir", e: "to compete; to contribute", p: "<con =cour >ir" },
      { w: "cours", e: "course, class; flow", p: "=cours", g: "le" },
      { w: "discours", e: "speech, discourse", p: "<dis =cours", g: "le" },
      { w: "concours", e: "competition, contest", p: "<con =cours", g: "le" },
      { w: "secours", e: "help, rescue", p: "<se =cours", g: "le" },
    ] },
  { id: "fr-fer", lang: "fr", root: "fér", gloss: "carry, bear",
    base: { w: "offrir", e: "to offer, to give", p: "<of =frir" },
    note: "Latin ferre, “carry” — the same root English has in transfer, refer and offer. French wore it down to -frir and -férer, which no longer look alike.",
    members: [
      { w: "souffrir", e: "to suffer", p: "<souf =frir" },
      { w: "transférer", e: "to transfer", p: "<trans =férer" },
      { w: "référer", e: "to refer", p: "<ré =férer" },
      { w: "préférer", e: "to prefer", p: "<pré =férer" },
      { w: "différer", e: "to differ; to postpone", p: "<dif =férer" },
      { w: "offre", e: "offer", p: "<of =fre", g: "la" },
      { w: "différence", e: "difference", p: "<dif =fér >ence", g: "la" },
    ] },
  { id: "fr-part", lang: "fr", root: "part", gloss: "part, share, leave",
    base: { w: "partir", e: "to leave, to depart", p: "=part >ir" },
    members: [
      { w: "partager", e: "to share", p: "=part >ager" },
      { w: "répartir", e: "to distribute", p: "<ré =part >ir" },
      { w: "départir", e: "to divest oneself of; to distribute", p: "<dé =part >ir" },
      { w: "participer", e: "to take part", p: "=parti >ciper" },
      { w: "partie", e: "part; game", p: "=part >ie", g: "la" },
      { w: "départ", e: "departure", p: "<dé =part", g: "le" },
      { w: "parti", e: "party (political); decision", p: "=part >i", g: "le" },
    ] },
  { id: "fr-form", lang: "fr", root: "form", gloss: "shape, form",
    base: { w: "former", e: "to form, to train", p: "=form >er" },
    members: [
      { w: "transformer", e: "to transform", p: "<trans =form >er" },
      { w: "informer", e: "to inform", p: "<in =form >er" },
      { w: "réformer", e: "to reform", p: "<ré =form >er" },
      { w: "conformer", e: "to conform, to adapt", p: "<con =form >er" },
      { w: "déformer", e: "to distort, to deform", p: "<dé =form >er" },
      { w: "formation", e: "training; formation", p: "=form >ation", g: "la" },
      { w: "information", e: "information", p: "<in =form >ation", g: "la" },
      { w: "formel", e: "formal; definite", p: "=form >el" },
    ] },
];

/* The explainer, in the language the learner already has.
 *
 * Nobody needs teaching that unbecoming is un + become + ing — they need
 * telling that this is the same machinery French and German run on, and that
 * it is worth pulling apart there too. Starting in English is the shortest
 * route to that.
 */
export const ENGLISH_DEMO = {
  word: "unbecoming",
  p: "<un =becom >ing",
  gloss: "not fitting, not appropriate",
  point: "Three parts. Strip them and you get become — and once you have the root, forthcoming, income, outcome and welcome all stop being separate words to memorise.",
  family: [
    { w: "become", e: "to come to be", p: "=becom .e" },
    { w: "forthcoming", e: "about to happen; forthright", p: "<forth =com >ing" },
    { w: "income", e: "money coming in", p: "<in =come" },
    { w: "outcome", e: "how it came out", p: "<out =come" },
    { w: "overcome", e: "to get past", p: "<over =come" },
  ],
};

export function familiesFor(lang) {
  return FAMILIES.filter((f) => f.lang === lang);
}
