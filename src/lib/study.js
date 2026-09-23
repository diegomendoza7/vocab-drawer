/* Derivations behind the desktop study surfaces.
 *
 * These were inline in the component, which meant the only way to check them
 * was to drive a browser through a whole drill. They are pure functions of
 * their inputs, so they live here and are tested directly.
 */

import { cardId, daysUntil, cardStage, isDue, EASE_START, PROD_SUFFIX, isProdId, baseCardId, scheduleCard, gradeFromWrongCount, isLearning } from "./srs.js";
import { strandWhy, ACTIVITIES } from "./strands.js";

/** Stage order, so the ledger can say how far a word has got. */
const STATUS = { unseen: 0, seen: 1, matched: 2, chosen: 3, typed: 4 };

/**
 * Every word in the current sitting, with how far it has got and how often it
 * has been missed.
 *
 * The per-stage records this reads are keyed three different ways — question
 * ids (`level::headword::kind`) in the choose and typing sets, bare headwords
 * in `matchedIds`, and `cardId` in the results map — so the reconciling
 * happens here rather than in each caller.
 */
export function buildBatchLedger({
  entries, lang, screen, stepIndex, learnIdx,
  matchedIds = [], chooseSeen = new Set(), practiceSeen = new Set(), results = new Map(),
}) {
  return entries.map(({ word, level }, i) => {
    const id = cardId(lang, level, word.t);
    const prefix = `${level}::${word.t}::`;
    const hit = (set) => {
      for (const x of set) if (typeof x === "string" && x.startsWith(prefix)) return true;
      return false;
    };

    let status = "unseen";
    /* Past Learn every word has been shown at least once; during it, position
     * in the deck is what says so. */
    if (stepIndex > 0 || (screen === "learn" && i <= learnIdx)) status = "seen";
    if (matchedIds.includes(word.t)) status = "matched";
    if (hit(chooseSeen)) status = "chosen";
    if (hit(practiceSeen)) status = "typed";

    return {
      cardId: id,
      word,
      level,
      status,
      rank: STATUS[status],
      /* Both directions: a word missed only when asked to produce it has been
       * missed, and reading the recognition id alone would show a clean row. */
      misses: (results.get(id)?.wrongCount ?? 0) + (results.get(id + PROD_SUFFIX)?.wrongCount ?? 0),
      display: lang === "de" && word.g ? `${word.g} ${word.t}` : word.t,
    };
  });
}

/**
 * The end-of-sitting record, one row per word.
 *
 * `scheduled` is what `commitSession` actually wrote, captured at commit time.
 * Re-deriving the due date here would be wrong: committing and navigating to
 * the summary happen in one handler, so by the time this runs the stored card
 * is already scheduled and running the scheduler over it again would advance
 * every interval a second time.
 */
export function buildSummaryRows({ results, scheduled = {}, cards = {}, lang }) {
  return [...results.entries()].map(([id, r]) => {
    const card = scheduled[id] || cards[id];
    return {
      cardId: id,
      word: r.word,
      level: r.level,
      /* Which half of the word this row is about. A word answered in both
       * directions earns two rows, with two due dates — which is the point:
       * they are two pieces of knowledge and they come back separately. */
      direction: isProdId(id) ? "produce" : "recognise",
      firstTry: r.wrongCount === 0,
      misses: r.wrongCount,
      /* A card still inside its learning steps is not "due today" in the
       * schedule's sense — it is waiting for a second look before the
       * schedule starts at all, and the table should say which. */
      learning: isLearning(card),
      dueInDays: card ? daysUntil(card.due) : 0,
      display: lang === "de" && r.word.g ? `${r.word.g} ${r.word.t}` : r.word.t,
    };
  });
}

/**
 * Turn a sitting's results into scheduled cards.
 *
 * Lifted out of the component because it is the most expensive place in the
 * app to be wrong — a bad interval is invisible until a card fails to come
 * back — and because the production split gave it a rule that has to hold
 * exactly: **a production card that has never been graded starts from the
 * recognition card**, not from nothing.
 *
 * That seeding is what makes the split safe to ship. The single card that
 * came before it was graded on production answers as well as recognition
 * ones, so it is real evidence about production; starting production from
 * zero would have made every word an existing learner already knew fall due
 * again on the day of the change.
 *
 * Returns both the new card set and just the cards it touched — the summary
 * needs the latter, because by the time it renders `progress` already holds
 * the scheduled cards and re-deriving would advance every interval twice.
 */
