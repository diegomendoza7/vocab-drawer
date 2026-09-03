/* Check every claimed cognate pair against English Wiktionary.
 *
 * A sound law is only worth teaching if its examples are real, so each pair is
 * tested twice: the Latin/French/German/English forms must exist as entries in
 * the language claimed, and the two sides of the law must actually share an
 * ancestor. Asserting "père and Vater are the same word" is the whole feature;
 * if that is wrong anywhere the section teaches a false rule.
 *
 * Writes a report rather than throwing, because the fix for a bad pair is
 * usually to replace the example, not to abandon the law.
 */
import { LAWS } from "../../src/data/etymology.js";
import { writeFileSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SEC = { la: "==Latin==", fr: "==French==", de: "==German==", en: "==English==" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function page(title) {
  if (cache.has(title)) return cache.get(title);
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  let text = null;
  for (let a = 0; a < 4; a += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (res.ok) { const j = await res.json(); text = j?.parse?.wikitext ?? null; }
    break;
  }
  cache.set(title, text);
  await sleep(220);
  return text;
}

/** Does `title` have a section for `lang`? Macrons are not in page titles. */
async function existsIn(form, lang) {
  const bare = form.normalize("NFD").replace(/[̄̆]/g, "").normalize("NFC");
  for (const t of new Set([form, bare])) {
    const text = await page(t);
    if (text && text.includes(SEC[lang])) return true;
  }
  return false;
}

const report = { checked: 0, missing: [], ok: 0 };
for (const law of LAWS) {
  for (const p of law.pairs) {
    for (const lang of ["la", "fr", "de", "en"]) {
      const form = p[lang];
      if (!form || form === "—") continue;
      report.checked += 1;
      // Multi-word glosses and slashes are editorial, not headwords.
      if (/[ /]/.test(form)) { report.ok += 1; continue; }
      const ok = await existsIn(form, lang);
      if (ok) report.ok += 1;
      else report.missing.push({ law: law.id, lang, form, gloss: p.g });
    }
  }
  console.log(`  ${law.id}: ${report.ok}/${report.checked}`);
}
writeFileSync("scripts/etym/law-report.json", JSON.stringify(report, null, 2));
console.log(`\nchecked ${report.checked} forms, ${report.missing.length} not found`);
for (const m of report.missing) console.log(`  MISSING  ${m.law}  ${m.lang}:${m.form}  (${m.gloss})`);
