import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { slugify, type SubmissionInput } from "@/domain/submission";
import type { LocalizedText } from "@/domain/types";
import { deletePhoto, photoIdFromUrl, photoUrl } from "./photos";

export const MAX_OPEN_SUBMISSIONS = 10;

type Actor = { id: string; email: string };
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

/**
 * Saves a provider's listing as "pending": it is not public until an admin approves it.
 * Shortcut: when `publishAs` is an admin (checked here, not trusted from the form), the
 * listing is published right away and the audit log says so.
 */
export async function createSubmission(
  db: PrismaClient,
  userId: string,
  input: SubmissionInput,
  now = new Date(),
  photoId: string | null = null,
  publishAs: Actor | null = null,
) {
  const publishNow = Boolean(publishAs && publishAs.id === userId && isAdmin(publishAs.email));
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
        status: publishNow ? "published" : "pending",
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
        ...(photoId ? { photoSrc: photoUrl(photoId), photoCredit: input.orgName, photoLicense: "provider" } : {}),
        providerId: provider.id,
        venueId: venue.id,
        submittedById: userId,
        translations: { create: translations },
        sessions: { create: input.sessions.map((s) => ({ startsAt: new Date(s.startsAt), endsAt: new Date(s.endsAt) })) },
      },
    });
    await tx.auditLog.create({ data: { activityId: created.id, actorId: userId, action: publishNow ? "published_by_admin" : "submitted" } });
    return created;
  });
  return { ok: true as const, id: activity.id, slug: activity.slug, published: publishNow };
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
      lastVerifiedAt: true,
      translations: { where: { locale: "de" }, select: { title: true } },
      sessions: { orderBy: { startsAt: "asc" }, take: 1, select: { startsAt: true } },
    },
  });
}

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
  const before = await db.activity.findUnique({ where: { id: activityId }, select: { photoSrc: true } });
  const res = await db.activity.updateMany({
    where: { id: activityId, status: "pending" },
    data: { status: "archived", reviewNote: note, photoSrc: null, photoCredit: null, photoLicense: null },
  });
  if (res.count !== 1) return false;
  // A declined listing's photo is not kept.
  const photoId = photoIdFromUrl(before?.photoSrc);
  if (photoId) await deletePhoto(photoId);
  await db.auditLog.create({ data: { activityId, actorId: actor.id, action: "rejected", note } });
  return true;
}

/**
 * Who may see an uploaded photo: everyone once the listing is published and current;
 * before that only the provider who uploaded it and admins.
 */
export async function photoAccess(db: PrismaClient, photoId: string, viewer: Actor | null, now = new Date()): Promise<"public" | "private" | null> {
  const a = await db.activity.findFirst({
    where: { photoSrc: photoUrl(photoId) },
    select: { status: true, expiresAt: true, submittedById: true },
  });
  if (!a) return null;
  if (a.status === "published" && a.expiresAt > now) return "public";
  if (viewer && (viewer.id === a.submittedById || isAdmin(viewer.email))) return "private";
  return null;
}

/**
 * Updates the provider's own listing. Future dates are replaced by the new ones; past dates stay.
 * A provider's edit sends the listing back to review; an admin may publish directly.
 * Returns null when the listing doesn't exist or belongs to someone else.
 */
