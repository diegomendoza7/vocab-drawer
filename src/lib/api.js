/* Client-side API adapter.
 *
 * Replaces the original `callClaude`, which POSTed straight to
 * api.anthropic.com with only a Content-Type header — no `x-api-key` and no
 * `anthropic-version`. That only ever worked because the artifact host
 * intercepted the request and injected credentials.
 *
 * Here the browser talks to our own proxy instead. The API key stays on the
 * server and is never shipped to the client.
 */

const API_BASE = "/api";

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (cause) {
    throw new Error("Could not reach the local API server.", { cause });
  }

  if (!res.ok) {
    // The proxy sends { error } on failure; fall back to the status line.
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error || `API ${res.status}`);
  }
  return res.json();
}

/**
 * Look up a batch of word forms.
 *
 * Returns [{ w, lemma, en, g, pos }]. `g` is "der" | "die" | "das" for German
 * nouns and null otherwise — the server pins it to that enum via structured
 * outputs, so it can no longer come back malformed or missing.
 */
export async function glossBatch(lang, words) {
  if (!words.length) return [];
  const { words: out } = await post("/gloss", { lang, words });
  return out;
}

/**
 * Second-opinion a batch of the learner's own words.
 *
 * Takes [{ t, e?, g?, s? }] — the term plus whatever the learner supplied —
 * and returns [{ t, verdict, en, g, pos, note, s, ba, se }], one per input, in
 * order, with `t` echoed back so the caller can re-pair even if order slips.
 *
 * There is no `b` in the response: the fill-in-the-blank sentence is built on
 * the client from `s` and `ba`, so a blank that failed to replace anything is
 * impossible rather than merely unlikely.
 */
export async function verifyBatch(lang, level, words) {
  if (!words.length) return { rows: [], model: "" };
  const { words: rows, model } = await post("/verify", { lang, level, words });
  return { rows, model };
}

/** Translate one sentence into English. */
export async function translate(lang, sentence) {
  const { text } = await post("/translate", { lang, sentence });
  return text;
}
