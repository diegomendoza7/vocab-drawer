import { describe, it, expect } from "vitest";
import {
  parseSubtitles,
  cueAt,
  alignedTranslation,
  toVtt,
  transcriptCues,
} from "./subtitles.js";
describe("subtitles for media study", () => {
  it("reads BOM, CRLF, SRT timing, multiple lines, and styling without executing markup", () => {
    const rows = parseSubtitles(
      "\uFEFF1\r\n00:00:01,200 --> 00:00:03,000\r\n<i>Bonjour.</i>\r\nÇa va ?\r\n\r\n2\r\n00:00:04,000 --> 00:00:05,000\r\nBien &amp; vous ?",
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      start: 1.2,
      end: 3,
      text: "Bonjour.\nÇa va ?",
    });
    expect(rows[1].text).toBe("Bien & vous ?");
  });
  it("reads VTT settings and finds gaps correctly with a subtitle offset", () => {
    const rows = parseSubtitles(
      "WEBVTT\n\n00:01.000 --> 00:02.000 align:start\nHallo\n\n00:03.000 --> 00:04.000\nDanke",
    );
    expect(cueAt(rows, 1.5)).toBe(0);
    expect(cueAt(rows, 2.5)).toBe(-1);
    expect(cueAt(rows, 4, 1)).toBe(1);
  });
  it("aligns translated lines by overlap rather than assuming equal cue counts", () => {
    const cue = { start: 1, end: 4 };
    expect(
      alignedTranslation(cue, [
        { start: 0, end: 2, text: "Hello" },
        { start: 2, end: 3, text: "How are you?" },
        { start: 5, end: 6, text: "Other" },
      ]),
    ).toBe("Hello How are you?");
  });
  it("exports captions that can be imported again with timing intact", () => {
    const rows = [{ start: 61.23, end: 64.5, text: "Bonjour, Léa." }];
    expect(parseSubtitles(toVtt(rows))[0]).toMatchObject(rows[0]);
  });
  it("rejects invalid time ranges and files with no usable captions", () => {
    expect(() =>
      parseSubtitles("1\n00:00:03,000 --> 00:00:01,000\nInvalid"),
    ).toThrow();
    expect(() =>
      parseSubtitles("A watch-page URL is not a subtitle file"),
    ).toThrow();
  });
  it("uses clip duration for an open-ended final model timestamp", () => {
    expect(
      transcriptCues(
        {
          chunks: [
            { timestamp: [0, 2], text: " Bonjour " },
            { timestamp: [2, null], text: "Salut" },
          ],
        },
        4,
      ),
    ).toEqual([
      { id: "asr-0", start: 0, end: 2, text: "Bonjour" },
      { id: "asr-1", start: 2, end: 4, text: "Salut" },
    ]);
  });
});
