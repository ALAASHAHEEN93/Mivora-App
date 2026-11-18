import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { berlinDate } from "@/domain/time";
import { isAdmin } from "@/server/listings";
import { getCurrentUser } from "@/server/auth/session";
import { ListingForm } from "../ListingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Admin-only: add an activity that goes live right away (no review step). */
export default async function AdminNewActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  const t = await getTranslations("admin");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/admin" className="inline-flex w-fit items-center gap-1 font-bold text-muted">
        <Icon name="back" />
        {t("title")}
      </Link>
      <h1 className="font-display text-3xl font-bold">{t("addTitle")}</h1>
      <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm">{t("addIntro")}</p>
      <ListingForm today={berlinDate(new Date())} isAdmin />
    </div>
  );
}
