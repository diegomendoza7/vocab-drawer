/* Collocations: the layer between words and grammar.
 *
 * A learner who knows `décision` and knows `faire` will still say *faire une
 * décision*, because English makes decisions and French takes them. Nothing in
 * a dictionary or a grammar warns you: the pairing is arbitrary, frequent, and
 * invisible until you get it wrong in front of someone.
 *
 * German is worse, because its light-verb constructions are a closed club —
 * `eine Entscheidung treffen`, never *machen*; `eine Frage stellen`, never
 * *fragen*. These are the phrases that separate correct-but-foreign from
 * fluent, and they are exactly what a word-by-word deck cannot teach.
 *
 * `trap` is the payload. Each entry says what English does instead, because the
 * error is almost always English leaking through, and naming the leak is what
 * stops it. `wrong` are the verbs a learner actually reaches for — drawn from
 * the English calque and from near-synonyms — so the drill tests the choice
 * rather than offering three obviously silly options.
 */

export const COLLOCATIONS = [
  // ------------------------------- French -------------------------------
  { lang: "fr", verb: "prendre", noun: "une décision", en: "to make a decision",
    trap: "English *makes* a decision; French *takes* one.", wrong: ["faire", "donner"] },
  { lang: "fr", verb: "poser", noun: "une question", en: "to ask a question",
    trap: "You *place* a question in French. “Demander une question” is the classic beginner slip.", wrong: ["demander", "faire"] },
  { lang: "fr", verb: "faire", noun: "attention", en: "to pay attention",
    trap: "English *pays* attention; French *does* it.", wrong: ["payer", "prendre"] },
  { lang: "fr", verb: "avoir", noun: "raison", en: "to be right",
    trap: "French *has* reason where English *is* right — so it is “j'ai raison”, never “je suis raison”.", wrong: ["être", "prendre"] },
  { lang: "fr", verb: "avoir", noun: "tort", en: "to be wrong",
    trap: "The mirror of avoir raison, and wrong for the same reason.", wrong: ["être", "faire"] },
  { lang: "fr", verb: "avoir", noun: "faim", en: "to be hungry",
    trap: "Hunger is something you *have* in French, not something you *are*.", wrong: ["être", "sentir"] },
  { lang: "fr", verb: "faire", noun: "une promenade", en: "to go for a walk",
    trap: "You *do* a walk, not *go* one.", wrong: ["aller", "prendre"] },
  { lang: "fr", verb: "rendre", noun: "visite", en: "to pay a visit (to a person)",
    trap: "Rendre visite is for people; visiter is for places. Visiting your aunt with “visiter” sounds like inspecting her.", wrong: ["faire", "visiter"] },
  { lang: "fr", verb: "prendre", noun: "une douche", en: "to take a shower",
    trap: "This one matches English — worth knowing because so many do not.", wrong: ["faire", "avoir"] },
  { lang: "fr", verb: "faire", noun: "des courses", en: "to do the shopping",
    trap: "Always plural, and always faire.", wrong: ["prendre", "acheter"] },
  { lang: "fr", verb: "tenir", noun: "compte", en: "to take into account",
    trap: "French *holds* account of something; English takes it.", wrong: ["prendre", "faire"] },
  { lang: "fr", verb: "porter", noun: "plainte", en: "to file a complaint",
    trap: "You *carry* a complaint to the authorities.", wrong: ["faire", "donner"] },
  { lang: "fr", verb: "prendre", noun: "rendez-vous", en: "to make an appointment",
    trap: "Taken, not made — and with no article after prendre.", wrong: ["faire", "avoir"] },
  { lang: "fr", verb: "faire", noun: "la queue", en: "to queue, to stand in line",
    trap: "Literally “to do the tail”.", wrong: ["prendre", "attendre"] },
  { lang: "fr", verb: "avoir", noun: "besoin de", en: "to need",
    trap: "French has *need of* something; there is no single verb for “to need”.", wrong: ["être", "falloir"] },
  { lang: "fr", verb: "prendre", noun: "une photo", en: "to take a photo",
    trap: "Matches English, unlike most of this list.", wrong: ["faire", "donner"] },
  { lang: "fr", verb: "donner", noun: "un coup de main", en: "to lend a hand",
    trap: "French *gives* the hand where English lends it.", wrong: ["prêter", "faire"] },
  { lang: "fr", verb: "mettre", noun: "la table", en: "to set the table",
    trap: "You *put* the table in French.", wrong: ["faire", "poser"] },
  { lang: "fr", verb: "faire", noun: "une erreur", en: "to make a mistake",
    trap: "Here French does agree with English.", wrong: ["prendre", "commettre"] },
  { lang: "fr", verb: "suivre", noun: "un cours", en: "to take a course",
    trap: "French *follows* a course; English takes it.", wrong: ["prendre", "faire"] },

  // ------------------------------- German -------------------------------
  { lang: "de", verb: "treffen", noun: "eine Entscheidung", en: "to make a decision",
    trap: "Never *machen*. German *meets* a decision — the single most common light-verb slip.", wrong: ["machen", "nehmen"] },
  { lang: "de", verb: "stellen", noun: "eine Frage", en: "to ask a question",
    trap: "You *place* a question. “Eine Frage fragen” is doubly wrong.", wrong: ["fragen", "machen"] },
  { lang: "de", verb: "achten", noun: "auf etwas", en: "to pay attention to something",
    trap: "No “Aufmerksamkeit machen” — the verb carries it alone.", wrong: ["machen", "geben"] },
  { lang: "de", verb: "haben", noun: "recht", en: "to be right",
    trap: "German *has* right, as French has reason. “Ich bin recht” is not German.", wrong: ["sein", "nehmen"] },
  { lang: "de", verb: "haben", noun: "Hunger", en: "to be hungry",
    trap: "Hunger is had, not been — and no article.", wrong: ["sein", "fühlen"] },
  { lang: "de", verb: "nehmen", noun: "Rücksicht", en: "to show consideration",
    trap: "German *takes* consideration where English shows it.", wrong: ["zeigen", "geben"] },
  { lang: "de", verb: "ziehen", noun: "in Betracht", en: "to take into consideration",
    trap: "German *pulls* it into consideration.", wrong: ["nehmen", "bringen"] },
  { lang: "de", verb: "halten", noun: "einen Vortrag", en: "to give a talk",
    trap: "You *hold* a talk in German, never give one.", wrong: ["geben", "machen"] },
  { lang: "de", verb: "treffen", noun: "eine Wahl", en: "to make a choice",
    trap: "Same verb as Entscheidung — the pair travel together.", wrong: ["machen", "nehmen"] },
  { lang: "de", verb: "stellen", noun: "einen Antrag", en: "to submit an application",
    trap: "Placed, like a question.", wrong: ["machen", "geben"] },
  { lang: "de", verb: "leisten", noun: "einen Beitrag", en: "to make a contribution",
    trap: "Leisten is the light verb for effort and achievement.", wrong: ["machen", "geben"] },
  { lang: "de", verb: "gewinnen", noun: "den Eindruck", en: "to get the impression",
    trap: "German *wins* an impression.", wrong: ["bekommen", "haben"] },
  { lang: "de", verb: "machen", noun: "einen Fehler", en: "to make a mistake",
    trap: "One of the few where machen is right.", wrong: ["treffen", "tun"] },
  { lang: "de", verb: "üben", noun: "Kritik", en: "to voice criticism",
    trap: "German *practises* criticism.", wrong: ["machen", "geben"] },
  { lang: "de", verb: "fassen", noun: "einen Entschluss", en: "to reach a decision",
    trap: "A second decision idiom, with a different verb again — fassen means to grasp.", wrong: ["treffen", "machen"] },
  { lang: "de", verb: "setzen", noun: "unter Druck", en: "to put under pressure",
    trap: "Setzen, not stellen — German distinguishes the two placements.", wrong: ["stellen", "legen"] },
  { lang: "de", verb: "brechen", noun: "ein Versprechen", en: "to break a promise",
    trap: "Agrees with English.", wrong: ["machen", "halten"] },
  { lang: "de", verb: "halten", noun: "ein Versprechen", en: "to keep a promise",
    trap: "German *holds* a promise where English keeps it — and the same verb as Vortrag.", wrong: ["behalten", "bleiben"] },
  { lang: "de", verb: "spielen", noun: "eine Rolle", en: "to play a role",
    trap: "Agrees with English, and is everywhere in written German.", wrong: ["haben", "nehmen"] },
  { lang: "de", verb: "ergreifen", noun: "Maßnahmen", en: "to take measures",
    trap: "Ergreifen is to seize — stronger than nehmen, and the fixed choice here.", wrong: ["nehmen", "machen"] },
];

export function collocationsFor(lang) {
  return COLLOCATIONS.filter((c) => c.lang === lang);
}
