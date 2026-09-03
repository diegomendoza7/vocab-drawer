/* Every word we might want a chain for: the core decks and C1. */
import { DATA } from "../../src/data/vocab.js";
import { FR_C1 } from "../../src/data/vocab-fr-c1.js";
import { DE_C1 } from "../../src/data/vocab-de-c1.js";
import { writeFileSync } from "node:fs";
const out = [];
for (const lang of ["fr", "de"]) {
  for (const lv of ["A1", "A2", "B1", "B2"]) {
    for (const theme of DATA[lang]?.[lv] || []) {
      for (const w of theme.words || []) out.push({ lang, level: lv, t: w.t, e: w.e, topic: theme.topic });
    }
  }
}
/* C1 is themed like the core decks, so it nests one level deeper. */
for (const [lang, deck] of [["fr", FR_C1], ["de", DE_C1]]) {
  for (const theme of deck) {
    for (const w of theme.words || []) out.push({ lang, level: "C1", t: w.t, e: w.e, topic: theme.topic });
  }
}
writeFileSync("scripts/etym/words.json", JSON.stringify(out));
console.log("words:", out.length, "| fr:", out.filter(w=>w.lang==="fr").length, "| de:", out.filter(w=>w.lang==="de").length);
