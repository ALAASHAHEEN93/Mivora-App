import "server-only";
import { cookies } from "next/headers";
import { normalizeEmail } from "./crypto";

/** Holds the email between "send code" and "enter code", so it never appears in a URL. */
export const PENDING_COOKIE = "mv_login_email";

export async function pendingEmail() {
  return normalizeEmail((await cookies()).get(PENDING_COOKIE)?.value);
}
