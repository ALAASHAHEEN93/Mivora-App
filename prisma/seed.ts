/**
 * Seeds the local database with the clearly-marked DEMO listings.
 * Session dates are relative to the moment you seed: run `pnpm db:seed` again to refresh them.
 * Refuses to run against anything but a local database.
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { buildDemoActivities } from "../src/data/demo-activities";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (copy .env.example to .env.local)");
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1", "db"].includes(host)) {
  throw new Error(`Refusing to seed demo data into non-local database host "${host}"`);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const activities = buildDemoActivities(new Date());

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { activity: { sourceType: "demo" } } }),
    prisma.activityTranslation.deleteMany({ where: { activity: { sourceType: "demo" } } }),
    prisma.activity.deleteMany({ where: { sourceType: "demo" } }),
  ]);

  for (const a of activities) {
    const provider = await prisma.provider.upsert({
      where: { id: `demo-${a.provider.id}` },
      update: { name: a.provider.name, verified: a.provider.verified },
      create: { id: `demo-${a.provider.id}`, name: a.provider.name, verified: a.provider.verified },
    });
    const venueId = `demo-${a.id}-venue`;
    const venue = await prisma.venue.upsert({
      where: { id: venueId },
      update: { ...a.venue },
      create: { id: venueId, ...a.venue },
    });

    await prisma.activity.create({
      data: {
        id: `demo-${a.id}`,
        slug: a.slug,
        status: a.status,
        categories: a.categories,
        ageMin: a.ageMin,
        ageMax: a.ageMax,
        priceKind: a.price.kind,
        priceCents: a.price.amountCents ?? null,
        priceUnit: a.price.unit ?? null,
        languages: a.languages,
        setting: a.setting,
        accessibility: a.accessibility,
        accessibilitySource: a.accessibilitySource,
        bookingMode: a.bookingMode,
        externalUrl: a.externalUrl ?? null,
        cancellationPolicy: a.cancellationPolicy,
        originalLocale: a.originalLocale,
        sourceType: a.source.type,
        sourceReference: a.source.reference,
        lastVerifiedAt: new Date(a.lastVerifiedAt),
        expiresAt: new Date(a.expiresAt),
        accent: a.accent,
        photoSrc: a.photo?.src ?? null,
        photoCredit: a.photo?.credit ?? null,
        photoSourceUrl: a.photo?.sourceUrl ?? null,
        photoLicense: a.photo?.license ?? null,
        providerId: provider.id,
        venueId: venue.id,
        translations: {
          create: Object.entries(a.content).flatMap(([locale, c]) =>
            c ? [{ locale, title: c.title, summary: c.summary, description: c.description, cancellation: c.cancellation ?? null }] : [],
          ),
        },
        sessions: {
          create: a.sessions.map((s) => ({ startsAt: new Date(s.startsAt), endsAt: new Date(s.endsAt), status: s.status })),
        },
      },
    });
  }
  console.log(`Seeded ${activities.length} demo listings (incl. 1 expired + 1 draft that must stay hidden).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
