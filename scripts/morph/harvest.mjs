/* Harvest derived-word families and their glosses from English Wiktionary.
 *
 * Wiktionary lists a word's derivatives in {{col3|de|…}} / {{der3|…}} blocks
 * under "Derived terms". Those lists are exhaustive rather than useful —
 * sprechen has 46, including Sprechmuschel — so this collects candidates and
 * their definitions, and the shipped families are curated from the result.
 * Harvesting the glosses is the expensive half and the half worth having: a
 * family is only teachable if every member's meaning is on screen beside it.
 */
import { writeFileSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SEC = { fr: "==French==", de: "==German==" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROOTS = {
  de: ["sprechen", "kommen", "stehen", "ziehen", "setzen", "halten", "nehmen", "geben", "fallen", "tragen"],
  fr: ["porter", "venir", "mettre", "tenir", "conduire", "poser", "voir", "dire", "prendre", "faire"],
};

async function wikitext(title) {
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (!r.ok) return null;
    const j = await r.json();
    return j?.parse?.wikitext ?? null;
  }
  return null;
}

function langSection(text, lang) {
  const i = text.indexOf(SEC[lang]);
  if (i < 0) return null;
  const nxt = text.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
  return nxt < 0 ? text.slice(i) : text.slice(i, i + 4 + nxt);
}

/** The first definition line, cleaned of wiki markup — enough to judge a word by. */
function firstGloss(sec) {
  for (const line of sec.split("\n")) {
    if (!line.startsWith("# ") || line.startsWith("#*")) continue;
    let g = line.slice(2)
      .replace(/\{\{lb\|[^}]*\}\}\s*/g, "")
      .replace(/\{\{(?:l|m|w)\|[a-z-]+\|([^}|]+)[^}]*\}\}/g, "$1")
      .replace(/\{\{gloss\|([^}]*)\}\}/g, "($1)")
      .replace(/\{\{[^}]*\}\}/g, "")
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/'''?/g, "").trim();
    if (g.length > 1) return g;
  }
  return null;
}

function derivedTerms(sec) {
  const out = new Set();
  for (const m of sec.matchAll(/\{\{(?:col|der|rel)\d?\|[a-z-]+\|([\s\S]*?)\}\}/g)) {
    for (const piece of m[1].split("|")) {
      const t = piece.trim().replace(/<[^>]*>/g, "");
      if (t && !t.includes("=") && !/\s/.test(t)) out.add(t);
    }
  }
  for (const m of sec.matchAll(/^\*\s*\{\{l\|[a-z-]+\|([^}|]+)/gm)) out.add(m[1].trim());
  return [...out];
}

const result = {};
for (const [lang, roots] of Object.entries(ROOTS)) {
  for (const root of roots) {
    const text = await wikitext(root);
    const sec = text && langSection(text, lang);
    if (!sec) { console.log(`  ${lang}:${root} — no section`); continue; }
    const terms = derivedTerms(sec).slice(0, 60);
    const members = [];
    for (const t of terms) {
      const tt = await wikitext(t);
      const ts = tt && langSection(tt, lang);
      const g = ts && firstGloss(ts);
      if (g) members.push({ w: t, e: g.slice(0, 90) });
      await sleep(180);
    }
    result[`${lang}:${root}`] = { lang, root, base: firstGloss(sec), members };
    console.log(`  ${lang}:${root} — ${members.length} derived words with glosses`);
    await sleep(200);
  }
}
writeFileSync("scripts/morph/candidates.json", JSON.stringify(result, null, 1));
console.log("total families:", Object.keys(result).length);
