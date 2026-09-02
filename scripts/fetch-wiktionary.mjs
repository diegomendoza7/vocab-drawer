/* Pull each C1 headword's entry from the language's own Wiktionary.
 *
 *   node scripts/fetch-wiktionary.mjs --lang fr
 *
 * Why the native-language Wiktionary rather than the English one: gender,
 * Rektion and part of speech are marked there in machine-readable templates
 * ({{f}}, {{Wortart|Substantiv|Deutsch}}), and the example sentences are
 * sourced and dated. The English edition paraphrases all of that.
 *
 * Batches 50 titles per request (the API's cap for anonymous callers), caches
 * to scripts/c1-cache/, and resumes — the cache is keyed by title, so a
 * re-run only fetches what is missing. Read-only GETs against a public API.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "c1-cache");
const args = process.argv.slice(2);
const lang = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : "fr";
if (!["fr", "de"].includes(lang)) throw new Error('--lang must be "fr" or "de"');

const API = `https://${lang}.wiktionary.org/w/api.php`;
const UA = "vocab-drawer/1.0 (personal language-learning app; contact via local use)";
const CACHE = path.join(DIR, `wiktionary-${lang}.json`);

const manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
const titles = [...new Set(manifest.filter((m) => m.lang === lang).map((m) => m.t))];

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
/* --recheck re-fetches the titles cached as absent. Needed because a batch
 * that failed on a 429 used to record every title in it as missing, which is
 * indistinguishable afterwards from a word that genuinely has no entry. */
const recheck = args.includes("--recheck");
const todo = titles.filter((t) => !(t in cache) || (recheck && cache[t] === null));
console.log(`${lang}: ${titles.length} headwords, ${todo.length} not cached`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < todo.length; i += 50) {
  const batch = todo.slice(i, i + 50);
  /* redirects=1 follows spelling variants server-side; the response then names
   * both the requested title and the one it landed on, so the cache can be
   * keyed by what the deck asked for. */
  const url = `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2&titles=${batch.map(encodeURIComponent).join("|")}`;
  /* The API rate-limits anonymous callers hard enough that a fixed delay is
   * not enough — back off and retry rather than recording a miss, or the cache
   * would remember "no such word" for a word that exists. */
  let data;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.status === 429) { await sleep(3000 * 2 ** attempt); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      break;
    } catch (err) {
      if (attempt === 5) console.error(`\n  batch at ${i} failed: ${err.message}`);
      await sleep(3000 * 2 ** attempt);
    }
  }
  if (!data) continue;
  const byTitle = {};
  for (const page of data.query?.pages || []) {
    byTitle[page.title] = page.missing ? null : (page.revisions?.[0]?.slots?.main?.content ?? null);
  }
  /* Map the landed-on title back to the one asked for, through both hops the
   * API can make: Unicode normalisation, then redirect. */
  const hop = {};
  for (const n of data.query?.normalized || []) hop[n.from] = n.to;
  for (const r of data.query?.redirects || []) hop[r.from] = r.to;
  const follow = (t, d = 0) => (hop[t] && d < 3 ? follow(hop[t], d + 1) : t);
  for (const t of batch) cache[t] = byTitle[follow(t)] ?? null;
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  process.stdout.write(`\r  ${Math.min(i + 50, todo.length)}/${todo.length}`);
  await sleep(1200);
}

const found = Object.values(cache).filter(Boolean).length;
console.log(`\n${lang}: ${found}/${titles.length} headwords have a Wiktionary page (${Math.round((found / titles.length) * 100)}%)`);
