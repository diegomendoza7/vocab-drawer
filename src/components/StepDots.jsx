import { C } from "../theme.js";

/** The study pipeline's progress dots. Shown on mobile only — desktop
 *  replaces this with the wider stage rail. */
export default function StepDots({ steps, current }) {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: i === current ? C.ink : "transparent", color: i === current ? C.card : i < current ? C.green : C.muted, border: `1px solid ${i === current ? C.ink : C.line}` }}>
            {label}
          </div>
          {i < steps.length - 1 && <div style={{ width: 14, height: 1, backgroundColor: C.line }} />}
        </div>
      ))}
    </div>
  );
}
