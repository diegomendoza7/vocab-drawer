/* Etymology: the roots under the decks, and the sound laws that connect them.
 *
 * The point of this section is not trivia. An English speaker learning French
 * and German already knows thousands of words in both — they just do not look
 * like it, because each language ran the shared inheritance through a
 * different set of regular sound changes. Learning the *changes* converts a
 * vocabulary list into a generator: once "Latin p ↔ Germanic f" is in place,
 * père/Vater/father stops being three words and becomes one.
 *
 * So the content here is in two halves:
 *   LAYERS + roots  — where a word came from, and where the languages parted.
 *   LAWS            — the regular change at each parting, stated as a rule you
 *                     can run forwards on a word you have never seen.
 *
 * Every claim is checked against English Wiktionary by scripts/check-etymology.mjs,
 * which runs in `npm run check`. Wiktionary is the source because it states
 * ancestry as machine-readable templates ({{inh|de|goh|fater}}), so a claim
 * here can be tested rather than trusted.
 */

/* The rungs of descent, oldest first. `short` is what the tree draws.
 *
 * Two chains hang off Proto-Indo-European and they are the whole story: one
 * runs through Italic to Latin and on to French, the other through Germanic to
 * English and German. Everything the app teaches is a comparison across that
 * fork. */
export const LAYERS = {
  pie: { short: "PIE", label: "Proto-Indo-European", era: "spoken before ~3500 BCE", branch: "root",
    note: "Reconstructed, never written down. That is what the asterisk means: nobody recorded this form — it is worked backwards from the daughters that survived." },
  itc: { short: "Italic", label: "Proto-Italic", era: "~1000 BCE", branch: "latin" },
  la:  { short: "Latin", label: "Latin", era: "~700 BCE – 600 CE", branch: "latin" },
  fro: { short: "Old Fr.", label: "Old French", era: "~900 – 1400", branch: "latin" },
  frm: { short: "Mid. Fr.", label: "Middle French", era: "~1400 – 1600", branch: "latin" },
  fr:  { short: "French", label: "French", era: "today", branch: "latin" },
  gem: { short: "P-Gmc", label: "Proto-Germanic", era: "~500 BCE", branch: "germanic",
    note: "The point where Grimm's Law had run. Everything below this line has f where Latin has p." },
  gmw: { short: "W-Gmc", label: "West Germanic", era: "~200 CE", branch: "germanic" },
  goh: { short: "OHG", label: "Old High German", era: "~750 – 1050", branch: "german" },
  gmh: { short: "MHG", label: "Middle High German", era: "~1050 – 1350", branch: "german" },
  de:  { short: "German", label: "German", era: "today", branch: "german" },
  ang: { short: "OE", label: "Old English", era: "~450 – 1150", branch: "english" },
  en:  { short: "English", label: "English", era: "today", branch: "english" },
  grc: { short: "Greek", label: "Ancient Greek", era: "~800 BCE – 300 CE", branch: "greek" },
  ar:  { short: "Arabic", label: "Arabic", era: "—", branch: "other" },
  frk: { short: "Frankish", label: "Frankish", era: "~500 – 900", branch: "germanic" },
};

/* Wiktionary's language codes, mapped onto the rungs above. Codes it uses that
 * we do not draw (dialects, intermediate stages) fall through to null and are
 * dropped from the tree rather than drawn as an unlabelled box. */
export const CODE_TO_LAYER = {
  "ine-pro": "pie", "itc-pro": "itc", "la": "la", "LL.": "la", "ML.": "la", "VL.": "la",
  "fro": "fro", "frm": "frm", "fr": "fr",
  "gem-pro": "gem", "gmw-pro": "gmw", "goh": "goh", "gmh": "gmh", "de": "de",
  "ang": "ang", "en": "en", "enm": "en",
  "grc": "grc", "ar": "ar", "frk": "frk",
};

export const LAW_GROUPS = {
  grimm: {
    label: "Grimm's Law",
    when: "Proto-Germanic, before 500 BCE",
    blurb: "The change that made Germanic sound Germanic. Every plain stop PIE had, Germanic moved — and Latin did not. This is why half of French vocabulary looks unrelated to English until you know one rule.",
  },
  hg: {
    label: "The High German shift",
    when: "Old High German, ~500–800 CE",
    blurb: "A second shift, and only in the south — which is exactly why German and English diverge where German and Dutch do not. If you know English, this rule alone hands you thousands of German words.",
  },
  gallo: {
    label: "Latin into French",
    when: "Gaul, ~400–900 CE",
    blurb: "Latin spoken in Gaul wore down in regular ways. Run these backwards and a French word tells you its Latin parent — which is usually a word English borrowed whole.",
  },
};