export function scheduleResults(cards, results) {
  const next = { ...cards };
  const scheduled = {};
  for (const [id, r] of results) {
    const prev = next[id] ?? (isProdId(id) ? cards[baseCardId(id)] : undefined);
    next[id] = scheduleCard(prev, gradeFromWrongCount(r.wrongCount), id);
    scheduled[id] = next[id];
  }
  return { cards: next, scheduled };
}

/**
 * One cell of the verb × tense coverage map.
 *
 * `drilled` is tracked separately from `due` because `isDue(undefined)` is
 * true — a card you have never seen is due by definition. Testing `isDue`
 * alone would paint every untouched cell as due, and a map where "never
 * drilled" and "ready for review" look identical answers no question.
 */
export function matrixCell(card) {
  return {
    drilled: !!card,
    stage: card ? cardStage(card) : null,
    due: !!card && isDue(card),
  };
}


/**
 * The cards you keep getting wrong, hardest first.
 *
 * The daily queue is ordered by due date, which says when a card is scheduled,
 * not how well you know it. A word you have lapsed four times sits quietly in
 * the rotation next to one you have never missed, and comes round no more
 * often once its interval resets. This orders by evidence of difficulty
 * instead, and deliberately ignores the due date — the whole point is to reach
 * cards before they surface on their own.
 *
 * `lapses` is weighted above `ease` because it counts actual failures, while
 * ease is a derived number that also drifts down from merely-hard answers.
 * Cards never studied are excluded: "weak" has to mean tried and missed, not
 * untouched, or this becomes a second new-word queue.
 */
