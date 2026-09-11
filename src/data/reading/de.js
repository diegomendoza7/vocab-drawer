/* German reading passages, A1–C1.
 *
 * Same shape and rules as fr.js — see the note there. Written for this app;
 * the people and places in the stories are invented, the facts are
 * checkable (the 2023 reusable-packaging rule, the Repair Café's Dutch
 * origin, the 17th-century language societies).
 *
 * Every sentence here also runs through the German grammar rules in
 * scripts/check-reading.mjs, which must find nothing — a model text the
 * checker objects to would teach the learner to distrust the checker.
 */
export const DE_PASSAGES = [
  /* ------------------------------------------------------------------ A1 */
  {
    id: "de-a1-cafe",
    level: "A1",
    genre: "dialogue",
    title: "Im Café",
    titleEn: "At the café",
    paras: [
      ["Es ist Samstag, drei Uhr nachmittags. Jonas und seine Freundin Mia sitzen in einem kleinen Café in der Altstadt. Der Kellner kommt an den Tisch.", "It is Saturday, three in the afternoon. Jonas and his girlfriend Mia are sitting in a small café in the old town. The waiter comes to the table."],
      ["„Guten Tag! Was möchten Sie trinken?“", "'Good afternoon! What would you like to drink?'"],
      ["„Ich nehme einen Kaffee mit Milch, bitte“, sagt Jonas.", "'I'll have a coffee with milk, please,' says Jonas."],
      ["„Und ich möchte einen Tee. Haben Sie auch Kuchen?“, fragt Mia.", "'And I'd like a tea. Do you have cake too?' asks Mia."],
      ["„Ja, wir haben heute Apfelkuchen und Käsekuchen.“", "'Yes, today we have apple cake and cheesecake.'"],
      ["„Dann nehme ich ein Stück Apfelkuchen. Mit Sahne, bitte!“", "'Then I'll have a piece of apple cake. With cream, please!'"],
      ["Nach einer Stunde möchten sie bezahlen. Der Kaffee kostet drei Euro, der Tee zwei Euro fünfzig und der Kuchen vier Euro. Jonas bezahlt alles und gibt dem Kellner einen Euro Trinkgeld.", "After an hour they want to pay. The coffee costs three euros, the tea two euros fifty and the cake four euros. Jonas pays for everything and gives the waiter a one-euro tip."],
    ],
    questions: [
      { q: "Was trinkt Mia?", en: "What does Mia drink?", answer: "Mia trinkt einen Tee.", key: [["Tee"]] },
      { q: "Welchen Kuchen nimmt Mia?", en: "Which cake does Mia have?", answer: "Sie nimmt ein Stück Apfelkuchen mit Sahne.", key: [["Apfel"]] },
      { q: "Wie viel kostet alles zusammen?", en: "How much does everything cost together?", answer: "Alles zusammen kostet neun Euro fünfzig.", key: [["neun", "9,50", "9 Euro 50", "9,5"]] },
    ],
    write: { q: "Sie sind in einem Café. Schreiben Sie einen kurzen Dialog: Sie bestellen etwas zu trinken und zu essen und bezahlen.", en: "You are in a café. Write a short dialogue: you order something to drink and to eat, and pay.", min: 25 },
  },
  {
    id: "de-a1-hallo-hamburg",
    level: "A1",
    genre: "email",
    title: "Hallo aus Hamburg!",
    titleEn: "Hello from Hamburg!",
    paras: [
      ["Liebe Sophie,", "Dear Sophie,"],
      ["ich heiße Lena und ich bin deine neue Brieffreundin. Ich bin fünfzehn Jahre alt und wohne in Hamburg, im Norden von Deutschland. Hamburg ist sehr groß und hat einen Hafen.", "My name is Lena and I am your new pen friend. I am fifteen and I live in Hamburg, in the north of Germany. Hamburg is very big and has a harbour."],
      ["Ich habe einen Bruder. Er heißt Paul und ist neun Jahre alt. Mein Vater ist Koch in einem Restaurant und meine Mutter ist Ärztin. Wir haben auch eine Katze. Sie heißt Mimi und schläft den ganzen Tag.", "I have a brother. His name is Paul and he is nine. My father is a cook in a restaurant and my mother is a doctor. We also have a cat. She is called Mimi and sleeps all day."],
      ["In meiner Freizeit schwimme ich gern und ich lese viel. Mein Lieblingsfach in der Schule ist Englisch. Mathe mag ich nicht so gern.", "In my free time I like swimming and I read a lot. My favourite subject at school is English. I don't like maths so much."],
      ["Und du? Hast du Geschwister? Was machst du gern? Schreib mir bald!", "And you? Do you have brothers or sisters? What do you like doing? Write to me soon!"],
      ["Viele Grüße\nLena", "Best wishes\nLena"],
    ],
    questions: [
      { q: "Wo wohnt Lena?", en: "Where does Lena live?", answer: "Sie wohnt in Hamburg, im Norden von Deutschland.", key: [["Hamburg"]] },
      { q: "Was machen Lenas Eltern beruflich?", en: "What do Lena's parents do for a living?", answer: "Ihr Vater ist Koch und ihre Mutter ist Ärztin.", key: [["Koch", "Restaurant"], ["Ärztin", "Arzt"]] },
      { q: "Was macht Lena in ihrer Freizeit?", en: "What does Lena do in her free time?", answer: "Sie schwimmt gern und liest viel.", key: [["schwimm"], ["lies", "lese", "Buch", "Bücher"]] },
    ],
    write: { q: "Schreiben Sie eine E-Mail an einen neuen Brieffreund: Wer sind Sie, wo wohnen Sie, und was machen Sie gern?", en: "Write an email to a new pen friend: who are you, where do you live, and what do you like doing?", min: 30 },
  },
  {
    id: "de-a1-wohnung",
    level: "A1",
    genre: "profile",
    title: "Meine neue Wohnung",
    titleEn: "My new flat",
    paras: [
      ["Ich heiße Ali und ich wohne seit einem Monat in Köln. Meine Wohnung ist nicht groß, aber sie ist hell und gemütlich. Sie liegt im dritten Stock. Leider gibt es keinen Aufzug.", "My name is Ali and I have been living in Cologne for a month. My flat is not big, but it is bright and cosy. It is on the third floor. Unfortunately there is no lift."],
      ["Die Wohnung hat zwei Zimmer, eine Küche und ein Bad. Im Wohnzimmer stehen ein Sofa, ein Tisch und ein großes Regal mit Büchern. Im Schlafzimmer habe ich ein Bett und einen Schrank.", "The flat has two rooms, a kitchen and a bathroom. In the living room there is a sofa, a table and a big shelf of books. In the bedroom I have a bed and a wardrobe."],
      ["Mein Lieblingsort ist der Balkon. Dort trinke ich morgens meinen Kaffee. Von dort sehe ich den Dom.", "My favourite spot is the balcony. That is where I drink my coffee in the morning. From there I can see the cathedral."],
      ["Die Miete kostet 650 Euro im Monat. Das ist nicht billig, aber die Wohnung ist nah am Bahnhof und ich brauche nur zehn Minuten zur Arbeit.", "The rent is 650 euros a month. That is not cheap, but the flat is close to the station and I only need ten minutes to get to work."],
    ],
    questions: [
      { q: "Wie viele Zimmer hat Alis Wohnung?", en: "How many rooms does Ali's flat have?", answer: "Sie hat zwei Zimmer, eine Küche und ein Bad.", key: [["zwei", "2"]] },
      { q: "Was ist das Problem mit dem dritten Stock?", en: "What is the problem with the third floor?", answer: "Es gibt keinen Aufzug.", key: [["Aufzug", "Lift", "Fahrstuhl", "Treppe"]] },
      { q: "Warum mag Ali seinen Balkon?", en: "Why does Ali like his balcony?", answer: "Er trinkt dort morgens seinen Kaffee und sieht den Dom.", key: [["Kaffee", "trink"], ["Dom", "Kirche", "sieht", "Blick", "Aussicht"]] },
    ],
    write: { q: "Beschreiben Sie Ihre Wohnung oder Ihr Zimmer: Was gibt es dort, und was ist Ihr Lieblingsort?", en: "Describe your flat or your room: what is there, and what is your favourite spot?", min: 30 },
  },

  /* ------------------------------------------------------------------ A2 */
  {
    id: "de-a2-ausflug-see",
    level: "A2",
    genre: "story",
    title: "Ein Ausflug an den See",
    titleEn: "A trip to the lake",
    paras: [
      ["Letzten Sonntag sind Tim und seine Eltern an den Chiemsee gefahren. Das Wetter war am Morgen fantastisch: Die Sonne hat geschienen und es war fast dreißig Grad warm.", "Last Sunday Tim and his parents drove to Lake Chiemsee. The weather in the morning was fantastic: the sun was shining and it was almost thirty degrees."],
      ["Zuerst haben sie ein Boot gemietet und sind zu einer kleinen Insel gefahren. Dort haben sie ein altes Schloss besichtigt. Danach haben sie am Ufer ein Picknick gemacht. Tims Mutter hatte Brot, Käse und Obst mitgebracht.", "First they hired a boat and went to a small island. There they visited an old palace. After that they had a picnic on the shore. Tim's mother had brought bread, cheese and fruit."],
      ["Am Nachmittag ist Tim im See geschwommen. Das Wasser war kalt, aber sehr klar. Plötzlich ist der Himmel dunkel geworden und es hat angefangen zu donnern. Alle Leute sind schnell aus dem Wasser gegangen.", "In the afternoon Tim swam in the lake. The water was cold but very clear. Suddenly the sky went dark and it started to thunder. Everyone got out of the water quickly."],
      ["Die Familie ist zum Auto gelaufen, aber sie ist trotzdem ganz nass geworden. Auf der Fahrt nach Hause hat Tim gelacht: „Das war der beste Tag der Ferien!“", "The family ran to the car, but they still got completely wet. On the way home Tim laughed: 'That was the best day of the holidays!'"],
    ],
    questions: [
      { q: "Wie war das Wetter am Morgen?", en: "What was the weather like in the morning?", answer: "Am Morgen war das Wetter fantastisch: Die Sonne hat geschienen und es war sehr warm.", key: [["Sonne", "sonnig", "warm", "heiß", "dreißig", "schön", "fantastisch", "gut"]] },
      { q: "Was hat die Familie auf der Insel gemacht?", en: "What did the family do on the island?", answer: "Sie haben dort ein altes Schloss besichtigt.", key: [["Schloss", "besichtig", "Palast"]] },
      { q: "Warum sind alle Leute aus dem Wasser gegangen?", en: "Why did everyone get out of the water?", answer: "Weil ein Gewitter gekommen ist: Der Himmel ist dunkel geworden und es hat gedonnert.", key: [["Gewitter", "donner", "dunkel", "Sturm", "Regen", "regnet", "Blitz"]] },
    ],
    write: { q: "Erzählen Sie von einem Ausflug. Wohin sind Sie gefahren? Was haben Sie gemacht? Was ist passiert?", en: "Tell the story of a trip. Where did you go? What did you do? What happened?", min: 45 },
  },
  {
    id: "de-a2-fahrrad",
    level: "A2",
    genre: "notice",
    title: "Fahrrad zu verkaufen",
    titleEn: "Bicycle for sale",
    paras: [
      ["Verkaufe mein Damenfahrrad, 28 Zoll, Farbe: dunkelgrün.", "Selling my women's bike, 28 inch, colour: dark green."],
      ["Das Fahrrad ist fünf Jahre alt, aber in einem sehr guten Zustand. Ich habe es immer im Keller gelassen, deshalb ist es nicht rostig. Letzten Monat habe ich neue Reifen und eine neue Lampe gekauft. Die Bremsen funktionieren perfekt.", "The bike is five years old but in very good condition. I always kept it in the cellar, so it is not rusty. Last month I bought new tyres and a new lamp. The brakes work perfectly."],
      ["Warum verkaufe ich es? Ich ziehe im Sommer nach Wien und nehme nur einen Koffer mit. Außerdem gibt es in meiner neuen Firma ein Dienstfahrrad.", "Why am I selling it? I am moving to Vienna in the summer and I am only taking one suitcase. Besides, there is a company bike at my new job."],
      ["Preis: 180 Euro (Verhandlungsbasis). Sie können das Fahrrad gern am Wochenende ansehen und eine Probefahrt machen. Bitte schreiben Sie mir eine Nachricht oder rufen Sie abends an.", "Price: 180 euros (or nearest offer). You are welcome to look at the bike at the weekend and take it for a test ride. Please send me a message or call in the evening."],
    ],
    questions: [
      { q: "Warum ist das Fahrrad nicht rostig?", en: "Why is the bike not rusty?", answer: "Weil es immer im Keller stand.", key: [["Keller"]] },
      { q: "Was ist neu am Fahrrad?", en: "What is new on the bike?", answer: "Die Reifen und die Lampe sind neu.", key: [["Reifen"], ["Lampe", "Licht"]] },
      { q: "Warum wird das Fahrrad verkauft? Nennen Sie zwei Gründe.", en: "Why is the bike being sold? Give two reasons.", answer: "Die Person zieht nach Wien und nimmt nur einen Koffer mit, und ihre neue Firma hat ein Dienstfahrrad.", key: [["Wien", "zieht", "Umzug", "Koffer"], ["Firma", "Dienstfahrrad", "Arbeit"]] },
    ],
    write: { q: "Schreiben Sie eine Anzeige: Sie verkaufen etwas. Beschreiben Sie den Gegenstand, den Zustand und den Preis, und sagen Sie, warum Sie ihn verkaufen.", en: "Write an ad: you are selling something. Describe the item, its condition and the price, and say why you are selling it.", min: 40 },
  },
  {
    id: "de-a2-krank",
    level: "A2",
    genre: "email",
    title: "Ich bin krank",
    titleEn: "I'm ill",
    paras: [
      ["Sehr geehrte Frau Schneider,", "Dear Ms Schneider,"],
      ["leider kann ich heute und morgen nicht zum Deutschkurs kommen. Ich habe seit gestern Abend Fieber und starke Kopfschmerzen. Heute Morgen war ich beim Arzt. Er sagt, ich habe eine Grippe und muss drei Tage im Bett bleiben.", "Unfortunately I cannot come to the German course today or tomorrow. I have had a fever and a bad headache since yesterday evening. This morning I went to the doctor. He says I have the flu and must stay in bed for three days."],
      ["Können Sie mir bitte die Hausaufgaben per E-Mail schicken? Ich möchte die Lektion zu Hause lernen, damit ich nicht zu viel verpasse.", "Could you please send me the homework by email? I would like to study the lesson at home so that I don't miss too much."],
      ["Am Donnerstag haben wir den Test, oder? Wenn ich wieder gesund bin, komme ich natürlich. Falls nicht, rufe ich Sie am Mittwoch an.", "We have the test on Thursday, don't we? If I am well again, I will of course come. If not, I will call you on Wednesday."],
      ["Vielen Dank und viele Grüße\nAmira Haddad", "Many thanks and best wishes\nAmira Haddad"],
    ],
    questions: [
      { q: "Warum kann Amira nicht zum Kurs kommen?", en: "Why can't Amira come to the course?", answer: "Sie hat eine Grippe, mit Fieber und starken Kopfschmerzen.", key: [["Grippe", "krank", "Fieber", "Kopfschmerz"]] },
      { q: "Was hat der Arzt gesagt?", en: "What did the doctor say?", answer: "Er hat gesagt, dass sie eine Grippe hat und drei Tage im Bett bleiben muss.", key: [["Bett", "drei Tage", "bleiben", "ausruhen"]] },
      { q: "Worum bittet Amira ihre Lehrerin?", en: "What does Amira ask her teacher for?", answer: "Sie bittet sie, ihr die Hausaufgaben per E-Mail zu schicken.", key: [["Hausaufgabe", "Aufgaben", "Lektion"], ["Mail", "schick"]] },
    ],
    write: { q: "Sie sind krank und können nicht zur Arbeit oder zum Kurs gehen. Schreiben Sie eine E-Mail: Erklären Sie das Problem und bitten Sie um etwas.", en: "You are ill and cannot go to work or class. Write an email: explain the problem and ask for something.", min: 45 },
  },

  /* ------------------------------------------------------------------ B1 */
  {
    id: "de-b1-mehrweg",
    level: "B1",
    genre: "article",
    title: "Mehrweg statt Einweg: der Kampf gegen den Kaffeebecher",
    titleEn: "Reusable instead of disposable: the fight against the coffee cup",
    paras: [
      ["Morgens am Bahnhof, schnell einen Kaffee zum Mitnehmen: Für viele Menschen gehört das zum Alltag. Das Problem ist der Becher. Er wird nur wenige Minuten benutzt und landet danach im Müll. In Deutschland werden jedes Jahr Milliarden solcher Einwegbecher weggeworfen.", "In the morning at the station, a quick coffee to go: for many people that is part of everyday life. The problem is the cup. It is used for only a few minutes and then ends up in the bin. In Germany, billions of these disposable cups are thrown away every year."],
      ["Seit 2023 müssen größere Restaurants, Cafés und Imbisse in Deutschland für Essen und Getränke zum Mitnehmen auch eine Mehrwegverpackung anbieten. Kleine Betriebe mit wenig Personal und wenig Fläche sind davon ausgenommen, aber sie müssen mitgebrachte Behälter der Kundschaft befüllen. Der Mehrwegbecher darf nicht teurer sein als der Einwegbecher. Oft zahlt man ein Pfand von einem oder zwei Euro und bekommt es zurück, wenn man den Becher abgibt.", "Since 2023, larger restaurants, cafés and snack bars in Germany have had to offer reusable packaging for takeaway food and drinks as well. Small businesses with few staff and little floor space are exempt, but they must fill containers that customers bring. The reusable cup may not cost more than the disposable one. Often you pay a deposit of one or two euros and get it back when you return the cup."],
      ["Hat das Gesetz etwas gebracht? Die Bilanz ist gemischt. Viele Cafés bieten Mehrwegbecher an, aber nur wenige Kundinnen und Kunden nutzen sie. Manche finden es unpraktisch, einen Becher mit sich herumzutragen. Andere wissen gar nicht, dass es das Angebot gibt, weil es nicht deutlich genug erklärt wird.", "Has the law achieved anything? The results are mixed. Many cafés offer reusable cups, but only a few customers use them. Some find it impractical to carry a cup around. Others don't even know the option exists, because it is not explained clearly enough."],
      ["Einige Städte gehen deshalb einen Schritt weiter. Sie haben ein gemeinsames System eingeführt: Man kann den Becher in einem Café kaufen und in einem anderen zurückgeben. Umweltverbände sagen: Die beste Lösung ist immer noch die einfachste – sich fünf Minuten Zeit nehmen und den Kaffee im Café trinken.", "Some cities are therefore going a step further. They have introduced a shared system: you can buy the cup in one café and return it in another. Environmental groups say the best solution is still the simplest — take five minutes and drink your coffee in the café."],
    ],
    questions: [
      { q: "Warum ist der Kaffeebecher ein Problem?", en: "Why is the coffee cup a problem?", answer: "Weil er nur wenige Minuten benutzt wird und danach im Müll landet.", key: [["Müll", "wegwerf", "weggeworfen", "Abfall"], ["Minute", "kurz", "einmal"]] },
      { q: "Was müssen größere Cafés seit 2023 tun?", en: "What have larger cafés had to do since 2023?", answer: "Sie müssen für Essen und Getränke zum Mitnehmen auch Mehrwegverpackungen anbieten.", key: [["Mehrweg", "wiederverwend"], ["anbiet", "Angebot"]] },
      { q: "Warum nutzen nur wenige Kunden die Mehrwegbecher? Nennen Sie zwei Gründe.", en: "Why do only a few customers use the reusable cups? Give two reasons.", answer: "Manche finden es unpraktisch, einen Becher mitzunehmen, und andere wissen nicht, dass es das Angebot gibt.", key: [["unpraktisch", "tragen", "mitnehmen", "mitzunehmen", "herum"], ["wissen nicht", "nicht bekannt", "kennen", "erklärt", "Information"]] },
      { q: "Was halten die Umweltverbände für die beste Lösung?", en: "What do environmental groups consider the best solution?", answer: "Sie finden es am besten, sich Zeit zu nehmen und den Kaffee im Café zu trinken.", key: [["Café", "dort", "sitzen", "Zeit"]] },
    ],
    write: { q: "Was tun Sie im Alltag gegen Müll? Oder warum ist es schwierig, weniger Müll zu produzieren? Schreiben Sie Ihre Meinung mit Beispielen.", en: "What do you do in everyday life to cut waste? Or why is producing less waste difficult? Give your opinion with examples.", min: 70 },
  },
  {
    id: "de-b1-neu-in-leipzig",
    level: "B1",
    genre: "story",
    title: "Neu in Leipzig",
    titleEn: "New in Leipzig",
    paras: [
      ["Als Clara nach Leipzig zog, kannte sie dort niemanden. Sie hatte eine Stelle als Grafikerin in einer kleinen Agentur gefunden, und die Arbeit gefiel ihr sofort. Aber die Abende waren lang. Nach der Arbeit ging sie nach Hause, kochte etwas, sah eine Serie und ging früh ins Bett.", "When Clara moved to Leipzig, she didn't know anyone there. She had found a job as a graphic designer in a small agency, and she liked the work straight away. But the evenings were long. After work she went home, cooked something, watched a series and went to bed early."],
      ["Ihre Kolleginnen waren nett, aber sie hatten Familie und wenig Zeit. Am Wochenende telefonierte Clara stundenlang mit ihrer Schwester in München. „Du musst etwas unternehmen“, sagte die Schwester. „Such dir ein Hobby, bei dem man Leute trifft.“", "Her colleagues were nice, but they had families and little time. At the weekend Clara spent hours on the phone to her sister in Munich. 'You have to do something,' said her sister. 'Find a hobby where you meet people.'"],
      ["Clara hatte als Kind im Schulchor gesungen, also meldete sie sich bei einem Chor in ihrem Stadtteil an. Beim ersten Treffen war sie so nervös, dass sie fast wieder nach Hause gegangen wäre. Doch eine ältere Frau namens Helga nahm sie bei der Hand und stellte sie allen vor. Die Proben fanden jeden Dienstag statt, und danach ging die ganze Gruppe noch in eine Kneipe.", "Clara had sung in the school choir as a child, so she signed up for a choir in her neighbourhood. At the first meeting she was so nervous that she almost went home again. But an older woman called Helga took her by the hand and introduced her to everyone. Rehearsals were every Tuesday, and afterwards the whole group went on to a pub."],
      ["Heute, zwei Jahre später, singt Clara immer noch im Chor. Helga ist ihre beste Freundin geworden, obwohl sie fast vierzig Jahre älter ist. „Ich bin nicht wegen der Musik geblieben“, sagt Clara und lacht. „Aber ich singe jetzt viel besser.“", "Today, two years later, Clara still sings in the choir. Helga has become her best friend, although she is almost forty years older. 'I didn't stay because of the music,' says Clara, laughing. 'But I do sing much better now.'"],
    ],
    questions: [
      { q: "Wie sah Claras Alltag am Anfang in Leipzig aus?", en: "What was Clara's everyday life like at first in Leipzig?", answer: "Nach der Arbeit ging sie allein nach Hause, kochte, sah eine Serie und ging früh ins Bett.", key: [["allein", "niemand", "einsam", "Serie", "früh", "Bett", "nach Hause"]] },
      { q: "Welchen Rat gab ihr ihre Schwester?", en: "What advice did her sister give her?", answer: "Sie sagte, Clara solle sich ein Hobby suchen, bei dem man Leute trifft.", key: [["Hobby"], ["Leute", "Menschen", "kennenlernen", "treffen", "trifft"]] },
      { q: "Warum wäre Clara beim ersten Treffen fast wieder gegangen, und was hat ihr geholfen?", en: "Why did Clara almost leave at the first meeting, and what helped her?", answer: "Sie war sehr nervös, aber Helga nahm sie bei der Hand und stellte sie allen vor.", key: [["nervös", "Angst", "schüchtern"], ["Helga", "Hand", "vorgestellt", "stellte"]] },
      { q: "Was meint Clara mit dem Satz „Ich bin nicht wegen der Musik geblieben“?", en: "What does Clara mean by 'I didn't stay because of the music'?", answer: "Sie meint, dass sie vor allem wegen der Freundschaft und der Menschen im Chor geblieben ist.", key: [["Freund", "Menschen", "Leute", "Gruppe", "Gemeinschaft", "Helga"]] },
    ],
    write: { q: "Waren Sie schon einmal neu an einem Ort, zum Beispiel in einer Stadt, einer Schule oder bei einer Arbeit? Erzählen Sie, wie Sie dort Menschen kennengelernt haben.", en: "Have you ever been new somewhere — a city, a school, a job? Tell how you got to know people there.", min: 80 },
  },
  {
    id: "de-b1-leserbrief-sonntag",
    level: "B1",
    genre: "letter",
    title: "Leserbrief: Sollen Geschäfte sonntags öffnen?",
    titleEn: "Letter to the editor: should shops open on Sundays?",
    paras: [
      ["Zu Ihrem Artikel „Mehr verkaufsoffene Sonntage?“", "Re your article 'More shopping Sundays?'"],
      ["Sehr geehrte Damen und Herren,", "Dear Sir or Madam,"],
      ["in Ihrem Artikel fordert ein Unternehmer, dass die Geschäfte in der Innenstadt auch am Sonntag öffnen dürfen. Er meint, dass viele Menschen unter der Woche keine Zeit zum Einkaufen haben und dass die Läden sonst gegen den Onlinehandel verlieren. Ich verstehe dieses Argument, aber ich bin trotzdem anderer Meinung.", "In your article, a businessman calls for shops in the city centre to be allowed to open on Sundays too. He thinks that many people have no time to shop during the week and that otherwise the shops will lose out to online retail. I understand this argument, but I still disagree."],
      ["Ich arbeite seit zwölf Jahren als Verkäuferin in einem Kaufhaus. Schon jetzt arbeite ich jeden zweiten Samstag, oft bis acht Uhr abends. Der Sonntag ist für mich und meine Kolleginnen der einzige Tag, an dem die ganze Familie zusammen ist. Wenn die Geschäfte öffnen, müssen wir arbeiten – und unsere Kinder sehen uns noch weniger.", "I have worked as a sales assistant in a department store for twelve years. I already work every other Saturday, often until eight in the evening. For me and my colleagues, Sunday is the only day when the whole family is together. If the shops open, we will have to work — and our children will see us even less."],
      ["Außerdem glaube ich nicht, dass wirklich mehr gekauft wird. Die Menschen haben ja nicht mehr Geld, nur weil die Läden länger offen sind. Sie verteilen ihre Einkäufe nur auf mehr Tage. Ein ruhiger Sonntag ist kein Luxus, sondern ein Stück Lebensqualität für alle – auch für die Kundinnen und Kunden.", "Besides, I don't believe that more will really be bought. People don't have more money just because shops are open longer. They simply spread their shopping over more days. A quiet Sunday is not a luxury but a piece of quality of life for everyone — customers included."],
      ["Mit freundlichen Grüßen\nPetra Lorenz, Dresden", "Yours sincerely,\nPetra Lorenz, Dresden"],
    ],
    questions: [
      { q: "Welche Argumente hat der Unternehmer für die Sonntagsöffnung?", en: "What arguments does the businessman give for Sunday opening?", answer: "Er sagt, dass viele Menschen unter der Woche keine Zeit zum Einkaufen haben und dass die Läden sonst gegen den Onlinehandel verlieren.", key: [["keine Zeit", "unter der Woche", "arbeiten"], ["online", "Internet", "Konkurrenz", "verlieren"]] },
      { q: "Warum ist der Sonntag für Frau Lorenz so wichtig?", en: "Why is Sunday so important to Ms Lorenz?", answer: "Weil es der einzige Tag ist, an dem ihre ganze Familie zusammen ist.", key: [["Familie", "Kinder", "zusammen"]] },
      { q: "Warum glaubt sie nicht, dass am Sonntag mehr verkauft wird?", en: "Why does she not believe that more will be sold on Sundays?", answer: "Weil die Menschen nicht mehr Geld haben; sie verteilen ihre Einkäufe nur auf mehr Tage.", key: [["Geld"], ["verteil", "mehr Tage", "anderen Tag", "gleich"]] },
      { q: "Was bedeutet der Ausdruck „ein Stück Lebensqualität“ in diesem Brief?", en: "What does the phrase 'a piece of quality of life' mean in this letter?", answer: "Er bedeutet, dass ein ruhiger Sonntag das Leben angenehmer macht, weil man Zeit für sich und die Familie hat.", key: [["besser", "angenehm", "schön", "gut", "wichtig"], ["Ruhe", "ruhig", "Zeit", "Familie", "erholen", "entspann"]] },
    ],
    write: { q: "Sollen Geschäfte am Sonntag öffnen? Schreiben Sie selbst einen Leserbrief mit Ihrer Meinung und zwei Argumenten.", en: "Should shops open on Sundays? Write your own letter to the editor with your opinion and two arguments.", min: 80 },
  },

  /* ------------------------------------------------------------------ B2 */
  {
    id: "de-b2-vier-tage-woche",
    level: "B2",
    genre: "article",
    title: "Die Vier-Tage-Woche: Zukunftsmodell oder Wunschdenken?",
    titleEn: "The four-day week: model for the future or wishful thinking?",
    paras: [
      ["Vier Tage arbeiten, drei Tage frei – und das bei vollem Lohn. Was vor einigen Jahren noch utopisch klang, wird inzwischen in vielen Ländern ausprobiert. Auch in Deutschland haben Dutzende Unternehmen an einem Pilotprojekt teilgenommen, bei dem die Beschäftigten ein halbes Jahr lang nur an vier Tagen pro Woche arbeiteten.", "Four days of work, three days off — on full pay. What sounded utopian a few years ago is now being tried in many countries. In Germany too, dozens of companies took part in a pilot project in which employees worked only four days a week for six months."],
      ["Die Befürworter berichten von erstaunlichen Ergebnissen. Die Mitarbeitenden seien ausgeruhter, seltener krank und konzentrierter bei der Arbeit. Viele Firmen stellten fest, dass ihre Produktivität kaum gesunken oder sogar gestiegen sei. Besprechungen wurden kürzer, unnötige Aufgaben fielen weg. Gleichzeitig hoffen die Firmen, mit dem Modell im Wettbewerb um Fachkräfte attraktiver zu werden.", "Supporters report astonishing results. Staff are said to be more rested, less often ill and more focused at work. Many firms found that their productivity had hardly fallen, or had even risen. Meetings became shorter, unnecessary tasks fell away. At the same time, the firms hope the model will make them more attractive in the competition for skilled workers."],
      ["Auch die Beschäftigten selbst erleben die Umstellung nicht nur positiv. Wer die gleiche Arbeit in vier statt fünf Tagen schaffen soll, arbeitet an diesen Tagen oft konzentrierter, aber auch unter mehr Druck. Pausen werden kürzer, private Gespräche mit Kollegen seltener. Manche berichten, dass sie den freien Freitag in den ersten Wochen vor allem zum Erholen brauchten.", "Nor do the employees themselves experience the change as purely positive. Anyone expected to do the same work in four days instead of five often works in a more focused way on those days, but also under more pressure. Breaks get shorter, personal chats with colleagues rarer. Some report that in the first weeks they needed the free Friday mainly to recover."],
      ["Kritiker halten dagegen, dass sich das Modell längst nicht für alle Branchen eignet. In einem Krankenhaus, in einer Bäckerei oder auf einer Baustelle lässt sich die Arbeit nicht einfach in weniger Zeit erledigen. Wer dort weniger arbeitet, braucht zusätzliches Personal – und genau das fehlt schon heute. Außerdem warnen manche Ökonomen: Wenn ein ganzes Land weniger arbeitet, könnte das den Wohlstand langfristig gefährden.", "Critics counter that the model is far from suitable for every sector. In a hospital, a bakery or on a building site, the work cannot simply be done in less time. Anyone who works less there needs extra staff — and that is exactly what is already lacking. Some economists also warn that if a whole country works less, it could endanger prosperity in the long run."],
      ["Vermutlich liegt die Wahrheit, wie so oft, in der Mitte. Die Vier-Tage-Woche wird nicht überall funktionieren, aber sie zwingt Unternehmen, sich eine unbequeme Frage zu stellen: Wie viel von unserer Arbeitszeit ist tatsächlich produktiv – und wie viel davon ist nur Gewohnheit?", "The truth probably lies, as so often, somewhere in the middle. The four-day week will not work everywhere, but it forces companies to ask themselves an uncomfortable question: how much of our working time is actually productive — and how much of it is just habit?"],
    ],
    questions: [
      { q: "Was wurde im deutschen Pilotprojekt getestet?", en: "What was tested in the German pilot project?", answer: "Die Beschäftigten haben ein halbes Jahr lang nur an vier Tagen pro Woche gearbeitet, bei vollem Lohn.", key: [["vier Tage", "4 Tage", "vier Tagen"], ["halbes Jahr", "sechs Monate", "Lohn", "Gehalt"]] },
      { q: "Welche positiven Ergebnisse nennen die Befürworter?", en: "What positive results do the supporters mention?", answer: "Die Mitarbeitenden sind ausgeruhter, seltener krank und konzentrierter, und die Produktivität ist kaum gesunken.", key: [["ausgeruht", "erholt", "krank", "konzentriert", "motiviert"], ["Produktivität", "produktiv", "Besprechung", "Fachkräfte", "attraktiv"]] },
      { q: "Warum eignet sich das Modell laut den Kritikern nicht für alle Branchen?", en: "Why, according to the critics, is the model not suitable for every sector?", answer: "Weil man zum Beispiel in einem Krankenhaus die Arbeit nicht in weniger Zeit schaffen kann und dann zusätzliches Personal braucht, das schon heute fehlt.", key: [["Krankenhaus", "Bäckerei", "Baustelle", "Pflege"], ["Personal", "Mitarbeiter", "Fachkräfte", "fehlt", "Leute"]] },
      { q: "Welche „unbequeme Frage“ stellt die Vier-Tage-Woche laut dem Text?", en: "What 'uncomfortable question' does the four-day week raise, according to the text?", answer: "Sie fragt, wie viel unserer Arbeitszeit wirklich produktiv ist und wie viel nur Gewohnheit.", key: [["produktiv", "effizient", "sinnvoll", "nützlich"], ["Gewohnheit", "gewohnt", "Routine"]] },
    ],
    write: { q: "Würden Sie gern nur vier Tage pro Woche arbeiten? Diskutieren Sie Vor- und Nachteile und nehmen Sie Stellung.", en: "Would you like to work only four days a week? Discuss the pros and cons and take a position.", min: 110 },
  },
  {
    id: "de-b2-repair-cafe",
    level: "B2",
    genre: "feature",
    title: "Reparieren statt wegwerfen: ein Nachmittag im Repair-Café",
    titleEn: "Repair instead of throwing away: an afternoon at the Repair Café",
    paras: [
      ["Jeden ersten Samstag im Monat verwandelt sich der Gemeindesaal einer Kirche in Freiburg in eine Werkstatt. Auf langen Tischen liegen Toaster, Nähmaschinen, Lampen und kaputte Kopfhörer. Dazwischen sitzen Menschen mit Schraubenziehern, Lötkolben und viel Geduld. Die Idee der Repair-Cafés stammt aus den Niederlanden und hat sich inzwischen in vielen Ländern verbreitet.", "Every first Saturday of the month, a church hall in Freiburg turns into a workshop. On long tables lie toasters, sewing machines, lamps and broken headphones. Between them sit people with screwdrivers, soldering irons and a great deal of patience. The idea of Repair Cafés comes from the Netherlands and has since spread to many countries."],
      ["Einer der Helfer ist Werner, 71 Jahre alt, früher Elektriker. Heute beugt er sich über einen alten Staubsauger, den eine junge Frau mitgebracht hat. „Die meisten Geräte sind gar nicht richtig kaputt“, erklärt er. „Oft ist nur ein Kabel locker oder eine kleine Sicherung durchgebrannt. Aber die Hersteller machen es einem schwer: Viele Geräte sind verklebt statt verschraubt, und Ersatzteile gibt es kaum.“", "One of the helpers is Werner, 71, a former electrician. Today he is bent over an old vacuum cleaner that a young woman has brought in. 'Most appliances aren't really broken at all,' he explains. 'Often it's just a loose cable or a small blown fuse. But the manufacturers make it hard: many devices are glued instead of screwed together, and spare parts are hard to find.'"],
      ["Die junge Frau heißt Selin und studiert Umweltwissenschaften. Sie hätte sich für vierzig Euro einen neuen Staubsauger kaufen können. „Aber es ist doch absurd, etwas wegzuwerfen, nur weil ein Teil für ein paar Cent kaputt ist“, sagt sie. Nach einer halben Stunde brummt der Staubsauger wieder. Selin applaudiert, Werner lächelt zufrieden.", "The young woman is called Selin and studies environmental science. She could have bought a new vacuum cleaner for forty euros. 'But it's absurd to throw something away just because a part worth a few cents is broken,' she says. After half an hour the vacuum cleaner is humming again. Selin applauds; Werner smiles, satisfied."],
      ["Die Politik hat das Problem inzwischen erkannt. Die Europäische Union hat ein „Recht auf Reparatur“ beschlossen: Hersteller bestimmter Geräte sollen verpflichtet werden, Ersatzteile und Reparaturanleitungen über Jahre bereitzustellen. Werner ist skeptisch, ob das reicht. „Ein Gesetz repariert keinen Toaster“, sagt er. „Dafür braucht es Leute, die wissen, wie es geht.“", "Politicians have now recognised the problem. The European Union has adopted a 'right to repair': manufacturers of certain appliances are to be obliged to supply spare parts and repair instructions for years. Werner doubts that it is enough. 'A law doesn't fix a toaster,' he says. 'For that you need people who know how.'"],
      ["Um Geld geht es den meisten Besucherinnen und Besuchern allerdings nicht in erster Linie. Viele kommen, weil sie sich über die Wegwerfgesellschaft ärgern. Andere kommen vor allem wegen der Gespräche und wegen des Kuchens, den Ehrenamtliche jeden Monat backen. Und manche, sagt Werner, kommen einfach, um zu lernen, wie ihre Dinge funktionieren. „Wer einmal selbst etwas repariert hat, kauft danach anders ein.“", "For most visitors, though, money is not the main thing. Many come because the throwaway society annoys them. Others come mainly for the conversation and for the cake that volunteers bake every month. And some, says Werner, come simply to learn how their things work. 'Anyone who has once repaired something themselves shops differently afterwards.'"],
    ],
    questions: [
      { q: "Was passiert jeden ersten Samstag im Monat im Gemeindesaal?", en: "What happens every first Saturday of the month in the church hall?", answer: "Freiwillige helfen den Leuten, kaputte Geräte zu reparieren.", key: [["reparier", "Reparatur", "Werkstatt"], ["Gerät", "kaputt", "Toaster", "Lampe", "helfen", "Helfer", "Freiwillig"]] },
      { q: "Warum ist es laut Werner oft schwer, Geräte zu reparieren?", en: "According to Werner, why is it often hard to repair appliances?", answer: "Weil viele Geräte verklebt statt verschraubt sind und es kaum Ersatzteile gibt.", key: [["verklebt", "geklebt", "Kleb"], ["Ersatzteil", "Teile"]] },
      { q: "Warum hat Selin keinen neuen Staubsauger gekauft?", en: "Why didn't Selin buy a new vacuum cleaner?", answer: "Weil sie es absurd findet, etwas wegzuwerfen, nur weil ein kleines, billiges Teil kaputt ist.", key: [["absurd", "unsinnig", "Verschwendung", "schade", "Umwelt"], ["Teil", "Cent", "klein", "billig", "wegwerfen", "wegzuwerfen"]] },
      { q: "Was meint Werner mit dem Satz „Wer einmal selbst etwas repariert hat, kauft danach anders ein“?", en: "What does Werner mean by 'Anyone who has once repaired something themselves shops differently afterwards'?", answer: "Er meint, dass man danach bewusster einkauft, zum Beispiel Geräte, die länger halten und die man reparieren kann.", key: [["bewusst", "Qualität", "länger", "reparierbar", "reparieren kann", "weniger", "überleg", "sorgfältig"]] },
    ],
    write: { q: "Reparieren Sie Dinge selbst, oder kaufen Sie lieber neu? Beschreiben Sie Ihre Erfahrungen und diskutieren Sie, warum wir so viel wegwerfen.", en: "Do you repair things yourself, or would you rather buy new? Describe your experience and discuss why we throw so much away.", min: 110 },
  },
  {
    id: "de-b2-fundbuero",
    level: "B2",
    genre: "story",
    title: "Das Fundbüro",
    titleEn: "The lost-property office",
    paras: [
      ["Seit dreiundzwanzig Jahren arbeitete Herr Albrecht im Fundbüro der Stadt. Er hatte schon alles gesehen: Regenschirme in allen Farben, einzelne Handschuhe, ein Gebiss, eine Urne, sogar einmal ein Hochzeitskleid, das nie abgeholt wurde. Zu jedem Gegenstand schrieb er eine Karteikarte, sorgfältig und in schöner Schrift, obwohl längst ein Computer auf seinem Tisch stand.", "Mr Albrecht had worked at the city's lost-property office for twenty-three years. He had seen everything: umbrellas in every colour, single gloves, a set of false teeth, an urn, once even a wedding dress that was never collected. For every object he wrote an index card, carefully and in fine handwriting, even though a computer had long stood on his desk."],
      ["An einem Dienstag im November brachte ein Busfahrer ein kleines, abgegriffenes Notizbuch. Auf der ersten Seite stand kein Name, nur ein Satz: „Für den Fall, dass ich vergesse, wer ich war.“ Herr Albrecht hätte es wie immer in eine Kiste legen sollen. Stattdessen nahm er es in der Mittagspause mit in den Park und begann zu lesen.", "On a Tuesday in November, a bus driver brought in a small, worn notebook. On the first page there was no name, only one sentence: 'In case I forget who I was.' Mr Albrecht should have put it in a box as usual. Instead, he took it to the park in his lunch break and began to read."],
      ["Das Buch war voller Erinnerungen, notiert in einer zittrigen Handschrift: der Geruch der Bäckerei, in der die Schreiberin als Kind Brötchen geholt hatte; der Name eines Hundes; ein Tanzabend im Jahr 1961; ein Streit mit einer Schwester, der nie beigelegt worden war. Die letzten Seiten wurden immer kürzer. Auf der allerletzten stand nur noch eine Adresse.", "The book was full of memories, written in a shaky hand: the smell of the bakery where the writer had fetched bread rolls as a child; the name of a dog; an evening of dancing in 1961; a quarrel with a sister that had never been settled. The last pages grew shorter and shorter. On the very last one there was only an address."],
      ["Nach Feierabend fuhr Herr Albrecht zu dieser Adresse. Es war ein Pflegeheim. Die Frau am Empfang sah das Notizbuch an und wurde still. „Frau Keller sucht es seit Tagen“, sagte sie leise. „Sie weiß nicht mehr genau, was sie verloren hat. Nur, dass es wichtig war.“", "After work, Mr Albrecht drove to that address. It was a care home. The woman at reception looked at the notebook and fell silent. 'Mrs Keller has been looking for it for days,' she said quietly. 'She no longer knows exactly what she has lost. Only that it was important.'"],
      ["Er setzte sich zu der alten Dame in den Gemeinschaftsraum. Sie hielt das Buch mit beiden Händen fest, blätterte langsam und lächelte bei manchen Seiten, als träfe sie alte Bekannte. Nach einer Weile sah sie auf und fragte ihn, ob er ihr etwas vorlesen könne. Er las ihr vor, bis es draußen dunkel wurde.", "He sat down with the old lady in the common room. She held the book tightly in both hands, leafed through it slowly and smiled at some of the pages, as if meeting old friends. After a while she looked up and asked whether he could read something to her. He read to her until it grew dark outside."],
      ["Herr Albrecht schrieb an diesem Abend keine Karteikarte. Aber am nächsten Morgen kaufte er sich ein kleines Notizbuch und schrieb auf die erste Seite einen einzigen Satz.", "Mr Albrecht wrote no index card that evening. But the next morning he bought himself a small notebook and wrote a single sentence on the first page."],
    ],
    questions: [
      { q: "Was erfahren wir im ersten Absatz über Herrn Albrechts Arbeitsweise?", en: "What do we learn in the first paragraph about the way Mr Albrecht works?", answer: "Er schreibt zu jedem Gegenstand sorgfältig eine Karteikarte von Hand, obwohl er einen Computer hat.", key: [["Karteikarte", "Karte", "schreibt", "Hand"], ["sorgfältig", "genau", "Computer", "ordentlich", "schön"]] },
      { q: "Warum liest Herr Albrecht das Notizbuch, statt es in eine Kiste zu legen?", en: "Why does Mr Albrecht read the notebook instead of putting it in a box?", answer: "Der Satz auf der ersten Seite macht ihn neugierig, weil jemand Angst hatte, zu vergessen, wer er war.", key: [["Satz", "neugierig", "Neugier", "interess", "berührt", "vergess"]] },
      { q: "Was steht in dem Notizbuch, und warum wurde es geschrieben?", en: "What is in the notebook, and why was it written?", answer: "Es enthält die Erinnerungen einer alten Frau, die sie aufgeschrieben hat, weil sie Angst hatte, ihr Gedächtnis zu verlieren.", key: [["Erinnerung", "Leben", "Vergangenheit"], ["vergess", "Gedächtnis", "Demenz", "krank", "alt"]] },
      { q: "Welchen Satz könnte Herr Albrecht am Ende in sein eigenes Notizbuch geschrieben haben? Begründen Sie Ihre Vermutung.", en: "What sentence might Mr Albrecht have written in his own notebook at the end? Give reasons for your guess.", answer: "Vielleicht hat er denselben Satz geschrieben, weil er verstanden hat, wie wertvoll Erinnerungen sind.", key: [["Erinnerung", "vergess", "denselben", "selben", "wer ich war", "Leben", "wertvoll"]] },
    ],
    write: { q: "Schreiben Sie eine kurze Geschichte über einen Gegenstand, der verloren und wiedergefunden wird.", en: "Write a short story about an object that is lost and found again.", min: 120 },
  },

  /* ------------------------------------------------------------------ C1 */
  {
    id: "de-c1-sprachverfall",
    level: "C1",
    genre: "essay",
    title: "Verfällt die deutsche Sprache?",
    titleEn: "Is the German language in decline?",
    paras: [
      ["Kaum ein Thema erregt die Gemüter so zuverlässig wie der vermeintliche Niedergang der eigenen Sprache. Leserbriefe beklagen das „Denglisch“ in der Werbung, Eltern sorgen sich um die Rechtschreibung ihrer Kinder, und in sozialen Netzwerken wird über das Gendern gestritten, als ginge es um Leben und Tod. Die Diagnose scheint eindeutig: Das Deutsche verkommt.", "Hardly any topic stirs people up as reliably as the supposed decline of their own language. Letters to the editor lament the 'Denglisch' in advertising, parents worry about their children's spelling, and on social media people fight over gender-inclusive language as if it were a matter of life and death. The diagnosis seems clear: German is going to the dogs."],
      ["Sprachwissenschaftlerinnen und Sprachwissenschaftler reagieren auf solche Klagen meist gelassen. Sie verweisen darauf, dass sich Sprachen schon immer verändert haben und dass jede Generation den Verfall der Sprache beklagt hat. Bereits im siebzehnten Jahrhundert entstanden Sprachgesellschaften, die das Deutsche vor dem übermächtigen Einfluss des Französischen schützen wollten. Wörter wie „Balkon“, „Friseur“ oder „Portemonnaie“, die einst als Fremdkörper galten, empfindet heute kaum jemand mehr als fremd.", "Linguists generally react calmly to such complaints. They point out that languages have always changed and that every generation has lamented the decline of the language. As early as the seventeenth century, language societies sprang up to protect German from the overwhelming influence of French. Words like 'Balkon', 'Friseur' or 'Portemonnaie', once regarded as foreign bodies, now strike hardly anyone as foreign."],
      ["Ähnlich heftig verlief der Streit um die Rechtschreibreform von 1996. Zeitungen kündigten an, die neuen Regeln nicht zu übernehmen, Schriftsteller sprachen von einem Kulturbruch, und Gegner zogen bis vor das Bundesverfassungsgericht. Eine Generation später schreiben Schülerinnen und Schüler „dass“ mit Doppel-s, ohne einen Gedanken daran zu verschwenden, und die alte Schreibung „daß“ wirkt auf sie so altmodisch wie ein Schild in Frakturschrift. Was einst als Zerstörung galt, ist für sie schlicht die Norm.", "The dispute over the 1996 spelling reform was just as fierce. Newspapers announced they would not adopt the new rules, writers spoke of a cultural rupture, and opponents took the matter all the way to the Federal Constitutional Court. A generation later, schoolchildren write 'dass' with a double s without giving it a thought, and the old spelling 'daß' looks as old-fashioned to them as a sign in blackletter. What once counted as destruction is simply the norm to them."],
      ["Das bedeutet nicht, dass alle Veränderungen gleichgültig wären. Wer im Beruf keine verständliche E-Mail schreiben kann, ist tatsächlich im Nachteil, und wenn Behörden in einer Sprache kommunizieren, die nur Eingeweihte verstehen, schließen sie Menschen aus. Doch diese Probleme haben wenig mit Anglizismen oder Jugendsprache zu tun. Sie betreffen die Frage, ob wir unterschiedliche Register beherrschen: ob wir wissen, wie man einer Freundin schreibt und wie einer Versicherung.", "That does not mean that all changes are unimportant. Anyone who cannot write a comprehensible email at work really is at a disadvantage, and when public authorities communicate in a language that only insiders understand, they shut people out. But these problems have little to do with anglicisms or youth slang. They concern whether we command different registers: whether we know how to write to a friend and how to write to an insurance company."],
      ["Sprachverfall, so könnte man zugespitzt sagen, ist meist nur ein anderes Wort für Sprachwandel, den man selbst nicht mitgemacht hat. Die eigentliche Herausforderung besteht nicht darin, das Deutsche vor fremden Einflüssen zu bewahren, sondern darin, möglichst vielen Menschen einen selbstbewussten Umgang mit seinen vielen Varianten zu ermöglichen – vom Chat bis zum Bewerbungsschreiben.", "Language decline, one might say pointedly, is usually just another word for language change that one has not gone along with oneself. The real challenge is not to protect German from foreign influence, but to give as many people as possible a confident command of its many varieties — from a chat message to a job application."],
    ],
    questions: [
      { q: "Welche Beispiele nennt der Text für die Sorge um die deutsche Sprache?", en: "What examples does the text give of concern about the German language?", answer: "Leserbriefe beklagen Denglisch in der Werbung, Eltern sorgen sich um die Rechtschreibung ihrer Kinder, und im Netz wird über das Gendern gestritten.", key: [["Denglisch", "Englisch", "Anglizism", "Werbung"], ["Rechtschreibung", "Gendern", "Kinder", "Eltern"]] },
      { q: "Womit begründen Sprachwissenschaftler ihre Gelassenheit?", en: "How do linguists justify their calm?", answer: "Sie sagen, dass Sprachen sich schon immer verändert haben und dass jede Generation den Verfall beklagt hat, zum Beispiel schon im siebzehnten Jahrhundert wegen des Französischen.", key: [["verändert", "Wandel", "immer", "jede Generation"], ["Französisch", "Jahrhundert", "Balkon", "Friseur", "früher", "damals"]] },
      { q: "Welche sprachlichen Probleme nimmt der Autor ernst, und warum?", en: "Which language problems does the author take seriously, and why?", answer: "Er nimmt ernst, wenn Menschen keine verständliche E-Mail schreiben können oder Behörden unverständlich kommunizieren, weil das Menschen benachteiligt oder ausschließt.", key: [["E-Mail", "Behörde", "verständlich", "Register"], ["Nachteil", "benachteilig", "ausschließ", "ausgeschlossen"]] },
      { q: "Erklären Sie den Satz „Sprachverfall ist meist nur ein anderes Wort für Sprachwandel, den man selbst nicht mitgemacht hat“.", en: "Explain the sentence 'Language decline is usually just another word for language change that one has not gone along with oneself'.", answer: "Er bedeutet, dass Menschen neue Formen, die sie selbst nicht übernommen haben, als Verfall empfinden, obwohl es sich um normalen Wandel handelt.", key: [["neue", "Veränderung", "verändert", "normal"], ["übernommen", "ältere", "gewohnt", "empfind", "subjektiv", "eigene"]] },
    ],
    write: { q: "Verändert sich Ihre Muttersprache zum Schlechten? Nehmen Sie Stellung und berücksichtigen Sie dabei Argumente aus dem Text.", en: "Is your native language changing for the worse? Take a position, drawing on arguments from the text.", min: 150 },
  },
  {
    id: "de-c1-zurueck-aufs-land",
    level: "C1",
    genre: "essay",
    title: "Zurück aufs Land?",
    titleEn: "Back to the countryside?",
    paras: [
      ["Jahrzehntelang schien die Richtung klar: Junge Menschen zogen in die Städte, weil es dort Arbeit, Hochschulen und Kultur gab, während viele Dörfer überalterten und Schulen, Arztpraxen und Läden schließen mussten. Seit einigen Jahren mehren sich jedoch Berichte über eine Gegenbewegung. Familien kaufen leer stehende Höfe, Kreative gründen in alten Bahnhöfen Gemeinschaftsbüros, und manche Gemeinden, die längst abgeschrieben schienen, verzeichnen erstmals wieder Zuzug.", "For decades the direction seemed clear: young people moved to the cities, where the jobs, universities and culture were, while many villages aged and schools, doctors' practices and shops had to close. For some years, however, reports of a counter-movement have been multiplying. Families are buying empty farmsteads, creative people are setting up shared offices in old railway stations, and some villages that seemed long written off are gaining new residents for the first time."],
      ["Möglich gemacht hat das vor allem die Digitalisierung. Wer seine Arbeit am Laptop erledigen kann, ist nicht mehr zwingend an einen Ort gebunden – vorausgesetzt, das Internet ist schnell genug. Hinzu kommen die stark gestiegenen Mieten in den Ballungsräumen: Für den Preis einer Dreizimmerwohnung in München bekommt man in manchen Regionen ein ganzes Haus mit Garten.", "What made this possible above all is digitalisation. Anyone who can do their job on a laptop is no longer necessarily tied to one place — provided the internet is fast enough. On top of that come the steeply risen rents in the big conurbations: for the price of a three-room flat in Munich, in some regions you can get a whole house with a garden."],
      ["Doch die Idylle hat ihre Tücken. Wer aufs Land zieht, ist oft auf das Auto angewiesen, denn Busse fahren vielerorts nur zweimal am Tag. Die nächste Kinderärztin ist womöglich eine halbe Stunde entfernt, und das Glasfaserkabel, das im Prospekt versprochen wurde, lässt auf sich warten. Zudem prallen nicht selten unterschiedliche Lebensentwürfe aufeinander: Alteingesessene erleben die Neuankömmlinge manchmal als Städter, die das Dorf romantisieren, sich aber weder in der Feuerwehr noch im Sportverein engagieren.", "But the idyll has its snags. Anyone who moves to the countryside often depends on a car, because in many places buses run only twice a day. The nearest paediatrician may be half an hour away, and the fibre-optic cable promised in the brochure is slow to arrive. And different ways of life often collide: long-standing residents sometimes see the newcomers as city people who romanticise the village but join neither the fire brigade nor the sports club."],
      ["Hinzu kommt eine Frage der Gerechtigkeit. Die Stadtflucht ist bislang vor allem ein Phänomen gut verdienender Akademikerinnen und Akademiker, deren Arbeit sich ins Homeoffice verlegen lässt. Die Pflegekraft, der Busfahrer oder die Verkäuferin haben diese Wahl nicht – sie müssen dort wohnen, wo ihre Arbeit ist, und zahlen in den Städten die Mieten, vor denen andere aufs Land ausweichen.", "There is also a question of fairness. So far, leaving the city is mainly a phenomenon of well-paid graduates whose work can move into a home office. The care worker, the bus driver or the shop assistant have no such choice — they have to live where their work is, and in the cities they pay the rents that others escape by moving to the country."],
      ["Ob aus der Bewegung ein dauerhafter Trend wird, hängt deshalb weniger von den Zugezogenen ab als von der Politik. Ohne verlässliche Verkehrsverbindungen, schnelles Internet und eine medizinische Grundversorgung bleibt das Landleben ein Privileg für jene, die es sich leisten können, flexibel zu sein. Die Frage ist also nicht, ob Menschen aufs Land wollen, sondern ob man ihnen dort ein Leben ermöglicht, das mehr ist als eine schöne Aussicht.", "Whether the movement becomes a lasting trend therefore depends less on the newcomers than on politics. Without reliable transport links, fast internet and basic medical care, country life remains a privilege for those who can afford to be flexible. So the question is not whether people want to move to the countryside, but whether they are given a life there that is more than a nice view."],
    ],
    questions: [
      { q: "Welche Entwicklung prägte die Dörfer über Jahrzehnte?", en: "What development shaped the villages for decades?", answer: "Junge Menschen zogen in die Städte, und die Dörfer überalterten, sodass Schulen, Arztpraxen und Läden schließen mussten.", key: [["Stadt", "Städte", "wegzogen", "abgewandert"], ["überalter", "alt", "schließ", "Schule", "Läden"]] },
      { q: "Welche zwei Faktoren machen das Landleben heute attraktiver?", en: "Which two factors make country life more attractive today?", answer: "Die Digitalisierung ermöglicht es, von überall zu arbeiten, und die Mieten in den Städten sind stark gestiegen.", key: [["Digital", "Internet", "Laptop", "Homeoffice", "von überall", "online"], ["Miete", "Preis", "teuer", "Wohnung", "Haus"]] },
      { q: "Welche Konflikte zwischen Alteingesessenen und Neuankömmlingen beschreibt der Text?", en: "What conflicts between long-standing residents and newcomers does the text describe?", answer: "Die Alteingesessenen sehen die Neuen manchmal als Städter, die das Dorf romantisieren, sich aber nicht in Vereinen wie der Feuerwehr engagieren.", key: [["romantisier", "Städter", "Idylle"], ["Feuerwehr", "Verein", "engagier", "mitmachen"]] },
      { q: "Wie verstehen Sie den Schluss: „ein Leben, das mehr ist als eine schöne Aussicht“?", en: "How do you understand the ending: 'a life that is more than a nice view'?", answer: "Das Landleben muss mehr bieten als schöne Natur, nämlich Infrastruktur wie Busse, Internet und Ärzte, damit man dort wirklich gut leben kann.", key: [["Infrastruktur", "Bus", "Verkehr", "Internet", "Arzt", "Ärzt", "Versorgung", "Politik"]] },
    ],
    write: { q: "Stadt oder Land: Wo möchten Sie in zehn Jahren leben? Wägen Sie die Argumente ab und begründen Sie Ihre Entscheidung.", en: "City or country: where would you like to live in ten years? Weigh up the arguments and justify your decision.", min: 150 },
  },
  {
    id: "de-c1-glosse-warten",
    level: "C1",
    genre: "column",
    title: "Glosse: Die hohe Kunst des Wartens",
    titleEn: "Satirical column: the fine art of waiting",
    paras: [
      ["Es gibt Menschen, die meditieren, um Gelassenheit zu lernen. Sie besuchen teure Seminare, sitzen im Schneidersitz auf Yogamatten und versuchen, an nichts zu denken. Ich halte das für Verschwendung. Wer Gelassenheit lernen will, braucht nur eine Fahrkarte der Bahn und etwas Zeit – wobei sich Letzteres ohnehin von selbst ergibt.", "There are people who meditate to learn serenity. They go on expensive courses, sit cross-legged on yoga mats and try to think of nothing. I consider that a waste. Anyone who wants to learn serenity needs only a railway ticket and a little time — though the latter takes care of itself anyway."],
      ["Meine letzte Reise von Hamburg nach Köln begann mit einer Durchsage, deren Poesie kaum zu übertreffen war: Wegen einer Verzögerung im Betriebsablauf verzögere sich die Abfahrt um wenige Minuten. Aus den wenigen Minuten wurden vierzig. Dann wurde der Zug in umgekehrter Wagenreihung bereitgestellt, was die Reisenden zu einem spontanen Wettlauf über den Bahnsteig inspirierte – eine Form von Frühsport, für die andere im Fitnessstudio bezahlen.", "My last journey from Hamburg to Cologne began with an announcement whose poetry could scarcely be surpassed: owing to a delay in operations, departure would be delayed by a few minutes. The few minutes became forty. Then the train was provided in reverse carriage order, which inspired the passengers to a spontaneous race along the platform — a form of morning exercise that others pay a gym for."],
      ["Zwischen Bremen und Osnabrück blieb der Zug auf freier Strecke stehen. Eine Begründung gab es zunächst nicht, was ich als Einladung verstand, eigene Theorien zu entwickeln. Eine Kuh auf den Gleisen? Ein philosophisch veranlagter Lokführer, der über den Sinn des Weiterfahrens nachdachte? Die Durchsage, die eine halbe Stunde später folgte, sprach nüchtern von einer „Störung an einem anderen Zug“ und beraubte mich damit meiner schönsten Hypothese.", "Between Bremen and Osnabrück the train came to a halt in open country. At first there was no explanation, which I took as an invitation to develop theories of my own. A cow on the tracks? A philosophically minded driver pondering the point of carrying on? The announcement that followed half an hour later spoke soberly of 'a fault on another train', thereby robbing me of my finest hypothesis."],
      ["In Münster erreichte die Reise ihren dramaturgischen Höhepunkt: Unser Zug, verkündete die Stimme aus dem Lautsprecher, ende hier. Die Reisenden nach Köln mögen bitte auf den folgenden Zug ausweichen, der allerdings ebenfalls verspätet sei. Auf dem Bahnsteig bildete sich eine Schicksalsgemeinschaft aus Pendlern, Studentinnen und einem Rentner mit Klappstuhl, der offensichtlich nicht zum ersten Mal hier stand. Er bot mir einen Keks an und erzählte, er fahre diese Strecke jede Woche, um seine Enkelin zu besuchen. Ich nahm den Keks dankend an.", "In Münster the journey reached its dramatic climax: our train, the voice from the loudspeaker announced, would terminate here. Passengers for Cologne were asked to transfer to the following train, which was, however, also running late. On the platform a community of fate took shape — commuters, students and a pensioner with a folding chair who had clearly stood here before. He offered me a biscuit and told me he took this route every week to visit his granddaughter. I accepted the biscuit gratefully."],
      ["Als ich schließlich mit zweieinhalb Stunden Verspätung in Köln ankam, war ich ein anderer Mensch. Ich hatte ein Buch gelesen, zwei Gespräche mit Fremden geführt und einen Sonnenuntergang über dem Münsterland gesehen, der in keinem Fahrplan stand. Die Bahn, so meine Erkenntnis, verkauft keine Transportleistungen. Sie verkauft Lebenszeit – nur eben nicht in der Menge, die man bestellt hat.", "When I finally reached Cologne two and a half hours late, I was a different person. I had read a book, had two conversations with strangers and seen a sunset over the Münsterland that was in no timetable. The railway, I realised, does not sell transport. It sells lifetime — just not in the quantity you ordered."],
    ],
    questions: [
      { q: "Warum hält der Autor Meditationsseminare für „Verschwendung“?", en: "Why does the author consider meditation courses a 'waste'?", answer: "Weil man Gelassenheit seiner Meinung nach auch einfach beim Bahnfahren lernen kann, wenn der Zug Verspätung hat.", key: [["Bahn", "Zug", "Fahrkarte", "Verspätung", "warten"]] },
      { q: "Wie stellt der Autor die umgekehrte Wagenreihung dar?", en: "How does the author present the reversed carriage order?", answer: "Er beschreibt sie ironisch als kostenlosen Frühsport, weil alle Reisenden über den Bahnsteig rennen müssen.", key: [["Sport", "Frühsport", "Fitness", "rennen", "Wettlauf", "laufen"], ["ironisch", "Ironie", "lustig", "humorvoll", "kostenlos", "positiv"]] },
      { q: "Warum fühlt sich der Autor durch die zweite Durchsage „beraubt“?", en: "Why does the author feel 'robbed' by the second announcement?", answer: "Weil die nüchterne Erklärung seine lustigen eigenen Theorien, zum Beispiel über die Kuh oder den philosophischen Lokführer, zerstört.", key: [["Theorie", "Hypothese", "Vermutung", "Fantasie", "Kuh", "Lokführer"], ["nüchtern", "langweilig", "normal", "banal", "Störung", "Erklärung"]] },
      { q: "Erklären Sie die Pointe am Ende: „Sie verkauft Lebenszeit – nur eben nicht in der Menge, die man bestellt hat.“", en: "Explain the punchline at the end: 'It sells lifetime — just not in the quantity you ordered.'", answer: "Durch die Verspätung schenkt einem die Bahn ungeplante Zeit für Erlebnisse, aber viel mehr Zeit, als man eigentlich wollte.", key: [["Verspätung", "länger", "mehr Zeit", "zu viel", "ungeplant"], ["Erlebnis", "Buch", "Gespräch", "Sonnenuntergang", "erlebt", "schenkt"]] },
    ],
    write: { q: "Schreiben Sie selbst eine kurze Glosse über ein alltägliches Ärgernis – mit Übertreibung und Ironie.", en: "Write your own short satirical column about an everyday annoyance — with exaggeration and irony.", min: 150 },
  },
];
