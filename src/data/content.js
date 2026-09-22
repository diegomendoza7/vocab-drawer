/* Idiom phrases, conjugation engine, grammar notes.
   Extracted verbatim from the original single-file app. */


/* ---------------------------------------------------------------------- */
/* Phrase Match — idiomatic expressions matched to their (non-literal)     */
/* English equivalent meaning. A literal gloss is revealed on each match   */
/* to show why word-for-word translation would mislead.                   */
/* ---------------------------------------------------------------------- */
export const PHRASES = {
  fr: {
    A1: [
      { phrase: "Il pleut des cordes", meaning: "It's raining cats and dogs", literal: "lit. \"it's raining ropes\"" },
      { phrase: "Avoir la pêche", meaning: "To feel great, full of energy", literal: "lit. \"to have the peach\"" },
      { phrase: "Casser les pieds à quelqu'un", meaning: "To annoy someone", literal: "lit. \"to break someone's feet\"" },
      { phrase: "Avoir un chat dans la gorge", meaning: "To have a frog in one's throat", literal: "lit. \"to have a cat in the throat\"" },
      { phrase: "Poser un lapin à quelqu'un", meaning: "To stand someone up", literal: "lit. \"to place a rabbit on someone\"" },
      { phrase: "Coûter les yeux de la tête", meaning: "To cost an arm and a leg", literal: "lit. \"to cost the eyes from the head\"" },
    ],
    A2: [
      { phrase: "Avoir le cafard", meaning: "To feel down, blue", literal: "lit. \"to have the cockroach\"" },
      { phrase: "Mettre la charrue avant les bœufs", meaning: "To put the cart before the horse", literal: "lit. \"to put the plow before the oxen\"" },
      { phrase: "Tomber dans les pommes", meaning: "To faint, pass out", literal: "lit. \"to fall into the apples\"" },
      { phrase: "Avoir un poil dans la main", meaning: "To be extremely lazy", literal: "lit. \"to have a hair in one's hand\"" },
      { phrase: "Faire la grasse matinée", meaning: "To sleep in", literal: "lit. \"to make the fat morning\"" },
      { phrase: "Donner sa langue au chat", meaning: "To give up guessing", literal: "lit. \"to give one's tongue to the cat\"" },
    ],
    B1: [
      { phrase: "Appeler un chat un chat", meaning: "To call a spade a spade", literal: "lit. \"to call a cat a cat\"" },
      { phrase: "Avoir d'autres chats à fouetter", meaning: "To have other fish to fry", literal: "lit. \"to have other cats to whip\"" },
      { phrase: "Chercher midi à quatorze heures", meaning: "To overcomplicate a simple thing", literal: "lit. \"to look for noon at two o'clock\"" },
      { phrase: "Mettre son grain de sel", meaning: "To put in one's two cents", literal: "lit. \"to put one's grain of salt\"" },
      { phrase: "Tourner autour du pot", meaning: "To beat around the bush", literal: "lit. \"to turn around the pot\"" },
      { phrase: "Avoir le cœur sur la main", meaning: "To be very generous", literal: "lit. \"to have the heart on the hand\"" },
    ],
    B2: [
      { phrase: "Ne pas y aller par quatre chemins", meaning: "To get straight to the point", literal: "lit. \"to not go there by four paths\"" },
      { phrase: "Tirer les vers du nez de quelqu'un", meaning: "To worm information out of someone", literal: "lit. \"to pull the worms from someone's nose\"" },
      { phrase: "Jeter l'éponge", meaning: "To throw in the towel", literal: "lit. \"to throw the sponge\"" },
      { phrase: "Avoir un train de retard", meaning: "To be behind the times", literal: "lit. \"to have a train of delay\"" },
      { phrase: "Prendre le taureau par les cornes", meaning: "To take the bull by the horns", literal: "lit. \"to take the bull by the horns\"" },
      { phrase: "Mettre la main à la pâte", meaning: "To pitch in and help", literal: "lit. \"to put a hand in the dough\"" },
    ],
  },
  de: {
    A1: [
      { phrase: "Ich verstehe nur Bahnhof", meaning: "It's all Greek to me", literal: "lit. \"I only understand train station\"" },
      { phrase: "Die Daumen drücken", meaning: "To keep one's fingers crossed", literal: "lit. \"to press one's thumbs\"" },
      { phrase: "Einen Kater haben", meaning: "To have a hangover", literal: "lit. \"to have a tomcat\"" },
      { phrase: "Ins Wasser fallen", meaning: "To fall through, not happen", literal: "lit. \"to fall into the water\"" },
      { phrase: "Schwein haben", meaning: "To be lucky", literal: "lit. \"to have pig\"" },
      { phrase: "Die Nase voll haben", meaning: "To be fed up", literal: "lit. \"to have the nose full\"" },
    ],
    A2: [
      { phrase: "Jemandem die Daumen halten", meaning: "To wish someone luck", literal: "lit. \"to hold someone's thumbs\"" },
      { phrase: "Um den heißen Brei herumreden", meaning: "To beat around the bush", literal: "lit. \"to talk around the hot porridge\"" },
      { phrase: "Da liegt der Hund begraben", meaning: "That's the crux of the matter", literal: "lit. \"that's where the dog is buried\"" },
      { phrase: "Tomaten auf den Augen haben", meaning: "To be oblivious to the obvious", literal: "lit. \"to have tomatoes on one's eyes\"" },
      { phrase: "Ins Gras beißen", meaning: "To kick the bucket, die", literal: "lit. \"to bite into the grass\"" },
      { phrase: "Alles in Butter", meaning: "Everything's fine", literal: "lit. \"everything in butter\"" },
    ],
    B1: [
      { phrase: "Jemandem einen Bären aufbinden", meaning: "To pull someone's leg, trick them", literal: "lit. \"to tie a bear onto someone\"" },
      { phrase: "Die Katze im Sack kaufen", meaning: "To buy a pig in a poke", literal: "lit. \"to buy the cat in the sack\"" },
      { phrase: "Ein Auge zudrücken", meaning: "To turn a blind eye", literal: "lit. \"to press one eye shut\"" },
      { phrase: "Nicht alle Tassen im Schrank haben", meaning: "To not be all there, be a bit crazy", literal: "lit. \"to not have all cups in the cupboard\"" },
      { phrase: "Den Nagel auf den Kopf treffen", meaning: "To hit the nail on the head", literal: "lit. \"to hit the nail on the head\"" },
      { phrase: "Kein Blatt vor den Mund nehmen", meaning: "To speak one's mind bluntly", literal: "lit. \"to take no leaf in front of the mouth\"" },
    ],
    B2: [
      { phrase: "Jemandem reinen Wein einschenken", meaning: "To level with someone, tell the truth", literal: "lit. \"to pour someone pure wine\"" },
      { phrase: "Die Flinte ins Korn werfen", meaning: "To give up", literal: "lit. \"to throw the rifle into the grain\"" },
      { phrase: "Auf dem Holzweg sein", meaning: "To be on the wrong track", literal: "lit. \"to be on the wood path\"" },
      { phrase: "Sich etwas hinter die Ohren schreiben", meaning: "To make a mental note, remember it well", literal: "lit. \"to write something behind one's ears\"" },
      { phrase: "Den Bogen überspannen", meaning: "To overdo it, go too far", literal: "lit. \"to overstretch the bow\"" },
      { phrase: "Mit allen Wassern gewaschen sein", meaning: "To be shrewd, know every trick", literal: "lit. \"to be washed with all waters\"" },
    ],
  },
};

/* ---------------------------------------------------------------------- */
/* Conjugation data                                                        */
/*                                                                         */
/* Only the genuinely irregular cores are stored by hand: the present      */
/* forms, the imperfect/preterite stem, the future stem, the participle    */
/* and the auxiliary. Compound tenses are generated from those, so there   */
/* are far fewer hand-typed forms that could be wrong.                     */
/* ---------------------------------------------------------------------- */
export const FR_PRONOUNS = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];
export const DE_PRONOUNS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
export const FR_IMPF_ENDINGS = ["ais", "ais", "ait", "ions", "iez", "aient"];
export const FR_SUBJ_ENDINGS = ["e", "es", "e", "ions", "iez", "ent"];
export const DE_K2_ENDINGS = ["e", "est", "e", "en", "et", "en"];
export const FR_FUT_ENDINGS = ["ai", "as", "a", "ons", "ez", "ont"];

