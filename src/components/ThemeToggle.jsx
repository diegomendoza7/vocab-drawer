import { Monitor, Moon, Sun } from "lucide-react";
import { C } from "../theme.js";

/* Three states, not a switch: "system" has to be reachable, or someone whose
 * device flips at sunset can never get that behaviour back once they have
 * touched the control. */
const OPTIONS = [
  { key: "system", Icon: Monitor, label: "Match device" },
  { key: "light", Icon: Sun, label: "Light" },
  { key: "dark", Icon: Moon, label: "Dark" },
];

export default function ThemeToggle({ theme, onChange, compact = false }) {
  return (
    <div
      className="inline-flex rounded-md overflow-hidden"
      role="group"
      aria-label="Colour theme"
      style={{ border: `1px solid ${C.line}` }}
    >
      {OPTIONS.map(({ key, Icon, label }) => {
        const active = theme === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className="flex items-center justify-center"
            style={{
              padding: compact ? "4px 7px" : "6px 10px",
              backgroundColor: active ? C.gold : "transparent",
              color: C.ink,
            }}
          >
            <Icon size={compact ? 13 : 15} />
          </button>
        );
      })}
    </div>
  );
}
