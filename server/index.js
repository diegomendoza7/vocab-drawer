/* Local API proxy.
 *
 * Holds the Anthropic API key server-side. The browser never sees it.
 *
 * The original app called api.anthropic.com directly from the page with no
 * auth headers at all, relying on the artifact host to inject them. Doing that
 * for real would mean either a 401 (no key) or shipping your key to every
 * visitor (key in client bundle). Hence this process.
 */

import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

/* Deliberately API_PORT, not PORT: some launchers inject PORT to tell the
 * *web* server which port to use, and reusing it here makes both servers
 * fight over one port while the proxy points at itself. */
const PORT = Number(process.env.API_PORT) || 8787;

/* Everything except Text Import works without a key, so a missing key is a
 * warning rather than a fatal error — the endpoints below return 503 with a
 * clear message instead of the process refusing to boot. */
const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY);

// Reads ANTHROPIC_API_KEY from the environment.
const client = HAS_KEY ? new Anthropic() : null;

function requireKey(res) {
  if (HAS_KEY) return true;
  res.status(503).json({
    error: "No API key configured. Copy .env.example to .env, add your key, and restart.",
  });
  return false;
}

/* Model per job.
 *
 * gloss/translate are schema-constrained extraction over single words and
 * sentences, run in bulk during text import and word seeding — Haiku is both
 * accurate enough and ~5x cheaper here. `prose` is reserved for generated
 * reading passages and grammar notes, where writing quality is the point.
 * Translation is mechanical; move it to PROSE if the output disappoints. */
const MODELS = {
  gloss: "claude-haiku-4-5",
  translate: "claude-haiku-4-5",
  prose: "claude-sonnet-5",
};

const LANG_NAME = { fr: "French", de: "German" };

const app = express();
app.use(express.json({ limit: "1mb" }));

/* Structured output schema for word lookup.
 *
 * `g` is the der/die/das gender that drives the app's colour coding. Pinning
 * it to an enum here means a malformed or missing gender is impossible —
 * the previous parser sliced JSON out of a prose reply between the first "["
 * and last "]", and returned [] on any failure, silently. */
const GLOSS_SCHEMA = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          w: { type: "string", description: "the form exactly as given" },
          lemma: { type: "string", description: "dictionary form" },
          en: { type: "string", description: "English gloss, max 6 words" },
          g: {
            anyOf: [
              { type: "string", enum: ["der", "die", "das"] },
              { type: "null" },
            ],
            description: "gender for German nouns, null otherwise",
          },
          pos: { type: "string", description: "short part of speech" },
        },
        required: ["w", "lemma", "en", "g", "pos"],
        additionalProperties: false,
      },
    },
  },
  required: ["words"],
  additionalProperties: false,
};

function firstText(message) {
  const block = message.content.find((b) => b.type === "text");
  return block ? block.text : "";
}

/** Surface refusals as errors rather than letting them parse as empty results. */
function assertUsable(message) {
  if (message.stop_reason === "refusal") {
    throw new Error("The model declined this request.");
  }
}

app.post("/api/gloss", async (req, res) => {
  if (!requireKey(res)) return;
  const { lang, words } = req.body ?? {};
  if (!LANG_NAME[lang] || !Array.isArray(words) || !words.length) {
    res.status(400).json({ error: "Expected { lang: 'fr'|'de', words: [...] }" });
    return;
  }

  const langName = LANG_NAME[lang];
  try {
    const message = await client.messages.create({
      model: MODELS.gloss,
      max_tokens: 8000,
      output_config: { format: { type: "json_schema", schema: GLOSS_SCHEMA } },
      messages: [
        {
          role: "user",
          content:
            `You are a ${langName}-English dictionary. For each ${langName} word form ` +
            `below, give its dictionary (lemma) form and a short English gloss. ` +
            `Return one entry per form, in the same order.\n\nForms: ${words.join(", ")}`,
        },
      ],
    });
    assertUsable(message);
    res.json(JSON.parse(firstText(message)));
  } catch (err) {
    console.error("[gloss]", err.message);
    res.status(502).json({ error: err.message });
  }
});

app.post("/api/translate", async (req, res) => {
  if (!requireKey(res)) return;
  const { lang, sentence } = req.body ?? {};
  if (!LANG_NAME[lang] || typeof sentence !== "string" || !sentence.trim()) {
    res.status(400).json({ error: "Expected { lang: 'fr'|'de', sentence: '...' }" });
    return;
  }

  try {
    const message = await client.messages.create({
      model: MODELS.translate,
      max_tokens: 1000,
      system:
        "Translate the user's sentence into natural English. " +
        "Reply with only the translation — no quotes, no commentary.",
      messages: [{ role: "user", content: sentence }],
    });
    assertUsable(message);
    res.json({ text: firstText(message).trim().replace(/^["']|["']$/g, "") });
  } catch (err) {
    console.error("[translate]", err.message);
    res.status(502).json({ error: err.message });
  }
});

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, hasKey: HAS_KEY, models: MODELS }),
);

app.listen(PORT, () => {
  console.log(`  API proxy   http://localhost:${PORT}`);
  console.log(`  gloss       ${MODELS.gloss}`);
  console.log(`  prose       ${MODELS.prose}`);
  if (!HAS_KEY) {
    console.log(
      "\n  No ANTHROPIC_API_KEY set — Text Import is disabled.\n" +
        "  Everything else works. To enable it: cp .env.example .env, add your key, restart.\n",
    );
  }
});
