/* Word imagery.
 *
 * Images are keyed on a word's *meaning*, not its headword. The A1 drawers are
 * parallel across languages — `chat` and `Katze` are both a cat — so one
 * picture serves French and German, and any later level inherits an image for
 * free wherever its English gloss matches.
 *
 * Two sources, in priority order:
 *   1. `/img/words/<concept>.svg` — original illustrations drawn for this app.
 *   2. A Twemoji glyph, for breadth beyond the hand-drawn set.
 * A concept with neither simply has no image, and the UI falls back to text.
 */

/** Normalise an English gloss to a concept key: "to eat" → "eat", "woman / wife" → "woman". */
export function conceptKey(gloss) {
  if (!gloss) return "";
  return gloss
    .toLowerCase()
    .split("/")[0]
    .split("(")[0]
    .replace(/^to\s+/, "")
    .replace(/^the\s+/, "")
    .replace(/[^a-zà-ÿ\s-]/g, "")
    .trim();
}

/* Concepts with an original illustration in /img/words/. Kept as a Set so the
 * renderer never probes for a file that isn't there. */
export const DRAWN = new Set([
  // Animals
  "cat", "dog", "bird", "horse", "fish", "rabbit", "cow", "duck",
  // Food & drink
  "water", "bread", "milk", "coffee", "apple", "cheese", "vegetable", "egg",
  // Home & objects
  "house", "car", "school", "book", "table", "door", "window", "bed",
]);

/* Twemoji codepoints for everything else we can reasonably picture.
 * Colours are handled separately as swatches; numbers render as numerals. */
