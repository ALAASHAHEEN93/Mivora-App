/**
 * DEMO DATA — translations of the fictional demo listings.
 * Drafted by AI, not yet reviewed by native speakers. Real listings will carry
 * provider-supplied or reviewed translations instead.
 */
import type { LanguageCode } from "@/domain/types";

type Triple = [title: string, summary: string, description: string];
export type DemoTranslations = Record<string, Partial<Record<LanguageCode, Triple>>>;

export const DEMO_TRANSLATIONS: DemoTranslations = {
  a1: {
    ar: ["يوغا عائلية يوم السبت", "يوغا مرحة للأطفال مع أحد الوالدين.", "تنفّس وتمدّد وتقليد الحيوانات: 45 دقيقة من الحركة للصغار والكبار. الحصائر متوفرة."],
    tr: ["Cumartesi aile yogası", "Bir ebeveynle birlikte çocuklar için eğlenceli yoga.", "Nefes al, esne, hayvanları taklit et: küçükler ve büyükler için 45 dakika hareket. Matlar mevcuttur."],
    uk: ["Сімейна йога в суботу", "Ігрова йога для дітей разом з одним із батьків.", "Дихаємо, тягнемося, наслідуємо тварин: 45 хвилин руху для малих і дорослих. Килимки є на місці."],
    pl: ["Rodzinna joga w sobotę", "Zabawowa joga dla dzieci z jednym z rodziców.", "Oddychamy, rozciągamy się, naśladujemy zwierzęta: 45 minut ruchu dla małych i dużych. Maty na miejscu."],
    fr: ["Yoga en famille le samedi", "Yoga ludique pour les enfants avec un parent.", "Respirer, s'étirer, imiter les animaux : 45 minutes de mouvement pour petits et grands. Tapis fournis."],
    es: ["Yoga en familia los sábados", "Yoga divertido para niños con uno de sus padres.", "Respirar, estirarse, imitar animales: 45 minutos de movimiento para pequeños y mayores. Hay esterillas."],
    it: ["Yoga in famiglia il sabato", "Yoga giocoso per bambini con un genitore.", "Respirare, allungarsi, imitare gli animali: 45 minuti di movimento per piccoli e grandi. Tappetini disponibili."],
  },
  a2: {
    ar: ["فخار للأطفال", "أطباق وحيوانات وشخصيات خيالية من الطين.", "مجموعة صغيرة بحد أقصى 8 أطفال. تُحرق الأعمال ويمكن استلامها بعد أسبوع."],
    tr: ["Çocuklar için seramik", "Kilden kaseler, hayvanlar ve hayali figürler.", "En fazla 8 çocukluk küçük grup. Eserler fırınlanır ve bir hafta sonra teslim alınabilir."],
    uk: ["Гончарство для дітей", "Миски, тварини та фантастичні фігурки з глини.", "Мала група до 8 дітей. Вироби випалюють, забрати їх можна через тиждень."],
    pl: ["Ceramika dla dzieci", "Miseczki, zwierzęta i fantastyczne postacie z gliny.", "Mała grupa, maks. 8 dzieci. Prace są wypalane i można je odebrać tydzień później."],
    fr: ["Poterie pour enfants", "Bols, animaux et personnages imaginaires en argile.", "Petit groupe de 8 enfants maximum. Les créations sont cuites et à récupérer une semaine plus tard."],
    es: ["Cerámica para niños", "Cuencos, animales y figuras fantásticas de barro.", "Grupo pequeño de máx. 8 niños. Las piezas se cuecen y se recogen una semana después."],
    it: ["Ceramica per bambini", "Ciotole, animali e figure fantastiche in argilla.", "Piccolo gruppo di max. 8 bambini. Le opere vengono cotte e si ritirano una settimana dopo."],
  },
  a3: {
    ar: ["ورشة روبوتات: بناء وبرمجة", "بناء روبوتات بأجهزة استشعار وتشغيلها.", "لا حاجة لخبرة سابقة. الحواسيب المحمولة ومجموعات البناء متوفرة."],
    tr: ["Robotik atölyesi: yap ve kodla", "Sensörlü robotlar yap ve hareket ettir.", "Ön bilgi gerekmez. Dizüstü bilgisayarlar ve setler sağlanır."],
    uk: ["Майстерня робототехніки: збирай і програмуй", "Збирай роботів із сенсорами та оживляй їх.", "Досвід не потрібен. Ноутбуки та набори надаються."],
    pl: ["Warsztaty robotyki: buduj i programuj", "Buduj roboty z czujnikami i wprawiaj je w ruch.", "Bez wcześniejszego doświadczenia. Laptopy i zestawy zapewnione."],
    fr: ["Atelier robotique : construire et coder", "Construire des robots à capteurs et les faire bouger.", "Aucune expérience requise. Ordinateurs portables et kits fournis."],
    es: ["Taller de robótica: construye y programa", "Construye robots con sensores y hazlos moverse.", "No se necesita experiencia. Portátiles y kits incluidos."],
    it: ["Laboratorio di robotica: costruisci e programma", "Costruisci robot con sensori e falli muovere.", "Nessuna esperienza richiesta. Portatili e kit forniti."],
  },
  a4: {
    en: ["Multilingual story time", "Picture books in German, Arabic and Turkish.", "Every week one book in three languages, then drawing. Parents and siblings welcome."],
    uk: ["Багатомовна година читання", "Книжки з картинками німецькою, арабською та турецькою.", "Щотижня одна книжка трьома мовами, потім малювання. Батьки й брати-сестри — ласкаво просимо."],
    pl: ["Wielojęzyczna godzina czytania", "Książeczki po niemiecku, arabsku i turecku.", "Co tydzień jedna książka w trzech językach, potem rysowanie. Rodzice i rodzeństwo mile widziani."],
    fr: ["Heure du conte multilingue", "Albums illustrés en allemand, arabe et turc.", "Chaque semaine un livre en trois langues, puis du dessin. Parents et frères et sœurs bienvenus."],
    es: ["Cuentacuentos multilingüe", "Libros ilustrados en alemán, árabe y turco.", "Cada semana un libro en tres idiomas y después dibujo. Padres y hermanos son bienvenidos."],
    it: ["Ora del racconto multilingue", "Albi illustrati in tedesco, arabo e turco.", "Ogni settimana un libro in tre lingue, poi disegno. Genitori e fratelli sono i benvenuti."],
  },
  a5: {
    en: ["Baby and toddler group Nippes", "Drop-in meetup for babies, toddlers and parents.", "Play, sing, have a coffee. Ukrainian-speaking support on site."],
    ar: ["مجموعة الرضّع في نيبس", "لقاء مفتوح للرضّع والأطفال الصغار والأهل.", "لعب وغناء وقهوة. يتوفر مرافقة باللغة الأوكرانية في المكان."],
    tr: ["Nippes bebek ve yürümeye başlayan çocuk grubu", "Bebekler, küçük çocuklar ve ebeveynler için açık buluşma.", "Oyun, şarkı, kahve. Yerinde Ukraynaca destek var."],
    pl: ["Grupa dla maluchów w Nippes", "Otwarte spotkania dla niemowląt, maluchów i rodziców.", "Zabawa, śpiew, kawa. Na miejscu opieka w języku ukraińskim."],
    fr: ["Groupe bébés et tout-petits à Nippes", "Rencontre libre pour bébés, tout-petits et parents.", "Jouer, chanter, boire un café. Accompagnement en ukrainien sur place."],
    es: ["Grupo de bebés en Nippes", "Encuentro abierto para bebés, niños pequeños y padres.", "Jugar, cantar, tomar un café. Acompañamiento en ucraniano en el lugar."],
    it: ["Gruppo bebè a Nippes", "Incontro aperto per neonati, bambini piccoli e genitori.", "Giocare, cantare, bere un caffè. Accompagnamento in ucraino sul posto."],
  },
  a6: {
    ar: ["مسرح الأطفال: التنين الصغير", "تنين لا يستطيع نفث النار.", "مسرح دمى، حوالي 50 دقيقة. يدفع الكبار أيضًا سعر الأطفال."],
    tr: ["Çocuk tiyatrosu: Küçük Ejderha", "Ateş püsküremeyen bir ejderha.", "Kukla gösterisi, yaklaşık 50 dakika. Yetişkinler de çocuk fiyatı öder."],
    uk: ["Дитячий театр: Маленький дракон", "Дракон, який не вміє дихати вогнем.", "Ляльковий театр, близько 50 хвилин. Дорослі теж платять дитячу ціну."],
    pl: ["Teatr dla dzieci: Mały smok", "Smok, który nie umie ziać ogniem.", "Teatr lalek, ok. 50 minut. Dorośli też płacą cenę dziecięcą."],
    fr: ["Théâtre jeune public : Le petit dragon", "Un dragon qui ne sait pas cracher du feu.", "Spectacle de marionnettes, env. 50 minutes. Les adultes paient aussi le tarif enfant."],
    es: ["Teatro infantil: El pequeño dragón", "Un dragón que no sabe echar fuego.", "Teatro de marionetas, aprox. 50 minutos. Los adultos también pagan el precio infantil."],
    it: ["Teatro per bambini: Il piccolo drago", "Un drago che non sa sputare fuoco.", "Teatro di burattini, circa 50 minuti. Anche gli adulti pagano il prezzo bambini."],
  },
  a7: {
    ar: ["مستكشفو الطبيعة في غابة المدينة", "قراءة الآثار والتعرّف على الأوراق ومراقبة الحيوانات.", "يُرجى إحضار ملابس مقاومة للطقس. يُقام النشاط حتى في المطر."],
    tr: ["Şehir ormanında doğa kâşifleri", "İz sürme, yaprak tanıma, hayvan gözlemi.", "Lütfen hava koşullarına uygun kıyafet getirin. Yağmurda da yapılır."],
    uk: ["Дослідники природи в міському лісі", "Читаємо сліди, впізнаємо листя, спостерігаємо за тваринами.", "Візьміть одяг на будь-яку погоду. Проводиться і в дощ."],
    pl: ["Odkrywcy przyrody w miejskim lesie", "Tropienie śladów, rozpoznawanie liści, obserwacja zwierząt.", "Prosimy o odzież odporną na pogodę. Odbywa się także w deszczu."],
    fr: ["Explorateurs nature dans la forêt urbaine", "Lire des traces, reconnaître les feuilles, observer les animaux.", "Prévoir des vêtements adaptés à la météo. A lieu même sous la pluie."],
    es: ["Exploradores de la naturaleza en el bosque urbano", "Leer huellas, identificar hojas, observar animales.", "Traed ropa impermeable. Se realiza aunque llueva."],
    it: ["Esploratori della natura nel bosco cittadino", "Leggere tracce, riconoscere foglie, osservare animali.", "Portare abiti adatti al meteo. Si svolge anche con la pioggia."],
  },
  a8: {
    en: ["Hip-hop for teens", "Choreos, battles and music for ages 12 to 17.", "Trial class any time. Bring comfortable clothes and indoor shoes."],
    ar: ["هيب هوب للمراهقين", "رقصات ومنافسات وموسيقى للأعمار من 12 إلى 17.", "حصة تجريبية في أي وقت. أحضر ملابس مريحة وحذاءً للصالة."],
    uk: ["Хіп-хоп для підлітків", "Хореографія, батли й музика для 12–17 років.", "Пробне заняття будь-коли. Візьміть зручний одяг і змінне взуття."],
    pl: ["Hip-hop dla nastolatków", "Choreografie, battle i muzyka dla 12–17 lat.", "Lekcja próbna w każdej chwili. Wygodny strój i obuwie halowe."],
    fr: ["Hip-hop pour ados", "Chorégraphies, battles et musique pour les 12–17 ans.", "Cours d'essai à tout moment. Prévoir une tenue confortable et des chaussures d'intérieur."],
    es: ["Hip-hop para adolescentes", "Coreografías, batallas y música para 12 a 17 años.", "Clase de prueba en cualquier momento. Trae ropa cómoda y calzado de interior."],
    it: ["Hip-hop per ragazzi", "Coreografie, battle e musica per 12–17 anni.", "Lezione di prova in qualsiasi momento. Portare abiti comodi e scarpe da palestra."],
  },
  a9: {
    en: ["Drumming workshop", "Rhythms from around the world on real drums.", "Instruments provided. Ear protection available for little ones."],
    ar: ["ورشة الطبول", "إيقاعات من حول العالم على طبول حقيقية.", "الآلات متوفرة. واقيات الأذن متاحة للصغار."],
    tr: ["Davul atölyesi", "Gerçek davullarla dünyanın dört bir yanından ritimler.", "Enstrümanlar sağlanır. Küçükler için kulak koruyucu mevcuttur."],
    uk: ["Майстер-клас з барабанів", "Ритми з усього світу на справжніх барабанах.", "Інструменти надаються. Для малечі є навушники для захисту слуху."],
    pl: ["Warsztaty bębniarskie", "Rytmy z całego świata na prawdziwych bębnach.", "Instrumenty zapewnione. Ochronniki słuchu dla najmłodszych."],
    es: ["Taller de percusión", "Ritmos de todo el mundo con tambores de verdad.", "Instrumentos incluidos. Protectores auditivos para los pequeños."],
    it: ["Laboratorio di percussioni", "Ritmi da tutto il mondo su veri tamburi.", "Strumenti forniti. Protezioni per l'udito disponibili per i più piccoli."],
  },
  a10: {
    ar: ["رالي المتحف للعائلات", "جولة استكشافية في المتحف مع ورقة ألغاز.", "مرة في الشهر مع ترجمة بلغة الإشارة. أوراق الألغاز متوفرة عند الصندوق."],
    tr: ["Aileler için müze rallisi", "Bulmaca kâğıdıyla müzede keşif turu.", "Ayda bir işaret dili tercümesiyle. Bulmaca kâğıtları gişede."],
    uk: ["Музейний квест для сімей", "Досліджуйте музей з аркушем загадок.", "Раз на місяць із перекладом жестовою мовою. Аркуші з загадками — на касі."],
    pl: ["Rodzinny rajd po muzeum", "Odkrywanie muzeum z kartą zagadek.", "Raz w miesiącu z tłumaczeniem na język migowy. Karty zagadek w kasie."],
    fr: ["Rallye au musée en famille", "Explorer le musée avec une feuille d'énigmes.", "Une fois par mois avec interprétation en langue des signes. Feuilles d'énigmes à l'accueil."],
    es: ["Gymkana en el museo para familias", "Explora el museo con una hoja de acertijos.", "Una vez al mes con interpretación en lengua de signos. Hojas de acertijos en taquilla."],
    it: ["Caccia al tesoro al museo per famiglie", "Esplora il museo con un foglio di indovinelli.", "Una volta al mese con interprete della lingua dei segni. Fogli disponibili alla cassa."],
  },
  a11: {
    ar: ["مخيم العطلة: رياضة ولعب (5 أيام)", "خمسة أيام من ألعاب الكرة والتسلق والرحلات، مع وجبة الغداء.", "رعاية من 9 إلى 15. السعر يشمل الأيام الخمسة. خصم للإخوة عند الطلب."],
    tr: ["Tatil kampı: spor ve oyun (5 gün)", "Beş gün top oyunları, tırmanma ve geziler, öğle yemeği dahil.", "Bakım 9–15 arası. Fiyat 5 günün tamamı içindir. Kardeş indirimi talep üzerine."],
    uk: ["Табір на канікулах: спорт і ігри (5 днів)", "П'ять днів ігор з м'ячем, скелелазіння та екскурсій, з обідом.", "Нагляд з 9 до 15. Ціна за всі 5 днів. Знижка для братів і сестер за запитом."],
    pl: ["Obóz feryjny: sport i zabawa (5 dni)", "Pięć dni gier z piłką, wspinaczki i wycieczek, z obiadem.", "Opieka 9–15. Cena za wszystkie 5 dni. Zniżka dla rodzeństwa na zapytanie."],
    fr: ["Stage vacances : sport et jeux (5 jours)", "Cinq jours de jeux de ballon, d'escalade et de sorties, déjeuner compris.", "Encadrement de 9 h à 15 h. Prix pour les 5 jours. Réduction fratrie sur demande."],
    es: ["Campamento de vacaciones: deporte y juego (5 días)", "Cinco días de juegos de pelota, escalada y excursiones, con comida.", "Horario de 9 a 15 h. Precio por los 5 días. Descuento para hermanos bajo petición."],
    it: ["Campo vacanze: sport e gioco (5 giorni)", "Cinque giorni di giochi con la palla, arrampicata e gite, pranzo incluso.", "Assistenza dalle 9 alle 15. Prezzo per tutti i 5 giorni. Sconto fratelli su richiesta."],
  },
  a12: {
    ar: ["برمجة للفتيات", "برمجة أول ألعاب ومواقع إلكترونية خاصة بك.", "نشاط مدعوم ومجاني. الحواسيب المحمولة متوفرة، والأماكن محدودة."],
    tr: ["Kızlar için kodlama", "İlk kendi oyunlarını ve web sitelerini programla.", "Destekli ve ücretsiz. Dizüstü bilgisayarlar mevcut, kontenjan sınırlı."],
    uk: ["Програмування для дівчат", "Програмуй власні перші ігри та вебсайти.", "Безкоштовно завдяки фінансуванню. Ноутбуки є, кількість місць обмежена."],
    fr: ["Code pour les filles", "Programmer ses premiers jeux et sites web.", "Gratuit grâce à un financement. Ordinateurs fournis, places limitées."],
    es: ["Programación para chicas", "Programa tus primeros juegos y páginas web.", "Gratis gracias a una subvención. Portátiles disponibles, plazas limitadas."],
    it: ["Coding per ragazze", "Programma i tuoi primi giochi e siti web.", "Gratuito grazie a un finanziamento. Portatili disponibili, posti limitati."],
  },
  a13: {
    en: ["Beginner swimming course", "Getting used to water and first strokes.", "Course of 8 sessions, join in week 1. One parent waits at the poolside."],
    ar: ["دورة سباحة للمبتدئين", "التعوّد على الماء وأولى حركات السباحة.", "دورة من 8 حصص، تبدأ في الأسبوع الأول. ينتظر أحد الوالدين عند حافة المسبح."],
    tr: ["Başlangıç yüzme kursu", "Suya alışma ve ilk kulaçlar.", "8 derslik kurs, 1. haftada başlanır. Bir ebeveyn havuz kenarında bekler."],
    uk: ["Курс плавання для початківців", "Звикаємо до води та робимо перші гребки.", "Курс із 8 занять, початок у 1-й тиждень. Один із батьків чекає біля басейну."],
    pl: ["Kurs pływania dla początkujących", "Oswajanie z wodą i pierwsze ruchy pływackie.", "Kurs 8 zajęć, start w 1. tygodniu. Rodzic czeka przy basenie."],
    fr: ["Cours de natation débutants", "Se familiariser avec l'eau et premières brasses.", "Cours de 8 séances, début en semaine 1. Un parent attend au bord du bassin."],
  },
};

