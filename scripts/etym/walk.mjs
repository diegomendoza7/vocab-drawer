/* Walk an etymology chain page by page.
 *
 * Reading a chain out of one page's wikitext works until the page uses
 * {{etymon|…|tree=1}}, which names only the immediate parent and renders the
 * rest from structured data. That is now the common style on high-traffic
 * entries — including `father`, which is the section's flagship example — so
 * a parser that only reads inline {{inh}} chains fails exactly where it
 * matters most.
 *
 * Walking instead: take the immediate ancestor, fetch that page, repeat. Costs
 * a request per rung and is indifferent to which template style each page uses.
 */
const UA = "VocabDrawer/1.0 (educational vocabulary app; contact diego00ms@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

const SECTION_OF = {
  en: "==English==", enm: "==Middle English==", ang: "==Old English==",
  de: "==German==", gmh: "==Middle High German==", goh: "==Old High German==",
  fr: "==French==", frm: "==Middle French==", fro: "==Old French==",
  la: "==Latin==", "la-lat": "==Latin==", "la-vul": "==Latin==",
  "gem-pro": "==Proto-Germanic==", "gmw-pro": "==Proto-West Germanic==",
  "itc-pro": "==Proto-Italic==", "ine-pro": "==Proto-Indo-European==",
};
/* Where the walk stops: a reconstruction has no page worth walking past. */
const TERMINAL = new Set(["ine-pro"]);

/* Reconstructed forms do not live at their own title. They live under
 * Reconstruction:<Language name>/<form>, so the language has to be part of the
 * lookup — which is why `page` takes it. Guessing "Reconstruction:fader" gets
 * a miss, and a miss ends the walk one rung short of Proto-Germanic. */
const PROTO_TITLE = {
  "gem-pro": "Proto-Germanic", "gmw-pro": "Proto-West Germanic",
  "itc-pro": "Proto-Italic", "ine-pro": "Proto-Indo-European",
};

export async function page(form, lang) {
  const proto = PROTO_TITLE[lang];
  const title = proto ? `Reconstruction:${proto}/${form.replace(/^\*/, "")}` : form;
  if (cache.has(title)) return cache.get(title);
  const url = "https://en.wiktionary.org/w/api.php?action=parse&page="
    + encodeURIComponent(title) + "&prop=wikitext&format=json&formatversion=2&redirects=1";
  let text = null;
  for (let a = 0; a < 4; a += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(1200 * (a + 1)); continue; }
    if (r.ok) { const j = await r.json(); text = j?.parse?.wikitext ?? null; }
    break;
  }
  cache.set(title, text);
  await sleep(200);
  return text;
}

function section(text, lang) {
  const head = SECTION_OF[lang];
  if (!text || !head) return null;
  const i = text.indexOf(head);
  if (i < 0) return null;
  const nxt = text.slice(i + 4).search(/\n==[A-Z][^=]*==\n/);
  return nxt < 0 ? text.slice(i) : text.slice(i, i + 4 + nxt);
}

/** The immediate ancestor this page names, whichever template style it uses. */
function parentOf(sec) {
  const inh = /\{\{(?:inh|der|bor)\+?\s*\|[^|}]*\|([a-z-]+(?:-pro)?)\|([^}|]+)/.exec(sec);
  if (inh) return { lang: inh[1], form: inh[2].split(",")[0].trim() };
  for (const m of sec.matchAll(/\{\{etymon\|([^}]*)\}\}/g)) {
    for (const piece of m[1].split("|")) {
      const hit = /^([a-z-]+(?:-pro)?):([^<|]+)/.exec(piece.trim());
      if (hit) return { lang: hit[1], form: hit[2].trim() };
    }
  }
  return null;
}

/** The chain above `word`, newest first, as {kind, lang, form} steps. */
export async function walkChain(word, lang, maxHops = 8) {
  const steps = [];
  let cur = { lang, form: word };
  for (let hop = 0; hop < maxHops; hop += 1) {
    const sec = section(await page(cur.form, cur.lang), cur.lang);
    if (!sec) break;
    const parent = parentOf(sec);
    if (!parent || !parent.form) break;
    steps.push({ kind: "inh", lang: parent.lang, form: parent.form });
    if (TERMINAL.has(parent.lang)) break;
    cur = parent;
  }
  return steps;
}
