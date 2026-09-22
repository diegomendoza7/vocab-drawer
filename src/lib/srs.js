/* The scheduler and its date arithmetic.
 *
 * Extracted from the component so it can be tested without a browser: this is
 * the part of the app where a silent regression is most expensive, because a
 * wrong interval is invisible until a card fails to come back.
 */

/* ---- dates: day granularity, local time ---- */
export function todayKey(d = new Date()) {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
}
export function addDays(dateKey, n) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
export function daysUntil(dateKey) {
  const a = new Date(todayKey() + "T00:00:00");
  const b = new Date(dateKey + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

export function cardId(lang, level, headword) {
  return `${lang}:${level}:${headword}`;
}

/* Recognition and production are two different pieces of knowledge.
 *
 * Knowing that "Schwierigkeit" means difficulty and being able to produce
 * "Schwierigkeit" when you want to say difficulty are not the same skill, and
 * the second is reliably far weaker than the first. The app asked both — a
 * word was shown to-English *and* to-target — but graded them into one card,
 * so one ease, one interval and one due date covered both. A word you could
 * read fluently and could not produce at all averaged out to "fine", and the
 * scheduler had no way to ask the harder half more often.
 *
 * So a word has two cards. The recognition card keeps the original id, which
 * means every card already earned stays exactly where it is; production takes
 * a suffixed id and is created the first time a production answer is graded,
 * seeded from the shared card that came before it. That seeding matters: the
 * old single card *was* partly production evidence, and starting production
 * from zero would have made every known word suddenly due again.
 */
export const PROD_SUFFIX = "::prod";

export function prodCardId(lang, level, headword) {
  return cardId(lang, level, headword) + PROD_SUFFIX;
}
export function isProdId(id) {
  return String(id).endsWith(PROD_SUFFIX);
}
/** The recognition id behind any id — itself, for a recognition id. */
export function baseCardId(id) {
  const s = String(id);
  return s.endsWith(PROD_SUFFIX) ? s.slice(0, -PROD_SUFFIX.length) : s;
}

/** Which of a word's two cards a question kind is evidence about. */
export const PRODUCTION_KINDS = new Set(["toTarget", "fillBlank", "sentence", "dictation", "speaking"]);
export function idForKind(kind, lang, level, headword) {
  return PRODUCTION_KINDS.has(kind) ? prodCardId(lang, level, headword) : cardId(lang, level, headword);
}

/* ---- SM-2 style scheduler ---- */
export const EASE_MIN = 1.3, EASE_MAX = 2.8, EASE_START = 2.3, INTERVAL_CAP = 365;

/* A card you keep failing is a *leech*: the word is not sticking, and sending
 * it round the same loop a ninth time is how a deck fills up with three words
 * you never learn and never escape. Eight lapses is Anki's threshold and there
 * is no reason to invent a different one. */
export const LEECH_LAPSES = 8;

/* Reviews studied together come due together, so one heavy sitting recreates
 * itself as one heavy day, every interval, forever. A few per cent of jitter
 * breaks the clumping without meaningfully changing when anything is asked.
 * Applied only past the first week — moving a 1-day interval is just noise. */
const FUZZ = 0.05;
function fuzzed(interval, seed) {
  if (interval < 7) return interval;
  const spread = Math.max(1, Math.round(interval * FUZZ));
  /* Seeded off the card, not Math.random: rescheduling the same answer twice
   * (a re-render, a replayed action) must not produce two different due
   * dates. */
  const offset = (seed % (spread * 2 + 1)) - spread;
  return Math.max(1, interval + offset);
}

/** A small stable number from a string, for the fuzz offset. */
function hashOf(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i += 1) h = (h * 31 + String(str).charCodeAt(i)) >>> 0;
  return h;
}
export function newCard() {
  return { ease: EASE_START, interval: 0, reps: 0, lapses: 0, due: todayKey(), lastSeen: null };
}
/* How a sitting's misses become an SM-2 grade.
 *
 * Shared by `commitSession` and the summary table's due-date preview — the
 * preview has to reach the same answer the commit will, and two copies of this
 * rule would eventually disagree. */
export function gradeFromWrongCount(n) {
  return n === 0 ? "good" : n === 1 ? "hard" : "again";
}

/* Learning steps: a new word does not leave the day it was met.
 *
 * A brand-new card answered correctly used to go straight to a one-day
 * interval, so the entire first encounter with a word was one sitting and then
 * nothing until tomorrow. The spacing literature is unusually consistent that
 * the first re-test matters most and should come soon (Cepeda et al. 2006):
 * the cheapest real gain available to this app is a second retrieval later the
 * same day, before the schedule proper starts.
 *
 * So a new card graduates only after being recalled twice, and the second time
 * has to be at least `LEARNING_GAP_MS` after the first. That gap is the whole
 * point — without it, clicking "review due" straight after a batch would
 * graduate every word seconds later, which is massed repetition wearing the
 * costume of spaced repetition. Answering again inside the gap is harmless and
 * simply does not advance the step.
 *
 * `easy` skips the steps, as it does in Anki: someone who says a word was easy
 * on first sight is not asking for a second look.
 */
export const LEARNING_STEPS = 1;
export const LEARNING_GAP_MS = 10 * 60 * 1000;

/** Is this card still inside its first day, rather than on the schedule? */
export function isLearning(card) {
  return Boolean(card && (card.reps || 0) === 0 && (card.learning || 0) > 0);
}

export function scheduleCard(card, grade, seedKey = "", now = Date.now()) {
  const c = card ? { ...card } : newCard();

  /* Still inside the learning steps: stay on today.
   *
   * The gap gates *graduation*, not just the step count — otherwise a card
   * one step from graduating would leave the steps on an answer given
   * seconds later, which is the exact thing the steps exist to prevent. */
  if (grade !== "again" && grade !== "easy" && (c.reps || 0) === 0) {
    const enoughGap = now - (c.seenAt || 0) >= LEARNING_GAP_MS;
    const ready = (c.learning || 0) >= LEARNING_STEPS && enoughGap;
    if (!ready) {
      if (enoughGap) c.learning = (c.learning || 0) + 1;
      c.seenAt = now;
      c.interval = 0;
      c.due = todayKey();
      c.lastSeen = todayKey();
      return c;
    }
  }

  c.seenAt = now;
  if (grade === "again") {
    c.lapses += 1;
    c.reps = 0;
    /* A lapse sends the card back through the learning steps rather than
     * straight onto the schedule — the reason it lapsed is that it was not
     * consolidated in the first place. */
    c.learning = 0;
    c.ease = Math.max(EASE_MIN, c.ease - 0.2);
    c.interval = 0; // relearn today
  } else {
    if (c.reps === 0) c.interval = grade === "easy" ? 3 : 1;
    else if (c.reps === 1) c.interval = grade === "easy" ? 6 : grade === "hard" ? 2 : 3;
    else {
      const mult = grade === "hard" ? 1.2 : grade === "easy" ? c.ease * 1.3 : c.ease;
      // max(interval + 1, ...) so a repeatedly-"hard" card still graduates
      // instead of plateauing forever on rounding.
      c.interval = Math.min(INTERVAL_CAP, Math.max(c.interval + 1, Math.round(c.interval * mult)));
    }
    if (grade === "hard") c.ease = Math.max(EASE_MIN, c.ease - 0.15);
    if (grade === "easy") c.ease = Math.min(EASE_MAX, c.ease + 0.15);
    c.reps += 1;
    c.learning = 0;   // graduated; the steps are behind it
  }
  c.due = addDays(todayKey(), fuzzed(c.interval, hashOf(seedKey + c.reps)));
  c.lastSeen = todayKey();
  return c;
}

/** Has this card lapsed often enough to need handling rather than repeating? */
export function isLeech(card) {
  return Boolean(card && (card.lapses || 0) >= LEECH_LAPSES);
}
export function isDue(card) {
  if (!card) return true; // never studied
  return daysUntil(card.due) <= 0;
}
/**
 * Due *and* actually worth asking now.
 *
 * A word met minutes ago is due today by the calendar, but asking it again
 * straight away is massed repetition: it would be answered from working
 * memory, learn nothing, and still be counted. So a card inside its learning
 * gap is held back until the gap has passed — which is what makes "12 due"
 * mean twelve things genuinely ready rather than the batch just finished.
 */
export function isReady(card, now = Date.now()) {
  if (!isDue(card)) return false;
  if (isLearning(card) && now - (card.seenAt || 0) < LEARNING_GAP_MS) return false;
  return true;
}

/** Maturity buckets used by the progress view. A leech is called out
 * separately: it is not "learning", it is stuck, and showing it as learning is
 * what lets it hide. */
export function cardStage(card) {
  if (!card) return "new";
  /* A card inside its learning steps has been met and is not yet on the
   * schedule — calling it "new" would put it back with the untouched words. */
  if (card.reps === 0) return isLearning(card) ? "learning" : "new";
  if (card.interval < 7) return "learning";
  if (card.interval < 21) return "young";
  return "mature";
}
