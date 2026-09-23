import {
  LayoutGrid, Sparkles, GraduationCap, Blocks, BookOpen, Quote, ScrollText,
  Headphones, FileText, Activity, CalendarCheck, CloudOff, GitBranch, Zap, Link2, PenLine, TriangleAlert,
} from "lucide-react";
import { C } from "../theme.js";
import ThemeToggle from "./ThemeToggle.jsx";
import TypeScale from "./TypeScale.jsx";
import { LANG_INFO } from "../data/vocab.js";

/* The desktop navigation rail.
 *
 * Replaces the stack of cards that filled the mobile home screen: those became
 * nav, which is what frees the main column for the level strip and drawer grid.
 *
 * Purely presentational — every item calls back into the same screen-entry
 * handlers the mobile cards already used, so there is one navigation path, not
 * two. */

const ITEMS = [
  { id: "study", label: "Study", icon: LayoutGrid },
  { id: "lessons", label: "Lessons", icon: ScrollText },
  { id: "mywords", label: "My Words", icon: Sparkles },
  { id: "grammar", label: "Grammar & Verbs", icon: GraduationCap },
  { id: "sentences", label: "Sentence Constructions", icon: Blocks },
  { id: "reading", label: "Reading Room", icon: BookOpen },
  { id: "writing", label: "Writing Desk", icon: PenLine },
  { id: "mistakes", label: "Your mistakes", icon: TriangleAlert },
  { id: "phrases", label: "Phrase Match", icon: Quote },
  { id: "listening", label: "Listening & Speaking", icon: Headphones },
  { id: "etymology", label: "Word Roots", icon: GitBranch },
  { id: "fluency", label: "Fluency", icon: Zap },
  { id: "collocations", label: "Collocations", icon: Link2 },
  { id: "import", label: "Import a text", icon: FileText },
  { id: "progress", label: "Progress", icon: Activity },
];

export default function Rail({ activeSection, onNavigate, lang, onLangChange, level, badges, storageOn, theme, onThemeChange, typeScale, onTypeScale }) {
  return (
    <nav
      className="flex flex-col shrink-0"
      style={{ width: "13.25rem", borderRight: `1px solid ${C.line}`, backgroundColor: C.card }}
      aria-label="Sections"
    >
      <button onClick={() => onNavigate("study")} className="flex items-center gap-2 px-4 py-4" aria-label="Vocab Drawer home">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: C.ink, color: C.card }}>V</div>
        <span className="font-type text-lg tracking-tight text-left" style={{ color: C.ink }}>Vocab Drawer</span>
      </button>

      <div className="flex flex-col gap-0.5 px-2">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          const badge = badges[id];
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md text-left"
              style={{
                backgroundColor: active ? C.paper : "transparent",
                border: `1px solid ${active ? C.line : "transparent"}`,
              }}
            >
              <Icon size={15} style={{ color: active ? C.gold : C.muted, flexShrink: 0 }} />
              <span className="text-[0.8125rem] font-semibold flex-1 min-w-0 leading-tight" style={{ color: C.ink }}>{label}</span>
              {id === "study" && (
                <span className="text-[0.625rem] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.paper, color: C.muted, border: `1px solid ${C.line}` }}>{level}</span>
              )}
              {badge ? (
                <span
                  className="text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                  style={{ backgroundColor: badge.urgent ? C.gold : C.paper, color: badge.urgent ? C.ink : C.muted, border: badge.urgent ? "none" : `1px solid ${C.line}` }}
                >
                  {badge.text}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="px-3 pb-3 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="flex gap-1.5 mb-2">
          {["fr", "de"].map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className="flex-1 py-1.5 rounded-md text-xs font-semibold"
              style={{
                backgroundColor: lang === l ? C.ink : "transparent",
                color: lang === l ? C.card : C.ink,
                border: `1px solid ${C.ink}`,
              }}
            >
              {LANG_INFO[l].name}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[0.625rem]" style={{ color: C.muted }}>
          {storageOn === null ? "Checking storage…" : storageOn ? (<><CalendarCheck size={10} /> Progress saving: on</>) : (<><CloudOff size={10} /> Saving: off (session only)</>)}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <ThemeToggle theme={theme} onChange={onThemeChange} compact />
          <TypeScale scale={typeScale} onChange={onTypeScale} compact />
        </div>
      </div>
    </nav>
  );
}
