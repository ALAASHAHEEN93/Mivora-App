"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global {
  interface Window {
    __mvInstall?: InstallEvent | null;
  }
}

/**
 * Registers the service worker (production builds only, so development never serves stale code)
 * and keeps the browser's install offer for the Profil card.
 */
export function ServiceWorkerSetup() {
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      window.__mvInstall = e as InstallEvent;
      window.dispatchEvent(new Event("mv-install-ready"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return null;
}

type Mode = "installed" | "prompt" | "ios" | "other" | null;

/** Profil card: one tap to install where the browser allows it, otherwise short instructions. */
export function InstallCard() {
  const t = useTranslations("common");
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const decide = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) return setMode("installed");
      if (window.__mvInstall) return setMode("prompt");
      setMode(/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other");
    };
    decide();
    window.addEventListener("mv-install-ready", decide);
    window.addEventListener("appinstalled", () => setMode("installed"));
    return () => window.removeEventListener("mv-install-ready", decide);
  }, []);

  if (mode === null) return null;
  return (
    <section className="flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
      <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#263847] text-[#f3d077]">
        <Icon name="download" className="size-7" />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="font-display text-xl font-bold">{t("installTitle")}</h2>
        {mode === "installed" ? (
          <p className="text-sm text-muted">{t("installDone")}</p>
        ) : (
          <>
            <p className="text-sm text-muted">{t("installText")}</p>
            {mode === "prompt" && (
              <button
                type="button"
                onClick={async () => {
                  const ev = window.__mvInstall;
                  if (!ev) return;
                  await ev.prompt();
                  const { outcome } = await ev.userChoice;
                  window.__mvInstall = null;
                  setMode(outcome === "accepted" ? "installed" : "other");
                }}
                className="mv-btn-3d inline-flex min-h-11 w-fit items-center rounded-full bg-primary px-5 font-bold text-on-primary"
              >
                {t("installButton")}
              </button>
            )}
            {mode === "ios" && <p className="rounded-xl bg-sun-100 p-3 text-sm">{t("installIos")}</p>}
            {mode === "other" && <p className="rounded-xl bg-sun-100 p-3 text-sm">{t("installOther")}</p>}
          </>
        )}
      </div>
    </section>
  );
}
