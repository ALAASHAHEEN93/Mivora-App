import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { formatDate, formatSessionStart, formatTime } from "@/domain/format";
import { languageName, pickContent } from "@/domain/localize";
import { ListingPicture } from "@/components/ListingPicture";
import { PriceTag } from "@/components/PriceTag";
import { SaveButton } from "@/components/SaveButton";
import { PlanButton } from "@/components/PlanButton";
import { Icon } from "@/components/Icon";
import { Link } from "@/i18n/navigation";
import { buttonPrimary } from "@/components/ui";
import { ReportProblem } from "@/components/ReportProblem";
import { InquiryForm } from "@/components/InquiryForm";

export const revalidate = 300;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await activityRepository.findVisibleBySlug(slug);
  if (!result) return {};
  const { text } = pickContent(result.activity, locale);
  return { title: text.title, description: text.summary };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0">
      <dt className="text-sm font-bold text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function ActivityPage({ params, searchParams }: { params: Params; searchParams: Promise<{ neu?: string; meldung?: string; anfrage?: string }> }) {
  const { locale, slug } = await params;
  const { neu, meldung, anfrage } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const result = await activityRepository.findVisibleBySlug(slug);
  if (!result) notFound();

  const { activity, sessions } = result;
  const { text, lang, isFallback } = pickContent(activity, locale);
  const shown = sessions.slice(0, 4);
  const more = sessions.length - shown.length;
  const { venue } = activity;
  // Provider listings only store the district centre, so search the street address instead.
  const mapUrl =
    activity.source.type === "provider"
      ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${venue.street}, ${venue.postalCode} ${venue.city}`)}`
      : `https://www.openstreetmap.org/?mlat=${venue.lat}&mlon=${venue.lng}#map=17/${venue.lat}/${venue.lng}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: text.title,
    description: text.summary,
    startDate: sessions[0]!.startsAt,
    endDate: sessions[0]!.endsAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venue.name,
      address: { "@type": "PostalAddress", streetAddress: venue.street, postalCode: venue.postalCode, addressLocality: venue.city },
    },
    organizer: { "@type": "Organization", name: activity.provider.name },
    typicalAgeRange: `${activity.ageMin}-${activity.ageMax}`,
    isAccessibleForFree: activity.price.kind === "free",
  };

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/entdecken" className="inline-flex w-fit items-center gap-1 font-bold text-muted hover:text-ink">
        <Icon name="back" />
        {t("activity.back")}
      </Link>

      <div className="overflow-hidden rounded-[2rem] shadow-[0_14px_36px_-16px_rgba(42,47,58,0.45)]">
        <ListingPicture activity={activity} priority sizes="(min-width: 1024px) 64rem, 100vw" className="aspect-[16/9] w-full" />
      </div>

      {neu && (
        <p role="status" className="rounded-2xl bg-sun-100 px-4 py-3 font-bold">
          {t("provider.publishedNow")}
        </p>
      )}

      <header className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-2 text-sm font-bold">
          <li className="rounded-full bg-sun-100 px-3 py-1">{t("common.ageRange", { min: activity.ageMin, max: activity.ageMax })}</li>
          {activity.categories.map((c) => (
            <li key={c} className="rounded-full bg-lav-100 px-3 py-1">
              {t(`categories.${c}`)}
            </li>
          ))}
          <li className="rounded-full bg-teal-100 px-3 py-1">{t(`setting.${activity.setting}`)}</li>
        </ul>
        <h1 lang={lang} className="font-display text-3xl font-bold leading-tight md:text-5xl">
          {text.title}
        </h1>
        <p lang={lang} className="text-lg text-muted">
          {text.summary}
        </p>
        {isFallback && (
          <p className="rounded-xl bg-sun-100 px-3 py-2 text-sm">
            {t("activity.notTranslated")} {t("activity.originalLanguage", { language: languageName(lang, locale) })}
          </p>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="dates">
            <h2 id="dates" className="mb-2 font-display text-2xl font-bold">
              {t("activity.nextDates")}
            </h2>
            <ul className="flex flex-col gap-2">
              {shown.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-[0_4px_14px_-8px_rgba(42,47,58,0.35)]">
                  <Icon name="calendar" className="size-5 shrink-0 text-accent" />
                  <time dateTime={s.startsAt} className="font-bold">
                    {formatSessionStart(s.startsAt, locale)}
                  </time>
                  <span className="text-muted">– {formatTime(s.endsAt, locale)}</span>
                  <span className="ms-auto">
                    <PlanButton
                      item={{ activityId: activity.id, startsAt: s.startsAt, endsAt: s.endsAt }}
                      label={`${text.title}, ${formatSessionStart(s.startsAt, locale)}`}
                    />
                  </span>
                </li>
              ))}
            </ul>
            {more > 0 && <p className="mt-2 text-sm text-muted">{t("activity.moreDates", { count: more })}</p>}
          </section>

          <section aria-labelledby="about">
            <h2 id="about" className="mb-2 font-display text-2xl font-bold">
              {t("activity.about")}
            </h2>
            <p lang={lang} className="whitespace-pre-line">
              {text.description}
            </p>
          </section>

          <section aria-labelledby="cancel">
            <h2 id="cancel" className="mb-2 font-display text-2xl font-bold">
              {t("activity.cancellation")}
            </h2>
            <p lang={text.cancellation ? lang : activity.originalLocale}>{text.cancellation ?? activity.cancellationPolicy}</p>
          </section>

          <p className="text-sm text-muted">
            {t("activity.source")}: {activity.source.type === "demo" ? t("activity.sourceDemo") : activity.source.type === "provider" ? t("activity.sourceProvider") : activity.source.reference} ·{" "}
            {t("activity.lastChecked", { date: formatDate(activity.lastVerifiedAt, locale) })}
            {activity.photo && (
              <>
                {" · "}
                {activity.photo.sourceUrl ? (
                  <a href={activity.photo.sourceUrl} rel="noopener noreferrer" target="_blank" className="underline hover:text-ink">
                    {t("activity.photoCredit", { name: activity.photo.credit })}
                  </a>
                ) : (
                  t("activity.photoByProvider", { name: activity.photo.credit })
                )}
              </>
            )}
          </p>

          {activity.bookingMode !== "external_link" && (
            <InquiryForm activityId={activity.id} slug={activity.slug} locale={locale} sessions={shown} isDemo={activity.source.type === "demo"} status={anfrage} />
          )}

          <ReportProblem activityId={activity.id} slug={activity.slug} locale={locale} status={meldung} />
        </div>

        <aside className="flex flex-col gap-4 md:sticky md:top-24 md:self-start">
          <dl className="rounded-[var(--radius-card)] border border-line bg-surface px-4">
            <Fact label={t("activity.priceLabel")}>
              <PriceTag price={activity.price} />
            </Fact>
            <Fact label={t("activity.whereLabel")}>
              <p className="font-bold">{venue.name}</p>
              <p>
                {venue.street}, {venue.postalCode} {venue.city}-{venue.district}
              </p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-bold text-accent underline-offset-4 hover:underline">
                {t("activity.openMap")} <Icon name="external" className="size-4" />
              </a>
            </Fact>
            <Fact label={t("activity.languagesLabel")}>{new Intl.ListFormat(locale, { type: "conjunction" }).format(activity.languages.map((l) => languageName(l, locale)))}</Fact>
            <Fact label={t("activity.accessibilityLabel")}>
              {activity.accessibility.length === 0 ? (
                t("activity.none")
              ) : (
                <>
                  <ul className="list-inside list-disc">
                    {activity.accessibility.map((a) => (
                      <li key={a}>{t(`access.${a}`)}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-sm text-muted">
                    {activity.accessibilitySource === "verified" ? t("activity.accessVerified") : t("activity.accessProvider")}
                  </p>
                </>
              )}
            </Fact>
            <Fact label={t("activity.organizer")}>
              <p className="font-bold">{activity.provider.name}</p>
              <p className={`text-sm ${activity.provider.verified ? "text-teal-700" : "text-muted"}`}>
                {activity.provider.verified ? (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="check" className="size-4" /> {t("common.verified")}
                  </span>
                ) : (
                  t("common.unverified")
                )}
              </p>
            </Fact>
          </dl>

          <div className="fixed inset-x-0 bottom-16 z-10 flex gap-2 border-t border-line bg-bg/95 p-3 backdrop-blur md:static md:flex-col md:border-0 md:bg-transparent md:p-0">
            {activity.bookingMode === "external_link" && activity.externalUrl ? (
              <a href={activity.externalUrl} target="_blank" rel="noopener noreferrer nofollow" className={`${buttonPrimary} flex-1`}>
                {t("activity.bookExternal")} <Icon name="external" className="size-4" />
              </a>
            ) : (
              <a href="#anfrage" className={`${buttonPrimary} flex-1`}>
                {t("activity.inquire")}
              </a>
            )}
            <SaveButton id={activity.id} title={text.title} size="lg" />
          </div>
        </aside>
      </div>
    </article>
  );
}
