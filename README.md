# Vocab Drawer

A spaced-repetition French & German vocabulary trainer. Ported from a
single-file Claude artifact to a local Vite + React app.

## Setup

```bash
cp .env.example .env      # then add your Anthropic API key
./dev.sh
```

Open http://localhost:5174.

`dev.sh` exists because `node` on PATH is v10 (2019, EOL) while Vite needs 18+.
It pins the nvm-installed Node 20 and starts both servers. `npm run dev` works
too if you already have Node 20 active.

**The API key is optional.** Everything except Text Import and the My Words
fact-check works without one; those endpoints return a clear 503 instead, and
imported words simply save as unchecked. The key lives only in `.env`
(gitignored) and is read only by `server/index.js` — it is never sent to the
browser.

## Layout

| Path | What |
|---|---|
| `src/VocabDrawer.jsx` | The app — learn, match, choose, practice, conjugation, dictation, speaking, reading, progress, summary, plus the My Words hub / input / review screens |
| `src/data/vocab.js` | 698 hand-curated words: FR/DE × A1–B2, in themed drawers |
| `src/data/vocab-fr-c1.js` | French C1 — 1,038 words in 98 drawers: the academic core (`FR_C1`) plus the thematic, register and false-friend sets (`FR_C1_STAGED`). Both are wired into `DATA` |
| `src/data/vocab-de-c1.js` | German C1 — 1,207 words in 118 drawers, same two-part structure (`DE_C1` + `DE_C1_STAGED`) |
| `src/data/content.js` | Reading passages, idioms, conjugation engine, grammar notes |
| `src/lib/wordlist.js` | Parses pasted/uploaded word lists. Pure functions, no React — run it under node |
| `src/lib/gloss.js` | Reading an English gloss — sense splitting, accepted answers |
| `src/lib/dictionary.js` | Offline word lookup behind the hover definitions |
| `src/lib/sentences.js` | The sentence-construction engine. Pure, no React |
| `src/lib/sections.js` | Which rail section a screen belongs to |
| `src/hooks/useIsDesktop.js` | The ≥1024px branch |
| `src/theme.js` | Colour tokens, each resolving through a CSS variable |
| `src/components/` | The desktop surfaces (rail, shell, ledger, tables, workbench) plus the shared mobile shell |
| `src/lib/storage.js` | IndexedDB persistence |
| `src/lib/api.js` | Client adapter — talks to the proxy, never to Anthropic directly |
| `server/index.js` | API proxy. Holds the key; pins output shape via structured outputs |

## Two layouts

Below 1024px the app is what it always was: one `max-w-xl` column, one screen at
a time. At and above 1024px it becomes a desktop application — a persistent left
rail beside a main column — following the wireframes in
`design_handoff_vocab_drawer_desktop/`.

The split is a hard branch, not a set of `lg:` classes, because several of the
desktop screens are not reflows of a mobile one. Three My Words screens collapse
into a single workspace; seven conjugation screens collapse into one workbench.
No amount of CSS expresses "these three screens are now that one".

```jsx
{!isDesktop && ( /* the original screen, untouched */ )}
{isDesktop  && ( /* the desktop surface */ )}
```

`useIsDesktop()` (`src/hooks/useIsDesktop.js`) is a live `matchMedia` query, so
dragging a window across the boundary swaps layouts.

| Area | Desktop | What changed |
|---|---|---|
| Home | left rail + demoted level strip | The level panel was eating the screen; language moved to the rail, mode to a toggle, the description to one line |
| Study | stage rail + batch ledger | Every word's state is visible while it is being earned, instead of a reveal at the end |
| Summary | per-word table | Word, meaning, first try, and its real next-due date — "mastered" as a date, not a percentage |
| My Words | one workspace | Library table and the add-words panel side by side; hub → input → library was three screens for one job |
| Grammar | workbench + coverage map | A verb and a tense are a selection, not a six-screen wizard. One table cell is blanked in place |

**What the desktop does not redesign**: reading, phrase match, listening,
dictation, sentence construction, import and progress render their existing
single-column content inside the rail's main column. They were not part of the
handoff.

The study *content* is shared, not duplicated — the flashcard, matching grid,
multiple-choice and typing box are the same JSX in both layouts. Only the chrome
around them branches.

### The Classical theme

Desktop carries the handoff's own type and palette (Cormorant Garamond over
Lora, a cool grey ground); mobile keeps the warm card-catalog look. That is
possible because every colour token resolves through a CSS variable rather than
a literal — see the token block in `src/index.css`. `C.ink` means
`var(--vd-ink)`, and `.vd-classical` on the desktop shell redefines it, so a
screen re-themes without knowing which shell it is in.

The trade-off: inline styles now say `var(--vd-ink)` instead of `#1F2A44`, so
DOM-text comparison can no longer verify mobile is unchanged. Regression checks
compare computed styles instead — `scripts/mobile-regression.md`.

## Themes

Light, dark, or the device's own setting, remembered per device. "System" is a
real third state rather than a synonym for light — a phone that flips at sunset
should take the app with it.

Both palettes have a dark form: the warm card-catalog below 1024px and Classical
above it. They are re-stated rather than inverted, because a flipped palette
reads as a photographic negative and the gold that carries meaning here would
stop looking like gold. der/die/das brighten so they stay legible on a dark
ground; the colour-word swatches deliberately do not move, since a red swatch
has to stay red.

## Weak spots

The daily queue is ordered by due date, which says when a card is scheduled,
not how well you know it. **Weak spots** orders by evidence of difficulty and
ignores the schedule entirely — lapses weighted above ease, because a lapse
counts a real failure while ease also drifts down from merely-hard answers.

Cards you have never studied are excluded: "weak" has to mean tried and missed,
or it becomes a second new-word queue. The button appears whether or not
anything is due, which is the point — it reaches words the schedule has not
surfaced yet.

## Levels

Both languages run A1–C1, but only vocabulary does: reading passages, idioms and
dictation stop at B2. Two exports keep that straight — `levelsFor(lang)` drives
anything that indexes `DATA[lang][level]`, and `CORE_LEVELS` drives the pickers
whose content ends at B2. `levelsFor` also means a language can gain or lose a
level without touching the UI.

**The two C1 levels are deliberately different**, because the languages are.
French's difficulty at C1 is a shared academic lexicon used more abstractly, so
`FR_C1` leads with nouns of inquiry, verbs of argument, and collocations.
German builds abstract vocabulary from prefixes instead of borrowing it, so
`DE_C1` leads with **Präfixverben** — a drawer per prefix — then the
**Funktionsverbgefüge** (*in Betracht ziehen*, *Rechnung tragen*), then
**Rektion**. Each follows the study order its own source document argues for.

Five optional word fields serve these levels:

