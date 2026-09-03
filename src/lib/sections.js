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

  etymology: "etymology", etymDrill: "etymology",

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

/* How much width a screen should be given at ≥1024px.
 *
 * The desktop redesigns lay themselves out — grids, side rails, facing
 * columns — and have to be handed the room to do it. Everything else is still
 * the phone's single column, which reads as a stranded phone screen if it is
 * allowed to stretch, so it keeps a reading measure.
 *
 * The home screen was the trap: it *has* a desktop design, but that design is
 * rendered inside the shared `screens` block rather than as its own branch, so
 * the single-column cap was landing on it and leaving a third of a 1440px
 * window empty.
 */
export const FULL_WIDTH_SCREENS = new Set([
  "setup",                                        // HomeDesktop
  "grammarWorkbench", "grammarHub", "summary",
  "wordsHub", "wordsInput", "wordsReview",
  "readingSelect", "readingQuiz", "readingDone",
  "phraseSelect", "phraseMatch", "phraseDone",
  "listenSelect", "dictation", "dictationDone", "speaking", "speakingDone",
  "importPaste", "importReader", "importLibrary",
  "progress", "sentence",
  /* The etymology tree forks into two columns and the law tables are four
   * columns wide; both need the room. */
  "etymology", "etymDrill",
]);

/** The reading measure for screens that are still one phone-width column. */
export const COLUMN_WIDTH = 720;

/* The widest the main column ever gets. Past this the content centres rather
 * than sprawling. Set generously — the screens that would suffer from the
 * extra width already carry their own measure (a reading passage stops at
 * 56ch whatever the frame does), while the grids genuinely get more useful
 * with more columns, and 98 C1 drawers are easier to scan five across than
 * three. */
export const CONTENT_MAX = 1600;
