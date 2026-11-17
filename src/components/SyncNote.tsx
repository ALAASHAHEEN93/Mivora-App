import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";

/** Tells the parent where Saved/Calendar live: in the family account, or only on this device. */
export async function SyncNote() {
  const t = await getTranslations("sync");
  const user = await getCurrentUser();
  if (user) {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
        <Icon name="check" className="size-4" />
        {t("synced")}
      </p>
    );
  }
  return (
    <p className="text-sm text-muted">
      {t("deviceOnly")}{" "}
      {accountsAvailable() && (
        <Link href="/anmelden" className="font-bold text-accent underline underline-offset-4">
          {t("signIn")}
        </Link>
      )}
    </p>
  );
}
