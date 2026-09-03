/* Re-extract cognates from the wikitext already saved by the harvest, rather
 * than re-fetching 668 pages for a parser bug. */
import { readFileSync, writeFileSync } from "node:fs";
const d = JSON.parse(readFileSync("scripts/etym/chains.json", "utf8"));
let fixed = 0;
for (const v of Object.values(d)) {
  if (!v.raw) continue;
  const cogs = [];
  for (const m of v.raw.matchAll(/\{\{cog\|([^}|]+)\|([^}|]+)/g)) {
    cogs.push({ lang: m[1].trim(), form: m[2].trim() });
  }
  if (cogs.length) { v.cognates = cogs; fixed += 1; }
}
writeFileSync("scripts/etym/chains.json", JSON.stringify(d));
console.log("entries given cognates:", fixed);
