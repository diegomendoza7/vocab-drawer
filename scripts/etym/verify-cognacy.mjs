/* Prove each law's pairs are really related — with the right test per group,
 * and tolerant of how Wiktionary chooses to cite a form.
 *
 * Three different claims need three different tests:
 *   grimm  cousins — both must reach the same Proto-Indo-European root.
 *   hg     cousins at a shallower depth — both must reach the same Proto-Germanic form.
 *   gallo  ANCESTRY, not cousinhood — the French word must descend from that
 *          Latin one, which often takes two hops because the French page cites
 *          only Old French and the Latin sits one page further back.
 *
 * Three citation conventions have to be absorbed or the check reports noise:
 *   - Wiktionary lemmatises Latin verbs at the first-person singular (cantō),
 *     while dictionaries and this app cite the infinitive (cantāre). Same verb.
 *   - Nouns are lemmatised at the nominative (lectus) where French descends
 *     from the accusative (lectum). Same noun.
 *   - Several forms are cited as alternates in one string ("ek, ik").
 * So Latin forms are compared on their stem, and citation strings are split.
 */
import { LAWS } from "../../src/data/etymology.js";
import { writeFileSync } from "node:fs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const SEC = { la: "==Latin==", fr: "==French==", de: "==German==", en: "==English==", fro: "==Old French==", frm: "==Middle French==" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function wikitext(title) {
  if (cache.has(title)) return cache.get(title);
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  let text = null;
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (r.ok) { const j = await r.json(); text = j?.parse?.wikitext ?? null; }
    break;
  }
  cache.set(title, text);
  await sleep(200);
  return text;
}

const strip = (s) => String(s).replace(/\[\[|\]\]|\*/g, "").trim()
  .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-–—]+$/, "");
/** Split a citation string that holds more than one form. */
const forms = (s) => s.split(/[,~]/).map(strip).filter(Boolean);
/** Latin, minus the inflection Wiktionary and dictionaries disagree about. */
const laStem = (s) => strip(s).replace(/(are|ere|ire|īre|us|um|em|is|os|o|a)$/u, "");
/* Third-declension nouns cite a nominative whose stem differs from the
 * accusative French descends from — lac vs lactem — and verbs cite sapiō where
 * a dictionary cites sapere. Both agree on a leading stem, so compare there. */
const laAgree = (a, b) => {
  const x = laStem(a), y = laStem(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const n = Math.min(x.length, y.length);
  return n >= 3 && x.slice(0, n) === y.slice(0, n);
};

async function section(form, lang) {
  const bare = form.normalize("NFD").replace(/[̄̆]/g, "").normalize("NFC");
  for (const t of new Set([form, bare, bare[0].toUpperCase() + bare.slice(1)])) {
    const text = await wikitext(t);
    if (!text) continue;
    const i = text.indexOf(SEC[lang]);
    if (i < 0) continue;
    const nxt = text.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
    return nxt < 0 ? text.slice(i) : text.slice(i, i + 4 + nxt);
  }
  return null;
}

/* Wiktionary increasingly writes ancestry with {{etymon|…|tree=1}}, which
 * lists steps as "lang:form" and renders the tree from structured data rather
 * than from inline {{inh}} calls. A parser that only reads {{inh}} sees those
 * pages as silent, which is how a perfectly well-sourced entry ends up
 * reported as unproven. */
function etymonSteps(sec) {
  const out = [];
  for (const m of sec.matchAll(/\{\{etymon\|([^}]*)\}\}/g)) {
    for (const piece of m[1].split("|")) {
      const hit = /^([a-z-]+(?:-pro)?):([^<|]+)/.exec(piece.trim());
      if (hit) out.push({ lang: hit[1], form: strip(hit[2]) });
    }
  }
  return out;
}

async function protoForms(form, lang, proto) {
  const sec = await section(form, lang);
  if (!sec) return new Set();
  const out = new Set();
  for (const m of sec.matchAll(new RegExp(`\\{\\{(?:inh|der|m|cog)\\+?\\s*\\|[^|}]*\\|${proto}\\|([^}|]+)`, "g"))) {
    for (const f of forms(m[1])) out.add(f);
  }
  for (const st of etymonSteps(sec)) if (st.lang === proto) out.add(st.form);
  return out;
}

function rootsAgree(a, b) {
  for (const x of a) for (const y of b) {
    if (x === y) return x;
    if (x.length >= 4 && (y.startsWith(x) || x.startsWith(y))) return x.length < y.length ? x : y;
    // Ablaut: *aplaz / *apluz, *h₁rudʰrós / *h₁rowdʰós differ only in the vowel
    // grade, which is variation inside one root, not two roots.
    const skel = (s) => s.replace(/[aeiouāēīōū]/g, "");
    if (x.length >= 4 && skel(x) === skel(y)) return x;
  }
  return null;
}

