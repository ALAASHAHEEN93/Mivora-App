import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MainNav } from "@/components/MainNav";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { CITY_COOKIE, cityName, findCity } from "@/domain/cities";
import { AccountSync } from "@/components/AccountSync";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/server/auth/session";

/** App shell: top bar with logo + chosen city, content, floating bottom tab bar. */
export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const city = findCity((await cookies()).get(CITY_COOKIE)?.value);
  const user = await getCurrentUser();
  const present = process.env.PRESENTATION_MODE === "1";

  return (
    <>
      {/* Presentation mode swaps the full-width banner for a small, still visible "Demo" badge. */}
      {!present && (
        <p role="note" className="bg-sun-400 px-4 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))] text-center text-xs font-bold text-[#263847]">
          {t("common.demoBanner")}
        </p>
      )}
      <header className="mv-app-header sticky top-0 z-20 bg-[var(--kw-hero)]/90 backdrop-blur md:bg-bg/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center rounded-xl py-1">
            <Logo className="text-[2.25rem]" />
          </Link>
          {present && (
            <span title={t("common.demoBanner")} className="me-auto rounded-full bg-sun-400 px-2.5 py-0.5 text-xs font-bold text-[#263847]">
              {t("common.demoBadge")}
            </span>
          )}
          <MainNav variant="top" />
          <div className="flex min-w-0 max-w-[62%] items-center gap-2">
          <ThemeToggle />
          <Link
            href="/willkommen"
            className="inline-flex min-h-10 min-w-0 items-center gap-1 rounded-full bg-surface px-3 text-sm font-bold shadow-[0_4px_14px_-8px_rgba(42,47,58,0.45)]"
          >
            <Icon name="pin" className="size-4 shrink-0 text-accent" />
            <span className="truncate">{city ? cityName(city.slug, locale) : t("welcome.cityPlaceholder")}</span>
            {/* Spoken as "Köln – Stadt ändern": starts with the visible text (voice control friendly). */}
            <span className="sr-only"> – {t("welcome.changeCityShort")}</span>
            <span aria-hidden="true" className="text-muted">
              ▾
            </span>
          </Link>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-32 pt-5 md:pb-10">
        {children}
      </main>
      <SiteFooter />
      <MainNav variant="bottom" />
      <AccountSync signedIn={Boolean(user)} />
    </>
  );
}
