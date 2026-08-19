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
| `src/lib/sentences.js` | The sentence-construction engine. Pure, no React |
| `src/lib/storage.js` | IndexedDB persistence |
| `src/lib/api.js` | Client adapter — talks to the proxy, never to Anthropic directly |
| `server/index.js` | API proxy. Holds the key; pins output shape via structured outputs |

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

## Checks

```bash
node scripts/check-answers.mjs
```

Covers the two pure layers — gloss matching over all 1,616 words and 2,409
senses, and every legal sentence combination (~32,800). No React, so it runs
under plain node. There is still no test suite for the component itself.

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

## Known rough edges

- `apiLookupBatch` still returns `[]` on failure to avoid throwing into the UI.
  Failures now log to the console, but nothing surfaces in the interface yet.
- Lint reports pre-existing warnings inherited from the artifact build (unused
  imports, bare `catch` params, a dead `recordAnswer`, some `exhaustive-deps`).
  Untouched by the port; worth a cleanup pass.
- No test suite.
