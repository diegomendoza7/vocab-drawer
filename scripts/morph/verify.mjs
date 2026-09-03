/* Check every word and gloss in the word-building section against Wiktionary.
 *
 * Two claims per entry, and they fail differently. The *form* either exists in
 * that language or it does not — a hard check. The *gloss* is a judgement, so
 * it is checked loosely: at least one content word of my gloss should appear
 * somewhere in Wiktionary's definitions for that word. That catches a gloss
 * attached to the wrong headword, which is the mistake worth catching, without
 * failing on legitimate rewording.
 *
 * Run by hand. The offline structural checks live in scripts/check-morphology.mjs.
 */
import { FAMILIES, AFFIXES, AFFIX_GROUPS } from "../../src/data/morphology.js";
import { familyWords } from "../../src/lib/morphology.js";
import { writeFileSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SEC = { fr: "==French==", de: "==German==" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function section(word, lang) {
  const title = word.replace(/^(der|die|das|le|la|l')\s+/i, "").trim();
  const key = `${lang}:${title}`;
  if (cache.has(key)) return cache.get(key);
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  let out = null;
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (r.ok) {
      const j = await r.json();
      const t = j?.parse?.wikitext;
      if (t) {
        const i = t.indexOf(SEC[lang]);
        if (i >= 0) {
          const nxt = t.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
          out = nxt < 0 ? t.slice(i) : t.slice(i, i + 4 + nxt);
        }
      }
    }
    break;
  }
  cache.set(key, out);
  await sleep(190);
  return out;
}

const STOP = new Set(["the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "be", "is",
  "it", "up", "out", "off", "with", "something", "someone", "oneself", "sth", "sb", "one", "s"]);
const words = (g) => g.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
  .filter((w) => w.length > 2 && !STOP.has(w));

/** Does Wiktionary's definition text share a content word with my gloss? */
function glossPlausible(sec, gloss) {
  const defs = sec.split("\n").filter((l) => l.startsWith("# ")).join(" ").toLowerCase();
  const mine = words(gloss);
  if (!mine.length) return true;
  return mine.some((w) => defs.includes(w.slice(0, Math.max(4, w.length - 2))));
}

const rows = [];
let checked = 0;
for (const fam of FAMILIES) {
  for (const w of familyWords(fam)) {
    checked += 1;
    const sec = await section(w.w, fam.lang);
    if (!sec) { rows.push({ where: fam.id, word: w.w, lang: fam.lang, verdict: "NO ENTRY" }); continue; }
    rows.push({ where: fam.id, word: w.w, lang: fam.lang,
      verdict: glossPlausible(sec, w.e) ? "ok" : "GLOSS UNCONFIRMED", gloss: w.e });
  }
  const bad = rows.filter((r) => r.where === fam.id && r.verdict !== "ok").length;
  console.log(`  ${fam.id.padEnd(11)} ${familyWords(fam).length} words, ${bad} to look at`);
}

/* The affix examples make the same kind of claim and get the same check. */
for (const a of AFFIXES) {
  const lang = AFFIX_GROUPS[a.group].lang;
  for (const [, derived, gloss] of a.ex) {
    if (/[ →]/.test(derived)) continue;                 // editorial, not a headword
    checked += 1;
    const sec = await section(derived, lang);
    if (!sec) { rows.push({ where: a.id, word: derived, lang, verdict: "NO ENTRY" }); continue; }
    rows.push({ where: a.id, word: derived, lang,
      verdict: glossPlausible(sec, gloss) ? "ok" : "GLOSS UNCONFIRMED", gloss });
  }
}

writeFileSync("scripts/morph/verify-report.json", JSON.stringify(rows, null, 2));
const bad = rows.filter((r) => r.verdict !== "ok");
console.log(`\nchecked ${checked} words — ${rows.filter(r=>r.verdict==="ok").length} ok, ${bad.length} to look at`);
for (const r of bad) console.log(`  ${r.verdict.padEnd(18)} ${r.lang}:${r.word.padEnd(18)} ${r.where}  ${r.gloss || ""}`);
