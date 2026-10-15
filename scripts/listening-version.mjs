import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
export function listeningVersion() {
  const root = new URL("../public/listen/", import.meta.url).pathname;
  const hash = createHash("sha256");
  for (const category of [
    "missions",
    "challenges",
    "reading",
    "literature",
    "sounds",
    "human",
  ])
    for (const name of readdirSync(join(root, category)).sort())
      hash
        .update(category + "/" + name)
        .update(readFileSync(join(root, category, name)));
  return hash.digest("hex").slice(0, 12);
}
export function writeListeningVersion() {
  writeFileSync(
    new URL("../src/data/listening-version.js", import.meta.url),
    `// Generated from audio and caption contents by scripts/generate-listening.mjs.\nexport const LISTEN_VERSION='${listeningVersion()}';\n`,
  );
}
