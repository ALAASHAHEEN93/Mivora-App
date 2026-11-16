/**
 * DEMO DATA — fictional providers and offers, for development only.
 * Districts are real Köln Stadtteile; providers, addresses and prices are invented.
 * Session dates are generated relative to "now" so the demo never goes stale.
 */
import type { Activity, LocalizedText, LanguageCode, Session } from "@/domain/types";
import { addDays, berlinDate, weekday, TIME_ZONE } from "@/domain/time";
import { DEMO_POLICIES, DEMO_TRANSLATIONS, type DemoPolicy } from "./demo-translations";

const POLICY_BY_ID: Record<string, DemoPolicy> = { a4: "noSignup", a5: "dropIn", a11: "camp" };

/** Adds the drafted translations and localized cancellation texts to a demo listing. */
function withTranslations(activity: Activity): Activity {
  const content = { ...activity.content };
  for (const [lang, triple] of Object.entries(DEMO_TRANSLATIONS[activity.id] ?? {})) {
    const code = lang as LanguageCode;
    if (!content[code] && triple) content[code] = text(...triple);
  }
  const policy = DEMO_POLICIES[POLICY_BY_ID[activity.id] ?? "standard"];
  for (const code of Object.keys(content) as LanguageCode[]) {
    const c = content[code];
    if (c) content[code] = { ...c, cancellation: policy[code] };
  }
  return { ...activity, content };
}

