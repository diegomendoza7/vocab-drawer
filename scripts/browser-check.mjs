/* global window, document, navigator, IDBObjectStore, innerWidth, axe */
// Browser globals below are evaluated inside Playwright pages, not in Node.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const webPort = 15174,
  apiPort = 18887,
  previewPort = 15175;
const origin = `http://127.0.0.1:${webPort}`;
const children = [],
  results = [],
  pageErrors = [];
let browser;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function launch(args, extra = {}) {
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: "",
      API_PORT: String(apiPort),
      ...extra,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (b) => {
    log += b;
  });
  child.stderr.on("data", (b) => {
    log += b;
  });
  child.diagnostic = () => log.slice(-4000);
  children.push(child);
  return child;
}
async function ready(url, child) {
  for (let i = 0; i < 100; i++) {
    if (child.exitCode != null) throw new Error(child.diagnostic());
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`Server failed to start: ${child.diagnostic()}`);
}
async function check(name, fn) {
  await fn();
  results.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
}
async function newPage(viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({
    viewport,
    permissions: ["microphone"],
  });
  await context.route("https://api.languagetool.org/**", (route) =>
    route.abort(),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Today in French" }).waitFor();
  await page.getByText("All changes saved", { exact: false }).waitFor();
  return { context, page };
}
async function library(page, title) {
  await page
    .locator('nav[aria-label="Sections"]')
    .getByRole("button", { name: "Practice library", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Practice library", exact: true })
    .waitFor();
  await page
    .locator("main")
    .getByRole("button", {
      name: new RegExp("^" + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .click();
}
async function stored(page) {
  return page.evaluate(async () => {
    const { storage } = await import("/src/lib/storage.js");
    return JSON.parse((await storage.get("vocabdrawer:progress:v1")).value);
  });
}
async function seed(page, cards) {
  await page.evaluate(async (data) => {
    const { createProgress, PROGRESS_KEY } = await import(
      "/src/lib/progress.js"
    );
    const { storage } = await import("/src/lib/storage.js");
    await storage.set(
      PROGRESS_KEY,
      JSON.stringify({ ...createProgress(), cards: data }),
    );
  }, cards);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Today in French" }).waitFor();
  await page.getByText("All changes saved", { exact: false }).waitFor();
}

try {
  const api = launch(["server/index.js"]);
  await ready(`http://127.0.0.1:${apiPort}/api/health`, api);
  const web = launch([
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    String(webPort),
    "--strictPort",
  ]);
  await ready(origin, web);
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (existsSync("/usr/bin/chromium")
        ? "/usr/bin/chromium"
        : chromium.executablePath()),
    headless: true,
    args: [
      "--no-sandbox",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });
  const { page, context } = await newPage();
  await check("Today renders a beginner route without a paid API", async () => {
    assert.match(await page.locator("main").innerText(), /Meet someone/);
    assert(
      !(await page.locator("main").innerText()).includes("Libres et égaux"),
    );
  });
  await check(
    "five-minute planning does not promise a sixteen-minute route",
    async () => {
      await page.getByLabel("Practice time", { exact: true }).selectOption("5");
      assert.equal(await page.locator(".vd-route .vd-panel").count(), 2);
      await page
        .getByLabel("Practice time", { exact: true })
        .selectOption("15");
    },
  );
  await check(
    "a mission plays real bundled audio and remembers its stage",
    async () => {
      await page
        .getByRole("button", { name: "Start today’s practice", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Meet someone", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Listen to the dialogue", exact: true })
        .click();
      await page.waitForFunction(
        () => document.querySelector("main audio")?.readyState >= 2,
      );
      assert(
        (await page.locator("main audio").evaluate((a) => a.duration)) > 5,
      );
      await page
        .getByRole("button", { name: "Check the meaning", exact: true })
        .click();
      await page
        .getByRole("button", { name: "For the weekend", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Use it for yourself", exact: true })
        .click();
      await page
        .getByLabel("Your personal response", { exact: true })
        .fill("Je m’appelle Sam. J’habite à Paris.");
      await page
        .getByText(
          "I expressed my own meaning and checked it against the task.",
          { exact: true },
        )
        .click();
      await page
        .getByRole("button", { name: "Finish this mission", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "A useful step completed" })
        .waitFor();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const data = await stored(page);
      assert(data.missions["fr-introductions"].completedAt);
      assert.equal(data.skillEvidence.at(-1).selfReported, true);
    },
  );
  await check(
    "caption study plays a paired dialogue and saves context",
    async () => {
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Media Studio", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Try a bundled dialogue" })
        .click();
      await page
        .getByRole("button", { name: "Replay line", exact: true })
        .waitFor();
      await page.waitForFunction(
        () => document.querySelector("main audio")?.readyState >= 2,
      );
      assert.match(
        await page.locator("main").innerText(),
        /Hello. I would like a coffee/,
      );
      await page
        .getByRole("button", { name: "Save selected phrase or whole line" })
        .click();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      assert(
        (await stored(page)).phrasebook.some(
          (p) => p.source === "Order at a café",
        ),
      );
    },
  );
  await check(
    "SRT and VTT imports align and line looping handles adjacent cues",
    async () => {
      const srt =
        "1\n00:00:00,000 --> 00:00:01,000\nBonjour.\n\n2\n00:00:01,000 --> 00:00:03,000\nJe voudrais un café.";
      const en =
        "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello.\n\n00:00:01.000 --> 00:00:03.000\nI would like a coffee.";
      await page
        .getByLabel("French subtitles · SRT or VTT", { exact: true })
        .setInputFiles({
          name: "fr.srt",
          mimeType: "text/plain",
          buffer: Buffer.from(srt),
        });
      await page
        .getByLabel("English subtitles · optional", { exact: true })
        .setInputFiles({
          name: "en.vtt",
          mimeType: "text/vtt",
          buffer: Buffer.from(en),
        });
      await page.getByLabel("Loop current line", { exact: true }).check();
      await page
        .getByRole("button", { name: "Replay line", exact: true })
        .click();
      await page.locator("main audio").evaluate((a) => {
        a.pause();
        a.currentTime = 1.15;
        a.dispatchEvent(new Event("timeupdate"));
      });
      assert(
        (await page.locator("main audio").evaluate((a) => a.currentTime)) < 0.1,
      );
      await page.getByLabel("Loop current line", { exact: true }).uncheck();
      await page.getByRole("button", { name: "Next", exact: true }).click();
      assert.match(
        await page.locator("main").innerText(),
        /I would like a coffee/,
      );
    },
  );
  await check(
    "media captions and notes survive a stored-session reload",
    async () => {
      await page
        .getByLabel("Your notes or a short summary", { exact: true })
        .fill("A polite café request.");
      await page.getByLabel(/Keep this media on this device/).check();
      await page
        .getByRole("button", { name: "Save study session", exact: true })
        .click();
      await page
        .getByText("Saved captions, notes, and media on this device.", {
          exact: true,
        })
        .waitFor();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const data = await stored(page);
      const id = Object.keys(data.mediaSessions)[0];
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: "Today in French" }).waitFor();
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Media Studio", exact: true })
        .click();
      await page
        .getByLabel("Reopen a session", { exact: true })
        .selectOption(id);
      await page
        .getByRole("button", { name: "Replay line", exact: true })
        .waitFor();
      assert.equal(
        await page.getByLabel("Your notes or a short summary").inputValue(),
        "A polite café request.",
      );
    },
  );
  await check(
    "local subtitle generation can be cancelled without losing supplied tracks",
    async () => {
      await page
        .getByText("Create subtitles on this device · optional", {
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "Transcribe in French", exact: true })
        .click();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByText("Cancelled.", { exact: true }).waitFor();
      await page
        .getByRole("button", { name: "Replay line", exact: true })
        .waitFor();
    },
  );
  await check(
    "model download failure preserves imported captions",
    async () => {
      // Installed local models must not hide the download-failure scenario.
      await context.route("**/models/manifest.json", (route) =>
        route.fulfill({ json: { version: 1, models: [] } }),
      );
      await context.route("https://huggingface.co/**", (route) =>
        route.abort(),
      );
      await page
        .getByRole("button", {
          name: "Translate imported subtitles locally",
          exact: true,
        })
        .click();
      await page
        .getByRole("alert")
        .filter({
          hasText:
            /Local transcription could not finish|local speech worker could not start/,
        })
        .waitFor({ timeout: 45000 });
      await context.unroute("**/models/manifest.json");
      await page
        .getByRole("button", { name: "Replay line", exact: true })
        .waitFor();
    },
  );
  await check(
    "phrase notebook displays saved context rather than a loading placeholder",
    async () => {
      await library(page, "Phrase notebook");
      await page
        .getByRole("heading", { name: "Phrase notebook", exact: true })
        .waitFor();
      assert.match(await page.locator("main").innerText(), /Order at a café/);
    },
  );
  await check(
    "phrase recall hides its notebook answer and delays a revealed model",
    async () => {
      const phrase = (await stored(page)).phrasebook.find(
        (p) => p.lang === "fr",
      );
      await page
        .getByRole("button", { name: /^Recall \d+ ready phrase/ })
        .click();
      assert(!(await page.locator("main").innerText()).includes(phrase.text));
      await page
        .getByRole("button", { name: "Show model", exact: true })
        .click();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      assert(
        (await stored(page)).phrasebook.find((p) => p.id === phrase.id).card
          .readyAt > Date.now(),
      );
    },
  );
  await check(
    "unavailable writing assessment never reports Clean or saves a 100 score",
    async () => {
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Language journal", exact: true })
        .click();
      await page
        .getByLabel("Your own words", { exact: true })
        .fill("Je suis aller au marché.");
      await page
        .getByRole("button", { name: "Check grammar", exact: true })
        .click();
      await page.getByText("Not fully assessed", { exact: true }).waitFor();
      assert.equal(await page.getByText("Clean", { exact: true }).count(), 0);
      await page
        .getByRole("button", { name: "Save and revisit tomorrow", exact: true })
        .click();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      assert.equal((await stored(page)).journal[0].accuracy, null);
    },
  );
  await check(
    "a draft remains after reload before explicit journal save",
    async () => {
      await page
        .getByLabel("Your own words", { exact: true })
        .fill("Un brouillon personnel.");
      await page.reload({ waitUntil: "domcontentloaded" });
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Language journal", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Your language journal", exact: true })
        .waitFor();
      assert.equal(
        await page.getByLabel("Your own words", { exact: true }).inputValue(),
        "Un brouillon personnel.",
      );
    },
  );
  await check(
    "voice recording stores a local playable blob and releases capture",
    async () => {
      await page
        .getByRole("button", { name: "Record a voice note", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Stop recording", exact: true })
        .waitFor();
      await delay(500);
      await page
        .getByRole("button", { name: "Stop recording", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Record a voice note", exact: true })
        .waitFor();
      await page.locator('audio[aria-label="Your recording"]').waitFor();
      assert.match(
        await page
          .locator('audio[aria-label="Your recording"]')
          .getAttribute("src"),
        /^blob:/,
      );
    },
  );
  await check(
    "journal photos and voice notes survive reload and can be removed",
    async () => {
      const pixels = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        canvas.getContext("2d").fillRect(0, 0, 2, 2);
        return canvas.toDataURL("image/png").split(",")[1];
      });
      await page
        .getByLabel("Attach a photo to describe", { exact: true })
        .setInputFiles({
          name: "scene.png",
          mimeType: "image/png",
          buffer: Buffer.from(pixels, "base64"),
        });
      await page
        .getByRole("img", { name: "Your journal photo", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Save and revisit tomorrow", exact: true })
        .click();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const entry = (await stored(page)).journal[0];
      assert(entry.photo && entry.recording);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Language journal", exact: true })
        .click();
      await page
        .getByRole("img", {
          name: "Your photo for this journal entry",
          exact: true,
        })
        .waitFor();
      await page.locator('audio[aria-label="Your recording"]').waitFor();
      await page
        .getByRole("button", {
          name: "Remove this photo from this device",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: "Delete this recording from this device",
          exact: true,
        })
        .click();
      await page
        .getByRole("img", {
          name: "Your photo for this journal entry",
          exact: true,
        })
        .waitFor({ state: "detached" });
      await page
        .locator('audio[aria-label="Your recording"]')
        .waitFor({ state: "detached" });
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const cleared = (await stored(page)).journal[0];
      assert.equal(cleared.photo, null);
      assert.equal(cleared.recording, null);
      const missing = await page.evaluate(async (entry) => {
        const { storage } = await import("/src/lib/storage.js");
        return [
          await storage.get("photo:" + entry.photo),
          await storage.get("recording:" + entry.recording),
        ];
      }, entry);
      assert.deepEqual(missing, [null, null]);
    },
  );
  await check(
    "edited journal text cannot inherit an older in-flight grammar score",
    async () => {
      await context.unroute("https://api.languagetool.org/**");
      let heldRoute;
      let gotRequest;
      const arrived = new Promise((resolve) => (gotRequest = resolve));
      await context.route("https://api.languagetool.org/**", (route) => {
        heldRoute = route;
        gotRequest();
      });
      await page
        .getByLabel("Your own words", { exact: true })
        .fill("Je suis à Paris.");
      await page
        .getByRole("button", { name: "Check grammar", exact: true })
        .click();
      await arrived;
      await page
        .getByLabel("Your own words", { exact: true })
        .fill("Je suis aller ailleurs.");
      await heldRoute.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ matches: [], language: { code: "fr" } }),
      });
      await page
        .getByRole("button", { name: "Save and revisit tomorrow", exact: true })
        .click();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const entry = (await stored(page)).journal[0];
      assert.equal(entry.text, "Je suis aller ailleurs.");
      assert.equal(entry.accuracy, null);
      assert.equal(entry.assessment.verified, false);
      await context.unroute("https://api.languagetool.org/**");
      await context.route("https://api.languagetool.org/**", (route) =>
        route.abort(),
      );
    },
  );
  await check(
    "a microphone granted after navigation releases all its tracks",
    async () => {
      await page.evaluate(() => {
        window.originalMic = navigator.mediaDevices.getUserMedia.bind(
          navigator.mediaDevices,
        );
        navigator.mediaDevices.getUserMedia = async (constraints) => {
          const stream = await window.originalMic(constraints);
          window.delayedStream = stream;
          await new Promise((resolve) => (window.releaseMic = resolve));
          return stream;
        };
      });
      await page
        .getByRole("button", { name: "Record a voice note", exact: true })
        .click();
      await page.waitForFunction(() => typeof window.releaseMic === "function");
      await page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Practice library", exact: true })
        .click();
      await page.evaluate(() => window.releaseMic());
      await page.waitForFunction(() =>
        window.delayedStream
          .getTracks()
          .every((track) => track.readyState === "ended"),
      );
      await page.evaluate(() => {
        navigator.mediaDevices.getUserMedia = window.originalMic;
      });
    },
  );
  await check(
    "human recordings play and keep attribution when opened in Media Studio",
    async () => {
      await library(page, "Human listening library");
      await page
        .getByRole("button", { name: /^Le Corbeau et le Renard/ })
        .click();
      await page.waitForFunction(
        () => document.querySelector("main audio")?.readyState >= 2,
      );
      assert(
        (await page.locator("main audio").evaluate((a) => a.duration)) > 40,
      );
      await page
        .getByRole("button", {
          name: "Try gist and detail prompts",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "To get the crow’s cheese", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Study it in Media Studio", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Le Corbeau et le Renard", exact: true })
        .waitFor();
      await page
        .getByRole("link", { name: "Recording source", exact: true })
        .waitFor();
      assert.match(
        await page
          .getByRole("link", { name: "Recording source", exact: true })
          .getAttribute("href"),
        /commons.wikimedia.org/,
      );
    },
  );
  await check(
    "device file cleanup preserves saved captions and notes",
    async () => {
      await library(page, "Files on this device");
      await page
        .getByRole("heading", { name: "Files on this device", exact: true })
        .waitFor();
      const row = page
        .locator("section")
        .filter({
          has: page.getByRole("heading", { name: "fr-cafe.mp3", exact: true }),
        })
        .last();
      await row
        .getByRole("button", {
          name: "Delete file from this device",
          exact: true,
        })
        .click();
      await page
        .getByText(
          "Device file deleted. Captions and learning history remain.",
          { exact: true },
        )
        .waitFor();
      await page.getByText("All changes saved", { exact: false }).waitFor();
      const session = Object.values((await stored(page)).mediaSessions)[0];
      assert.equal(session.hasMedia, false);
      assert.equal(session.notes, "A polite café request.");
      assert(session.cues.length === 2);
    },
  );
  await check(
    "local model installation metadata survives an offline connection",
    async () => {
      const { MODEL_CATALOG } = await import("../src/data/model-catalog.js");
      const installed = {
        version: 1,
        models: MODEL_CATALOG.map(({ id, revision }) => ({ id, revision })),
      };
      const modelContext = await browser.newContext();
      await modelContext.route("**/models/manifest.json", (route) =>
        route.fulfill({ json: installed }),
      );
      const modelPage = await modelContext.newPage();
      await modelPage.goto(origin + "/scripts/fixtures/video.html");
      const first = await modelPage.evaluate(async () => {
        const { localModelManifest } = await import("/src/lib/local-models.js");
        window.readLocalManifest = localModelManifest;
        return localModelManifest();
      });
      assert.deepEqual(first, installed);
      await modelContext.unroute("**/models/manifest.json");
      await modelContext.setOffline(true);
      assert.deepEqual(
        await modelPage.evaluate(() => window.readLocalManifest()),
        installed,
      );
      await modelContext.close();
    },
  );
  await check("all new activity views load without render errors", async () => {
    for (const [name, heading] of [
      ["Repair a word", "Repair a difficult word"],
      ["Sound contrasts", "Sound contrasts"],
      ["Retelling practice", "Retell it in your own words"],
      ["Contrast clinic", "Contrast clinic"],
      ["Unseen challenges", "Unseen challenges"],
      ["Reading shelf", "Read for pleasure and meaning"],
      ["Human listening library", "Human listening library"],
      ["Browser video extension", "Study video in your browser"],
      ["Files on this device", "Files on this device"],
      ["Skill passport", "Your skill passport"],
      ["Backups & device transfer", "Backups and device transfer"],
    ]) {
      await library(page, name);
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    }
  });
  await check(
    "backup merging is idempotent through the real file-import flow",
    async () => {
      const data = await stored(page);
      const target = page.getByLabel("Choose a progress backup", {
        exact: true,
      });
      for (let i = 0; i < 2; i++) {
        await target.setInputFiles({
          name: "backup.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(data)),
        });
        await page
          .getByRole("button", { name: "Merge this backup", exact: true })
          .click();
        await page
          .getByText(
            "Backup merged. Identical review events are counted once.",
            { exact: true },
          )
          .waitFor();
      }
      await page.getByText("All changes saved", { exact: false }).waitFor();
      assert.deepEqual((await stored(page)).history, data.history);
    },
  );
  await check("reading lookup is keyboard accessible", async () => {
    await library(page, "Reading Room");
    await page
      .locator("main")
      .getByRole("button")
      .filter({ hasText: "À la boulangerie" })
      .click();
    const words = page
      .getByRole("group", {
        name: "Passage. Arrow keys select a word; Enter opens its definition.",
      })
      .first();
    await words.focus();
    await words.press("ArrowRight");
    await words.press("Enter");
    assert(await words.evaluate((el) => document.activeElement === el));
  });
  await check(
    "small-screen navigation and text scaling do not clip interactive controls",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page
        .getByRole("button", { name: "Today", exact: true })
        .last()
        .click();
      await page.getByRole("heading", { name: "Today in French" }).waitFor();
      await page
        .getByRole("button", { name: "Largest text", exact: true })
        .click();
      const overflow = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "main button,main input,main select,main textarea",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > innerWidth + 1 || r.left < 0);
          })
          .map((el) => el.textContent),
      );
      assert.deepEqual(overflow, []);
      await page
        .getByRole("button", { name: "Normal text", exact: true })
        .click();
    },
  );
  await context.close();
  const recovery = await newPage();
  const dueCard = {
    ease: 2.3,
    reps: 2,
    interval: 3,
    lapses: 0,
    due: new Date().toISOString().slice(0, 10),
    lastSeen: null,
  };
  await seed(recovery.page, { "fr:A1:bonjour": dueCard });
  await check(
    "answered review survives a reload and is scheduled exactly once",
    async () => {
      await recovery.page
        .getByRole("button", { name: "Start today’s practice", exact: true })
        .click();
      await recovery.page
        .locator('main input[type="text"]')
        .first()
        .fill("incorrect");
      await recovery.page
        .locator("main")
        .getByRole("button", { name: "Check", exact: true })
        .click();
      await recovery.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      assert((await stored(recovery.page)).pendingSession);
      await recovery.page.reload({ waitUntil: "domcontentloaded" });
      await recovery.page.getByText(/Recovered 1 answered cards/).waitFor();
      await recovery.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      assert.equal(
        (await stored(recovery.page)).cards["fr:A1:bonjour"].lapses,
        1,
      );
      await recovery.page.reload({ waitUntil: "domcontentloaded" });
      await recovery.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      assert.equal(
        (await stored(recovery.page)).cards["fr:A1:bonjour"].lapses,
        1,
      );
    },
  );
  await seed(recovery.page, { "fr:A1:bonjour": dueCard });
  await check(
    "language changes commit under the original language",
    async () => {
      await recovery.page
        .getByRole("button", { name: "Start today’s practice", exact: true })
        .click();
      await recovery.page
        .locator('main input[type="text"]')
        .first()
        .fill("incorrect");
      await recovery.page
        .locator("main")
        .getByRole("button", { name: "Check", exact: true })
        .click();
      await recovery.page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "German", exact: true })
        .click();
      await recovery.page
        .getByRole("heading", { name: "Today in German" })
        .waitFor();
      await recovery.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      const saved = await stored(recovery.page);
      assert.equal(saved.cards["fr:A1:bonjour"].lapses, 1);
      assert(
        !Object.keys(saved.cards).some((id) => id.startsWith("de:A1:bonjour")),
      );
    },
  );
  await check(
    "storage faults are visible and retry preserves work",
    async () => {
      await recovery.page.evaluate(() => {
        window.originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = () => {
          throw new Error("Simulated quota failure");
        };
      });
      await recovery.page
        .getByLabel("Practice time", { exact: true })
        .selectOption("10");
      await recovery.page
        .getByRole("alert")
        .filter({ hasText: "Progress could not be saved" })
        .waitFor();
      await recovery.page.evaluate(() => {
        IDBObjectStore.prototype.put = window.originalPut;
      });
      await recovery.page
        .getByRole("button", { name: "Retry saving", exact: true })
        .click();
      await recovery.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      assert.equal((await stored(recovery.page)).preferences.minutes, 10);
    },
  );
  await recovery.context.close();
  const overlayContext = await browser.newContext(),
    overlayPage = await overlayContext.newPage();
  await check(
    "browser extension overlays video and exports compatible phrases",
    async () => {
      const video = execFileSync("ffmpeg", [
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=320x180:r=10",
        "-i",
        "public/listen/missions/fr-cafe.mp3",
        "-t",
        "3",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-f",
        "mp4",
        "-movflags",
        "frag_keyframe+empty_moov",
        "pipe:1",
      ]);
      await overlayContext.route(
        origin + "/extension-test-video.mp4",
        (route) =>
          route.fulfill({ status: 200, contentType: "video/mp4", body: video }),
      );
      await overlayPage.goto(origin + "/scripts/fixtures/video.html");
      await overlayPage.waitForFunction(
        () => document.querySelector("video").readyState >= 2,
      );
      await overlayPage.evaluate(() => {
        window.chrome = window.chrome || {};
        window.chrome.runtime = {
          onMessage: { addListener: (fn) => (window.overlayMessage = fn) },
        };
      });
      await overlayPage.addScriptTag({
        content: execFileSync(
          "unzip",
          ["-p", "public/extensions/vocab-drawer-browser.zip", "overlay.js"],
          { encoding: "utf8" },
        ),
      });
      const opened = await overlayPage.evaluate(() => {
        let result;
        window.overlayMessage(
          {
            type: "vocabdrawer:open",
            lang: "fr",
            cues: [
              { id: "1", start: 0, end: 1, text: "Bonjour." },
              { id: "2", start: 1, end: 3, text: "Je voudrais un café." },
            ],
            english: [
              { start: 0, end: 1, text: "Hello." },
              { start: 1, end: 3, text: "I would like a coffee." },
            ],
          },
          {},
          (r) => (result = r),
        );
        return result;
      });
      assert.equal(opened.ok, true);
      await overlayPage
        .getByRole("button", { name: "Replay line", exact: true })
        .click();
      await overlayPage
        .getByRole("button", { name: "Loop line: off", exact: true })
        .click();
      await overlayPage.locator("video").evaluate((v) => {
        v.pause();
        v.currentTime = 1.15;
        v.dispatchEvent(new Event("timeupdate"));
      });
      assert(
        (await overlayPage.locator("video").evaluate((v) => v.currentTime)) <
          0.1,
      );
      await overlayPage
        .getByRole("button", { name: "Save this phrase", exact: true })
        .click();
      const downloading = overlayPage.waitForEvent("download");
      await overlayPage
        .getByRole("button", {
          name: "Export phrases to Vocab Drawer",
          exact: true,
        })
        .click();
      const file = await downloading;
      const data = JSON.parse(readFileSync(await file.path(), "utf8"));
      assert.equal(data.phrasebook[0].text, "Bonjour.");
      assert.equal(data.phrasebook[0].translation, "Hello.");
      const valid = await overlayPage.evaluate(async (data) => {
        const { validateProgress } = await import("/src/lib/progress.js");
        return Boolean(validateProgress(data));
      }, data);
      assert.equal(valid, true);
      await overlayPage
        .getByRole("button", { name: "Close study panel", exact: true })
        .click();
      assert.equal(
        await overlayPage
          .getByRole("button", { name: "Replay line", exact: true })
          .count(),
        0,
      );
    },
  );
  await overlayContext.close();
  const clinic = await newPage();
  await check(
    "the contrast clinic teaches from a saved personal mistake",
    async () => {
      await clinic.page.evaluate(async () => {
        const { storage } = await import("/src/lib/storage.js");
        const { createProgress } = await import("/src/lib/progress.js");
        const p = createProgress();
        p.errors = {
          "fr:lt:GRAMMAIRE": {
            lang: "fr",
            rule: "lt:GRAMMAIRE",
            count: 3,
            first: "2026-10-14",
            last: "2026-10-14",
            examples: [
              {
                text: "Je suis aller au marché.",
                wrong: "aller",
                fix: "allé",
                at: "2026-10-14",
              },
            ],
          },
        };
        await storage.set("vocabdrawer:progress:v1", JSON.stringify(p));
      });
      await clinic.page.reload({ waitUntil: "domcontentloaded" });
      await clinic.page
        .getByRole("heading", { name: "Today in French" })
        .waitFor();
      await library(clinic.page, "Contrast clinic");
      await clinic.page
        .getByRole("heading", { name: /^Your writing:/ })
        .waitFor();
      assert.match(
        await clinic.page.locator("main").innerText(),
        /Je suis aller au marché/,
      );
      await clinic.page
        .getByRole("button", {
          name: "Compare with the saved suggestion",
          exact: true,
        })
        .click();
      assert.match(
        await clinic.page.locator("main").innerText(),
        /Je suis allé au marché/,
      );
    },
  );
  await clinic.context.close();
  const guarded = await newPage();
  await check(
    "a second tab cannot overwrite the active learning profile",
    async () => {
      const second = await guarded.context.newPage();
      await second.goto(origin);
      await second
        .getByRole("heading", {
          name: "Progress is open in another tab",
          exact: true,
        })
        .waitFor();
      await guarded.page
        .getByLabel("Practice time", { exact: true })
        .selectOption("10");
      await guarded.page
        .getByText("All changes saved", { exact: false })
        .waitFor();
      assert.equal((await stored(guarded.page)).preferences.minutes, 10);
      await guarded.page.close();
      await second
        .getByRole("button", { name: "Reload this tab", exact: true })
        .click();
      await second
        .getByRole("heading", { name: "Today in French", exact: true })
        .waitFor();
      assert.equal(
        await second.getByLabel("Practice time", { exact: true }).inputValue(),
        "10",
      );
    },
  );
  await guarded.context.close();
  const cas = await newPage();
  await check("atomic progress writes refuse an outdated profile", async () => {
    const outcome = await cas.page.evaluate(async () => {
      const { storage } = await import("/src/lib/storage.js");
      await storage.set("cas-probe", "first");
      const second = await storage.compareAndSet(
        "cas-probe",
        "first",
        "second",
      );
      const stale = await storage.compareAndSet("cas-probe", "first", "stale");
      const value = (await storage.get("cas-probe")).value;
      await storage.remove("cas-probe");
      return { second, stale, value };
    });
    assert.deepEqual(outcome, { second: true, stale: false, value: "second" });
  });
  await cas.context.close();
  const timed = await newPage();
  await timed.page.clock.install({ time: new Date() });
  await seed(timed.page, {
    "fr:A1:bonjour": {
      ...dueCard,
      reps: 0,
      interval: 0,
      learning: 1,
      seenAt: Date.now(),
      readyAt: Date.now() + 600000,
    },
  });
  await check(
    "second-look readiness refreshes without answering another question",
    async () => {
      assert.match(
        await timed.page.locator("main").innerText(),
        /second-look review/,
      );
      await timed.page.clock.fastForward(11 * 60 * 1000);
      await timed.page.getByRole("heading", { name: /Recall 1 due/ }).waitFor();
    },
  );
  await timed.context.close();
  const accessible = await newPage();
  await check(
    "sampled new and legacy surfaces pass automated WCAG checks",
    async () => {
      const violations = [];
      const pages = [
        null,
        "Practical missions",
        "Media Studio",
        "Language journal",
        "Repair a word",
        "Sound contrasts",
        "Grammar & Verbs",
        "My Words",
        "Word Roots",
        "Dictation & Read-aloud",
      ];
      for (const item of pages) {
        if (item) await library(accessible.page, item);
        await accessible.page.addScriptTag({ content: axe });
        const report = await accessible.page.evaluate(() =>
          axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          }),
        );
        for (const issue of report.violations)
          violations.push({
            page: item || "Today",
            id: issue.id,
            examples: issue.nodes.slice(0, 3).map((n) => n.html),
          });
      }
      assert.deepEqual(violations, []);
      await accessible.page.emulateMedia({ colorScheme: "dark" });
      await accessible.page
        .locator('nav[aria-label="Sections"]')
        .getByRole("button", { name: "Today", exact: true })
        .click();
      await accessible.page
        .getByRole("heading", { name: "Today in French" })
        .waitFor();
      const dark = await accessible.page.evaluate(() =>
        axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        }),
      );
      assert.deepEqual(
        dark.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.html),
        })),
        [],
      );
      await accessible.page.emulateMedia({ colorScheme: "light" });
    },
  );
  await accessible.context.close();
  const preview = launch([
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(previewPort),
    "--strictPort",
  ]);
  await ready(`http://127.0.0.1:${previewPort}`, preview);
  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  offlinePage.setDefaultTimeout(15000);
  offlinePage.on("pageerror", (e) => pageErrors.push(e.message));
  await check(
    "downloaded mission audio survives a production offline reload",
    async () => {
      await offlinePage.goto(`http://127.0.0.1:${previewPort}`, {
        waitUntil: "domcontentloaded",
      });
      await offlinePage
        .getByRole("heading", { name: "Today in French" })
        .waitFor();
      await offlinePage.evaluate(() => navigator.serviceWorker.ready);
      await offlinePage.waitForFunction(
        () => !!navigator.serviceWorker.controller,
      );
      await offlinePage
        .getByRole("button", { name: "Start today’s practice", exact: true })
        .click();
      await offlinePage
        .getByRole("heading", { name: "Meet someone", exact: true })
        .waitFor();
      await offlinePage
        .getByRole("button", { name: "Download this lesson", exact: true })
        .click();
      await offlinePage.getByText(/Ready offline/).waitFor();
      await offlineContext.setOffline(true);
      await offlinePage.reload({ waitUntil: "domcontentloaded" });
      await offlinePage
        .getByRole("heading", { name: "Today in French" })
        .waitFor();
      const response = await offlinePage.evaluate(async () => {
        const r = await fetch("/listen/missions/fr-introductions.mp3");
        return { status: r.status, bytes: (await r.arrayBuffer()).byteLength };
      });
      assert.equal(response.status, 200);
      assert(response.bytes > 1000);
    },
  );
  await offlineContext.close();
  assert.deepEqual(pageErrors, [], "Uncaught browser errors");
  mkdirSync("/tmp/vocab-browser-report", { recursive: true });
  writeFileSync(
    "/tmp/vocab-browser-report/results.json",
    JSON.stringify({ results, pageErrors }, null, 2),
  );
  console.log(`${results.length} browser checks passed.`);
} catch (error) {
  mkdirSync("/tmp/vocab-browser-report", { recursive: true });
  writeFileSync(
    "/tmp/vocab-browser-report/failure.json",
    JSON.stringify({ pageErrors, results }, null, 2),
  );
  console.error("Page errors:", pageErrors);
  for (const [i, p] of (
    browser?.contexts().flatMap((c) => c.pages()) || []
  ).entries()) {
    try {
      writeFileSync(
        `/tmp/vocab-browser-report/failure-${i}.txt`,
        await p.locator("body").innerText(),
      );
      await p.screenshot({
        path: `/tmp/vocab-browser-report/failure-${i}.png`,
        fullPage: true,
      });
    } catch {}
  }
  throw error;
} finally {
  await browser?.close();
  for (const child of children) child.kill("SIGTERM");
}
