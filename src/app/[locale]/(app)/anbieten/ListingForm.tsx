"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ACCESSIBILITY_TAGS, CATEGORY_SLUGS } from "@/domain/types";
import { KOELN_DISTRICTS, MAX_REPEAT_WEEKS } from "@/domain/submission";
import { localeNames, locales } from "@/i18n/routing";
import { submitListing, type SubmitState } from "./actions";

const field =
  "min-h-12 w-full rounded-2xl border-2 border-line bg-surface px-4 font-semibold focus:border-accent focus:outline-none aria-[invalid=true]:border-[#b3261e]";
const chip =
  "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-surface px-3 text-sm font-bold has-[:checked]:border-accent has-[:checked]:bg-teal-100";

export function ListingForm({ today, isAdmin = false }: { today: string; isAdmin?: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitListing, null);
  const v = state?.values ?? {};
  const err = state?.errors ?? {};
  const one = (k: string, d = "") => (typeof v[k] === "string" ? (v[k] as string) : d);
  const many = (k: string, d: string[] = []) => (Array.isArray(v[k]) ? (v[k] as string[]) : state ? [] : d);
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  // React resets the form after each submit, which empties the file field: drop the stale preview too.
  useEffect(() => setPreview(null), [state]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setLocalError(null);
    if (!f) return setPreview(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      e.target.value = "";
      setPreview(null);
      return setLocalError("badType");
    }
    if (f.size > 5 * 1024 * 1024) {
      e.target.value = "";
      setPreview(null);
      return setLocalError("tooBig");
    }
    setPreview(URL.createObjectURL(f));
  }
  function clearPhoto() {
    if (fileRef.current) fileRef.current.value = "";
    setPreview(null);
    setLocalError(null);
  }
  const errId = (k: string) => `${uid}-${k}-err`;
  const a11y = (k: string) => (err[k] ? { "aria-invalid": true, "aria-describedby": errId(k) } : {});
  const Err = ({ k }: { k: string }) =>
    err[k] ? (
      <span id={errId(k)} className="text-sm font-bold text-[#b3261e]">
        {t(`provider.errors.${err[k]}`)}
      </span>
    ) : null;

  const text = (name: string, label: string, opts: { max: number; area?: boolean; hint?: string; dir?: "ltr" } = { max: 80 }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${uid}-${name}`} className="font-bold">
        {label}
      </label>
      {opts.area ? (
        <textarea id={`${uid}-${name}`} name={name} maxLength={opts.max} rows={5} defaultValue={one(name)} className={`${field} py-3`} {...a11y(name)} />
      ) : (
        <input id={`${uid}-${name}`} name={name} maxLength={opts.max} defaultValue={one(name)} dir={opts.dir} className={field} {...a11y(name)} />
      )}
      {opts.hint && <span className="text-sm text-muted">{opts.hint}</span>}
      <Err k={name} />
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <fieldset className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
      <legend className="float-left mb-1 w-full font-display text-xl font-bold">{title}</legend>
      {children}
    </fieldset>
  );

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {state && (Object.keys(err).length > 0 || state.limit) && (
        <p role="alert" className="rounded-2xl bg-[#fde7e7] px-4 py-3 font-bold text-[#7a1712]">
          {state.limit ? t("provider.limit") : t("provider.errorsTitle")}
        </p>
      )}

      {section(
        t("provider.sectionAbout"),
        <>
          {text("orgName", t("provider.orgName"))}
          {text("title", t("provider.titleLabel"))}
          {text("summary", t("provider.summaryLabel"), { max: 160 })}
          {text("description", t("provider.descriptionLabel"), { max: 2000, area: true })}
          <details className="rounded-2xl border-2 border-dashed border-line p-4" open={Boolean(one("titleEn") || err.titleEn || err.summaryEn || err.descriptionEn)}>
            <summary className="min-h-10 cursor-pointer font-bold">{t("provider.enToggle")}</summary>
            <div className="mt-3 flex flex-col gap-4" lang="en">
              {text("titleEn", t("provider.titleEn"))}
              {text("summaryEn", t("provider.summaryEn"), { max: 160 })}
              {text("descriptionEn", t("provider.descriptionEn"), { max: 2000, area: true })}
            </div>
          </details>
        </>,
      )}

      {section(
        t("provider.sectionPhoto"),
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-photo`} className="font-bold">
              {t("provider.photoLabel")}
            </label>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element -- local preview of the picked file
              <img src={preview} alt="" className="aspect-[16/10] w-full rounded-2xl object-cover" />
            )}
            <input
              ref={fileRef}
              id={`${uid}-photo`}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPick}
              aria-describedby={`${uid}-photo-hint${err.photo || localError ? ` ${errId("photo")}` : ""}`}
              className="w-full rounded-2xl border-2 border-dashed border-line bg-bg p-3 text-sm file:me-3 file:min-h-10 file:rounded-full file:border-0 file:bg-primary file:px-4 file:font-bold file:text-on-primary"
            />
            <span id={`${uid}-photo-hint`} className="text-sm text-muted">
              {t("provider.photoHint")}
            </span>
            {(localError || err.photo) && (
              <span id={errId("photo")} className="text-sm font-bold text-[#b3261e]">
                {t(`provider.errors.${localError ?? err.photo}`)}
              </span>
            )}
            {state?.hadPhoto && !preview && Object.keys(err).length > 0 && <span className="text-sm font-bold">{t("provider.photoReselect")}</span>}
            {preview && (
              <>
                <button type="button" onClick={clearPhoto} className="min-h-10 w-fit rounded-full border-2 border-line px-4 text-sm font-bold">
                  {t("provider.photoRemove")}
                </button>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="confirmPhoto" value="yes" className="mt-1 size-5 shrink-0 accent-[var(--kw-primary)]" {...a11y("confirmPhoto")} />
                  <span className="flex flex-col gap-1">
                    <span>{t("provider.confirmPhoto")}</span>
                    <Err k="confirmPhoto" />
                  </span>
                </label>
              </>
            )}
          </div>
        </>,
      )}

      {section(
        t("provider.sectionWho"),
        <>
          <div className="flex flex-col gap-2" role="group" aria-labelledby={`${uid}-cats`} {...(err.categories ? { "aria-describedby": errId("categories") } : {})}>
            <span id={`${uid}-cats`} className="font-bold">
              {t("provider.categoriesLabel")}
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_SLUGS.map((c) => (
                <label key={c} className={chip}>
                  <input type="checkbox" name="categories" value={c} defaultChecked={many("categories").includes(c)} className="size-4 accent-[var(--kw-primary)]" />
                  {t(`categories.${c}`)}
                </label>
              ))}
            </div>
            <Err k="categories" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-ageMin`} className="font-bold">{t("provider.ageMinLabel")}</label>
              <input id={`${uid}-ageMin`} name="ageMin" type="number" inputMode="numeric" min={0} max={17} defaultValue={one("ageMin")} className={field} {...a11y("ageMin")} />
              <Err k="ageMin" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-ageMax`} className="font-bold">{t("provider.ageMaxLabel")}</label>
              <input id={`${uid}-ageMax`} name="ageMax" type="number" inputMode="numeric" min={0} max={17} defaultValue={one("ageMax")} className={field} {...a11y("ageMax")} />
              <Err k="ageMax" />
            </div>
          </div>
          <div className="flex flex-col gap-2" role="group" aria-labelledby={`${uid}-langs`}>
            <span id={`${uid}-langs`} className="font-bold">
              {t("provider.languagesLabel")}
            </span>
            <div className="flex flex-wrap gap-2">
              {locales.map((l) => (
                <label key={l} className={chip} lang={l}>
                  <input type="checkbox" name="languages" value={l} defaultChecked={many("languages", ["de"]).includes(l)} className="size-4 accent-[var(--kw-primary)]" />
                  {localeNames[l]}
                </label>
              ))}
            </div>
            <Err k="languages" />
          </div>
          <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={`${uid}-set`}>
            <span id={`${uid}-set`} className="font-bold">
              {t("activity.settingLabel")}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["indoor", "outdoor", "both"] as const).map((s) => (
                <label key={s} className={chip}>
                  <input type="radio" name="setting" value={s} defaultChecked={one("setting", "indoor") === s} className="size-4 accent-[var(--kw-primary)]" />
                  {t(`setting.${s}`)}
                </label>
              ))}
            </div>
            <Err k="setting" />
          </div>
          <div className="flex flex-col gap-2" role="group" aria-labelledby={`${uid}-acc`}>
            <span id={`${uid}-acc`} className="font-bold">
              {t("activity.accessibilityLabel")}
            </span>
            <div className="flex flex-wrap gap-2">
              {ACCESSIBILITY_TAGS.map((a) => (
                <label key={a} className={chip}>
                  <input type="checkbox" name="accessibility" value={a} defaultChecked={many("accessibility").includes(a)} className="size-4 accent-[var(--kw-primary)]" />
                  {t(`access.${a}`)}
                </label>
              ))}
            </div>
          </div>
        </>,
      )}

      {section(
        t("provider.sectionWhere"),
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-district`} className="font-bold">{t("provider.districtLabel")}</label>
            <select id={`${uid}-district`} name="district" defaultValue={one("district")} className={field} {...a11y("district")}>
              <option value="">{t("provider.districtPick")}</option>
              {KOELN_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <Err k="district" />
          </div>
          {text("venueName", t("provider.venueNameLabel"))}
          {text("street", t("provider.streetLabel"), { max: 100 })}
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-postalCode`} className="font-bold">{t("provider.postalLabel")}</label>
            <input id={`${uid}-postalCode`} name="postalCode" inputMode="numeric" maxLength={5} defaultValue={one("postalCode")} dir="ltr" className={field} {...a11y("postalCode")} />
            <Err k="postalCode" />
          </div>
        </>,
      )}

      {section(
        t("provider.sectionWhen"),
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-firstDate`} className="font-bold">{t("provider.firstDateLabel")}</label>
            <input id={`${uid}-firstDate`} name="firstDate" type="date" min={today} defaultValue={one("firstDate")} className={field} {...a11y("firstDate")} />
            <Err k="firstDate" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-startTime`} className="font-bold">{t("provider.startLabel")}</label>
              <input id={`${uid}-startTime`} name="startTime" type="time" defaultValue={one("startTime")} className={field} {...a11y("startTime")} />
              <Err k="startTime" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-endTime`} className="font-bold">{t("provider.endLabel")}</label>
              <input id={`${uid}-endTime`} name="endTime" type="time" defaultValue={one("endTime")} className={field} {...a11y("endTime")} />
              <Err k="endTime" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-repeatWeeks`} className="font-bold">{t("provider.repeatLabel")}</label>
            <select id={`${uid}-repeatWeeks`} name="repeatWeeks" defaultValue={one("repeatWeeks", "1")} className={field} {...a11y("repeatWeeks")}>
              {Array.from({ length: MAX_REPEAT_WEEKS }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted">{t("provider.repeatHint")}</span>
            <Err k="repeatWeeks" />
          </div>
        </>,
      )}

      {section(
        t("provider.sectionBooking"),
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("activity.priceLabel")}>
            {(["free", "paid"] as const).map((k) => (
              <label key={k} className={chip}>
                <input type="radio" name="priceKind" value={k} defaultChecked={one("priceKind", "free") === k} className="peer size-4 accent-[var(--kw-primary)]" />
                {k === "free" ? t("provider.priceFree") : t("provider.pricePaid")}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-priceEuro`} className="font-bold">{t("provider.priceLabel")}</label>
              <input id={`${uid}-priceEuro`} name="priceEuro" inputMode="decimal" placeholder="0,00" defaultValue={one("priceEuro")} dir="ltr" className={field} {...a11y("priceEuro")} />
              <Err k="priceEuro" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-priceUnit`} className="font-bold">{t("provider.priceUnitLabel")}</label>
              <select id={`${uid}-priceUnit`} name="priceUnit" defaultValue={one("priceUnit", "perChild")} className={field} {...a11y("priceUnit")}>
                {(["perChild", "perFamily", "perSession"] as const).map((u) => (
                  <option key={u} value={u}>
                    {t(`common.${u}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {text("bookingUrl", t("provider.bookingUrlLabel"), { max: 300, hint: t("provider.bookingHint"), dir: "ltr" })}
          {text("cancellation", t("provider.cancellationLabel"), { max: 500, area: true })}
        </>,
      )}

      {section(
        t("provider.sectionConfirm"),
        <>
          {(["confirmRights", "confirmReview"] as const).map((k) => (
            <label key={k} className="flex items-start gap-3">
              <input type="checkbox" name={k} value="yes" defaultChecked={one(k) === "yes"} className="mt-1 size-5 shrink-0 accent-[var(--kw-primary)]" {...a11y(k)} />
              <span className="flex flex-col gap-1">
                <span>{t(`provider.${k}`)}</span>
                <Err k={k} />
              </span>
            </label>
          ))}
        </>,
      )}

      {isAdmin && (
        <label className="flex items-start gap-3 rounded-3xl border-2 border-dashed border-accent bg-sun-100 p-4">
          <input type="checkbox" name="publishNow" value="yes" defaultChecked={state ? one("publishNow") === "yes" : true} className="mt-1 size-5 shrink-0 accent-[var(--kw-primary)]" />
          <span className="flex flex-col gap-1">
            <span className="font-bold">{t("provider.publishNow")}</span>
            <span className="text-sm text-muted">{t("provider.publishNowHint")}</span>
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-6 text-lg font-bold text-on-primary mv-btn-3d transition active:scale-[0.98] disabled:opacity-60"
      >
        {t("provider.submit")}
      </button>
    </form>
  );
}
