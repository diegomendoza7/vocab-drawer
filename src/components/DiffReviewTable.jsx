import { useState } from "react";
import { C, TINT } from "../theme.js";

/* The fact-check, as a decision table.
 *
 * Same `decisions` state the narrow screen uses — this is a different shape
 * for the same choice, not a different flow. Desktop width is what makes it
 * worth doing: yours and proposed sit side by side per row, so the comparison
 * is a glance rather than a scroll, and the save bar can state exactly what is
 * about to happen while you are still deciding.
 */
const VERDICT_TEXT = {
  ok: "ok",
  "needs-fix": "needs a fix",
  ambiguous: "sense-dependent",
};

export default function DiffReviewTable({
  rows, decisions, setDecisions, lang, onSave, onBack, error, busy,
}) {
  /* Null until the reader picks one, so the opening tab can follow the data:
   * landing on an empty "needs a look" while every word sits under "clean"
   * reads as though the check found nothing at all. */
  const [tab, setTab] = useState(null);

  const choiceOf = (id) => decisions[id]?.choice || "mine";
  const needsLook = rows.filter(({ res }) => res && res.verdict !== "ok");
  const clean = rows.filter(({ res }) => !res || res.verdict === "ok");
  const uncheckable = rows.filter(({ res }) => !res).length;

  const activeTab = tab ?? (needsLook.length ? "look" : "clean");
  const shown = activeTab === "look" ? needsLook : clean;
  const kept = rows.filter(({ row }) => choiceOf(row.id) !== "skip");
  const accepted = rows.filter(({ row }) => choiceOf(row.id) === "proposed").length;
  const skipped = rows.length - kept.length;

  const setChoice = (id, choice) => setDecisions((d) => ({ ...d, [id]: { ...d[id], choice } }));
  const bulk = (choice) =>
    setDecisions((d) => Object.fromEntries(rows.map(({ row, res }) => [row.id, { ...d[row.id], choice: res ? choice : "mine" }])));

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Check the translations</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {needsLook.length} of {rows.length} came back with something to look at · nothing changes until you save
        </span>
      </div>

      {error && (
        <div className="rounded-md p-3 mb-3 text-xs font-serif" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>{error}</div>
      )}

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {[["look", `Needs a look (${needsLook.length})`], ["clean", `Clean (${clean.length})`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{ backgroundColor: activeTab === k ? C.gold : "transparent", border: `1px solid ${activeTab === k ? C.gold : C.line}`, color: C.ink }}>
            {label}
          </button>
        ))}
        <span className="flex-1" />
        {needsLook.length > 0 && (
          <>
            <button onClick={() => bulk("proposed")} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.green}`, color: C.ink }}>Accept all fixes</button>
            <button onClick={() => bulk("mine")} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>Keep all mine</button>
          </>
        )}
      </div>

      <div className="rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
        <div className="grid gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          style={{ gridTemplateColumns: "150px 1fr 1fr 220px", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
          <span>Term</span><span>Yours</span><span>Proposed</span><span>Decision</span>
        </div>

        {shown.map(({ row, res }) => {
          const choice = choiceOf(row.id);
          const attention = res && res.verdict !== "ok";
          return (
            <div key={row.id} className="grid gap-3 px-4 py-3 items-start font-serif text-sm"
              style={{
                gridTemplateColumns: "150px 1fr 1fr 220px",
                borderTop: `1px solid ${C.line}`,
                backgroundColor: attention ? TINT : "transparent",
                opacity: choice === "skip" ? 0.5 : 1,
              }}>
              <span className="min-w-0">
                <span className="font-type block truncate" style={{ color: C.ink }}>
                  {lang === "de" && (choice === "proposed" ? res?.g : row.gender) ? `${choice === "proposed" ? res.g : row.gender} ` : ""}{row.term}
                </span>
                <span className="text-[0.6875rem]" style={{ color: attention ? C.accent : C.muted }}>
                  {res ? VERDICT_TEXT[res.verdict] || res.verdict : "could not be checked"}
                </span>
              </span>

              <span className="min-w-0">
                <span className="block" style={{ color: C.ink }}>{row.translation || "(blank)"}</span>
                <span className="block text-xs" style={{ color: C.muted }}>{row.example || "no example"}</span>
              </span>

              <span className="min-w-0">
                <span className="block" style={{ color: C.ink }}>{res ? res.en || "—" : "—"}</span>
                <span className="block text-xs" style={{ color: C.muted }}>{res?.s || (res ? "example added" : "")}</span>
              </span>

              <span className="flex gap-1.5 flex-wrap">
                {res && res.verdict !== "ok" ? (
                  <>
                    {[["proposed", "Take it"], ["mine", "Keep mine"], ["skip", "Skip"]].map(([k, label]) => (
                      <button key={k} onClick={() => setChoice(row.id, k)} className="px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: choice === k ? (k === "proposed" ? C.green : C.ink) : "transparent",
                          color: choice === k ? C.card : C.ink,
                          border: `1px solid ${C.line}`,
                        }}>
                        {label}
                      </button>
                    ))}
                  </>
                ) : (
                  <span className="text-xs" style={{ color: C.muted }}>will save as yours</span>
                )}
              </span>
            </div>
          );
        })}

        {shown.length === 0 && (
          <p className="px-4 py-6 text-center font-serif text-sm" style={{ color: C.muted }}>
            {activeTab === "look" ? "Nothing needs a second look." : "Nothing came back clean."}
          </p>
        )}
      </div>

      {uncheckable > 0 && (
        <p className="rounded-md p-3 mb-4 text-xs font-serif" style={{ border: `1px dashed ${C.line}`, color: C.muted }}>
          {uncheckable} {uncheckable === 1 ? "word" : "words"} could not be checked (no key / service down) — they save
          marked unchecked and can be checked later from the library.
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card }}>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          Saving {kept.length} {kept.length === 1 ? "word" : "words"} · {accepted} {accepted === 1 ? "fix" : "fixes"} accepted
          {skipped > 0 ? ` · ${skipped} skipped` : ""}
        </span>
        <span className="flex-1" />
        <button onClick={onBack} className="px-3 py-2 rounded-md font-semibold text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>Back to input</button>
        <button onClick={onSave} disabled={!kept.length || busy}
          className="px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-40" style={{ backgroundColor: C.gold, color: C.onGold }}>
          Save {kept.length} {kept.length === 1 ? "word" : "words"} to my deck
        </button>
      </div>
    </div>
  );
}