| Field | Language | What it does |
|---|---|---|
| `art` | fr | The article marking gender. French has no der/die/das tag to reuse, so it renders through its own coloured element. Typing accepts the term with or without it. |
| `rek` | de | The preposition and case a verb governs, rendered **on the front** of the card — at B2+ the item is *eingehen auf + Akk.*, not *eingehen*. |
| `alt` | both | An equally common variant, shown but not drilled separately. |
| `n` | both | The source's usage note — false-friend warnings, collocations, plural forms. |
| `gen` | fr | `"m"` or `"f"`. C1 carries it from its source; A1–B2 was backfilled by `scripts/backfill-fr-gender.mjs`, which recovers gender from each word's own example sentence — *Le chat dort…* fixes `chat` as masculine. 124 nouns, hand-checked; the script is idempotent. Sentence Constructions needs it to choose an article. |

German C1 nouns use the existing `g` field, so they get gender colouring and the
gender-drilling multiple-choice mode without any new code.

One thing each source asked for is *absent* on purpose: the German document
calls Modalpartikeln (*doch*, *ja*, *wohl*) "listening work, not flashcard
work", so they are parsed but excluded. Word-formation tables are reference
material and excluded too.

Every C1 entry now carries an example sentence, its cloze and an English
rendering, so C1 drills the same three question kinds as every other level.
Each sentence is written at C1 register — journalistic or academic — and uses
the headword in the exact surface form the deck teaches, because
fill-in-the-blank blanks by literal match: a sentence using an inflected form
would produce a blank its own answer could not fill.

## My Words

Your own vocabulary, alongside the built-in levels. Add words by pasting a list,
uploading a file, or typing one at a time; CSV, TSV, plain lists, Anki `.txt`
exports, JSON and frequency lists (`word 12345`) are detected automatically, with
a manual override when detection guesses wrong.

Everything imported is **fact-checked before it joins the deck**: Sonnet 5
second-opinions each translation and German gender, flags each word ok /
needs-a-fix / sense-dependent, and writes an example sentence. The review screen
shows your version next to the proposed one — **nothing is applied until you
save**, and declining a fix keeps yours. Words that can't be checked (no key, or
the service is down) still save, marked unchecked, and can be checked later from
the library.

Personal words are the same deck as everything else: they appear in the daily due
count, the maturity chart, and Mastery by drawer, and they run the full five-stage
pipeline — learn → match → choose → type → summary — in batches, exactly like a
built-in drawer.

Two parsing rules worth knowing, both chosen so a **term is never corrupted**:
a list detected as plain takes the whole line as the term (so `s'il te plaît`
survives), and a frequency list discards the count rather than reading it as a
translation. Format is detected once for the whole file, never per line.

