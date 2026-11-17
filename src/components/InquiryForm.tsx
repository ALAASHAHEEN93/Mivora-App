import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatSessionStart } from "@/domain/format";
import type { Session } from "@/domain/types";
import { getCurrentUser } from "@/server/auth/session";
import { inquiryAction } from "@/app/[locale]/(app)/aktivitaet/[slug]/actions";

const field = "min-h-12 w-full rounded-2xl border-2 border-line bg-surface px-4 font-semibold focus:border-accent focus:outline-none";

/** Booking request to the provider. Needs sign-in; the parent's email is shared only with consent. */
export async function InquiryForm({
  activityId,
  slug,
  locale,
  sessions,
  isDemo,
  status,
}: {
  activityId: string;
  slug: string;
  locale: string;
  sessions: Session[];
  isDemo: boolean;
  status?: string;
}) {
  const t = await getTranslations("inquiry");
  const user = await getCurrentUser();

  return (
    <section id="anfrage" aria-labelledby="anfrage-h" className="flex scroll-mt-24 flex-col gap-3 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
      <h2 id="anfrage-h" className="font-display text-2xl font-bold">
        {t("title")}
      </h2>
      {status === "gesendet" ? (
        <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
          {t("sent")}
        </p>
      ) : isDemo ? (
        <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{t("demo")}</p>
      ) : !user ? (
        <>
          <p className="text-muted">{t("signIn")}</p>
          <Link href="/anmelden" className="mv-btn-3d inline-flex min-h-12 w-fit items-center rounded-full bg-primary px-6 font-bold text-on-primary">
            {t("signInButton")}
          </Link>
        </>
      ) : (
        <form action={inquiryAction} className="flex flex-col gap-3">
          {status && (
            <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-3 text-sm font-bold">
              {t(`errors.${["invalid", "consent", "noProvider", "limit", "mail"].includes(status) ? status : "invalid"}`)}
            </p>
          )}
          <p className="text-sm text-muted">{t("intro")}</p>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="activityId" value={activityId} />
          <label className="flex flex-col gap-1 font-bold">
            {t("sessionLabel")}
            <select name="sessionAt" className={field} defaultValue="">
              <option value="">{t("anyDate")}</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.startsAt}>
                  {formatSessionStart(s.startsAt, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {t("childAgeLabel")}
            <select name="childAge" className={field} defaultValue="">
              <option value="">–</option>
              {Array.from({ length: 18 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {t("messageLabel")}
            <textarea name="message" required minLength={10} maxLength={1000} rows={4} className={`${field} py-3 font-normal`} />
            <span className="text-sm font-normal text-muted">{t("messageHint")}</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-5 shrink-0 accent-[var(--kw-primary)]" />
            <span>{t("consent", { email: user.email })}</span>
          </label>
          <button type="submit" className="mv-btn-3d min-h-12 rounded-full bg-primary px-6 font-bold text-on-primary">
            {t("send")}
          </button>
        </form>
      )}
    </section>
  );
}
