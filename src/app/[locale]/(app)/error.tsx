"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { EmptyArt } from "@/components/illustrations/EmptyArt";

/** Friendly error screen instead of a blank page; logs the error for diagnosis. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("system");
  useEffect(() => {
    console.error("Mivora screen error", error.digest ?? "", error);
  }, [error]);
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[2rem] bg-surface px-6 py-12 text-center shadow-[0_10px_30px_-16px_rgba(42,47,58,0.35)]">
      <EmptyArt kind="oops" className="w-48" />
      <h1 className="font-display text-2xl font-bold">{t("errorTitle")}</h1>
      <p className="text-muted">{t("errorText")}</p>
      <button type="button" onClick={reset} className="mv-btn-3d min-h-12 rounded-full bg-primary px-6 font-bold text-on-primary">
        {t("retry")}
      </button>
    </div>
  );
}