/** Latin ancestors cited by a French word, following Old/Middle French one hop back. */
async function latinAncestors(frForm) {
  const seen = new Set();
  const sec = await section(frForm, "fr");
  if (!sec) return seen;
  for (const m of sec.matchAll(/\{\{(?:inh|der|bor)\+?\s*\|fr\|(?:la|la-lat|la-vul|la-med|la-ecc|LL\.|VL\.|ML\.)\|([^}|]+)/g)) forms(m[1]).forEach((f) => seen.add(f));
  // The French page often stops at Old French; the Latin is on that page.
  for (const st of etymonSteps(sec)) if (st.lang === "la" || st.lang === "la-lat" || st.lang === "la-vul") seen.add(st.form);
  const hops = [];
  for (const m of sec.matchAll(/\{\{(?:inh|der)\+?\s*\|fr\|(fro|frm)\|([^}|]+)/g)) hops.push([m[1], forms(m[2])[0]]);
  for (const st of etymonSteps(sec)) if (st.lang === "fro" || st.lang === "frm") hops.push([st.lang, st.form]);
  for (const [lang, form] of hops.slice(0, 2)) {
    if (!form) continue;
    const s2 = await section(form, lang);
    if (!s2) continue;
    for (const m of s2.matchAll(/\{\{(?:inh|der|bor)\+?\s*\|(?:fro|frm)\|(?:la|la-lat|la-vul|la-med|la-ecc|LL\.|VL\.|ML\.)\|([^}|]+)/g)) forms(m[1]).forEach((f) => seen.add(f));
    for (const st of etymonSteps(s2)) if (st.lang.startsWith("la")) seen.add(st.form);
  }
  return seen;
}

const rows = [];
for (const law of LAWS) {
  for (const p of law.pairs) {
    const push = (verdict, extra = {}) => rows.push({ law: law.id, group: law.group, gloss: p.g, verdict, ...extra });

    if (law.group === "gallo") {
      if (!p.la || p.la === "—" || !p.fr || p.fr === "—") { push("n/a"); continue; }
      const cited = await latinAncestors(p.fr);
      const ok = [...cited].some((c) => laAgree(c, p.la) || c === strip(p.la));
      push(ok ? "descends" : "DOES NOT DESCEND", { claim: `fr:${p.fr} < la:${p.la}`, saw: [...cited].slice(0, 5) });
      continue;
    }

    const proto = law.group === "hg" ? "gem-pro" : "ine-pro";
    const left = law.group === "hg"
      ? (p.en && p.en !== "—" ? ["en", p.en] : null)
      : [["la", p.la], ["fr", p.fr]].find(([, f]) => f && f !== "—" && !/[ /]/.test(f));
    const right = [["de", p.de]].find(([, f]) => f && f !== "—" && !/[ /]/.test(f))
      || (law.group !== "hg" && p.en && p.en !== "—" && !/[ /]/.test(p.en) ? ["en", p.en] : null);
    if (!left || !right || left[0] === right[0]) { push("n/a"); continue; }

    const a = await protoForms(left[1], left[0], proto);
    const b = await protoForms(right[1], right[0], proto);
    const shared = rootsAgree(a, b);
    push(shared ? "cognate" : (a.size && b.size ? "DIFFERENT ROOTS" : "unproven"),
      { claim: `${left[0]}:${left[1]} ~ ${right[0]}:${right[1]}`, root: shared || null,
        saw: shared ? undefined : { [left[0]]: [...a].slice(0, 3), [right[0]]: [...b].slice(0, 3) } });
  }
}
writeFileSync("scripts/etym/cognacy-report.json", JSON.stringify(rows, null, 2));
const ok = rows.filter((r) => r.verdict === "cognate" || r.verdict === "descends");
const bad = rows.filter((r) => r.verdict.startsWith("D"));
const unp = rows.filter((r) => r.verdict === "unproven");
console.log(`verified ${ok.length}, contradicted ${bad.length}, unproven ${unp.length}, n/a ${rows.filter(r=>r.verdict==="n/a").length}`);
for (const r of bad) console.log(` BAD  ${r.law}  ${r.gloss}  ${r.claim}  saw=${JSON.stringify(r.saw)}`);
console.log("--- unproven (source is silent, not contradicting) ---");
for (const r of unp) console.log(` ?    ${r.law}  ${r.gloss}  ${r.claim}`);
