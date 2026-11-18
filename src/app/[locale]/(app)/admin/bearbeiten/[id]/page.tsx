import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { getPrisma } from "@/data/db/client";
import { berlinDate } from "@/domain/time";
import { isAdmin, submissionFormValues } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";
import { ListingForm } from "../../ListingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Admin-only: edit any listing (own, provider-submitted or demo). */
export default async function EditListingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  const me = { id: user.id, email: user.email };
  const data = await submissionFormValues(getPrisma(), user.id, id, new Date(), me);
  if (!data) notFound();
  const t = await getTranslations();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/admin?tab=alle" className="inline-flex w-fit items-center gap-1 font-bold text-muted">
        <Icon name="back" />
        {t("admin.title")}
      </Link>
      <h1 className="font-display text-3xl font-bold">{t("provider.editTitle")}</h1>
      <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{t("provider.editHintAdmin")}</p>
      {data.photoSrc && (
        <div className="flex items-center gap-3 text-sm text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- may be unpublished */}
          <img src={data.photoSrc} alt="" className="size-16 rounded-xl object-cover" />
          {t("provider.currentPhoto")}
        </div>
      )}
      <ListingForm today={berlinDate(new Date())} isAdmin initial={data.values} editId={id} />
    </div>
  );
}
