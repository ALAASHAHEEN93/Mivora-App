import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { Link } from "@/i18n/navigation";
import { getPrisma } from "@/data/db/client";
import { CATEGORY_SLUGS } from "@/domain/types";
import { childColor } from "@/domain/children";
import { listChildren } from "@/server/family";
import { isAdmin } from "@/server/listings";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";
import { addChildAction, deleteAccountAction, removeChildAction, signOutAction, toggleRemindersAction, updateChildAction } from "./actions";

export const dynamic = "force-dynamic";

const card = "flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]";
const primaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-bold text-on-primary transition active:scale-[0.98]";
const field = "min-h-12 w-full rounded-2xl border-2 border-line bg-bg px-4 font-semibold focus:border-accent focus:outline-none";

type ChildRow = { id: string; nickname: string | null; birthYear: number; interests: string[] };

async function ChildForm({ locale, child, action, submitLabel }: { locale: string; child?: ChildRow; action: (f: FormData) => Promise<void>; submitLabel: string }) {
  const t = await getTranslations();
  const thisYear = new Date().getUTCFullYear();
  const years = Array.from({ length: 18 }, (_, i) => thisYear - i);
  const fid = child?.id ?? "new";
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      {child && <input type="hidden" name="childId" value={child.id} />}
      <div className="flex flex-col gap-1">
        <label htmlFor={`nick-${fid}`} className="font-bold">
          {t("family.nickname")}
        </label>
        <input id={`nick-${fid}`} name="nickname" maxLength={30} defaultValue={child?.nickname ?? ""} autoComplete="off" aria-describedby={`nick-hint-${fid}`} className={field} />
        <span id={`nick-hint-${fid}`} className="text-sm text-muted">
          {t("family.nicknameHint")}
        </span>
      </div>
      <label className="flex flex-col gap-1 font-bold">
        {t("family.birthYear")}
        <select name="birthYear" required defaultValue={child?.birthYear ?? thisYear - 5} className={field}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">{t("family.interests")}</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SLUGS.map((c) => (
            <label key={c} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-2 border-line px-3 text-sm font-bold has-[:checked]:border-accent has-[:checked]:bg-coral-100">
              <input type="checkbox" name="interests" value={c} defaultChecked={child?.interests.includes(c)} className="size-4 accent-[var(--kw-accent)]" />
              {t(`categories.${c}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className={primaryBtn}>
        {submitLabel}
      </button>
    </form>
  );
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fehler?: string; geloescht?: string }>;
}) {
  const { locale } = await params;
  const { fehler, geloescht } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const user = await getCurrentUser();
  const children = user ? await listChildren(getPrisma(), user.id) : [];
  const thisYear = new Date().getUTCFullYear();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("profile.title")}</h1>

      {geloescht && (
        <p role="status" className="rounded-2xl bg-teal-100 px-4 py-3 font-bold">
          {t("family.deletedDone")}
        </p>
      )}
      {fehler && (
        <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-3 font-bold">
          {fehler === "bestaetigen" ? t("family.confirmMissing") : t("family.childInvalid")}
        </p>
      )}

      {!user ? (
        <section className={`${card} items-center text-center`}>
          <Mascot className="size-20" />
          <h2 className="font-display text-2xl font-bold">{t("family.accountTitle")}</h2>
          <p className="text-muted">{t("family.signInPitch")}</p>
          {accountsAvailable() ? (
            <Link href="/anmelden" className={`${primaryBtn} w-full`}>
              {t("family.signIn")}
            </Link>
          ) : (
            <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{t("auth.noDatabase")}</p>
          )}
        </section>
      ) : (
        <>
          <section className={card} aria-labelledby="account">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-on-primary" aria-hidden="true">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 id="account" className="font-display text-xl font-bold">
                  {t("family.accountTitle")}
                </h2>
                <p className="truncate text-sm text-muted" dir="ltr">
                  {user.email}
                </p>
              </div>
            </div>
          </section>

          <section className={card} aria-labelledby="kids">
            <h2 id="kids" className="font-display text-2xl font-bold">
              {t("family.childrenTitle")}
            </h2>
            <p className="text-sm text-muted">{t("family.childrenPrivacy")}</p>
            {children.length === 0 && <p className="text-muted">{t("family.noChildren")}</p>}
            <ul className="flex flex-col gap-3">
              {children.map((c, i) => (
                <li key={c.id} className="rounded-2xl p-4 text-[#263847]" style={{ background: childColor(i) }}>
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-lg font-bold">
                      {(c.nickname ?? "★").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{c.nickname ?? t("family.childFallback", { n: i + 1 })}</p>
                      <p className="text-sm">
                        {t("family.age", { age: thisYear - c.birthYear })}
                        {c.interests.length > 0 && ` · ${c.interests.map((x) => t(`categories.${x}`)).join(", ")}`}
                      </p>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="min-h-10 cursor-pointer py-2 text-sm font-bold underline underline-offset-4">{t("family.edit")}</summary>
                    <div className="mt-2 rounded-2xl bg-surface p-4 text-ink">
                      <ChildForm locale={locale} child={c} action={updateChildAction} submitLabel={t("family.save")} />
                      <form action={removeChildAction} className="mt-3">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="childId" value={c.id} />
                        <button type="submit" className="min-h-11 w-full rounded-full border-2 border-line font-bold">
                          {t("family.remove")}
                        </button>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <details className="rounded-2xl border-2 border-dashed border-line p-4" open={children.length === 0}>
              <summary className="flex min-h-10 cursor-pointer items-center gap-2 font-bold">
                <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-primary text-on-primary">
                  +
                </span>
                {t("family.addChild")}
              </summary>
              <div className="mt-3">
                <ChildForm locale={locale} action={addChildAction} submitLabel={t("family.addChild")} />
              </div>
            </details>
          </section>
        </>
      )}

      {user && (
        <section className={card}>
          <h2 className="font-display text-xl font-bold">{t("family.remindersTitle")}</h2>
          <p className="text-sm text-muted">{t("family.remindersText")}</p>
          <form action={toggleRemindersAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="enabled" value={user.remindersEnabled ? "no" : "yes"} />
            <button type="submit" role="switch" aria-checked={user.remindersEnabled} className="inline-flex min-h-12 items-center gap-3 font-bold">
              <span aria-hidden="true" className={`relative h-7 w-12 rounded-full transition ${user.remindersEnabled ? "bg-primary" : "bg-line"}`}>
                <span className={`absolute top-1 size-5 rounded-full bg-surface shadow transition-all ${user.remindersEnabled ? "start-6" : "start-1"}`} />
              </span>
              {user.remindersEnabled ? t("family.remindersOn") : t("family.remindersOff")}
            </button>
          </form>
        </section>
      )}

      <section className={card}>
        <h2 className="font-display text-xl font-bold">{t("profile.languageLabel")}</h2>
        <div>
          <LanguageSwitcher />
        </div>
      </section>

      <section className={card}>
        <h2 className="font-display text-xl font-bold">{t("profile.privacyTitle")}</h2>
        <p>{t("profile.privacyText")}</p>
        {user && (
          <>
            <a href="/api/account/export" download className="inline-flex min-h-11 items-center gap-2 font-bold text-accent underline underline-offset-4">
              <Icon name="download" className="size-5" />
              {t("family.export")}
            </a>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="min-h-12 w-full rounded-full border-2 border-line font-bold">
                {t("family.signOut")}
              </button>
            </form>
            <details className="rounded-2xl bg-coral-100 p-4">
              <summary className="min-h-10 cursor-pointer py-2 font-bold">{t("family.deleteTitle")}</summary>
              <form action={deleteAccountAction} className="mt-2 flex flex-col gap-3">
                <input type="hidden" name="locale" value={locale} />
                <p className="text-sm">{t("family.deleteText")}</p>
                <label className="flex items-start gap-2 text-sm font-bold">
                  <input type="checkbox" name="confirm" value="yes" required className="mt-0.5 size-5" />
                  {t("family.deleteConfirm")}
                </label>
                <button type="submit" className="min-h-12 rounded-full bg-[#9b1c1c] px-5 font-bold text-white">
                  {t("family.deleteButton")}
                </button>
              </form>
            </details>
          </>
        )}
      </section>

      {user && isAdmin(user.email) && (
        <Link href="/admin" className="mv-press flex items-center gap-4 rounded-3xl bg-teal-100 p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
          <Mascot className="size-12 shrink-0" />
          <span className="flex flex-col">
            <span className="font-display text-xl font-bold">{t("admin.title")}</span>
            <span className="text-sm">{t("admin.profileCta")}</span>
          </span>
          <Icon name="forward" className="ms-auto size-5 shrink-0" />
        </Link>
      )}

      <section className="flex flex-col gap-1 rounded-2xl bg-surface p-4 text-sm text-muted">
        <h2 className="mb-1 font-bold text-ink">{t("profile.legalTitle")}</h2>
        <Link href="/rechtliches/impressum" className="min-h-10 py-2 font-bold text-ink underline underline-offset-4">
          {t("footer.imprint")}
        </Link>
        <Link href="/rechtliches/datenschutz" className="min-h-10 py-2 font-bold text-ink underline underline-offset-4">
          {t("footer.privacy")}
        </Link>
        <Link href="/rechtliches/agb" className="min-h-10 py-2 font-bold text-ink underline underline-offset-4">
          {t("footer.terms")}
        </Link>
        <span className="mt-1 text-xs">{t("footer.demoNote")}</span>
      </section>
    </div>
  );
}
