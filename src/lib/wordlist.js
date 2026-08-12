/* Word-list parsing.
 *
 * Turns whatever the user pasted or uploaded into rows of
 * { term, translation, gender, example }. Pure string work with no React and no
 * app state, so it can be exercised directly with node.
 *
 * The one rule worth stating up front: the *term* must survive intact. A
 * missing translation is free to fix — the verification pass fills it in. A
 * corrupted term is not: it becomes a card you drill forever. Every ambiguous
 * case below resolves in favour of keeping the line whole.
 */

/* A frequency-list tail: "der 1049564". Also tolerates 1,049,564 and 1.5. */
const FREQ_TAIL = /^\d[\d.,]*$/;

const FIELD_ALIASES = {
  term: ["term", "word", "front", "t", "lemma", "target", "german", "french", "deutsch", "de", "fr", "vokabel", "mot", "wort"],
  translation: ["translation", "meaning", "back", "e", "en", "english", "gloss", "definition", "bedeutung", "traduction"],
  gender: ["gender", "g", "article", "artikel", "genus"],
  example: ["example", "sentence", "s", "context", "beispiel", "phrase", "satz"],
};

const SEPARATOR_NAMES = {
  tab: "\t", comma: ",", semicolon: ";", space: " ", pipe: "|", colon: ":",
};

