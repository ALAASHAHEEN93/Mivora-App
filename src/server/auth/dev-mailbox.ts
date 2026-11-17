/**
 * True only while developing locally with the local test mailbox (Mailpit).
 * Then sign-in codes can never reach a real inbox, so the code screen may show the code.
 * Always false in production builds (NODE_ENV=production) and with a real SMTP host.
 */
export function usesLocalTestMailbox(env: { NODE_ENV?: string; SMTP_URL?: string } = process.env): boolean {
  if (env.NODE_ENV !== "development" || !env.SMTP_URL) return false;
  try {
    const host = new URL(env.SMTP_URL).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

/** Dev-only cookie holding the last code so the code screen can show it. */
export const DEV_CODE_COOKIE = "mv_dev_code";
