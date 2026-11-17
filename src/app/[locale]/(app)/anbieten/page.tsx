import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPrisma } from "@/data/db/client";
import { berlinDate } from "@/domain/time";
import { formatSessionStart } from "@/domain/format";
import { Mascot } from "@/components/illustrations/Mascot";
import { isAdmin, listOwnSubmissions } from "@/server/listings";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";
import { ListingForm } from "./ListingForm";
import { confirmCurrentAction } from "./actions";
import { isStale } from "@/server/jobs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "provider" });
  return { title: t("title") };
}

const BADGE: Record<string, string> = {
  pending: "bg-sun-100",
  published: "bg-teal-100",
  archived: "bg-[#fde7e7] text-[#7a1712]",
  draft: "bg-lav-100",
};

export default async function ProviderPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ eingereicht?: string; geaendert?: string; bestaetigt?: string }> }) {
  const { locale } = await params;
  const { eingereicht, geaendert, bestaetigt } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const user = await getCurrentUser();
  const mine = user ? await listOwnSubmissions(getPrisma(), user.id) : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("provider.title")}</h1>
      <p className="text-muted">{t("provider.intro")}</p>

      {!user ? (
        <section className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
          <Mascot className="size-16" />
          <p>{t("provider.signInFirst")}</p>
          {accountsAvailable() ? (
            <Link href="/anmelden" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-on-primary">
              {t("family.signIn")}
            </Link>
          ) : (
            <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{t("auth.noDatabase")}</p>
          )}
        </section>
      ) : (
        <>
          {bestaetigt && (
            <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
              {t("provider.confirmedDone")}
            </p>
          )}
          {geaendert && (
            <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
              {t("provider.changedDone")}
            </p>
          )}
          {eingereicht && (
            <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
              {t("provider.submittedDone")}
            </p>
          )}
          <section aria-labelledby="mine" className="flex flex-col gap-3">
            <h2 id="mine" className="font-display text-2xl font-bold">
              {t("provider.mineTitle")}
            </h2>
            {mine.length === 0 ? (
              <p className="text-muted">{t("provider.none")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {mine.map((m) => (
                  <li key={m.id} className="flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold" lang="de">
                        {m.translations[0]?.title ?? "–"}
                      </p>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${BADGE[m.status] ?? ""}`}>{t(`provider.status.${m.status}`)}</span>
                    </div>
                    {m.sessions[0] && <p className="text-sm text-muted">{formatSessionStart(m.sessions[0].startsAt.toISOString(), locale)}</p>}
                    {m.status === "archived" && m.reviewNote && <p className="text-sm">{t("provider.reason", { note: m.reviewNote })}</p>}
                    {m.status === "published" && isStale(m.lastVerifiedAt) && (
                      <form action={confirmCurrentAction} className="flex flex-wrap items-center gap-2 rounded-xl bg-sun-100 p-2 text-sm">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={m.id} />
                        <span className="font-bold">{t("provider.staleQuestion")}</span>
                        <button type="submit" className="min-h-10 rounded-full bg-primary px-4 font-bold text-on-primary">
                          {t("provider.confirmCurrent")}
                        </button>
                      </form>
                    )}
                    <div className="flex gap-4">
                      {m.status === "published" && (
                        <Link href={`/aktivitaet/${m.slug}`} className="w-fit text-sm font-bold text-accent underline underline-offset-4">
                          {t("provider.view")}
                        </Link>
                      )}
                      <Link href={`/anbieten/${m.id}`} className="w-fit text-sm font-bold text-accent underline underline-offset-4">
                        {t("provider.edit")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <h2 className="mt-2 font-display text-2xl font-bold">{t("provider.newTitle")}</h2>
          <ListingForm today={berlinDate(new Date())} isAdmin={isAdmin(user.email)} />
        </>
      )}
    </div>
  );
}
