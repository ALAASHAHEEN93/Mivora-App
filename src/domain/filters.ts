import type { Activity, AccessibilityTag, CategorySlug, LanguageCode, Session, Setting } from "./types";
import { berlinDate, dateRange, type DateRangeKey } from "./time";

export interface ActivityFilters {
  q?: string;
  date?: DateRangeKey;
  /** A single Berlin calendar day "YYYY-MM-DD" (week strip). Takes precedence over `date`. */
  day?: string;
  /** Berlin calendar days "YYYY-MM-DD", inclusive (holiday windows). Takes precedence over `date`. */
  between?: { from: string; to: string };
  /** Child age in years; activity must include it. */
  age?: number;
  district?: string;
  category?: CategorySlug;
  /** Max price in cents; 0 = free only. */
  maxPriceCents?: number;
  language?: LanguageCode;
  setting?: Exclude<Setting, "both">;
  accessibility?: AccessibilityTag;
}

/**
 * A listing is visible only when published, not expired, and it has at least one
 * scheduled session starting in the future. This is the core freshness rule.
 */
export function upcomingSessions(activity: Activity, now: Date): Session[] {
  if (activity.status !== "published") return [];
  if (new Date(activity.expiresAt) <= now) return [];
  return activity.sessions
    .filter((s) => s.status !== "cancelled" && new Date(s.startsAt) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function matchesText(activity: Activity, q: string): boolean {
  const needle = q.trim().toLocaleLowerCase("de");
  if (!needle) return true;
  const haystack = [
    activity.provider.name,
    activity.venue.district,
    ...Object.values(activity.content).flatMap((c) => (c ? [c.title, c.summary] : [])),
  ]
    .join(" ")
    .toLocaleLowerCase("de");
  return haystack.includes(needle);
}

export interface ActivityResult {
  activity: Activity;
  /** Upcoming sessions that match the date filter, soonest first. */
  sessions: Session[];
}

export function searchActivities(
  activities: Activity[],
  filters: ActivityFilters,
  now: Date,
): ActivityResult[] {
  const range = filters.day
    ? { from: filters.day, to: filters.day }
    : filters.between
      ? filters.between
      : filters.date
      ? dateRange(filters.date, now)
      : null;

  const results: ActivityResult[] = [];
  for (const activity of activities) {
    let sessions = upcomingSessions(activity, now);
    if (range) {
      sessions = sessions.filter((s) => {
        const d = berlinDate(new Date(s.startsAt));
        return d >= range.from && d <= range.to;
      });
    }
    if (sessions.length === 0) continue;

    if (filters.q && !matchesText(activity, filters.q)) continue;
    if (filters.age !== undefined && (filters.age < activity.ageMin || filters.age > activity.ageMax)) continue;
    if (filters.district && activity.venue.district !== filters.district) continue;
    if (filters.category && !activity.categories.includes(filters.category)) continue;
    if (filters.maxPriceCents !== undefined) {
      const cents = activity.price.kind === "free" ? 0 : (activity.price.amountCents ?? Infinity);
      if (cents > filters.maxPriceCents) continue;
    }
    if (filters.language && !activity.languages.includes(filters.language)) continue;
    if (filters.setting && activity.setting !== filters.setting && activity.setting !== "both") continue;
    if (filters.accessibility && !activity.accessibility.includes(filters.accessibility)) continue;

    results.push({ activity, sessions });
  }

  return results.sort((a, b) => a.sessions[0]!.startsAt.localeCompare(b.sessions[0]!.startsAt));
}
