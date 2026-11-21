import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { CATEGORY_SLUGS } from "@/domain/types";
import type { ActivityResult } from "@/domain/filters";
import { formatSessionStart, intlLocale, priceAmount } from "@/domain/format";
import { pickContent } from "@/domain/localize";
import { rainOutlook } from "@/server/weather";
import { SurprisePicker, type PickerItem } from "@/components/SurprisePicker";
import { TIME_ZONE } from "@/domain/time";
import { ActivityCard } from "@/components/ActivityCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ScrollRow } from "@/components/ScrollRow";
import { SectionHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { WeekStrip } from "@/components/WeekStrip";
import { ForYou } from "@/components/ForYou";
import { HeroSky } from "@/components/illustrations/HeroSky";
import { SearchHintsInput } from "@/components/SearchHintsInput";
import { Link } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { CITY_COOKIE, cityName, findCity } from "@/domain/cities";

/** Depends on the chosen city (cookie) and today's date. */
export const dynamic = "force-dynamic";

/** Soft pastel bubbles (ink icons stay readable on all of them, also in dark mode). */
const BUBBLES = ["bg-[#fde3d8]", "bg-[#fbefc9]", "bg-[#dcefea]", "bg-[#d6ecf0]", "bg-[#ebe5f6]"];


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

  const [upcoming, weekend, free, camps, today, rain] = await Promise.all([
    activityRepository.search({ date: "week" }),
    activityRepository.search({ date: "weekend" }),
    activityRepository.search({ maxPriceCents: 0 }),
    activityRepository.search({ category: "holidayCamp" }),
    activityRepository.search({ date: "today" }, now),
    rainOutlook(now),
  ]);
  const indoor = rain ? await activityRepository.search({ day: rain.day, setting: "indoor" }, now) : [];

  // Nothing left today (e.g. in the evening)? Suggest the coming days instead of an empty card.
  const pickToday = today.length > 0;
  const pickerSource = pickToday ? today : upcoming;
  const pickerItems: PickerItem[] = pickerSource.slice(0, 20).map(({ activity, sessions }) => {
    const { text, lang } = pickContent(activity, locale);
    return {
      slug: activity.slug,
      title: text.title,
      lang,
      when: formatSessionStart(sessions[0]!.startsAt, locale),
      district: activity.venue.district,
      price: priceAmount(activity.price, locale) ?? t("common.free"),
    };
  });

  const city = findCity((await cookies()).get(CITY_COOKIE)?.value);
  const soonCity = city && !city.live ? cityName(city.slug, locale) : null;

  return (
    <div className="flex flex-col gap-10">
      <section id="mv-home-hero" aria-labelledby="hero" className="relative -mx-4 -mt-5 overflow-hidden rounded-b-[2.5rem] px-4 pb-32 pt-6 md:mx-0 md:mt-0 md:rounded-[2.5rem] md:px-10 md:pb-44 md:pt-10">
        <HeroSky />
        <div className="relative">
          <div className="mv-pop-in flex items-center gap-3 pe-16">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface shadow-md">
              <span className="mv-hello inline-block">
                <Mascot className="size-11" />
              </span>
            </span>
            <div>
              <h1 id="hero" className="font-display text-2xl font-bold leading-tight md:text-3xl">
                {greeting}
              </h1>
              <p className="text-sm font-semibold text-muted">{todayLabel}</p>
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

          <p className="mt-6 max-w-xl font-display text-[2rem] font-bold leading-[1.1] md:text-5xl">
            <span className="relative inline-block">
              {t("home.greeting")}
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-2.5 start-0 h-3 w-[45%] overflow-visible">
                <path className="mv-draw" pathLength={100} d="M2 7 Q 30 1 60 5 T 98 4" fill="none" stroke="#f2a68a" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
          </p>

          <form action={`/${locale}/entdecken`} method="get" role="search" className="mt-6 flex max-w-xl gap-2">
            <label htmlFor="q" className="sr-only">
              {t("home.searchPlaceholder")}
            </label>
            <SearchHintsInput
              id="q"
              name="q"
              placeholder={t("home.searchPlaceholder")}
              hints={CATEGORY_SLUGS.map((c) => t(`categories.${c}`))}
              className="min-h-14 w-full rounded-full border-2 border-[#263847]/10 bg-surface px-5 text-base shadow-[0_8px_24px_-12px_rgba(42,47,58,0.45)] placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f2a68a]"
            />
            <button type="submit" className="mv-btn-3d grid min-h-14 min-w-14 place-items-center rounded-full bg-primary text-on-primary">
              <Icon name="search" />
              <span className="sr-only">{t("home.searchButton")}</span>
            </button>
          </form>

          <div className="mt-5 max-w-xl rounded-[1.75rem] bg-surface/90 p-1.5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)] backdrop-blur">
            <WeekStrip locale={locale} now={now} label={t("home.pickDay")} />
          </div>
        </div>
      </section>

      {rain && (
        <section aria-labelledby="rain-h" className="mv-reveal">
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden="true" className="mv-float grid size-12 shrink-0 place-items-center rounded-full bg-surface shadow-sm">
              <Icon name="umbrella" className="size-7 text-accent" />
            </span>
            <div>
              <h2 id="rain-h" className="font-display text-xl font-bold leading-tight">
                {t(rain.when === "today" ? "home.rainToday" : "home.rainTomorrow")}
              </h2>
              <Link
                href={{ pathname: "/entdecken", query: { datum: rain.when, ort: "indoor" } }}
                className="text-sm font-bold underline underline-offset-4"
              >
                {t("home.seeAll")}
              </Link>
            </div>
          </div>
          <Rail items={indoor} empty={t("home.rainEmpty")} />
          <p className="text-xs text-muted">{t("home.weatherSource")}</p>
        </section>
      )}

      <SurprisePicker
        items={pickerItems}
        texts={{
          title: t("home.pickerTitle"),
          hint: pickToday ? t("home.pickerHint") : t("home.pickerHintSoon"),
          button: t("home.pickerButton"),
          again: t("home.pickerAgain"),
          open: t("home.pickerOpen"),
          spinning: t("home.pickerSpinning"),
          result: t("home.pickerResult"),
          empty: t("home.pickerEmpty"),
        }}
      />

      <ForYou now={now} />

      <section className="mv-reveal">
        <SectionHeader
          title={t("home.upcoming")}
          href={{ pathname: "/entdecken", query: { datum: "week" } }}
          linkLabel={t("home.seeAll")}
          badge={{ bg: "bg-[#fde3d8]", icon: <Icon name="calendar" className="size-5" /> }}
        />
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

      <section aria-labelledby="cats" className="mv-reveal">
        <SectionHeader
          id="cats"
          title={t("home.categories")}
          href="/entdecken"
          linkLabel={t("home.seeAll")}
          badge={{ bg: "bg-[#ebe5f6]", icon: <Icon name="search" className="size-5" /> }}
        />
        {/* Mobile: swipeable row. The 5th bubble is cut off and the end edge fades, so it reads as "more this way". */}
        <ScrollRow className="flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:flex-wrap md:justify-between md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {CATEGORY_SLUGS.map((c, i) => (
            <li key={c} className="mv-pop-in w-[4.5rem] shrink-0 snap-start md:w-[5.25rem]" style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={{ pathname: "/entdecken", query: { kategorie: c } }}
                className="mv-wiggle-on-touch group flex flex-col items-center gap-1.5 rounded-2xl py-1 text-center"
              >
                <span className={`grid size-16 place-items-center rounded-full border-2 border-[#263847] text-[#263847] shadow-[0_3px_0_#263847] transition group-hover:-translate-y-1 group-active:scale-95 ${BUBBLES[i % BUBBLES.length]}`}>
                  <CategoryIcon category={c} className="mv-wiggle-target size-7" />
                </span>
                <span className="line-clamp-2 text-xs font-bold leading-tight">{t(`categories.${c}`)}</span>
              </Link>
            </li>
          ))}
        </ScrollRow>
      </section>

      <section className="mv-reveal">
        <SectionHeader
          title={t("home.thisWeekend")}
          href={{ pathname: "/entdecken", query: { datum: "weekend" } }}
          linkLabel={t("home.seeAll")}
          badge={{ bg: "bg-[#dcefea]", icon: <Mascot className="size-7" /> }}
        />
        <Rail items={weekend} empty={t("home.emptySection")} />
      </section>

      <section className="mv-reveal">
        <SectionHeader
          title={t("home.free")}
          href={{ pathname: "/entdecken", query: { preis: "0" } }}
          linkLabel={t("home.seeAll")}
          badge={{ bg: "bg-[#d6ecf0]", icon: <Icon name="heart" className="size-5" /> }}
        />
        <Rail items={free} empty={t("home.emptySection")} />
      </section>

      <section className="mv-reveal">
        <SectionHeader
          title={t("home.holidayCamps")}
          href={{ pathname: "/entdecken", query: { kategorie: "holidayCamp" } }}
          linkLabel={t("home.seeAll")}
          badge={{ bg: "bg-[#fbefc9]", icon: <CategoryIcon category="holidayCamp" className="size-5" /> }}
        />
        <Rail items={camps} empty={t("home.emptySection")} />
      </section>

      <div className="mv-reveal relative overflow-hidden rounded-[2rem] bg-[#dcefea] px-5 pb-12 pt-5 text-[#263847]">
        <p className="relative z-10 flex items-center gap-4 text-sm font-semibold">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white shadow-sm">
            <Icon name="check" className="size-6 text-[#2e7d5b]" />
          </span>
          {t("home.trustNote")}
        </p>
        <span aria-hidden="true" className="absolute -bottom-10 -start-6 h-20 w-[60%] rounded-[50%] bg-[#d6ecf0]" />
        <span aria-hidden="true" className="absolute -bottom-12 -end-8 h-24 w-[65%] rounded-[50%] bg-[#fbefc9]" />
        <span aria-hidden="true" className="mv-float absolute bottom-2 end-6">
          <Mascot className="size-10" mood="wow" />
        </span>
      </div>
      <nav aria-label={t("home.moreTitle")} className="mv-reveal grid grid-cols-2 gap-3">
        <Link href="/ueber" className="mv-press flex flex-col gap-2 rounded-[1.75rem] border-2 border-[#263847] bg-[#fbefc9] p-4 font-bold text-[#263847] shadow-[0_4px_0_#263847]">
          <Mascot className="size-9" />
          {t("home.aboutShort")}
        </Link>
        <Link href="/fuer-anbieter" className="mv-press flex flex-col gap-2 rounded-[1.75rem] border-2 border-[#263847] bg-[#ebe5f6] p-4 font-bold text-[#263847] shadow-[0_4px_0_#263847]">
          <Icon name="home" className="size-9" />
          {t("home.providersShort")}
        </Link>
      </nav>
    </div>
  );
}
