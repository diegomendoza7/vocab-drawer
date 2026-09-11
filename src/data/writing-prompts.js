/* Prompts for the Writing Desk — free writing, not tied to a passage.
 *
 * Each prompt exists in both languages, so a learner switching between
 * French and German meets the same task and can compare their own writing
 * across the two. `min` is the length in words below which the piece is too
 * short to say much about, and grows with the level: A1 is a few sentences,
 * C1 an argued page.
 */
export const WRITING_PROMPTS = [
  /* A1 */
  { id: "a1-myself", level: "A1", min: 30, en: "Introduce yourself: your name, age, where you live, and what you like.", fr: "Présentez-vous : votre nom, votre âge, où vous habitez et ce que vous aimez.", de: "Stellen Sie sich vor: Name, Alter, Wohnort und was Sie gern machen." },
  { id: "a1-day", level: "A1", min: 30, en: "Describe a normal day, from morning to evening.", fr: "Décrivez une journée normale, du matin au soir.", de: "Beschreiben Sie einen normalen Tag, vom Morgen bis zum Abend." },
  { id: "a1-food", level: "A1", min: 30, en: "What do you eat and drink? What is your favourite meal?", fr: "Qu'est-ce que vous mangez et buvez ? Quel est votre plat préféré ?", de: "Was essen und trinken Sie? Was ist Ihr Lieblingsessen?" },
  { id: "a1-person", level: "A1", min: 30, en: "Describe a friend or someone in your family.", fr: "Décrivez un ami, une amie ou une personne de votre famille.", de: "Beschreiben Sie einen Freund, eine Freundin oder jemanden aus Ihrer Familie." },

  /* A2 */
  { id: "a2-weekend", level: "A2", min: 45, en: "What did you do last weekend?", fr: "Qu'est-ce que vous avez fait le week-end dernier ?", de: "Was haben Sie letztes Wochenende gemacht?" },
  { id: "a2-holiday", level: "A2", min: 45, en: "Tell the story of your best holiday. Where did you go, and what happened?", fr: "Racontez vos meilleures vacances. Où êtes-vous allé(e), et que s'est-il passé ?", de: "Erzählen Sie von Ihrem schönsten Urlaub. Wohin sind Sie gefahren, und was ist passiert?" },
  { id: "a2-invite", level: "A2", min: 45, en: "Write a message inviting a friend to do something with you this weekend.", fr: "Écrivez un message pour inviter un ami ou une amie à faire quelque chose avec vous ce week-end.", de: "Schreiben Sie eine Nachricht und laden Sie einen Freund oder eine Freundin für das Wochenende ein." },
  { id: "a2-town", level: "A2", min: 45, en: "Describe your town. What can you do there? What do you like or dislike about it?", fr: "Décrivez votre ville. Qu'est-ce qu'on peut y faire ? Qu'est-ce que vous aimez ou n'aimez pas ?", de: "Beschreiben Sie Ihre Stadt. Was kann man dort machen? Was gefällt Ihnen, was nicht?" },

  /* B1 */
  { id: "b1-learning", level: "B1", min: 80, en: "Why are you learning this language? What is easy for you, and what is hard?", fr: "Pourquoi apprenez-vous le français ? Qu'est-ce qui est facile pour vous, et qu'est-ce qui est difficile ?", de: "Warum lernen Sie Deutsch? Was ist für Sie leicht, und was ist schwierig?" },
  { id: "b1-decision", level: "B1", min: 80, en: "Tell about an important decision you made. How did you decide, and do you regret it?", fr: "Racontez une décision importante que vous avez prise. Comment avez-vous décidé, et la regrettez-vous ?", de: "Erzählen Sie von einer wichtigen Entscheidung. Wie haben Sie sich entschieden, und bereuen Sie es?" },
  { id: "b1-phones", level: "B1", min: 80, en: "Do we spend too much time on our phones? Give your opinion with examples.", fr: "Passons-nous trop de temps sur nos téléphones ? Donnez votre avis avec des exemples.", de: "Verbringen wir zu viel Zeit am Handy? Sagen Sie Ihre Meinung und geben Sie Beispiele." },
  { id: "b1-complaint", level: "B1", min: 80, en: "Write a complaint: something you bought doesn't work. Explain the problem and say what you want.", fr: "Écrivez une réclamation : un produit que vous avez acheté ne fonctionne pas. Expliquez le problème et dites ce que vous voulez.", de: "Schreiben Sie eine Beschwerde: Ein Produkt, das Sie gekauft haben, funktioniert nicht. Erklären Sie das Problem und sagen Sie, was Sie möchten." },

  /* B2 */
  { id: "b2-tourism", level: "B2", min: 120, en: "Does mass tourism do more harm than good? Present both sides, then conclude.", fr: "Le tourisme de masse fait-il plus de mal que de bien ? Présentez les deux côtés, puis concluez.", de: "Schadet der Massentourismus mehr, als er nützt? Stellen Sie beide Seiten dar und ziehen Sie ein Fazit." },
  { id: "b2-school", level: "B2", min: 120, en: "What should schools teach that they don't teach today?", fr: "Qu'est-ce que l'école devrait enseigner qu'elle n'enseigne pas aujourd'hui ?", de: "Was sollte die Schule unterrichten, was sie heute nicht unterrichtet?" },
  { id: "b2-cars", level: "B2", min: 120, en: "Should cars be banned from city centres? Take a position.", fr: "Faut-il interdire les voitures dans les centres-villes ? Prenez position.", de: "Sollten Autos aus den Innenstädten verbannt werden? Nehmen Sie Stellung." },
  { id: "b2-review", level: "B2", min: 120, en: "Review a film, book or series you know well — recommend it or warn people off it.", fr: "Écrivez la critique d'un film, d'un livre ou d'une série que vous connaissez bien : recommandez-le ou déconseillez-le.", de: "Schreiben Sie eine Rezension zu einem Film, einem Buch oder einer Serie, die Sie gut kennen – mit Empfehlung oder Warnung." },

  /* C1 */
  { id: "c1-machines", level: "C1", min: 160, en: "Will machines that write make human writing less valuable? Develop an argument.", fr: "Les machines qui écrivent vont-elles dévaloriser l'écriture humaine ? Développez une argumentation.", de: "Werden schreibende Maschinen das menschliche Schreiben entwerten? Entwickeln Sie eine Argumentation." },
  { id: "c1-work", level: "C1", min: 160, en: "Is work still at the centre of a meaningful life? Discuss.", fr: "Le travail est-il encore au centre d'une vie qui a du sens ? Discutez.", de: "Steht die Arbeit noch im Mittelpunkt eines sinnvollen Lebens? Erörtern Sie." },
  { id: "c1-monuments", level: "C1", min: 160, en: "Should monuments to controversial historical figures be removed? Weigh the arguments.", fr: "Faut-il retirer les monuments dédiés à des personnages historiques controversés ? Pesez les arguments.", de: "Sollten Denkmäler für umstrittene historische Persönlichkeiten entfernt werden? Wägen Sie die Argumente ab." },
  { id: "c1-council", level: "C1", min: 160, en: "Write a formal letter to your local council proposing one concrete change to your area, and justify it.", fr: "Écrivez une lettre formelle à votre mairie pour proposer un changement concret dans votre quartier, et justifiez-le.", de: "Schreiben Sie einen formellen Brief an Ihre Stadtverwaltung, schlagen Sie eine konkrete Veränderung in Ihrem Viertel vor und begründen Sie sie." },
];

/** The blank page: no prompt, no minimum. */
export const FREE_TOPIC = { id: "free", level: null, min: 0, en: "Your own topic — write about anything.", fr: "Sujet libre", de: "Freies Thema" };

export function promptsFor(level) {
  return WRITING_PROMPTS.filter((p) => p.level === level);
}

export function promptById(id) {
  return id === FREE_TOPIC.id ? FREE_TOPIC : WRITING_PROMPTS.find((p) => p.id === id) || null;
}
