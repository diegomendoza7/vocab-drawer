import {speechEvidence} from "./lib/speech-evidence.js";
import {usePracticeTime} from "./hooks/usePracticeTime.js";
import GlobalStyles from "./components/GlobalStyles.jsx";
import ProgressStatus from "./components/ProgressStatus.jsx";
import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import {
  Volume2, VolumeX, Check, X, ChevronRight, ChevronLeft, RotateCcw, ArrowRight, Shuffle,
  Settings2, Repeat, Home, Zap, Sparkles, Cog, LayoutGrid, Layers, BookOpen, Quote, Eye,
  EyeOff, Flame, CalendarCheck, CloudOff, Activity, Headphones, Mic, MicOff, Play,
  GraduationCap, FileText, Trash2, Sparkle, Blocks, Upload, ClipboardList, Plus, Target, GitBranch,
  PenLine,
  TriangleAlert,
  ScrollText,
} from "lucide-react";

import { C, GENDER, TINT } from "./theme.js";
import MobileShell from "./components/MobileShell.jsx";
import DesktopShell from "./components/DesktopShell.jsx";
import HomeDesktop from "./components/HomeDesktop.jsx";
import StudyStageRail from "./components/StudyStageRail.jsx";
import StudyLedger from "./components/StudyLedger.jsx";
import SummaryTable from "./components/SummaryTable.jsx";
import MyWordsWorkspace from "./components/MyWordsWorkspace.jsx";
import DiffReviewTable from "./components/DiffReviewTable.jsx";
import CoverageMatrix from "./components/CoverageMatrix.jsx";
import ReadingRoom from "./components/ReadingRoom.jsx";
import WritingDesk from "./components/WritingDesk.jsx";
import Mistakes from "./components/Mistakes.jsx";
import Emphasised from "./components/Emphasised.jsx";
import PhraseMatch from "./components/PhraseMatch.jsx";
import ListeningStage from "./components/ListeningStage.jsx";
import ProgressBoard from "./components/ProgressBoard.jsx";
import ImportReader from "./components/ImportReader.jsx";
import SentenceStage from "./components/SentenceStage.jsx";
import GrammarWorkbench from "./components/GrammarWorkbench.jsx";
import { useIsDesktop } from "./hooks/useIsDesktop.js";
import { useTheme } from "./hooks/useTheme.js";
import { useTypeScale } from "./hooks/useTypeScale.js";
import { sectionOf, STUDY_SCREENS , FULL_WIDTH_SCREENS, COLUMN_WIDTH } from "./lib/sections.js";

import { FR_C1_VERBS, DE_C1_VERBS } from "./data/verbs-c1.js";
import { imageFor } from "./data/word-images.js";
import { LAWS, LAW_GROUPS, LAYERS } from "./data/etymology.js";
import { CHAINS, FAMILIES } from "./data/etymology-chains.js";
import { FAMILIES as WORD_FAMILIES } from "./data/morphology.js";
import { buildFamilyQuiz } from "./lib/morphology.js";
import { rungsFromLayers, mergeChains, rootAt, buildLawQuiz, gradeLawAnswer, lawsTouching } from "./lib/etymology.js";
import EtymologyWorkbench from "./components/EtymologyWorkbench.jsx";
import FluencyRound from "./components/FluencyRound.jsx";
import Collocations from "./components/Collocations.jsx";
import { WORD_RANK, rankLabel } from "./data/frequency.js";
import { PASSAGES } from "./data/reading/index.js";
import { germanLexicon } from "./lib/grammar.js";
import { checkWriting } from "./lib/checkWriting.js";
import { recordingFor, playRecording, stopRecording } from "./lib/voice.js";
import VoiceCredits from "./components/VoiceCredits.jsx";
import { recordIssues, recordMiss, topMistakes, clearMistake, markPractised, conjRuleKey } from "./lib/errors.js";
import {
  collocationsFor, buildCollocationQuiz, scoreCollocations,
} from "./lib/collocations.js";
import {
  eligibleForFluency, fluencyReadiness, buildFluencyRound, scoreRound, recordRound,
  roundVerdict, ROUND_SECONDS, MIN_POOL,
} from "./lib/fluency.js";
import WordTree from "./components/WordTree.jsx";
import WordBuilder from "./components/WordBuilder.jsx";
import { acceptableEnglish } from "./lib/gloss.js";
import {
  todayKey, addDays, daysUntil, cardId, prodCardId, idForKind,
  newCard, LEARNING_GAP_MS, gradeFromWrongCount, scheduleCard, isDue, isReady, cardStage, isLeech } from "./lib/srs.js";
import { buildBatchLedger, buildSummaryRows, scheduleResults, matrixCell, weakestCards, drillScopeTenses, effectiveScope, kindsForCard, estimateMinutes, nextAction, accuracyTrend, mergeProgress, typeAhead, commitTypeAhead, frequencyReach, WRITING_KEEP } from "./lib/study.js";
import { recordActivity, neglectedStrand, strandBalance, ACTIVITIES, STRANDS } from "./lib/strands.js";
import { buildPlacementLevel, placementResult, shouldContinue, PLACEMENT_LEVELS } from "./lib/placement.js";
import { abilityFrom, productionGap, reachSentence } from "./lib/ability.js";
import Placement from "./components/Placement.jsx";
import Lessons from "./components/Lessons.jsx";
import { lessonsFor, LESSON_STAGES } from "./data/lessons.js";
import { buildDictionary, describe as describeWord, lookupInflected, segmentSentence } from "./lib/dictionary.js";
import {
  SUBJECTS as SENT_SUBJECTS, buildSentence, nounPoolFor, usableVerbs, timePhrasesFor,
  SENTENCE_SHAPES, pickModal, pickOpener,
} from "./lib/sentences.js";
import { DATA, loadVocabulary, subscribeVocabulary, CORE_LEVELS, levelsFor, audioLevelsFor, levelInfo, LANG_INFO, flattenLevel } from "./data/vocab.js";
import {
  PHRASES,
  FR_PRONOUNS,
  DE_PRONOUNS,
  personsFor,
  randomPerson,
  hasTense,
  FR_VERBS,
  DE_VERBS,
  FR_TENSES,
  DE_TENSES,
  conjugate,
  conjugationAlternates,
  conjugateEnglish,
  displayPronoun,
  GRAMMAR,
  NOTE_KINDS,
  spokenForm,
  verbFrame,
} from "./data/content.js";

import { glossBatch, translate, verifyBatch } from "./lib/api.js";
import { storage } from "./lib/storage.js";
import {useProgress,recoverSession} from "./hooks/useProgress.js";
import {logAnswer,eventId} from "./lib/progress.js";
import { parseWordList, FORMAT_LABELS } from "./lib/wordlist.js";



const BackupManager=lazy(()=>import('./components/BackupManager.jsx'));
const WordRepair=lazy(()=>import('./components/WordRepair.jsx'));
const ContrastClinic=lazy(()=>import('./components/ContrastClinic.jsx'));
const TodayDashboard=lazy(()=>import('./components/TodayDashboard.jsx'));
const MissionLesson=lazy(()=>import('./components/MissionLesson.jsx'));
const BrowserExtensionGuide=lazy(()=>import("./components/BrowserExtensionGuide.jsx"));
const DeviceFiles=lazy(()=>import("./components/DeviceFiles.jsx"));
const HumanListening=lazy(()=>import('./components/HumanListening.jsx'));
const MediaStudio=lazy(()=>import('./components/MediaStudio.jsx'));
const PracticeLibrary=lazy(()=>import('./components/PracticeLibrary.jsx'));
const ExtensiveShelf=lazy(()=>import('./components/ExtensiveShelf.jsx'));
const PhraseNotebook=lazy(()=>import('./components/LearningTools.jsx').then(m=>({default:m.PhraseNotebook})));
const LanguageJournal=lazy(()=>import('./components/LearningTools.jsx').then(m=>({default:m.LanguageJournal})));
const PronunciationLab=lazy(()=>import('./components/LearningTools.jsx').then(m=>({default:m.PronunciationLab})));
const RetellingPractice=lazy(()=>import('./components/LearningTools.jsx').then(m=>({default:m.RetellingPractice})));
const SkillPassport=lazy(()=>import('./components/LearningTools.jsx').then(m=>({default:m.SkillPassport})));

/* ---------------------------------------------------------------------- */
/* Text import: tokenizing + lookup                                        */
/* ---------------------------------------------------------------------- */

/** Split into sentences without regex lookbehind (Safari-safe). */
/** "today" / "2d ago" — enough for a library rail, and no dependency. */
function relativeDay(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
}

function splitSentences(text) {
  const flat = text.replace(/\s+/g, " ").trim();
  const out = [];
  let cur = "";
  for (const ch of flat) {
    cur += ch;
    if (".!?…".includes(ch)) { out.push(cur.trim()); cur = ""; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Break a sentence into word / non-word segments so it can be re-rendered intact. */
/** "l'eau" -> "eau", "j'ai" -> "ai", "qu'il" -> "il". Harmless for German. */
function stripElision(w) {
  return w.replace(/^(l|d|j|n|s|t|c|m|qu)['’]/i, "");
}
function lookupKey(w) {
  return normalize(stripElision(w));
}

/* The prompt construction and JSON parsing that used to live here now sit in
 * server/index.js, where the shape is pinned by a structured-output schema
 * instead of being sliced out of a prose reply. These two wrappers keep the
 * original "never throw into the UI" contract for the call sites below. */

/** Gloss a batch of word forms. Returns [] on any failure rather than throwing into the UI. */
async function apiLookupBatch(lang, words) {
  try {
    return await glossBatch(lang, words);
  } catch (e) {
    console.error("[gloss]", e.message);
    return [];
  }
}

/** Translate one sentence to English. Returns "" on failure. */
async function apiTranslate(lang, sentence) {
  try {
    return await translate(lang, sentence);
  } catch (e) {
    console.error("[translate]", e.message);
    return "";
  }
}

/** Second-opinion a batch of your own words. Returns no rows on failure. */
async function apiVerifyBatch(lang, level, words) {
  try {
    return await verifyBatch(lang, level, words);
  } catch (e) {
    console.error("[verify]", e.message);
    return { rows: [], model: "" };
  }
}

/* ---------------------------------------------------------------------- */
/* Text helpers                                                            */
/* ---------------------------------------------------------------------- */
function normalize(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00df/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"']+$/g, "")
    .replace(/^[.,!?;:"']+/g, "")
    .replace(/\s+/g, " ");
}
function answersMatch(input, correct) {
  return normalize(input) === normalize(correct);
}

/**
 * Blank out `surface` in `sentence` to build a fill-in-the-blank prompt.
 *
 * Returns null when the word isn't actually there. That case has to be a
 * refusal rather than a fallback: a "cloze" that kept its answer in place
 * (`b === s`) shows the learner the word it is asking them to produce, which
 * is worse than having no fill-in-the-blank question at all.
 */
function makeCloze(sentence, surface) {
  if (!sentence || !surface) return null;

  const i = sentence.indexOf(surface);
  if (i >= 0) return sentence.slice(0, i) + "_____" + sentence.slice(i + surface.length);

  // The dictionary form doesn't always appear verbatim — "blanc" shows up as
  // "blanche", "Mutter" as "Mutter," at a clause end. Walk real word segments
  // and blank the first one that normalizes equal.
  const want = normalize(surface);
  let at = 0;
  for (const seg of segmentSentence(sentence)) {
    if (seg.type === "word" && normalize(seg.v) === want) {
      return sentence.slice(0, at) + "_____" + sentence.slice(at + seg.v.length);
    }
    at += seg.v.length;
  }
  return null;
}
function acceptableTargets(word, lang) {
  const forms = [word.t];
  if (lang === "de" && word.g) forms.push(`${word.g} ${word.t}`);
  // French nouns are learned with their article, so "une démarche" is as
  // correct an answer as "démarche". (Elided forms keep the article in `t`.)
  if (lang === "fr" && word.art) forms.push(`${word.art} ${word.t}`);
  if (word.alt) forms.push(word.alt);
  // Accept the full citation form too, for anyone who types what the card shows.
  if (word.rek) forms.push(word.rek.includes("+") ? `${word.t} ${word.rek}` : `${word.t} + ${word.rek}`);
  return forms;
}
function matchTarget(input, word, lang) {
  return acceptableTargets(word, lang).some((f) => answersMatch(input, f));
}
function matchEnglish(input, word) {
  return acceptableEnglish(word).some((f) => answersMatch(input, f));
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const QUESTION_KINDS = ["toTarget", "toEnglish", "fillBlank"];

/** Curated words always have a usable cloze; a word you added yourself may not. */
function hasCloze(w) {
  return Boolean(w.b && w.b.includes("_____") && (w.ba || w.t));
}

/** A C1 verb is identified by its headword, since several share an infinitive. */
function verbKey(v) {
  return v.label || v.inf;
}

/**
 * The questions a batch earns.
 *
 * `cardFor` supplies the SM-2 card for an entry, so the queue can ask a new
 * word only to recognise and a known word to produce. Passing nothing keeps
 * the old behaviour — every kind for every word — which is what a caller with
 * no scheduling context should get.
 */
function buildPracticeQueue(entries, cardFor, {review=false}={}) {
  const items = [];
  entries.forEach(({ word: w, level: lv, directions }) => {
    const kinds = cardFor
      ? kindsForCard(w, cardFor(w, lv), { hasCloze })
      /* Without a cloze this renders an empty prompt and then marks the
       * learner wrong for not guessing it. */
      : QUESTION_KINDS.filter((k) => k !== "fillBlank" || hasCloze(w));
    const selected = review && directions?.length
      ? kinds.filter(kind=>directions.includes(kind==="toEnglish"?"recognise":"produce"))
      : kinds;
    if(review && directions?.includes("produce") && !selected.some(kind=>kind!=="toEnglish")) selected.push("toTarget");
    selected.forEach((kind) => {
      const pair=cardFor?.(w,lv);const card=kind==="toEnglish"?pair?.rec:pair?.prod;
      items.push({ kind, word: w, level: lv, practiceOnly:!!card&&!isReady(card),id: `${lv}::${w.t}::${kind}` });
    });
  });
  return shuffle(items);
}

/** The value a given question type asks the learner to select. */
function choiceValueOf(word, kind, lang) {
  if (kind === "toEnglish") return word.e;
  if (kind === "fillBlank") return word.ba || word.t;
  return lang === "de" && word.g ? `${word.g} ${word.t}` : word.t;
}

/**
 * Build the option list for one multiple-choice question.
 * Distractors come from the same themed batch first — they're semantically
 * adjacent, so the choice is actually meaningful — falling back to the wider
 * deck when the batch is too small. For German nouns asked in the target
 * direction, half the time the distractors are the same noun with the wrong
 * article, which turns the question into gender drilling.
 */
function buildChoiceOptions(item, batchPool, widePool, lang, count = 3) {
  const w = item.word;

  if (lang === "de" && item.kind === "toTarget" && w.g && Math.random() < 0.5) {
    const correct = `${w.g} ${w.t}`;
    return { correct, options: shuffle(["der", "die", "das"].map((a) => `${a} ${w.t}`)), genderMode: true };
  }

  const correct = choiceValueOf(w, item.kind, lang);
  const used = new Set([normalize(correct)]);
  const answerMeaning = normalize(w.e);
  const picks = [];

  const consider = (entry) => {
    if (picks.length >= count - 1) return;
    const x = entry && entry.word ? entry.word : entry;
    if (!x || x.t === w.t) return;
    const v = choiceValueOf(x, item.kind, lang);
    if (!v) return;
    const nv = normalize(v);
    if (used.has(nv)) return;
    // never offer a distractor that would also be a defensible answer
    if (item.kind === "toEnglish" && normalize(x.e) === answerMeaning) return;
    used.add(nv);
    picks.push(v);
  };

  shuffle(batchPool).forEach(consider);
  if (picks.length < count - 1) shuffle(widePool).forEach(consider);

  return { correct, options: shuffle([correct, ...picks]), genderMode: false };
}

/* ---------------------------------------------------------------------- */
/* Audio                                                                    */
/* ---------------------------------------------------------------------- */
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices() || []);
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", load);
  }, []);
  return voices;
}
/**
 * Pick a voice for a locale, preferring one that will actually speak.
 *
 * macOS advertises novelty voices — "Eddy (French (France))", "Grandma (…)",
 * "Flo (…)" — that report as available but are often not installed, and then
 * never start and never error. Taking the first locale match landed on exactly
 * those, so plain-named system voices (Thomas, Amélie, Anna) are ranked first.
 */
function pickVoice(voices, locale) {
  if (!voices || !voices.length) return null;
  const loc = locale.toLowerCase();
  const prefix = loc.slice(0, 2);
  const exact = (v) => v.lang && v.lang.toLowerCase().replace("_", "-") === loc;
  const sameLang = (v) => v.lang && v.lang.toLowerCase().startsWith(prefix);
  const plain = (v) => !/[()]/.test(v.name);

  const best = (list) =>
    list.find((v) => v.default && plain(v)) || list.find(plain) || list[0] || null;

  return best(voices.filter(exact)) || best(voices.filter(sameLang)) || null;
}
/**
 * Speak `text`, working around two ways the platform engine goes silent.
 *
 * 1. Calling `cancel()` and `speak()` in the same task wedges WebKit and
 *    Chromium: the utterance is accepted, `speaking` latches true, and no
 *    start/end/error ever fires — so every later call queues behind a phantom
 *    that never finishes. The speak has to happen on a later task.
 * 2. `speaking` can already be stuck from a previous wedge (or from the tab
 *    being backgrounded mid-utterance), so cancel/resume first to clear it.
 */
/* How fast the voices talk.
 *
 * System voices default to a native-speaker pace, which is the one thing a
 * learner cannot follow — the words run together exactly where the joins are
 * hardest. `NORMAL` is deliberately below 1: slow enough to hear a liaison or
 * a final consonant, fast enough to still sound like speech rather than
 * dictation. `SLOW` is the dictation replay, and stays well clear of NORMAL so
 * the two are audibly different. */
const SPEECH_RATE = { NORMAL: 0.78, SLOW: 0.55 };

/**
 * How long to leave between items when reading a list aloud.
 *
 * `speakWith` cancels whatever is still speaking before it starts, so a stagger
 * shorter than the utterance silently truncates the previous one — and slowing
 * the rate made the old fixed gaps too short. Scaling with the text length and
 * with the rate keeps "hear all" from clipping "ils/elles sont" while not
 * leaving a dead pause after "j'ai".
 */
function speechGap(text, rate = SPEECH_RATE.NORMAL) {
  const chars = String(text || "").length;
  return Math.round((450 + chars * 75) / rate);
}

function speakWith(text, voice, locale, rate = SPEECH_RATE.NORMAL) {
  try {
    if (!("speechSynthesis" in window) || !voice || !text) return;
    const synth = window.speechSynthesis;

    synth.cancel();
    synth.resume();          // a stuck `paused` state is silent in the same way

    setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang || locale;
        u.rate = rate;
        // If it never starts, clear the queue so the next tap isn't swallowed.
        let started = false;
        const guard = setTimeout(() => { if (!started) synth.cancel(); }, 1000);
        u.onstart = () => { started = true; clearTimeout(guard); };
        u.onerror = () => { clearTimeout(guard); synth.cancel(); };
        synth.speak(u);
      } catch {}
    }, 60);
  } catch {}
}

/* ---------------------------------------------------------------------- */
/* Persistence + spaced-repetition scheduling                              */
/*                                                                         */
/* Storage uses the artifact key-value API when available. If it isn't,    */
/* everything still works — it just falls back to in-memory state that     */
/* lasts for the session, exactly like the previous behaviour. Nothing     */
/* here ever throws into the UI.                                           */
/* ---------------------------------------------------------------------- */
/**
 * Bring a stored word record up to the current shape, at read time.
 *
 * Records written before the verification pass existed have no `ver` field,
 * and that absence *is* the migration signal — which is why there's no schema
 * version here and nothing new in emptyProgress(). Note the load path merges
 * shallowly, so a nested default wouldn't have applied anyway.
 */
function normalizeImportedRecord(rec) {
  const out = { ...rec };
  if (!out.e) out.e = "(no gloss)";
  // A "cloze" that lost its blank displays the answer. Rebuild it or drop it.
  if (out.b && !out.b.includes("_____")) out.b = undefined;
  if (!out.b && out.s && out.ba) out.b = makeCloze(out.s, out.ba) || undefined;
  if (out.b && !out.ba) out.ba = out.t;
  return out;
}

/* ---- progress shape ---- */
function bumpStreak(p) {
  const today = todayKey();
  if (p.lastStudy === today) return p;
  const streak = p.lastStudy === addDays(today, -1) ? (p.streak || 0) + 1 : 1;
  return { ...p, streak, longest: Math.max(p.longest || 0, streak), lastStudy: today };
}
function logReview(p, correct, details = {}) {
  return logAnswer(p, correct, details);
}

/* ---------------------------------------------------------------------- */
/* Listening + speaking helpers                                            */
/* ---------------------------------------------------------------------- */

/** Positional token comparison, used to highlight exactly which words were missed. */
function diffTokens(expected, got) {
  const e = expected.trim().split(/\s+/);
  const g = got.trim().split(/\s+/);
  return e.map((tok, i) => ({ tok, ok: normalize(g[i] || "") === normalize(tok) }));
}
/** Fraction of expected tokens typed/said correctly, position-independent. */
function tokenOverlap(expected, got) {
  const e = expected.trim().split(/\s+/).map(normalize).filter(Boolean);
  const g = new Set(got.trim().split(/\s+/).map(normalize).filter(Boolean));
  if (!e.length) return 0;
  return e.filter((t) => g.has(t)).length / e.length;
}
/**
 * Each word of the target, marked against what the recogniser heard.
 *
 * Position-independent on purpose: speech recognition reorders and drops
 * freely, so requiring the same index would mark a fluent attempt as a
 * failure. "unclear" is for a word the recogniser produced something similar
 * to — a shared stem — which is usually a pronunciation problem rather than a
 * missed word, and worth distinguishing from silence.
 */
function heardWords(expected, transcript) {
  const heard = transcript.trim().split(/\s+/).map(normalize).filter(Boolean);
  const pool = new Set(heard);
  return expected.trim().split(/\s+/).map((tok) => {
    const k = normalize(tok.replace(/[.,!?;:«»"']/g, ""));
    if (!k) return { tok, state: "skip" };
    if (pool.has(k)) return { tok, state: "heard" };
    const near = k.length >= 4 && heard.some((h) => h.length >= 4 && (h.startsWith(k.slice(0, 4)) || k.startsWith(h.slice(0, 4))));
    return { tok, state: near ? "unclear" : "missed" };
  });
}

/** Whole-sentence match, forgiving of punctuation/accents/case via normalize(). */
function sentenceMatches(expected, got) {
  return normalize(expected.replace(/[.,!?;:"'—-]/g, " ")) === normalize(got.replace(/[.,!?;:"'—-]/g, " "));
}
/**
 * Which niceties were missed when the spelling is otherwise right.
 *
 * The sentence stage accepts an answer whose letters are correct but whose
 * accents, capitals or ß are not — being told "wrong" for a missing acute is
 * discouraging and teaches nothing. Instead the answer passes and this reports
 * exactly which words to look at.
 */
function sentenceSlips(expected, got) {
  const bare = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,!?;:"'…«»]/g, "");
  const eTok = expected.trim().split(/\s+/);
  const gTok = got.trim().split(/\s+/);
  const slips = [];

  eTok.forEach((e, i) => {
    const g = gTok[i];
    if (!g || e === g) return;
    const eB = bare(e), gB = bare(g);
    if (eB === gB) {
      slips.push({ word: e, kind: "accent" });                       // café vs cafe
    } else if (eB.toLowerCase() === gB.toLowerCase()) {
      slips.push({ word: e, kind: "capital" });                      // Der vs der
    } else if (eB.toLowerCase().replace(/ß/g, "ss") === gB.toLowerCase().replace(/ß/g, "ss")) {
      slips.push({ word: e, kind: "eszett" });                       // große vs grosse
    }
  });
  return slips;
}

const SLIP_TEXT = {
  accent: "don't forget the accent",
  capital: "watch the capital letter",
  eszett: "that one takes ß",
};

function speechRecognitionAvailable() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/* ---------------------------------------------------------------------- */
/* Small components                                                        */
/* ---------------------------------------------------------------------- */
/* Renders whatever imagery a word resolves to. Four shapes, because "picture
 * of a word" isn't one thing: an object is a drawing, a colour is a swatch, a
 * number is a numeral. Returns null when nothing fits, so every caller must
 * cope with having no image — most of B1 upward has none. */
/**
 * A word that can explain itself.
 *
 * Hover works on a pointer; the app is laid out at phone width, where hover
 * does not exist, so a tap opens the same bubble. `gloss` may be null — a word
 * with no entry stays plain rather than offering an empty tooltip.
 */
/* Only one bubble at a time. Each word owns its own open state, so without a
 * coordinator, tapping along a sentence leaves a trail of them standing. */
let closeOpenGloss = null;

function Glossed({ gloss, children, className, style, underline = false, word }) {
  const [open, setOpen] = useState(false);
  useEffect(() => () => { if (closeOpenGloss === setOpen) closeOpenGloss = null; }, []);
  if (!gloss) return <span className={className} style={style}>{children}</span>;

  const show = () => {
    if (closeOpenGloss && closeOpenGloss !== setOpen) closeOpenGloss(false);
    closeOpenGloss = setOpen;
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    if (closeOpenGloss === setOpen) closeOpenGloss = null;
  };
  return (
    <span className="relative inline-block">
      <span
        role="button"
        tabIndex={0}
        aria-label={`${word ?? (typeof children === "string" ? children : "")} — ${gloss}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => { e.stopPropagation(); if (open) hide(); else show(); }}
        className={className}
        style={{ ...style, cursor: "help", textDecoration: underline ? "underline" : style?.textDecoration }}
      >
        {children}
      </span>
      {open && (
        <span
          className="absolute z-20 left-1/2 bottom-full mb-1.5 px-2.5 py-1.5 rounded-md text-xs font-serif normal-case"
          style={{
            transform: "translateX(-50%)",
            backgroundColor: C.ink,
            color: C.card,
            whiteSpace: "normal",
            width: "max-content",
            maxWidth: "15rem",
            lineHeight: 1.35,
            boxShadow: "0 2px 8px rgba(0,0,0,.2)",
            pointerEvents: "none",
          }}
        >
          {gloss}
        </span>
      )}
    </span>
  );
}

/**
 * A sentence whose words can each be looked up.
 *
 * Coverage is partial by design — the dictionary resolves about three quarters
 * of the words in the example sentences, and an inflected content word with no
 * entry simply renders plain. `tone` lets the diff view colour each word by
 * whether it was typed correctly without duplicating the segmentation.
 */
function GlossedSentence({ text, dict, tone }) {
  return (
    <span className="inline">
      {segmentSentence(text).map((seg, i) =>
        seg.type !== "word" ? (
          <span key={i}>{seg.v}</span>
        ) : (
          <Glossed key={i} gloss={describeWord(dict, seg.v)} style={tone ? tone(seg.v, i) : undefined}>
            {seg.v}
          </Glossed>
        ),
      )}
    </span>
  );
}

/** The keyboard shortcut for an option, shown only where keys exist. */
function KeyCap({ n, tone = "ink" }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded text-[0.6875rem] font-semibold shrink-0"
      style={{
        width: 18, height: 18, lineHeight: 1,
        border: `1px solid ${tone === "card" ? C.card : C.line}`,
        color: tone === "card" ? C.card : C.muted,
        opacity: 0.85,
      }}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

function WordImage({ word, size = 72 }) {
  const img = imageFor(word);
  if (!img) return null;

  if (img.kind === "swatch") {
    return (
      <span
        aria-label={word.e}
        className="rounded-full inline-block"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          backgroundColor: img.color,
          border: `2px solid ${img.color === "#FFFFFF" ? C.line : "transparent"}`,
          boxShadow: "inset 0 -3px 0 rgba(0,0,0,.08)",
        }}
      />
    );
  }
  if (img.kind === "numeral") {
    return (
      <span className="font-type inline-flex items-center justify-center" style={{ fontSize: size * 0.62, color: C.ink, lineHeight: 1 }}>
        {img.text}
      </span>
    );
  }
  return <img src={img.src} alt="" width={size} height={size} style={{ display: "block" }} draggable={false} />;
}

/* Where this word sits in a frequency list.
 *
 * A learner has no way to tell a word that buys 70% coverage from one that
 * buys almost none — the deck looks the same either way. The tag is muted
 * because it is context, not instruction: nobody should skip a word for being
 * uncommon, but they deserve to know which ones are load-bearing. */
function FreqTag({ lang, word }) {
  const info = rankLabel(lang, WORD_RANK[lang]?.[word]);
  if (!info.ranked) return null;   // "beyond the list" is not worth a badge
  return (
    <span className="text-[0.625rem] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
      title={info.note}
      style={{ backgroundColor: C.paper, color: C.muted, border: `1px solid ${C.line}` }}>
      {info.label}
    </span>
  );
}

function GenderTag({ g, size = "sm" }) {
  if (!g) return null;
  return (
    <span className={`font-semibold ${size === "lg" ? "text-2xl" : "text-sm"}`} style={{ color: GENDER[g] }}>
      {g}
    </span>
  );
}
/* French marks gender with the article rather than a der/die/das tag, so it
 * gets its own display element — coloured to match the German one so masculine
 * and feminine read the same way across both languages. */
const FR_GENDER = { m: GENDER.der, f: GENDER.die };
function ArticleTag({ w, size = "sm" }) {
  if (!w || !w.art) return null;
  return (
    <span className={`font-semibold ${size === "lg" ? "text-2xl" : "text-sm"}`} style={{ color: FR_GENDER[w.gen] || C.muted }}>
      {w.art}
    </span>
  );
}
/* Rektion — the preposition and case a German verb governs.
 *
 * It renders on the *front* of the card deliberately: at B2+ the vocabulary
 * item is "eingehen auf + Akk.", not "eingehen". A bare stem is a different,
 * and often wrong, word. Display only — the typed answer stays `t`. */
function RektionTag({ w }) {
  if (!w || !w.rek) return null;
  return (
    <span className="font-serif text-base" style={{ color: C.muted }}>
      {w.rek.includes("+") ? w.rek : `+ ${w.rek}`}
    </span>
  );
}
/**
 * What the word means, shown after every answer.
 *
 * Knowing the answer was "sie sind" or "épanouir" without knowing what it means
 * teaches nothing. For toEnglish the answer already *is* the meaning, so this
 * shows the target word instead — the pairing is what matters either way.
 */
function AnswerGloss({ w, kind, lang }) {
  if (!w) return null;
  // The full citation form, not the bare stem: "une démarche", "die Wehmut",
  // "eingehen auf + Akk." — the article and the government are part of the word.
  const target = [
    lang === "de" && w.g ? w.g : null,
    lang === "fr" && w.art ? w.art : null,
    w.t,
    w.rek ? (w.rek.includes("+") ? w.rek : `+ ${w.rek}`) : null,
  ].filter(Boolean).join(" ");

  return (
    <div className="font-serif text-sm mt-2" style={{ color: C.ink }}>
      {/* Both sides of the card. The prompt showed one of them, but seeing the
          pair together is the thing that actually sticks. */}
      <span style={{ color: C.ink }}>{target}</span>
      <span style={{ color: C.muted }}> — {w.e}</span>
      {w.n && <div className="italic text-xs" style={{ color: C.accent }}>{w.n}</div>}
      {kind === "fillBlank" && w.se && <div className="text-xs" style={{ color: C.muted }}>{w.se}</div>}
    </div>
  );
}
function GenderLegend() {
  return (
    <div className="flex items-center gap-3 justify-center text-xs rounded-md py-2 px-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.muted }}>
      <span>Gender:</span>
      {["der", "die", "das"].map((g) => (
        <span key={g} className="font-semibold" style={{ color: GENDER[g] }}>{g}</span>
      ))}
    </div>
  );
}
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-semibold rounded-t-md transition-colors"
      style={{ backgroundColor: active ? C.card : "transparent", color: active ? C.ink : C.muted, borderBottom: active ? `3px solid ${C.gold}` : `3px solid transparent` }}
    >
      {children}
    </button>
  );
}
const VERDICT_STYLE = {
  ok: { label: "checked", color: "green" },
  "needs-fix": { label: "needs a fix", color: "red" },
  ambiguous: { label: "depends on sense", color: "gold" },
  fixed: { label: "corrected", color: "green" },
  kept: { label: "yours, kept", color: "gold" },
  lesson: { label: "from a lesson", color: "green" },
  unchecked: { label: "unchecked", color: "muted" },
};
function VerdictPill({ v }) {
  const s = VERDICT_STYLE[v] || VERDICT_STYLE.unchecked;
  const col = C[s.color];
  return (
    <span
      className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.color === "muted" ? "transparent" : col, color: s.color === "muted" ? C.muted : C.card, border: `1px solid ${col}` }}
    >
      {s.label}
    </span>
  );
}
/* ---------------------------------------------------------------------- */
/* Main component                                                          */
/* ---------------------------------------------------------------------- */
  function conjMcOptions(item,lang,tenseSet) {
    const forms = conjugate(lang, item.verb, item.tenseKey);
    const correct = forms[item.personIdx];
    const seen = new Set([normalize(correct)]);
    const pool = [];
    forms.forEach((f, i) => {
      if (i === item.personIdx || f == null) return;
      const k = normalize(f);
      if (seen.has(k)) return;
      seen.add(k);
      pool.push(f);
    });
    // Some verbs repeat a form across persons (German wir/sie, French je/il), so
    // there may be fewer than four distinct forms. Top up from the same verb's
    // other tenses rather than showing two options.
    if (pool.length < 3) {
      for (const t of tenseSet) {
        if (t.key === item.tenseKey) continue;
        for (const f of conjugate(lang, item.verb, t.key)) {
          if (f == null) continue;
          const k = normalize(f);
          if (seen.has(k)) continue;
          seen.add(k);
          pool.push(f);
          if (pool.length >= 3) break;
        }
        if (pool.length >= 3) break;
      }
    }
    return { correct, options: shuffle([correct, ...shuffle(pool).slice(0, 3)]) };
  }


export default function VocabDrawer() {
  const [screen, setScreen] = useState("today");
  const [lang, setLang] = useState("fr");
  const [studioContext,setStudioContext]=useState({});
  const [level, setLevel] = useState("A1");
  const importGeneration=useRef(0);
  const [vocabularyRevision,setVocabularyRevision]=useState(0);
  const [vocabularyLoading,setVocabularyLoading]=useState(false);
  const [vocabularyError,setVocabularyError]=useState("");
  const [mode, setMode] = useState("theme"); // 'theme' | 'mixed'
  const [batchSize, setBatchSize] = useState(10);
  const [batchIndex, setBatchIndex] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);

  const [learnIdx, setLearnIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [pending, setPending] = useState({ left: null, right: null });
  const [wrongFlash, setWrongFlash] = useState(false);

  const [queue, setQueue] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [retired, setRetired] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [feedback, setFeedback] = useState(null);
  const seenRef = useRef(new Set());
  const firstWrongRef = useRef(new Set());
  const missedRef = useRef(new Map());
  const everMissedRef = useRef(new Set());
  const sessionResultsRef = useRef(new Map());
  const sessionMetaRef = useRef({id:eventId(),lang});
  const assistedRef = useRef(new Set());
  function beginReviewSession() {
    sessionMetaRef.current={id:eventId(),lang};
    sessionResultsRef.current=new Map();
    assistedRef.current=new Set();
    sessionCommittedRef.current=false;
  }
  function snapshotSession() {
    if(sessionCommittedRef.current)return null;
    return {...sessionMetaRef.current, results:[...sessionResultsRef.current].map(([id,row])=>[id,{...row,answeredAt:row.answeredAt||Date.now()}])};
  }

  // --- Sentence stage: type the whole example, not just the word ---
  /* A queue rather than an index walk: a sentence you got wrong comes back
   * later in the same sitting, which is the whole point for phrase building. */
  const [sentQueue, setSentQueue] = useState([]);        // [{word, level}]

  /* Number badges and the "press Enter" hints are only shown where the keys
   * exist. A phone has neither, and the badges are pure clutter there. */
  const [hasKeys] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false,
  );

  /* Sentence Constructions — its own section, not a stage of a drawer. */
  /** The ledger word being looked at, if any — a peek, never a re-queue. */
  /* Set when Enter arrives on an empty box. A blank answer is a slip, not a
   * wrong answer — grading it would record a miss and push the card's next
   * review out, which is a real cost for hitting Enter twice. */
  const [blankNudge, setBlankNudge] = useState(false);

  const [ledgerPeek, setLedgerPeek] = useState(null);

  /* Workbench: a verb, a tense, and one blanked cell in the table. Kept apart
   * from the drill's state (`conjQueue` and friends) so that browsing here can
   * never disturb a sitting in progress. */
  const [wbVerbKey, setWbVerbKey] = useState(null);
  const [wbTense, setWbTense] = useState(null);
  const [wbBlank, setWbBlank] = useState(2);
  /* What "Drill <verb>" covers. Defaults to the tense on screen, because the
   * old behaviour — every tense the verb has — asked for the subjunctive of a
   * verb you had only met in the present. */
  const [wbDrillScope, setWbDrillScope] = useState("tense");
  const [wbInput, setWbInput] = useState("");
  const [wbResult, setWbResult] = useState(null);
  const [wbStats, setWbStats] = useState({ answered: 0, right: 0 });

  /** Cells picked on the coverage matrix, as `${verbKey}:${tenseKey}`. */
  const [conjPicked2, setConjPicked2] = useState(() => new Set());

  const [sentcTense, setSentcTense] = useState(null);      // tense key, null = not chosen
  const [sentcVerbMode, setSentcVerbMode] = useState("random");
  const [sentcPicked, setSentcPicked] = useState([]);      // verb infinitives
  const [sentcRound, setSentcRound] = useState([]);        // built items
  const [sentcIdx, setSentcIdx] = useState(0);
  const [sentcPlaced, setSentcPlaced] = useState([]);      // tiles laid in the answer row
  const [sentcBank, setSentcBank] = useState([]);          // {id, tok} still in the bank
  const [sentcShape, setSentcShape] = useState("plain");
  const [sentcResult, setSentcResult] = useState(null);
  /* Typing a tile's opening letters places it, the same way the desktop
   * sentence stage works. Numbers meant reading the badge, finding the digit
   * and pressing it — three steps for a tile whose first letter you are
   * already looking at. */
  const [sentcTyped, setSentcTyped] = useState("");
  const [sentcTypeMiss, setSentcTypeMiss] = useState(false);
  const [sentcRight, setSentcRight] = useState(0);
  const [sentTotal, setSentTotal] = useState(0);
  const [sentRetired, setSentRetired] = useState(0);
  const [sentInput, setSentInput] = useState("");
  const [sentResult, setSentResult] = useState(null);    // {ok, slips, diff, retry}
  const [sentRetry, setSentRetry] = useState(false);     // mid immediate-redo
  /* Desktop's sentence stage offers a word bank as well as the typing box.
   * `sentPlaced` is the answer being assembled; `sentTaken` marks which bank
   * chips have been used, so a sentence with a repeated word ("de … de") still
   * has two chips to place. */
  const [sentMode, setSentMode] = useState("chips");
  const [sentPlaced, setSentPlaced] = useState([]);
  const [sentTaken, setSentTaken] = useState([]);
  /* Typing a chip's first letters places it, which is faster than reaching for
   * the mouse. `sentTyped` is what has been typed towards the next chip;
   * `sentTypeMiss` flags a letter no remaining chip starts with, so the buffer
   * can say so instead of silently swallowing the key. */
  const [sentTyped, setSentTyped] = useState("");
  const [sentTypeMiss, setSentTypeMiss] = useState(false);
  const sentInputRef = useRef(null);

  /* Fluency. A round is a minute of known words against a clock; `flPhase`
   * walks idle → running → done. The answers are collected in a ref rather
   * than state because they are written on every tap and read once at the end,
   * and re-rendering the question because a tally changed would cost exactly
   * the milliseconds the exercise is measuring. */
  /* Collocations: which verb a noun takes. One pass through the whole set;
   * the answers are kept so the round can end with the ones English got wrong
   * for you. */
  const [colPhase, setColPhase] = useState("idle");
  const [colIdx, setColIdx] = useState(0);
  const [colPicked, setColPicked] = useState(null);
  const [colAnswers, setColAnswers] = useState([]);

  const [flDirection, setFlDirection] = useState("recognise");
  const [flPhase, setFlPhase] = useState("idle");
  const [flQueue, setFlQueue] = useState([]);
  const [flIdx, setFlIdx] = useState(0);
  const [flLeft, setFlLeft] = useState(ROUND_SECONDS);
  const [flStreak, setFlStreak] = useState(0);
  const [flWrong, setFlWrong] = useState(null);
  const [flScore, setFlScore] = useState(null);
  /* The best *before* this round. The verdict compares against it, and reading
   * it off the record after saving would compare the round with itself — which
   * told a first-time learner "your best is 45" about the 45 they had just set. */
  const [flPrevBest, setFlPrevBest] = useState(0);
  const flAnswersRef = useRef([]);

  /* Word Roots. `etymView` picks which way in — a root you already know, or a
   * sound change you can run on words you do not. The quiz index is what makes
   * "Next" walk the pairs rather than re-asking the one you just got. */
  /* "build" first: how a word is put together is the view a learner can use
   * this afternoon, where ancestry is context. */
  const [etymView, setEtymView] = useState("build");
  const [bldFamily, setBldFamily] = useState(null);
  const [bldQuizIdx, setBldQuizIdx] = useState(null);
  const [bldPicked, setBldPicked] = useState(null);
  const [bldStats, setBldStats] = useState({ asked: 0, right: 0 });
  const [bldAffix, setBldAffix] = useState(null);
  const [etymFamily, setEtymFamily] = useState(null);
  const [etymLaw, setEtymLaw] = useState(null);
  const [etymQuizIdx, setEtymQuizIdx] = useState(null);   // null = not practising
  const [etymInput, setEtymInput] = useState("");
  const [etymResult, setEtymResult] = useState(null);
  const [etymStats, setEtymStats] = useState({ asked: 0, right: 0 });
  const etymInputRef = useRef(null);

  /* True while the typing stage is offering its immediate second attempt. */
  const [retryMode, setRetryMode] = useState(false);
  const sessionCommittedRef = useRef(false);
  /** What `commitSession` scheduled, per cardId — read by the summary table. */
  const sessionScheduleRef = useRef({});

  const voices = useVoices();
  const voiceForLang = useMemo(() => pickVoice(voices, LANG_INFO[lang].locale), [voices, lang]);
  const audioReady = !!voiceForLang;
  const say = (text) => {
    const rec = recordingFor(lang, text);
    if (!rec) { speakWith(text, voiceForLang, LANG_INFO[lang].locale); return; }
    stopRecording();
    playRecording(rec.url).then((played) => {
      if (!played) speakWith(text, voiceForLang, LANG_INFO[lang].locale);
    });
  };

  /* Speaking in a language that is not the one being studied.
   *
   * The ancestry tree puts French, German and English side by side, and the
   * sound-law tables do the same — so "read this aloud" has to mean "in the
   * language of the column", not "in whatever language the app is set to".
   * Reading `father` with a French voice would be worse than silence. */
  const EXTRA_LOCALE = { fr: "fr-FR", de: "de-DE", en: "en-GB" };
  const voiceByLang = useMemo(() => ({
    fr: pickVoice(voices, "fr-FR"),
    de: pickVoice(voices, "de-DE"),
    en: pickVoice(voices, "en-GB") || pickVoice(voices, "en-US") || pickVoice(voices, "en"),
  }), [voices]);
  /* Latin and the reconstructions have no voice and never will, so the button
   * simply does not appear for them rather than mispronouncing them. */
  const canSayIn = (l) => Boolean(voiceByLang[l]);
  const sayIn = (l, text) => {
    if (!text) return;
    const rec = recordingFor(l, text);
    const v = voiceByLang[l];
    if (!rec) { if (v) speakWith(text, v, EXTRA_LOCALE[l]); return; }
    stopRecording();
    playRecording(rec.url).then((played) => {
      if (!played && v) speakWith(text, v, EXTRA_LOCALE[l]);
    });
  };

  // Persist complete answer evidence and show actual write status.
  const {progress,setProgress,progressLoaded,saveStatus,storageOn,retrySave,recovered,readOnly}=useProgress(snapshotSession);
  const [reviewOnly,setReviewOnly]=useState(false);
  const [activityOverride,setActivityOverride]=useState(null);
  useEffect(()=>setActivityOverride(null),[screen,lang]);
  const activityForScreen={humanListening:'listeningMeaning',today:null,media:'media',missions:'missions',listeningLab:'listeningMeaning',journal:'writing',pronunciation:'pronunciation',retelling:'retelling',challenge:'missions',shelf:'reading',phrasebook:'phrases'}[screen]||({study:'study',reading:'reading',writing:'writing',grammar:'grammar',listening:'dictation',mistakes:'mistakes',lessons:'lessons',phrases:'phrases',fluency:'fluency',collocations:'collocations',etymology:'etymology'}[sectionOf(screen)]);
  usePracticeTime({lang,activity:activityOverride||activityForScreen,loaded:progressLoaded,setProgress,enabled:progress.preferences?.trackTime!==false&&!readOnly});
  const [clock,setClock]=useState(Date.now());
  const profileHydrated=useRef(false);
  useEffect(()=>{if(progressLoaded&&!profileHydrated.current){profileHydrated.current=true;if(['fr','de'].includes(progress.preferences?.lang))setLang(progress.preferences.lang);if(['A1','A2','B1','B2','C1'].includes(progress.preferences?.level))setLevel(progress.preferences.level);}},[progressLoaded,progress.preferences]);
  useEffect(()=>{
    const refresh=()=>setClock(Date.now());
    const timer=setInterval(refresh,15000);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[]);

  useEffect(()=>subscribeVocabulary(()=>setVocabularyRevision(n=>n+1)),[]);
  useEffect(()=>{
    setVocabularyLoading(false);
    const needed=level==='C1'||['placement','progress','passport'].includes(screen)||['listenSelect','dictation','grammarWorkbench'].includes(screen)||Object.keys(progress.cards).some(id=>id.startsWith(`${lang}:C1:`));
    if(!needed||DATA[lang].C1.length)return;
    let active=true;setVocabularyLoading(true);setVocabularyError('');
    loadVocabulary(lang).then(()=>{if(active){setVocabularyLoading(false);}}).catch(()=>{if(active){setVocabularyLoading(false);setVocabularyError('Additional vocabulary is unavailable offline. Reconnect and reload to download it.');}});
    return()=>{active=false;};
  },[lang,level,screen,progress.cards]);

  /** Record one answer against the scheduler. */

  /** Your own words — typed, uploaded, or picked out of a text. Same deck. */
  const importedWords = useMemo(() => {
    const bag = (progress.imported && progress.imported[lang]) || {};
    return Object.values(bag)
      .map(normalizeImportedRecord)
      // Stable order matters: Object.values shifts when a word is added, which
      // would reshuffle the batches you're partway through paging.
      .sort((a, b) => (a.at || "").localeCompare(b.at || "") || a.t.localeCompare(b.t))
      .map((w) => ({ word: w, level: "IMP" }));
    // Depends on progress.imported, not the whole of progress. Answering a
    // question calls setProgress to log the review, and every one of those
    // updaters spreads `imported` through untouched — so keying on the sub-object
    // keeps this array referentially stable mid-question. Keying on `progress`
    // made it churn, which recomputed the choice options and visibly reshuffled
    // the answers the instant you picked one.
  }, [progress.imported, lang]);

  /** Words that have never been through the check — legacy records included. */
  const uncheckedWords = useMemo(() => importedWords.filter(({ word }) => !word.ver), [importedWords]);

  /** Every word in the current language, flattened across all levels, with its level tag. */
  const allWordsForLang = useMemo(() => {
    void vocabularyRevision; // DATA is populated by lazy vocabulary loads.
    const out = [];
    levelsFor(lang).forEach((lv) => {
      DATA[lang][lv].forEach((g) => g.words.forEach((w) => out.push({ word: w, level: lv })));
    });
    return out.concat(importedWords);
  }, [lang, importedWords,vocabularyRevision]);

  /* The words with the most evidence of difficulty, whether or not they are
   * due. Capped at 12 so the session is a sitting rather than a slog. */
  const weakCards = useMemo(
    () => weakestCards({ entries: allWordsForLang, lang, cards: progress.cards, limit: 12 }),
    [allWordsForLang, lang, progress.cards],
  );

  /** Words due right now — in either direction.
   *
   * A word can be due to produce while its recognition card is still weeks
   * away, which is the normal case rather than the exception: production
   * decays faster. Before the split that word simply did not come back. */
  const dueCards = useMemo(() => {
    return allWordsForLang.map(entry=>{
      const rec=progress.cards[cardId(lang,entry.level,entry.word.t)],prod=progress.cards[prodCardId(lang,entry.level,entry.word.t)];
      return {...entry,directions:[...(rec&&isReady(rec,clock)?["recognise"]:[]),...(prod&&isReady(prod,clock)?["produce"]:[])]};
    }).filter(({ word, level: lv }) => {
      const rec = progress.cards[cardId(lang, lv, word.t)];
      const prod = progress.cards[prodCardId(lang, lv, word.t)];
      /* `isReady`, not `isDue`: a word met minutes ago is due by the
       * calendar and is not worth asking yet. */
      return (rec && isReady(rec,clock)) || (prod && isReady(prod,clock));
    });
  }, [allWordsForLang, progress, lang, clock]);

  const studiedCount = useMemo(
    () => allWordsForLang.filter(({ word, level: lv }) => !!progress.cards[cardId(lang, lv, word.t)]).length,
    [allWordsForLang, progress, lang]
  );
  const reviewedToday = progress.history[todayKey()]?.reviews || 0;

  // --- Dictation state ---
  const [dictLevel, setDictLevel] = useState("A1");
  const [dictQueue, setDictQueue] = useState([]);   // [{word, level}]
  const [dictIdx, setDictIdx] = useState(0);
  const [dictInput, setDictInput] = useState("");
  const [dictResult, setDictResult] = useState(null); // {ok, diff, overlap}
  const [dictScore, setDictScore] = useState(0);
  const [dictShowHint, setDictShowHint] = useState(false);
  const dictInputRef = useRef(null);

  // --- Speaking state ---
  /* Which half of the listening area is showing. Desktop presents them as one
   * frame with a toggle; mobile still has two screens, and `screen` stays the
   * source of truth there. */
  const [listenMode, setListenMode] = useState("dictation");
  const [speakQueue, setSpeakQueue] = useState([]);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [speakListening, setSpeakListening] = useState(false);
  const [speakTranscript, setSpeakTranscript] = useState("");
  const [speakResult, setSpeakResult] = useState(null); // {overlap}
  const [speakError, setSpeakError] = useState(null);
  const [speakScore, setSpeakScore] = useState(0);
  const recRef = useRef(null);
  const micSupported = speechRecognitionAvailable();

  /* Every level with sentences to play, which now includes C1. */
  const audioLevels = useMemo(() => audioLevelsFor(lang), [lang]);
  useEffect(() => {
    if (!audioLevels.includes(dictLevel)) setDictLevel(audioLevels[0] || "A1");
  }, [audioLevels, dictLevel]);

  const dictItem = dictQueue[dictIdx];
  const speakItem = speakQueue[speakIdx];

  /* Per-line outcomes for the desktop set rail. Mobile has no room for one and
   * shows a score on a "done" screen instead; keeping the record here rather
   * than deriving it from the score is what lets the rail replace that screen. */
  const [audioLog, setAudioLog] = useState({});
  const recordAudioLine = (i, state) => setAudioLog((l) => ({ ...l, [i]: state }));

  const audioRows = useMemo(() => {
    const queue = listenMode === "dictation" ? dictQueue : speakQueue;
    const at = listenMode === "dictation" ? dictIdx : speakIdx;
    return queue.map((row, i) => ({
      label: row.word.t,
      state: audioLog[i] || (i < at ? "skipped" : "not yet"),
      settled: Boolean(audioLog[i]),
    }));
  }, [listenMode, dictQueue, speakQueue, dictIdx, speakIdx, audioLog]);

  useEffect(() => {
    if (screen === "dictation" && dictInputRef.current) dictInputRef.current.focus();
  }, [screen, dictIdx]);

  /** Build a listening/speaking session: due cards if asked, else a slice of the level. */
  function buildAudioSession(source, lvl, size = 10) {
    let pool;
    if (source === "due" && dueCards.length) pool = dueCards;
    else {
      pool = [];
      DATA[lang][lvl].forEach((g) => g.words.forEach((w) => pool.push({ word: w, level: lvl })));
    }
    return shuffle(pool).slice(0, size);
  }

  function startDictation(source, lvl) {
    setAudioLog({});
    setListenMode("dictation");
    const q = buildAudioSession(source, lvl);
    setDictQueue(q);
    setDictIdx(0);
    setDictInput("");
    setDictResult(null);
    setDictScore(0);
    setDictShowHint(false);
    beginReviewSession();
    sessionCommittedRef.current = false;
    setScreen("dictation");
    // speak the first sentence shortly after the screen mounts
    setTimeout(() => { if (q[0]) say(q[0].word.s); }, 350);
  }

  function checkDictation() {
    noteWork("dictation");
    if (!dictItem || dictResult) return;
    const expected = dictItem.word.s;
    const ok = sentenceMatches(expected, dictInput);
    const overlap = tokenOverlap(expected, dictInput);
    setDictResult({ ok, diff: diffTokens(expected, dictInput), overlap });
    if (ok) setDictScore((s) => s + 1);
    recordAudioLine(dictIdx, ok ? "first try" : overlap >= 0.7 ? "near miss" : "missed");

    setProgress((p) => bumpStreak(logReview(p, ok,{lang,kind:audioReady?"dictation":"supported-copy",assisted:!audioReady||dictShowHint})));
  }

  function nextDictation() {
    setDictResult(null);
    setDictInput("");
    setDictShowHint(false);
    if (dictIdx + 1 < dictQueue.length) {
      const n = dictIdx + 1;
      setDictIdx(n);
      setTimeout(() => say(dictQueue[n].word.s), 250);
    } else {
      commitSession();
      setScreen("dictationDone");
    }
  }

  function startSpeaking(source, lvl) {
    setAudioLog({});
    setListenMode("speaking");
    const q = buildAudioSession(source, lvl, 8);
    setSpeakQueue(q);
    setSpeakIdx(0);
    setSpeakTranscript("");
    setSpeakResult(null);
    setSpeakError(null);
    setSpeakScore(0);
    beginReviewSession();
    sessionCommittedRef.current = false;
    setScreen("speaking");
  }

  function beginListening() {
    if (speakListening || !speakItem) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeakError("This browser has no speech recognition."); return; }
    setSpeakError(null);
    setSpeakTranscript("");
    setSpeakResult(null);
    try {
      const r = new SR();
      r.lang = LANG_INFO[lang].locale;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.continuous = false;
      r.onresult = (e) => {
        const said = e.results?.[0]?.[0]?.transcript || "";
        setSpeakTranscript(said);
        if(sessionMetaRef.current.lang!==lang)return;
        const evidence=speechEvidence(speakItem.word.s,said);
        const overlap=evidence.overlap;
        /* A percentage says how much came through and never which word did
         * not. `heardWords` marks each word of the target against the
         * transcript — the same per-word treatment dictation has always had,
         * and the thing that makes the feedback actionable. */
        setSpeakResult({ overlap, words: heardWords(speakItem.word.s, said) });
        if (evidence.matches) setSpeakScore((s) => s + 1);
        recordAudioLine(speakIdx, evidence.matches ? "first try" : "missed");
        setProgress((p) => bumpStreak(logReview(p, evidence.matches,{kind:"read-aloud",lang,assisted:true})));
        noteWork("speaking");
      };
      r.onerror = (e) => {
        const code = e?.error || "unknown";
        setSpeakError(
          code === "not-allowed" || code === "service-not-allowed"
            ? "Microphone access was blocked. This often can't be granted inside an embedded frame."
            : code === "no-speech"
            ? "Didn't catch anything — try again a bit louder."
            : `Speech recognition failed (${code}).`
        );
        setSpeakListening(false);
      };
      r.onend = () => setSpeakListening(false);
      recRef.current = r;
      setSpeakListening(true);
      r.start();
    } catch {
      // Permission refused, no device, or an insecure origin — the user-facing
      // message is the same for all three, and the browser has already logged it.
      setSpeakError("Couldn't start the microphone here.");
      setSpeakListening(false);
    }
  }
  function stopListening() {
    // Already stopped, or never started — either way there is nothing to stop.
    try { recRef.current?.stop(); } catch { /* not recording */ }
    setSpeakListening(false);
  }
  function nextSpeaking() {
    stopListening();
    setSpeakTranscript("");
    setSpeakResult(null);
    setSpeakError(null);
    if (speakIdx + 1 < speakQueue.length) setSpeakIdx((i) => i + 1);
    else { commitSession(); setScreen("speakingDone"); }
  }

  // --- Conjugation trainer state ---
  const [conjTense, setConjTense] = useState(null);   // tense key, null = all
  const [conjQueue, setConjQueue] = useState([]);      // [{verb, tenseKey, personIdx}]
  const [conjIdx, setConjIdx] = useState(0);
  const [conjInput, setConjInput] = useState("");
  const [conjResult, setConjResult] = useState(null);  // {ok, expected, note}
  const [conjScore, setConjScore] = useState(0);
  const [grammarIdx, setGrammarIdx] = useState(null);  // index into GRAMMAR[lang], null = list

  /* --- Placement: where to start, for someone not starting from nothing --- */
  const [placeStage, setPlaceStage] = useState("offer");   // offer | asking | done
  const [placeLevelIdx, setPlaceLevelIdx] = useState(0);
  const [placeQs, setPlaceQs] = useState([]);
  const [placeIdx, setPlaceIdx] = useState(0);
  const [placePicked, setPlacePicked] = useState(null);
  const [placeTally, setPlaceTally] = useState({});         // {A1: {right, asked}}
  const [placeSeed, setPlaceSeed] = useState(1);
  const [placeResult, setPlaceResult] = useState(null);

  /** Every word at one level, flattened — the pool a placement level draws from. */
  function wordsAtLevel(lv) {
    return (DATA[lang][lv] || []).flatMap((g) => g.words || []);
  }
  const placeLevels = useMemo(
    () => PLACEMENT_LEVELS.filter((lv) => levelsFor(lang).includes(lv)),
    [lang],
  );
  const levelSizes = useMemo(() => {
    const out = {};
    for (const lv of placeLevels) out[lv] = wordsAtLevel(lv).length;
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, placeLevels,vocabularyRevision]);

  function startPlacement() {
    /* A fresh seed each run, so a retake is a different sample rather than a
     * memory test of the last one. */
    const seed = Math.floor(Math.random() * 100000) + 1;
    setPlaceSeed(seed);
    setPlaceTally({});
    setPlaceLevelIdx(0);
    setPlaceIdx(0);
    setPlacePicked(null);
    setPlaceResult(null);
    setPlaceQs(buildPlacementLevel(wordsAtLevel(placeLevels[0]), placeLevels[0], { seed }));
    setPlaceStage("asking");
  }

  function answerPlacement(option) {
    if (placePicked != null) return;
    setPlacePicked(option);
    const q = placeQs[placeIdx];
    const lv = q.level;
    setPlaceTally((prev) => {
      const row = prev[lv] || { right: 0, asked: 0 };
      return { ...prev, [lv]: { right: row.right + (option === q.answer ? 1 : 0), asked: row.asked + 1 } };
    });
  }

  function nextPlacement() {
    setPlacePicked(null);
    if (placeIdx + 1 < placeQs.length) { setPlaceIdx((i) => i + 1); return; }

    /* End of a level. Stop if the words have clearly run out, or if there is
     * no level above this one; otherwise carry on up. */
    const lv = placeLevels[placeLevelIdx];
    const row = placeTally[lv] || { right: 0, asked: 1 };
    const share = row.asked ? row.right / row.asked : 0;
    const nextIdx = placeLevelIdx + 1;
    const more = shouldContinue(share) && nextIdx < placeLevels.length;
    if (!more) {
      setPlaceResult(placementResult(placeTally, levelSizes));
      setPlaceStage("done");
      return;
    }
    const nextLv = placeLevels[nextIdx];
    setPlaceLevelIdx(nextIdx);
    setPlaceIdx(0);
    setPlaceQs(buildPlacementLevel(wordsAtLevel(nextLv), nextLv, { seed: placeSeed + nextIdx * 31 }));
  }

  /** Keep the result. It sets a level and records an estimate — never a card. */
  function savePlacement(result, takeLevel) {
    setProgress((prev) => ({
      ...prev,
      placement: {
        ...(prev.placement || {}),
        [lang]: { at: todayKey(), level: result.level, estimate: result.estimate, asked: result.asked },
      },
    }));
    if (takeLevel) setLevel(result.level);
    setPlaceStage("offer");
    setScreen("setup");
  }


  /* Sending the learner to the right grammar note, from wherever the rule was
   * broken. The app has always had the notes and only ever reached them from
   * the notes list — which is the one place you are not standing when you get
   * something wrong. `noteTitles` is what a caller matches against, so a note
   * that was renamed links to nothing rather than silently to note zero. */
  const noteTitles = useMemo(() => GRAMMAR[lang].map((n) => n.title), [lang]);
  function openNote(title) {
    const i = GRAMMAR[lang].findIndex((n) => n.title === title);
    if (i >= 0) { setGrammarIdx(i); setScreen("grammarNotes"); }
  }
  const conjInputRef = useRef(null);
  // Every form missed this sitting, keyed verb:tense:person, so the summary can
  // offer them back. Per-item, unlike sessionResultsRef which is per verb+tense.
  const conjMissedRef = useRef(new Map());
  // A redo of missed forms sharpens recall but must not touch SM-2: answering
  // correctly seconds after failing is short-term memory, not retention, and
  // letting it regrade would inflate the interval the card just lost.
  const [conjPracticeOnly, setConjPracticeOnly] = useState(false);

  /* --- Focused conjugation flow: one tense, a chosen set of verbs, four phases.
     Table and matching are practice only; the multiple-choice and fill-in steps
     both feed sessionResultsRef so the verb+tense card is graded once. --- */
  const [conjVerbMode, setConjVerbMode] = useState("random"); // 'random' | 'single' | 'multi'
  const [conjPicked, setConjPicked] = useState([]);           // verb.inf strings
  const [conjVerbs, setConjVerbs] = useState([]);             // verb objects for this run
  const [conjTableIdx, setConjTableIdx] = useState(0);
  const [conjMatchPool, setConjMatchPool] = useState([]);     // pairs not yet dealt
  const [conjMatchBoard, setConjMatchBoard] = useState([]);   // pairs on the current board
  const [conjMatchLeft, setConjMatchLeft] = useState([]);
  const [conjMatchRight, setConjMatchRight] = useState([]);
  // Retired tiles are tracked per column: several persons can share a form, so a
  // left tile and its partner are not necessarily the same pair id.
  const [conjMatchDoneL, setConjMatchDoneL] = useState([]);
  const [conjMatchDoneR, setConjMatchDoneR] = useState([]);
  const [conjMatchPending, setConjMatchPending] = useState({ left: null, right: null });
  const [conjMatchFlash, setConjMatchFlash] = useState(false);
  const [conjMcQueue, setConjMcQueue] = useState([]);
  const [conjMcPicked, setConjMcPicked] = useState(null);
  const [conjMcRetired, setConjMcRetired] = useState(0);
  const [conjMcTotal, setConjMcTotal] = useState(0);

  /* Core verbs first, then everything harvested from the C1 lists. Several C1
   * entries share an infinitive — "in Betracht ziehen" and "in Zweifel ziehen"
   * are both `ziehen` — so identity is the headword label, not the infinitive. */
  const verbSet = useMemo(
    () => (lang === "fr" ? [...FR_VERBS, ...FR_C1_VERBS] : [...DE_VERBS, ...DE_C1_VERBS]),
    [lang]
  );
  const tenseSet = lang === "fr" ? FR_TENSES : DE_TENSES;
  const pronounSet = lang === "fr" ? FR_PRONOUNS : DE_PRONOUNS;
  const conjItem = conjQueue[conjIdx];
  const conjMcItem = conjMcQueue[0];
  // Memoised so the four options don't reshuffle on every render.
  const conjMcOpts = useMemo(
    () => (conjMcItem ? conjMcOptions(conjMcItem,lang,tenseSet) : null),
    [conjMcItem, lang,tenseSet],
  );
  const conjTenseLabel = tenseSet.find((t) => t.key === conjTense)?.label || "";

  /* Where you are in the whole verb × tense space. With 188 verbs a dot per
   * verb is unreadable, so each tense is summarised as a proportion bar. A card
   * that lapsed has reps reset to 0, which cardStage calls "new" — correct for
   * scheduling, wrong for coverage, so an existing card counts as started. */
  /* One cell per verb × tense, for the coverage matrix.
   *
   * `drilled` and `due` are separate on purpose. `isDue(undefined)` is true —
   * a card you have never seen is due by definition — so testing `isDue` alone
   * would paint every untouched cell as due and the map would say nothing. */
  const conjMatrix = useMemo(() => verbSet.map((v) => ({
    key: verbKey(v),
    verb: v,
    cells: tenseSet.map((t) => {
      /* A modal has no imperative, so that cell is not a gap in your coverage
       * — it is a cell that does not exist. Marked so the map can draw it as
       * absent rather than as "never drilled". */
      if (!hasTense(lang, v, t.key)) return { tenseKey: t.key, absent: true, drilled: false, due: false, stage: "new" };
      const card = progress.cards[`${lang}:conj:${verbKey(v)}:${t.key}`];
      return { tenseKey: t.key, ...matrixCell(card) };
    }),
  })), [verbSet, tenseSet, progress.cards, lang]);

  /** Due count per verb, for the workbench sidebar. */
  const conjDueByVerb = useMemo(() => {
    const m = new Map();
    conjMatrix.forEach((row) => {
      m.set(row.key, row.cells.filter((c) => c.due).length);
    });
    return m;
  }, [conjMatrix]);

  const conjCoverage = useMemo(() => {
    const total = verbSet.length;
    return tenseSet.map((t) => {
      const tally = { learning: 0, young: 0, mature: 0 };
      verbSet.forEach((v) => {
        const card = progress.cards[`${lang}:conj:${verbKey(v)}:${t.key}`];
        if (!card) return;
        const stage = cardStage(card);
        tally[stage === "new" ? "learning" : stage] += 1;
      });
      const started = tally.learning + tally.young + tally.mature;
      return { key: t.key, label: t.label, total, started, ...tally };
    });
  }, [tenseSet, verbSet, progress, lang]);
  const CONJ_STAGE_COLOR = { learning: C.gold, young: "#7BA894", mature: C.green };

  useEffect(() => {
    if (screen === "conjugation" && conjInputRef.current) conjInputRef.current.focus();
  }, [screen, conjIdx]);

  /** Conjugation cards live in their own namespace so they schedule independently. */
  function conjCardId(verb, tenseKey) {
    return `${lang}:conj:${verbKey(verb)}:${tenseKey}`;
  }
  const conjDueCount = useMemo(() => {
    let n = 0;
    verbSet.forEach((v) => tenseSet.forEach((t) => {
      const c = progress.cards[`${lang}:conj:${verbKey(v)}:${t.key}`];
      if (c && isDue(c)) n++;
    }));
    return n;
  }, [verbSet, tenseSet, progress, lang]);

  function startConjugation(tenseKey, dueOnly = false) {
    const items = [];
    verbSet.forEach((v) => {
      tenseSet.forEach((t) => {
        if (tenseKey && t.key !== tenseKey) return;
        if (dueOnly) {
          const c = progress.cards[`${lang}:conj:${verbKey(v)}:${t.key}`];
          if (!c || !isDue(c)) return;
        }
        if (!hasTense(lang, v, t.key)) return;
        // one random person per verb+tense keeps sessions varied rather than
        // exhaustive — and never a person the tense does not have, or the
        // imperative would ask for "he speaks!"
        items.push({ verb: v, tenseKey: t.key, personIdx: randomPerson(lang, t.key) });
      });
    });
    const q = shuffle(items).slice(0, 12);
    setConjQueue(q);
    setConjIdx(0);
    setConjInput("");
    setConjResult(null);
    setConjScore(0);
    beginReviewSession();
    sessionCommittedRef.current = false;
    conjMissedRef.current = new Map();
    setConjPracticeOnly(false);
    // "Mix all tenses" and "Review due" span tenses, so there is no single
    // tense to continue from; the summary falls back to generic options.
    setConjTense(tenseKey);
    setConjVerbs([]);
    setScreen("conjugation");
  }

  /**
   * Drill exactly the cells picked on the matrix.
   *
   * Deliberately mirrors `startConjugation`'s item shape and reset sequence —
   * the grading path downstream is shared, and the resets are what keep a new
   * sitting from inheriting the last one's results.
   */
  function startConjSelection(picked) {
    const want = new Set(picked);
    const items = [];
    /* Every person of every chosen tense, not one sampled person per tense.
     *
     * This asked a single random person per verb+tense pair, so "drill être,
     * this tense" produced exactly one question and then declared the round
     * complete at 1/1. A conjugation drill that never asks you to conjugate is
     * not a drill; the whole point is running the paradigm. */
    verbSet.forEach((v) => tenseSet.forEach((t) => {
      if (!want.has(`${verbKey(v)}:${t.key}`)) return;
      if (!hasTense(lang, v, t.key)) return;
      personsFor(lang, t.key).forEach((personIdx) => {
        items.push({ verb: v, tenseKey: t.key, personIdx });
      });
    }));
    if (!items.length) return;
    /* One tense is six questions and should all be asked; a whole verb across
     * every tense is forty, which is a slog rather than a sitting. Round up to
     * a full paradigm so a single-tense drill is never cut short. */
    setConjQueue(shuffle(items).slice(0, Math.max(12, Math.min(items.length, 18))));
    setConjIdx(0);
    setConjInput("");
    setConjResult(null);
    setConjScore(0);
    beginReviewSession();
    sessionCommittedRef.current = false;
    conjMissedRef.current = new Map();
    setConjPracticeOnly(false);
    // A selection can span tenses, so there is no single tense to continue from.
    setConjTense(null);
    setConjVerbs([]);
    setScreen("conjugation");
  }

  /* The workbench's current verb and tense, defaulting to the first of each so
   * the frame is never empty on arrival. */
  const wbVerb = useMemo(
    () => verbSet.find((v) => verbKey(v) === wbVerbKey) || verbSet[0],
    [verbSet, wbVerbKey],
  );
  const wbTenseKey = wbTense || tenseSet[0]?.key;

  /* Switching from a six-person tense to the imperative leaves `wbBlank` on a
   * person that mood does not have. Clamping during render keeps the blanked
   * cell and the table in agreement without a second effect to fall out of
   * step with them. */
  const wbPersons = personsFor(lang, wbTenseKey);
  const wbBlankSafe = wbPersons.includes(wbBlank) ? wbBlank : wbPersons[0];

  const wbRows = useMemo(() => {
    if (!wbVerb || !wbTenseKey) return [];
    const forms = conjugate(lang, wbVerb, wbTenseKey);
    /* The imperative has three or four rows, not six. Rendering the missing
     * persons as empty cells would read as a gap in the data rather than as
     * a fact about the mood. */
    return personsFor(lang, wbTenseKey).map((i) => ({
      idx: i,
      form: forms[i],
      pronoun: displayPronoun(lang, i, forms[i]),
      /* What to say aloud: the whole phrase, not the bare form. Hearing
       * "je suis" carries the elision and the rhythm; "suis" on its own is a
       * word nobody utters by itself. */
      spoken: spokenForm(lang, i, forms[i], wbTenseKey),
      english: conjugateEnglish(lang, wbVerb, wbTenseKey, i),
    }));
  }, [lang, wbVerb, wbTenseKey]);

  /**
   * Grade one blanked cell, and schedule it.
   *
   * The workbench is the default way into verbs on desktop, so it has to count
   * — practising here and having nothing come back would be worse than the
   * wizard it replaced. It writes through the same two functions the drill
   * uses, `gradeFromWrongCount` and `scheduleCard`, rather than a second
   * grading rule that could drift from it.
   *
   * Graded per cell rather than per sitting, because there is no sitting: you
   * can wander between verbs and tenses indefinitely. A blank answer is a slip
   * and is not graded, matching the typing stage.
   */
  function checkWorkbench() {
    noteWork("grammar");
    if (!wbVerb || wbResult) return;
    if (!wbInput.trim()) { setBlankNudge(true); return; }

    const forms = conjugate(lang, wbVerb, wbTenseKey);
    const accepted = conjugationAlternates(lang, wbVerb, wbTenseKey, forms[wbBlankSafe]);
    const ok = accepted.some((f) => answersMatch(wbInput, f));

    const id = conjCardId(wbVerb, wbTenseKey);
    setProgress((p) => bumpStreak(logReview({
      ...p,
      cards: { ...p.cards, [id]: scheduleCard(p.cards[id], gradeFromWrongCount(ok ? 0 : 1), id) },
    }, ok)));

    setWbStats((s2) => ({ answered: s2.answered + 1, right: s2.right + (ok ? 1 : 0) }));
    setWbResult({ ok });
  }

  /* Which tenses each drill scope would cover for the verb on screen.
   *
   * "started" is the useful middle: a tense counts once it has a card, which
   * happens the first time you answer a cell in it. It is deliberately not
   * "due" — you want to be able to drill something you have met and are not
   * yet being asked for. */
  const wbScopeTenses = useMemo(() => drillScopeTenses({
    verb: wbVerb,
    tenseKey: wbTenseKey,
    tenses: tenseSet,
    cards: progress.cards,
    cardIdFor: (k) => `${lang}:conj:${verbKey(wbVerb)}:${k}`,
    hasTense: (k) => hasTense(lang, wbVerb, k),
  }), [wbVerb, wbTenseKey, tenseSet, lang, progress.cards]);

  /* A scope that has emptied — you switched to a verb with nothing started —
   * falls back rather than leaving a disabled button and no explanation. */
  const wbScopeSafe = effectiveScope(wbDrillScope, wbScopeTenses);

  /** Move the blank to another person, so the table keeps asking something new. */
  function nextWorkbenchCell() {
    setWbResult(null);
    setWbInput("");
    setWbBlank((b) => {
      const ps = personsFor(lang, wbTenseKey);
      if (ps.length < 2) return ps[0] ?? 0;
      /* Step to a different person within the ones this mood has, rather than
       * modulo 6 — the imperative would otherwise blank a row that is not on
       * screen and the table would sit there with nothing to answer. */
      const at = Math.max(0, ps.indexOf(b));
      return ps[(at + 1 + Math.floor(Math.random() * (ps.length - 1))) % ps.length];
    });
  }

  function pickWorkbenchVerb(key) {
    setWbVerbKey(key);
    setWbResult(null);
    setWbInput("");
  }

  /* ---- focused flow: setup -> table -> matching -> multiple choice -> fill-in ---- */

  const RANDOM_VERB_COUNT = 4;

  /** Every person of every chosen verb, for one tense. */
  function buildConjPairs(verbs, tenseKey) {
    const out = [];
    verbs.forEach((v) => {
      // verbKey, not inf: several C1 entries share an infinitive, and duplicate
      // ids would break tile matching.
      if (!hasTense(lang, v, tenseKey)) return;
      for (const i of personsFor(lang, tenseKey)) out.push({ verb: v, tenseKey, personIdx: i, id: `${verbKey(v)}:${i}` });
    });
    return out;
  }

  /** Distractors are other persons of the same verb+tense — the ending you'd
   *  actually confuse, rather than a different verb you'd never confuse. */

  function noteConjMiss(item) {
    conjMissedRef.current.set(`${verbKey(item.verb)}:${item.tenseKey}:${item.personIdx}`, {
      verb: item.verb,
      tenseKey: item.tenseKey,
      personIdx: item.personIdx,
    });
  }

  /** Re-drill just the forms missed this sitting. Deliberately ungraded. */
  function redoConjMissed() {
    const items = [...conjMissedRef.current.values()].map((m) => ({ ...m, id: `${verbKey(m.verb)}:${m.personIdx}` }));
    if (!items.length) return;
    setConjQueue(shuffle(items));
    setConjIdx(0);
    setConjInput("");
    setConjResult(null);
    setConjScore(0);
    setConjPracticeOnly(true);
    conjMissedRef.current = new Map();
    setScreen("conjugation");
  }

  /** Same verbs, the following tense — the natural next step after a drill. */
  const nextTense = (() => {
    if (!conjTense) return null;
    const i = tenseSet.findIndex((t) => t.key === conjTense);
    return i >= 0 && i + 1 < tenseSet.length ? tenseSet[i + 1] : null;
  })();

  function continueSameVerbsNextTense() {
    if (!nextTense || !conjVerbs.length) return;
    setConjTense(nextTense.key);
    setConjTableIdx(0);
    conjMissedRef.current = new Map();
    setConjPracticeOnly(false);
    setScreen("conjTable");
  }

  /** Fresh verbs in the same tense, preferring ones never studied. */
  function continueNewVerbsSameTense() {
    const justDone = new Set(conjVerbs.map((v) => verbKey(v)));
    const rest = verbSet.filter((v) => !justDone.has(verbKey(v)));
    if (!rest.length) return;
    const unseen = rest.filter((v) => !progress.cards[conjCardId(v, conjTense)]);
    const pool = unseen.length ? unseen : rest;
    setConjVerbs(shuffle(pool).slice(0, RANDOM_VERB_COUNT));
    setConjTableIdx(0);
    conjMissedRef.current = new Map();
    setConjPracticeOnly(false);
    setScreen("conjTable");
  }

  function openConjSetup(tenseKey) {
    setConjTense(tenseKey);
    setConjVerbMode("random");
    setConjPicked([]);
    setScreen("conjSetup");
  }

  function toggleConjPick(inf) {
    setConjPicked((p) => (p.includes(inf) ? p.filter((x) => x !== inf) : [...p, inf]));
  }

  /** Verbs for this run, resolved from the chosen mode. */
  function resolveConjVerbs() {
    if (conjVerbMode === "random") return shuffle(verbSet).slice(0, RANDOM_VERB_COUNT);
    return verbSet.filter((v) => conjPicked.includes(verbKey(v)));
  }

  function startConjRun() {
    const chosen = resolveConjVerbs();
    if (!chosen.length) return;
    setConjVerbs(chosen);
    setConjTableIdx(0);
    conjMissedRef.current = new Map();
    setConjPracticeOnly(false);
    setScreen("conjTable");
  }

  function dealConjBoard(pool) {
    const board = pool.slice(0, 6);
    setConjMatchBoard(board);
    setConjMatchPool(pool.slice(6));
    setConjMatchLeft(shuffle(board));
    setConjMatchRight(shuffle(board));
    setConjMatchDoneL([]);
    setConjMatchDoneR([]);
    setConjMatchPending({ left: null, right: null });
  }

  const conjFormOf = (p) => conjugate(lang, p.verb, p.tenseKey)[p.personIdx];

  function goToConjMatch() {
    dealConjBoard(shuffle(buildConjPairs(conjVerbs, conjTense)));
    setScreen("conjMatch");
  }

  function selectConjTile(side, id) {
    if ((side === "left" ? conjMatchDoneL : conjMatchDoneR).includes(id)) return;
    const next = { ...conjMatchPending, [side]: conjMatchPending[side] === id ? null : id };
    setConjMatchPending(next);
    if (next.left && next.right) {
      const l = conjMatchBoard.find((p) => p.id === next.left);
      const r = conjMatchBoard.find((p) => p.id === next.right);
      // Compare the written form rather than the pair id. French je/il·elle and
      // German wir/sie share a form, so any tile showing the right spelling is a
      // correct answer — matching on id would reject half of those.
      const ok = l && r && normalize(conjFormOf(l)) === normalize(conjFormOf(r));
      if (ok) {
        setConjMatchDoneL((m) => [...m, next.left]);
        setConjMatchDoneR((m) => [...m, next.right]);
        setConjMatchPending({ left: null, right: null });
      } else {
        setConjMatchFlash(true);
        setTimeout(() => {
          setConjMatchFlash(false);
          setConjMatchPending({ left: null, right: null });
        }, 450);
      }
    }
  }

  /** Board cleared: deal the next six, or move on when the pool is empty. */
  function advanceConjMatch() {
    if (conjMatchPool.length) dealConjBoard(conjMatchPool);
    else goToConjMc();
  }

  function goToConjMc() {
    const q = shuffle(buildConjPairs(conjVerbs, conjTense)).slice(0, 12);
    setConjMcQueue(q);
    setConjMcTotal(q.length);
    setConjMcRetired(0);
    setConjMcPicked(null);
    // Grading starts here; the table and matching steps are practice only.
    beginReviewSession();
    sessionCommittedRef.current = false;
    setScreen("conjChoose");
  }

  function pickConjMc(value) {
    noteWork("grammar");
    if (!conjMcItem || conjMcPicked || !conjMcOpts) return;
    const ok = normalize(value) === normalize(conjMcOpts.correct);
    if (!ok) noteConjMiss(conjMcItem);
    setProgress((p) => bumpStreak(logReview(p, ok)));
    setConjMcPicked(value);
  }

  function continueConjMc() {
    if (!conjMcPicked || !conjMcOpts) return;
    const ok = normalize(conjMcPicked) === normalize(conjMcOpts.correct);
    if (ok && conjMcQueue.length === 1) {
      setConjMcRetired((r) => r + 1);
      setConjMcPicked(null);
      startConjFill({ keepSession: true });
      return;
    }
    setConjMcQueue((q) => {
      const [head, ...rest] = q;
      if (ok) return rest;
      const at = Math.min(rest.length, 3);
      const nq = [...rest];
      nq.splice(at, 0, head);
      return nq;
    });
    if (ok) setConjMcRetired((r) => r + 1);
    setConjMcPicked(null);
  }

  /** Final phase. Carries the multiple-choice results so the card is graded once. */
  function startConjFill(opts = {}) {
    const q = shuffle(buildConjPairs(conjVerbs, conjTense)).slice(0, 12);
    setConjQueue(q);
    setConjIdx(0);
    setConjInput("");
    setConjResult(null);
    setConjScore(0);
    if (!opts.keepSession) {
      beginReviewSession();
      sessionCommittedRef.current = false;
    }
    setScreen("conjugation");
  }

  function checkConjugation() {
    if (!conjItem || conjResult) return;
    const forms = conjugate(lang, conjItem.verb, conjItem.tenseKey);
    const expected = forms[conjItem.personIdx];
    const accepted = conjugationAlternates(lang, conjItem.verb, conjItem.tenseKey, expected);
    const ok = accepted.some((f) => answersMatch(conjInput, f));

    // If they typed a real form of this verb, say which one — far more useful than "wrong".
    let note = null;
    if (!ok && conjInput.trim()) {
      for (const t of tenseSet) {
        const f = conjugate(lang, conjItem.verb, t.key);
        const hitIdx = f.findIndex((x) => x != null && answersMatch(conjInput, x));
        if (hitIdx >= 0) {
          note = `That's the ${pronounSet[hitIdx]} form of the ${t.label.toLowerCase()}.`;
          break;
        }
      }
    }

    setConjResult({ ok, expected, note });
    if (ok) setConjScore((s) => s + 1);

    if (!ok) noteConjMiss(conjItem);
    // A practice-only redo still counts as activity, but must not reschedule.
    if (!conjPracticeOnly) {
      const id = conjCardId(conjItem.verb, conjItem.tenseKey);
      const prev = sessionResultsRef.current.get(id) || { conj: true, wrongCount: 0 };
      if (!ok) prev.wrongCount += 1;
      sessionResultsRef.current.set(id, prev);
    }
    noteWork("grammar");
    setProgress((p) => {
      const next = bumpStreak(logReview(p, ok));
      // A missed form is a fact about the tense, not only about the card.
      if (ok) return next;
      return {
        ...next,
        errors: recordMiss(next.errors, {
          lang,
          rule: conjRuleKey(conjItem.tenseKey),
          prompt: `${pronounSet[conjItem.personIdx]} … (${verbKey(conjItem.verb)})`,
          answer: expected,
          today: todayKey(),
        }),
      };
    });
  }

  function nextConjugation() {
    setConjResult(null);
    setConjInput("");
    if (conjIdx + 1 < conjQueue.length) setConjIdx((i) => i + 1);
    else {
      if (!conjPracticeOnly) commitSession();
      setScreen("conjugationDone");
    }
  }

  // --- Text import state ---
  const [importTitle, setImportTitle] = useState("");
  const [importText, setImportText] = useState("");
  const [importSentences, setImportSentences] = useState([]);
  const [glosses, setGlosses] = useState({});          // lookupKey -> {lemma, en, g, pos}
  const [importBusy, setImportBusy] = useState(false);
  const [importProgressPct, setImportProgressPct] = useState(0);
  const [importError, setImportError] = useState(null);
  const [selectedTok, setSelectedTok] = useState(null); // {word, sentenceIdx}
  const [sentenceTrans, setSentenceTrans] = useState({}); // sentenceIdx -> english
  const [transBusy, setTransBusy] = useState(false);

  /* --- the desktop text library -------------------------------------------
   *
   * The app held exactly one text: pasting a second silently discarded the
   * first, along with every lookup you had done in it. 2e's library rail is
   * what makes a second text possible, so the texts have to be persisted
   * rather than kept in component state. They ride in `progress` because that
   * is the object already being written to IndexedDB on every change. */
  const [activeTextId, setActiveTextId] = useState(null);
  const [pasting, setPasting] = useState(false);
  const [lookupCount, setLookupCount] = useState(0);

  const savedTexts = useMemo(() => {
    const all = progress.texts?.[lang] || {};
    return Object.values(all).sort((a, b) => (b.opened || 0) - (a.opened || 0));
  }, [progress.texts, lang]);

  function saveText(entry) {
    setProgress((p) => {
      const all = { ...(p.texts || { fr: {}, de: {} }) };
      all[lang] = { ...(all[lang] || {}), [entry.id]: entry };
      return { ...p, texts: all };
    });
  }
  function deleteText(id) {
    setProgress((p) => {
      const all = { ...(p.texts || { fr: {}, de: {} }) };
      const forLang = { ...(all[lang] || {}) };
      delete forLang[id];
      all[lang] = forLang;
      return { ...p, texts: all };
    });
    if (id === activeTextId) { setActiveTextId(null); setImportSentences([]); setSelectedTok(null); }
  }
  function openSavedText(id) {
    const entry = progress.texts?.[lang]?.[id];
    if (!entry) return;
    setActiveTextId(id);
    setPasting(false);
    setImportTitle(entry.title);
    setImportText(entry.text);
    setImportSentences(splitSentences(entry.text));
    setSelectedTok(null);
    setSentenceTrans({});
    setLookupCount(0);
    saveText({ ...entry, opened: Date.now() });
  }

  /** Normalized set of everything already in the deck, for highlighting. */
  const knownKeys = useMemo(() => {
    const s = new Set();
    allWordsForLang.forEach(({ word }) => {
      s.add(normalize(word.t));
      if (word.ba) s.add(normalize(word.ba));
    });
    return s;
  }, [allWordsForLang]);

  const savedImportKeys = useMemo(() => {
    const bag = (progress.imported && progress.imported[lang]) || {};
    return new Set(Object.keys(bag).map(normalize));
  }, [progress, lang]);

  async function analyzeImport() {
    const generation=++importGeneration.current;
    const text = importText.trim();
    if (!text) return;
    setImportError(null);
    setImportBusy(true);
    setImportProgressPct(0);
    setSelectedTok(null);
    setSentenceTrans({});

    const sents = splitSentences(text);
    setImportSentences(sents);
    /* Persist as soon as it parses, not when the glosses land — a failed
     * lookup pass should not lose the text you just pasted. */
    const id = activeTextId || `t${Date.now().toString(36)}`;
    setActiveTextId(id);
    setPasting(false);
    setLookupCount(0);
    saveText({ id, title: importTitle.trim() || "Untitled text", text, opened: Date.now(), saved: 0 });

    // Collect unique unknown forms worth glossing.
    const seen = new Set();
    const unknown = [];
    sents.forEach((s) => {
      segmentSentence(s).forEach((seg) => {
        if (seg.type !== "word") return;
        const k = lookupKey(seg.v);
        if (!k || k.length < 2) return;          // skip stray single letters from elision
        if (knownKeys.has(k) || savedImportKeys.has(k)) return;
        if (seen.has(k)) return;
        seen.add(k);
        unknown.push({ key: k, form: stripElision(seg.v) });
      });
    });

    if (!unknown.length) {
      setImportBusy(false);
      setImportProgressPct(100);
      noteWork("import");
      setScreen("importReader");
      return;
    }

    const CHUNK = 12;
    const chunks = [];
    for (let i = 0; i < unknown.length; i += CHUNK) chunks.push(unknown.slice(i, i + CHUNK));

    const collected = {};
    let anySuccess = false;
    for (let i = 0; i < chunks.length; i++) {
      const rows = await apiLookupBatch(lang, chunks[i].map((u) => u.form));
      if(generation!==importGeneration.current)return;
      if (rows.length) anySuccess = true;
      rows.forEach((r) => {
        if (!r || !r.w) return;
        collected[normalize(String(r.w))] = {
          lemma: r.lemma || r.w,
          en: r.en || "",
          g: r.g || null,
          pos: r.pos || "",
        };
      });
      setImportProgressPct(Math.round(((i + 1) / chunks.length) * 100));
      setGlosses((g) => ({ ...g, ...collected }));
    }

    if (!anySuccess) {
      setImportError("Couldn't reach the dictionary service. You can still read the text — words already in your deck are highlighted — but new words can't be glossed right now.");
    }
    setImportBusy(false);
    noteWork("import");
    setScreen("importReader");
  }

  async function selectImportWord(word, sentenceIdx) {
    const generation=importGeneration.current;
    setSelectedTok({ word, sentenceIdx });
    setLookupCount((n) => n + 1);
    if (sentenceTrans[sentenceIdx] === undefined) {
      setTransBusy(true);
      const t = await apiTranslate(lang, importSentences[sentenceIdx]);
      if(generation!==importGeneration.current)return;
      setSentenceTrans((m) => ({ ...m, [sentenceIdx]: t }));
      setTransBusy(false);
    }
  }

  /**
   * The one writer into progress.imported — every ingest path goes through here
   * so the article reader and the word importer can't drift into two shapes.
   */
  function saveWordRecords(recs, targetLang = lang) {
    if (!recs.length) return;
    noteWork("mywords");
    setProgress((p) => {
      const all = { ...(p.imported || { fr: {}, de: {} }) };
      const bag = { ...(all[targetLang] || {}) };
      recs.forEach((rec) => { bag[rec.t] = rec; });
      all[targetLang] = bag;
      return { ...p, imported: all };
    });
  }

  // --- My Words: staging, checking, reviewing ---
  const MAX_ROWS = 500;
  const WARN_ROWS = 200;
  const [inputTab, setInputTab] = useState("paste");   // 'paste' | 'file' | 'one'
  const [pasteText, setPasteText] = useState("");
  const [formatOverride, setFormatOverride] = useState("auto");
  const [wordsSrc, setWordsSrc] = useState("");
  const [oneWord, setOneWord] = useState({ term: "", translation: "", gender: "", example: "" });
  const [staged, setStaged] = useState([]);            // rows awaiting the check
  const [stagedInfo, setStagedInfo] = useState(null);  // {label, note, dropped, capped}
  const [verifyRows, setVerifyRows] = useState([]);    // [{row, res}]
  const [decisions, setDecisions] = useState({});      // rowId -> {choice, edited}
  const [verifyModel, setVerifyModel] = useState("");
  const [libraryUncheckedOnly, setLibraryUncheckedOnly] = useState(false);
  const [wordsBusy, setWordsBusy] = useState(false);
  const [wordsPct, setWordsPct] = useState(0);
  const [wordsError, setWordsError] = useState(null);
  const fileRef = useRef(null);

  /**
   * Turn parsed rows into a staging list: dedupe, flag what's already in the
   * deck, and cap the run.
   *
   * The deck check has to consult both key sets. knownKeys indexes headwords
   * *and* their inflected cloze answers; savedImportKeys indexes the bag's
   * lemma keys. Either one alone lets a word you already have back in.
   */
  function stageRows(rows, srcLabel) {
    const seen = new Set();
    const out = [];
    let dropped = 0;
    rows.forEach((r) => {
      const key = normalize(r.term);
      if (!key) return;
      if (seen.has(key)) { dropped++; return; }        // case-insensitive: two
      seen.add(key);                                    // tiles with one label
      out.push({                                        // deadlock the match step
        ...r,
        id: `${key}::${out.length}`,
        inDeck: knownKeys.has(key) || savedImportKeys.has(key),
        include: !(knownKeys.has(key) || savedImportKeys.has(key)),
      });
    });
    const capped = out.length > MAX_ROWS;
    setStaged(capped ? out.slice(0, MAX_ROWS) : out);
    setStagedInfo({ dropped, capped, total: out.length, src: srcLabel });
  }

  function stageParsed(text, srcLabel) {
    const { rows, label, note } = parseWordList(text, { lang, format: formatOverride });
    stageRows(rows, srcLabel);
    setStagedInfo((info) => ({ ...info, label, note }));
  }

  async function handleWordFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";                                // let the same file re-trigger
    if (!file) return;
    if (file.size > 1_000_000) {
      setWordsError("That file is over 1 MB. Trim it down — only the first 500 words get imported anyway.");
      return;
    }
    setWordsError(null);
    stageParsed(await file.text(), file.name);
  }

  /**
   * Check staged rows, then hand off to review.
   *
   * Two passes, two models. Rows with no translation get a cheap provisional
   * gloss from Haiku; then every row — the learner's own translations included
   * — goes to Sonnet for the second opinion. Asking the glossing model to
   * check its own output would produce agreement, not verification.
   */
  async function runCheck(rows) {
    const generation=++importGeneration.current;
    // Clear the previous run's failure: it outlived its cause and sat next to a
    // library that had saved perfectly well.
    setWordsError(null);
    if (!rows.length) return;
    setWordsBusy(true);
    setWordsPct(0);
    setWordsError(null);

    const bare = rows.filter((r) => !r.translation);
    const glossChunks = [];
    for (let i = 0; i < bare.length; i += 12) glossChunks.push(bare.slice(i, i + 12));
    const verifyChunks = [];
    for (let i = 0; i < rows.length; i += 8) verifyChunks.push(rows.slice(i, i + 8));

    const totalSteps = glossChunks.length + verifyChunks.length;
    let step = 0;
    const tick = () => setWordsPct(Math.round((++step / totalSteps) * 100));

    // Pass 1 — provisional glosses for the rows that arrived bare.
    const glossed = {};
    for (const chunk of glossChunks) {
      const got = await apiLookupBatch(lang, chunk.map((r) => r.term));
      if(generation!==importGeneration.current)return;
      got.forEach((g) => { if (g && g.w) glossed[normalize(String(g.w))] = g; });
      tick();
    }

    // Pass 2 — the second opinion, over everything.
    const out = [];
    let anySuccess = false;
    let model = "";
    for (const chunk of verifyChunks) {
      const payload = chunk.map((r) => {
        const g = glossed[normalize(r.term)];
        const entry = { t: r.term };
        const e = r.translation || g?.en || "";
        if (e) entry.e = e;
        const gender = r.gender || (lang === "de" ? g?.g || "" : "");
        if (gender) entry.g = gender;
        if (r.example) entry.s = r.example;
        return entry;
      });

      const { rows: got, model: usedModel } = await apiVerifyBatch(lang, "IMP", payload);
      if(generation!==importGeneration.current)return;
      if (got.length) { anySuccess = true; model = usedModel || model; }

      /* Pair by index, then verify the pairing held. The prompt asks for
       * same-order output; that request is not a guarantee, and a silent
       * off-by-one here attaches one word's translation to another. */
      const byTerm = new Map(got.map((g) => [normalize(g.t || ""), g]));
      chunk.forEach((r, i) => {
        let res = got[i];
        if (!res || normalize(res.t || "") !== normalize(r.term)) res = byTerm.get(normalize(r.term)) || null;
        out.push({ row: { ...r, glossed: glossed[normalize(r.term)]?.en || "" }, res });
      });
      tick();
    }

    if (!anySuccess) {
      setWordsError(
        "Couldn't reach the checking service. You can still save these words — they'll be marked unchecked, " +
        "and you can run the check later from your library."
      );
    }

    setVerifyRows(out);
    setDecisions(Object.fromEntries(out.map(({ row, res }) => [
      row.id,
      // Nothing of yours gets overwritten by default. When you gave no
      // translation there is nothing to overwrite, so the proposal stands.
      { choice: !res ? "mine" : row.translation ? "mine" : "proposed", edited: null },
    ])));
    setVerifyModel(model);
    setWordsBusy(false);
    setWordsPct(100);
    setScreen("wordsReview");
  }

  /** Re-check words already in the deck (legacy records, or after an outage). */
  function recheckSaved(entries) {
    const rows = entries.map(({ word: w }, i) => ({
      id: `saved::${w.t}::${i}`,
      term: w.t,
      translation: w.e === "(no gloss)" ? "" : w.e,
      gender: w.g || "",
      example: w.s || "",
      inDeck: false,
      include: true,
      existing: true,
      src: w.src,
    }));
    setStaged(rows);
    setStagedInfo({ total: rows.length, dropped: 0, capped: false, src: "your library" });
    runCheck(rows.slice(0, MAX_ROWS));
  }

  /** Apply the review decisions and write the words into the deck. */
  function saveReviewed() {
    const recs = [];
    verifyRows.forEach(({ row, res }) => {
      const d = decisions[row.id] || { choice: "mine" };
      if (d.choice === "skip") return;
      const ed = d.edited || {};

      const useProposed = d.choice === "proposed" && res;
      const term = (ed.term ?? row.term).trim();
      if (!term) return;

      const e = (ed.translation ?? (useProposed ? res.en : row.translation || res?.en || row.glossed || "")).trim();
      const gender = lang === "de"
        ? (ed.gender ?? (useProposed ? res?.g || "" : row.gender || res?.g || "")) || ""
        : "";

      const s = (ed.example ?? res?.s ?? row.example ?? "").trim();
      // ba only means anything relative to the sentence it was copied out of.
      const surface = ed.example !== undefined && ed.example !== null ? term : res?.ba || term;
      const cloze = s ? makeCloze(s, surface) : null;

      let st = null;
      if (res) {
        if (res.verdict === "ok") st = "ok";
        else if (useProposed) st = "fixed";
        else st = res.verdict === "ambiguous" ? "ambiguous" : "kept";
      }

      recs.push({
        t: term,
        e: e || "(no gloss)",
        g: gender || undefined,
        pos: res?.pos || "",
        s: s || undefined,
        b: cloze || undefined,
        ba: cloze ? surface : undefined,
        se: (res?.se || "").trim() || undefined,
        src: row.src || wordsSrc.trim() || "my words",
        at: row.existing ? undefined : todayKey(),
        ver: st ? { st, at: todayKey(), by: verifyModel || "", note: res?.note || "" } : undefined,
      });
    });

    saveWordRecords(recs);
    setStaged([]);
    setStagedInfo(null);
    setVerifyRows([]);
    setDecisions({});
    setPasteText("");
    setScreen("wordsHub");
  }

  /** Save a word into the deck, using the sentence it appeared in as its example. */
  function addImportedWord() {
    if (!selectedTok) return;
    const { word, sentenceIdx } = selectedTok;
    const k = lookupKey(word);
    const g = glosses[k];
    const lemma = g?.lemma || stripElision(word);
    const sentence = importSentences[sentenceIdx];
    const surface = word;
    // A bare .replace() blanks the first occurrence anywhere — including inside
    // a longer word — and leaves the sentence untouched when it doesn't match.
    const cloze = makeCloze(sentence, surface);
    const rec = {
      t: lemma,
      e: g?.en || "(no gloss)",
      g: lang === "de" && g?.g ? g.g : undefined,
      pos: g?.pos || "",
      s: sentence,
      b: cloze || undefined,
      ba: cloze ? surface : undefined,
      se: sentenceTrans[sentenceIdx] || "",
      src: importTitle.trim() || "imported text",
      at: todayKey(),
    };
    saveWordRecords([rec]);
    setSelectedTok(null);
  }

  function removeImportedWord(lemma) {
    setProgress((p) => {
      const all = { ...(p.imported || { fr: {}, de: {} }) };
      const bag = { ...(all[lang] || {}) };
      delete bag[lemma];
      all[lang] = bag;
      const cards = { ...p.cards };
      delete cards[cardId(lang, "IMP", lemma)];
      return { ...p, imported: all, cards };
    });
  }

  // --- Choose step (multiple choice, sits between Match and Type) ---
  const [chooseQueue, setChooseQueue] = useState([]);
  const [chooseTotal, setChooseTotal] = useState(0);
  const [chooseRetired, setChooseRetired] = useState(0);
  const [choosePicked, setChoosePicked] = useState(null);
  const [chooseStreak, setChooseStreak] = useState(0);
  const chooseSeenRef = useRef(new Set());
  const chooseFirstWrongRef = useRef(new Set());

  const [demoIdx, setDemoIdx] = useState(0);
  useEffect(() => {
    if (screen !== "setup") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setDemoIdx((i) => i + 1), 2600);
    return () => clearInterval(id);
  }, [screen]);

  // --- Phrase Match state ---
  const [phraseLevel, setPhraseLevel] = useState("A1");
  const [phraseLeft, setPhraseLeft] = useState([]);
  const [phraseRight, setPhraseRight] = useState([]);
  const [phraseMatched, setPhraseMatched] = useState([]);
  const [phrasePending, setPhrasePending] = useState({ left: null, right: null });
  const [phraseWrongFlash, setPhraseWrongFlash] = useState(false);
  const [phraseWrongTries, setPhraseWrongTries] = useState(0);
  const [phraseLastMatched, setPhraseLastMatched] = useState(null); // shows literal gloss briefly

  const currentGroups = DATA[lang][level];
  const flatWords = useMemo(() => flattenLevel(currentGroups), [currentGroups]);
  const totalThemes = currentGroups.length;

  /* ---- desktop shell ---------------------------------------------------- */
  const isDesktop = useIsDesktop();
  const [theme, setTheme] = useTheme();
  const [typeScale, setTypeScale] = useTypeScale();
  const activeSection = sectionOf(screen);

  /* Mastery per drawer, for the grid's progress bars. "Mastered" is the same
   * young/mature split the progress chart uses, so the two agree. */
  const drawerMastery = useMemo(() => {
    const out = {};
    currentGroups.forEach((g) => {
      let mastered = 0;
      g.words.forEach((w) => {
        const stage = cardStage(progress.cards[cardId(lang, level, w.t)]);
        if (stage === "young" || stage === "mature") mastered += 1;
      });
      out[g.topic] = { mastered, total: g.words.length };
    });
    return out;
  }, [currentGroups, progress.cards, lang, level]);

  /* Declared here rather than beside the other writing state: the rail badge
   * reads it, and the rail renders long before that part of the component. */
  const mistakeList = useMemo(
    () => topMistakes(progress.errors, lang, { today: todayKey() }),
    [progress.errors, lang],
  );

  const railBadges = useMemo(() => ({
    mywords: uncheckedWords.length
      ? { text: `${uncheckedWords.length} unchecked`, urgent: true }
      : importedWords.length ? { text: String(importedWords.length) } : null,
    grammar: conjDueCount ? { text: `${conjDueCount} due`, urgent: true } : null,
    mistakes: mistakeList.length ? { text: String(mistakeList.length), urgent: true } : null,
    import: importedWords.length ? { text: String(importedWords.length) } : null,
  }), [uncheckedWords.length, importedWords.length, conjDueCount, mistakeList.length]);

  /* The rail routes through the same entry points the mobile home cards use,
   * so there is one navigation path rather than a parallel desktop one. */
  function navigateToSection(id) {
    commitSession();
    stopListening();
    stopRecording();
    const first = {
      today:'today',library:'library',missions:'missions',listeningLab:'listeningLab',media:'media',journal:'journal',phrasebook:'phrasebook',pronunciation:'pronunciation',retelling:'retelling',passport:'passport',challenge:'challenge',shelf:'shelf',backups:'backups',clinic:'clinic',repair:'repair',humanListening:'humanListening',deviceFiles:'deviceFiles',browserExtension:'browserExtension',
      study: "setup", mywords: "wordsHub",
      // Desktop lands on the workbench; the coverage map is one click from it.
      // Mobile has no workbench, so it keeps the hub.
      grammar: isDesktop ? "grammarWorkbench" : "grammarHub",
      sentences: "sentcSetup", reading: "reading", writing: "writing", mistakes: "mistakes", phrases: "phraseSelect",
      lessons: "lessons",
      listening: "listenSelect", import: "importPaste", progress: "progress",
      etymology: "etymology", fluency: "fluency", collocations: "collocations",
    }[id];
    if (!first) return;
    /* The desktop designs for phrases and listening merge the picker
     * into the working frame, so there is no select screen to land on — the
     * area opens at whichever level was last used and starts straight away.
     * Mobile keeps its picker, which is why this is a routing decision here
     * rather than a change to the screens themselves. */
    if (isDesktop && id === "phrases") return startPhrases(phraseLevel);
    if (isDesktop && id === "listening") return startDictation("level", dictLevel);
    setScreen(first);
  }

  /* The pool this drawer pages through, as {word, level} entries.
   *
   * Entries rather than bare words because the level is half of the SM-2 card
   * id (cardId(lang, level, t)), and re-deriving it from the `level` state at
   * queue-build time is only correct for words that came out of DATA. Your own
   * words schedule under the "IMP" pseudo-level. */
  const drawerPool = useMemo(() => {
    if (mode === "mine") return importedWords;              // already entries
    const words = mode === "theme" ? currentGroups[themeIdx]?.words || [] : flatWords;
    return words.map((w) => ({ word: w, level }));
  }, [mode, currentGroups, themeIdx, flatWords, level, importedWords]);

  /* Theme mode deals a whole drawer at once; mixed and mine page by batchSize. */
  const pagesBatch = mode !== "theme";
  const totalBatches = pagesBatch ? Math.max(1, Math.ceil(drawerPool.length / batchSize)) : 1;

  const batchEntries = useMemo(
    () => (pagesBatch ? drawerPool.slice(batchIndex * batchSize, batchIndex * batchSize + batchSize) : drawerPool),
    [drawerPool, pagesBatch, batchIndex, batchSize]
  );

  /** The same batch as bare word objects — what Learn and Match render. */
  const currentBatch = useMemo(() => batchEntries.map((e) => e.word), [batchEntries]);

  const chooseItem = chooseQueue[0];
  const chooseOpts = useMemo(() => {
    if (!chooseItem) return null;
    // A picture question renders as a 2×2 grid, so it needs four tiles; the
    // text list stays at the app's usual three.
    const picturable = chooseItem.kind === "toEnglish" && imageFor(chooseItem.word) !== null;
    return buildChoiceOptions(chooseItem, batchEntries, allWordsForLang, lang, picturable ? 4 : 3);
  }, [chooseItem, batchEntries, allWordsForLang, lang]);

  /* "Select the correct image": when the prompt is the target word and every
   * option is picturable, show pictures instead of a list of English glosses.
   * All-or-nothing on purpose — a grid where one tile is a word and three are
   * drawings gives the answer away. Options are English glosses, and imageFor
   * keys on the gloss, so no word lookup is needed. */
  const chooseImages = useMemo(() => {
    if (!chooseOpts || chooseOpts.genderMode) return null;
    if (chooseItem?.kind !== "toEnglish") return null;
    // Only a full 2×2. Three tiles leaves a hole in the grid, and padding it
    // with a text tile would give the answer away.
    if (chooseOpts.options.length !== 4) return null;
    const imgs = chooseOpts.options.map((o) => imageFor({ e: o }));
    if (!imgs.every(Boolean)) return null;
    // Distinct pictures only — two options resolving to the same glyph is unanswerable.
    if (new Set(imgs.map((i) => i.key)).size !== imgs.length) return null;
    return imgs;
  }, [chooseOpts, chooseItem]);

  const inputRef = useRef(null);
  useEffect(() => {
    if (screen === "practice" && inputRef.current) inputRef.current.focus();
    /* `retryMode` belongs here: the redo re-enables the input without changing
     * the queue, so without it the box comes back but the cursor does not. */
  }, [screen, queue, retryMode]);

  useEffect(() => {
    if (screen === "sentence" && sentInputRef.current) sentInputRef.current.focus();
  }, [screen, sentQueue, sentRetry]);

  /* The learn card indexes into currentBatch directly, so learnIdx must never
   * point past the end. Two ways it can: the batch shrinks underneath it (delete
   * a word from your library while paging the last batch), or the index runs
   * ahead of it — React batches rapid clicks on "next card", so several
   * increments can land before the re-render that would have swapped the arrow
   * for the Match button and stopped them.
   *
   * `learnIdx` is in the dependency list for the second case: keyed on the batch
   * alone, this only re-clamped when the batch identity changed, and an
   * overflowing index sat there until `currentBatch[learnIdx]` threw. */
  useEffect(() => {
    setLearnIdx((i) => (i < currentBatch.length ? i : Math.max(0, currentBatch.length - 1)));
  }, [currentBatch, learnIdx]);

  /* "mine" is a drawer you enter, not a setting the setup screen can display —
   * its Theme/Mixed toggle only knows two values and would show neither pill. */
  useEffect(() => {
    if (screen === "setup" && mode === "mine") setMode("theme");
  }, [screen, mode]);

  /* French has a C1 set and German doesn't. Switching language while on a level
   * the other one lacks would leave the level tabs with nothing selected and an
   * empty drawer grid. */
  useEffect(() => {
    const available = levelsFor(lang);
    if (!available.includes(level)) {
      setLevel(available[0] || "A1");
      setBatchIndex(0);
      setThemeIdx(0);
    }
  }, [lang, level]);

  function changeLanguage(l) {
    if(l===lang)return;
    commitSession();stopListening();stopRecording();
    importGeneration.current++;setImportBusy(false);setTransBusy(false);setWordsBusy(false);
    setImportText("");setImportSentences([]);setGlosses({});setSentenceTrans({});setSelectedTok(null);setActiveTextId(null);
    setStaged([]);setStagedInfo(null);setVerifyRows([]);setDecisions({});setWordsError(null);setPasteText("");
    setProgress(p=>({...p,preferences:{...p.preferences,lang:l,level}}));
    setLang(l);setDemoIdx(0);resetPosition();setScreen("today");
  }
  function resetPosition() {
    setBatchIndex(0);
    setThemeIdx(0);
  }
  function startMixed() {
    if(!flatWords.length)return;
    setMode("mixed");
    setBatchIndex(0);
    setLearnIdx(0);
    setFlipped(false);
    setScreen("learn");
  }
  function startTheme(idx) {
    if(!currentGroups[idx])return;
    const entries=currentGroups[idx]?.words.map(word=>({word,level}))||[];
    if(entries.length&&entries.every(({word})=>progress.cards[cardId(lang,level,word.t)]?.reps>0))return goToPractice(entries,{review:true});
    setMode("theme");
    setThemeIdx(idx);
    setLearnIdx(0);
    setFlipped(false);
    setScreen("learn");
  }
  /** Study your own words, paged like Mixed Batches. */
  function startMine() {
    if (!importedWords.length) return;
    setMode("mine");
    setBatchIndex(0);
    setLearnIdx(0);
    setFlipped(false);
    setScreen("learn");
  }
  function goToMatching() {
    setLeftItems(shuffle(currentBatch));
    setRightItems(shuffle(currentBatch));
    setMatchedIds([]);
    setPending({ left: null, right: null });
    setScreen("matching");
  }
  /* What this sitting is drilling. Held in a ref so the Choose step can hand
   * the exact same list to the Type step — it used to pass `currentBatch`,
   * which silently swapped in the open drawer whenever the two differed. */
  const sessionListRef = useRef([]);

  /**
   * Normalize a caller's list into {word, level} entries.
   *
   * A bare word belongs to whichever drawer is open, not to the level tab:
   * defaulting to `level` files your own words under `de:A1:Hund` instead of
   * `de:IMP:Hund`, where nothing ever finds them again.
   */
  function asEntries(list) {
    const fallback = mode === "mine" ? "IMP" : level;
    return (list || batchEntries).map((x) => (x && x.word ? x : { word: x, level: fallback }));
  }

  /* The scheduling card behind a word, so the queue can ask easier questions
   * of a word you have just met and harder ones of a word you know. Read
   * through a ref-free plain lookup because it is called during queue build,
   * not during render. */
  /* Both of a word's cards, for deciding what to ask.
   *
   * Production falls back to the recognition card when it has never been
   * graded: the single card that came before the split was graded on
   * production answers too, so it is the honest starting estimate — and it
   * keeps an existing learner's queue exactly as it was until the first
   * production answer splits them. */
  const cardForEntry = (w, lv) => ({
    rec: progress.cards[cardId(lang, lv, w.t)],
    prod: progress.cards[prodCardId(lang, lv, w.t)],
  });

  /** Multiple-choice warm-up. Feeds the same session results as the typing step. */
  function goToChoose(list) {
    const entries = asEntries(list);
    sessionListRef.current = entries;
    const q = buildPracticeQueue(entries, cardForEntry);
    setChooseQueue(q);
    setChooseTotal(q.length);
    setChooseRetired(0);
    setChoosePicked(null);
    setChooseStreak(0);
    chooseSeenRef.current = new Set();
    chooseFirstWrongRef.current = new Set();
    beginReviewSession();
    sessionCommittedRef.current = false;
    setScreen("choose");
  }

  function pickChoice(value) {
    noteWork("study");
    if (!chooseItem || choosePicked) return;
    const correct = chooseOpts.correct;
    const ok = normalize(value) === normalize(correct);

    if (!chooseSeenRef.current.has(chooseItem.id)) {
      chooseSeenRef.current.add(chooseItem.id);
      if (!ok) chooseFirstWrongRef.current.add(chooseItem.id);
    }

    setProgress((p) => bumpStreak(logReview(p, ok)));
    setChooseStreak((s) => (ok ? s + 1 : 0));
    setChoosePicked(value);
  }

  function continueChoose() {
    if (!choosePicked) return;
    const wasCorrect = normalize(choosePicked) === normalize(chooseOpts.correct);
    if (wasCorrect && chooseQueue.length === 1) {
      setChooseRetired((r) => r + 1);
      setChoosePicked(null);
      goToPractice(sessionListRef.current, { keepSession: true });
      return;
    }
    setChooseQueue((q) => {
      const [head, ...rest] = q;
      if (wasCorrect) return rest;
      const at = Math.min(rest.length, 3);
      const nq = [...rest];
      nq.splice(at, 0, head);
      return nq;
    });
    if (wasCorrect) setChooseRetired((r) => r + 1);
    setChoosePicked(null);
  }

  function goToPractice(list, opts = {}) {
    // Accepts either plain word objects (current drawer) or {word, level} entries.
    const entries = asEntries(list);
    sessionListRef.current = entries;
    const q = buildPracticeQueue(entries, cardForEntry,{review:!!opts.review}).map(item=>opts.supported?{...item,supported:true}:item);
    setQueue(q);
    setTotalItems(q.length);
    setRetired(0);
    setAttempts(0);
    setInputVal("");
    setFeedback(null);
    seenRef.current = new Set();
    firstWrongRef.current = new Set();
    missedRef.current = new Map();
    everMissedRef.current = new Set();
    // Coming from the Choose step, keep the accumulated results so the word is
    // scheduled once for the whole sitting rather than twice.
    if (!opts.keepSession) {
      beginReviewSession();
      sessionCommittedRef.current = false;
    }
    setReviewOnly(!!opts.review);
    setScreen("practice");
  }
  /**
   * Drill the hardest cards, ignoring the schedule.
   *
   * Runs through `goToPractice` like any other sitting, so it grades and
   * schedules identically — the only difference is which words are in it.
   */
  function startWeakSpots() {
    if (!weakCards.length) return;
    goToPractice(weakCards.map(({ word, level }) => ({ word, level })));
  }

  function nextAfterSummary() {
    if (reviewOnly) { setReviewOnly(false); setScreen("setup"); return; }
    if (mode === "theme") {
      if (themeIdx + 1 < totalThemes) {
        setThemeIdx((t) => t + 1);
        setLearnIdx(0);
        setFlipped(false);
        setScreen("learn");
      } else {
        setScreen("setup");
      }
      return;
    }
    // Mixed and mine page identically; only the pool behind them differs.
    if (batchIndex + 1 < totalBatches) {
      setBatchIndex((b) => b + 1);
      setLearnIdx(0);
      setFlipped(false);
      setScreen("learn");
    } else {
      setScreen(mode === "mine" ? "wordsHub" : "setup");
    }
  }

  function selectTile(side, id) {
    if (matchedIds.includes(id)) return;
    const next = { ...pending, [side]: pending[side] === id ? null : id };
    setPending(next);
    if (next.left && next.right) {
      if (next.left === next.right) {
        setMatchedIds((m) => [...m, next.left]);
        setPending({ left: null, right: null });
      } else {
        setWrongFlash(true);
        setTimeout(() => {
          setWrongFlash(false);
          setPending({ left: null, right: null });
        }, 450);
      }
    }
  }

  const currentQ = queue[0];
  const isReview = currentQ ? everMissedRef.current.has(currentQ.id) : false;

  function handleCheck() {
    noteWork("study");
    if (!currentQ || feedback) return;
    if (!inputVal.trim()) { setBlankNudge(true); return; }
    let isCorrect;
    if (currentQ.kind === "toEnglish") isCorrect = matchEnglish(inputVal, currentQ.word);
    else if (currentQ.kind === "toTarget") isCorrect = matchTarget(inputVal, currentQ.word, lang);
    else isCorrect = answersMatch(inputVal, currentQ.word.ba || currentQ.word.t);

    setAttempts((a) => a + 1);

    /* The immediate redo is a retention check on an answer already marked
     * wrong. Grading it again would count one miss twice, so it only reports —
     * the card is requeued either way. */
    if (retryMode) {
      setFeedback({ correct: isCorrect, retry: true });
      return;
    }

    if (!seenRef.current.has(currentQ.id)) {
      seenRef.current.add(currentQ.id);
      if (!isCorrect) firstWrongRef.current.add(currentQ.id);
    }

    // Accumulate per-direction outcome; scheduling is applied once at session end.
    const wKey = idForKind(currentQ.kind, lang, currentQ.level, currentQ.word.t);
    const prev = sessionResultsRef.current.get(wKey) || { word: currentQ.word, level: currentQ.level, wrongCount: 0 };
    const assisted=currentQ.supported||assistedRef.current.has(wKey);
    if(!assisted){prev.unassistedAttempts=(prev.unassistedAttempts||0)+1;if(!isCorrect)prev.wrongCount+=1;prev.answeredAt=Date.now();}
    prev.independent=(prev.unassistedAttempts||0)>0;
    prev.assisted=!prev.independent;
    prev.practiceOnly=currentQ.practiceOnly;
    sessionResultsRef.current.set(wKey, prev);

    // Activity log drives the streak and the heatmap; cheap to record per answer.
    setProgress((p) => bumpStreak(logReview(p, isCorrect)));

    if (!isCorrect) {
      everMissedRef.current.add(currentQ.id);
      missedRef.current.set(cardId(lang, currentQ.level, currentQ.word.t), { word: currentQ.word, level: currentQ.level });
    }
    setFeedback({ correct: isCorrect });
  }

  /**
   * Move from the typing drill to the sentence drill.
   *
   * Only words that actually have an example sentence qualify — the C1 levels
   * have none yet, so those batches go straight to the summary rather than
   * showing an empty stage. Scheduling still commits at the true end of the
   * sitting, so a word is graded once across all five stages.
   */
  function goToSentence() {
    if(reviewOnly){commitSession();setScreen("summary");return;}
    const withSentence = sessionListRef.current.filter(({ word }) => word.s && word.s.trim());
    if (!withSentence.length) { commitSession(); setScreen("summary"); return; }
    const q = shuffle(withSentence);
    setSentQueue(q);
    setSentTotal(q.length);
    setSentRetired(0);
    setSentInput("");
    setSentResult(null);
    setSentRetry(false);
    setScreen("sentence");
  }

  const sentItem = sentQueue[0];

  /* Grade whatever the current input mode produced. The chips are joined into
   * the same string the typing box would have produced, so both modes go
   * through one grader rather than two that could disagree about what counts
   * as right. */
  function checkSentence(fromChips) {
    noteWork("study");
    if (!sentItem || sentResult) return;
    const answer = fromChips ?? sentInput;
    if (!answer.trim()) { setBlankNudge(true); return; }
    const expected = sentItem.word.s;
    // Accent/case/ß differences still count as correct — they're reported, not punished.
    const ok = sentenceMatches(expected, answer);
    const slips = ok ? sentenceSlips(expected, answer) : [];
    const diff = diffTokens(expected, answer);

    /* The immediate redo is a retention check on an answer already marked
     * wrong. Grading it again would punish the same miss twice, so it only
     * reports — the sentence still comes back later either way. */
    if (sentRetry) {
      setSentResult({ ok, slips, diff, retry: true });
      return;
    }

    if (!ok) missedRef.current.set(cardId(lang,sentItem.level,sentItem.word.t),{word:sentItem.word,level:sentItem.level});
    setProgress((p) => bumpStreak(logReview(p, ok)));
    setSentResult({ ok, slips, diff });
  }

  /** Lay down one chip from the bank, by its position among the free ones. */
  function placeSentChip(freeIdx) {
    const chip = sentBankFree[freeIdx];
    if (!chip) return;
    setSentPlaced((ps) => [...ps, chip.tok]);
    setSentTaken((ts) => [...ts, chip.at]);
    setSentTyped("");
    setSentTypeMiss(false);
    if (blankNudge) setBlankNudge(false);
  }

  /* Typing towards a chip. One letter narrows the bank; the moment a single
   * chip is left it is placed, so a distinctive word costs one keystroke and
   * only genuinely ambiguous ones cost more. A letter that matches nothing is
   * refused rather than accumulated — a buffer no chip can satisfy would make
   * every later keystroke fail too, with nothing on screen to explain why. */
  function typeSentChip(ch) {
    const next = sentTyped + ch;
    const { ok, place } = typeAhead(sentBankTokens, next);
    if (!ok) { setSentTypeMiss(true); return; }
    setSentTypeMiss(false);
    if (place !== null) placeSentChip(place);
    else setSentTyped(next);
  }

  /* Reveal grades as a miss and shows the sentence, which is what typing it
   * wrongly would have done. Scoring it as neutral would make it the cheapest
   * way through the stage. */
  function revealSentence() {
    if (!sentItem || sentResult) return;
    checkSentence("\u2014");
    setSentPlaced(String(sentItem.word.s).trim().split(/\s+/));
    setSentInput(sentItem.word.s);
  }

  /** Offer one immediate second attempt, with the answer now known. */
  function retrySentence() {
    setSentRetry(true);
    setSentResult(null);
    setSentInput("");
    setSentPlaced([]);
    setSentTaken([]);
    setBlankNudge(false);
  }

  function nextSentence() {
    if (!sentResult) return;
    const firstTimeRight = sentResult.ok && !sentResult.retry;
    setSentResult(null);
    setSentInput("");
    setSentPlaced([]);
    setSentTaken([]);
    setSentRetry(false);
    setBlankNudge(false);

    if (firstTimeRight) {
      setSentRetired((n) => n + 1);
      if (sentQueue.length === 1) { commitSession(); setScreen("summary"); return; }
      setSentQueue((q) => q.slice(1));
      return;
    }
    /* Missed it — back into the queue a few places on, so it returns while the
     * correction is still fresh but not immediately after being shown. */
    setSentQueue((q) => {
      const [head, ...rest] = q;
      const at = Math.min(rest.length, 3);
      const nq = [...rest];
      nq.splice(at, 0, head);
      return nq;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sentence Constructions                                              */
  /* ------------------------------------------------------------------ */

  /* Offline word lookup for the sentence stages: the deck, the conjugated core
   * verbs, and the closed-class function words. Rebuilt only on a language
   * change. */
  const dictionary = useMemo(
    () => {void vocabularyRevision; return buildDictionary(lang, DATA, lang === "fr" ? FR_VERBS : DE_VERBS, lang === "fr" ? FR_TENSES : DE_TENSES);},
    [lang,vocabularyRevision],
  );

  /** How many verb × tense cells have been drilled at least once. */
  const conjDrilledCells = useMemo(
    () => conjMatrix.reduce((n, row) => n + row.cells.filter((c) => c.drilled).length, 0),
    [conjMatrix],
  );

  /* Hand the whole progress object back as a file. Read-only, and the one
   * thing that makes IndexedDB-only storage survivable: the schedule you have
   * built up is otherwise locked inside one browser profile. */
  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocab-drawer-progress-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [importReport, setImportReport] = useState(null);

  /* Read an exported file back in. Merges rather than replaces — importing a
   * phone's progress into a laptop means "add what I did there", never
   * "delete what I did here" — and reports what it did, because a silent
   * merge into your own scheduling data is not something to trust. */
  async function importProgress(file) {
    if (!file) return;
    setImportReport(null);
    try {
      if(file.size>25*1024*1024)throw new Error("Backup exceeds 25 MB.");
      await storage.set("vocabdrawer:pre-import",JSON.stringify(progress));
      const { progress: merged, stats } = mergeProgress(progress, JSON.parse(await file.text()));
      setProgress(merged);
      setImportReport({
        ok: true,
        text: `${stats.added} new ${stats.added === 1 ? "card" : "cards"}, ${stats.updated} updated, ${stats.kept} kept as they were`
          + (stats.words ? `, ${stats.words} of your own words` : ""),
      });
    } catch (err) {
      setImportReport({ ok: false, text: err.message || "That file could not be read." });
    }
  }

  /* The typed buffer belongs to one chip on one sentence. Every way the stage
   * moves on — a new word, a retry, a check, switching to the typing box —
   * lands here, which is why this is an effect and not six call sites that
   * each have to remember. */
  useEffect(() => {
    setSentTyped("");
    setSentTypeMiss(false);
  }, [sentItem, sentMode, sentResult]);

  /* ------------------------------------------------------------------ */
  /* Collocations                                                        */
  /* ------------------------------------------------------------------ */

  /* Coverage: where the words you have studied sit in the frequency list. */
  /* Ability, as opposed to activity: what is held, in each direction.
   *
   * Uses the same `WORD_RANK` the reach panel does, so "held in the top
   * 1,000" and "studied in the top 1,000" cannot disagree about which words
   * those are. */
  const ability = useMemo(
    () => abilityFrom({
      entries: allWordsForLang, lang, cards: progress.cards,
      rankOf: (l, w) => WORD_RANK[l]?.[w],
    }),
    [allWordsForLang, lang, progress.cards],
  );
  const abilityGap = useMemo(() => productionGap(ability), [ability]);

  const freqReach = useMemo(
    () => frequencyReach({
      entries: allWordsForLang, lang, cards: progress.cards, cardIdFor: cardId,
      rankOf: (l, t) => WORD_RANK[l]?.[t],
    }),
    [allWordsForLang, lang, progress.cards],
  );

  const colList = useMemo(() => collocationsFor(lang), [lang]);
  const colQuiz = useMemo(
    () => (colPhase === "running" ? buildCollocationQuiz(colList, colIdx) : null),
    [colPhase, colList, colIdx],
  );
  const colStats = useMemo(() => scoreCollocations(colAnswers), [colAnswers]);

  /* Switching language swaps the whole set, so a round in progress no longer
   * refers to anything. */
  useEffect(() => { setColPhase("idle"); setColIdx(0); setColPicked(null); setColAnswers([]); }, [lang]);

  function startCollocations() {
    setColIdx(0); setColPicked(null); setColAnswers([]); setColPhase("running");
  }
  function pickCollocation(v) {
    noteWork("collocations");
    if (!colQuiz || colPicked) return;
    setColPicked(v);
    setColAnswers((a) => [...a, { ok: v === colQuiz.answer, item: colQuiz.item }]);
  }
  function nextCollocation() {
    setColPicked(null);
    if (colIdx + 1 < colList.length) setColIdx((i) => i + 1);
    else setColPhase("done");
  }

  /* ------------------------------------------------------------------ */
  /* Fluency                                                             */
  /* ------------------------------------------------------------------ */

  /* Only words that have already held for a week. This is the condition the
   * whole exercise rests on, so it is computed from the same cards the
   * scheduler uses rather than from anything the round could drift out of. */
  const flPool = useMemo(
    () => eligibleForFluency({ entries: allWordsForLang, lang, cards: progress.cards, cardIdFor: cardId }),
    [allWordsForLang, lang, progress.cards],
  );
  const flReadiness = useMemo(
    () => fluencyReadiness({ entries: allWordsForLang, lang, cards: progress.cards, cardIdFor: cardId }),
    [allWordsForLang, lang, progress.cards],
  );
  const flRecord = progress.fluency?.[`${lang}:${flDirection}`] || { best: 0, runs: [] };
  const flItem = flQueue[flIdx] || null;

  function startFluency() {
    if (flPool.length < MIN_POOL) return;
    flAnswersRef.current = [];
    setFlQueue(buildFluencyRound(flPool, flDirection, Date.now() % 1000));
    setFlIdx(0);
    setFlLeft(ROUND_SECONDS);
    setFlStreak(0);
    setFlWrong(null);
    setFlScore(null);
    setFlPhase("running");
  }

  /** End the round and keep the result. The SRS is deliberately untouched. */
  function finishFluency() {
    noteWork("fluency");
    const score = scoreRound(flAnswersRef.current, ROUND_SECONDS);
    const key = `${lang}:${flDirection}`;
    setFlPrevBest(progress.fluency?.[key]?.best || 0);
    setFlScore(score);
    setFlPhase("done");
    setProgress((p) => ({
      ...p,
      fluency: { ...(p.fluency || {}), [key]: recordRound(p.fluency?.[key], score, todayKey()) },
    }));
  }

  function answerFluency(choice) {
    if (flPhase !== "running" || !flItem) return;
    const ok = choice === flItem.answer;
    flAnswersRef.current.push({ ok, key: flItem.key });
    setFlStreak((n) => (ok ? n + 1 : 0));
    /* The correction is shown for the next question only — long enough to
     * register, short enough not to become reading. */
    setFlWrong(ok ? null : { prompt: flItem.prompt, answer: flItem.answer });
    setFlIdx((i) => i + 1);
  }

  const finishFluencyRef=useRef(finishFluency);
  finishFluencyRef.current=finishFluency;
  /* The clock. It owns ending the round, so a learner who stops answering
   * still gets a score rather than a screen that waits forever. */
  useEffect(() => {
    if (flPhase !== "running") return undefined;
    if (flLeft <= 0) { finishFluencyRef.current(); return undefined; }
    const t = setTimeout(() => setFlLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [flPhase, flLeft]);

  /* Running out of questions is a bug, not an ending — the queue is built long
   * enough that it should not happen, so it is topped up rather than hidden. */
  useEffect(() => {
    if (flPhase === "running" && flQueue.length && flIdx >= flQueue.length - 3) {
      setFlQueue((q) => [...q, ...buildFluencyRound(flPool, flDirection, q.length)]);
    }
  }, [flPhase, flIdx, flQueue.length, flPool, flDirection]);

  /* ------------------------------------------------------------------ */
  /* Word Roots                                                          */
  /* ------------------------------------------------------------------ */

  /* Laws grouped for the picker, in the order the groups are declared —
   * chronological, which is also the order they are easiest to learn in. */
  const etymGroups = useMemo(
    () => Object.entries(LAW_GROUPS).map(([id, meta]) => ({ id, ...meta, laws: LAWS.filter((l) => l.group === id) })),
    [],
  );

  const etymFamilyObj = useMemo(
    () => FAMILIES.find((f) => `${f.layer}:${f.form}` === etymFamily) || null,
    [etymFamily],
  );

  /* The forked tree for the selected root.
   *
   * Both chains are looked up by the *deck headword*, which is the key the
   * harvest used, so a family whose French member is missing a chain falls
   * back to a single limb rather than drawing an empty fork. */
  const etymTree = useMemo(() => {
    if (!etymFamilyObj) return null;
    const { layer, form } = etymFamilyObj;
    const entries = [];
    const add = (lang, chain) => {
      if (chain) entries.push({ lang, rungs: rootAt(rungsFromLayers(chain.c, lang), layer, form) });
    };
    for (const lang of ["fr", "de"]) {
      const m = etymFamilyObj.members.find((x) => x.lang === lang);
      add(lang, m && CHAINS[`${lang}:${m.t}`]);
    }
    /* English joins only where its chain was proved to meet the others; a
     * family without one draws two limbs rather than a guess. */
    add("en", etymFamilyObj.en && CHAINS[`en:${etymFamilyObj.en}`]);
    return entries.length >= 2 ? mergeChains(entries) : null;
  }, [etymFamilyObj]);

  /** Headwords by language, for the tree's leaves. */
  const etymWords = useMemo(() => {
    if (!etymFamilyObj) return {};
    const out = {};
    for (const m of etymFamilyObj.members) out[m.lang] = m.t;
    if (etymFamilyObj.en) out.en = etymFamilyObj.en;
    return out;
  }, [etymFamilyObj]);

  const etymFamilyLaws = useMemo(() => {
    if (!etymTree) return [];
    const rungs = [];
    (function walk(n) { rungs.push(n); (n.children || []).forEach(walk); })(etymTree);
    const seen = new Set();
    return lawsTouching(rungs).filter((l) => !seen.has(l.id) && seen.add(l.id)).slice(0, 4);
  }, [etymTree]);

  const etymLawObj = useMemo(() => LAWS.find((l) => l.id === etymLaw) || null, [etymLaw]);

  /* Word building. The families are per language — a French learner has no use
   * for the German prefix table — so switching language changes the list. */
  const bldFamilies = useMemo(() => WORD_FAMILIES.filter((f) => f.lang === lang), [lang]);
  const bldFamilyObj = useMemo(() => bldFamilies.find((f) => f.id === bldFamily) || null, [bldFamilies, bldFamily]);
  const bldQuiz = useMemo(
    () => (bldQuizIdx === null || !bldFamilyObj ? null : buildFamilyQuiz(bldFamilyObj, bldQuizIdx)),
    [bldQuizIdx, bldFamilyObj],
  );

  /* A family selected in French cannot survive a switch to German, so the
   * selection is dropped rather than left pointing at a family the list no
   * longer contains. */
  useEffect(() => { setBldFamily(null); setBldQuizIdx(null); setBldAffix(null); }, [lang]);

  function startBldQuiz() { setBldQuizIdx(0); setBldPicked(null); setBldStats({ asked: 0, right: 0 }); }
  function pickBldAnswer(w) {
    if (!bldQuiz || bldPicked) return;
    setBldPicked(w);
    setBldStats((st) => ({ asked: st.asked + 1, right: st.right + (w === bldQuiz.answer ? 1 : 0) }));
  }
  function nextBldQuiz() { setBldQuizIdx((i) => (i === null ? 0 : i + 1)); setBldPicked(null); }
  function endBldQuiz() { setBldQuizIdx(null); setBldPicked(null); }
  function selectBldFamily(id) { setBldFamily(id); endBldQuiz(); setBldAffix(null); }

  /* The live question. Built from the index rather than stored, so it cannot
   * drift out of step with the score beside it. */
  const etymQuiz = useMemo(() => {
    if (etymQuizIdx === null || !etymLawObj) return null;
    // Grimm and the Gallo-Romance rules are asked in German and French
    // respectively; the High German shift only has an English↔German side.
    const ask = etymLawObj.group === "gallo" ? "fr" : "de";
    return buildLawQuiz(etymLawObj, etymQuizIdx, ask);
  }, [etymQuizIdx, etymLawObj]);

  function startEtymQuiz() {
    setEtymQuizIdx(0);
    setEtymInput("");
    setEtymResult(null);
    setEtymStats({ asked: 0, right: 0 });
  }
  function checkEtymQuiz() {
    noteWork("etymology");
    if (!etymQuiz || etymResult) return;
    const ok = gradeLawAnswer(etymInput, etymQuiz.answer);
    setEtymResult({ ok });
    setEtymStats((st) => ({ asked: st.asked + 1, right: st.right + (ok ? 1 : 0) }));
  }
  function nextEtymQuiz() {
    setEtymQuizIdx((i) => (i === null ? 0 : i + 1));
    setEtymInput("");
    setEtymResult(null);
  }
  function endEtymQuiz() {
    setEtymQuizIdx(null);
    setEtymInput("");
    setEtymResult(null);
  }
  /** Selecting anything new drops out of practice — the score belongs to one rule. */
  function selectEtymLaw(id) { setEtymLaw(id); setEtymView("laws"); endEtymQuiz(); }
  function selectEtymFamily(id) { setEtymFamily(id); endEtymQuiz(); }

  /* The word bank for the desktop sentence stage.
   *
   * The sentence's own tokens, plus a few near-misses drawn from the same
   * batch. The distractors are what make the exercise more than a jigsaw:
   * without them every chip belongs somewhere and word order is the only
   * question, which is not what the stage is testing.
   *
   * Seeded off the sentence itself rather than shuffled per render, or the
   * chips would reorder under the cursor on every keystroke elsewhere. */
  const sentBankAll = useMemo(() => {
    if (!sentItem) return [];
    const tokens = String(sentItem.word.s).trim().split(/\s+/);
    const own = new Set(tokens.map(normalize));
    const pool = [];
    for (const w of currentBatch) {
      if (!w?.s || w.t === sentItem.word.t) continue;
      for (const tok of String(w.s).trim().split(/\s+/)) {
        if (tok.length < 3 || own.has(normalize(tok))) continue;
        pool.push(tok.replace(/[.,;:!?»«]$/u, ""));
      }
    }
    const seen = new Set();
    const distractors = pool.filter((t) => {
      const k = normalize(t);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 3);
    /* A stable shuffle: same sentence, same order, every render. */
    const all = [...tokens, ...distractors];
    return all
      .map((t, i) => ({ t, k: (i * 2654435761 + t.length * 40503) % 100000 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.t);
  }, [sentItem, currentBatch]);

  /* What is still in the bank. The chips render from this and the keyboard
   * resolves against it, so a typed letter and a click always mean the same
   * chip — indices into a filtered copy computed twice would not. */
  const sentBankFree = useMemo(
    () => sentBankAll.map((tok, i) => ({ tok, at: i })).filter(({ at }) => !sentTaken.includes(at)),
    [sentBankAll, sentTaken],
  );
  const sentBankTokens = useMemo(() => sentBankFree.map((b) => b.tok), [sentBankFree]);

  /* The import reader's text, already classified per word.
   *
   * `known` is in the deck or already saved, `gloss` has a lookup to show, and
   * everything else is greyed — which the legend names as "no gloss found" so
   * an unclickable-looking word reads as a stated outcome rather than a bug. */
  const importSegments = useMemo(
    () => importSentences.map((sent) =>
      segmentSentence(sent).map((seg) => {
        if (seg.type === "gap") return seg;
        const k = lookupKey(seg.v);
        const saved = savedImportKeys.has(k) || (glosses[k] && savedImportKeys.has(normalize(glosses[k].lemma)));
        const state = knownKeys.has(k) || saved ? "known" : glosses[k] ? "gloss" : "none";
        return { ...seg, state };
      }),
    ),
    [importSentences, glosses, knownKeys, savedImportKeys],
  );

  /** The words saved out of the text currently open. */
  const savedFromThisText = useMemo(() => {
    const src = importTitle.trim() || "imported text";
    return importedWords
      .filter(({ word: w }) => w.src === src)
      .map(({ word: w }) => ({ term: w.t, meaning: w.e === "(no gloss)" ? "" : w.e }));
  }, [importedWords, importTitle]);

  /* The one thing worth doing next, and today's goal.
   *
   * Every input here is already derived for some other panel — the gap was
   * that none of it reached the home screen's "study something new". */
  const dailyGoal = progress.dailyGoal || 20;

  const leechCount = useMemo(
    () => allWordsForLang.filter(({ word, level: lv }) => isLeech(progress.cards[cardId(lang, lv, word.t)])).length,
    [allWordsForLang, progress.cards, lang],
  );

  /* Which of the four strands has gone longest without work, and one thing to
   * do in it. `available` is the honest part: a strand's suggestion has to be
   * something that can actually be started in this language right now, or the
   * home screen sends you to an empty screen and stops being trustworthy. */
  const strandGap = useMemo(() => {
    const available = new Set(Object.keys(ACTIVITIES));
    if (!PHRASES[lang] || !Object.keys(PHRASES[lang]).length) available.delete("phrases");
    if (!FAMILIES.some((f) => f.members?.some((m) => m.lang === lang))) available.delete("etymology");
    /* Fluency and the mistakes drill both replay what you have already done,
     * so recommending them before there is anything to replay is a dead end. */
    if (!Object.keys(progress.cards || {}).length) { available.delete("fluency"); available.delete("mistakes"); }
    if (!mistakeList.length) available.delete("mistakes");
    if (!importedWords.length) available.delete("mywords");
    return neglectedStrand(progress.activity, todayKey(), { available,lang });
  }, [progress.activity, progress.cards, lang, mistakeList.length, importedWords.length]);

  const strandRows = useMemo(
    () => strandBalance(progress.activity, todayKey(),{lang}).map((r) => ({ ...r, label: STRANDS[r.strand].short })),
    [progress.activity,lang],
  );

  const suggestion = useMemo(() => {
    const unstarted = currentGroups.find((g) => {
      const m = drawerMastery[g.topic];
      return m && m.mastered === 0 && !g.words.some((w) => progress.cards[cardId(lang, level, w.t)]);
    });
    const untouched = tenseSet.find((t) =>
      !verbSet.some((v) => progress.cards[`${lang}:conj:${verbKey(v)}:${t.key}`]));
    /* Lessons: resume one left halfway, or offer the first to someone who has
     * never taken one. */
    const lessonList = lessonsFor(lang);
    const lessonRecs = progress.lessons?.[lang] || {};
    const halfway = lessonList.find((l) => lessonRecs[l.id] && !lessonRecs[l.id].done);
    const neverTaken = !lessonList.some((l) => lessonRecs[l.id]);
    return nextAction({
      unfinishedLesson: halfway
        ? { n: halfway.n, title: halfway.title, stage: LESSON_STAGES[lessonRecs[halfway.id].stage || 0]?.label || "the start" }
        : null,
      firstLesson: level !== "A1" && neverTaken && lessonList[0] ? { n: lessonList[0].n, title: lessonList[0].title } : null,
      strandGap,
      mistakeCount: mistakeList.length,
      dueCount: dueCards.length,
      weakCount: weakCards.length,
      leechCount,
      unstartedDrawer: unstarted?.topic || null,
      untouchedTense: untouched?.label || null,
      dueToday: reviewedToday,
      goal: dailyGoal,
    });
  }, [dueCards.length, weakCards.length, leechCount, mistakeList.length, strandGap, currentGroups, drawerMastery,
      progress.cards, progress.lessons, lang, level, tenseSet, verbSet, reviewedToday, dailyGoal]);

  /* Everything the desktop progress board reads, derived once.
   *
   * All of it comes off `progress.cards` and `progress.history` — the same two
   * places the home screen's due count and streak come from — so the forecast
   * on this screen and the "N due" on that one cannot drift apart. */
  const progressBoard = useMemo(() => {
    const maturity = { new: 0, learning: 0, young: 0, mature: 0 };
    const buckets = Array.from({ length: 8 }, () => 0);
    for (const { word, level: lv } of allWordsForLang) {
      const card = progress.cards[cardId(lang, lv, word.t)];
      const prod=progress.cards[prodCardId(lang,lv,word.t)];
      maturity[cardStage(card)] += 1;
      if (!card&&!prod) continue;
      const dates=[card?.due,prod?.due].filter(Boolean);
      const d = Math.max(0,Math.min(...dates.map(daysUntil)));
      if (d <= 7) buckets[d] += 1;
    }

    const levelRows = levelsFor(lang).map((lv) => {
      const groups = DATA[lang][lv];
      const drawers = groups.map((g) => {
        const started = g.words.filter((w) => progress.cards[cardId(lang, lv, w.t)]).length;
        return { topic: g.topic, pct: Math.round((started / g.words.length) * 100) };
      });
      return {
        level: lv,
        total: groups.reduce((n, g) => n + g.words.length, 0),
        started: groups.reduce((n, g) => n + g.words.filter((w) => progress.cards[cardId(lang, lv, w.t)]).length, 0),
        drawers,
      };
    });

    /* Thirty days of history, not all of it: the accuracy figure is meant to
     * describe how you are doing now, and a lifetime average stops moving. */
    let reviews = 0, correct = 0;
    for (let i = 0; i < 30; i += 1) {
      const day = progress.history[addDays(todayKey(), -i)];
      if (day) { reviews += day.reviews; correct += day.correct; }
    }

    const startedImported = importedWords.filter(({ word: w }) => progress.cards[cardId(lang, "IMP", w.t)]).length;

    return {
      maturity,
      levels: levelRows,
      myWords: importedWords.length
        ? { total: importedWords.length, started: startedImported, pct: Math.round((startedImported / importedWords.length) * 100) }
        : null,
      habit: {
        streak: progress.streak || 0,
        today: reviewedToday,
        firstTry: reviews ? Math.round((correct / reviews) * 100) : null,
      },
      forecast: buckets.map((count, i) => ({ count, label: i === 0 ? "today" : `+${i}` })),
      trend: accuracyTrend(progress.history, 30, todayKey(), addDays),
    };
  }, [allWordsForLang, progress.cards, progress.history, progress.streak, reviewedToday, importedWords, lang]);

  /* ---- Reading Room and Writing Desk ----------------------------------- */

  /* What the German grammar rules know: every finite form in the verb tables
   * and the gender of every noun in the deck. It depends only on the data, so
   * it is built once. */
  const deLexicon = useMemo(() => {void vocabularyRevision; return germanLexicon({ data: DATA, verbs: [...DE_VERBS, ...DE_C1_VERBS] });}, [vocabularyRevision]);

  /* Headwords this learner has actually studied, for the "from drawers you've
   * studied" line under a piece of writing. Keyed loosely so an inflected
   * form in the writing can find its headword. */
  const studiedKeys = useMemo(() => {
    const keys = new Set();
    for (const { word, level: lv } of allWordsForLang) {
      if (word?.t && progress.cards[cardId(lang, lv, word.t)]) keys.add(lookupKey(word.t));
    }
    return keys;
  }, [allWordsForLang, progress.cards, lang]);

  const knownLemma = (form) => {
    const hit = lookupInflected(dictionary, form, lang);
    return hit && studiedKeys.has(lookupKey(hit.lemma)) ? hit.lemma : null;
  };

  /** One check of a piece of writing in the current language. */
  const checkWritingNow = (text) => checkWriting(text, lang, { lexicon: lang === "de" ? deLexicon : null, knownLemma });

  /* The same check, but remembered. The checker has just named every rule this
   * learner broke; before the error ledger that diagnosis lived exactly as long
   * as the feedback panel stayed open. The mistakes drill deliberately uses the
   * quiet version — the ledger is a record of writing done for real, not of
   * practice attempts. */
  const runWritingCheck = async (text) => {
    const result = await checkWritingNow(text);
    setProgress((p) => ({ ...p, errors: recordIssues(p.errors, { lang, issues: result.issues, text, today: todayKey() }) }));
    noteWork("writing");
    return result;
  };


  /** The deck's own gloss for a word met in a passage, or null. */
  const glossOf = (word) => {
    const direct = describeWord(dictionary, word);
    if (direct) return direct;
    const hit = lookupInflected(dictionary, word, lang);
    return hit ? `${hit.gender ? `${hit.gender} ` : ""}${hit.lemma} — ${hit.gloss}` : null;
  };

  /* Which kinds of work have actually been done, for the four strands.
   *
   * Written once per activity per day rather than per answer: it is a record
   * of what your practice consists of, not a second review log, and writing
   * it on every keystroke-check would be a state update per answer for a fact
   * that changes once a day. */
  function noteWork(key) {
    setActivityOverride(key);
    setProgress((prev) => {
      const today = todayKey();
      if (prev.activity?.[`${lang}:${key}`]?.last === today) return prev;
      return { ...prev, activity: recordActivity(prev.activity, `${lang}:${key}`, today) };
    });
  }

  /* A lesson's progress: the furthest stage reached and the scores so far, so
   * a forty-minute lesson can be left and picked up where it stopped. */
  function recordLesson(id, rec) {
    const today = todayKey();
    setProgress((p) => {
      const all = { ...(p.lessons || {}) };
      const mine = { ...(all[lang] || {}) };
      const prev = mine[id] || {};
      mine[id] = {
        ...prev,
        ...rec,
        first: prev.first || today,
        last: today,
        runs: (prev.runs || 0) + (rec.done && !prev.doneAt ? 1 : 0),
        doneAt: rec.done ? today : prev.doneAt,
      };
      all[lang] = mine;
      return { ...p, lessons: all };
    });
  }

  function recordReading(id, rec) {
    noteWork("reading");
    setProgress((p) => ({ ...p, reading: { ...(p.reading || {}), [id]: rec } }));
  }
  function saveWriting(entry) {
    noteWork("writing");
    setProgress((p) => ({ ...p, writing: [entry, ...(p.writing || [])].slice(0, WRITING_KEEP) }));
  }

  /** The verbs this language can build sentences with, in the chosen tense. */
  const sentcVerbSet = useMemo(() => usableVerbs(lang, lang === "fr" ? FR_VERBS : DE_VERBS), [lang]);
  const sentcTenseSet = useMemo(() => (lang === "fr" ? FR_TENSES : DE_TENSES), [lang]);
  const sentcTenseLabel = useMemo(
    () => sentcTenseSet.find((t) => t.key === sentcTense)?.label || "",
    [sentcTenseSet, sentcTense],
  );

  /* The refresher list: exactly the nouns this round will use, so the screen
   * that promises "these words come up" is telling the truth. Deriving it from
   * everything the chosen verbs *could* take listed 57 words for a round of 8. */
  const sentcNouns = useMemo(() => {
    const seen = new Map();
    sentcRound.forEach((item) => { if (!seen.has(item.noun.t)) seen.set(item.noun.t, item.noun); });
    return [...seen.values()];
  }, [sentcRound]);

  const SENTC_ROUND = 8;

  /** Build a round of sentences from the current picks. */
  function buildSentcRound() {
    const verbs = sentcVerbMode === "random"
      ? sentcVerbSet
      : sentcVerbSet.filter((v) => sentcPicked.includes(v.inf));
    if (!verbs.length || !sentcTense) return [];
    const subjects = SENT_SUBJECTS[lang];
    const times = timePhrasesFor(lang, sentcTense);
    const allVerbs = lang === "fr" ? FR_VERBS : DE_VERBS;
    const out = [];
    for (let i = 0; i < SENTC_ROUND; i++) {
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      const pool = nounPoolFor(lang, verb, DATA);
      if (!pool.length) continue;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const noun = pick.word;
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      /* The "time first" shape always fronts a phrase — that is what it is for.
       * The plain shape fronts one half the time, which keeps the easiest level
       * from being eight identical skeletons. */
      const wantsTime = sentcShape === "time" || (sentcShape === "plain" && Math.random() < 0.5);
      const time = wantsTime && times.length
        ? times[Math.floor(Math.random() * times.length)]
        : null;
      /* A modal carries the tense itself, so the chosen tense applies to the
       * modal, not the main verb — the main verb is left as an infinitive.
       * Building it in a past tense would be a different lesson, so the modal
       * shape stays in the present. */
      const modal = sentcShape === "modal" ? pickModal(lang, allVerbs, subject.p, i) : null;
      const opener = sentcShape === "subordinate" ? pickOpener(lang, i) : null;
      if (sentcShape === "modal" && !modal) continue;
      if (sentcShape === "subordinate" && !opener) continue;
      out.push(buildSentence({
        lang, verb, tenseKey: sentcTense, subject, noun, time,
        enVerb: pick.enVerb, shape: sentcShape, modal, opener,
      }));
    }
    return out;
  }

  /**
   * Lay out one item: an empty answer row and a shuffled bank.
   *
   * Tiles carry an id rather than being identified by their text, because a
   * sentence can legitimately repeat a word ("sie ... sie") and two tiles
   * reading the same thing must still be told apart.
   */
  function presentSentc(item) {
    const tiles = item.tokens.map((tok, i) => ({ id: `t${i}`, tok, gloss: item.glosses[i] }));
    setSentcPlaced([]);
    setSentcBank(shuffle(tiles));
    setSentcResult(null);
    setSentcTyped("");
    setSentcTypeMiss(false);
  }

  /** Build the round, then show its words before any of them is asked for. */
  function prepareSentcRound() {
    const round = buildSentcRound();
    if (!round.length) return;
    setSentcRound(round);
    setSentcIdx(0);
    setSentcRight(0);
    setScreen("sentcWords");
  }

  function startSentcRun() {
    if (!sentcRound.length) return;
    setSentcIdx(0);
    setSentcRight(0);
    presentSentc(sentcRound[0]);
    setScreen("sentcBuild");
  }

  const sentcItem = sentcRound[sentcIdx];
  /* Which bank tiles the typed prefix still fits, and how much of each to mark. */
  const sentcMatches = typeAhead(sentcBank.map((t) => t.tok), sentcTyped).candidates;
  const sentcReach = new Map(sentcMatches.map((c) => [c.index, c.reach]));

  function placeTile(tile) {
    if (sentcResult) return;
    setSentcBank((b) => b.filter((t) => t.id !== tile.id));
    setSentcPlaced((p) => [...p, tile]);
    setSentcTyped("");
    setSentcTypeMiss(false);
  }

  /* One more typed letter. A letter matching nothing is refused rather than
   * appended — a buffer no tile can satisfy would make every later keystroke
   * fail too, with nothing on screen to say why. */
  function typeSentcTile(ch) {
    const next = sentcTyped + ch;
    const { ok, place } = typeAhead(sentcBank.map((t) => t.tok), next);
    if (!ok) { setSentcTypeMiss(true); return; }
    setSentcTypeMiss(false);
    if (place !== null) placeTile(sentcBank[place]);
    else setSentcTyped(next);
  }
  function unplaceTile(tile) {
    if (sentcResult) return;
    setSentcPlaced((p) => p.filter((t) => t.id !== tile.id));
    setSentcBank((b) => [...b, tile]);
    setSentcTyped("");
    setSentcTypeMiss(false);
  }

  function checkSentc() {
    noteWork("sentences");
    if (!sentcItem || sentcResult || !sentcPlaced.length) return;
    const said = sentcPlaced.map((t) => t.tok);
    const same = (a, b) => a.length === b.length && a.every((x, i) => normalize(x) === normalize(b[i]));
    /* An alternate is a different but equally correct order — German will take
     * the object in the front field as readily as the time phrase. Marking a
     * grammatical sentence wrong because it was not the generated one teaches
     * the learner to guess our output rather than the language. */
    const exact = same(said, sentcItem.tokens);
    const alt = !exact && sentcItem.alternates.some((a) => same(said, a));
    const ok = exact || alt;
    if (ok) setSentcRight((n) => n + 1);
    setProgress((p) => bumpStreak(logReview(p, ok)));
    setSentcResult({ ok, alt });
  }

  function nextSentc() {
    if (!sentcResult) return;
    const next = sentcIdx + 1;
    if (next >= sentcRound.length) { setScreen("sentcDone"); return; }
    setSentcIdx(next);
    presentSentc(sentcRound[next]);
  }

  /* ------------------------------------------------------------------ */
  /* Keyboard shortcuts                                                  */
  /* ------------------------------------------------------------------ */

  /**
   * Answer without reaching for the mouse.
   *
   * A round is dozens of small decisions, and the trip to the pointer between
   * each one is most of the elapsed time. Number keys pick an option, Enter
   * advances, Backspace takes back the last tile.
   *
   * While a text input holds focus this stays out of the way: those screens
   * bind Enter themselves, and inside an input a digit is just a digit. But
   * they disable the input the moment an answer is checked, so focus is gone
   * exactly when Enter is most wanted — that is the gap the tail of this
   * handler closes, letting one key carry a typed answer through to the next
   * question.
   */
  /* Held in a ref, reassigned every render, and subscribed once.
   *
   * Listing the handlers this calls as dependencies would re-subscribe on every
   * render, since they are new identities each time. Listing the state they read
   * instead — what this used to do — was correct only by construction: each
   * handler's state happened to feed one of the listed values. A ref is always
   * current, so that reasoning is no longer load-bearing. */
  const keyHandlerRef = useRef(null);
  keyHandlerRef.current = function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

    const nth = /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : null;
    const take = () => e.preventDefault();

    if (screen === "choose" && chooseOpts) {
      if (e.key === "Enter" && choosePicked) { take(); continueChoose(); }
      else if (nth !== null && !choosePicked && chooseOpts.options[nth] !== undefined) { take(); pickChoice(chooseOpts.options[nth]); }
      return;
    }
    if (screen === "conjChoose" && conjMcOpts) {
      if (e.key === "Enter" && conjMcPicked) { take(); continueConjMc(); }
      else if (nth !== null && !conjMcPicked && conjMcOpts.options[nth] !== undefined) { take(); pickConjMc(conjMcOpts.options[nth]); }
      return;
    }
    /* Fluency answers with 1-3. This is not a convenience: the round measures
     * how fast a meaning comes back, and making the learner aim a mouse at one
     * of three moving targets measures their aim instead. */
    if (screen === "collocations" && colPhase === "running") {
      if (!colPicked && nth !== null && colQuiz?.options[nth] !== undefined) { take(); pickCollocation(colQuiz.options[nth]); }
      else if (colPicked && e.key === "Enter") { take(); nextCollocation(); }
      return;
    }
    if (screen === "fluency" && flPhase === "running") {
      if (nth !== null && flItem?.options[nth] !== undefined) { take(); answerFluency(flItem.options[nth]); }
      return;
    }
    if (screen === "sentcBuild") {
      const onBtn = el?.tagName === "BUTTON";
      if (e.key === "Enter") {
        if (onBtn) return;
        take();
        if (sentcResult) nextSentc();
        else if (sentcPlaced.length) checkSentc();
        return;
      }
      if (sentcResult) return;
      if (e.key === "Backspace") {
        take();
        if (sentcTyped) { setSentcTyped(sentcTyped.slice(0, -1)); setSentcTypeMiss(false); }
        else if (sentcPlaced.length) unplaceTile(sentcPlaced[sentcPlaced.length - 1]);
        return;
      }
      if (e.key === " ") {
        if (onBtn) return;
        take();
        const idx = commitTypeAhead(sentcBank.map((t) => t.tok), sentcTyped);
        if (idx !== null) placeTile(sentcBank[idx]);
        return;
      }
      if (e.key.length === 1 && /[\p{L}\p{N}'\u2019-]/u.test(e.key)) { take(); typeSentcTile(e.key); }
      return;
    }

    /* The desktop sentence stage while the word bank is up. Letters type
     * towards a chip, space settles a tie that no further letter can, and
     * backspace walks back through the buffer and then the sentence. */
    if (screen === "sentence" && sentMode === "chips" && !sentResult) {
      /* A focused button owns Enter and Space — that is how it is pressed —
       * so those two go to it rather than to the bank. Letters still type,
       * since no button wants them. */
      const onButton = el?.tagName === "BUTTON";
      if (e.key === "Enter") {
        if (onButton) return;
        if (sentPlaced.length) { take(); checkSentence(sentPlaced.join(" ")); }
        return;
      }
      if (e.key === "Backspace") {
        take();
        if (sentTyped) { setSentTyped(sentTyped.slice(0, -1)); setSentTypeMiss(false); }
        else if (sentPlaced.length) {
          setSentPlaced((ps) => ps.slice(0, -1));
          setSentTaken((ts) => ts.slice(0, -1));
        }
        return;
      }
      if (e.key === " ") {
        if (onButton) return;
        take();
        const idx = commitTypeAhead(sentBankTokens, sentTyped);
        if (idx !== null) placeSentChip(idx);
        return;
      }
      /* Letters, and the marks that are part of a word — an apostrophe is
       * inside "l'homme", so it has to be typeable. */
      if (e.key.length === 1 && /[\p{L}\p{N}'\u2019-]/u.test(e.key)) { take(); typeSentChip(e.key); }
      return;
    }

    /* The typed screens, once their input has gone disabled. Only the
     * advance is handled here — checking still belongs to the input, so an
     * empty box can never be submitted by a stray Enter. preventDefault
     * matters: without it Enter would also re-fire whichever button happens
     * to hold focus, replaying the audio on the way past. */
    if (e.key !== "Enter") return;
    if (screen === "practice" && feedback) {
      take();
      if (!feedback.correct && !feedback.retry) retryQuestion();
      else handleContinue();
    } else if (screen === "sentence" && sentResult) {
      take();
      if (!sentResult.ok && !sentResult.retry) retrySentence();
      else nextSentence();
    } else if (screen === "conjugation" && conjResult) {
      take();
      nextConjugation();
    } else if (screen === "dictation" && dictResult) {
      take();
      nextDictation();
    }

    /* Everywhere else Enter presses whatever the screen's primary button is.
     *
     * These were added one screen at a time as each was built, which left a
     * learner discovering by trial which screens take the keyboard — the worst
     * possible pattern, because the ones that do teach you to expect it.
     * Anything with an obvious "and now continue" belongs here. */
    /* Learn advances a card, and takes the whole batch on from the last one —
     * which is what the button under the card already does. */
    else if (screen === "learn") {
      take();
      if (learnIdx + 1 < currentBatch.length) { setLearnIdx((i) => i + 1); setFlipped(false); }
      else goToMatching();
    }
    else if (screen === "matching" && matchedIds.length === currentBatch.length) { take(); goToChoose(); }
    else if (screen === "speaking" && speakResult) { take(); nextSpeaking(); }
    else if (screen === "sentcWords") { take(); startSentcRun(); }
    else if (screen === "etymology" && etymQuiz) {
      take();
      if (etymResult) nextEtymQuiz(); else checkEtymQuiz();
    }
    else if (screen === "etymology" && bldQuiz && bldPicked) { take(); nextBldQuiz(); }
    /* The end-of-round screens: Enter takes the offer rather than stranding
     * the learner reaching for the mouse to do the obvious thing. */
    else if (screen === "fluency" && flPhase !== "running") { take(); startFluency(); }
    else if (screen === "collocations") { take(); startCollocations(); }
    else if (screen === "summary") { take(); nextAfterSummary(); }
    else if (screen === "dictationDone" || screen === "speakingDone") { take(); setScreen("listenSelect"); }
    else if (screen === "sentcDone") { take(); prepareSentcRound(); }
    else if (screen === "conjugationDone") { take(); setScreen("grammarHub"); }
    else if (screen === "phraseDone") { take(); setScreen("phraseSelect"); }
  };

  useEffect(() => {
    const onKey = (e) => keyHandlerRef.current?.(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Leave a batch early, keeping the scoring earned so far.
   *
   * Used by the desktop stage rail's Leave and by mobile's Home button. Mobile
   * used to navigate away without committing, so a sitting abandoned halfway
   * lost every answer already graded. `commitSession` is idempotent, so
   * reaching the summary later still grades once.
   */
  function leaveStudy() {
    commitSession();
    setScreen("today");
  }

  /** Apply one scheduling update per item studied, exactly once per session. */
  function commitSession() {
    if (sessionCommittedRef.current) return;
    sessionCommittedRef.current = true;
    const results = [...sessionResultsRef.current.entries()];
    const committedId=sessionMetaRef.current.id;
    if (!results.length) return;

    /* Schedule from the cards as they stand *now*, and keep the result.
     *
     * The summary needs each word's new due date, and it cannot recompute it:
     * committing and navigating happen in one handler, so by the time the
     * summary renders `progress` already holds the scheduled cards and running
     * `scheduleCard` over them again would advance every interval a second
     * time. Recording the answer here is both cheaper and the only version
     * that is right. */
    setProgress((p) => {
      if(p.committedSessions?.[committedId])return p;
      const { cards, scheduled } = scheduleResults(p.cards, results);
      /* Recorded from inside the updater so it sees the same pre-commit cards
       * the write does, even if another progress update is already queued.
       * `scheduleResults` is deterministic, so a replayed updater records the
       * identical result. */
      sessionScheduleRef.current = scheduled;
      return {...p,cards,pendingSession:null,committedSessions:{...p.committedSessions,[committedId]:Date.now()}};
    });
  }

  /** Offer one immediate second attempt, with the answer now known. */
  function retryQuestion() {
    setRetryMode(true);
    setFeedback(null);
    setInputVal("");
    setBlankNudge(false);
  }

  function handleContinue() {
    if (!feedback) return;
    // Right on the first attempt is the only thing that retires a card —
    // repeating it straight after being shown the answer isn't retention.
    const firstTimeRight = feedback.correct && !feedback.retry;
    setRetryMode(false);

    if (firstTimeRight && queue.length === 1) {
      setRetired((r) => r + 1);
      // The sentence stage commits instead, so a word is graded once overall.
      goToSentence();
      return;
    }
    setQueue((q) => {
      const [head, ...rest] = q;
      if (firstTimeRight) return rest;
      const at = Math.min(rest.length, 3);
      const nq = [...rest];
      nq.splice(at, 0, head);
      return nq;
    });
    if (firstTimeRight) setRetired((r) => r + 1);
    setInputVal("");
    setFeedback(null);
    setBlankNudge(false);
  }
  function handleInputKeyDown(e) {
    if (e.key !== "Enter") return;
    if (!feedback) handleCheck();
    else if (!feedback.correct && !feedback.retry) retryQuestion();   // Enter offers the redo
    else handleContinue();
  }
  function renderCorrectAnswer(q) {
    if (q.kind === "toEnglish") return <span>{q.word.e}</span>;
    if (q.kind === "fillBlank") return <span>{q.word.ba || q.word.t}</span>;
    if (lang === "de" && q.word.g) return <span><GenderTag g={q.word.g} /> {q.word.t}</span>;
    if (lang === "fr" && q.word.art) return <span><ArticleTag w={q.word} /> {q.word.t}</span>;
    if (q.word.rek) return <span>{q.word.t} <RektionTag w={q.word} /></span>;
    return <span>{q.word.t}</span>;
  }

  const stepIndex = { setup: -1, learn: 0, matching: 1, choose: 2, practice: 3, sentence: 4, summary: 5 }[screen];

  /* The per-word record behind the desktop summary table.
   *
   * Safe to memoise, unlike the ledger: by the time `summary` renders, the
   * sitting is committed and `sessionResultsRef` is frozen.
   *
   * The due date is recomputed here rather than read back from `progress`.
   * `commitSession` schedules through `setProgress`, so the new card is not
   * readable synchronously — but `scheduleCard` is pure, so running it over the
   * same pre-commit card with the same grade yields exactly what was written. */
  const summaryPreview = useMemo(
    () => (screen !== "summary" ? [] : buildSummaryRows({
      results: sessionResultsRef.current,
      scheduled: sessionScheduleRef.current,
      cards: progress.cards,
      lang,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screen],
  );

  /* The batch ledger behind the desktop study sidebar.
   *
   * Recomputed every render rather than memoised: the sets it reads are refs
   * that mutate without re-rendering, so a dependency array could not see them
   * change and the ledger would silently show stale status. A batch is 5-20
   * words, so this is cheap.
   *
   * A review sitting ("Review N due words", "Practise the misses") is not the
   * open drawer — it carries its own list, so the ledger follows the session.
   * `sessionListRef` is only populated from Choose onwards, so Learn and Match
   * read the batch instead. */
  const batchLedger = buildBatchLedger({
    entries: sessionListRef.current.length ? sessionListRef.current : batchEntries,
    lang,
    screen,
    stepIndex,
    learnIdx,
    matchedIds,
    chooseSeen: chooseSeenRef.current,
    practiceSeen: seenRef.current,
    results: sessionResultsRef.current,
  });

  const missedWords = [...missedRef.current.values()];
  const firstTryCorrect = totalItems - firstWrongRef.current.size;
  const activeTheme = mode === "theme" ? currentGroups[themeIdx] : null;
  const ActiveIcon = activeTheme?.icon;

  /* ---- Phrase Match ---- */
  function startPhrases(lv) {
    setPhraseLevel(lv);
    const set = PHRASES[lang][lv];
    const left = shuffle(set);
    /* Two independent shuffles can land in the same order — one sitting in six
     * hundred, which is often enough to happen. When it does the exercise is
     * solvable by row position and tests nothing, so the right column is
     * reshuffled until no row faces its own answer. */
    let right = shuffle(set);
    for (let tries = 0; tries < 20 && right.some((p2, i) => p2.phrase === left[i].phrase); tries += 1) {
      right = shuffle(set);
    }
    setPhraseLeft(left);
    setPhraseRight(right);
    setPhraseMatched([]);
    setPhrasePending({ left: null, right: null });
    setPhraseLastMatched(null);
    setPhraseWrongTries(0);
    setScreen("phraseMatch");
  }
  function selectPhraseTile(side, id) {
    if (phraseMatched.includes(id)) return;
    const next = { ...phrasePending, [side]: phrasePending[side] === id ? null : id };
    setPhrasePending(next);
    if (next.left && next.right) {
      if (next.left === next.right) {
        noteWork("phrases");
        setPhraseMatched((m) => [...m, next.left]);
        setPhraseLastMatched(PHRASES[lang][phraseLevel].find((p) => p.phrase === next.left));
        setPhrasePending({ left: null, right: null });
      } else {
        setPhraseWrongFlash(true);
        setPhraseWrongTries((n) => n + 1);
        setTimeout(() => {
          setPhraseWrongFlash(false);
          setPhrasePending({ left: null, right: null });
        }, 450);
      }
    }
  }

  /* The add-words form, defined once and rendered in two places: the mobile
   * `wordsInput` screen and the desktop workspace's right-hand panel. Sharing
   * the node rather than the markup keeps a single copy of a form with a dozen
   * pieces of state behind it. */
  /* The library table's rows: the saved words plus their check verdict and
   * scheduling, flattened so the table stays presentational. */
  const myWordRows = useMemo(() => importedWords.map(({ word: w }) => {
    const card = progress.cards[cardId(lang, "IMP", w.t)];
    return {
      id: w.t,
      term: w.t,
      display: lang === "de" && w.g ? `${w.g} ${w.t}` : w.t,
      meaning: w.e === "(no gloss)" ? "" : w.e,
      verdict: w.ver?.st || "unchecked",
      src: w.src,
      dueInDays: card ? daysUntil(card.due) : null,
      word: w,
    };
  }), [importedWords, progress.cards, lang]);

  const addWordsPanel = (
    <>
            <div className="flex border-b mb-4" style={{ borderColor: C.line }}>
              <Tab active={inputTab === "paste"} onClick={() => setInputTab("paste")}>Paste</Tab>
              <Tab active={inputTab === "file"} onClick={() => setInputTab("file")}>File</Tab>
              <Tab active={inputTab === "one"} onClick={() => setInputTab("one")}>One at a time</Tab>
            </div>

            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              {inputTab === "one" ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text" value={oneWord.term} onChange={(e) => setOneWord((w) => ({ ...w, term: e.target.value }))}
                    placeholder={lang === "fr" ? "Word — e.g. épanouir" : "Word — e.g. Wehmut"}
                    className="w-full px-3 py-2 rounded-md font-serif text-sm"
                    style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                  />
                  <input
                    type="text" value={oneWord.translation} onChange={(e) => setOneWord((w) => ({ ...w, translation: e.target.value }))}
                    placeholder="English (optional — left blank, it gets written for you)"
                    className="w-full px-3 py-2 rounded-md font-serif text-sm"
                    style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                  />
                  {lang === "de" && (
                    <div className="flex gap-2">
                      {["", "der", "die", "das"].map((g) => (
                        <button key={g || "none"} onClick={() => setOneWord((w) => ({ ...w, gender: g }))} className="flex-1 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: oneWord.gender === g ? C.gold : "transparent", color: g ? GENDER[g] : C.muted, border: `1px solid ${C.line}` }}>
                          {g || "not a noun"}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text" value={oneWord.example} onChange={(e) => setOneWord((w) => ({ ...w, example: e.target.value }))}
                    placeholder="Example sentence (optional)"
                    className="w-full px-3 py-2 rounded-md font-serif text-sm"
                    style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                  />
                  <button
                    onClick={() => {
                      if (!oneWord.term.trim()) return;
                      stageRows([{ ...oneWord, term: oneWord.term.trim() }], "typed by hand");
                      setStagedInfo((i) => ({ ...i, label: "typed by hand", note: "" }));
                      setOneWord({ term: "", translation: "", gender: "", example: "" });
                    }}
                    disabled={!oneWord.term.trim()}
                    className="w-full py-2.5 rounded-md font-semibold text-sm disabled:opacity-40"
                    style={{ backgroundColor: C.ink, color: C.card }}
                  >
                    Stage this word
                  </button>
                </div>
              ) : inputTab === "file" ? (
                <div className="text-center py-4">
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.json,text/plain,application/json" onChange={handleWordFile} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} className="px-5 py-3 rounded-md font-semibold inline-flex items-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    <Upload size={17} /> Choose a file
                  </button>
                  <p className="text-xs font-serif mt-3" style={{ color: C.muted }}>
                    .csv · .tsv · .txt · .json — including Anki exports and frequency lists. Up to 1 MB.
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"One per line. Any of these work:\n\népanouir\népanouir, to blossom\népanouir\tto blossom\népanouir 4213"}
                    rows={8}
                    className="w-full px-3 py-2.5 rounded-md font-serif text-sm resize-y"
                    style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                  />
                  <button
                    onClick={() => stageParsed(pasteText, wordsSrc.trim() || "pasted list")}
                    disabled={!pasteText.trim()}
                    className="w-full mt-3 py-2.5 rounded-md font-semibold text-sm disabled:opacity-40"
                    style={{ backgroundColor: C.ink, color: C.card }}
                  >
                    Read this list
                  </button>
                </>
              )}

              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                <input
                  type="text" value={wordsSrc} onChange={(e) => setWordsSrc(e.target.value)}
                  placeholder="Where these came from (optional) — e.g. DW Top-Thema"
                  className="w-full px-3 py-2 rounded-md font-serif text-sm"
                  style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                />
                {inputTab !== "one" && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-serif" style={{ color: C.muted }}>Read as</span>
                    <select aria-label="Word list format"
                      value={formatOverride} onChange={(e) => setFormatOverride(e.target.value)}
                      className="text-xs px-2 py-1 rounded-md font-serif flex-1"
                      style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                    >
                      <option value="auto">detect automatically</option>
                      {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {wordsError && (
              <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>{wordsError}</div>
            )}

            {staged.length > 0 && (() => {
              const chosen = staged.filter((r) => r.include);
              return (
                <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>Ready to check</div>
                    <button onClick={() => { setStaged([]); setStagedInfo(null); }} className="text-xs font-semibold" style={{ color: C.muted }}>Clear</button>
                  </div>
                  <div className="text-xs font-serif mb-3" style={{ color: C.muted }}>
                    {staged.length} row{staged.length === 1 ? "" : "s"}
                    {stagedInfo?.label ? ` · ${stagedInfo.label}` : ""}
                    {stagedInfo?.note ? ` · ${stagedInfo.note}` : ""}
                    {stagedInfo?.dropped ? ` · ${stagedInfo.dropped} duplicate${stagedInfo.dropped === 1 ? "" : "s"} dropped` : ""}
                    {stagedInfo?.capped ? ` · capped from ${stagedInfo.total} to ${MAX_ROWS}` : ""}
                  </div>

                  {stagedInfo?.capped && (
                    <div className="rounded-md p-2.5 mb-3 text-xs font-serif" style={{ border: `1px solid ${C.gold}`, color: C.ink }}>
                      That list is long. The first {MAX_ROWS} are staged — import the rest in another pass.
                    </div>
                  )}
                  {!stagedInfo?.capped && staged.length > WARN_ROWS && (
                    <div className="rounded-md p-2.5 mb-3 text-xs font-serif" style={{ border: `1px solid ${C.gold}`, color: C.ink }}>
                      {staged.length} words is a lot to check at once — it will take a minute or two.
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto mb-4">
                    {staged.map((r) => (
                      <label key={r.id} className="flex items-baseline gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox" checked={r.include}
                          onChange={() => setStaged((rows) => rows.map((x) => (x.id === r.id ? { ...x, include: !x.include } : x)))}
                          style={{ accentColor: C.gold }}
                        />
                        <span className="font-type" style={{ color: r.include ? C.ink : C.muted, textDecoration: r.inDeck ? "line-through" : "none" }}>
                          {lang === "de" && r.gender && <><GenderTag g={r.gender} /> </>}{r.term}
                        </span>
                        {r.translation && <span className="font-serif text-xs" style={{ color: C.muted }}>{r.translation}</span>}
                        {r.inDeck && <span className="text-[0.625rem]" style={{ color: C.muted }}>already in your deck</span>}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => runCheck(chosen)}
                    disabled={!chosen.length || wordsBusy}
                    className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ backgroundColor: C.gold, color: C.onGold }}
                  >
                    {wordsBusy ? <>Checking… {wordsPct}%</> : <><Sparkles size={17} /> Check {chosen.length} {chosen.length === 1 ? "word" : "words"}</>}
                  </button>
                  {wordsBusy && (
                    <div className="w-full h-1.5 rounded-full mt-3" style={{ backgroundColor: C.line }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${wordsPct}%`, backgroundColor: C.green }} />
                    </div>
                  )}
                </div>
              );
            })()}
    </>
  );

  function studioAction(task) {
    if(!task)return;
    commitSession();stopListening();stopRecording();
    setStudioContext({missionId:task.missionId||null,humanId:task.humanId||null});
    if(task.action==='review')return goToPractice(dueCards.slice(0,Math.max(5,progress.preferences?.minutes||15)),{review:true});
    if(task.action==='weak')return navigateToSection('repair');
    navigateToSection(task.action);
  }
  async function applyBackup(incoming,mode) {
    const before=recoverSession({...progress,pendingSession:snapshotSession()||progress.pendingSession});
    commitSession();
    await storage.set('vocabdrawer:pre-import',JSON.stringify(before));
    const {progress:merged}=mergeProgress(before,incoming,{restore:mode==='restore'});
    setProgress(recoverSession(merged));
    profileHydrated.current=false;
  }
  function savePhrase(phrase) {
    if(!phrase.text?.trim())return;
    setProgress(p=>({...p,phrasebook:[{...phrase,text:phrase.text.trim(),lang,id:eventId(),at:new Date().toISOString()},...(p.phrasebook||[])].slice(0,2000)}));
  }
  function missionRecord(id,row) {
    setProgress(p=>({...p,missions:{...p.missions,[id]:{...p.missions?.[id],...row,updatedAt:Date.now()}}}));
  }
  function skillEvidence(row) {
    setProgress(p=>({...p,skillEvidence:[...(p.skillEvidence||[]),{...row,id:eventId(),at:new Date().toISOString()}].slice(-2000)}));
    noteWork('missions');
  }
  const waiting=allWordsForLang.filter(({word,level:lv})=>[progress.cards[cardId(lang,lv,word.t)],progress.cards[prodCardId(lang,lv,word.t)]].some(c=>c?.readyAt>clock)).length;
  const modernScreens=(<Suspense fallback={<p role="status">Loading this activity…</p>}>
    {screen==='today'&&<TodayDashboard lang={lang} level={level} progress={progress} loaded={progressLoaded&&!vocabularyLoading} due={dueCards.length} weak={weakCards.length} waiting={waiting} onLanguage={changeLanguage} onLevel={setLevel} onPreferences={preferences=>setProgress(p=>({...p,preferences:{...preferences,lang,level}}))} onAction={studioAction}/>}
    {['missions','listeningLab','challenge'].includes(screen)&&<MissionLesson key={`${lang}:${screen}`} lang={lang} level={level} mode={screen} missionId={studioContext.missionId} records={progress.missions||{}} onRecord={missionRecord} onComplete={skillEvidence} onSavePhrase={savePhrase} onWork={noteWork} glossOf={glossOf} check={checkWritingNow} goal={progress.preferences?.goal} onHome={()=>navigateToSection('today')}/>}
    {screen==='browserExtension'&&<BrowserExtensionGuide/>}
    {screen==='deviceFiles'&&<DeviceFiles progress={progress} onRemoved={key=>setProgress(p=>{const [kind,id]=key.split(':');return {...p,journal:(p.journal||[]).map(row=>kind==='photo'&&row.photo===id?{...row,photo:null,updatedAt:Date.now()}:kind==='recording'&&row.recording===id?{...row,recording:null,updatedAt:Date.now()}:row),mediaSessions:kind==='media'?Object.fromEntries(Object.entries(p.mediaSessions||{}).map(([k,row])=>[k,k===id?{...row,hasMedia:false,updatedAt:Date.now()}:row])):p.mediaSessions};})}/>}
    {screen==='humanListening' &&<HumanListening key={lang} lang={lang} onWork={noteWork} onEvidence={skillEvidence} onAction={studioAction}/>}
    {screen==='media'&&<MediaStudio initialHumanId={studioContext.humanId} onRemoveSession={id=>setProgress(p=>({...p,mediaSessions:Object.fromEntries(Object.entries(p.mediaSessions||{}).filter(([key])=>key!==id))}))} key={lang} lang={lang} sessions={progress.mediaSessions||{}} onSession={row=>setProgress(p=>({...p,mediaSessions:{...p.mediaSessions,[row.id]:row}}))} onSavePhrase={savePhrase} onWork={noteWork} glossOf={glossOf} onHome={()=>navigateToSection('today')}/>}
    {screen==='library'&&<PracticeLibrary onAction={studioAction}/>}
    {screen==='shelf'&&<ExtensiveShelf key={lang} lang={lang} level={level} onWork={noteWork} glossOf={glossOf} onRead={id=>recordReading(id,{practice:true,completedAt:new Date().toISOString()})} onAction={studioAction}/>}
    {screen==='phrasebook'&&<PhraseNotebook key={lang} lang={lang} phrases={progress.phrasebook||[]} onChange={phrasebook=>setProgress(p=>({...p,phrasebook}))} onWork={noteWork}/>}
    {screen==='journal'&&<LanguageJournal key={lang} lang={lang} entries={progress.journal||[]} onChange={update=>setProgress(p=>({...p,journal:typeof update==='function'?update(p.journal||[]):update}))} onWork={noteWork} check={checkWritingNow}/>}
    {screen==='pronunciation'&&<PronunciationLab key={lang} lang={lang} onWork={noteWork}/>}
    {screen==='retelling'&&<RetellingPractice key={lang} lang={lang} onWork={noteWork} onEvidence={skillEvidence}/>}
    {screen==='repair'&&<WordRepair key={lang} lang={lang} entries={[...weakCards,...allWordsForLang.filter(e=>[progress.cards[cardId(lang,e.level,e.word.t)],progress.cards[prodCardId(lang,e.level,e.word.t)]].some(c=>c?.suspended))]} cards={progress.cards} onChange={updates=>setProgress(p=>({...p,cards:{...p.cards,...updates}}))} onSavePhrase={savePhrase} onPractice={entry=>goToPractice([entry],{review:true,supported:true})}/>}
    {screen==='clinic'&&<ContrastClinic key={lang} lang={lang} mistakes={mistakeList} check={checkWritingNow} onEvidence={skillEvidence} onWork={noteWork}/>}
    {screen==='backups'&&<BackupManager onExport={exportProgress} onApply={applyBackup}/>}
    {screen==='passport'&&<SkillPassport lang={lang} evidence={progress.skillEvidence||[]} ability={ability}/>}
  </Suspense>);

  const screens = (
    <>
      {vocabularyLoading&&<p role="status" className="vd-notice">Loading additional vocabulary…</p>}
      {vocabularyError&&<p role="alert" className="vd-notice">{vocabularyError}</p>}
      {modernScreens}
        {/* ============================ SETUP ============================ */}
        {screen === "setup" && isDesktop && (
          <HomeDesktop
            dueCards={dueCards}
            studiedCount={studiedCount}
            totalWords={allWordsForLang.length}
            langName={LANG_INFO[lang].name}
            streak={progress.streak}
            reviewedToday={reviewedToday}
            onReviewDue={() => goToPractice(dueCards, { review: true })}
            weakCount={weakCards.length}
            onWeakSpots={startWeakSpots}
            dailyGoal={dailyGoal}
            suggestion={suggestion}
            onNavigate={navigateToSection}
            onPlace={() => { setPlaceStage("offer"); setScreen("placement"); }}
            placedAt={progress.placement?.[lang]?.level || null}
            levels={levelsFor(lang)}
            level={level}
            onLevelChange={(lv) => { setLevel(lv); resetPosition(); }}
            levelName={levelInfo(lang, level).name}
            levelDesc={levelInfo(lang, level).desc}
            flatWordCount={flatWords.length}
            totalThemes={totalThemes}
            mode={mode}
            onModeChange={(m) => { setMode(m); resetPosition(); }}
            groups={currentGroups}
            drawerMastery={drawerMastery}
            onStartTheme={startTheme}
            batchSize={batchSize}
            onBatchSize={(n) => { setBatchIndex(0); setBatchSize(n); }}
            totalBatches={totalBatches}
            onStartMixed={startMixed}
            genderLegend={lang === "de" ? <GenderLegend /> : null}
          />
        )}

        {screen === "setup" && !isDesktop && (
          <div>
            <div className="text-center mb-8">
              <div className="font-type text-[clamp(2.25rem,11vw,3rem)] mb-3 stamp" key={demoIdx} style={{ color: C.ink }}>
                {LANG_INFO[lang].demo[demoIdx % LANG_INFO[lang].demo.length]}
              </div>
              <p className="font-serif italic" style={{ color: C.muted }}>A card-catalog for French &amp; German vocabulary</p>
            </div>

            {/* Daily panel: what's due, streak, and whether progress is being saved */}
            <div className="rounded-md p-4 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${dueCards.length ? C.gold : C.green}` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-type text-2xl leading-none" style={{ color: C.ink }}>
                    {dueCards.length} due
                  </div>
                  <div className="text-xs font-serif mt-1" style={{ color: C.muted }}>
                    {studiedCount} of {allWordsForLang.length} {LANG_INFO[lang].name} words started
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 font-semibold" style={{ color: progress.streak ? C.accent : C.muted }}>
                      <Flame size={16} /> {progress.streak || 0}
                    </div>
                    <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 font-semibold" style={{ color: C.ink }}>
                      <CalendarCheck size={16} /> {reviewedToday}
                    </div>
                    <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>today</div>
                  </div>
                </div>
              </div>

              {weakCards.length > 0 && (
                <button onClick={startWeakSpots} className="w-full mb-2 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Target size={15} /> Weak spots ({weakCards.length})
                </button>
              )}
              {dueCards.length > 0 ? (
                <button onClick={() => goToPractice(dueCards, { review: true })} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  <Repeat size={15} /> Review {dueCards.length} Due {dueCards.length === 1 ? "Word" : "Words"}
                </button>
              ) : (
                <div className="text-xs font-serif text-center py-1.5" style={{ color: C.muted }}>
                  {studiedCount === 0 ? "Nothing scheduled yet — study a drawer below to start building your deck." : "All caught up. Study something new below, or come back tomorrow."}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                <button onClick={() => setScreen("progress")} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.ink }}>
                  <Activity size={13} /> View progress
                </button>
                <span className="inline-flex items-center gap-1 text-[0.6875rem]" style={{ color: C.muted }}>
                  {storageOn === null ? "Checking storage…" : storageOn ? (<><CalendarCheck size={11} /> Progress saving: on</>) : (<><CloudOff size={11} /> Progress saving: off (this session only)</>)}
                </span>
              </div>
            </div>

            <div className="rounded-md p-5 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Language</div>
                <div className="flex gap-2">
                  {["fr", "de"].map((l) => (
                    <button key={l} onClick={() => { setLang(l); setDemoIdx(0); resetPosition(); }} className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                      {LANG_INFO[l].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Level</div>
                <div className="flex border-b" style={{ borderColor: C.line }}>
                  {levelsFor(lang).map((lv) => (
                    <Tab key={lv} active={level === lv} onClick={() => { setLevel(lv); resetPosition(); }}>{lv}</Tab>
                  ))}
                </div>
                <div className="pt-3 font-serif text-sm" style={{ color: C.muted }}>
                  <span className="font-semibold" style={{ color: C.ink }}>{levelInfo(lang, level).name}.</span>{" "}
                  {levelInfo(lang, level).desc} — {flatWords.length} words across {totalThemes} themed drawers.
                </div>
              </div>

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Study mode</div>
                <div className="flex gap-2">
                  <button onClick={() => { setMode("theme"); resetPosition(); }} className="flex-1 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5" style={{ backgroundColor: mode === "theme" ? C.gold : "transparent", color: mode === "theme" ? C.ink : C.ink, border: `1px solid ${C.line}` }}>
                    <LayoutGrid size={15} /> By Theme
                  </button>
                  <button onClick={() => { setMode("mixed"); resetPosition(); }} className="flex-1 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5" style={{ backgroundColor: mode === "mixed" ? C.gold : "transparent", color: C.ink, border: `1px solid ${C.line}` }}>
                    <Layers size={15} /> Mixed Batches
                  </button>
                </div>
              </div>

              {lang === "de" && <div className="mb-5"><GenderLegend /></div>}

              {mode === "theme" ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {currentGroups.map((g, i) => {
                    const Icon = g.icon;
                    return (
                      <button key={g.topic} onClick={() => startTheme(i)} className="text-left p-3 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} style={{ color: C.accent }} />
                          <span className="text-sm font-semibold" style={{ color: C.ink }}>{g.topic}</span>
                        </div>
                        <span className="text-xs font-serif" style={{ color: C.muted }}>{g.words.length} words</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Words per batch: {batchSize}</div>
                    <input type="range" min={5} max={20} value={batchSize} onChange={(e) => { setBatchIndex(0); setBatchSize(Number(e.target.value)); }} className="w-full" style={{ accentColor: C.gold }} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}><span>5</span><span>20</span></div>
                    <div className="text-xs mt-2 font-serif" style={{ color: C.muted }}>
                      {totalBatches} batch{totalBatches > 1 ? "es" : ""} at this size, mixed across all themes.
                    </div>
                  </div>
                  <button onClick={startMixed} className="w-full mt-3 py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    Start Drawer <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-center font-serif mb-5" style={{ color: C.muted }}>
              Vocabulary and example sentences are hand-curated per theme. German nouns show
              their der/die/das gender in color. Word audio uses your device's built-in voices.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setScreen("lessons")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.ink}` }}>
                <div className="flex items-center gap-2"><ScrollText size={17} style={{ color: C.ink }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Lessons</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>One famous text, taken all the way apart — grammar, structure, words, translation.</span>
              </button>
              <button onClick={() => setScreen("reading")} className="text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><BookOpen size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Reading Room</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Passages from A1 to C1 — answer in full sentences, checked for grammar.</span>
              </button>
              <button onClick={() => setScreen("writing")} className="text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><PenLine size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Writing Desk</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Write freely — grammar checked first, vocabulary second.</span>
              </button>
              <button onClick={() => setScreen("mistakes")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.red}` }}>
                <div className="flex items-center gap-2"><TriangleAlert size={17} style={{ color: C.red }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Your mistakes</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>The patterns the checker keeps finding — with your own sentences to fix.</span>
              </button>
              <button onClick={() => setScreen("sentcSetup")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><Blocks size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Sentence Constructions</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Build a whole sentence from its words, in the tense you choose.</span>
              </button>
              <button onClick={() => setScreen("phraseSelect")} className="text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><Quote size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Phrase Match</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Match idioms to their real meaning — not the literal words.</span>
              </button>
              <button onClick={() => setScreen("listenSelect")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><Headphones size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Listening &amp; Speaking</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Dictation — hear a sentence and type it. Plus microphone practice, if your browser allows it.</span>
              </button>
              <button onClick={() => setScreen("fluency")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><Zap size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Fluency</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>One minute, words you already know, as fast as you can. Speed is its own skill.</span>
              </button>
              <button onClick={() => setScreen("etymology")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2"><GitBranch size={17} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Word Roots</span></div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Where a word came from, where French and German split, and the sound changes that let you guess the next one.</span>
              </button>
              <button onClick={() => setScreen("grammarHub")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2">
                  <GraduationCap size={17} style={{ color: C.accent }} />
                  <span className="text-sm font-semibold" style={{ color: C.ink }}>Grammar &amp; Verbs</span>
                  {conjDueCount > 0 && <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.gold, color: C.onGold }}>{conjDueCount} due</span>}
                </div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Conjugation drills across four tenses, and short notes on the rules that actually trip people up.</span>
              </button>
              <button onClick={() => setScreen("wordsHub")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={17} style={{ color: C.accent }} />
                  <span className="text-sm font-semibold" style={{ color: C.ink }}>My Words</span>
                  {importedWords.length > 0 && <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.paper, color: C.muted }}>{importedWords.length} words</span>}
                  {uncheckedWords.length > 0 && <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.red, color: C.card }}>{uncheckedWords.length} unchecked</span>}
                </div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Your own vocabulary — paste a list, upload a file, or type one. Fact-checked, then drilled like any other drawer.</span>
              </button>
              <button onClick={() => setScreen("importPaste")} className="col-span-2 text-left p-4 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.gold}` }}>
                <div className="flex items-center gap-2">
                  <FileText size={17} style={{ color: C.accent }} />
                  <span className="text-sm font-semibold" style={{ color: C.ink }}>Import Your Own Text</span>
                  {importedWords.length > 0 && <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.paper, color: C.muted }}>{importedWords.length} saved</span>}
                </div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>Paste an article, lyrics or a chapter. Unknown words get looked up and saved to your deck with the sentence they came from.</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================ MY WORDS: HUB ============================ */}
        {screen === "wordsHub" && (
          <div>
            <div className="text-center mb-5">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>My Words</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                Your own vocabulary, drilled exactly like the built-in drawers.
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2.5 rounded-md text-sm font-semibold" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.muted }}>Add words</div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { setInputTab("paste"); setScreen("wordsInput"); }} className="p-3 rounded-md flex flex-col items-center gap-1.5" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                  <ClipboardList size={17} style={{ color: C.accent }} />
                  <span className="text-xs font-semibold" style={{ color: C.ink }}>Paste a list</span>
                </button>
                <button onClick={() => { setInputTab("file"); setScreen("wordsInput"); }} className="p-3 rounded-md flex flex-col items-center gap-1.5" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                  <Upload size={17} style={{ color: C.accent }} />
                  <span className="text-xs font-semibold" style={{ color: C.ink }}>Upload a file</span>
                </button>
                <button onClick={() => { setInputTab("one"); setScreen("wordsInput"); }} className="p-3 rounded-md flex flex-col items-center gap-1.5" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                  <Plus size={17} style={{ color: C.accent }} />
                  <span className="text-xs font-semibold" style={{ color: C.ink }}>Type one</span>
                </button>
              </div>
              <p className="text-xs font-serif mt-3" style={{ color: C.muted }}>
                CSV, TSV, plain lists, Anki exports, JSON and frequency lists are all detected automatically.
                Translations are optional — anything you leave blank gets filled in and checked.
              </p>
            </div>

            {importedWords.length > 0 ? (
              <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>
                    {importedWords.length} {LANG_INFO[lang].name} {importedWords.length === 1 ? "word" : "words"}
                  </div>
                  <button onClick={() => setScreen("importLibrary")} className="text-xs font-semibold" style={{ color: C.ink }}>Manage</button>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Words per batch: {batchSize}</div>
                  <input type="range" min={5} max={20} value={batchSize} onChange={(e) => { setBatchIndex(0); setBatchSize(Number(e.target.value)); }} className="w-full" style={{ accentColor: C.gold }} />
                  <div className="text-xs mt-1 font-serif" style={{ color: C.muted }}>
                    {Math.max(1, Math.ceil(importedWords.length / batchSize))} batch{Math.ceil(importedWords.length / batchSize) > 1 ? "es" : ""} — each runs learn, match, choose and type.
                  </div>
                </div>

                <button onClick={startMine} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  Study my words <ArrowRight size={17} />
                </button>

                {uncheckedWords.length > 0 && (
                  <button onClick={() => recheckSaved(uncheckedWords)} disabled={wordsBusy} className="w-full mt-2 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    {wordsBusy ? <>Checking… {wordsPct}%</> : <><Sparkles size={15} /> Check {uncheckedWords.length} unchecked {uncheckedWords.length === 1 ? "word" : "words"}</>}
                  </button>
                )}

                <p className="text-xs font-serif mt-3" style={{ color: C.muted }}>
                  These are part of your main deck — they turn up in your daily due reviews alongside A1–B2.
                </p>
              </div>
            ) : (
              <div className="rounded-lg p-6 text-center mb-4 font-serif text-sm" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.muted }}>
                No {LANG_INFO[lang].name} words of your own yet. Add some above.
              </div>
            )}

            {wordsError && (
              <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>{wordsError}</div>
            )}

            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Home size={15} /> Home
            </button>
          </div>
        )}

        {/* ============================ MY WORDS: INPUT ============================ */}
        {screen === "wordsInput" && (
          <div>
            <div className="text-center mb-4">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Add {LANG_INFO[lang].name} words</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>Everything gets fact-checked before it joins your deck.</p>
            </div>

            {addWordsPanel}

            <button onClick={() => setScreen("wordsHub")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronLeft size={15} /> Back to My Words
            </button>
          </div>
        )}

        {/* ============================ MY WORDS: REVIEW ============================ */}
        {screen === "wordsReview" && (() => {
          const kept = verifyRows.filter(({ row }) => (decisions[row.id]?.choice || "mine") !== "skip");
          const unaccepted = verifyRows.filter(({ row, res }) =>
            res && res.verdict !== "ok" && (decisions[row.id]?.choice || "mine") === "mine").length;
          const fixable = verifyRows.filter(({ res }) => res && res.verdict !== "ok").length;
          const checked = verifyRows.filter(({ res }) => res).length;

          return (
            <div>
              <div className="text-center mb-4">
                <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Check the translations</div>
                <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                  Nothing is changed until you save.{" "}
                  {checked === 0
                    ? "Nothing could be checked — see below."
                    : fixable === 0
                    ? `All ${checked} came back clean.`
                    : `${fixable} of ${checked} came back with something to look at.`}
                </p>
              </div>

              {wordsError && (
                <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>{wordsError}</div>
              )}

              {fixable > 0 && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setDecisions((d) => Object.fromEntries(verifyRows.map(({ row, res }) => [row.id, { ...d[row.id], choice: res ? "proposed" : "mine" }])))}
                    className="flex-1 py-2 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.green}`, color: C.ink }}
                  >
                    Accept all fixes
                  </button>
                  <button
                    onClick={() => setDecisions((d) => Object.fromEntries(verifyRows.map(({ row }) => [row.id, { ...d[row.id], choice: "mine" }])))}
                    className="flex-1 py-2 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}
                  >
                    Keep all mine
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 mb-4">
                {verifyRows.map(({ row, res }) => {
                  const d = decisions[row.id] || { choice: "mine" };
                  const ed = d.edited;
                  const disagrees = res && res.verdict !== "ok";
                  const border = d.choice === "skip" ? C.line : !res ? C.muted : disagrees ? (d.choice === "proposed" ? C.green : C.gold) : C.green;
                  const mineGloss = row.translation || (row.glossed ? `${row.glossed} (looked up)` : "");

                  return (
                    <div key={row.id} className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${border}`, opacity: d.choice === "skip" ? 0.5 : 1 }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-type text-lg flex items-baseline gap-1.5" style={{ color: C.ink }}>
                          {lang === "de" && (d.choice === "proposed" ? res?.g : row.gender) && <GenderTag g={d.choice === "proposed" ? res.g : row.gender} />}
                          {ed?.term ?? row.term}
                        </div>
                        <VerdictPill v={res ? res.verdict : "unchecked"} />
                      </div>

                      {res?.note && <div className="text-xs font-serif italic mb-2" style={{ color: C.ink }}>{res.note}</div>}

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="rounded-md p-2.5" style={{ backgroundColor: C.paper, border: `1px solid ${d.choice === "mine" ? C.ink : C.line}` }}>
                          <div className="text-[0.625rem] uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>You gave</div>
                          <div className="text-sm font-serif" style={{ color: mineGloss ? C.ink : C.muted }}>{mineGloss || "nothing — no translation"}</div>
                        </div>
                        <div className="rounded-md p-2.5" style={{ backgroundColor: C.paper, border: `1px solid ${d.choice === "proposed" ? C.ink : C.line}` }}>
                          <div className="text-[0.625rem] uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>The check says</div>
                          <div className="text-sm font-serif" style={{ color: res ? C.green : C.muted }}>{res?.en || "not checked"}</div>
                          {res?.pos && <div className="text-[0.625rem] font-serif italic mt-0.5" style={{ color: C.muted }}>{res.pos}</div>}
                        </div>
                      </div>

                      {res?.s && (
                        <div className="mb-3">
                          <div className="text-xs font-serif italic" style={{ color: C.ink }}>{res.s}</div>
                          <div className="text-xs font-serif" style={{ color: C.muted }}>{res.se}</div>
                          {!makeCloze(res.s, res.ba) && (
                            <div className="text-[0.625rem] font-serif mt-1" style={{ color: C.muted }}>
                              No fill-in-the-blank for this one — the sentence doesn't contain the word literally.
                            </div>
                          )}
                        </div>
                      )}

                      {ed && (
                        <div className="flex flex-col gap-2 mb-3">
                          <input
                            type="text" value={ed.term ?? row.term}
                            onChange={(e) => setDecisions((s) => ({ ...s, [row.id]: { ...d, edited: { ...ed, term: e.target.value } } }))}
                            className="w-full px-2 py-1.5 rounded-md font-serif text-sm" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                          />
                          <input
                            type="text" value={ed.translation ?? (d.choice === "proposed" ? res?.en || "" : row.translation)}
                            onChange={(e) => setDecisions((s) => ({ ...s, [row.id]: { ...d, edited: { ...ed, translation: e.target.value } } }))}
                            className="w-full px-2 py-1.5 rounded-md font-serif text-sm" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {res && (
                          <button onClick={() => setDecisions((s) => ({ ...s, [row.id]: { ...d, choice: "proposed" } }))} className="flex-1 py-1.5 rounded-md text-xs font-semibold" style={{ backgroundColor: d.choice === "proposed" ? C.green : "transparent", color: d.choice === "proposed" ? C.card : C.ink, border: `1px solid ${C.line}` }}>
                            Accept
                          </button>
                        )}
                        <button onClick={() => setDecisions((s) => ({ ...s, [row.id]: { ...d, choice: "mine" } }))} className="flex-1 py-1.5 rounded-md text-xs font-semibold" style={{ backgroundColor: d.choice === "mine" ? C.ink : "transparent", color: d.choice === "mine" ? C.card : C.ink, border: `1px solid ${C.line}` }}>
                          Keep mine
                        </button>
                        <button onClick={() => setDecisions((s) => ({ ...s, [row.id]: { ...d, edited: ed ? null : {} } }))} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                          {ed ? "Done" : "Edit"}
                        </button>
                        <button onClick={() => setDecisions((s) => ({ ...s, [row.id]: { ...d, choice: d.choice === "skip" ? "mine" : "skip" } }))} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: d.choice === "skip" ? C.ink : C.muted }}>
                          {d.choice === "skip" ? "Undo" : "Skip"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={saveReviewed} disabled={!kept.length} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-40" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  Save {kept.length} {kept.length === 1 ? "word" : "words"} <ArrowRight size={17} />
                </button>
                {unaccepted > 0 && (
                  <p className="text-xs text-center font-serif" style={{ color: C.muted }}>
                    {unaccepted} proposed {unaccepted === 1 ? "fix" : "fixes"} not accepted — saving keeps your version.
                  </p>
                )}
                <button onClick={() => setScreen("wordsInput")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <ChevronLeft size={15} /> Back without saving
                </button>
              </div>
            </div>
          );
        })()}

        {/* ============================ IMPORT: PASTE ============================ */}
        {screen === "importPaste" && (
          <div>
            <div className="text-center mb-5">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Import Your Own Text</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>Any {LANG_INFO[lang].name} you actually want to read.</p>
            </div>

            <div className="flex gap-2 mb-4">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2.5 rounded-md text-sm font-semibold" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <input
                type="text" value={importTitle} onChange={(e) => setImportTitle(e.target.value)}
                placeholder="Title (optional) — e.g. Le Monde article"
                className="w-full px-3 py-2 rounded-md font-serif text-sm mb-3"
                style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
              />
              <textarea
                value={importText} onChange={(e) => setImportText(e.target.value)}
                placeholder={lang === "fr" ? "Collez votre texte ici…" : "Fügen Sie Ihren Text hier ein…"}
                rows={9}
                className="w-full px-3 py-2.5 rounded-md font-serif text-sm resize-y"
                style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
              />
              <div className="flex justify-between items-center mt-2 mb-4">
                <span className="text-xs font-serif" style={{ color: C.muted }}>
                  {importText.trim() ? `${importText.trim().split(/\s+/).length} words` : "Works best with a paragraph or two"}
                </span>
                {importText && (
                  <button onClick={() => { setImportText(""); setImportTitle(""); }} className="text-xs font-semibold" style={{ color: C.muted }}>Clear</button>
                )}
              </div>

              <button
                onClick={analyzeImport}
                disabled={!importText.trim() || importBusy}
                className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: C.gold, color: C.onGold }}
              >
                {importBusy ? <>Looking up words… {importProgressPct}%</> : <><Sparkle size={17} /> Analyze Text</>}
              </button>
              {importBusy && (
                <div className="w-full h-1.5 rounded-full mt-3" style={{ backgroundColor: C.line }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${importProgressPct}%`, backgroundColor: C.green }} />
                </div>
              )}
            </div>

            {importedWords.length > 0 && (
              <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>Your imported words ({importedWords.length})</div>
                  <button onClick={() => setScreen("importLibrary")} className="text-xs font-semibold" style={{ color: C.ink }}>Manage</button>
                </div>
                <button onClick={() => startMine()} className="w-full py-2.5 rounded-md font-semibold text-sm" style={{ backgroundColor: C.ink, color: C.card }}>
                  Study them now
                </button>
                <p className="text-xs font-serif mt-2" style={{ color: C.muted }}>
                  They're already part of your main deck, so they'll also turn up in your daily due reviews.
                </p>
              </div>
            )}

            <p className="text-xs text-center font-serif mb-4" style={{ color: C.muted }}>
              Word lookups happen online. Anything you paste stays in this app — but only paste what you have the right to use.
            </p>

            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Home size={15} /> Home
            </button>
          </div>
        )}

        {/* ============================ IMPORT: READER ============================ */}
        {screen === "importReader" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-type text-lg truncate" style={{ color: C.ink }}>{importTitle.trim() || "Your text"}</div>
              <button onClick={() => setScreen("importPaste")} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.muted }}>
                <ChevronLeft size={13} /> Edit
              </button>
            </div>

            {importError && (
              <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>
                {importError}
              </div>
            )}

            <div className="flex items-center gap-3 mb-3 text-[0.6875rem] font-serif" style={{ color: C.muted }}>
              <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.green, display: "inline-block" }} /> in your deck</span>
              <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.gold, display: "inline-block" }} /> tap to look up</span>
            </div>

            <div className="rounded-lg p-5 mb-4 font-serif text-base leading-loose" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              {importSentences.map((s, si) => (
                <span key={si}>
                  {segmentSentence(s).map((seg, gi) => {
                    if (seg.type === "gap") return <span key={gi}>{seg.v}</span>;
                    const k = lookupKey(seg.v);
                    const inDeck = knownKeys.has(k);
                    const saved = savedImportKeys.has(k) || (glosses[k] && savedImportKeys.has(normalize(glosses[k].lemma)));
                    const hasGloss = !!glosses[k];
                    let style = { cursor: "pointer" };
                    if (inDeck || saved) style = { ...style, color: C.green, fontWeight: 600 };
                    else if (hasGloss) style = { ...style, color: C.ink, borderBottom: `2px solid ${C.gold}` };
                    else style = { ...style, color: C.muted };
                    return (
                      <span key={gi} onClick={() => selectImportWord(seg.v, si)} style={style}>{seg.v}</span>
                    );
                  })}{" "}
                </span>
              ))}
            </div>

            {selectedTok && (() => {
              const k = lookupKey(selectedTok.word);
              const g = glosses[k];
              const alreadySaved = savedImportKeys.has(k) || (g && savedImportKeys.has(normalize(g.lemma)));
              return (
                <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-type text-2xl flex items-baseline gap-2" style={{ color: C.ink }}>
                        {lang === "de" && g?.g && <GenderTag g={g.g} />}
                        {g?.lemma || stripElision(selectedTok.word)}
                      </div>
                      {g?.lemma && normalize(g.lemma) !== k && (
                        <div className="text-xs font-serif italic" style={{ color: C.muted }}>appears here as "{selectedTok.word}"</div>
                      )}
                    </div>
                    <button onClick={() => setSelectedTok(null)} aria-label="Close" style={{ color: C.muted }}><X size={16} /></button>
                  </div>

                  <div className="text-sm font-semibold mb-1" style={{ color: C.green }}>{g?.en || "No gloss available"}</div>
                  {g?.pos && <div className="text-xs font-serif italic mb-2" style={{ color: C.muted }}>{g.pos}</div>}

                  <div className="text-xs font-serif italic mt-3 mb-1" style={{ color: C.ink }}>{importSentences[selectedTok.sentenceIdx]}</div>
                  <div className="text-xs font-serif" style={{ color: C.muted }}>
                    {transBusy && sentenceTrans[selectedTok.sentenceIdx] === undefined ? "translating…" : (sentenceTrans[selectedTok.sentenceIdx] || "")}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {audioReady && (
                      <button onClick={() => say(importSentences[selectedTok.sentenceIdx])} className="px-3 py-2 rounded-md text-sm flex items-center gap-1.5" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                        <Volume2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={addImportedWord}
                      disabled={alreadySaved || knownKeys.has(k)}
                      className="flex-1 py-2 rounded-md font-semibold text-sm disabled:opacity-40"
                      style={{ backgroundColor: C.gold, color: C.onGold }}
                    >
                      {knownKeys.has(k) ? "Already in your deck" : alreadySaved ? "Saved" : "Add to deck"}
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col gap-2">
              {importedWords.length > 0 && (
                <button onClick={() => startMine()} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  Study my {importedWords.length} imported {importedWords.length === 1 ? "word" : "words"} <ArrowRight size={17} />
                </button>
              )}
              <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Home size={15} /> Home
              </button>
            </div>
          </div>
        )}

        {/* ============================ IMPORT: LIBRARY ============================ */}
        {screen === "importLibrary" && (() => {
          const shown = libraryUncheckedOnly ? uncheckedWords : importedWords;
          return (
            <div>
              <div className="text-center mb-5">
                <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>My words</div>
                <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                  {LANG_INFO[lang].name} · {importedWords.length} saved
                  {uncheckedWords.length > 0 ? ` · ${uncheckedWords.length} unchecked` : ""}
                </p>
              </div>

              {uncheckedWords.length > 0 && (
                <div className="rounded-md p-3 mb-4 flex items-center justify-between gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.gold}` }}>
                  <div className="text-xs font-serif" style={{ color: C.ink }}>
                    {uncheckedWords.length} {uncheckedWords.length === 1 ? "word has" : "words have"} never been fact-checked.
                  </div>
                  <button onClick={() => recheckSaved(uncheckedWords)} disabled={wordsBusy} className="px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap disabled:opacity-40" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    {wordsBusy ? `Checking… ${wordsPct}%` : "Check them"}
                  </button>
                </div>
              )}

              {importedWords.length === 0 ? (
                <div className="rounded-lg p-6 text-center mb-4 font-serif text-sm" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.muted }}>
                  Nothing saved yet for {LANG_INFO[lang].name}.
                </div>
              ) : (
                <div className="rounded-lg p-4 mb-4 flex flex-col gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                  {uncheckedWords.length > 0 && (
                    <label className="flex items-center gap-2 text-xs font-serif cursor-pointer pb-2" style={{ color: C.muted, borderBottom: `1px solid ${C.line}` }}>
                      <input type="checkbox" checked={libraryUncheckedOnly} onChange={() => setLibraryUncheckedOnly((v) => !v)} style={{ accentColor: C.gold }} />
                      Show unchecked only
                    </label>
                  )}
                  {shown.map(({ word: w }) => {
                    const c = progress.cards[cardId(lang, "IMP", w.t)];
                    return (
                      <div key={w.t} className="pb-3 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                        <div className="min-w-0">
                          <div className="font-type text-base flex items-baseline gap-1.5 flex-wrap" style={{ color: C.ink }}>
                            {lang === "de" && w.g && <GenderTag g={w.g} />}{w.t}
                            <VerdictPill v={w.ver?.st || "unchecked"} />
                          </div>
                          <div className="text-sm font-serif" style={{ color: C.green }}>{w.e}</div>
                          {w.ver?.note && <div className="text-xs font-serif italic" style={{ color: C.muted }}>{w.ver.note}</div>}
                          <div className="text-xs font-serif italic truncate" style={{ color: C.muted }}>{w.s}</div>
                          <div className="text-[0.625rem] mt-0.5" style={{ color: C.muted }}>
                            from {w.src}{c ? ` · ${cardStage(c)}${daysUntil(c.due) > 0 ? `, due in ${daysUntil(c.due)}d` : ", due now"}` : " · not studied yet"}
                            {!w.b ? " · no fill-in-the-blank" : ""}
                          </div>
                        </div>
                        <button onClick={() => removeImportedWord(w.t)} aria-label={`Remove ${w.t}`} style={{ color: C.red }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {importedWords.length > 0 && (
                  <button onClick={() => startMine()} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    Study these <ArrowRight size={17} />
                  </button>
                )}
                <button onClick={() => setScreen("wordsHub")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <ChevronLeft size={15} /> Back to My Words
                </button>
              </div>
            </div>
          );
        })()}

        {/* ============================ GRAMMAR HUB ============================ */}
        {screen === "grammarHub" && (
          <div>
            <div className="text-center mb-6">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Grammar &amp; Verbs</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>The mechanical parts that reward drilling.</p>
            </div>

            <div className="flex gap-2 mb-5">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2.5 rounded-md text-sm font-semibold" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            <div className="rounded-lg p-5 mb-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.gold}` }}>
              <div className="flex items-center gap-2 mb-1"><Zap size={16} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Conjugation trainer</span></div>
              <p className="text-xs font-serif mb-4" style={{ color: C.muted }}>
                {verbSet.length} core verbs across {tenseSet.length} tenses. Pick a tense to choose your verbs and work through the table, matching, multiple choice and typing. These schedule for review on their own track.
              </p>

              {conjDueCount > 0 && (
                <button onClick={() => startConjugation(null, true)} className="w-full py-2.5 rounded-md font-semibold text-sm mb-2 flex items-center justify-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  <Repeat size={15} /> Review {conjDueCount} due
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {tenseSet.map((t) => (
                  <button key={t.key} onClick={() => openConjSetup(t.key)} className="text-left px-3 py-2.5 rounded-md" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                    <div className="text-sm font-semibold" style={{ color: C.ink }}>{t.label}</div>
                    <div className="text-[0.6875rem] font-serif italic" style={{ color: C.muted }}>{t.hint}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => startConjugation(null)} className="w-full mt-2 py-2 rounded-md font-semibold text-xs" style={{ backgroundColor: "transparent", color: C.ink, border: `1px solid ${C.line}` }}>
                Mix all tenses
              </button>
            </div>

            <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.gold}` }}>
              <div className="flex items-center gap-2 mb-1"><Cog size={16} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Grammar notes</span></div>
              <p className="text-xs font-serif mb-3" style={{ color: C.muted }}>Short explanations of the rules learners actually get stuck on.</p>
              <button onClick={() => { setGrammarIdx(null); setScreen("grammarNotes"); }} className="w-full py-2.5 rounded-md font-semibold text-sm" style={{ backgroundColor: C.gold, color: C.onGold }}>
                Read {GRAMMAR[lang].length} notes
              </button>
            </div>

            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Home size={15} /> Home
            </button>
          </div>
        )}

        {/* ======================= CONJUGATION: VERB SELECTION ======================= */}
        {screen === "conjSetup" && (
          <div>
            <div className="text-center mb-5">
              <div className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>{conjTenseLabel}</div>
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Which verbs?</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                Table, then matching, then multiple choice, then typing.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { key: "random", label: "Random", hint: `${RANDOM_VERB_COUNT} verbs` },
                { key: "single", label: "One verb", hint: "focused" },
                { key: "multi", label: "Several", hint: "pick a set" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => { setConjVerbMode(m.key); setConjPicked([]); }}
                  className="px-2 py-2.5 rounded-md text-center"
                  style={{
                    backgroundColor: conjVerbMode === m.key ? C.ink : "transparent",
                    color: conjVerbMode === m.key ? C.card : C.ink,
                    border: `1px solid ${C.ink}`,
                  }}
                >
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-[0.625rem] font-serif italic opacity-80">{m.hint}</div>
                </button>
              ))}
            </div>

            {conjVerbMode === "random" ? (
              <div className="rounded-lg p-5 mb-4 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <Shuffle size={20} style={{ color: C.accent }} className="mx-auto mb-2" />
                <p className="text-sm font-serif" style={{ color: C.muted }}>
                  {RANDOM_VERB_COUNT} verbs picked at random from the {verbSet.length} core verbs, in the {conjTenseLabel.toLowerCase()}.
                </p>
              </div>
            ) : (
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                    {conjVerbMode === "single" ? "Choose one" : `${conjPicked.length} selected`}
                  </span>
                  {conjVerbMode === "multi" && conjPicked.length > 0 && (
                    <button onClick={() => setConjPicked([])} className="text-xs font-semibold" style={{ color: C.accent }}>Clear</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {verbSet.map((v) => {
                    const on = conjPicked.includes(verbKey(v));
                    return (
                      <button
                        key={verbKey(v)}
                        onClick={() => (conjVerbMode === "single" ? setConjPicked([verbKey(v)]) : toggleConjPick(verbKey(v)))}
                        className="text-left px-2.5 py-2 rounded-md flex items-center gap-1.5"
                        style={{
                          backgroundColor: on ? C.gold : C.paper,
                          border: `1px solid ${on ? C.gold : C.line}`,
                        }}
                      >
                        {on && <Check size={13} style={{ color: C.ink, flexShrink: 0 }} />}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold truncate" style={{ color: C.ink }}>{verbKey(v)}</span>
                          <span className="block text-[0.625rem] font-serif italic truncate" style={{ color: on ? C.ink : C.muted }}>{v.en}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={startConjRun}
              disabled={conjVerbMode !== "random" && !conjPicked.length}
              className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 mb-2"
              style={{
                backgroundColor: conjVerbMode !== "random" && !conjPicked.length ? C.line : C.gold,
                color: C.ink,
                opacity: conjVerbMode !== "random" && !conjPicked.length ? 0.6 : 1,
              }}
            >
              Start <ArrowRight size={17} />
            </button>
            <button onClick={() => setScreen("grammarHub")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        )}

        {/* ======================= CONJUGATION: TABLE ======================= */}
        {screen === "conjTable" && conjVerbs[conjTableIdx] && (() => {
          const v = conjVerbs[conjTableIdx];
          const forms = conjugate(lang, v, conjTense);
          const last = conjTableIdx + 1 >= conjVerbs.length;
          return (
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>Table · {conjTenseLabel}</span>
                <span>{conjTableIdx + 1}/{conjVerbs.length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(conjTableIdx / conjVerbs.length) * 100}%`, backgroundColor: C.green }} />
              </div>

              <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
                <div className="text-center mb-5">
                  <div className="font-type text-3xl" style={{ color: C.ink }}>{verbKey(v)}</div>
                  <div className="text-sm font-serif italic" style={{ color: C.muted }}>{v.en}</div>
                </div>
                <div className="flex flex-col gap-1">
                  {personsFor(lang, conjTense).map((i) => (
                    <button
                      key={i}
                      onClick={() => audioReady && say(spokenForm(lang, i, forms[i], conjTense))}
                      className="flex items-baseline justify-between px-3 py-2 rounded-md text-left"
                      style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, cursor: audioReady ? "pointer" : "default" }}
                    >
                      <span className="font-serif text-sm" style={{ color: C.muted }}>{displayPronoun(lang, i, forms[i])}</span>
                      <span className="font-serif text-lg font-semibold" style={{ color: C.ink }}>{forms[i]}</span>
                    </button>
                  ))}
                </div>
                {audioReady && (
                  <p className="text-[0.6875rem] font-serif italic text-center mt-3" style={{ color: C.muted }}>Tap any line to hear it.</p>
                )}
              </div>

              <div className="flex gap-2">
                {conjTableIdx > 0 && (
                  <button onClick={() => setConjTableIdx((i) => i - 1)} className="px-4 py-3 rounded-md font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    <ChevronLeft size={17} />
                  </button>
                )}
                <button
                  onClick={() => (last ? goToConjMatch() : setConjTableIdx((i) => i + 1))}
                  className="flex-1 py-3 rounded-md font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: C.gold, color: C.onGold }}
                >
                  {last ? "Start matching" : "Next verb"} <ArrowRight size={17} />
                </button>
              </div>
              <button onClick={() => setScreen("conjSetup")} className="w-full mt-2 py-2.5 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                Change verbs
              </button>
            </div>
          );
        })()}

        {/* ======================= CONJUGATION: MATCHING ======================= */}
        {screen === "conjMatch" && (() => {
          const boardDone = conjMatchBoard.length > 0 && conjMatchDoneL.length === conjMatchBoard.length;
          const multi = conjVerbs.length > 1;
          const label = (p) => (multi ? `${pronounSet[p.personIdx]} · ${verbKey(p.verb)}` : pronounSet[p.personIdx]);
          return (
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>Matching · {conjTenseLabel}</span>
                <span>{conjMatchDoneL.length}/{conjMatchBoard.length}{conjMatchPool.length ? ` · ${conjMatchPool.length} left` : ""}</span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${conjMatchBoard.length ? (conjMatchDoneL.length / conjMatchBoard.length) * 100 : 0}%`, backgroundColor: C.green }} />
              </div>

              <p className="text-center text-sm font-serif italic mb-4" style={{ color: C.muted }}>
                Match each person to its form.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex flex-col gap-1.5">
                  {conjMatchLeft.map((p) => {
                    const done = conjMatchDoneL.includes(p.id);
                    const sel = conjMatchPending.left === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectConjTile("left", p.id)}
                        disabled={done}
                        className="px-2 py-2.5 rounded-md text-sm font-serif font-semibold transition-all"
                        style={{
                          backgroundColor: done ? C.paper : sel ? C.ink : C.card,
                          color: done ? C.line : sel ? C.card : C.ink,
                          border: `1px solid ${conjMatchFlash && sel ? C.red : done ? C.line : C.line}`,
                          opacity: done ? 0.4 : 1,
                        }}
                      >
                        {label(p)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-1.5">
                  {conjMatchRight.map((p) => {
                    const done = conjMatchDoneR.includes(p.id);
                    const sel = conjMatchPending.right === p.id;
                    const form = conjFormOf(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectConjTile("right", p.id)}
                        disabled={done}
                        className="px-2 py-2.5 rounded-md text-sm font-serif transition-all"
                        style={{
                          backgroundColor: done ? C.paper : sel ? C.ink : C.card,
                          color: done ? C.line : sel ? C.card : C.ink,
                          border: `1px solid ${conjMatchFlash && sel ? C.red : C.line}`,
                          opacity: done ? 0.4 : 1,
                        }}
                      >
                        {form}
                      </button>
                    );
                  })}
                </div>
              </div>

              {boardDone && (
                <button onClick={advanceConjMatch} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  {conjMatchPool.length ? "Next set" : "Start multiple choice"} <ArrowRight size={17} />
                </button>
              )}
              <button onClick={goToConjMc} className="w-full mt-2 py-2.5 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                Skip to multiple choice
              </button>
            </div>
          );
        })()}

        {/* ======================= CONJUGATION: MULTIPLE CHOICE ======================= */}
        {screen === "conjChoose" && conjMcItem && conjMcOpts && (() => {
          const correct = conjMcOpts.correct;
          const answered = conjMcPicked !== null;
          const wasRight = answered && normalize(conjMcPicked) === normalize(correct);
          return (
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>Multiple choice · {conjTenseLabel}</span>
                <span>{conjMcRetired}/{conjMcTotal}</span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${conjMcTotal ? (conjMcRetired / conjMcTotal) * 100 : 0}%`, backgroundColor: C.green }} />
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-type text-2xl" style={{ color: C.ink }}>{verbKey(conjMcItem.verb)}</div>
                    <div className="text-xs font-serif italic" style={{ color: C.muted }}>{conjMcItem.verb.en}</div>
                  </div>
                  <div className="text-xs uppercase tracking-wide font-semibold px-2 py-1 rounded" style={{ backgroundColor: C.paper, color: C.muted }}>
                    {conjTenseLabel}
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-serif text-xl font-semibold" style={{ color: C.accent }}>{pronounSet[conjMcItem.personIdx]}</span>
                  <span className="font-serif text-xl" style={{ color: C.line }}>_______</span>
                  {verbFrame(lang, conjMcItem.verb, conjMcItem.tenseKey) && (
                    <span className="font-serif text-xl" style={{ color: C.muted }}>{verbFrame(lang, conjMcItem.verb, conjMcItem.tenseKey)}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {conjMcOpts.options.map((o, i) => {
                    const isCorrect = normalize(o) === normalize(correct);
                    const isPicked = answered && normalize(conjMcPicked) === normalize(o);
                    let bg = C.paper, bd = C.line, fg = C.ink;
                    if (answered && isCorrect) { bd = C.green; fg = C.green; }
                    else if (isPicked) { bd = C.red; fg = C.red; }
                    return (
                      <button
                        key={o}
                        onClick={() => pickConjMc(o)}
                        disabled={answered}
                        className="w-full px-4 py-3 rounded-md font-serif text-lg text-left flex items-center justify-between"
                        style={{ backgroundColor: bg, border: `1px solid ${bd}`, color: fg }}
                      >
                        <span className="flex items-center gap-2.5">
                          {hasKeys && <KeyCap n={i + 1} />}
                          {o}
                        </span>
                        {answered && isCorrect && <Check size={17} style={{ color: C.green }} />}
                        {answered && isPicked && !isCorrect && <X size={17} style={{ color: C.red }} />}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: wasRight ? C.green : C.red }}>
                      {wasRight ? <Check size={16} /> : <X size={16} />}
                      {wasRight ? "Correct" : "Not quite"}
                    </div>
                    <div className="font-serif text-base mt-1" style={{ color: C.ink }}>
                      {displayPronoun(lang, conjMcItem.personIdx, correct)}{correct}
                    </div>
                    <div className="font-serif text-sm" style={{ color: C.green }}>
                      {conjugateEnglish(lang, conjMcItem.verb, conjMcItem.tenseKey, conjMcItem.personIdx)}
                      <span style={{ color: C.muted }}> · {verbKey(conjMcItem.verb)} = {conjMcItem.verb.en}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-5">
                  {audioReady && answered ? (
                    <button onClick={() => say(correct)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                      <Volume2 size={15} /> Hear
                    </button>
                  ) : <span />}
                  {answered && (
                    <button onClick={continueConjMc} className="px-5 py-2.5 rounded-md font-semibold flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                      {conjMcQueue.length === 1 && wasRight ? "Start typing" : "Next"} {hasKeys ? <KeyCap n="↵" /> : <ArrowRight size={15} />}
                    </button>
                  )}
                </div>
              </div>

              <button onClick={() => startConjFill({ keepSession: true })} className="w-full mt-3 py-2.5 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                Skip to typing
              </button>
            </div>
          );
        })()}

        {/* ============================ CONJUGATION DRILL ============================ */}
        {screen === "conjugation" && conjItem && (
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
              <span>Conjugation</span>
              <span>{conjIdx + 1}/{conjQueue.length} · {conjScore} right</span>
            </div>
            <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(conjIdx / conjQueue.length) * 100}%`, backgroundColor: C.green }} />
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-type text-2xl" style={{ color: C.ink }}>{verbKey(conjItem.verb)}</div>
                  <div className="text-xs font-serif italic" style={{ color: C.muted }}>{conjItem.verb.en}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide font-semibold px-2 py-1 rounded" style={{ backgroundColor: C.paper, color: C.muted }}>
                    {tenseSet.find((t) => t.key === conjItem.tenseKey)?.label}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-serif text-xl font-semibold" style={{ color: C.accent }}>{pronounSet[conjItem.personIdx]}</span>
                <span className="font-serif text-xl" style={{ color: C.line }}>_______</span>
                {verbFrame(lang, conjItem.verb, conjItem.tenseKey) && (
                  <span className="font-serif text-xl" style={{ color: C.muted }}>{verbFrame(lang, conjItem.verb, conjItem.tenseKey)}</span>
                )}
              </div>

              <input
                ref={conjInputRef} type="text" value={conjInput} disabled={!!conjResult}
                onChange={(e) => setConjInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { if (conjResult) nextConjugation(); else checkConjugation(); } }}
                placeholder="Type the conjugated form" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                className="w-full px-3 py-2.5 rounded-md font-serif text-base"
                style={{ backgroundColor: C.paper, border: `1px solid ${conjResult ? (conjResult.ok ? C.green : C.red) : C.line}`, color: C.ink }}
              />

              {conjResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: conjResult.ok ? C.green : C.red }}>
                    {conjResult.ok ? <Check size={16} /> : <X size={16} />}
                    {conjResult.ok ? "Correct" : "Not quite"}
                  </div>
                  <div className="font-serif text-lg" style={{ color: C.ink }}>
                    {displayPronoun(lang, conjItem.personIdx, conjResult.expected)}{conjResult.expected}
                  </div>
                  {/* Being told the answer is "sie sind" is no use without this. */}
                  <div className="font-serif text-sm" style={{ color: C.green }}>
                    {conjugateEnglish(lang, conjItem.verb, conjItem.tenseKey, conjItem.personIdx)}
                    <span style={{ color: C.muted }}> · {verbKey(conjItem.verb)} = {conjItem.verb.en}</span>
                  </div>
                  {conjResult.note && (
                    <div className="text-xs font-serif italic mt-1" style={{ color: C.accent }}>{conjResult.note}</div>
                  )}
                  {lang === "fr" && conjItem.tenseKey === "passe" && conjItem.verb.aux === "être" && (
                    <div className="text-xs font-serif mt-1" style={{ color: C.muted }}>
                      This verb takes être, so the participle agrees with the subject — allée, allés, allées are all accepted.
                    </div>
                  )}
                  {/* The rule, not just the answer.
                    * Being shown "sie sind" and its English tells you what to
                    * memorise; it never tells you how the tense is built, so
                    * the next verb in the same tense is a fresh guess. Shown
                    * on a miss only — after a correct answer it is clutter. */}
                  {!conjResult.ok && (() => {
                    const tense = tenseSet.find((x) => x.key === conjItem.tenseKey);
                    if (!tense?.form) return null;
                    const note = tense.note && noteTitles.includes(tense.note) ? tense.note : null;
                    return (
                      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                        <div className="text-[0.625rem] uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>
                          How the {tense.label} is built
                        </div>
                        <p className="font-serif text-[0.8125rem]" style={{ color: C.muted, lineHeight: 1.6 }}>
                          <Emphasised text={tense.form} />
                        </p>
                        {note && (
                          <button
                            onClick={() => openNote(note)}
                            className="mt-2 px-2.5 py-1 rounded text-[0.6875rem] font-semibold inline-flex items-center gap-1"
                            style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}
                          >
                            <BookOpen size={11} /> Read: {note}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-between items-center mt-5">
                {audioReady && conjResult ? (
                  <button onClick={() => say(conjResult.expected)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                    <Volume2 size={15} /> Hear it
                  </button>
                ) : <span />}
                {!conjResult ? (
                  <button onClick={checkConjugation} className="px-5 py-2 rounded-md font-semibold text-sm" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
                ) : (
                  <button onClick={nextConjugation} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    {conjIdx + 1 < conjQueue.length ? "Next" : "Finish"} <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* full table reference once answered */}
            {conjResult && (
              <div className="rounded-lg p-4 mt-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Full table</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {personsFor(lang, conjItem.tenseKey).map((i) => {
                    const f = conjugate(lang, conjItem.verb, conjItem.tenseKey)[i];
                    return (
                      <div key={i} className="flex justify-between text-sm font-serif" style={{ color: i === conjItem.personIdx ? C.ink : C.muted }}>
                        <span>{displayPronoun(lang, i, f)}</span>
                        <span style={{ fontWeight: i === conjItem.personIdx ? 600 : 400 }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================ CONJUGATION: DONE ============================ */}
        {screen === "conjugationDone" && (() => {
          const missed = [...conjMissedRef.current.values()];
          const canContinue = conjVerbs.length > 0 && !!conjTense;
          const verbNames = conjVerbs.map((v) => verbKey(v)).join(", ");
          const remainingVerbs = verbSet.filter((v) => !conjVerbs.some((x) => verbKey(x) === verbKey(v))).length;
          return (
            <div>
              <div className="rounded-lg p-6 text-center mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>
                  {conjPracticeOnly ? "Practice round complete" : "Drill complete"}
                </div>
                <div className="font-type text-4xl mb-1" style={{ color: C.ink }}>{conjScore}/{conjQueue.length}</div>
                <div className="font-serif text-sm" style={{ color: C.muted }}>
                  {conjPracticeOnly
                    ? "forms correct · practice only, scheduling untouched"
                    : "forms correct · scheduled for review"}
                </div>
              </div>

              {missed.length > 0 && (
                <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                  <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>
                    Needed extra practice ({missed.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {missed.map((m) => {
                      const form = conjugate(lang, m.verb, m.tenseKey)[m.personIdx];
                      return (
                        <div key={`${verbKey(m.verb)}:${m.tenseKey}:${m.personIdx}`} className="flex justify-between text-sm font-serif items-baseline">
                          <span style={{ color: C.muted }}>
                            {verbKey(m.verb)} · {tenseSet.find((t) => t.key === m.tenseKey)?.label}
                          </span>
                          <span className="font-semibold" style={{ color: C.ink }}>
                            {displayPronoun(lang, m.personIdx, form)}{form}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={redoConjMissed} className="w-full mt-4 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: C.red, color: C.card }}>
                    <RotateCcw size={15} /> Practice These Again
                  </button>
                </div>
              )}

              {/* Where this sits in the whole verb × tense space. */}
              <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>
                  {LANG_INFO[lang].name} conjugation coverage
                </div>
                <div className="flex flex-col gap-2.5">
                  {conjCoverage.map((row) => (
                    <div key={row.key}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-semibold" style={{ color: row.key === conjTense ? C.ink : C.muted }}>
                          {row.label}{row.key === conjTense ? " ·" : ""}
                        </span>
                        <span className="text-[0.625rem] font-serif" style={{ color: C.muted }}>{row.started}/{row.total} started</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: C.line }}>
                        {["mature", "young", "learning"].map((k) =>
                          row[k] > 0 ? (
                            <span key={k} style={{ width: `${(row[k] / row.total) * 100}%`, backgroundColor: CONJ_STAGE_COLOR[k] }} />
                          ) : null,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 flex-wrap">
                  {[["learning", "learning"], ["young", "young"], ["mature", "mature"]].map(([k, lbl]) => (
                    <span key={k} className="flex items-center gap-1 text-[0.625rem] font-serif" style={{ color: C.muted }}>
                      <span className="rounded-sm" style={{ width: 9, height: 9, backgroundColor: CONJ_STAGE_COLOR[k] }} /> {lbl}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {canContinue && nextTense && (
                  <button onClick={continueSameVerbsNextTense} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    Same verbs · {nextTense.label} <ArrowRight size={17} />
                  </button>
                )}
                {canContinue && remainingVerbs > 0 && (
                  <button onClick={continueNewVerbsSameTense} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: nextTense ? C.paper : C.gold, color: C.ink, border: `1px solid ${C.line}` }}>
                    New verbs · {conjTenseLabel} <ArrowRight size={17} />
                  </button>
                )}
                {canContinue && (
                  <p className="text-[0.6875rem] font-serif italic text-center" style={{ color: C.muted }}>
                    Just drilled: {verbNames}
                  </p>
                )}
                {conjDueCount > 0 && (
                  <button onClick={() => startConjugation(null, true)} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    <Repeat size={15} /> Review {conjDueCount} due
                  </button>
                )}
                <button onClick={() => setScreen("grammarHub")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Zap size={15} /> Pick a different tense
                </button>
                <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Home size={15} /> Home
                </button>
              </div>
            </div>
          );
        })()}

        {/* ============================ GRAMMAR NOTES ============================ */}
        {screen === "grammarNotes" && (
          <div>
            {grammarIdx === null ? (
              <>
                <div className="text-center mb-5">
                  <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Notes</div>
                  <p className="font-serif italic text-sm" style={{ color: C.muted }}>{LANG_INFO[lang].name}</p>
                </div>

                {/* Grouped by kind, because the two answer different
                  * questions: grammar is how the language is built, culture is
                  * when to use it and what using it says about you. Listing
                  * them together buried the second kind. */}
                {["grammar", "culture"].map((kind) => {
                  const notes = GRAMMAR[lang]
                    .map((n, i) => ({ ...n, i }))
                    .filter((n) => (n.kind || "grammar") === kind);
                  if (!notes.length) return null;
                  return (
                    <div key={kind} className="mb-5">
                      <div className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>
                        {NOTE_KINDS[kind].label}
                      </div>
                      <p className="text-xs font-serif mb-2" style={{ color: C.muted }}>{NOTE_KINDS[kind].blurb}</p>
                      <div className="flex flex-col gap-2.5">
                        {notes.map((n) => (
                          <button key={n.title} onClick={() => setGrammarIdx(n.i)} className="text-left p-4 rounded-md"
                            style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: kind === "culture" ? `3px solid ${C.gold}` : `1px solid ${C.line}` }}>
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <span className="text-sm font-semibold" style={{ color: C.ink }}>{n.title}</span>
                              <span className="text-[0.625rem] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: C.paper, color: C.muted }}>{n.level}</span>
                            </div>
                            <div className="text-xs font-serif" style={{ color: C.muted }}>{n.body[0].slice(0, 95)}…</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setScreen("grammarHub")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <ChevronLeft size={15} /> Back
                </button>
              </>
            ) : (
              <>
                <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-type text-xl" style={{ color: C.ink }}>{GRAMMAR[lang][grammarIdx].title}</div>
                    <span className="text-[0.625rem] uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: C.paper, color: C.muted }}>{GRAMMAR[lang][grammarIdx].level}</span>
                  </div>
                  {GRAMMAR[lang][grammarIdx].body.map((p, i) => (
                    <p key={i} className="font-serif text-sm leading-relaxed mb-3" style={{ color: C.ink }}>{p}</p>
                  ))}
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                    <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Examples</div>
                    {GRAMMAR[lang][grammarIdx].examples.map((ex) => (
                      <div key={ex.t} className="mb-3">
                        <div className="flex items-start gap-2">
                          <span className="font-serif text-sm font-semibold" style={{ color: C.ink }}>{ex.t}</span>
                          {audioReady && (
                            <button onClick={() => say(ex.t)} aria-label="Hear example" style={{ color: C.muted }}><Volume2 size={13} /></button>
                          )}
                        </div>
                        <div className="font-serif italic text-xs" style={{ color: C.muted }}>{ex.e}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGrammarIdx(null)} className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    <ChevronLeft size={15} /> All notes
                  </button>
                  {grammarIdx + 1 < GRAMMAR[lang].length && (
                    <button onClick={() => setGrammarIdx((i) => i + 1)} className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                      Next note <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================ LISTEN/SPEAK: SELECT ============================ */}
        {screen === "listenSelect" && (
          <div>
            <div className="text-center mb-6">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Listening &amp; Speaking</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>Train your ear, then your mouth.</p>
            </div>

            <div className="flex gap-2 mb-4">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2.5 rounded-md text-sm font-semibold" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            {!audioReady && (
              <div className="rounded-md p-3 mb-4 text-xs font-serif flex items-center gap-2" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>
                <VolumeX size={15} style={{ color: C.red }} />
                No {LANG_INFO[lang].name} voice is installed on this device, so dictation can't play audio. Try the other language, or install a system voice.
              </div>
            )}

            <div className="mb-4"><VoiceCredits lang={lang} compact /></div>

            <div className="flex border-b mb-4" style={{ borderColor: C.line }}>
              {audioLevels.map((lv) => (
                <Tab key={lv} active={dictLevel === lv} onClick={() => setDictLevel(lv)}>{lv}</Tab>
              ))}
            </div>

            {/* Dictation */}
            <div className="rounded-lg p-5 mb-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.gold}` }}>
              <div className="flex items-center gap-2 mb-1"><Headphones size={16} style={{ color: C.accent }} /><span className="text-sm font-semibold" style={{ color: C.ink }}>Dictation</span></div>
              <p className="text-xs font-serif mb-4" style={{ color: C.muted }}>
                A sentence plays; you type what you hear. Replay as often as you like, at normal or slow speed. Counts as a review.
              </p>
              <div className="flex flex-col gap-2">
                <button disabled={!audioReady} onClick={() => startDictation("level", dictLevel)} className="w-full py-2.5 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  10 sentences from {dictLevel}
                </button>
                {dueCards.length > 0 && (
                  <button disabled={!audioReady} onClick={() => startDictation("due", dictLevel)} className="w-full py-2.5 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: "transparent", color: C.ink, border: `1px solid ${C.line}` }}>
                    Use my {Math.min(10, dueCards.length)} due words instead
                  </button>
                )}
              </div>
            </div>

            {/* Speaking */}
            <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${micSupported ? C.gold : C.line}` }}>
              <div className="flex items-center gap-2 mb-1">
                {micSupported ? <Mic size={16} style={{ color: C.accent }} /> : <MicOff size={16} style={{ color: C.muted }} />}
                <span className="text-sm font-semibold" style={{ color: C.ink }}>Speaking</span>
                <span className="text-[0.625rem] uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ backgroundColor: C.paper, color: C.muted }}>experimental</span>
              </div>
              {micSupported ? (
                <>
                  <p className="text-xs font-serif mb-4" style={{ color: C.muted }}>
                    Read a sentence aloud and your browser transcribes it. Accuracy varies a lot by browser, and microphone access is often blocked inside embedded frames — if it fails, that's the sandbox, not you.
                  </p>
                  <button onClick={() => startSpeaking("level", dictLevel)} className="w-full py-2.5 rounded-md font-semibold text-sm" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    8 sentences from {dictLevel}
                  </button>
                </>
              ) : (
                <p className="text-xs font-serif" style={{ color: C.muted }}>
                  This browser doesn't expose speech recognition, so speaking practice isn't available here. Chrome and Edge on desktop are the most likely to support it.
                </p>
              )}
            </div>

            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Home size={15} /> Home
            </button>
          </div>
        )}

        {/* ============================ DICTATION ============================ */}
        {screen === "dictation" && dictItem && (
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
              <span>Dictation</span>
              <span>{dictIdx + 1}/{dictQueue.length} · {dictScore} exact</span>
            </div>
            <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(dictIdx / dictQueue.length) * 100}%`, backgroundColor: C.green }} />
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: C.muted }}>Type what you hear</div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => say(dictItem.word.s)} className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: C.ink, color: C.card }}>
                  <Play size={15} /> Play
                </button>
                <button onClick={() => speakWith(dictItem.word.s, voiceForLang, LANG_INFO[lang].locale, SPEECH_RATE.SLOW)} className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: "transparent", color: C.ink, border: `1px solid ${C.line}` }}>
                  <Volume2 size={15} /> Slower
                </button>
              </div>

              <button onClick={() => setDictShowHint((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: C.muted }}>
                {dictShowHint ? <EyeOff size={13} /> : <Eye size={13} />}
                {dictShowHint ? "Hide English" : "Stuck? Show the English"}
              </button>
              {dictShowHint && <div className="font-serif italic text-sm mb-3" style={{ color: C.muted }}>{dictItem.word.se}</div>}

              <input
                ref={dictInputRef} type="text" value={dictInput} disabled={!!dictResult}
                onChange={(e) => setDictInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { if (dictResult) nextDictation(); else checkDictation(); } }}
                placeholder="Type the sentence" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                className="w-full px-3 py-2.5 rounded-md font-serif text-base mt-1"
                style={{ backgroundColor: C.paper, border: `1px solid ${dictResult ? (dictResult.ok ? C.green : C.red) : C.line}`, color: C.ink }}
              />

              {dictResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: dictResult.ok ? C.green : C.red }}>
                    {dictResult.ok ? <Check size={16} /> : <X size={16} />}
                    {dictResult.ok ? "Exact match" : `${Math.round(dictResult.overlap * 100)}% of the words caught`}
                  </div>
                  {/* The diff marks what was missed. It is feedback, not a
                    * sentence — a line of wavy red underlines is hard to read
                    * back as language, so the sentence and its meaning are
                    * spelled out plainly underneath. */}
                  <div className="font-serif text-base leading-relaxed mb-3">
                    {dictResult.diff.map((d, i) => (
                      <span key={i} style={{ color: d.ok ? C.green : C.red, textDecoration: d.ok ? "none" : "underline", textDecorationStyle: "wavy" }}>
                        {d.tok}{" "}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-md px-3 py-2" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-serif text-[1.0625rem]" style={{ color: C.ink }}>{dictItem.word.s}</span>
                      {audioReady && (
                        <button onClick={() => say(dictItem.word.s)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem]"
                          style={{ backgroundColor: C.card, color: C.ink, border: `1px solid ${C.line}` }}>
                          <Volume2 size={11} /> hear
                        </button>
                      )}
                    </div>
                    <div className="font-serif text-sm mt-0.5" style={{ color: C.muted }}>{dictItem.word.se}</div>
                    <div className="font-serif text-xs mt-1.5" style={{ color: C.muted }}>
                      the word: <span className="font-type" style={{ color: C.ink }}>{dictItem.word.t}</span> — {dictItem.word.e}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-5">
                {!dictResult ? (
                  <button onClick={checkDictation} className="px-5 py-2 rounded-md font-semibold text-sm" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
                ) : (
                  <button onClick={nextDictation} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    {dictIdx + 1 < dictQueue.length ? "Next" : "Finish"} <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================ DICTATION: DONE ============================ */}
        {screen === "dictationDone" && (
          <div>
            <div className="rounded-lg p-6 text-center mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Dictation complete</div>
              <div className="font-type text-4xl mb-1" style={{ color: C.ink }}>{dictScore}/{dictQueue.length}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>transcribed exactly · these words are now scheduled for review</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setScreen("listenSelect")} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                <Headphones size={17} /> Another Round
              </button>
              <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Home size={15} /> Home
              </button>
            </div>
          </div>
        )}

        {/* ============================ SPEAKING ============================ */}
        {screen === "speaking" && speakItem && (
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
              <span>Speaking</span>
              <span>{speakIdx + 1}/{speakQueue.length}</span>
            </div>
            <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: C.line }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(speakIdx / speakQueue.length) * 100}%`, backgroundColor: C.green }} />
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Read this aloud</div>
              <div className="font-serif text-lg mb-1">{speakItem.word.s}</div>
              <div className="font-serif italic text-sm mb-4" style={{ color: C.muted }}>{speakItem.word.se}</div>

              {audioReady && (
                <button onClick={() => say(speakItem.word.s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs mb-4" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                  <Volume2 size={13} /> Hear it first
                </button>
              )}

              <button
                onClick={speakListening ? stopListening : beginListening}
                className="w-full py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: speakListening ? C.red : C.ink, color: C.card }}
              >
                {speakListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Start speaking</>}
              </button>

              {speakListening && (
                <div className="text-center text-xs font-serif mt-3" style={{ color: C.muted }}>Listening…</div>
              )}

              {speakError && (
                <div className="mt-4 text-xs font-serif p-3 rounded-md" style={{ backgroundColor: C.paper, border: `1px solid ${C.red}`, color: C.ink }}>
                  {speakError}
                </div>
              )}

              {speakResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: speakResult.overlap >= 0.7 ? C.green : C.red }}>
                    {speakResult.overlap >= 0.7 ? <Check size={16} /> : <X size={16} />}
                    {Math.round(speakResult.overlap * 100)}% match
                  </div>
                  <div className="font-serif text-sm" style={{ color: C.muted }}>heard: "{speakTranscript}"</div>
                </div>
              )}

              <div className="flex justify-end mt-5">
                <button onClick={nextSpeaking} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                  {speakIdx + 1 < speakQueue.length ? "Next" : "Finish"} <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <p className="text-center text-xs font-serif mt-3" style={{ color: C.muted }}>
              Browser transcription is rough — treat the percentage as a nudge, not a verdict.
            </p>
          </div>
        )}

        {/* ============================ SPEAKING: DONE ============================ */}
        {screen === "speakingDone" && (
          <div>
            <div className="rounded-lg p-6 text-center mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Speaking complete</div>
              <div className="font-type text-4xl mb-1" style={{ color: C.ink }}>{speakScore}/{speakQueue.length}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>sentences recognised well</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setScreen("listenSelect")} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                <Mic size={17} /> Another Round
              </button>
              <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Home size={15} /> Home
              </button>
            </div>
          </div>
        )}

        {/* ============================ PROGRESS DASHBOARD ============================ */}
        {/* Word Roots on a phone: one column, list then detail. The desktop
          * workbench puts the picker beside the tree, which is the only real
          * difference — the content is the same and so are the handlers. */}
        {screen === "etymology" && !isDesktop && (
          <div>
            <h2 className="font-type text-2xl mb-1" style={{ color: C.ink }}>Word Roots</h2>
            <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
              Where your words came from, and the regular changes that pulled French and German apart.
            </p>

            <div className="flex rounded-md overflow-hidden mb-4" style={{ border: `1px solid ${C.line}` }}>
              {[["build", "Building"], ["roots", "Ancestry"], ["laws", "Changes"]].map(([id, label], i) => (
                <button key={id} onClick={() => { setEtymView(id); endEtymQuiz(); endBldQuiz(); }}
                  className="flex-1 px-2 py-2 text-[0.8125rem] font-semibold"
                  style={{ backgroundColor: etymView === id ? TINT : "transparent", color: C.ink,
                    borderLeft: i ? `1px solid ${C.line}` : "none" }}>
                  {label}
                </button>
              ))}
            </div>

            {etymView === "build" ? (
              bldFamilyObj ? (
                <div>
                  <button onClick={() => selectBldFamily(null)} className="font-serif text-xs mb-3" style={{ color: C.muted }}>← all roots</button>
                  <WordBuilder
                    lang={lang} families={bldFamilies} selectedFamily={bldFamily}
                    quiz={bldQuiz} picked={bldPicked} onPick={pickBldAnswer}
                    onNextQuiz={nextBldQuiz} onPractise={startBldQuiz} onEndQuiz={endBldQuiz}
                    quizStats={bldStats} openAffix={bldAffix} onOpenAffix={setBldAffix}
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <WordBuilder lang={lang} families={bldFamilies} selectedFamily={null}
                      quiz={null} quizStats={bldStats} openAffix={null} onOpenAffix={setBldAffix} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {bldFamilies.map((f) => (
                      <button key={f.id} onClick={() => selectBldFamily(f.id)}
                        className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                        <div className="font-type text-base" style={{ color: C.ink }}>{f.root}-</div>
                        <div className="font-serif text-xs" style={{ color: C.muted }}>{f.gloss} · {f.members.length + 1} words</div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : etymView === "roots" ? (
              etymFamilyObj && etymTree ? (
                <div>
                  <button onClick={() => setEtymFamily(null)} className="font-serif text-xs mb-3" style={{ color: C.muted }}>← all roots</button>
                  <div className="font-serif text-xs uppercase tracking-wide" style={{ color: C.muted }}>
                    {LAYERS[etymFamilyObj.layer]?.label}
                  </div>
                  <h3 className="font-type text-2xl mb-3" style={{ color: C.ink }}>
                    {etymFamilyObj.layer === "pie" || etymFamilyObj.layer === "gem" ? "*" : ""}{etymFamilyObj.form}
                  </h3>
                  <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                    <WordTree tree={etymTree} words={etymWords} onSay={sayIn} canSpeak
                      forkNote={etymTree.form ? `Still one word at ${etymTree.form}.` : null} />
                  </div>
                  {etymFamilyObj.members.map((m) => (
                    <div key={`${m.lang}:${m.t}`} className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>
                      {m.lang.toUpperCase()} {m.t} <span style={{ color: C.muted }}>— {m.e} · {m.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {FAMILIES.map((f) => (
                    <button key={`${f.layer}:${f.form}`} onClick={() => selectEtymFamily(`${f.layer}:${f.form}`)}
                      className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                      <div className="font-type text-base" style={{ color: C.ink }}>
                        {f.members.find((m) => m.lang === "fr")?.t} <span style={{ color: C.muted }}>·</span> {f.members.find((m) => m.lang === "de")?.t}
                      </div>
                      <div className="font-serif text-xs" style={{ color: C.muted }}>
                        {LAYERS[f.layer]?.short} {f.form} — {f.members[0]?.e}
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : etymLawObj ? (
              <div>
                <button onClick={() => setEtymLaw(null)} className="font-serif text-xs mb-3" style={{ color: C.muted }}>← all changes</button>
                <h3 className="font-type text-xl mb-1" style={{ color: C.ink }}>{etymLawObj.name}</h3>
                <p className="font-serif text-[0.9375rem] mb-3" style={{ color: C.ink }}>{etymLawObj.rule}</p>
                <p className="font-serif text-sm mb-3" style={{ color: C.muted }}>{etymLawObj.why}</p>
                {etymLawObj.pairs.map((pr) => (
                  <div key={pr.g} className="font-serif text-sm py-1" style={{ color: C.ink, borderTop: `1px solid ${C.line}` }}>
                    <span style={{ color: C.muted }}>{pr.g}: </span>
                    {["la", "fr", "de", "en"].filter((c) => pr[c] && pr[c] !== "—").map((c) => pr[c]).join(" · ")}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {etymGroups.map((g) => (
                  <div key={g.id}>
                    <div className="font-serif text-xs uppercase tracking-wide" style={{ color: C.accent }}>{g.label}</div>
                    <p className="font-serif text-xs mb-1.5" style={{ color: C.muted }}>{g.blurb}</p>
                    {g.laws.map((l) => (
                      <button key={l.id} onClick={() => selectEtymLaw(l.id)}
                        className="w-full px-3 py-2 rounded-md text-left mb-1" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                        <span className="font-type text-base" style={{ color: C.ink }}>{l.from} → {l.to}</span>
                        <span className="font-serif text-xs ml-2" style={{ color: C.muted }}>{l.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {screen === "collocations" && (
          <Collocations
            langName={LANG_INFO[lang].name}
            list={colList}
            quiz={colQuiz}
            picked={colPicked}
            onPick={pickCollocation}
            onNext={nextCollocation}
            onStart={startCollocations}
            phase={colPhase}
            stats={colStats}
            missed={colStats.missed}
            onSay={(t) => sayIn(lang, t)}
            canSpeak={canSayIn(lang)}
            hasKeys={hasKeys}
          />
        )}

        {screen === "fluency" && (
          <FluencyRound
            poolSize={flPool.length}
            settledCount={flPool.filter((p) => p.settled).length}
            readiness={flReadiness}
            onStudy={() => setScreen("setup")}
            hasKeys={hasKeys}
            direction={flDirection}
            onDirection={(d) => { setFlDirection(d); setFlPhase("idle"); setFlScore(null); }}
            phase={flPhase}
            secondsLeft={flLeft}
            item={flItem}
            streak={flStreak}
            answered={flAnswersRef.current.length}
            lastWrong={flWrong}
            onAnswer={answerFluency}
            onStart={startFluency}
            onAgain={startFluency}
            onHome={() => { setFlPhase("idle"); setScreen("setup"); }}
            score={flScore}
            verdict={flScore ? roundVerdict(flScore, flPrevBest) : ""}
            record={flRecord}
            langName={LANG_INFO[lang].name}
          />
        )}

        {/* ============================ PLACEMENT ============================ */}
        {screen === "placement" && (
          <Placement
            key={lang}
            langName={LANG_INFO[lang].name}
            stage={placeStage}
            question={placeQs[placeIdx]}
            asked={placeIdx}
            total={placeQs.length}
            picked={placePicked}
            level={level}
            result={placeResult}
            lastResult={progress.placement?.[lang] || null}
            onStart={startPlacement}
            onAnswer={answerPlacement}
            onNext={nextPlacement}
            onAccept={() => savePlacement(placeResult, true)}
            onKeep={() => savePlacement(placeResult, false)}
          />
        )}

        {screen === "progress" && (
          <div>
            <div className="text-center mb-5">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Progress</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>{LANG_INFO[lang].name} · all levels</p>
            </div>

            <div className="flex gap-2 mb-5">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            {/* maturity breakdown */}
            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Deck maturity</div>
              <div className="flex h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: C.paper }}>
                {(() => {
                  const total = allWordsForLang.length || 1;
                  const counts = { new: 0, learning: 0, young: 0, mature: 0 };
                  allWordsForLang.forEach(({ word, level: lv }) => { counts[cardStage(progress.cards[cardId(lang, lv, word.t)])]++; });
                  const segs = [
                    { k: "learning", c: C.red }, { k: "young", c: C.gold }, { k: "mature", c: C.green },
                  ];
                  return segs.map((s) => counts[s.k] ? <div key={s.k} style={{ width: `${(counts[s.k] / total) * 100}%`, backgroundColor: s.c }} /> : null);
                })()}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(() => {
                  const counts = { new: 0, learning: 0, young: 0, mature: 0 };
                  allWordsForLang.forEach(({ word, level: lv }) => { counts[cardStage(progress.cards[cardId(lang, lv, word.t)])]++; });
                  const labels = [
                    { k: "new", label: "Not started", color: C.muted },
                    { k: "learning", label: "Learning", color: C.red },
                    { k: "young", label: "Young", color: C.accent },
                    { k: "mature", label: "Mature", color: C.green },
                  ];
                  return labels.map((l) => (
                    <div key={l.k}>
                      <div className="font-semibold text-lg" style={{ color: l.color }}>{counts[l.k]}</div>
                      <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>{l.label}</div>
                    </div>
                  ));
                })()}
              </div>
              <div className="text-xs font-serif mt-3" style={{ color: C.muted }}>
                "Mature" means the interval has stretched past three weeks — the word is sticking.
              </div>
            </div>

            {/* per-level / per-theme mastery */}
            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Mastery by drawer</div>
              {levelsFor(lang).map((lv) => {
                const groups = DATA[lang][lv];
                const levelTotal = groups.reduce((n, g) => n + g.words.length, 0);
                const levelStarted = groups.reduce((n, g) => n + g.words.filter((w) => progress.cards[cardId(lang, lv, w.t)]).length, 0);
                return (
                  <div key={lv} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-semibold" style={{ color: C.ink }}>{lv}</span>
                      <span className="text-xs font-serif" style={{ color: C.muted }}>{levelStarted}/{levelTotal}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {groups.map((g) => {
                        const started = g.words.filter((w) => progress.cards[cardId(lang, lv, w.t)]).length;
                        const pct = Math.round((started / g.words.length) * 100);
                        return (
                          <div key={g.topic} className="flex items-center gap-2">
                            <span className="text-[0.6875rem] font-serif truncate" style={{ color: C.muted, width: "42%" }}>{g.topic}</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.paper }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? C.green : C.gold }} />
                            </div>
                            <span className="text-[0.625rem] tabular-nums" style={{ color: C.muted, width: 30, textAlign: "right" }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Your own words live outside the CEFR levels, so the loop above
                  can't see them — but they're the same deck and the same cards. */}
              {importedWords.length > 0 && (() => {
                const started = importedWords.filter(({ word: w }) => progress.cards[cardId(lang, "IMP", w.t)]).length;
                const pct = Math.round((started / importedWords.length) * 100);
                return (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: C.ink }}>
                        <Sparkles size={13} style={{ color: C.accent }} /> My Words
                      </span>
                      <span className="text-xs font-serif" style={{ color: C.muted }}>{started}/{importedWords.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-serif truncate" style={{ color: C.muted, width: "42%" }}>your own vocabulary</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.paper }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? C.green : C.gold }} />
                      </div>
                      <span className="text-[0.625rem] tabular-nums" style={{ color: C.muted, width: 30, textAlign: "right" }}>{pct}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* upcoming schedule */}
            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Coming up</div>
              {(() => {
                const buckets = [0, 1, 2, 3, 4, 5, 6, 7];
                const counts = buckets.map(() => 0);
                let later = 0;
                allWordsForLang.forEach(({ word, level: lv }) => {
                  const c = progress.cards[cardId(lang, lv, word.t)];
                  if (!c) return;
                  const d = Math.max(0, daysUntil(c.due));
                  if (d <= 7) counts[d]++; else later++;
                });
                const max = Math.max(1, ...counts, later);
                const labels = ["today", "+1", "+2", "+3", "+4", "+5", "+6", "+7"];
                return (
                  <div className="flex items-end gap-1.5" style={{ height: 90 }}>
                    {counts.map((n, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[0.625rem] mb-1" style={{ color: C.muted }}>{n || ""}</span>
                        <div className="w-full rounded-t" style={{ height: `${(n / max) * 60}px`, backgroundColor: i === 0 ? C.gold : C.line, minHeight: n ? 3 : 0 }} />
                        <span className="text-[0.5625rem] mt-1" style={{ color: C.muted }}>{labels[i]}</span>
                      </div>
                    ))}
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[0.625rem] mb-1" style={{ color: C.muted }}>{later || ""}</span>
                      <div className="w-full rounded-t" style={{ height: `${(later / max) * 60}px`, backgroundColor: C.line, minHeight: later ? 3 : 0 }} />
                      <span className="text-[0.5625rem] mt-1" style={{ color: C.muted }}>8+</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* activity heatmap: last 5 weeks */}
            <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex justify-between items-baseline mb-3">
                <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>Last 5 weeks</div>
                <div className="text-xs font-serif" style={{ color: C.muted }}>longest streak: {progress.longest || 0}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 35 }).map((_, i) => {
                  const key = addDays(todayKey(), i - 34);
                  const n = progress.history[key]?.reviews || 0;
                  const intensity = n === 0 ? 0 : n < 10 ? 0.3 : n < 30 ? 0.6 : 1;
                  return (
                    <div
                      key={key}
                      title={`${key}: ${n} reviews`}
                      className="rounded-sm"
                      style={{ width: 14, height: 14, backgroundColor: intensity ? C.green : C.paper, opacity: intensity || 1, border: `1px solid ${C.line}` }}
                    />
                  );
                })}
              </div>
            </div>

            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Home size={15} /> Home
            </button>
          </div>
        )}

        {/* ============================ LESSONS ============================ */}
        {screen === "lessons" && (
          <Lessons
            key={lang}
            lang={lang}
            langName={LANG_INFO[lang].name}
            lessons={lessonsFor(lang)}
            records={progress.lessons?.[lang] || {}}
            onRecord={recordLesson}
            onWork={noteWork}
            check={runWritingCheck}
            checkQuiet={checkWritingNow}
            glossOf={glossOf}
            canSpeak={canSayIn(lang)}
            say={(t) => sayIn(lang, t)}
            noteTitles={noteTitles}
            onOpenNote={openNote}
            tenses={tenseSet}
            onAddWords={(recs) => saveWordRecords(recs)}
          />
        )}

        {/* ============================ READING ROOM ============================ */}
        {screen === "reading" && (
          <ReadingRoom
            key={lang}
            lang={lang}
            langName={LANG_INFO[lang].name}
            passages={PASSAGES[lang]}
            levels={levelsFor(lang)}
            startLevel={level}
            records={progress.reading || {}}
            onRecord={recordReading}
            today={todayKey()}
            check={runWritingCheck}
            glossOf={glossOf}
            canSpeak={canSayIn(lang)}
            say={(t) => sayIn(lang, t)}
            onSaveWords={(list) => { setWordsSrc(list.join("\n")); setScreen("wordsInput"); }}
            hasKeys={hasKeys}
            noteTitles={noteTitles}
            onOpenNote={openNote}
          />
        )}

        {/* ============================ YOUR MISTAKES ============================ */}
        {screen === "mistakes" && (
          <Mistakes
            key={lang}
            lang={lang}
            langName={LANG_INFO[lang].name}
            mistakes={mistakeList}
            onClear={(id) => setProgress((p) => ({ ...p, errors: clearMistake(p.errors, id) }))}
            onPractised={(id) => { noteWork("mistakes"); setProgress((p) => ({ ...p, errors: markPractised(p.errors, id, todayKey()) })); }}
            check={checkWritingNow}
            noteTitles={noteTitles}
            onOpenNote={openNote}
            hasKeys={hasKeys}
          />
        )}

        {/* ============================ WRITING DESK ============================ */}
        {screen === "writing" && (
          <WritingDesk
            key={lang}
            lang={lang}
            langName={LANG_INFO[lang].name}
            levels={levelsFor(lang)}
            startLevel={level}
            entries={progress.writing || []}
            onSave={saveWriting}
            check={runWritingCheck}
            canSpeak={canSayIn(lang)}
            say={(t) => sayIn(lang, t)}
            hasKeys={hasKeys}
            noteTitles={noteTitles}
            onOpenNote={openNote}
          />
        )}

        {/* ============================ PHRASE: SELECT ============================ */}
        {screen === "phraseSelect" && (
          <div>
            <div className="text-center mb-6">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Phrase Match</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                Match each idiom to its real meaning — phrases rarely translate word for word.
              </p>
            </div>

            <div className="flex gap-2 mb-5">
              {["fr", "de"].map((l) => (
                <button key={l} onClick={() => setLang(l)} className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors" style={{ backgroundColor: lang === l ? C.ink : "transparent", color: lang === l ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  {LANG_INFO[l].name}
                </button>
              ))}
            </div>

            <div className="flex border-b mb-5" style={{ borderColor: C.line }}>
              {CORE_LEVELS.map((lv) => (
                <Tab key={lv} active={phraseLevel === lv} onClick={() => setPhraseLevel(lv)}>{lv}</Tab>
              ))}
            </div>

            <button onClick={() => startPhrases(phraseLevel)} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
              Start Matching ({PHRASES[lang][phraseLevel].length} idioms) <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ============================ PHRASE: MATCH ============================ */}
        {screen === "phraseMatch" && (
          <div>
            <p className="text-center font-serif text-sm mb-2" style={{ color: C.muted }}>
              Match each idiom to its real meaning. {phraseMatched.length}/{phraseLeft.length} matched.
            </p>
            {phraseLastMatched && (
              <p className="text-center font-serif text-xs italic mb-3" style={{ color: C.accent }}>
                "{phraseLastMatched.phrase}" — {phraseLastMatched.literal}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                {phraseLeft.map((p) => {
                  const isMatched = phraseMatched.includes(p.phrase);
                  const isSelected = phrasePending.left === p.phrase;
                  return (
                    <button key={p.phrase} disabled={isMatched} onClick={() => selectPhraseTile("left", p.phrase)} className={`text-left px-3 py-2.5 rounded-md text-sm font-serif transition-all ${isSelected && phraseWrongFlash ? "shake" : ""}`} style={{ backgroundColor: isMatched ? "transparent" : isSelected ? C.gold : C.card, color: isMatched ? C.line : isSelected ? C.onGold : C.ink, border: `1px solid ${isMatched ? C.line : isSelected ? C.gold : C.line}`, opacity: isMatched ? 0.4 : 1 }}>
                      {p.phrase}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                {phraseRight.map((p) => {
                  const isMatched = phraseMatched.includes(p.phrase);
                  const isSelected = phrasePending.right === p.phrase;
                  return (
                    <button key={p.phrase + "-e"} disabled={isMatched} onClick={() => selectPhraseTile("right", p.phrase)} className={`text-left px-3 py-2.5 rounded-md text-sm font-serif transition-all ${isSelected && phraseWrongFlash ? "shake" : ""}`} style={{ backgroundColor: isMatched ? "transparent" : isSelected ? C.gold : C.card, color: isMatched ? C.line : isSelected ? C.onGold : C.ink, border: `1px solid ${isMatched ? C.line : isSelected ? C.gold : C.line}`, opacity: isMatched ? 0.4 : 1 }}>
                      {p.meaning}
                    </button>
                  );
                })}
              </div>
            </div>
            {phraseMatched.length === phraseLeft.length && (
              <button onClick={() => setScreen("phraseDone")} className="w-full mt-6 py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                See Full List <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* ============================ PHRASE: DONE ============================ */}
        {screen === "phraseDone" && (
          <div>
            <div className="rounded-lg p-6 text-center mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>All matched — {phraseLevel} idioms</div>
              <div className="font-type text-3xl" style={{ color: C.ink }}>{PHRASES[lang][phraseLevel].length}/{PHRASES[lang][phraseLevel].length}</div>
            </div>

            <div className="rounded-lg p-5 mb-5 flex flex-col gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              {PHRASES[lang][phraseLevel].map((p) => (
                <div key={p.phrase} className="pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div className="text-sm font-serif font-semibold" style={{ color: C.ink }}>{p.phrase}</div>
                  <div className="text-sm font-serif" style={{ color: C.green }}>{p.meaning}</div>
                  <div className="text-xs font-serif italic" style={{ color: C.muted }}>{p.literal}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => setScreen("phraseSelect")} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                <Quote size={17} /> Try Another Level
              </button>
              <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Home size={15} /> Home
              </button>
            </div>
          </div>
        )}

        {/* ============================ LEARN ============================ */}
        {screen === "learn" && currentBatch.length > 0 && (
          <div>
            <div className="text-center text-sm font-semibold mb-3 flex items-center justify-center gap-2" style={{ color: C.muted }}>
              {mode === "theme" && ActiveIcon && <ActiveIcon size={15} style={{ color: C.accent }} />}
              {mode === "mine" && <Sparkles size={15} style={{ color: C.accent }} />}
              {mode === "theme"
                ? <span>{lang.toUpperCase()} · {level} · {activeTheme?.topic} · Card {learnIdx + 1}/{currentBatch.length}</span>
                : <span>{lang.toUpperCase()} · {mode === "mine" ? "My Words" : level} · Batch {batchIndex + 1}/{totalBatches} · Card {learnIdx + 1}/{currentBatch.length}</span>}
            </div>
            {lang === "de" && <div className="mb-4"><GenderLegend /></div>}

            <div onClick={() => setFlipped((f) => !f)} className="rounded-lg p-8 min-h-[280px] flex flex-col items-center justify-center text-center cursor-pointer select-none" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}>
              {/* The picture sits above the word, so meaning lands before the
                  card is flipped. Absent for most of B1 upward — the layout
                  simply closes up rather than reserving an empty slot. */}
              {imageFor(currentBatch[learnIdx]) && (
                <div className="mb-4 flex items-center justify-center" style={{ height: 104 }}>
                  <WordImage word={currentBatch[learnIdx]} size={104} />
                </div>
              )}
              <div className="font-type text-4xl mb-2 flex items-baseline gap-2" style={{ color: C.ink }}>
                {lang === "de" && currentBatch[learnIdx].g && <GenderTag g={currentBatch[learnIdx].g} size="lg" />}
                {lang === "fr" && <ArticleTag w={currentBatch[learnIdx]} size="lg" />}
                {currentBatch[learnIdx].t}
                <RektionTag w={currentBatch[learnIdx]} />
                <FreqTag lang={lang} word={currentBatch[learnIdx].t} />
              </div>
              {currentBatch[learnIdx].alt && (
                <div className="font-serif italic text-sm" style={{ color: C.muted }}>or {currentBatch[learnIdx].alt}</div>
              )}
              {!flipped && <p className="font-serif text-sm mt-4" style={{ color: C.muted }}>Tap to reveal the meaning</p>}
              {flipped && (
                <div className="mt-3">
                  <div className="text-lg font-semibold mb-3" style={{ color: C.green }}>{currentBatch[learnIdx].e}</div>
                  {currentBatch[learnIdx].n && (
                    <div className="font-serif italic text-sm mb-2 px-3 py-1.5 rounded-md inline-block" style={{ color: C.ink, backgroundColor: C.paper }}>
                      {currentBatch[learnIdx].n}
                    </div>
                  )}
                  <div className="font-serif italic text-base mb-1" style={{ color: C.ink }}>{currentBatch[learnIdx].s}</div>
                  <div className="font-serif text-sm mb-1" style={{ color: C.muted }}>{currentBatch[learnIdx].se}</div>
                  {audioReady && (
                    <button onClick={(e) => { e.stopPropagation(); say(currentBatch[learnIdx].s || currentBatch[learnIdx].t); }} className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                      <Volume2 size={15} /> Hear it
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-5">
              <button onClick={() => { setLearnIdx((i) => Math.max(0, i - 1)); setFlipped(false); }} disabled={learnIdx === 0} className="p-2 rounded-md disabled:opacity-30" style={{ border: `1px solid ${C.line}` }} aria-label="Previous card"><ChevronLeft size={18} /></button>
              <div className="flex gap-1 flex-wrap justify-center max-w-[60%]">
                {currentBatch.map((_, i) => (<div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === learnIdx ? C.gold : C.line }} />))}
              </div>
              {learnIdx + 1 < currentBatch.length ? (
                <button onClick={() => { setLearnIdx((i) => Math.min(i + 1, currentBatch.length - 1)); setFlipped(false); }} className="p-2 rounded-md" style={{ border: `1px solid ${C.line}` }} aria-label="Next card"><ChevronRight size={18} /></button>
              ) : (
                <button onClick={goToMatching} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.ink, color: C.card }}><Shuffle size={15} /> Match</button>
              )}
            </div>
          </div>
        )}

        {/* ============================ MATCHING ============================ */}
        {screen === "matching" && (
          <div>
            <p className="text-center font-serif text-sm mb-4" style={{ color: C.muted }}>Match each word to its meaning. {matchedIds.length}/{currentBatch.length} matched.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                {leftItems.map((w) => {
                  const isMatched = matchedIds.includes(w.t);
                  const isSelected = pending.left === w.t;
                  return (
                    <button key={w.t} disabled={isMatched} onClick={() => selectTile("left", w.t)} className={`text-left px-3 py-2.5 rounded-md text-sm transition-all ${isSelected && wrongFlash ? "shake" : ""}`} style={{ backgroundColor: isMatched ? "transparent" : isSelected ? C.gold : C.card, color: isMatched ? C.line : isSelected ? C.onGold : C.ink, border: `1px solid ${isMatched ? C.line : isSelected ? C.gold : C.line}`, opacity: isMatched ? 0.4 : 1 }}>
                      {lang === "de" && w.g && <><GenderTag g={w.g} /> </>}
                      {lang === "fr" && w.art && <><ArticleTag w={w} /> </>}
                      <span className="font-type">{w.t}</span>
                      {w.rek && <> <RektionTag w={w} /></>}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                {rightItems.map((w) => {
                  const isMatched = matchedIds.includes(w.t);
                  const isSelected = pending.right === w.t;
                  return (
                    <button key={w.t + "-e"} disabled={isMatched} onClick={() => selectTile("right", w.t)} className={`text-left px-3 py-2.5 rounded-md text-sm font-serif transition-all ${isSelected && wrongFlash ? "shake" : ""}`} style={{ backgroundColor: isMatched ? "transparent" : isSelected ? C.gold : C.card, color: isMatched ? C.line : isSelected ? C.onGold : C.ink, border: `1px solid ${isMatched ? C.line : isSelected ? C.gold : C.line}`, opacity: isMatched ? 0.4 : 1 }}>
                      {w.e}
                    </button>
                  );
                })}
              </div>
            </div>
            {matchedIds.length === currentBatch.length && (
              <button onClick={() => goToChoose()} className="w-full mt-6 py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>Continue <ArrowRight size={18} /></button>
            )}
          </div>
        )}

        {/* ============================ CHOOSE (multiple choice) ============================ */}
        {screen === "choose" && chooseItem && chooseOpts && (
          <div>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>{chooseRetired}/{chooseTotal} cleared</span>
                {chooseStreak >= 3 && (
                  <span className="inline-flex items-center gap-1" style={{ color: C.accent }}>
                    <Flame size={12} /> {chooseStreak} in a row
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(chooseRetired / chooseTotal) * 100}%`, backgroundColor: C.green }} />
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>
                {chooseOpts.genderMode
                  ? "Which article?"
                  : chooseImages ? "Select the correct image"
                  : chooseItem.kind === "toTarget" ? `Choose the ${LANG_INFO[lang].name}`
                  : chooseItem.kind === "toEnglish" ? "Choose the English"
                  : "Choose the missing word"}
              </div>

              {chooseItem.kind === "toTarget" && (
                <div className="text-xl font-serif mb-5">{chooseItem.word.e}</div>
              )}
              {chooseItem.kind === "toEnglish" && (
                <div className="mb-5 flex items-center gap-3">
                  {/* On a picture question the word is the whole prompt, so it
                      carries the audio control rather than hiding it below. */}
                  {chooseImages && audioReady && (
                    <button
                      onClick={() => say(chooseItem.word.t)}
                      className="shrink-0 p-2.5 rounded-full"
                      style={{ backgroundColor: C.ink, color: C.card }}
                      aria-label={`Hear ${chooseItem.word.t}`}
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                  <div className={`font-type flex items-baseline gap-2 ${chooseImages ? "text-3xl" : "text-2xl"}`}>
                    {lang === "de" && chooseItem.word.g && <GenderTag g={chooseItem.word.g} size="lg" />}
                    {lang === "fr" && <ArticleTag w={chooseItem.word} size="lg" />}
                    {chooseItem.word.t}
                    <RektionTag w={chooseItem.word} />
                  </div>
                </div>
              )}
              {chooseItem.kind === "fillBlank" && (
                <>
                  <div className="font-serif text-lg mb-2">{chooseItem.word.b}</div>
                  <div className="font-serif italic text-sm mb-5" style={{ color: C.muted }}>{chooseItem.word.se}</div>
                </>
              )}

              {chooseImages ? (
                /* Picture grid. The selected tile lifts and thickens its border
                   rather than filling with colour — a solid green wash behind a
                   drawing makes the drawing unreadable at the moment you most
                   want to look at it. */
                <div className="grid grid-cols-2 gap-3">
                  {chooseOpts.options.map((opt, i) => {
                    const isCorrect = normalize(opt) === normalize(chooseOpts.correct);
                    const isPicked = opt === choosePicked;
                    let border = C.line, ring = "transparent", lift = 0;
                    if (choosePicked) {
                      if (isCorrect) { border = C.green; ring = C.green; lift = 2; }
                      else if (isPicked) { border = C.red; ring = C.red; }
                    }
                    return (
                      <button
                        key={opt}
                        onClick={() => pickChoice(opt)}
                        disabled={!!choosePicked}
                        className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
                        style={{
                          backgroundColor: C.card,
                          border: `2px solid ${border}`,
                          boxShadow: `0 ${4 - lift}px 0 ${ring === "transparent" ? C.line : ring}`,
                          transform: lift ? "translateY(2px)" : "none",
                        }}
                      >
                        <span className="flex items-center justify-center relative w-full" style={{ height: 76 }}>
                          {hasKeys && <span className="absolute left-0 top-0"><KeyCap n={i + 1} /></span>}
                          <WordImage word={{ e: opt }} size={72} />
                        </span>
                        <span className="font-serif text-sm text-center" style={{ color: C.ink }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {chooseOpts.options.map((opt, i) => {
                    const isCorrect = normalize(opt) === normalize(chooseOpts.correct);
                    const isPicked = opt === choosePicked;
                    let bg = C.paper, border = C.line, color = C.ink;
                    if (choosePicked) {
                      if (isCorrect) { bg = C.green; border = C.green; color = C.card; }
                      else if (isPicked) { bg = C.red; border = C.red; color = C.card; }
                    }
                    const filled = choosePicked && (isCorrect || isPicked);
                    return (
                      <button
                        key={opt}
                        onClick={() => pickChoice(opt)}
                        disabled={!!choosePicked}
                        className="px-4 py-3 rounded-md text-left font-serif text-base transition-colors flex items-center gap-2.5"
                        style={{ backgroundColor: bg, border: `1px solid ${border}`, color }}
                      >
                        {hasKeys && <KeyCap n={i + 1} tone={filled ? "card" : "ink"} />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {choosePicked && (
                <>
                <AnswerGloss w={chooseItem.word} kind={chooseOpts.genderMode ? "toTarget" : chooseItem.kind} lang={lang} />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: normalize(choosePicked) === normalize(chooseOpts.correct) ? C.green : C.red }}>
                    {normalize(choosePicked) === normalize(chooseOpts.correct) ? <><Check size={16} /> Correct</> : <><X size={16} /> Comes back later</>}
                  </div>
                  <div className="flex items-center gap-2">
                    {audioReady && (
                      <button onClick={() => say(chooseItem.word.t)} className="p-2 rounded-full" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }} aria-label="Hear word">
                        <Volume2 size={15} />
                      </button>
                    )}
                    <button onClick={continueChoose} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                      Continue {hasKeys ? <KeyCap n="↵" /> : <ArrowRight size={15} />}
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>

            <button onClick={() => goToPractice(sessionListRef.current, { keepSession: true })} className="w-full mt-4 py-2 text-xs font-semibold" style={{ color: C.muted }}>
              Skip ahead to typing
            </button>
          </div>
        )}

        {/* ============================ PRACTICE (SRS) ============================ */}
        {screen === "practice" && currentQ && (
          <div>
            {currentQ.supported&&<p className="vd-notice">Supported practice after seeing the model. Return after a gap for an independent review.</p>}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>{retired}/{totalItems} mastered</span>
                <span>{attempts} answered</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(retired / totalItems) * 100}%`, backgroundColor: C.green }} />
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.ink}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>
                  {currentQ.kind === "toTarget" && `Translate to ${LANG_INFO[lang].name}`}
                  {currentQ.kind === "toEnglish" && "Translate to English"}
                  {currentQ.kind === "fillBlank" && "Fill in the missing word"}
                </div>
                {isReview && (<span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.paper, color: C.red, border: `1px solid ${C.red}` }}><Repeat size={11} /> review</span>)}
              </div>

              {currentQ.kind === "toTarget" && (
                <>
                  <div className="text-xl font-serif mb-1">{currentQ.word.e}</div>
                  {lang === "de" && currentQ.word.g && (<div className="text-xs font-serif mb-3" style={{ color: C.muted }}>tip: include der/die/das</div>)}
                  {!(lang === "de" && currentQ.word.g) && <div className="mb-3" />}
                </>
              )}
              {currentQ.kind === "toEnglish" && (
                <div className="font-type text-2xl mb-4 flex items-baseline gap-2">
                  {lang === "de" && currentQ.word.g && <GenderTag g={currentQ.word.g} size="lg" />}
                  {lang === "fr" && <ArticleTag w={currentQ.word} size="lg" />}
                  {currentQ.word.t}
                  <RektionTag w={currentQ.word} />
                </div>
              )}
              {currentQ.kind === "fillBlank" && (
                <>
                  <div className="font-serif text-lg mb-2">{currentQ.word.b}</div>
                  <div className="font-serif italic text-sm mb-4" style={{ color: C.muted }}>{currentQ.word.se}</div>
                </>
              )}

              <input ref={inputRef} type="text" value={inputVal} disabled={!!feedback} onChange={(e) => { setInputVal(e.target.value); if (blankNudge) setBlankNudge(false); }} onKeyDown={handleInputKeyDown} placeholder="Type your answer" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} className="w-full px-3 py-2.5 rounded-md font-serif text-base" style={{ backgroundColor: C.paper, border: `1px solid ${feedback ? (feedback.correct ? C.green : C.red) : C.line}`, color: C.ink }} />

              {retryMode && !feedback && (
                <div className="mt-3 text-xs font-serif" style={{ color: C.accent }}>From memory — type it again.</div>
              )}
              {blankNudge && !feedback && (
                <div className="mt-3 text-xs font-serif" style={{ color: C.red }}>Type an answer first — nothing was marked.</div>
              )}

              {feedback && (
                <div className="mt-3">
                  <div className="stamp flex items-center gap-2 font-semibold" style={{ color: feedback.correct ? C.green : C.red }}>
                    {feedback.correct ? <Check size={18} /> : <X size={18} />}
                    {feedback.correct
                      ? (feedback.retry ? "That's it — it'll come round again" : "Correct")
                      : <span className="flex items-center gap-1">Answer: {renderCorrectAnswer(currentQ)}</span>}
                  </div>
                  <AnswerGloss w={currentQ.word} kind={currentQ.kind} lang={lang} />
                </div>
              )}

              <div className="flex justify-between items-center mt-5">
                {audioReady ? (
                  <button onClick={() => say(currentQ.word.t)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}><Volume2 size={15} /> Hear word</button>
                ) : <span />}
                {!feedback ? (
                  <button onClick={handleCheck} className="px-5 py-2 rounded-md font-semibold text-sm" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
                ) : !feedback.correct && !feedback.retry ? (
                  <button onClick={retryQuestion} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.ink, color: C.card }}>
                    <RotateCcw size={15} /> Try it again {hasKeys && <KeyCap n="↵" tone="card" />}
                  </button>
                ) : (
                  <button onClick={handleContinue} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>Continue {hasKeys ? <KeyCap n="↵" /> : <ArrowRight size={15} />}</button>
                )}
              </div>
            </div>
            {feedback && !(feedback.correct && !feedback.retry) && (<p className="text-center text-xs font-serif mt-3" style={{ color: C.muted }}>This card will come back again before the round ends.</p>)}
          </div>
        )}

        {/* ==================== SENTENCE CONSTRUCTIONS ==================== */}
        {screen === "sentcSetup" && (
          <div>
            <div className="text-center mb-5">
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>Sentence Constructions</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                Pick a tense and the verbs, then build the sentence from its words.
              </p>
            </div>

            {/* The difficulty ladder. Each rung is a specific thing word order
              * does, not simply more words — and in three of the five, French
              * and German do it differently, which is the reason to drag tiles
              * rather than read a rule. */}
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: C.muted }}>Difficulty</div>
              <div className="flex flex-col gap-1.5">
                {SENTENCE_SHAPES.map((sh, i) => {
                  const active = sentcShape === sh.id;
                  return (
                    <button key={sh.id} onClick={() => setSentcShape(sh.id)}
                      className="px-3 py-2 rounded-md text-left flex items-baseline gap-2"
                      style={{ backgroundColor: active ? TINT : C.paper, border: `1px solid ${active ? C.gold : C.line}` }}>
                      <span className="font-type text-xs" style={{ color: C.muted, minWidth: 14 }}>{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold" style={{ color: C.ink }}>{sh.label}</span>
                        <span className="block text-xs font-serif" style={{ color: C.muted }}>{sh.blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: C.muted }}>Tense</div>
              <div className="grid grid-cols-2 gap-1.5">
                {sentcTenseSet.map((t) => {
                  const on = sentcTense === t.key;
                  return (
                    <button key={t.key} onClick={() => setSentcTense(t.key)} className="text-left px-2.5 py-2 rounded-md"
                      style={{ backgroundColor: on ? C.gold : C.paper, border: `1px solid ${on ? C.gold : C.line}` }}>
                      <span className="block text-sm font-semibold" style={{ color: C.ink }}>{t.label}</span>
                      <span className="block text-[0.625rem] font-serif italic truncate" style={{ color: on ? C.ink : C.muted }}>{t.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { key: "random", label: "Random", hint: `all ${sentcVerbSet.length}` },
                { key: "single", label: "One verb", hint: "focused" },
                { key: "multi", label: "Several", hint: "pick a set" },
              ].map((m) => (
                <button key={m.key} onClick={() => { setSentcVerbMode(m.key); setSentcPicked([]); }}
                  className="px-2 py-2.5 rounded-md text-center"
                  style={{ backgroundColor: sentcVerbMode === m.key ? C.ink : "transparent", color: sentcVerbMode === m.key ? C.card : C.ink, border: `1px solid ${C.ink}` }}>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-[0.625rem] font-serif italic opacity-80">{m.hint}</div>
                </button>
              ))}
            </div>

            {sentcVerbMode !== "random" && (
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                    {sentcVerbMode === "single" ? "Choose one" : `${sentcPicked.length} selected`}
                  </span>
                  {sentcVerbMode === "multi" && sentcPicked.length > 0 && (
                    <button onClick={() => setSentcPicked([])} className="text-xs font-semibold" style={{ color: C.accent }}>Clear</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {sentcVerbSet.map((v) => {
                    const on = sentcPicked.includes(v.inf);
                    return (
                      <button key={v.inf}
                        onClick={() => setSentcPicked(sentcVerbMode === "single" ? [v.inf] : (sentcPicked.includes(v.inf) ? sentcPicked.filter((x) => x !== v.inf) : [...sentcPicked, v.inf]))}
                        className="text-left px-2.5 py-2 rounded-md flex items-center gap-1.5"
                        style={{ backgroundColor: on ? C.gold : C.paper, border: `1px solid ${on ? C.gold : C.line}` }}>
                        {on && <Check size={13} style={{ color: C.ink, flexShrink: 0 }} />}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold truncate" style={{ color: C.ink }}>{v.inf}</span>
                          <span className="block text-[0.625rem] font-serif italic truncate" style={{ color: on ? C.ink : C.muted }}>{v.en}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={prepareSentcRound}
              disabled={!sentcTense || (sentcVerbMode !== "random" && !sentcPicked.length)}
              className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 mb-2 disabled:opacity-50"
              style={{ backgroundColor: !sentcTense || (sentcVerbMode !== "random" && !sentcPicked.length) ? C.line : C.gold, color: C.ink }}>
              Next <ArrowRight size={17} />
            </button>
            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        )}

        {/* The refresher list — the words that will be needed, before they are. */}
        {screen === "sentcWords" && (
          <div>
            <div className="text-center mb-4">
              <div className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.muted }}>{sentcTenseLabel}</div>
              <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>These words come up</div>
              <p className="font-serif italic text-sm" style={{ color: C.muted }}>
                One of them appears in every sentence you build. A quick look first.
              </p>
            </div>

            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="grid grid-cols-2 gap-1.5">
                {sentcNouns.map((word) => (
                  <div key={word.t} className="flex items-center gap-2 px-2.5 py-2 rounded-md" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}` }}>
                    <WordImage word={word} size={26} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold truncate" style={{ color: lang === "de" && word.g ? GENDER[word.g] : C.ink }}>
                        {lang === "de" && word.g ? `${word.g} ` : ""}{word.t}
                      </span>
                      <span className="block text-[0.625rem] font-serif italic truncate" style={{ color: C.muted }}>{word.e}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startSentcRun} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 mb-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
              Start building <ArrowRight size={17} />
            </button>
            <button onClick={() => setScreen("sentcSetup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        )}

        {screen === "sentcBuild" && sentcItem && (
          <div>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>{sentcIdx + 1}/{sentcRound.length}</span>
                <span>{sentcTenseLabel}</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(sentcIdx / sentcRound.length) * 100}%`, backgroundColor: C.green }} />
              </div>
            </div>

            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Translate this sentence</div>
              <div className="font-serif text-lg mb-1" style={{ color: C.ink }}>{sentcItem.english}</div>
              <div className="text-xs font-serif italic" style={{ color: C.muted }}>
                using <span className="font-type" style={{ color: C.ink }}>{sentcItem.verb.inf}</span> — {sentcItem.verb.en}
              </div>

              {/* The answer row. Tapping a tile here sends it back to the bank. */}
              <div className="mt-4 min-h-[3.5rem] flex flex-wrap gap-1.5 items-start pb-2" style={{ borderBottom: `2px solid ${sentcResult ? (sentcResult.ok ? C.green : C.red) : C.line}` }}>
                {sentcPlaced.map((t, i) => {
                  /* Once checked the tiles stop being controls, so tapping one
                   * shows what it means instead of pulling it back out. */
                  const text = i === 0 ? t.tok.charAt(0).toUpperCase() + t.tok.slice(1) : t.tok;
                  const wrong = sentcResult && !sentcResult.ok && normalize(t.tok) !== normalize(sentcItem.tokens[i] || "");
                  const tile = (
                    <span className="px-2.5 py-1.5 rounded-md font-serif text-base inline-block"
                      style={{
                        backgroundColor: C.paper,
                        border: `1px solid ${wrong ? C.red : C.line}`,
                        color: wrong ? C.red : C.ink,
                        textDecoration: wrong ? "underline" : "none",
                      }}>
                      {text}
                    </span>
                  );
                  return sentcResult ? (
                    <Glossed key={t.id} gloss={t.gloss} word={t.tok}>{tile}</Glossed>
                  ) : (
                    <button key={t.id} onClick={() => unplaceTile(t)} className="p-0 border-0 bg-transparent">{tile}</button>
                  );
                })}
                {!sentcPlaced.length && (
                  <span className="font-serif italic text-sm" style={{ color: C.muted }}>
                    {hasKeys ? "Tap the words below, or type their first letters." : "Tap the words below, in order."}
                  </span>
                )}
              </div>

              {/* The bank. Typing a tile's opening letters places it; the
                * letters that still fit more than one tile are marked on each,
                * so it is clear why one was not enough. */}
              {hasKeys && !sentcResult && (
                <div className="flex items-baseline gap-2 mt-4">
                  {sentcTyped && (
                    <span className="font-type text-sm" style={{ color: C.green }}>{sentcTyped}</span>
                  )}
                  <span className="font-serif text-xs" style={{ color: sentcTypeMiss ? C.red : C.muted }}>
                    {sentcTypeMiss
                      ? (sentcTyped ? "no word here carries on that way" : "no word left starts with that")
                      : sentcTyped
                        ? `${sentcMatches.length} words — keep typing, or space for the first`
                        : "type a word's first letters"}
                  </span>
                </div>
              )}
              <div className={`flex flex-wrap gap-1.5 ${hasKeys && !sentcResult ? "mt-1.5" : "mt-4"}`}>
                {sentcBank.map((t, i) => {
                  const reach = sentcReach.get(i) ?? 0;
                  const running = sentcTyped && reach > 0;
                  const dim = sentcTyped && !running;
                  return (
                    <button key={t.id} onClick={() => placeTile(t)} disabled={!!sentcResult}
                      /* The gloss waits for the answer. Hovering a bank tile
                       * used to say "the — masculine", which hands over the
                       * gender decision that choosing between le and la *is*
                       * the exercise. Afterwards it is help; before, it is the
                       * answer. Leftover tiles keep it so a wrong attempt can
                       * still be read back. */
                      title={sentcResult ? t.gloss : undefined}
                      className="px-2.5 py-1.5 rounded-md font-serif text-base"
                      style={{
                        backgroundColor: C.card,
                        border: `1px solid ${running ? C.green : C.ink}`,
                        color: C.ink,
                        opacity: dim ? 0.4 : 1,
                      }}>
                      {running ? (
                        <>
                          <span style={{ color: C.green, fontWeight: 600 }}>{t.tok.slice(0, reach)}</span>
                          {t.tok.slice(reach)}
                        </>
                      ) : t.tok}
                    </button>
                  );
                })}
              </div>

              {sentcResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: sentcResult.ok ? C.green : C.red }}>
                    {sentcResult.ok ? <Check size={16} /> : <X size={16} />}
                    {sentcResult.ok ? (sentcResult.alt ? "Also correct — another good order" : "Exactly right") : "Not quite"}
                  </div>
                  <div className="text-[0.6875rem] font-serif italic mb-2" style={{ color: C.muted }}>
                    Tap or hover any word to see what it means.
                  </div>
                  {!sentcResult.ok && (
                    <div className="font-serif text-base flex flex-wrap gap-x-1.5 gap-y-1" style={{ color: C.ink }}>
                      {sentcItem.tokens.map((tok, i) => (
                        <Glossed key={i} gloss={sentcItem.glosses[i]} style={{ color: C.ink }}>
                          {i === 0 ? tok.charAt(0).toUpperCase() + tok.slice(1) : tok}{i === sentcItem.tokens.length - 1 ? "." : ""}
                        </Glossed>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-5">
                {audioReady ? (
                  <button onClick={() => say(sentcItem.display)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                    <Volume2 size={15} /> Hear it
                  </button>
                ) : <span />}
                {!sentcResult ? (
                  <button onClick={checkSentc} disabled={!sentcPlaced.length} className="px-5 py-2 rounded-md font-semibold text-sm disabled:opacity-40 flex items-center gap-1.5" style={{ backgroundColor: C.ink, color: C.card }}>
                    Check {hasKeys && <KeyCap n="↵" tone="card" />}
                  </button>
                ) : (
                  <button onClick={nextSentc} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    {sentcIdx + 1 < sentcRound.length ? "Next" : "See results"}
                    {hasKeys ? <KeyCap n="↵" /> : <ArrowRight size={15} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {screen === "sentcDone" && (
          <div className="text-center">
            <div className="font-type text-2xl mb-1" style={{ color: C.ink }}>{sentcRight}/{sentcRound.length} built</div>
            <p className="font-serif italic text-sm mb-5" style={{ color: C.muted }}>{sentcTenseLabel}</p>
            <button onClick={prepareSentcRound} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 mb-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
              <RotateCcw size={17} /> Another round
            </button>
            <button onClick={() => setScreen("sentcSetup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 mb-2" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Settings2 size={15} /> Change tense or verbs
            </button>
            <button onClick={() => setScreen("setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronLeft size={15} /> Home
            </button>
          </div>
        )}

        {/* ============================ SENTENCE ============================ */}
        {screen === "sentence" && sentItem && (
          <div>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
                <span>{sentRetired}/{sentTotal} done</span>
                {sentQueue.length > sentTotal - sentRetired && <span style={{ color: C.accent }}>{sentQueue.length - (sentTotal - sentRetired)} to revisit</span>}
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: C.line }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(sentRetired / Math.max(1, sentTotal)) * 100}%`, backgroundColor: C.green }} />
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.gold}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>
                Write the whole sentence
              </div>

              <div className="font-serif text-lg mb-1" style={{ color: C.ink }}>{sentItem.word.se}</div>
              <div className="text-xs font-serif italic mb-4" style={{ color: C.muted }}>
                using <span className="font-type" style={{ color: C.ink }}>{sentItem.word.t}</span> — {sentItem.word.e}
              </div>

              <input
                ref={sentInputRef} type="text" value={sentInput} disabled={!!sentResult}
                onChange={(e) => { setSentInput(e.target.value); if (blankNudge) setBlankNudge(false); }}
                onKeyDown={(e) => { if (e.key !== "Enter") return; if (!sentResult) checkSentence(); else if (!sentResult.ok && !sentResult.retry) retrySentence(); else nextSentence(); }}
                placeholder={lang === "fr" ? "Écrivez la phrase…" : "Schreiben Sie den Satz…"}
                autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                className="w-full px-3 py-2.5 rounded-md font-serif text-base"
                style={{ backgroundColor: C.paper, border: `1px solid ${sentResult ? (sentResult.ok ? C.green : C.red) : C.line}`, color: C.ink }}
              />

              {sentRetry && !sentResult && (
                <div className="mt-3 text-xs font-serif" style={{ color: C.accent }}>From memory — write it again.</div>
              )}
              {blankNudge && !sentResult && (
                <div className="mt-3 text-xs font-serif" style={{ color: C.red }}>Write the sentence first — nothing was marked.</div>
              )}

              {sentResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: sentResult.ok ? C.green : C.red }}>
                    {sentResult.ok ? <Check size={16} /> : <X size={16} />}
                    {sentResult.ok
                      ? sentResult.retry ? "That is it — it will come round again"
                        : sentResult.slips.length ? "Right — with a couple of details" : "Exactly right"
                      : "Not quite"}
                  </div>

                  {/* Which words were missed, when it wasn't right. */}
                  {!sentResult.ok && (
                    <div className="font-serif text-base mb-2 flex flex-wrap gap-x-1.5" style={{ color: C.ink }}>
                      {sentResult.diff.map((d, i) => (
                        <Glossed
                          key={i}
                          gloss={describeWord(dictionary, d.tok)}
                          underline={!d.ok}
                          style={{ color: d.ok ? C.green : C.red }}
                        >
                          {d.tok}
                        </Glossed>
                      ))}
                    </div>
                  )}

                  <div className="font-serif text-base" style={{ color: C.ink }}>
                    <GlossedSentence text={sentItem.word.s} dict={dictionary} />
                  </div>
                  <div className="font-serif text-sm" style={{ color: C.muted }}>{sentItem.word.se}</div>
                  <div className="text-[0.6875rem] font-serif italic mt-1" style={{ color: C.muted }}>
                    Tap or hover any word to see what it means.
                  </div>

                  {/* Accents and capitals never fail the answer — they're flagged here. */}
                  {sentResult.slips.length > 0 && (
                    <div className="mt-3 rounded-md px-3 py-2 text-sm font-serif" style={{ backgroundColor: C.paper, border: `1px solid ${C.gold}`, color: C.ink }}>
                      {sentResult.slips.map((s, i) => (
                        <div key={i}>{SLIP_TEXT[s.kind]}: <span className="font-type">{s.word}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-5">
                {audioReady ? (
                  <button onClick={() => say(sentItem.word.s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                    <Volume2 size={15} /> Hear it
                  </button>
                ) : <span />}
                {!sentResult ? (
                  <button onClick={checkSentence} disabled={!sentInput.trim()} className="px-5 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.ink, color: C.card }}>Check</button>
                ) : !sentResult.ok && !sentResult.retry ? (
                  <button onClick={retrySentence} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.ink, color: C.card }}>
                    <RotateCcw size={15} /> Try it again {hasKeys && <KeyCap n="↵" tone="card" />}
                  </button>
                ) : (
                  <button onClick={nextSentence} className="px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.onGold }}>
                    {sentQueue.length > 1 || !(sentResult.ok && !sentResult.retry) ? "Next" : "See results"}
                    {hasKeys ? <KeyCap n="↵" /> : <ArrowRight size={15} />}
                  </button>
                )}
              </div>
            </div>

            <button onClick={() => { commitSession(); setScreen("summary"); }} className="w-full mt-4 py-2 text-xs font-semibold" style={{ color: C.muted }}>
              Skip to results
            </button>
          </div>
        )}

        {/* ============================ SUMMARY ============================ */}
        {screen === "summary" && (
          <div>
            <div className="rounded-lg p-6 text-center mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Round complete — all cards mastered</div>
              <div className="font-type text-4xl mb-1" style={{ color: C.ink }}>{totalItems > 0 ? Math.round((firstTryCorrect / totalItems) * 100) : 0}%</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>first-try accuracy · {firstTryCorrect}/{totalItems} right on the first attempt · {attempts} total answers</div>
            </div>

            {missedWords.length > 0 && (
              <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Needed extra practice ({missedWords.length})</div>
                <div className="flex flex-col gap-2">
                  {missedWords.map(({ word: w }) => (
                    <div key={w.t} className="flex justify-between text-sm font-serif items-baseline">
                      <span className="font-type flex items-baseline gap-1.5" style={{ color: C.ink }}>{lang === "de" && w.g && <GenderTag g={w.g} />}{lang === "fr" && <ArticleTag w={w} />}{w.t}{w.rek && <> <RektionTag w={w} /></>}</span>
                      <span style={{ color: C.muted }}>{w.e}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => goToPractice(missedWords)} className="w-full mt-4 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: C.red, color: C.card }}><RotateCcw size={15} /> Practice These Again</button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button onClick={nextAfterSummary} className="w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
                {mode === "theme"
                  ? (themeIdx + 1 < totalThemes ? <>Next Drawer ({themeIdx + 2}/{totalThemes}) <ArrowRight size={18} /></> : <>Finish Level <ArrowRight size={18} /></>)
                  : batchIndex + 1 < totalBatches ? <>Next Batch ({batchIndex + 2}/{totalBatches}) <ArrowRight size={18} /></>
                  : mode === "mine" ? <>Finish My Words <ArrowRight size={18} /></>
                  : <>Finish Level <ArrowRight size={18} /></>}
              </button>
              <button onClick={() => setScreen(mode === "mine" ? "wordsHub" : "setup")} className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}><Settings2 size={15} /> {mode === "mine" ? "Back to My Words" : "Change Settings"}</button>
            </div>
          </div>
        )}
    </>
  );

  if(readOnly)return <main style={{padding:24,maxWidth:700,margin:'auto'}}><GlobalStyles/><section className="vd-panel"><h1>Progress is open in another tab</h1><p>This tab is paused so two study sessions cannot overwrite each other. Close the other study tab, then reload this one. If this tab has unsaved work, export it before reloading.</p><div className="vd-toolbar"><button className="vd-button vd-primary" onClick={()=>location.reload()}>Reload this tab</button><button className="vd-button" onClick={exportProgress}>Export this tab’s progress</button></div></section></main>;
  if (isDesktop) {
    return (
      <DesktopShell
        activeSection={activeSection}
        onNavigate={navigateToSection}
        lang={lang}
        onLangChange={changeLanguage}
        level={level}
        badges={railBadges}
        storageOn={storageOn}
        theme={theme}
        onThemeChange={setTheme}
        typeScale={typeScale}
        onTypeScale={setTypeScale}
      >
        <ProgressStatus status={saveStatus} onRetry={retrySave} recovered={recovered}/>
        {screen === "grammarWorkbench" ? (
          <GrammarWorkbench
            verbs={verbSet.map((v) => ({ key: verbKey(v), verb: v }))}
            dueByVerb={conjDueByVerb}
            selectedVerb={wbVerb ? verbKey(wbVerb) : ""}
            onSelectVerb={pickWorkbenchVerb}
            tenses={tenseSet}
            tense={wbTenseKey}
            onSelectTense={(k) => { setWbTense(k); setWbResult(null); setWbInput(""); }}
            rows={wbRows}
            blankIdx={wbBlankSafe}
            input={wbInput}
            onInput={setWbInput}
            result={wbResult}
            onCheck={checkWorkbench}
            /* Reveal is a lookup, not an attempt: it neither grades nor counts,
             * so using it to read the table cannot inflate the session tally. */
            onReveal={() => setWbResult({ ok: false, revealed: true, note: `It is “${wbRows.find((r) => r.idx === wbBlankSafe)?.form}”.` })}
            onNext={nextWorkbenchCell}
            stats={wbStats}
            note={(() => {
              const tn = tenseSet.find((t) => t.key === wbTenseKey);
              return { gloss: wbVerb?.en, text: tn?.hint || "", form: tn?.form || "", noteTitle: tn?.note || null };
            })()}
            noteTitles={noteTitles}
            onOpenNote={openNote}
            drillScope={wbScopeSafe}
            onDrillScope={setWbDrillScope}
            scopeCounts={{
              tense: wbScopeTenses.tense.length,
              started: wbScopeTenses.started.length,
              all: wbScopeTenses.all.length,
              startedKeys: wbScopeTenses.started,
              availableKeys: wbScopeTenses.all,
            }}
            onDrillVerb={() => startConjSelection(
              wbScopeTenses[wbScopeSafe].map((k) => `${verbKey(wbVerb)}:${k}`),
            )}
            onOpenMatrix={() => setScreen("grammarHub")}
            onOpenNotes={() => { setGrammarIdx(null); setScreen("grammarNotes"); }}
            canSpeak={audioReady}
            /* Cumulative, not `i * fixed`: each form waits for the one before
             * it to finish, and they are not the same length. */
            onSay={() => {
              let at = 0;
              wbRows.forEach((r) => {
                setTimeout(() => say(r.spoken), at);
                at += speechGap(r.spoken);
              });
            }}
            onSayForm={(spoken) => say(spoken)}
            dueTotal={conjDueCount}
          />
        ) : screen === "etymology" ? (
          <EtymologyWorkbench
            view={etymView}
            onView={(v) => { setEtymView(v); endEtymQuiz(); }}
            families={FAMILIES}
            selectedFamily={etymFamily}
            onSelectFamily={selectEtymFamily}
            tree={etymTree}
            treeWords={etymWords}
            familyLaws={etymFamilyLaws}
            groups={etymGroups}
            selectedLaw={etymLaw}
            onSelectLaw={selectEtymLaw}
            quiz={etymQuiz}
            quizInput={etymInput}
            onQuizInput={setEtymInput}
            quizResult={etymResult}
            onQuizCheck={checkEtymQuiz}
            onQuizNext={nextEtymQuiz}
            onPractise={startEtymQuiz}
            onEndQuiz={endEtymQuiz}
            quizStats={etymStats}
            quizInputRef={etymInputRef}
            canSpeak={audioReady}
            /* Reading the examples aloud is only useful in the language the
             * device can actually pronounce, so it speaks the current one. */
            onSay={() => {
              let at = 0;
              (etymLawObj?.pairs || []).map((pr) => pr[lang]).filter((f) => f && f !== "—")
                .forEach((f) => { setTimeout(() => say(f), at); at += speechGap(f); });
            }}
            sayIn={sayIn}
            canSayIn={canSayIn}
            build={{
              lang,
              families: bldFamilies,
              selectedFamily: bldFamily,
              onSelectFamily: selectBldFamily,
              quiz: bldQuiz,
              picked: bldPicked,
              onPick: pickBldAnswer,
              onNextQuiz: nextBldQuiz,
              onPractise: startBldQuiz,
              onEndQuiz: endBldQuiz,
              quizStats: bldStats,
              openAffix: bldAffix,
              onOpenAffix: setBldAffix,
              onSay: (text) => sayIn(lang, text),
              canSpeak: canSayIn(lang),
            }}
          />
        ) : screen === "grammarHub" ? (
          <CoverageMatrix
            tenses={tenseSet}
            rows={conjMatrix}
            selected={conjPicked2}
            dueTotal={conjDueCount}
            langName={LANG_INFO[lang].name}
            onToggleCell={(vk, tk) => setConjPicked2((sel) => {
              const next = new Set(sel);
              const id = `${vk}:${tk}`;
              if (next.has(id)) next.delete(id); else next.add(id);
              return next;
            })}
            /* Row and column selects skip cells that do not exist, or the
             * modals would put "kann!" into the drill via the Imperativ
             * column. `startConjSelection` guards too; this keeps the count
             * shown on the button honest as well. */
            onToggleRow={(vk) => setConjPicked2((sel) => {
              const next = new Set(sel);
              const row = conjMatrix.find((r) => r.key === vk);
              const ids = (row?.cells || []).filter((c) => !c.absent).map((c) => `${vk}:${c.tenseKey}`);
              const all = ids.every((id) => next.has(id));
              ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
              return next;
            })}
            onToggleColumn={(tk) => setConjPicked2((sel) => {
              const next = new Set(sel);
              const ids = conjMatrix
                .filter((r) => !r.cells.find((c) => c.tenseKey === tk)?.absent)
                .map((r) => `${r.key}:${tk}`);
              const all = ids.every((id) => next.has(id));
              ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
              return next;
            })}
            onDrill={() => startConjSelection(conjPicked2)}
            onMixAll={() => startConjugation(null)}
          />
        ) : screen === "wordsReview" ? (
          <DiffReviewTable
            rows={verifyRows}
            decisions={decisions}
            setDecisions={setDecisions}
            lang={lang}
            onSave={saveReviewed}
            onBack={() => setScreen("wordsInput")}
            error={wordsError}
            busy={wordsBusy}
          />
        ) : (screen === "wordsHub" || screen === "wordsInput") ? (
          <MyWordsWorkspace
            langName={LANG_INFO[lang].name}
            rows={myWordRows}
            uncheckedCount={uncheckedWords.length}
            onStudy={startMine}
            onRecheck={() => recheckSaved(uncheckedWords)}
            busy={wordsBusy}
            pct={wordsPct}
            error={wordsError}
            onDelete={(r) => removeImportedWord(r.term)}
            addPanel={addWordsPanel}
          />
        ) : screen === "summary" ? (
          <SummaryTable
            title={mode === "theme" ? `${activeTheme?.topic ?? "Drawer"} — done` : "Batch done"}
            /* Derived from the same rows the table shows. The older
             * `firstTryCorrect` counts only the typing stage, so pairing it
             * with these rows produced a header reading "100% first try" above
             * a row marked as missed. */
            caption={(() => {
              const clean = summaryPreview.filter((r) => r.firstTry).length;
              const n = summaryPreview.length;
              return `${n > 0 ? Math.round((clean / n) * 100) : 0}% first try · ${n} ${n === 1 ? "word" : "words"} · ${attempts} answers`;
            })()}
            rows={summaryPreview}
            missCount={summaryPreview.filter((r) => !r.firstTry).length}
            onNext={nextAfterSummary}
            nextLabel={mode === "theme"
              ? (themeIdx + 1 < totalThemes ? `Next drawer (${themeIdx + 2}/${totalThemes})` : "Finish level")
              : batchIndex + 1 < totalBatches ? `Next batch (${batchIndex + 2}/${totalBatches})`
              : mode === "mine" ? "Finish My Words" : "Finish level"}
            onPractiseMisses={() => goToPractice(summaryPreview.filter((r) => !r.firstTry).map((r) => ({ word: r.word, level: r.level })))}
            onHome={() => setScreen(mode === "mine" ? "wordsHub" : "setup")}
            homeLabel={mode === "mine" ? "Back to My Words" : "Home"}
          />
        ) : (screen === "sentence" && sentItem) ? (
          <SentenceStage
            breadcrumb={mode === "theme"
              ? `${lang.toUpperCase()} · ${level} · ${activeTheme?.topic ?? ""}`
              : `${lang.toUpperCase()} · ${mode === "mine" ? "My Words" : level}`}
            streak={progress.streak || 0}
            retired={sentRetired}
            total={sentTotal}
            revisit={Math.max(0, sentQueue.length - (sentTotal - sentRetired))}
            english={sentItem.word.se}
            word={lang === "de" && sentItem.word.g ? `${sentItem.word.g} ${sentItem.word.t}` : sentItem.word.t}
            gloss={sentItem.word.e}
            meta={{
              langName: LANG_INFO[lang].name,
              line: `${sentItem.level} · ${activeTheme?.topic ?? "batch"}`,
              placeholder: lang === "fr" ? "Écrivez la phrase…" : "Schreiben Sie den Satz…",
            }}
            note={sentItem.word.n || null}
            mode={sentMode}
            onMode={(m) => { setSentMode(m); setSentPlaced([]); setSentTaken([]); setSentInput(""); setBlankNudge(false); }}
            bank={sentBankTokens}
            placed={sentPlaced}
            onPlace={placeSentChip}
            onUnplace={(i) => {
              setSentPlaced((ps) => ps.filter((_, j) => j !== i));
              setSentTaken((ts) => ts.filter((_, j) => j !== i));
            }}
            onClearPlaced={() => { setSentPlaced([]); setSentTaken([]); setSentTyped(""); setSentTypeMiss(false); }}
            typed={sentTyped}
            typeMiss={sentTypeMiss}
            typeCandidates={typeAhead(sentBankTokens, sentTyped).candidates}
            input={sentInput}
            onInput={(v) => { setSentInput(v); if (blankNudge) setBlankNudge(false); }}
            inputRef={sentInputRef}
            result={sentResult}
            blankNudge={blankNudge}
            retry={sentRetry}
            onCheck={() => checkSentence(sentMode === "chips" ? sentPlaced.join(" ") : undefined)}
            onRetry={retrySentence}
            onNext={nextSentence}
            /* Revealing is an admission, so it grades as a miss — the same
             * thing typing the wrong answer would do. */
            onReveal={revealSentence}
            onSkipToSummary={() => { commitSession(); setScreen("summary"); }}
            canSpeak={audioReady}
            onSay={() => say(sentItem.word.s)}
            onSayWord={() => say(sentItem.word.t)}
            stages={[
              { key: "learn", label: "learn", done: true },
              { key: "match", label: "match", done: true },
              { key: "choose", label: "choose", done: true },
              { key: "type", label: "type", done: true },
            ]}
            slipText={SLIP_TEXT}
            glossed={<GlossedSentence text={sentItem.word.s} dict={dictionary} />}
            diffGlossed={sentResult && !sentResult.ok ? (
              <div className="font-serif text-base mb-2 flex flex-wrap gap-x-1.5" style={{ color: C.ink }}>
                {sentResult.diff.map((d, i) => (
                  <Glossed key={i} gloss={describeWord(dictionary, d.tok)} underline={!d.ok} style={{ color: d.ok ? C.green : C.red }}>
                    {d.tok}
                  </Glossed>
                ))}
              </div>
            ) : null}
          />
        ) : STUDY_SCREENS.has(screen) ? (
          <>
            <StudyStageRail
              breadcrumb={mode === "theme"
                ? `${lang.toUpperCase()} · ${level} · ${activeTheme?.topic ?? ""}`
                : `${lang.toUpperCase()} · ${mode === "mine" ? "My Words" : level} · batch ${batchIndex + 1} of ${totalBatches}`}
              current={stepIndex}
              onLeave={leaveStudy}
              minutesLeft={estimateMinutes(
                (screen === "choose" ? chooseQueue.length : 0) + queue.length + sentQueue.length,
              )}
            />
            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0 flex justify-center">
                <div className="w-full" style={{ maxWidth: "38.75rem" }}>{screens}</div>
              </div>
              <StudyLedger
                rows={batchLedger}
                onWordClick={(r) => {if(currentQ?.word.t===r.word.t){const id=idForKind(currentQ.kind,lang,currentQ.level,currentQ.word.t);assistedRef.current.add(id);setProgress(p=>({...p,cards:{...p.cards,[id]:{...newCard(),...p.cards[id],readyAt:Date.now()+LEARNING_GAP_MS,seenAt:Date.now()}}}));}setLedgerPeek(r);}}
                peek={ledgerPeek}
                onClosePeek={() => setLedgerPeek(null)}
              />
            </div>
          </>
        ) : (screen === "importPaste" || screen === "importReader" || screen === "importLibrary") ? (
          <ImportReader
            /* The saved count is derived from the words themselves rather
             * than stored on the text, so deleting a word cannot leave the
             * rail claiming a number that is no longer true. */
            texts={savedTexts.map((t) => ({
              id: t.id,
              title: t.title,
              saved: importedWords.filter(({ word: w }) => w.src === t.title).length,
              lastRead: t.opened ? relativeDay(t.opened) : null,
            }))}
            activeId={activeTextId}
            onOpenText={openSavedText}
            onDeleteText={deleteText}
            pasting={pasting || (!activeTextId && savedTexts.length === 0)}
            onStartPaste={() => { setPasting(true); setActiveTextId(null); setImportTitle(""); setImportText(""); setImportSentences([]); setSelectedTok(null); }}
            onCancelPaste={() => setPasting(false)}
            title={importTitle}
            onTitle={setImportTitle}
            text={importText}
            onText={setImportText}
            onAnalyze={analyzeImport}
            busy={importBusy}
            pct={importProgressPct}
            sentences={importSentences}
            error={importError}
            segments={importSegments}
            selected={selectedTok}
            gloss={selectedTok ? glosses[lookupKey(selectedTok.word)] : null}
            appearsAs={(() => {
              if (!selectedTok) return null;
              const g = glosses[lookupKey(selectedTok.word)];
              return g?.lemma && normalize(g.lemma) !== lookupKey(selectedTok.word) ? selectedTok.word : null;
            })()}
            sentenceOf={selectedTok ? importSentences[selectedTok.sentenceIdx] : ""}
            translation={selectedTok ? sentenceTrans[selectedTok.sentenceIdx] : ""}
            translating={transBusy}
            onSelectWord={selectImportWord}
            onClearSelection={() => setSelectedTok(null)}
            onAdd={addImportedWord}
            addState={(() => {
              if (!selectedTok) return "add";
              const k = lookupKey(selectedTok.word);
              const g = glosses[k];
              if (knownKeys.has(k)) return "known";
              if (savedImportKeys.has(k) || (g && savedImportKeys.has(normalize(g.lemma)))) return "saved";
              return "add";
            })()}
            canSpeak={audioReady}
            onSay={() => selectedTok && say(importSentences[selectedTok.sentenceIdx])}
            savedFromText={savedFromThisText}
            savedCount={savedFromThisText.length}
            lookupCount={lookupCount}
            onStudySaved={() => startMine()}
          />
        ) : screen === "progress" ? (
          <ProgressBoard
            langName={LANG_INFO[lang].name}
            lang={lang}
            onLangChange={changeLanguage}
            totalWords={allWordsForLang.length}
            currentLevel={level}
            maturity={progressBoard.maturity}
            levels={progressBoard.levels}
            myWords={progressBoard.myWords}
            habit={progressBoard.habit}
            forecast={progressBoard.forecast}
            trend={progressBoard.trend}
            beyond={[
              { label: "Verbs & tenses", value: `${conjDrilledCells} of ${verbSet.length * tenseSet.length} cells` },
              { label: "Idioms", value: `${CORE_LEVELS.length * 6} to pair` },
              { label: "Reading & writing", value: `${PASSAGES[lang].filter((p) => progress.reading?.[p.id]).length} of ${PASSAGES[lang].length} passages · ${(progress.writing || []).filter((e) => e.lang === lang).length} pieces` },
              { label: "My Words", value: `${importedWords.length} saved` },
            ]}
            onExport={exportProgress}
            onImport={importProgress}
            importReport={importReport}
            reach={freqReach}
            strands={strandRows}
            strandGap={strandGap}
            onNavigate={navigateToSection}
            ability={ability}
            gap={abilityGap}
            reachLine={reachSentence(ability)}
            placement={progress.placement?.[lang] || null}
            onPlace={() => { setPlaceStage("offer"); setScreen("placement"); }}
            footer={<VoiceCredits lang={lang} />}
            />
        ) : (screen === "listenSelect" || screen === "dictation" || screen === "dictationDone"
              || screen === "speaking" || screen === "speakingDone") ? (
          <ListeningStage
            mode={listenMode}
            onMode={(m) => (m === "dictation" ? startDictation("level", dictLevel) : startSpeaking("level", dictLevel))}
            langName={LANG_INFO[lang].name}
            level={dictLevel}
            levels={audioLevels}
            onLevelChange={(lv) => { setDictLevel(lv); (listenMode === "dictation" ? startDictation : startSpeaking)("level", lv); }}
            idx={listenMode === "dictation" ? dictIdx : speakIdx}
            total={(listenMode === "dictation" ? dictQueue : speakQueue).length}
            item={listenMode === "dictation" ? dictItem : speakItem}
            onLeave={() => { commitSession(); setScreen("setup"); }}
            audioReady={audioReady}
            micSupported={micSupported}
            voiceName={voiceForLang?.name?.split(/[  ]/)[0] || null}
            input={dictInput}
            onInput={setDictInput}
            result={dictResult}
            onCheck={checkDictation}
            onNext={nextDictation}
            onPlay={() => say((listenMode === "dictation" ? dictItem : speakItem)?.word.s)}
            onSlower={() => speakWith(dictItem?.word.s, voiceForLang, LANG_INFO[lang].locale, SPEECH_RATE.SLOW)}
            showHint={dictShowHint}
            onToggleHint={() => setDictShowHint((v) => !v)}
            inputRef={dictInputRef}
            listening={speakListening}
            transcript={speakTranscript}
            speakResult={speakResult}
            speakError={speakError}
            onListen={speakListening ? stopListening : beginListening}
            onNextSpeak={nextSpeaking}
            log={audioRows}
            finished={screen === "dictationDone" || screen === "speakingDone"}
            score={listenMode === "dictation" ? dictScore : speakScore}
            onAgain={() => (listenMode === "dictation" ? startDictation : startSpeaking)("level", dictLevel)}
          />
        ) : (screen === "phraseSelect" || screen === "phraseMatch" || screen === "phraseDone") ? (
          <PhraseMatch
            langName={LANG_INFO[lang].name}
            level={phraseLevel}
            levels={CORE_LEVELS}
            onLevelChange={startPhrases}
            left={phraseLeft}
            right={phraseRight}
            matched={phraseMatched}
            pending={phrasePending}
            wrongFlash={phraseWrongFlash}
            wrongTries={phraseWrongTries}
            onSelect={selectPhraseTile}
            byPhrase={(id) => PHRASES[lang][phraseLevel].find((p) => p.phrase === id)}
            onNextLevel={() => {
              const at = CORE_LEVELS.indexOf(phraseLevel);
              startPhrases(CORE_LEVELS[(at + 1) % CORE_LEVELS.length]);
            }}
          />
        ) : (
          /* Everything that renders through the shared `screens` block. A
           * screen with its own desktop design lays itself out and needs the
           * room; one that is still the phone's single column keeps a reading
           * measure, or it reads as a phone screen stranded in a desktop
           * window — and is centred, because a lone column pinned against the
           * rail with 900px of nothing beside it looks like a bug rather than
           * a deliberate measure. */
          <div
            className="w-full mx-auto"
            style={{ maxWidth: FULL_WIDTH_SCREENS.has(screen) ? undefined : COLUMN_WIDTH }}
          >
            {screens}
          </div>
        )}
      </DesktopShell>
    );
  }

  return (
    <MobileShell screen={screen} onGoHome={leaveStudy} stepIndex={stepIndex} audioReady={audioReady} lang={lang} theme={theme} onThemeChange={setTheme} typeScale={typeScale} onTypeScale={setTypeScale} onNavigate={navigateToSection} activeSection={sectionOf(screen)}>
      <ProgressStatus status={saveStatus} onRetry={retrySave} recovered={recovered}/>{screens}
    </MobileShell>
  );
}
