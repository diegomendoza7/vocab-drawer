/* The four kinds of work a course needs, and which one the app is short of.
 *
 * Paul Nation's Four Strands (Nation 2007) is the least controversial design
 * principle in language teaching: a course should give roughly equal time to
 * meaning-focused input, meaning-focused output, language-focused learning,
 * and fluency development. Not equal *value* — equal *time*. The strands are
 * not a ranking; a learner who only ever does one of them stalls, whichever
 * one it is.
 *
 * Vocab Drawer already had all four. What it did not have was any idea which
 * one you had been neglecting: "what next" could only ever name a due card, a
 * weak word, an unopened drawer or an undrilled tense — every one of them
 * language-focused learning, the strand a drill app naturally over-serves.
 * Thirteen other sections existed with no path to them at all.
 *
 * So this records which kinds of work have actually been done, and answers the
 * one question the home screen could not: what has gone longest untouched.
 *
 * Deliberately cheap to store. Not a log — one row per activity, holding the
 * last day it was done and how many distinct days it has been done. That is
 * enough for both questions asked of it ("how long since?" and "how much of
 * your time?") and it cannot grow without bound.
 */

export const STRANDS = {
  input: {
    label: "Meaning-focused input",
    short: "Input",
    blurb: "Reading and listening where you are following the meaning, not studying the form.",
  },
  output: {
    label: "Meaning-focused output",
    short: "Output",
    blurb: "Saying and writing things you actually mean, with the words you already have.",
  },
  form: {
    label: "Language-focused learning",
    short: "Study",
    blurb: "Deliberate attention to words, grammar and spelling — the drills.",
  },
  fluency: {
    label: "Fluency development",
    short: "Fluency",
    blurb: "Getting faster at what you already know, under a little time pressure.",
  },
};

export const STRAND_ORDER = ["input", "output", "form", "fluency"];

/* Every kind of work the app offers, and the strand it serves.
 *
 * `section` is the rail item it lives under, so a recommendation can be
 * navigated to by the same handler the rail uses — speaking and dictation are
 * two activities inside one section, which is exactly why activities are
 * keyed separately from sections here.
 *
 * Two of these sit on a boundary and are placed on purpose. Dictation is
 * listening, but listening *for the exact form* — Nation would call it
 * language-focused. It is counted as input because it is the only sustained
 * listening in the app, and calling it study would leave the input strand
 * looking emptier than the learner's ears actually are. Sentence
 * Constructions produces language but to a specification rather than to say
 * something, so it is study, not output.
 */
export const ACTIVITIES = {
  media:{strand:'input',section:'media',label:'Media Studio',invite:'Listen to your own media'},
  listeningMeaning:{strand:'input',section:'listeningLab',label:'Listen for meaning',invite:'Follow a short dialogue'},
  pronunciation:{strand:'form',section:'pronunciation',label:'Sound contrasts',invite:'Compare a sound contrast'},
  retelling:{strand:'fluency',section:'retelling',label:'Retelling',invite:'Retell a familiar situation'},
  missions:{strand:'form',section:'missions',label:'Practical missions',invite:'Take a short practical lesson'},
  reading: { strand: "input", section: "reading", label: "Reading Room", invite: "Read a passage" },
  dictation: { strand: "form", section: "listening", label: "Dictation", invite: "Listen and write it down" },
  import: { strand: "input", section: "import", label: "a text of your own", invite: "Bring in a text" },

  writing: { strand: "output", section: "writing", label: "Writing Desk", invite: "Write something" },
  speaking: { strand: "form", section: "listening", label: "Read-aloud", invite: "Practise reading aloud" },

  study: { strand: "form", section: "study", label: "Study", invite: "Study words" },
  /* A lesson spans three strands. Its reading stage is logged as reading and
   * its writing task as writing, so what is left — the exercises — is study. */
  lessons: { strand: "form", section: "lessons", label: "Lessons", invite: "Take a lesson" },
  grammar: { strand: "form", section: "grammar", label: "Grammar & Verbs", invite: "Drill a tense" },
  sentences: { strand: "form", section: "sentences", label: "Sentence Constructions", invite: "Build a sentence" },
  mywords: { strand: "form", section: "mywords", label: "My Words", invite: "Add words of your own" },
  mistakes: { strand: "form", section: "mistakes", label: "Your mistakes", invite: "Work on a mistake pattern" },
  phrases: { strand: "form", section: "phrases", label: "Phrase Match", invite: "Match some idioms" },
  etymology: { strand: "form", section: "etymology", label: "Word Roots", invite: "Trace a word root" },
  collocations: { strand: "form", section: "collocations", label: "Collocations", invite: "Practise word partners" },

  fluency: { strand: "fluency", section: "fluency", label: "Fluency", invite: "Run a fluency round" },
};

