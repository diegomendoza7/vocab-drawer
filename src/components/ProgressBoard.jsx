import { useState } from "react";
import { ChevronRight, Sparkles, Download, Upload } from "lucide-react";
import { C, TINT, shade } from "../theme.js";

/* The whole deck's state on one screen at ≥1024px.
 *
 * The phone version stacks five levels of drawer bars, which is why it scrolls
 * forever and why nobody reaches the bottom. Two changes fix that without
 * dropping anything: levels below the current one collapse until opened, and
 * the width pays for a right rail carrying the two things the phone had no
 * room for at all — what is coming due, and the tracks that are not vocabulary.
 *
 * The forecast reads the same card intervals the home screen's due count does,
 * so the two cannot disagree.
 */
export default function ProgressBoard({
  langName, lang, onLangChange, totalWords,
  maturity, levels, myWords, habit, forecast, beyond, trend,
  currentLevel, onExport, onImport, importReport,
  reach,
  strands, strandGap, onNavigate,
  ability, gap, reachLine, placement, onPlace,
  footer,
}) {
  const [open, setOpen] = useState({ [currentLevel]: true });
  const total = maturity.new + maturity.learning + maturity.young + maturity.mature || 1;

  const segs = [
    { k: "learning", c: shade("62%") },
    { k: "young", c: shade("36%") },
    { k: "mature", c: C.gold },
  ];
  const counts = [
    { k: "new", label: "Not started" },
    { k: "learning", label: "Learning" },
    { k: "young", label: "Young" },
    { k: "mature", label: "Mature" },
  ];
  const peak = Math.max(1, ...forecast.map((f) => f.count));

  return (
    <div>
      {reach && reach.studied > 0 && (
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="font-serif text-xs uppercase tracking-wide mb-1" style={{ color: C.muted }}>
            How far your words reach
          </div>
          <p className="font-serif text-sm mb-3" style={{ color: C.muted }}>
            The first 1,000 words of a language carry about 72% of everything said or written;
            2,000 gets you to 80%. Where your {reach.studied} studied words sit:
          </p>
          <div className="flex h-3 rounded-full overflow-hidden mb-2" style={{ border: `1px solid ${C.line}` }}>
            {[["1000", C.gold], ["2000", C.green], ["5000", C.line], ["beyond", C.paper]].map(([k, col]) => (
              reach.bands[k] > 0 ? (
                <div key={k} title={`${reach.bands[k]} words`}
                  style={{ width: `${(reach.bands[k] / reach.studied) * 100}%`, backgroundColor: col }} />
              ) : null
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-serif text-xs" style={{ color: C.muted }}>
            <span><b style={{ color: C.ink }}>{reach.bands[1000]}</b> in the top 1,000</span>
            <span><b style={{ color: C.ink }}>{reach.bands[2000]}</b> in the next 1,000</span>
            <span><b style={{ color: C.ink }}>{reach.bands[5000]}</b> to 5,000</span>
            <span><b style={{ color: C.ink }}>{reach.bands.beyond}</b> beyond the list</span>
          </div>
        </div>
      )}
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="font-type text-2xl" style={{ color: C.ink }}>Progress</h2>
        <span className="font-serif text-sm" style={{ color: C.muted }}>{langName} · all levels · {totalWords} words</span>
        <span className="flex-1" />
        <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {[["fr", "French"], ["de", "German"]].map(([l, name]) => (
            <button key={l} onClick={() => onLangChange(l)} className="px-4 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: lang === l ? TINT : "transparent", color: C.ink, borderLeft: l === "fr" ? "none" : `1px solid ${C.line}` }}>
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- maturity ---------------- */}
      {/* ---------------- what you can do ---------------- */}
      {/* Everything below this panel is activity: a streak, answers today, a
        * forecast. All of it says you turned up. This is the only part that
        * answers "how far along am I", and it is careful about how it says
        * so — a word is "held" when it has survived a real gap, which is a
        * measured claim, rather than "known", which would not be. */}
      {ability?.estimated?.recognise>0&&<p className="vd-notice">Your previous schedules are preserved: {ability.estimated.recognise} recognition cards have intervals of a week or longer. The new retention counts below use observed delayed recall, so legacy estimates stay separate.</p>}
      {ability && (
        <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
            <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>What you can do</div>
            {placement ? (
              <div className="font-serif text-xs" style={{ color: C.muted }}>
                Placed at <b style={{ color: C.ink }}>{placement.level}</b> on {placement.at} ·{" "}
                <button onClick={onPlace} className="underline" style={{ color: C.muted }}>check again</button>
              </div>
            ) : (
              <button onClick={onPlace} className="font-serif text-xs underline" style={{ color: C.ink }}>
                Not sure where you are? Find your level
              </button>
            )}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div>
              <div className="font-type text-3xl" style={{ color: C.ink }}>{ability.recognise.holding}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>words recognized after an observed gap</div>
              <div className="font-serif text-xs" style={{ color: C.muted }}>{ability.recognise.solid} of them well settled</div>
            </div>
            <div>
              <div className="font-type text-3xl" style={{ color: C.ink }}>{ability.produce.holding}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>words independently recalled after a gap</div>
              <div className="font-serif text-xs" style={{ color: C.muted }}>{ability.produce.solid} of them well settled</div>
            </div>
            <div>
              <div className="font-type text-3xl" style={{ color: C.ink }}>{ability.bands.top2000.holding}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>of the commonest 2,000</div>
              <div className="font-serif text-xs" style={{ color: C.muted }}>{ability.bands.top1000.holding} in the top 1,000</div>
            </div>
          </div>

          <p className="font-serif text-sm mt-3" style={{ color: C.muted, maxWidth: "72ch", lineHeight: 1.6 }}>
            {reachLine}
            {gap?.wide && (
              <> Recognising far outruns producing at the moment — normal, and the thing that
              closes it is saying and writing them rather than reading them again.</>
            )}
          </p>
          <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
            "Held" means a word has come back correctly after a week away — the only evidence of retention there is.
          </p>
        </div>
      )}

      <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Deck maturity</div>
        <div className="flex rounded-full overflow-hidden mb-4" style={{ height: 11, backgroundColor: C.paper }}>
          {segs.map((s) => (maturity[s.k] ? <div key={s.k} style={{ width: `${(maturity[s.k] / total) * 100}%`, backgroundColor: s.c }} /> : null))}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {counts.map((c) => (
            <div key={c.k}>
              <div className="font-type text-3xl" style={{ color: C.ink }}>{maturity[c.k]}</div>
              <div className="font-serif text-sm" style={{ color: C.muted }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div className="font-serif text-sm mt-3" style={{ color: C.muted }}>
          "Mature" means the interval has stretched past three weeks — the word is sticking.
        </div>
      </div>

      {/* ---------------- the four strands ---------------- */}
      {/* What the rest of this screen cannot say. Everything else here counts
        * words: how many are mature, how many are due, how accurate you are.
        * All of that is one strand of a course. This is the only panel that
        * answers "what is my practice actually made of", which is the question
        * that decides whether the words ever become a language. */}
      {strands && (
        <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
            <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.muted }}>The four strands</div>
            <div className="font-serif text-xs" style={{ color: C.muted }}>
              days you have done each kind of work — aim for roughly a quarter each
            </div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {strands.map((s) => (
              <div key={s.strand}>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-type text-2xl" style={{ color: C.ink }}>{s.days}</span>
                  <span className="font-serif text-xs" style={{ color: C.muted }}>
                    {s.days ? `${Math.round(s.share * 100)}%` : ""}
                  </span>
                </div>
                <div className="rounded-full overflow-hidden my-1" style={{ height: 5, backgroundColor: C.paper }}>
                  <div style={{ width: `${Math.round(s.share * 100)}%`, height: "100%", backgroundColor: s.strand === strandGap?.strand ? C.gold : shade("45%") }} />
                </div>
                <div className="font-serif text-sm" style={{ color: C.ink }}>{s.label}</div>
                <div className="font-serif text-xs" style={{ color: C.muted }}>
                  {s.since === null ? "never" : s.since === 0 ? "today" : `${s.since}d ago`}
                </div>
              </div>
            ))}
          </div>
          <p className="font-serif text-sm mt-3" style={{ color: C.muted, maxWidth: "70ch" }}>
            {strandGap
              ? <>Thinnest right now: <b style={{ color: C.ink }}>{strandGap.label}</b>. </>
              : "All four have had a turn recently. "}
            A course wants roughly equal time in all four — the drills teach words, and the other three are where they turn into a language.
            {strandGap && onNavigate && (
              <>
                {" "}
                <button onClick={() => onNavigate(strandGap.section)} className="underline font-semibold" style={{ color: C.ink }}>
                  {strandGap.invite}
                </button>
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ---------------- mastery by drawer ---------------- */}
        <div className="rounded-lg p-5 min-w-0" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.muted }}>Mastery by drawer</div>

          {levels.map((lv) => {
            const isOpen = Boolean(open[lv.level]);
            return (
              <div key={lv.level} className="mb-3 last:mb-0">
                <button onClick={() => setOpen((o) => ({ ...o, [lv.level]: !o[lv.level] }))}
                  className="w-full flex items-baseline gap-2 text-left">
                  <ChevronRight size={14} style={{ color: C.muted, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                  <span className="font-type text-lg" style={{ color: C.ink }}>{lv.level}</span>
                  <span className="flex-1" />
                  <span className="font-serif text-sm tabular-nums" style={{ color: C.muted }}>{lv.started}/{lv.total}</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1 mt-1.5">
                    {lv.drawers.slice(0, 12).map((d) => (
                      <div key={d.topic} className="grid items-center gap-2" style={{ gridTemplateColumns: "40% 1fr 34px" }}>
                        <span className="font-serif text-xs truncate" style={{ color: C.muted }}>{d.topic}</span>
                        <div className="rounded-full" style={{ height: 5, backgroundColor: C.paper }}>
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.pct === 100 ? C.green : C.gold }} />
                        </div>
                        <span className="font-serif text-[0.625rem] tabular-nums text-right" style={{ color: C.muted }}>{d.pct}%</span>
                      </div>
                    ))}
                    {lv.drawers.length > 12 && (
                      <span className="font-serif text-xs mt-0.5" style={{ color: C.muted }}>
                        …{lv.drawers.length - 12} more {lv.level} drawers
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
            Levels are collapsed until opened — five at once is what made this screen scroll forever.
          </p>

          {myWords && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-type text-lg flex items-center gap-1.5" style={{ color: C.ink }}>
                  <Sparkles size={14} style={{ color: C.accent }} /> My Words
                </span>
                <span className="font-serif text-sm tabular-nums" style={{ color: C.muted }}>{myWords.started}/{myWords.total}</span>
              </div>
              <div className="grid items-center gap-2" style={{ gridTemplateColumns: "40% 1fr 34px" }}>
                <span className="font-serif text-xs" style={{ color: C.muted }}>your own vocabulary</span>
                <div className="rounded-full" style={{ height: 5, backgroundColor: C.paper }}>
                  <div className="h-full rounded-full" style={{ width: `${myWords.pct}%`, backgroundColor: C.gold }} />
                </div>
                <span className="font-serif text-[0.625rem] tabular-nums text-right" style={{ color: C.muted }}>{myWords.pct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- right rail ---------------- */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Habit</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <Stat value={habit.streak} label="day streak" />
              <Stat value={habit.today} label="answered today" />
              <Stat value={habit.firstTry == null ? "—" : `${habit.firstTry}%`} label="correct, 30d" />
            </div>
          </div>

          {/* The question a due forecast cannot answer: am I getting better?
            * Drawn from history the app has always stored and never shown. */}
          <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Accuracy, 30 days</div>
            <Trend points={trend} />
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Coming due</div>
            <div className="flex items-end gap-1.5" style={{ height: 62 }}>
              {forecast.map((f, i) => (
                <div key={i} className="flex-1 rounded-sm" title={`${f.label}: ${f.count}`}
                  style={{
                    height: `${Math.max(3, (f.count / peak) * 100)}%`,
                    backgroundColor: i === 0 ? C.gold : shade("28%"),
                  }} />
              ))}
            </div>
            <div className="flex justify-between font-serif text-xs mt-1.5" style={{ color: C.muted }}>
              <span>today {forecast[0]?.count ?? 0}</span>
              <span>next 7 days</span>
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.muted }}>Beyond vocabulary</div>
            {beyond.map((b) => (
              <div key={b.label} className="flex items-baseline justify-between gap-2 py-0.5">
                <span className="font-serif text-sm" style={{ color: C.ink }}>{b.label}</span>
                <span className="font-serif text-xs shrink-0" style={{ color: C.muted }}>{b.value}</span>
              </div>
            ))}
          </div>

          {/* The wireframe pairs export with a reset. Export is written here
            * because it only reads; a one-click wipe of every card's schedule
            * is not something to add on a layout note, so it is left out
            * rather than shipped behind a confirm dialog nobody asked for. */}
          <div className="rounded-lg p-4" style={{ border: `1px solid ${C.line}` }}>
            <button onClick={onExport} className="w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Download size={13} /> Export progress
            </button>

            {/* Export without import is a backup, not a transfer. This is what
              * makes studying on two devices survivable without a server. */}
            <label className="w-full mt-2 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Upload size={13} /> Import and merge
              <input
                type="file" accept="application/json,.json" className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; onImport?.(f); }}
              />
            </label>

            {importReport && (
              <p className="font-serif text-xs mt-2" style={{ color: importReport.ok ? C.green : C.red }}>
                {importReport.text}
              </p>
            )}

            <p className="font-serif text-xs mt-2" style={{ color: C.muted }}>
              Every card's schedule and your review history. Importing merges —
              where the same card exists on both sides, the one reviewed more
              recently wins. Nothing is deleted.
            </p>
          </div>
        </div>
      </div>
      {footer}
    </div>
  );
}

/* A sparkline over the days that have data, with the last point emphasised.
 * Days without reviews are skipped rather than drawn as zero — a weekend off
 * is missing data, not a collapse in accuracy. */
function Trend({ points }) {
  const withData = points.filter((p) => p.pct !== null);
  if (withData.length < 2) {
    return (
      <p className="font-serif text-sm" style={{ color: C.muted }}>
        {withData.length === 0
          ? "No reviews yet. This fills in as you study."
          : "One day of data so far — a trend needs at least two."}
      </p>
    );
  }

  const W = 260, H = 54, pad = 3;
  const lo = Math.min(50, ...withData.map((p) => p.pct));
  const span = Math.max(1, 100 - lo);
  const x = (i) => pad + (i / (points.length - 1)) * (W - pad * 2);
  const y = (pct) => H - pad - ((pct - lo) / span) * (H - pad * 2);

  const drawn = points.map((p, i) => ({ ...p, i })).filter((p) => p.pct !== null);
  const line = drawn.map((p, n) => `${n ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.pct).toFixed(1)}`).join(" ");
  const area = `${line} L${x(drawn[drawn.length - 1].i).toFixed(1)},${H - pad} L${x(drawn[0].i).toFixed(1)},${H - pad} Z`;
  const last = drawn[drawn.length - 1];
  const first = drawn[0];
  const change = last.pct - first.pct;

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
        aria-label={`Accuracy ${first.pct}% to ${last.pct}% over ${drawn.length} days studied`}>
        <line x1={pad} x2={W - pad} y1={y(100)} y2={y(100)} stroke={C.line} strokeWidth="1" strokeDasharray="2 3" />
        <path d={area} fill={shade("10%")} />
        <path d={line} fill="none" stroke={C.gold} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last.i)} cy={y(last.pct)} r="3" fill={C.gold} />
      </svg>
      <div className="flex items-baseline justify-between font-serif text-xs mt-1" style={{ color: C.muted }}>
        <span>{drawn.length} {drawn.length === 1 ? "day" : "days"} studied</span>
        <span style={{ color: C.ink }} className="tabular-nums">
          {last.pct}%{change !== 0 && <span style={{ color: change > 0 ? C.green : C.red }}> {change > 0 ? "+" : ""}{change}</span>}
        </span>
      </div>
    </>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-type text-2xl" style={{ color: C.ink }}>{value}</div>
      <div className="font-serif text-xs leading-tight" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}
