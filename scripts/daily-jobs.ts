/**
 * Daily email jobs. Run once a day around 18:00 Berlin time:
 *   pnpm jobs:daily
 * On the server: `docker compose -f deploy/compose.yml --env-file deploy/.env run --rm jobs` from cron.
 */
import { config } from "dotenv";
import nodemailer from "nodemailer";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { sendRecheckRequests, sendTomorrowReminders, type OutgoingMail } from "../src/server/jobs";

config({ path: ".env.local", quiet: true });
const { DATABASE_URL, SMTP_URL, EMAIL_FROM } = process.env;
if (!DATABASE_URL || !SMTP_URL || !EMAIL_FROM) throw new Error("DATABASE_URL, SMTP_URL and EMAIL_FROM must be set");
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
const transport = nodemailer.createTransport(SMTP_URL);
const send = async (m: OutgoingMail) => {
  await transport.sendMail({ from: EMAIL_FROM, to: m.to, subject: m.subject, text: m.text });
};

try {
  const reminders = await sendTomorrowReminders(db, send, appUrl);
  const rechecks = await sendRecheckRequests(db, send, appUrl);
  console.log(`${new Date().toISOString()} reminders sent: ${reminders}, re-check requests sent: ${rechecks}`);
} finally {
  await db.$disconnect();
}
