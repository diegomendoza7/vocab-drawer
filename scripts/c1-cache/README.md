# C1 verification cache

Working data for the scripts that check and extend the C1 decks. Everything
here is derived and re-buildable; none of it ships in the app.

| File | Built by | Used by |
|---|---|---|
| `manifest.json` | `c1-manifest.mjs` | everything downstream — one list of what the C1 decks contain |
| `wiktionary-fr.json`, `wiktionary-de.json` | `fetch-wiktionary.mjs --lang fr\|de` | the parser. Raw wikitext, ~8MB, gitignored |
| `parsed-fr.json`, `parsed-de.json` | `parse-wiktionary.mjs --lang fr\|de` | `audit-c1.mjs` — part of speech, gender, senses, examples |
| `dwds.json` | `verify-dwds.mjs` | `audit-c1.mjs` — corpus frequency for the German compounds Wiktionary does not list |

To rebuild from nothing:

```bash
node scripts/c1-manifest.mjs > scripts/c1-cache/manifest.json
node scripts/fetch-wiktionary.mjs --lang fr && node scripts/fetch-wiktionary.mjs --lang de
node scripts/parse-wiktionary.mjs --lang fr > scripts/c1-cache/parsed-fr.json
node scripts/parse-wiktionary.mjs --lang de > scripts/c1-cache/parsed-de.json
node scripts/verify-dwds.mjs
node scripts/audit-c1.mjs
```

The fetch is resumable and rate-limit aware; `--recheck` re-tries the titles
cached as absent, which matters because an early run recorded a whole batch as
missing when it hit a 429.
