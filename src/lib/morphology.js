/* Word building: parsing the segmentation notation, and the drill.
 *
 * The data writes a segmentation as "<ver =sprech .en" because that stays
 * legible in the source file, where an array of {text, kind} objects would
 * bury 145 words in punctuation. Everything downstream wants objects, so the
 * translation happens here, once, and is tested.
 */

import { FAMILIES, AFFIXES } from "../data/morphology.js";

const SIGIL = { "<": "prefix", "=": "root", ">": "suffix", ".": "ending" };

/**
 * "<ver =sprech .en" → [{text:"ver",kind:"prefix"}, …]
 *
 * A piece with no sigil is treated as a root: the root is the one part every
 * word has, so it is the safe thing to assume when the notation is incomplete,
 * and `checkMorphology` fails the build if a word ends up with none.
 */
export function segment(notation) {
  const out = [];
  for (const piece of String(notation || "").trim().split(/\s+/)) {
    if (!piece) continue;
    const kind = SIGIL[piece[0]];
    out.push(kind ? { text: piece.slice(1), kind } : { text: piece, kind: "root" });
  }
  return out;
}

/** The word the segmentation spells, for checking it against the headword. */
export function spell(notation) {
  return segment(notation).map((p) => p.text).join("");
}

/** Every part of a family, base first — what the family screen lists. */
export function familyWords(family) {
  return [{ ...family.base, base: true }, ...family.members];
}

/**
 * Which affixes a family actually uses, so a family can link to the rules
 * behind it rather than to the whole list.
 */
export function affixesUsed(family, lang) {
  const used = new Set();
  for (const w of familyWords(family)) {
    for (const part of segment(w.p)) {
      if (part.kind !== "prefix" && part.kind !== "suffix") continue;
      used.add(part.text);
    }
  }
  return AFFIXES.filter((a) => {
    if (!a.id.startsWith(`${lang}-`)) return false;
    // "re- / ré-" and "-heit / -keit" list their variants; match any of them.
    return a.form.split("/").some((v) => used.has(v.trim().replace(/-/g, "")));
  });
}

/**
 * One question: given the root, produce the word that means X.
 *
 * Recognition would be easier to build and would teach much less. The point of
 * the section is that a known root plus a known prefix yields a word you were
 * never taught, so the drill asks for exactly that — and draws the wrong
 * options from the *same family*, so the only way through is the prefix.
 */
export function buildFamilyQuiz(family, index) {
  const pool = family.members.filter((m) => m.e && m.w);
  if (pool.length < 4) return null;
  const i = ((index % pool.length) + pool.length) % pool.length;
  const target = pool[i];
  const others = pool.filter((m) => m.w !== target.w);
  /* Rotated by the index rather than shuffled, so re-rendering cannot move the
   * options under the cursor between reading them and clicking one. */
  const picks = [];
  for (let k = 0; k < 3 && k < others.length; k += 1) picks.push(others[(i + k * 2 + 1) % others.length]);
  const options = [target, ...picks.filter((p, k, a) => a.findIndex((x) => x.w === p.w) === k && p.w !== target.w)];
  if (options.length < 3) return null;
  return {
    familyId: family.id,
    root: family.root,
    rootGloss: family.gloss,
    base: family.base,
    ask: target.e,
    answer: target.w,
    options: options
      .map((o, k) => ({ ...o, k: (i + k * 7) % options.length }))
      .sort((a, b) => a.k - b.k),
  };
}

/** Count the parts of one kind — used by the checks and the legend. */
export function countKind(notation, kind) {
  return segment(notation).filter((p) => p.kind === kind).length;
}
