import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="rounded-2xl bg-lav-100 p-4">{t("intro")}</p>
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold">{t("languageLabel")}</h2>
        <div>
          <LanguageSwitcher />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold">{t("privacyTitle")}</h2>
        <p>{t("privacyText")}</p>
      </section>
    </div>
  );
}
