/* Word imagery: every mapping must point at a file that exists.
 *
 * The failure this prevents is silent. A codepoint with no SVG behind it does
 * not throw — `imageFor` happily returns a src and the browser renders a broken
 * image, so the word looks like it has a picture and does not. Nothing in the
 * app notices, and nothing in the build did either until this ran.
 */
import { existsSync } from "node:fs";
import { ALL_EMOJI, DRAWN, conceptKeys, imageFor } from "../src/data/word-images.js";
import { DATA } from "../src/data/vocab.js";

const problems = [];
const fail = (m) => problems.push(m);

for (const [concept, cp] of Object.entries(ALL_EMOJI)) {
  if (!/^[0-9a-f-]+$/.test(cp)) fail(`${concept}: "${cp}" is not a codepoint`);
  else if (!existsSync(`public/img/emoji/${cp}.svg`)) {
    fail(`${concept} -> ${cp}: no file. Run: node scripts/sync-emoji.mjs`);
  }
  if (!concept.trim() || concept !== concept.toLowerCase()) fail(`"${concept}": keys are lowercase, matching conceptKeys()`);
}
for (const key of DRAWN) {
  if (!existsSync(`public/img/words/${key}.svg`)) fail(`drawn "${key}": no file at public/img/words/${key}.svg`);
}

/* A gloss must produce at least one usable sense, or the word can never match
 * a picture however many are added. */
let words = 0, withImage = 0, noKey = 0;
for (const lang of ["fr", "de"]) {
  for (const lv of Object.keys(DATA[lang])) {
    for (const d of DATA[lang][lv] || []) {
      for (const w of d.words || []) {
        words += 1;
        if (!conceptKeys(w.e).length) { noKey += 1; fail(`${lang}:${w.t} — gloss "${w.e}" yields no concept key`); }
        if (imageFor(w)) withImage += 1;
      }
    }
  }
}

if (problems.length) {
  console.error(`images: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 25)) console.error("  " + p);
  process.exit(1);
}
console.log(`images ok — ${Object.keys(ALL_EMOJI).length} emoji + ${DRAWN.size} drawn, ${withImage}/${words} words illustrated (${Math.round((withImage / words) * 100)}%)`);
