// Real browser inference, deliberately separate from offline regression checks.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { MODEL_CATALOG } from "../src/data/model-catalog.js";
const installed = existsSync("public/models/manifest.json")
  ? JSON.parse(readFileSync("public/models/manifest.json", "utf8"))
  : { models: [] };
for (const model of MODEL_CATALOG)
  assert(
    installed.models.some(
      (m) =>
        m.id === model.id &&
        m.revision === model.revision &&
        m.variant === model.variant,
    ),
    "Run npm run download:models -- --all before this real inference check.",
  );
const port = 15275,
  child = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
let logs = "";
child.stdout.on("data", (b) => (logs += b));
child.stderr.on("data", (b) => (logs += b));
let browser;
try {
  for (let i = 0; i < 150; i++) {
    if (child.exitCode != null) throw new Error(logs);
    try {
      if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (existsSync("/usr/bin/chromium")
        ? "/usr/bin/chromium"
        : chromium.executablePath()),
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  await context.route(/^https?:\/\//, (route) => {
    const url = new URL(route.request().url());
    return url.origin === `http://127.0.0.1:${port}`
      ? route.continue()
      : route.abort();
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}`);
  await page.getByRole("heading", { name: "Today in French" }).waitFor();
  const results = [];
  for (const lang of ["fr", "de"]) {
    const result = await page.evaluate(async (lang) => {
      const { decodeForTranscription, startTranscription } = await import(
        "/src/lib/transcription.js"
      );
      // Test real human speech. Whisper tiny can hallucinate on the bundled
      // eSpeak dialogue; a synthetic voice is not a reliable speech fixture.
      const path =
        lang === "fr"
          ? "/listen/human/fr-crow-fox.ogg"
          : "/listen/human/de-red-riding-hood.ogg";
      const blob = await (await fetch(path)).blob(),
        file = new File([blob], "human-speech.ogg", { type: "audio/ogg" });
      const input = await decodeForTranscription(file);
      const at = performance.now();
      // The German file opens with a Librivox/public-domain announcement.
      // Use the story excerpt containing the grandmother, not that introduction.
      const clipStart = lang === "de" ? 12 : 0,
        clipSeconds = lang === "de" ? 30 : 18;
      const speechAudio = input.audio.slice(
          clipStart * 16000,
          (clipStart + clipSeconds) * 16000,
        ),
        englishAudio = speechAudio.slice();
      const speech = await startTranscription(speechAudio, lang).promise;
      const english = await startTranscription(englishAudio, lang, {
        translate: true,
      }).promise;
      const translation = await startTranscription(null, lang, {
        texts: [
          lang === "fr"
            ? "Bonjour. Je voudrais un café."
            : "Guten Tag. Ich möchte einen Kaffee.",
        ],
      }).promise;
      return {
        lang,
        source: path,
        clipStart,
        clipSeconds,
        speech,
        english,
        translation,
        seconds: Math.round((performance.now() - at) / 1000),
      };
    }, lang);
    results.push(result);
    mkdirSync("/tmp/vocab-model-report", { recursive: true });
    writeFileSync(
      "/tmp/vocab-model-report/inference.json",
      JSON.stringify(
        {
          models: MODEL_CATALOG.map((m) => ({
            id: m.id,
            revision: m.revision,
          })),
          results,
        },
        null,
        2,
      ),
    );
    assert(result.speech.text.length > 10);
    assert(result.speech.chunks?.length > 0);
    assert.match(
      result.speech.text.toLowerCase(),
      lang === "fr" ? /fromage/ : /gro[ßs]+mutter/,
    );
    assert.match(
      result.english.text.toLowerCase(),
      lang === "fr" ? /cheese/ : /grandmother/,
    );
    assert.match(result.translation.join(" ").toLowerCase(), /coffee/);
    console.log(
      `PASS ${lang}: speech, English speech captions, text translation (${result.seconds}s)`,
    );
  }
  mkdirSync("/tmp/vocab-model-report", { recursive: true });
  writeFileSync(
    "/tmp/vocab-model-report/inference.json",
    JSON.stringify(
      {
        models: MODEL_CATALOG.map((m) => ({ id: m.id, revision: m.revision })),
        results,
      },
      null,
      2,
    ),
  );
  console.log(
    "Real browser inference passed with remote model requests blocked.",
  );
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}
