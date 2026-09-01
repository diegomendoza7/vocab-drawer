import { LogOut } from "lucide-react";
import { C } from "../theme.js";

const STAGES = ["Learn", "Match", "Choose", "Type", "Sentence", "Done"];

/* The six stages as a fixed rail, so what's left is always visible.
 *
 * Read-only: it reports position, it doesn't navigate. Skipping ahead is still
 * done by the stage's own "skip" affordances, which know what to carry over. */
export default function StudyStageRail({ breadcrumb, current, onLeave }) {
  return (
    <div className="flex items-center gap-4 px-1 pb-3 mb-4 flex-wrap" style={{ borderBottom: `1px solid ${C.line}` }}>
      <span className="text-xs font-serif shrink-0" style={{ color: C.muted }}>{breadcrumb}</span>

      <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
        {STAGES.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <span
              key={label}
              className="px-2.5 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: active ? C.gold : "transparent",
                color: active ? C.ink : done ? C.green : C.muted,
                border: `1px solid ${active ? C.gold : C.line}`,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <button
        onClick={onLeave}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
        style={{ color: C.ink, border: `1px solid ${C.line}` }}
      >
        <LogOut size={13} /> Leave
      </button>
    </div>
  );
}
