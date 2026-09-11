/* The reading library: every passage per language, and what the screens need
 * to describe one without opening it. */
import { FR_PASSAGES } from "./fr.js";
import { DE_PASSAGES } from "./de.js";

export const PASSAGES = { fr: FR_PASSAGES, de: DE_PASSAGES };

export const GENRES = {
  dialogue: "Dialogue",
  email: "Email",
  notice: "Notice",
  profile: "Profile",
  story: "Story",
  article: "Article",
  letter: "Letter to the editor",
  feature: "Feature",
  essay: "Essay",
  column: "Column",
};

/* How long a passage may be at each level, in words. Length is most of what
 * separates reading from decoding: an A1 learner needs a page they can
 * finish, a C1 reader one with room for an argument to turn. */
export const LEVEL_WORDS = { A1: [60, 150], A2: [90, 220], B1: [160, 340], B2: [250, 460], C1: [300, 600] };

/* The fewest words an answer can have and still be a sentence — the nudge
 * towards full sentences grows with the level. */
export const MIN_ANSWER_WORDS = { A1: 4, A2: 5, B1: 6, B2: 7, C1: 8 };

/* Learner reading speed in words a minute. Only feeds the "~4 min" label. */
const WPM = { A1: 50, A2: 70, B1: 90, B2: 110, C1: 130 };

const WORD = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;

export function wordCount(text) {
  return (String(text || "").match(WORD) || []).length;
}

/** The passage as one text, paragraphs separated by blank lines. */
export function passageText(p) {
  return p.paras.map(([t]) => t).join("\n\n");
}

export function readingMinutes(p) {
  return Math.max(1, Math.round(wordCount(passageText(p)) / (WPM[p.level] || 90)));
}

export function passagesFor(lang) {
  return PASSAGES[lang] || [];
}

export function passageById(id) {
  for (const list of Object.values(PASSAGES)) {
    const hit = list.find((p) => p.id === id);
    if (hit) return hit;
  }
  return null;
}
