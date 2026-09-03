/* Second pass: walk the chains the inline parser could not read.
 *
 * The first pass reads one page's {{inh}} templates, which is cheap and works
 * for about two thirds of the core decks — but only a third of C1, because
 * newer and higher-traffic entries increasingly use {{etymon|…|tree=1}} and
 * name only the immediate parent. Walking page by page costs a request per
 * rung and does not care which style a page uses, so it is worth spending on
 * the misses even though it would be wasteful on everything.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { walkChain } from "./walk.mjs";

const OUT = "scripts/etym/chains.json";
const words = JSON.parse(readFileSync("scripts/etym/words.json", "utf8"));
const done = JSON.parse(readFileSync(OUT, "utf8"));

const missing = words.filter((w) => {
  const e = done[`${w.lang}:${w.t}`];
  return e && (!e.chain || !e.chain.length);
});
console.log(`${missing.length} words have no chain; walking them.`);

let found = 0, still = 0, n = 0;
for (const w of missing) {
  const title = w.t.replace(/^(le |la |les |l'|der |die |das )/i, "").trim();
  // Multi-word headwords have no entry of their own; skip rather than churn.
  if (/\s/.test(title)) { still += 1; continue; }
  const chain = await walkChain(title, w.lang);
  const key = `${w.lang}:${w.t}`;
  if (chain.length) { done[key] = { ...done[key], chain }; found += 1; } else still += 1;
  n += 1;
  if (n % 50 === 0) {
    writeFileSync(OUT, JSON.stringify(done));
    console.log(`  ${n}/${missing.length} walked — ${found} new chains`);
  }
}
writeFileSync(OUT, JSON.stringify(done));
console.log(`done. ${found} new chains, ${still} still without one.`);
