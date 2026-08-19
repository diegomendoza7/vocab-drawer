/* Original word illustrations for the A1 core.
 *
 * Drawn for this app — flat shapes, one dark outline weight, a small shared
 * palette. Deliberately not a copy of any existing icon set: the register is
 * the common flat-vector idiom (rounded joins, saturated fills, no gradients),
 * but every path here is our own.
 *
 * Kept as one generator rather than 24 loose files so the palette and the
 * drawing conventions stay visible in a single place.
 *
 *   node scripts/build-word-art.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "img", "words");

const K = "#33302C"; // outline
const P = {
  ginger: "#F2A03C", brown: "#C08552", darkBrown: "#A9714B", tan: "#E0B06A",
  blue: "#4FA9E8", deepBlue: "#2E7BC4", teal: "#3FBFB0", green: "#5DAF4C",
  leaf: "#3E8E36", red: "#E5533D", yellow: "#F5CE3E", cream: "#FFF3DC",
  mane: "#6E4A2E",
  white: "#FFFFFF", stone: "#DCD6CE", grey: "#B9B2A8", pink: "#F2B8A8",
};

/** Every icon shares one frame, so they sit together at any size. */
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" ` +
  `stroke="${K}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">\n${body}\n</svg>\n`;

const ART = {
  /* ---------------- animals ---------------- */
  cat: svg(`  <path d="M32 46 L28 22 L50 34 Z" fill="${P.ginger}"/>
  <path d="M88 46 L92 22 L70 34 Z" fill="${P.ginger}"/>
  <circle cx="60" cy="62" r="31" fill="${P.ginger}"/>
  <circle cx="49" cy="57" r="4" fill="${K}" stroke="none"/>
  <circle cx="71" cy="57" r="4" fill="${K}" stroke="none"/>
  <path d="M60 68 l-5 5 h10 Z" fill="${P.pink}"/>
  <path d="M60 73 v5"/><path d="M22 62 h14"/><path d="M22 72 h14"/>
  <path d="M98 62 H84"/><path d="M98 72 H84"/>`),

  dog: svg(`  <path d="M30 40 q-10 4 -8 26 q2 16 12 14 Z" fill="${P.brown}"/>
  <path d="M90 40 q10 4 8 26 q-2 16 -12 14 Z" fill="${P.brown}"/>
  <circle cx="60" cy="58" r="30" fill="${P.tan}"/>
  <ellipse cx="60" cy="76" rx="18" ry="13" fill="${P.cream}"/>
  <circle cx="50" cy="53" r="4" fill="${K}" stroke="none"/>
  <circle cx="70" cy="53" r="4" fill="${K}" stroke="none"/>
  <ellipse cx="60" cy="70" rx="6" ry="4.5" fill="${K}" stroke="none"/>
  <path d="M60 75 v6"/>`),

  bird: svg(`  <ellipse cx="58" cy="64" rx="30" ry="26" fill="${P.blue}"/>
  <circle cx="76" cy="46" r="17" fill="${P.blue}"/>
  <path d="M91 44 l14 5 l-14 6 Z" fill="${P.yellow}"/>
  <circle cx="79" cy="42" r="3.5" fill="${K}" stroke="none"/>
  <path d="M52 60 q14 6 4 22 q-16 2 -20 -10 Z" fill="${P.deepBlue}"/>
  <path d="M28 62 l-16 -8 l6 16 Z" fill="${P.deepBlue}"/>
  <path d="M50 88 v10"/><path d="M68 88 v10"/>`),

  /* Full side view rather than a head profile — at 40px a horse head reads as
     an indistinct blob, whereas the four-legged silhouette is unmistakable. */
  horse: svg(`  <rect x="30" y="70" width="9" height="30" rx="4.5" fill="${P.darkBrown}"/>
  <rect x="45" y="72" width="9" height="28" rx="4.5" fill="${P.darkBrown}"/>
  <rect x="61" y="72" width="9" height="28" rx="4.5" fill="${P.darkBrown}"/>
  <rect x="74" y="68" width="9" height="32" rx="4.5" fill="${P.darkBrown}"/>
  <ellipse cx="54" cy="58" rx="31" ry="19" fill="${P.brown}"/>
  <path d="M72 50 L84 22 l15 6 L86 58 Z" fill="${P.brown}"/>
  <path d="M80 16 q22 1 24 15 q1 9 -11 10 l-17 1 Z" fill="${P.tan}"/>
  <path d="M83 15 l1 -11 l11 9 Z" fill="${P.darkBrown}"/>
  <path d="M72 48 q3 -25 13 -32 q1 15 -3 32 Z" fill="${P.mane}"/>
  <path d="M24 48 q-14 8 -8 32" stroke="${P.mane}" stroke-width="7"/>
  <circle cx="90" cy="27" r="3" fill="${K}" stroke="none"/>
  <path d="M101 36 h5"/>`),

  fish: svg(`  <ellipse cx="56" cy="60" rx="34" ry="24" fill="${P.teal}"/>
  <path d="M90 60 l20 -16 v32 Z" fill="${P.deepBlue}"/>
  <path d="M52 36 q10 -14 20 -4" fill="${P.deepBlue}"/>
  <path d="M52 84 q10 14 20 4" fill="${P.deepBlue}"/>
  <circle cx="38" cy="54" r="4.5" fill="${K}" stroke="none"/>
  <path d="M64 46 q8 14 0 28"/>`),

  rabbit: svg(`  <ellipse cx="46" cy="30" rx="9" ry="24" fill="${P.stone}"/>
  <ellipse cx="74" cy="30" rx="9" ry="24" fill="${P.stone}"/>
  <ellipse cx="46" cy="32" rx="4" ry="15" fill="${P.pink}" stroke="none"/>
  <ellipse cx="74" cy="32" rx="4" ry="15" fill="${P.pink}" stroke="none"/>
  <circle cx="60" cy="74" r="28" fill="${P.stone}"/>
  <circle cx="50" cy="70" r="4" fill="${K}" stroke="none"/>
  <circle cx="70" cy="70" r="4" fill="${K}" stroke="none"/>
  <path d="M60 80 l-4 4 h8 Z" fill="${P.pink}"/>
  <path d="M44 88 h10"/><path d="M66 88 h10"/>`),

  cow: svg(`  <path d="M28 40 q-12 -10 -6 -18 q10 -4 14 10 Z" fill="${P.stone}"/>
  <path d="M92 40 q12 -10 6 -18 q-10 -4 -14 10 Z" fill="${P.stone}"/>
  <circle cx="60" cy="60" r="32" fill="${P.white}"/>
  <path d="M40 40 q-8 12 2 18 q12 4 12 -10 q0 -12 -14 -8 Z" fill="${K}" stroke="none"/>
  <ellipse cx="60" cy="80" rx="20" ry="14" fill="${P.pink}"/>
  <circle cx="49" cy="54" r="4" fill="${K}" stroke="none"/>
  <circle cx="73" cy="52" r="4" fill="${K}" stroke="none"/>
  <ellipse cx="53" cy="78" rx="3" ry="4" fill="${K}" stroke="none"/>
  <ellipse cx="67" cy="78" rx="3" ry="4" fill="${K}" stroke="none"/>`),

  duck: svg(`  <ellipse cx="54" cy="74" rx="32" ry="22" fill="${P.yellow}"/>
  <circle cx="78" cy="46" r="18" fill="${P.yellow}"/>
  <path d="M94 44 q16 2 14 9 q-2 6 -15 4 Z" fill="${P.ginger}"/>
  <circle cx="81" cy="41" r="3.5" fill="${K}" stroke="none"/>
  <path d="M44 68 q16 4 8 20 q-16 2 -20 -8 Z" fill="${P.ginger}"/>
  <path d="M22 92 h58"/>`),

  /* ---------------- food & drink ---------------- */
  water: svg(`  <path d="M38 26 h44 l-6 74 q-1 6 -16 6 q-15 0 -16 -6 Z" fill="${P.white}"/>
  <path d="M35.6 54 h48.8 l-4.4 46 q-1 6 -16 6 q-15 0 -16 -6 Z" fill="${P.blue}" stroke="none"/>
  <path d="M38 26 h44 l-6 74 q-1 6 -16 6 q-15 0 -16 -6 Z"/>
  <path d="M36 54 h48"/>`),

  bread: svg(`  <path d="M20 62 q0 -28 40 -28 q40 0 40 28 v22 q0 8 -10 8 H30 q-10 0 -10 -8 Z" fill="${P.tan}"/>
  <path d="M34 46 q8 -8 14 0"/><path d="M54 42 q8 -8 14 0"/><path d="M74 46 q8 -8 12 0"/>
  <path d="M20 66 h80"/>`),

  milk: svg(`  <path d="M38 44 h44 v56 q0 6 -6 6 H44 q-6 0 -6 -6 Z" fill="${P.white}"/>
  <path d="M38 44 l10 -20 h24 l10 20 Z" fill="${P.cream}"/>
  <path d="M48 24 h24"/>
  <rect x="50" y="62" width="20" height="22" rx="3" fill="${P.blue}"/>`),

  coffee: svg(`  <path d="M26 46 h58 v28 q0 20 -20 20 H46 q-20 0 -20 -20 Z" fill="${P.white}"/>
  <path d="M30 52 h50 v22 q0 14 -14 14 H44 q-14 0 -14 -14 Z" fill="${P.brown}" stroke="none"/>
  <path d="M26 46 h58 v28 q0 20 -20 20 H46 q-20 0 -20 -20 Z"/>
  <path d="M84 54 q18 0 18 12 q0 12 -18 12" fill="${P.white}"/>
  <path d="M18 102 h74"/>
  <path d="M46 34 q6 -8 0 -16"/><path d="M62 34 q6 -8 0 -16"/>`),

  apple: svg(`  <path d="M60 34 q-26 -10 -32 14 q-6 24 12 44 q10 12 20 4 q10 8 20 -4 q18 -20 12 -44 q-6 -24 -32 -14 Z" fill="${P.red}"/>
  <path d="M60 34 v-14"/>
  <path d="M62 24 q16 -14 24 -4 q-6 14 -24 10 Z" fill="${P.leaf}"/>`),

  cheese: svg(`  <path d="M16 82 L92 34 l16 12 v36 Z" fill="${P.yellow}"/>
  <path d="M16 82 L92 34 l16 12 L28 94 Z" fill="${P.yellow}"/>
  <path d="M16 82 v12 h92 V46"/>
  <circle cx="52" cy="72" r="7" fill="${P.cream}"/>
  <circle cx="76" cy="60" r="5" fill="${P.cream}"/>
  <circle cx="40" cy="84" r="4" fill="${P.cream}"/>`),

  vegetable: svg(`  <path d="M56 40 q22 8 30 30 q-30 30 -56 22 q-14 -28 26 -52 Z" fill="${P.ginger}"/>
  <path d="M62 44 q10 -18 26 -18 q-2 16 -18 22" fill="${P.green}"/>
  <path d="M56 40 q6 -20 -6 -26 q-12 10 -2 28" fill="${P.leaf}"/>
  <path d="M46 66 l10 6"/><path d="M38 78 l10 6"/>`),

  egg: svg(`  <ellipse cx="60" cy="64" rx="30" ry="38" fill="${P.white}"/>
  <ellipse cx="60" cy="70" rx="14" ry="13" fill="${P.yellow}"/>`),

  /* ---------------- home & objects ---------------- */
  house: svg(`  <path d="M22 58 L60 24 l38 34" fill="${P.red}"/>
  <path d="M14 58 L60 18 l46 40 Z" fill="${P.red}"/>
  <path d="M28 58 h64 v42 H28 Z" fill="${P.cream}"/>
  <path d="M50 100 V74 h20 v26" fill="${P.brown}"/>
  <rect x="34" y="66" width="12" height="12" rx="2" fill="${P.blue}"/>`),

  car: svg(`  <path d="M16 78 v-14 q0 -6 8 -8 l10 -16 q3 -6 10 -6 h32 q7 0 10 6 l10 16 q8 2 8 8 v14 Z" fill="${P.blue}"/>
  <path d="M40 40 h16 v18 H32 Z" fill="${P.cream}"/>
  <path d="M64 40 h14 l10 18 H64 Z" fill="${P.cream}"/>
  <circle cx="36" cy="80" r="12" fill="${P.stone}"/>
  <circle cx="84" cy="80" r="12" fill="${P.stone}"/>
  <circle cx="36" cy="80" r="4" fill="${K}" stroke="none"/>
  <circle cx="84" cy="80" r="4" fill="${K}" stroke="none"/>`),

  school: svg(`  <path d="M20 50 L60 26 l40 24 Z" fill="${P.red}"/>
  <path d="M26 50 h68 v52 H26 Z" fill="${P.cream}"/>
  <path d="M60 26 V12 h16 v8"/>
  <path d="M50 102 V78 h20 v24" fill="${P.brown}"/>
  <rect x="34" y="62" width="12" height="12" rx="2" fill="${P.blue}"/>
  <rect x="74" y="62" width="12" height="12" rx="2" fill="${P.blue}"/>`),

  book: svg(`  <path d="M24 26 h58 q12 0 12 10 v58 q0 10 -12 10 H24 Z" fill="${P.green}"/>
  <path d="M24 26 h10 v78 H24 Z" fill="${P.leaf}"/>
  <path d="M44 44 h34"/><path d="M44 58 h34"/><path d="M44 72 h22"/>`),

  table: svg(`  <path d="M14 44 h92 v12 H14 Z" fill="${P.tan}"/>
  <path d="M26 56 v44"/><path d="M94 56 v44"/>
  <path d="M26 56 h6 v44 h-6 Z" fill="${P.brown}"/>
  <path d="M88 56 h6 v44 h-6 Z" fill="${P.brown}"/>`),

  door: svg(`  <path d="M30 16 h60 v88 H30 Z" fill="${P.brown}"/>
  <path d="M40 28 h40 v30 H40 Z" fill="${P.tan}"/>
  <path d="M40 66 h40 v26 H40 Z" fill="${P.tan}"/>
  <circle cx="78" cy="62" r="4.5" fill="${P.yellow}"/>`),

  window: svg(`  <path d="M22 20 h76 v72 H22 Z" fill="${P.blue}"/>
  <path d="M60 20 v72"/><path d="M22 56 h76"/>
  <path d="M14 92 h92"/>`),

  bed: svg(`  <path d="M14 60 h92 v30 H14 Z" fill="${P.deepBlue}"/>
  <path d="M14 60 v-22 q0 -6 8 -6 h10 q8 0 8 6 v22" fill="${P.cream}"/>
  <rect x="26" y="46" width="26" height="16" rx="5" fill="${P.white}"/>
  <path d="M14 90 v14"/><path d="M106 90 v14"/>`),
};

await mkdir(out, { recursive: true });
for (const [name, body] of Object.entries(ART)) {
  await writeFile(join(out, `${name}.svg`), body);
}
console.log(`wrote ${Object.keys(ART).length} illustrations to public/img/words`);
