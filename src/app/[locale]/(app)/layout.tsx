import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MainNav } from "@/components/MainNav";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { CITY_COOKIE, cityName, findCity } from "@/domain/cities";

/** App shell: top bar with logo + chosen city, content, floating bottom tab bar. */
export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const city = findCity((await cookies()).get(CITY_COOKIE)?.value);

  return (
    <>
      <p role="note" className="bg-sun-400 px-4 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))] text-center text-xs font-bold text-[#1f2430]">
        {t("common.demoBanner")}
      </p>
      <header className="sticky top-0 z-20 bg-[var(--kw-hero)]/90 backdrop-blur md:bg-bg/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-1.5 font-display text-2xl font-bold">
            <Mascot className="size-9" />
            Mivora
          </Link>
          <MainNav variant="top" />
          <Link
            href="/willkommen"
            aria-label={t("welcome.changeCity", { city: city ? cityName(city.slug, locale) : "–" })}
            className="inline-flex min-h-10 max-w-[45%] items-center gap-1 rounded-full bg-surface px-3 text-sm font-bold shadow-[0_4px_14px_-8px_rgba(42,47,58,0.45)]"
          >
            <Icon name="pin" className="size-4 shrink-0 text-accent" />
            <span className="truncate">{city ? cityName(city.slug, locale) : t("welcome.cityPlaceholder")}</span>
            <span aria-hidden="true" className="text-muted">▾</span>
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-32 pt-5 md:pb-16">
        {children}
      </main>
      <MainNav variant="bottom" />
    </>
  );
}
