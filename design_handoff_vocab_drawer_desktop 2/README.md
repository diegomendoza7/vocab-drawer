# Handoff: Vocab Drawer desktop restructure (wireframes)

## Overview
Ten desktop-layout wireframes restructuring four areas of the existing Vocab Drawer app
(local Vite + React + Tailwind project, single `src/VocabDrawer.jsx`):

- **Home / setup** — three alternatives, all driven by the brief that the language-level
  section currently eats too much of the main screen.
- **Study pipeline** (learn → match → choose → type → sentence → summary) — three alternatives.
- **My Words** (hub → input → fact-check review → library) — two alternatives.
- **Grammar & conjugation** — two alternatives.

A second round (2a–2f) covers the six screens that had no desktop design at all and were
missing from the first version of this handoff: Reading Corner, Phrase Match,
Listening & Speaking, the sentence stage, Import, and Progress. These are capped at a 720px
measure in the current build, so in a 1280px window they are still phone layouts. Unlike
1a–1j these are **one design each, not alternatives** — they fill gaps rather than offer choices.

Nothing here is final: the point of the bundle is to pick a direction per area, then implement
that one. Options are addressable by id (1a…1j) — the ids appear as badges in the design file
and are used throughout this README.

## About the Design Files
The file in this bundle is a **design reference created in HTML** — a wireframe board showing
intended layout, hierarchy and content, not production code to copy. The task is to
**recreate the chosen layouts inside the existing `vocab-drawer` React codebase**, using its
established patterns: React state in `src/VocabDrawer.jsx`, Tailwind utility classes, the
lucide-react icon set already imported there, and the existing data modules
(`src/data/vocab.js`, `src/data/content.js`, `src/data/conjugation.js` and siblings).
Do not port the wireframe's markup, its inline styles, or its fonts.

## Fidelity
**Low-fidelity (lofi).** These are wireframes: structure, hierarchy, information density,
copy and flow are the deliverable. Boxes, hairlines and greyboxes stand in for real components.

Two caveats specific to this board:
- The **content is real**, taken from the app's own data files (A2 French drawers, real FR
  headwords, `être` present-tense forms, My Words verdict states). Treat the copy as
  near-final; treat the boxes as placeholders.
- The **styling is not the app's current styling.** The board is drawn in the "Classical"
  editorial style (Cormorant Garamond / Lora, warm near-white ground, gold used as stroke).
  Unless the team is also adopting that style, ignore the wireframe's colors and type and
  apply the app's existing Tailwind styling. The Design Tokens section below records what the
  board uses, for reference only.

## Screens / Views

### 1a — Home: persistent left rail, level demoted to a segmented strip
**Purpose:** Land, see what's due, start studying. Replaces today's stacked-card home screen.

**Layout:** Two columns, `grid-template-columns: 212px 1fr`, min-height ~600px.
- **Left rail (212px, hairline right border, tinted panel):** brand mark + "Vocab Drawer";
  nav items at ~7px/10px padding — Study (active, tinted, right-aligned level badge "A2"),
  My Words · 34, Grammar & Verbs · 6 due, Reading Corner, Phrase Match,
  Listening & Speaking, Import a text, Progress. Spacer, then a two-up
  French / German toggle pinned to the bottom, and a "Progress saving: on" caption.
- **Main column (padding 22px 26px, 18px vertical gap):**
  1. **Due banner** — bordered card with a 3px accent left border, padding 16px 18px, row of:
     "12 due" (26px heading) + "148 of 698 French words started" caption; then two stat
     blocks (7 streak, 23 today); then the primary action "Review 12 due words →".
  2. **Level strip** — a single row, wrapping: segmented A1/A2/B1/B2/C1 control (active step
     tinted), the level description as one line of caption text
     ("Elementary. Everyday exchanges — 140 words across 14 drawers."), then a
     By theme / Mixed batches segmented toggle pushed right. **This is the fix for the
     oversized level section: language moves to the rail, mode becomes a toggle, the
     description collapses to one line.**
  3. **Drawer grid** — `repeat(3, 1fr)`, 11px gap. Each tile: drawer name, caption
     "10 words · 7 mastered", 5px mastery bar. Last tile is a dashed "+ 6 more drawers".

