/**
 * German cities offered in the city picker (the 20 largest by population).
 * Only cities with `live: true` have listings; the others show a "coming soon" note.
 */
export const CITIES = [
  { slug: "berlin", live: false, names: { de: "Berlin", ar: "برلين", uk: "Берлін" } },
  { slug: "hamburg", live: false, names: { de: "Hamburg", ar: "هامبورغ", uk: "Гамбург" } },
  { slug: "muenchen", live: false, names: { de: "München", en: "Munich", fr: "Munich", es: "Múnich", it: "Monaco di Baviera", pl: "Monachium", tr: "Münih", ar: "ميونخ", uk: "Мюнхен" } },
  { slug: "koeln", live: true, names: { de: "Köln", en: "Cologne", fr: "Cologne", es: "Colonia", it: "Colonia", pl: "Kolonia", tr: "Köln", ar: "كولونيا", uk: "Кельн" } },
  { slug: "frankfurt", live: false, names: { de: "Frankfurt am Main", fr: "Francfort-sur-le-Main", es: "Fráncfort del Meno", it: "Francoforte sul Meno", pl: "Frankfurt nad Menem", ar: "فرانكفورت", uk: "Франкфурт-на-Майні" } },
  { slug: "stuttgart", live: false, names: { de: "Stuttgart", ar: "شتوتغارت", uk: "Штутгарт" } },
  { slug: "duesseldorf", live: false, names: { de: "Düsseldorf", ar: "دوسلدورف", uk: "Дюссельдорф" } },
  { slug: "leipzig", live: false, names: { de: "Leipzig", es: "Leipzig", it: "Lipsia", pl: "Lipsk", ar: "لايبزيغ", uk: "Лейпциг" } },
  { slug: "dortmund", live: false, names: { de: "Dortmund", ar: "دورتموند", uk: "Дортмунд" } },
  { slug: "essen", live: false, names: { de: "Essen", ar: "إسن", uk: "Ессен" } },
  { slug: "bremen", live: false, names: { de: "Bremen", es: "Bremen", it: "Brema", pl: "Brema", ar: "بريمن", uk: "Бремен" } },
  { slug: "dresden", live: false, names: { de: "Dresden", fr: "Dresde", es: "Dresde", it: "Dresda", pl: "Drezno", ar: "دريسدن", uk: "Дрезден" } },
  { slug: "hannover", live: false, names: { de: "Hannover", en: "Hanover", fr: "Hanovre", es: "Hannover", it: "Hannover", pl: "Hanower", ar: "هانوفر", uk: "Ганновер" } },
  { slug: "nuernberg", live: false, names: { de: "Nürnberg", en: "Nuremberg", fr: "Nuremberg", es: "Núremberg", it: "Norimberga", pl: "Norymberga", ar: "نورنبيرغ", uk: "Нюрнберг" } },
  { slug: "duisburg", live: false, names: { de: "Duisburg", ar: "دويسبورغ", uk: "Дуйсбург" } },
  { slug: "bochum", live: false, names: { de: "Bochum", ar: "بوخوم", uk: "Бохум" } },
  { slug: "wuppertal", live: false, names: { de: "Wuppertal", ar: "فوبرتال", uk: "Вупперталь" } },
  { slug: "bielefeld", live: false, names: { de: "Bielefeld", ar: "بيليفيلد", uk: "Білефельд" } },
  { slug: "bonn", live: false, names: { de: "Bonn", ar: "بون", uk: "Бонн" } },
  { slug: "muenster", live: false, names: { de: "Münster", ar: "مونستر", uk: "Мюнстер" } },
] as const satisfies readonly { slug: string; live: boolean; names: { de: string } & Partial<Record<string, string>> }[];

export type CitySlug = (typeof CITIES)[number]["slug"];
export const CITY_COOKIE = "mv_city";

export function findCity(slug: string | undefined | null) {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

/** City name in the UI language; falls back to the German name. */
export function cityName(slug: string, locale: string): string {
  const city = findCity(slug);
  if (!city) return slug;
  const names = city.names as Partial<Record<string, string>>;
  return names[locale] ?? city.names.de;
}

/** Cities sorted by their name in the UI language. */
export function citiesForLocale(locale: string) {
  return [...CITIES]
    .map((c) => ({ slug: c.slug, live: c.live, name: cityName(c.slug, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
