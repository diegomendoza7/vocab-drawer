/* Which top-level area a screen belongs to.
 *
 * The desktop rail highlights an area, but `screen` stays the single source of
 * truth — mobile still navigates by it, and a second piece of state tracking
 * the same fact would only drift. So the rail derives its active item from
 * here rather than storing one.
 */
export const SECTION_OF = {
  setup: "study", learn: "study", matching: "study", choose: "study",
  practice: "study", sentence: "study", summary: "study",

  wordsHub: "mywords", wordsInput: "mywords", wordsReview: "mywords",

  grammarHub: "grammar", grammarNotes: "grammar", conjSetup: "grammar",
  grammarWorkbench: "grammar",
  conjTable: "grammar", conjMatch: "grammar", conjChoose: "grammar",
  conjugation: "grammar", conjugationDone: "grammar",

  sentcSetup: "sentences", sentcWords: "sentences",
  sentcBuild: "sentences", sentcDone: "sentences",

  readingSelect: "reading", readingQuiz: "reading", readingDone: "reading",

  phraseSelect: "phrases", phraseMatch: "phrases", phraseDone: "phrases",

  listenSelect: "listening", dictation: "listening", dictationDone: "listening",
  speaking: "listening", speakingDone: "listening",

  importPaste: "import", importReader: "import", importLibrary: "import",

  progress: "progress",
};

export function sectionOf(screen) {
  return SECTION_OF[screen] || "study";
}

/* Screens where a drill is underway. The rail stays visible but navigating
 * away from one of these abandons work in progress, so the shell dims the rail
 * and the study area shows its own stage chrome instead. */
export const IN_DRILL = new Set([
  "learn", "matching", "choose", "practice", "sentence",
  "conjTable", "conjMatch", "conjChoose", "conjugation",
  "sentcBuild", "readingQuiz", "phraseMatch", "dictation", "speaking",
]);

/* The stages that run inside the desktop study frame (stage rail + ledger).
 * `summary` is excluded — it gets its own full-width per-word table. */
export const STUDY_SCREENS = new Set(["learn", "matching", "choose", "practice", "sentence"]);
