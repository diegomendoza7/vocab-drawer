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

**The API key is optional.** Everything except Text Import works without one;
those endpoints return a clear 503 instead. The key lives only in `.env`
(gitignored) and is read only by `server/index.js` — it is never sent to the
browser.

## Layout

| Path | What |
|---|---|
| `src/VocabDrawer.jsx` | The app — 10 screens (learn, match, practice, choose, conjugation, dictation, speaking, reading, progress, summary) |
| `src/data/vocab.js` | 698 hand-curated words: FR/DE × A1–B2, in themed drawers |
| `src/data/content.js` | Reading passages, idioms, conjugation engine, grammar notes |
| `src/lib/storage.js` | IndexedDB persistence |
| `src/lib/api.js` | Client adapter — talks to the proxy, never to Anthropic directly |
| `server/index.js` | API proxy. Holds the key; pins output shape via structured outputs |

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
