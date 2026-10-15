import { todayKey, addDays } from "./srs.js";
import { ACTIVITIES } from "./strands.js";

export const PROGRESS_VERSION = 3;
export const PROGRESS_KEY = "vocabdrawer:progress:v1";
export const eventId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const record = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const unsafe = (key) => ["__proto__", "constructor", "prototype"].includes(key);

export function createProgress() {
  return {
    schemaVersion: PROGRESS_VERSION,
    profileId: eventId(),
    cards: {},
    history: {},
    legacyHistory: {},
    reviewEvents: {},
    committedSessions: {},
    streak: 0,
    longest: 0,
    lastStudy: null,
    dailyGoal: 20,
    imported: { fr: {}, de: {} },
  };
}

export function validateProgress(value) {
  if (!record(value) || !record(value.cards))
    throw new Error(
      "That file has no cards in it, or the cards are malformed.",
    );
  if (value.schemaVersion > PROGRESS_VERSION)
    throw new Error("This backup uses a newer format. Update the app first.");
  for (const [key, card] of Object.entries(value.cards)) {
    if (unsafe(key) || !record(card))
      throw new Error("The backup contains an invalid card.");
    for (const field of [
      "reps",
      "interval",
      "lapses",
      "seenAt",
      "readyAt",
      "retainedDays",
      "ease",
      "recentLapses",
      "recoverySuccesses",
      "learning",
    ]) {
      if (
        card[field] != null &&
        (!Number.isFinite(card[field]) || card[field] < 0)
      )
        throw new Error(`Invalid ${field} in a saved card.`);
    }
    if (card.due && !/^\d{4}-\d{2}-\d{2}$/.test(card.due))
      throw new Error("A saved card has an invalid due date.");
    for (const field of ["suspended"])
      if (card[field] != null && typeof card[field] !== "boolean")
        throw new Error(`Invalid ${field} in a saved card.`);
  }
  for (const field of [
    "history",
    "reviewEvents",
    "legacyHistory",
    "imported",
    "activity",
    "errors",
    "fluency",
    "placement",
    "lessons",
    "texts",
    "reading",
    "missions",
    "mediaSessions",
    "practiceTime",
    "preferences",
    "committedSessions",
  ]) {
    if (value[field] != null && !record(value[field]))
      throw new Error(`Invalid ${field} in the backup.`);
  }
  for (const field of ["phrasebook", "journal", "skillEvidence"])
    if (
      value[field] != null &&
      (!Array.isArray(value[field]) || value[field].some((row) => !record(row)))
    )
      throw new Error(`Invalid ${field} in the backup.`);
  for (const field of ["missions", "mediaSessions"])
    for (const row of Object.values(value[field] || {}))
      if (!record(row)) throw new Error(`Invalid ${field} record.`);
  for (const row of value.phrasebook || [])
    if (
      typeof row.text !== "string" ||
      (row.translation != null && typeof row.translation !== "string")
    )
      throw new Error("Invalid saved phrase text.");
  for (const row of value.journal || [])
    if (
      typeof row.text !== "string" ||
      (row.photo != null && typeof row.photo !== "string") ||
      (row.recording != null && typeof row.recording !== "string")
    )
      throw new Error("Invalid journal entry.");
  for (const session of Object.values(value.mediaSessions || {}))
    for (const field of ["cues", "english"])
      if (
        session[field] != null &&
        (!Array.isArray(session[field]) ||
          session[field].some(
            (c) =>
              !record(c) ||
              typeof c.text !== "string" ||
              !Number.isFinite(c.start) ||
              !Number.isFinite(c.end) ||
              c.start < 0 ||
              c.end <= c.start,
          ))
      )
        throw new Error("Invalid saved subtitle timings or text.");
  for (const mission of Object.values(value.missions || {}))
    if (
      (mission.draft != null && typeof mission.draft !== "string") ||
      (mission.stage != null &&
        (!Number.isInteger(mission.stage) ||
          mission.stage < 0 ||
          mission.stage > 4))
    )
      throw new Error("Invalid mission record.");
  if (value.pendingSession != null) {
    const session = value.pendingSession;
    if (
      !record(session) ||
      typeof session.id !== "string" ||
      !["fr", "de"].includes(session.lang) ||
      !Array.isArray(session.results) ||
      session.results.length > 1000 ||
      session.results.some(
        (item) =>
          !Array.isArray(item) ||
          item.length !== 2 ||
          typeof item[0] !== "string" ||
          !item[0].startsWith(`${session.lang}:`) ||
          !record(item[1]) ||
          !Number.isFinite(item[1].wrongCount) ||
          item[1].wrongCount < 0,
      )
    )
      throw new Error("Invalid interrupted review in the backup.");
  }
  if (value.writing != null && !Array.isArray(value.writing))
    throw new Error("Invalid writing journal.");
  for (const [id, event] of Object.entries(value.reviewEvents || {})) {
    if (
      unsafe(id) ||
      !record(event) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(event.day || "") ||
      typeof event.ok !== "boolean"
    )
      throw new Error("Invalid review event.");
  }
  return value;
}

