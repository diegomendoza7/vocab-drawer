/* French reading passages, A1–C1.
 *
 * Written for this app — no two share a story, and they run through the
 * genres a reader actually meets: a shop dialogue, an email, an ad, a news
 * feature, a letter to the editor, a short story, an argued essay, a column.
 *
 * Each passage:
 *   paras      [[french, english], …] — one pair per paragraph, so the
 *              translation can be shown beside the paragraph it belongs to
 *   questions  answered in writing, in a full sentence:
 *                q / en    the question, and its English
 *                answer    a model answer — shown after the learner's own
 *                key       the ideas an answer should contain, each a list of
 *                          alternatives (see keyIdeas in src/lib/writing.js)
 *   write      a free-writing prompt that grows out of the passage, with a
 *              minimum length in words
 *
 * Facts that appear here (the 2014 EU ruling, "ordinateur", the Norman
 * Conquest) are checkable; the people and places in the stories are
 * invented. scripts/check-reading.mjs holds every passage to its level's
 * length band and every model answer to its own key ideas.
 */
export const FR_PASSAGES = [
  /* ------------------------------------------------------------------ A1 */
  {
    id: "fr-a1-boulangerie",
    level: "A1",
    genre: "dialogue",
    title: "À la boulangerie",
    titleEn: "At the bakery",
    paras: [
      ["Il est huit heures du matin. Léa entre dans la boulangerie de son quartier. Il y a déjà trois personnes devant elle.", "It is eight in the morning. Léa goes into the bakery in her neighbourhood. There are already three people ahead of her."],
      ["— Bonjour madame ! Qu'est-ce que je vous sers ?", "— Good morning, madam! What can I get you?"],
      ["— Bonjour ! Une baguette, s'il vous plaît. Et deux croissants.", "— Hello! A baguette, please. And two croissants."],
      ["— Désolé, il n'y a plus de croissants. Mais nous avons des pains au chocolat.", "— Sorry, there are no croissants left. But we have pains au chocolat."],
      ["— D'accord, alors deux pains au chocolat. C'est combien ?", "— All right, two pains au chocolat then. How much is it?"],
      ["— Ça fait trois euros quarante.", "— That comes to three euros forty."],
      ["Léa paie avec une pièce de deux euros et deux pièces d'un euro. Le boulanger lui rend soixante centimes.", "Léa pays with a two-euro coin and two one-euro coins. The baker gives her sixty cents back."],
      ["— Merci, bonne journée !", "— Thank you, have a nice day!"],
    ],
    questions: [
      { q: "Qu'est-ce que Léa achète finalement ?", en: "What does Léa buy in the end?", answer: "Elle achète une baguette et deux pains au chocolat.", key: [["baguette"], ["pain au chocolat", "pains au chocolat", "chocolat"]] },
      { q: "Combien est-ce que Léa paie ?", en: "How much does Léa pay?", answer: "Elle paie trois euros quarante.", key: [["trois euros quarante", "3,40", "3 euros 40", "quarante"]] },
      { q: "Combien d'argent le boulanger rend-il à Léa ?", en: "How much money does the baker give Léa back?", answer: "Il lui rend soixante centimes.", key: [["soixante", "60"]] },
    ],
    write: { q: "Vous êtes à la boulangerie. Écrivez un petit dialogue : vous achetez deux choses et vous demandez le prix.", en: "You are at the bakery. Write a short dialogue: you buy two things and ask the price.", min: 25 },
  },
  {
    id: "fr-a1-message-tom",
    level: "A1",
    genre: "email",
    title: "Un message de Tom",
    titleEn: "A message from Tom",
    paras: [
      ["Bonjour madame Martin,", "Hello Mrs Martin,"],
      ["Je m'appelle Tom Becker. J'ai seize ans et j'habite à Munich, en Allemagne. En juillet, je vais habiter chez vous pendant trois semaines pour apprendre le français.", "My name is Tom Becker. I am sixteen and I live in Munich, in Germany. In July, I am going to stay with you for three weeks to learn French."],
      ["J'ai une sœur, Anna. Elle a douze ans. Mon père est professeur de mathématiques et ma mère travaille dans un hôpital. Nous avons un chien, Bruno.", "I have a sister, Anna. She is twelve. My father is a maths teacher and my mother works in a hospital. We have a dog, Bruno."],
      ["J'aime le football et la musique. Je joue de la guitare depuis deux ans. Je mange de tout, mais je n'aime pas le poisson.", "I like football and music. I have been playing the guitar for two years. I eat everything, but I don't like fish."],
      ["Est-ce que vous habitez près de la mer ? Et est-ce qu'il y a une école de langue dans votre ville ?", "Do you live near the sea? And is there a language school in your town?"],
      ["À bientôt,\nTom", "See you soon,\nTom"],
    ],
    questions: [
      { q: "Pourquoi Tom va-t-il en France ?", en: "Why is Tom going to France?", answer: "Il va en France pour apprendre le français.", key: [["apprend", "étudier", "cours", "langue"]] },
      { q: "Qu'est-ce que Tom ne mange pas ?", en: "What doesn't Tom eat?", answer: "Il ne mange pas de poisson.", key: [["poisson"]] },
      { q: "Quelles questions Tom pose-t-il à madame Martin ?", en: "What questions does Tom ask Mrs Martin?", answer: "Il demande si elle habite près de la mer et s'il y a une école de langue dans sa ville.", key: [["mer"], ["école"]] },
    ],
    write: { q: "Écrivez un message à une famille d'accueil : présentez-vous, parlez de votre famille et de ce que vous aimez.", en: "Write a message to a host family: introduce yourself, and talk about your family and what you like.", min: 30 },
  },
  {
    id: "fr-a1-semaine-nadia",
    level: "A1",
    genre: "profile",
    title: "La semaine de Nadia",
    titleEn: "Nadia's week",
    paras: [
      ["Nadia est infirmière. Elle travaille à l'hôpital du lundi au jeudi. Elle commence à sept heures et elle finit à quinze heures.", "Nadia is a nurse. She works at the hospital from Monday to Thursday. She starts at seven and finishes at three in the afternoon."],
      ["Le matin, elle se lève à six heures. Elle boit un café, mais elle ne mange pas. Elle prend le bus à six heures et demie.", "In the morning, she gets up at six. She drinks a coffee, but she doesn't eat. She takes the bus at half past six."],
      ["Le vendredi, elle ne travaille pas. Elle fait les courses et elle nettoie son appartement. Le soir, elle va au cinéma avec son amie Julie.", "On Fridays, she doesn't work. She does the shopping and cleans her flat. In the evening, she goes to the cinema with her friend Julie."],
      ["Le samedi, Nadia rend visite à ses parents. Ils habitent à la campagne, à une heure de la ville. Le dimanche, elle se repose : elle lit, elle écoute de la musique et elle dort beaucoup.", "On Saturdays, Nadia visits her parents. They live in the countryside, an hour from the city. On Sundays, she rests: she reads, listens to music and sleeps a lot."],
    ],
    questions: [
      { q: "Combien de jours par semaine Nadia travaille-t-elle ?", en: "How many days a week does Nadia work?", answer: "Elle travaille quatre jours par semaine, du lundi au jeudi.", key: [["quatre", "4", "lundi au jeudi"]] },
      { q: "Qu'est-ce que Nadia fait le vendredi ?", en: "What does Nadia do on Fridays?", answer: "Le vendredi, elle fait les courses, elle nettoie son appartement et elle va au cinéma.", key: [["courses", "achète", "supermarché"], ["nettoie", "ménage", "cinéma", "film"]] },
      { q: "Où habitent les parents de Nadia ?", en: "Where do Nadia's parents live?", answer: "Ils habitent à la campagne, à une heure de la ville.", key: [["campagne"]] },
    ],
    write: { q: "Décrivez votre semaine : quels jours vous travaillez ou étudiez, et ce que vous faites le week-end.", en: "Describe your week: which days you work or study, and what you do at the weekend.", min: 30 },
  },

  /* ------------------------------------------------------------------ A2 */
  {
    id: "fr-a2-weekend-lyon",
    level: "A2",
    genre: "story",
    title: "Un week-end à Lyon",
    titleEn: "A weekend in Lyon",
    paras: [
      ["Le mois dernier, Karim et sa copine Élodie sont partis deux jours à Lyon. Ils ont pris le train à Paris le samedi matin et ils sont arrivés deux heures plus tard.", "Last month, Karim and his girlfriend Élodie went to Lyon for two days. They took the train in Paris on Saturday morning and arrived two hours later."],
      ["D'abord, ils ont laissé leurs sacs à l'hôtel. Ensuite, ils ont visité le Vieux Lyon, avec ses petites rues et ses vieilles maisons. À midi, ils ont mangé dans un bouchon, un restaurant typique de la ville. Karim a adoré le repas, mais Élodie a trouvé la cuisine un peu trop lourde.", "First, they left their bags at the hotel. Then they visited Old Lyon, with its little streets and old houses. At noon, they ate in a bouchon, a restaurant typical of the city. Karim loved the meal, but Élodie found the food a little too heavy."],
      ["L'après-midi, il a commencé à pleuvoir. Ils ne sont pas restés dehors : ils sont allés au musée des Confluences et ils y ont passé trois heures.", "In the afternoon, it started to rain. They didn't stay outside: they went to the Musée des Confluences and spent three hours there."],
      ["Le dimanche, il a fait beau. Ils sont montés à pied jusqu'à la basilique de Fourvière. De là-haut, ils ont vu toute la ville. « C'est la plus belle vue du week-end ! » a dit Élodie. Le soir, ils sont rentrés à Paris, fatigués mais contents.", "On Sunday, the weather was fine. They walked up to the Basilica of Fourvière. From up there, they saw the whole city. 'It's the best view of the weekend!' said Élodie. In the evening, they went back to Paris, tired but happy."],
    ],
    questions: [
      { q: "Comment Karim et Élodie sont-ils allés à Lyon ?", en: "How did Karim and Élodie get to Lyon?", answer: "Ils sont allés à Lyon en train.", key: [["train", "TGV"]] },
      { q: "Qu'est-ce qu'Élodie a pensé du repas au bouchon ?", en: "What did Élodie think of the meal at the bouchon?", answer: "Elle a trouvé la cuisine un peu trop lourde.", key: [["lourd", "trop riche", "gras"]] },
      { q: "Pourquoi sont-ils allés au musée le samedi après-midi ?", en: "Why did they go to the museum on Saturday afternoon?", answer: "Ils sont allés au musée parce qu'il pleuvait.", key: [["pleu", "pluie", "mauvais temps"]] },
    ],
    write: { q: "Racontez un voyage ou une sortie. Où êtes-vous allé(e) ? Qu'est-ce que vous avez fait ? Qu'est-ce que vous avez aimé ?", en: "Tell the story of a trip or a day out. Where did you go? What did you do? What did you like?", min: 45 },
  },
  {
    id: "fr-a2-colocation",
    level: "A2",
    genre: "notice",
    title: "Chambre à louer",
    titleEn: "Room to rent",
    paras: [
      ["Chambre à louer dans une colocation, à Toulouse, quartier Saint-Cyprien.", "Room to rent in a shared flat, in Toulouse, Saint-Cyprien district."],
      ["Nous sommes trois étudiants — Inès, 22 ans, Hugo, 24 ans, et Sofia, 21 ans — et nous cherchons une quatrième personne pour la rentrée de septembre.", "We are three students — Inès, 22, Hugo, 24, and Sofia, 21 — and we are looking for a fourth person for the start of the academic year in September."],
      ["L'appartement est grand et lumineux : quatre chambres, un salon, une cuisine équipée et deux salles de bains. La chambre libre fait douze mètres carrés, avec un bureau et un grand placard. Le métro est à cinq minutes à pied.", "The flat is big and bright: four bedrooms, a living room, a fitted kitchen and two bathrooms. The free room is twelve square metres, with a desk and a large wardrobe. The metro is five minutes' walk away."],
      ["Le loyer est de 420 euros par mois, charges comprises : l'eau, l'électricité et internet.", "The rent is 420 euros a month, bills included: water, electricity and internet."],
      ["Chez nous, on cuisine souvent ensemble et on partage les tâches ménagères. Les animaux ne sont pas acceptés, parce que Hugo est allergique aux chats. On ne fume pas dans l'appartement, mais il y a un balcon.", "At our place, we often cook together and share the housework. Pets are not allowed, because Hugo is allergic to cats. We don't smoke in the flat, but there is a balcony."],
      ["Vous êtes intéressé ou intéressée ? Envoyez-nous un message et présentez-vous en quelques lignes !", "Interested? Send us a message and introduce yourself in a few lines!"],
    ],
    questions: [
      { q: "Combien coûte la chambre, et qu'est-ce qui est compris dans le prix ?", en: "How much does the room cost, and what is included in the price?", answer: "Elle coûte 420 euros par mois, avec l'eau, l'électricité et internet.", key: [["420", "quatre cent vingt"], ["eau", "électricité", "internet", "charges"]] },
      { q: "Pourquoi les animaux ne sont-ils pas acceptés ?", en: "Why are pets not allowed?", answer: "Parce que Hugo est allergique aux chats.", key: [["allerg"]] },
      { q: "Où est-ce qu'on peut fumer ?", en: "Where can you smoke?", answer: "On peut fumer sur le balcon.", key: [["balcon"]] },
    ],
    write: { q: "Répondez à l'annonce : présentez-vous et expliquez pourquoi vous voulez cette chambre.", en: "Reply to the ad: introduce yourself and explain why you want this room.", min: 45 },
  },
  {
    id: "fr-a2-desolee-samedi",
    level: "A2",
    genre: "email",
    title: "Désolée pour samedi",
    titleEn: "Sorry about Saturday",
    paras: [
      ["Salut Camille,", "Hi Camille,"],
      ["Je suis vraiment désolée, mais je ne peux pas venir à ton anniversaire samedi. Ma petite sœur s'est cassé le bras hier au parc et mes parents sont en vacances en Espagne. Donc c'est moi qui m'occupe d'elle ce week-end.", "I'm really sorry, but I can't come to your birthday on Saturday. My little sister broke her arm at the park yesterday and my parents are on holiday in Spain. So I'm the one looking after her this weekend."],
      ["Elle va bien, ne t'inquiète pas ! Elle a un plâtre bleu et tous ses amis veulent écrire dessus.", "She's fine, don't worry! She has a blue cast and all her friends want to write on it."],
      ["J'ai déjà acheté ton cadeau. Est-ce qu'on peut se voir la semaine prochaine ? Je suis libre mardi et jeudi soir. On pourrait aller manger une pizza, et je te donne ton cadeau.", "I've already bought your present. Can we meet next week? I'm free on Tuesday and Thursday evening. We could go for a pizza, and I'll give you your present."],
      ["Passe une super soirée et dis bonjour à tout le monde !\nBisous,\nManon", "Have a great evening and say hello to everyone!\nLove,\nManon"],
    ],
    questions: [
      { q: "Pourquoi Manon ne peut-elle pas aller à l'anniversaire ?", en: "Why can't Manon go to the birthday party?", answer: "Elle doit s'occuper de sa petite sœur, qui s'est cassé le bras, parce que ses parents sont en vacances.", key: [["sœur"], ["occup", "garde", "bras", "parents", "vacances"]] },
      { q: "Qu'est-ce que Manon propose à Camille ?", en: "What does Manon suggest to Camille?", answer: "Elle propose de manger une pizza ensemble mardi ou jeudi soir.", key: [["pizza", "manger", "restaurant", "voir"], ["mardi", "jeudi", "semaine prochaine"]] },
      { q: "Comment va la sœur de Manon ?", en: "How is Manon's sister?", answer: "Elle va bien : elle a un plâtre bleu et ses amis veulent écrire dessus.", key: [["bien", "ça va"], ["plâtre"]] },
    ],
    write: { q: "Vous ne pouvez pas aller à une fête. Écrivez un message pour vous excuser, expliquez pourquoi et proposez autre chose.", en: "You can't go to a party. Write a message to apologise, explain why, and suggest something else.", min: 45 },
  },

  /* ------------------------------------------------------------------ B1 */
  {
    id: "fr-b1-velo-paris",
    level: "B1",
    genre: "article",
    title: "À Paris, le vélo change la ville",
    titleEn: "In Paris, the bicycle is changing the city",
    paras: [
      ["Il y a encore quinze ans, peu de Parisiens osaient traverser la ville à vélo. Les voitures roulaient vite, les pistes cyclables étaient rares et beaucoup de gens trouvaient ça dangereux. Aujourd'hui, le paysage a changé : aux heures de pointe, sur certains grands axes, on voit désormais plus de vélos que de voitures.", "Only fifteen years ago, few Parisians dared to cross the city by bike. Cars drove fast, cycle lanes were rare and many people found it dangerous. Today the landscape has changed: at rush hour, on some major roads, you now see more bikes than cars."],
      ["Plusieurs raisons expliquent ce succès. La ville a créé des centaines de kilomètres de nouvelles pistes, surtout depuis 2020. Les vélos électriques permettent aussi à des personnes plus âgées ou moins sportives de faire de longs trajets sans arriver épuisées au bureau. Et puis, pour beaucoup d'habitants, le vélo est tout simplement plus rapide que le métro sur les distances moyennes.", "Several reasons explain this success. The city has built hundreds of kilometres of new lanes, especially since 2020. Electric bikes also let older or less sporty people make long journeys without arriving at the office exhausted. And for many residents, cycling is simply faster than the metro over medium distances."],
      ["Tout le monde n'est pas convaincu, pourtant. Certains commerçants se plaignent que leurs clients ne peuvent plus se garer devant leur magasin. Des piétons disent qu'ils ont peur des cyclistes qui roulent sur les trottoirs ou qui ne s'arrêtent pas aux feux rouges. Quant aux chauffeurs de taxi, ils passent plus de temps dans les embouteillages.", "Not everyone is convinced, though. Some shopkeepers complain that their customers can no longer park in front of their shop. Pedestrians say they are afraid of cyclists who ride on the pavement or don't stop at red lights. As for taxi drivers, they spend more time in traffic jams."],
      ["Pour la mairie, le choix est clair : moins de voitures, c'est moins de bruit et un air plus propre. Mais pour que la cohabitation fonctionne, il faudra que chacun apprenne à partager la rue.", "For the city hall, the choice is clear: fewer cars mean less noise and cleaner air. But for everyone to live alongside each other, each person will have to learn to share the street."],
    ],
    questions: [
      { q: "Pourquoi peu de Parisiens prenaient-ils le vélo il y a quinze ans ?", en: "Why did few Parisians cycle fifteen years ago?", answer: "Parce que les voitures roulaient vite, qu'il y avait peu de pistes cyclables et que c'était dangereux.", key: [["dangereu", "danger", "peur", "risque"], ["piste", "voiture"]] },
      { q: "Comment les vélos électriques ont-ils changé la situation ?", en: "How have electric bikes changed the situation?", answer: "Ils permettent aux personnes âgées ou moins sportives de faire de longs trajets sans être épuisées.", key: [["âgée", "âgés", "vieux", "vieilles", "sporti", "tout le monde"], ["long", "fatigu", "épuis", "effort", "loin"]] },
      { q: "Quels problèmes le vélo pose-t-il selon ses critiques ? Donnez deux exemples.", en: "What problems does cycling cause, according to its critics? Give two examples.", answer: "Les commerçants disent que leurs clients ne peuvent plus se garer, et les piétons ont peur des cyclistes qui roulent sur les trottoirs.", key: [["garer", "stationn", "parking", "commerç", "client"], ["piéton", "trottoir", "feu", "taxi", "embouteill"]] },
      { q: "Que veut dire « la cohabitation » dans le dernier paragraphe ? Expliquez avec vos mots.", en: "What does 'la cohabitation' mean in the last paragraph? Explain in your own words.", answer: "Cela veut dire que les cyclistes, les piétons et les automobilistes doivent vivre ensemble dans la rue sans conflit.", key: [["ensemble", "partag", "tous", "chacun", "respect"], ["cycliste", "piéton", "voiture", "automobil", "vélo"]] },
    ],
    write: { q: "Dans votre ville, faut-il donner plus de place aux vélos ? Donnez votre avis avec deux arguments.", en: "In your town, should bikes be given more space? Give your opinion with two arguments.", min: 70 },
  },
  {
    id: "fr-b1-premier-emploi",
    level: "B1",
    genre: "story",
    title: "Mon premier emploi",
    titleEn: "My first job",
    paras: [
      ["J'avais dix-sept ans quand j'ai trouvé mon premier emploi d'été, dans un café au bord de la mer, en Bretagne. Je devais servir les clients en terrasse de onze heures à dix-neuf heures, six jours sur sept. Je pensais que ce serait facile. Je me trompais.", "I was seventeen when I found my first summer job, in a café by the sea in Brittany. I had to serve customers on the terrace from eleven to seven, six days a week. I thought it would be easy. I was wrong."],
      ["Le premier jour, il faisait très beau et la terrasse était pleine. Je courais entre les tables avec des plateaux trop lourds, j'oubliais les commandes et je confondais les cafés crème avec les chocolats chauds. Vers quinze heures, j'ai fait tomber un plateau entier devant une famille de six personnes. Le silence qui a suivi a duré une éternité.", "On the first day, the weather was lovely and the terrace was full. I was running between the tables with trays that were too heavy, forgetting orders and mixing up white coffees with hot chocolates. Around three o'clock, I dropped a whole tray in front of a family of six. The silence that followed lasted an eternity."],
      ["J'étais sûr que le patron allait me renvoyer. Au lieu de ça, il m'a apporté un balai, il m'a aidé à tout ramasser et il m'a dit : « Tout le monde casse un plateau un jour. L'important, c'est de ne pas en casser deux. » Ensuite, il m'a montré comment porter un plateau d'une seule main, près du corps.", "I was sure the boss was going to fire me. Instead, he brought me a broom, helped me pick everything up and said: 'Everyone breaks a tray one day. What matters is not breaking two.' Then he showed me how to carry a tray with one hand, close to the body."],
      ["J'ai travaillé dans ce café pendant trois étés. Je n'ai jamais cassé d'autre plateau, et j'ai surtout appris une chose que je n'ai pas oubliée : on apprend mieux quand quelqu'un nous laisse le droit de nous tromper.", "I worked in that café for three summers. I never broke another tray, and above all I learned something I have not forgotten: we learn better when someone gives us the right to make mistakes."],
    ],
    questions: [
      { q: "Pourquoi le premier jour a-t-il été si difficile pour le narrateur ?", en: "Why was the first day so hard for the narrator?", answer: "Parce que la terrasse était pleine, qu'il oubliait les commandes et que les plateaux étaient trop lourds.", key: [["plein", "beaucoup de clients", "monde"], ["oubli", "confond", "lourd", "plateau"]] },
      { q: "Qu'est-ce que le narrateur attendait après l'accident, et que s'est-il passé en réalité ?", en: "What did the narrator expect after the accident, and what actually happened?", answer: "Il pensait que le patron allait le renvoyer, mais le patron l'a aidé à ramasser et lui a montré comment porter un plateau.", key: [["renvo", "licenci", "virer", "perdre son travail", "perdre son emploi"], ["aid", "montr", "ramass", "gentil", "balai"]] },
      { q: "Que signifie la phrase du patron : « L'important, c'est de ne pas en casser deux » ?", en: "What does the boss's sentence mean: 'What matters is not breaking two'?", answer: "Elle signifie qu'une erreur est normale, mais qu'il faut apprendre de ses erreurs pour ne pas les répéter.", key: [["erreur", "tromp", "faute", "accident"], ["appren", "répét", "recommenc", "deux fois", "encore"]] },
      { q: "Quelle leçon le narrateur a-t-il tirée de cette expérience ?", en: "What lesson did the narrator draw from this experience?", answer: "Il a compris qu'on apprend mieux quand on a le droit de se tromper.", key: [["droit", "permet", "accept", "laisse"], ["tromp", "erreur"]] },
    ],
    write: { q: "Racontez votre premier emploi, ou une « première fois » difficile. Que s'est-il passé et qu'avez-vous appris ?", en: "Tell the story of your first job, or a difficult 'first time'. What happened, and what did you learn?", min: 80 },
  },
  {
    id: "fr-b1-telephones-ecole",
    level: "B1",
    genre: "letter",
    title: "Courrier des lecteurs : les téléphones à l'école",
    titleEn: "Letters to the editor: phones at school",
    paras: [
      ["Madame, Monsieur,", "Dear Sir or Madam,"],
      ["Je suis professeure de français dans un collège depuis vingt ans et j'ai lu avec intérêt votre article sur l'interdiction des téléphones portables à l'école. Je voudrais apporter mon témoignage.", "I have been a French teacher at a secondary school for twenty years and I read your article on banning mobile phones at school with interest. I would like to share my experience."],
      ["Dans mon établissement, les élèves doivent laisser leur téléphone dans leur casier depuis l'année dernière. Au début, beaucoup ont protesté, et certains parents aussi : ils voulaient pouvoir joindre leurs enfants à tout moment. Mais après quelques semaines, j'ai remarqué des changements. Pendant les récréations, les élèves discutent de nouveau entre eux, jouent au ballon ou lisent. En classe, ils sont plus concentrés.", "At my school, pupils have had to leave their phones in their lockers since last year. At first, many protested, and some parents did too: they wanted to be able to reach their children at any time. But after a few weeks, I noticed changes. During break, pupils talk to each other again, play ball or read. In class, they are more focused."],
      ["Je ne dis pas que le téléphone est l'ennemi. Bien utilisé, c'est un outil formidable pour chercher une information ou enregistrer un exposé. Mais un adolescent de douze ans a du mal à résister aux notifications — et nous, les adultes, aussi, d'ailleurs.", "I'm not saying the phone is the enemy. Used well, it is a wonderful tool for looking something up or recording a presentation. But a twelve-year-old finds it hard to resist notifications — and so do we adults, for that matter."],
      ["À mon avis, l'école doit rester un lieu où l'on apprend à se concentrer et à se parler en face. Les téléphones peuvent attendre la sonnerie de fin de journée.", "In my opinion, school must remain a place where we learn to concentrate and to talk face to face. Phones can wait for the bell at the end of the day."],
      ["Veuillez agréer, Madame, Monsieur, mes salutations distinguées.\nHélène R., Nantes", "Yours faithfully,\nHélène R., Nantes"],
    ],
    questions: [
      { q: "Pourquoi certains parents étaient-ils contre l'interdiction au début ?", en: "Why were some parents against the ban at first?", answer: "Ils voulaient pouvoir joindre leurs enfants à tout moment.", key: [["joindre", "appeler", "contacter", "téléphoner", "parler à leurs enfants"]] },
      { q: "Quels changements la professeure a-t-elle remarqués ? Donnez-en deux.", en: "What changes did the teacher notice? Give two.", answer: "Les élèves discutent de nouveau pendant les récréations et ils sont plus concentrés en classe.", key: [["discut", "parlent", "jouent", "ballon", "lisent", "lire"], ["concentr", "attenti"]] },
      { q: "La professeure pense-t-elle que le téléphone est une mauvaise chose ? Justifiez.", en: "Does the teacher think the phone is a bad thing? Explain.", answer: "Non, elle pense que c'est un outil formidable s'il est bien utilisé, mais que les jeunes ont du mal à résister aux notifications.", key: [["outil", "utile", "bien utilisé", "information", "exposé"], ["notification", "résist", "distrai"]] },
      { q: "Que veut dire « se parler en face » ?", en: "What does 'se parler en face' mean?", answer: "Cela veut dire se parler directement, en personne, sans écran.", key: [["direct", "personne", "sans écran", "sans téléphone", "yeux", "réel"]] },
    ],
    write: { q: "Écrivez à votre tour une lettre au journal : faut-il interdire les téléphones à l'école ? Donnez votre avis et deux arguments.", en: "Write your own letter to the paper: should phones be banned at school? Give your opinion and two arguments.", min: 80 },
  },

  /* ------------------------------------------------------------------ B2 */
  {
    id: "fr-b2-teletravail",
    level: "B2",
    genre: "essay",
    title: "Le télétravail : liberté retrouvée ou solitude nouvelle ?",
    titleEn: "Remote work: freedom regained or a new loneliness?",
    paras: [
      ["Pendant longtemps, travailler de chez soi était réservé à quelques professions : traducteurs, écrivains, graphistes indépendants. La crise sanitaire de 2020 a tout bouleversé. Du jour au lendemain, des millions de salariés ont transformé leur cuisine en bureau, et beaucoup n'ont jamais complètement repris le chemin de l'entreprise.", "For a long time, working from home was reserved for a few professions: translators, writers, freelance graphic designers. The 2020 health crisis turned everything upside down. Overnight, millions of employees turned their kitchens into offices, and many never fully went back to the workplace."],
      ["Les avantages sont connus. Moins de temps perdu dans les transports, c'est plus de temps pour dormir, faire du sport ou s'occuper de ses enfants. Certains salariés affirment même être plus efficaces à la maison, loin des interruptions permanentes de l'open space. Pour les entreprises, le télétravail permet de réduire la taille des bureaux et d'attirer des candidats qui habitent loin.", "The advantages are well known. Less time lost commuting means more time to sleep, exercise or look after one's children. Some employees even claim to be more efficient at home, far from the constant interruptions of the open-plan office. For companies, remote work makes it possible to reduce office space and to attract candidates who live far away."],
      ["Cependant, le tableau n'est pas entièrement rose. Sans collègues autour de soi, la frontière entre vie professionnelle et vie privée devient floue : on consulte ses courriels le soir, on répond à un message le dimanche. Les jeunes salariés, en particulier, risquent d'en souffrir. C'est souvent en observant les autres, en posant une question devant la machine à café, que l'on apprend un métier. Or, ces échanges informels passent mal par écran interposé.", "However, the picture is not entirely rosy. Without colleagues around, the line between work and private life becomes blurred: you check your email in the evening, you answer a message on Sunday. Young employees, in particular, risk suffering from this. It is often by watching others, by asking a question at the coffee machine, that one learns a trade. Yet these informal exchanges come across badly through a screen."],
      ["Le télétravail creuse aussi des inégalités moins visibles. Il suppose un logement assez grand pour y installer un bureau, une connexion fiable et une certaine discipline personnelle. Or, tous les salariés n'en disposent pas, et beaucoup de métiers — caissière, infirmier, ouvrier — ne peuvent tout simplement pas s'exercer à distance.", "Remote work also deepens less visible inequalities. It requires a home big enough to set up a desk, a reliable connection and a certain personal discipline. Yet not every employee has these, and many jobs — cashier, nurse, factory worker — simply cannot be done remotely."],
      ["La plupart des entreprises semblent aujourd'hui s'orienter vers une solution hybride : deux ou trois jours au bureau, le reste à la maison. Ce compromis ne satisfait pas tout le monde, mais il a le mérite de reconnaître une réalité : on ne travaille pas seulement pour produire, mais aussi pour appartenir à un groupe.", "Most companies now seem to be moving towards a hybrid solution: two or three days at the office, the rest at home. This compromise doesn't satisfy everyone, but it has the merit of recognising a reality: we don't work only to produce, but also to belong to a group."],
    ],
    questions: [
      { q: "Qu'est-ce qui a changé en 2020, selon le texte ?", en: "What changed in 2020, according to the text?", answer: "Avec la crise sanitaire, des millions de salariés se sont mis à travailler chez eux du jour au lendemain.", key: [["crise", "covid", "pandémie", "sanitaire", "confinement"], ["maison", "chez eux", "chez soi", "domicile", "télétravail"]] },
      { q: "Pourquoi les jeunes salariés risquent-ils de souffrir du télétravail ?", en: "Why might young employees suffer from remote work?", answer: "Parce qu'on apprend souvent un métier en observant ses collègues et en leur posant des questions, ce qui est difficile à distance.", key: [["observ", "regard", "collègue", "question", "échange"], ["écran", "distance", "difficile", "seul"]] },
      { q: "Expliquez l'expression « la frontière entre vie professionnelle et vie privée devient floue ».", en: "Explain the phrase 'the line between work and private life becomes blurred'.", answer: "Cela signifie qu'on ne sait plus bien quand on travaille et quand on se repose, par exemple parce qu'on lit ses courriels le soir.", key: [["sépar", "distingu", "limite", "mélang", "quand"], ["soir", "dimanche", "repos", "courriel", "mail", "week-end"]] },
      { q: "Selon l'auteur, pourquoi la solution hybride est-elle intéressante ?", en: "According to the author, why is the hybrid solution worthwhile?", answer: "Parce qu'elle reconnaît qu'on travaille aussi pour appartenir à un groupe, pas seulement pour produire.", key: [["groupe", "appartenir", "social", "ensemble", "équipe", "collègue"]] },
    ],
    write: { q: "Préférez-vous travailler (ou étudier) chez vous ou sur place ? Présentez les deux côtés avant de donner votre avis.", en: "Do you prefer working (or studying) from home or on site? Present both sides before giving your view.", min: 110 },
  },
  {
    id: "fr-b2-marche-village",
    level: "B2",
    genre: "feature",
    title: "Le marché qui a réveillé un village",
    titleEn: "The market that woke up a village",
    paras: [
      ["Il y a dix ans, ce village de l'Ardèche comptait encore une boulangerie, un bar-tabac et une école de deux classes. Puis la boulangerie a fermé, faute de repreneur, et l'école a perdu une classe. Comme dans beaucoup de communes rurales, les habitants faisaient leurs courses au supermarché, à vingt kilomètres, et la place centrale restait vide la plupart du temps.", "Ten years ago, this village in the Ardèche still had a bakery, a bar-tobacconist and a two-class school. Then the bakery closed, because no one took it over, and the school lost a class. As in many rural communes, residents did their shopping at the supermarket twenty kilometres away, and the central square stood empty most of the time."],
      ["C'est une jeune maraîchère, installée depuis peu, qui a eu l'idée de relancer un marché le samedi matin. « Au départ, nous étions quatre producteurs et une trentaine de clients, raconte-t-elle. Je pensais que ça durerait un été. » Aujourd'hui, une vingtaine d'exposants viennent chaque semaine : fromagers, apiculteurs, un boulanger qui cuit son pain au feu de bois, et même un réparateur de vélos.", "It was a young market gardener, recently settled there, who had the idea of reviving a Saturday-morning market. 'At the start, there were four of us producers and about thirty customers,' she says. 'I thought it would last one summer.' Today, some twenty stallholders come every week: cheesemakers, beekeepers, a baker who bakes his bread in a wood-fired oven, and even a bicycle repairer."],
      ["L'organisation repose sur une association de bénévoles. Chaque samedi, ils montent les barnums à six heures du matin, attribuent les emplacements et tiennent une buvette dont les bénéfices financent des animations : un concert en juin, un vide-grenier à l'automne. « Personne n'est payé, mais tout le monde y gagne quelque chose », résume le trésorier.", "The whole thing runs on an association of volunteers. Every Saturday they put up the gazebos at six in the morning, allocate the pitches and run a refreshment stall whose profits pay for events: a concert in June, a car-boot sale in the autumn. 'Nobody gets paid, but everybody gains something,' the treasurer sums up."],
      ["Le succès ne se mesure pas seulement en chiffre d'affaires. Le marché est devenu le lieu où l'on se retrouve, où les nouveaux arrivants rencontrent les anciens, où les enfants courent entre les étals pendant que les parents discutent. Le bar, qui envisageait de fermer, ouvre désormais le samedi dès sept heures.", "Success isn't measured only in turnover. The market has become the place where people meet up, where newcomers meet long-standing residents, where children run between the stalls while their parents chat. The bar, which was thinking of closing, now opens on Saturdays from seven o'clock."],
      ["Tout n'est pas réglé pour autant. Les prix restent plus élevés qu'en grande surface, et certains habitants aux revenus modestes continuent de faire l'essentiel de leurs achats ailleurs. La mairie réfléchit à un système de bons d'achat pour rendre le marché accessible à tous. Car un lieu de rencontre qui exclut une partie du village, souligne le maire, ne serait qu'une demi-réussite.", "Not everything is solved, however. Prices remain higher than in supermarkets, and some residents on modest incomes still do most of their shopping elsewhere. The town hall is considering a voucher scheme to make the market accessible to everyone. Because a meeting place that leaves out part of the village, the mayor stresses, would be only half a success."],
    ],
    questions: [
      { q: "Décrivez la situation du village avant la création du marché.", en: "Describe the village's situation before the market was created.", answer: "La boulangerie avait fermé, l'école avait perdu une classe et les habitants faisaient leurs courses au supermarché, loin du village.", key: [["boulangerie", "fermé", "école", "classe"], ["supermarché", "vide", "loin", "vingt kilomètres"]] },
      { q: "Pourquoi l'auteur dit-il que « le succès ne se mesure pas seulement en chiffre d'affaires » ?", en: "Why does the author say that 'success isn't measured only in turnover'?", answer: "Parce que le marché a aussi recréé du lien social : les habitants s'y retrouvent et le bar reste ouvert.", key: [["retrouv", "rencontr", "lien", "social", "discut", "ensemble"]] },
      { q: "Quel problème le marché n'a-t-il pas résolu ?", en: "What problem has the market not solved?", answer: "Les prix sont plus élevés qu'au supermarché, donc les habitants aux revenus modestes ne peuvent pas toujours y acheter.", key: [["prix", "cher", "élevé"], ["revenu", "modeste", "pauvre", "argent", "moyens"]] },
      { q: "Que signifie « une demi-réussite » dans la dernière phrase ?", en: "What does 'half a success' mean in the last sentence?", answer: "Cela veut dire que le projet ne serait réussi qu'à moitié s'il excluait les habitants les plus pauvres.", key: [["moitié", "partiel", "pas complèt", "incomplet"], ["exclu", "pauvre", "pas tout le monde", "partie"]] },
    ],
    write: { q: "Quel lieu ou quel événement crée du lien dans votre quartier ou votre ville ? Décrivez-le et expliquez son importance.", en: "What place or event brings people together in your neighbourhood or town? Describe it and explain why it matters.", min: 110 },
  },
  {
    id: "fr-b2-dernier-train",
    level: "B2",
    genre: "story",
    title: "Le dernier train",
    titleEn: "The last train",
    paras: [
      ["Quand Marc est arrivé sur le quai, le panneau affichait déjà « supprimé » à côté du train de 23 h 12. Il a relu trois fois, comme si les lettres allaient changer d'avis. Le prochain train partait à 5 h 48. Il avait un entretien d'embauche à Rennes à neuf heures, et son téléphone n'avait plus que huit pour cent de batterie.", "When Marc reached the platform, the board already said 'cancelled' next to the 11:12 p.m. train. He read it three times, as if the letters might change their mind. The next train left at 5:48. He had a job interview in Rennes at nine, and his phone had only eight per cent battery left."],
      ["Dans la salle d'attente, il n'y avait qu'une vieille dame, assise bien droite, un sac de toile sur les genoux. Elle tricotait. Marc s'est assis à deux chaises d'elle, en soupirant plus fort qu'il ne l'aurait voulu.", "In the waiting room there was only an old lady, sitting very upright, a canvas bag on her knees. She was knitting. Marc sat down two chairs away from her, sighing louder than he would have liked."],
      ["« Vous allez loin ? » a-t-elle demandé sans lever les yeux. Il a expliqué l'entretien, le train supprimé, la batterie. Elle a hoché la tête, a fouillé dans son sac et en a sorti une thermos de café et un chargeur. « Mon petit-fils m'oblige à le prendre partout. Je ne sais même pas m'en servir. »", "'Going far?' she asked without looking up. He explained about the interview, the cancelled train, the battery. She nodded, rummaged in her bag and took out a thermos of coffee and a charger. 'My grandson makes me take it everywhere. I don't even know how to use it.'"],
      ["Ils ont parlé une bonne partie de la nuit. Elle avait été cheminote pendant trente-cinq ans ; elle connaissait chaque ligne de la région et racontait les grèves, les tempêtes, les passagers célèbres qu'elle prétendait avoir croisés. Vers quatre heures, Marc s'est rendu compte qu'il n'avait pas pensé à son entretien depuis longtemps, et qu'il n'avait plus peur.", "They talked for a good part of the night. She had been a railway worker for thirty-five years; she knew every line in the region and told stories of strikes, storms, and the famous passengers she claimed to have met. Around four, Marc realised he had not thought about his interview for a long time, and that he was no longer afraid."],
      ["À 5 h 48, le train est entré en gare. Quand Marc s'est retourné pour lui dire au revoir, la vieille dame rangeait déjà son tricot. « Allez-y, a-t-elle dit. Moi, j'attends le suivant. Je ne suis pas pressée. » Ce n'est que dans le train qu'il a compris qu'elle ne lui avait jamais dit où elle allait.", "At 5:48 the train pulled in. When Marc turned to say goodbye, the old lady was already putting her knitting away. 'Go on,' she said. 'I'll wait for the next one. I'm in no hurry.' It was only on the train that he realised she had never told him where she was going."],
    ],
    questions: [
      { q: "Pourquoi la suppression du train pose-t-elle un problème particulier à Marc ?", en: "Why is the cancelled train a particular problem for Marc?", answer: "Parce qu'il a un entretien d'embauche à Rennes le lendemain matin et que son téléphone est presque déchargé.", key: [["entretien", "embauche", "travail", "emploi"]] },
      { q: "Comment la vieille dame aide-t-elle Marc ?", en: "How does the old lady help Marc?", answer: "Elle lui donne du café et un chargeur, et surtout elle lui parle toute la nuit, ce qui le rassure.", key: [["chargeur", "café", "thermos"], ["parl", "discut", "raconte", "rassur", "calme", "compagnie"]] },
      { q: "Qu'est-ce qui montre que Marc a changé pendant la nuit ?", en: "What shows that Marc changed during the night?", answer: "Vers quatre heures, il se rend compte qu'il ne pense plus à son entretien et qu'il n'a plus peur.", key: [["peur", "stress", "angoiss", "calme", "inquiet"]] },
      { q: "Comment peut-on comprendre la dernière phrase de l'histoire ? Proposez une interprétation.", en: "How can we read the story's last sentence? Suggest an interpretation.", answer: "On peut penser que la vieille dame n'allait nulle part et qu'elle était restée pour tenir compagnie à Marc.", key: [["nulle part", "aucun", "pas partir", "restée", "compagnie", "aider", "gare", "mystér", "seule"]] },
    ],
    write: { q: "Racontez une rencontre inattendue qui a changé votre journée, vraie ou inventée.", en: "Tell the story of an unexpected encounter that changed your day, real or invented.", min: 120 },
  },

  /* ------------------------------------------------------------------ C1 */
  {
    id: "fr-c1-droit-oubli",
    level: "C1",
    genre: "essay",
    title: "Le droit à l'oubli à l'ère numérique",
    titleEn: "The right to be forgotten in the digital age",
    paras: [
      ["Longtemps, l'oubli a été une donnée naturelle de l'existence. Une erreur de jeunesse, un propos malheureux, une photographie embarrassante finissaient par s'effacer des mémoires, faute de traces. Internet a renversé cet équilibre : désormais, ce qui a été publié une fois peut ressurgir des années plus tard, hors de son contexte, à la faveur d'une simple recherche.", "For a long time, forgetting was a natural given of existence. A youthful mistake, an unfortunate remark, an embarrassing photograph eventually faded from memory, for lack of traces. The Internet has overturned that balance: now, what has been published once can resurface years later, out of context, thanks to a simple search."],
      ["C'est pour répondre à ce problème que la Cour de justice de l'Union européenne a consacré, en 2014, ce que l'on appelle aujourd'hui le droit au déréférencement : un particulier peut demander à un moteur de recherche de ne plus associer son nom à des informations inadéquates, qui ne sont pas ou plus pertinentes, ou excessives. L'information elle-même n'est pas supprimée ; elle devient seulement plus difficile à trouver.", "It was to address this problem that the Court of Justice of the European Union established, in 2014, what is now called the right to delisting: an individual may ask a search engine to stop linking their name to information that is inadequate, irrelevant or no longer relevant, or excessive. The information itself is not deleted; it simply becomes harder to find."],
      ["Ce droit ne va pourtant pas de soi. Ses détracteurs y voient une menace pour la liberté d'expression et pour le travail des historiens : qui décidera de ce qui mérite d'être oublié ? Un homme politique pourrait-il faire disparaître un scandale ancien au motif qu'il date ? Pour éviter ces dérives, les demandes sont examinées au cas par cas, en mettant en balance le respect de la vie privée et l'intérêt du public à accéder à l'information.", "Yet this right is not self-evident. Its critics see it as a threat to freedom of expression and to the work of historians: who will decide what deserves to be forgotten? Could a politician make an old scandal vanish on the grounds that it is old? To prevent such abuses, requests are examined case by case, weighing respect for private life against the public's interest in access to the information."],
      ["Le règlement européen sur la protection des données, entré en application en 2018, a depuis inscrit dans son article 17 un « droit à l'effacement ». Reste une limite de taille : en 2019, la même Cour a jugé qu'un moteur de recherche n'était pas tenu d'appliquer le déréférencement au-delà des versions européennes de son service. Une information écartée des résultats à Paris peut donc demeurer accessible depuis New York — ce qui rappelle que le droit s'arrête souvent aux frontières que le réseau ignore.", "The European data-protection regulation, in force since 2018, has since written a 'right to erasure' into its Article 17. One major limit remains: in 2019 the same Court ruled that a search engine was not obliged to apply delisting beyond the European versions of its service. Information removed from the results in Paris can therefore remain accessible from New York — a reminder that the law often stops at borders the network ignores."],
      ["Au fond, le débat dépasse la technique. Il pose une question que chaque société doit trancher : a-t-on le droit de changer, et que les autres le reconnaissent ? Une démocratie qui n'oublierait rien risquerait de condamner chacun à rester prisonnier de sa pire version. Une démocratie qui oublierait trop facilement, en revanche, perdrait la mémoire de ce qui lui est arrivé. Entre ces deux écueils, le droit à l'oubli n'est ni une solution miracle ni une censure déguisée, mais un compromis toujours fragile.", "At bottom, the debate goes beyond technology. It raises a question every society must settle: do we have the right to change, and to have others recognise it? A democracy that forgot nothing would risk condemning everyone to remain a prisoner of their worst self. A democracy that forgot too easily, on the other hand, would lose the memory of what happened to it. Between these two pitfalls, the right to be forgotten is neither a miracle cure nor censorship in disguise, but an ever-fragile compromise."],
    ],
    questions: [
      { q: "En quoi Internet a-t-il « renversé l'équilibre » de l'oubli ?", en: "In what way has the Internet 'overturned the balance' of forgetting?", answer: "Avant, les erreurs s'effaçaient avec le temps, alors qu'aujourd'hui une information publiée peut réapparaître des années plus tard, hors de son contexte.", key: [["effaç", "dispar", "temps", "mémoire"], ["réappar", "ressurg", "revien", "des années", "toujours", "reste"]] },
      { q: "Que permet exactement le droit au déréférencement, et que ne permet-il pas ?", en: "What exactly does the right to delisting allow, and what does it not allow?", answer: "Il permet de demander à un moteur de recherche de ne plus associer son nom à certaines informations, mais il ne supprime pas l'information elle-même.", key: [["moteur", "associ", "nom", "résultat", "google"], ["supprim", "effac", "existe", "reste", "pas détrui"]] },
      { q: "Quelles objections les détracteurs de ce droit formulent-ils ?", en: "What objections do critics of this right raise?", answer: "Ils craignent qu'il menace la liberté d'expression et le travail des historiens, et qu'un homme politique puisse faire disparaître un scandale.", key: [["expression", "liberté", "censure", "presse"], ["historien", "politique", "scandale", "mémoire"]] },
      { q: "Expliquez l'expression « rester prisonnier de sa pire version ».", en: "Explain the phrase 'remain a prisoner of one's worst self'.", answer: "Cela signifie qu'on serait toujours jugé sur sa plus grave erreur, sans pouvoir montrer qu'on a changé.", key: [["erreur", "faute", "passé", "grave"], ["chang", "évolu", "toujours", "jugé", "défini"]] },
    ],
    write: { q: "Faut-il pouvoir effacer son passé en ligne ? Rédigez un texte argumenté qui tienne compte des deux points de vue.", en: "Should people be able to erase their past online? Write an argued text that takes both points of view into account.", min: 150 },
  },
  {
    id: "fr-c1-langue-emprunts",
    level: "C1",
    genre: "essay",
    title: "Une langue qui emprunte, une langue qui résiste",
    titleEn: "A language that borrows, a language that resists",
    paras: [
      ["On présente volontiers le français comme une langue assiégée par l'anglais. Il suffit de se promener dans une rue commerçante pour relever des enseignes en « -ing » et des slogans où l'anglais sert de gage de modernité. Cette inquiétude, pourtant, a une histoire, et elle gagne à être replacée dans le temps long.", "French is readily portrayed as a language under siege from English. You need only walk down a shopping street to spot signs ending in '-ing' and slogans in which English serves as a badge of modernity. Yet this anxiety has a history, and it is best seen over the long term."],
      ["Pendant des siècles, c'est l'anglais qui a puisé dans le français. Après la conquête normande de 1066, la langue des élites d'Angleterre fut pendant plusieurs générations une forme de français, et des milliers de mots — justice, government, beef — ont traversé la Manche dans ce sens. Au XVIIIe siècle encore, le français était la langue de la diplomatie et de la conversation savante dans une grande partie de l'Europe.", "For centuries, it was English that drew on French. After the Norman Conquest of 1066, the language of England's elites was, for several generations, a form of French, and thousands of words — justice, government, beef — crossed the Channel in that direction. As late as the eighteenth century, French was the language of diplomacy and learned conversation across much of Europe."],
      ["Le mouvement s'est inversé au XXe siècle, avec la domination économique et culturelle des États-Unis. La France a réagi par une politique linguistique singulière. Des commissions de terminologie proposent des équivalents français aux termes techniques : « logiciel » pour software, « courriel » pour e-mail — ce dernier venu d'ailleurs du Québec. Certains de ces mots se sont imposés ; d'autres sont restés confinés au Journal officiel.", "The movement reversed in the twentieth century, with the economic and cultural dominance of the United States. France responded with a distinctive language policy. Terminology commissions propose French equivalents for technical terms: 'logiciel' for software, 'courriel' for e-mail — the latter, as it happens, from Quebec. Some of these words caught on; others stayed confined to the official gazette."],
      ["Il arrive d'ailleurs que la création précède l'emprunt. En 1955, sollicité par IBM France, le philologue Jacques Perret proposa le mot « ordinateur » pour désigner la nouvelle machine, là où l'anglais disait computer. Le terme s'imposa si bien qu'on oublie aujourd'hui qu'il fut inventé. La loi Toubon de 1994, qui impose l'usage du français dans la publicité, les contrats de travail ou les modes d'emploi, relève d'une autre logique : elle ne régit pas ce que chacun dit, mais ce que chacun doit pouvoir lire dans sa langue.", "Sometimes, in fact, coinage comes before borrowing. In 1955, at IBM France's request, the philologist Jacques Perret proposed the word 'ordinateur' for the new machine, where English said computer. The term caught on so thoroughly that we forget today it was ever invented. The Toubon Law of 1994, which requires French in advertising, employment contracts and instructions for use, follows a different logic: it does not govern what anyone says, but what everyone must be able to read in their own language."],
      ["Faut-il y voir une résistance héroïque ou un combat d'arrière-garde ? Les linguistes rappellent que l'emprunt est le fonctionnement normal d'une langue vivante : une langue qui n'emprunte plus est une langue que plus personne ne parle. Ce qui compte n'est pas tant le nombre de mots étrangers que la capacité de la langue à les digérer, à les plier à sa prononciation et à sa grammaire. Qu'un adolescent dise qu'il a « liké » une photo, avec une terminaison bien française, en dit peut-être moins sur la faiblesse du français que sur sa vitalité.", "Should we see this as heroic resistance or a rearguard battle? Linguists point out that borrowing is how a living language normally works: a language that no longer borrows is a language nobody speaks any more. What matters is not so much the number of foreign words as the language's capacity to digest them, to bend them to its pronunciation and its grammar. That a teenager says he has 'liké' a photo, with a thoroughly French ending, perhaps says less about the weakness of French than about its vitality."],
    ],
    questions: [
      { q: "Pourquoi l'auteur affirme-t-il que l'inquiétude actuelle « a une histoire » ?", en: "Why does the author claim that today's anxiety 'has a history'?", answer: "Parce que pendant des siècles, c'est l'anglais qui a emprunté au français, et que le mouvement ne s'est inversé qu'au XXe siècle.", key: [["anglais", "1066", "normand", "conquête", "puisé"], ["invers", "XXe", "vingtième", "États-Unis", "américain"]] },
      { q: "Quel est le rôle des commissions de terminologie ?", en: "What is the role of the terminology commissions?", answer: "Elles proposent des mots français pour remplacer les termes techniques anglais, comme « logiciel » ou « courriel ».", key: [["propos", "créent", "invent", "équivalent", "remplac"], ["logiciel", "courriel", "technique"]] },
      { q: "Selon les linguistes, qu'est-ce qui compte davantage que le nombre de mots empruntés ?", en: "According to linguists, what matters more than the number of borrowed words?", answer: "Ce qui compte, c'est la capacité de la langue à adapter ces mots à sa prononciation et à sa grammaire.", key: [["capacit", "adapt", "digér", "intégr", "plier", "transform"], ["prononciation", "grammaire", "règle"]] },
      { q: "Que veut montrer l'exemple de « liké » ?", en: "What is the example of 'liké' meant to show?", answer: "Il montre que le français intègre les mots anglais à sa propre grammaire, ce qui prouve sa vitalité plutôt que sa faiblesse.", key: [["vitalit", "vivant", "forte", "force", "dynam", "santé"], ["terminaison", "grammaire", "intègre", "adapt", "conjug"]] },
    ],
    write: { q: "Les emprunts à l'anglais menacent-ils votre propre langue ? Défendez un point de vue en vous appuyant sur des exemples précis.", en: "Do borrowings from English threaten your own language? Argue a position, supported by specific examples.", min: 150 },
  },
  {
    id: "fr-c1-cinq-etoiles",
    level: "C1",
    genre: "column",
    title: "Chronique : cinq étoiles, sinon rien",
    titleEn: "Column: five stars or nothing",
    paras: [
      ["Hier, mon plombier m'a demandé, avant même d'avoir rangé ses outils, si je voulais bien lui laisser « un petit avis ». Il avait réparé la fuite en vingt minutes, avec une courtoisie parfaite ; je lui ai donc attribué cinq étoiles, comme on glisse un pourboire. Puis j'ai reçu un courriel de la plateforme qui me l'avait envoyé : pouvais-je évaluer mon « expérience de réservation » ? Et, dans la foulée, un SMS de ma banque : sur une échelle de un à dix, recommanderais-je son application à un proche ?", "Yesterday my plumber asked me, before he had even packed away his tools, whether I would kindly leave him 'a little review'. He had fixed the leak in twenty minutes, with perfect courtesy; so I gave him five stars, the way one slips someone a tip. Then I received an email from the platform that had sent him: could I rate my 'booking experience'? And, hard on its heels, a text from my bank: on a scale of one to ten, would I recommend its app to a friend?"],
      ["Nous voilà tous devenus critiques, sans l'avoir demandé. L'intention est louable : donner la parole aux clients, récompenser les bons artisans, écarter les mauvais. Mais le système a ses effets pervers. Quand quatre étoiles sur cinq sont perçues comme un reproche, la note cesse de mesurer quoi que ce soit ; elle devient un rituel de politesse, voire une forme de chantage affectif. Le chauffeur qui vous confie que sa note conditionne son emploi ne vous laisse guère le choix.", "Here we all are, turned into critics without having asked to be. The intention is laudable: give customers a voice, reward good tradespeople, weed out the bad ones. But the system has its perverse effects. When four stars out of five are taken as a reproach, the rating stops measuring anything at all; it becomes a ritual of politeness, even a form of emotional blackmail. The driver who confides that his job depends on his rating hardly leaves you any choice."],
      ["Il y a plus inquiétant encore. À force d'être évalués, les métiers de service se transforment en performances permanentes, où le sourire compte autant que le travail bien fait. Et nous, clients, prenons l'habitude de juger plutôt que de remercier. Un restaurant n'est plus un lieu où l'on a bien ou mal dîné, mais un « quatre virgule deux » dont on vérifie la moyenne avant de pousser la porte.", "There is something more worrying still. By dint of constant rating, service jobs are turning into permanent performances, where the smile counts as much as the work done well. And we customers are getting into the habit of judging rather than thanking. A restaurant is no longer a place where one dined well or badly, but a 'four point two' whose average one checks before pushing open the door."],
      ["Le système se nourrit en outre de sa propre inflation. Puisque tout le monde obtient quatre virgule huit, la note ne permet plus de distinguer l'excellent du simplement correct, et les plateformes doivent inventer de nouveaux signes de distinction : badges, labels, mentions « coup de cœur ». Sans compter les faux avis, rédigés à la chaîne, qui obligent désormais les autorités à traquer ce qui se présentait au départ comme un outil de transparence.", "The system also feeds on its own inflation. Since everyone gets four point eight, the rating can no longer tell the excellent from the merely adequate, and platforms have to invent new marks of distinction: badges, labels, 'staff pick' tags. Not to mention fake reviews, written by the batch, which now oblige the authorities to hunt down what was first presented as a tool of transparency."],
      ["Je ne propose pas de supprimer les avis ; certains m'ont épargné de mémorables déceptions. Je plaide seulement pour un peu de retenue. Il existe une vieille technique que l'on pourrait réhabiliter : dire merci, en face, à la personne concernée. Elle ne laisse aucune trace sur internet, mais elle a le mérite d'être entendue.", "I am not proposing to abolish reviews; some have spared me memorable disappointments. I am merely pleading for a little restraint. There is an old technique we could bring back: saying thank you, face to face, to the person concerned. It leaves no trace on the internet, but it has the merit of being heard."],
    ],
    questions: [
      { q: "Quelles situations le chroniqueur décrit-il dans le premier paragraphe, et qu'ont-elles en commun ?", en: "What situations does the columnist describe in the first paragraph, and what do they have in common?", answer: "Le plombier, la plateforme et la banque lui demandent tous de donner une note ou un avis.", key: [["plombier", "banque", "plateforme", "application"], ["avis", "note", "évalu", "étoile"]] },
      { q: "Pourquoi, selon l'auteur, la note « cesse de mesurer quoi que ce soit » ?", en: "Why, according to the author, does the rating 'stop measuring anything at all'?", answer: "Parce que tout le monde donne cinq étoiles par politesse ou sous la pression, puisque quatre étoiles sont vues comme un reproche.", key: [["cinq", "5", "maximum", "tout le monde"], ["politesse", "reproche", "pression", "chantage", "obligé", "choix"]] },
      { q: "Expliquez ce que l'auteur entend par « des performances permanentes ».", en: "Explain what the author means by 'permanent performances'.", answer: "Il veut dire que les travailleurs doivent toujours se montrer souriants et agréables, comme sur une scène, parce qu'ils sont constamment jugés.", key: [["sourire", "souriant", "agréable", "spectacle", "scène", "jouer", "rôle"], ["jugé", "évalu", "noté", "toujours", "constamment"]] },
      { q: "Quelle solution l'auteur propose-t-il, et sur quel ton ?", en: "What solution does the author suggest, and in what tone?", answer: "Il propose, avec ironie, de simplement dire merci en face à la personne, au lieu de laisser une note en ligne.", key: [["merci", "remerci"], ["face", "directement", "en personne", "de vive voix"], ["iron", "humour", "amus", "léger"]] },
    ],
    write: { q: "Les avis et les notes en ligne rendent-ils les services meilleurs ? Écrivez à votre tour une chronique ou un texte argumenté.", en: "Do online reviews and ratings make services better? Write a column or an argued text of your own.", min: 150 },
  },
];
