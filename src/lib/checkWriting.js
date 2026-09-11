/* One call for "check this piece of writing".
 *
 * Grammar first (LanguageTool plus, for German, the drawer rules), then the
 * vocabulary profile — with every span LanguageTool called a misspelling left
 * out of it, or a typo would count as a rare word and inflate the very score
 * it should have lowered.
 */
import { checkGrammar } from "./grammar.js";
import { vocabProfile, loadRanks } from "./writing.js";

export async function checkWriting(text, lang, { lexicon = null, knownLemma = null, fetchImpl } = {}) {
  const [grammar, ranks] = await Promise.all([
    checkGrammar(text, lang, { lexicon, ...(fetchImpl ? { fetchImpl } : {}) }),
    loadRanks(lang).catch(() => null),
  ]);
  const misspelt = grammar.issues.filter((i) => i.kind === "spelling");
  const skip = (s, e) => misspelt.some((i) => s < i.end && e > i.start);
  const profile = vocabProfile(text, lang, { ranks, knownLemma, skip });
  return { ...grammar, profile };
}

/**
 * Apply one suggested fix to a checked text and keep the rest of the check
 * usable: issues after the fix shift by the change in length, and anything
 * overlapping it is dropped. The score is not recomputed — the caller says
 * "check again to rescore" — but the learner can take several fixes in a row
 * without the offsets going wrong under them.
 */
export function applyFixToCheck(entry, issue, fix) {
  const text = entry.text.slice(0, issue.start) + fix + entry.text.slice(issue.end);
  const delta = fix.length - (issue.end - issue.start);
  const issues = entry.result.issues
    .filter((i) => i !== issue && !(i.start < issue.end && i.end > issue.start))
    .map((i) => (i.start >= issue.end ? { ...i, start: i.start + delta, end: i.end + delta } : i));
  return { ...entry, text, fixed: (entry.fixed || 0) + 1, result: { ...entry.result, issues } };
}
