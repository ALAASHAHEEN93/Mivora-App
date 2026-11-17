"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ActivityResult } from "@/domain/filters";
import { pickContent } from "@/domain/localize";
import { formatSessionStart } from "@/domain/format";

const CONSENT_KEY = "mv.mapConsent.v1";

function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}

/**
 * Map of activities (Leaflet + OpenStreetMap tiles). Tiles come from a third party, so the
 * map loads only after the parent agrees (two-click). Popups are built with textContent,
 * never HTML, so listing text can't inject markup.
 */
export function MapView({ results, me }: { results: ActivityResult[]; me: { lat: number; lng: number } | null }) {
  const t = useTranslations("explore");
  const locale = useLocale();
  const box = useRef<HTMLDivElement>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => setConsent(readConsent()), []);

  useEffect(() => {
    if (!consent || !box.current) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !box.current) return;
      map = L.map(box.current, { scrollWheelZoom: false }).setView([50.9375, 6.9603], 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const pin = (cls: string) => L.divIcon({ className: "", html: `<span class="${cls}"></span>`, iconSize: [26, 26], iconAnchor: [13, 26] });
      const bounds: [number, number][] = [];
      for (const { activity, sessions } of results) {
        const { lat, lng } = activity.venue;
        bounds.push([lat, lng]);
        const card = document.createElement("div");
        const link = document.createElement("a");
        link.href = `/${locale}/aktivitaet/${activity.slug}`;
        link.textContent = pickContent(activity, locale).text.title;
        link.className = "mv-map-title";
        const when = document.createElement("div");
        when.textContent = sessions[0] ? `${formatSessionStart(sessions[0].startsAt, locale)} · ${activity.venue.district}` : activity.venue.district;
        card.append(link, when);
        L.marker([lat, lng], { icon: pin("mv-map-pin"), title: link.textContent ?? "" }).bindPopup(card).addTo(map);
      }
      if (me) {
        L.marker([me.lat, me.lng], { icon: pin("mv-map-me"), title: t("you") }).addTo(map);
        bounds.push([me.lat, me.lng]);
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [consent, results, me, locale, t]);

  if (!consent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]">
        <p className="font-display text-xl font-bold">{t("mapConsentTitle")}</p>
        <p className="max-w-sm text-sm text-muted">{t("mapConsentText")}</p>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.setItem(CONSENT_KEY, "yes");
            } catch {
              /* remember for this visit only */
            }
            setConsent(true);
          }}
          className="mv-btn-3d min-h-12 rounded-full bg-primary px-6 font-bold text-on-primary"
        >
          {t("mapLoad")}
        </button>
      </div>
    );
  }
  return <div ref={box} role="region" aria-label={t("map")} className="h-[65dvh] min-h-80 w-full overflow-hidden rounded-3xl shadow-[0_8px_24px_-14px_rgba(42,47,58,0.4)]" />;
}
