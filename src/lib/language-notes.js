const patterns = {
  fr: [
    [
      /\b(?:voudrais|voudriez)\b/i,
      "A polite request",
      "Je voudrais… means “I would like…”. It softens a request.",
    ],
    [
      /\bne\b.*\bpas\b/i,
      "Negation",
      "Ne … pas usually surrounds the conjugated verb. In conversation, ne is often omitted.",
    ],
    [
      /(?:\bparce que\b|[,;]\s*car\b)/i,
      "Giving a reason",
      "Parce que and car introduce a reason; the surrounding situation determines what is being explained.",
    ],
    [
      /\b(?:j’ai|j'ai|a|avons|avez|ont)\b.*\b(?:é|fait|pris|bu)\b/i,
      "Past-time pattern",
      "Look for an auxiliary plus a past participle. Verify the full sentence before choosing the tense.",
    ],
    [
      /\b(?:vous|votre)\b/i,
      "Register",
      "Vous can address one person formally or several people. The context tells you which.",
    ],
    [
      /\b(?:du|de la|des)\b/i,
      "Articles and amounts",
      "Du/de la can indicate an unspecified amount. Des often marks an indefinite plural.",
    ],
    [
      /\b(?:d’abord|ensuite|puis|enfin)\b/i,
      "Sequence",
      "These words connect steps in a sequence: first, then, finally.",
    ],
  ],
  de: [
    [
      /\b(?:möchte|möchten|hätte)\b/i,
      "Polite requests",
      "Ich möchte… / ich hätte gern… are useful polite request patterns.",
    ],
    [
      /\b(?:weil|dass|obwohl|bevor)\b/i,
      "Subordinate clauses",
      "These conjunctions usually send the finite verb to the end of their clause.",
    ],
    [
      /\b(?:mit|nach|bei|seit|von|zu)\b/i,
      "Dative prepositions",
      "These prepositions normally take the dative. Learn the phrase with its article.",
    ],
    [
      /\b(?:nicht|kein|keine|keinen)\b/i,
      "Negation",
      "Nicht negates a verb or phrase; kein negates an indefinite noun. Do not lose negation when listening.",
    ],
    [
      /\b(?:Sie|Ihnen|Ihr)\b/,
      "Formal address",
      "Capitalized Sie/Ihnen/Ihr can mark formal address. Context also distinguishes Sie from sentence-initial sie.",
    ],
    [
      /\b(?:habe|hast|hat|haben|bin|bist|ist|sind)\b.*\bge\p{L}+/iu,
      "Past-time pattern",
      "An auxiliary with a participle often forms the Perfekt. Not every participle starts with ge-.",
    ],
    [
      /\b(?:zuerst|danach|dann|schließlich)\b/i,
      "Sequence",
      "These words connect steps. When one starts a statement, the finite verb still normally comes second.",
    ],
  ],
};
export function languageNotes(text, lang) {
  return (patterns[lang] || [])
    .filter(([pattern]) => pattern.test(text))
    .map(([, title, explanation]) => ({ title, explanation }));
}
