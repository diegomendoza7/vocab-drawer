import { Volume2 } from "lucide-react";
import { C } from "../theme.js";

/* "Hear it", wherever a word is shown.
 *
 * The app had audio only on the screens built around listening, which left the
 * places where a learner meets a word for the first time — a root's family, a
 * sound law's examples — silent. Seeing `widersprechen` written and never
 * hearing it is how a word ends up known on paper and unusable out loud.
 *
 * Renders nothing when the device has no voice for the language, rather than a
 * button that does nothing when pressed.
 */
export default function SpeakButton({ onSay, ready = true, size = "sm", label, title }) {
  if (!ready || !onSay) return null;
  const small = size === "sm";
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSay(); }}
      title={title || "Hear it"}
      aria-label={title || "Hear it"}
      className={`inline-flex items-center gap-1 rounded-full shrink-0 ${small ? "px-1.5 py-0.5" : "px-2.5 py-1"}`}
      style={{
        backgroundColor: "transparent",
        border: `1px solid ${C.line}`,
        color: C.muted,
        fontSize: small ? "0.625rem" : "0.75rem",
        lineHeight: 1.4,
      }}
    >
      <Volume2 size={small ? 10 : 13} />
      {label}
    </button>
  );
}
