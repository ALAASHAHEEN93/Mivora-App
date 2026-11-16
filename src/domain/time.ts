/** All calendar logic is evaluated in Köln local time, regardless of server timezone. */
export const TIME_ZONE = "Europe/Berlin";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date in Berlin as "YYYY-MM-DD". */
export function berlinDate(d: Date): string {
  return dateFmt.format(d);
}

/** Add whole days to a "YYYY-MM-DD" string (pure calendar arithmetic). */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a "YYYY-MM-DD" date. */
export function weekday(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export type DateRangeKey = "today" | "tomorrow" | "weekend" | "week" | "all";

/** Inclusive range of Berlin calendar dates for a date chip. `null` = no restriction. */
export function dateRange(key: DateRangeKey, now: Date): { from: string; to: string } | null {
  const today = berlinDate(now);
  switch (key) {
    case "today":
      return { from: today, to: today };
    case "tomorrow": {
      const t = addDays(today, 1);
      return { from: t, to: t };
    }
    case "weekend": {
      const wd = weekday(today);
      if (wd === 6) return { from: today, to: addDays(today, 1) };
      if (wd === 0) return { from: today, to: today };
      const sat = addDays(today, 6 - wd);
      return { from: sat, to: addDays(sat, 1) };
    }
    case "week":
      return { from: today, to: addDays(today, 6) };
    case "all":
      return null;
  }
}
