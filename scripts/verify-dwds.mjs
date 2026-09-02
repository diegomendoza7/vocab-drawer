/* Second source for the German headwords Wiktionary does not list.
 *
 *   node scripts/verify-dwds.mjs
 *
 * German forms compounds productively, so Wiktionary's silence on
 * "Lohnnebenkosten" says nothing about whether the word is real. DWDS — the
 * Digital Dictionary of the German Language, built on a 53-billion-token
 * reference corpus — answers the question Wiktionary cannot: does anyone
 * actually write this?
 *
 * Anything with corpus hits is a real word. Anything with none is invented and
 * should not be in the deck.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "c1-cache");
const CACHE = path.join(DIR, "dwds.json");
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
const parsedDe = JSON.parse(fs.readFileSync(path.join(DIR, "parsed-de.json"), "utf8"));

const targets = manifest
  .filter((w) => w.lang === "de" && !/\s/.test(w.t) && !parsedDe[w.t])
  .map((w) => w.t);

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const todo = targets.filter((t) => !(t in cache));
console.log(`${targets.length} German headwords absent from Wiktionary; ${todo.length} to look up`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const t of todo) {
  try {
    const res = await fetch(`https://www.dwds.de/api/frequency/?q=${encodeURIComponent(t)}`, {
      headers: { "User-Agent": "vocab-drawer/1.0 (personal language-learning app)" },
    });
    cache[t] = res.ok ? (await res.json()).hits ?? 0 : null;
  } catch { cache[t] = null; }
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  await sleep(400);
}

const rows = targets.map((t) => [t, cache[t]]).sort((a, b) => (a[1] ?? -1) - (b[1] ?? -1));
const zero = rows.filter(([, h]) => h === 0);
const unknown = rows.filter(([, h]) => h == null);
console.log("\nlowest corpus frequencies:");
rows.slice(0, 10).forEach(([t, h]) => console.log(`  ${String(h).padStart(8)}  ${t}`));
console.log(`\n${rows.length - zero.length - unknown.length} confirmed in the DWDS corpus`);
if (zero.length) { console.log(`${zero.length} with NO corpus hits — likely not real words:`); zero.forEach(([t]) => console.log("  " + t)); }
if (unknown.length) console.log(`${unknown.length} could not be checked`);
