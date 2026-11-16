import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getPrisma } from "@/data/db/client";
import { SESSION_TTL_MS } from "./crypto";
import { endSession, userForSessionToken } from "./service";

export const SESSION_COOKIE = "mv_session";

export function accountsAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET);
}

/** The signed-in parent for this request, or null. */
export const getCurrentUser = cache(async () => {
  if (!accountsAvailable()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return userForSessionToken(getPrisma(), token);
});

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function signOutCurrent() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && accountsAvailable()) await endSession(getPrisma(), token);
  store.delete(SESSION_COOKIE);
}
