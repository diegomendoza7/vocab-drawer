/* Offline integrity checks for the etymology section.
 *
 * The network verification (scripts/etym/verify-*.mjs) proves the *content* is
 * true and is run by hand, because a build should not fail when Wiktionary is
 * down. This checks the things that can rot silently as the data is edited:
 * a law with too few examples to generalise from, a quiz that cannot be built,
 * a layer code with no label, a family pointing at a word that is not in the
 * decks any more.
 */
import { LAWS, LAW_GROUPS, LAYERS, CODE_TO_LAYER } from "../src/data/etymology.js";
import { CHAINS, FAMILIES } from "../src/data/etymology-chains.js";
import { buildLawQuiz, rungsFromLayers, mergeChains, rootAt } from "../src/lib/etymology.js";
import { DATA } from "../src/data/vocab.js";

const problems = [];
const fail = (m) => problems.push(m);

/* Every headword in the core decks, to catch a family that outlived its word. */
const deck = new Set();
for (const lang of ["fr", "de"]) {
  for (const lv of ["A1", "A2", "B1", "B2"]) {
    for (const theme of DATA[lang]?.[lv] || []) for (const w of theme.words || []) deck.add(`${lang}:${w.t}`);
  }
}

const ids = new Set();
for (const law of LAWS) {
  if (ids.has(law.id)) fail(`duplicate law id: ${law.id}`);
  ids.add(law.id);
  if (!LAW_GROUPS[law.group]) fail(`${law.id}: unknown group "${law.group}"`);
  for (const f of ["name", "rule", "why", "from", "to"]) if (!law[f]) fail(`${law.id}: missing ${f}`);
  /* Three is the floor for a rule: two examples are a coincidence, three is a
   * pattern a learner can generalise from. */
  if (law.pairs.length < 3) fail(`${law.id}: only ${law.pairs.length} pairs — too few to show a pattern`);
  for (const p of law.pairs) {
    if (!p.g) fail(`${law.id}: a pair with no gloss`);
    const real = ["la", "fr", "de", "en"].filter((c) => p[c] && p[c] !== "—");
    if (real.length < 2) fail(`${law.id}/${p.g}: needs two languages to show anything, has ${real.length}`);
    /* `kin` is a word from the same root that does NOT mean what the row says —
     * English cauldron for Latin calidus "hot". It carries its own gloss
     * precisely because the row's one does not apply to it, so a bare string
     * would reintroduce the error it exists to fix. */
    if (p.kin !== undefined) {
      if (!Array.isArray(p.kin) || !p.kin.length) fail(`${law.id}/${p.g}: kin must be a non-empty list`);
      else for (const k of p.kin) {
        if (!Array.isArray(k) || k.length < 2 || !k[0] || !k[1]) {
          fail(`${law.id}/${p.g}: each kin needs [word, its own meaning, lang?], got ${JSON.stringify(k)}`);
          continue;
        }
        const lang = k[2] || "en";
        if (!["la", "fr", "de", "en"].includes(lang)) fail(`${law.id}/${p.g}: kin ${k[0]} has unknown language "${lang}"`);
        /* The same word cannot be both "means what the row says" and "means
         * something else" — that is precisely the confusion kin exists to end. */
        if (k[0] === p[lang]) fail(`${law.id}/${p.g}: ${k[0]} is listed as both the ${lang} cognate and a same-root relative`);
      }
    }
  }
  // The drill has to be buildable in whichever language the section asks in.
  const ask = law.group === "gallo" ? "fr" : "de";
  const q = buildLawQuiz(law, 0, ask);
  if (!q) fail(`${law.id}: no ${ask} quiz can be built`);
  else if (!q.answer || q.answer === "—") fail(`${law.id}: quiz answer is blank`);
}

for (const [code, layer] of Object.entries(CODE_TO_LAYER)) {
  if (!LAYERS[layer]) fail(`CODE_TO_LAYER maps ${code} to "${layer}", which has no LAYERS entry`);
}
for (const [id, l] of Object.entries(LAYERS)) {
  if (!l.short || !l.label) fail(`LAYERS.${id}: needs both a short and a full label`);
}

let drawable = 0;
let withEnglish = 0;
for (const f of FAMILIES) {
  if (!LAYERS[f.layer]) fail(`family ${f.layer}:${f.form}: unknown layer`);
  if (f.members.length < 2) fail(`family ${f.form}: ${f.members.length} member`);
  const langs = new Set(f.members.map((m) => m.lang));
  if (!(langs.has("fr") && langs.has("de"))) fail(`family ${f.form}: shipped as cross-language but is not`);
  for (const m of f.members) {
    if (!deck.has(`${m.lang}:${m.t}`)) fail(`family ${f.form}: ${m.lang}:${m.t} is not in the decks any more`);
    if (!CHAINS[`${m.lang}:${m.t}`]) fail(`family ${f.form}: no chain for ${m.lang}:${m.t}`);
  }
  // The whole point of the screen is the fork, so every family must produce one.
  const fr = f.members.find((m) => m.lang === "fr");
  const de = f.members.find((m) => m.lang === "de");
  const at = (lang, chain) => ({ lang, rungs: rootAt(rungsFromLayers(chain.c, lang), f.layer, f.form) });
  const entries = [at("fr", CHAINS[`fr:${fr.t}`]), at("de", CHAINS[`de:${de.t}`])];
  if (f.en) {
    if (!CHAINS[`en:${f.en}`]) fail(`family ${f.form}: claims English ${f.en} but ships no chain for it`);
    else entries.push(at("en", CHAINS[`en:${f.en}`]));
  }
  const t = mergeChains(entries);
  if (t.forest) fail(`family ${f.form}: ${fr.t}/${de.t} share no ancestor to fork at`);
  else {
    drawable += 1;
    /* English joins where it can, but NOT always under German. Inherited
     * vocabulary makes it German's sibling; a Latin borrowing like `tradition`
     * was taken independently by all three (English via French), and three
     * limbs from Latin is the true picture there. Asserting the nesting was
     * wrong — what matters is only that it merges at all. */
    if (f.en) withEnglish += 1;
  }
}

for (const [key, entry] of Object.entries(CHAINS)) {
  if (!entry.c?.length) fail(`chain ${key}: empty`);
  for (const step of entry.c || []) if (!LAYERS[step.l]) fail(`chain ${key}: unknown layer "${step.l}"`);
}

if (problems.length) {
  console.error(`etymology: ${problems.length} problem(s)`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`etymology ok — ${LAWS.length} laws, ${LAWS.reduce((n, l) => n + l.pairs.length, 0)} pairs, ${FAMILIES.length} families (${drawable} draw a fork, ${withEnglish} with an English limb), ${Object.keys(CHAINS).length} chains`);
