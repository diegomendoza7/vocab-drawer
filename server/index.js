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
 * Translation is mechanical; move it to PROSE if the output disappoints.
 *
 * `verify` second-opinions the learner's own words. It deliberately does NOT
 * share a model with `gloss`: asking the same model to check its own output
 * gets you agreement, not verification. It also writes the example sentence,
 * which is prose work. Low volume — a few dozen words per import. */
const MODELS = {
  gloss: "claude-haiku-4-5",
  translate: "claude-haiku-4-5",
  prose: "claude-sonnet-5",
  verify: "claude-sonnet-5",
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

/* Structured output schema for the verification pass.
 *
 * There is deliberately no `b` (cloze) field. The client builds the blank
 * itself from `s` and `ba`, because a cloze that failed to blank its answer
 * shows the learner the very word it is asking for — and that failure is
 * invisible in a schema, which can only require that a string came back. */
const VERIFY_SCHEMA = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          t: { type: "string", description: "the term exactly as given, echoed back for pairing" },
          verdict: {
            type: "string",
            enum: ["ok", "needs-fix", "ambiguous"],
            description: "assessment of the learner's translation",
          },
          en: { type: "string", description: "correct English gloss, max 6 words, '/' between alternatives" },
          g: {
            anyOf: [{ type: "string", enum: ["der", "die", "das"] }, { type: "null" }],
            description: "gender for German nouns, null otherwise",
          },
          pos: { type: "string", description: "short part of speech" },
          note: { type: "string", description: "one short sentence explaining the problem; empty when verdict is ok" },
          s: { type: "string", description: "example sentence in the target language containing the word" },
          ba: { type: "string", description: "the surface form of the word exactly as it appears in s" },
          se: { type: "string", description: "English translation of s" },
        },
        required: ["t", "verdict", "en", "g", "pos", "note", "s", "ba", "se"],
        additionalProperties: false,
      },
    },
  },
  required: ["words"],
  additionalProperties: false,
};

/* Register for the generated example sentence. "IMP" is the pseudo-level the
 * app files the learner's own words under. */
const CEFR_HINT = {
  A1: "very simple, present tense, everyday vocabulary",
  A2: "simple, about common everyday situations",
  B1: "everyday register, some subordinate clauses",
  B2: "natural adult register, idiomatic where it fits",
  IMP: "natural, short, adult register",
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

/* Second-opinion the learner's own words.
 *
 * Verification and example-sentence writing happen in one call on purpose: the
 * sentence has to illustrate the *verified* sense. Split them and a corrected
 * word gets a sentence written for the meaning the check just rejected. */
app.post("/api/verify", async (req, res) => {
  if (!requireKey(res)) return;
  const { lang, level, words } = req.body ?? {};
  if (!LANG_NAME[lang] || !Array.isArray(words) || !words.length || words.length > 25) {
    res.status(400).json({ error: "Expected { lang: 'fr'|'de', words: [...] } with 1-25 words" });
    return;
  }

  const langName = LANG_NAME[lang];
  const register = CEFR_HINT[level] || CEFR_HINT.IMP;
  try {
    const message = await client.messages.create({
      model: MODELS.verify,
      max_tokens: 8000,
      output_config: { format: { type: "json_schema", schema: VERIFY_SCHEMA } },
      system:
        `You are a meticulous ${langName}-English lexicographer checking a learner's own vocabulary list. ` +
        `Each entry has a ${langName} term and, sometimes, the learner's own English translation, gender, or example sentence.\n\n` +
        `For each entry:\n` +
        `- Echo the term in "t" exactly as given. Return one entry per input, in the same order.\n` +
        `- Judge the learner's translation. "ok" means it is accurate. "needs-fix" means it is wrong or ` +
        `misleading. "ambiguous" means it is defensible but the word has other common senses they should know about.\n` +
        `- Never return "ok" while putting a different meaning in "en". If you are proposing a change, say so in the verdict.\n` +
        `- When the learner gave no translation, supply one and use verdict "ok".\n` +
        `- "en" is always your best gloss, max 6 words, "/" between alternatives.\n` +
        `- "g" is der/die/das for German nouns and null for everything else — including German verbs and ` +
        `adjectives, and every French word.\n` +
        `- "note" is one short sentence for "needs-fix" and "ambiguous", and "" for "ok".\n` +
        `- Write "s": one short ${langName} sentence (${register}) that actually contains the word. ` +
        `If the learner supplied an example sentence, keep it verbatim instead of writing your own.\n` +
        `- "ba" must be copied character-for-character out of "s" — the exact inflected surface form as it ` +
        `appears there, with the same capitalization. Do not give the dictionary form unless that is what "s" contains.\n` +
        `- "se" is a natural English translation of "s".`,
      messages: [{ role: "user", content: JSON.stringify({ words }) }],
    });
    assertUsable(message);
    // The model id rides along so a stored verdict records what checked it —
    // hardcoding that in the client is how it drifts from this table.
    res.json({ ...JSON.parse(firstText(message)), model: MODELS.verify });
  } catch (err) {
    console.error("[verify]", err.message);
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
  console.log(`  verify      ${MODELS.verify}`);
  console.log(`  prose       ${MODELS.prose}`);
  if (!HAS_KEY) {
    console.log(
      "\n  No ANTHROPIC_API_KEY set — Text Import is disabled.\n" +
        "  Everything else works. To enable it: cp .env.example .env, add your key, restart.\n",
    );
  }
});
