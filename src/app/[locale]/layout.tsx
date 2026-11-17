import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { Splash } from "@/components/Splash";
import "../globals.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-nunito", display: "swap" });
// Logo and headings. No Cyrillic in Baloo 2, so Ukrainian headings fall back to Nunito.
const baloo = Baloo_2({ subsets: ["latin", "latin-ext"], weight: ["700", "800"], variable: "--font-baloo", display: "swap" });
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
    applicationName: "Mivora",
    appleWebApp: { capable: true, title: "Mivora", statusBarStyle: "default" },
    icons: { icon: "/app-icon/192", apple: "/app-icon/180" },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover", // full-screen app layout; safe areas handled with env(safe-area-inset-*)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a8dadc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1c2e" },
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
    <html lang={locale} dir={dir} className={`${nunito.variable} ${baloo.variable} ${arabic.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body>; only affects this element */}
      <body className="min-h-dvh bg-bg font-sans text-ink" suppressHydrationWarning>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
          >
            {t("common.skipToContent")}
          </a>
          <Splash tagline={t("welcome.tagline")} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
