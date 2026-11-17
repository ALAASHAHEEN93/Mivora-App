import { getTranslations } from "next-intl/server";
import { REPORT_REASONS } from "@/server/reports";
import { reportAction } from "@/app/[locale]/(app)/aktivitaet/[slug]/actions";

/** "Report a problem" on an activity page: reason + optional note, goes to the admin queue. */
export async function ReportProblem({ activityId, slug, locale, status }: { activityId: string; slug: string; locale: string; status?: string }) {
  const t = await getTranslations("report");
  return (
    <section id="melden" className="scroll-mt-24">
      {status === "danke" ? (
        <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
          {t("thanks")}
        </p>
      ) : (
        <details className="rounded-2xl border-2 border-dashed border-line p-4" open={Boolean(status)}>
          <summary className="min-h-10 cursor-pointer font-bold">{t("title")}</summary>
          {status && status !== "danke" && (
            <p role="alert" className="mt-2 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold">
              {t(status === "limit" ? "limit" : status === "aus" ? "unavailable" : "invalid")}
            </p>
          )}
          <form action={reportAction} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="activityId" value={activityId} />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm text-muted">{t("intro")}</legend>
              {REPORT_REASONS.map((r, i) => (
                <label key={r} className="flex min-h-10 items-center gap-2">
                  <input type="radio" name="reason" value={r} required defaultChecked={i === 0} className="size-4 accent-[var(--kw-primary)]" />
                  {t(`reasons.${r}`)}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("messageLabel")}
              <textarea name="message" maxLength={500} rows={3} className="rounded-2xl border-2 border-line bg-surface px-3 py-2 font-normal" />
            </label>
            <button type="submit" className="min-h-11 w-fit rounded-full border-2 border-line bg-surface px-5 font-bold">
              {t("send")}
            </button>
          </form>
        </details>
      )}
    </section>
  );
}