/* One regular change each, stated so it can be run forwards on a new word.
 *
 * `pairs` are the evidence and the practice material both: every one is checked
 * against Wiktionary, and the drill hides one member and asks for it. Fields
 * are the four rungs a learner can actually see — Latin, French, German,
 * English — with `g` the shared meaning. A dash means the language did not keep
 * a descendant of this root, which is worth showing rather than hiding. */
export const LAWS = [
  {
    id: "grimm-p-f", group: "grimm", from: "p", to: "f",
    name: "Latin p → Germanic f",
    rule: "Where French has p, English and German usually have f.",
    why: "PIE *p survived unchanged into Latin, and so into French. In Germanic it opened into a fricative. Nothing was borrowed in either direction — both are the same inherited word, 4,000 years apart.",
    watch: "German spells this sound ⟨V⟩ in a few old words: Vater, viel, vier are all /f/. The spelling is medieval, the sound is Grimm's.",
    pairs: [
      { g: "father", la: "pater", fr: "père", de: "Vater", en: "father" },
      { g: "foot",   la: "pedem", fr: "pied", de: "Fuß",   en: "foot" },
      { g: "fish",   la: "piscis", fr: "poisson", de: "Fisch", en: "fish" },
      { g: "full",   la: "plēnus", fr: "plein", de: "voll", en: "full" },
      { g: "for",    la: "prō",   fr: "pour", de: "für",  en: "for" },
      { g: "few",    la: "paucus", fr: "peu",  de: "—",    en: "few" },
    ],
  },
  {
    id: "grimm-k-h", group: "grimm", from: "k", to: "h",
    name: "Latin c /k/ → Germanic h",
    rule: "Where French has c or ch from Latin c, English and German usually have h.",
    why: "PIE *k weakened to /h/ in Germanic. Latin kept it, and French then softened it further in front of a, which is why chien and Hund look nothing alike but are the same word.",
    pairs: [
      { g: "hundred", la: "centum", fr: "cent",  de: "hundert", en: "hundred" },
      { g: "horn",    la: "cornū",  fr: "corne", de: "Horn",   en: "horn" },
      { g: "hound / dog", la: "canis", fr: "chien", de: "Hund", en: "hound" },
      { g: "heart",   la: "cor",    fr: "cœur",  de: "Herz",   en: "heart" },
      { g: "head",    la: "caput",  fr: "—",  de: "Haupt",  en: "head", kin: [["chef", "a chief; a head cook", "fr"], ["chief", "a leader"]] },
    ],
  },
  {
    id: "grimm-d-t", group: "grimm", from: "d", to: "t",
    name: "Latin d → Germanic t",
    rule: "Where French has d, English has t — and German usually has z, because it shifted twice.",
    why: "Grimm turned PIE *d into Germanic t. Centuries later the High German shift turned that same t into z /ts/. German words like zehn are two sound laws deep, which is why they sit furthest from the Latin.",
    pairs: [
      { g: "ten",   la: "decem", fr: "dix",  de: "zehn", en: "ten" },
      { g: "two",   la: "duo",   fr: "deux", de: "zwei", en: "two" },
      { g: "tooth", la: "dentem", fr: "dent", de: "Zahn", en: "tooth" },
      { g: "tame",  la: "domāre", fr: "dompter", de: "zähmen", en: "tame" },
    ],
  },
  {
    id: "grimm-bh-b", group: "grimm", from: "f", to: "b",
    name: "Latin f → Germanic b",
    rule: "Where Latin has f at the start of a word, English and German often have b.",
    why: "Both come from PIE *bʰ, a breathy b. Latin turned it into f word-initially; Germanic hardened it to plain b. So Latin f matches Germanic b — not Germanic f, which comes from *p instead.",
    pairs: [
      { g: "brother", la: "frāter", fr: "frère", de: "Bruder", en: "brother" },
      { g: "to bear, to bring forth", la: "ferre", fr: "—", de: "gebären", en: "bear" },
      /* French kept no descendant of fāgus at all — its beech is hêtre, a
       * Frankish word. The blank is the honest entry, and it makes the point
       * that inheritance is never guaranteed. */
      { g: "beech", la: "fāgus", fr: "—", de: "Buche", en: "beech" },
    ],
  },

  {
    id: "hg-t-z", group: "hg", from: "t", to: "z / ss",
    name: "English t → German z or ss",
    rule: "English t becomes German z at the start of a word, and ss or ß in the middle or at the end.",
    why: "The High German shift hit Germanic *t hardest. Where it began a word it became an affricate /ts/, written z; between or after vowels it became a plain /s/, written ss or ß.",
    watch: "The position decides which. zehn and Wasser are the same rule applied at two places in the word.",
    pairs: [
      { g: "ten",    la: "decem", fr: "dix",  de: "zehn",   en: "ten" },
      { g: "to",     la: "—",     fr: "—",    de: "zu",     en: "to" },
      { g: "tongue", la: "lingua", fr: "langue", de: "Zunge", en: "tongue" },
      { g: "water",  la: "—",     fr: "—",    de: "Wasser", en: "water" },
      { g: "eat",    la: "edere", fr: "—",    de: "essen",  en: "eat" },
      { g: "foot",   la: "pedem", fr: "pied", de: "Fuß",    en: "foot" },
      { g: "out",    la: "—",     fr: "—",    de: "aus",    en: "out" },
      { g: "that",   la: "—",     fr: "—",    de: "das",    en: "that" },
    ],
  },
  {
    id: "hg-p-pf", group: "hg", from: "p", to: "pf / ff",
    name: "English p → German pf or ff",
    rule: "English p becomes German pf at the start, ff in the middle or at the end.",
    why: "The same shift, applied to Germanic *p. Both languages inherited the p; only the southern dialects that became standard German moved it.",
    pairs: [
      { g: "apple",  la: "—", fr: "—",     de: "Apfel",  en: "apple" },
      { g: "path",   la: "—", fr: "—",     de: "Pfad",   en: "path" },
      { g: "pepper", la: "piper", fr: "poivre", de: "Pfeffer", en: "pepper" },
      { g: "ship",   la: "—", fr: "—",     de: "Schiff", en: "ship" },
      { g: "sleep",  la: "—", fr: "—",     de: "schlafen", en: "sleep" },
      { g: "open",   la: "—", fr: "—",     de: "offen",  en: "open" },
    ],
  },
  {
    id: "hg-k-ch", group: "hg", from: "k", to: "ch",
    name: "English k → German ch",
    rule: "English k becomes German ch in the middle or at the end of a word. At the start it stays k.",
    why: "The shift only reached *k after a vowel, which is why Kind keeps its k but machen does not. The position rule is the whole of it.",
    pairs: [
      { g: "make", la: "—", fr: "—", de: "machen", en: "make" },
      { g: "book", la: "—", fr: "—", de: "Buch",   en: "book" },
      { g: "milk", la: "—", fr: "—", de: "Milch",  en: "milk" },
      { g: "seek", la: "—", fr: "—", de: "suchen", en: "seek" },
      { g: "break", la: "—", fr: "—", de: "brechen", en: "break" },
      { g: "I",    la: "ego", fr: "je", de: "ich",  en: "I" },
    ],
  },
  {
    id: "hg-th-d", group: "hg", from: "th", to: "d",
    name: "English th → German d",
    rule: "English th becomes German d.",
    why: "Germanic *þ survived in English and became d in German. It is the most reliable of all these rules — there is almost no exception.",
    pairs: [
      { g: "thing",  la: "—", fr: "—", de: "Ding",  en: "thing" },
      { g: "three",  la: "trēs", fr: "trois", de: "drei", en: "three" },
      { g: "thou / you", la: "tū", fr: "tu", de: "du", en: "thou" },
      { g: "thank",  la: "—", fr: "—", de: "danken", en: "thank" },
      { g: "thick",  la: "—", fr: "—", de: "dick",  en: "thick" },
      { g: "thirst", la: "—", fr: "—", de: "Durst", en: "thirst" },
    ],
  },
  {
    id: "hg-d-t", group: "hg", from: "d", to: "t",
    name: "English d → German t",
    rule: "English d becomes German t.",
    why: "The other half of the same chain: as *þ moved into d, the older d was pushed on to t. Sound changes tend to come in rounds like this, each one filling the gap the last one left.",
    pairs: [
      { g: "day",      la: "—", fr: "—", de: "Tag",     en: "day" },
      { g: "do",       la: "—", fr: "—", de: "tun",     en: "do" },
      { g: "deep",     la: "—", fr: "—", de: "tief",    en: "deep" },
      { g: "daughter", la: "—", fr: "—", de: "Tochter", en: "daughter" },
      { g: "red",      la: "ruber", fr: "rouge", de: "rot", en: "red" },
      { g: "door",     la: "foris", fr: "—", de: "Tür",  en: "door" },
    ],
  },

  {
    id: "fr-ca-cha", group: "gallo", from: "ca", to: "cha",
    name: "Latin ca- → French cha-",
    rule: "A Latin word starting ca- comes out of French as cha-.",
    why: "In Gaul, /k/ before /a/ softened to /tʃ/ and then to /ʃ/. Nowhere else in the Romance world did this, which is why Spanish and Italian kept campo and casa while French has champ and chez.",
    pairs: [
      { g: "to sing", la: "cantāre", fr: "chanter", de: "—", en: "chant" },
      { g: "field",   la: "campus",  fr: "champ",   de: "—", en: "—", kin: [["campus", "a university's grounds"]] },
      { g: "horse",   la: "caballus", fr: "cheval", de: "—", en: "—", kin: [["cavalry", "soldiers on horseback"]] },
      { g: "castle",  la: "castellum", fr: "château", de: "—", en: "castle" },
      { g: "cat",     la: "cattus",  fr: "chat",    de: "Katze", en: "cat" },
      { g: "hot",     la: "calidus", fr: "chaud",   de: "—", en: "—", kin: [["cauldron", "a pot for boiling"], ["scald", "to burn with hot liquid"]] },
      { g: "room, chamber", la: "camera",  fr: "chambre", de: "Kammer", en: "chamber" },
    ],
  },
  {
    id: "fr-ct-it", group: "gallo", from: "ct", to: "it",
    name: "Latin -ct- → French -it-",
    rule: "Latin -ct- in the middle of a word becomes French -it-.",
    why: "The /k/ softened into a glide and merged with the vowel. English borrowed most of these words straight from Latin, centuries later and unchanged — which is why the English cousin usually still shows the ct.",
    watch: "This is the most productive guess in the whole list: fact→fait, lact→lait, noct→nuit, oct→huit.",
    pairs: [
      { g: "deed / fact", la: "factum", fr: "fait", de: "—", en: "fact" },
      { g: "milk",  la: "lactem", fr: "lait", de: "—", en: "—", kin: [["lactose", "milk sugar"]] },
      { g: "night", la: "noctem", fr: "nuit", de: "Nacht", en: "night", kin: [["nocturnal", "happening at night"]] },
      { g: "eight", la: "octō",   fr: "huit", de: "acht", en: "eight", kin: [["octave", "a span of eight notes"]] },
      { g: "roof",  la: "tēctum", fr: "toit", de: "—", en: "—", kin: [["protect", "to cover over, to shield"]] },
      { g: "bed",   la: "lectum", fr: "lit",  de: "—", en: "—" },
    ],
  },
  {
    id: "fr-s-e", group: "gallo", from: "sp/st/sc", to: "ép/ét/éc",
    name: "Latin s + consonant → French é-",
    rule: "An English word starting sp-, st- or sc- often has a French cousin starting ép-, ét- or éc-.",
    why: "Latin's initial s+consonant was hard to say, so Gallo-Romance propped it up with a vowel — escole — and then dropped the s: école. The circumflex on many of these is a receipt for the lost s.",
    watch: "The accent is the fossil. Where you see ê or é at the start of a French word, try putting an s back in and see if an English word appears.",
    pairs: [
      { g: "school", la: "schola",  fr: "école", de: "Schule", en: "school" },
      { g: "star",   la: "stēlla",  fr: "étoile", de: "—", en: "star", kin: [["stellar", "of the stars"]] },
      { g: "sword",  la: "spatha",  fr: "épée",  de: "—", en: "—", kin: [["spatula", "a flat blade for spreading"], ["Spaten", "a spade", "de"]] },
      { g: "state",  la: "status",  fr: "état",  de: "—", en: "state" },
      { g: "study",  la: "studium", fr: "étude", de: "Studium", en: "study" },
      { g: "to write", la: "scrībere", fr: "écrire", de: "schreiben", en: "—", kin: [["scribe", "a copyist"], ["describe", "to write about"]] },
      { g: "narrow, drawn tight", la: "strictus", fr: "étroit", de: "—", en: "strict", kin: [["strait", "a narrow channel"]] },
      { g: "sponge", la: "spongia", fr: "éponge", de: "—", en: "sponge" },
    ],
  },
  {
    id: "fr-p-v", group: "gallo", from: "p", to: "v",
    name: "Latin p between vowels → French v",
    rule: "A Latin p caught between two vowels softens to v in French.",
    why: "Consonants between vowels weaken — a change called lenition, and one of the most common in any language. Latin p first voiced to b, then opened to v.",
    pairs: [
      { g: "to know", la: "sapere", fr: "savoir", de: "—", en: "—", kin: [["sapient", "wise, knowing"]] },
      { g: "bank / shore", la: "rīpa", fr: "rive", de: "—", en: "—", kin: [["river", "the water between the banks"]] },
      { g: "goat",  la: "capra", fr: "chèvre", de: "—", en: "—", kin: [["caprine", "goat-like"]] },
      { g: "April", la: "Aprīlis", fr: "avril", de: "April", en: "April" },
    ],
  },
];

/** Every law that a given group holds, in author order. */
export function lawsInGroup(group) {
  return LAWS.filter((l) => l.group === group);
}
