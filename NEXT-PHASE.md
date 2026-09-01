# Next phase — plan

> **Status (2026-08-31): Tier 0 done, most of Tiers 1–3 done.** What was
> completed, and what deliberately was not, is recorded at the bottom under
> **Outcome**. The item descriptions below are left as written so the reasoning
> behind each one survives.

Written 2026-08-31, at the end of the desktop restructure (Phases 1–5). Nothing
here is started. Pick items in whatever order suits; the sequencing notes only
matter where one item genuinely blocks another.

Everything below was verified against the code at the time of writing rather
than recalled, and each item says how you'd know it was done.

---

## Tier 0 — Correctness. Do these before any new features.

These are the items where the app is currently *wrong*, not merely unfinished.
Two of them silently corrupt scheduling data, which is the one thing a spaced-
repetition app cannot get away with.

### 0.1 The rapid-click crash (already spawned as its own task)

Clicking the flashcard "next" arrow faster than React re-renders white-screens
the whole app. `setLearnIdx((i) => i + 1)` (`VocabDrawer.jsx` ~L4916) is a
functional update, so batched clicks push the index past the end of the batch
before the re-render can swap the arrow for the "Match" button. The bounds
guard nearby depends on `[currentBatch]`, so it never re-clamps on overflow;
`currentBatch[learnIdx]` is then `undefined` and `.t` throws.

Reproduces identically at 375px and 1280px — it predates the restructure.

**Fix:** clamp at the increment, `Math.min(i + 1, currentBatch.length - 1)`,
and/or add `learnIdx` to the guard effect's deps. Decide whether overflowing
should instead advance to Match.

**Done when:** triple-clicking the arrow on the last card cannot blank the app
at either width, and normal card-by-card paging still reaches Match.

### 0.2 No error boundary anywhere

Confirmed absent: no `componentDidCatch`, no `getDerivedStateFromError`. Any
render error in a 5,950-line component unmounts the entire app to a white
screen with no recovery and no message — which is exactly what 0.1 does, and
what the `GENDER` bug did earlier in this project's history.

**Fix:** wrap the shell in an error boundary that keeps the rail/header, shows
what failed, and offers "reload" plus "go home" (the latter resetting `screen`
without dropping `progress`). Persisted progress is in IndexedDB, so a boundary
can honestly promise nothing was lost.

**Done when:** a deliberately thrown render error shows a recoverable panel
instead of a blank page, and progress survives it.

**Why it ranks above features:** it converts every future crash from
catastrophic to annoying. Worth doing even though 0.1 fixes the known trigger.

### 0.3 `missedRef` is keyed by bare headword

`missedRef.current.set(currentQ.word.t, …)` (L2368) and the sentence stage
(L2417) key by `word.t` alone, while everything else in the app keys by
`cardId(lang, level, word.t)`. Two words sharing a headword across levels — or
an imported word colliding with a built-in one — overwrite each other in the
missed list.

This is a latent bug the restructure surfaced but did not introduce: the new
ledger and summary table deliberately key on `cardId`, so they and `missedRef`
can now disagree about what was missed.

**Fix:** key `missedRef` by `cardId` like everything else; the values already
carry `{word, level}` so nothing else changes.

**Done when:** studying the same headword at two levels in one sitting lists
both in "practise the misses".

### 0.4 Mobile's Home button still discards a sitting

`MobileShell.jsx` L23's Home button calls `setScreen("setup")` with no
`commitSession()`. Leaving a batch halfway throws away every answer already
graded. Desktop's "Leave" was given the correct behaviour in Phase 2; mobile
was deliberately left alone to protect the byte-identity guarantee, which has
since been retired anyway.

**Fix:** call `commitSession()` first, as `leaveStudy()` does. It is idempotent.

**Done when:** answering three words, pressing Home, and returning shows those
three as started.

---

## Tier 1 — The restructure's own loose ends

### 1.1 Mobile is now a different application

Desktop carries the Classical theme (Cormorant Garamond / Lora, grey ground);
mobile keeps the warm card-catalog look. That was the agreed scope, but the two
now look unrelated, and the *phone* is where a vocabulary app is actually used.

Three honest options, in ascending cost:

1. **Theme parity only** — apply Classical below 1024px too. One line: drop the
   `.vd-classical` scope from the desktop shell onto the root. Layout unchanged.
   Cheapest way to make it one product again.
