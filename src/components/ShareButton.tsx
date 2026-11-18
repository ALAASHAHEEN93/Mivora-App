"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

/**
 * Opens the phone's own share sheet (WhatsApp, Messages, email …). Where that isn't
 * available (most desktop browsers), copies the link instead. Nothing is sent to Mivora.
 */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState<string | null>(null);

  async function share() {
    const url = window.location.href.split("#")[0]!.split("?")[0]!;
    const text = `${t("shareText")} ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setManual(url); // copying not allowed: show the link to copy by hand
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border-2 border-ink px-3 font-bold hover:bg-sun-100 md:px-5 ${className}`}
      >
        <Icon name="share" className="size-5" />
        <span className="max-md:sr-only">{t("share")}</span>
      </button>
      <span role="status" className={copied ? "fixed inset-x-4 bottom-36 z-30 mx-auto w-fit rounded-full bg-ink px-5 py-3 font-bold text-bg shadow-lg md:bottom-10" : "sr-only"}>
        {copied ? t("linkCopied") : ""}
      </span>
      {manual && (
        <div className="fixed inset-x-4 bottom-36 z-30 mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-surface p-3 shadow-lg md:bottom-10">
          <label className="sr-only" htmlFor="share-url">
            {t("share")}
          </label>
          <input id="share-url" readOnly value={manual} autoFocus onFocus={(e) => e.currentTarget.select()} className="min-h-11 w-full rounded-xl border-2 border-line bg-bg px-3 text-sm" dir="ltr" />
          <button type="button" onClick={() => setManual(null)} className="min-h-11 rounded-full px-3 font-bold">
            OK
          </button>
        </div>
      )}
    </>
  );
}
