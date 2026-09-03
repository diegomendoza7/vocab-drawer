import { C, TINT } from "../theme.js";
import { LAYERS } from "../data/etymology.js";
import SpeakButton from "./SpeakButton.jsx";

/* The descent of a word, drawn as a trunk that forks — as many times as it has to.
 *
 * The fork is the whole point. Two chains printed side by side would show the
 * same facts and teach nothing; what a learner has to see is that the columns
 * are ONE column until a particular moment, and that everything below is the
 * languages doing different things to the same inherited material.
 *
 * With English added the nesting starts to matter. English and German are
 * siblings that part at West Germanic, while French left at Proto-Indo-European
 * — so three equal columns would flatten precisely the relationship worth
 * seeing. Rendering recursively from a merged tree gets that right without the
 * layout knowing anything about which languages it is drawing.
 */

const LANG_NAME = { fr: "French", de: "German", en: "English" };
const NODE_WIDTH = 108;

function Rung({ node, word, highlight, onSay, canSpeak }) {
  const meta = LAYERS[node.layer] || {};
  const isLeaf = node.leaf;
  const text = isLeaf ? word : node.form;
  return (
    <div
      className="px-2 py-1.5 rounded-md text-center"
      style={{
        backgroundColor: isLeaf ? TINT : C.card,
        border: `1px solid ${highlight ? C.gold : C.line}`,
        borderLeft: isLeaf ? `3px solid ${C.gold}` : undefined,
        minWidth: NODE_WIDTH,
        maxWidth: 168,
      }}
    >
      <div className="text-[10px] uppercase tracking-wide font-semibold leading-tight" style={{ color: C.muted }}>
        {meta.short || node.layer}
      </div>
      <div className="font-type text-[14px] leading-snug break-words"
        style={{ color: C.ink, fontStyle: node.reconstructed ? "italic" : "normal" }}>
        {/* The asterisk is not decoration: it marks a form nobody ever wrote
          * down, which is worth being honest about on every showing. */}
        {node.reconstructed && !isLeaf && <span style={{ color: C.muted }}>*</span>}
        {text || "—"}
      </div>
      {/* Only the leaves. A device has no voice for Old High German, and
        * reading a reconstruction aloud in a modern accent would be a lie. */}
      {isLeaf && text && (
        <div className="mt-0.5">
          <SpeakButton ready={canSpeak && Boolean(onSay)} onSay={() => onSay(node.layer, text)} title={`Hear ${text}`} />
        </div>
      )}
    </div>
  );
}

/** The bar that says: this is where they stopped being one word. */
function Fork({ count }) {
  const inset = `${50 / count}%`;
  return (
    <div className="relative w-full" style={{ height: 22 }}>
      <div style={{ position: "absolute", left: inset, right: inset, top: 0, height: 1, backgroundColor: C.gold }} />
      <div style={{ position: "absolute", left: inset, top: 0, width: 1, height: 22, backgroundColor: C.gold }} />
      <div style={{ position: "absolute", right: inset, top: 0, width: 1, height: 22, backgroundColor: C.gold }} />
      {count > 2 && (
        <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: 22, backgroundColor: C.gold }} />
      )}
    </div>
  );
}

function Node({ node, words, isRoot, onSay, canSpeak }) {
  const kids = node.children || [];
  const forking = kids.length > 1;
  return (
    <div className="flex flex-col items-center min-w-0" style={{ flex: 1 }}>
      {node.layer && <Rung node={node} word={words[node.layer]} highlight={isRoot || forking} onSay={onSay} canSpeak={canSpeak} />}
      {kids.length === 1 && (
        <>
          <div style={{ width: 1, height: 11, backgroundColor: C.line }} />
          <Node node={kids[0]} words={words} onSay={onSay} canSpeak={canSpeak} />
        </>
      )}
      {forking && (
        <>
          <Fork count={kids.length} />
          <div className="flex gap-3 items-start w-full">
            {kids.map((k, i) => (
              <div key={`${k.layer}-${i}`} className="flex flex-col items-center min-w-0" style={{ flex: 1 }}>
                {/* Name the limb before it splits again, so a subtree carrying
                  * two languages reads as one branch rather than as a mystery. */}
                <div className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-center" style={{ color: C.gold }}>
                  {k.langs.map((l) => LANG_NAME[l] || l).join(" · ")}
                </div>
                <Node node={k} words={words} onSay={onSay} canSpeak={canSpeak} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function WordTree({ tree, words, forkNote, onSay, canSpeak }) {
  if (!tree) return null;
  return (
    <div className="w-full">
      {tree.forest ? (
        <p className="font-serif text-sm text-center" style={{ color: C.muted }}>
          These reach back to different roots — they are neighbours, not relatives.
        </p>
      ) : (
        <div className="flex justify-center">
          <Node node={tree} words={words} isRoot onSay={onSay} canSpeak={canSpeak} />
        </div>
      )}
      {forkNote && <p className="font-serif text-xs mt-3 text-center" style={{ color: C.muted }}>{forkNote}</p>}
    </div>
  );
}