2. **Selective ports** — bring the genuinely better *ideas* to mobile without
   the desktop layouts: the per-word summary table (1f) collapses to a list
   fine; the stage rail replaces step-dots; the batch ledger becomes a
   bottom-sheet.
3. **A real mobile pass** — new wireframes for phone. Out of scope for a
   session; it needs a design round like the one that produced this handoff.

**Recommendation: (1) now, (2) as its own phase.** Note (1) changes every
mobile screen's appearance, so decide deliberately.

### 1.2 The workbench doesn't count

`GrammarWorkbench` tallies cells answered but schedules nothing — it says so on
screen ("Practice only — nothing is scheduled here"). That was a deliberate
choice to avoid duplicating the grading path the plan said to freeze, and it
matches how the existing table/matching stages behave.

But it is now the *default* grammar surface on desktop, so the most convenient
way to practise verbs is the one that doesn't advance your schedule.

**Fix:** on Check, record into `sessionResultsRef` under `conjCardId(verb,
tense)` and commit on leaving the screen — reusing `gradeFromWrongCount` and
`scheduleCard`, not a second grading rule.

**Verify with the technique the plan named:** run the same answer sequence
through the workbench and through the existing wizard, and diff
`progress.cards[conjCardId(…)].{ease,interval,due}`. They must agree.

### 1.3 The coverage matrix shows 12 of 188 verbs

No filter, no pagination, `…176 more`. Fine for the core verbs; useless for the
C1 sets, which are the ones you'd actually want a coverage map for.

**Fix:** the same filter box the workbench sidebar already has, plus either
pagination or "show all" with virtualisation. Sorting by "least solid" or "most
due" would make the map answer the question it exists to answer.

### 1.4 Six screens have no desktop design

Reading, phrase match, listening/speaking, sentence construction, import, and
progress render their unchanged narrow column inside the rail's main area. They
work and they aren't broken — they just look like a phone screen stranded in a
1280px window. The handoff never covered them.

**Fix:** at minimum give them a max-width and centre them; at best, lay out
reading and progress for the width they now have.

---

## Tier 2 — Content and reach

### 2.1 The level ceiling is uneven

Vocabulary runs A1–C1, but reading passages, idioms and dictation stop at B2
(README "Levels"). A C1 learner has a vocabulary track and nothing else.

**Fix:** author or generate C1 reading passages and idiom sets. The generation
path exists (`prose` model in `server/index.js`) and the fact-check pattern from
My Words is the model for reviewing generated content before it ships.

### 2.2 Images stop at B1

A1 95%, A2 84%, **B1+ ~0%** — by design, since *to substantiate* has no honest
illustration. But that means the picture-choice exercise silently disappears at
exactly the level where motivation flags.

**Fix:** decide whether the image layer extends by a different mechanism at
higher levels (a scene per collocation? a diagram per abstract relation?) or is
formally A1–A2 only, documented and closed.

### 2.3 The app needs a key for its best feature

Text import and the fact-check need an Anthropic key; without one, words save
unchecked. Degradation is graceful and the message is honest. But the checking
service failure banner is `wordsError`, which persists in the workspace after
the run — it stays on screen next to a library that saved fine.

**Fix:** clear `wordsError` when a new action starts, or scope it to the panel
that produced it.

---

## Tier 3 — Structural debt

### 3.1 `VocabDrawer.jsx` is 5,952 lines

The restructure extracted 13 components but left every hook, handler and screen
in one file. It builds fine and is navigable by search, but it is the single
biggest obstacle to anyone else working on this.

**Fix, if and when it earns itself:** extract by *area* rather than by
component — a `study/` module owning the pipeline's state and screens, a
`words/` module owning import. That means moving state, which is why the
restructure explicitly did not do it. Only worth it when a second person, or a
second app surface, needs it.

### 3.2 No component tests

`scripts/check-answers.mjs` covers the pure layers well (2,409 glosses, ~29,000
sentences, 12,936 English renderings). Nothing tests a component. Every UI
regression this project has had was caught by a human looking at a screenshot,
or by the DOM-fingerprint script — which is slow, manual, and, since the CSS
variable change, no longer able to compare data-dependent screens.

**Fix:** add Vitest + Testing Library and cover the pieces where a silent
regression is expensive: `batchLedger` status derivation, `summaryPreview`
due-date preview, the coverage matrix's drilled-vs-due guard, and
`acceptableEnglish`. All four are pure functions of props/state and need no
browser.