export function weakestCards({ entries, lang, cards = {}, limit = 20 }) {
  /* Scored over both directions, keeping whichever is worse.
   *
   * A word you read without effort and cannot produce is a weak word, and
   * before the split its two halves averaged into one unremarkable card. The
   * `direction` that comes back says which half is the problem — which is the
   * part a learner can act on. */
  const scoreOf = (card) => {
    if (!card || (card.reps === 0 && !card.lapses)) return null;
    const lapses = card.lapses || 0;
    const easeDrop = Math.max(0, EASE_START - (card.ease ?? EASE_START));
    return { card, lapses, easeDrop, score: lapses * 2 + easeDrop * 3 };
  };

  return entries
    .map(({ word, level }) => {
      const rec = scoreOf(cards[cardId(lang, level, word.t)]);
      const prod = scoreOf(cards[cardId(lang, level, word.t) + PROD_SUFFIX]);
      const worst = !prod || (rec && rec.score >= prod.score) ? rec : prod;
      if (!worst || worst.score <= 0) return null;
      return { word, level, ...worst, direction: worst === prod ? "produce" : "recognise" };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.lapses - a.lapses)
    .slice(0, limit);
}

/**
 * Which tenses each "Drill this verb" scope would cover.
 *
 * The button used to mean "every tense this verb has", which asked for the
 * subjunctive of a verb you had only ever met in the present — a drill harder
 * than anything you had studied, for no reason you could see or change. The
 * scope is now a choice, and this is what each choice resolves to.
 *
 * `started` is the useful middle: a tense counts once it has a card, which
 * happens the first time you answer a cell in it. Deliberately *not* "due" —
 * you want to be able to drill something you have met and are not currently
 * being asked for.
 */
export function drillScopeTenses({ verb, tenseKey, tenses, cards = {}, cardIdFor, hasTense }) {
  if (!verb) return { tense: [], started: [], all: [] };
  const all = tenses.filter((t) => hasTense(t.key)).map((t) => t.key);
  return {
    tense: all.includes(tenseKey) ? [tenseKey] : [],
    started: all.filter((k) => cards[cardIdFor(k)]),
    all,
  };
}

/** The scope actually in force: a chosen scope that has emptied falls back. */
export function effectiveScope(scope, byScope) {
  return byScope[scope]?.length ? scope : "tense";
}

/* ---------------------------------------------------------------------- */
/* What to ask about a word, given how well it is known                     */
/* ---------------------------------------------------------------------- */

/**
 * The question kinds a word earns, by card strength.
 *
 * The queue used to hand every word all three kinds, so a word met a minute
 * ago and a word known for a month were asked identically — and a ten-word
 * drawer became thirty typed questions before the sentence stage.
 *
 * Recognition before production is the actual pedagogy: a new word is asked
 * *to* English (you have just seen it, can you read it), and only earns the
 * harder productive direction once it has come back correctly. A cloze is the
 * hardest of the three — the word has to be retrieved with no prompt but the
 * sentence — so it waits until the card has some interval behind it.
 *
 * A leech is deliberately walked back to recognition. Asking someone to
 * produce a word they have failed eight times is how a card stays stuck.
 */
export function kindsForCard(word, cards, { hasCloze }) {
  /* Takes either {rec, prod} or a single card. The single-card form is what a
   * caller with no production context should get, and keeps the old meaning:
   * one card gating both directions. */
  const rec = cards && Object.hasOwn(cards, "rec") ? cards.rec : cards;
  const prod = cards && Object.hasOwn(cards, "prod") ? (cards.prod ?? rec) : rec;

  const recReps = rec?.reps ?? 0;
  const recStuck = (rec?.lapses ?? 0) >= 8;

  /* Recognition first, always. A word met a minute ago is asked only in the
   * direction you have just seen, and a word failed eight times is walked
   * back to it — asking someone to produce a word they cannot recognise is
   * how a card stays stuck. */
  if (recStuck || recReps === 0) return ["toEnglish"];

  const kinds = ["toEnglish"];

  /* Production is now paced by its own card. A word whose production has
   * lapsed eight times drops back to recognition on its own, even while the
   * recognition card is healthy — which is exactly the case the single shared
   * card could not represent. */
  const prodStuck = (prod?.lapses ?? 0) >= 8;
  if (!prodStuck) kinds.push("toTarget");

  /* Fill-in-the-blank is the hardest of the three — no prompt but the
   * sentence — so it waits for production to have some interval behind it,
   * and only when the entry has a usable cloze. */
  if (!prodStuck && (prod?.interval ?? 0) >= 3 && hasCloze(word)) kinds.push("fillBlank");
  return kinds;
}

/** Rough minutes for a queue, for the "how long is this" estimate. */
export const SECONDS_PER_QUESTION = 9;
export function estimateMinutes(questionCount) {
  return Math.max(1, Math.round((questionCount * SECONDS_PER_QUESTION) / 60));
}

/* ---------------------------------------------------------------------- */
/* What to do next                                                          */
/* ---------------------------------------------------------------------- */

/**
 * The single most useful next action, given everything already computed.
 *
 * With nothing due the home screen used to say "study something new" and stop
 * there — which is the one moment a learner needs the app to have an opinion.
 * Everything this reads is already derived for some other panel; the gap was
 * only that none of it reached the sentence.
 *
 * Order is deliberate. Due work first, because the schedule is the whole point
 * of an SRS. Then the words with evidence of difficulty. Only then new
 * material, and only then the tracks outside vocabulary.
 *
 * `strandGap` is what stops this being a vocabulary-only opinion. Everything
 * above it is urgent and specific — a card that is due, a pattern being got
 * wrong. Everything below it used to be "open a drawer" or "try a tense",
 * which are both language-focused learning: the strand a drill app already
 * over-serves. So the gap goes in between, where it outranks new material but
 * never outranks the schedule.
 *
 * When the neglected strand *is* language-focused learning, the concrete
 * suggestions below say the same thing better — "Start Animals" beats "Study
 * words" — so it falls through to them.
 */
export function nextAction({
  dueCount, weakCount, leechCount, mistakeCount, unstartedDrawer, untouchedTense, dueToday, goal,
  strandGap = null, unfinishedLesson = null, firstLesson = null,
}) {
  if (dueCount > 0) {
    return { kind: "due", section: "study", label: `Review ${dueCount} due`, why: "Scheduled work first — this is what the intervals are for." };
  }
  if (leechCount > 0) {
    return {
      kind: "weak",
      section: "study",
      label: `Work on ${leechCount} stuck ${leechCount === 1 ? "word" : "words"}`,
      why: "These have been forgotten repeatedly. Repeating the same drill will not shift them.",
    };
  }
  /* A pattern the checker keeps finding in real writing outranks a shaky
   * card: it is evidence of an error being *made*, not merely forgotten. */
  if (mistakeCount > 0) {
    return {
      kind: "mistakes",
      section: "mistakes",
      label: `Work on ${mistakeCount} mistake ${mistakeCount === 1 ? "pattern" : "patterns"}`,
      why: "The checker keeps finding these in your own writing.",
    };
  }
  if (weakCount > 0) {
    return { kind: "weak", section: "study", label: `Drill ${weakCount} weak ${weakCount === 1 ? "spot" : "spots"}`, why: "Not due, but the answers say these are shaky." };
  }
  /* A lesson left halfway is the most specific unfinished thing there is —
   * it knows the exact stage to resume at — so it comes before any opinion
   * about balance. */
  if (unfinishedLesson) {
    return {
      kind: "lesson",
      section: "lessons",
      label: `Finish Lesson ${unfinishedLesson.n}: ${unfinishedLesson.title}`,
      why: `You stopped at ${unfinishedLesson.stage} — it picks up where you left off.`,
    };
  }
  /* Someone who has never taken a lesson has only ever been tested. Before
   * suggesting which kind of practice they lack, suggest being taught. */
  if (firstLesson) {
    return {
      kind: "lesson",
      section: "lessons",
      label: `Take Lesson ${firstLesson.n}: ${firstLesson.title}`,
      why: "One famous text taken all the way apart — the app teaching, not testing.",
    };
  }
  /* The one place the app can recommend something that is not a word. */
  if (strandGap && !(strandGap.strand === "form" && (unstartedDrawer || untouchedTense))) {
    return {
      kind: "strand",
      strand: strandGap.strand,
      section: strandGap.section,
      label: strandGap.invite,
      why: strandWhy(strandGap),
    };
  }
  if (unstartedDrawer) {
    return { kind: "drawer", section: "study", label: `Start ${unstartedDrawer}`, why: "Nothing is due, so this is the moment to add words." };
  }
  if (untouchedTense) {
    return { kind: "tense", section: "grammar", label: `Try ${untouchedTense}`, why: "You have never drilled this tense." };
  }
  if (goal && dueToday >= goal) {
    return { kind: "done", label: "You're done for today", why: "Goal met and nothing scheduled. Coming back tomorrow beats pushing on." };
  }
  return { kind: "explore", section: "study", label: "Pick a drawer", why: "Everything is reviewed and every drawer is started." };
}

/**
 * Daily accuracy over the last `days`, for the progress trend.
 *
 * `progress.history` has held reviews and correct answers per day since the
 * port and was read only by the streak and a heatmap — so the app could tell
 * you *that* you studied and never *whether you were getting better*, which is
 * the question that matters during a plateau.
 *
 * Days with no reviews return `null` rather than 0: a day you did not study is
 * missing data, and drawing it as a crash to zero would misreport a weekend.
 */
export function accuracyTrend(history = {}, days, today, addDaysFn) {
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = addDaysFn(today, -i);
    const day = history[key];
    out.push({
      date: key,
      reviews: day?.reviews || 0,
      pct: day && day.reviews > 0 ? Math.round((day.correct / day.reviews) * 100) : null,
    });
  }
  return out;
}

