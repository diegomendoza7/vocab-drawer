# Vocab Drawer

A local-first French and German learning app: guided daily practice, vocabulary recall, practical missions, reading, listening, personal writing, and a free media/subtitle workspace. Core practice needs no account or paid AI key.

## Run it

Use Node 24 (Vite requires Node 20.19+ or 22.12+).

```bash
ONNXRUNTIME_NODE_INSTALL=skip npm ci
npm run dev
```

Vite uses port 5174; the optional Express API uses 8787. `API_PORT` must match in both processes when overridden. The API binds to `127.0.0.1` by default. The ONNX install setting skips optional native CUDA downloads; browser transcription uses WebAssembly.

```bash
npm run check          # production build, unit/regression tests, content audits, lint
npm run test:browser   # Chromium flows, accessibility samples, offline playback
```

Browser checks use `/usr/bin/chromium`, or `CHROMIUM_PATH` if set, plus `ffmpeg` and `unzip` for the video extension fixture. They start their own servers on 15174, 15175, and 18887, use disposable browser profiles, and write results to `/tmp/vocab-browser-report`. Run `check` first to build the offline production app and extension package. On a machine without Chromium, install it or use `npx playwright-core install chromium` and set `CHROMIUM_PATH` to that installation's executable. Building the app/extension needs no system ZIP tool.

## Start learning

Today offers a 5–30 minute route using your language, vocabulary starting point, purpose, due reviews, and recent work. A vocabulary level is a starting point, not a proficiency certificate. The practice library keeps the existing drawers, grammar, sentence construction, reading, collocations, etymology, imports, and other reference tools available.

New activities include 30 short practical missions, 12 fresh transfer challenges, a reading shelf, a human listening library, sound contrasts with recording/playback, repeated retelling, a personal language journal with photo/voice attachments and next-day rewriting, a contextual phrase notebook, a contrast clinic built from your saved errors, difficult-word repair, and a skill passport. Can-do completion is explicitly self-reported; grammar coverage and listening results are separate evidence.

## Free Media Studio

1. Open a local video/audio file, a direct public HTTPS media URL, a human recording, or the bundled dialogue.
2. Import French/German subtitles in SRT or VTT. An optional English track appears alongside the target track.
3. Replay a line, loop it, pause after each line, adjust speed or subtitle offsets, hide the transcript, practice dictation, or record a retelling.
4. Use keyboard word lookup and contextual pattern notes, save phrases with source/timestamps, edit subtitle wording, and export VTT tracks.
5. Save captions/notes. Optionally keep a media file under 500 MB in IndexedDB on this device.

Optional free speech recognition and English translation run in a browser worker using Transformers.js. Whisper tiny transcribes local clips; dedicated OPUS models translate either the recognized speech or an existing subtitle track into English. Pinned models download from Hugging Face on first use: approximately 64 MiB for speech, 109 MiB for French→English, and 108 MiB for German→English, with additional memory needed for inference. The speech model uses a full-precision encoder to avoid the repeated invented text seen with the quantized encoder. The ONNX runtime is served from this app using files from the locked, integrity-checked dependency installation; it needs no runtime CDN import. Media Studio's model controls prepare downloads and clear the browser model cache. English speech captions need both the speech and relevant translation models. Prepare them online before expecting them offline. Clips for transcription are limited to 15 minutes and 200 MB. Long videos work with imported subtitles. Browser decoding depends on the file's codecs; for incompatible video, extract an audio track locally:

```bash
ffmpeg -i episode.mp4 -vn -ac 1 -ar 16000 episode.wav
```

To host the pinned model files with this app rather than fetch them from the browser:

```bash
npm run download:models -- --all  # verified files under ignored public/models/, about 281 MiB
npm run test:models              # real French/German speech and translation checks
npm run build                   # includes locally installed models if supplied
```

The installer verifies each file against pinned sizes and SHA-256 or Git blob hashes. Install one model with `npm run download:models -- speech` (or `fr-en`/`de-en`). A completed installation descriptor is retained offline; binaries use the Transformers cache after preparation in Media Studio. Preparing the installation alone does not measure inference quality or prove browser caching.

Audio/text inference stays in the browser; model hosts receive download requests. **Real French/German human-speech recognition, English speech captions, and text translation passed on 2026-10-14 with external browser requests blocked.** All three model sets downloaded and passed their pinned integrity checks. The earlier `us.aws.cdn.hf.co` access restriction is resolved in this running instance. App-scoped models and the local runtime also avoid modifying Chromium's persistent certificate trust. Machine wording, timing, and translation still need review: small speech models mishear words and can invent text, especially with synthetic or difficult audio. These checks establish functionality on the recorded excerpts, not accuracy on every show or low-end device.

A streaming-service watch page is not a direct media URL. Public media hosts must allow playback; some formats need converting. There is no paid API requirement for Media Studio.

