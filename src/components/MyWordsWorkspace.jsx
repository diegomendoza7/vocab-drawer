import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { C, TINT } from "../theme.js";

/* My Words as one surface: the library on the left, adding on the right.
 *
 * Replaces the hub → input → library shuffle. On a desktop there is room to
 * see what you already have while adding more, which is the point — most of
 * what you want to know before pasting a list is whether it is already there.
 */
const CHECK_STYLE = {
  ok: { label: "ok", color: C.green, border: C.line },
  fixed: { label: "fixed", color: C.ink, border: C.line },
  ambiguous: { label: "sense", color: C.accent, border: C.gold },
  "needs-fix": { label: "needs a fix", color: C.red, border: C.red },
  unchecked: { label: "unchecked", color: C.muted, border: C.line },
};

function dueLabel(days) {
  if (days === null || days === undefined) return "not studied";
  if (days <= 0) return "due now";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

export default function MyWordsWorkspace({
  langName, rows, uncheckedCount, onStudy, onRecheck, busy, pct, error,
  onDelete, addPanel,
}) {
  const [filter, setFilter] = useState("");
  const [quick, setQuick] = useState(null);   // null | "unchecked" | "due"

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return rows.filter((r) => {
      if (quick === "unchecked" && r.verdict !== "unchecked") return false;
      if (quick === "due" && !(r.dueInDays !== null && r.dueInDays <= 0)) return false;
      if (!q) return true;
      return r.term.toLowerCase().includes(q) || (r.meaning || "").toLowerCase().includes(q);
    });
  }, [rows, filter, quick]);

  const dueCount = rows.filter((r) => r.dueInDays !== null && r.dueInDays <= 0).length;

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>My Words</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {rows.length} saved{uncheckedCount > 0 ? ` · ${uncheckedCount} unchecked` : ""}
        </span>
        <span className="flex-1" />
        {rows.length > 0 && (
          <button onClick={onStudy} className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: C.gold, color: C.onGold }}>
            Study my words <ArrowRight size={15} />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>{error}</div>
      )}

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 rounded-lg" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
          <div className="flex items-center gap-2 p-3 flex-wrap" style={{ borderBottom: `1px solid ${C.line}` }}>
            <input
              type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder="filter words"
              className="px-2.5 py-1.5 rounded-md font-serif text-sm flex-1 min-w-0"
              style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
            />
            {[["unchecked", uncheckedCount], ["due", dueCount]].map(([k, n]) => (
              <button
                key={k}
                onClick={() => setQuick(quick === k ? null : k)}
                className="px-2.5 py-1.5 rounded-md text-xs font-semibold shrink-0"
                style={{
                  backgroundColor: quick === k ? C.gold : "transparent",
                  border: `1px solid ${quick === k ? C.gold : C.line}`,
                  color: C.ink,
                }}
              >
                {k} ({n})
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="p-6 text-center font-serif text-sm" style={{ color: C.muted }}>
              No {langName} words of your own yet. Add some on the right.
            </p>
          ) : (
            <>
              <div className="grid gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ gridTemplateColumns: "1.1fr 1.1fr 96px 1fr 92px 30px", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
                <span>Term</span><span>Meaning</span><span>Check</span><span>Source</span><span>Due</span><span />
              </div>
              <div className="max-h-[28rem] overflow-y-auto">
                {shown.map((r) => {
                  const v = CHECK_STYLE[r.verdict] || CHECK_STYLE.unchecked;
                  const attention = r.verdict === "unchecked" || r.verdict === "needs-fix" || r.verdict === "ambiguous";
                  return (
                    <div key={r.id} className="grid gap-3 px-4 py-2 items-baseline font-serif text-sm"
                      style={{
                        gridTemplateColumns: "1.1fr 1.1fr 96px 1fr 92px 30px",
                        borderTop: `1px solid ${C.line}`,
                        backgroundColor: attention ? TINT : "transparent",
                      }}>
                      <span className="font-type truncate" style={{ color: C.ink }}>{r.display}</span>
                      <span className="truncate" style={{ color: C.muted }}>{r.meaning || "—"}</span>
                      <span className="text-[0.6875rem] px-1.5 py-0.5 rounded justify-self-start"
                        style={{ border: `1px solid ${v.border}`, color: v.color }}>{v.label}</span>
                      <span className="truncate text-xs" style={{ color: C.muted }}>{r.src || "—"}</span>
                      <span className="text-xs" style={{ color: C.muted }}>{dueLabel(r.dueInDays)}</span>
                      <button onClick={() => onDelete(r)} aria-label={`Remove ${r.term}`} style={{ color: C.muted }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                {shown.length === 0 && (
                  <p className="px-4 py-6 text-center font-serif text-sm" style={{ color: C.muted }}>Nothing matches that filter.</p>
                )}
              </div>

              {uncheckedCount > 0 && (
                <div className="flex items-center gap-3 p-3" style={{ borderTop: `1px solid ${C.line}` }}>
                  <button onClick={onRecheck} disabled={busy}
                    className="px-3 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40"
                    style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    {busy ? <>Checking… {pct}%</> : <><Sparkles size={14} /> Check {uncheckedCount} unchecked</>}
                  </button>
                  <span className="text-xs font-serif" style={{ color: C.muted }}>
                    {shown.length} of {rows.length} shown
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0" style={{ width: 320 }}>{addPanel}</div>
      </div>
    </div>
  );
}
