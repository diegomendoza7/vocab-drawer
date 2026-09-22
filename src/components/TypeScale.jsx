import { C } from "../theme.js";

/* Four text sizes, shown as four A's.
 *
 * The glyphs are sized in px on purpose — the control must stay the same size
 * at every setting, or the button you need to press to make the text smaller
 * grows along with the problem.
 */
const OPTIONS = [
  { key: "s", label: "Smaller text", px: 9 },
  { key: "m", label: "Normal text", px: 11 },
  { key: "l", label: "Larger text", px: 13 },
  { key: "xl", label: "Largest text", px: 15 },
];

export default function TypeScale({ scale, onChange, compact = false }) {
  return (
    <div
      className="inline-flex rounded-md overflow-hidden"
      role="group"
      aria-label="Text size"
      style={{ border: `1px solid ${C.line}` }}
    >
      {OPTIONS.map(({ key, label, px }) => {
        const active = scale === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className="flex items-center justify-center font-semibold leading-none"
            style={{
              padding: compact ? "4px 6px" : "6px 9px",
              minWidth: compact ? 20 : 24,
              fontSize: px,
              backgroundColor: active ? C.gold : "transparent",
              color: C.ink,
            }}
          >
            A
          </button>
        );
      })}
    </div>
  );
}
