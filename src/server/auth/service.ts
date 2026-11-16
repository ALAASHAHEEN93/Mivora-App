import type { PrismaClient } from "@/generated/prisma/client";
import {
  CODE_TTL_MS,
  CODE_WINDOW_MS,
  MAX_CODE_ATTEMPTS,
  MAX_CODES_PER_WINDOW,
  SESSION_TTL_MS,
  generateCode,
  hashCode,
  hashToken,
  newSessionToken,
  sameHash,
} from "./crypto";

export type RequestCodeResult = { ok: true; code: string } | { ok: false; reason: "rate_limited" };

/** Creates a sign-in code for an (already normalized) email. The caller emails it. */
export async function createLoginCode(db: PrismaClient, email: string, secret: string, now = new Date()): Promise<RequestCodeResult> {
  const recent = await db.loginCode.count({ where: { email, createdAt: { gt: new Date(now.getTime() - CODE_WINDOW_MS) } } });
  if (recent >= MAX_CODES_PER_WINDOW) return { ok: false, reason: "rate_limited" };
  const code = generateCode();
  await db.loginCode.create({
    data: { email, codeHash: hashCode(email, code, secret), expiresAt: new Date(now.getTime() + CODE_TTL_MS), createdAt: now },
  });
  return { ok: true, code };
}

export type VerifyResult = { ok: true; token: string; userId: string } | { ok: false };

/** Checks the newest open code; on success creates the user if needed and a new session. */
export async function verifyLoginCode(
  db: PrismaClient,
  email: string,
  code: string,
  secret: string,
  locale: string,
  now = new Date(),
): Promise<VerifyResult> {
  if (!/^\d{6}$/.test(code)) return { ok: false };
  const open = await db.loginCode.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });
  if (!open || open.attempts >= MAX_CODE_ATTEMPTS) return { ok: false };

  if (!sameHash(open.codeHash, hashCode(email, code, secret))) {
    await db.loginCode.update({ where: { id: open.id }, data: { attempts: { increment: 1 } } });
    return { ok: false };
  }

  // Single use: only succeeds if nobody else consumed it in the meantime.
  const consumed = await db.loginCode.updateMany({ where: { id: open.id, usedAt: null }, data: { usedAt: now } });
  if (consumed.count !== 1) return { ok: false };

  const user = await db.user.upsert({ where: { email }, update: {}, create: { email, locale } });
  const token = newSessionToken();
  await db.authSession.create({
    data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
  });
  return { ok: true, token, userId: user.id };
}

export async function userForSessionToken(db: PrismaClient, token: string, now = new Date()) {
  const session = await db.authSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= now) return null;
  return session.user;
}

export async function endSession(db: PrismaClient, token: string) {
  await db.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}
