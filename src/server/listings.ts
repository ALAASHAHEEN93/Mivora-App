import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { slugify, type SubmissionInput } from "@/domain/submission";
import type { LocalizedText } from "@/domain/types";

export const MAX_OPEN_SUBMISSIONS = 10;
const ACCENTS = ["coral", "sunshine", "teal", "lavender"] as const;

/** Admins are configured on the server (ADMIN_EMAILS), never granted from the app. */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Saves a provider's listing as "pending": it is not public until an admin approves it. */
export async function createSubmission(db: PrismaClient, userId: string, input: SubmissionInput, now = new Date()) {
  const open = await db.activity.count({ where: { submittedById: userId, status: "pending" } });
  if (open >= MAX_OPEN_SUBMISSIONS) return { ok: false as const, reason: "limit" as const };

  const last = input.sessions[input.sessions.length - 1]!;
  const translations: (LocalizedText & { locale: string })[] = [{ locale: "de", ...input.de, cancellation: input.cancellation }];
  if (input.en) translations.push({ locale: "en", ...input.en });

  const activity = await db.$transaction(async (tx) => {
    const provider = await tx.provider.create({ data: { name: input.orgName, verified: false } });
    const venue = await tx.venue.create({ data: { ...input.venue, city: "Köln" } });
    const created = await tx.activity.create({
      data: {
        slug: slugify(input.de.title, randomBytes(4).toString("hex").slice(0, 6)),
        status: "pending",
        categories: input.categories,
        ageMin: input.ageMin,
        ageMax: input.ageMax,
        priceKind: input.price.kind,
        priceCents: input.price.kind === "paid" ? input.price.amountCents : null,
        priceUnit: input.price.kind === "paid" ? input.price.unit : null,
        languages: input.languages,
        setting: input.setting,
        accessibility: input.accessibility,
        accessibilitySource: "provider",
        bookingMode: input.bookingUrl ? "external_link" : "inquiry",
        externalUrl: input.bookingUrl,
        cancellationPolicy: input.cancellation,
        originalLocale: "de",
        sourceType: "provider",
        sourceReference: "Vom Anbieter eingereicht",
        lastVerifiedAt: now,
        expiresAt: new Date(new Date(last.endsAt).getTime() + 24 * 60 * 60 * 1000),
        accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)]!,
        providerId: provider.id,
        venueId: venue.id,
        submittedById: userId,
        translations: { create: translations },
        sessions: { create: input.sessions.map((s) => ({ startsAt: new Date(s.startsAt), endsAt: new Date(s.endsAt) })) },
      },
    });
    await tx.auditLog.create({ data: { activityId: created.id, actorId: userId, action: "submitted" } });
    return created;
  });
  return { ok: true as const, id: activity.id, slug: activity.slug };
}

/** A provider's own submissions, newest first. Never includes anyone else's. */
export function listOwnSubmissions(db: PrismaClient, userId: string) {
  return db.activity.findMany({
    where: { submittedById: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      translations: { where: { locale: "de" }, select: { title: true } },
      sessions: { orderBy: { startsAt: "asc" }, take: 1, select: { startsAt: true } },
    },
  });
}

type Actor = { id: string; email: string };

export async function listPending(db: PrismaClient, actor: Actor) {
  if (!isAdmin(actor.email)) throw new Error("forbidden");
  return db.activity.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { provider: true, venue: true, translations: true, sessions: { orderBy: { startsAt: "asc" } }, submittedBy: { select: { email: true } } },
  });
}

export async function approveSubmission(db: PrismaClient, actor: Actor, activityId: string, now = new Date()) {
  if (!isAdmin(actor.email)) throw new Error("forbidden");
  const res = await db.activity.updateMany({ where: { id: activityId, status: "pending" }, data: { status: "published", lastVerifiedAt: now, reviewNote: null } });
  if (res.count !== 1) return false;
  await db.auditLog.create({ data: { activityId, actorId: actor.id, action: "approved" } });
  return true;
}

export async function rejectSubmission(db: PrismaClient, actor: Actor, activityId: string, reason: string) {
  if (!isAdmin(actor.email)) throw new Error("forbidden");
  const note = reason.trim().slice(0, 500);
  if (note.length < 3) return false;
  const res = await db.activity.updateMany({ where: { id: activityId, status: "pending" }, data: { status: "archived", reviewNote: note } });
  if (res.count !== 1) return false;
  await db.auditLog.create({ data: { activityId, actorId: actor.id, action: "rejected", note } });
  return true;
}
