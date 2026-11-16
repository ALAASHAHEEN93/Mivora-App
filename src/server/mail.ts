import "server-only";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";

/** Sends the sign-in code. In development all mail goes to the local Mailpit inbox. */
export async function sendLoginCodeEmail(to: string, code: string, locale: string) {
  const url = process.env.SMTP_URL;
  const from = process.env.EMAIL_FROM;
  if (!url || !from) throw new Error("SMTP_URL and EMAIL_FROM must be set to send sign-in codes");
  const t = await getTranslations({ locale, namespace: "email" });
  const text = `${t("greeting")}\n\n${t("body")}\n\n${code}\n\n${t("expiry")}\n\n– Mivora`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;color:#2a1e14" dir="${locale === "ar" ? "rtl" : "ltr"}">
<p>${t("greeting")}</p><p>${t("body")}</p>
<p style="font-size:32px;font-weight:800;letter-spacing:6px;background:#fff1c2;padding:12px 18px;border-radius:12px;display:inline-block">${code}</p>
<p style="color:#6b5644">${t("expiry")}</p><p>– Mivora</p></div>`;
  await nodemailer.createTransport(url).sendMail({ from, to, subject: t("subject", { code }), text, html });
}
