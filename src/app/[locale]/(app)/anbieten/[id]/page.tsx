import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { getPrisma } from "@/data/db/client";
import { berlinDate } from "@/domain/time";
import { isAdmin, submissionFormValues } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";
import { ListingForm } from "../ListingForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "provider" });
  return { title: t("editTitle"), robots: { index: false } };
}

/** Edit screen for the provider's own listing (anyone else gets "not found"). */
export default async function EditListingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) notFound();
  const data = await submissionFormValues(getPrisma(), user.id, id);
  if (!data) notFound();
  const t = await getTranslations("provider");
  const admin = isAdmin(user.email);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/anbieten" className="inline-flex w-fit items-center gap-1 font-bold text-muted">
        <Icon name="back" />
        {t("mineTitle")}
      </Link>
      <h1 className="font-display text-3xl font-bold">{t("editTitle")}</h1>
      <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{admin ? t("editHintAdmin") : t("editHint")}</p>
      {data.photoSrc && (
        <div className="flex items-center gap-3 text-sm text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- own photo, may be unpublished */}
          <img src={data.photoSrc} alt="" className="size-16 rounded-xl object-cover" />
          {t("currentPhoto")}
        </div>
      )}
      <ListingForm today={berlinDate(new Date())} isAdmin={admin} initial={data.values} editId={id} />
    </div>
  );
}
