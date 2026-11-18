import { addDays, berlinDate, TIME_ZONE } from "@/domain/time";

/**
 * Rain outlook for Köln from the Deutscher Wetterdienst (open data), via the free Bright Sky API.
 * Only fixed city coordinates are sent; nothing about the visitor. Any failure → null (no banner).
 */
const KOELN = { lat: 50.94, lon: 6.96 };
const RAINY = new Set(["rain", "sleet", "snow", "hail", "thunderstorm"]);

export type HourlyWeather = {
  timestamp: string;
  condition?: string | null;
  precipitation?: number | null;
  precipitation_probability?: number | null;
};

/** A day counts as rainy when at least 3 daytime hours (9–18 h) are wet or likely wet. */
export function isRainyDay(hours: HourlyWeather[]): boolean {
  const wet = hours.filter((h) => {
    const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(new Date(h.timestamp)));
    if (hour < 9 || hour > 18) return false;
    return (h.condition != null && RAINY.has(h.condition)) || (h.precipitation ?? 0) >= 0.3 || (h.precipitation_probability ?? 0) >= 60;
  });
  return wet.length >= 3;
}

/** Which day the tip is about: today until 15:00, after that tomorrow. */
export function outlookDay(now: Date): { day: string; when: "today" | "tomorrow" } {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  const today = berlinDate(now);
  return hour < 15 ? { day: today, when: "today" } : { day: addDays(today, 1), when: "tomorrow" };
}

export async function rainOutlook(now = new Date()): Promise<{ day: string; when: "today" | "tomorrow" } | null> {
  if (process.env.WEATHER_DISABLED === "1") return null;
  const target = outlookDay(now);
  const url = `https://api.brightsky.dev/weather?lat=${KOELN.lat}&lon=${KOELN.lon}&date=${target.day}&last_date=${addDays(target.day, 1)}&tz=${encodeURIComponent(TIME_ZONE)}`;
  try {
    // Cached on the server for 30 minutes: one request serves every visitor.
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = (await res.json()) as { weather?: HourlyWeather[] };
    const hours = (data.weather ?? []).filter((h) => berlinDate(new Date(h.timestamp)) === target.day);
    return isRainyDay(hours) ? target : null;
  } catch {
    return null;
  }
}
