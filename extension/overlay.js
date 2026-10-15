import { cueAt, alignedTranslation } from "../src/lib/subtitles.js";
import { languageNotes } from "../src/lib/language-notes.js";
if (!globalThis.__vocabDrawerExtension) {
  const state = { panel: null, dispose: null };
  globalThis.__vocabDrawerExtension = state;
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type !== "vocabdrawer:open") return;
    try {
      state.dispose?.();
      const media = [...document.querySelectorAll("video,audio")].sort(
        (a, b) =>
          b.getBoundingClientRect().width * b.getBoundingClientRect().height -
          a.getBoundingClientRect().width * a.getBoundingClientRect().height,
      )[0];
      if (!media)
        throw new Error(
          "No accessible HTML5 player was found. Open Media Studio with a local file instead.",
        );
      const host = document.createElement("div");
      host.style.cssText =
        "position:fixed;right:16px;bottom:16px;width:min(440px,calc(100vw - 32px));z-index:2147483647";
      document.documentElement.append(host);
      const root = host.attachShadow({ mode: "open" }),
        style = document.createElement("style");
      style.textContent =
        ":host{font:15px/1.5 system-ui,sans-serif;color:#201f1d}section{padding:16px;border:2px solid #805313;border-radius:10px;background:#fbf7ec;max-height:70vh;overflow:auto;box-shadow:0 4px 24px #0004}h2{font-size:18px;margin:0 0 10px}p{margin:10px 0}.row{display:flex;flex-wrap:wrap;gap:8px}button,input,select{font:inherit;box-sizing:border-box;min-height:44px;border:1px solid #8b8170;border-radius:6px;padding:8px;background:white;color:#201f1d}button{cursor:pointer}input{max-width:100px}label{display:flex;align-items:center;gap:6px}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #805313;outline-offset:2px}.caption{font-size:19px}.muted{font-size:13px;color:#665d4e}";
      root.append(style);
      const section = document.createElement("section");
      section.setAttribute("aria-label", "Vocab Drawer bilingual study panel");
      root.append(section);
      const heading = document.createElement("h2");
      heading.textContent = "Vocab Drawer video study";
      section.append(heading);
      const target = document.createElement("p");
      target.className = "caption";
      target.lang = message.lang;
      section.append(target);
      const english = document.createElement("p");
      english.lang = "en";
      section.append(english);
      const controls = document.createElement("div");
      controls.className = "row";
      section.append(controls);
      const status = document.createElement("p");
      status.setAttribute("role", "status");
      const notes = document.createElement("div");
      section.append(notes, status);
      let cues = message.cues || [],
        translations = message.english || [],
        offset = 0,
        loop = false,
        locked = -1,
        current = -1;
      const phrases = [];
      const oldRate = media.playbackRate;
      function button(text, fn) {
        const b = document.createElement("button");
        b.textContent = text;
        b.addEventListener("click", fn);
        controls.append(b);
        return b;
      }
      function tick() {
        if (
          loop &&
          cues[locked] &&
          media.currentTime >= cues[locked].end + offset
        ) {
          media.currentTime = Math.max(0, cues[locked].start + offset + 0.01);
          return;
        }
        current = cueAt(cues, media.currentTime, offset);
        const cue = cues[current];
        target.textContent =
          cue?.text ||
          "No subtitle at this point. Import a track or use exposed page captions.";
        english.textContent = alignedTranslation(cue, translations);
        notes.replaceChildren();
        for (const note of languageNotes(cue?.text || "", message.lang)) {
          const detail = document.createElement("details"),
            summary = document.createElement("summary"),
            p = document.createElement("p");
          summary.textContent = note.title;
          p.textContent = note.explanation;
          detail.append(summary, p);
          notes.append(detail);
        }
      }
      function seek(index) {
        if (!cues.length) return;
        current = Math.max(0, Math.min(cues.length - 1, index));
        locked = loop ? current : -1;
        media.currentTime = Math.max(0, cues[current].start + offset + 0.01);
        media.play().catch(() => {
          status.textContent = "Press the player’s Play button to begin.";
        });
        tick();
      }
      button("Previous line", () => seek(current - 1));
      button("Replay line", () => seek(current));
      button("Next line", () => seek(current + 1));
      const loopButton = button("Loop line: off", () => {
        loop = !loop;
        locked = loop ? current : -1;
        loopButton.textContent = "Loop line: " + (loop ? "on" : "off");
      });
      const speed = document.createElement("select");
      speed.setAttribute("aria-label", "Playback speed");
      for (const value of [0.5, 0.75, 1, 1.25, 1.5]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value + "×";
        speed.append(option);
      }
      speed.value = oldRate;
      speed.addEventListener(
        "change",
        () => (media.playbackRate = Number(speed.value)),
      );
      controls.append(speed);
      const shift = document.createElement("label");
      shift.textContent = "Subtitle shift (seconds)";
      const input = document.createElement("input");
      input.type = "number";
      input.value = "0";
      input.min = "-300";
      input.max = "300";
      input.step = ".25";
      input.addEventListener("input", () => {
        offset = Math.max(-300, Math.min(300, Number(input.value) || 0));
        tick();
      });
      shift.append(input);
      section.append(shift);
      button("Use page captions", () => {
        try {
          const tracks = [...(media.textTracks || [])];
          const selected =
            tracks.find((t) => t.language?.startsWith(message.lang)) ||
            tracks.find((t) => t.mode === "showing");
          if (!selected)
            throw new Error(
              "This player does not expose usable captions. Import an SRT or VTT track in the extension popup.",
            );
          selected.mode = "hidden";
          cues = [...(selected.cues || [])]
            .filter((c) => typeof c.text === "string")
            .map((c, i) => ({
              id: "page-" + i,
              start: c.startTime,
              end: c.endTime,
              text: c.text.replace(/<[^>]*>/g, ""),
            }));
          locked = -1;
          translations = [];
          const en = tracks.find((t) => t.language?.startsWith("en"));
          if (en)
            translations = [...(en.cues || [])].map((c, i) => ({
              id: "english-" + i,
              start: c.startTime,
              end: c.endTime,
              text: c.text.replace(/<[^>]*>/g, ""),
            }));
          status.textContent = cues.length
            ? cues.length + " exposed caption lines loaded."
            : "Captions are not loaded yet. Try again after the player loads them, or import a track.";
          tick();
        } catch (e) {
          status.textContent = e.message;
        }
      });
      button("Save this phrase", () => {
        const cue = cues[current];
        if (!cue) {
          status.textContent = "Choose a captioned line first.";
          return;
        }
        phrases.push({
          id: crypto.randomUUID(),
          lang: message.lang,
          text: cue.text,
          translation: alignedTranslation(cue, translations),
          source: document.title || "Browser video",
          sourcePage: location.origin + location.pathname,
          start: cue.start,
          end: cue.end,
          at: new Date().toISOString(),
        });
        status.textContent =
          phrases.length +
          " phrase(s) saved in this panel. Export them before closing.";
      });
      button("Export phrases to Vocab Drawer", () => {
        if (!phrases.length) {
          status.textContent = "Save a phrase first.";
          return;
        }
        const data = { schemaVersion: 3, cards: {}, phrasebook: phrases },
          url = URL.createObjectURL(
            new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            }),
          ),
          link = document.createElement("a");
        link.href = url;
        link.download = "vocab-drawer-video-phrases.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent =
          "Import this file with “Merge this backup” in Vocab Drawer.";
      });
      button("Close study panel", () => state.dispose?.());
      const help = document.createElement("p");
      help.className = "muted";
      help.textContent =
        "Tracks and saved phrases stay in this tab. Exports contain source context, captions, and timing. Protected subtitle extraction is not included.";
      section.append(help);
      media.addEventListener("timeupdate", tick);
      state.dispose = () => {
        media.removeEventListener("timeupdate", tick);
        media.playbackRate = oldRate;
        host.remove();
        state.panel = null;
        state.dispose = null;
      };
      state.panel = host;
      tick();
      reply({ ok: true });
    } catch (e) {
      reply({ ok: false, error: e.message });
    }
  });
}
