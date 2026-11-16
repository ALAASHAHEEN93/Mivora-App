import type { Activity, ActivityTranslation, Provider, Session, Venue } from "@/generated/prisma/client";
import type * as D from "@/domain/types";
import { toBerlinIso } from "@/domain/time";

export type ActivityRow = Activity & {
  provider: Provider;
  venue: Venue;
  translations: ActivityTranslation[];
  sessions: Session[];
};

/** Database row → domain object used by the UI and filters. */
export function toDomain(row: ActivityRow): D.Activity {
  const content: D.Activity["content"] = {};
  for (const t of row.translations) {
    content[t.locale as D.LanguageCode] = {
      title: t.title,
      summary: t.summary,
      description: t.description,
      ...(t.cancellation ? { cancellation: t.cancellation } : {}),
    };
  }
  return {
    id: row.id,
    slug: row.slug,
    status: row.status === "published" ? "published" : row.status === "archived" ? "archived" : "draft",
    categories: row.categories as D.CategorySlug[],
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    price:
      row.priceKind === "free"
        ? { kind: "free" }
        : { kind: "paid", amountCents: row.priceCents ?? 0, unit: (row.priceUnit ?? "perChild") as D.Price["unit"] },
    languages: row.languages as D.LanguageCode[],
    setting: row.setting as D.Setting,
    accessibility: row.accessibility as D.AccessibilityTag[],
    accessibilitySource: row.accessibilitySource as D.Activity["accessibilitySource"],
    bookingMode: row.bookingMode as D.Activity["bookingMode"],
    ...(row.externalUrl ? { externalUrl: row.externalUrl } : {}),
    cancellationPolicy: row.cancellationPolicy,
    originalLocale: row.originalLocale as D.LanguageCode,
    content,
    provider: { id: row.provider.id, name: row.provider.name, verified: row.provider.verified },
    venue: {
      name: row.venue.name,
      street: row.venue.street,
      postalCode: row.venue.postalCode,
      city: row.venue.city,
      district: row.venue.district,
      lat: row.venue.lat,
      lng: row.venue.lng,
    },
    sessions: [...row.sessions]
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .map((s) => ({ id: s.id, startsAt: toBerlinIso(s.startsAt), endsAt: toBerlinIso(s.endsAt), status: s.status })),
    source: { type: row.sourceType as D.SourceType, reference: row.sourceReference },
    lastVerifiedAt: row.lastVerifiedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    accent: row.accent as D.Activity["accent"],
    ...(row.photoSrc && row.photoCredit && row.photoSourceUrl
      ? {
          photo: {
            src: row.photoSrc,
            credit: row.photoCredit,
            sourceUrl: row.photoSourceUrl,
            license: (row.photoLicense ?? "provider") as D.Photo["license"],
          },
        }
      : {}),
  };
}