For video beside a web player, use **Practice library → Browser video extension** or download the [Chrome/Edge package](public/extensions/vocab-drawer-browser.zip). Unzip it, enable Developer mode in the extension manager, and Load unpacked. Import your target/English SRT/VTT tracks, or read captions exposed by an accessible HTML5 player. The panel offers bilingual text, replay/loop, speed/timing controls, selected pattern notes, and phrase export for merging into the app. It uses only activeTab/scripting permissions after your click and makes no network requests. Export phrases before closing the panel. Protected streams/private subtitle APIs are not extracted; cross-origin iframes and particular streaming services need further compatibility work. See [extension instructions](extension/README.md).

## Listening content and downloads

The repository includes **92 synthetic audio assets, 54.7 minutes, about 16 MB**: 30 missions, 12 unseen challenges, 30 reading passages, four literary extracts, and 16 sound examples. Dialogue and reading audio has parallel captions where translations are supplied. There are also **six original human story recordings, 14.9 minutes, about 7.7 MB**, with gist/detail prompts, retelling, notes, downloads, and preserved source/licence credits. The library contains four French La Fontaine fables and two German Grimm tales. These supplement the existing **215 human word recordings**.

Synthetic speech is labelled explicitly. The new scripts and suggested story levels are pilot teaching content; internal audits do not replace review by a French/German teacher or establish CEFR calibration. Human story recordings currently have no bundled verified bilingual transcript: listen with the guided prompts, import one, or use optional local generation. See [listening attribution](public/listen/ATTRIBUTION.md), [human credits](public/listen/human/ATTRIBUTION.md), and the integrity manifests beside the assets.

Download a mission or reading before disconnecting. The production service worker caches the shell, fonts, images, and core activity code. Advanced vocabulary is loaded on demand; visit C1 online before expecting it offline. Speech-model files and local media storage are separate from lesson downloads. Audio/caption content changes create a new download-cache version; changed editions need downloading again.

To regenerate synthetic listening assets, install `espeak-ng`, `ffmpeg`, and `ffprobe`, then run `npm run generate:listening`. The checked-in audio needs no synthesis tool at runtime. The generator also supports the unpacked cloud toolchain under `/workspace/vocab-tools/espeak`, or `VOCAB_ESPEAK_BIN` for a system executable. Never download or repackage third-party recordings without retaining their actual source and licence.

## Your data and assessment

Progress lives in IndexedDB. The app shows loading, saving, saved, and failed states with retry; a failed read does not overwrite an existing profile. Answered reviews are journalled and recovered once after interruption. Language changes commit the original session before switching decks.

Backups & device transfer exports versioned JSON, previews imports, merges identifiable events without duplication, or restores a complete profile. A previous local snapshot supports undo. Legacy aggregate history is merged conservatively because it has no event IDs. JSON includes captions, notes, phrases, journals, and learning records; media blobs, photos, and voice recordings stay on the original device. **Files on this device** downloads or deletes those files and clears downloaded lessons without deleting captions/history. Photos accept JPEG/PNG/WebP up to 10 MB and 40 megapixels. Clearing browser/site data deletes local records, so export periodically.

An exclusive browser lock pauses a second study tab. Atomic compare-and-set writes also refuse stale progress rather than silently overwrite newer work. Close the active tab and reload the paused one to resume. This protects one local profile; transfer between devices still uses explicit backups.

Independent lexical recognition and production have separate schedules. Assisted answers and successful early practice do not establish delayed recall. A miss enters a short relearning gap. Difficult cards can recover through delayed independent successes without erasing lifetime lapses. “Held for a week” requires an observed gap; old intervals remain estimates.

Grammar checking sends the submitted text to LanguageTool. If unavailable, its score is null; German local rules provide partial coverage. Voice recording is self-comparison, and browser speech recognition is read-aloud practice rather than a pronunciation or conversational proficiency score. Approximate foreground practice time is optional and language-specific.

## Optional online services

- `api.languagetool.org`: submitted grammar checks.
- Wiktionary: optional online lookup/enrichment. The core dictionary works offline.
- Hugging Face/CDN: optional browser speech and translation model downloads.
- Anthropic: existing optional personal-word gloss/verification and translation endpoints. To enable them, configure `ANTHROPIC_API_KEY` on the server; it is never bundled into the browser. A key can incur provider charges and is unnecessary for the new core learning/media workflow.

Fonts are bundled locally. No external web-font request is needed. Bundled ONNX Runtime files retain their [MIT licence](public/ONNX-RUNTIME-LICENSE.txt).

## Implementation notes

See [implementation and audit coverage](docs/IMPLEMENTATION.md) for changes, validation, and remaining research/editorial work. Historical design/development notes were moved to [HISTORY.md](docs/HISTORY.md); those notes are not current setup instructions.
