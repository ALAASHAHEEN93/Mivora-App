import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";
import { pendingEmail } from "@/server/auth/pending";
import { confirmCode, requestCode, restartSignIn } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title"), robots: { index: false } };
}

const input =
  "min-h-14 w-full rounded-2xl border-2 border-line bg-surface px-4 text-lg font-bold shadow-[0_6px_18px_-10px_rgba(42,47,58,0.35)] focus:border-accent focus:outline-none";
const primaryBtn =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-lg font-bold text-on-primary shadow-[0_10px_24px_-10px_var(--kw-primary)] transition active:scale-[0.98]";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ schritt?: string; fehler?: string }>;
}) {
  const { locale } = await params;
  const { schritt, fehler } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  if (await getCurrentUser()) redirect({ href: "/profil", locale });

  const email = schritt === "code" ? await pendingEmail() : null;
  const errorKey =
    fehler === "email" ? "invalidEmail" : fehler === "zu-viele" ? "rateLimited" : fehler === "code" ? "invalidCode" : fehler === "keine-db" ? "noDatabase" : fehler === "mail" ? "mailFailed" : null;

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 bg-[linear-gradient(180deg,var(--kw-hero)_0%,var(--kw-bg)_45%)] px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link href="/profil" className="inline-flex w-fit min-h-11 items-center gap-1 font-bold text-muted">
        <Icon name="back" />
        {t("back")}
      </Link>

      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-surface shadow-lg">
          <Mascot className="size-20" mood={email ? "wow" : "happy"} />
        </span>
        <h1 className="font-display text-3xl font-bold">{email ? t("codeTitle") : t("title")}</h1>
        <p className="text-muted">{email ? t("codeSent", { email }) : t("intro")}</p>
      </div>

      {errorKey && (
        <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-3 font-bold">
          {t(errorKey)}
        </p>
      )}

      {!accountsAvailable() ? null : email ? (
        <>
          <form action={confirmCode} className="flex flex-col gap-3">
            <input type="hidden" name="locale" value={locale} />
            <label htmlFor="code" className="font-bold">
              {t("codeLabel")}
            </label>
            <input
              id="code"
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              dir="ltr"
              className={`${input} text-center text-3xl tracking-[0.5em]`}
            />
            <button type="submit" className={primaryBtn}>
              {t("verify")}
            </button>
          </form>
          <form action={restartSignIn}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="min-h-11 w-full font-bold text-accent underline underline-offset-4">
              {t("otherEmail")}
            </button>
          </form>
        </>
      ) : (
        <form action={requestCode} className="flex flex-col gap-3">
          <input type="hidden" name="locale" value={locale} />
          <label htmlFor="email" className="font-bold">
            {t("emailLabel")}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" dir="ltr" placeholder={t("emailPlaceholder")} className={input} />
          <button type="submit" className={primaryBtn}>
            {t("sendCode")}
            <Icon name="forward" className="size-5" />
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted">{t("privacy")}</p>
      {process.env.NODE_ENV === "development" && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-4 text-center text-sm">
          <p>{t("devMailHint")}</p>
          {email && (
            // Development only: codes never reach real inboxes until an email service is set up.
            <a href="http://localhost:8025" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-sun-400 px-5 font-bold text-[#1f2340]">
              {t("devMailOpen")}
            </a>
          )}
        </div>
      )}
    </main>
  );
}
