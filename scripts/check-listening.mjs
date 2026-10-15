import { listeningVersion } from "./listening-version.mjs";
import { LISTEN_VERSION } from "../src/data/listening-version.js";
if (listeningVersion() !== LISTEN_VERSION)
  throw new Error("Listening version is stale; regenerate the assets.");
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { MISSIONS } from "../src/data/missions.js";
import { CHALLENGES } from "../src/data/challenges.js";
import { parseSubtitles } from "../src/lib/subtitles.js";

const manifest = JSON.parse(
  readFileSync("public/listen/manifest.json", "utf8"),
);
let seconds = 0;
for (const entry of manifest.entries) {
  const path = `public${entry.url}`;
  if (!existsSync(path)) throw new Error(`Missing audio ${path}`);
  const data = readFileSync(path);
  if (
    data.length !== entry.bytes ||
    createHash("sha256").update(data).digest("hex") !== entry.sha256
  )
    throw new Error(`Audio integrity mismatch: ${path}`);
  if (!(entry.seconds > 0) || !entry.voice.includes("synthetic"))
    throw new Error(`Invalid audio metadata: ${path}`);
  seconds += entry.seconds;
}
for (const lesson of [
  ...Object.values(MISSIONS).flat(),
  ...Object.values(CHALLENGES).flat(),
]) {
  const target = parseSubtitles(
    readFileSync(`public${lesson.captions}`, "utf8"),
  );
  const english = parseSubtitles(
    readFileSync(`public${lesson.englishCaptions}`, "utf8"),
  );
  if (target.length !== lesson.lines.length || english.length !== target.length)
    throw new Error(`Caption count mismatch: ${lesson.id}`);
  if (
    target.some(
      (c, i) =>
        c.text !== lesson.lines[i].text ||
        english[i].text !== lesson.lines[i].en,
    )
  )
    throw new Error(`Caption wording mismatch: ${lesson.id}`);
  const audio = manifest.entries.find((e) => e.id === lesson.id);
  if (!audio || target.at(-1).end > audio.seconds + 0.05)
    throw new Error(`Captions outlast audio: ${lesson.id}`);
  if (
    lesson.question.answer < 0 ||
    lesson.question.answer >= lesson.question.options.length
  )
    throw new Error(`Unanswerable question: ${lesson.id}`);
}
console.log(
  `listening: ${manifest.entries.length} verified audio assets, ${(seconds / 60).toFixed(1)} minutes; ${Object.values(MISSIONS).flat().length} missions and ${Object.values(CHALLENGES).flat().length} fresh challenges with paired captions`,
);

const human = JSON.parse(
  readFileSync("public/listen/human/manifest.json", "utf8"),
);
for (const entry of human.entries) {
  const data = readFileSync("public" + entry.url);
  if (
    data.length !== entry.bytes ||
    createHash("sha1").update(data).digest("hex") !== entry.sha1 ||
    createHash("sha256").update(data).digest("hex") !== entry.sha256
  )
    throw new Error("Human recording integrity mismatch: " + entry.id);
  if (
    !entry.metadata?.LicenseShortName?.value ||
    !entry.source.startsWith("https://commons.wikimedia.org/")
  )
    throw new Error("Missing human recording provenance: " + entry.id);
}
console.log(
  `human listening: ${human.entries.length} original licensed recordings, ${(human.entries.reduce((n, e) => n + e.seconds, 0) / 60).toFixed(1)} minutes`,
);