/** "+01:00" / "+02:00" for a Berlin calendar date (DST-aware). */
function berlinOffset(isoDate: string): string {
  const probe = new Date(`${isoDate}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value; // "GMT+01:00"
  return name?.replace("GMT", "") || "+01:00";
}

function at(isoDate: string, time: string): string {
  return `${isoDate}T${time}:00${berlinOffset(isoDate)}`;
}

/** Next date (including today) with the given weekday (0=Sun). */
function nextWeekday(today: string, wd: number): string {
  return addDays(today, (wd - weekday(today) + 7) % 7);
}

function weekly(id: string, today: string, wd: number, start: string, end: string, weeks = 4): Session[] {
  const first = nextWeekday(today, wd);
  return Array.from({ length: weeks }, (_, i) => {
    const d = addDays(first, i * 7);
    return { id: `${id}-${i}`, startsAt: at(d, start), endsAt: at(d, end), status: "scheduled" as const };
  });
}

const venue = (district: string, lat: number, lng: number, name: string) => ({
  name,
  street: "Demostraße 1",
  postalCode: "50000",
  city: "Köln",
  district,
  lat,
  lng,
});

const text = (title: string, summary: string, description: string): LocalizedText => ({ title, summary, description });

const DEMO_SOURCE = { type: "demo" as const, reference: "Demo-Daten – kein echtes Angebot" };
const CANCEL_STD = "Kostenlose Stornierung bis 24 Stunden vorher. (Demo-Text)";

export function buildDemoActivities(now: Date = new Date()): Activity[] {
  const today = berlinDate(now);
  const verifiedAt = `${addDays(today, -5)}T09:00:00Z`;
  const expires = `${addDays(today, 60)}T00:00:00Z`;

  const base = {
    status: "published" as const,
    accessibility: [],
    accessibilitySource: "provider" as const,
    bookingMode: "external_link" as const,
    cancellationPolicy: CANCEL_STD,
    originalLocale: "de" as LanguageCode,
    source: DEMO_SOURCE,
    lastVerifiedAt: verifiedAt,
    expiresAt: expires,
  };

  const campStart = nextWeekday(addDays(today, 21), 1); // a Monday ~3 weeks ahead
  const campSessions: Session[] = Array.from({ length: 5 }, (_, i) => {
    const d = addDays(campStart, i);
    return { id: `camp-${i}`, startsAt: at(d, "09:00"), endsAt: at(d, "15:00"), status: "scheduled" };
  });

  const list: Activity[] = [
    {
      ...base,
      id: "a1",
      slug: "familien-yoga-ehrenfeld",
      categories: ["sports"],
      ageMin: 3,
      ageMax: 6,
      price: { kind: "paid", amountCents: 800, unit: "perChild" },
      languages: ["de", "en"],
      setting: "indoor",
      accessibility: ["stroller"],
      externalUrl: "https://example.org/demo/yoga",
      content: {
        de: text("Familien-Yoga am Samstag", "Spielerisches Yoga für Kinder mit einem Elternteil.", "Atmen, strecken, Tiere nachmachen: 45 Minuten Bewegung für Kleine und Große. Matten sind vorhanden."),
        en: text("Family yoga on Saturdays", "Playful yoga for children with one parent.", "Breathe, stretch, pretend to be animals: 45 minutes of movement for little ones and grown-ups. Mats provided."),
      },
      provider: { id: "p1", name: "Yogastudio Sonnengruß (Demo)", verified: true },
      venue: venue("Ehrenfeld", 50.9497, 6.9133, "Studio Sonnengruß"),
      sessions: weekly("a1", today, 6, "10:00", "10:45"),
      accent: "lavender",
    },
    {
      ...base,
      id: "a2",
      slug: "toepfern-fuer-kids",
      categories: ["arts"],
      ageMin: 6,
      ageMax: 12,
      price: { kind: "paid", amountCents: 1500, unit: "perChild" },
      languages: ["de"],
      setting: "indoor",
      content: {
        de: text("Töpfern für Kids", "Schalen, Tiere, Fantasiefiguren aus Ton.", "Kleine Gruppe mit max. 8 Kindern. Die Werke werden gebrannt und können eine Woche später abgeholt werden."),
        en: text("Pottery for kids", "Bowls, animals and fantasy figures made of clay.", "Small group of max. 8 children. Pieces are fired and can be collected a week later."),
      },
      provider: { id: "p2", name: "Tonwerkstatt Klecks (Demo)", verified: true },
      venue: venue("Ehrenfeld", 50.9521, 6.9172, "Tonwerkstatt Klecks"),
      sessions: [...weekly("a2w", today, 3, "16:00", "17:30"), ...weekly("a2s", today, 6, "11:00", "12:30")],
      accent: "coral",
    },
    {
      ...base,
      id: "a3",
      slug: "robotik-werkstatt",
      categories: ["stem"],
      ageMin: 8,
      ageMax: 13,
      price: { kind: "paid", amountCents: 1800, unit: "perChild" },
      languages: ["de", "en"],
      setting: "indoor",
      accessibility: ["wheelchair"],
      accessibilitySource: "verified",
      content: {
        de: text("Robotik-Werkstatt: Bauen & Programmieren", "Roboter mit Sensoren bauen und zum Laufen bringen.", "Keine Vorkenntnisse nötig. Laptops und Bausätze werden gestellt."),
        en: text("Robotics workshop: build & code", "Build robots with sensors and make them move.", "No experience needed. Laptops and kits are provided."),
      },
      provider: { id: "p3", name: "MINT-Labor Kalk (Demo)", verified: true },
      venue: venue("Kalk", 50.9406, 7.0001, "MINT-Labor"),
      sessions: weekly("a3", today, 6, "14:00", "16:00"),
      accent: "teal",
    },
    {
      ...base,
      id: "a4",
      slug: "mehrsprachige-vorlesestunde",
      categories: ["theatre"],
      ageMin: 3,
      ageMax: 7,
      price: { kind: "free" },
      languages: ["de", "ar", "tr"],
      setting: "indoor",
      accessibility: ["wheelchair", "stroller"],
      bookingMode: "inquiry",
      cancellationPolicy: "Keine Anmeldung nötig. (Demo-Text)",
      content: {
        de: text("Mehrsprachige Vorlesestunde", "Bilderbücher auf Deutsch, Arabisch und Türkisch.", "Jede Woche ein Buch in drei Sprachen, danach Malen. Eltern und Geschwister sind willkommen."),
        ar: text("ساعة قراءة متعددة اللغات", "كتب مصورة بالألمانية والعربية والتركية.", "كل أسبوع كتاب بثلاث لغات، ثم رسم وتلوين. الأهل والإخوة مرحب بهم."),
        tr: text("Çok dilli okuma saati", "Almanca, Arapça ve Türkçe resimli kitaplar.", "Her hafta üç dilde bir kitap, ardından boyama. Ebeveynler ve kardeşler davetlidir."),
      },
      provider: { id: "p4", name: "Familientreff Kalk (Demo)", verified: false },
      venue: venue("Kalk", 50.9381, 6.9964, "Familientreff"),
      sessions: weekly("a4", today, 4, "16:00", "17:00"),
      accent: "sunshine",
    },
    {
      ...base,
      id: "a5",
      slug: "krabbelgruppe-nippes",
      categories: ["baby"],
      ageMin: 0,
      ageMax: 2,
      price: { kind: "free" },
      languages: ["de", "uk"],
      setting: "indoor",
      accessibility: ["stroller"],
      bookingMode: "inquiry",
      cancellationPolicy: "Offener Treff, keine Anmeldung. (Demo-Text)",
      content: {
        de: text("Krabbelgruppe Nippes", "Offener Treff für Babys, Kleinkinder und Eltern.", "Spielen, singen, Kaffee trinken. Ukrainischsprachige Begleitung vor Ort."),
        uk: text("Група для малюків у Ніппесі", "Відкриті зустрічі для немовлят, малюків і батьків.", "Граємо, співаємо, п'ємо каву. На місці є україномовний супровід."),
      },
      provider: { id: "p5", name: "Elterncafé Nippes (Demo)", verified: true },
      venue: venue("Nippes", 50.9658, 6.9535, "Elterncafé"),
      sessions: weekly("a5", today, 2, "10:00", "11:30"),
      accent: "lavender",
    },
    {
      ...base,
      id: "a6",
      slug: "kindertheater-kleiner-drache",
      categories: ["theatre"],
      ageMin: 4,
      ageMax: 9,
      price: { kind: "paid", amountCents: 900, unit: "perChild" },
      languages: ["de"],
      setting: "indoor",
      accessibility: ["wheelchair"],
      content: {
        de: text("Kindertheater: Der kleine Drache", "Ein Drache, der kein Feuer spucken kann.", "Puppentheater, ca. 50 Minuten. Erwachsene zahlen ebenfalls den Kinderpreis."),
        en: text("Children's theatre: The Little Dragon", "A dragon who can't breathe fire.", "Puppet show, approx. 50 minutes. Adults pay the child price too."),
      },
      provider: { id: "p6", name: "Puppenbühne Südstadt (Demo)", verified: true },
      venue: venue("Neustadt-Süd", 50.9256, 6.9531, "Puppenbühne"),
      sessions: weekly("a6", today, 0, "15:00", "15:50"),
      accent: "coral",
    },
    {
      ...base,
      id: "a7",
      slug: "naturforscher-stadtwald",
      categories: ["outdoors"],
      ageMin: 6,
      ageMax: 11,
      price: { kind: "free" },
      languages: ["de", "en"],
      setting: "outdoor",
      bookingMode: "inquiry",
      content: {
        de: text("Naturforscher im Stadtwald", "Spuren lesen, Blätter bestimmen, Tiere beobachten.", "Bitte wetterfeste Kleidung mitbringen. Findet bei Regen statt."),
        en: text("Nature explorers in the city forest", "Track reading, leaf spotting, animal watching.", "Please bring weatherproof clothes. Takes place in the rain."),
      },
      provider: { id: "p7", name: "Naturschule Lindenthal (Demo)", verified: false },
      venue: venue("Lindenthal", 50.9334, 6.8945, "Treffpunkt Waldeingang"),
      sessions: weekly("a7", today, 6, "10:30", "12:30"),
      accent: "teal",
    },
    {
      ...base,
      id: "a8",
      slug: "hip-hop-teens-muelheim",
      categories: ["dance"],
      ageMin: 12,
      ageMax: 17,
      price: { kind: "paid", amountCents: 1200, unit: "perSession" },
      languages: ["de", "tr"],
      setting: "indoor",
      content: {
        de: text("Hip-Hop für Teens", "Choreos, Battles und Musik für 12- bis 17-Jährige.", "Probestunde jederzeit möglich. Bequeme Kleidung und Hallenschuhe mitbringen."),
        tr: text("Gençler için Hip-Hop", "12–17 yaş için koreografi, battle ve müzik.", "Deneme dersi her zaman mümkün. Rahat kıyafet ve salon ayakkabısı getirin."),
      },
      provider: { id: "p8", name: "Tanzhaus Mülheim (Demo)", verified: true },
      venue: venue("Mülheim", 50.9619, 7.0067, "Tanzhaus"),
      sessions: weekly("a8", today, 5, "17:30", "19:00"),
      accent: "lavender",
    },
    {
      ...base,
      id: "a9",
      slug: "trommel-workshop",
      categories: ["music"],
      ageMin: 5,
      ageMax: 10,
      price: { kind: "paid", amountCents: 1000, unit: "perChild" },
      languages: ["de", "fr"],
      setting: "indoor",
      content: {
        de: text("Trommel-Workshop", "Rhythmen aus aller Welt auf echten Trommeln.", "Instrumente werden gestellt. Gehörschutz für Kleine liegt bereit."),
        fr: text("Atelier de percussions", "Des rythmes du monde entier sur de vraies percussions.", "Instruments fournis. Protections auditives disponibles pour les petits."),
      },
      provider: { id: "p9", name: "Rhythmusraum Ehrenfeld (Demo)", verified: false },
      venue: venue("Ehrenfeld", 50.9483, 6.9204, "Rhythmusraum"),
      sessions: weekly("a9", today, 0, "11:00", "12:00"),
      accent: "sunshine",
    },
    {
      ...base,
      id: "a10",
      slug: "museums-rallye-familien",
      categories: ["museum"],
      ageMin: 6,
      ageMax: 12,
      price: { kind: "paid", amountCents: 600, unit: "perFamily" },
      languages: ["de", "en"],
      setting: "indoor",
      accessibility: ["wheelchair", "stroller", "signLanguage"],
      accessibilitySource: "verified",
      content: {
        de: text("Museums-Rallye für Familien", "Mit Rätselbogen auf Entdeckungstour durchs Museum.", "Einmal im Monat mit Gebärdensprachdolmetschung. Rätselbogen gibt es an der Kasse."),
        en: text("Family museum rally", "Explore the museum with a puzzle sheet.", "Once a month with sign-language interpretation. Puzzle sheets available at the desk."),
      },
      provider: { id: "p10", name: "Stadtmuseum Beispiel (Demo)", verified: true },
      venue: venue("Altstadt-Nord", 50.9413, 6.9583, "Museum Beispiel"),
      sessions: weekly("a10", today, 0, "14:00", "16:00"),
      accent: "teal",
    },
    {
      ...base,
      id: "a11",
      slug: "ferien-camp-sport-spiel",
      categories: ["holidayCamp", "sports"],
      ageMin: 6,
      ageMax: 12,
      price: { kind: "paid", amountCents: 18900, unit: "perChild" },
      languages: ["de", "en"],
      setting: "both",
      cancellationPolicy: "Kostenlose Stornierung bis 14 Tage vor Beginn, danach 50 %. (Demo-Text)",
      content: {
        de: text("Ferien-Camp: Sport & Spiel (5 Tage)", "Fünf Tage Ballspiele, Klettern und Ausflüge, inkl. Mittagessen.", "Betreuung 9–15 Uhr. Preis gilt für alle 5 Tage. Geschwisterrabatt auf Anfrage."),
        en: text("Holiday camp: sports & games (5 days)", "Five days of ball games, climbing and trips, lunch included.", "Supervision 9am–3pm. Price covers all 5 days. Sibling discount on request."),
      },
      provider: { id: "p11", name: "Sportverein Beispiel Kalk e.V. (Demo)", verified: true },
      venue: venue("Kalk", 50.9363, 7.0087, "Sporthalle Beispiel"),
      sessions: campSessions,
      accent: "coral",
    },
    {
      ...base,
      id: "a12",
      slug: "coding-fuer-maedchen",
      categories: ["stem"],
      ageMin: 10,
      ageMax: 14,
      price: { kind: "free" },
      languages: ["de", "en", "pl"],
      setting: "indoor",
      accessibility: ["wheelchair"],
      bookingMode: "inquiry",
      content: {
        de: text("Coding für Mädchen", "Erste eigene Spiele und Websites programmieren.", "Gefördertes Angebot, kostenlos. Laptops vorhanden, Plätze begrenzt."),
        en: text("Coding for girls", "Program your first games and websites.", "Funded and free. Laptops available, limited places."),
        pl: text("Programowanie dla dziewczyn", "Pierwsze własne gry i strony internetowe.", "Bezpłatne. Laptopy na miejscu, liczba miejsc ograniczona."),
      },
      provider: { id: "p3", name: "MINT-Labor Kalk (Demo)", verified: true },
      venue: venue("Kalk", 50.9406, 7.0001, "MINT-Labor"),
      sessions: weekly("a12", today, 3, "17:00", "18:30"),
      accent: "teal",
    },
    {
      ...base,
      id: "a13",
      slug: "seepferdchen-schwimmkurs",
      categories: ["sports"],
      ageMin: 5,
      ageMax: 8,
      price: { kind: "paid", amountCents: 1500, unit: "perSession" },
      languages: ["de", "es", "it"],
      setting: "indoor",
      content: {
        de: text("Schwimmkurs Seepferdchen", "Wassergewöhnung und erste Schwimmzüge.", "Kurs über 8 Termine, Einstieg in Woche 1. Ein Elternteil wartet am Beckenrand."),
        es: text("Curso de natación para principiantes", "Familiarización con el agua y primeras brazadas.", "Curso de 8 sesiones. Un adulto espera junto a la piscina."),
        it: text("Corso di nuoto per principianti", "Ambientamento in acqua e prime bracciate.", "Corso di 8 lezioni. Un genitore attende a bordo vasca."),
      },
      provider: { id: "p12", name: "Schwimmschule Delfin Porz (Demo)", verified: true },
      venue: venue("Porz", 50.8794, 7.0559, "Hallenbad Beispiel"),
      sessions: weekly("a13", today, 1, "16:00", "16:45"),
      accent: "sunshine",
    },
    // Hidden on purpose: expired listing (tests the freshness rule).
    {
      ...base,
      id: "a14",
      slug: "abgelaufenes-sommerfest",
      categories: ["outdoors"],
      ageMin: 0,
      ageMax: 17,
      price: { kind: "free" },
      languages: ["de"],
      setting: "outdoor",
      expiresAt: `${addDays(today, -1)}T00:00:00Z`,
      content: { de: text("Sommerfest (abgelaufen)", "Sollte nie angezeigt werden.", "Demo für Ablauf-Logik.") },
      provider: { id: "p7", name: "Naturschule Lindenthal (Demo)", verified: false },
      venue: venue("Lindenthal", 50.9334, 6.8945, "Wiese"),
      sessions: weekly("a14", today, 6, "12:00", "18:00"),
      accent: "sunshine",
    },
    // Hidden on purpose: draft listing.
    {
      ...base,
      id: "a15",
      slug: "entwurf-malkurs",
      status: "draft",
      categories: ["arts"],
      ageMin: 4,
      ageMax: 8,
      price: { kind: "paid", amountCents: 1000, unit: "perChild" },
      languages: ["de"],
      setting: "indoor",
      content: { de: text("Malkurs (Entwurf)", "Nicht veröffentlicht.", "Demo für Status-Logik.") },
      provider: { id: "p2", name: "Tonwerkstatt Klecks (Demo)", verified: true },
      venue: venue("Ehrenfeld", 50.9521, 6.9172, "Tonwerkstatt Klecks"),
      sessions: weekly("a15", today, 2, "15:00", "16:00"),
      accent: "coral",
    },
  ];
  return list.map(withTranslations);
}