### 1b — Home: two columns, "today" left, catalog table right
**Purpose:** Same landing job, optimised for scanning the whole level at once.

**Layout:** Header row (brand left; French ▾ / A2 ▾ dropdowns + saving caption right), then
`grid-template-columns: 296px 1fr`, 20px gap, min-height ~520px.
- **Left column (12px gap):** due card (accent left border, "12 due today", streak/answered
  caption, primary button, "Mixes A1–C1 and My Words." note); a resume card
  ("A2 · Weather · card 4 of 10 · typing stage" + "Resume drawer"); a maturity card with a
  six-bar greybox histogram, "new · learning · young · mature" caption and a
  "View full progress →" link; a dashed block listing the remaining modes as plain text.
- **Right column:** bordered table card. Toolbar row (title "A2 drawers", By theme / Mixed
  buttons, a dashed "search drawers" field), then columns
  `1fr 70px 120px 90px` = Drawer / Words / Mastery (bar) / Study button, ~10px 14px per row,
  hairline row rules, trailing "…8 more drawers" row.
- Language and level are **dropdowns in the header** — the level panel disappears entirely.

### 1c — Home: single "continue" hero, everything else a flat mode grid
**Purpose:** One decision on landing; browsing is secondary.

**Layout:** Header (brand; "FR · A2 ▾" pill + Progress). Then:
- **Hero** — bordered card, 3px accent left border, padding 26px: kicker "Up next",
  34px heading "Review 12 due words", caption "then Weather, card 4 of 10 · 7-day streak",
  and a large "Start →" button right-aligned.
- Caption "Or choose something else", then a `repeat(4, 1fr)` grid of eight mode tiles
  (padding 14px, min-height 96px): Drawers, Mixed batches, My Words, Grammar & Verbs,
  Reading Corner, Phrase Match, Listening & Speaking, Import a text — each with a one-line
  caption.
- **Dashed annotation block** documenting the level popover that opens from the "FR · A2"
  pill: language toggle, A1–C1 tabs, level description, words-per-batch slider.
  In this option the level settings leave the page entirely.

### 1d — Study: centered stage, stage rail on top, batch ledger at the side
**Purpose:** Run a batch while always knowing which stage you're in and which words remain.

**Layout:** Header bar (hairline bottom): breadcrumb caption
"FR · A2 · Weather · batch 1 of 2"; a stage rail of six pills — Learn, Match (both marked
done), Choose (active), Type, Sentence, Done; a "Leave" button. Body is
`grid-template-columns: 1fr 244px`.
- **Stage (padding 26px 30px, centered, max-width 620px):** progress line
  ("4/10 cleared" / "3 in a row") over a 5px bar; then the prompt card (3px accent left
  border, padding 24px) — kicker "Choose the French", 26px prompt "the rain", three stacked
  option rows, footer row with "♪ Hear word" and "Continue →"; then a keyboard-hints caption
  ("enter = check · 1–3 = pick an option · s = skip ahead to typing").
- **Ledger (244px, hairline left border, tinted):** "This batch" heading, then all ten words
  with a per-word state caption (typed ✓ / chosen / matched / seen, misses in accent), and a
  dashed note "Click any word to see its card again."

### 1e — Study: full-bleed focus mode, chrome only on hover
**Purpose:** Same pipeline with no furniture. Drawn narrow (600px) on purpose — the card
never widens past reading measure.

**Layout:** 4px accent progress line at the very top (38% filled). Centered column:
kicker "Fill in the missing word", 28px prompt "Il fait très _____ aujourd'hui.",
translation caption, a 340px input box, a 180px "Check" button, hint caption
"♪ hear it · enter to check". Footer (dashed top rule): context caption
"Weather · type stage · 4/10" left, "esc = leave · tab = show batch ledger" right.

### 1f — Study: summary folded into the ledger (per-word record, not a score card)
**Purpose:** End-of-batch results that say what happens next per word.

**Layout:** Title row "Weather — done" + caption "80% first try · 10/10 mastered ·
24 answers". Table card, columns `1fr 1fr 90px 100px` = Word / Meaning / First try /
Next due; missed rows tinted with the accent tint and their "×2" marks in accent;
trailing "…6 more, all clean". Then an action row: primary "Next drawer: Shopping & Money →",
"Practise the 2 misses", "Home". Dashed footnote: scheduling is shown per word so
"mastered" means something concrete instead of a percentage.