export const EMOJI = {
  // Family & people
  mother: "1f469", father: "1f468", brother: "1f466", sister: "1f467",
  child: "1f9d2", friend: "1f46b", woman: "1f469", man: "1f468",
  grandfather: "1f474", grandmother: "1f475",
  // Everyday actions
  eat: "1f374", drink: "1f964", go: "1f6b6", come: "1f44b", speak: "1f4ac",
  see: "1f440", like: "2764", love: "2764", have: "1f91d", be: "2728",
  sleep: "1f634", read: "1f4d6", write: "270d", buy: "1f6d2", work: "1f4bc",
  // Time & days
  day: "2600", night: "1f319", today: "1f4c5", tomorrow: "27a1",
  yesterday: "2b05", week: "1f5d3", month: "1f4c6", year: "1f389",
  morning: "1f305", evening: "1f307", hour: "1f550", time: "23f0",
  // Weather & nature
  sun: "2600", rain: "1f327", snow: "2744", tree: "1f333", flower: "1f337",
  sea: "1f30a", mountain: "26f0", sky: "2601",
  // More food
  wine: "1f377", beer: "1f37a", tea: "1f375", meat: "1f356", fish_food: "1f41f",
  fruit: "1f34e", rice: "1f35a", soup: "1f372", salt: "1f9c2", sugar: "1f36c",
  cake: "1f370", chocolate: "1f36b", butter: "1f9c8", potato: "1f954",
  tomato: "1f345", carrot: "1f955", onion: "1f9c5", chicken: "1f414",
  // More objects & places
  city: "1f3d9", street: "1f6e3", shop: "1f3ea", church: "26ea",
  station: "1f689", train: "1f686", plane: "2708", bus: "1f68c",
  bicycle: "1f6b2", boat: "26f5", key: "1f511", money: "1f4b6",
  phone: "1f4f1", computer: "1f4bb", letter: "2709", newspaper: "1f4f0",
  chair: "1f4ba", kitchen: "1f373", garden: "1f331", room: "1f6cb",
  // Body & health
  head: "1f9d1", hand: "270b", eye: "1f441", heart: "2764", foot: "1f9b6",
  doctor: "1f469-200d-2695-fe0f", hospital: "1f3e5",
  // Animals beyond A1
  mouse: "1f42d", pig: "1f437", sheep: "1f411", bear: "1f43b",
  chicken_animal: "1f414", spider: "1f577", bee: "1f41d", butterfly: "1f98b",

  /* A2 skews abstract, but feelings, weather and travel still picture well.
   * Function words (already, rather, enough, often) are deliberately absent —
   * an icon for "still" teaches nothing and adds noise. */
  // Feelings
  angry: "1f620", happy: "1f60a", sad: "1f622", tired: "1f634",
  surprised: "1f632", nervous: "1f630", proud: "1f4aa", worried: "1f61f",
  sick: "1f912", glad: "1f603", content: "1f60c", beautiful: "1f338",
  // Weather
  cloud: "2601", cold: "1f976", hot: "1f975", fog: "1f32b",
  storm: "26c8", wind: "1f4a8", weather: "1f324",
  // Places & rooms
  airport: "1f6eb", bathroom: "1f6c1", bedroom: "1f6cf",
  "living room": "1f6cb", office: "1f3e2", market: "1f3ea", store: "1f3ea",
  // Travel & money
  passport: "1f6c2", suitcase: "1f9f3", ticket: "1f3ab", trip: "1f5fa",
  address: "1f4cd", price: "1f4b0", salary: "1f4b5", checkout: "1f6d2",
  expensive: "1f4b8", cheap: "1f4b2",
  // Work & people
  boss: "1f454", colleague: "1f465", meeting: "1f5d3", task: "1f4dd",
  // Social
  hello: "1f44b", hi: "1f44b", goodbye: "1f44b", "thank you": "1f64f",
  please: "1f64f", sorry: "1f647", "excuse me": "1f64b", "youre welcome": "1f917",
  yes: "2705", no: "274c", maybe: "1f914",
  // Actions
  "go to bed": "1f6cc", "get up": "23f0", learn: "1f393", pay: "1f4b3",
  sell: "1f3f7", wait: "23f3", think: "1f4ad", help: "1f91d",
  understand: "1f4a1", arrive: "1f6ec", leave: "1f6eb", begin: "1f6a9",
  start: "1f6a9", finish: "1f3c1", break: "2615", know: "1f9e0",
  // Qualities & time
  minute: "23f1", early: "1f305", late: "1f319", now: "23f0",
  left: "2b05", right: "27a1", new: "1f195", good: "1f44d", easy: "1f44c",
};

/** Colour swatches — a picture of "blue" is a colour, not an object. */
export const SWATCH = {
  red: "#E5352B", blue: "#1F6FD0", green: "#3E9B54", black: "#1A1A1A",
  white: "#FFFFFF", yellow: "#F2C230", orange: "#EE7B22", grey: "#9A9A9A",
  gray: "#9A9A9A", brown: "#8A5A2B", pink: "#E870A8", purple: "#8B5CC7",
};

const NUMBER_WORDS = {
  one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};

/**
 * Resolve a word to something renderable.
 * Returns one of:
 *   { kind: "drawn",   src }    original SVG
 *   { kind: "emoji",   src }    Twemoji SVG
 *   { kind: "swatch",  color }  colour chip
 *   { kind: "numeral", text }   digit
 *   null                        nothing suitable — caller shows text only
 */
export function imageFor(word) {
  const key = conceptKey(word?.e);
  if (!key) return null;
  if (DRAWN.has(key)) return { kind: "drawn", src: `/img/words/${key}.svg`, key };
  if (SWATCH[key]) return { kind: "swatch", color: SWATCH[key], key };
  if (NUMBER_WORDS[key]) return { kind: "numeral", text: NUMBER_WORDS[key], key };
  const cp = EMOJI[key];
  if (cp) return { kind: "emoji", src: `/img/emoji/${cp}.svg`, key };
  return null;
}

/** True when a word can be shown as a picture — used to build image exercises. */
export function hasImage(word) {
  return imageFor(word) !== null;
}
