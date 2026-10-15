import { MODEL_CATALOG } from "../data/model-catalog.js";
import { localModelManifest } from "../lib/local-models.js";
import { pipeline, env } from "@huggingface/transformers";
import asyncWasm from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm?url";
import asyncModule from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.mjs?url";
import legacyWasm from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?url";
import legacyModule from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs?url";
// Use the runtime from the integrity-checked lockfile installation. The SDK's
// default CDN module import cannot use the cloud's browser trust configuration.
const legacyRuntime = env.backends.onnx.wasm.wasmPaths?.wasm?.endsWith(
  "/ort-wasm-simd-threaded.wasm",
);
env.backends.onnx.wasm.wasmPaths = {
  wasm: new URL(legacyRuntime ? legacyWasm : asyncWasm, self.location.origin)
    .href,
  mjs: new URL(legacyRuntime ? legacyModule : asyncModule, self.location.origin)
    .href,
};
env.allowLocalModels = false;
let localManifest;
async function modelOptions(id) {
  if (!localManifest) localManifest = await localModelManifest();
  const spec = MODEL_CATALOG.find((m) => m.id === id);
  const local = localManifest.models?.some(
    (m) =>
      m.id === id &&
      m.revision === spec?.revision &&
      m.variant === spec?.variant,
  );
  env.allowLocalModels = local;
  env.localModelPath = "/models/";
  return {
    device: "wasm",
    dtype: spec.dtype || "q8",
    revision: spec.revision,
    local_files_only: local,
  };
}
const modelFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (resource, options = {}) => {
  try {
    return await modelFetch(resource, {
      ...options,
      signal: AbortSignal.any([
        ...(options.signal ? [options.signal] : []),
        AbortSignal.timeout(30000),
      ]),
    });
  } catch (error) {
    const url = new URL(
      typeof resource === "string" ? resource : resource.url || resource.href,
      self.location.href,
    );
    throw new Error(
      `Model file could not load from ${url.origin}${url.pathname}: ${error.message}`,
    );
  }
};
const MODEL = "onnx-community/whisper-tiny";
let recognizer;
const translators = {};
env.backends.onnx.wasm.numThreads = 1;
async function translateTexts(texts, lang, id) {
  if (!translators[lang])
    translators[lang] = await pipeline(
      "translation",
      `Xenova/opus-mt-${lang}-en`,
      {
        ...(await modelOptions(`Xenova/opus-mt-${lang}-en`)),
        progress_callback: (p) =>
          self.postMessage({ id, ...p, type: "progress" }),
      },
    );
  const result = [];
  for (let i = 0; i < texts.length; i++) {
    const rows = await translators[lang](texts[i], { max_new_tokens: 256 });
    result.push(rows[0]?.translation_text || "");
    self.postMessage({
      id,
      type: "progress",
      progress: ((i + 1) / texts.length) * 100,
      status: "translating",
    });
  }
  return result;
}
self.onmessage = async ({ data }) => {
  try {
    if (data.op === "prepare") {
      const spec = MODEL_CATALOG.find((m) => m.key === data.key);
      if (!spec) throw new Error("Unknown model");
      const loaded = await pipeline(
        spec.key === "speech" ? "automatic-speech-recognition" : "translation",
        spec.id,
        {
          ...(await modelOptions(spec.id)),
          progress_callback: (p) =>
            self.postMessage({ id: data.id, ...p, type: "progress" }),
        },
      );
      if (spec.key === "speech") recognizer = loaded;
      else translators[spec.key.slice(0, 2)] = loaded;
      self.postMessage({
        id: data.id,
        type: "complete",
        result: { ready: true, key: spec.key },
      });
      return;
    }
    if (data.op === "translate-text") {
      const result = await translateTexts(data.texts, data.lang, data.id);
      self.postMessage({ id: data.id, type: "complete", result });
      return;
    }
    if (!recognizer)
      recognizer = await pipeline("automatic-speech-recognition", MODEL, {
        ...(await modelOptions(MODEL)),
        progress_callback: (p) =>
          self.postMessage({
            id: data.id,
            type: "progress",
            progress: p.progress || 0,
            file: p.file || "",
            status: p.status,
          }),
      });
    let result = await recognizer(data.audio, {
      language: data.lang === "de" ? "german" : "french",
      task: "transcribe",
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    if (data.translate) {
      // Translating the recognized wording with the dedicated MT model avoids
      // tiny Whisper's unreliable direct speech-to-English generation.
      const chunks = result.chunks?.length
        ? result.chunks
        : [{ text: result.text, timestamp: [0, data.audio.length / 16000] }];
      const translated = await translateTexts(
        chunks.map((c) => c.text),
        data.lang,
        data.id,
      );
      result = {
        text: translated.join(" "),
        chunks: chunks.map((c, i) => ({ ...c, text: translated[i] })),
      };
    }
    self.postMessage({ id: data.id, type: "complete", result });
  } catch (error) {
    recognizer = null;
    self.postMessage({ id: data.id, type: "error", error: error.message });
  }
};
