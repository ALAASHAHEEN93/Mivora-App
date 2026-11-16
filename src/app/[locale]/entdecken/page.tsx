import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { parseFilters, countActiveFilters } from "@/domain/parse-filters";
import { ACCESSIBILITY_TAGS, CATEGORY_SLUGS } from "@/domain/types";
import { locales } from "@/i18n/routing";
import { languageName } from "@/domain/localize";
import { ActivityCard } from "@/components/ActivityCard";
import { ChipLink, EmptyState, buttonPrimary, buttonSecondary } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";

type SearchParams = Record<string, string | string[] | undefined>;

/** Results depend on query params and the current time. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explore" });
  return { title: t("title") };
}

const DATE_KEYS = ["all", "today", "tomorrow", "weekend", "week"] as const;

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="min-h-12 rounded-xl border-2 border-line bg-surface px-3 text-base font-normal focus:border-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const t = await getTranslations();
  const [results, districts] = await Promise.all([activityRepository.search(filters), activityRepository.districts()]);
  const activeCount = countActiveFilters(filters);

  // Keep all other filters when switching the date chip.
  const queryWith = (patch: Record<string, string | undefined>) => {
    const q: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) if (typeof v === "string" && v) q[k] = v;
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete q[k];
      else q[k] = v;
    }
    return q;
  };

  const priceValue =
    filters.maxPriceCents === undefined ? "" : String(filters.maxPriceCents / 100);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("explore.title")}</h1>

      <nav aria-label={t("home.dateLabel")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {DATE_KEYS.map((d) => (
          <ChipLink
            key={d}
            href={{ pathname: "/entdecken", query: queryWith({ datum: d === "all" ? undefined : d }) }}
            active={(filters.date ?? "all") === d}
          >
            {t(`date.${d}`)}
          </ChipLink>
        ))}
      </nav>

      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        {/* Collapsed by default so results stay visible on phones; the badge shows active filters. */}
        <details className="group rounded-[var(--radius-card)] border border-line bg-surface md:self-start">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-extrabold">
            <Icon name="filter" />
            {t("explore.filters")}
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-2 text-sm text-on-primary">{activeCount}</span>
            )}
          </summary>
          <form method="get" className="flex flex-col gap-4 border-t border-line p-4">
            {filters.date && <input type="hidden" name="datum" value={filters.date} />}
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("home.searchPlaceholder")}
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ""}
                className="min-h-12 rounded-xl border-2 border-line bg-surface px-3 text-base font-normal focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("explore.age")}
              <input
                type="number"
                name="alter"
                inputMode="numeric"
                min={0}
                max={17}
                placeholder={t("explore.agePlaceholder")}
                defaultValue={filters.age ?? ""}
                className="min-h-12 rounded-xl border-2 border-line bg-surface px-3 text-base font-normal focus:border-ink"
              />
            </label>
            <Select
              name="kategorie"
              label={t("explore.category")}
              value={filters.category}
              options={[
                { value: "", label: t("explore.allCategories") },
                ...CATEGORY_SLUGS.map((c) => ({ value: c, label: t(`categories.${c}`) })),
              ]}
            />
            <Select
              name="bezirk"
              label={t("explore.district")}
              value={filters.district}
              options={[{ value: "", label: t("explore.allDistricts") }, ...districts.map((d) => ({ value: d, label: d }))]}
            />
            <Select
              name="preis"
              label={t("explore.price")}
              value={priceValue}
              options={[
                { value: "", label: t("explore.anyPrice") },
                { value: "0", label: t("explore.freeOnly") },
                { value: "10", label: t("explore.upTo10") },
                { value: "25", label: t("explore.upTo25") },
              ]}
            />
            <Select
              name="sprache"
              label={t("explore.language")}
              value={filters.language}
              options={[
                { value: "", label: t("explore.anyLanguage") },
                ...locales.map((l) => ({ value: l, label: languageName(l, locale) })),
              ]}
            />
            <Select
              name="ort"
              label={t("explore.setting")}
              value={filters.setting}
              options={[
                { value: "", label: t("explore.anySetting") },
                { value: "indoor", label: t("setting.indoor") },
                { value: "outdoor", label: t("setting.outdoor") },
              ]}
            />
            <Select
              name="barrierefrei"
              label={t("explore.accessibility")}
              value={filters.accessibility}
              options={[
                { value: "", label: t("explore.anyAccessibility") },
                ...ACCESSIBILITY_TAGS.map((a) => ({ value: a, label: t(`access.${a}`) })),
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={buttonPrimary}>
                {t("explore.apply")}
              </button>
              <Link href="/entdecken" className={buttonSecondary}>
                {t("explore.reset")}
              </Link>
            </div>
          </form>
        </details>

        <section aria-labelledby="results-heading" aria-live="polite">
          <h2 id="results-heading" className="mb-3 font-bold text-muted">
            {t("explore.results", { count: results.length })}
          </h2>
          {results.length === 0 ? (
            <EmptyState
              title={t("explore.emptyTitle")}
              text={t("explore.emptyText")}
              action={
                <Link href="/entdecken" className={buttonSecondary}>
                  {t("explore.resetFilters")}
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ activity, sessions }) => (
                <li key={activity.id}>
                  <ActivityCard activity={activity} nextSession={sessions[0]!} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
