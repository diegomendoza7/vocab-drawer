/* Lessons — a few dense ones, not many thin ones.
 *
 * Everything else in the app is either a drill (it tests) or a reactive
 * explanation (it answers a mistake you have just made). Neither one *teaches*
 * in advance, and a learner who has never been shown a rule can only find it
 * by breaking it. A lesson is the missing third thing: one real text, taken
 * apart until every part of it has been explained, practised and used.
 *
 * Each lesson is built on one extract from a famous public-domain text and
 * works through it in eight stages — read it, understand it, see how its
 * sentences are built, learn the grammar it demonstrates, learn its words,
 * name those words from their definitions, translate in both directions, and
 * finally write something of your own in the same pattern.
 *
 * The texts, and why they can be here:
 *   - Déclaration des droits de l'homme et du citoyen (1789) — public domain.
 *   - Marcel Proust, Du côté de chez Swann (1913) — Proust died in 1922.
 *   - Grundgesetz für die Bundesrepublik Deutschland (1949) — an official
 *     legal text, which German law (§ 5 UrhG) excludes from copyright.
 *   - Franz Kafka, Die Verwandlung (1915) — Kafka died in 1924.
 * Every extract was checked word for word against a published source (URL on
 * each lesson) on 2026-09-23. French typography is normalised to the standard
 * spacing before : ; and inside « » — wording is untouched.
 *
 * scripts/check-lessons.mjs holds this file to its own internal promises: that
 * a sentence's chunks really do make up the sentence, that every rebuild order
 * it accepts uses exactly the chunks it offers, that every model answer passes
 * its own checks, and that every note it links to exists.
 */

const NB = "\u00a0";

