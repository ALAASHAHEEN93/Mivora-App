import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { SavedList } from "./SavedList";
import { SyncNote } from "@/components/SyncNote";

export const dynamic = "force-dynamic";

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saved");
  // Demo scale: send all visible listings and filter on the device (the saved ids
  // come from the device store, which AccountSync keeps in step with the account).
  const all = await activityRepository.search({});

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <SyncNote />
      <SavedList all={all} />
    </div>
  );
}
