import { ruleInfo } from "./errors.js";
import { CONTRASTS } from "../data/contrast-clinic.js";
export function clinicLessons(lang, mistakes = []) {
  const personal = mistakes
    .filter((m) => m.lang === lang && m.examples?.some((e) => e.text))
    .map((m) => {
      const info = ruleInfo(m.rule),
        example = m.examples.find((e) => e.text);
      const suggestion =
        example.wrong && example.fix && example.text.includes(example.wrong)
          ? example.text.replace(example.wrong, () => example.fix)
          : null;
      return {
        id: `personal:${m.rule}`,
        rule: m.rule,
        title: `Your writing: ${info.title}`,
        explanation:
          info.why ||
          "Compare your wording with the suggestion saved from that check. Then apply the idea to a different sentence of your own.",
        original: example.text,
        model: suggestion,
        personal:
          "Write a new sentence about your own situation using the same pattern.",
        options: [],
        personalError: true,
      };
    });
  return [...personal, ...CONTRASTS[lang]];
}
