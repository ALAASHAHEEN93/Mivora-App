import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/illustrations/Mascot";
import { InfoCard, contactHref } from "@/components/InfoBits";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("lead") };
}

/** About Mivora: what it is, why, principles, who is behind it, honest status, contact. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const contact = contactHref(t("mailSubject"));

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5">
      <header className="relative flex flex-col items-start gap-3 overflow-hidden rounded-[2rem] bg-[var(--kw-sky)] p-6 text-[#263847] mv-daylight">
        <span aria-hidden="true" className="mv-float absolute end-5 top-5">
          <Mascot className="size-14" mood="wow" />
        </span>
        <h1 className="pe-16 font-display text-4xl font-bold">{t("title")}</h1>
        <p className="mv-sticker text-xl text-[#fff3ea]">{t("slogan")}</p>
        <p className="text-lg text-[#3e5260]">{t("lead")}</p>
      </header>

      <InfoCard icon="search" tint="bg-[#fbefc9]" title={t("whatTitle")}>
        <p>{t("whatText")}</p>
      </InfoCard>
      <InfoCard icon="heart" tint="bg-[#fde3d8]" title={t("whyTitle")}>
        <p>{t("whyText")}</p>
      </InfoCard>
      <InfoCard icon="check" tint="bg-[#dcefea]" title={t("principlesTitle")}>
        <ul>
          {(["p1", "p2", "p3", "p4"] as const).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </InfoCard>
      <InfoCard icon="user" tint="bg-[#ebe5f6]" title={t("whoTitle")}>
        <p>{t("whoText")}</p>
      </InfoCard>
      <InfoCard icon="alert" tint="bg-[#fbefc9]" title={t("statusTitle")}>
        <p>{t("statusText")}</p>
      </InfoCard>

      <section className="mv-reveal flex flex-col gap-3 rounded-[2rem] bg-[#f2a68a] p-6 text-[#263847]">
        <h2 className="font-display text-2xl font-bold">{t("contactTitle")}</h2>
        <p>{t("contactText")}</p>
        <a
          href={contact.href}
          {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#263847] px-6 font-bold text-[#fff3ea]"
        >
          {contact.external ? t("contactCaseStudy") : t("contactMail")}
          <Icon name={contact.external ? "external" : "forward"} className="size-4 rtl:rotate-180" />
        </a>
      </section>

      <Link href="/fuer-anbieter" className="mv-press flex items-center gap-3 rounded-[1.75rem] border-2 border-line bg-surface p-5 font-bold">
        <Icon name="home" className="size-6 shrink-0 text-accent" />
        <span>{t("providersLink")}</span>
        <Icon name="forward" className="ms-auto size-5 shrink-0 rtl:rotate-180" />
      </Link>
    </article>
  );
}
