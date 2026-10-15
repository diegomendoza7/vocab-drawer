const groups = [
  {
    name: "Learn and repair",
    items: [
      [
        "missions",
        "Practical missions",
        "Short lessons that teach patterns before you use them.",
      ],
      ["study", "Vocabulary drawers", "Browse words by theme or level."],
      [
        "grammar",
        "Grammar & Verbs",
        "Pattern notes, paradigms, and targeted recall.",
      ],
      [
        "clinic",
        "Contrast clinic",
        "Learn a pattern, compare examples, and write a new sentence.",
      ],
      [
        "repair",
        "Repair a word",
        "Teach a new context, pause a card, and return after a short gap.",
      ],
      ["mistakes", "Your mistakes", "Work from your own recurring errors."],
      [
        "sentences",
        "Sentence Constructions",
        "Controlled sentence-building practice.",
      ],
    ],
  },
  {
    name: "Read and listen",
    items: [
      [
        "humanListening",
        "Human listening library",
        "Real readers, short fables, longer stories, and comprehension prompts.",
      ],
      ["shelf", "Reading shelf", "Read comfortably for the meaning."],
      ["reading", "Reading Room", "Close reading with questions and writing."],
      [
        "listeningLab",
        "Listen for meaning",
        "Short dialogues with a gist question.",
      ],
      [
        "media",
        "Media Studio",
        "Your own video/audio and bilingual subtitles.",
      ],
      [
        "listening",
        "Dictation & Read-aloud",
        "Form-focused listening and supported speech.",
      ],
    ],
  },
  {
    name: "Say and create",
    items: [
      [
        "journal",
        "Language journal",
        "Your own ideas, with voice notes and delayed rewrites.",
      ],
      [
        "writing",
        "Writing Desk",
        "Prompts, grammar feedback, and a writing history.",
      ],
      [
        "retelling",
        "Retelling practice",
        "Repeat familiar meaning with fewer pauses.",
      ],
      [
        "pronunciation",
        "Sound contrasts",
        "Compare sounds and record yourself.",
      ],
      [
        "challenge",
        "Unseen challenges",
        "Use familiar patterns in a fresh situation.",
      ],
    ],
  },
  {
    name: "Reference and personal tools",
    items: [
      [
        "browserExtension",
        "Browser video extension",
        "Study accessible video pages using your own subtitle tracks.",
      ],
      [
        "deviceFiles",
        "Files on this device",
        "Download or remove local photos, recordings, and media.",
      ],
      [
        "phrasebook",
        "Phrase notebook",
        "Recall useful language with its context.",
      ],
      ["mywords", "My Words", "Import and practice your vocabulary."],
      ["phrases", "Phrase Match", "Match useful expressions and idioms."],
      [
        "collocations",
        "Collocations",
        "Learn the word partners that sound natural.",
      ],
      ["etymology", "Word Roots", "Explore ancestry, prefixes, and families."],
      ["import", "Import a text", "Read and save words from your own text."],
      [
        "fluency",
        "Recognition speed",
        "Get faster at familiar multiple-choice recall.",
      ],
      [
        "passport",
        "Skill passport",
        "Can-do tasks with their evidence source.",
      ],
      ["progress", "Progress", "Review forecasts and observed retention."],
      [
        "backups",
        "Backups & device transfer",
        "Export, merge, restore, and recover a previous snapshot.",
      ],
    ],
  },
];
export default function PracticeLibrary({ onAction }) {
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <h1>Practice library</h1>
        <p>
          Choose a purpose, or return to Today for a guided route. Reference
          tools stay available whenever you need them.
        </p>
      </section>
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="vd-title">{group.name}</h2>
          <div className="vd-grid">
            {group.items.map(([action, title, description]) => (
              <button
                className="vd-panel"
                style={{ textAlign: "left" }}
                key={action}
                onClick={() => onAction({ action })}
              >
                <h3>{title}</h3>
                <p className="vd-muted">{description}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
