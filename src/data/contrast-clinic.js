export const CONTRASTS = {
  fr: [
    {
      id: "fr-currently",
      title: "Currently or actually?",
      explanation:
        "Actuellement means currently. To say actually when correcting an assumption, en fait is often appropriate.",
      model: "Actuellement, je travaille à Lyon.",
      english: "I currently work in Lyon.",
      wrong: "I actually work in Lyon.",
      prompt: "Which meaning fits actuellement?",
      options: ["currently", "actually"],
      answer: 0,
      personal: "Write where you currently live or work.",
    },
    {
      id: "fr-past",
      title: "Avoir or être in the past?",
      explanation:
        "Aller uses être in the passé composé: je suis allé/allée. The participle agrees with the subject.",
      model: "Je suis allé au parc.",
      english: "I went to the park.",
      prompt: "Choose the auxiliary for “Je … allé au parc.”",
      options: ["ai", "suis"],
      answer: 1,
      personal:
        "Say where you went recently, choosing agreement appropriate for you.",
    },
    {
      id: "fr-only",
      title: "Only or not?",
      explanation:
        "Ne … que means only; ne … pas means not. Listen for the word that completes the pattern.",
      model: "Je n’ai que deux euros.",
      english: "I only have two euros.",
      prompt: "What does this mean?",
      options: ["I do not have two euros.", "I only have two euros."],
      answer: 1,
      personal: "Write something you have only a small amount of.",
    },
  ],
  de: [
    {
      id: "de-v2",
      title: "Keep the statement’s verb second",
      explanation:
        "When a time phrase starts a German statement, the finite verb still comes second: Gestern war ich…",
      model: "Gestern war ich zu Hause.",
      english: "Yesterday I was at home.",
      prompt: "Which order is correct?",
      options: ["Gestern ich war zu Hause.", "Gestern war ich zu Hause."],
      answer: 1,
      personal: "Start a new sentence with heute or gestern.",
    },
    {
      id: "de-dative",
      title: "Learn the article with its preposition",
      explanation:
        "Mit takes the dative. Das Auto becomes mit dem Auto; die Bahn becomes mit der Bahn.",
      model: "Ich fahre mit dem Auto.",
      english: "I travel by car.",
      prompt: "Choose the phrase after mit.",
      options: ["das Auto", "dem Auto"],
      answer: 1,
      personal: "Say how you travel using mit plus the correct article.",
    },
    {
      id: "de-because",
      title: "Move the verb after weil",
      explanation:
        "In the standard written weil clause, the finite verb goes at the end. Keep the meaning while changing the structure.",
      model: "Ich bleibe, weil ich müde bin.",
      english: "I am staying because I am tired.",
      prompt: "Complete “weil ich müde …”.",
      options: ["bin", "ich bin"],
      answer: 0,
      personal: "Give a reason for a real preference using weil.",
    },
  ],
};
