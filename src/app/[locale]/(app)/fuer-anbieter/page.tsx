import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { InfoCard, contactHref } from "@/components/InfoBits";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "providersInfo" });
  return { title: t("title"), description: t("lead") };
}

/**
 * For providers: how a club, school or museum gets its activities into Mivora.
 * Listings are only added with the provider's consent; no pricing is promised during the test phase.
 */
export default async function ForProvidersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("providersInfo");
  const contact = contactHref(t("mailSubject"));
  const steps = ["s1", "s2", "s3", "s4"] as const;

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5">
      <header className="flex flex-col gap-3 rounded-[2rem] bg-[#dcefea] p-6 text-[#263847]">
        <h1 className="font-display text-4xl font-bold">{t("title")}</h1>
        <p className="text-lg text-[#3e5260]">{t("lead")}</p>
      </header>

      <InfoCard icon="heart" tint="bg-[#fde3d8]" title={t("benefitsTitle")}>
        <ul>
          {(["b1", "b2", "b3", "b4"] as const).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </InfoCard>

      <section aria-labelledby="steps-h" className="mv-reveal flex flex-col gap-3">
        <h2 id="steps-h" className="font-display text-2xl font-bold">
          {t("stepsTitle")}
        </h2>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-start gap-4 rounded-[1.5rem] bg-surface p-4 shadow-[0_3px_10px_-6px_rgba(42,47,58,0.35)]">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#263847] bg-[#f3d077] font-display text-lg font-bold text-[#263847]">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{t(`${s}Title`)}</h3>
                <p className="text-muted">{t(`${s}Text`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <InfoCard icon="check" tint="bg-[#dcefea]" title={t("promiseTitle")}>
        <p>{t("promiseText")}</p>
      </InfoCard>

      <p role="note" className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">
        {t("testNote")}
      </p>

      <section className="mv-reveal flex flex-col gap-3 rounded-[2rem] bg-[#f2a68a] p-6 text-[#263847]">
        <h2 className="font-display text-2xl font-bold">{t("ctaTitle")}</h2>
        <a
          href={contact.href}
          {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#263847] px-6 font-bold text-[#fff3ea]"
        >
          {contact.external ? t("ctaCaseStudy") : t("ctaMail")}
          <Icon name={contact.external ? "external" : "forward"} className="size-4 rtl:rotate-180" />
        </a>
      </section>

      <Link href="/ueber" className="w-fit font-bold underline underline-offset-4">
        {t("aboutLink")}
      </Link>
    </article>
  );
}
