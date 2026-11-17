import type { PrismaClient } from "@/generated/prisma/client";
import { isAdmin } from "./listings";

export const REPORT_REASONS = ["wrongInfo", "cancelled", "inappropriate", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
const HOUR = 60 * 60 * 1000;

type Actor = { id: string; email: string };

/**
 * Saves a "report a problem" for a published listing. Anyone may report (signed in or not);
 * limits stop flooding: 3 per signed-in parent per listing per day, 20 per listing per hour overall.
 */
export async function createReport(
  db: PrismaClient,
  input: { activityId: string; reason: unknown; message: unknown; reporterId: string | null },
  now = new Date(),
): Promise<{ ok: true } | { ok: false; reason: "invalid" | "limit" }> {
  const reason = REPORT_REASONS.find((r) => r === input.reason);
  if (!reason) return { ok: false, reason: "invalid" };
  const message =
    typeof input.message === "string" ? input.message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 500) || null : null;
  if (reason === "other" && !message) return { ok: false, reason: "invalid" };

  const activity = await db.activity.findFirst({ where: { id: input.activityId, status: "published" }, select: { id: true } });
  if (!activity) return { ok: false, reason: "invalid" };

  const recentAll = await db.report.count({ where: { activityId: activity.id, createdAt: { gt: new Date(now.getTime() - HOUR) } } });
  if (recentAll >= 20) return { ok: false, reason: "limit" };
  if (input.reporterId) {
    const mine = await db.report.count({
      where: { activityId: activity.id, reporterId: input.reporterId, createdAt: { gt: new Date(now.getTime() - 24 * HOUR) } },
    });
    if (mine >= 3) return { ok: false, reason: "limit" };
  }

  await db.report.create({ data: { activityId: activity.id, reason, message, reporterId: input.reporterId, createdAt: now } });
  return { ok: true };
}

export async function listOpenReports(db: PrismaClient, actor: Actor) {
  if (!isAdmin(actor.email)) throw new Error("forbidden");
  return db.report.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "asc" },
    include: { activity: { select: { slug: true, translations: { where: { locale: "de" }, select: { title: true } } } } },
  });
}

export async function resolveReport(db: PrismaClient, actor: Actor, reportId: string, now = new Date()) {
  if (!isAdmin(actor.email)) throw new Error("forbidden");
  const res = await db.report.updateMany({ where: { id: reportId, resolvedAt: null }, data: { resolvedAt: now, resolvedById: actor.id } });
  return res.count === 1;
}