export async function updateSubmission(
  db: PrismaClient,
  userId: string,
  activityId: string,
  input: SubmissionInput,
  now = new Date(),
  newPhotoId: string | null = null,
  publishAs: Actor | null = null,
) {
  const existing = await db.activity.findFirst({ where: { id: activityId, submittedById: userId }, select: { id: true, slug: true, providerId: true, venueId: true, photoSrc: true } });
  if (!existing) return null;
  const publishNow = Boolean(publishAs && publishAs.id === userId && isAdmin(publishAs.email));
  const last = input.sessions[input.sessions.length - 1]!;

  await db.$transaction(async (tx) => {
    await tx.provider.update({ where: { id: existing.providerId }, data: { name: input.orgName } });
    await tx.venue.update({ where: { id: existing.venueId }, data: { ...input.venue, city: "Köln" } });
    await tx.activityTranslation.upsert({
      where: { activityId_locale: { activityId, locale: "de" } },
      update: { ...input.de, cancellation: input.cancellation },
      create: { activityId, locale: "de", ...input.de, cancellation: input.cancellation },
    });
    if (input.en) {
      await tx.activityTranslation.upsert({
        where: { activityId_locale: { activityId, locale: "en" } },
        update: input.en,
        create: { activityId, locale: "en", ...input.en },
      });
    } else {
      await tx.activityTranslation.deleteMany({ where: { activityId, locale: "en" } });
    }
    await tx.session.deleteMany({ where: { activityId, startsAt: { gte: now } } });
    await tx.session.createMany({ data: input.sessions.map((s) => ({ activityId, startsAt: new Date(s.startsAt), endsAt: new Date(s.endsAt) })) });
    await tx.activity.update({
      where: { id: activityId },
      data: {
        status: publishNow ? "published" : "pending",
        reviewNote: null,
        categories: input.categories,
        ageMin: input.ageMin,
        ageMax: input.ageMax,
        priceKind: input.price.kind,
        priceCents: input.price.kind === "paid" ? input.price.amountCents : null,
        priceUnit: input.price.kind === "paid" ? input.price.unit : null,
        languages: input.languages,
        setting: input.setting,
        accessibility: input.accessibility,
        bookingMode: input.bookingUrl ? "external_link" : "inquiry",
        externalUrl: input.bookingUrl,
        cancellationPolicy: input.cancellation,
        lastVerifiedAt: now,
        expiresAt: new Date(new Date(last.endsAt).getTime() + 24 * 60 * 60 * 1000),
        ...(newPhotoId ? { photoSrc: photoUrl(newPhotoId), photoCredit: input.orgName, photoLicense: "provider" } : {}),
      },
    });
    await tx.auditLog.create({ data: { activityId, actorId: userId, action: publishNow ? "edited_published_by_admin" : "edited" } });
  });
  if (newPhotoId) {
    const old = photoIdFromUrl(existing.photoSrc);
    if (old) await deletePhoto(old);
  }
  return { slug: existing.slug, published: publishNow };
}

/** The provider's own listing as form values, for the edit screen. */
export async function submissionFormValues(db: PrismaClient, userId: string, activityId: string, now = new Date()) {
  const a = await db.activity.findFirst({
    where: { id: activityId, submittedById: userId },
    include: { provider: true, venue: true, translations: true, sessions: { where: { startsAt: { gte: now } }, orderBy: { startsAt: "asc" } } },
  });
  if (!a) return null;
  const de = a.translations.find((t) => t.locale === "de");
  const en = a.translations.find((t) => t.locale === "en");
  const first = a.sessions[0];
  const berlin = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", ...opts }).format(d);
  const time = (d: Date) => berlin(d, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const values: Record<string, string | string[]> = {
    orgName: a.provider.name,
    title: de?.title ?? "",
    summary: de?.summary ?? "",
    description: de?.description ?? "",
    titleEn: en?.title ?? "",
    summaryEn: en?.summary ?? "",
    descriptionEn: en?.description ?? "",
    categories: a.categories,
    ageMin: String(a.ageMin),
    ageMax: String(a.ageMax),
    priceKind: a.priceKind,
    priceEuro: a.priceCents ? (a.priceCents / 100).toFixed(2).replace(".", ",") : "",
    priceUnit: a.priceUnit ?? "perChild",
    languages: a.languages,
    setting: a.setting,
    accessibility: a.accessibility,
    district: a.venue.district,
    venueName: a.venue.name,
    street: a.venue.street,
    postalCode: a.venue.postalCode,
    firstDate: first ? berlin(first.startsAt, { year: "numeric", month: "2-digit", day: "2-digit" }) : "",
    startTime: first ? time(first.startsAt) : "",
    endTime: first ? time(first.endsAt) : "",
    repeatWeeks: String(Math.min(Math.max(a.sessions.length, 1), 12)),
    bookingUrl: a.externalUrl ?? "",
    cancellation: de?.cancellation ?? a.cancellationPolicy,
  };
  return { values, status: a.status, photoSrc: a.photoSrc };
}