export const FORMAT_LABELS = {
  tsv: "tab-separated (word → translation)",
  csv: "comma-separated (word → translation)",
  frequency: "word + frequency (frequencies ignored)",
  plain: "one word or phrase per line",
  json: "JSON",
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

/** Strip Anki's HTML without touching the DOM. */
export function stripHtml(s) {
  return String(s)
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\/\s*(div|p|li|tr)\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split one delimited line, honouring "quoted, fields" for real CSV. */
export function splitDelimited(line, delim) {
  // Anki never quotes tab fields, and quotes inside them are literal.
  if (delim === "\t") return line.split("\t").map((c) => c.trim());

  const cells = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }   // escaped ""
        else quoted = false;
      } else cur += ch;
    } else if (ch === '"' && cur.trim() === "") {
      quoted = true;
      cur = "";
    } else if (ch === delim) {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function aliasIndex(cells, kind) {
  const want = FIELD_ALIASES[kind];
  return cells.findIndex((c) => want.includes(c.trim().toLowerCase().replace(/[\s_-]/g, "")));
}

/** "der Hund" -> { gender: "der", term: "Hund" }. German only. */
export function extractGender(raw, lang) {
  const term = String(raw).trim();
  if (lang !== "de") return { term, gender: "" };

  let m = term.match(/^(der|die|das)\s+(.+)$/i);
  if (m) return { gender: m[1].toLowerCase(), term: m[2].trim() };

  // "Hund (der)" and "Hund, der" — both common in exported lists.
  m = term.match(/^(.+?)[\s,]*[(（]?(der|die|das)[)）]?$/i);
  if (m && m[1].trim()) return { gender: m[2].toLowerCase(), term: m[1].replace(/[\s,]+$/, "").trim() };

  return { term, gender: "" };
}

/* ------------------------------------------------------------------ */
/* Anki directives                                                     */
/* ------------------------------------------------------------------ */

/**
 * Read Anki's `#key:value` header.
 *
 * `#deck column:2` and friends matter more than they look: they declare that a
 * column holds metadata, which shifts everything after it. Skipping these
 * lines as comments and then mapping positionally makes the deck name your
 * vocabulary word.
 */
export function parseAnkiDirectives(lines) {
  const out = { separator: null, html: false, skipColumns: new Set(), count: 0 };
  for (const line of lines) {
    if (!line.startsWith("#")) break;
    out.count++;
    const m = line.slice(1).match(/^([^:]+):(.*)$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    const val = m[2].trim();

    if (key === "separator") {
      out.separator = SEPARATOR_NAMES[val.toLowerCase()] || (val.length === 1 ? val : null);
    } else if (key === "html") {
      out.html = val.toLowerCase() === "true";
    } else if (key.endsWith("column")) {
      // "notetype column", "deck column", "tags column", "guid column"
      const n = Number(val);
      if (Number.isInteger(n) && n > 0) out.skipColumns.add(n - 1);   // 1-based
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Format detection                                                    */
/* ------------------------------------------------------------------ */

/**
 * Decide the format for the file as a whole, never line by line.
 *
 * Per-line detection is how these parsers go wrong: one line containing a
 * comma flips that line to CSV while its neighbours stay plain, and the result
 * is a list half of whose terms are truncated.
 */
export function detectFormat(lines) {
  const n = lines.length;
  if (!n) return "plain";

  // TSV before CSV: Anki exports are tab-separated and routinely contain commas.
  if (lines.filter((l) => l.includes("\t")).length / n >= 0.6) return "tsv";
  if (lines.filter((l) => l.includes(",")).length / n >= 0.6) return "csv";

  let two = 0;
  let numericTail = 0;
  lines.forEach((l) => {
    const m = l.trim().match(/^(\S+)\s+(\S+)$/);
    if (!m) return;
    two++;
    if (FREQ_TAIL.test(m[2])) numericTail++;
  });
  if (two >= n * 0.6 && numericTail >= two * 0.8) return "frequency";

  return "plain";
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

function rowFromObject(obj, lang) {
  // Anki's JSON note export nests the actual content in `fields`.
  if (Array.isArray(obj.fields)) {
    return makeRow(stripHtml(obj.fields[0] ?? ""), stripHtml(obj.fields[1] ?? ""), "", "", lang);
  }
  const entries = Object.entries(obj);
  const pick = (kind) => {
    const want = FIELD_ALIASES[kind];
    const hit = entries.find(([k]) => want.includes(k.trim().toLowerCase().replace(/[\s_-]/g, "")));
    return hit ? String(hit[1] ?? "") : "";
  };
  return makeRow(pick("term"), pick("translation"), pick("gender"), pick("example"), lang);
}

/* ------------------------------------------------------------------ */
/* Row construction                                                    */
/* ------------------------------------------------------------------ */

function makeRow(rawTerm, translation, gender, example, lang) {
  const cleanTerm = String(rawTerm || "").trim();
  if (!cleanTerm) return null;

  const g = String(gender || "").trim().toLowerCase();
  const fromTerm = extractGender(cleanTerm, lang);

  return {
    term: fromTerm.term,
    translation: String(translation || "").trim(),
    // An explicit gender column wins over one parsed out of the term.
    gender: lang === "de" ? (["der", "die", "das"].includes(g) ? g : fromTerm.gender) : "",
    example: String(example || "").trim(),
  };
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

/**
 * Parse pasted or uploaded text into word rows.
 *
 * @param text    raw file or textarea contents
 * @param lang    "fr" | "de" — gates German gender extraction
 * @param format  "auto" or a forced format, for when detection guesses wrong
 * @returns { rows, format, label, note }
 */
export function parseWordList(text, { lang = "fr", format = "auto" } = {}) {
  const clean = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const trimmed = clean.trim();
  if (!trimmed) return { rows: [], format: "plain", label: FORMAT_LABELS.plain, note: "" };

  /* JSON first, but only as an attempt: a .txt file that happens to open with
   * "[" is far more likely to be a bracketed note than a JSON document, so a
   * parse failure falls through to line parsing instead of erroring out. */
  if (format === "auto" || format === "json") {
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const data = JSON.parse(trimmed);
        const list = Array.isArray(data) ? data : Array.isArray(data.words) ? data.words : Array.isArray(data.notes) ? data.notes : null;
        if (list) {
          const rows = list
            .map((item) => (typeof item === "string" ? makeRow(item, "", "", "", lang) : item && typeof item === "object" ? rowFromObject(item, lang) : null))
            .filter(Boolean);
          return { rows, format: "json", label: FORMAT_LABELS.json, note: "" };
        }
      } catch {
        // Not JSON after all — fall through.
      }
    }
    if (format === "json") return { rows: [], format: "json", label: FORMAT_LABELS.json, note: "That doesn't parse as JSON." };
  }

  const allLines = clean.split("\n");
  const directives = parseAnkiDirectives(allLines);

  const lines = allLines
    .slice(directives.count)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));

  if (!lines.length) return { rows: [], format: "plain", label: FORMAT_LABELS.plain, note: "" };

  let kind = format === "auto" ? detectFormat(lines) : format;
  let delim = kind === "tsv" ? "\t" : kind === "csv" ? "," : null;

  // An explicit #separator: beats detection — Anki is telling us outright.
  if (format === "auto" && directives.separator) {
    delim = directives.separator;
    kind = delim === "\t" ? "tsv" : "csv";
  }

  const notes = [];
  const rows = [];

  if (kind === "frequency") {
    // "der 1049564" — the count is data about the word, not a translation.
    lines.forEach((l) => {
      const m = l.match(/^(\S+)\s+(\S+)$/);
      const row = makeRow(m ? m[1] : l, "", "", "", lang);
      if (row) rows.push(row);
    });
    notes.push("frequencies ignored");
  } else if (kind === "plain") {
    /* The whole line is the term. Never split on whitespace to invent a
     * translation: "s'il te plaît" and "der Hund" are multi-word terms far
     * more often than "hund dog" is a two-column list. */
    lines.forEach((l) => {
      const row = makeRow(directives.html ? stripHtml(l) : l, "", "", "", lang);
      if (row) rows.push(row);
    });
  } else {
    let body = lines;
    let idx = { term: 0, translation: 1, example: 2, gender: -1 };

    const first = splitDelimited(lines[0], delim);
    const headTerm = aliasIndex(first, "term");
    const headTrans = aliasIndex(first, "translation");
    if (headTerm >= 0 && headTrans >= 0) {
      idx = { term: headTerm, translation: headTrans, example: aliasIndex(first, "example"), gender: aliasIndex(first, "gender") };
      body = lines.slice(1);
      notes.push("header row detected");
    }

    body.forEach((line) => {
      let cells = splitDelimited(line, delim);
      if (directives.html) cells = cells.map(stripHtml);
      // Drop Anki metadata columns before positional mapping.
      if (directives.skipColumns.size) cells = cells.filter((_, i) => !directives.skipColumns.has(i));

      const at = (i) => (i >= 0 ? cells[i] || "" : "");
      // Column 3 is an example only if it actually reads like a sentence.
      const maybeExample = at(idx.example);
      const example = maybeExample.trim().split(/\s+/).length >= 3 ? maybeExample : "";

      const row = makeRow(at(idx.term), at(idx.translation), at(idx.gender), example, lang);
      if (row) rows.push(row);
    });

    if (directives.skipColumns.size) notes.push(`${directives.skipColumns.size} Anki metadata column(s) skipped`);
    if (directives.html) notes.push("HTML stripped");
  }

  return { rows, format: kind, label: FORMAT_LABELS[kind] || kind, note: notes.join(" · ") };
}
