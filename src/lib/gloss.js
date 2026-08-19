/* Reading an English gloss.
 *
 * A gloss packs several senses into one string — "field, domain",
 * "to note, observe (as fact)", "approach, methodology; step taken" — and the
 * app needs to take them apart in two places: to accept any single sense as a
 * typed answer, and to name a word in a generated English sentence. Both use
 * the same rules, so they live here rather than in either caller.
 */

/**
 * Split a gloss into the senses it lists.
 *
 * The split is top-level only, because a comma inside brackets belongs to the
 * clarifier rather than to the sense list: "to raise (a level, a question)" is
 * one sense, not two.
 */
export function splitSenses(gloss) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of gloss || "") {
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === "," || ch === ";" || ch === "/")) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out
    .map((s) => s.trim())
    .filter(Boolean)
    /* A few C1 glosses carry their false-friend warning inline, as in
     * `lecture` → 'reading, interpretation / reading, NOT "lecture"'. That
     * clause says what the word does *not* mean, so it is never an answer. */
    .filter((s) => !/^not\b/i.test(s));
}

/** Drop a parenthetical clarifier: "observe (as fact)" -> "observe". */
export function stripClarifier(sense) {
  return (sense || "").replace(/\s*[([][^)\]]*[)\]]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * The single sense to use when a word has to be named in running English —
 * the first one, without its clarifier or infinitive "to".
 */
export function firstSense(gloss) {
  const s = splitSenses(gloss)[0] || "";
  return stripClarifier(s).replace(/^to\s+/i, "").trim();
}

/**
 * Every English answer accepted for a word.
 *
 * Typing any one of a word's senses is correct — demanding the whole gloss
 * verbatim, punctuation included, marked right answers wrong. The clarifier is
 * optional too ("excuse me" for "excuse me (formal)"), and so is the
 * infinitive "to", in both directions: a list like "to note, observe"
 * distributes its "to" across both verbs.
 */
export function acceptableEnglish(word) {
  const senses = splitSenses(word.e);
  const verbal = senses.some((s) => /^to\s/i.test(s));
  const forms = new Set();
  if (word.e) forms.add(word.e);
  for (const sense of senses) {
    const bare = stripClarifier(sense);
    for (const v of bare && bare !== sense ? [sense, bare] : [sense]) {
      forms.add(v);
      if (/^to\s/i.test(v)) forms.add(v.replace(/^to\s+/i, ""));
      else if (verbal) forms.add(`to ${v}`);
    }
  }
  return [...forms];
}
