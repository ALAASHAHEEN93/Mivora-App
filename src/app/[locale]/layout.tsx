import type { Metadata, Viewport } from "next";
import { Nunito, Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { MainNav } from "@/components/MainNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Mascot } from "@/components/illustrations/Mascot";
import "../globals.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-nunito", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-playfair", display: "swap" });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · Mivora` },
    description: t("description"),
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])) },
    robots: { index: false, follow: false }, // demo build: keep out of search engines
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffdcc8" },
    { media: "(prefers-color-scheme: dark)", color: "#15171d" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${nunito.variable} ${playfair.variable} ${arabic.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body>; only affects this element */}
      <body className="min-h-dvh bg-bg font-sans text-ink" suppressHydrationWarning>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
          >
            {t("common.skipToContent")}
          </a>
          <p role="note" className="bg-sun-400 px-4 py-1.5 text-center text-sm font-bold text-[#1f2430]">
            {t("common.demoBanner")}
          </p>
          <header className="sticky top-0 z-20 bg-[var(--kw-hero)]/90 backdrop-blur md:bg-bg/90">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="flex items-center gap-1.5 font-display text-2xl font-bold">
                <Mascot className="size-9" />
                Mivora
              </Link>
              <MainNav variant="top" />
              <LanguageSwitcher />
            </div>
          </header>
          <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-16">
            {children}
          </main>
          <footer className="border-t border-line pb-28 md:pb-0">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6 text-sm text-muted">
              <span>© Mivora</span>
              <span>{t("footer.imprint")}</span>
              <span>{t("footer.privacy")}</span>
              <span>{t("footer.terms")}</span>
              <span className="w-full text-xs">{t("footer.demoNote")}</span>
            </div>
          </footer>
          <MainNav variant="bottom" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
