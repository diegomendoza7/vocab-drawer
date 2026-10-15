import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { C, shade } from "../theme.js";

/* Which verb-and-tense pairs are solid, and which have never been touched.
 *
 * The wizard asked "which verbs?" and "which tense?" as two separate questions,
 * which cannot express "the four cells I keep getting wrong". A grid can: the
 * shade says how solid a cell is, and the gaps are visible rather than
 * remembered.
 *
 * Shade runs light-to-dark with maturity. A cell with no card at all is drawn
 * as a dashed outline instead — "never drilled" and "drilled but shaky" are
 * different facts and the map is worthless if they look the same.
 */
const STAGE_FILL = {
  new: shade("10%"),
  learning: shade("22%"),
  young: shade("40%"),
  mature: shade("62%"),
};

export default function CoverageMatrix({
  tenses, rows, selected, onToggleCell, onToggleRow, onToggleColumn, onDrill, onMixAll, dueTotal, langName, limit = 12,
}) {
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [dueFirst, setDueFirst] = useState(false);

  const q = filter.trim().toLowerCase();
  /* Sorting by "most due" is what makes the map answer its own question — with
   * 188 verbs the interesting rows are never the first twelve alphabetically. */
  const matching = rows
    .filter((r) => !q || r.key.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => (dueFirst ? b.cells.filter((c) => c.due).length - a.cells.filter((c) => c.due).length : 0));

  const shown = showAll || q ? matching : matching.slice(0, limit);
  const hidden = matching.length - shown.length;
  const cols = `118px repeat(${tenses.length}, 1fr)`;

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Conjugation trainer</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {rows.length} verbs × {tenses.length} tenses · {dueTotal} due
        </span>
      </div>
      <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
        Each cell is one verb in one tense. Shade shows how solid it is; click cells, or a row or column heading, to build a drill.
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <input
          type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder={`filter ${rows.length} verbs`}
          className="px-2.5 py-1.5 rounded-md font-serif text-sm"
          style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.ink, width: 200 }}
        />
        <button onClick={() => setDueFirst((v) => !v)} className="px-3 py-1.5 rounded-md text-xs font-semibold"
          style={{ backgroundColor: dueFirst ? C.gold : "transparent", border: `1px solid ${dueFirst ? C.gold : C.line}`, color: C.ink }}>
          most due first
        </button>
        {!q && rows.length > limit && (
          <button onClick={() => setShowAll((v) => !v)} className="px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            {showAll ? `show first ${limit}` : `show all ${rows.length}`}
          </button>
        )}
      </div>

      <div className="rounded-lg p-4 mb-4" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, maxHeight: "60vh", overflowY: "auto" }}>
        <div className="grid gap-[7px] items-center mb-1.5" style={{ gridTemplateColumns: cols }}>
          <span />
          {tenses.map((t) => (
            <button key={t.key} onClick={() => onToggleColumn(t.key)}
              className="text-xs font-semibold text-left truncate" style={{ color: C.muted }} title={`Select all ${t.label}`}>
              {t.label}
            </button>
          ))}
        </div>

        {shown.map((row) => (
          <div key={row.key} className="grid gap-[7px] items-center mb-[7px]" style={{ gridTemplateColumns: cols }}>
            <button onClick={() => onToggleRow(row.key)} className="font-serif text-sm text-left truncate" style={{ color: C.ink }} title={`Select all of ${row.key}`}>
              {row.key}
            </button>
            {row.cells.map((cell) => {
              const isSel = selected.has(`${row.key}:${cell.tenseKey}`);
              return (
                <button
                  key={cell.tenseKey}
                  onClick={() => !cell.absent && onToggleCell(row.key, cell.tenseKey)}
                  disabled={cell.absent}
                  aria-label={cell.absent
                    ? `${row.key}, ${cell.tenseKey}, no such form`
                    : `${row.key}, ${cell.tenseKey}${cell.due ? ", due" : ""}${cell.drilled ? "" : ", never drilled"}`}
                  title={cell.absent ? `${row.key} has no ${cell.tenseKey}` : undefined}
                  style={{
                    height: 30,
                    borderRadius: 2,
                    /* A cell that cannot exist is struck through rather than
                     * left blank: an empty cell already means "never drilled",
                     * and the map's whole job is keeping those two apart. */
                    backgroundColor: cell.absent ? "transparent" : cell.drilled ? STAGE_FILL[cell.stage] || STAGE_FILL.new : "transparent",
                    backgroundImage: cell.absent
                      ? `repeating-linear-gradient(135deg, transparent 0 4px, ${C.line} 4px 5px)`
                      : undefined,
                    cursor: cell.absent ? "default" : "pointer",
                    border: cell.absent
                      ? `1px solid transparent`
                      : isSel
                      ? `2px solid ${C.ink}`
                      : cell.due ? `1px solid ${C.gold}`
                      : cell.drilled ? "1px solid transparent" : `1px dashed ${C.line}`,
                  }}
                />
              );
            })}
          </div>
        ))}

        {hidden > 0 && (
          <button onClick={() => setShowAll(true)} className="font-serif text-sm mt-1" style={{ color: C.accent }}>
            …{hidden} more
          </button>
        )}
        {shown.length === 0 && <div className="font-serif text-sm" style={{ color: C.muted }}>No verb matches that.</div>}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs font-serif" style={{ color: C.muted }}>solid</span>
          {["mature", "young", "learning", "new"].map((k) => (
            <span key={k} style={{ width: 26, height: 12, borderRadius: 2, backgroundColor: STAGE_FILL[k] }} />
          ))}
          <span style={{ width: 26, height: 12, borderRadius: 2, border: `1px dashed ${C.line}` }} />
          <span className="text-xs font-serif" style={{ color: C.muted }}>never drilled</span>
          <span style={{ width: 26, height: 12, borderRadius: 2, backgroundImage: `repeating-linear-gradient(135deg, transparent 0 4px, ${C.line} 4px 5px)` }} />
          <span className="text-xs font-serif" style={{ color: C.muted }}>no such form</span>
          <span className="flex-1" />
          <span className="text-xs font-serif" style={{ color: C.accent }}>outlined = due</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {selected.size === 0 ? "Nothing selected" : `Selected: ${selected.size} ${selected.size === 1 ? "cell" : "cells"}`}
        </span>
        <span className="flex-1" />
        <button onClick={onMixAll} className="px-3 py-2 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          Mix all tenses
        </button>
        <button onClick={onDrill} disabled={selected.size === 0}
          className="px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 disabled:opacity-40"
          style={{ backgroundColor: C.gold, color: C.onGold }}>
          Drill {selected.size || ""} selected <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
