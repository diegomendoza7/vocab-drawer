import { Home, VolumeX } from "lucide-react";
import { C } from "../theme.js";
import { LANG_INFO } from "../data/vocab.js";
import GlobalStyles from "./GlobalStyles.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import TypeScale from "./TypeScale.jsx";
import StepDots from "./StepDots.jsx";

/* The original single-column layout, unchanged.
 *
 * Everything below 1024px still renders through here exactly as it did before
 * the desktop restructure — the markup is lifted verbatim.
 *
 * `onGoHome` rather than `setScreen("setup")`: leaving mid-lesson used to throw
 * away every answer already graded, because nothing committed the sitting on
 * the way out. It now commits first, as the desktop rail's Leave does. */
export default function MobileShell({ screen, onGoHome, stepIndex, audioReady, lang, theme, onThemeChange, typeScale, onTypeScale, children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center py-8 px-4" style={{ backgroundColor: C.paper, fontFamily: "Inter, sans-serif", color: C.ink }}>
      <GlobalStyles />

      <div className="w-full max-w-[min(36rem,100%)] flex flex-wrap items-center justify-between gap-y-2 mb-6">
        <button onClick={onGoHome} className="flex items-center gap-2" aria-label="Go to settings">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold" style={{ backgroundColor: C.ink, color: C.card }}>V</div>
          <span className="font-type text-xl tracking-tight" style={{ color: C.ink }}>Vocab Drawer</span>
        </button>
        <span className="flex-1" />
        {/* The text size sits with the theme, but only on the home screen —
          * elsewhere the Home button needs that width at 375px. */}
        <div className="mr-2 flex items-center gap-1.5">
          {screen === "setup" && <TypeScale scale={typeScale} onChange={onTypeScale} compact />}
          <ThemeToggle theme={theme} onChange={onThemeChange} compact />
        </div>
        {screen !== "setup" && (
          <button onClick={onGoHome} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: C.card, color: C.ink, border: `1px solid ${C.line}` }} aria-label="Return to home, leaving this lesson">
            <Home size={15} /> Home
          </button>
        )}
      </div>

      {["learn", "matching", "choose", "practice", "summary"].includes(screen) && (
        <div className="mb-4">
          <StepDots steps={["Learn", "Match", "Choose", "Type", "Sentence", "Done"]} current={stepIndex} />
        </div>
      )}

      {["learn", "choose", "practice", "reading", "dictation", "speaking"].includes(screen) && !audioReady && (
        <div className="mb-4 flex items-center gap-1.5 text-xs font-serif" style={{ color: C.muted }}>
          <VolumeX size={14} /> No {LANG_INFO[lang].name} voice on this device — audio is off.
        </div>
      )}

      <div className="w-full max-w-[min(36rem,100%)]">
        {children}
      </div>
    </div>
  );
}