Good sources for non-basic vocabulary: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
(slice ranks 2000–6000), [Lexique.org](http://www.lexique.org/?page_id=790&lang=en)
for French, the [Goethe B1 Wortliste](https://www.goethe.de/de/spr/prf/ueb/pb1.html)
for German, and DW's *Top-Thema mit Vokabeln*, whose articles ship their own
vocabulary lists.

## Word images

Words are illustrated where a picture actually teaches something. Images key on
a word's **meaning**, not its headword — the A1 drawers are parallel across
languages, so `chat` and `Katze` resolve to the same cat, and any later level
inherits an image free wherever its English gloss matches.

`imageFor()` in `src/data/word-images.js` resolves in priority order and returns
one of four shapes, because "picture of a word" isn't one thing:

| Kind | Source | Used for |
|---|---|---|
| `drawn` | `public/img/words/*.svg` | 24 original illustrations — animals, food, home objects |
| `emoji` | `public/img/emoji/*.svg` | ~148 Twemoji glyphs for everything else picturable |
| `swatch` | inline colour | colour words, where the answer *is* a colour |
| `numeral` | inline text | numbers one–ten |

Coverage is deliberately partial: **A1 95%, A2 84%, B1 and above ~0%.** Abstract
vocabulary (*to substantiate*, *rendre compte de*) has no honest illustration, so
it gets none — every caller must handle a `null`, and the layouts close up rather
than reserving an empty slot. Function words are excluded on purpose: an icon for
*still* teaches nothing and adds noise.

Two generators, both re-runnable:

```bash
node scripts/build-word-art.mjs   # writes the 24 original SVGs
node scripts/sync-emoji.mjs       # copies referenced Twemoji into public/
```

`sync-emoji` copies only the glyphs `EMOJI` actually references (148 of the
3,720 in `@twemoji/svg`) and deletes ones no longer used, so the folder tracks
the map. It exits non-zero if a codepoint doesn't exist. Twemoji is CC-BY 4.0 —
attribution ships in `public/img/emoji/LICENSE`.

The **image-choice exercise** ("Select the correct image") replaces the text list
in the Choose step when the prompt is the target word and all four options are
picturable — all-or-nothing, since one text tile among three drawings gives the
answer away, and distinct glyphs only, since two options resolving to the same
picture is unanswerable. It needs four tiles for the 2×2 grid, so picture
questions request four options where the text list stays at the usual three.

## Sentence Constructions

Its own section, not a stage of a drawer. You pick a tense and the verbs —
randomize, isolate one, or select several, the same three modes the conjugation
trainer uses — then build each sentence by tapping its words into order.

Sentences are **assembled, not generated**. `src/lib/sentences.js` composes them
from the conjugation tables and a noun from a vocabulary drawer, so a sentence
is always grammatical and always in the tense that was asked for. That matters
more here than anywhere else in the app: with tiles, the word order *is* the
answer key, and a subtly wrong sentence would teach the mistake rather than
catch it. Nothing is fetched and no key is needed.

Two patterns, because the second teaches something the first cannot:

| | French | German |
|---|---|---|
| plain | Je mange le pain. | Ich esse das Brot. |
| fronted | Aujourd'hui, je mange le pain. | **Heute esse ich das Brot.** |

Filling the German front field forces the subject after the finite verb. That
inversion is the habit English speakers lose most often, and tiles teach it
well — getting it wrong leaves a tile stranded.

**Grammar the engine gets right, because tiles make errors visible:**

- German objects take the accusative (`der` → `den`), and weak masculines take
  their ending with it — `den Kollegen`, not `den Kollege`.
- The non-finite part goes to the end of the clause: `Ich habe das Brot
  **gegessen**`, `Ich werde das Brot **essen**`.
- French elision fuses two words into one, so `l'oiseau` and `j'ai` are single
  tiles. A plain article stays separate, so choosing `le` over `la` is part of
  the exercise.
- **Alternate orders are accepted.** German takes the object in the front field
  as readily as the time phrase, so *Den Garten haben wir heute gesehen* is
  marked right alongside *Heute haben wir den Garten gesehen*. Rejecting a
  learner's grammatical sentence would teach them to guess our output rather
  than the language.
- Tiles carry no sentence-initial capital; it is applied to whichever tile ends
  up first, so reordering never strands one.

**Three things constrain the sentences deliberately.** A verb is only offered if
it names the drawers its object may come from — grammar alone would happily
build *"Ihr habt den Regen gegessen"*, flawless German that no one should
learn. People and places are excluded unless the verb accepts them — you can
see a station, but *"They have the airport"* is the kind of sentence that makes
a learner distrust the exercise. And a time phrase names the tenses it fits,
because *"Tomorrow he saw the bathroom"* is a grammatical sentence and a wrong
one. A few verbs name
their objects outright rather than taking a whole drawer: `faire` glosses as
"to do", so the prompt for *faire le café* would read "do the coffee", and a
prompt the learner cannot translate back is worse than one verb fewer.

The refresher list shown before each round is exactly the nouns that round will
use, illustrated with the word images. Deriving it from everything the chosen
verbs *could* take listed 57 words for a round of 8.

**Scope:** 7 verbs per language against the A1/A2 concrete drawers, which is
where "an animal, a food, an object" lives. The C1 verb tables and the abstract
B1/B2 drawers are not wired in.

## Hover definitions

Any word in a checked sentence explains itself — hover on a pointer, tap on a
phone, where hover does not exist. Only one bubble shows at a time. A word with
no entry stays plain rather than offering an empty tooltip.

The two sentence screens get their definitions from different places, because
they know different amounts:

**Sentence Constructions** needs no lookup. The engine assembled the sentence,
so it knows what every tile is and says so exactly — `buildSentence` returns a
`glosses` array parallel to `tokens`, and tiles pick theirs up by index at
creation so it survives shuffling:

| Tile | Definition |
|---|---|
| `haben` | from haben — the auxiliary that forms the perfect |
| `den` | "the" — masculine accusative, because it is the object |
| `Hasen` | der Hase — rabbit (weak noun: takes -n outside the nominative) |
| `l'eau` | la + eau — the water; the article elides before a vowel |
| `j'ai` | je + ai — "I" and the auxiliary avoir run together |

That is the answer to *why was this the wrong tile*, which a bare translation
would not give.

**The typed sentence stage** shows arbitrary sentence text, so it looks words
up in `src/lib/dictionary.js`, built from three sources:

| Source | Covers |
|---|---|
| The deck | every headword, its sentence surface form (`ba`), and variants |
| Conjugated forms | generated from the verb tables — `est` and `ist` are the two most common words in the whole corpus |
| A closed-class table | articles, pronouns, prepositions, negation — hand-written, since no generator produces them |

Deck and conjugation alone resolve 41%; the function-word table takes it to
**75%**. The rest are inflected content words with no entry, and they render
plain. `check-answers.mjs` asserts a 70% floor so the dictionary cannot quietly
rot.

Two collisions had to be designed around, both caught by reading the output:
flattening accents merges `schon` (already) with `schön` (beautiful), and
stripping the œ ligature turned `sœur` into the preposition `sur` — which then
answered "on" with "sister". Lookup now tries an accent-preserving key first
and falls back to the flattened one.

## Keyboard

A round is dozens of small decisions, and the trip to the mouse between each one
is most of the elapsed time. On a device with a pointer and keys:

| Key | Where | What |
|---|---|---|
| `1`–`9` | multiple choice, picture grid, conjugation choice | Pick that option |
| `1`–`9` | Sentence Constructions | Place that word from the bank |
| `Backspace` | Sentence Constructions | Take back the last word placed |
| `Enter` | typing, sentence, conjugation, dictation | Check your answer, then carry on to the next question |
| `Enter` | anywhere else with a result showing | Check, or go to the next question |

Numbers are shown on the options themselves rather than left to be discovered,
and only where the keys exist — `matchMedia("(hover: hover) and (pointer:
fine)")` gates them, so a phone gets none of the clutter.

While a text input holds focus the global handler stays out of the way: those
screens bind Enter on the input themselves, and inside an input a digit is just
a digit. But they set the input `disabled` the moment an answer is checked, so
focus drops to `<body>` exactly when Enter is most wanted — which is why the
Continue button used to need the mouse even though Enter had "worked" a moment
earlier. The handler picks it up from there, so one key carries a typed answer
all the way through to the next question.

Only the advance is handled that way. Checking still belongs to the input, so a
stray Enter can never submit an empty box.

The bank renumbers as it empties, so the shortcut for a word is always its
current position, not the one it started in.

## Checks

```bash
node scripts/check-answers.mjs
```

Covers the pure layers — gloss matching over all 1,616 words and 2,409 senses,
12,936 English verb renderings, the dictionary's coverage floor and its two
known collisions, and every legal sentence combination (~29,300). No React, so
it runs under plain node. There is still no test suite for the components.

## Two things the port had to fix

The artifact version depended on APIs the Claude sandbox injected, neither of
which exists outside it.

**1. `callClaude` had no authentication.** It POSTed to `api.anthropic.com`
with only a `Content-Type` header — no `x-api-key`, no `anthropic-version`.
The host was injecting both. Outside the sandbox that is a 401, and a browser
would CORS-block it first. Calls now go to `server/index.js`, which holds the
key server-side.

**2. `window.storage` failed silently.** `storageAvailable()` checked for
`window.storage.get`; when absent the app fell back to an in-memory object with
no error — so every SM-2 review history vanished on reload. Replaced with
IndexedDB (localStorage's ~5MB cap won't survive generate-on-demand
vocabulary). A genuine storage failure now reports `persisted: false` rather
than pretending to work.

## Moods and tenses

Seven per language. French adds the **conditionnel**, the **subjonctif** and
the **impératif**; German the **Konjunktiv II** and the **Imperativ** — the
moods a learner meets constantly and could not previously drill at all.

Most of it is derived rather than stored, because the shapes are regular:

| | How it is built |
|---|---|
| Conditionnel | the future stem with imperfect endings — nothing new to store |
| Subjonctif | the `ils` stem: parlent → parl-, finissent → finiss-. About a dozen verbs whose subjunctive is genuinely irregular carry `subj` instead |
| Konjunktiv II | the Präteritum, umlauted for strong verbs (kam → käme). Weak verbs do not change at all, which is exactly why German reaches for *würde* |

The one class that defeats the rule is the mixed verbs — a weak `-te` past with
a changed stem (bringen → brächte, haben → hätte). They are named in
`DE_MIXED_K2`, keyed by stem so prefixed forms inherit.

### The imperative, and why it needed more than a table

Every other tense has six persons. French commands only *tu*, *nous* and
*vous*; German adds *Sie* but has no first-person singular and no third person
at all — you cannot order someone to "he speaks". That flat 0–5 was assumed by
the pronoun tiles, the matching board, the multiple-choice distractors, the
coverage map and the reveal table, so the fact now lives on the tense and
everything asks:

```js
personsFor("fr", "imperatif")   // [1, 3, 4]
personsFor("de", "imperativ")   // [1, 3, 4, 5]
hasTense("de", können, "imperativ")   // false — "kann!" is not a thing to say
```

`conjugate` still returns six slots, so `forms[personIdx]` keeps working
everywhere; the persons a mood does not have hold `null`, which reads as absent
rather than as an empty string that might be a bug. The coverage map draws
those cells hatched — "no such form" and "never drilled" are different facts,
and the map is worthless if they look the same.

The forms themselves:

| | How it is built |
|---|---|
| French tu | the present *tu* form, minus the -s for -er verbs and *aller* — "parle", not "parles". *finis* and *vends* keep theirs |
| French nous / vous | the present forms unchanged |
| German du | the present *du* form with its ending off, keeping an e→i change but undoing the a→ä umlaut: **sprich** but **fahr** |
| German wir / Sie | the infinitive plus the pronoun — "gehen wir", "gehen Sie", which is also why they read as suggestions |

Three things the rules could not reach, all caught by tests rather than
assumed: être/avoir/savoir/vouloir take the subjunctive stem (*sois*, *aie*,
*sache*, *veuillez*); *hast* and *wirst* are not usable stems, so **hab** and
**werde** come off the infinitive instead; and French puts the reflexive
pronoun *after* an affirmative command and stresses it — **lève-toi**, the one
place in the language where it does not precede.

The English is a command too. Rendering it through the pronoun table would give
"you are" for *sois* — a statement, not the order the form actually is.

### Choosing what a drill covers

"Drill être" used to mean *every tense the verb has* — so a learner who had
only ever opened the present was asked for the subjunctive, in a queue that was
harder than anything they had studied and gave no way to say so. The scope is
now a choice, shown next to the button:

| Scope | Covers |
|---|---|
| **This tense** (default) | only the tense open in the table |
| **Started** | tenses this verb already has a card in — i.e. ones you have answered at least once |
| **All** | every tense the verb has |

`started` is deliberately not *due*: you want to be able to drill something you
have met and are not currently being asked for. A scope that empties — you
switch to a verb you have never drilled while "Started" is selected — falls
back to "This tense" rather than leaving a dead button, and the button always
names what it will do ("Drill aller · 1 tense").

The tense strip carries the same fact as a dot, so "which tenses do I actually
know for this verb" is answerable without clicking through all seven. Tenses
the verb does not have — a German modal has no imperative — are disabled there
rather than silently missing.

The logic lives in `drillScopeTenses`/`effectiveScope` in `src/lib/study.js`
rather than in the component, so it is unit-tested; this was a logic bug, and
the component is not where a logic bug should be fixed once.

## Models

Set per job in `server/index.js`:

| Job | Model | Why |
|---|---|---|
| `gloss`, `translate` | `claude-haiku-4-5` | Schema-constrained extraction, run in bulk. Accurate here and far cheaper. |
| `verify` | `claude-sonnet-5` | Second-opinions your own words. Deliberately *not* the glossing model — asking a model to check its own output gets you agreement, not verification. Also writes the example sentence, which is prose work. |
| `prose` | `claude-sonnet-5` | Reserved for generated passages and grammar notes, where writing quality is the point. |

Word lookup uses **structured outputs**, so German gender is pinned to a
`der`/`die`/`das`/`null` enum and cannot come back malformed. The previous
parser sliced JSON out of a prose reply between the first `[` and last `]`, and
returned `[]` on any failure — silently.

## Answer matching

A gloss packs several senses into one string — `field, domain`, `to note,
observe (as fact)`, `approach, methodology; step taken`. **Any single sense is
a correct answer.** `src/lib/gloss.js` splits on `,` `;` and `/` at the top
level only, so a comma inside brackets stays with its clarifier: *to raise (a
level, a question)* is one sense, not two. The clarifier itself is optional,
and so is the infinitive "to" in both directions — a list like *to note,
observe* distributes its "to" across both verbs.

This was previously a split on `/` alone. Since 942 of the 2,916 built-in
glosses contain a comma and all of them are in the two C1 files, **534 words
could not be answered at all** unless you reproduced the punctuation exactly.

A few C1 glosses carry their false-friend warning inline — `lecture` is
`reading, interpretation / reading, NOT "lecture"`. That clause says what the
word does *not* mean, so it is dropped rather than accepted. It would be better
in the `n` field; the data has not been rewritten.

## What's next

`NEXT-PHASE.md` holds the plan for the next round of work: four correctness
fixes that should come before any new feature (a white-screen crash, a missing
error boundary, a key collision in the missed-words list, and mobile's Home
button discarding a sitting), then the restructure's loose ends, content gaps,
and structural debt.

## Data upkeep

Three re-runnable scripts, all idempotent and all printing before they write:

```bash
node scripts/backfill-fr-gender.mjs          # French noun gender, from example sentences
node scripts/fix-false-friend-glosses.mjs    # move "NOT \"lecture\"" out of the meaning
node scripts/generate-c1-sentences.mjs --lang fr   # example sentences for C1 (needs a key)
```

All 2,245 C1 words now have sentences, so `generate-c1-sentences.mjs` has
nothing left to do; it stays for words added later, and still needs
`ANTHROPIC_API_KEY` plus the API server.

The sentences already in the deck were written by hand and applied through
`apply-sentences.mjs`, which derives the cloze rather than taking one, and
rejects a row rather than storing something the app cannot use:

- **the sentence must contain the headword** in the deck's own surface form —
  the check that matters, since a cloze that cannot find its answer is worse
  than no sentence at all;
- **at a word boundary** — `makeCloze` blanks the first literal match, and
  "or" inside "encore" would blank three letters of the wrong word;
- **case-insensitively at the front**, so a connector that naturally opens a
  sentence ("En somme") still matches the lowercase headword the deck teaches.

Those three rules caught every bad row in practice: French verbs whose "de"
contracts to "des", German separable verbs where "zu" goes *inside* the word,
plurals and participles standing in for a lemma. `--replace` overwrites an
existing sentence, for correcting one that passed the mechanical checks but
turned out to be poor language.

## Desktop screens

Every area now has a ≥1024px design. The first ten (home, study pipeline,
summary, My Words, grammar) came from the original handoff; the six below were
the ones it never covered, and each replaces two to four mobile screens with a
single frame:

| Screen | Replaces | What the width buys |
|---|---|---|
| `ReadingCorner` | readingSelect → readingQuiz → readingDone | The passage stays on screen while you answer, with the asked-about words underlined; the question card advances alone |
| `PhraseMatch` | phraseSelect → phraseMatch → phraseDone | Facing columns instead of stacked ones, and the literal reading revealed on the pair rather than held for a results screen |
| `ListeningStage` | dictation, dictationDone, speaking, speakingDone | One frame with a mode toggle; the live per-line ledger replaces both "done" screens |
| `SentenceStage` | the bare cloze at the end of a batch | A word bank, so a wrong word order is visible as a grammar mistake rather than a vocabulary one, plus the word's own card beside it |
| `ImportReader` | importPaste → importReader → importLibrary | A library rail (the app held exactly one text before), and a lookup panel with a fixed home so clicking a word no longer pushes the text down |
| `ProgressBoard` | progress | Levels collapse, and the rail carries the two things the phone had no room for: a due forecast and the non-vocabulary tracks |

Mobile keeps its own screens throughout — the split is a hard `isDesktop` JSX
branch, not CSS, because these are content rewrites rather than reflows.

### How width is handed out

`src/lib/sections.js` owns the policy, because it is a fact about screens and
that is where the other screen sets already live:

- **`FULL_WIDTH_SCREENS`** — the areas with a desktop design. They lay
  themselves out (grids, side rails, facing columns) and are given the whole
  column.
- **`COLUMN_WIDTH` (720px)** — everything still on the phone's single column.
  Capped so it does not stretch, and **centred**, because a lone column pinned
  against the rail with 900px of nothing beside it reads as a bug rather than a
  deliberate measure.
- **`CONTENT_MAX` (1600px)** — the widest the main column ever gets. Past that
  the content centres instead of sprawling. Set generously: screens that would
  suffer from the width already carry their own measure (a reading passage
  stops at 56ch whatever the frame does), while the grids get more useful with
  more columns.

`DesktopShell`'s padding is `clamp(16px, 2.2vw, 40px) / clamp(18px, 2.6vw,
56px)` rather than a constant, and the drawer grid is
`repeat(auto-fill, minmax(224px, 1fr))` rather than three fixed columns — so it
is three across at 1024, four at 1440 and five at 1920 with no breakpoint for
each.

**The bug this replaced** is worth naming, because the shape of it will recur:
the home screen *has* a desktop design, but `HomeDesktop` renders inside the
shared `screens` block rather than as its own branch of the routing chain, so
the single-column fallback cap landed on it. At 1440px that left the content
720px wide against a 1228px column — a third of the window empty. A screen
having a desktop layout and a screen being *routed* as one are two different
things.

Two notes on what was *not* built. The 2f wireframe pairs "export progress"
with "reset progress"; export is implemented because it only reads, and reset
is not, because a one-click wipe of every card's schedule is not something to
add on the strength of a layout note. And the desktop reading, phrase and
listening areas open straight into their working frame rather than a picker,
which is why `navigateToSection` routes those three differently at width.

## Fluency

The strand the app was missing. Everything else asks *do you know this?*;
nothing asked *can you get it in under two seconds?* — and those are different
abilities. A word retrieved in six seconds is known; a word retrieved in one is
usable in speech, and only the second survives a conversation.

One minute, three options, tap. The design follows Nation's four conditions for
fluency work, and each one is a constraint the screen has to keep:

| Condition | How it lands |
|---|---|
| The material must be **easy** — no unknown language | The pool is cards that have already held for a week, leeches excluded. Even the wrong options are drawn from words you know. |
| Focus on **meaning**, not form | Three glosses, tap one. No spelling, no accents, nothing that measures typing speed instead of recall. |
| **Pressure** to go faster than usual | A 60-second countdown that turns red in the last ten. |
| **Quantity** of practice | The queue cycles rather than running out, so the clock is always what ends the round. |

**It does not touch the scheduler.** A miss under a clock is nearly always a
speed failure rather than a knowledge failure, and letting the timer damage a
mature card would punish the learner for doing the exercise properly. Fluency
rounds keep their own record and leave the SRS alone.

Answers are **1, 2 and 3** on a keyboard, with the same number badges the
choose and sentence screens use. That is not a convenience — the round measures
how fast a meaning comes back, and asking the learner to aim a mouse at one of
three moving targets measures their aim instead. Enter starts a round and takes
the rematch. On a touch device the badges and the hint are hidden, the same way
every other numbered screen handles it.

The score is correct answers per minute, kept per language and per direction,
with the last 30 rounds drawn as a bar chart — the whole claim of fluency work
is that speed moves, and nobody can feel that without seeing it. Three options
mean guessing scores about a third, so **a round under 80% accuracy is logged
but cannot set a record**; those bars are drawn grey.

### Where the gate sits, and why it moved

A word joins the pool after **two correct reviews and an interval of three days**
— normally the day after you first study it.

The bar started at the scheduler's own "young" line, seven days, and that was
wrong. Reaching interval 7 takes three correct reviews spread across four days,
so a new learner met a locked door for most of their first week — exactly when a
visible win matters most. Condition 1 asks for material that is *easy*, not
material that is *old*: a word retrieved correctly twice is easy, and what has to
stay out is material never successfully retrieved at all, plus leeches whatever
their interval.

Settled words (a week or more) are still better material, so the round says how
many of the pool are settled rather than hiding the mix behind one total.

Below eight words the section will not open — but it does not merely refuse. It
reports how many are ready, how many are **one correct review away**, when that
review is, and offers a button straight to a drawer. "Not yet" without a "when"
is a dead end.

## Listening

Dictation was pinned to `CORE_LEVELS` — A1 to B2 — alongside reading and idioms,
which was right when C1 had no example sentences. It has **1,038 in French and
1,207 in German** now, all hand-written with translations, and none of them were
reachable: finishing B2 meant the section simply stopped. `audioLevelsFor(lang)`
returns every level whose words carry a sentence *and* a translation, so C1 is in
and a future level joins automatically.

Answering used to leave you with a diff — the target sentence with the misses
underlined. That is feedback, not language: a line of wavy red is hard to read
back as a sentence, and on desktop the panel was scrolled below the fold. Both
now spell it out plainly under the diff — the sentence with its own **hear**
button, the translation, and the word the sentence was chosen for.

## Enter, everywhere

Enter had been wired screen by screen as each was built, which is the worst
possible pattern: the screens that take the keyboard teach you to expect it, and
then one doesn't. It now presses whatever the screen's primary button is —
learn, matching, speaking, reading, the sentence-construction word list, both
Word Roots drills, and every end-of-round screen.

## Hearing words, not just sentences

Audio lived only on the screens built around listening, which left the places
where a learner *meets* a word silent. Seeing `widersprechen` written and never
hearing it is how a word ends up known on paper and unusable aloud. `SpeakButton`
now appears on every word in a root's family, on the affix examples, on the
quiz options and answers, on the French and German cells of the sound-law tables,
and on the living words at the tips of the ancestry tree.

The tree needed something the app did not have: **speaking in a language other
than the one being studied**. It puts French, German and English side by side, so
"read this aloud" has to mean "in the language of that column" — reading *father*
with a French voice would be worse than silence. `sayIn(lang, text)` picks a
voice per language and returns nothing for Latin or the reconstructions, so those
rungs get no button at all rather than a mispronunciation.

## Sentence Constructions: what a verb may take

Each verb has a pool of objects it may build a sentence with, and the round of
eight picks from it at random. A thin pool is invisible as a bug and obvious as
an experience: `faire` allowed exactly **two** objects, so eight sentences were
all about *le travail* and *la tâche*, and the words screen that opens the round
listed two words.

| verb | objects before | after |
|---|---|---|
| `faire` | 2 | 11 |
| `machen` | 2 | 10 |
| `finir` | 4 | 13 |
| `geben` | 9 | 14 |
| `essen` | 8 | **5** |

`essen` went **down**, and that is the fix. Its rule was the whole Food & Drink
drawer — which contains drinks — so the engine was happily generating *"Ich esse
das Wasser"*. Drinks are now excluded from eating verbs, the same way people and
places were already excluded from owning verbs ("They have the airport" was
guarded against; "I eat the water" was not). Five is what remains, because five
edible nouns is what the decks hold.

A rule may now carry `topics` and `words` together, and an explicit word list is
searched at every level — a curated headword has already passed the judgement
the level gate exists to make.

### The object chooses the English verb

Expanding `faire` exposed a second problem. It is glossed "to do / make" and the
generator takes the first sense, so every new object produced *"We have done the
bed."* The French is one verb; the English is several, and the object is what
decides which. So a word entry may be `["lit", "to make"]`:

| | |
|---|---|
| nous avons fait le lit | We have **made** the bed. |
| nous avons fait la valise | We have **packed** the suitcase. |
| nous avons fait la réunion | We have **held** the meeting. |
| nous avons fait la réforme | We have **carried out** the reform. |

The first attempt at this rendered *"we have maked the bed"*: `EN_IRREGULAR` held
only four verbs, and anything missing gets a regular `-ed`. It now holds the
verbs the generator can actually reach for.

`cuisine` is deliberately **not** in `faire`'s list. *Faire la cuisine* is to do
the *cooking*, but the noun's own gloss is "kitchen", so the prompt would read
"we have done the kitchen". An idiom the object gloss cannot carry is better left
out than mistranslated.

`scripts/check-sentences.mjs` runs offline in `npm run check` and guards all of
it: no pool smaller than the round (bar `essen`, whose cap is declared with its
reason), no word list naming a headword that is in no deck — a typo there
silently removes an object and nothing errors — no eating verb able to take a
drink, and every generated English prompt free of invented past tenses.

## Word building

The sibling of the etymology section, answering the more immediately useful
question. Etymology says where a word came from — a fact about the past.
This says how it is assembled *now*, which is a fact you can spend: knowing
that `sprechen` is "speak" and `wider-` is "against" hands you
`widersprechen` without anyone teaching it.

It opens in English, because everyone already does this in the language they
think in and has stopped noticing:

```
  un  |  becom  |  ing        not fitting, not appropriate
prefix   root     suffix
```

Strip the parts and you get `become` — and then `forthcoming`, `income`,
`outcome` and `overcome` stop being separate words to memorise. The section
exists to say: now do that to French and German.

**28 roots, 248 words.** Every word is drawn as its parts, with the root the
only piece in full ink on a tinted ground. That ranking is the lesson — scanning
a family, the same shape recurs in the middle of nine different words:

| | |
|---|---|
| `ap·port·er` | to bring |
| `ex·port·er` | to export |
| `im·port·er` | to import; **to matter** |
| `sup·port·er` | to put up with — **not** "to support" |
| `trans·port·er` | to transport |

German is where this pays most: its verbs take about sixteen productive
prefixes, so one root reliably yields nine or ten words. French runs on Latin
prefixes instead — and those are the ones English borrowed too, so every French
family is also a free English one.

**47 affixes** are documented beneath each family, but only the ones that
family actually uses, so the rule is reachable from the word rather than the
other way round. Each gives its sense, its English parallel where an honest one
exists, and three worked examples.

The drill asks you to *produce*: "You know `porter` — to carry. Which word means
'to bring'?" Every option is built on the same root, so the prefix is the only
thing telling them apart, and answering reveals all four glosses — a wrong
answer still teaches the other three.

### Segmentation notation

Segmentations live in the data as `"<ver =sprech .en"` — `<` prefix, `=` root,
`>` suffix, `.` grammatical ending. An array of `{text, kind}` objects would
have buried 145 words in punctuation; the notation stays readable in source and
is parsed in one tested place.

`scripts/check-morphology.mjs` runs offline in `npm run check` and asserts that
**every segmentation actually spells its word** — get that wrong and the parts
still render happily while teaching a word that does not exist. All 248 pass.
Two things legitimately break the rule and have to declare it: roots whose vowel
moves (`nehm`/`nahm`, `komm`/`kunft`), and French joins that double a consonant
to protect its sound (`re` + `sentir` → *ressentir*, so the /s/ does not soften
to /z/ between vowels). The check caught both of those doublings when the
families were expanded.

`scripts/morph/verify.mjs` is the online half, run by hand: **355 of 355 words
verified** against Wiktionary. The form check is hard — the word exists in that
language or it does not. The gloss check is deliberately loose, requiring only
that one content word overlaps, because a gloss is a judgement and the mistake
worth catching is a gloss attached to the wrong headword, not legitimate
rewording. Everything it has flagged so far has been correct but worded differently from
the source; aligning those made several of them more complete.

It has also produced one false alarm worth recording. An earlier run reported
`übertragen`, `täglich` and `natürlich` as having no Wiktionary entry, which is
plainly wrong. The cause was mine: I had two harvesters hitting Wiktionary at
once and rate-limited myself, and a throttled response was cached as "no entry".
Re-run alone, all three pass. **Do not run two of these scripts concurrently.**

The offline checks have caught three real errors of my own: a collision where
`er-` the prefix and `-er` the suffix had both been given the id `de-er`; two
French joins that double a consonant (`re` + `sentir` → *ressentir*); and
`vorschlag` written lowercase, which a German noun never is. That last one now
has its own rule — any German word carrying a gender must be capitalised —
because it rendered perfectly and looked right until the online check
questioned it.

## Word Roots

An English speaker learning French and German already knows thousands of words
in both languages and cannot see it, because each ran the shared inheritance
through a different set of regular sound changes. This section teaches the
changes, which turns a vocabulary list into a generator: once "Latin p ↔
Germanic f" is in place, *père* / *Vater* / *father* stops being three words.

Two ways in, answering different questions.

**Ancestry** starts from a word you know. 20 roots have a descendant in *both*
decks, 16 of them with an English limb too, and each draws a tree that forks — as many times as it has to:

```
                    PIE *ph₂tḗr
              ┌───────────┴────────────┐
           FRENCH              GERMAN · ENGLISH
        Italic *patēr             P-Gmc *fadēr
        Latin  pater              W-Gmc *fader
        Old Fr. pedre          ┌────────┴────────┐
        Mid Fr. pere        GERMAN           ENGLISH
        French  père        OHG fater        OE fæder
                            MHG vater        English father
                            German Vater
```

The fork is the whole point, so the shared trunk is drawn once rather than
twice. Reconstructed forms are italic and keep their asterisk on every showing,
because a form nobody ever wrote down should not be presented as if someone had.

English earns its place by making the *nesting* matter. It is German's sibling
— the two part at West Germanic, long after both left Latin — so three equal
columns would flatten exactly the relationship worth seeing. The tree is
therefore built by merging chains rather than by a hard two-way split, and it
would take a fourth language without changing.

That also lets it tell two different stories with the same machinery. For
inherited vocabulary English groups with German. For a **borrowing** it does
not: Latin *problēma* draws **French · English** together — English took it via
Middle French — with German taking it straight from Latin. Nobody had to
special-case that; merging the real chains produces it.

**Sound laws** starts from the change. 13 rules in three groups — Grimm's Law,
the High German shift, and Latin into French — each stated so you can run it
forwards on a word you have never seen:

| | Rule |
|---|---|
| Grimm | Where French has p, English and German usually have f. |
| High German | English t becomes German z at the start of a word, ss or ß in the middle. |
| Gallo-Romance | An English word starting sp-, st- or sc- often has a French cousin starting ép-, ét- or éc-. |

The drill is transfer, not recall. It hides the whole column you are being
asked for and leaves the worked examples on screen, so the exercise is running
the rule on a new word rather than remembering which words were on the list.

### Two different claims, two different columns

A pairs table prints one meaning per row with the language columns under it,
which asserts that **every cell in the row means that thing**. For an inherited
set — *pater / père / Vater / father* — it does. But several rows originally
reached for an English word that merely *descends from* the Latin: **cauldron**
under a row headed "hot". Cauldron comes from *calidus*; it does not mean hot.
The layout was making a claim the content could not support.

Those words are still worth showing — for the `-ct- → -it-` rule especially,
where an English word like *nocturnal* is the evidence that the `ct` survived
into English unchanged. So they were not deleted; they were moved into their own
column, **same root, different meaning**, and each carries its own gloss:

| meaning | Latin | French | German | English | same root, different meaning |
|---|---|---|---|---|---|
| hot | calidus | chaud | — | — | **cauldron** a pot for boiling · **scald** to burn with hot liquid |
| night | noctem | nuit | Nacht | night | **nocturnal** happening at night |
| eight | octō | huit | acht | eight | **octave** a span of eight notes |

Splitting them also improved the true-cognate column. *night* and *eight* had
been showing *nocturnal* and *octave*; the real English cognates were available
all along and are now where they belong, with the Latinate relatives still
making the point about `ct`.

14 rows were corrected. Two other kinds of error surfaced in the same pass:
German **Spaten** was sitting under "sword" when it means *spade*, and French
**chef** under "head" when it means *chief* — so `kin` entries carry an optional
language, and both are now labelled as what they are.

`scripts/etym/audit-glosses.mjs` is the check for this class of mistake: it
fetches every cell and asks whether the entry's definitions share a content word
with the row's stated meaning. It would have caught cauldron/hot on its own.

Getting it to a trustworthy signal took three passes, and the wrong turns are
worth recording because each produced confident nonsense:

- **30 flags.** Most were Latin cited the way a dictionary cites it — the
  accusative `dentem`, the infinitive `cantāre` — where Wiktionary's page says
  only "inflection of *dēns*" and the meaning is one page further on. The audit
  was reading the wrong page and calling every Latin cell a mismatch.
- **22 flags,** after following those lemmas — but three were *new and wrong*.
  Latin `canis` is both the noun "dog" and a case form of `cānus` "white", so
  following the inflection from a page that also has the real definition threw
  the real one away, and "hound" got reported as meaning "hoary". Lemma-following
  now fires only when a page is nothing but inflections.
- **4 flags,** after the second real fix: a gloss that reduces to no content
  word — "I", "to", "do", "for", "out" — has nothing to search for, so the test
  cannot run on it. Those were being reported as failures rather than as
  unrunnable, which was most of the remaining noise.

The four that survive are all the checker meeting an ambiguous page, not content
errors: *seek* is defined as "to try to find", *April* as "the fourth month",
German *das* leads with its article sense. The fourth was worth acting on —
Latin `forēs` is simultaneously the plural of *foris* "door" and a form of *sum*
"to be", so the row now cites the unambiguous singular lemma.

One regression it caught was mine. Tightening the `strictus` row's gloss to
"drawn tight" made it accurate for the Latin and wrong for the French *étroit*,
which is simply "narrow". A row's meaning has to be true of every cell in it —
which is the same lesson that started this.

### Where the content comes from

Every chain is harvested from English Wiktionary, which states ancestry as
machine-readable templates (`{{inh|de|goh|fater}}`) rather than prose — so a
claim can be tested instead of trusted. 427 chains across the core decks.

Verification runs in two layers, and the split matters:

- **`npm run check` runs `scripts/check-etymology.mjs`, which is offline.** It
  checks what rots as the data is edited: a law with too few examples to
  generalise from, a quiz that cannot be built, a family pointing at a word no
  longer in the decks, a layer code with no label. A build must not fail
  because Wiktionary is down.
- **`scripts/etym/verify-*.mjs` hit the network and are run by hand.** They
  check the claims are *true*.

The online check tests each law group differently, because the three groups
claim different things — and testing them the same way was my first mistake
here. Grimm's pairs are cousins that must meet at the same Proto-Indo-European
root; the High German pairs are English and German meeting at Proto-Germanic,
with no Latin involved at all; the Latin→French pairs are **ancestor and
descendant**, where the test is that the French word's own chain contains that
Latin word.

Current state: **48 of 75 pairs machine-verified**, 26 unproven, 0 contradicted.
"Unproven" means Wiktionary states the etymology in a form the parser cannot
read on that page, not that it disagrees.

The one row previously recorded here as unresolved — `nuit < noctem` — is now
confirmed. `scripts/etym/walk.mjs` follows a chain page by page instead of
parsing a single page, which is what `{{etymon|…|tree=1}}` requires, and it
resolves `nuit ← Old French noit ← Latin nox`. That family now draws its own
tree: **nuit / Nacht / night**.

It has already earned its keep twice, catching two real errors in my own
content: *fau* as the French for beech (French kept **no** descendant of
*fāgus* — its beech is *hêtre*, from Frankish) and *aprīlis* for the Latin
April (capitalised, `Aprīlis`).

## Typing the word bank

The desktop sentence stage lays the sentence out as chips. Clicking each one
makes a six-word sentence six round trips to the mouse, so the chips are also
typeable: type a word's opening letters and it drops into place.

| Keys | What happens |
|---|---|
| A letter | Narrows the bank. The moment one chip is left it is placed — a distinctive word costs one keystroke. |
| More letters | While several chips still fit, each one shows the letters you have typed **in green**, so it is clear *why* one letter was not enough. The chips that no longer fit dim. |
| Space | Settles a tie no letter can. With "de" and "des" both in the bank, "de" is fully typed and still ambiguous; space takes the completed word, or failing that the leftmost chip still in the running. |
| Backspace | Walks back through the buffer, then through the sentence, taking the last word off. |
| Enter | Checks, once something is placed. |
| A letter that fits nothing | Refused, and the bank says so. Adding it to the buffer would make every later keystroke fail too, with nothing on screen to explain it. |

Matching ignores case and accents — the chip is already spelled for you, and
having to find `â` to select `bâtiment` would be slower than the mouse. `ß`,
`œ` and `æ` are matched by the letters they are typed with, so `heis` reaches
the `ß` in *heißen*. "Type it instead" is unchanged: there you write the whole
sentence and accents are required.

Two cases are easy to get wrong and are covered by tests: a bank holding the
**same word twice** (a sentence with a repeated word) places one of them rather
than waiting for a keystroke that can never distinguish them, and one word
being the **whole start of another** is what the space bar exists for.

A focused button keeps Enter and Space — that is how a button is pressed —
so those go to the button rather than the bank. Letters still type.

## Offline and installing

The app is a PWA. `vite build` emits `dist/sw.js` from `offlinePlugin` in
`vite.config.js`, which reads the finished bundle and writes a precache list —
so the worker always knows the hashed filenames, and no dependency decides the
caching policy for us.

| | Behaviour |
|---|---|
| Everything in the build | Precached on install: markup, code, vocabulary, word images, icons. A cold start with no network works. |
| Navigations | Network first, cached shell as fallback — a deploy is picked up when there is a network, and the app opens when there is not. |
| `/api` | **Never cached.** Word lookup and fact-checking are honestly unavailable offline; a stale gloss is worse than the failure the app already reports. |
| Other origins, and any non-GET | Not intercepted. |

The cache name is a hash of the file list, so a new build evicts the old one.
Registration is **production only** — in dev the worker would serve a cached
bundle over the top of HMR and every edit would appear not to have happened.

`scripts/sw.test.js` runs the generated worker against a mock
`ServiceWorkerGlobalScope` and asserts each row of that table, which is why
`npm run check` builds *before* it tests. Registration itself needs a real
browser and is not covered.

## Habit and adaptivity

Four changes that use data the app already had and was discarding:

- **A daily goal.** `progress.dailyGoal` had been in the saved object since the
  port and read nowhere. A streak says *whether* you showed up; the goal ring
  says whether you have done enough today.
- **Question kind by card strength.** `buildPracticeQueue` used to hand every
  word all three kinds, so a word met a minute ago and a word known for a month
  were asked identically — and a ten-word drawer became thirty typed questions.
  Now a new word is only asked to recognise, production is earned, a cloze
  waits for a few days' interval, and `kindsForCard` walks a leech back to
  recognition rather than demanding production of a word already failed eight
  times.
- **A next action.** With nothing due the home screen said "study something
  new" and stopped, at the one moment a learner needs the app to have an
  opinion. `nextAction` orders due work, then stuck words, then weak ones, then
  new material, then untouched tenses.
- **Accuracy over time.** `progress.history` has held reviews and correct
  answers per day since the port and fed only the streak and a heatmap. A day
  with no reviews is drawn as missing rather than as zero — a weekend off is
  not a collapse in accuracy.

## Leeches and interval fuzz

A card that has lapsed eight times is a **leech**: the word is not sticking and
a ninth trip round the same loop will not change that. `isLeech` marks it, and
the queue drops it back to recognition.

Due dates carry ±5% of jitter past the first week. Reviews studied together
come due together, so one heavy sitting used to recreate itself as one heavy
day every interval, forever. Only the *landing date* moves — the interval
itself is never fuzzed, so the drift cannot compound — and the offset is seeded
from the card id, so replaying the same answer cannot produce two different due
dates.

## Import, and what merging means

Export existed without import, which made it a backup rather than a transfer.
`mergeProgress` merges, never replaces: importing a phone's progress into a
laptop means *add what I did there*, never *delete what I did here*.

Where the same card exists on both sides, **whichever was reviewed more
recently wins**. A card's schedule is a claim about a specific moment of
recall, so the newer claim is the true one; taking the longer interval instead
would let a stale device push real reviews away. Day history sums, because two
devices on one day genuinely did both. Your own words keep the local copy on a
clash — it may carry a fact-check verdict the other device never ran.

## Notes: grammar and culture

Notes come in two kinds and the distinction is the point. `grammar` teaches
form; `culture` teaches use — when a form is appropriate, what it signals about
you, and where a word has no English equivalent because the thing it names is
not an English thing.

The deck was entirely the first kind, which is the difference between reading a
language and being competent in it. Six culture notes now cover *tu*/*vous* and
*du*/*Sie* (including the offer ritual and where the workplace rule is
shifting), how politeness lives in the verb rather than in extra words, German
directness and *doch*, and the words that carry a country inside them —
*laïcité*, *terroir*, *Feierabend*, *Ordnung*, *Vergangenheitsbewältigung*.

## Known rough edges

- `apiLookupBatch` still returns `[]` on failure to avoid throwing into the UI.
  Failures now log to the console, but nothing surfaces in the interface yet.
- Six `exhaustive-deps` warnings remain, all the same case: a memo that calls
  `conjCardId`, which is a plain function declaration inside the component and
  so has a new identity on every render. Adding it to the dependency array
  would make the memo recompute every render and defeat its purpose; the only
  value it closes over is `lang`, which *is* in the array. Correct as written,
  so left alone rather than silenced.
- The bundle is split three ways (vendor / vocabulary / app) so the parts cache
  independently, but first-paint bytes are unchanged. Loading the C1 sets on
  demand needs `src/data/vocab.js` to stop building `DATA` eagerly; lazy-loading
  whole areas needs component boundaries that one 5,900-line screen component
  does not have.
- No tests for the React screens. The pure layers are covered; see **Checks**.
- Service worker *registration* is untested. The policy is covered by
  `scripts/sw.test.js`, but registering a worker needs a real browser, and the
  embedded preview used during development refuses it.
