/* Backfill `gen` onto French nouns in vocab.js.
 *
 * French A1–B2 entries store the bare headword ("chat"), unlike FR_C1 which
 * carries `art`/`gen` from its source document. The sentence-construction
 * engine needs gender to choose an article, so it is recovered here from each
 * word's own example sentence — "Le chat dort…" fixes `chat` as masculine.
 *
 * The map below is that derivation, hand-checked. Two classes of false
 * positive had to be dropped: an adjective following an article (`nouveau`,
 * from "Le nouveau film…") and verbs following an elided `d'` (`aider`,
 * `échouer`, `appréhender`). Elided nouns — "L'enfant", "l'eau" — carry no
 * gender in the sentence at all and are assigned directly.
 *
 * Idempotent: re-running skips entries that already have a `gen`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "vocab.js");

/* m = masculine, f = feminine. Derived from the example-sentence article
 * except where marked — those had an elided article and were assigned. */
const GENDER = {
  // A1
  mère: "f", père: "m", frère: "m", sœur: "f", femme: "f", "grand-père": "m", "grand-mère": "f",
  chat: "m", chien: "m", oiseau: "m", cheval: "m", poisson: "m", lapin: "m", vache: "f", canard: "m",
  pain: "m", café: "m", pomme: "f", fromage: "m", légume: "m", œuf: "m",
  voiture: "f", livre: "m", table: "f", porte: "f", fenêtre: "f", lit: "m",
  nuit: "f", matin: "m", soir: "m",
  enfant: "m", homme: "m", eau: "f", école: "f",          // elided
  // A2
  semaine: "f", mois: "m", année: "f", minute: "f",
  pluie: "f", soleil: "m", neige: "f", vent: "m", orage: "m", brouillard: "m",
  magasin: "m", marché: "m", prix: "m", caisse: "f",
  travail: "m", bureau: "m", collègue: "m", réunion: "f", tâche: "f", pause: "f", patron: "m",
  train: "m", gare: "f", valise: "f", billet: "m",
  rue: "f", chambre: "f", cuisine: "f", salon: "m", "salle de bain": "f", jardin: "m", ville: "f",
  argent: "m", avion: "m", aéroport: "m",                 // elided
  // B1
  société: "f", gouvernement: "m", pouvoir: "m", loi: "f", politique: "f", réforme: "f",
  entreprise: "f", recherche: "f", compétence: "f", employeur: "m", formation: "f",
  santé: "f", maladie: "f", médecin: "m", traitement: "m", symptôme: "m", douleur: "f",
  remède: "m", patient: "m", problème: "m", résultat: "m", raison: "f", avis: "m",
  développement: "m", génération: "f", tradition: "f", progrès: "m", époque: "f",
  changement: "m", valeur: "f",
  environnement: "m", économie: "f", élection: "f", expérience: "f", éducation: "f",
  université: "f", avenir: "m", évolution: "f",           // elided
  // B2
  défi: "m", obstacle: "m", ressource: "f", hypothèse: "f", constat: "m", tendance: "f",
  analyse: "f", corrélation: "f", critère: "m", méthodologie: "f", débat: "m",
  controverse: "f", consensus: "m", mondialisation: "f", inégalité: "f", croissance: "f",
  écart: "m",                                             // elided
};

const src = fs.readFileSync(FILE, "utf8");

/* Scope the edit to the French block. German headwords collide with French
 * ones ("patient", "train"), and a global replace would tag the wrong entry. */
const start = src.indexOf("export const FR_A1 = [");
const end = src.indexOf("export const DE_A1 = [");
if (start < 0 || end < 0 || end < start) throw new Error("Could not locate the French block in vocab.js");

let head = src.slice(0, start), fr = src.slice(start, end), tail = src.slice(end);
let added = 0, already = 0;
const missing = [];

for (const [word, gen] of Object.entries(GENDER)) {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(\\{ t: "${esc}", e: "(?:[^"\\\\]|\\\\.)*")(,)`);
  const m = fr.match(re);
  if (!m) { missing.push(word); continue; }
  if (/\bgen: "/.test(fr.slice(m.index, m.index + 200).split("}")[0])) { already++; continue; }
  fr = fr.slice(0, m.index) + m[1] + `, gen: "${gen}",` + fr.slice(m.index + m[0].length);
  added++;
}

fs.writeFileSync(FILE, head + fr + tail);
console.log(`gen added: ${added}  |  already present: ${already}  |  headword not found: ${missing.length}`);
if (missing.length) console.log("  not found:", missing.join(", "));
