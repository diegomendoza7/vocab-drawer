const tokens = (text) =>
  String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,!?;:"«»]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
const critical =
  /^(?:pas|jamais|non|nicht|kein(?:e|en|em|er|es)?|nie|ohne|\d+)$/;
export function speechEvidence(expected, heard) {
  const target = tokens(expected),
    spoken = tokens(heard);
  const meaningWords = (list) =>
    list
      .filter((word) => critical.test(word))
      .sort()
      .join("|");
  let previous = new Array(spoken.length + 1).fill(0);
  for (const word of target) {
    const next = [0];
    for (let j = 1; j <= spoken.length; j++)
      next[j] =
        word === spoken[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], next[j - 1]);
    previous = next;
  }
  const overlap = target.length ? previous[spoken.length] / target.length : 0;
  return {
    overlap,
    criticalMatch: meaningWords(target) === meaningWords(spoken),
    matches:
      target.length > 0 &&
      overlap >= 0.8 &&
      meaningWords(target) === meaningWords(spoken),
  };
}
