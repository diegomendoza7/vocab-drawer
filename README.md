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

Four optional word fields serve these levels:

| Field | Language | What it does |
|---|---|---|
| `art` | fr | The article marking gender. French has no der/die/das tag to reuse, so it renders through its own coloured element. Typing accepts the term with or without it. |
| `rek` | de | The preposition and case a verb governs, rendered **on the front** of the card — at B2+ the item is *eingehen auf + Akk.*, not *eingehen*. |
| `alt` | both | An equally common variant, shown but not drilled separately. |
| `n` | both | The source's usage note — false-friend warnings, collocations, plural forms. |

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

## Known rough edges

- `apiLookupBatch` still returns `[]` on failure to avoid throwing into the UI.
  Failures now log to the console, but nothing surfaces in the interface yet.
- Lint reports pre-existing warnings inherited from the artifact build (unused
  imports, bare `catch` params, a dead `recordAnswer`, some `exhaustive-deps`).
  Untouched by the port; worth a cleanup pass.
- No test suite.