/** Cancellation texts for the demo listings, keyed by policy. */
export type DemoPolicy = "standard" | "noSignup" | "dropIn" | "camp";

export const DEMO_POLICIES: Record<DemoPolicy, Record<LanguageCode, string>> = {
  standard: {
    de: "Kostenlose Stornierung bis 24 Stunden vorher.",
    en: "Free cancellation up to 24 hours before.",
    ar: "إلغاء مجاني حتى 24 ساعة قبل الموعد.",
    tr: "24 saat öncesine kadar ücretsiz iptal.",
    uk: "Безкоштовне скасування до 24 годин до початку.",
    pl: "Bezpłatne anulowanie do 24 godzin wcześniej.",
    fr: "Annulation gratuite jusqu'à 24 heures avant.",
    es: "Cancelación gratuita hasta 24 horas antes.",
    it: "Cancellazione gratuita fino a 24 ore prima.",
  },
  noSignup: {
    de: "Keine Anmeldung nötig.",
    en: "No registration needed.",
    ar: "لا حاجة للتسجيل.",
    tr: "Kayıt gerekmez.",
    uk: "Реєстрація не потрібна.",
    pl: "Zapisy nie są potrzebne.",
    fr: "Aucune inscription nécessaire.",
    es: "No hace falta inscribirse.",
    it: "Non serve iscriversi.",
  },
  dropIn: {
    de: "Offener Treff, keine Anmeldung.",
    en: "Drop-in meetup, no registration.",
    ar: "لقاء مفتوح، بدون تسجيل.",
    tr: "Açık buluşma, kayıt yok.",
    uk: "Відкрита зустріч, без реєстрації.",
    pl: "Otwarte spotkanie, bez zapisów.",
    fr: "Rencontre libre, sans inscription.",
    es: "Encuentro abierto, sin inscripción.",
    it: "Incontro aperto, senza iscrizione.",
  },
  camp: {
    de: "Kostenlose Stornierung bis 14 Tage vor Beginn, danach 50 %.",
    en: "Free cancellation up to 14 days before the start, 50% after that.",
    ar: "إلغاء مجاني حتى 14 يومًا قبل البدء، وبعد ذلك 50٪.",
    tr: "Başlangıçtan 14 gün öncesine kadar ücretsiz iptal, sonrasında %50.",
    uk: "Безкоштовне скасування до 14 днів до початку, після цього — 50 %.",
    pl: "Bezpłatne anulowanie do 14 dni przed rozpoczęciem, później 50%.",
    fr: "Annulation gratuite jusqu'à 14 jours avant le début, ensuite 50 %.",
    es: "Cancelación gratuita hasta 14 días antes del inicio; después, 50 %.",
    it: "Cancellazione gratuita fino a 14 giorni prima dell'inizio, poi 50%.",
  },
};