const asDate = (key) => new Date(`${key}T00:00:00`);

export function daysSince(dateKey, today) {
  if (!dateKey) return null;
  return Math.max(0, Math.round((asDate(today) - asDate(dateKey)) / 86400000));
}

/**
 * Note that a kind of work was done today.
 *
 * `days` counts distinct days, not sessions: three reading passages in one
 * evening is one day of reading, and counting it as three would let a single
 * enthusiastic sitting claim a balanced week.
 */
export function recordActivity(activity, key, today) {
  const base=key.includes(':')?key.split(':').at(-1):key;
  if (!ACTIVITIES[base]) return activity || {};
  const next = { ...(activity || {}) };
  const prev = next[key];
  next[key] = {
    last: today,
    days: prev?.last === today ? prev.days : (prev?.days || 0) + 1,
    first: prev?.first || today,
    dates:[...new Set([...(prev?.dates||[]),today])].sort().slice(-90),
  };
  return next;
}

/**
 * How each strand stands: when it was last touched, and what share of your
 * days of study it has had.
 *
 * The share is of *days*, and is labelled that way wherever it is shown. The
 * app does not time anyone, so a share of minutes would be a number it cannot
 * actually know — and Nation's guidance is about time. Days is the honest
 * approximation available, and it is a good one over weeks.
 */
export function strandBalance(activity, today, {lang=null}={}) {
  const rows = STRAND_ORDER.map((strand) => {
    let days = 0;
    let last = null;
    const dates=new Set();
    for (const [key, entry] of Object.entries(activity || {})) {
      const base=key.includes(':')?key.split(':').at(-1):key;
      if(lang&&key.includes(':')&&!key.startsWith(`${lang}:`))continue;
      if (ACTIVITIES[base]?.strand !== strand || !entry) continue;
      for(const date of entry.dates||[entry.last].filter(Boolean))dates.add(date);
      days=Math.max(days,entry.days||0);
      if (!last || (entry.last || "") > last) last = entry.last;
    }
    return { strand, days:dates.size||days, last, since: daysSince(last, today) };
  });
  const total = rows.reduce((n, r) => n + r.days, 0);
  return rows.map((r) => ({ ...r, share: total ? r.days / total : 0 }));
}

/** How long a strand may go untouched before it is worth naming. */
export const STALE_DAYS = 3;

/**
 * The strand most in need of attention, and one thing to do in it.
 *
 * Ranked by how long it has been left rather than by share, because "you have
 * not read anything for nine days" is a fact a learner can act on, where "your
 * input share is 18%" is a statistic about the past. A strand never touched at
 * all outranks every strand that has been.
 *
 * `available` lets the caller exclude work that cannot actually be started —
 * there is no point recommending Collocations in a language that has none.
 */
export function neglectedStrand(activity, today, { available = null, staleDays = STALE_DAYS,lang=null } = {}) {
  const can = (key) => !available || available.has(key);
  const candidates = [];

  for (const strand of STRAND_ORDER) {
    const keys = Object.keys(ACTIVITIES).filter((k) => ACTIVITIES[k].strand === strand && can(k));
    if (!keys.length) continue;

    const rows = keys.map((key) => ({ key, ...(activity?.[lang?`${lang}:${key}`:key] || activity?.[key] || {}) }));
    const last = rows.reduce((acc, r) => (!acc || (r.last || "") > acc ? r.last || acc : acc), null);
    const since = daysSince(last, today);
    /* Never done is the strongest case there is, and has no number of days. */
    if (since !== null && since < staleDays) continue;

    /* Within the strand: something never tried first — it is the part of the
     * app the learner has no path to — then whatever is longest unvisited. */
    const untried = rows.find((r) => !r.last);
    const stalest = [...rows].sort((a, b) => (a.last || "").localeCompare(b.last || ""))[0];
    const pick = untried || stalest;

    candidates.push({
      strand,
      activity: pick.key,
      section: ACTIVITIES[pick.key].section,
      label: ACTIVITIES[pick.key].label,
      invite: ACTIVITIES[pick.key].invite,
      never: !last,
      days: since,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    if (a.never !== b.never) return a.never ? -1 : 1;
    return (b.days || 0) - (a.days || 0);
  });
  return candidates[0];
}

/** One line saying why this strand, for the suggestion card. */
export function strandWhy(gap) {
  if (!gap) return "";
  const name = STRANDS[gap.strand].label.toLowerCase();
  if (gap.never) return `You have not tried this yet — it is the ${name} side of the course.`;
  if (gap.days === 1) return `A day since any ${name}. All four kinds of practice want a turn.`;
  return `${gap.days} days since any ${name}. All four kinds of practice want a turn.`;
}
