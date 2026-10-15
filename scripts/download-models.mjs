import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { MODEL_CATALOG } from "../src/data/model-catalog.js";
const root = "public/models";
const selected = process.argv.includes("--all")
  ? MODEL_CATALOG
  : MODEL_CATALOG.filter((m) => m.key === (process.argv[2] || "speech"));
if (!selected.length) throw new Error("Choose speech, fr-en, de-en, or --all.");
function verified(bytes, expected) {
  if (bytes.length !== expected.bytes) return false;
  if (expected.sha256)
    return createHash("sha256").update(bytes).digest("hex") === expected.sha256;
  return (
    createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex") === expected.gitSha1
  );
}
mkdirSync(root, { recursive: true });
let manifest = { version: 1, models: [] };
if (existsSync(join(root, "manifest.json")))
  manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
function saveManifest() {
  const next = join(root, "manifest.json.part");
  writeFileSync(next, JSON.stringify(manifest, null, 2));
  renameSync(next, join(root, "manifest.json"));
}
for (const model of selected) {
  console.log(
    `Preparing ${model.label} (${(model.bytes / 1048576).toFixed(1)} MB)…`,
  );
  const allValid = model.files.every((file) => {
    const target = join(root, model.id, file.path);
    return existsSync(target) && verified(readFileSync(target), file);
  });
  if (!allValid) {
    manifest.models = manifest.models.filter((m) => m.id !== model.id);
    saveManifest();
  }
  for (const file of model.files) {
    const target = join(root, model.id, file.path);
    mkdirSync(join(target, ".."), { recursive: true });
    if (existsSync(target) && verified(readFileSync(target), file)) continue;
    const url = `https://huggingface.co/${model.id}/resolve/${model.revision}/${file.path}`;
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    } catch (error) {
      throw new Error(
        `Model download failed for ${model.key}/${file.path}. Check access to huggingface.co and the file’s CDN host, including us.aws.cdn.hf.co. ${error.cause?.message || error.message}`,
      );
    }
    if (!response.ok)
      throw new Error(
        `Could not download ${model.key}/${file.path}: HTTP ${response.status}`,
      );
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!verified(bytes, file))
      throw new Error(
        `Model integrity check failed: ${model.key}/${file.path}`,
      );
    const temporary = target + ".part";
    writeFileSync(temporary, bytes);
    renameSync(temporary, target);
    console.log(`Verified ${model.key}/${file.path}`);
  }
  manifest.models = manifest.models
    .filter((m) => m.id !== model.id)
    .concat({
      id: model.id,
      revision: model.revision,
      bytes: model.bytes,
      key: model.key,
      variant: model.variant,
    });
  saveManifest();
}
console.log(
  "Models are ready under /models/. Their downloaded files are ignored by Git.",
);
