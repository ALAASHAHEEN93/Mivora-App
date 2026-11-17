import type { PrismaClient } from "@/generated/prisma/client";

export const MAX_INQUIRIES_PER_DAY = 5;

export type InquiryResult =
  | { ok: true; to: { email: string; locale: string }; title: string; sessionAt: Date | null }
  | { ok: false; reason: "invalid" | "consent" | "noProvider" | "limit" };

/**
 * Validates and stores a parent's booking request. Only for published listings in "inquiry"
 * mode whose provider has an account (demo listings have none). The caller emails the provider.
 */
export async function createInquiry(
  db: PrismaClient,
  input: { activityId: string; parentId: string; message: unknown; sessionAt: unknown; childAge: unknown; consent: unknown },
  now = new Date(),
): Promise<InquiryResult> {
  if (input.consent !== "yes") return { ok: false, reason: "consent" };
  const message = typeof input.message === "string" ? input.message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";
  if (message.length < 10 || message.length > 1000) return { ok: false, reason: "invalid" };
  const age = input.childAge === "" || input.childAge == null ? null : Number(input.childAge);
  if (age !== null && (!Number.isInteger(age) || age < 0 || age > 17)) return { ok: false, reason: "invalid" };

  const activity = await db.activity.findFirst({
    where: { id: input.activityId, status: "published", expiresAt: { gt: now } },
    select: {
      bookingMode: true,
      submittedBy: { select: { email: true, locale: true } },
      translations: { where: { locale: "de" }, select: { title: true } },
      sessions: { where: { startsAt: { gte: now }, status: { not: "cancelled" } }, select: { startsAt: true } },
    },
  });
  if (!activity || activity.bookingMode !== "inquiry") return { ok: false, reason: "invalid" };
  if (!activity.submittedBy) return { ok: false, reason: "noProvider" };

  let sessionAt: Date | null = null;
  if (typeof input.sessionAt === "string" && input.sessionAt) {
    const wanted = new Date(input.sessionAt).getTime();
    const match = activity.sessions.find((s) => s.startsAt.getTime() === wanted);
    if (!match) return { ok: false, reason: "invalid" };
    sessionAt = match.startsAt;
  }

  const today = await db.inquiry.count({ where: { parentId: input.parentId, createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } });
  if (today >= MAX_INQUIRIES_PER_DAY) return { ok: false, reason: "limit" };

  await db.inquiry.create({ data: { activityId: input.activityId, parentId: input.parentId, message, sessionAt, childAge: age, createdAt: now } });
  return { ok: true, to: activity.submittedBy, title: activity.translations[0]?.title ?? "", sessionAt };
}
