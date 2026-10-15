/* ---------------------------------------------------------------------- */
/* Design tokens                                                           */
/* ---------------------------------------------------------------------- */
/* Every token resolves through a CSS variable rather than a literal, so the
 * same `C.ink` renders navy on mobile and near-black inside the desktop
 * shell's `.vd-classical` scope. Defaults live in `src/index.css`. */
export const C = {
  ink: "var(--vd-ink)",
  paper: "var(--vd-paper)",
  card: "var(--vd-card)",
  line: "var(--vd-line)",
  red: "var(--vd-red)",
  green: "var(--vd-green)",
  gold: "var(--vd-gold)",
  onGold: "#201f1d",
  accent: "var(--vd-accent)",
  muted: "var(--vd-muted)",
};

/* der/die/das colour coding for German nouns. Only referenced on German
   screens, so a missing definition here crashes nothing until the language
   is switched. */
export const GENDER = { der: "var(--vd-der)", die: "var(--vd-die)", das: "var(--vd-das)" };

/* A wash marking a row as needing attention, and the ink the coverage map
 * shades with. Both flip with the theme — an ink wash is invisible on a dark
 * ground, so these cannot be literals like the rest of the accent colours. */
export const TINT = "var(--vd-tint)";
export const shade = (alpha) => `rgb(var(--vd-shade) / ${alpha})`;
