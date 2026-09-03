/* Add the English limb to each family.
 *
 * The English cognate is usually the family's own gloss — the root that gave
 * French frère and German Bruder gave English "brother" — so the gloss is the
 * first candidate. But a gloss is a translation, not a claim of descent:
 * French "chat" glosses as "cat" and the two are related, while French "pause"
 * glosses as "pause" because English borrowed it, which is a different fact.
 *
 * So nothing is asserted. Each candidate's own chain is harvested and kept
 * only if it genuinely shares an ancestor with the family — the same
 * branchPoint the screen uses. A candidate that does not merge is dropped, and
 * that family simply keeps two limbs.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { chainRungs, branchPoint } from "../../src/lib/etymology.js";
import { walkChain } from "./walk.mjs";

const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const OUT = "scripts/etym/english.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chains = JSON.parse(readFileSync("scripts/etym/chains.json", "utf8"));
const fams = JSON.parse(readFileSync("scripts/etym/families.json", "utf8")).cross;
const done = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

/* Two parsers, because they fail in opposite places and neither is enough.
 *
 * Reading one page's inline {{inh}} chain works until the page uses
 * {{etymon|…|tree=1}} and names only its parent — which is what `father`, the
 * section's flagship, now does. Walking page by page fixes that, and then dies
 * wherever a cited spelling has no page of its own: the Middle English entry
 * for brother points at an Old English form that 404s, and the walk stops
 * three rungs short.
 *
 * So both are tried and the caller keeps whichever actually merges into the
 * family. Neither is trusted over the other.
 */
async function englishChains(word) {
  const out = [];
  const walked = await walkChain(word, "en");
  if (walked.length) out.push(walked);
  const inline = await inlineChain(word);
  if (inline) out.push(inline);
  return out;
}

const STEP = /\{\{(inh|der|bor|inh\+|der\+|bor\+)\s*\|([^}|]*)\|([^}|]*)(?:\|([^}|]*))?/g;
async function inlineChain(word) {
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(word) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  let text = null;
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (r.ok) { const j = await r.json(); text = j?.parse?.wikitext ?? null; }
    break;
  }
  await sleep(180);
  if (!text) return null;
  const i = text.indexOf("==English==");
  if (i < 0) return null;
  const nxt = text.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
  const sec = nxt < 0 ? text.slice(i) : text.slice(i, i + 4 + nxt);
  const e = sec.search(/===+\s*Etymology/);
  if (e < 0) return null;
  const rest = sec.slice(e);
  const end = rest.slice(3).search(/\n===+[^=]/);
  const block = end < 0 ? rest : rest.slice(0, end + 3);
  const steps = [];
  STEP.lastIndex = 0;
  let m;
  while ((m = STEP.exec(block)) !== null) {
    const from = (m[3] || "").trim();
    if (from) steps.push({ kind: m[1].replace("+", ""), lang: from, form: (m[4] || "").trim() });
  }
  return steps.length ? steps : null;
}

let kept = 0, dropped = 0;
for (const fam of fams) {
  const key = `${fam.layer}:${fam.form}`;
  if (done[key] !== undefined) continue;

  // Candidates: any recorded English cognate, then the gloss's first word.
  const cands = [];
  for (const m of fam.members) {
    for (const c of (chains[`${m.lang}:${m.t}`]?.cognates || [])) if (c.lang === "en" && c.form) cands.push(c.form);
  }
  const gloss = (fam.members[0]?.e || "").split(/[,;/(]/)[0].trim().replace(/^to\s+/, "");
  if (gloss && /^[a-zA-Z-]+$/.test(gloss)) cands.push(gloss);

  let hit = null;
  const other = fam.members.map((m) => chains[`${m.lang}:${m.t}`]).filter(Boolean);
  for (const cand of [...new Set(cands)]) {
    for (const chain of await englishChains(cand)) {
      // Kept only if it really meets the family, at the same ancestor.
      const enRungs = chainRungs(chain, "en");
      const meets = other.some((o) => {
        const fork = branchPoint(enRungs, chainRungs(o.chain, o.lang));
        return fork && fork.layer === fam.layer;
      });
      if (meets) { hit = { word: cand, chain }; break; }
    }
    if (hit) break;
  }
  done[key] = hit;
  if (hit) { kept += 1; console.log(`  ${fam.form.padEnd(14)} EN ${hit.word}`); }
  else { dropped += 1; console.log(`  ${fam.form.padEnd(14)} — no English cognate that merges`); }
  writeFileSync(OUT, JSON.stringify(done));
}
console.log(`\n${kept} families gain an English limb, ${dropped} keep two.`);
