/* Print the C1 entries still without an example sentence, drawer by drawer.
 *
 *   node scripts/c1-worklist.mjs --lang fr --skip 0 --take 60
 *
 * Grouped by drawer because the drawer is the context: "Politics & Governance"
 * tells you which sense of `mandat` the deck means, and writing the sentence
 * for the wrong sense is the failure mode that matters.
 */
import { FR_C1, FR_C1_STAGED } from "../src/data/vocab-fr-c1.js";
import { DE_C1, DE_C1_STAGED } from "../src/data/vocab-de-c1.js";

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const lang = arg("--lang", "fr");
const skip = Number(arg("--skip", 0));
const take = Number(arg("--take", 60));

const drawers = lang === "fr" ? [...FR_C1, ...FR_C1_STAGED] : [...DE_C1, ...DE_C1_STAGED];
const pending = [];
for (const d of drawers)
  for (const w of d.words)
    if (!w.s) pending.push({ ...w, topic: d.topic });

const slice = pending.slice(skip, skip + take);
let topic = null;
for (const w of slice) {
  if (w.topic !== topic) { topic = w.topic; console.log(`\n## ${topic}`); }
  /* The headword is printed exactly as stored, because that is the string an
   * example sentence has to contain — an article shown as decoration here
   * ("une démarche") is what sent the first pass hunting the wrong form. */
  const shown = w.g ? `${w.g} ${w.t}` : w.art ? `(${w.art}) ${w.t}` : w.t;
  const extra = [w.rek && `rek: ${w.rek}`, w.n && `note: ${w.n}`].filter(Boolean).join(" · ");
  console.log(`${shown}  —  ${w.e}${extra ? `   [${extra}]` : ""}`);
}
console.log(`\n(${skip + 1}–${skip + slice.length} of ${pending.length} ${lang} entries without a sentence)`);
