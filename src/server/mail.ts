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

/** Booking request to a provider. Reply-To is the parent, who agreed to share their address. */
export async function sendInquiryEmail(input: {
  to: string;
  providerLocale: string;
  parentEmail: string;
  title: string;
  sessionLabel: string | null;
  childAge: number | null;
  message: string;
}) {
  const url = process.env.SMTP_URL;
  const from = process.env.EMAIL_FROM;
  if (!url || !from) throw new Error("SMTP_URL and EMAIL_FROM must be set to send booking requests");
  const t = await getTranslations({ locale: input.providerLocale, namespace: "inquiryEmail" });
  const lines = [
    t("intro", { title: input.title }),
    "",
    input.sessionLabel ? `${t("date")}: ${input.sessionLabel}` : null,
    input.childAge !== null ? `${t("childAge")}: ${input.childAge}` : null,
    "",
    input.message,
    "",
    t("replyHint"),
    "– Mivora",
  ].filter((l): l is string => l !== null);
  await nodemailer.createTransport(url).sendMail({
    from,
    to: input.to,
    replyTo: input.parentEmail,
    subject: t("subject", { title: input.title }),
    text: lines.join("\n"),
  });
}
