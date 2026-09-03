/* Offline integrity checks for the word-building section.
 *
 * The important one is the segmentation: "<ver =sprech .en" has to actually
 * spell versprechen. Getting that wrong is invisible on screen — the parts
 * render happily — but it teaches a word that does not exist, so it is checked
 * rather than trusted. Roots that shift vowel (nehm/nahm, komm/kunft) are
 * expected not to reassemble and are declared per word.
 */
import { FAMILIES, AFFIXES, AFFIX_GROUPS, ENGLISH_DEMO, PART_KINDS } from "../src/data/morphology.js";
import { segment, spell, familyWords, buildFamilyQuiz } from "../src/lib/morphology.js";

const problems = [];
const fail = (m) => problems.push(m);
const strip = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");

const ids = new Set();
for (const g of Object.keys(AFFIX_GROUPS)) {
  const grp = AFFIX_GROUPS[g];
  for (const f of ["lang", "label", "kind", "blurb"]) if (!grp[f]) fail(`AFFIX_GROUPS.${g}: missing ${f}`);
  if (!PART_KINDS[grp.kind]) fail(`AFFIX_GROUPS.${g}: kind "${grp.kind}" is not a PART_KIND`);
  if (!AFFIXES.some((a) => a.group === g)) fail(`AFFIX_GROUPS.${g}: no affixes in it`);
}
for (const a of AFFIXES) {
  if (ids.has(a.id)) fail(`duplicate affix id ${a.id}`);
  ids.add(a.id);
  if (!AFFIX_GROUPS[a.group]) fail(`${a.id}: unknown group ${a.group}`);
  for (const f of ["form", "sense"]) if (!a[f]) fail(`${a.id}: missing ${f}`);
  /* Two examples is a coincidence; a learner needs to see the affix do the
   * same thing more than once before it is a rule. */
  if (!a.ex || a.ex.length < 2) fail(`${a.id}: needs at least 2 examples, has ${a.ex?.length ?? 0}`);
  for (const e of a.ex || []) if (e.length !== 3 || e.some((x) => !x)) fail(`${a.id}: malformed example ${JSON.stringify(e)}`);
}

const famIds = new Set();
let checkedSegments = 0;
for (const fam of FAMILIES) {
  if (famIds.has(fam.id)) fail(`duplicate family id ${fam.id}`);
  famIds.add(fam.id);
  if (!["fr", "de"].includes(fam.lang)) fail(`${fam.id}: lang must be fr or de`);
  for (const f of ["root", "gloss", "base"]) if (!fam[f]) fail(`${fam.id}: missing ${f}`);
  if (fam.members.length < 5) fail(`${fam.id}: ${fam.members.length} members — too thin to show a pattern`);

  const seen = new Set();
  for (const w of familyWords(fam)) {
    if (!w.w || !w.e) { fail(`${fam.id}: a member with no word or gloss`); continue; }
    if (seen.has(w.w)) fail(`${fam.id}: ${w.w} listed twice`);
    seen.add(w.w);
    const parts = segment(w.p);
    if (!parts.length) { fail(`${fam.id}/${w.w}: no segmentation`); continue; }
    if (!parts.some((p) => p.kind === "root")) fail(`${fam.id}/${w.w}: segmentation has no root`);
    checkedSegments += 1;
    /* The segmentation must spell the word. Two things legitimately break
     * that and declare it with `shift`: roots whose vowel moves (komm/kunft,
     * nehm/nahm), and French joins that double a consonant to protect its
     * sound (re + sentir → ressentir). */
    if (!w.shift && strip(spell(w.p)) !== strip(w.w)) {
      fail(`${fam.id}/${w.w}: segmentation "${w.p}" spells "${spell(w.p)}"`);
    }
    if (w.g && !["der", "die", "das", "le", "la"].includes(w.g)) fail(`${fam.id}/${w.w}: odd gender "${w.g}"`);
    if (w.g && fam.lang === "fr" && !["le", "la"].includes(w.g)) fail(`${fam.id}/${w.w}: French gender must be le/la`);
    if (w.g && fam.lang === "de" && !["der", "die", "das"].includes(w.g)) fail(`${fam.id}/${w.w}: German gender must be der/die/das`);
    /* Any German word carrying a gender is a noun, and German nouns are
     * capitalised. A lowercase one is a typo that renders perfectly and looks
     * right to anyone not reading closely — `vorschlag` got all the way to the
     * online check before anything noticed. */
    if (w.g && fam.lang === "de" && w.w[0] !== w.w[0].toUpperCase()) {
      fail(`${fam.id}/${w.w}: German nouns are capitalised`);
    }
  }

  const q = buildFamilyQuiz(fam, 0);
  if (!q) fail(`${fam.id}: no quiz can be built`);
  else if (!q.options.some((o) => o.w === q.answer)) fail(`${fam.id}: quiz has no correct option`);
}

for (const w of [ENGLISH_DEMO, ...ENGLISH_DEMO.family]) {
  const word = w.word || w.w;
  if (strip(spell(w.p)) !== strip(word)) fail(`English demo/${word}: "${w.p}" spells "${spell(w.p)}"`);
}

if (problems.length) {
  console.error(`morphology: ${problems.length} problem(s)`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`morphology ok — ${AFFIXES.length} affixes, ${FAMILIES.length} families, ${checkedSegments} segmentations spell their words`);
