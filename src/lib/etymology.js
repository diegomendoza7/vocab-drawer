/* Etymology: turning Wiktionary's ancestry chains into something teachable.
 *
 * A chain arrives newest-first — français ← Old French ← Latin ← Proto-Italic
 * ← PIE — because that is the order Wiktionary writes it in. Everything here
 * keeps that order internally and reverses only at the point of drawing, where
 * oldest-first is what reads as a descent.
 *
 * The one genuinely interesting computation is `branchPoint`: given a French
 * word and a German word, find the deepest rung they share. That rung is where
 * the two languages parted company, and naming it is the whole point of the
 * section — "père and Vater are the same word, and here is the year they
 * stopped looking like it".
 */

import { CODE_TO_LAYER, LAYERS, LAWS } from "../data/etymology.js";

/* The rungs nobody ever wrote down. Drawn in italic, with an asterisk. */
const RECONSTRUCTED = new Set(["pie", "itc", "gem", "gmw"]);

/** Strip the reconstruction asterisk and surrounding noise from a cited form. */
export function bareForm(form) {
  return String(form || "").replace(/^\*+/, "").split(",")[0].trim();
}

/** Compare two cited forms as the same etymon. */
export function sameEtymon(a, b) {
  const norm = (s) => bareForm(s).toLowerCase().replace(/[-‐-―]+$/u, "");
  const x = norm(a);
  return Boolean(x) && x === norm(b);
}

/**
 * A Wiktionary chain as drawable rungs, oldest first.
 *
 * Steps whose language code we do not draw are dropped rather than rendered as
 * an unlabelled box — a tree with a mystery rung in it teaches nothing and
 * looks like a bug.
 */
export function chainRungs(chain, lang) {
  const rungs = [];
  for (const step of chain || []) {
    const layer = CODE_TO_LAYER[step.lang];
    if (!layer) continue;
    if (rungs.some((r) => r.layer === layer)) continue;      // keep the first citation of a rung
    rungs.push({ layer, form: bareForm(step.form), kind: step.kind, reconstructed: RECONSTRUCTED.has(layer) });
  }
  rungs.reverse();
  return [...rungs, { layer: lang, form: null, kind: "self", reconstructed: false, leaf: true }];
}

/**
 * The same, for a chain that already speaks in layers.
 *
 * The shipped data stores layers, not Wiktionary's codes — translating back
 * into codes just so `chainRungs` could translate them forward again would be
 * a round trip whose only purpose is to lose information.
 */
export function rungsFromLayers(steps, lang) {
  const rungs = [];
  for (const step of steps || []) {
    if (!LAYERS[step.l] || step.l === lang) continue;
    if (rungs.some((r) => r.layer === step.l)) continue;
    rungs.push({ layer: step.l, form: bareForm(step.f), kind: "inh", reconstructed: RECONSTRUCTED.has(step.l) });
  }
  rungs.reverse();
  return [...rungs, { layer: lang, form: null, kind: "self", reconstructed: false, leaf: true }];
}

/**
 * The deepest rung two chains share — where the languages forked.
 *
 * Returns null when they share nothing, which is the honest answer for a pair
 * that only looks related: `Kaffee` and `café` are both borrowings, and saying
 * so is more useful than inventing a common ancestor.
 */
export function branchPoint(rungsA, rungsB) {
  for (const a of rungsA) {
    for (const b of rungsB) {
      if (a.layer === b.layer && a.form && sameEtymon(a.form, b.form)) {
        return { layer: a.layer, form: a.form };
      }
    }
  }
  return null;
}

/**
 * Merge any number of chains into one tree, sharing every rung they agree on.
 *
 * A two-way fork was enough while the section compared French and German. It
 * is not enough once English is in, because English and German are *siblings*
 * — they part at West Germanic, long after both have parted from Latin — and
 * drawing three equal columns would flatten exactly the relationship worth
 * seeing. A tree that merges shared prefixes gets the nesting right for free,
 * and would take a fourth language without changing.
 *
 * Returns a node: { layer, form, children, langs }. `langs` is every language
 * that passes through the node, which is what lets the renderer label a limb
 * before the limb has split.
 */
export function mergeChains(entries) {
  const root = { layer: null, form: null, children: [], langs: [], reconstructed: false };
  for (const { lang, rungs } of entries) {
    let node = root;
    for (const rung of rungs) {
      if (!node.langs.includes(lang)) node.langs.push(lang);
      let child = node.children.find((c) => c.layer === rung.layer && sameEtymon(c.form, rung.form));
      if (!child) {
        child = { ...rung, children: [], langs: [] };
        node.children.push(child);
      }
      node = child;
    }
    if (!node.langs.includes(lang)) node.langs.push(lang);
  }
  /* One shared ancestor is a tree; several is a forest, which happens when the
   * words are not related at all. The virtual root says so rather than
   * inventing a parent for them. */
  return root.children.length === 1 ? root.children[0] : { ...root, forest: true };
}

