/* Frequency ranks for the decks, from Wiktionary's own lists.
 *
 * A learner grinding C1 abstractions has no way to tell whether they are
 * buying coverage or collecting rarities. Nation & Waring: the first 1,000
 * word families give ~72% of running text, 2,000 give ~80%, 5,000 give ~89% —
 * so where a word sits matters more than how many words you have.
 *
 * Sources differ by language and the difference is worth recording rather than
 * hiding: French has a single 5,000-word subtitle list, German only 2,000. A
 * word absent from its list is marked "unranked", never "rare" — the list ran
 * out, which is a fact about the list, not about the word.
 */
import { writeFileSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PAGES = {
  fr: [["Wiktionary:Frequency lists/French wordlist opensubtitles 5000", 0]],
  de: [
    ["Wiktionary:Frequency lists/German subtitles 1000", 0],
    ["Wiktionary:Frequency lists/German subtitles 1001-2000", 1000],
  ],
};

async function wikitext(title) {
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2";
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (!r.ok) return null;
    return (await r.json())?.parse?.wikitext ?? null;
  }
  return null;
}

const ranks = { fr: {}, de: {} };
for (const [lang, pages] of Object.entries(PAGES)) {
  for (const [title, offset] of pages) {
    const t = await wikitext(title);
    if (!t) { console.log(`  ${title} — unavailable`); continue; }
    /* The two lists are laid out differently and neither is negotiable:
     *
     *   French  | 1. | {{l|fr|je}} | I | subject
     *   German  | 1. | Ich | 19278 | [[ich#German|ich]] | [[sein#German|sein]]
     *
     * The German table's last column is the LEMMA, which is what the decks are
     * keyed on — "ist" is rank 2, but the word a learner studies is "sein", so
     * taking the surface form would rank the wrong entry. */
    let n = 0;
    for (const block of t.split(/\n\|-/)) {
      const fields = block.split("\n").filter((l) => l.startsWith("|")).map((l) => l.slice(1).trim());
      if (!fields.length) continue;
      const rank = /^(\d+)\.?$/.exec(fields[0]);
      if (!rank) continue;
      const r = Number(rank[1]) + offset;

      const words = [];
      const tmpl = new RegExp(`\\{\\{l\\|${lang}\\|([^}|]+)`, "g");
      for (const f of fields.slice(1)) for (const m of f.matchAll(tmpl)) words.push(m[1]);
      const lemma = fields.length >= 5 ? /\[\[([^\]|#]+)/.exec(fields[4]) : null;
      if (lemma) words.push(lemma[1]);
      else if (!words.length && fields[1] && !/^\d/.test(fields[1])) words.push(fields[1]);

      for (const w of words) {
        const word = w.trim().toLowerCase();
        if (!word || /[\[\]{}|#]/.test(word)) continue;
        n += 1;
        if (!ranks[lang][word] || r < ranks[lang][word]) ranks[lang][word] = r;
      }
    }
    console.log(`  ${title} — ${n} entries`);
    await sleep(300);
  }
  console.log(`${lang}: ${Object.keys(ranks[lang]).length} ranked words`);
}
writeFileSync("scripts/freq/ranks.json", JSON.stringify(ranks));
