import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

const PAGES = { impressum: "imprint", datenschutz: "privacy", agb: "terms" } as const;
type Slug = keyof typeof PAGES;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; page: string }> }): Promise<Metadata> {
  const { locale, page } = await params;
  if (!(page in PAGES)) return {};
  const t = await getTranslations({ locale, namespace: "footer" });
  return { title: t(PAGES[page as Slug]), robots: { index: false } };
}

/**
 * Impressum, Datenschutz, AGB. The legal texts are written by a lawyer before launch;
 * until then the page says so honestly. The privacy page adds a plain summary of what we store.
 */
export default async function LegalPage({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  if (!(page in PAGES)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const key = PAGES[page as Slug];

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="font-display text-3xl font-bold">{t(`footer.${key}`)}</h1>
      <p role="note" className="rounded-2xl bg-sun-100 px-4 py-3">
        {t("legal.pending")}
      </p>
      {key === "privacy" && (
        <section className="flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
          <h2 className="font-display text-xl font-bold">{t("legal.summaryTitle")}</h2>
          <ul className="flex list-disc flex-col gap-2 ps-5">
            {(["account", "children", "lists", "requests", "device", "map"] as const).map((k) => (
              <li key={k}>{t(`legal.summary.${k}`)}</li>
            ))}
          </ul>
          <p className="text-sm text-muted">{t("legal.notLegal")}</p>
        </section>
      )}
    </article>
  );
}
