import { Play, Volume2, Mic, MicOff, Check, X, ArrowRight, LogOut, VolumeX } from "lucide-react";
import { C, TINT } from "../theme.js";

/* Dictation and Speaking in one frame at ≥1024px.
 *
 * Mobile has four screens here — dictation, dictationDone, speaking,
 * speakingDone — and the two "done" screens exist only because a phone has no
 * room to show a result next to the thing it is a result about. With the width
 * for a side rail, the per-line ledger *is* the done screen, kept live, and
 * feedback lands under the card that produced it.
 *
 * The mode toggle swaps the input affordance without leaving the frame: the
 * text box becomes a hold-to-speak button and the target text stops being
 * hidden. Everything else — the queue, the ledger, the level — is shared,
 * which is the argument for them being one screen rather than two.
 */
export default function ListeningStage({
  mode, onMode, langName, level, levels, onLevelChange,
  idx, total, item, onLeave,
  audioReady, micSupported, voiceName,
  // dictation
  input, onInput, result, onCheck, onNext, onPlay, onSlower, showHint, onToggleHint, inputRef,
  // speaking
  listening, transcript, speakResult, speakError, onListen, onNextSpeak,
  log,
}) {
  const dict = mode === "dictation";
  const done = idx >= total;

  return (
    <div>
      {/* ---------------- header bar ---------------- */}
      <div className="flex items-center gap-3 flex-wrap mb-4 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {["dictation", "speaking"].map((m) => (
            <button key={m} onClick={() => onMode(m)}
              className="px-3.5 py-1.5 text-sm font-semibold capitalize"
              style={{ backgroundColor: mode === m ? TINT : "transparent", color: C.ink, borderLeft: m === "dictation" ? "none" : `1px solid ${C.line}` }}>
              {m}
            </button>
          ))}
        </div>
        <span className="font-serif text-sm" style={{ color: C.muted }}>
          {langName} · {level} · {Math.min(idx + 1, total)} of {total}
        </span>
        <span className="flex-1" />
        <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {levels.map((lv) => (
            <button key={lv} onClick={() => onLevelChange(lv)} className="px-2.5 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: lv === level ? TINT : "transparent", color: C.ink, borderLeft: lv === levels[0] ? "none" : `1px solid ${C.line}` }}>
              {lv}
            </button>
          ))}
        </div>
        {voiceName && <span className="font-serif text-xs" style={{ color: C.muted }}>voice: {voiceName}</span>}
        <button onClick={onLeave} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
          style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          <LogOut size={13} /> Leave
        </button>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "1fr 290px" }}>
        {/* ---------------- stage ---------------- */}
        <div className="min-w-0">
          {done || !item ? (
            <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="font-type text-xl mb-1" style={{ color: C.ink }}>Set finished</div>
              <p className="font-serif text-sm" style={{ color: C.muted }}>
                Every line in this set is scheduled. Pick another level, or switch modes to say the same sentences aloud.
              </p>
            </div>
          ) : (
            <>
              <p className="font-serif text-sm mb-2" style={{ color: C.muted }}>
                {dict ? "Listen, then write what you hear" : "Read it aloud — the target stays on screen"}
              </p>

              <div className="rounded-lg p-5" style={{ maxWidth: 560, backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}` }}>
                {dict ? (
                  <>
                    {!audioReady ? (
                      <div className="flex items-start gap-2 mb-3 font-serif text-sm" style={{ color: C.ink }}>
                        <VolumeX size={16} style={{ color: C.red, flexShrink: 0, marginTop: 2 }} />
                        <span>No {langName} voice is installed on this device, so nothing can be played. The sentence is shown instead of read.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-4">
                        <button onClick={onPlay} aria-label="Play the sentence"
                          className="rounded-full flex items-center justify-center shrink-0"
                          style={{ width: 44, height: 44, border: `1px solid ${C.line}`, color: C.ink }}>
                          <Play size={16} />
                        </button>
                        <Waveform />
                      </div>
                    )}
                    {!audioReady && <div className="font-serif text-lg mb-3" style={{ color: C.ink }}>{item.word.s}</div>}

                    <input
                      ref={inputRef} type="text" value={input} disabled={!!result}
                      onChange={(e) => onInput(e.target.value)}
                      placeholder="Type the sentence" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                      className="w-full px-3 py-2.5 rounded-md font-serif text-base"
                      style={{ backgroundColor: C.paper, border: `1px solid ${result ? (result.ok ? C.green : C.red) : C.line}`, color: C.ink }}
                    />

                    <div className="flex gap-2 mt-3">
                      {result ? (
                        <button onClick={onNext} className="flex-1 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: C.gold, color: C.ink }}>
                          {idx + 1 < total ? "Next" : "Finish"} <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button onClick={onCheck} className="flex-1 py-2 rounded-md font-semibold text-sm"
                          style={{ border: `1px solid ${C.gold}`, color: C.gold }}>Check</button>
                      )}
                      <button onClick={onPlay} disabled={!audioReady} className="px-3 py-2 rounded-md font-semibold text-sm disabled:opacity-40"
                        style={{ border: `1px solid ${C.line}`, color: C.ink }}>Hear again</button>
                      <button onClick={onSlower} disabled={!audioReady} className="px-3 py-2 rounded-md font-semibold text-sm disabled:opacity-40"
                        style={{ border: `1px solid ${C.line}`, color: C.ink }}>Slower</button>
                    </div>

                    {!result && (
                      <button onClick={onToggleHint} className="text-xs font-semibold mt-2" style={{ color: C.muted }}>
                        {showHint ? "Hide the English" : "Stuck? Show the English"}
                      </button>
                    )}
                    {showHint && !result && (
                      <div className="font-serif italic text-sm mt-1" style={{ color: C.muted }}>{item.word.se}</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="font-serif text-lg mb-1" style={{ color: C.ink }}>{item.word.s}</div>
                    <div className="font-serif italic text-sm mb-4" style={{ color: C.muted }}>{item.word.se}</div>
                    {audioReady && (
                      <button onClick={onPlay} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs mb-4"
                        style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                        <Volume2 size={13} /> Hear it first
                      </button>
                    )}
                    {micSupported ? (
                      <>
                        <button onClick={onListen}
                          className="w-full py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
                          style={{ backgroundColor: listening ? C.red : C.gold, color: listening ? C.card : C.ink }}>
                          {listening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Hold to speak</>}
                        </button>
                        {transcript && (
                          <div className="font-serif text-sm mt-3" style={{ color: C.muted }}>
                            heard: <span style={{ color: C.ink }}>{transcript}</span>
                          </div>
                        )}
                        {speakError && <div className="font-serif text-sm mt-2" style={{ color: C.red }}>{speakError}</div>}
                        {speakResult && (
                          <button onClick={onNextSpeak} className="w-full mt-3 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: C.gold, color: C.ink }}>
                            {idx + 1 < total ? "Next" : "Finish"} <ArrowRight size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="font-serif text-sm" style={{ color: C.muted }}>
                        This browser doesn't expose speech recognition, so speaking practice is unavailable here rather than silently broken. Chrome and Edge on desktop are the most likely to support it.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* feedback, under the card rather than on a screen of its own */}
              {dict && result && (
                <div className="rounded-lg p-4 mt-3" style={{ maxWidth: 560, backgroundColor: TINT, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: result.ok ? C.green : C.red }}>
                    {result.ok ? <Check size={15} /> : <X size={15} />}
                    {result.ok ? "Exact match" : `${Math.round(result.overlap * 100)}% of the words caught`}
                  </div>
                  {/* The diff marks the misses. It is feedback, not language —
                    * a line of wavy underlines is hard to read back as a
                    * sentence — so the sentence and its meaning are set out
                    * plainly below it, with the audio one click away. That is
                    * the part that teaches anyone who got it wrong. */}
                  <div className="font-serif text-base leading-relaxed mb-3" style={{ color: C.ink }}>
                    {result.diff.map((d, i) => (
                      <span key={i} style={{ color: d.ok ? C.ink : C.red, textDecoration: d.ok ? "none" : "underline", textDecorationStyle: "wavy" }}>
                        {d.tok}{" "}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-md px-3 py-2" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-serif text-[17px]" style={{ color: C.ink }}>{item.word.s}</span>
                      {audioReady && (
                        <button onClick={onPlay} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                          style={{ backgroundColor: C.paper, color: C.ink, border: `1px solid ${C.line}` }}>
                          <Volume2 size={11} /> hear
                        </button>
                      )}
                    </div>
                    <div className="font-serif text-sm mt-0.5" style={{ color: C.muted }}>{item.word.se}</div>
                    <div className="font-serif text-xs mt-1.5" style={{ color: C.muted }}>
                      the word: <span className="font-type" style={{ color: C.ink }}>{item.word.t}</span> — {item.word.e}
                    </div>
                  </div>
                  <div className="font-serif text-xs mt-2" style={{ color: C.muted }}>
                    Accents and apostrophes are checked; capitals are not.
                  </div>
                </div>
              )}
              {!dict && speakResult && (
                <div className="rounded-lg p-4 mt-3" style={{ maxWidth: 560, backgroundColor: TINT, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: speakResult.overlap >= 0.7 ? C.green : C.red }}>
                    {speakResult.overlap >= 0.7 ? <Check size={15} /> : <X size={15} />}
                    {Math.round(speakResult.overlap * 100)}% of the words came through
                  </div>

                  {/* The percentage on its own tells you nothing you can act
                    * on. Marked per word, it points at the syllable to try
                    * again. */}
                  <div className="font-serif text-base leading-relaxed mb-2 flex flex-wrap gap-x-1.5" style={{ color: C.ink }}>
                    {(speakResult.words || []).map((w, i) => (
                      <span key={i} style={{
                        color: w.state === "missed" ? C.red : w.state === "unclear" ? C.gold : C.ink,
                        textDecoration: w.state === "heard" ? "none" : "underline",
                        textDecorationStyle: w.state === "unclear" ? "dotted" : "wavy",
                        textUnderlineOffset: "3px",
                      }}>{w.tok}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 font-serif text-xs mb-1" style={{ color: C.muted }}>
                    <span><span style={{ color: C.ink }}>plain</span> = heard</span>
                    <span><span style={{ color: C.gold }}>dotted</span> = close, check the sounds</span>
                    <span><span style={{ color: C.red }}>wavy</span> = not heard</span>
                  </div>
                  <div className="font-serif text-xs" style={{ color: C.muted }}>
                    Recognition is approximate — treat a high score as "understandable", not as "perfect".
                  </div>
                </div>
              )}

              <p className="font-serif text-xs mt-3" style={{ color: C.muted }}>
                {dict ? "enter = check · the buttons above replay and slow down" : "the target stays on screen — this mode is about production, not recall"}
              </p>
            </>
          )}
        </div>

        {/* ---------------- set ledger ---------------- */}
        <aside className="rounded-lg p-4" style={{ backgroundColor: TINT, border: `1px solid ${C.line}` }}>
          <div className="font-type text-lg mb-2" style={{ color: C.ink }}>This set</div>
          {log.map((row, i) => (
            <div key={i} className="flex items-baseline justify-between gap-2 py-0.5">
              <span className="font-serif text-sm truncate" style={{ color: i === idx ? C.gold : C.ink }}>{row.label}</span>
              <span className="font-serif text-xs shrink-0" style={{ color: i === idx ? C.gold : row.state === "first try" ? C.green : row.state === "missed" ? C.red : C.muted }}>
                {i === idx && !row.settled ? "answering…" : row.state}
              </span>
            </div>
          ))}
          <div className="font-serif text-xs mt-2" style={{ color: C.muted }}>
            {Math.max(0, total - idx - (done ? 0 : 1))} to go
          </div>

          <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
            <div className="font-type text-base mb-1" style={{ color: C.ink }}>{dict ? "Speaking mode" : "Dictation mode"}</div>
            <p className="font-serif text-xs" style={{ color: C.muted }}>
              {dict
                ? "Same set, same frame: the input becomes a hold-to-speak button and the target text is shown rather than hidden."
                : "Same set, same frame: the sentence is played instead of shown, and you type what you hear."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* A fixed bar pattern standing in for a real waveform. Deliberately not
 * animated: it marks where the audio is, and a fake moving trace would imply a
 * signal the app is not actually reading. */
function Waveform() {
  const bars = [8, 17, 11, 21, 9, 14, 7, 19, 12, 10];
  return (
    <div className="flex items-center gap-[3px]" aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} style={{ width: 6, height: h, borderRadius: 1, backgroundColor: i % 3 === 1 ? C.muted : C.line }} />
      ))}
    </div>
  );
}
