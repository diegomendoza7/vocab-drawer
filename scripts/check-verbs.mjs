/* Audit the generated C1 conjugation tables against known principal parts.
 *
 *   node scripts/check-verbs.mjs
 *
 * The C1 tables are generated, and the generator treats anything it does not
 * recognise as regular. That is right for most of them and silently wrong for
 * strong and mixed verbs: `haben` shipped as "habst / habte", which is not a
 * word. Nothing downstream can catch that — a wrong form conjugates, displays
 * and marks answers against itself perfectly happily.
 *
 * So this checks the forms the app would actually teach, for the stems where
 * being wrong is possible. A prefixed verb inherits its stem's pattern
 * (vorbringen follows bringen), which is what makes a table this size enough.
 *
 * Exits non-zero on a mismatch.
 */
import { DE_C1_VERBS, FR_C1_VERBS } from "../src/data/verbs-c1.js";

/* stem: [3rd-singular present, 1st-singular past, past participle] */
const DE_PRINCIPAL = {
  haben: ["hat", "hatte", "gehabt"],
  sein: ["ist", "war", "gewesen"],
  werden: ["wird", "wurde", "geworden"],
  gehen: ["geht", "ging", "gegangen"],
  kommen: ["kommt", "kam", "gekommen"],
  sehen: ["sieht", "sah", "gesehen"],
  geben: ["gibt", "gab", "gegeben"],
  nehmen: ["nimmt", "nahm", "genommen"],
  sprechen: ["spricht", "sprach", "gesprochen"],
  fahren: ["fährt", "fuhr", "gefahren"],
  essen: ["isst", "aß", "gegessen"],
  tragen: ["trägt", "trug", "getragen"],
  ziehen: ["zieht", "zog", "gezogen"],
  halten: ["hält", "hielt", "gehalten"],
  treffen: ["trifft", "traf", "getroffen"],
  werfen: ["wirft", "warf", "geworfen"],
  fallen: ["fällt", "fiel", "gefallen"],
  laufen: ["läuft", "lief", "gelaufen"],
  lesen: ["liest", "las", "gelesen"],
  schreiben: ["schreibt", "schrieb", "geschrieben"],
  stehen: ["steht", "stand", "gestanden"],
  bleiben: ["bleibt", "blieb", "geblieben"],
  weisen: ["weist", "wies", "gewiesen"],
  greifen: ["greift", "griff", "gegriffen"],
  schließen: ["schließt", "schloss", "geschlossen"],
  treten: ["tritt", "trat", "getreten"],
  finden: ["findet", "fand", "gefunden"],
  binden: ["bindet", "band", "gebunden"],
  beginnen: ["beginnt", "begann", "begonnen"],
  gewinnen: ["gewinnt", "gewann", "gewonnen"],
  sitzen: ["sitzt", "saß", "gesessen"],
  liegen: ["liegt", "lag", "gelegen"],
  helfen: ["hilft", "half", "geholfen"],
  // Mixed: weak endings, changed stem.
  bringen: ["bringt", "brachte", "gebracht"],
  denken: ["denkt", "dachte", "gedacht"],
  kennen: ["kennt", "kannte", "gekannt"],
  nennen: ["nennt", "nannte", "genannt"],
  wenden: ["wendet", "wandte", "gewandt"],
  senden: ["sendet", "sandte", "gesandt"],
  wissen: ["weiß", "wusste", "gewusst"],
};

const PREFIX = /^(be|ver|er|ent|zer|miss|über|unter|um|an|auf|aus|ein|mit|nach|vor|zu|ab|bei|wider|dar|hin|her|voraus|hervor|heraus)/;

/** Does `form` end the way the stem's own form does? Prefixes shift the front. */
const endsLike = (form, expected) => form.endsWith(expected) || form === expected;

const problems = [];

for (const v of DE_C1_VERBS) {
  const stem = v.inf.replace(PREFIX, "");
  const parts = DE_PRINCIPAL[stem];
  if (!parts) continue;                       // regular, or not one we can check
  const [pres3, past1, pp] = parts;
  const at = `${v.label || v.inf} (${v.inf})`;
  if (!endsLike(v.pres[2], pres3)) problems.push(`${at}: present 3sg "${v.pres[2]}" — expected to end "${pres3}"`);
  if (!endsLike(v.past[0], past1)) problems.push(`${at}: past 1sg "${v.past[0]}" — expected to end "${past1}"`);
  /* Participles of prefixed verbs drop the ge-, so compare only the ending. */
  if (!endsLike(v.pp, pp.replace(/^ge/, ""))) problems.push(`${at}: participle "${v.pp}" — expected to end "${pp.replace(/^ge/, "")}"`);
}

/* French: -er verbs are regular in the tenses the app drills, so the useful
 * check is structural — every table must be complete and self-consistent. */
for (const v of [...FR_C1_VERBS, ...DE_C1_VERBS]) {
  const label = v.label || v.inf;
  if (!Array.isArray(v.pres) || v.pres.length !== 6 || v.pres.some((f) => !f)) problems.push(`${label}: incomplete present`);
  if (v.past && (v.past.length !== 6 || v.past.some((f) => !f))) problems.push(`${label}: incomplete past`);
  if (!v.pp) problems.push(`${label}: no participle`);
  if (!v.aux) problems.push(`${label}: no auxiliary`);
}

console.log(`checked ${DE_C1_VERBS.length} German and ${FR_C1_VERBS.length} French C1 verb tables`);
console.log(`  ${Object.keys(DE_PRINCIPAL).length} German stems have known principal parts`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  problems.slice(0, 40).forEach((p) => console.error("  " + p));
  process.exit(1);
}
console.log("no problems found");
