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
| `src/data/vocab-fr-c1.js` | French C1 — 362 words in 33 drawers, generated from a compiled B2+ list. `FR_C1_STAGED` holds a further 676 not yet wired in |
| `src/data/vocab-de-c1.js` | German C1 — 583 words in 58 drawers, same treatment. `DE_C1_STAGED` holds a further 624 |
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

These entries have no example sentences yet, so they drill two question kinds
instead of three — `buildPracticeQueue` skips fill-in-the-blank when a word has
no cloze. Running the My Words check pass over them adds sentences.

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

Six per language. French adds the **conditionnel** and the **subjonctif**,
German the **Konjunktiv II** — the moods a learner meets constantly and could
not previously drill at all.

Most of it is derived rather than stored, because the shapes are regular:

| | How it is built |
|---|---|
| Conditionnel | the future stem with imperfect endings — nothing new to store |
| Subjonctif | the `ils` stem: parlent → parl-, finissent → finiss-. About a dozen verbs whose subjunctive is genuinely irregular carry `subj` instead |
| Konjunktiv II | the Präteritum, umlauted for strong verbs (kam → käme). Weak verbs do not change at all, which is exactly why German reaches for *würde* |

The one class that defeats the rule is the mixed verbs — a weak `-te` past with
a changed stem (bringen → brächte, haben → hätte). They are named in
`DE_MIXED_K2`, keyed by stem so prefixed forms inherit.

**The imperative is deliberately absent.** It has three persons where every
other tense has six, and the six-person shape is assumed by the pronoun list,
the matching board, the multiple-choice distractors and the coverage map.
Adding it is a structural change, not another table.

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

**The C1 words have no example sentences** — all 945 of them. That is not
cosmetic: `buildPracticeQueue` skips fill-in-the-blank without a cloze,
`goToSentence` skips the sentence stage, dictation has nothing to read, and
Sentence Constructions cannot use them. C1 quietly drills two question kinds
instead of three and nothing says why.

`generate-c1-sentences.mjs` fixes that, and needs `ANTHROPIC_API_KEY` in `.env`
plus the API server running. It is a dry run by default, refuses any sentence
that does not contain the headword — a cloze that cannot find its own answer is
worse than no sentence — never overwrites an existing one, and writes per batch
so an interrupted run keeps what it earned.

## Known rough edges

- `apiLookupBatch` still returns `[]` on failure to avoid throwing into the UI.
  Failures now log to the console, but nothing surfaces in the interface yet.
- Four `exhaustive-deps` warnings remain, on two conjugation memos. They are
  correct as written — the omitted values are stable for the lifetime of the
  memo — and adding them changes what recomputes, so they were left alone
  rather than silenced.
- The bundle is split three ways (vendor / vocabulary / app) so the parts cache
  independently, but first-paint bytes are unchanged. Loading the C1 sets on
  demand needs `src/data/vocab.js` to stop building `DATA` eagerly; lazy-loading
  whole areas needs component boundaries that one 5,900-line screen component
  does not have.
- No tests for the React screens. The pure layers are covered; see **Checks**.
