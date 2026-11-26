import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EmptyState, buttonSecondary } from "@/components/ui";

export default function ActivityNotFound() {
  const t = useTranslations();
  return (
    <EmptyState
      art="lost"
      title={t("activity.notFound")}
      text={t("explore.emptyText")}
      action={
        <Link href="/entdecken" className={buttonSecondary}>
          {t("saved.browse")}
        </Link>
      }
    />
  );
}
