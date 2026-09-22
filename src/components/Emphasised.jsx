import { C } from "../theme.js";

/* **Bold** inside an explanation string.
 *
 * The explanations are data, not JSX — they live in errors.js and content.js
 * so a check script can read them — and the one piece of formatting they need
 * is emphasis on the part that is actually the rule ("the verb keeps its
 * **seat**"). Markdown would be a dependency; this is a split.
 */
export default function Emphasised({ text }) {
  return (
    <>
      {String(text).split(/\*\*(.+?)\*\*/g).map((chunk, i) => (
        i % 2 ? <b key={i} style={{ color: C.ink }}>{chunk}</b> : <span key={i}>{chunk}</span>
      ))}
    </>
  );
}
