// Original short scripts. Each lesson teaches before testing and finishes with
// a personal response. Audio is explicitly labelled synthetic, not native speech.
const scripts = [
  {
    key: "introductions",
    title: "Meet someone",
    level: "A1",
    goal: "everyday",
    canDo: "Introduce yourself and ask someone’s name",
    fr: [
      ["Bonjour ! Je m’appelle Alex.", "Hello! My name is Alex."],
      ["Enchantée. Je m’appelle Léa.", "Nice to meet you. My name is Léa."],
      ["Vous habitez ici ?", "Do you live here?"],
      ["Oui, j’habite à Lyon. Et vous ?", "Yes, I live in Lyon. And you?"],
      [
        "J’habite à Paris. Je suis ici pour le week-end.",
        "I live in Paris. I am here for the weekend.",
      ],
    ],
    de: [
      ["Hallo! Ich heiße Alex.", "Hello! My name is Alex."],
      ["Freut mich. Ich heiße Lea.", "Nice to meet you. My name is Lea."],
      ["Wohnen Sie hier?", "Do you live here?"],
      ["Ja, ich wohne in Berlin. Und Sie?", "Yes, I live in Berlin. And you?"],
      [
        "Ich wohne in Hamburg. Ich bin für das Wochenende hier.",
        "I live in Hamburg. I am here for the weekend.",
      ],
    ],
    chunks: {
      fr: [
        ["Je m’appelle…", "My name is…"],
        ["J’habite à…", "I live in…"],
        ["Et vous ?", "And you?"],
      ],
      de: [
        ["Ich heiße…", "My name is…"],
        ["Ich wohne in…", "I live in…"],
        ["Und Sie?", "And you?"],
      ],
    },
    question: "Why is Alex visiting?",
    options: ["For the weekend", "To move permanently", "To start school"],
    answer: 0,
    personal: "Introduce yourself and say where you live.",
    pattern: {
      fr: "Je becomes j’ before a vowel: je habite → j’habite. Use vous with someone you do not know.",
      de: "The verb stays second in a statement: Ich wohne in Berlin. Capitalize Sie when addressing someone formally.",
    },
  },
  {
    key: "cafe",
    title: "Order at a café",
    level: "A1",
    goal: "travel",
    canDo: "Order a drink politely and ask its price",
    fr: [
      [
        "Bonjour. Je voudrais un café, s’il vous plaît.",
        "Hello. I would like a coffee, please.",
      ],
      [
        "Un café noir ou un café au lait ?",
        "A black coffee or a coffee with milk?",
      ],
      [
        "Un café au lait. Et un verre d’eau, s’il vous plaît.",
        "A coffee with milk. And a glass of water, please.",
      ],
      [
        "Bien sûr. Vous voulez autre chose ?",
        "Of course. Would you like anything else?",
      ],
      [
        "Non, merci. Ça coûte combien ?",
        "No, thank you. How much does it cost?",
      ],
      ["Trois euros cinquante.", "Three euros fifty."],
    ],
    de: [
      [
        "Guten Tag. Ich möchte einen Kaffee, bitte.",
        "Hello. I would like a coffee, please.",
      ],
      [
        "Einen schwarzen Kaffee oder einen Kaffee mit Milch?",
        "A black coffee or a coffee with milk?",
      ],
      [
        "Einen Kaffee mit Milch. Und ein Glas Wasser, bitte.",
        "A coffee with milk. And a glass of water, please.",
      ],
      [
        "Gern. Möchten Sie noch etwas?",
        "Of course. Would you like anything else?",
      ],
      [
        "Nein, danke. Wie viel kostet das?",
        "No, thank you. How much does it cost?",
      ],
      ["Drei Euro fünfzig.", "Three euros fifty."],
    ],
    chunks: {
      fr: [
        ["Je voudrais…", "I would like…"],
        ["s’il vous plaît", "please"],
        ["Ça coûte combien ?", "How much does it cost?"],
      ],
      de: [
        ["Ich möchte…", "I would like…"],
        ["ein Glas Wasser", "a glass of water"],
        ["Wie viel kostet das?", "How much does it cost?"],
      ],
    },
    question: "What does the customer order?",
    options: ["Coffee with milk and water", "Two teas", "Only water"],
    answer: 0,
    personal: "Order your own drink, then ask the price.",
    pattern: {
      fr: "Je voudrais is a polite request. Un café au lait is a coffee with milk.",
      de: "Kaffee is masculine: the object of möchte takes einen Kaffee. Ein Glas stays ein because Glas is neuter.",
    },
  },
  {
    key: "directions",
    title: "Find your way",
    level: "A1",
    goal: "travel",
    canDo: "Ask for directions and follow a short route",
    fr: [
      ["Excusez-moi. Où est la gare ?", "Excuse me. Where is the station?"],
      [
        "Allez tout droit, puis tournez à gauche.",
        "Go straight ahead, then turn left.",
      ],
      ["C’est loin ?", "Is it far?"],
      ["Non. C’est à cinq minutes à pied.", "No. It is a five-minute walk."],
      ["Merci beaucoup !", "Thank you very much!"],
    ],
    de: [
      [
        "Entschuldigung. Wo ist der Bahnhof?",
        "Excuse me. Where is the station?",
      ],
      [
        "Gehen Sie geradeaus, dann biegen Sie links ab.",
        "Go straight ahead, then turn left.",
      ],
      ["Ist das weit?", "Is it far?"],
      ["Nein. Es sind fünf Minuten zu Fuß.", "No. It is a five-minute walk."],
      ["Vielen Dank!", "Thank you very much!"],
    ],
    chunks: {
      fr: [
        ["Où est… ?", "Where is…?"],
        ["tout droit", "straight ahead"],
        ["à gauche", "to the left"],
      ],
      de: [
        ["Wo ist…?", "Where is…?"],
        ["geradeaus", "straight ahead"],
        ["zu Fuß", "on foot"],
      ],
    },
    question: "Which way should the visitor turn?",
    options: ["Left", "Right", "Back"],
    answer: 0,
    personal: "Ask where a place is and give one direction.",
    pattern: {
      fr: "Use Où est for one place and Où sont for several. À pied means on foot.",
      de: "In a formal instruction, the verb comes first: Gehen Sie. Abbiegen separates: biegen … ab.",
    },
  },
  {
    key: "shopping",
    title: "Buy groceries",
    level: "A1",
    goal: "everyday",
    canDo: "Ask for quantities and state a preference",
    fr: [
      [
        "Bonjour. Je voudrais deux pommes et du pain.",
        "Hello. I would like two apples and some bread.",
      ],
      [
        "Vous voulez ce pain ou cette baguette ?",
        "Do you want this bread or this baguette?",
      ],
      ["Cette baguette, s’il vous plaît.", "This baguette, please."],
      ["Vous avez besoin d’un sac ?", "Do you need a bag?"],
      ["Non, merci. J’ai mon sac.", "No, thank you. I have my bag."],
    ],
    de: [
      [
        "Guten Tag. Ich möchte zwei Äpfel und Brot.",
        "Hello. I would like two apples and bread.",
      ],
      [
        "Möchten Sie dieses Brot oder dieses Brötchen?",
        "Do you want this bread or this bread roll?",
      ],
      ["Dieses Brot, bitte.", "This bread, please."],
      ["Brauchen Sie eine Tasche?", "Do you need a bag?"],
      ["Nein, danke. Ich habe meine Tasche.", "No, thank you. I have my bag."],
    ],
    chunks: {
      fr: [
        ["Je voudrais deux…", "I would like two…"],
        ["J’ai…", "I have…"],
        ["du pain", "some bread"],
      ],
      de: [
        ["Ich möchte zwei…", "I would like two…"],
        ["Ich habe…", "I have…"],
        ["Brauchen Sie…?", "Do you need…?"],
      ],
    },
    question: "Does the customer need a bag?",
    options: ["No, they have one", "Yes, two bags", "They do not say"],
    answer: 0,
    personal: "Ask for two foods and explain whether you need a bag.",
    pattern: {
      fr: "Use du for an unspecified amount of a masculine food. Ce and cette agree with the noun.",
      de: "Äpfel is the plural of Apfel. After habe, a feminine object uses meine Tasche.",
    },
  },
  {
    key: "routine",
    title: "Describe your day",
    level: "A1",
    goal: "everyday",
    canDo: "Describe a routine and ask about someone else’s",
    fr: [
      ["À quelle heure tu te lèves ?", "What time do you get up?"],
      ["Je me lève à sept heures.", "I get up at seven."],
      ["Tu prends le petit déjeuner ?", "Do you have breakfast?"],
      [
        "Oui, puis je vais au travail en bus.",
        "Yes, then I go to work by bus.",
      ],
      ["Moi, je travaille à la maison.", "I work at home."],
    ],
    de: [
      ["Wann stehst du auf?", "When do you get up?"],
      ["Ich stehe um sieben Uhr auf.", "I get up at seven."],
      ["Frühstückst du?", "Do you have breakfast?"],
      [
        "Ja, dann fahre ich mit dem Bus zur Arbeit.",
        "Yes, then I go to work by bus.",
      ],
      ["Ich arbeite zu Hause.", "I work at home."],
    ],
    chunks: {
      fr: [
        ["Je me lève à…", "I get up at…"],
        ["puis", "then"],
        ["à la maison", "at home"],
      ],
      de: [
        ["Ich stehe um … auf.", "I get up at…"],
        ["dann", "then"],
        ["zu Hause", "at home"],
      ],
    },
    question: "What time does the speaker get up?",
    options: ["Seven", "Six", "Nine"],
    answer: 0,
    personal: "Describe two parts of your real routine.",
    pattern: {
      fr: "Se lever is reflexive: je me lève. Use à with a clock time.",
      de: "Aufstehen separates: Ich stehe … auf. After dann, the finite verb still comes second.",
    },
  },
  {
    key: "family",
    title: "Talk about people",
    level: "A1",
    goal: "family",
    canDo: "Describe someone and their interests",
    fr: [
      ["Tu as des frères ou des sœurs ?", "Do you have brothers or sisters?"],
      [
        "Oui, j’ai une sœur. Elle s’appelle Emma.",
        "Yes, I have a sister. Her name is Emma.",
      ],
      ["Qu’est-ce qu’elle aime faire ?", "What does she like doing?"],
      [
        "Elle aime lire et jouer au football.",
        "She likes reading and playing football.",
      ],
      ["Nous jouons ensemble le dimanche.", "We play together on Sundays."],
    ],
    de: [
      ["Hast du Geschwister?", "Do you have siblings?"],
      [
        "Ja, ich habe eine Schwester. Sie heißt Emma.",
        "Yes, I have a sister. Her name is Emma.",
      ],
      ["Was macht sie gern?", "What does she like doing?"],
      [
        "Sie liest gern und spielt gern Fußball.",
        "She likes reading and playing football.",
      ],
      ["Wir spielen sonntags zusammen.", "We play together on Sundays."],
    ],
    chunks: {
      fr: [
        ["J’ai une sœur.", "I have a sister."],
        ["Elle aime…", "She likes…"],
        ["ensemble", "together"],
      ],
      de: [
        ["Ich habe eine Schwester.", "I have a sister."],
        ["Sie … gern.", "She likes to…"],
        ["zusammen", "together"],
      ],
    },
    question: "What does Emma enjoy?",
    options: [
      "Reading and football",
      "Cooking and swimming",
      "Only watching television",
    ],
    answer: 0,
    personal: "Describe a friend or relative and something they enjoy.",
    pattern: {
      fr: "After aimer, use an infinitive: elle aime lire. Le dimanche can mean every Sunday.",
      de: "Gern expresses liking an activity: Sie liest gern. Sonntags means on Sundays.",
    },
  },
  {
    key: "repair",
    title: "Ask for repetition",
    level: "A1",
    goal: "everyday",
    canDo: "Ask for slower speech and check what you heard",
    fr: [
      [
        "Le rendez-vous est à quatorze heures.",
        "The appointment is at fourteen hundred hours.",
      ],
      [
        "Pardon, vous pouvez répéter, s’il vous plaît ?",
        "Sorry, could you repeat, please?",
      ],
      [
        "À quatorze heures. Deux heures de l’après-midi.",
        "At fourteen hundred hours. Two in the afternoon.",
      ],
      ["Vous pouvez parler plus lentement ?", "Could you speak more slowly?"],
      ["Bien sûr. Mardi, à deux heures.", "Of course. Tuesday, at two."],
      [
        "D’accord. Mardi à deux heures. Merci.",
        "All right. Tuesday at two. Thank you.",
      ],
    ],
    de: [
      [
        "Der Termin ist um vierzehn Uhr.",
        "The appointment is at fourteen hundred hours.",
      ],
      [
        "Entschuldigung, können Sie das bitte wiederholen?",
        "Sorry, could you repeat that, please?",
      ],
      [
        "Um vierzehn Uhr. Um zwei Uhr nachmittags.",
        "At fourteen hundred hours. At two in the afternoon.",
      ],
      [
        "Können Sie bitte langsamer sprechen?",
        "Could you speak more slowly, please?",
      ],
      ["Natürlich. Dienstag um zwei Uhr.", "Of course. Tuesday at two."],
      [
        "Gut. Dienstag um zwei Uhr. Danke.",
        "All right. Tuesday at two. Thank you.",
      ],
    ],
    chunks: {
      fr: [
        ["Vous pouvez répéter ?", "Could you repeat?"],
        ["plus lentement", "more slowly"],
        ["D’accord.", "All right."],
      ],
      de: [
        ["Können Sie das wiederholen?", "Could you repeat that?"],
        ["langsamer", "more slowly"],
        ["nachmittags", "in the afternoon"],
      ],
    },
    question: "When is the appointment?",
    options: [
      "Tuesday afternoon at two",
      "Thursday morning at two",
      "Tuesday at four",
    ],
    answer: 0,
    personal: "Ask someone to repeat and to speak more slowly.",
    pattern: {
      fr: "Pouvez-vous and vous pouvez are both useful question patterns. Confirming the time is a conversation strategy.",
      de: "After können, the infinitive goes at the end: Können Sie … sprechen? Repeat key information to check understanding.",
    },
  },
  {
    key: "tickets",
    title: "Buy a train ticket",
    level: "A1",
    goal: "travel",
    canDo: "Ask for a ticket and confirm departure information",
    fr: [
      ["Un billet pour Lille, s’il vous plaît.", "A ticket to Lille, please."],
      ["Aller simple ou aller-retour ?", "One way or return?"],
      ["Un aller simple pour demain matin.", "One way for tomorrow morning."],
      [
        "Le train part à neuf heures, voie trois.",
        "The train leaves at nine, platform three.",
      ],
      [
        "À neuf heures, voie trois. Merci.",
        "At nine, platform three. Thank you.",
      ],
    ],
    de: [
      ["Eine Fahrkarte nach Köln, bitte.", "A ticket to Cologne, please."],
      ["Einfach oder hin und zurück?", "One way or return?"],
      ["Einfach, für morgen früh.", "One way, for tomorrow morning."],
      [
        "Der Zug fährt um neun Uhr von Gleis drei.",
        "The train leaves at nine from platform three.",
      ],
      [
        "Um neun Uhr, Gleis drei. Danke.",
        "At nine, platform three. Thank you.",
      ],
    ],
    chunks: {
      fr: [
        ["Un billet pour…", "A ticket to…"],
        ["aller simple", "one way"],
        ["demain matin", "tomorrow morning"],
      ],
      de: [
        ["Eine Fahrkarte nach…", "A ticket to…"],
        ["hin und zurück", "return"],
        ["morgen früh", "tomorrow morning"],
      ],
    },
    question: "Which platform does the train leave from?",
    options: ["Three", "Nine", "Two"],
    answer: 0,
    personal: "Ask for a ticket and confirm a time.",
    pattern: {
      fr: "Pour introduces the destination in this ticket request. Aller-retour means a return ticket.",
      de: "Use nach for most city destinations. Von Gleis drei gives the departure platform.",
    },
  },
  {
    key: "hotel",
    title: "Check in",
    level: "A2",
    goal: "travel",
    canDo: "Confirm a reservation and ask a practical question",
    fr: [
      [
        "Bonsoir. J’ai une réservation au nom de Martin.",
        "Good evening. I have a reservation under the name Martin.",
      ],
      ["Pour deux nuits, c’est bien ça ?", "For two nights, is that right?"],
      ["Oui. Le petit déjeuner est compris ?", "Yes. Is breakfast included?"],
      ["Oui, de sept heures à dix heures.", "Yes, from seven to ten."],
      ["Parfait. Où est ma chambre ?", "Perfect. Where is my room?"],
      [
        "Au deuxième étage. Voici votre clé.",
        "On the second floor. Here is your key.",
      ],
    ],
    de: [
      [
        "Guten Abend. Ich habe eine Reservierung auf den Namen Martin.",
        "Good evening. I have a reservation under the name Martin.",
      ],
      ["Für zwei Nächte, richtig?", "For two nights, correct?"],
      ["Ja. Ist das Frühstück inbegriffen?", "Yes. Is breakfast included?"],
      ["Ja, von sieben bis zehn Uhr.", "Yes, from seven to ten."],
      ["Gut. Wo ist mein Zimmer?", "Good. Where is my room?"],
      [
        "Im zweiten Stock. Hier ist Ihr Schlüssel.",
        "On the second floor. Here is your key.",
      ],
    ],
    chunks: {
      fr: [
        ["J’ai une réservation.", "I have a reservation."],
        ["compris", "included"],
        ["de … à …", "from … to …"],
      ],
      de: [
        ["Ich habe eine Reservierung.", "I have a reservation."],
        ["inbegriffen", "included"],
        ["von … bis …", "from … to …"],
      ],
    },
    question: "When does breakfast finish?",
    options: ["Ten", "Seven", "Two"],
    answer: 0,
    personal: "Check in for a number of nights and ask one practical question.",
    pattern: {
      fr: "Au combines à + le. Deuxième describes the second floor.",
      de: "Im combines in + dem. Your room is in a location, so im zweiten Stock uses the dative.",
    },
  },
  {
    key: "plans",
    title: "Make plans",
    level: "A2",
    goal: "family",
    canDo: "Suggest a plan and agree on a time",
    fr: [
      [
        "Tu veux aller au cinéma samedi ?",
        "Do you want to go to the cinema on Saturday?",
      ],
      [
        "Oui, mais je travaille jusqu’à six heures.",
        "Yes, but I work until six.",
      ],
      ["On peut y aller après le dîner.", "We can go after dinner."],
      [
        "Bonne idée. On se retrouve à huit heures ?",
        "Good idea. Shall we meet at eight?",
      ],
      ["D’accord, devant le cinéma.", "All right, in front of the cinema."],
    ],
    de: [
      [
        "Möchtest du am Samstag ins Kino gehen?",
        "Do you want to go to the cinema on Saturday?",
      ],
      ["Ja, aber ich arbeite bis sechs Uhr.", "Yes, but I work until six."],
      ["Wir können nach dem Abendessen gehen.", "We can go after dinner."],
      [
        "Gute Idee. Treffen wir uns um acht Uhr?",
        "Good idea. Shall we meet at eight?",
      ],
      ["Ja, vor dem Kino.", "Yes, in front of the cinema."],
    ],
    chunks: {
      fr: [
        ["Tu veux… ?", "Do you want to…?"],
        ["après le dîner", "after dinner"],
        ["On se retrouve… ?", "Shall we meet…?"],
      ],
      de: [
        ["Möchtest du…?", "Would you like to…?"],
        ["nach dem Abendessen", "after dinner"],
        ["Treffen wir uns…?", "Shall we meet…?"],
      ],
    },
    question: "Where will they meet?",
    options: ["In front of the cinema", "At work", "At a restaurant"],
    answer: 0,
    personal:
      "Suggest something you would like to do and agree on a meeting time.",
    pattern: {
      fr: "On is a common spoken way to say we. Y replaces a previously mentioned place.",
      de: "After können or möchten, the second verb is an infinitive at the end. Nach takes the dative here.",
    },
  },
  {
    key: "work",
    title: "Organize a meeting",
    level: "A2",
    goal: "work",
    canDo: "Propose a time and explain availability",
    fr: [
      [
        "Tu es disponible pour une réunion demain ?",
        "Are you available for a meeting tomorrow?",
      ],
      [
        "Le matin, oui. Après le déjeuner, j’ai un rendez-vous.",
        "In the morning, yes. After lunch, I have an appointment.",
      ],
      ["Dix heures, ça te convient ?", "Does ten work for you?"],
      ["Oui. Je prépare les documents.", "Yes. I will prepare the documents."],
      [
        "Merci. La réunion sera en ligne.",
        "Thank you. The meeting will be online.",
      ],
    ],
    de: [
      [
        "Hast du morgen Zeit für eine Besprechung?",
        "Do you have time for a meeting tomorrow?",
      ],
      [
        "Vormittags ja. Nach dem Mittagessen habe ich einen Termin.",
        "In the morning, yes. After lunch, I have an appointment.",
      ],
      ["Passt dir zehn Uhr?", "Does ten work for you?"],
      [
        "Ja. Ich bereite die Unterlagen vor.",
        "Yes. I will prepare the documents.",
      ],
      [
        "Danke. Die Besprechung findet online statt.",
        "Thank you. The meeting will be online.",
      ],
    ],
    chunks: {
      fr: [
        ["Tu es disponible ?", "Are you available?"],
        ["Ça te convient ?", "Does that work for you?"],
        ["en ligne", "online"],
      ],
      de: [
        ["Hast du Zeit?", "Do you have time?"],
        ["Passt dir…?", "Does … work for you?"],
        ["Ich bereite … vor.", "I prepare…"],
      ],
    },
    question: "How will the meeting take place?",
    options: ["Online", "At a restaurant", "At the station"],
    answer: 0,
    personal: "Propose a meeting time and explain when you are unavailable.",
    pattern: {
      fr: "Convenir means to suit: ça te convient asks if something suits the other person. Present tense can express a near-future arrangement.",
      de: "Vorbereiten and stattfinden are separable: bereite … vor, findet … statt. A fronted time expression keeps the finite verb second.",
    },
  },
  {
    key: "pharmacy",
    title: "Ask for help",
    level: "A2",
    goal: "everyday",
    canDo: "Describe a simple problem and understand advice",
    fr: [
      ["Bonjour. J’ai mal à la tête.", "Hello. I have a headache."],
      ["Depuis quand ?", "Since when?"],
      [
        "Depuis ce matin. Je voudrais parler au pharmacien.",
        "Since this morning. I would like to speak to the pharmacist.",
      ],
      [
        "Bien sûr. Attendez ici, s’il vous plaît.",
        "Of course. Please wait here.",
      ],
      [
        "Merci. J’ai aussi une question sur mon ordonnance.",
        "Thank you. I also have a question about my prescription.",
      ],
    ],
    de: [
      ["Guten Tag. Ich habe Kopfschmerzen.", "Hello. I have a headache."],
      ["Seit wann?", "Since when?"],
      [
        "Seit heute Morgen. Ich möchte mit dem Apotheker sprechen.",
        "Since this morning. I would like to speak to the pharmacist.",
      ],
      ["Natürlich. Warten Sie bitte hier.", "Of course. Please wait here."],
      [
        "Danke. Ich habe auch eine Frage zu meinem Rezept.",
        "Thank you. I also have a question about my prescription.",
      ],
    ],
    chunks: {
      fr: [
        ["J’ai mal à…", "My … hurts"],
        ["depuis ce matin", "since this morning"],
        ["une ordonnance", "a prescription"],
      ],
      de: [
        ["Ich habe Kopfschmerzen.", "I have a headache."],
        ["seit heute Morgen", "since this morning"],
        ["ein Rezept", "a prescription"],
      ],
    },
    question: "When did the problem start?",
    options: ["This morning", "Last week", "Yesterday evening"],
    answer: 0,
    personal:
      "Describe a simple problem and ask to speak with an appropriate person.",
    pattern: {
      fr: "Avoir mal à names a pain. Depuis expresses a situation continuing from a starting point.",
      de: "Seit takes the dative and describes a continuing situation. This is language practice, not medical advice.",
    },
  },
  {
    key: "weekend",
    title: "Tell a short story",
    level: "A2",
    goal: "everyday",
    canDo: "Say what happened and give a reason",
    fr: [
      ["Qu’est-ce que tu as fait dimanche ?", "What did you do on Sunday?"],
      [
        "Je suis allé au parc avec un ami.",
        "I went to the park with a friend.",
      ],
      ["Vous avez joué au football ?", "Did you play football?"],
      [
        "Non, il a plu. Nous avons bu un café.",
        "No, it rained. We had a coffee.",
      ],
      ["Et après, je suis rentré chez moi.", "And afterwards, I went home."],
    ],
    de: [
      ["Was hast du am Sonntag gemacht?", "What did you do on Sunday?"],
      [
        "Ich bin mit einem Freund in den Park gegangen.",
        "I went to the park with a friend.",
      ],
      ["Habt ihr Fußball gespielt?", "Did you play football?"],
      [
        "Nein, es hat geregnet. Wir haben einen Kaffee getrunken.",
        "No, it rained. We had a coffee.",
      ],
      ["Danach bin ich nach Hause gegangen.", "Afterwards, I went home."],
    ],
    chunks: {
      fr: [
        ["Je suis allé…", "I went…"],
        ["Nous avons bu…", "We drank…"],
        ["après", "afterwards"],
      ],
      de: [
        ["Ich bin … gegangen.", "I went…"],
        ["Es hat geregnet.", "It rained."],
        ["danach", "afterwards"],
      ],
    },
    question: "Why did they not play football?",
    options: ["It rained", "They had no ball", "The park was closed"],
    answer: 0,
    personal: "Tell two things you did recently and one reason.",
    pattern: {
      fr: "Passé composé uses avoir or être plus a past participle. With être, allé/rentré agrees with the subject: allée/rentrée for a feminine speaker.",
      de: "Perfekt uses haben or sein plus a participle. Movement to a destination often takes sein: bin gegangen.",
    },
  },
  {
    key: "opinions",
    title: "Explain a preference",
    level: "B1",
    goal: "interests",
    canDo: "State an opinion and support it with a reason",
    fr: [
      [
        "Tu préfères lire ou regarder un film ?",
        "Do you prefer reading or watching a film?",
      ],
      [
        "J’aime les deux, mais je lis plus souvent.",
        "I like both, but I read more often.",
      ],
      ["Pourquoi ?", "Why?"],
      [
        "Parce que je peux lire dans le train. Je choisis mon rythme.",
        "Because I can read on the train. I choose my pace.",
      ],
      [
        "Moi, je préfère les films, surtout avec des amis.",
        "I prefer films, especially with friends.",
      ],
    ],
    de: [
      [
        "Liest du lieber oder siehst du lieber einen Film?",
        "Do you prefer reading or watching a film?",
      ],
      [
        "Ich mag beides, aber ich lese öfter.",
        "I like both, but I read more often.",
      ],
      ["Warum?", "Why?"],
      [
        "Weil ich im Zug lesen kann. Ich bestimme mein Tempo.",
        "Because I can read on the train. I choose my pace.",
      ],
      [
        "Ich sehe lieber Filme, besonders mit Freunden.",
        "I prefer films, especially with friends.",
      ],
    ],
    chunks: {
      fr: [
        ["Je préfère…", "I prefer…"],
        ["parce que", "because"],
        ["surtout", "especially"],
      ],
      de: [
        ["Ich … lieber.", "I prefer to…"],
        ["weil", "because"],
        ["besonders", "especially"],
      ],
    },
    question: "Why does the reader prefer books?",
    options: [
      "They can read on the train at their own pace",
      "They dislike friends",
      "Films are too expensive",
    ],
    answer: 0,
    personal: "Compare two things you enjoy and justify your preference.",
    pattern: {
      fr: "Use parce que to give a reason. But je préfère reading something does not make other preferences wrong.",
      de: "Weil sends the finite verb to the end: weil ich … lesen kann. Lieber compares a preference.",
    },
  },
  {
    key: "complaint",
    title: "Resolve a problem",
    level: "B1",
    goal: "work",
    canDo: "Explain a problem and ask for a solution politely",
    fr: [
      [
        "Bonjour. J’ai acheté ce casque hier, mais il ne fonctionne pas.",
        "Hello. I bought these headphones yesterday, but they do not work.",
      ],
      ["Vous avez le reçu ?", "Do you have the receipt?"],
      ["Oui. Est-ce que je peux l’échanger ?", "Yes. Can I exchange them?"],
      [
        "Bien sûr. Nous pouvons vous proposer un autre modèle.",
        "Of course. We can offer you another model.",
      ],
      [
        "Merci. Je voudrais essayer le nouveau casque avant de partir.",
        "Thank you. I would like to try the new headphones before leaving.",
      ],
    ],
    de: [
      [
        "Guten Tag. Ich habe diesen Kopfhörer gestern gekauft, aber er funktioniert nicht.",
        "Hello. I bought these headphones yesterday, but they do not work.",
      ],
      ["Haben Sie den Kassenbon?", "Do you have the receipt?"],
      ["Ja. Kann ich ihn umtauschen?", "Yes. Can I exchange them?"],
      [
        "Natürlich. Wir können Ihnen ein anderes Modell anbieten.",
        "Of course. We can offer you another model.",
      ],
      [
        "Danke. Ich möchte den neuen Kopfhörer ausprobieren, bevor ich gehe.",
        "Thank you. I would like to try the new headphones before leaving.",
      ],
    ],
    chunks: {
      fr: [
        ["Il ne fonctionne pas.", "It does not work."],
        ["Est-ce que je peux l’échanger ?", "Can I exchange it?"],
        ["avant de partir", "before leaving"],
      ],
      de: [
        ["Er funktioniert nicht.", "It does not work."],
        ["Kann ich ihn umtauschen?", "Can I exchange it?"],
        ["bevor ich gehe", "before I leave"],
      ],
    },
    question: "What does the customer request?",
    options: ["An exchange", "A second receipt", "A reservation"],
    answer: 0,
    personal:
      "Explain a problem with something you bought and request a solution.",
    pattern: {
      fr: "Le casque is singular even when translated as headphones. L’ replaces that object before a vowel.",
      de: "Der Kopfhörer is masculine, so the object pronoun is ihn. Bevor introduces a subordinate clause.",
    },
  },
];