### 1g — My Words: one workspace (library table + add panel)
**Purpose:** Collapse today's hub → input → library screens into a single view.

**Layout:** Header row: "My Words" + caption "French · 34 saved · 3 unchecked", spacer,
French / German buttons, primary "Study my words →". Body `1fr 300px`, 18px gap.
- **Library table (left):** toolbar — dashed "filter words" field, quick filters
  "unchecked (3)" (active) and "due (5)", "sort: added ▾" caption. Columns
  `1.1fr 1.1fr 88px 1fr 92px 30px` = Term / Meaning / Check / Source / Due / delete.
  Check cell is a small pill: ok, sense (accent border), fixed, or dashed "unchecked".
  Rows needing attention are tinted. Trailing "…29 more". Footer bar (hairline top):
  "Check 3 unchecked" button + "selected: none" caption.
- **Add panel (300px, tinted, 11px gap):** "Add words" heading; Paste / File / One
  segmented control; a hatched dashed textarea with the accepted formats as its placeholder
  ("One per line — term, term/translation, tab-separated or 'word 4213'."); a dashed
  "Where these came from (optional)" field; "Read as: detect automatically ▾" caption;
  "Read this list" button. Below a dashed rule: staging summary
  ("Staged: 12 rows · 2 duplicates dropped"), a checkbox list where duplicates are unchecked
  and explained inline ("already in your deck"), and the primary "Check 11 words".

### 1h — My Words: fact-check review as a yours/proposed diff table
**Purpose:** Decide per word whether to take the checked translation. Nothing changes until save.

**Layout:** Title "Check the translations" + caption "4 of 11 came back with something to
look at · nothing changes until you save". Filter row: "Needs a look (4)" (active) /
"Clean (7)", spacer, bulk "Accept all fixes" / "Keep all mine". Table columns
`142px 1fr 1fr 210px` = Term / Yours / Proposed / Decision:
- Term cell carries the verdict caption (sense-dependent, needs a fix, ok).
- Yours and Proposed sit side by side, each with an example sentence as caption.
- Decision cell: three nowrap buttons — "Take it" (accent tint), "Keep mine", "Skip".
  Clean rows show a caption instead ("will save as yours").
Dashed note about unavailable checks: "2 words could not be checked (no key / service down)
— they save marked unchecked and can be checked later from the library." Persistent save bar:
"Saving 11 words · 2 fixes accepted · 1 skipped", "Back to input", primary
"Save 11 words to my deck".

### 1i — Grammar: verb workbench (replaces the six-screen wizard)
**Purpose:** Choose a verb and tense as a selection, not a wizard, and drill in place.
Collapses today's grammarHub → conjSetup → conjTable → conjMatch → conjChoose → conjugation.

**Layout:** `grid-template-columns: 210px 1fr 236px`, min-height ~560px.
- **Verb list (210px, tinted, hairline right):** "Verbs" heading, dashed
  "filter 32 core verbs" field, verb rows with due counts (être active/tinted · 2 due,
  avoir · 1 due, aller, faire, pouvoir · 3 due, vouloir, devoir, venir, "…24 more"),
  then a "Random 5" button.
- **Center (padding 20px 22px):** tense segmented control
  (Present active / Passé composé / Imparfait / Futur) + "6 due on the verb track" caption.
  Then the conjugation card: header ("être", caption "to be · irregular · present",
  "♪ hear all" right), then a `110px 1fr 1fr` table of person / form / gloss where **one
  cell is blanked in place** (dashed input, tinted row, "← type it") and later rows read
  "hidden until you answer". Card footer: explanation caption, "Reveal row", primary "Check".
  Below: "Then: matching, multiple choice and full-verb typing run in this same frame,
  table staying visible above."
- **Right column (236px, tinted, hairline left):** "Note" (present-tense -er endings, plus
  the four verbs learned whole), "This session" (14 cells answered · 11 first try ·
  3 come back), "Grammar notes" (9 short notes →), separated by dashed rules.

### 1j — Grammar: coverage matrix (pick the gaps, then drill only those)
**Purpose:** Deciding what to practise, as a companion to 1i's practising surface.

