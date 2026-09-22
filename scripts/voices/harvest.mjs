/* Real human voices for the deck's headwords.
 *
 * The app speaks through the browser's synthesiser, which is intelligible and
 * unmistakably synthetic: the rhythm is wrong, the liaison is wrong, and a
 * learner copying it learns that. Wiktionary has real recordings for a
 * startling share of ordinary vocabulary — Lingua Libre's volunteer speakers
 * for French (`LL-Q150 (fra)-…`) and the German Wiktionary's own project
 * (`De-….ogg`) — under CC BY-SA, which is usable as long as the app credits
 * the speaker. A sampled check found a recording for 40 of 40 headwords.
 *
 * Two things this script is careful about:
 *
 *   1. **Language.** fr.wiktionary lists `En-us-argent.ogg` on the page for
 *      *argent* — an English speaker saying an English word. A harvest that
 *      takes "the audio on the page" ships that. Every file has to match the
 *      language's own naming convention *and* name the headword.
 *   2. **Size.** The source files are .wav at ~125 KB. Wikimedia generates its
 *      own MP3 transcode at ~16 KB, which is what gets downloaded — no local
 *      transcoding, no ffmpeg.
 *
 * Idempotent and resumable: anything already in the manifest is skipped, so an
 * interrupted run continues where it stopped, and widening the level list only
 * fetches what is new.
 *
 *   node scripts/voices/harvest.mjs                  # A1+A2, both languages
 *   node scripts/voices/harvest.mjs --levels A1,A2,B1
 *   node scripts/voices/harvest.mjs --lang de --limit 20
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DATA } from "../../src/data/vocab.js";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const UA = "VocabDrawer/1.0 (personal language-learning app; run locally by its owner)";

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`)) ||
    (process.argv.includes(`--${name}`) ? `--${name}=${process.argv[process.argv.indexOf(`--${name}`) + 1]}` : null);
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const LEVELS = arg("levels", "A1,A2").split(",").map((s) => s.trim());
const LANGS = arg("lang", "fr,de").split(",").map((s) => s.trim());
const LIMIT = Number(arg("limit", "0")) || Infinity;

/* What counts as a recording *of this word, in this language*. */
const CONVENTION = {
  fr: [/^(File|Fichier):LL-Q150 \(fra\)-/i, /^(File|Fichier):Fr-/i],
  de: [/^(File|Datei):LL-Q188 \(deu\)-/i, /^(File|Datei):De-/i],
};
const AUDIO = /\.(wav|ogg|oga|mp3|flac)$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Commons rate-limits, and says so with a 429. Backing off is the difference
 * between a harvest that finishes and one that dies at word 40. */