/* ---------------------------------------------------------------------- */
/* Merging an exported progress file back in                                */
/* ---------------------------------------------------------------------- */

/**
 * Combine a saved progress file with the one in this browser.
 *
 * Export existed without import, which made it a backup rather than a
 * transfer: the data could leave and never come back. Merging rather than
 * replacing is the only safe direction — someone importing a phone's progress
 * into a laptop means "add what I did there", never "delete what I did here".
 *
 * The conflict rule for a card is **whichever was reviewed more recently
 * wins**, falling back to more repetitions. A card's schedule is a claim about
 * a specific moment of recall, so the newer claim is the true one; taking the
 * longer interval instead would let a stale device push real reviews away.
 *
 * Day history sums, because two devices on one day did genuinely do both.
 */
/** How many pieces of writing are kept. Each holds its text, so this is the cap on the journal. */
export const WRITING_KEEP = 60;

export function mergeProgress(mine, theirs) {
  if (!theirs || typeof theirs !== "object") throw new Error("That file is not a progress export.");
  if (!theirs.cards || typeof theirs.cards !== "object") throw new Error("That file has no cards in it.");

  const cards = { ...mine.cards };
  let added = 0, updated = 0, kept = 0;
  for (const [id, incoming] of Object.entries(theirs.cards)) {
    const current = cards[id];
    if (!current) { cards[id] = incoming; added += 1; continue; }
    const newer = (incoming.lastSeen || "") > (current.lastSeen || "")
      || ((incoming.lastSeen || "") === (current.lastSeen || "") && (incoming.reps || 0) > (current.reps || 0));
    if (newer) { cards[id] = incoming; updated += 1; } else { kept += 1; }
  }

  const history = { ...mine.history };
  for (const [day, entry] of Object.entries(theirs.history || {})) {
    const here = history[day];
    history[day] = here
      ? { reviews: here.reviews + (entry.reviews || 0), correct: here.correct + (entry.correct || 0) }
      : entry;
  }

  /* Imported words merge per language, keeping the local copy on a clash —
   * the local one may carry a fact-check verdict the other device never ran. */
  const imported = { fr: { ...(mine.imported?.fr || {}) }, de: { ...(mine.imported?.de || {}) } };
  let words = 0;
  for (const lang of ["fr", "de"]) {
    for (const [term, rec] of Object.entries(theirs.imported?.[lang] || {})) {
      if (!imported[lang][term]) { imported[lang][term] = rec; words += 1; }
    }
  }

  /* Which strands were worked, per activity. Days add up and the later `last`
   * wins: two devices used on different days are two days of that work, and
   * taking one side's record wholesale would throw the other's away. Days are
   * capped at the days actually elapsed so a re-import cannot inflate them. */
  const activity = { ...(mine.activity || {}) };
  for (const [key, row] of Object.entries(theirs.activity || {})) {
    if (!ACTIVITIES[key] || !row) continue;
    const here = activity[key];
    if (!here) { activity[key] = row; continue; }
    const first = [here.first, row.first].filter(Boolean).sort()[0] || here.first;
    const last = (row.last || "") > (here.last || "") ? row.last : here.last;
    const elapsed = first && last
      ? Math.round((new Date(`${last}T00:00:00`) - new Date(`${first}T00:00:00`)) / 86400000) + 1
      : Infinity;
    activity[key] = {
      first,
      last,
      days: Math.min((here.days || 0) + (row.days || 0), elapsed),
    };
  }

  /* Writing is a journal, not a schedule: nothing on either device is a stale
   * copy of the other, so entries union by id, newest first. */
  const seenWriting = new Set();
  const writing = [...(mine.writing || []), ...(theirs.writing || [])]
    .filter((e) => e?.id && !seenWriting.has(e.id) && seenWriting.add(e.id))
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")))
    .slice(0, WRITING_KEEP);

  const merged = {
    ...mine,
    cards,
    history,
    imported,
    /* Streak is recomputed from the merged history rather than taken from
     * either side, or importing an old file could award a streak that neither
     * device actually earned. */
    longest: Math.max(mine.longest || 0, theirs.longest || 0),
    texts: { ...(theirs.texts || {}), ...(mine.texts || {}) },
    // A passage record is one sitting's result; the local one wins a clash.
    reading: { ...(theirs.reading || {}), ...(mine.reading || {}) },
    writing,
    activity,
    /* A lesson record is where you stopped and how you scored; per lesson,
     * the local copy wins, as with a reading record. */
    lessons: {
      fr: { ...(theirs.lessons?.fr || {}), ...(mine.lessons?.fr || {}) },
      de: { ...(theirs.lessons?.de || {}), ...(mine.lessons?.de || {}) },
    },
  };
  return { progress: merged, stats: { added, updated, kept, words } };
}

