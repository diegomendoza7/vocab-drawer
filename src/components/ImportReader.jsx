import { X, Volume2, Plus, ArrowRight, Trash2 } from "lucide-react";
import { C, TINT } from "../theme.js";

/* The three import screens as one frame at ≥1024px.
 *
 * On a phone, importPaste → importReader → importLibrary are separate routes,
 * and the lookup panel appears *under* the text — so tapping a word pushes the
 * sentence you were reading off the screen. With three columns the panel has a
 * fixed home on the right and the text never moves.
 *
 * The library rail is the piece that did not exist before: the app held one
 * text at a time, so pasting a second one silently discarded the first.
 */
export default function ImportReader({
  texts, activeId, onOpenText, onDeleteText,
  pasting, onStartPaste, onCancelPaste,
  title, onTitle, text, onText, onAnalyze, busy, pct,
  sentences, error,
  segments, selected, gloss, appearsAs, sentenceOf, translation, translating,
  onSelectWord, onClearSelection, onAdd, addState,
  canSpeak, onSay,
  savedFromText, savedCount, lookupCount, onStudySaved,
}) {
  return (
    <div className="grid gap-0 items-stretch" style={{ gridTemplateColumns: "186px 1fr 292px", minHeight: "70vh" }}>
      {/* ---------------- library rail ---------------- */}
      <aside className="p-3 flex flex-col" style={{ backgroundColor: TINT, borderRight: `1px solid ${C.line}` }}>
        <div className="font-type text-lg mb-2" style={{ color: C.ink }}>Your texts</div>

        <div className="flex flex-col gap-1 mb-2">
          {texts.map((t) => (
            <div key={t.id} className="group relative">
              <button onClick={() => onOpenText(t.id)}
                className="w-full text-left px-2.5 py-2 rounded-md"
                style={{ backgroundColor: t.id === activeId ? C.card : "transparent", border: `1px solid ${t.id === activeId ? C.gold : "transparent"}` }}>
                <div className="font-serif text-sm truncate" style={{ color: C.ink }}>{t.title}</div>
                <div className="font-serif text-xs" style={{ color: C.muted }}>
                  {t.lastRead ? `read ${t.lastRead}` : "not read"}{t.saved ? ` · ${t.saved} saved` : ""}
                </div>
              </button>
              <button onClick={() => onDeleteText(t.id)} aria-label={`Delete ${t.title}`}
                className="absolute right-1.5 top-2 opacity-0 group-hover:opacity-100"
                style={{ color: C.muted }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {texts.length === 0 && !pasting && (
            <p className="font-serif text-xs" style={{ color: C.muted }}>Nothing saved yet.</p>
          )}
        </div>

        {pasting ? (
          <div className="rounded-md p-2.5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <input
              type="text" value={title} onChange={(e) => onTitle(e.target.value)}
              placeholder="Title"
              className="w-full px-2 py-1.5 mb-1.5 rounded font-serif text-xs"
              style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
            />
            <textarea
              value={text} onChange={(e) => onText(e.target.value)}
              placeholder="Paste a paragraph or two…" rows={7}
              className="w-full px-2 py-1.5 rounded font-serif text-xs resize-none"
              style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
            />
            <div className="font-serif text-xs mt-1 mb-1.5" style={{ color: C.muted }}>
              {text.trim() ? `${text.trim().split(/\s+/).length} words` : "Works best with a paragraph or two"}
            </div>
            <button onClick={onAnalyze} disabled={!text.trim() || busy}
              className="w-full py-1.5 rounded-md text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: C.gold, color: C.onGold }}>
              {busy ? `Reading… ${pct}%` : "Read this"}
            </button>
            <button onClick={onCancelPaste} className="w-full py-1.5 mt-1 rounded-md text-xs font-semibold"
              style={{ color: C.muted }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={onStartPaste} className="w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            <Plus size={13} /> Paste a new text
          </button>
        )}

        <span className="flex-1" />
        <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
          Words you save land in My Words, tagged with the text they came from.
        </p>
      </aside>

      {/* ---------------- reader ---------------- */}
      <div className="min-w-0 px-6 py-4 flex flex-col">
        {sentences.length === 0 ? (
          <div className="font-serif text-sm" style={{ color: C.muted }}>
            {pasting ? "Paste a text on the left, then press “Read this”." : "Open a text on the left, or paste a new one."}
          </div>
        ) : (
          <>
            <h2 className="font-type text-2xl mb-2" style={{ color: C.ink }}>{title.trim() || "Your text"}</h2>

            {error && (
              <div className="rounded-md p-2.5 mb-3 font-serif text-xs" style={{ backgroundColor: C.card, border: `1px solid ${C.red}`, color: C.ink }}>
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 mb-3 font-serif text-xs" style={{ color: C.muted }}>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: C.green, display: "inline-block" }} /> in your deck
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 14, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }} /> click to look up
              </span>
              <span style={{ opacity: 0.6 }}>grey = no gloss found</span>
            </div>

            <div className="font-serif" style={{ color: C.ink, maxWidth: "52ch", textAlign: "justify", lineHeight: 1.95 }}>
              {segments.map((sent, si) => (
                <span key={si}>
                  {sent.map((seg, gi) =>
                    seg.type === "gap" ? <span key={gi}>{seg.v}</span> : (
                      <span key={gi} onClick={() => onSelectWord(seg.v, si)}
                        style={{
                          cursor: "pointer",
                          color: seg.state === "known" ? C.green : seg.state === "gloss" ? C.ink : C.muted,
                          fontWeight: seg.state === "known" ? 600 : 400,
                          borderBottom: seg.state === "gloss" ? `1px solid ${C.gold}` : "none",
                        }}>
                        {seg.v}
                      </span>
                    ),
                  )}{" "}
                </span>
              ))}
            </div>

            <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
              Click any word. The sentence it sits in is what gets translated — not the whole text at once.
            </p>

            <span className="flex-1" />
            <div className="flex items-center gap-3 mt-5 pt-3 flex-wrap" style={{ borderTop: `1px solid ${C.line}` }}>
              <span className="font-serif text-sm" style={{ color: C.muted }}>
                {savedCount} word{savedCount === 1 ? "" : "s"} saved from this text · {lookupCount} lookup{lookupCount === 1 ? "" : "s"}
              </span>
              <span className="flex-1" />
              {savedCount > 0 && (
                <button onClick={onStudySaved} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
                  style={{ border: `1px solid ${C.gold}`, color: C.accent }}>
                  Study these {savedCount} <ArrowRight size={13} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ---------------- lookup panel ---------------- */}
      <aside className="p-3" style={{ borderLeft: `1px solid ${C.line}` }}>
        {selected ? (
          <div className="rounded-lg p-3.5 mb-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-type text-2xl" style={{ color: C.ink }}>{gloss?.lemma || selected.word}</div>
              <button onClick={onClearSelection} aria-label="Close" style={{ color: C.muted }}><X size={15} /></button>
            </div>
            {appearsAs && <div className="font-serif text-xs mb-2" style={{ color: C.muted }}>appears here as "{appearsAs}"</div>}

            {gloss?.en ? (
              <>
                <div className="font-serif text-[0.9375rem]" style={{ color: C.ink }}>{gloss.en}</div>
                {gloss.pos && <div className="font-serif text-xs" style={{ color: C.muted }}>{gloss.pos}</div>}
              </>
            ) : (
              /* A failed lookup says so here rather than leaving the word
               * looking un-clickable, which is indistinguishable from a bug. */
              <div className="font-serif text-sm" style={{ color: C.muted }}>
                No gloss found — add it by hand from My Words if you want to keep it.
              </div>
            )}

            <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
              <div className="font-serif text-sm" style={{ color: C.ink }}>« {sentenceOf} »</div>
              <div className="font-serif text-xs mt-1" style={{ color: C.muted }}>
                {translating && !translation ? "translating…" : translation || ""}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {canSpeak && (
                <button onClick={onSay} aria-label="Hear the sentence" className="px-3 py-2 rounded-md"
                  style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <Volume2 size={14} />
                </button>
              )}
              <button onClick={onAdd} disabled={addState !== "add"}
                className="flex-1 py-2 rounded-md font-semibold text-sm disabled:opacity-40"
                style={{ border: `1px solid ${C.gold}`, color: C.accent }}>
                {addState === "known" ? "Already in your deck" : addState === "saved" ? "Saved" : "Add to deck"}
              </button>
            </div>
          </div>
        ) : (
          <p className="font-serif text-sm mb-3" style={{ color: C.muted }}>
            Click a word in the text and its card opens here.
          </p>
        )}

        {savedFromText.length > 0 && (
          <>
            <div className="font-type text-lg mb-1.5" style={{ color: C.ink }}>Saved from this text</div>
            {savedFromText.map((w) => (
              <div key={w.term} className="font-serif text-sm py-0.5">
                <span style={{ color: C.ink }}>{w.term}</span>{" "}
                <span style={{ color: C.muted }}>{w.meaning}</span>
              </div>
            ))}
          </>
        )}
      </aside>
    </div>
  );
}
