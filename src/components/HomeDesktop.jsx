import { useState } from "react";
import { Flame, CalendarCheck, Repeat, Target, ArrowRight, LayoutGrid, Layers, ChevronRight } from "lucide-react";
import { C } from "../theme.js";

/* The ≥1024px Study view.
 *
 * The brief behind this layout was that the language/level panel ate most of
 * the mobile home screen. Language moved to the rail, study mode became a
 * toggle, and the level description collapsed to a single line — so the drawer
 * grid, the thing you actually came to pick from, is visible without scrolling.
 */
/* Drawer names come in numbered families — "Politics & Governance I…IV" — so
 * the family is the useful unit at C1, where there are 118 drawers rather than
 * the dozen a level had when this was a flat grid. */
const familyOf = (topic) => topic.replace(/\s+[IVX]+$/, "");

/* Three fixed columns left a third of a 1440px window empty and squeezed the
 * cards at 1024. `auto-fill` picks the column count from the space actually
 * available, so the same grid is three across on a laptop and five on a wide
 * monitor without a breakpoint for each. */
const DRAWER_COLUMNS = "repeat(auto-fill, minmax(224px, 1fr))";

function DrawerCard({ g, drawerMastery, onStartTheme }) {
  const Icon = g.icon;
  const m = drawerMastery[g.topic] || { mastered: 0, total: g.words.length };
  const pct = m.total ? (m.mastered / m.total) * 100 : 0;
  return (
    <button onClick={() => onStartTheme(g.idx)} className="text-left p-3 rounded-md flex flex-col gap-1.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
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
}

function DrawerGrid({ groups, drawerMastery, onStartTheme }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null);        // null = the first family only
  const q = filter.trim().toLowerCase();

  /* Keep the original index: `onStartTheme` addresses drawers by position in
   * the level, and filtering must not renumber them. */
  const withIdx = groups.map((g, i) => ({ ...g, idx: i }));
  const matching = q ? withIdx.filter((g) => g.topic.toLowerCase().includes(q)) : withIdx;

  const families = [];
  for (const g of matching) {
    const name = familyOf(g.topic);
    const last = families[families.length - 1];
    if (last && last.name === name) last.items.push(g);
    else families.push({ name, items: [g] });
  }

  /* Grouping only earns its keep where the names actually form families. A1 is
   * a dozen one-off drawers, and turning those into a dozen collapsed
   * accordions is strictly worse than the flat grid they were. */
  const grouped = groups.length > 12 && families.some((f) => f.items.length > 1);

  /* One family open at a time keeps the level browsable. A search opens all of
   * them — you already said what you were looking for. */
  const isOpen = (name, i) => Boolean(q) || (open === null ? i === 0 : open === name);
  const single = families.length === 1 || !grouped;

  return (
    <div>
      {(grouped || groups.length > 12) && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder={`filter ${groups.length} drawers`}
            className="px-2.5 py-1.5 rounded-md font-serif text-sm"
            style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.ink, width: 220 }}
          />
          <span className="font-serif text-sm" style={{ color: C.muted }}>
            {matching.length === groups.length
              ? `${families.length} group${families.length === 1 ? "" : "s"}`
              : `${matching.length} drawer${matching.length === 1 ? "" : "s"} match`}
          </span>
        </div>
      )}

      {!grouped && (
        <div className="grid gap-[11px]" style={{ gridTemplateColumns: DRAWER_COLUMNS }}>
          {matching.map((g) => <DrawerCard key={g.topic} g={g} drawerMastery={drawerMastery} onStartTheme={onStartTheme} />)}
        </div>
      )}
      {grouped && families.map((fam, fi) => {
        const openNow = single || isOpen(fam.name, fi);
        const words = fam.items.reduce((n, g) => n + g.words.length, 0);
        const mastered = fam.items.reduce((n, g) => n + (drawerMastery[g.topic]?.mastered || 0), 0);
        return (
          <section key={fam.name} className="mb-3">
            {!single && (
              <button
                onClick={() => setOpen(openNow && open === fam.name ? "" : fam.name)}
                className="w-full flex items-baseline gap-2 py-1.5 text-left"
                style={{ borderBottom: `1px solid ${C.line}` }}
              >
                <ChevronRight
                  size={14}
                  style={{ color: C.muted, transform: openNow ? "rotate(90deg)" : "none", transition: "transform .15s" }}
                />
                <span className="text-sm font-semibold" style={{ color: C.ink }}>{fam.name}</span>
                <span className="text-xs font-serif" style={{ color: C.muted }}>
                  {fam.items.length} drawer{fam.items.length === 1 ? "" : "s"} · {words} words
                  {mastered ? ` · ${mastered} mastered` : ""}
                </span>
              </button>
            )}
            {openNow && (
              <div className="grid gap-[11px] mt-2" style={{ gridTemplateColumns: DRAWER_COLUMNS }}>
                {fam.items.map((g) => <DrawerCard key={g.topic} g={g} drawerMastery={drawerMastery} onStartTheme={onStartTheme} />)}
              </div>
            )}
          </section>
        );
      })}
      {families.length === 0 && (
        <div className="font-serif text-sm" style={{ color: C.muted }}>No drawer matches that.</div>
      )}
    </div>
  );
}