**This is the highest-leverage item in Tier 3** — it retires the manual
fingerprint ritual.

### 3.3 761 KB bundle, single chunk

Over Vite's 500 KB warning and growing. All vocabulary data, all C1 verb
tables, and every screen ship on first paint.

**Fix:** `React.lazy` the areas most users never open in a session (progress,
import, grammar), and dynamic-import the C1 data modules. Straightforward, and
the section split the rail introduced makes the boundaries obvious.

### 3.4 Pre-existing lint warnings

~24 unused lucide imports, a dead `recordAnswer`, two bare catch params, some
`exhaustive-deps`, one `no-useless-escape` in `dictionary.js`. All inherited or
from the parallel session; none are mine and none are bugs. A single cleanup
pass closes the README's "Known rough edges" note.

---

## Suggested first session

If you want one clean, self-contained block of work: **Tier 0 in full.** Four
fixes, all small, all verifiable, and they close every known way the app can
currently lose or corrupt your data. Add **3.2's four unit tests** in the same
session and the fixes come with proof they stay fixed.

That is roughly one focused session. Everything else can follow in any order.

---

# Outcome

## Done

**Tier 0, in full.**
- **0.1** the next-card increment clamps (`Math.min(i + 1, len - 1)`) and the
  bounds guard now depends on `learnIdx`, not only on the batch. 20 rapid clicks
  land on the last card at both widths instead of blanking the app.
- **0.2** `ErrorBoundary` wraps the app. Proved by making a descendant throw:
  it shows a recoverable panel with the message, "back to home" (which remounts
  via a `key`) and "reload". Worth recording that the *first* version of that
  test threw inside `App`'s own render and escaped the boundary — a boundary
  only catches its descendants.
- **0.3** `missedRef` is keyed by `cardId` like everything else, so the same
  headword at two levels no longer overwrites itself. Consumers only read
  `.values()`, so nothing else changed.
- **0.4** mobile's Home button routes through `leaveStudy`, which commits first.
  Verified against IndexedDB: a card answered then abandoned went from due-today
  to `2026-09-02`, `reps` 1→2. Before, it was untouched.

**Tier 1.** The workbench schedules (1.2) — same `gradeFromWrongCount` +
`scheduleCard` the drill uses, verified by watching `être:present` move interval
30→69 exactly as the scheduler predicts; revealing a form stays ungraded. The
coverage map has a filter, a "most due first" sort and show-all (1.3) — the ten
`mettre` compounds were previously unreachable past the first twelve
alphabetically. The six screens the handoff never covered are capped at a
720px reading measure instead of stretching (1.4).

**Tier 2.3** — the failed-check banner clears when a new check starts.

**Tier 3.** Vitest with **25 tests** over the scheduler and the three study
derivations (3.2), each written against a bug that actually happened; the
derivations were extracted to `src/lib/srs.js` and `src/lib/study.js` to make
that possible. `npm run check` runs tests + data sweep + lint + build. The
bundle is split three ways (3.3). Lint went from ~30 warnings to 4 (3.4), and
the keyboard handler moved to a ref so its correctness no longer rests on
"every handler's state happens to appear in the dependency array".

## Not done, and why

- **1.1 mobile theme parity.** Left alone deliberately. You explicitly chose
  "desktop only" when the Classical theme went in; making it universal changes
  every mobile screen's appearance, so it is a decision to take rather than
  something to fold into a cleanup pass. The change itself is one line — move
  `vd-classical` from the desktop shell to the root.
- **2.1 / 2.2 content.** Authoring C1 reading passages and idioms, and deciding
  what images mean above B1, are content work rather than code work. 2.2 is a
  product decision first: either invent a mechanism for abstract vocabulary or
  formally close the image layer at A2 and say so.
- **3.1 splitting `VocabDrawer.jsx`.** Still 5,900 lines. The plan's own
  condition — "only worth it when a second person, or a second app surface,
  needs it" — has not been met, and it is the one change here that would move
  state rather than markup.
- **Four `exhaustive-deps` warnings.** Correct as written; the omitted values
  are stable for the memo's lifetime. Adding them changes what recomputes, so
  silencing or "fixing" them would trade a cosmetic warning for a real risk.
