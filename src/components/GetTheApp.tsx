import { headers } from "next/headers";
import QRCode from "qrcode";
import { getLocale, getTranslations } from "next-intl/server";

/** The address this app is served from, so the QR code works on the test server and later online. */
async function appUrl(locale: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}/${locale}`;
}

async function qrSvg(url: string, size: number) {
  return QRCode.toString(url, { type: "svg", margin: 1, width: size, errorCorrectionLevel: "M", color: { dark: "#263847", light: "#fffdfb" } });
}

/**
 * Desktop invitation to put Mivora on the phone: QR code to the app plus two steps.
 * Honest: no App Store / Google Play badges until those apps exist.
 */
export async function GetTheApp({ variant }: { variant: "hero" | "footer" }) {
  const locale = await getLocale();
  const t = await getTranslations("getApp");
  const url = await appUrl(locale);

  if (variant === "footer") {
    const svg = await qrSvg(url, 96);
    return (
      <div className="flex flex-col gap-2">
        <h2 className="mb-1 font-display text-lg font-bold text-[#f3d077]">{t("footerTitle")}</h2>
        <div className="flex items-center gap-3">
          <span role="img" aria-label={t("qrAlt")} className="block size-24 shrink-0 overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-sm text-[#d9e3e8]">{t("footerText")}</p>
        </div>
      </div>
    );
  }

  const svg = await qrSvg(url, 132);
  return (
    <aside aria-labelledby="get-app-h" className="flex w-[380px] items-center gap-5 rounded-[2rem] border-2 border-[#263847] bg-[#fffdfb] p-5 text-[#263847] shadow-[0_6px_0_#263847]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static preview of our own app */}
      <img src="/app-preview.webp" alt={t("previewAlt")} width={120} height={260} className="h-[260px] w-[120px] shrink-0 rounded-[1.4rem] border-4 border-[#263847] object-cover object-top" />
      <div className="flex min-w-0 flex-col gap-3">
        <h2 id="get-app-h" className="font-display text-xl font-bold leading-tight">
          {t("title")}
        </h2>
        <span role="img" aria-label={t("qrAlt")} className="block size-[132px] overflow-hidden rounded-2xl border-2 border-[#263847]" dangerouslySetInnerHTML={{ __html: svg }} />
        <ol className="flex flex-col gap-1.5 text-sm text-[#3e5260]">
          <li className="flex gap-2">
            <b className="grid size-5 shrink-0 place-items-center rounded-full bg-[#f3d077] text-xs text-[#263847]">1</b>
            {t("step1")}
          </li>
          <li className="flex gap-2">
            <b className="grid size-5 shrink-0 place-items-center rounded-full bg-[#f3d077] text-xs text-[#263847]">2</b>
            {t("step2")}
          </li>
        </ol>
        <p className="text-xs font-semibold text-[#3e5260]">{t("note")}</p>
      </div>
    </aside>
  );
}
