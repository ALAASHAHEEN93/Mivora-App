import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { CATEGORY_SLUGS } from "@/domain/types";
import type { ActivityResult } from "@/domain/filters";
import { intlLocale } from "@/domain/format";
import { TIME_ZONE } from "@/domain/time";
import { ActivityCard } from "@/components/ActivityCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ScrollRow } from "@/components/ScrollRow";
import { ChipLink, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { WeekStrip } from "@/components/WeekStrip";
import { Link } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { CITY_COOKIE, cityName, findCity } from "@/domain/cities";

/** Depends on the chosen city (cookie) and today's date. */
export const dynamic = "force-dynamic";

/** Palette bubbles behind the category icons: aqua, gold, light steel, gold tint, aqua tint. */
const BUBBLES = ["bg-[#a8dadc]", "bg-[#d9bf77]", "bg-[#c9dce8]", "bg-[#f6eed6]", "bg-[#ddf0f0]"];

function Rail({ items, empty }: { items: ActivityResult[]; empty: string }) {
  if (items.length === 0) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
      {items.slice(0, 6).map(({ activity, sessions }) => (
        <li key={activity.id} className="w-72 shrink-0 snap-start md:w-auto">
          <ActivityCard activity={activity} nextSession={sessions[0]!} />
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const now = new Date();

  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  const greeting = hour < 11 ? t("home.goodMorning") : hour < 18 ? t("home.goodAfternoon") : t("home.goodEvening");
  const todayLabel = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(now);

  const [upcoming, weekend, free, camps] = await Promise.all([
    activityRepository.search({ date: "week" }),
    activityRepository.search({ date: "weekend" }),
    activityRepository.search({ maxPriceCents: 0 }),
    activityRepository.search({ category: "holidayCamp" }),
  ]);

  const city = findCity((await cookies()).get(CITY_COOKIE)?.value);
  const soonCity = city && !city.live ? cityName(city.slug, locale) : null;

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="hero"
        className="-mx-4 -mt-5 rounded-b-[2.5rem] bg-[linear-gradient(180deg,var(--kw-hero)_0%,var(--kw-bg)_100%)] px-4 pb-6 pt-6 md:mx-0 md:mt-0 md:rounded-[2.5rem] md:px-8"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface shadow-md">
            <Mascot className="size-11" />
          </span>
          <div>
            <h1 id="hero" className="font-display text-2xl font-bold leading-tight md:text-3xl">
              {greeting}
            </h1>
            <p className="text-sm text-muted">{todayLabel}</p>
          </div>
        </div>

        {soonCity && (
          <div role="status" className="mt-5 flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-[0_6px_18px_-10px_rgba(42,47,58,0.35)]">
            <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <p className="font-bold">{t("home.citySoonTitle", { city: soonCity })}</p>
              <p className="text-sm text-muted">{t("home.citySoonText", { city: soonCity, live: cityName("koeln", locale) })}</p>
            </div>
          </div>
        )}

        <p className="mt-5 font-display text-3xl font-bold leading-tight md:text-4xl">{t("home.greeting")}</p>

        <form action={`/${locale}/entdecken`} method="get" role="search" className="mt-4 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            {t("home.searchPlaceholder")}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder={t("home.searchPlaceholder")}
            className="min-h-13 w-full rounded-full border-0 bg-surface px-5 text-base shadow-[0_6px_20px_-10px_rgba(42,47,58,0.4)] placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-[#457b9d]"
          />
          <button type="submit" className="grid min-h-13 min-w-13 place-items-center rounded-full bg-primary text-on-primary shadow-md">
            <Icon name="search" />
            <span className="sr-only">{t("home.searchButton")}</span>
          </button>
        </form>

        <div className="mt-6">
          <WeekStrip locale={locale} now={now} label={t("home.pickDay")} />
        </div>
      </section>

      <section>
        <SectionHeader title={t("home.upcoming")} href={{ pathname: "/entdecken", query: { datum: "week" } }} linkLabel={t("home.seeAll")} />
        {upcoming.length === 0 ? (
          <p className="text-muted">{t("home.emptySection")}</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {upcoming.slice(0, 4).map(({ activity, sessions }) => (
              <li key={activity.id}>
                <ActivityCard activity={activity} nextSession={sessions[0]!} size="lg" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cats">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="cats" className="font-display text-2xl font-bold md:text-3xl">
            {t("home.categories")}
          </h2>
          <Link href="/entdecken" className="shrink-0 font-bold underline decoration-2 underline-offset-4 hover:text-accent">
            {t("home.seeAll")}
          </Link>
        </div>
        {/* Mobile: swipeable row. The 5th bubble is cut off and the end edge fades, so it reads as "more this way". */}
        <ScrollRow className="flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:flex-wrap md:justify-between md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {CATEGORY_SLUGS.map((c, i) => (
            <li key={c} className="mv-pop-in w-[4.5rem] shrink-0 snap-start md:w-[5.25rem]" style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={{ pathname: "/entdecken", query: { kategorie: c } }}
                className="mv-wiggle-on-touch group flex flex-col items-center gap-1.5 rounded-2xl py-1 text-center"
              >
                <span className={`grid size-16 place-items-center rounded-full text-[#1d3557] shadow-[0_6px_16px_-10px_rgba(36,48,77,0.5)] transition group-hover:-translate-y-0.5 group-active:scale-95 ${BUBBLES[i % BUBBLES.length]}`}>
                  <CategoryIcon category={c} className="mv-wiggle-target size-7" />
                </span>
                <span className="line-clamp-2 text-xs font-bold leading-tight">{t(`categories.${c}`)}</span>
              </Link>
            </li>
          ))}
        </ScrollRow>
      </section>

      <section>
        <SectionHeader title={t("home.thisWeekend")} href={{ pathname: "/entdecken", query: { datum: "weekend" } }} linkLabel={t("home.seeAll")} />
        <Rail items={weekend} empty={t("home.emptySection")} />
      </section>

      <section>
        <SectionHeader title={t("home.free")} href={{ pathname: "/entdecken", query: { preis: "0" } }} linkLabel={t("home.seeAll")} />
        <Rail items={free} empty={t("home.emptySection")} />
      </section>

      <section>
        <SectionHeader title={t("home.holidayCamps")} href={{ pathname: "/entdecken", query: { kategorie: "holidayCamp" } }} linkLabel={t("home.seeAll")} />
        <Rail items={camps} empty={t("home.emptySection")} />
      </section>

      <div className="flex flex-wrap gap-2">
        {(["today", "tomorrow", "weekend"] as const).map((d) => (
          <ChipLink key={d} href={{ pathname: "/entdecken", query: { datum: d } }}>
            {t(`date.${d}`)}
          </ChipLink>
        ))}
      </div>

      <p className="flex items-start gap-3 rounded-3xl bg-teal-100 p-4 text-sm">
        <Icon name="check" className="mt-0.5 size-5 shrink-0" />
        {t("home.trustNote")}
      </p>
    </div>
  );
}
