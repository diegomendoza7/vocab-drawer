/* Copy only the Twemoji glyphs the app actually references into public/img/emoji.
 *
 * @twemoji/svg ships ~3,700 files; we use a few dozen. Copying the referenced
 * subset keeps the repo small and means the dependency is a build-time source
 * rather than something the browser has to reach.
 *
 * Run after editing EMOJI in src/data/word-images.js:
 *   node scripts/sync-emoji.mjs
 *
 * Twemoji graphics are CC-BY 4.0 (Twitter/X) — see public/img/emoji/LICENSE.
 */
import { mkdir, copyFile, readdir, rm, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@twemoji", "svg");
const dest = join(root, "public", "img", "emoji");

const { EMOJI } = await import(join(root, "src", "data", "word-images.js"));
const wanted = [...new Set(Object.values(EMOJI))];

await mkdir(dest, { recursive: true });

// Drop anything no longer referenced so removals actually shrink the folder.
for (const f of (await readdir(dest).catch(() => []))) {
  if (f.endsWith(".svg") && !wanted.includes(f.replace(/\.svg$/, ""))) {
    await rm(join(dest, f));
  }
}

const missing = [];
let copied = 0;
for (const cp of wanted) {
  const from = join(src, `${cp}.svg`);
  try {
    await access(from);
  } catch {
    missing.push(cp);
    continue;
  }
  await copyFile(from, join(dest, `${cp}.svg`));
  copied += 1;
}

await writeFile(
  join(dest, "LICENSE"),
  "Twemoji graphics by Twitter, Inc and other contributors.\n" +
    "Licensed under CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/\n" +
    "Source: https://github.com/jdecked/twemoji\n",
);

console.log(`copied ${copied} glyph${copied === 1 ? "" : "s"} to public/img/emoji`);
if (missing.length) {
  console.error(`\n  ${missing.length} codepoint(s) not found in @twemoji/svg:`);
  missing.forEach((m) => console.error(`    ${m}`));
  process.exitCode = 1;
}
