import type { PrismaClient } from "@/generated/prisma/client";
import type { Activity } from "@/domain/types";
import { toDomain } from "./mapping";

/**
 * Published, non-expired listings with their non-cancelled future sessions. Shared by the
 * app's catalogue and the daily email jobs (which run outside Next, so no "server-only").
 */
export async function findVisibleActivities(db: PrismaClient, now: Date): Promise<Activity[]> {
  const rows = await db.activity.findMany({
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
