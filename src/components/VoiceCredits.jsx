import { C } from "../theme.js";
import { voiceCount, voiceCredits } from "../lib/voice.js";

/* Who is speaking.
 *
 * The recordings are CC BY-SA, which means the speaker is credited wherever
 * the work is used — so this renders in both places the audio is reachable,
 * not only on the screen that happens to list the levels. It also tells the
 * learner something worth knowing: which words they are hearing from a person
 * rather than from the synthesiser.
 */
export default function VoiceCredits({ lang, compact = false }) {
  const n = voiceCount(lang);
  if (!n) return null;
  const people = voiceCredits(lang);
  return (
    <div className="rounded-md p-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, marginTop: compact ? 0 : 16 }}>
      <div className="text-xs font-semibold mb-1" style={{ color: C.ink }}>
        {n} word{n === 1 ? " is" : "s here are"} spoken by real people, not the synthesiser
      </div>
      <p className="text-[0.6875rem] font-serif" style={{ color: C.muted, lineHeight: 1.55 }}>
        Recordings from{" "}
        <a href="https://commons.wikimedia.org" target="_blank" rel="noopener" className="underline" style={{ color: C.muted }}>
          Wikimedia Commons
        </a>{" "}
        under CC BY-SA. Voices: {people.slice(0, 8).map((c) => `${c.speaker} (${c.count})`).join(", ")}
        {people.length > 8 ? ", and others" : ""}.
      </p>
    </div>
  );
}
