import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPrisma } from "@/data/db/client";
import { formatEuro, formatSessionStart, formatTime } from "@/domain/format";
import { adminStats, isAdmin, listAllActivities, listPending } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";
import { isStale } from "@/server/jobs";
import { approveAction, rejectAction, resolveReportAction } from "./actions";
import { confirmCurrentAction } from "./listing-actions";
import { listOpenReports } from "@/server/reports";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const TABS = ["pruefung", "alle", "meldungen"] as const;
type Tab = (typeof TABS)[number];

const BADGE: Record<string, string> = {
  pending: "bg-sun-100",
  published: "bg-teal-100",
  archived: "bg-[#fde7e7] text-[#7a1712]",
  draft: "bg-lav-100",
};

const RESULT: Record<string, string> = {
  freigegeben: "admin.approved",
  abgelehnt: "admin.rejected",
  gespeichert: "admin.saved",
  bestaetigt: "provider.confirmedDone",
};

/** Admin dashboard. Only for emails in ADMIN_EMAILS; everyone else gets a plain 404. */
export default async function AdminPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ ergebnis?: string; tab?: string }> }) {
  const { locale } = await params;
  const { ergebnis, tab: tabParam } = await searchParams;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  const t = await getTranslations();
  const db = getPrisma();
  const now = new Date();
  const [stats, pending, all, reports] = await Promise.all([adminStats(db, user), listPending(db, user), listAllActivities(db, user), listOpenReports(db, user)]);
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : pending.length > 0 ? "pruefung" : "alle";

  const tiles = [
    { label: t("admin.statLive"), value: stats.live, href: "/admin?tab=alle", bg: "bg-teal-100" },
    { label: t("admin.statPending"), value: stats.pending, href: "/admin?tab=pruefung", bg: "bg-sun-100" },
    { label: t("admin.statReports"), value: stats.reports, href: "/admin?tab=meldungen", bg: "bg-[#fde7e7]" },
    { label: t("admin.statAccounts"), value: stats.accounts, href: null, bg: "bg-lav-100" },
  ];
  const tabLabel: Record<Tab, string> = {
    pruefung: `${t("admin.pendingTitle")} (${pending.length})`,
    alle: `${t("admin.allTitle")} (${all.length})`,
    meldungen: `${t("admin.reportsTitle")} (${reports.length})`,
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <h1 className="font-display text-3xl font-bold">{t("admin.title")}</h1>
      {ergebnis && (
        <p role="status" className={`rounded-2xl px-4 py-3 font-bold ${RESULT[ergebnis] ? "bg-teal-100" : "bg-[#fde7e7] text-[#7a1712]"}`}>
          {t(RESULT[ergebnis] ?? "admin.failed")}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((s) => {
          const inner = (
            <>
              <dt className="text-sm font-bold">{s.label}</dt>
              <dd className="font-display text-4xl font-bold">{s.value}</dd>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className={`flex flex-col-reverse gap-1 rounded-3xl p-4 ${s.bg}`}>
              {inner}
            </Link>
          ) : (
            <div key={s.label} className={`flex flex-col-reverse gap-1 rounded-3xl p-4 ${s.bg}`}>
              {inner}
            </div>
          );
        })}
      </dl>

      <Link href="/admin/neu" className="flex min-h-16 items-center gap-3 rounded-3xl bg-primary px-5 py-4 font-bold text-on-primary mv-btn-3d">
        <span aria-hidden="true" className="text-3xl leading-none">
          +
        </span>
        <span className="flex flex-col">
          <span className="text-lg">{t("admin.addTitle")}</span>
          <span className="text-sm font-semibold opacity-90">{t("admin.addHint")}</span>
        </span>
      </Link>

      <nav aria-label={t("admin.title")} className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {TABS.map((k) => (
            <li key={k}>
              <Link
                href={`/admin?tab=${k}`}
                aria-current={tab === k ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-line bg-surface px-4 text-sm font-bold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
              >
                {tabLabel[k]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "pruefung" && (
        <section aria-label={tabLabel.pruefung} className="flex flex-col gap-4">
          {pending.length === 0 && <p className="text-muted">{t("admin.empty")}</p>}
          {pending.map((a) => {
            const de = a.translations.find((x) => x.locale === "de");
            const en = a.translations.find((x) => x.locale === "en");
            return (
              <article key={a.id} className="flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
                <p className="text-sm text-muted">{t("admin.submittedBy", { email: a.submittedBy?.email ?? "–" })}</p>
                {a.photoSrc && (
                  // eslint-disable-next-line @next/next/no-img-element -- private photo, served only to the provider and admins
                  <img src={a.photoSrc} alt="" className="aspect-[16/10] w-full rounded-2xl object-cover" />
                )}
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
        </section>
      )}

      {tab === "alle" && (
        <section aria-label={tabLabel.alle}>
          {all.length === 0 ? (
            <p className="text-muted">{t("admin.allEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {all.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold" lang="de">
                      {a.translations[0]?.title ?? a.slug}
                    </p>
                    {a.status === "published" && a.expiresAt <= now ? (
                      <span className="shrink-0 rounded-full bg-line px-3 py-1 text-xs font-bold">{t("admin.expired")}</span>
                    ) : (
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${BADGE[a.status] ?? ""}`}>{t(`provider.status.${a.status}`)}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {a.provider.name}
                    {" · "}
                    {a.sessions[0] ? formatSessionStart(a.sessions[0].startsAt.toISOString(), locale) : t("admin.noUpcoming")}
                  </p>
                  {a.status === "published" && a.submittedById === user.id && isStale(a.lastVerifiedAt) && (
                    <form action={confirmCurrentAction} className="flex flex-wrap items-center gap-2 rounded-xl bg-sun-100 p-2 text-sm">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={a.id} />
                      <span className="font-bold">{t("provider.staleQuestion")}</span>
                      <button type="submit" className="min-h-10 rounded-full bg-primary px-4 font-bold text-on-primary">
                        {t("provider.confirmCurrent")}
                      </button>
                    </form>
                  )}
                  <div className="flex gap-4">
                    <Link href={`/admin/bearbeiten/${a.id}`} className="inline-flex min-h-10 items-center text-sm font-bold text-accent underline underline-offset-4">
                      {t("provider.edit")}
                    </Link>
                    {a.status === "published" && a.expiresAt > now && (
                      <Link href={`/aktivitaet/${a.slug}`} className="inline-flex min-h-10 items-center text-sm font-bold text-accent underline underline-offset-4">
                        {t("provider.view")}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "meldungen" && (
        <section aria-label={tabLabel.meldungen} className="flex flex-col gap-3">
          {reports.length === 0 && <p className="text-muted">{t("admin.noReports")}</p>}
          {reports.map((r) => (
            <article key={r.id} className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)]">
              <Link href={`/aktivitaet/${r.activity.slug}`} className="font-bold underline underline-offset-4" lang="de">
                {r.activity.translations[0]?.title ?? r.activity.slug}
              </Link>
              <p className="text-sm">
                <span className="font-bold">{t(`report.reasons.${r.reason}`)}</span> · {formatSessionStart(r.createdAt.toISOString(), locale)}
              </p>
              {r.message && <p className="whitespace-pre-line rounded-xl bg-bg p-3 text-sm">{r.message}</p>}
              <form action={resolveReportAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="min-h-11 rounded-full border-2 border-line px-5 text-sm font-bold">
                  {t("admin.resolve")}
                </button>
              </form>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
