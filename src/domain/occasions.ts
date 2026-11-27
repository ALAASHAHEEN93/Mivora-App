import { addDays } from "./time";

/**
 * Holidays and school breaks we suggest activities for (F-ACC-04). Dates are Berlin
 * calendar days "YYYY-MM-DD". Each occasion has a suggestion window: the days whose
 * activities fit it (e.g. lantern walks in the days before St. Martin).
 */
export const HOLIDAY_IDS = ["carnival", "easter", "halloween", "stMartin", "nikolaus", "christmas"] as const;
export const SCHOOL_BREAK_IDS = ["easterBreak", "summerBreak", "autumnBreak", "christmasBreak"] as const;
export type OccasionId = (typeof HOLIDAY_IDS)[number] | (typeof SCHOOL_BREAK_IDS)[number];

export interface Occasion {
  id: OccasionId;
  /** First and last day of the suggestion window (inclusive). */
  from: string;
  to: string;
  /** Unique per occurrence, e.g. "christmas:2026-12-18". Used so a family gets it once. */
  key: string;
}

/** How many days before an occasion the email goes out. */
export const LEAD_DAYS = 7;

/**
 * NRW school holidays. Fill in from the official list of the NRW school ministry
 * (Ferienordnung NRW); never guess dates. Without entries, only holidays are announced.
 */
export const NRW_SCHOOL_BREAKS: readonly { id: (typeof SCHOOL_BREAK_IDS)[number]; from: string; to: string }[] = [];

/** Easter Sunday (Gregorian calendar, anonymous algorithm by Meeus/Jones/Butcher). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function occasion(id: OccasionId, from: string, to: string): Occasion {
  return { id, from, to, key: `${id}:${from}` };
}

/** Holidays of one calendar year plus the school breaks that start in it, by start date. */
export function occasionsForYear(year: number, breaks = NRW_SCHOOL_BREAKS): Occasion[] {
  const easter = easterSunday(year);
  const list = [
    // Weiberfastnacht (Thursday) to Rosenmontag: the Köln street carnival days.
    occasion("carnival", addDays(easter, -52), addDays(easter, -48)),
    // Good Friday to Easter Monday.
    occasion("easter", addDays(easter, -2), addDays(easter, 1)),
    occasion("halloween", `${year}-10-25`, `${year}-10-31`),
    // Lantern walks happen in the days up to 11 November.
    occasion("stMartin", `${year}-11-05`, `${year}-11-11`),
    occasion("nikolaus", `${year}-12-01`, `${year}-12-06`),
    // Christmas plays, markets and workshops in the last days before Christmas, and the holidays.
    occasion("christmas", `${year}-12-18`, `${year}-12-26`),
    ...breaks.filter((b) => b.from.startsWith(`${year}-`)).map((b) => occasion(b.id, b.from, b.to)),
  ];
  return list.sort((x, y) => x.from.localeCompare(y.from));
}

/**
 * Occasions to announce on `today`: those starting within the next LEAD_DAYS days.
 * The whole lead window counts (not one exact day), so a missed job run still sends.
 */
export function dueOccasions(today: string, breaks = NRW_SCHOOL_BREAKS): Occasion[] {
  const year = Number(today.slice(0, 4));
  return [...occasionsForYear(year, breaks), ...occasionsForYear(year + 1, breaks)].filter(
    (o) => o.from > today && addDays(o.from, -LEAD_DAYS) <= today,
  );
}
