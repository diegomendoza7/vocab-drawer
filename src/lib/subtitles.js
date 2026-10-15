const MAX_CUES = 20000;
export function subtitleTime(value) {
  const match = String(value)
    .trim()
    .match(/^(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{3})$/);
  if (!match) return NaN;
  const [, h, m, s, ms] = match;
  if (Number(m) >= 60 || Number(s) >= 60) return NaN;
  return Number(h || 0) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}
export function cleanCaption(text) {
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\{\\[^}]*\}/g, "")
    .replace(
      /&(?:amp|lt|gt|quot|apos|nbsp);/g,
      (s) =>
        ({
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&apos;": "'",
          "&nbsp;": " ",
        })[s],
    )
    .trim();
}
export function parseSubtitles(source) {
  if (typeof source !== "string" || source.length > 5 * 1024 * 1024)
    throw new Error("Use an SRT or VTT subtitle file smaller than 5 MB.");
  const lines = source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const cues = [];
  for (let i = 0; i < lines.length; i++) {
    const time = lines[i].match(/^\s*(\S+)\s*-->\s*(\S+)/);
    if (!time) continue;
    const start = subtitleTime(time[1]),
      end = subtitleTime(time[2]);
    const text = [];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !lines[i + 1].includes("-->")
    )
      text.push(lines[++i]);
    const body = cleanCaption(text.join("\n"));
    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start >= 0 &&
      end > start &&
      body
    )
      cues.push({ id: `cue-${cues.length}`, start, end, text: body });
    if (cues.length > MAX_CUES)
      throw new Error("This file has too many subtitle lines.");
  }
  if (!cues.length)
    throw new Error(
      "No timed subtitle lines found. Choose an SRT or WebVTT file.",
    );
  return cues.sort((a, b) => a.start - b.start || a.end - b.end);
}
export function cueAt(cues, time, offset = 0) {
  let lo = 0,
    hi = cues.length - 1,
    found = -1;
  const at = time - offset;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].start <= at) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  for (let i = found; i >= Math.max(0, found - 8); i--)
    if (at < cues[i].end) return i;
  return -1;
}
export function alignedTranslation(cue, translations, offset = 0) {
  if (!cue) return "";
  return translations
    .filter((c) => c.start + offset < cue.end && c.end + offset > cue.start)
    .map((c) => c.text)
    .join(" ");
}
function vttTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
export function toVtt(cues) {
  return (
    "WEBVTT\n\n" +
    cues
      .map(
        (c) =>
          `${vttTime(c.start)} --> ${vttTime(c.end)}\n${cleanCaption(c.text)}\n`,
      )
      .join("\n")
  );
}
export function transcriptCues(result, duration) {
  return (result.chunks || [{ text: result.text, timestamp: [0, duration] }])
    .filter((c) => c.text?.trim())
    .map((chunk, i, all) => ({
      id: `asr-${i}`,
      start: Math.max(0, chunk.timestamp?.[0] || 0),
      end: chunk.timestamp?.[1] ?? all[i + 1]?.timestamp?.[0] ?? duration,
      text: chunk.text.trim(),
    }))
    .filter((c) => c.end > c.start);
}
