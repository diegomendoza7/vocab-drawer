import { describe, it, expect } from "vitest";
import { parseDefinitions, lookupWiktionary } from "./wiktionary.js";

const RESPONSE = {
  fr: [
    { partOfSpeech: "Noun", definitions: [{ definition: "<a href=\"x\">plural</a> of <i>allée</i>" }] },
    { partOfSpeech: "Participle", definitions: [{ definition: "feminine plural of allé" }] },
  ],
  en: [{ partOfSpeech: "Noun", definitions: [{ definition: "not this one" }] }],
};

describe("Wiktionary definitions", () => {
  it("keeps only the requested language and strips the markup", () => {
    expect(parseDefinitions(RESPONSE, "fr")).toEqual([
      { pos: "Noun", text: "plural of allée" },
      { pos: "Participle", text: "feminine plural of allé" },
    ]);
    expect(parseDefinitions(RESPONSE, "de")).toEqual([]);
  });
  it("falls back to lower case for a capitalised sentence start", async () => {
    const asked = [];
    const fetchImpl = async (url) => {
      asked.push(decodeURIComponent(url.split("/").pop()));
      return url.endsWith("/allees")
        ? { ok: true, json: async () => RESPONSE }
        : { ok: false, json: async () => ({}) };
    };
    const defs = await lookupWiktionary("Allees", "fr", { fetchImpl });
    expect(asked).toEqual(["Allees", "allees"]);
    expect(defs[0].text).toBe("plural of allée");
  });
  it("says null, not empty, when it cannot reach the network", async () => {
    expect(await lookupWiktionary("zzqx", "fr", { fetchImpl: () => Promise.reject(new Error("offline")) })).toBeNull();
  });
});