export const MISSIONS = Object.fromEntries(
  ["fr", "de"].map((lang) => [
    lang,
    scripts.map((s, i) => ({
      id: `${lang}-${s.key}`,
      key: s.key,
      title: s.title,
      level: s.level,
      goal: s.goal,
      canDo: s.canDo,
      minutes: s.level === "A1" ? 6 : 8,
      lang,
      lines: s[lang].map(([text, en], j) => ({
        speaker: j % 2 ? "B" : "A",
        text,
        en,
      })),
      chunks: s.chunks[lang].map(([text, en]) => ({ text, en })),
      question: { prompt: s.question, options: s.options, answer: s.answer },
      personal: s.personal,
      pattern: s.pattern[lang],
      audio: `/listen/missions/${lang}-${s.key}.mp3`,
      captions: `/listen/missions/${lang}-${s.key}.vtt`,
      englishCaptions: `/listen/missions/${lang}-${s.key}.en.vtt`,
      source: {
        type: "original",
        label: "Original Vocab Drawer practice script",
        audio: "Synthetic speech — eSpeak NG 1.52; two computer voices",
        license: "CC BY 4.0",
      },
      order: i,
    })),
  ]),
);
export const PRONUNCIATION_PAIRS = {
  fr: [
    {
      a: "tu",
      b: "tout",
      tip: "Keep your lips rounded for both. For u, your tongue stays forward; ou is farther back.",
    },
    {
      a: "dessus",
      b: "dessous",
      tip: "The final vowel changes the meaning: above versus below.",
    },
    {
      a: "beau",
      b: "bon",
      tip: "Bon has a nasal vowel. Avoid adding a separate n sound.",
    },
    {
      a: "poisson",
      b: "poison",
      tip: "Poisson has an s sound; poison has a z sound.",
    },
  ],
  de: [
    {
      a: "bieten",
      b: "bitten",
      tip: "Bieten has a longer, tenser vowel; bitten has a shorter vowel.",
    },
    {
      a: "Stadt",
      b: "Staat",
      tip: "Listen for vowel length: city versus state.",
    },
    {
      a: "schon",
      b: "schön",
      tip: "For ö, round your lips while keeping the tongue forward.",
    },
    {
      a: "vier",
      b: "wir",
      tip: "Vier starts with an f sound; wir starts with a v sound.",
    },
  ],
};
export function missionsFor(lang, level = "A1", goal = "everyday") {
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  const max = levels.indexOf(level);
  return (MISSIONS[lang] || [])
    .filter((m) => levels.indexOf(m.level) <= max)
    .sort(
      (a, b) =>
        (a.goal === goal ? -1 : 0) - (b.goal === goal ? -1 : 0) ||
        a.order - b.order,
    );
}
