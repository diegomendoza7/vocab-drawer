/* Harvest etymology chains from English Wiktionary.
 *
 * Wiktionary writes ancestry as templates: {{inh|de|goh|fater}} means "German
 * inherits from Old High German fater". Parsing the templates rather than the
 * rendered prose is what makes the chain machine-readable — and it is the same
 * source the C1 verification pass already used, so the citation story is
 * consistent.
 *
 * inh = inherited (unbroken descent), der = derived, bor = borrowed. The
 * distinction matters pedagogically: an inherited word obeys the sound laws,
 * a borrowing does not, which is exactly why "père/Vater" teaches a rule and
 * "restaurant" teaches nothing.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SECTION = { fr: "==French==", de: "==German==" };
const OUT = "scripts/etym/chains.json";

const words = JSON.parse(readFileSync("scripts/etym/words.json", "utf8"));
const done = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull the Etymology block for one language section out of a page's wikitext. */
function etymBlock(wikitext, lang) {
  const start = wikitext.indexOf(SECTION[lang]);
  if (start < 0) return null;
  // Stop at the next language heading so a French section cannot bleed into German.
  const nextLang = wikitext.slice(start + 4).search(/\n==[A-Z][^=]*==\n/);
  const section = nextLang < 0 ? wikitext.slice(start) : wikitext.slice(start, start + 4 + nextLang);
  const e = section.search(/===+\s*Etymology/);
  if (e < 0) return null;
  const rest = section.slice(e);
  const end = rest.slice(3).search(/\n===+[^=]/);
  return end < 0 ? rest : rest.slice(0, end + 3);
}

/* Ancestry templates, in the order they appear — which is the order of descent,
 * newest first. `{{inh+|fr|frm|pere}}` and `{{inh|fr|frm|pere}}` are the same
 * relation; the + only changes how it renders. */
const STEP = /\{\{(inh|der|bor|inh\+|der\+|bor\+|cog|m)\s*\|([^}|]*)\|([^}|]*)(?:\|([^}|]*))?/g;

function parseChain(block) {
  const steps = [];
  const cognates = [];
  let m;
  STEP.lastIndex = 0;
  while ((m = STEP.exec(block)) !== null) {
    const kind = m[1].replace("+", "");
    const from = (m[3] || "").trim();
    let form = (m[4] || "").trim();
    if (form === "-" || form === "") form = "";
    /* {{cog|en|father}} puts the language in the FIRST slot, not the second
     * like {{inh|de|goh|fater}} does — the cognate template has no "from".
     * Reading m[3] as the language here silently produced zero cognates. */
    if (kind === "cog") { cognates.push({ lang: (m[2] || "").trim(), form: from }); continue; }
    if (kind === "m") continue;                       // inline mention, not a step
    if (!from) continue;
    steps.push({ kind, lang: from, form });
  }
  return { steps, cognates };
}

async function fetchPage(title) {
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
    if (!res.ok) return null;
    const j = await res.json();
    return j?.parse?.wikitext ?? null;
  }
  return null;
}

let hits = 0, misses = 0, skipped = 0;
for (const w of words) {
  const key = `${w.lang}:${w.t}`;
  if (done[key]) { skipped += 1; continue; }
  // Wiktionary titles are the bare headword; French articles are not part of it.
  const title = w.t.replace(/^(le |la |les |l'|der |die |das )/i, "").trim();
  const text = await fetchPage(title);
  const block = text ? etymBlock(text, w.lang) : null;
  if (!block) { done[key] = { ...w, chain: null }; misses += 1; }
  else {
    const { steps, cognates } = parseChain(block);
    done[key] = { ...w, chain: steps, cognates, raw: block.slice(0, 600) };
    hits += 1;
  }
  if ((hits + misses) % 25 === 0) {
    writeFileSync(OUT, JSON.stringify(done));
    console.log(`  ${hits + misses + skipped}/${words.length}  hits=${hits} misses=${misses}`);
  }
  await sleep(250);
}
writeFileSync(OUT, JSON.stringify(done));
console.log(`done. hits=${hits} misses=${misses} skipped=${skipped} total=${Object.keys(done).length}`);