export const FR_VERBS = [
  { inf: "être", en: "to be", enPast: "was/were", enPP: "been", pres: ["suis", "es", "est", "sommes", "êtes", "sont"], impf: "ét", fut: "ser", pp: "été", aux: "avoir", subj: ["sois", "sois", "soit", "soyons", "soyez", "soient"], imper: ["sois", "soyons", "soyez"] },
  { inf: "avoir", en: "to have", enPast: "had", enPP: "had", pres: ["ai", "as", "a", "avons", "avez", "ont"], impf: "av", fut: "aur", pp: "eu", aux: "avoir", subj: ["aie", "aies", "ait", "ayons", "ayez", "aient"], imper: ["aie", "ayons", "ayez"] },
  { inf: "aller", en: "to go", enPast: "went", enPP: "gone", pres: ["vais", "vas", "va", "allons", "allez", "vont"], impf: "all", fut: "ir", pp: "allé", aux: "être", subj: ["aille", "ailles", "aille", "allions", "alliez", "aillent"] },
  { inf: "faire", en: "to do / make", enPast: "did", enPP: "done", pres: ["fais", "fais", "fait", "faisons", "faites", "font"], impf: "fais", fut: "fer", pp: "fait", aux: "avoir", subj: ["fasse", "fasses", "fasse", "fassions", "fassiez", "fassent"] },
  { inf: "parler", en: "to speak", enPast: "spoke", enPP: "spoken", pres: ["parle", "parles", "parle", "parlons", "parlez", "parlent"], impf: "parl", fut: "parler", pp: "parlé", aux: "avoir" },
  { inf: "finir", en: "to finish", pres: ["finis", "finis", "finit", "finissons", "finissez", "finissent"], impf: "finiss", fut: "finir", pp: "fini", aux: "avoir" },
  { inf: "vendre", en: "to sell", enPast: "sold", enPP: "sold", pres: ["vends", "vends", "vend", "vendons", "vendez", "vendent"], impf: "vend", fut: "vendr", pp: "vendu", aux: "avoir" },
  { inf: "pouvoir", en: "to be able to", enPast: "could", enPP: "been able to", pres: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"], impf: "pouv", fut: "pourr", pp: "pu", aux: "avoir", subj: ["puisse", "puisses", "puisse", "puissions", "puissiez", "puissent"] },
  { inf: "vouloir", en: "to want", enPast: "wanted", enPP: "wanted", pres: ["veux", "veux", "veut", "voulons", "voulez", "veulent"], impf: "voul", fut: "voudr", pp: "voulu", aux: "avoir", subj: ["veuille", "veuilles", "veuille", "voulions", "vouliez", "veuillent"], imper: ["veuille", "voulons", "veuillez"] },
  { inf: "devoir", en: "to have to", enPast: "had to", enPP: "had to", pres: ["dois", "dois", "doit", "devons", "devez", "doivent"], impf: "dev", fut: "devr", pp: "dû", aux: "avoir", subj: ["doive", "doives", "doive", "devions", "deviez", "doivent"] },
  { inf: "venir", en: "to come", enPast: "came", enPP: "come", pres: ["viens", "viens", "vient", "venons", "venez", "viennent"], impf: "ven", fut: "viendr", pp: "venu", aux: "être", subj: ["vienne", "viennes", "vienne", "venions", "veniez", "viennent"] },
  { inf: "prendre", en: "to take", enPast: "took", enPP: "taken", pres: ["prends", "prends", "prend", "prenons", "prenez", "prennent"], impf: "pren", fut: "prendr", pp: "pris", aux: "avoir", subj: ["prenne", "prennes", "prenne", "prenions", "preniez", "prennent"] },
  { inf: "voir", en: "to see", enPast: "saw", enPP: "seen", pres: ["vois", "vois", "voit", "voyons", "voyez", "voient"], impf: "voy", fut: "verr", pp: "vu", aux: "avoir", subj: ["voie", "voies", "voie", "voyions", "voyiez", "voient"] },
  { inf: "savoir", en: "to know", enPast: "knew", enPP: "known", pres: ["sais", "sais", "sait", "savons", "savez", "savent"], impf: "sav", fut: "saur", pp: "su", aux: "avoir", subj: ["sache", "saches", "sache", "sachions", "sachiez", "sachent"], imper: ["sache", "sachons", "sachez"] },
  { inf: "dire", en: "to say", enPast: "said", enPP: "said", pres: ["dis", "dis", "dit", "disons", "dites", "disent"], impf: "dis", fut: "dir", pp: "dit", aux: "avoir" },
  /* Everyday verbs the vocabulary teaches but the trainer could not conjugate.
   * `impf` is an array where the -ger/-cer spelling change needs it, and `subj`
   * where the ils-stem rule would carry a stressed vowel into nous/vous
   * (achètions is not a word; achetions is). */
  { inf: "aimer", en: "to like / love", enPast: "liked", enPP: "liked", pres: ["aime", "aimes", "aime", "aimons", "aimez", "aiment"], impf: "aim", fut: "aimer", pp: "aimé", aux: "avoir" },
  { inf: "penser", en: "to think", enPast: "thought", enPP: "thought", pres: ["pense", "penses", "pense", "pensons", "pensez", "pensent"], impf: "pens", fut: "penser", pp: "pensé", aux: "avoir" },
  { inf: "aider", en: "to help", enPast: "helped", enPP: "helped", pres: ["aide", "aides", "aide", "aidons", "aidez", "aident"], impf: "aid", fut: "aider", pp: "aidé", aux: "avoir" },
  { inf: "arriver", en: "to arrive", enPast: "arrived", enPP: "arrived", pres: ["arrive", "arrives", "arrive", "arrivons", "arrivez", "arrivent"], impf: "arriv", fut: "arriver", pp: "arrivé", aux: "être" },
  { inf: "manger", en: "to eat", enPast: "ate", enPP: "eaten", pres: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"], impf: ["mangeais", "mangeais", "mangeait", "mangions", "mangiez", "mangeaient"], fut: "manger", pp: "mangé", aux: "avoir" },
  { inf: "commencer", en: "to start / begin", enPast: "started", enPP: "started", pres: ["commence", "commences", "commence", "commençons", "commencez", "commencent"], impf: ["commençais", "commençais", "commençait", "commencions", "commenciez", "commençaient"], fut: "commencer", pp: "commencé", aux: "avoir" },
  { inf: "acheter", en: "to buy", enPast: "bought", enPP: "bought", pres: ["achète", "achètes", "achète", "achetons", "achetez", "achètent"], impf: "achet", fut: "achèter", pp: "acheté", aux: "avoir", subj: ["achète", "achètes", "achète", "achetions", "achetiez", "achètent"] },
  { inf: "payer", en: "to pay", enPast: "paid", enPP: "paid", pres: ["paie", "paies", "paie", "payons", "payez", "paient"], impf: "pay", fut: "paier", pp: "payé", aux: "avoir", subj: ["paie", "paies", "paie", "payions", "payiez", "paient"] },
  { inf: "boire", en: "to drink", enPast: "drank", enPP: "drunk", pres: ["bois", "bois", "boit", "buvons", "buvez", "boivent"], impf: "buv", fut: "boir", pp: "bu", aux: "avoir", subj: ["boive", "boives", "boive", "buvions", "buviez", "boivent"] },
  { inf: "partir", en: "to leave", enPast: "left", enPP: "left", pres: ["pars", "pars", "part", "partons", "partez", "partent"], impf: "part", fut: "partir", pp: "parti", aux: "être" },
  { inf: "attendre", en: "to wait", enPast: "waited", enPP: "waited", pres: ["attends", "attends", "attend", "attendons", "attendez", "attendent"], impf: "attend", fut: "attendr", pp: "attendu", aux: "avoir" },
  { inf: "comprendre", en: "to understand", enPast: "understood", enPP: "understood", pres: ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"], impf: "compren", fut: "comprendr", pp: "compris", aux: "avoir" },
  { inf: "apprendre", en: "to learn", enPast: "learned", enPP: "learned", pres: ["apprends", "apprends", "apprend", "apprenons", "apprenez", "apprennent"], impf: "appren", fut: "apprendr", pp: "appris", aux: "avoir" },
  { inf: "lever", label: "se lever", en: "to get up", enPast: "got up", enPP: "got up", pres: ["lève", "lèves", "lève", "levons", "levez", "lèvent"], impf: "lev", fut: "lèver", pp: "levé", aux: "être", refl: true, subj: ["lève", "lèves", "lève", "levions", "leviez", "lèvent"] },
  { inf: "coucher", label: "se coucher", en: "to go to bed", enPast: "went to bed", enPP: "gone to bed", pres: ["couche", "couches", "couche", "couchons", "couchez", "couchent"], impf: "couch", fut: "coucher", pp: "couché", aux: "être", refl: true },
];

export const DE_VERBS = [
  { inf: "sein", en: "to be", enPast: "was/were", enPP: "been", pres: ["bin", "bist", "ist", "sind", "seid", "sind"], past: ["war", "warst", "war", "waren", "wart", "waren"], pp: "gewesen", aux: "sein", imper: ["sei", "seid", "seien"] },
  { inf: "haben", en: "to have", enPast: "had", enPP: "had", pres: ["habe", "hast", "hat", "haben", "habt", "haben"], past: ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"], pp: "gehabt", aux: "haben" },
  { inf: "werden", en: "to become", enPast: "became", enPP: "become", pres: ["werde", "wirst", "wird", "werden", "werdet", "werden"], past: ["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"], pp: "geworden", aux: "sein" },
  { inf: "gehen", en: "to go", enPast: "went", enPP: "gone", pres: ["gehe", "gehst", "geht", "gehen", "geht", "gehen"], past: ["ging", "gingst", "ging", "gingen", "gingt", "gingen"], pp: "gegangen", aux: "sein" },
  { inf: "machen", en: "to do / make", enPast: "did", enPP: "done", pres: ["mache", "machst", "macht", "machen", "macht", "machen"], past: ["machte", "machtest", "machte", "machten", "machtet", "machten"], pp: "gemacht", aux: "haben" },
  { inf: "sprechen", en: "to speak", enPast: "spoke", enPP: "spoken", pres: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"], past: ["sprach", "sprachst", "sprach", "sprachen", "spracht", "sprachen"], pp: "gesprochen", aux: "haben" },
  { inf: "kommen", en: "to come", enPast: "came", enPP: "come", pres: ["komme", "kommst", "kommt", "kommen", "kommt", "kommen"], past: ["kam", "kamst", "kam", "kamen", "kamt", "kamen"], pp: "gekommen", aux: "sein" },
  { inf: "sehen", en: "to see", enPast: "saw", enPP: "seen", pres: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"], past: ["sah", "sahst", "sah", "sahen", "saht", "sahen"], pp: "gesehen", aux: "haben" },
  { inf: "geben", en: "to give", enPast: "gave", enPP: "given", pres: ["gebe", "gibst", "gibt", "geben", "gebt", "geben"], past: ["gab", "gabst", "gab", "gaben", "gabt", "gaben"], pp: "gegeben", aux: "haben" },
  { inf: "nehmen", en: "to take", enPast: "took", enPP: "taken", pres: ["nehme", "nimmst", "nimmt", "nehmen", "nehmt", "nehmen"], past: ["nahm", "nahmst", "nahm", "nahmen", "nahmt", "nahmen"], pp: "genommen", aux: "haben" },
  { inf: "können", en: "to be able to", enPast: "could", enPP: "been able to", pres: ["kann", "kannst", "kann", "können", "könnt", "können"], past: ["konnte", "konntest", "konnte", "konnten", "konntet", "konnten"], pp: "gekonnt", aux: "haben", k2: ["könnte", "könntest", "könnte", "könnten", "könntet", "könnten"], noImper: true },
  { inf: "müssen", en: "to have to", enPast: "had to", enPP: "had to", pres: ["muss", "musst", "muss", "müssen", "müsst", "müssen"], past: ["musste", "musstest", "musste", "mussten", "musstet", "mussten"], pp: "gemusst", aux: "haben", k2: ["müsste", "müsstest", "müsste", "müssten", "müsstet", "müssten"], noImper: true },
  { inf: "wollen", en: "to want", enPast: "wanted", enPP: "wanted", pres: ["will", "willst", "will", "wollen", "wollt", "wollen"], past: ["wollte", "wolltest", "wollte", "wollten", "wolltet", "wollten"], pp: "gewollt", aux: "haben", noImper: true },
  { inf: "fahren", en: "to drive / travel", enPast: "drove", enPP: "driven", pres: ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"], past: ["fuhr", "fuhrst", "fuhr", "fuhren", "fuhrt", "fuhren"], pp: "gefahren", aux: "sein" },
  { inf: "essen", en: "to eat", enPast: "ate", enPP: "eaten", pres: ["esse", "isst", "isst", "essen", "esst", "essen"], past: ["aß", "aßest", "aß", "aßen", "aßt", "aßen"], pp: "gegessen", aux: "haben" },
  /* Everyday verbs the vocabulary teaches but the trainer could not conjugate.
   * `sep` carries a separable prefix, which the engine puts last in a main
   * clause and folds back into the participle. */
  { inf: "trinken", en: "to drink", enPast: "drank", enPP: "drunk", pres: ["trinke", "trinkst", "trinkt", "trinken", "trinkt", "trinken"], past: ["trank", "trankst", "trank", "tranken", "trankt", "tranken"], pp: "getrunken", aux: "haben" },
  { inf: "mögen", en: "to like", enPast: "liked", enPP: "liked", pres: ["mag", "magst", "mag", "mögen", "mögt", "mögen"], past: ["mochte", "mochtest", "mochte", "mochten", "mochtet", "mochten"], pp: "gemocht", aux: "haben", k2: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"], noImper: true },
  { inf: "kaufen", en: "to buy", enPast: "bought", enPP: "bought", pres: ["kaufe", "kaufst", "kauft", "kaufen", "kauft", "kaufen"], past: ["kaufte", "kauftest", "kaufte", "kauften", "kauftet", "kauften"], pp: "gekauft", aux: "haben" },
  { inf: "verkaufen", en: "to sell", enPast: "sold", enPP: "sold", pres: ["verkaufe", "verkaufst", "verkauft", "verkaufen", "verkauft", "verkaufen"], past: ["verkaufte", "verkauftest", "verkaufte", "verkauften", "verkauftet", "verkauften"], pp: "verkauft", aux: "haben" },
  { inf: "bezahlen", en: "to pay", enPast: "paid", enPP: "paid", pres: ["bezahle", "bezahlst", "bezahlt", "bezahlen", "bezahlt", "bezahlen"], past: ["bezahlte", "bezahltest", "bezahlte", "bezahlten", "bezahltet", "bezahlten"], pp: "bezahlt", aux: "haben" },
  { inf: "lernen", en: "to learn", enPast: "learned", enPP: "learned", pres: ["lerne", "lernst", "lernt", "lernen", "lernt", "lernen"], past: ["lernte", "lerntest", "lernte", "lernten", "lerntet", "lernten"], pp: "gelernt", aux: "haben" },
  { inf: "warten", en: "to wait", enPast: "waited", enPP: "waited", pres: ["warte", "wartest", "wartet", "warten", "wartet", "warten"], past: ["wartete", "wartetest", "wartete", "warteten", "wartetet", "warteten"], pp: "gewartet", aux: "haben" },
  { inf: "beenden", en: "to finish / end", enPast: "finished", enPP: "finished", pres: ["beende", "beendest", "beendet", "beenden", "beendet", "beenden"], past: ["beendete", "beendetest", "beendete", "beendeten", "beendetet", "beendeten"], pp: "beendet", aux: "haben" },
  { inf: "verstehen", en: "to understand", enPast: "understood", enPP: "understood", pres: ["verstehe", "verstehst", "versteht", "verstehen", "versteht", "verstehen"], past: ["verstand", "verstandst", "verstand", "verstanden", "verstandet", "verstanden"], pp: "verstanden", aux: "haben" },
  { inf: "helfen", en: "to help", enPast: "helped", enPP: "helped", pres: ["helfe", "hilfst", "hilft", "helfen", "helft", "helfen"], past: ["half", "halfst", "half", "halfen", "halft", "halfen"], pp: "geholfen", aux: "haben" },
  { inf: "denken", en: "to think", enPast: "thought", enPP: "thought", pres: ["denke", "denkst", "denkt", "denken", "denkt", "denken"], past: ["dachte", "dachtest", "dachte", "dachten", "dachtet", "dachten"], pp: "gedacht", aux: "haben" },
  { inf: "wissen", en: "to know", enPast: "knew", enPP: "known", pres: ["weiß", "weißt", "weiß", "wissen", "wisst", "wissen"], past: ["wusste", "wusstest", "wusste", "wussten", "wusstet", "wussten"], pp: "gewusst", aux: "haben", imper: ["wisse", "wisst", "wissen"] },
  { inf: "aufstehen", en: "to get up", enPast: "got up", enPP: "got up", pres: ["stehe", "stehst", "steht", "stehen", "steht", "stehen"], past: ["stand", "standst", "stand", "standen", "standet", "standen"], pp: "aufgestanden", aux: "sein", sep: "auf" },
  { inf: "ankommen", en: "to arrive", enPast: "arrived", enPP: "arrived", pres: ["komme", "kommst", "kommt", "kommen", "kommt", "kommen"], past: ["kam", "kamst", "kam", "kamen", "kamt", "kamen"], pp: "angekommen", aux: "sein", sep: "an" },
  { inf: "abreisen", en: "to leave / depart", enPast: "departed", enPP: "departed", pres: ["reise", "reist", "reist", "reisen", "reist", "reisen"], past: ["reiste", "reistest", "reiste", "reisten", "reistet", "reisten"], pp: "abgereist", aux: "sein", sep: "ab" },
  { inf: "anfangen", en: "to begin / start", enPast: "began", enPP: "begun", pres: ["fange", "fängst", "fängt", "fangen", "fangt", "fangen"], past: ["fing", "fingst", "fing", "fingen", "fingt", "fingen"], pp: "angefangen", aux: "haben", sep: "an" },
];

/* `hint` says what a tense *means*; `form` says how it is *built*.
 *
 * The drill used to answer a wrong form with the right form and its English
 * translation, which tells you what to memorise and never what to understand.
 * `form` is the sentence a teacher would say at that moment — shown on a miss,
 * where it is wanted, rather than filed in a notes screen nobody visits mid-
 * drill. `note` names a grammar note to read next, and is checked against the
 * real note titles by scripts/check-explanations.mjs so it cannot rot. */
export const FR_TENSES = [
  { key: "present", label: "Présent", hint: "I speak / I am speaking",
    form: "Stem plus the ending for the person: -e/-es/-e/-ons/-ez/-ent for -er verbs, -is/-is/-it/-issons/-issez/-issent for -ir. The irregular verbs are irregular in the **stem** — the endings barely move." },
  { key: "passe", label: "Passé composé", hint: "I spoke / I have spoken",
    form: "**avoir** or **être** in the present, plus the past participle. The small set that takes être — aller, venir, partir, sortir, rester, naître, mourir and their relatives — agrees with the subject: elle est allé**e**.",
    note: "Passé composé vs. Imparfait" },
  { key: "imparfait", label: "Imparfait", hint: "I was speaking / I used to speak",
    form: "Take the **nous** form of the present, drop -ons, add -ais/-ais/-ait/-ions/-iez/-aient. Only être breaks the rule (ét-).",
    note: "Passé composé vs. Imparfait" },
  { key: "futur", label: "Futur simple", hint: "I will speak",
    form: "The **whole infinitive** plus -ai/-as/-a/-ons/-ez/-ont (-re verbs drop the final -e). The irregular futures — serai, aurai, irai, ferai — change the stem and keep those same endings." },
  { key: "conditionnel", label: "Conditionnel", hint: "I would speak",
    form: "The **future stem** plus the **imparfait endings**: -ais/-ais/-ait/-ions/-iez/-aient. If you know the futur, you already know this one." },
  { key: "subjonctif", label: "Subjonctif", hint: "…that I speak — after vouloir que, il faut que, bien que",
    form: "Take the **ils** form of the present, drop -ent, add -e/-es/-e/-ions/-iez/-ent. What triggers it is the phrase in front of it — vouloir que, il faut que, bien que — not the meaning of the verb itself." },
  { key: "imperatif", label: "Impératif", hint: "Speak! Let's speak! — orders, instructions, suggestions", persons: [1, 3, 4],
    form: "The present tense with the pronoun removed. -er verbs also drop the -s in the tu form: **parle**, not parles (it comes back before y and en).",
    note: "Negation: ne … pas and friends" },
];
export const DE_TENSES = [
  { key: "praesens", label: "Präsens", hint: "I speak / I am speaking",
    form: "Stem plus -e/-st/-t/-en/-t/-en. Strong verbs change the **stem vowel** in du and er/sie/es, and nowhere else: fahren → du f**ä**hrst, geben → du g**i**bst." },
  { key: "praeteritum", label: "Präteritum", hint: "I spoke (written narrative past)",
    form: "Weak verbs insert **-te-** (machte, machtest); strong verbs change the vowel and take **no ending** in ich and er/sie/es (ich ging, er kam). This is the written past — in speech the Perfekt does the same job." },
  { key: "perfekt", label: "Perfekt", hint: "I have spoken (spoken past)",
    form: "**haben** or **sein** in the present, plus the past participle at the **end** of the clause. sein goes with movement and change of state — gehen, fahren, kommen, werden, bleiben.",
    note: "Separable verbs" },
  { key: "futur", label: "Futur I", hint: "I will speak",
    form: "**werden** conjugated, with the infinitive at the **end**: ich werde morgen sprechen. German just as often uses the Präsens with a time word instead — morgen fahre ich.",
    note: "Modal verbs take the infinitive to the end" },
  { key: "konjunktiv2", label: "Konjunktiv II", hint: "I would speak — wishes, politeness, reported speech",
    form: "**würde** plus the infinitive covers almost every verb. The handful with their own forms are the ones you actually need: wäre, hätte, könnte, müsste, wüsste." },
  { key: "imperativ", label: "Imperativ", hint: "Speak! Let's speak! — orders, instructions, suggestions", persons: [1, 3, 4, 5],
    form: "**du** drops the ending (geh!), **ihr** uses the plain present form (geht!), **Sie** keeps its pronoun *after* the verb (gehen Sie!). A du-form vowel change survives: gib!, nimm!" },
];

/* ---------------------------------------------------------------------- */
/* Which persons a tense actually has                                      */
/*                                                                          */
/* Every other tense in both languages runs all six persons, which is why   */
/* the whole app — the pronoun tiles, the matching board, the multiple-     */
/* choice distractors, the coverage map, the reveal table — was written     */
/* against a flat 0..5. The imperative does not: French commands only tu,   */
/* nous and vous; German adds Sie but has no first-person singular and no   */
/* third person at all. You cannot order someone to "he speaks".            */
/*                                                                          */
/* Rather than let each consumer invent its own guard, the fact lives on    */
/* the tense and everything asks. `conjugate` still returns six slots so    */
/* `forms[personIdx]` keeps working everywhere; the persons a tense does    */
/* not have hold `null`, which reads as absent rather than as an empty      */
/* string that might be a bug.                                              */
/* ---------------------------------------------------------------------- */
export const ALL_PERSONS = [0, 1, 2, 3, 4, 5];

export function personsFor(lang, tenseKey) {
  const t = (lang === "fr" ? FR_TENSES : DE_TENSES).find((x) => x.key === tenseKey);
  return t?.persons || ALL_PERSONS;
}

/** Does this verb have this tense at all? Modals have no imperative. */
export function hasTense(lang, verb, tenseKey) {
  return !(verb?.noImper && (tenseKey === "imperativ" || tenseKey === "imperatif"));
}

/** A person index this tense can actually be drilled at, chosen at random. */
export function randomPerson(lang, tenseKey) {
  const ps = personsFor(lang, tenseKey);
  return ps[Math.floor(Math.random() * ps.length)];
}

export const FR_AUX = {
  avoir: ["ai", "as", "a", "avons", "avez", "ont"],
  être: ["suis", "es", "est", "sommes", "êtes", "sont"],
};
export const DE_AUX = {
  haben: ["habe", "hast", "hat", "haben", "habt", "haben"],
  sein: ["bin", "bist", "ist", "sind", "seid", "sind"],
};
export const DE_WERDEN = ["werde", "wirst", "wird", "werden", "werdet", "werden"];

/**
 * Returns the six conjugated forms for a verb in a given tense.
 *
 * Two things beyond plain stem+ending, both of which produce outright wrong
 * German or French if skipped:
 *
 *  - **Separable prefixes.** `aufzeigen` is "ich zeige auf", not "ich aufzeige",
 *    and its participle is "aufgezeigt", not "geaufzeigt". Verbs carry
 *    `sep: "auf"` when the prefix detaches; the finite tenses move it to the
 *    end, and the infinitive-based ones leave it attached.
 *  - **Fixed remainders.** `in Betracht ziehen` and `mettre en évidence`
 *    inflect only the head verb. Verbs carry `pre`/`post` for the invariant
 *    parts, which are reattached around the conjugated form.
 */
/* Reflexive pronouns, by person index. */
const FR_REFL = ["me", "te", "se", "nous", "vous", "se"];
const DE_REFL = ["mich", "dich", "sich", "uns", "euch", "sich"];

/** "me" + "appuie" -> "m'appuie"; "nous" + "appuyons" stays separate. */
function frElide(pron, form) {
  if (/^(me|te|se)$/.test(pron) && /^[aeiouâêîôûéèùh]/i.test(form)) return pron.slice(0, 1) + "'" + form;
  return `${pron} ${form}`;
}

/**
 * The finite form the learner is asked to produce.
 *
 * A separable prefix belongs to the answer — "zeige auf" is the verb — so it is
 * appended in the finite tenses and left attached inside `pp`/`inf` for the
 * compound ones. A fixed noun phrase (`in Betracht ziehen`) does *not*: only
 * the head verb inflects, so it stays out of the answer and is shown as context
 * around the blank instead. See `verbContext`.
 */
function finite(lang, verb, parts, personIdx, { attached = false } = {}) {
  const [head, tail] = Array.isArray(parts) ? parts : [parts, ""];
  const bits = [];

  if (lang === "fr") {
    // "je m'appuie", "je me suis appuyé" — the pronoun precedes the whole verb.
    bits.push(verb.refl ? frElide(FR_REFL[personIdx], head) : head);
    if (tail) bits.push(tail);
  } else {
    // German order: finite verb, then the reflexive, then everything else,
    // with a separable prefix last. "ich setze mich auseinander",
    // "ich habe mich auseinandergesetzt".
    bits.push(head);
    if (verb.refl) bits.push(DE_REFL[personIdx]);
    if (tail) bits.push(tail);
    if (verb.sep && !attached) bits.push(verb.sep);
  }
  return bits.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * The présent du subjonctif, from the third-person plural.
 *
 * "que je parle" and "que nous parlions" share one stem, and for regular verbs
 * that stem is the `ils` form with `-ent` removed: parlent → parl-, finissent
 * → finiss-, vendent → vend-. Verbs where that fails carry the six forms in
 * `subj` instead; there are about a dozen, and all of them are irregular in the
 * present too.
 */
function frSubjonctif(verb, i) {
  if (verb.subj) return verb.subj[i];
  const stem = verb.pres[5].replace(/ent$/, "");
  return stem + FR_SUBJ_ENDINGS[i];
}

/**
 * Konjunktiv II, from the Präteritum.
 *
 * A strong verb umlauts its past stem — kam → käme, fuhr → führe, war → wäre.
 * A weak one does not change at all, which is why German so often reaches for
 * "würde + infinitive" instead: machte is both "made" and "would make".
 *
 * Weak verbs are recognised by their `-te` ending. That correctly leaves
 * machte alone, and correctly leaves wollte and sollte alone too — the two
 * modals that do not umlaut. The modals that *do* (könnte, müsste, dürfte,
 * möchte) carry an explicit `k2`, since the rule cannot tell them apart.
 */
/* The mixed verbs: a weak `-te` past, but a vowel change in Konjunktiv II.
 * They are the one class the `-te` test gets wrong, and there are few enough to
 * name. Keyed by the stem so prefixed forms inherit — vorbringen → vorbrächte. */
const DE_MIXED_K2 = {
  haben: "hätte", bringen: "brächte", denken: "dächte", wissen: "wüsste",
  nennen: "nennte", kennen: "kennte", rennen: "rennte", senden: "sendete",
  wenden: "wendete",
};
const DE_PREFIX = /^(be|ver|er|ent|zer|miss|über|unter|um|an|auf|aus|ein|mit|nach|vor|zu|ab|bei|wider|voraus|heraus|hervor)/;

function deKonjunktiv2(verb, i) {
  if (verb.k2) return verb.k2[i];
  const past = verb.past[0];

  // Mixed verbs first: they look weak and are not.
  const stemInf = verb.inf.replace(DE_PREFIX, "");
  const mixed = DE_MIXED_K2[stemInf];
  if (mixed) {
    const prefix = verb.inf.slice(0, verb.inf.length - stemInf.length);
    return prefix + mixed.replace(/e$/, "") + DE_K2_ENDINGS[i];
  }

  const weak = /te$/.test(past);
  const base = weak ? past : past.replace(/[aou]/, (v) => ({ a: "ä", o: "ö", u: "ü" }[v]));
  const stem = base.replace(/e$/, "");
  return stem + DE_K2_ENDINGS[i];
}

/**
 * The French imperative: three persons, built from the present.
 *
 * tu / nous / vous, and nothing else — there is no way to order "he speaks".
 * The nous and vous forms are the present forms unchanged; the tu form is the
 * present tu form with one wrinkle: -er verbs (and aller) drop the final -s,
 * because "parles" would be answering a question rather than giving an order.
 * finis and vends keep theirs.
 *
 * Four verbs take the subjunctive stem instead and carry `imper` explicitly:
 * être, avoir, savoir, vouloir. They are the ones a learner meets first —
 * "sois sage", "aie confiance", "veuillez patienter".
 */
function frImperatif(verb, i) {
  if (verb.imper) return verb.imper[[1, 3, 4].indexOf(i)] ?? null;
  if (i === 3) return verb.pres[3];
  if (i === 4) return verb.pres[4];
  if (i !== 1) return null;
  const tu = verb.pres[1];
  const dropsS = /es$/.test(tu) || /er$/.test(verb.inf) || verb.inf === "aller";
  return dropsS ? tu.replace(/s$/, "") : tu;
}

/* French puts the reflexive pronoun *after* an affirmative command and
 * hyphenates it, and `te` becomes the stressed `toi`: lève-toi, levons-nous.
 * Everywhere else in the language it precedes, which is why this cannot go
 * through `finite`. */
const FR_IMPER_REFL = { 1: "toi", 3: "nous", 4: "vous" };

/**
 * The German imperative: du, wir, ihr, Sie.
 *
 * The du form is where the work is. It is the present du form with its ending
 * removed — but only the e→i/ie stem change survives into the imperative, not
 * the a→ä umlaut. So sprichst gives "sprich" while fährst gives "fahr", not
 * "fähr". The test is length: a pure vowel swap leaves the stem the same size,
 * and anything that shortened it (hast → "ha") means the present form is not a
 * safe base and the infinitive stem is used instead.
 *
 * wir and Sie are the infinitive with the pronoun after it — "gehen wir",
 * "gehen Sie" — which is also why they read as suggestions rather than orders.
 */
const DE_UMLAUT_BACK = { "ä": "a", "ö": "o", "ü": "u" };

function deImperativDu(verb) {
  if (verb.imper) return verb.imper[0];
  /* `pres` never carries a separable prefix, so the stem it is compared
   * against must not either: aufstehen is measured as "steh". */
  const bare = verb.sep ? verb.inf.slice(verb.sep.length) : verb.inf;
  const stem = bare.replace(/e?n$/, "");
  const du = verb.pres[1];
  /* A stem ending in a sibilant already absorbed the s of -st, so only the t
   * is an ending: liest → lies, isst → iss. */
  let cand = /[sßzx]$/.test(stem) ? du.replace(/t$/, "") : du.replace(/e?st$/, "");
  /* A shorter result means the present form was not a safe base at all —
   * hast gives "ha", wirst gives "wir". Fall back to the infinitive stem. */
  if (cand.length < stem.length) cand = stem;
  else if (cand.replace(/[äöü]/, (v) => DE_UMLAUT_BACK[v]) === stem) cand = stem;  // fährst → fahr, not fähr
  /* e→ie lengthens rather than swaps — siehst gives "sieh", which is right,
   * so anything longer than the stem is kept as it stands. */

  /* -e is required where the stem could not otherwise be pronounced, but a
   * vowel-changing strong verb never takes it: arbeite, öffne — yet sprich.
   * Sonorants before the m/n do not count: komm and lern need no -e. */
  const changed = cand !== stem;
  if (!changed && /(?:[dt]|[^aeiouäöümnrlh][mn]|ig)$/.test(cand)) return cand + "e";
  return cand;
}

function deImperativ(verb, i) {
  if (i === 1) return deImperativDu(verb);
  if (i === 4) return verb.imper ? verb.imper[1] : verb.pres[4];
  /* wir and Sie: the infinitive plus the pronoun. The separable prefix comes
   * off here as it does in every finite tense, and `finite` puts it back at
   * the end of the clause — "stehen wir auf". */
  if (i === 3 || i === 5) {
    const base = verb.imper ? verb.imper[2] : verb.sep ? verb.inf.slice(verb.sep.length) : verb.inf;
    return `${base} ${i === 3 ? "wir" : "Sie"}`;
  }
  return null;
}

export function conjugate(lang, verb, tenseKey) {
  const six = (fn) => [0, 1, 2, 3, 4, 5].map(fn);
  if (lang === "fr") {
    switch (tenseKey) {
      case "present": return six((i) => finite(lang, verb, verb.pres[i], i));
      /* `impf` is normally a stem, but -ger and -cer verbs keep their soft
       * consonant only before a and o: mangeais yet mangions, commençais yet
       * commencions. One stem cannot say that, so those verbs give six forms. */
      case "imparfait": return six((i) => finite(lang, verb, Array.isArray(verb.impf) ? verb.impf[i] : verb.impf + FR_IMPF_ENDINGS[i], i));
      case "futur": return six((i) => finite(lang, verb, verb.fut + FR_FUT_ENDINGS[i], i));
      case "passe": return six((i) => finite(lang, verb, [FR_AUX[verb.aux][i], verb.pp], i, { attached: true }));
      // The conditional is the future stem with imperfect endings — nothing new to store.
      case "conditionnel": return six((i) => finite(lang, verb, verb.fut + FR_IMPF_ENDINGS[i], i));
      case "subjonctif": return six((i) => finite(lang, verb, frSubjonctif(verb, i), i));
      case "imperatif": return six((i) => {
        const form = frImperatif(verb, i);
        if (form == null) return null;
        /* The pronoun trails the verb here, so `finite`'s leading-pronoun
         * assembly is bypassed for reflexives and only its tail logic applies. */
        const head = verb.refl ? `${form}-${FR_IMPER_REFL[i]}` : form;
        return [verb.pre, head, verb.post].filter(Boolean).join(" ");
      });
      default: return six((i) => finite(lang, verb, verb.pres[i], i));
    }
  }
  switch (tenseKey) {
    case "praesens": return six((i) => finite(lang, verb, verb.pres[i], i));
    case "praeteritum": return six((i) => finite(lang, verb, verb.past[i], i));
    // `pp` and `inf` already carry the prefix: aufgezeigt, aufzeigen.
    case "perfekt": return six((i) => finite(lang, verb, [DE_AUX[verb.aux][i], verb.pp], i, { attached: true }));
    case "futur": return six((i) => finite(lang, verb, [DE_WERDEN[i], verb.inf], i, { attached: true }));
    case "konjunktiv2": return six((i) => finite(lang, verb, deKonjunktiv2(verb, i), i));
    case "imperativ": return six((i) => {
      /* The modals have no imperative at all. Deriving one anyway would teach
       * "kann!", which is not something a German speaker can say. */
      if (verb.noImper) return null;
      const form = deImperativ(verb, i);
      if (form == null) return null;
      /* The prefix is detached in every one of these forms, so `finite` sends
       * it to the end of the clause for all four persons. */
      return finite(lang, verb, form, i);
    });
    default: return six((i) => finite(lang, verb, verb.pres[i], i));
  }
}

/**
 * The invariant words shown around the blank for a multi-word verb.
 *
 * `in Betracht ziehen` prompts as "ich ___ in Betracht" — the learner produces
 * "ziehe", which is the only part that inflects. Returning it as context rather
 * than folding it into the answer avoids inventing a word order for a phrase
 * that has no object to place.
 */
export function verbContext(verb) {
  return { before: verb.pre || "", after: verb.post || "" };
}

/**
 * A short complement to put after the conjugated form, so the drill asks for a
 * form inside a sentence rather than in a vacuum.
 *
 * Every phrase is chosen to hold across person AND tense — "à la maison" is
 * equally good after `je suis`, `tu étais` and `nous serons` — because the
 * drill picks both at random and a frame that only worked in the present would
 * be wrong more often than right.
 */
export const VERB_FRAME = {
  fr: {
    être: "à la maison", avoir: "un frère", aller: "au marché", faire: "la cuisine",
    parler: "avec le professeur", finir: "le travail", vendre: "la voiture",
    pouvoir: "attendre ici", vouloir: "un café", devoir: "partir tôt",
    venir: "avec nous", prendre: "le train", voir: "la mer", savoir: "la réponse",
    dire: "la vérité", aimer: "cette ville", penser: "à sa famille",
    aider: "les enfants", arriver: "en retard", manger: "du pain",
    commencer: "le livre", acheter: "du fromage", payer: "l'addition",
    boire: "de l'eau", partir: "à midi", attendre: "le bus",
    comprendre: "la question", apprendre: "l'espagnol", lever: "la main",
    coucher: "les enfants",
  },
  de: {
    sein: "zu Hause", haben: "einen Bruder", werden: "müde", gehen: "nach Hause",
    machen: "die Arbeit", sprechen: "mit dem Lehrer", kommen: "aus Berlin",
    sehen: "das Meer", geben: "das Buch", nehmen: "den Zug",
    "können": "gut schwimmen", "müssen": "früh gehen", wollen: "einen Kaffee",
    fahren: "nach München", essen: "das Brot", trinken: "das Wasser",
    "mögen": "diese Stadt", kaufen: "den Käse", verkaufen: "das Auto",
    bezahlen: "die Rechnung", lernen: "Spanisch", warten: "auf den Bus",
    beenden: "die Arbeit", verstehen: "die Frage", helfen: "den Kindern",
    denken: "an die Familie", wissen: "die Antwort", aufstehen: "früh",
    ankommen: "spät", abreisen: "am Montag", anfangen: "um acht",
  },
};

/* Tenses whose form is an auxiliary plus a second piece — "habe gegessen",
 * "werde essen". German requires the complement to sit *inside* that bracket,
 * so it cannot simply follow the form the way it does in French, and these
 * tenses are given no frame rather than a wrong one. */
const DE_BRACKETED = new Set(["perfekt", "futur"]);

/** The complement to show after the blank, or "" when there is none to show. */
export function verbFrame(lang, verb, tenseKey) {
  if (lang === "de" && DE_BRACKETED.has(tenseKey)) return "";
  return VERB_FRAME[lang]?.[verb?.inf] || "";
}
/* ---------------------------------------------------------------------- */
/* English rendering of a conjugated form                                   */
/*                                                                          */
/* Being told the answer is "sie sind" is no help if you don't know what    */
/* that means. These build the English so every drill can say so.           */
/* ---------------------------------------------------------------------- */

/** English subject pronouns, by the same person index as FR_/DE_PRONOUNS. */
const EN_SUBJECTS = {
  fr: ["I", "you", "he/she", "we", "you (pl.)", "they"],
  de: ["I", "you", "he/she", "we", "you (pl.)", "they / you (formal)"],
};

/** The bare English verb from a gloss like "to speak, to talk" -> "speak". */
function enBase(en) {
  return String(en || "").split(/[,/;(]/)[0].trim().replace(/^to\s+/i, "").trim();
}

/* An English gloss is often a phrase, not a word — "have to", "be able to",
 * "give rise to", "prove to be". Only its first word inflects; everything after
 * it is carried along untouched. Inflecting the whole phrase is what produced
 * "he/she have toes" and "he/she prove to bes". */
function splitHead(base) {
  const i = base.indexOf(" ");
  return i < 0 ? [base, ""] : [base.slice(0, i), base.slice(i)];
}

/* The four irregular heads that actually occur across the verb tables. Every
 * other verb is regular in the persons rendered here. */
/* Irregular English verbs the generator may reach for. Anything missing here
 * gets the regular -ed, which is how "we have maked the bed" happened once an
 * object was allowed to choose its own English verb. */
const EN_IRREGULAR = {
  be: { third: "is", past: "was", pp: "been" },
  have: { third: "has", past: "had", pp: "had" },
  do: { third: "does", past: "did", pp: "done" },
  go: { third: "goes", past: "went", pp: "gone" },
  make: { third: "makes", past: "made", pp: "made" },
  take: { third: "takes", past: "took", pp: "taken" },
  give: { third: "gives", past: "gave", pp: "given" },
  hold: { third: "holds", past: "held", pp: "held" },
  eat: { third: "eats", past: "ate", pp: "eaten" },
  see: { third: "sees", past: "saw", pp: "seen" },
  sell: { third: "sells", past: "sold", pp: "sold" },
  pack: { third: "packs", past: "packed", pp: "packed" },
};

/** he/she form: watch, watches; carry, carries; go, goes; have, has. */
function enThird(base) {
  const [head, tail] = splitHead(base);
  const irr = EN_IRREGULAR[head.toLowerCase()];
  if (irr) return irr.third + tail;
  if (/(?:s|x|z|ch|sh|o)$/i.test(head)) return head + "es" + tail;
  if (/[^aeiou]y$/i.test(head)) return head.slice(0, -1) + "ies" + tail;
  return head + "s" + tail;
}
function enPastOf(verb) {
  if (verb.enPast) return verb.enPast;
  const [head, tail] = splitHead(enBase(verb.en));
  const irr = EN_IRREGULAR[head.toLowerCase()];
  if (irr) return irr.past + tail;
  if (/e$/i.test(head)) return head + "d" + tail;
  if (/[^aeiou]y$/i.test(head)) return head.slice(0, -1) + "ied" + tail;
  return head + "ed" + tail;
}
function enPPOf(verb) {
  if (verb.enPP) return verb.enPP;
  const [head, tail] = splitHead(enBase(verb.en));
  const irr = EN_IRREGULAR[head.toLowerCase()];
  return irr ? irr.pp + tail : enPastOf(verb);
}
/** speak -> speaking, make -> making, sit -> sitting. */
function enGerund(base) {
  const [head, tail] = splitHead(base);
  if (/[^aeiou]e$/i.test(head)) return head.slice(0, -1) + "ing" + tail;
  if (/^[^aeiou]*[aeiou][bdgmnprt]$/i.test(head)) return head + head.slice(-1) + "ing" + tail;
  return head + "ing" + tail;
}

/**
 * English for one conjugated form, e.g. ("de", verb sein, "praesens", 5)
 * -> "they / you (formal) are".
 *
 * "to be" is irregular enough in English to be worth special-casing; every
 * other verb is regular in the persons we render.
 */
export function conjugateEnglish(lang, verb, tenseKey, personIdx, subjectOverride) {
  /* The drills want the ambiguous "he/she" that matches the pronoun tile; a
   * generated sentence needs to commit to one, so callers may pass their own. */
  const subj = subjectOverride || EN_SUBJECTS[lang][personIdx];
  const base = enBase(verb.en);
  /* "be able to" is a form of "be" just as much as "be" is, so the test is on
   * the head word — otherwise it renders as the bare "I be able to". */
  const [head, tail] = splitHead(base);
  const isBe = head === "be";
  const third = personIdx === 2;
  const singularFirst = personIdx === 0;

  const present = isBe
    ? (singularFirst ? "am" : third ? "is" : "are") + tail
    : third ? enThird(base) : base;
  const past = isBe ? (singularFirst || third ? "was" : "were") + tail : enPastOf(verb);

  switch (tenseKey) {
    case "present":
    case "praesens":
      return `${subj} ${present}`;
    case "imparfait": {
      // The imparfait is habitual or ongoing, which English marks with "was ~ing"
      // — except for "to be" itself, where "I was being" means something else.
      const wasWere = singularFirst || third ? "was" : "were";
      return isBe ? `${subj} ${wasWere}${tail}` : `${subj} ${wasWere} ${enGerund(base)}`;
    }
    case "praeteritum":
      return `${subj} ${past}`;
    case "passe":
    case "perfekt":
      return `${subj} ${third ? "has" : "have"} ${enPPOf(verb)}`;
    case "futur":
      return `${subj} will ${base}`;
    case "conditionnel":
    case "konjunktiv2":
      return `${subj} would ${base}`;
    /* English lost its subjunctive almost everywhere, so there is no distinct
     * form to show. Naming the trigger is more use than a bare "I speak". */
    case "subjonctif":
      return `(that) ${subj} ${present}`;
    /* The imperative has no subject in English, so rendering it through
     * EN_SUBJECTS would give "you are" for "sois" — a statement, not the order
     * the form actually is. nous/wir is the one person with its own wording. */
    case "imperatif":
    case "imperativ":
      return personIdx === 3 ? `let's ${base}!` : `${base}!`;
    default:
      return `${subj} ${present}`;
  }
}

/** Accepted spellings for a form — covers French past-participle agreement. */
export function conjugationAlternates(lang, verb, tenseKey, form) {
  const out = [form];
  if (lang === "fr" && tenseKey === "passe" && verb.aux === "être") {
    out.push(form + "e", form + "s", form + "es");
  }
  return out;
}
/** French elision for display only: "je ai" is shown as "j'ai". */
export function displayPronoun(lang, idx, form) {
  if (lang !== "fr" || idx !== 0) return (lang === "fr" ? FR_PRONOUNS : DE_PRONOUNS)[idx] + " ";
  return /^[aeiouâêîôûéèh]/i.test(form) ? "j'" : "je ";
}

/* Moods with no subject pronoun. "Sois!" is the imperative; "tu sois" is the
 * subjunctive and means something else entirely, so speaking the pronoun here
 * would be teaching a different form than the one on screen. */
const PRONOUNLESS = new Set(["imperatif", "imperativ"]);

/**
 * The form as you would actually say it — "je suis", "j'ai", "il est".
 *
 * The table writes pronouns for reading, not for speech: `il/elle` and
 * `er/sie/es` list the persons that share a form, and read aloud they become
 * "il slash elle". Only the first is spoken. Elision is already handled by
 * displayPronoun, which returns "j'" without a trailing space precisely so it
 * can be joined straight onto the verb.
 */
export function spokenForm(lang, idx, form, tenseKey) {
  if (!form) return "";
  if (PRONOUNLESS.has(tenseKey)) return form;
  const p = displayPronoun(lang, idx, form);
  const first = p.trimEnd().split("/")[0];
  return first.endsWith("'") ? `${first}${form}` : `${first} ${form}`;
}

/* ---------------------------------------------------------------------- */
/* Grammar notes                                                           */
/* ---------------------------------------------------------------------- */
/* Notes come in two kinds, and the distinction is the point.
 *
 * `grammar` teaches form — how the language is built. `culture` teaches use:
 * when a form is appropriate, what it signals about you, and where a word has
 * no English equivalent because the thing it names is not an English thing.
 * The deck was entirely the first kind, which is the difference between
 * reading a language and being competent in it. */
export const NOTE_KINDS = {
  grammar: { label: "Grammar", blurb: "How the language is put together." },
  culture: { label: "Usage & culture", blurb: "When to say it, and what saying it signals." },
};

export const GRAMMAR = {
  fr: [
    { title: "Passé composé vs. Imparfait", level: "B1",
      body: [
        "French splits the past into two tenses that English collapses into one. The passé composé is for completed events that move the story forward — things that happened once, at a point in time.",
        "The imparfait is for background: ongoing states, habits, descriptions, and things that were in progress when something else interrupted.",
        "A useful test: if you could say 'used to' or 'was ~ing' in English, you almost certainly want the imparfait.",
      ],
      examples: [
        { t: "Hier, j'ai vu un film.", e: "Yesterday I saw a film. (one completed event)" },
        { t: "Quand j'étais jeune, je voyais souvent ce film.", e: "When I was young, I often watched that film. (habit + state)" },
        { t: "Je lisais quand le téléphone a sonné.", e: "I was reading when the phone rang. (background interrupted by event)" },
      ] },
    { title: "Adjective agreement and placement", level: "A2",
      body: [
        "French adjectives agree with the noun in gender and number: add -e for feminine, -s for plural, -es for both.",
        "Most adjectives follow the noun, unlike English. A small set of very common ones come before it — roughly those covering beauty, age, goodness, and size (beau, joli, jeune, vieux, bon, mauvais, grand, petit, gros, nouveau).",
      ],
      examples: [
        { t: "une voiture rouge", e: "a red car (colour follows)" },
        { t: "une petite maison blanche", e: "a small white house (size before, colour after)" },
        { t: "des livres intéressants", e: "interesting books (plural agreement)" },
      ] },
    { title: "Negation: ne … pas and friends", level: "A1",
      body: [
        "Negation wraps around the conjugated verb: ne before it, pas after it. In compound tenses the wrap goes around the auxiliary, not the participle.",
        "Swap pas for another word to change the meaning: jamais (never), rien (nothing), personne (nobody), plus (no longer), encore (not yet).",
        "In casual speech the ne is very often dropped — you'll hear 'je sais pas' — but keep it in writing.",
      ],
      examples: [
        { t: "Je ne parle pas allemand.", e: "I don't speak German." },
        { t: "Il n'a pas mangé.", e: "He hasn't eaten. (wraps the auxiliary)" },
        { t: "Elle ne dit jamais rien.", e: "She never says anything." },
      ] },
    { title: "Partitive articles: du, de la, des", level: "A2",
      body: [
        "When you mean 'some' of an uncountable thing, French requires an article where English uses none. You cannot say 'je mange pain'.",
        "Use du before masculine, de la before feminine, de l' before a vowel, and des for plurals.",
        "After a negative, all of these collapse to plain de.",
      ],
      examples: [
        { t: "Je bois du café.", e: "I drink coffee." },
        { t: "Elle mange de la viande.", e: "She eats meat." },
        { t: "Je ne bois pas de café.", e: "I don't drink coffee. (negative → de)" },
      ] },

    /* ---- usage and culture ---- */
    { title: "tu and vous: the choice you cannot avoid", level: "A1", kind: "culture",
      body: [
        "Every time you address someone in French you are choosing how close you are to them. There is no neutral option — vous is not politer tu, it is a different relationship.",
        "Default to vous with anyone you have just met, anyone serving you, anyone older, and everyone at work until told otherwise. Children, family, close friends, students to each other, and most people under about thirty in informal settings take tu.",
        "The switch is a small social event with its own verb: on se tutoie? — shall we use tu? It is normally offered by the older or more senior person, and accepting is a mild intimacy. Switching to tu uninvited reads as presumptuous; staying on vous after being invited to tu reads as cold.",
        "Getting this wrong is the single most visible marker of a foreign speaker — more than any accent, because it is a social judgement rather than a pronunciation.",
      ],
      examples: [
        { t: "Excusez-moi, vous avez l'heure ?", e: "Excuse me, do you have the time? (a stranger — vous)" },
        { t: "On peut se tutoyer, non ?", e: "We can use tu, can't we? (offering the switch)" },
        { t: "Tu viens ce soir ?", e: "Are you coming tonight? (a friend — tu)" },
      ] },

    { title: "Politeness lives in the verb, not in 'please'", level: "A2", kind: "culture",
      body: [
        "English softens a request with extra words: could you possibly, would you mind, if it's not too much trouble. French softens it by changing the tense of the verb.",
        "Je veux un café is not rude in a textbook sense — it is simply what a small child says. Je voudrais is the adult form, and the difference is the conditional.",
        "Bonjour is not optional. Walking into a shop, a bakery or a doctor's waiting room and starting with your request rather than a greeting is read as genuinely rude in a way that has no English equivalent. Say bonjour first, every time, to everyone.",
      ],
      examples: [
        { t: "Bonjour, je voudrais un café, s'il vous plaît.", e: "Hello, I'd like a coffee, please. (the complete, normal form)" },
        { t: "Pourriez-vous m'aider ?", e: "Could you help me? (conditional = the polite register)" },
        { t: "Je veux un café.", e: "I want a coffee. (grammatical, and startlingly blunt)" },
      ] },

    { title: "Words that carry a country inside them", level: "B2", kind: "culture",
      body: [
        "Some words cannot be translated because the thing they name does not exist in the same shape in English-speaking countries. Learning the gloss without the context leaves you able to say the word and unable to use it.",
        "laïcité is glossed as 'secularism', which is badly misleading. It is a specific constitutional principle — the state's neutrality in religion, and its refusal to recognise any faith — with a founding date (1905) and a permanent political argument attached. It is not the same as the American separation of church and state, and calling it that in French will start a conversation you did not intend.",
        "la République is not merely the current form of government; it is invoked as a set of values, the way 'the Constitution' is in the United States. Les valeurs de la République is a phrase with real weight.",
        "le terroir has no English word at all: the claim that soil, climate and local practice are inseparable from what a food tastes like. It underpins the entire appellation system.",
      ],
      examples: [
        { t: "La laïcité n'est pas l'hostilité à la religion.", e: "Laïcité is not hostility to religion. (a sentence you will meet constantly)" },
        { t: "C'est un produit du terroir.", e: "It's a local product — with everything that implies about place." },
        { t: "les valeurs de la République", e: "the values of the Republic (a fixed, weighty phrase)" },
      ] },
  ],
  de: [
    { title: "The four cases", level: "A2",
      body: [
        "German marks a noun's job in the sentence by changing the article rather than the word order. Nominative is the subject, accusative the direct object, dative the indirect object, genitive possession.",
        "Only the masculine singular changes visibly in the accusative (der → den), which is why that one trips people up least often — and why the dative feels like a bigger leap.",
        "Many prepositions permanently govern a case: mit, nach, aus, bei, seit, von, zu always take dative; für, ohne, gegen, um, durch always take accusative.",
      ],
      examples: [
        { t: "Der Mann sieht den Hund.", e: "The man sees the dog. (nom → acc)" },
        { t: "Ich gebe dem Mann das Buch.", e: "I give the man the book. (dative recipient)" },
        { t: "Ich fahre mit dem Auto.", e: "I'm travelling by car. (mit → dative)" },
      ] },
    { title: "Word order: verb second, verb last", level: "A2",
      body: [
        "In a main clause the conjugated verb sits in second position — not necessarily the second word, but the second element. If you front something else for emphasis, the subject moves behind the verb.",
        "In a subordinate clause introduced by weil, dass, wenn, obwohl and friends, the conjugated verb goes all the way to the end.",
      ],
      examples: [
        { t: "Ich gehe heute ins Kino.", e: "I'm going to the cinema today." },
        { t: "Heute gehe ich ins Kino.", e: "Today I'm going to the cinema. (verb still 2nd, subject moves)" },
        { t: "Ich bleibe zu Hause, weil ich krank bin.", e: "I'm staying home because I am sick. (verb last)" },
      ] },
    { title: "Separable verbs", level: "A2",
      body: [
        "Many German verbs carry a prefix that detaches in a main clause and flies to the end of the sentence. The dictionary form looks like one word; the sentence splits it.",
        "The prefix stays attached in subordinate clauses and in the infinitive.",
        "In the Perfekt, the ge- of the participle wedges between the prefix and the stem.",
      ],
      examples: [
        { t: "Ich stehe um sieben Uhr auf.", e: "I get up at seven. (aufstehen splits)" },
        { t: "Ich bin um sieben aufgestanden.", e: "I got up at seven. (ge- inside)" },
        { t: "…weil ich früh aufstehe.", e: "…because I get up early. (stays joined)" },
      ] },
    { title: "Adjective endings", level: "B1",
      body: [
        "German adjective endings depend on three things at once: the gender/case of the noun, and whether the article before it already shows that information.",
        "The rule of thumb: if the article already marks the case clearly (der, die, das), the adjective takes a weak ending — mostly -e or -en. If there's no article, the adjective has to do the marking itself and takes strong endings that mirror the article.",
        "This is the single most mechanical part of German grammar. It rewards drilling more than understanding.",
      ],
      examples: [
        { t: "der große Mann", e: "the tall man (article marks it → weak -e)" },
        { t: "ein großer Mann", e: "a tall man (ein doesn't mark it → adjective takes -er)" },
        { t: "mit dem großen Mann", e: "with the tall man (dative → -en)" },
      ] },
    { title: "Modal verbs take the infinitive to the end", level: "A1",
      body: [
        "können, müssen, wollen, dürfen, sollen and mögen conjugate normally in second position, and push the main verb to the end of the clause in its plain infinitive form.",
        "Note that the ich and er/sie/es forms of a modal are identical — kann, muss, will — which is unusual in German and worth memorising directly.",
      ],
      examples: [
        { t: "Ich kann Deutsch sprechen.", e: "I can speak German." },
        { t: "Wir müssen morgen früh aufstehen.", e: "We have to get up early tomorrow." },
        { t: "Er will nach Berlin fahren.", e: "He wants to travel to Berlin." },
      ] },

    /* ---- usage and culture ---- */
    { title: "du and Sie: the workplace rule that keeps changing", level: "A1", kind: "culture",
      body: [
        "Sie is the default with any adult you have not been invited to address as du: strangers, officials, shopkeepers, and — traditionally — colleagues, including ones you have sat beside for a decade.",
        "That last part is genuinely shifting. Much of the tech industry, most startups, and many younger teams are du from the first day. Older firms, banks, public administration and most of Austria and Switzerland are not. When in doubt, use Sie and wait: the more senior person offers the switch, and refusing an offered du is a real snub.",
        "The offer has a name — das Du anbieten — and often a small ritual attached. Once given it cannot be taken back.",
        "Titles matter more than in English. Herr Doktor Weber is not a joke in a formal setting, and the first email to someone you have not met opens Sehr geehrte Frau …, never Hallo.",
      ],
      examples: [
        { t: "Wollen wir uns duzen?", e: "Shall we use du? (offering the switch)" },
        { t: "Könnten Sie mir bitte helfen?", e: "Could you help me, please? (a stranger — Sie)" },
        { t: "Sehr geehrte Frau Weber,", e: "Dear Ms Weber, (how a first letter or email opens — anything less is too casual)" },
      ] },

    { title: "Directness is not rudeness", level: "B1", kind: "culture",
      body: [
        "German speakers routinely say things English speakers would hedge, and the hedging English uses is often heard as evasive rather than polite. Das ist falsch — that's wrong — is a normal contribution to a meeting, not an attack.",
        "The reverse trips people up more. English 'that's interesting' or 'we should definitely look into that' is understood literally, so a soft English no is heard as a yes and then acted on.",
        "Doch is the word English lacks: it contradicts a negative statement. — Du kommst nicht mit. — Doch! means yes, I am coming. There is no one-word English equivalent, which is why it takes a while to start using it.",
        "Small talk is thinner and later. Going straight to the subject is not coldness; the warmth arrives once the business is done.",
      ],
      examples: [
        { t: "Das sehe ich anders.", e: "I see that differently. (normal disagreement, not a confrontation)" },
        { t: "— Das stimmt nicht. — Doch!", e: "— That's not right. — Yes it is! (doch contradicts the negative)" },
        { t: "Können wir zum Thema kommen?", e: "Can we get to the point? (a reasonable thing to say)" },
      ] },

    { title: "Words with no English equivalent", level: "B2", kind: "culture",
      body: [
        "Some German words are famous for being untranslatable, and most of the famous ones are less useful than the unglamorous ones you will actually meet.",
        "Feierabend is not 'the end of the working day' — it is the state of being off, and it is defended. Schönen Feierabend! is a normal goodbye, and calling a colleague after theirs is a small transgression.",
        "Ordnung is not tidiness. It is the sense that things are in their correct arrangement, and it extends to procedures, paperwork and how a system ought to work. Das geht in Ordnung means that's fine — literally, that will proceed in order.",
        "Vergangenheitsbewältigung — coming to terms with the past — names a specific national project, not a general idea. No other language needed the word.",
        "Gemütlichkeit is warmth-and-ease as a property of a place or an evening; it cannot be scheduled and cannot be bought.",
      ],
      examples: [
        { t: "Schönen Feierabend!", e: "Have a good evening off! (said as you leave work)" },
        { t: "Das geht in Ordnung.", e: "That's fine. (literally: that will proceed in order)" },
        { t: "Hier ist es sehr gemütlich.", e: "It's very cosy here — warm, easy, unhurried." },
      ] },
  ],
};