export function habits(history, today = todayKey()) {
  const dates = Object.keys(history)
    .filter((d) => history[d]?.reviews > 0)
    .sort();
  let longest = 0,
    run = 0,
    previous;
  for (const date of dates) {
    run = previous && addDays(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  const lastStudy = dates.at(-1) || null;
  let streak = 0;
  if (lastStudy === today || lastStudy === addDays(today, -1)) {
    let day = lastStudy;
    while (history[day]?.reviews > 0) {
      streak++;
      day = addDays(day, -1);
    }
  }
  return { streak, longest, lastStudy };
}

export function historyFrom(legacy, events) {
  const history = {};
  for (const [day, row] of Object.entries(legacy || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day))
      history[day] = {
        reviews: Math.max(0, Number(row?.reviews) || 0),
        correct: Math.max(0, Number(row?.correct) || 0),
      };
  }
  for (const event of Object.values(events || {})) {
    if (!event?.day) continue;
    const day = (history[event.day] ||= { reviews: 0, correct: 0 });
    day.reviews++;
    if (event.ok) day.correct++;
  }
  return history;
}

export function migrateProgress(value) {
  if (!value) return createProgress();
  validateProgress(value);
  const next = {
    ...createProgress(),
    ...value,
    schemaVersion: PROGRESS_VERSION,
  };
  next.reviewEvents = value.reviewEvents || {};
  // Old aggregate counters have no event identity: preserve them as a baseline,
  // and merge conservatively instead of pretending repeated files are new work.
  next.legacyHistory = value.legacyHistory ?? value.history ?? {};
  next.history = historyFrom(next.legacyHistory, next.reviewEvents);
  const h = habits(next.history);
  return { ...next, ...h, longest: Math.max(next.longest || 0, h.longest) };
}

export function logAnswer(progress, ok, details = {}) {
  const at = Date.now(),
    day = todayKey(new Date(at));
  const id = details.id || eventId();
  if (progress.reviewEvents?.[id]) return progress;
  const event = { at, day, ok: Boolean(ok), ...details };
  const reviewEvents = { ...(progress.reviewEvents || {}), [id]: event };
  const history = {
    ...progress.history,
    [day]: {
      reviews: (progress.history[day]?.reviews || 0) + 1,
      correct: (progress.history[day]?.correct || 0) + (ok ? 1 : 0),
    },
  };
  return {
    ...progress,
    reviewEvents,
    history,
    ...habits(history),
    longest: Math.max(progress.longest || 0, habits(history).longest),
  };
}

const changedAt = (row) => {
  const precise = [
    row?.seenAt,
    row?.updatedAt,
    row?.reviewedAt,
    row?.card?.seenAt,
    Date.parse(row?.revisedAt || ""),
  ].filter((n) => Number.isFinite(n) && n > 0);
  return precise.length
    ? Math.max(...precise)
    : Date.parse(row?.at || row?.last || row?.lastSeen || "") || 0;
};
const newer = (a, b) => changedAt(a) >= changedAt(b);
const unionRows = (
  a = [],
  b = [],
  key = (row) => row.id || JSON.stringify(row),
) => {
  const merged = new Map();
  for (const row of [...b, ...a]) {
    const id = key(row),
      old = merged.get(id);
    if (!old || newer(row, old)) merged.set(id, row);
  }
  return [...merged.values()];
};
const mergeMap = (a = {}, b = {}) =>
  Object.fromEntries(
    [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter((k) => !unsafe(k))
      .map((k) => [k, !a[k] ? b[k] : !b[k] || newer(a[k], b[k]) ? a[k] : b[k]]),
  );
const languageMap = (a = {}, b = {}) => ({
  fr: mergeMap(a.fr, b.fr),
  de: mergeMap(a.de, b.de),
});

export function mergeBackup(local, incoming, { restore = false } = {}) {
  if (!record(incoming)) throw new Error("That file is not a progress export.");
  const theirs = migrateProgress(incoming),
    mine = migrateProgress(local);
  if (restore)
    return {
      progress: theirs,
      stats: {
        added: Object.keys(theirs.cards).length,
        updated: 0,
        kept: 0,
        words: Object.values(theirs.imported || {}).reduce(
          (n, bag) => n + Object.keys(bag).length,
          0,
        ),
      },
    };
  const cards = { ...mine.cards };
  let added = 0,
    updated = 0,
    kept = 0;
  for (const [id, card] of Object.entries(theirs.cards)) {
    if (!cards[id]) {
      cards[id] = card;
      added++;
    } else if (!newer(cards[id], card)) {
      cards[id] = card;
      updated++;
    } else kept++;
  }
  const legacyHistory = { ...mine.legacyHistory };
  for (const [day, row] of Object.entries(theirs.legacyHistory)) {
    const old = legacyHistory[day] || {};
    legacyHistory[day] = {
      reviews: Math.max(old.reviews || 0, row.reviews || 0),
      correct: Math.max(old.correct || 0, row.correct || 0),
    };
  }
  const reviewEvents = { ...theirs.reviewEvents, ...mine.reviewEvents };
  const history = historyFrom(legacyHistory, reviewEvents),
    h = habits(history);
  const activity = { ...theirs.activity, ...mine.activity };
  for (const key of Object.keys(activity))
    if (!ACTIVITIES[key.split(":").at(-1)]) delete activity[key];
  for (const key of new Set([
    ...Object.keys(mine.activity || {}),
    ...Object.keys(theirs.activity || {}),
  ])) {
    const a = mine.activity?.[key],
      b = theirs.activity?.[key];
    if (!a || !b || !ACTIVITIES[key.split(":").at(-1)]) continue;
    const dates = [...new Set([...(a.dates || []), ...(b.dates || [])])].sort();
    const disjoint =
      (a.last && b.first && a.last < b.first) ||
      (b.last && a.first && b.last < a.first);
    activity[key] = {
      ...a,
      first: [a.first, b.first].filter(Boolean).sort()[0],
      last: [a.last, b.last].filter(Boolean).sort().at(-1),
      days:
        dates.length ||
        (disjoint
          ? (a.days || 0) + (b.days || 0)
          : Math.max(a.days || 0, b.days || 0)),
      ...(dates.length ? { dates } : {}),
    };
  }
  const errors = mergeMap(mine.errors, theirs.errors);
  for (const [id, row] of Object.entries(errors)) {
    const a = mine.errors?.[id],
      b = theirs.errors?.[id];
    if (a && b)
      errors[id] = {
        ...row,
        count: Math.max(a.count || 0, b.count || 0),
        examples: unionRows(a.examples, b.examples).slice(-10),
      };
  }
  const fluency = mergeMap(mine.fluency, theirs.fluency);
  for (const [key, row] of Object.entries(fluency))
    fluency[key] = {
      ...row,
      best: Math.max(
        mine.fluency?.[key]?.best || 0,
        theirs.fluency?.[key]?.best || 0,
      ),
      runs: unionRows(mine.fluency?.[key]?.runs, theirs.fluency?.[key]?.runs)
        .sort((a, b) => String(a.d).localeCompare(String(b.d)))
        .slice(-30),
    };
  const hasLocalWork =
    Object.keys(mine.cards).length ||
    Object.keys(mine.reviewEvents).length ||
    Object.keys(mine.history).length ||
    mine.phrasebook?.length ||
    mine.journal?.length ||
    mine.writing?.length ||
    Object.keys(mine.missions || {}).length ||
    Object.keys(mine.mediaSessions || {}).length;
  const imported = languageMap(mine.imported, theirs.imported);
  const words =
    Object.values(imported).reduce((n, bag) => n + Object.keys(bag).length, 0) -
    Object.values(mine.imported).reduce(
      (n, bag) => n + Object.keys(bag).length,
      0,
    );
  const result = {
    ...theirs,
    ...mine,
    cards,
    legacyHistory,
    reviewEvents,
    history,
    ...h,
    longest: Math.max(h.longest, mine.longest || 0, theirs.longest || 0),
    activity,
    errors,
    fluency,
    imported,
    texts: languageMap(mine.texts, theirs.texts),
    lessons: languageMap(mine.lessons, theirs.lessons),
    reading: mergeMap(mine.reading, theirs.reading),
    placement: mergeMap(mine.placement, theirs.placement),
    writing: unionRows(mine.writing, theirs.writing)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, 60),
    phrasebook: unionRows(mine.phrasebook, theirs.phrasebook),
    journal: unionRows(mine.journal, theirs.journal),
    missions: mergeMap(mine.missions, theirs.missions),
    mediaSessions: mergeMap(mine.mediaSessions, theirs.mediaSessions),
    skillEvidence: unionRows(mine.skillEvidence, theirs.skillEvidence),
    practiceTime: languageMap(mine.practiceTime, theirs.practiceTime),
    committedSessions: {
      ...theirs.committedSessions,
      ...mine.committedSessions,
    },
    preferences: hasLocalWork
      ? mine.preferences || theirs.preferences
      : theirs.preferences || mine.preferences,
    dailyGoal: hasLocalWork ? mine.dailyGoal : theirs.dailyGoal,
  };
  if (
    result.pendingSession &&
    result.committedSessions[result.pendingSession.id]
  )
    delete result.pendingSession;
  return { progress: result, stats: { added, updated, kept, words } };
}
