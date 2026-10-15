import { C, TINT } from "../theme.js";
import { segment } from "../lib/morphology.js";

/* A word broken into its parts.
 *
 * The root is the thing to hold on to, so it is the only part drawn in full
 * ink on a tinted ground; prefixes and suffixes sit lighter around it. That
 * ranking *is* the lesson — a learner scanning a family should see the same
 * shape recur in the middle of eight different words.
 *
 * The pieces are butted together with a hairline between rather than spaced
 * out, because they are one word. Gaps would read as three words.
 */

const KIND_STYLE = {
  prefix: { color: C.accent, weight: 600 },
  root:   { color: C.ink, weight: 700, tinted: true },
  suffix: { color: C.accent, weight: 600 },
  ending: { color: C.muted, weight: 400 },
};

export default function WordParts({ notation, size = 17, showKinds = false }) {
  const parts = segment(notation);
  return (
    <span className="inline-flex items-stretch rounded overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
      {parts.map((p, i) => {
        const st = KIND_STYLE[p.kind] || KIND_STYLE.root;
        return (
          <span key={i} className="flex flex-col items-center px-1.5 py-0.5"
            style={{
              backgroundColor: st.tinted ? TINT : "transparent",
              borderLeft: i ? `1px solid ${C.line}` : undefined,
            }}>
            <span className="font-type leading-tight" style={{ fontSize: size, color: st.color, fontWeight: st.weight }}>
              {p.text}
            </span>
            {showKinds && (
              <span className="text-[0.5625rem] uppercase tracking-wide leading-tight" style={{ color: C.muted }}>
                {p.kind}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