**Layout:** Title "Conjugation trainer" + caption "French · 32 verbs × 4 tenses · 6 due";
explanation line "Each cell is one verb in one tense. Shade shows how solid it is; click cells
or a whole row/column to build a drill." Then a bordered card holding a
`118px repeat(4, 1fr)` grid, 7px gap: column headers (Present, Passé comp., Imparfait, Futur),
one row per verb, each cell a 30px block whose fill is a neutral ramp step (darker = more
solid) or a dashed outline for "never drilled"; due cells get a 1px accent outline.
Legend row: solid → four swatches → "never drilled", with "outlined = due" right-aligned in
accent. Footer: "Selected: 2 cells (aller · passé composé, pouvoir · present)",
"Mix all tenses", primary "Drill 2 selected →". Dashed note: the drill formats stay as today
(table, matching, multiple choice, typing) — only the set-picking changes.

### 2a — Reading Corner: passage holds the left column, questions track it on the right
**Purpose:** Read a passage and answer cloze questions about it without losing sight of the text.
Replaces readingSelect → readingQuiz → readingDone.

**Layout:** Header row: "Reading Corner" + caption "French · A2 · 2 of 4 passages read", spacer,
A1/A2/B1/B2 segmented control. Body `grid-template-columns: 1fr 320px`, 24px gap.
- **Left:** passage title (26px) + source caption ("Charles Perrault, Le Petit Chaperon Rouge
  (1697)"), then the passage itself — justified, line-height 1.85, **max-width 56ch**, with the
  four asked-about words carrying a 1px accent underline. Below: "Show English" / "♪ Read aloud"
  buttons and the caption "underlined = asked about below"; a dashed note recording that English
  appears in place under each sentence when toggled, never in a separate view. Footer above a
  hairline: "3 words here are not in your deck: bûcheron, galette, compère" + "Add 3 to My Words".
- **Right (320px):** the question card (3px accent left border) — "Question 1 of 4", the cloze
  sentence with a dashed blank inline, four stacked choices, "Check" (primary) + "Skip", and the
  hint "1–4 to pick · enter to check. The passage stays put; only this card advances." Below it a
  tinted card listing all four questions with per-question state (answering… / not yet), then a
  caption card "Next: Le loup arrive (B1) · Le dénouement (B2)".

### 2b — Phrase Match: two facing columns, solved pairs drop into a glossed ledger
**Purpose:** Match idioms to meanings with both halves visible at once. Replaces
phraseSelect → phraseMatch → phraseDone.

**Layout (880px):** Header "Phrase Match" + caption "French · B1 · idioms, six at a time",
spacer, "3 of 6 paired · 1 wrong try". Then `1fr 1fr`, 18px gap: left column "The French",
right column "What it means" (shuffled). Unpaired items are bordered rows; the selected one is
accent-tinted with a 3px accent left border; already-paired items go dashed, muted, and the
left column marks them "paired". Caption under the field: "Click one from each column. Wrong
pairs flash and stay; right pairs grey out here and appear below with the literal."
- **"Paired so far"** below a hairline: a `1fr 1fr` grid where each entry is the French phrase
  with a caption carrying meaning **and literal** ("To have other fish to fry · lit. 'to have
  other cats to whip'"). The literal reading is revealed on the pair, not held for a results screen.
- Footer: caption "A1 · A2 · B1 · B2 — 24 idioms per language", "Change level",
  primary "Next six →".

### 2c — Listening & Speaking: one stage, two modes, attempt history beside it
**Purpose:** Dictation and speaking practice in one persistent frame. Replaces dictation,
dictationDone, speaking, speakingDone.

**Layout:** Header bar: Dictation / Speaking segmented control (Dictation active), breadcrumb
"French · A2 · Weather · 4 of 10", "voice: Amélie ▾ · speed 0.8× ▾", "Leave". Body
`1fr 290px`.
- **Stage:** kicker "Listen, then write what you hear"; the card (max-width 560px, 3px accent
  left border) holds a round 44px ♪ replay button, a ten-bar greybox waveform, a "played 2×"
  caption, the answer input, and a button row "Check" (primary) / "Hear again" / "Slower".
  Under it, an accent-tinted feedback card: "Almost — one letter", the target with the corrected
  word underlined, and the explanation "You wrote aujourdui · the apostrophe is part of the word.
  Accents and apostrophes are checked; capitals are not." Then keyboard hints
  "enter = check · space = replay · shift+space = slower".
- **Right rail (290px, tinted):** "This set" — per-line results (first try / 2 tries /
  answering, current line in accent) and "6 to go"; then, separated by dashed rules,
  **"Speaking mode"** (same frame, three swaps: input becomes hold-to-speak, the waveform
  records instead of plays, the result marks each word of the target heard / missed / unclear;
  target text shown, not hidden) and **"If audio is unavailable"** (the mode is offered but
  marked unavailable with the reason, instead of failing silently on play).

### 2d — Sentence stage: build the sentence, with the word's card open beside it
**Purpose:** The last stage of a batch, currently a bare cloze. Replaces the `sentence` screen.

**Layout (880px):** `1fr 268px`.
- **Left (padding 24px 26px):** breadcrumb "FR · A2 · Weather · sentence stage · 8 of 10" +
  "3 in a row". The prompt card (3px accent left border): kicker "Say this in French", 22px
  English prompt "It's very cold today."; an answer strip (min-height 46px, flex-wrap, hairline
  bottom) holding the chips placed so far — Il / fait / très — and a dashed empty slot; then a
  "Word bank" of six chips (froid, aujourd'hui, chaud, est, beaucoup, le temps); then
  "Check" (primary) / "Type it instead" / "Reveal", and the caption "Bank holds two distractors
  and one near-miss (est). Typing accepts the same answer with accents required."
  A dashed note records the post-check state: the full sentence sets in place with the target
  word underlined, its English underneath, a ♪ to hear it, and Continue in the same card — no
  separate result screen.
- **Right rail (268px, tinted):** the word being practised — "froid" (21px), "cold",
  "adjective · A2 · Weather", "♪ hear word"; then "Seen this batch" (learn · match · choose ·
  type ✓, with "Sentence is the last stage before the word is scheduled"); then "Note"
  explaining that weather takes *il fait* + adjective, not *il est* — which is why *est* is in
  the bank; footer caption "German: the same frame, with the gender tag shown on nouns."

### 2e — Import: text library, reader and lookup panel in one frame
**Purpose:** Read a pasted text and save words from it. Replaces importPaste → importReader →
importLibrary.

**Layout (940px):** three columns `186px 1fr 292px`.
- **Library rail (186px, tinted):** "Your texts" with saved texts as rows carrying a caption
  ("Le Monde — climat" / "read 2d ago · 4 saved"; active one accent-tinted), then
  "+ Paste a new text", then a dashed note: paste opens **here as an editable panel** — title
  field, textarea, language, "Read this" — not a separate screen. Footer caption: words you save
  land in My Words tagged with the text they came from.
- **Reader (center):** title row with an "Edit" caption; a legend row (filled square = in your
  deck, accent underline = click to look up, grey = no gloss found); then the text, justified,
  line-height 1.95, **max-width 52ch**, with words marked by that legend. Caption: "Click any
  word. The sentence it sits in is what gets translated — not the whole text at once." Footer
  above a hairline: "4 words saved from this text · 11 lookups" + "Study these 4 →".
- **Lookup panel (292px):** the selected-word card (3px accent left border) — lemma "franchir"
  with a ✕, caption "appears here as 'franchi'", the gloss, part of speech, then a dashed rule
  and the containing sentence with its translation, then "♪" + primary "Add to deck". Below:
  "Saved from this text" list (term + gloss caption). A dashed note: lookup failures say so here
  ("no gloss found — add it by hand") rather than leaving the word unclickable.

### 2f — Progress: maturity band across the top, drawers and forecast below
**Purpose:** One screen for the whole deck's state. Replaces the `progress` screen.

**Layout (940px):** Header "Progress" + caption "French · all levels · 698 words", spacer,
French / German segmented control.
- **Maturity card (full width):** kicker "Deck maturity", an 11px stacked bar (four segments
  from the neutral ramp plus one accent step), then a `repeat(4, 1fr)` row of counts —
  550 Not started / 63 Learning / 51 Young / 34 Mature — and the existing explanatory line
  "'Mature' means the interval has stretched past three weeks — the word is sticking."
- Below, `1fr 300px`:
  - **Mastery by drawer (left):** per level, a header row (level + "98/140") then drawer rows on
    a `40% 1fr 34px` grid — drawer name caption, 5px bar, right-aligned percentage — with
    "…11 more A1 drawers" truncation. **Levels below the current one collapse until opened**
    (caption: "B1 · B2 · C1 collapsed until opened — 5 levels at once is the reason this screen
    scrolls forever today"). A hairline-separated "My Words" block (29/34, "your own vocabulary")
    closes the card.
  - **Right rail (300px):** "Habit" (7 day streak / 23 answered today / 86% first try, 30d);
    "Coming due" — a seven-bar forecast, "today 12" / "next 7 days"; "Beyond vocabulary" —
    Verbs & tenses 18 of 128 cells, Idioms 9 of 24 paired, Passages 2 of 4 read, Dictation
    31 lines; a dashed note that export/reset progress lives at the bottom of this rail, not on
    the home screen.

## Interactions & Behavior
Wireframe-level, to be implemented with the app's existing handlers:
- **1a rail** — persistent across all modes; the active item is tinted; counts (My Words, due)
  come from existing progress state.
- **Level strip / dropdowns / popover (1a / 1b / 1c)** — changing level re-renders the drawer
  list only; it must not reset an in-progress batch.
- **1d stage rail** — read-only progress indicator; completed stages marked done, current one
  tinted. "Leave" exits mid-batch (today there is no bail-out) and should keep per-word
  progress already earned.
- **1d ledger** — each word is clickable and re-opens its card; states update live
  (seen → matched → chosen → typed ✓, misses counted).
- **Keyboard** — enter = check/continue, 1–3 = pick an option, s = skip to typing,
  esc = leave, tab = toggle ledger (1e).
- **1g add panel** — paste → "Read this list" parses and stages rows, dedupes against the
  deck (duplicates listed unchecked with a reason) → "Check N words" runs the fact check →
  1h review.
- **1h review** — per-row Take it / Keep mine / Skip plus bulk accept/keep; the save bar
  counts what will happen; nothing is written until save; failed checks save as "unchecked".
- **1i workbench** — selecting a verb or tense swaps the table without navigation; one cell is
  blanked at a time; "Reveal row" reveals without scoring; "Check" scores and advances.
- **1j matrix** — click cells, rows or columns to build a selection; "Drill N selected" starts
  the existing drill flow with that set.
- **2a reading** — the passage never re-renders as questions advance; "Show English" toggles
  translations in place per sentence; the four-question list on the right is a state readout, and
  "Add 3 to My Words" hands the unknown words to the My Words flow (1g/1h).
- **2b phrase match** — one selection per column; a wrong pair flashes and both stay selectable;
  a right pair greys out in both columns and appends to the ledger with the literal revealed.
- **2c listening** — space replays, shift+space slows; the mode toggle swaps input affordance
  without leaving the frame; feedback renders under the card rather than on a done screen; when
  no browser voice exists the mode is shown as unavailable with the reason.
- **2d sentence** — chips move between bank and answer strip; "Type it instead" swaps the strip
  for a text input accepting the same answer (accents required); "Reveal" scores as a miss;
  after Check the same card shows the set sentence, translation, audio and Continue.
- **2e import** — clicking a word looks up only that word and translates only its sentence;
  paste is an inline panel in the reader frame, not a route; failed lookups render a stated
  failure in the panel.
- **2f progress** — level sections collapse/expand; only the current level is open on load; the
  due forecast reads from the same scheduling data as the home due count.
- Responsive behaviour is out of scope: this pass is desktop-only (the current app is a
  single `max-w-xl` column).

## State Management
Existing state in `src/VocabDrawer.jsx` covers most of this; the restructure mainly changes
what is on screen at once, not what is tracked. New or changed state:
- `activeSection` for the rail (study / myWords / grammar / reading / phrases / listening /
  import / progress) — replaces several of the current `screen` values.
- `levelPanelOpen` (1c) for the level popover.
- `ledgerOpen` (1e) for the tab-toggled batch ledger.
- Batch progress must be readable **per word** (state + miss count) to render 1d's ledger and
  1f's per-word table, including next-due dates.
- 1h needs a staged-review model: per row { term, yours, proposed, verdict, decision } where
  decision ∈ take / keep / skip, plus a "could not check" flag; committed only on save.
- 1i/1j need per (verb, tense) scheduling state to render due marks and matrix shading.
- 2a: `showEnglish` per passage, plus per-question state (unanswered / answering / correct /
  skipped) so the right-hand list can be a readout.
- 2b: selection state per column, a wrong-pair flash flag, and a solved list carrying
  phrase + meaning + literal.
- 2c: `mode` (dictation / speaking), `playCount`, `rate`, per-line attempt counts, and an
  `audioAvailable` flag driving the unavailable state.
- 2d: answer-strip chip order, bank contents (target + two distractors + one near-miss), and an
  `inputMode` (chips / typing).
- 2e: `texts` library (title, language, last read, saved count), `selectedToken`,
  per-sentence translation cache, and a per-word lookup-failed flag.
- 2f: `openLevels` set for the collapsible level sections; a 7-day due histogram derived from
  existing card intervals.

## Design Tokens
**Reference only — the board's own style, not the app's.** The wireframe is drawn in the
Classical design system (`_ds/classical-*/styles.css` in the design project); apply the
app's existing Tailwind theme instead unless the team is adopting Classical.

- Ground / canvas: `#f3f2f2` page on `#eae9e9`; panels `#f8f4f4`
- Ink: `#201f1d`; captions `#605d5d`; muted greys `#d7d3d3`, `#bab6b6`, `#9b9797`, `#7d7979`
- Accent (gold, used as stroke only): `#b68235`; tint `#fff3e4`; deep text step `#7d5411`
- Hairlines: 1px, `color-mix(in srgb, #201f1d 16%, transparent)`; dashed placeholders
  1px dashed `#bab6b6`
- Type: Cormorant Garamond 600 headings (17–34px) / Lora 400 body (12px) and captions
  (11.5px, line-height 1.5); tabular figures on ids and numeric columns
- Radius: 2 / 4 / 7px · Spacing: 4.6 / 9.2 / 13.8 / 18.4 / 27.6 / 36.8px
- Elevation: `0 1px 2px rgba(45,43,43,.14)` — the only shadow used
- Buttons are outlined, never filled; the primary is a 1px accent outline with accent-700 text

## Assets
None. No images, no icons — the board uses text marks (♪, ✓, ×, ☑, ☐, 🗑) as icon
placeholders. In implementation use the **lucide-react** icons already imported in
`src/VocabDrawer.jsx` (Volume2 for ♪, Check, X, Trash2, and so on), and the existing
`public/icons.svg` where relevant.

## Files
- `screenshots/` — one PNG per option at 2x, named by id:
  `1a-home-left-rail`, `1b-home-catalog-table`, `1c-home-continue-hero`,
  `1d-study-stage-rail-ledger`, `1e-study-focus-mode`, `1f-study-per-word-summary`,
  `1g-mywords-workspace`, `1h-mywords-diff-review`, `1i-grammar-verb-workbench`,
  `1j-grammar-coverage-matrix`, `2a-reading-corner`, `2b-phrase-match`,
  `2c-listening-speaking`, `2d-sentence-stage`, `2e-import-reader`, `2f-progress`.
- `Vocab Drawer Wireframes.dc.html` — the wireframe board: turn 2 (2a–2f, the six previously
  undesigned screens) at the top, turn 1 (1a–1j, the restructure alternatives) below. Open it
  in a browser; each option carries its id as a badge, and annotation notes in accent explain
  the intent behind each restructure.

Source app referenced throughout (not included in this bundle): the `vocab-drawer` Vite
project — `src/VocabDrawer.jsx` (~5.3k lines, all screens), `src/data/vocab.js`,
`src/data/content.js`, `src/data/conjugation.js`, `README.md`.

## Suggested order of work
1. Pick one option per area (home, study, My Words, grammar).
2. Build the 1a-style shell first if home lands on 1a — every other screen then moves into it.
3. Study pipeline second: it needs the per-word batch state that 1f also depends on.
4. My Words and Grammar are independent of each other and can follow in either order.
5. 2a–2f can be picked up at any point — they are gap-filling, not alternatives — but each one
   assumes it sits inside whichever shell home lands on. 2d is the exception: it belongs to the
   study pipeline and should ship with step 3.
