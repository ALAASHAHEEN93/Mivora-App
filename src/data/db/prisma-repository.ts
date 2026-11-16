import "server-only";
import type { ActivityRepository } from "../repository";
import { searchActivities, upcomingSessions, type ActivityFilters } from "@/domain/filters";
import { getPrisma } from "./client";
import { toDomain } from "./mapping";

/**
 * PostgreSQL-backed catalogue. The database only returns published, non-expired
 * listings with their non-cancelled future sessions; the detailed filters (age, date,
 * category …) then run through the same tested domain functions as the demo data.
 * Fine for a single-city catalogue; move filters into SQL once listings grow into the thousands.
 */
export class PrismaActivityRepository implements ActivityRepository {
  private async visible(now: Date) {
    const rows = await getPrisma().activity.findMany({
      where: { status: "published", expiresAt: { gt: now } },
      include: {
        provider: true,
        venue: true,
        translations: true,
        sessions: { where: { startsAt: { gte: now }, status: { not: "cancelled" } }, orderBy: { startsAt: "asc" } },
      },
    });
    return rows.map(toDomain);
  }

  async search(filters: ActivityFilters, now = new Date()) {
    return searchActivities(await this.visible(now), filters, now);
  }

  async findVisibleBySlug(slug: string, now = new Date()) {
    const activity = (await this.visible(now)).find((a) => a.slug === slug);
    if (!activity) return null;
    const sessions = upcomingSessions(activity, now);
    return sessions.length ? { activity, sessions } : null;
  }

  async allPublished(now = new Date()) {
    return this.visible(now);
  }

  async districts() {
    const venues = await getPrisma().venue.findMany({
      where: { activities: { some: { status: "published" } } },
      select: { district: true },
      distinct: ["district"],
    });
    return venues.map((v) => v.district).sort((a, b) => a.localeCompare(b, "de"));
  }
}
