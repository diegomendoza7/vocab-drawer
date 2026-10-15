import { writeListeningVersion } from "./listening-version.mjs";
import { CHALLENGES } from "../src/data/challenges.js";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { MISSIONS, PRONUNCIATION_PAIRS } from "../src/data/missions.js";
import { PASSAGES } from "../src/data/reading/index.js";
import { LESSONS } from "../src/data/lessons.js";
import { toVtt } from "../src/lib/subtitles.js";

const output = new URL("../public/listen/", import.meta.url).pathname;
const scratch = mkdtempSync("/tmp/vocab-listening-");
const toolsRoot = "/workspace/vocab-tools/espeak/usr";
const unpacked = existsSync(`${toolsRoot}/bin/espeak-ng`);
const executable =
  process.env.VOCAB_ESPEAK_BIN ||
  (unpacked ? "/lib64/ld-linux-x86-64.so.2" : "espeak-ng");
const prefix = unpacked
  ? [
      "--library-path",
      `${toolsRoot}/lib/x86_64-linux-gnu`,
      `${toolsRoot}/bin/espeak-ng`,
    ]
  : [];
const speechEnv = unpacked
  ? {
      ...process.env,
      ESPEAK_DATA_PATH: `${toolsRoot}/lib/x86_64-linux-gnu/espeak-ng-data`,
    }
  : process.env;
const manifest = {
  version: 1,
  engine: "eSpeak NG 1.52",
  audioType: "synthetic",
  entries: [],
};
let total = 0;
function duration(path) {
  return Number(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        path,
      ],
      { encoding: "utf8" },
    ).trim(),
  );
}
function generate({
  id,
  lang,
  category,
  lines,
  license = "Original app content",
}) {
  const directory = join(output, category);
  mkdirSync(directory, { recursive: true });
  const files = [],
    cues = [],
    english = [];
  let time = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i],
      wav = join(scratch, `${i}.wav`),
      padded = join(scratch, `${i}-pad.wav`);
    execFileSync(
      executable,
      [
        ...prefix,
        "-v",
        `${lang}+${i % 2 ? "f3" : "m3"}`,
        "-s",
        "145",
        "-w",
        wav,
        line.text,
      ],
      { env: speechEnv, stdio: ["ignore", "ignore", "pipe"] },
    );
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-i",
      wav,
      "-af",
      "apad=pad_dur=0.45",
      "-ar",
      "22050",
      "-ac",
      "1",
      padded,
    ]);
    const seconds = duration(padded);
    cues.push({
      id: `${id}-${i}`,
      start: time,
      end: time + seconds - 0.25,
      text: line.text,
    });
    if (line.en) english.push({ ...cues.at(-1), text: line.en });
    files.push(padded);
    time += seconds;
  }
  const list = join(scratch, "concat.txt");
  writeFileSync(list, files.map((path) => `file '${path}'`).join("\n"));
  const mp3 = join(directory, `${id}.mp3`);
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "40k",
    mp3,
  ]);
  writeFileSync(join(directory, `${id}.vtt`), toVtt(cues));
  if (english.length)
    writeFileSync(join(directory, `${id}.en.vtt`), toVtt(english));
  const measured = duration(mp3);
  if (!Number.isFinite(measured) || measured <= 0)
    throw new Error(`Empty audio: ${id}`);
  manifest.entries.push({
    id,
    lang,
    category,
    url: `/listen/${category}/${id}.mp3`,
    seconds: measured,
    bytes: readFileSync(mp3).length,
    sha256: createHash("sha256").update(readFileSync(mp3)).digest("hex"),
    license,
    voice: "Two synthetic voices; not a recording of native speakers",
  });
  if (++total % 10 === 0) console.log(`${total} listening items generated`);
}
try {
  for (const lang of ["fr", "de"]) {
    for (const mission of MISSIONS[lang])
      generate({
        id: mission.id,
        lang,
        category: "missions",
        lines: mission.lines,
        license: mission.source.license,
      });
    for (const mission of CHALLENGES[lang])
      generate({
        id: mission.id,
        lang,
        category: "challenges",
        lines: mission.lines,
        license: mission.source.license,
      });
    for (const passage of PASSAGES[lang])
      generate({
        id: passage.id,
        lang,
        category: "reading",
        lines: passage.paras.map(([text, en]) => ({ text, en })),
      });
    for (const lesson of LESSONS[lang])
      generate({
        id: lesson.id,
        lang,
        category: "literature",
        lines: lesson.extract.map((p) => ({ text: p.text })),
        license: `Public-domain source: ${lesson.source.work}; source URL retained in lesson`,
      });
    for (const pair of PRONUNCIATION_PAIRS[lang])
      for (const word of [pair.a, pair.b])
        generate({
          id: `${lang}-${word}`,
          lang,
          category: "sounds",
          lines: [{ text: word }],
          license: "CC BY 4.0",
        });
  }
  writeFileSync(
    join(output, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  writeListeningVersion();
  writeFileSync(
    join(output, "ATTRIBUTION.md"),
    "# Listening content\n\nThe new mission scripts and their generated audio are CC BY 4.0, attributed to Vocab Drawer. Audio in missions, challenges, reading, literature, and sounds is synthetic speech generated with eSpeak NG 1.52, whose software is GPL-3.0-or-later. The synthesizer is not bundled with the app. Synthetic output is labelled in the UI. Reading scripts retain their app authorship; literature sources and source URLs are in src/data/lessons.js.\n\nThe six original human story recordings in [human/](human/) retain their individual public-domain or Creative Commons terms. See [human recording attribution](human/ATTRIBUTION.md), [integrity and provenance manifest](human/manifest.json), and original Commons metadata in human/sources.json. The recordings were copied unchanged; source byte counts and SHA-1 hashes were verified, and local SHA-256 hashes are recorded.\n\nThe existing 215 human word recordings retain their original speaker and CC BY-SA credits in src/data/voices.\n",
  );
  console.log(
    `${total} assets, ${Math.round(manifest.entries.reduce((n, e) => n + e.seconds, 0) / 60)} minutes, ${(manifest.entries.reduce((n, e) => n + e.bytes, 0) / 1048576).toFixed(1)} MB`,
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