/* ---------------------------------------------------------------------- */
/* Type-ahead for the sentence word bank                                   */
/* ---------------------------------------------------------------------- */

/**
 * What a keyboard would type for one character.
 *
 * Usually the character itself, lowercased and stripped of its accent — you
 * should not have to find é on the keyboard to pick a chip that is already
 * spelled for you. The three that legitimately expand to two letters are ß,
 * œ and æ, which is why this returns a string rather than a character.
 */
function foldChar(ch) {
  const c = ch.toLowerCase();
  if (c === "ß") return "ss";
  if (c === "œ") return "oe";
  if (c === "æ") return "ae";
  if (c === "’" || c === "‘") return "'";
  return c.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * How far into `token` the typed `prefix` reaches, counted in characters of
 * the token *as displayed* — which is what the highlight needs. Returns -1
 * when the prefix is not a prefix of this token at all.
 *
 * A half-typed expansion counts as reaching its character: one "s" of "ß"
 * highlights the ß, because the alternative is a letter that highlights only
 * after you type the next one.
 */
export function prefixReach(token, prefix) {
  const want = prefix.toLowerCase();
  let w = 0;
  let i = 0;
  while (w < want.length) {
    if (i >= token.length) return -1;      // typed past the end of the word
    const exp = foldChar(token[i]);
    const take = Math.min(exp.length, want.length - w);
    if (want.slice(w, w + take) !== exp.slice(0, take)) return -1;
    w += take;
    i += 1;
  }
  return i;
}

/**
 * Decide what one more typed character does to the word bank.
 *
 * `place` is a bank index to lay down now, `candidates` are the chips still in
 * the running (with how much of each to highlight), and `ok` is false when the
 * keystroke matched nothing — the caller keeps the old prefix and says so,
 * rather than leaving a buffer that can no longer match anything.
 *
 * Two chips showing the *same word* can never be told apart by typing, so the
 * first is placed rather than waiting for a keystroke that cannot come. Without
 * that, any sentence with a repeated word ("de … de") deadlocks the keyboard.
 */
export function typeAhead(bank, prefix) {
  if (!prefix) return { ok: true, place: null, candidates: [] };
  const candidates = [];
  for (let i = 0; i < bank.length; i += 1) {
    const reach = prefixReach(bank[i], prefix);
    if (reach >= 0) candidates.push({ index: i, reach });
  }
  if (!candidates.length) return { ok: false, place: null, candidates: [] };
  const first = candidates[0];
  const sameWord = candidates.every(
    (c) => bank[c.index].toLowerCase() === bank[first.index].toLowerCase(),
  );
  if (candidates.length === 1 || sameWord) {
    return { ok: true, place: first.index, candidates: [] };
  }
  return { ok: true, place: null, candidates };
}

/**
 * Which chip the space bar takes when typing alone cannot finish the job.
 *
 * The case this exists for is one word being the whole start of another — with
 * "de" and "des" both in the bank, "de" is fully typed and still ambiguous, and
 * no further letter can single it out. A completed word wins; otherwise the
 * leftmost chip still in the running does.
 */
export function commitTypeAhead(bank, prefix) {
  const { candidates } = typeAhead(bank, prefix);
  if (!candidates.length) return null;
  const whole = candidates.find((c) => c.reach === bank[c.index].length);
  return (whole || candidates[0]).index;
}


/**
 * How much of ordinary speech the words you have studied would cover.
 *
 * The point of a frequency rank is not the rank; it is this number. Nation &
 * Waring: the first 1,000 word families give about 72% of running text, 2,000
 * about 80%, 5,000 about 89%. Knowing you have 340 words says nothing. Knowing
 * that 210 of them are in the top 1,000 says where you stand.
 *
 * Deliberately counts only *studied* words, not the deck — owning a drawer you
 * have never opened buys no coverage.
 */
export function frequencyReach({ entries, lang, cards = {}, cardIdFor, rankOf }) {
  const bands = { 1000: 0, 2000: 0, 5000: 0, beyond: 0 };
  let studied = 0;
  for (const entry of entries) {
    const word = entry.word || entry;
    if (!word?.t) continue;
    if (!cards[cardIdFor(lang, entry.level, word.t)]) continue;
    studied += 1;
    const r = rankOf(lang, word.t);
    if (!r) bands.beyond += 1;
    else if (r <= 1000) bands[1000] += 1;
    else if (r <= 2000) bands[2000] += 1;
    else if (r <= 5000) bands[5000] += 1;
    else bands.beyond += 1;
  }
  return { studied, bands };
}
