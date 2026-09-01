import { Flame, CalendarCheck, Repeat, Target, ArrowRight, LayoutGrid, Layers } from "lucide-react";
import { C } from "../theme.js";

/* The ≥1024px Study view.
 *
 * The brief behind this layout was that the language/level panel ate most of
 * the mobile home screen. Language moved to the rail, study mode became a
 * toggle, and the level description collapsed to a single line — so the drawer
 * grid, the thing you actually came to pick from, is visible without scrolling.
 */
export default function HomeDesktop({
  dueCards, studiedCount, totalWords, langName, streak, reviewedToday, onReviewDue,
  weakCount, onWeakSpots,
  levels, level, onLevelChange, levelName, levelDesc, flatWordCount, totalThemes,
  mode, onModeChange,
  groups, drawerMastery, onStartTheme,
  batchSize, onBatchSize, totalBatches, onStartMixed,
  genderLegend,
}) {
  return (
    <div className="flex flex-col gap-[18px]" style={{ maxWidth: 1180 }}>
      {/* Due banner */}
      <div className="rounded-md flex items-center gap-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${dueCards.length ? C.gold : C.green}`, padding: "16px 18px" }}>
        <div className="flex-1 min-w-0">
          <div className="font-type leading-none" style={{ color: C.ink, fontSize: 26 }}>{dueCards.length} due</div>
          <div className="text-xs font-serif mt-1.5" style={{ color: C.muted }}>
            {studiedCount} of {totalWords} {langName} words started
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: streak ? C.gold : C.muted }}>
              <Flame size={15} /> {streak || 0}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: C.ink }}>
              <CalendarCheck size={15} /> {reviewedToday}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>today</div>
          </div>
        </div>

        {/* Offered whether or not anything is due: the point of weak spots is
            to reach the cards the schedule has not surfaced yet. */}
        {weakCount > 0 && (
          <button onClick={onWeakSpots} className="shrink-0 px-3 py-2.5 rounded-md font-semibold text-sm flex items-center gap-1.5"
            style={{ border: `1px solid ${C.line}`, color: C.ink }} title="The words you miss most, regardless of when they are next due">
            <Target size={15} /> Weak spots ({weakCount})
          </button>
        )}
        {dueCards.length > 0 ? (
          <button onClick={onReviewDue} className="shrink-0 px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-1.5" style={{ backgroundColor: C.gold, color: C.ink }}>
            <Repeat size={15} /> Review {dueCards.length} due {dueCards.length === 1 ? "word" : "words"}
          </button>
        ) : (
          <div className="shrink-0 text-xs font-serif max-w-[280px] text-right" style={{ color: C.muted }}>
            {studiedCount === 0 ? "Nothing scheduled yet — study a drawer to start building your deck." : "All caught up. Study something new, or come back tomorrow."}
          </div>
        )}
      </div>

      {/* Level strip — one row instead of the old panel */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex shrink-0 rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {levels.map((lv) => (
            <button
              key={lv}
              onClick={() => onLevelChange(lv)}
              className="px-3 py-1.5 text-sm font-semibold"
              style={{
                backgroundColor: level === lv ? C.gold : "transparent",
                color: C.ink,
                borderLeft: lv === levels[0] ? "none" : `1px solid ${C.line}`,
              }}
            >
              {lv}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[240px] font-serif text-sm" style={{ color: C.muted }}>
          <span className="font-semibold" style={{ color: C.ink }}>{levelName}.</span>{" "}
          {levelDesc} — {flatWordCount} words across {totalThemes} drawers.
        </div>

        <div className="flex shrink-0 rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <button onClick={() => onModeChange("theme")} className="px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5" style={{ backgroundColor: mode === "theme" ? C.gold : "transparent", color: C.ink }}>
            <LayoutGrid size={14} /> By theme
          </button>
          <button onClick={() => onModeChange("mixed")} className="px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5" style={{ backgroundColor: mode === "mixed" ? C.gold : "transparent", color: C.ink, borderLeft: `1px solid ${C.line}` }}>
            <Layers size={14} /> Mixed batches
          </button>
        </div>
      </div>

      {genderLegend}

      {mode === "theme" ? (
        <div className="grid gap-[11px]" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {groups.map((g, i) => {
            const Icon = g.icon;
            const m = drawerMastery[g.topic] || { mastered: 0, total: g.words.length };
            const pct = m.total ? (m.mastered / m.total) * 100 : 0;
            return (
              <button key={g.topic} onClick={() => onStartTheme(i)} className="text-left p-3 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-center gap-2">
                  <Icon size={15} style={{ color: C.gold, flexShrink: 0 }} />
                  <span className="text-sm font-semibold truncate" style={{ color: C.ink }}>{g.topic}</span>
                </div>
                <span className="text-xs font-serif" style={{ color: C.muted }}>
                  {m.total} words · {m.mastered ? `${m.mastered} mastered` : "not started"}
                </span>
                <div className="w-full rounded-full mt-0.5" style={{ height: 5, backgroundColor: C.paper }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: C.gold }} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, maxWidth: 480 }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Words per batch: {batchSize}</div>
          <input type="range" min={5} max={20} value={batchSize} onChange={(e) => onBatchSize(Number(e.target.value))} className="w-full" style={{ accentColor: C.gold }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}><span>5</span><span>20</span></div>
          <div className="text-xs mt-2 font-serif" style={{ color: C.muted }}>
            {totalBatches} batch{totalBatches > 1 ? "es" : ""} at this size, mixed across all themes.
          </div>
          <button onClick={onStartMixed} className="w-full mt-3 py-2.5 rounded-md font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: C.gold, color: C.ink }}>
            Start drawer <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