export const LESSONS = {
  fr: [
    /* ================================================================== */
    /* FR 1 — Déclaration de 1789                                         */
    /* ================================================================== */
    {
      id: "fr-1",
      n: 1,
      level: "A2–B1",
      minutes: 40,
      title: "Libres et égaux",
      titleEn: "Free and equal",
      focusLine: "Agreement, and « ne … que »",
      source: {
        work: "Déclaration des droits de l'homme et du citoyen",
        author: "Assemblée nationale constituante",
        year: 1789,
        part: "Articles 1, 4 et 11",
        url: "https://www.legifrance.gouv.fr/contenu/menu/droit-national-en-vigueur/constitution/declaration-des-droits-de-l-homme-et-du-citoyen-de-1789",
        licence: "Public domain",
      },
      context: [
        "Adopted on 26 August 1789, six weeks after the storming of the Bastille, by an assembly that had just abolished feudal privilege and needed to say what would replace it. It is still law: the preamble of the 1958 Constitution incorporates it, and the Conseil constitutionnel strikes down statutes that contradict it.",
        "It was written to be read aloud and remembered — short declarative sentences, each clause balanced against the next. That precision is what makes it good grammar material. Nothing in it is accidental, including the endings of its adjectives.",
      ],
      goals: [
        "Read three articles of the text that founded modern French law.",
        "See why « libres et égaux » and « fondées » end the way they do — and predict it yourself.",
        "Learn « ne … que », which looks like a negation and means only.",
        "Name words from their French definitions, and translate in both directions.",
      ],
      extract: [
        { label: "Article 1", text: "Les hommes naissent et demeurent libres et égaux en droits. Les distinctions sociales ne peuvent être fondées que sur l'utilité commune." },
        { label: "Article 4", text: `La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui${NB}: ainsi, l'exercice des droits naturels de chaque homme n'a de bornes que celles qui assurent aux autres membres de la société la jouissance de ces mêmes droits. Ces bornes ne peuvent être déterminées que par la loi.` },
        { label: "Article 11", text: `La libre communication des pensées et des opinions est un des droits les plus précieux de l'homme${NB}: tout citoyen peut donc parler, écrire, imprimer librement, sauf à répondre de l'abus de cette liberté dans les cas déterminés par la loi.` },
      ],
      glossary: {
        hommes: "human beings, people (l'homme — here mankind, not only men)",
        naissent: "are born (naître)",
        demeurent: "remain (demeurer — the formal rester)",
        libres: "free (libre, plural)",
        égaux: "equal (égal → égaux, masculine plural)",
        droits: "rights (le droit)",
        distinctions: "distinctions, differences of rank",
        sociales: "social (social → sociale → sociales)",
        peuvent: "can (pouvoir)",
        fondées: "founded, based (fonder → fondé → fondées)",
        utilité: "usefulness, benefit (l'utilité, f.)",
        commune: "common, shared (commun → commune)",
        liberté: "liberty, freedom",
        consiste: "consists (consister à + infinitive)",
        pouvoir: "to be able to",
        nuit: "harms (nuire à)",
        autrui: "other people, others (formal, never changes)",
        ainsi: "thus, so",
        exercice: "exercise, use",
        naturels: "natural (m. pl.)",
        chaque: "each",
        bornes: "limits (la borne — literally a boundary stone)",
        celles: "those (f. pl. — stands for « bornes »)",
        assurent: "guarantee, secure (assurer)",
        membres: "members",
        société: "society",
        jouissance: "enjoyment, the use of (a right)",
        mêmes: "same",
        déterminées: "determined, set (f. pl.)",
        loi: "law",
        libre: "free — before the noun: unrestricted",
        communication: "communication, expression",
        pensées: "thoughts (la pensée)",
        précieux: "precious",
        citoyen: "citizen",
        donc: "therefore",
        imprimer: "to print",
        librement: "freely",
        sauf: "except, save — « sauf à » = subject to",
        répondre: "to answer — « répondre de » = to be accountable for",
        abus: "abuse, misuse",
        cas: "cases (invariable)",
        déterminés: "set out, specified (m. pl.)",
      },
      understand: [
        {
          q: "According to Article 1, what may social distinctions be based on?",
          options: ["Birth and family", "Only on the common good", "Wealth earned by work", "Nothing at all — they are forbidden"],
          answer: 1,
          why: "« ne peuvent être fondées **que** sur l'utilité commune » — ne … que means **only**. The article does not ban distinctions; it restricts what can justify them. The last option is the classic misreading of ne … que as a plain negation.",
        },
        {
          q: "How does Article 4 define liberty?",
          options: ["Doing whatever you want", "Being able to do anything that does not harm others", "Obeying the law", "Voting in elections"],
          answer: 1,
          why: "« pouvoir faire tout ce qui **ne nuit pas** à autrui ». Here ne … pas is a real negation — unlike the two ne … que on either side of it. The limit on liberty is harm to others.",
        },
        {
          q: "Who, according to Article 4, sets those limits?",
          options: ["The king", "Each citizen, for themselves", "The law", "The Church"],
          answer: 2,
          why: "« Ces bornes ne peuvent être déterminées **que par la loi** » — only by the law. In 1789 that was a pointed answer: not the king.",
        },
        {
          q: "Article 11 lets every citizen speak, write and print freely. What is the condition?",
          options: [
            "Only with the government's permission",
            "They answer for abuses of that freedom, in the cases the law defines",
            "Only on political subjects",
            "There is no condition",
          ],
          answer: 1,
          why: "« sauf à **répondre de** l'abus de cette liberté dans les cas déterminés par la loi » — freedom first, accountability afterwards, and only where the law says. There is no permission beforehand: that is the whole point of the article.",
        },
      ],
      structure: {
        intro: "Legal French is long, but it is made of the same few parts as any other French. Find the conjugated verb first — everything else hangs from it.",
        sentences: [
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Les hommes", role: "subject" },
              { t: "naissent et demeurent", role: "verb", detail: "two verbs, one subject" },
              { t: "libres et égaux", role: "complement", detail: "describes the subject" },
              { t: "en droits.", role: "adverbial", detail: "in what respect" },
            ],
            note: "Two verbs share one subject, and the adjectives after them describe the **subject**, not the verbs — so they agree with « les hommes »: masculine plural, libre**s** et é**gaux**.",
          },
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Les distinctions sociales", role: "subject" },
              { t: "ne peuvent être fondées", role: "verb", detail: "modal + passive" },
              { t: "que sur l'utilité commune.", role: "adverbial", detail: "the only basis allowed" },
            ],
            note: "« ne » sits before the conjugated verb; « **que** » moves to just before whatever is being restricted. To find what « only » applies to, look at what follows « que ».",
          },
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Ces bornes", role: "subject" },
              { t: "ne peuvent être déterminées", role: "verb", detail: "modal + passive" },
              { t: "que par la loi.", role: "agent", detail: "the only one who may" },
            ],
            note: "The same shape as the second sentence of Article 1 — the drafters repeated it on purpose. In a passive, **par** introduces who does the action.",
          },
        ],
        rebuild: [
          {
            en: "Rights can only be exercised within limits.",
            chunks: ["Les droits", "ne peuvent", "être exercés", "que", "dans certaines limites"],
            accept: ["les droits ne peuvent être exercés que dans certaines limites"],
            why: "« ne » before the conjugated verb, « que » immediately before what is restricted. And « exercés » agrees with « les droits »: masculine plural.",
          },
          {
            en: "Liberty can only be limited by the law.",
            chunks: ["La liberté", "ne peut", "être limitée", "que", "par la loi"],
            accept: ["la liberté ne peut être limitée que par la loi"],
            why: "Move « que » and you move the meaning: « que par la loi » — only by the law. « limitée » agrees with « la liberté ».",
          },
          {
            en: "Freedom of thought is one of the most precious rights.",
            chunks: ["La liberté de pensée", "est", "un des droits", "les plus précieux"],
            accept: ["la liberté de pensée est un des droits les plus précieux"],
            why: "The superlative follows the noun it describes and repeats the article: des droits **les plus précieux**.",
          },
        ],
      },
      grammar: {
        title: "Agreement, and « ne … que »",
        note: "Adjective agreement and placement",
        points: [
          {
            heading: "Adjectives agree with what they describe",
            body: [
              "A French adjective takes the gender and number of its noun: add **-e** for feminine, **-s** for plural, **-es** for both. « les distinctions **sociales** » — distinction is feminine plural. « l'utilité **commune** » — feminine singular.",
              "Adjectives ending in **-al** make their masculine plural in **-aux**: égal → é**gaux**, social → soci**aux**, national → nation**aux**. That is why Article 1 says « libres et **égaux** »: « les hommes » is masculine plural. The feminine plural stays regular — égales, sociales.",
              "An adjective already ending in **-e** adds nothing for the feminine (libre, libre); one ending in **-x** adds nothing for the plural (précieux, précieux) and becomes **-se** in the feminine (précieuse).",
            ],
            examples: [
              { t: "les hommes naissent libres et **égaux**", e: "m. pl. — égal → égaux" },
              { t: "les distinctions **sociales**", e: "f. pl. — social → sociales" },
              { t: "des droits **naturels**", e: "m. pl. — naturel → naturels" },
            ],
          },
          {
            heading: "In the passive, the participle agrees too",
            body: [
              "**être** + past participle makes a passive: « être fondé » — to be founded. After être, the participle behaves exactly like an adjective and agrees with the subject.",
              "« Les distinctions ne peuvent être fond**ées** » — feminine plural. « Ces bornes ne peuvent être déterminé**es** » — feminine plural. « les cas déterminé**s** par la loi » — masculine plural; there is no être here, but a participle used as an adjective still agrees.",
              "You cannot hear most of these endings — fondé, fondée, fondés and fondées all sound the same. That is exactly why they are worth drilling: your ear will never catch them, so your eye has to.",
            ],
            examples: [
              { t: "Les distinctions ne peuvent être **fondées**…", e: "f. pl." },
              { t: "Ces bornes ne peuvent être **déterminées**…", e: "f. pl." },
              { t: "dans les cas **déterminés** par la loi", e: "m. pl. — adjective use, still agrees" },
            ],
          },
          {
            heading: "« ne … que » means only",
            body: [
              "« ne … que » looks like a negation and is not one. It **restricts**: « Je n'ai que dix euros » — I only have ten euros. Nothing is denied; something is limited.",
              "**ne** goes before the conjugated verb, like any negation. **que** goes directly in front of whatever is restricted, and it moves with the meaning: « ne peuvent être déterminées **que par la loi** » — only by the law.",
              "The test: swap « ne … que » for « seulement » and see if the sentence still means the same. « Ces bornes peuvent être déterminées **seulement** par la loi. » Same meaning — plainer, less elegant.",
              "Look at « n'a **de** bornes que celles qui… » in Article 4 — has no limits except those which… After ne … que, as after a negation, **de** replaces des before the noun.",
            ],
            examples: [
              { t: "…ne peuvent être fondées **que** sur l'utilité commune.", e: "…can only be based on the common good." },
              { t: "L'exercice des droits n'a de bornes **que** celles qui…", e: "…has no limits except those which…" },
              { t: "Je ne bois **que** de l'eau.", e: "I only drink water." },
            ],
          },
        ],
        drill: [
          { prompt: "Les femmes naissent libres et ___ en droits.", hint: "égal", accept: ["égales"], why: "« femmes » is feminine plural → égal**es**. The -aux plural is only for the masculine: les hommes sont égaux, les femmes sont égales." },
          { prompt: "Les lois ne peuvent être ___ que par le Parlement.", hint: "voter — past participle", accept: ["votées"], why: "A passive with être: the participle agrees with « les lois », feminine plural → vot**ées**." },
          { prompt: "les droits ___ de chaque homme", hint: "naturel", accept: ["naturels"], why: "« droit » is masculine; plural → naturel**s**. Adjectives in -el are regular: naturel, naturelle, naturels, naturelles." },
          { prompt: "Ces principes sont ___ à toute la société.", hint: "commun", accept: ["communs"], why: "« principes » is masculine plural → commun**s**." },
          { prompt: "les opinions les plus ___", hint: "précieux", accept: ["précieuses"], why: "« opinion » is feminine. A masculine in -x becomes -se in the feminine: précieux → précieu**ses**, heureux → heureuses." },
          { prompt: "Je lis seulement le journal. → Je ___ le journal.", hint: "use ne … que", accept: ["ne lis que"], why: "« ne » before the verb, « que » directly before what is restricted — the newspaper." },
          { prompt: "Elle parle seulement français. → Elle ___ français.", hint: "use ne … que", accept: ["ne parle que"], why: "Same shape: ne + verb + que + the one thing allowed." },
          { prompt: "La liberté ___ être limitée que par la loi.", hint: "pouvoir, + ne", accept: ["ne peut"], why: "« ne » before the conjugated verb (peut, for la liberté); « que » is already in place before « par la loi »." },
          { prompt: "Les pays ___ par la Déclaration sont nombreux.", hint: "inspirer — past participle", accept: ["inspirés"], why: "No être, but the participle describes « les pays », so it agrees: masculine plural → inspir**és**." },
        ],
      },
      words: [
        { t: "naître", e: "to be born", def: "Venir au monde.", from: "Les hommes naissent…", family: "la naissance (birth), né·e (born), la renaissance" },
        { t: "demeurer", e: "to remain", def: "Continuer d'être dans le même état ; ne pas changer.", from: "…et demeurent libres", family: "la demeure (dwelling) — in older French also « to live somewhere »" },
        { t: "égal", e: "equal", def: "Qui a la même valeur, les mêmes droits qu'un autre.", from: "libres et égaux", family: "l'égalité, également (equally; also), inégal" },
        { t: "droit", art: "le", e: "right; law (the subject)", def: "Ce que la loi permet à une personne de faire ou d'exiger.", from: "égaux en droits", family: "les droits de l'homme; étudier le droit; droit (adj.) = straight" },
        { t: "fonder", e: "to found, to base", def: "Établir sur une base ; donner un fondement à.", from: "ne peuvent être fondées", family: "le fondement, la fondation, le fondateur" },
        { t: "nuire", e: "to harm (+ à)", def: "Faire du tort, causer un dommage à quelqu'un.", from: "tout ce qui ne nuit pas à autrui", family: "nuisible (harmful), la nuisance" },
        { t: "autrui", e: "others, other people", def: "Toute personne autre que soi-même ; le prochain.", from: "à autrui", note: "Formal and invariable — proverbs and law, rarely conversation." },
        { t: "borne", art: "la", e: "limit, boundary", def: "Pierre plantée pour marquer la séparation de deux terrains ; au figuré, ce qu'on ne peut dépasser.", from: "n'a de bornes que…", family: "borné (narrow-minded), sans bornes (boundless)" },
        { t: "jouissance", art: "la", e: "enjoyment, use (of a right)", def: "Le fait de profiter de quelque chose, d'en avoir l'usage.", from: "la jouissance de ces mêmes droits", family: "jouir de (to enjoy), la joie" },
        { t: "loi", art: "la", e: "law", def: "Règle obligatoire établie par l'autorité.", from: "déterminées que par la loi", family: "légal, la législation, le législateur" },
        { t: "citoyen", art: "le", e: "citizen", def: "Personne qui appartient à un État et y exerce des droits politiques.", from: "tout citoyen peut donc parler", family: "la citoyenne, la citoyenneté, civique" },
        { t: "précieux", e: "precious", def: "Qui a une grande valeur.", from: "les plus précieux de l'homme", family: "précieuse (f.), la préciosité" },
        { t: "répondre de", e: "to answer for, be accountable for", def: "Être responsable de quelque chose ; en accepter les conséquences.", from: "sauf à répondre de l'abus", note: "Not « répondre à » (to reply to): the preposition changes the verb." },
        { t: "abus", art: "l'", e: "abuse, misuse (m.)", def: "Mauvais usage ; usage excessif de quelque chose.", from: "l'abus de cette liberté", family: "abuser de, abusif" },
      ],
      nameIt: [
        { def: "Venir au monde.", accept: ["naître"] },
        { def: "Continuer d'être dans le même état ; ne pas changer.", accept: ["demeurer"], also: { rester: "Right — the text uses the more formal « demeurer »." } },
        { def: "Faire du tort, causer un dommage à quelqu'un.", accept: ["nuire"] },
        { def: "Toute personne autre que soi-même ; le prochain.", accept: ["autrui"], also: { "les autres": "Right meaning — the text's single word is « autrui »." } },
        { def: "Pierre plantée pour marquer la séparation de deux terrains ; au figuré, ce qu'on ne peut dépasser.", accept: ["borne"], also: { limite: "Right meaning — the text says « borne », a boundary stone." } },
        { def: "Règle obligatoire établie par l'autorité.", accept: ["loi"] },
        { def: "Personne qui appartient à un État et y exerce des droits politiques.", accept: ["citoyen", "citoyenne"] },
        { def: "Le fait de profiter de quelque chose, d'en avoir l'usage.", accept: ["jouissance"] },
        { def: "Mauvais usage ; usage excessif de quelque chose.", accept: ["abus"] },
        { def: "Qui a la même valeur, les mêmes droits qu'un autre.", accept: ["égal", "égale", "égaux", "égales"] },
      ],
      translate: {
        fromText: [
          {
            t: "Les distinctions sociales ne peuvent être fondées que sur l'utilité commune.",
            model: "Social distinctions can only be based on the common good.",
            key: [
              ["only", "solely", "exclusively", "nothing but", "except", "no other"],
              ["social"],
              ["distinction", "difference", "rank", "inequalit"],
              ["common good", "common utility", "general good", "public good", "common benefit", "general interest", "public interest", "common interest", "utility", "usefulness", "good of all", "benefit of all"],
              ["based", "founded", "grounded", "justified", "rest"],
            ],
            note: "The trap is « ne … que »: it means only, never not. « utilité commune » is usually « the common good » or « common utility » — « usefulness » is literal but stiff.",
          },
          {
            t: "La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui.",
            model: "Liberty consists in being able to do anything that does not harm others.",
            key: [
              ["liberty", "freedom"],
              ["able", "can", "ability", "power", "free to"],
              ["anything", "everything", "whatever", "all that"],
              ["not harm", "no harm", "doesn't harm", "don't harm", "not hurt", "doesn't hurt", "don't hurt", "not injure", "harmless", "not damage", "without harming", "without hurting"],
              ["other", "anyone else", "someone else", "another"],
            ],
            note: "« tout ce qui » = everything that / anything that. « autrui » is others in general — not « someone else's ».",
          },
          {
            t: "tout citoyen peut donc parler, écrire, imprimer librement",
            model: "every citizen may therefore speak, write and print freely",
            key: [
              ["every", "each", "any", "all"],
              ["citizen"],
              ["speak", "talk"],
              ["write"],
              ["print", "publish"],
              ["freely", "free", "freedom", "liberty"],
            ],
            note: "« tout citoyen » — singular, no article — means every citizen. « donc » = therefore / so.",
          },
        ],
        intoTarget: [
          {
            en: "Women are born free and equal.",
            accept: ["les femmes naissent libres et égales", "les femmes naissent égales et libres"],
            must: [
              { any: ["égales"], hint: "égal agrees with « les femmes »: feminine plural → égales" },
              { any: ["naissent"], hint: "naître in the ils/elles form: naissent" },
            ],
            model: "Les femmes naissent libres et égales.",
          },
          {
            en: "The law can only be changed by the people.",
            accept: ["la loi ne peut être changée que par le peuple", "la loi ne peut être modifiée que par le peuple"],
            must: [
              { any: ["ne peut"], hint: "« ne » goes right before the conjugated verb: ne peut" },
              { any: ["que par"], hint: "« que » goes right before what is restricted: que par le peuple" },
              { any: ["changée", "modifiée"], hint: "the participle agrees with « la loi »: changée / modifiée" },
            ],
            model: "La loi ne peut être changée que par le peuple.",
          },
          {
            en: "Freedom of expression is one of the most precious rights.",
            accept: ["la liberté d'expression est un des droits les plus précieux", "la liberté d'expression est l'un des droits les plus précieux"],
            must: [
              { any: ["les plus précieux"], hint: "the superlative follows the noun: des droits les plus précieux" },
              { any: ["un des", "l'un des"], hint: "one of = un des (or l'un des)" },
            ],
            model: "La liberté d'expression est l'un des droits les plus précieux.",
          },
          {
            en: "These limits are set by the law.",
            accept: [
              "ces limites sont fixées par la loi", "ces bornes sont fixées par la loi",
              "ces limites sont déterminées par la loi", "ces bornes sont déterminées par la loi",
              "ces limites sont établies par la loi", "ces bornes sont établies par la loi",
            ],
            must: [
              { any: ["fixées", "déterminées", "établies", "posées"], hint: "limite and borne are both feminine plural — the participle takes -es" },
            ],
            model: "Ces limites sont fixées par la loi.",
          },
        ],
      },
      yourTurn: {
        prompt: "Écrivez deux ou trois phrases sur un droit qui vous semble important. Utilisez au moins une fois « ne … que », et accordez vos adjectifs.",
        en: "Write two or three sentences about a right that matters to you. Use « ne … que » at least once, and make your adjectives agree.",
        min: 25,
        tips: [
          "Start: « Pour moi, le droit le plus important est… »",
          "« On ne peut limiter ce droit que dans des cas précis. »",
        ],
        uses: [
          { re: "\\bn(?:e\\s|['’])[^.!?]*?\\bqu(?:e\\b|['’])", msg: "No « ne … que » yet — the task asks for one." },
        ],
        model: "Pour moi, le droit le plus précieux est la liberté d'expression. Les opinions différentes sont nécessaires à une société libre. On ne peut limiter ce droit que dans des cas précis, déterminés par la loi.",
      },
    },

    /* ================================================================== */
    /* FR 2 — Proust, Du côté de chez Swann                               */
    /* ================================================================== */
    {
      id: "fr-2",
      n: 2,
      level: "B1",
      minutes: 45,
      title: "Longtemps",
      titleEn: "For a long time",
      focusLine: "Three pasts, and verbs that take être",
      source: {
        work: "Du côté de chez Swann",
        author: "Marcel Proust",
        year: 1913,
        part: "the opening paragraph",
        url: "https://www.gutenberg.org/ebooks/2650",
        licence: "Public domain (Proust died in 1922)",
      },
      context: [
        "The first sentence of À la recherche du temps perdu is probably the most famous first line in French literature. The first volume appeared in 1913 at Proust's own expense, after several publishers — André Gide among the readers — had turned it down.",
        "The paragraph is about the blurred edge between waking and sleep, and its grammar does the same work. It slides between a closed-off past, a repeated past, and a past before the past — which makes it the best short demonstration in the language of what each French past tense is for.",
      ],
      goals: [
        "Read the paragraph that opens À la recherche du temps perdu.",
        "Tell apart the three pasts Proust weaves together, and say why each one is where it is.",
        "See why « je me suis couché » takes être, and learn « venir de », « si … que » and « dont ».",
        "Translate a first line that its two most famous English translators rendered differently.",
      ],
      extract: [
        { label: "", text: `Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n'avais pas le temps de me dire${NB}: «${NB}Je m'endors.${NB}» Et, une demi-heure après, la pensée qu'il était temps de chercher le sommeil m'éveillait${NB}; je voulais poser le volume que je croyais avoir encore dans les mains et souffler ma lumière${NB}; je n'avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier${NB}; il me semblait que j'étais moi-même ce dont parlait l'ouvrage${NB}: une église, un quatuor, la rivalité de François Ier et de Charles Quint.` },
      ],
      glossary: {
        longtemps: "for a long time",
        couché: "gone to bed (se coucher)",
        bonne: "« de bonne heure » = early",
        heure: "« de bonne heure » = early",
        parfois: "sometimes",
        peine: "« à peine » = barely, scarcely — as soon as",
        bougie: "candle",
        éteinte: "put out (éteindre → éteint → éteinte)",
        fermaient: "closed (se fermer, imparfait — again and again)",
        vite: "quickly — « si vite que » = so quickly that",
        endors: "am falling asleep (s'endormir)",
        "demi-heure": "half an hour",
        pensée: "thought",
        chercher: "to look for — « chercher le sommeil » = to try to get to sleep",
        sommeil: "sleep",
        éveillait: "would wake (éveiller, imparfait)",
        poser: "to put down",
        volume: "volume, book",
        croyais: "believed (croire, imparfait)",
        souffler: "to blow out",
        lumière: "light",
        cessé: "stopped (cesser de + infinitive)",
        dormant: "« en dormant » = while sleeping",
        réflexions: "reflections, thoughts",
        venais: "« je venais de lire » = I had just read",
        pris: "taken (prendre) — « avaient pris » = had taken",
        tour: "turn, twist",
        particulier: "peculiar, particular",
        semblait: "« il me semblait » = it seemed to me",
        "moi-même": "myself",
        dont: "of which / about which — « ce dont parlait… » = what … was about",
        ouvrage: "the work, the book",
        église: "church",
        quatuor: "(string) quartet",
        rivalité: "rivalry",
        ier: "« François Ier » = Francis I, king of France",
        quint: "« Charles Quint » = Charles V, Holy Roman Emperor",
      },
      understand: [
        {
          q: "What does the first sentence tell us?",
          options: [
            "The narrator went to bed early one night",
            "For a long stretch of his life, the narrator went to bed early",
            "The narrator took a long time to fall asleep",
            "The narrator is going to bed now",
          ],
          answer: 1,
          why: "« **Longtemps** » — for a long time: a whole period of life, summed up and closed. The third option is the tempting misreading: longtemps is about duration, not about being slow to fall asleep.",
        },
        {
          q: "Why did he not have time to think « I'm falling asleep »?",
          options: ["He was reading", "His eyes closed too quickly", "Someone interrupted him", "The candle was still lit"],
          answer: 1,
          why: "« mes yeux se fermaient **si vite que** je n'avais pas le temps… » — si … que = so … that. The speed of falling asleep is the cause.",
        },
        {
          q: "What woke him half an hour later?",
          options: ["A noise in the street", "His candle going out", "The thought that it was time to try to sleep", "A dream about a church"],
          answer: 2,
          why: "« la pensée qu'il était temps de chercher le sommeil m'éveillait » — the irony Proust wants you to catch: the idea of going to sleep is what wakes him.",
        },
        {
          q: "What peculiar turn had his thoughts taken?",
          options: [
            "He felt that he himself was what the book had been about",
            "He had forgotten how to read",
            "He believed he was in a church",
            "He thought he was François Ier",
          ],
          answer: 0,
          why: "« il me semblait que j'étais moi-même **ce dont parlait l'ouvrage** » — he felt he was whatever the book described: a church, a quartet, a royal rivalry. The last two options each seize one item from that list.",
        },
      ],
      structure: {
        intro: "Proust's sentences are long, but they are made of short clauses joined by semicolons, and each clause has one conjugated verb. Find the verbs, notice their tenses, and the paragraph falls into place.",
        sentences: [
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Longtemps,", role: "adverbial", detail: "fronted for weight" },
              { t: "je", role: "subject" },
              { t: "me suis couché", role: "verb", detail: "passé composé, pronominal" },
              { t: "de bonne heure.", role: "adverbial", detail: "when" },
            ],
            note: "Putting « Longtemps » first, set off by a comma, makes the whole sentence hang on it. Everyday French would say « Je me suis couché tôt pendant longtemps » — flat, and nobody would remember it.",
          },
          {
            find: "the conjugated verb of the main clause",
            chunks: [
              { t: "Parfois,", role: "adverbial", detail: "how often" },
              { t: "à peine ma bougie éteinte,", role: "adverbial", detail: "when — a clause with no verb" },
              { t: "mes yeux", role: "subject" },
              { t: "se fermaient", role: "verb", detail: "imparfait — it kept happening" },
              { t: "si vite", role: "adverbial", detail: "how" },
              { t: `que je n'avais pas le temps de me dire${NB}: «${NB}Je m'endors.${NB}»`, role: "clause", detail: "the consequence (si … que)" },
            ],
            note: "« à peine ma bougie éteinte » has no conjugated verb at all — a participle does the work: as soon as my candle was out. Literary French allows it; speech would say « dès que j'avais éteint ma bougie ».",
          },
          {
            find: "the conjugated verb",
            chunks: [
              { t: "je", role: "subject" },
              { t: "n'avais pas cessé", role: "verb", detail: "plus-que-parfait, negated" },
              { t: "en dormant", role: "adverbial", detail: "while — gérondif" },
              { t: "de faire des réflexions", role: "object", detail: "what he had not stopped doing" },
              { t: "sur ce que je venais de lire", role: "clause", detail: "about what — venir de = had just" },
            ],
            note: "« en dormant » is dropped in between « cessé » and its « de faire ». That interruption is typical Proust, and it is why reading him is good training: you have to hold « cesser de » open until its infinitive arrives.",
          },
        ],
        rebuild: [
          {
            en: "She did not go to bed early.",
            chunks: ["Elle", "ne", "s'est", "pas", "couchée", "de bonne heure"],
            accept: ["elle ne s'est pas couchée de bonne heure"],
            why: "In a negated compound tense, ne … pas wraps the pronoun and the auxiliary together — ne s'est pas — never around the participle. And « couchée » agrees with « elle ».",
          },
          {
            en: "I had just read the book when my eyes closed.",
            chunks: ["Je", "venais", "de lire", "le livre", "quand", "mes yeux", "se sont fermés"],
            accept: [
              "je venais de lire le livre quand mes yeux se sont fermés",
              "quand mes yeux se sont fermés je venais de lire le livre",
            ],
            why: "The background in the imparfait (venais de), the event that breaks in in the passé composé (se sont fermés) — with être, because se fermer is pronominal, and agreeing with « mes yeux ».",
          },
          {
            en: "It seemed to me that I was the book.",
            chunks: ["Il", "me", "semblait", "que", "j'étais", "le livre"],
            accept: ["il me semblait que j'étais le livre"],
            why: "« il me semble » — an impersonal « il », with « me » (to me) before the verb. Imparfait, because it is a state, not an event.",
          },
        ],
      },
      grammar: {
        title: "Three pasts, and verbs that take être",
        note: "Passé composé vs. Imparfait",
        tenses: ["passe", "imparfait"],
        points: [
          {
            heading: "Passé composé: the closed block",
            body: [
              "The passé composé presents something as **done** — a completed event, or a whole period seen from the outside as finished. « Longtemps, je me suis couché de bonne heure » covers years of evenings, and it is still passé composé: Proust is summing that stretch up and closing it.",
              "This is the point most learners miss. The passé composé is not about how *short* something was; it is about whether you present it as **finished**. « J'ai habité à Lyon pendant dix ans » — ten years, one closed block.",
            ],
            examples: [
              { t: "Longtemps, je **me suis couché** de bonne heure.", e: "a long period, closed" },
              { t: "J'**ai habité** à Lyon pendant dix ans.", e: "ten years, one block" },
            ],
          },
          {
            heading: "Imparfait: the scene, the habit, the state",
            body: [
              "The imparfait shows an action **in progress** or **repeated**, without its edges: « mes yeux se fermaient », « la pensée… m'éveillait », « je voulais poser le volume ». Every one of those happened again and again — « Parfois » at the start of the sentence tells you so.",
              "It is also the tense of states: « il **était** temps », « je **croyais** », « il me **semblait** que j'**étais**… ». Believing, seeming, being — no beginning or end in view.",
              "The test from the grammar note: if English could say **used to** or **was …-ing** or **would** (of a habit), French wants the imparfait.",
            ],
            examples: [
              { t: "mes yeux **se fermaient** si vite…", e: "would close — again and again" },
              { t: "il me **semblait** que j'**étais** moi-même…", e: "states: no edges" },
            ],
          },
          {
            heading: "Plus-que-parfait: the past before the past",
            body: [
              "« je n'**avais** pas **cessé** », « ces réflexions **avaient pris** un tour particulier ». Avoir or être **in the imparfait** + past participle = had done. It steps one layer further back: before he woke, he had not stopped thinking.",
              "« je **venais de** lire » is its quick cousin: venir de + infinitive, in the imparfait, means **had just** done. Proust uses the two side by side — one for what had happened, one for what had only just happened.",
            ],
            examples: [
              { t: "ces réflexions **avaient pris** un tour un peu particulier", e: "had taken" },
              { t: "ce que je **venais de** lire", e: "what I had just read" },
            ],
          },
          {
            heading: "Pronominal verbs always take être",
            body: [
              "Every verb used with a reflexive pronoun — se coucher, s'endormir, se fermer, se dire — builds its compound tenses with **être**, not avoir: « je **me suis** couché ». There are no exceptions.",
              "With être, the participle agrees with the subject. A woman writing this sentence would write « je me suis couch**ée** »; Proust's narrator is a man, so: couché.",
              "The pronoun travels with the auxiliary. In a negation, ne … pas wraps both of them: « je **ne me suis pas** couché ».",
            ],
            examples: [
              { t: "je **me suis couché**", e: "être, not avoir" },
              { t: "elle ne **s'est** pas **couchée**", e: "ne … pas around pronoun + auxiliary; agreement" },
            ],
          },
          {
            heading: "Two small words doing heavy work",
            body: [
              "**si … que** — so … that: « mes yeux se fermaient **si** vite **que** je n'avais pas le temps… ». The first half names the degree, the second its consequence.",
              "**dont** replaces **de** + a thing or person: « parler **de** l'ouvrage » → « ce **dont** parlait l'ouvrage » — what the book was talking about. « que » would be wrong: you do not « parler quelque chose ». Notice too that the subject comes after its verb here (parlait l'ouvrage) — written French allows that inside a relative clause when the subject is a noun.",
            ],
            examples: [
              { t: "si vite **que** je n'avais pas le temps", e: "so quickly that…" },
              { t: "ce **dont** parlait l'ouvrage", e: "what the book was about" },
            ],
          },
        ],
        drill: [
          { prompt: "Hier soir, je ___ à dix heures.", hint: "se coucher — passé composé; the speaker is a woman", accept: ["me suis couchée"], why: "Pronominal → être; the subject is a woman → couch**ée**." },
          { prompt: "Quand j'étais enfant, je ___ toujours de bonne heure.", hint: "se coucher", accept: ["me couchais"], why: "« Quand j'étais enfant » and « toujours » make it a habit → imparfait." },
          { prompt: "Mes yeux ___ quand le téléphone a sonné.", hint: "se fermer", accept: ["se fermaient"], why: "A scene interrupted by an event: the closing eyes are the background (imparfait), the phone ringing is the event (passé composé)." },
          { prompt: "Quand je suis arrivé, il ___ depuis une heure.", hint: "s'endormir — plus-que-parfait", accept: ["s'était endormi"], why: "He fell asleep before I arrived: the past before the past → être in the imparfait (était) + participle, the pronoun in front: **s'était endormi**." },
          { prompt: "Je ___ lire ce livre quand tu as appelé.", hint: "venir de", accept: ["venais de"], why: "« had just » = venir de in the imparfait: je venais de." },
          { prompt: "Elle parlait ___ vite que personne ne comprenait.", hint: "so … that", accept: ["si", "tellement"], why: "si … que = so … that. « tellement » works too; « si » is Proust's." },
          { prompt: "Voici le livre ___ je t'ai parlé.", hint: "a relative pronoun", accept: ["dont"], why: "parler **de** quelque chose → the relative pronoun is **dont**." },
          { prompt: "Pendant dix ans, elle ___ à Paris.", hint: "habiter", accept: ["a habité"], why: "A long period presented as closed → passé composé. Length does not decide the tense; the point of view does." },
          { prompt: "Je me suis couché tôt. → Je ___ couché tôt.", hint: "negate it", accept: ["ne me suis pas"], why: "ne … pas wraps the pronoun and the auxiliary together: je **ne me suis pas** couché." },
        ],
      },
      words: [
        { t: "longtemps", e: "for a long time", def: "Pendant une longue durée.", from: "Longtemps, je me suis couché…", note: "One word — and not « lentement » (slowly)." },
        { t: "de bonne heure", e: "early", def: "Avant le moment habituel.", from: "…de bonne heure." },
        { t: "parfois", e: "sometimes", def: "De temps en temps ; pas toujours.", from: "Parfois, à peine…" },
        { t: "à peine", e: "barely, scarcely; as soon as", def: "Presque pas ; ou : depuis très peu de temps.", from: "à peine ma bougie éteinte" },
        { t: "bougie", art: "la", e: "candle", def: "Cylindre de cire qu'on allume pour s'éclairer.", from: "ma bougie éteinte", family: "le bougeoir (candlestick)" },
        { t: "éteindre", e: "to put out (a light, a fire)", def: "Faire cesser de brûler ou d'éclairer.", from: "ma bougie éteinte", family: "éteint·e (out), l'extinction" },
        { t: "s'endormir", e: "to fall asleep", def: "Commencer à dormir.", from: "« Je m'endors. »", family: "dormir, endormi·e, le sommeil" },
        { t: "sommeil", art: "le", e: "sleep", def: "État de repos pendant lequel on dort.", from: "chercher le sommeil", note: "« avoir sommeil » = to be sleepy." },
        { t: "éveiller", e: "to wake (literary)", def: "Tirer quelqu'un du sommeil.", from: "m'éveillait", family: "réveiller (the everyday word), l'éveil" },
        { t: "cesser de", e: "to stop (doing)", def: "Ne plus continuer à faire quelque chose.", from: "je n'avais pas cessé… de faire" },
        { t: "ouvrage", art: "l'", e: "work, book (m.)", def: "Production écrite d'un auteur, publiée en volume.", from: "ce dont parlait l'ouvrage", note: "Masculine, like almost every noun in -age — la page and la plage are the exceptions." },
        { t: "il me semble", e: "it seems to me", def: "J'ai l'impression que ; je crois que.", from: "il me semblait que j'étais…" },
      ],
      nameIt: [
        { def: "Pendant une longue durée.", accept: ["longtemps"] },
        { def: "Cylindre de cire qu'on allume pour s'éclairer.", accept: ["bougie"] },
        { def: "Faire cesser de brûler ou d'éclairer.", accept: ["éteindre"] },
        { def: "Commencer à dormir.", accept: ["s'endormir"], also: { endormir: "Right verb — here it is pronominal: s'endormir." } },
        { def: "État de repos pendant lequel on dort.", accept: ["sommeil"] },
        { def: "Ne plus continuer à faire quelque chose.", accept: ["cesser"], also: { "arrêter": "Right — Proust's word is « cesser »." } },
        { def: "De temps en temps ; pas toujours.", accept: ["parfois", "quelquefois"] },
        { def: "Production écrite d'un auteur, publiée en volume.", accept: ["ouvrage"], also: { livre: "Right meaning — the text says « l'ouvrage »." } },
        { def: "Avant le moment habituel.", accept: ["de bonne heure"], also: { "tôt": "Right — Proust's phrase is « de bonne heure »." } },
        { def: "Tirer quelqu'un du sommeil.", accept: ["éveiller", "réveiller"] },
      ],
      translate: {
        fromText: [
          {
            t: "Longtemps, je me suis couché de bonne heure.",
            model: "For a long time, I went to bed early.",
            key: [
              ["long time", "long while", "for years", "for ages", "long"],
              ["bed", "turned in", "retired", "sleep"],
              ["early"],
            ],
            note: "C. K. Scott Moncrieff's 1922 translation reads « For a long time I used to go to bed early » — but « used to » is the imparfait's job, and Proust chose the passé composé. Lydia Davis's 2002 version keeps the closed block: « For a long time, I went to bed early. »",
          },
          {
            t: "mes yeux se fermaient si vite que je n'avais pas le temps de me dire : « Je m'endors. »",
            model: "my eyes would close so quickly that I did not have time to say to myself: 'I'm falling asleep.'",
            key: [
              ["eyes"],
              ["close", "shut"],
              ["so quickly", "so fast", "so soon", "so rapidly", "so swiftly"],
              ["time"],
              ["asleep", "sleep", "dropping off", "dozing", "drifting off"],
            ],
            note: "The imparfait of repetition often comes out best as « would »: my eyes would close. « me dire » is to say to myself — the pronoun is doing real work.",
          },
          {
            t: "il me semblait que j'étais moi-même ce dont parlait l'ouvrage",
            model: "it seemed to me that I myself was what the book was about",
            key: [
              ["seemed", "felt", "appeared", "as if", "as though", "impression"],
              ["myself", "i was", "i had become"],
              ["book", "work", "volume"],
              ["about", "talking", "spoke", "speaking", "describ", "subject", "treated"],
            ],
            note: "« ce dont parlait l'ouvrage » puts the subject after its verb. Read it as « ce dont l'ouvrage parlait » — what the book was talking about.",
          },
        ],
        intoTarget: [
          {
            en: "She went to bed early.",
            accept: ["elle s'est couchée de bonne heure", "elle s'est couchée tôt"],
            must: [{ any: ["s'est couchée"], hint: "pronominal → être, and the participle agrees with elle: s'est couchée" }],
            model: "Elle s'est couchée de bonne heure.",
          },
          {
            en: "I used to fall asleep very quickly.",
            accept: ["je m'endormais très vite", "je m'endormais très rapidement"],
            must: [{ any: ["m'endormais"], hint: "« used to » → imparfait: je m'endormais" }],
            model: "Je m'endormais très vite.",
          },
          {
            en: "He had just put out the candle.",
            accept: ["il venait d'éteindre la bougie", "il venait d'éteindre sa bougie"],
            must: [{ any: ["venait d'éteindre"], hint: "had just = venir de in the imparfait — and de elides before a vowel: venait d'éteindre" }],
            model: "Il venait d'éteindre la bougie.",
          },
          {
            en: "The book I was talking about.",
            accept: ["le livre dont je parlais"],
            must: [
              { any: ["dont"], hint: "parler de → dont" },
              { any: ["parlais"], hint: "was talking → imparfait: je parlais" },
            ],
            model: "Le livre dont je parlais.",
          },
        ],
      },
      yourTurn: {
        prompt: "En trois ou quatre phrases, racontez une habitude de votre enfance et un jour où quelque chose l'a interrompue. L'imparfait pour l'habitude, le passé composé pour l'événement.",
        en: "In three or four sentences, describe a childhood habit and one day when something interrupted it. Imparfait for the habit, passé composé for the event.",
        min: 35,
        tips: [
          "« Quand j'étais petit·e, je … tous les soirs. »",
          "« Mais un soir, … »",
        ],
        uses: [],
        model: "Quand j'étais petite, je lisais tous les soirs dans mon lit. Ma mère venait souvent éteindre la lumière, mais je continuais à lire en cachette. Un soir, je me suis endormie avec le livre sur le visage. Le lendemain matin, j'ai trouvé la page encore ouverte.",
      },
    },
  ],

  de: [
    /* ================================================================== */
    /* DE 1 — Grundgesetz                                                 */
    /* ================================================================== */
    {
      id: "de-1",
      n: 1,
      level: "A2–B1",
      minutes: 40,
      title: "Die Würde des Menschen",
      titleEn: "Human dignity",
      focusLine: "The genitive, and the verb at the end",
      source: {
        work: "Grundgesetz für die Bundesrepublik Deutschland",
        author: "Parlamentarischer Rat",
        year: 1949,
        part: "Artikel 1, 2 und 3",
        url: "https://www.gesetze-im-internet.de/gg/art_1.html",
        licence: "Official work — not protected by copyright (§ 5 UrhG)",
      },
      context: [
        "The Basic Law was adopted by the Parliamentary Council on 8 May 1949 and came into force that month, four years after the end of the Nazi dictatorship, and it opens with human dignity on purpose: before any rule about how the state is organised, it states what the state may never touch. Article 1 cannot be amended at all — the so-called eternity clause, Article 79 (3), protects it.",
        "Its sentences are built with legal care, and they are packed with the one case learners avoid longest: the genitive. Five genitives in the first article alone, and a sentence in Article 2 that sends its verb to the end twice.",
      ],
      goals: [
        "Read the opening of the Basic Law — the sentence every German schoolchild can quote.",
        "Master the genitive: how to recognise it, and why it is « des Menschen », never « des Menschs ».",
        "Watch the verb go to the end of a « soweit » clause — twice in one sentence.",
        "Name words from their German definitions, and translate in both directions.",
      ],
      extract: [
        { label: "Artikel 1 (1)", text: "Die Würde des Menschen ist unantastbar. Sie zu achten und zu schützen ist Verpflichtung aller staatlichen Gewalt." },
        { label: "Artikel 1 (2)", text: "Das Deutsche Volk bekennt sich darum zu unverletzlichen und unveräußerlichen Menschenrechten als Grundlage jeder menschlichen Gemeinschaft, des Friedens und der Gerechtigkeit in der Welt." },
        { label: "Artikel 2 (1)", text: "Jeder hat das Recht auf die freie Entfaltung seiner Persönlichkeit, soweit er nicht die Rechte anderer verletzt und nicht gegen die verfassungsmäßige Ordnung oder das Sittengesetz verstößt." },
        { label: "Artikel 3 (1)", text: "Alle Menschen sind vor dem Gesetz gleich." },
      ],
      glossary: {
        würde: "dignity (die Würde)",
        menschen: "human being — here genitive: des Menschen (der Mensch)",
        unantastbar: "inviolable — un- + antasten (to lay hands on) + -bar",
        sie: "it — refers back to die Würde",
        achten: "to respect",
        schützen: "to protect",
        verpflichtung: "duty, obligation (die)",
        aller: "of all (genitive)",
        staatlichen: "of the state (staatlich)",
        gewalt: "power, authority (die Gewalt; also violence)",
        volk: "people, nation (das Volk)",
        bekennt: "« bekennt sich zu » = commits itself to (sich bekennen zu + dative)",
        darum: "therefore",
        unverletzlichen: "inviolable",
        unveräußerlichen: "inalienable (veräußern = to sell off)",
        menschenrechten: "human rights (dative plural)",
        grundlage: "foundation, basis (die)",
        jeder: "every (genitive feminine here) / everyone",
        menschlichen: "human",
        gemeinschaft: "community (die)",
        friedens: "of peace (der Frieden, des Friedens)",
        gerechtigkeit: "justice (die)",
        welt: "world",
        recht: "right (das Recht)",
        entfaltung: "development, unfolding (die)",
        persönlichkeit: "personality (die)",
        soweit: "as long as, insofar as — sends the verb to the end",
        anderer: "of others (genitive plural)",
        rechte: "rights (die Rechte)",
        verletzt: "violates, injures (verletzen)",
        verfassungsmäßige: "constitutional",
        ordnung: "order (die)",
        sittengesetz: "moral law (das)",
        verstößt: "offends against (verstoßen gegen)",
        gesetz: "law (das)",
        gleich: "equal",
      },
      understand: [
        {
          q: "What does Article 1 say about human dignity?",
          options: ["It must be earned", "It cannot be touched or violated", "It belongs only to citizens", "The state grants it"],
          answer: 1,
          why: "« unantastbar » — un- (not) + antasten (to lay hands on) + -bar (-able). Dignity is not granted by the state; the state's duty is to respect and protect it.",
        },
        {
          q: "Whose duty is it to respect and protect dignity?",
          options: ["Every citizen's", "All state authority's", "The courts' only", "The German people's"],
          answer: 1,
          why: "« Verpflichtung **aller staatlichen Gewalt** » — the duty of all state authority. That genitive is what says whose duty it is.",
        },
        {
          q: "When does Article 2 limit the free development of one's personality?",
          options: [
            "When it costs the state money",
            "When it violates the rights of others, the constitutional order or the moral law",
            "When the government disagrees",
            "Never",
          ],
          answer: 1,
          why: "« soweit er nicht die Rechte anderer verletzt und nicht gegen … verstößt » — as long as he does not violate the rights of others and does not offend against… The limit is the same kind as in the French Declaration: harm to others.",
        },
        {
          q: "« Alle Menschen sind vor dem Gesetz gleich » means…",
          options: ["All people are equal before the law", "All people are the same", "All people stand in front of the courts", "All laws are equal"],
          answer: 0,
          why: "« vor dem Gesetz » — before the law, in its eyes. Equal treatment, not sameness: the second option is the common over-reading.",
        },
      ],
      structure: {
        intro: "German puts the conjugated verb second in a main clause and at the very end of a subordinate one. Find the verbs first — their position tells you what kind of clause you are in.",
        sentences: [
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Die Würde des Menschen", role: "subject", detail: "with a genitive attached" },
              { t: "ist", role: "verb", detail: "second position" },
              { t: "unantastbar.", role: "complement" },
            ],
            note: "« des Menschen » hangs off « die Würde »: the dignity **of** the human being. A genitive follows the noun it belongs to, just where English puts « of ».",
          },
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Sie zu achten und zu schützen", role: "subject", detail: "an infinitive clause" },
              { t: "ist", role: "verb", detail: "still second" },
              { t: "Verpflichtung aller staatlichen Gewalt.", role: "complement", detail: "with a genitive" },
            ],
            note: "All of « Sie zu achten und zu schützen » is a single element — the subject — so the verb « ist » still comes second. « Sie » here is **it**, meaning die Würde; not « they », not « you ».",
          },
          {
            find: "the conjugated verb of the main clause",
            chunks: [
              { t: "Jeder", role: "subject" },
              { t: "hat", role: "verb", detail: "second position" },
              { t: "das Recht auf die freie Entfaltung seiner Persönlichkeit,", role: "object", detail: "with a genitive" },
              { t: "soweit er nicht die Rechte anderer verletzt", role: "clause", detail: "verb last" },
              { t: "und nicht gegen die verfassungsmäßige Ordnung oder das Sittengesetz verstößt.", role: "clause", detail: "verb last again" },
            ],
            note: "After « soweit » the conjugated verb goes to the end — « verletzt », then « verstößt ». The « und » joins two subordinate clauses that share one subject, and each keeps its verb last.",
          },
        ],
        rebuild: [
          {
            en: "The rights of every person are inviolable.",
            chunks: ["Die Rechte", "jedes Menschen", "sind", "unverletzlich"],
            accept: ["die rechte jedes menschen sind unverletzlich", "unverletzlich sind die rechte jedes menschen"],
            why: "The genitive « jedes Menschen » follows its noun; the verb « sind » stays second. Fronting « Unverletzlich » is correct too — the verb is still second.",
          },
          {
            en: "Everyone may speak freely, as long as he does not harm others.",
            chunks: ["Jeder", "darf", "frei", "sprechen", "soweit", "er", "anderen", "nicht", "schadet"],
            accept: [
              "jeder darf frei sprechen soweit er anderen nicht schadet",
              "soweit er anderen nicht schadet darf jeder frei sprechen",
            ],
            why: "Main clause: verb second (darf), infinitive last (sprechen). After soweit: the verb last (schadet), and schaden takes the dative, anderen. Put the soweit-clause first and the main verb comes straight after it: …schadet, darf jeder…",
          },
          {
            en: "Therefore the people commits itself to human rights.",
            chunks: ["Darum", "bekennt", "sich", "das Volk", "zu den Menschenrechten"],
            accept: [
              "darum bekennt sich das volk zu den menschenrechten",
              "darum bekennt das volk sich zu den menschenrechten",
              "das volk bekennt sich darum zu den menschenrechten",
            ],
            why: "« Darum » in first place pushes the subject behind the verb: Darum bekennt sich das Volk… The reflexive « sich » likes to come as early as it can.",
          },
        ],
      },
      grammar: {
        title: "The genitive, and the verb at the end",
        note: "The four cases",
        points: [
          {
            heading: "What the genitive does",
            body: [
              "The genitive says **whose** or **of what**: « die Würde **des Menschen** » — the dignity of the human being; « die Entfaltung **seiner Persönlichkeit** » — the development of his personality. It follows the noun it belongs to, where English puts « of ».",
              "It is the case of formal and written German. In speech many people replace it with « von + dative » (« das Auto **von meinem** Bruder »). In legal text it is everywhere — five times in Article 1 alone.",
            ],
            examples: [
              { t: "die Würde **des Menschen**", e: "the dignity of the human being" },
              { t: "als Grundlage **des Friedens** und **der Gerechtigkeit**", e: "as the foundation of peace and of justice" },
            ],
          },
          {
            heading: "How to recognise it",
            body: [
              "The articles: **des** for masculine and neuter, **der** for feminine and plural. So « der Gerechtigkeit » after « Grundlage » is not a nominative — it is genitive feminine: the foundation *of justice*.",
              "Masculine and neuter nouns add **-s** or **-es**: des Volk**es**, des Gesetz**es**, des Frieden**s**. Feminine and plural nouns add nothing: der Welt, der Gerechtigkeit.",
              "**Weak nouns** are the exception worth learning: a small group of masculine nouns — mostly people and animals — take **-(e)n** in every case except the nominative singular. der Mensch → des Mensch**en**; der Student → des Student**en**; der Junge → des Junge**n**. Never « des Menschs ».",
              "Ein-words follow the same pattern: **eines / einer**, **seines / seiner**, **jedes / jeder**. « jeder menschlichen Gemeinschaft » — Gemeinschaft is feminine, so « jeder » here is genitive feminine, not nominative masculine.",
            ],
            examples: [
              { t: "des Mensch**en**", e: "weak noun: -en, not -s" },
              { t: "seiner Persönlichkeit", e: "feminine: seiner, no ending on the noun" },
            ],
          },
          {
            heading: "Adjectives in the genitive end in -en",
            body: [
              "After a genitive article — des, der, eines, jeder, aller — an adjective almost always ends in **-en**: aller **staatlichen** Gewalt, jeder **menschlichen** Gemeinschaft. That single ending covers nearly everything you will need.",
              "The exception is a genitive with no article at all, where the adjective has to carry the ending itself: « guten Mutes » (in good spirits). Rare — recognise it, do not worry about producing it.",
            ],
            examples: [
              { t: "Verpflichtung aller **staatlichen** Gewalt", e: "-en after a genitive article" },
              { t: "Grundlage jeder **menschlichen** Gemeinschaft", e: "-en again" },
            ],
          },
          {
            heading: "After soweit, weil, dass: the verb goes last",
            body: [
              "A subordinate clause — introduced by soweit, weil, dass, wenn, obwohl, als… — sends its conjugated verb to the **end**: « soweit er nicht die Rechte anderer **verletzt** ». Article 2 does it twice in one sentence.",
              "When the subordinate clause comes **first**, it counts as the first element of the main clause, so the main verb comes straight after it: « Soweit er anderen nicht schadet, **darf** jeder frei sprechen. » Verb, comma, verb — that collision is German's signature.",
            ],
            examples: [
              { t: "soweit er nicht die Rechte anderer **verletzt**", e: "verb last" },
              { t: "Soweit er anderen nicht **schadet**, **darf** jeder frei sprechen.", e: "clause first → main verb next" },
            ],
          },
        ],
        drill: [
          { prompt: "die Würde ___ Kindes", hint: "das Kind", accept: ["des"], why: "Kind is neuter → **des**, and the noun adds -es: des Kindes." },
          { prompt: "die Freiheit ___ Presse", hint: "die Presse", accept: ["der"], why: "Feminine → **der** in the genitive; the noun itself does not change." },
          { prompt: "die Rechte des ___", hint: "der Student", accept: ["Studenten"], why: "Student is a weak noun: **-en** in the genitive, never « des Students »." },
          { prompt: "die Grundlage des ___", hint: "der Frieden", accept: ["Friedens"], why: "Frieden is one of a handful of mixed nouns — des Friedens, like des Namens and des Glaubens." },
          { prompt: "die Verpflichtung aller ___ Gewalt", hint: "staatlich", accept: ["staatlichen"], why: "After a genitive article, the adjective ends in **-en**." },
          { prompt: "die Entfaltung ___ Persönlichkeit", hint: "seine", accept: ["seiner"], why: "Persönlichkeit is feminine → genitive **seiner**." },
          { prompt: "die Würde ___ Menschen", hint: "jeder", accept: ["jedes"], why: "Mensch is masculine → **jedes** in the genitive (and Mensch takes -en as a weak noun)." },
          { prompt: "Jeder darf sprechen, soweit er die Gesetze nicht ___.", hint: "verletzen", accept: ["verletzt"], why: "After soweit, the conjugated verb goes to the end: … nicht **verletzt**." },
          { prompt: "Weil alle Menschen vor dem Gesetz gleich ___, …", hint: "sein", accept: ["sind"], why: "weil sends the verb to the end: … gleich **sind**." },
          { prompt: "Soweit er niemandem schadet, ___ er frei handeln.", hint: "dürfen", accept: ["darf"], why: "The subordinate clause takes first place, so the main verb comes straight after the comma: **darf** er." },
        ],
      },
      words: [
        { t: "Würde", g: "die", e: "dignity", def: "Der Wert, den ein Mensch hat und der Achtung verdient.", from: "Die Würde des Menschen…", family: "würdig (worthy), würdigen (to honour), menschenwürdig (humane)" },
        { t: "unantastbar", e: "inviolable", def: "So, dass man es nicht angreifen oder verletzen darf.", from: "…ist unantastbar.", family: "antasten (to touch, to infringe), tasten (to feel, grope)" },
        { t: "achten", e: "to respect", def: "Jemanden oder etwas für wertvoll halten und entsprechend behandeln.", from: "Sie zu achten…", family: "die Achtung (respect — and « Achtung! », watch out)" },
        { t: "schützen", e: "to protect", def: "Vor Gefahr oder Schaden bewahren.", from: "…und zu schützen", family: "der Schutz, der Datenschutz" },
        { t: "Verpflichtung", g: "die", e: "obligation, duty", def: "Etwas, das man tun muss, weil man es versprochen hat oder weil es Gesetz ist.", from: "ist Verpflichtung aller staatlichen Gewalt", family: "verpflichten, die Pflicht" },
        { t: "Gewalt", g: "die", e: "power, authority; violence", def: "Die Macht, über etwas zu bestimmen; auch: körperlicher Zwang.", from: "aller staatlichen Gewalt", note: "« staatliche Gewalt » is state power, not violence — context decides." },
        { t: "sich bekennen zu", e: "to commit oneself to", def: "Offen sagen, dass man für etwas steht.", from: "bekennt sich darum zu…" },
        { t: "Grundlage", g: "die", e: "foundation, basis", def: "Das, worauf etwas aufgebaut ist.", from: "als Grundlage jeder menschlichen Gemeinschaft", family: "grundlegend (fundamental), das Grundgesetz" },
        { t: "Gemeinschaft", g: "die", e: "community", def: "Eine Gruppe von Menschen, die etwas verbindet.", from: "jeder menschlichen Gemeinschaft", family: "gemeinsam (together)" },
        { t: "Frieden", g: "der", e: "peace", def: "Der Zustand, in dem kein Krieg herrscht.", from: "des Friedens", family: "friedlich (peaceful), zufrieden (content)" },
        { t: "Gerechtigkeit", g: "die", e: "justice", def: "Der Zustand, in dem jeder bekommt, was ihm zusteht.", from: "…und der Gerechtigkeit in der Welt", family: "gerecht (fair), ungerecht" },
        { t: "Entfaltung", g: "die", e: "development, unfolding", def: "Die freie Entwicklung dessen, was in jemandem angelegt ist.", from: "die freie Entfaltung seiner Persönlichkeit", family: "sich entfalten, falten (to fold)" },
        { t: "verletzen", e: "to injure; to violate", def: "Jemandem Schaden oder Schmerz zufügen; eine Regel brechen.", from: "…die Rechte anderer verletzt", family: "die Verletzung, unverletzlich" },
        { t: "verstoßen gegen", e: "to violate, contravene", def: "Etwas tun, was eine Regel oder ein Gesetz verbietet.", from: "…gegen die verfassungsmäßige Ordnung… verstößt", family: "der Verstoß" },
      ],
      nameIt: [
        { def: "Der Wert, den ein Mensch hat und der Achtung verdient.", accept: ["Würde"], g: "die" },
        { def: "Vor Gefahr oder Schaden bewahren.", accept: ["schützen"] },
        { def: "Jemanden oder etwas für wertvoll halten und entsprechend behandeln.", accept: ["achten"], also: { respektieren: "Right — the text's word is « achten »." } },
        { def: "Das, worauf etwas aufgebaut ist.", accept: ["Grundlage"], g: "die", also: { Basis: "Right meaning — the text says « die Grundlage »." , Fundament: "Right meaning — the text says « die Grundlage »." } },
        { def: "Der Zustand, in dem jeder bekommt, was ihm zusteht.", accept: ["Gerechtigkeit"], g: "die" },
        { def: "Eine Gruppe von Menschen, die etwas verbindet.", accept: ["Gemeinschaft"], g: "die" },
        { def: "So, dass man es nicht angreifen oder verletzen darf.", accept: ["unantastbar", "unverletzlich"] },
        { def: "Etwas, das man tun muss, weil man es versprochen hat oder weil es Gesetz ist.", accept: ["Verpflichtung"], g: "die", also: { Pflicht: "Right — the text uses the longer « die Verpflichtung »." } },
        { def: "Jemandem Schaden oder Schmerz zufügen; eine Regel brechen.", accept: ["verletzen"] },
        { def: "Der Zustand, in dem kein Krieg herrscht.", accept: ["Frieden", "Friede"], g: "der" },
      ],
      translate: {
        fromText: [
          {
            t: "Die Würde des Menschen ist unantastbar.",
            model: "Human dignity is inviolable.",
            key: [
              ["dignity"],
              ["human", "man", "person", "people", "mankind"],
              ["inviolable", "untouchable", "cannot be violated", "must not be violated", "shall not be violated", "sacrosanct", "may not be violated"],
            ],
            note: "« des Menschen » is literally « of the human being », but English says « human dignity ». The Bundestag's official translation adds « shall » for legal force: « Human dignity shall be inviolable. »",
          },
          {
            t: "Sie zu achten und zu schützen ist Verpflichtung aller staatlichen Gewalt.",
            model: "To respect and protect it is the duty of all state authority.",
            key: [
              ["respect"],
              ["protect"],
              ["duty", "obligation", "responsibility", "task"],
              ["all", "every"],
              ["state", "government", "public"],
              ["authority", "power", "authorities"],
            ],
            note: "« Sie » is « it » — die Würde. Translating it as « them » or « you » is the commonest slip in this sentence.",
          },
          {
            t: "Alle Menschen sind vor dem Gesetz gleich.",
            model: "All people are equal before the law.",
            key: [
              ["all", "every"],
              ["people", "persons", "human", "men", "everyone", "everybody"],
              ["equal"],
              ["before the law", "in the eyes of the law", "under the law"],
            ],
            note: "« vor dem Gesetz » = before the law: vor + dative, because nothing is moving.",
          },
        ],
        intoTarget: [
          {
            en: "The dignity of the child is inviolable.",
            accept: ["die würde des kindes ist unantastbar"],
            must: [{ any: ["des kindes"], hint: "Kind is neuter: genitive article des, and the noun adds -es: des Kindes" }],
            model: "Die Würde des Kindes ist unantastbar.",
          },
          {
            en: "the rights of the students",
            accept: ["die rechte der studenten", "die rechte der studierenden"],
            must: [{ any: ["der studenten", "der studierenden"], hint: "genitive plural: der Studenten (or the neutral der Studierenden)" }],
            model: "die Rechte der Studenten",
          },
          {
            en: "Everyone is free, as long as he respects the law.",
            accept: [
              "jeder ist frei soweit er das gesetz achtet", "jeder ist frei solange er das gesetz achtet",
              "jeder ist frei soweit er das gesetz respektiert", "jeder ist frei solange er das gesetz respektiert",
              "jeder ist frei soweit er die gesetze achtet", "jeder ist frei solange er die gesetze achtet",
              "jeder ist frei soweit er die gesetze respektiert", "jeder ist frei solange er die gesetze respektiert",
            ],
            must: [{ any: ["achtet", "respektiert", "befolgt"], atEnd: true, hint: "after soweit / solange the verb goes to the very end: … das Gesetz achtet" }],
            model: "Jeder ist frei, soweit er das Gesetz achtet.",
          },
          {
            en: "Therefore the state must protect human dignity.",
            accept: [
              "darum muss der staat die würde des menschen schützen", "deshalb muss der staat die würde des menschen schützen",
              "daher muss der staat die würde des menschen schützen", "darum muss der staat die menschenwürde schützen",
              "deshalb muss der staat die menschenwürde schützen", "daher muss der staat die menschenwürde schützen",
              "der staat muss darum die würde des menschen schützen", "der staat muss deshalb die würde des menschen schützen",
              "der staat muss daher die würde des menschen schützen",
            ],
            must: [{ any: ["schützen"], atEnd: true, hint: "the infinitive goes to the very end: … die Würde des Menschen schützen" }],
            model: "Darum muss der Staat die Würde des Menschen schützen.",
          },
        ],
      },
      yourTurn: {
        prompt: "Schreiben Sie zwei oder drei Sätze über ein Recht, das Ihnen wichtig ist. Benutzen Sie einen Genitiv und einen Nebensatz mit « weil », « soweit » oder « dass ».",
        en: "Write two or three sentences about a right that matters to you. Use one genitive and one clause with weil, soweit or dass.",
        min: 25,
        tips: [
          "« Für mich ist … das wichtigste Recht. »",
          "« …, weil …  » — the verb goes to the end of that clause.",
        ],
        uses: [
          { re: "\\b(weil|soweit|solange|dass|wenn|obwohl)\\b", msg: "No weil / soweit / dass clause yet — the task asks for one, with its verb at the end." },
        ],
        model: "Für mich ist die Freiheit der Meinung das wichtigste Recht. Jeder soll sagen dürfen, was er denkt, weil eine Demokratie ohne offene Diskussion nicht funktioniert. Die Grenzen dieses Rechts legt das Gesetz fest.",
      },
    },

    /* ================================================================== */
    /* DE 2 — Kafka, Die Verwandlung                                      */
    /* ================================================================== */
    {
      id: "de-2",
      n: 2,
      level: "B1–B2",
      minutes: 45,
      title: "Als Gregor Samsa erwachte",
      titleEn: "When Gregor Samsa woke",
      focusLine: "The Präteritum, and the verb that jumps the comma",
      source: {
        work: "Die Verwandlung",
        author: "Franz Kafka",
        year: 1915,
        part: "the opening",
        url: "https://www.gutenberg.org/ebooks/22367",
        licence: "Public domain (Kafka died in 1924)",
      },
      context: [
        "Die Verwandlung appeared in 1915. Kafka, who held a doctorate in law, earned his living at a workers' accident insurance institute in Prague and wrote at night. When his publisher planned the cover, Kafka asked that the creature itself not be drawn.",
        "The first sentence states the impossible in the calmest possible prose — no shock, no explanation — and that flat precision is the whole effect. For a learner it is a gift: the Präteritum, the narrative tense of written German, used with perfect regularity, and a demonstration of how far a German noun phrase can stretch.",
      ],
      goals: [
        "Read the most famous opening in German literature, sentence by sentence.",
        "Learn the Präteritum — the tense German stories are told in — and why Gregor's one spoken thought switches to the Perfekt.",
        "Watch « Als … » push its verb to the end, and the main verb jump in straight after the comma.",
        "Take apart a noun phrase eleven words long, and name words from their German definitions.",
      ],
      extract: [
        { label: "", text: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch, auf dessen Höhe sich die Bettdecke, zum gänzlichen Niedergleiten bereit, kaum noch erhalten konnte. Seine vielen, im Vergleich zu seinem sonstigen Umfang kläglich dünnen Beine flimmerten ihm hilflos vor den Augen." },
        { label: "", text: "»Was ist mit mir geschehen?« dachte er. Es war kein Traum. Sein Zimmer, ein richtiges, nur etwas zu kleines Menschenzimmer, lag ruhig zwischen den vier wohlbekannten Wänden." },
      ],
      glossary: {
        als: "when — one occasion in the past; sends the verb to the end",
        morgens: "« eines Morgens » = one morning (genitive of time)",
        unruhigen: "uneasy, troubled",
        träumen: "dreams (dative plural; der Traum)",
        erwachte: "awoke (erwachen, Präteritum)",
        fand: "found (finden, Präteritum)",
        bett: "bed",
        ungeheueren: "monstrous, enormous (an older spelling of ungeheuren)",
        ungeziefer: "vermin (das Ungeziefer)",
        verwandelt: "transformed (verwandeln)",
        lag: "lay (liegen, Präteritum)",
        panzerartig: "armour-like (der Panzer = armour, shell)",
        harten: "hard",
        rücken: "back",
        sah: "saw (sehen, Präteritum)",
        wenn: "when, if — for a repeated or conditional occasion",
        kopf: "head",
        wenig: "« ein wenig » = a little",
        hob: "lifted (heben, Präteritum)",
        gewölbten: "domed, arched",
        braunen: "brown",
        bogenförmigen: "arch-shaped",
        versteifungen: "stiffenings, ribs (die Versteifung)",
        geteilten: "divided",
        bauch: "belly",
        dessen: "whose — « auf dessen Höhe » = on top of which",
        höhe: "height, top",
        bettdecke: "blanket, quilt",
        gänzlichen: "complete",
        niedergleiten: "sliding down",
        bereit: "ready",
        kaum: "« kaum noch » = scarcely any longer",
        erhalten: "here: « sich erhalten » = to stay in place",
        konnte: "could (können, Präteritum)",
        vielen: "many",
        vergleich: "« im Vergleich zu » = compared with",
        sonstigen: "the rest of, otherwise",
        umfang: "size, girth",
        kläglich: "pitifully",
        dünnen: "thin",
        beine: "legs",
        flimmerten: "flickered, waved about",
        hilflos: "helplessly",
        augen: "eyes — « vor den Augen » = before his eyes",
        geschehen: "happened (ist … geschehen — Perfekt)",
        dachte: "thought (denken, Präteritum)",
        traum: "dream",
        zimmer: "room",
        richtiges: "proper, real",
        kleines: "small — « etwas zu klein » = somewhat too small",
        menschenzimmer: "a room for a human being",
        ruhig: "quietly, calmly",
        zwischen: "between",
        wohlbekannten: "familiar, well-known",
        wänden: "walls (dative plural; die Wand)",
      },
      understand: [
        {
          q: "When did Gregor find he had been transformed?",
          options: ["While he was falling asleep", "When he woke one morning from troubled dreams", "In the middle of a dream", "When his family came into the room"],
          answer: 1,
          why: "« Als Gregor Samsa **eines Morgens** aus unruhigen Träumen **erwachte** » — as he woke one morning from uneasy dreams. « eines Morgens » is a genitive of time: one particular morning.",
        },
        {
          q: "What is Gregor lying on?",
          options: ["His armour-hard back", "His side", "The floor", "His belly"],
          answer: 0,
          why: "« Er lag auf seinem panzerartig harten **Rücken** » — on his back, hard as armour. The belly is what he sees when he lifts his head.",
        },
        {
          q: "Why can the blanket barely stay on him?",
          options: ["It is too small", "His belly is domed, and the blanket is about to slide off", "His legs keep kicking it off", "The window is open"],
          answer: 1,
          why: "« auf dessen Höhe sich die Bettdecke, zum gänzlichen Niedergleiten bereit, kaum noch erhalten konnte » — on top of his domed belly the blanket, ready to slide right off, could scarcely stay in place.",
        },
        {
          q: "« Es war kein Traum. » What does it tell us?",
          options: ["He is still dreaming", "The transformation is real", "He is remembering an earlier dream", "The room is not his"],
          answer: 1,
          why: "Four words, no drama: it was no dream. The flatness is the shock — and the next sentence insists the room is his own, between its « vier wohlbekannten Wänden ».",
        },
      ],
      structure: {
        intro: "Kafka's first sentence is really two clauses. Once you see where each verb sits, the rest of the paragraph uses the same two moves again and again.",
        sentences: [
          {
            find: "the conjugated verb of the main clause",
            chunks: [
              { t: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte,", role: "clause", detail: "verb last — erwachte" },
              { t: "fand", role: "verb", detail: "straight after the comma" },
              { t: "er", role: "subject" },
              { t: "sich", role: "object", detail: "himself" },
              { t: "in seinem Bett", role: "adverbial", detail: "where" },
              { t: "zu einem ungeheueren Ungeziefer verwandelt.", role: "complement", detail: "transformed into…" },
            ],
            note: "The whole « Als … » clause is the first element of the sentence. So the main verb « fand » must come next — ahead of its own subject « er ». Verb, comma, verb: erwachte, fand.",
          },
          {
            find: "the two main verbs",
            chunks: [
              { t: "Er", role: "subject" },
              { t: "lag", role: "verb", detail: "first main verb" },
              { t: "auf seinem panzerartig harten Rücken", role: "adverbial", detail: "where" },
              { t: "und sah,", role: "verb", detail: "second main verb, same subject" },
              { t: "wenn er den Kopf ein wenig hob,", role: "clause", detail: "dropped in — verb last" },
              { t: "seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch,", role: "object", detail: "one long noun phrase" },
              { t: "auf dessen Höhe sich die Bettdecke, zum gänzlichen Niedergleiten bereit, kaum noch erhalten konnte.", role: "clause", detail: "relative clause — verb last" },
            ],
            note: "The « wenn » clause is slotted between « sah » and what he saw, so you have to hold « sah » in mind across it. « wenn » here means **if / whenever** — a condition, not a single moment; for one past occasion German uses « als ».",
          },
          {
            find: "the conjugated verb",
            chunks: [
              { t: "Seine vielen, im Vergleich zu seinem sonstigen Umfang kläglich dünnen Beine", role: "subject", detail: "eleven words, one noun" },
              { t: "flimmerten", role: "verb", detail: "second position" },
              { t: "ihm", role: "object", detail: "to him — dative" },
              { t: "hilflos", role: "adverbial", detail: "how" },
              { t: "vor den Augen.", role: "adverbial", detail: "where" },
            ],
            note: "Read the subject from the outside in: « Seine vielen … Beine » — his many legs. Everything between is description: thin, pitifully thin, pitifully thin compared with the rest of his size. English has to unfold it after the noun: his many legs, pitifully thin compared with…",
          },
        ],
        rebuild: [
          {
            en: "When he woke up, he was lying in his bed.",
            chunks: ["Als", "er", "erwachte", "lag", "er", "in seinem Bett"],
            accept: ["als er erwachte lag er in seinem bett", "er lag in seinem bett als er erwachte"],
            why: "Als-clause first → its verb last (erwachte), then the main verb at once (lag), then the subject. Put the main clause first and the order is ordinary: Er lag in seinem Bett, als er erwachte.",
          },
          {
            en: "One morning he found himself transformed.",
            chunks: ["Eines Morgens", "fand", "er", "sich", "verwandelt"],
            accept: ["eines morgens fand er sich verwandelt", "er fand sich eines morgens verwandelt"],
            why: "« Eines Morgens » in first place → the verb second (fand), the subject after it. The genitive needs no preposition: it already means one morning.",
          },
          {
            en: "It was no dream, he thought.",
            chunks: ["Es", "war", "kein Traum", "dachte", "er"],
            accept: ["es war kein traum dachte er"],
            why: "Quoted thought or speech counts as the first element, so the verb of saying comes next: « …, dachte er » — never « er dachte » after a quotation.",
          },
        ],
      },
      grammar: {
        title: "The Präteritum, and the verb that jumps the comma",
        note: "Word order: verb second, verb last",
        tenses: ["praeteritum", "perfekt"],
        points: [
          {
            heading: "The Präteritum: the tense stories are told in",
            body: [
              "Written German narrates in the **Präteritum**: erwachte, fand, lag, sah, hob, konnte, flimmerten, dachte, war. Every narrating verb in this extract is Präteritum. In conversation the same events would go into the Perfekt — « er ist aufgewacht » — but a story on the page uses the simple past.",
              "**Weak verbs** add **-te-** to the stem: erwach**te**, flimmer**ten**. Predictable: once you know the infinitive, you know the form.",
              "**Strong verbs** change their vowel and add nothing in the ich and er/sie/es forms: finden → **fand**, liegen → **lag**, sehen → **sah**, heben → **hob**. These have to be learned, but they are a closed list, and the commonest are verbs you already know.",
              "A few are **mixed** — a vowel change *and* -te: denken → **dach**te, bringen → **brach**te, können → konn**te**.",
            ],
            examples: [
              { t: "Gregor **erwachte**.", e: "weak: erwach- + te" },
              { t: "Er **fand** sich verwandelt.", e: "strong: finden → fand" },
              { t: "»Was ist mit mir geschehen?« **dachte** er.", e: "mixed: denken → dachte" },
            ],
          },
          {
            heading: "Why Gregor's thought is in the Perfekt",
            body: [
              "« Was **ist** mit mir **geschehen**? » — his one spoken thought is in the Perfekt, because it is what a person would *say*. A sentence later the narrator writes « Es **war** kein Traum » in the Präteritum. Kafka keeps the two registers exactly apart: speech in the Perfekt, narration in the Präteritum.",
              "The exceptions you will hear even in speech: **sein**, **haben** and the **modal verbs** are normally Präteritum in conversation too — « ich war müde », « ich hatte keine Zeit », « ich konnte nicht schlafen ».",
            ],
            examples: [
              { t: "»Was **ist** mit mir **geschehen**?«", e: "speech → Perfekt" },
              { t: "Es **war** kein Traum.", e: "narration → Präteritum" },
            ],
          },
          {
            heading: "Als + verb last, then the main verb at once",
            body: [
              "**als** introduces a single occasion in the past — « Als Gregor … erwachte », that one morning. For repeated occasions or conditions German uses **wenn** — « wenn er den Kopf ein wenig hob ». Both send their verb to the **end**.",
              "When the subordinate clause comes first, it fills the first position of the sentence, and the main verb must come **second** — directly after the comma, ahead of its own subject: « Als er erwachte, **fand er** sich… ». Not « Als er erwachte, er fand… »: that is English word order, and the most common word-order mistake German learners make.",
            ],
            examples: [
              { t: "Als er **erwachte**, **fand** er sich…", e: "verb last, comma, verb" },
              { t: "wenn er den Kopf ein wenig **hob**", e: "repeated / conditional → wenn" },
            ],
          },
          {
            heading: "Reading a long noun phrase",
            body: [
              "German can put a whole clause's worth of description *before* a noun: « seinen gewölbten, braunen, **von bogenförmigen Versteifungen geteilten** Bauch » — his domed brown belly, *divided by arch-shaped ribs*. English moves that part behind the noun; German keeps it in front.",
              "The way in: find the article and the noun it belongs to — « seinen … Bauch », « Seine vielen … Beine » — then read everything between as description. You will meet this in newspapers and textbooks far more than in speech. Recognising it is the skill; producing it can wait.",
            ],
            examples: [
              { t: "**seinen** gewölbten, braunen, von bogenförmigen Versteifungen geteilten **Bauch**", e: "article … noun: read the frame first" },
            ],
          },
        ],
        drill: [
          { prompt: "Gregor ___ aus unruhigen Träumen.", hint: "erwachen — Präteritum", accept: ["erwachte"], why: "Weak verb: stem + -te: **erwachte**." },
          { prompt: "Er ___ auf seinem Rücken.", hint: "liegen — Präteritum", accept: ["lag"], why: "Strong verb: liegen → **lag**, and no ending in the er-form." },
          { prompt: "Er ___ seinen braunen Bauch.", hint: "sehen — Präteritum", accept: ["sah"], why: "Strong: sehen → **sah**." },
          { prompt: "Er ___ den Kopf ein wenig.", hint: "heben — Präteritum", accept: ["hob"], why: "Strong: heben → **hob**." },
          { prompt: "Die Decke ___ sich kaum noch halten.", hint: "können — Präteritum", accept: ["konnte"], why: "Modal: können → **konnte** — the umlaut goes, -te arrives." },
          { prompt: "»Was ___ mit mir geschehen?«", hint: "the Perfekt auxiliary", accept: ["ist"], why: "geschehen takes **sein**: ist geschehen. And it is speech, so Perfekt." },
          { prompt: "Als er ___, war es schon hell.", hint: "aufwachen — Präteritum", accept: ["aufwachte"], why: "After als the verb goes to the end — and a separable verb joins back together there: **aufwachte**, not « wachte auf »." },
          { prompt: "Als er aufwachte, ___ er sich verwandelt.", hint: "finden — Präteritum", accept: ["fand"], why: "The als-clause is first, so the main verb comes straight after the comma: **fand** er." },
          { prompt: "___ er ein Kind war, las er viel.", hint: "als or wenn?", accept: ["Als"], why: "One period in the past, seen as a whole → **als**." },
          { prompt: "Immer ___ er den Kopf hob, sah er seinen Bauch.", hint: "als or wenn?", accept: ["wenn"], why: "Repeated — « immer wenn » is whenever → **wenn**, even in the past." },
        ],
      },
      words: [
        { t: "erwachen", e: "to awaken", def: "Aus dem Schlaf kommen; wach werden.", from: "…aus unruhigen Träumen erwachte", family: "wach, aufwachen (the everyday word), das Erwachen" },
        { t: "unruhig", e: "uneasy, restless", def: "Nicht ruhig; voller Sorge oder Bewegung.", from: "aus unruhigen Träumen", family: "die Ruhe, ruhig, beunruhigen" },
        { t: "Traum", g: "der", e: "dream", def: "Bilder und Erlebnisse, die man im Schlaf hat.", from: "Es war kein Traum.", family: "träumen, traumhaft (dreamlike; wonderful)" },
        { t: "verwandeln", e: "to transform", def: "Etwas oder jemanden zu etwas ganz anderem machen.", from: "…zu einem ungeheueren Ungeziefer verwandelt", family: "die Verwandlung — the title" },
        { t: "ungeheuer", e: "monstrous, enormous", def: "Sehr groß und erschreckend.", from: "einem ungeheueren Ungeziefer", family: "das Ungeheuer (monster); nicht geheuer (uncanny)" },
        { t: "Ungeziefer", g: "das", e: "vermin", def: "Kleine Tiere wie Insekten, die als schädlich oder eklig gelten.", from: "zu einem ungeheueren Ungeziefer", note: "Kafka never says what kind of creature. The word means vermin in general — no more specific than that." },
        { t: "Rücken", g: "der", e: "back", def: "Die hintere Seite des Körpers, vom Hals bis zur Hüfte.", from: "auf seinem panzerartig harten Rücken" },
        { t: "Bauch", g: "der", e: "belly", def: "Der vordere Teil des Körpers zwischen Brust und Becken.", from: "…geteilten Bauch" },
        { t: "kläglich", e: "pitiful(ly)", def: "So, dass es Mitleid erregt; jämmerlich.", from: "kläglich dünnen Beine", family: "klagen (to lament), die Klage (complaint; lawsuit)" },
        { t: "hilflos", e: "helpless(ly)", def: "Ohne Hilfe; unfähig, sich selbst zu helfen.", from: "flimmerten ihm hilflos vor den Augen", family: "die Hilfe, helfen; -los = -less" },
        { t: "geschehen", e: "to happen", def: "Sich ereignen; vorkommen, ohne dass man es plant.", from: "»Was ist mit mir geschehen?«", note: "Takes sein in the Perfekt: es ist geschehen. The everyday synonym is passieren." },
        { t: "wohlbekannt", e: "very familiar", def: "Sehr gut bekannt; vertraut.", from: "zwischen den vier wohlbekannten Wänden" },
      ],
      nameIt: [
        { def: "Aus dem Schlaf kommen; wach werden.", accept: ["erwachen", "aufwachen"] },
        { def: "Bilder und Erlebnisse, die man im Schlaf hat.", accept: ["Traum"], g: "der" },
        { def: "Etwas oder jemanden zu etwas ganz anderem machen.", accept: ["verwandeln"] },
        { def: "Kleine Tiere wie Insekten, die als schädlich oder eklig gelten.", accept: ["Ungeziefer"], g: "das" },
        { def: "Die hintere Seite des Körpers, vom Hals bis zur Hüfte.", accept: ["Rücken"], g: "der" },
        { def: "Der vordere Teil des Körpers zwischen Brust und Becken.", accept: ["Bauch"], g: "der" },
        { def: "Ohne Hilfe; unfähig, sich selbst zu helfen.", accept: ["hilflos"] },
        { def: "Sich ereignen; vorkommen, ohne dass man es plant.", accept: ["geschehen"], also: { passieren: "Right — Kafka's word is « geschehen »." } },
        { def: "Nicht ruhig; voller Sorge oder Bewegung.", accept: ["unruhig"] },
        { def: "Sehr groß und erschreckend.", accept: ["ungeheuer"] },
      ],
      translate: {
        fromText: [
          {
            t: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt.",
            model: "When Gregor Samsa woke one morning from uneasy dreams, he found himself transformed in his bed into a monstrous vermin.",
            key: [
              ["when", "as"],
              ["morning"],
              ["woke", "awoke", "awakened", "waking", "awaking"],
              ["dream"],
              ["found himself", "found that he", "discovered", "found he"],
              ["transformed", "changed", "turned", "metamorphos"],
              ["bed"],
              ["vermin", "insect", "bug", "creature", "beetle", "cockroach", "pest", "monster"],
            ],
            note: "« Ungeziefer » is vague on purpose — vermin, a pest, a creature nobody wants. English translators have chosen « insect », « bug », « vermin », even « cockroach »; the German commits to nothing more precise.",
          },
          {
            t: "Er lag auf seinem panzerartig harten Rücken.",
            model: "He lay on his back, as hard as armour.",
            key: [
              ["lay", "was lying", "lying"],
              ["back"],
              ["armour", "armor", "shell", "plate", "plated", "carapace"],
              ["hard"],
            ],
            note: "« lag » is the Präteritum of liegen — lay, not « laid » (that is legen). « panzerartig hart » — hard like armour; « armour-plated » works too.",
          },
          {
            t: "»Was ist mit mir geschehen?« dachte er. Es war kein Traum.",
            model: "'What has happened to me?' he thought. It was no dream.",
            key: [
              ["what"],
              ["happened", "happening", "become of"],
              ["me"],
              ["thought"],
              ["no dream", "not a dream", "wasn't a dream", "was not a dream"],
            ],
            note: "« mit mir » — to me (literally with me). « dachte er » after the quote: verb before subject. « kein Traum » = no dream, not a dream.",
          },
        ],
        intoTarget: [
          {
            en: "When he woke up, he was lying on his back.",
            accept: [
              "als er aufwachte lag er auf seinem rücken", "als er aufwachte lag er auf dem rücken",
              "als er erwachte lag er auf seinem rücken", "als er erwachte lag er auf dem rücken",
            ],
            must: [{ any: ["aufwachte lag er", "erwachte lag er"], hint: "the als-clause ends with its verb, then the main verb comes at once: …aufwachte, lag er…" }],
            model: "Als er aufwachte, lag er auf dem Rücken.",
          },
          {
            en: "His room was quiet and familiar.",
            accept: ["sein zimmer war ruhig und vertraut", "sein zimmer war ruhig und wohlbekannt", "sein zimmer war still und vertraut"],
            must: [{ any: ["sein zimmer war"], hint: "Zimmer is neuter — sein Zimmer; and narration → war" }],
            model: "Sein Zimmer war ruhig und vertraut.",
          },
          {
            en: "One morning he found himself in his bed.",
            accept: ["eines morgens fand er sich in seinem bett", "er fand sich eines morgens in seinem bett"],
            must: [
              { any: ["eines morgens"], hint: "one morning = eines Morgens — a genitive, no preposition" },
              { any: ["fand"], hint: "finden → fand (strong verb)" },
            ],
            model: "Eines Morgens fand er sich in seinem Bett.",
          },
          {
            en: "'What has happened?' he thought.",
            accept: ["was ist geschehen dachte er", "was ist passiert dachte er"],
            must: [
              { any: ["dachte er"], hint: "after quoted thought, the verb comes before its subject: dachte er" },
              { any: ["ist geschehen", "ist passiert"], hint: "geschehen and passieren take sein: ist geschehen" },
            ],
            model: "»Was ist geschehen?«, dachte er.",
          },
        ],
      },
      yourTurn: {
        prompt: "Erzählen Sie in drei oder vier Sätzen im Präteritum, wie ein Morgen begann, an dem etwas Unerwartetes passierte. Beginnen Sie mit « Als … ».",
        en: "In three or four sentences in the Präteritum, tell how a morning began when something unexpected happened. Start with « Als … ».",
        min: 30,
        tips: [
          "« Als ich an einem Montag aufwachte, … » — then the main verb straight after the comma.",
          "Narrate in the Präteritum: war, hatte, ging, sah, stand auf…",
        ],
        uses: [
          { re: "^\\s*Als\\b", msg: "Start with « Als … » — then watch where the next verb goes." },
        ],
        model: "Als ich an einem Montag aufwachte, war es im Zimmer seltsam still. Ich stand auf und ging zum Fenster. Draußen lag überall Schnee, obwohl es schon April war. Ich blieb lange am Fenster stehen und wusste nicht, ob ich träumte.",
      },
    },
  ],
};

/** The lessons for one language, in course order. */
export function lessonsFor(lang) {
  return (LESSONS[lang] || []).slice().sort((a, b) => a.n - b.n);
}

export const LESSON_STAGES = [
  { key: "read", label: "Read" },
  { key: "understand", label: "Understand" },
  { key: "structure", label: "Structure" },
  { key: "grammar", label: "Grammar" },
  { key: "words", label: "Words" },
  { key: "nameIt", label: "Name it" },
  { key: "translate", label: "Translate" },
  { key: "yourTurn", label: "Your turn" },
];
