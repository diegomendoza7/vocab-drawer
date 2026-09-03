/* Does each cell of a law's pair actually MEAN the row's stated meaning?
 *
 * The pairs table prints one meaning per row and four language columns under
 * it, which asserts that every cell means that thing. For inherited pairs like
 * pater/père/Vater/father it does. But several rows reach for an English word
 * that merely *descends from* the Latin — cauldron for calidus "hot" — and
 * those are a different claim wearing the same layout.
 *
 * So every cell is checked against the row's gloss the same way the morphology
 * verifier checks its own: fetch the entry, and see whether any content word of
 * the stated meaning turns up in its definitions.
 */
import { LAWS } from "../../src/data/etymology.js";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SEC = { la: "==Latin==", fr: "==French==", de: "==German==", en: "==English==" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function defs(word, lang, depth = 0) {
  const bare = word.normalize("NFD").replace(/[̄̆]/g, "").normalize("NFC");
  for (const t of new Set([word, bare, bare[0].toUpperCase() + bare.slice(1)])) {
    const key = `${lang}:${t}`;
    let sec = cache.get(key);
    if (sec === undefined) {
      const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
        + encodeURIComponent(t) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
      let text = null;
      for (let a = 0; a < 4; a += 1) {
        const r = await fetch(url, { headers: { "User-Agent": UA } });
        if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
        if (r.ok) { const j = await r.json(); text = j?.parse?.wikitext ?? null; }
        break;
      }
      sec = null;
      if (text) {
        const i = text.indexOf(SEC[lang]);
        if (i >= 0) {
          const nxt = text.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
          sec = nxt < 0 ? text.slice(i) : text.slice(i, i + 4 + nxt);
        }
      }
      cache.set(key, sec);
      await sleep(400);
    }
    if (sec) {
      const lines = sec.split("\n").filter((l) => l.startsWith("# ") && !l.startsWith("#*"));
      /* Latin is cited the way a dictionary cites it — the accusative `dentem`,
       * the infinitive `cantāre` — and Wiktionary puts those at their own page
       * saying only "inflection of dēns". The meaning is one page further on,
       * so an audit that stops here is reading the wrong page and calls every
       * Latin cell a mismatch. */
      /* Only when the page is NOTHING BUT inflections. Latin `canis` is both
       * the noun "dog" and a case form of `cānus` "white", and following the
       * inflection from a page that also has the real definition throws the
       * real one away — which is how "hound" came to be reported as meaning
       * "hoary". */
      const allInflections = lines.length > 0
        && lines.every((l) => /\{\{infl(?:ection)? of\|/.test(l));
      const infl = /\{\{inflection of\|la\|([^}|]+)|\{\{infl of\|la\|([^}|]+)/.exec(lines.join(" "));
      if (allInflections && infl && depth < 1) {
        const lemma = (infl[1] || infl[2]).trim();
        const deeper = await defs(lemma, lang, depth + 1);
        if (deeper) return deeper;
      }
      return lines.join(" ").toLowerCase();
    }
  }
  return null;
}

const STOP = new Set(["the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "be", "is",
  "it", "up", "out", "off", "with", "something", "someone", "one", "s", "sth", "sb"]);
const content = (g) => g.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
  .filter((w) => w.length > 2 && !STOP.has(w));

const bad = [];
for (const law of LAWS) {
  for (const p of law.pairs) {
    for (const lang of ["la", "fr", "de", "en"]) {
      const form = p[lang];
      if (!form || form === "—" || /[ /]/.test(form)) continue;
      const d = await defs(form, lang);
      if (d === null) { bad.push({ law: law.id, g: p.g, lang, form, why: "no entry" }); continue; }
      /* A word defined by description rather than translation — "I" as "the
       * speaker or writer", "to" as "a particle marking the infinitive" — can
       * never match its own gloss textually. Reporting those as wrong buries
       * the real findings, so they are called unresolvable instead. */
      if (/\{\{(?:non-gloss|n-g|ng)\b/.test(d) && d.length < 400) continue;
      const mine = content(p.g);
      /* A gloss that reduces to nothing — "I", "to", "do", "for", "out" — has
       * no content word to look for, so the test cannot run. Reporting those
       * as failures was most of the noise in the first two runs. Likewise a
       * word that appears in its own definition only as itself. */
      if (!mine.length) continue;
      const hit = mine.some((w) => d.includes(w.slice(0, Math.max(4, w.length - 2))));
      if (!hit) bad.push({ law: law.id, g: p.g, lang, form, why: "means something else", saw: d.slice(0, 90) });
    }
  }
  console.log(`  ${law.id} checked`);
}
import { writeFileSync } from "node:fs";
const lines = [`${bad.length} cells do not carry the row's stated meaning:`, ""];
for (const b of bad) lines.push(`  ${b.law.padEnd(12)} "${b.g}"  ${b.lang}:${b.form.padEnd(12)} ${b.why}  ${b.saw ? "— " + b.saw : ""}`);
writeFileSync("scripts/etym/gloss-audit.txt", lines.join("\n"));
console.log(lines.join("\n"));
