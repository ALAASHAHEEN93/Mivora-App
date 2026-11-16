import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityRepository } from "@/data/repository";
import { berlinDate } from "@/domain/time";
import { Calendar } from "./Calendar";

/** Listings depend on the current date: regenerate at most every 5 minutes. */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calendar" });
  return { title: t("title") };
}

export default async function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  // Demo scale: all published listings go to the device. With a database this
  // becomes a query for the visible month + the family's planned items.
  const activities = await activityRepository.allPublished(now);
  return <Calendar activities={activities} today={berlinDate(now)} nowIso={now.toISOString()} />;
}
