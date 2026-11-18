import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { WelcomeScene } from "@/components/illustrations/WelcomeScene";
import { CITY_COOKIE, citiesForLocale, findCity } from "@/domain/cities";
import { AGES_COOKIE, parseAges } from "@/domain/ages";
import { chooseCity } from "./actions";

/** Reads the city cookie and error query on every request. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "welcome" });
  return { title: t("title") };
}

export default async function WelcomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { locale } = await params;
  const { fehler } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("welcome");
  const current = findCity((await cookies()).get(CITY_COOKIE)?.value)?.slug ?? "";
  const cities = citiesForLocale(locale);
  const savedAges = parseAges((await cookies()).get(AGES_COOKIE)?.value);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      {/* Sky hero: big sticker logo above the waving kids */}
      <section className="mv-daylight -mx-5 flex flex-col bg-[var(--kw-sky)] px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mt-2 flex flex-col items-center gap-1">
          <Logo className="text-[3.6rem]" />
          <p className="mv-sticker text-xl text-[#fff3ea]">{t("tagline")}</p>
        </div>
        <WelcomeScene className="-mx-5 -mt-4 w-[calc(100%+2.5rem)]" />
      </section>

      <div className="mt-4 flex flex-1 flex-col gap-2 text-center">
        <h1 className="font-display text-4xl font-bold leading-tight">{t("title")}</h1>
        <p className="text-lg text-muted">{t("subtitle")}</p>
      </div>

      <form action={chooseCity} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label htmlFor="city" className="text-start font-bold">
          {t("cityQuestion")}
        </label>
        <div className="relative">
          <Icon name="pin" className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-accent" />
          <select
            id="city"
            name="city"
            required
            defaultValue={current}
            aria-invalid={fehler === "stadt" || undefined}
            aria-describedby="city-hint"
            className="min-h-14 w-full appearance-none rounded-2xl border-2 border-line bg-surface pe-12 ps-12 text-lg font-bold shadow-[0_6px_18px_-10px_rgba(42,47,58,0.35)] focus:border-accent focus:outline-none"
          >
            <option value="" disabled>
              {t("cityPlaceholder")}
            </option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.live ? c.name : `${c.name} · ${t("soon")}`}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-xl text-muted">
            ▾
          </span>
        </div>
        <p id="city-hint" className={`text-start text-sm ${fehler === "stadt" ? "font-bold text-accent" : "text-muted"}`}>
          {fehler === "stadt" ? t("cityError") : t("cityHint")}
        </p>
        <fieldset className="mt-2 flex flex-col gap-2">
          <legend className="mb-1 text-start font-bold">{t("agesQuestion")}</legend>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 16 }, (_, a) => (
              <label key={a} className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-2 border-line bg-surface px-3 font-bold has-[:checked]:border-[#263847] has-[:checked]:bg-primary has-[:checked]:text-on-primary">
                <input type="checkbox" name="ages" value={a} defaultChecked={savedAges.includes(a)} className="sr-only" />
                {a}
              </label>
            ))}
          </div>
          <p className="text-start text-sm text-muted">{t("agesHint")}</p>
        </fieldset>
        <button
          type="submit"
          className="mt-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-lg font-bold text-on-primary mv-btn-3d transition active:scale-[0.98]"
        >
          {t("start")}
          <Icon name="forward" className="size-5" />
        </button>
      </form>
    </main>
  );
}