/**
 * Trim a chain so it starts at the ancestor the family is named for.
 *
 * Two chains for the same root do not always reach back equally far: French
 * `bleu` is traced to PIE while German `blau` stops at Proto-Germanic, and
 * merging them raw produces two roots and no tree. The family already knows
 * which ancestor it is about, so the tree is rooted there and anything deeper
 * on one side is dropped — it is real, but it is not what this family shows.
 */
export function rootAt(rungs, layer, form) {
  const i = rungs.findIndex((r) => r.layer === layer && sameEtymon(r.form, form));
  return i < 0 ? rungs : rungs.slice(i);
}

/** The deepest node every language still shares — where the first split happens. */
export function trunkEnd(node) {
  let n = node;
  while (n.children.length === 1) n = n.children[0];
  return n;
}

/**
 * Split a pair of chains at their fork, for drawing.
 *
 * `shared` is the trunk, `left`/`right` the two limbs. Drawing the trunk once
 * rather than twice is the difference between a tree and two lists side by
 * side — and the trunk is the part the learner is supposed to remember.
 */
export function forkedTree(rungsA, rungsB) {
  const fork = branchPoint(rungsA, rungsB);
  if (!fork) return { shared: [], left: rungsA, right: rungsB, fork: null };
  const cut = (rungs) => {
    const i = rungs.findIndex((r) => r.layer === fork.layer && sameEtymon(r.form, fork.form));
    return i < 0 ? rungs : rungs.slice(i + 1);
  };
  const iA = rungsA.findIndex((r) => r.layer === fork.layer && sameEtymon(r.form, fork.form));
  return { shared: rungsA.slice(0, iA + 1), left: cut(rungsA), right: cut(rungsB), fork };
}

/** Group harvested words by the deepest ancestor they share, biggest family first. */
export function buildFamilies(entries, { minSize = 2 } = {}) {
  const byEtymon = new Map();
  for (const e of entries) {
    for (const step of e.chain || []) {
      const layer = CODE_TO_LAYER[step.lang];
      if (!layer || layer === "fr" || layer === "de") continue;
      const form = bareForm(step.form);
      if (!form || form.length < 2) continue;
      const key = `${layer}:${form.toLowerCase()}`;
      if (!byEtymon.has(key)) byEtymon.set(key, { key, layer, form, members: [] });
      const fam = byEtymon.get(key);
      if (!fam.members.some((m) => m.lang === e.lang && m.t === e.t)) {
        fam.members.push({ lang: e.lang, t: e.t, e: e.e, level: e.level });
      }
    }
  }
  return [...byEtymon.values()]
    .filter((f) => f.members.length >= minSize)
    .sort((a, b) => b.members.length - a.members.length
      || LAYER_DEPTH(a.layer) - LAYER_DEPTH(b.layer)
      || a.form.localeCompare(b.form));
}

const DEPTH = ["pie", "itc", "gem", "gmw", "la", "goh", "fro", "gmh", "frm", "grc", "ar", "frk", "ang", "en", "fr", "de"];
function LAYER_DEPTH(layer) { const i = DEPTH.indexOf(layer); return i < 0 ? 99 : i; }

/** Families that reach across the fork — the ones that actually prove the point. */
export function crossLingual(families) {
  return families.filter((f) => f.members.some((m) => m.lang === "fr") && f.members.some((m) => m.lang === "de"));
}

/**
 * One question from a sound law: hide a form, show the rest as worked examples.
 *
 * The exercise is transfer, not recall — the examples stay on screen, so the
 * learner is being asked to run the rule on a word they have not been given,
 * which is the only thing that shows the rule has landed.
 */
export function buildLawQuiz(law, index, askLang = "de") {
  const usable = law.pairs.filter((p) => p[askLang] && p[askLang] !== "—");
  if (usable.length < 2) return null;
  const target = usable[((index % usable.length) + usable.length) % usable.length];
  const shown = law.pairs.filter((p) => p !== target).slice(0, 4);
  const from = target.la && target.la !== "—" ? { lang: "la", form: target.la }
    : target.fr && target.fr !== "—" ? { lang: "fr", form: target.fr }
      : { lang: "en", form: target.en };
  return { law: law.id, rule: law.rule, gloss: target.g, from, ask: askLang, answer: target[askLang], examples: shown };
}

/** Accent- and case-insensitive, and the German article is not part of the answer. */
export function gradeLawAnswer(input, answer) {
  const norm = (s) => String(s || "").trim().toLowerCase()
    .replace(/^(der|die|das|le|la|les|l')\s*/u, "")
    .replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
  return norm(input) === norm(answer) && norm(input).length > 0;
}

/** Every law whose rule touches this word's shape — used to annotate a tree. */
export function lawsTouching(rungs) {
  const layers = new Set(rungs.map((r) => r.layer));
  const out = [];
  if (layers.has("gem") || layers.has("gmw")) out.push(...LAWS.filter((l) => l.group === "grimm"));
  if (layers.has("goh") || layers.has("gmh")) out.push(...LAWS.filter((l) => l.group === "hg"));
  if (layers.has("la") && layers.has("fro")) out.push(...LAWS.filter((l) => l.group === "gallo"));
  return out;
}

/** Human label for a rung, for anything that has to render one outside the tree. */
export function layerLabel(layer) {
  return LAYERS[layer]?.label || layer;
}
