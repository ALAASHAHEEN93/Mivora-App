import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPrisma } from "@/data/db/client";
import { formatEuro, formatSessionStart, formatTime } from "@/domain/format";
import { isAdmin, listPending } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";
import { approveAction, rejectAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Review queue. Only for emails in ADMIN_EMAILS; everyone else gets a plain 404. */
export default async function AdminPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ ergebnis?: string }> }) {
  const { locale } = await params;
  const { ergebnis } = await searchParams;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  const t = await getTranslations();
  const pending = await listPending(getPrisma(), user);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <h1 className="font-display text-3xl font-bold">{t("admin.title")}</h1>
      {ergebnis && (
        <p role="status" className={`rounded-2xl px-4 py-3 font-bold ${ergebnis === "fehler" ? "bg-[#fde7e7] text-[#7a1712]" : "bg-teal-100"}`}>
          {t(ergebnis === "freigegeben" ? "admin.approved" : ergebnis === "abgelehnt" ? "admin.rejected" : "admin.failed")}
        </p>
      )}
      {pending.length === 0 && <p className="text-muted">{t("admin.empty")}</p>}
      {pending.map((a) => {
        const de = a.translations.find((x) => x.locale === "de");
        const en = a.translations.find((x) => x.locale === "en");
        return (
          <article key={a.id} className="flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
            <p className="text-sm text-muted">{t("admin.submittedBy", { email: a.submittedBy?.email ?? "–" })}</p>
            {/* Provider text is rendered as plain text only. */}
            <h2 className="font-display text-2xl font-bold" lang="de">
              {de?.title}
            </h2>
            <p className="font-bold" lang="de">
              {de?.summary}
            </p>
            <p className="whitespace-pre-line" lang="de">
              {de?.description}
            </p>
            {en && (
              <details>
                <summary className="cursor-pointer text-sm font-bold">English</summary>
                <p lang="en" className="mt-2 font-bold">
                  {en.title} – {en.summary}
                </p>
                <p lang="en" className="whitespace-pre-line">
                  {en.description}
                </p>
              </details>
            )}
            <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">{t("activity.organizer")}</dt>
              <dd>{a.provider.name}</dd>
              <dt className="font-bold">{t("activity.whereLabel")}</dt>
              <dd>
                {a.venue.name}, {a.venue.street}, {a.venue.postalCode} Köln-{a.venue.district}
              </dd>
              <dt className="font-bold">{t("activity.ageLabel")}</dt>
              <dd>{t("common.ageRange", { min: a.ageMin, max: a.ageMax })}</dd>
              <dt className="font-bold">{t("activity.priceLabel")}</dt>
              <dd>{a.priceKind === "free" ? t("common.free") : `${formatEuro(a.priceCents ?? 0, locale)} ${t(`common.${a.priceUnit ?? "perChild"}`)}`}</dd>
              <dt className="font-bold">{t("activity.nextDates")}</dt>
              <dd>
                {a.sessions
                  .map((s) => `${formatSessionStart(s.startsAt.toISOString(), locale)}–${formatTime(s.endsAt.toISOString(), locale)}`)
                  .join(" · ")}
              </dd>
              <dt className="font-bold">{t("activity.cancellation")}</dt>
              <dd className="whitespace-pre-line">{a.cancellationPolicy}</dd>
              <dt className="font-bold">Link</dt>
              <dd className="break-all" dir="ltr">
                {a.externalUrl ?? "–"}
              </dd>
            </dl>
            <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-start">
              <form action={approveAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="min-h-12 w-full rounded-full bg-primary px-6 font-bold text-on-primary sm:w-auto">
                  {t("admin.approve")}
                </button>
              </form>
              <form action={rejectAction} className="flex flex-1 flex-col gap-2">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={a.id} />
                <label className="flex flex-col gap-1 text-sm font-bold">
                  {t("admin.reasonLabel")}
                  <textarea name="reason" required minLength={3} maxLength={500} rows={2} className="rounded-2xl border-2 border-line bg-bg px-3 py-2 font-normal" />
                </label>
                <button type="submit" className="min-h-12 rounded-full border-2 border-line px-6 font-bold">
                  {t("admin.reject")}
                </button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