/* Today's answers against today's goal. A ring rather than a bar because it
 * closes — the whole point is that there is an amount which is enough. */
function GoalRing({ done, goal }) {
  const pct = Math.min(1, goal > 0 ? done / goal : 0);
  const met = done >= goal;
  const size = 42, stroke = 4, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2 shrink-0" title={`${done} of ${goal} answers today`}>
      <svg width={size} height={size} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={met ? C.green : C.gold} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <div>
        <div className="text-sm font-semibold tabular-nums" style={{ color: met ? C.green : C.ink }}>
          {done}<span style={{ color: C.muted }}>/{goal}</span>
        </div>
        <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>
          {met ? "goal met" : "goal"}
        </div>
      </div>
    </div>
  );
}

export default function HomeDesktop({
  dueCards, studiedCount, totalWords, langName, streak, reviewedToday, onReviewDue,
  weakCount, onWeakSpots,
  levels, level, onLevelChange,
  dailyGoal, suggestion, onNavigate, onPlace, placedAt, levelName, levelDesc, flatWordCount, totalThemes,
  mode, onModeChange,
  groups, drawerMastery, onStartTheme,
  batchSize, onBatchSize, totalBatches, onStartMixed,
  genderLegend,
}) {
  return (
    <div className="flex flex-col gap-[18px]">
      {/* Due banner */}
      <div className="rounded-md flex items-center gap-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${dueCards.length ? C.gold : C.green}`, padding: "16px 18px" }}>
        <div className="flex-1 min-w-0">
          <div className="font-type leading-none" style={{ color: C.ink, fontSize: "1.625rem" }}>{dueCards.length} due</div>
          <div className="text-xs font-serif mt-1.5" style={{ color: C.muted }}>
            {studiedCount} of {totalWords} {langName} words started
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: streak ? C.gold : C.muted }}>
              <Flame size={15} /> {streak || 0}
            </div>
            <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: C.ink }}>
              <CalendarCheck size={15} /> {reviewedToday}
            </div>
            <div className="text-[0.625rem] uppercase tracking-wide" style={{ color: C.muted }}>today</div>
          </div>

          {/* The goal closes the loop the streak only half-builds: a streak
            * says whether you showed up, never whether you have done enough. */}
          <GoalRing done={reviewedToday} goal={dailyGoal} />
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
          /* With nothing due, this is the moment the app has to have an
            * opinion. It knows the weakest words, the untouched drawers and
            * the tenses never opened — so it says which, not "study
            * something new". */
          /* Clickable, because a recommendation you cannot act on is an
            * observation. It used to be text: the app would tell you to try
            * the subjunctive and leave you to find it. */
          <button
            onClick={() => suggestion.section && onNavigate(suggestion.section)}
            disabled={!suggestion.section}
            className="shrink-0 max-w-[300px] text-right rounded-md px-3 py-2 disabled:cursor-default"
            style={{ border: `1px solid ${suggestion.section ? C.line : "transparent"}` }}
          >
            <div className="text-sm font-semibold" style={{ color: C.ink }}>{suggestion.label}</div>
            <div className="text-xs font-serif mt-0.5" style={{ color: C.muted }}>{suggestion.why}</div>
          </button>
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
          {/* Where the question is actually asked. Someone arriving with school
            * French is looking at this strip wondering which button is theirs;
            * burying the answer on the progress screen helps nobody. */}
          {onPlace && (
            <>
              {" "}
              <button onClick={onPlace} className="underline" style={{ color: C.ink }}>
                {placedAt ? `Placed at ${placedAt}` : "Not sure? Find your level"}
              </button>
            </>
          )}
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
        <DrawerGrid groups={groups} drawerMastery={drawerMastery} onStartTheme={onStartTheme} />
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