async function api(url, tries = 5) {
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status !== 503) throw new Error(`HTTP ${res.status} for ${url}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || 1000 * 2 ** attempt;
    console.log(`  (rate-limited, waiting ${Math.round(wait / 1000)}s)`);
    await sleep(wait);
  }
  throw new Error(`gave up after ${tries} attempts: ${url}`);
}

/* fr.wiktionary says "Fichier:", de.wiktionary says "Datei:", and Commons
 * knows neither — it wants "File:". Querying with the local alias silently
 * matches nothing, which is how the first run found 79 French recordings and
 * downloaded none of them. */
const commonsTitle = (title) => `File:${title.replace(/^(File|Datei|Fichier):/i, "")}`;

/* upload.wikimedia.org rate-limits downloads too, and the first version of
 * this loop treated every non-200 as "no such rendition" — which is how a run
 * reported 164 words "without a usable file" when the files were all there. */
const seenStatus = new Map();
async function download(url, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch {
      await sleep(500 * attempt);
      continue;
    }
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return buf.length >= 800 ? buf : null;                  // a stub, not audio
    }
    seenStatus.set(res.status, (seenStatus.get(res.status) || 0) + 1);
    if (res.status !== 429 && res.status !== 503) return null;
    const wait = Number(res.headers.get("retry-after")) * 1000 || 1000 * 2 ** attempt;
    await sleep(wait);
  }
  return null;
}

/** Slug used for the file on disk and as the manifest key's file name. */
export function slugOf(word) {
  return word.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss").replace(/œ/g, "oe").replace(/æ/g, "ae")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Wikimedia's own MP3 transcode of a file, which is ~8× smaller than the .wav. */
function transcodedMp3(url) {
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/);
  if (!m) return null;
  const [, base, a, b, name] = m;
  return `${base}/transcoded/${a}/${b}/${name}/${name}.mp3`;
}

/** How good a candidate file is for one headword: exact name beats mention. */
function score(title, word) {
  const bare = title.replace(/^(File|Datei|Fichier):/i, "");
  const stem = bare.replace(AUDIO, "");
  const exact = new RegExp(`(^|-)${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i").test(stem);
  const ll = /^LL-Q(150|188)/i.test(stem);
  return (exact ? 4 : 0) + (ll ? 2 : 0) + (/\.wav$/i.test(bare) ? 1 : 0);
}

function headwords(lang) {
  const out = [];
  for (const lv of LEVELS) {
    for (const drawer of DATA[lang]?.[lv] || []) {
      for (const w of drawer.words || []) {
        if (/^[\p{L}][\p{L}\-']*$/u.test(w.t || "") && !out.includes(w.t)) out.push(w.t);
      }
    }
  }
  return out.slice(0, LIMIT);
}

for (const lang of LANGS) {
  const words = headwords(lang);
  const outDir = `${ROOT}public/audio/${lang}/`;
  const manifestPath = `${ROOT}src/data/voices/${lang}.json`;
  mkdirSync(outDir, { recursive: true });
  mkdirSync(`${ROOT}src/data/voices/`, { recursive: true });
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};

  const todo = words.filter((w) => !manifest[w]);
  console.log(`\n${lang}: ${words.length} headwords in ${LEVELS.join("+")}, ${todo.length} still to fetch`);

  /* 1. Which audio files does each entry carry? Fifty titles per request. */
  const candidates = new Map();
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const url = `https://${lang}.wiktionary.org/w/api.php?action=query&format=json&prop=images&imlimit=500&titles=${batch.map(encodeURIComponent).join("|")}`;
    const pages = (await api(url)).query?.pages || {};
    for (const p of Object.values(pages)) {
      const word = p.title;
      const good = (p.images || []).map((im) => im.title)
        .filter((t) => AUDIO.test(t) && CONVENTION[lang].some((re) => re.test(t)))
        .sort((a, b) => score(b, word) - score(a, word));
      if (good.length) candidates.set(word, good[0]);
    }
    await sleep(300);
  }
  console.log(`  ${candidates.size} of ${todo.length} have a ${lang} recording on the entry`);

  /* 2. URL, size and licence for each chosen file. */
  const files = [...new Set(candidates.values())];
  const meta = new Map();
  for (let i = 0; i < files.length; i += 40) {
    const batch = files.slice(i, i + 40);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&titles=${batch.map((x) => encodeURIComponent(commonsTitle(x))).join("|")}`;
    const pages = (await api(url)).query?.pages || {};
    for (const p of Object.values(pages)) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      const ex = info.extmetadata || {};
      const strip = (v) => String(v || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      meta.set(commonsTitle(p.title), {
        url: info.url.split("?")[0],
        ext: (p.title.match(/\.([a-z0-9]+)$/i) || [, "ogg"])[1].toLowerCase(),
        mime: info.mime,
        licence: strip(ex.LicenseShortName?.value) || "see Commons",
        speaker: strip(ex.Artist?.value).replace(/^(Speaker|Recorder):\s*/i, "").split(/\s{2,}|Recorder:/)[0] || "Wikimedia contributor",
      });
    }
    await sleep(150);
  }

  console.log(`  ${meta.size} of ${files.length} files resolved on Commons`);

  /* 3. Download the smallest playable rendition. */
  let got = 0, failed = 0;
  for (const [word, title] of candidates) {
    const m = meta.get(commonsTitle(title));
    if (!m) { failed += 1; continue; }
    /* Wikimedia transcodes .wav to a much smaller mp3; for the German .ogg
     * recordings there is no transcode (404) and the original is already
     * ~11 KB, so the fallback is the normal path there, not an error. */
    const mp3 = m.ext === "wav" ? transcodedMp3(m.url) : null;
    const attempts = [...(mp3 ? [[mp3, "mp3"]] : []), [m.url, m.ext]];
    let saved = null;
    for (const [url, ext] of attempts) {
      const buf = await download(url);
      if (!buf) continue;
      const file = `${slugOf(word)}.${ext}`;
      writeFileSync(`${outDir}${file}`, buf);
      saved = { file, bytes: buf.length };
      break;
    }
    if (!saved) { failed += 1; continue; }
    manifest[word] = {
      file: saved.file,
      bytes: saved.bytes,
      speaker: m.speaker,
      licence: m.licence,
      source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(commonsTitle(title))}`,
    };
    got += 1;
    if (got % 25 === 0) {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);   // resumable
      console.log(`  …${got} downloaded`);
    }
    await sleep(250);
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  const total = Object.keys(manifest).length;
  const bytes = Object.values(manifest).reduce((s, e) => s + (e.bytes || 0), 0);
  if (seenStatus.size) console.log(`  download statuses seen: ${[...seenStatus].map(([s, n]) => `${s}x${n}`).join(", ")}`);
  console.log(`  +${got} new, ${failed} without a usable file · manifest now ${total} words, ${(bytes / 1e6).toFixed(1)} MB`);
  const dirBytes = Object.values(manifest).reduce((s, e) => {
    try { return s + statSync(`${outDir}${e.file}`).size; } catch { return s; }
  }, 0);
  if (dirBytes !== bytes) console.log(`  note: on disk ${(dirBytes / 1e6).toFixed(1)} MB`);
}
