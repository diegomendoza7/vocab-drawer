import { parseSubtitles } from "../src/lib/subtitles.js";
const status = document.querySelector("#status");
document.querySelector("#open").addEventListener("click", async () => {
  const button = document.querySelector("#open");
  button.disabled = true;
  status.textContent = "Opening the study panel…";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !/^https?:/.test(tab.url || ""))
      throw new Error("Open an ordinary web page with a video first.");
    const target = document.querySelector("#target").files[0],
      english = document.querySelector("#english").files[0];
    const cues = target ? parseSubtitles(await target.text()) : [],
      translations = english ? parseSubtitles(await english.text()) : [];
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["overlay.js"],
    });
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: "vocabdrawer:open",
      lang: document.querySelector("#lang").value,
      cues,
      english: translations,
    });
    if (!result?.ok)
      throw new Error(result?.error || "The study panel could not open.");
    status.textContent =
      "Panel opened. Use your imported tracks, or the player’s exposed captions.";
  } catch (e) {
    status.textContent = e.message;
  } finally {
    button.disabled = false;
  }
});
