/* Dump every C1 entry — wired and staged — as one JSON manifest.
 *
 * Everything downstream (the Wiktionary verification, the sentence pass, the
 * audit) works from this rather than re-parsing the data files, so they all
 * agree about what the deck actually contains.
 *
 *   node scripts/c1-manifest.mjs > scripts/c1-cache/manifest.json
 */
import { FR_C1, FR_C1_STAGED } from "../src/data/vocab-fr-c1.js";
import { DE_C1, DE_C1_STAGED } from "../src/data/vocab-de-c1.js";

const flatten = (lang, drawers, staged) =>
  drawers.flatMap((d) =>
    d.words.map((w) => ({
      lang, topic: d.topic, staged,
      t: w.t, e: w.e,
      g: w.g || null, art: w.art || null, gen: w.gen || null,
      rek: w.rek || null, alt: w.alt || null, n: w.n || null,
      hasSentence: Boolean(w.s),
    })),
  );

const all = [
  ...flatten("fr", FR_C1, false), ...flatten("fr", FR_C1_STAGED, true),
  ...flatten("de", DE_C1, false), ...flatten("de", DE_C1_STAGED, true),
];

console.log(JSON.stringify(all, null, 0));
