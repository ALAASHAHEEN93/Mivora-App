import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { SavedList } from "./SavedList";

export const revalidate = 300;

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saved");
  // Demo scale: send all visible listings and filter on the device.
  // Replaced by a per-account query once family accounts exist (step 6).
  const all = await activityRepository.search({});

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="text-sm text-muted">{t("deviceNote")}</p>
      <SavedList all={all} />
    </div>
  );
}
