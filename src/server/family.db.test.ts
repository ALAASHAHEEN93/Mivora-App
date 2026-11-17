/**
 * Integration tests against a real PostgreSQL test database.
 * Run with TEST_DATABASE_URL set (CI does this); skipped otherwise.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { addChild, deleteAccount, exportAccount, listChildren, removeChild, updateChild } from "./family";
import { createLoginCode, endSession, userForSessionToken, verifyLoginCode } from "./auth/service";
import { hashToken, MAX_CODE_ATTEMPTS } from "./auth/crypto";
import { addToList, assignChildren, getLists, mergeLists, removeFromList } from "./lists";

const url = process.env.TEST_DATABASE_URL;
const SECRET = "test-secret-test-secret-test-secret-1234";

describe.skipIf(!url)("accounts & family (database)", () => {
  let db: PrismaClient;
  beforeAll(() => {
    if (!url || !/(localhost|127\.0\.0\.1|postgres)/.test(new URL(url).hostname)) throw new Error("TEST_DATABASE_URL must point to a local test database");
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  });
  afterAll(() => db?.$disconnect());
  beforeEach(async () => {
    await db.savedActivity.deleteMany();
    await db.plannedItem.deleteMany();
    await db.child.deleteMany();
    await db.authSession.deleteMany();
    await db.loginCode.deleteMany();
    await db.user.deleteMany();
  });

  async function signIn(email: string) {
    const req = await createLoginCode(db, email, SECRET);
    if (!req.ok) throw new Error("rate limited");
    const res = await verifyLoginCode(db, email, req.code, SECRET, "de");
    if (!res.ok) throw new Error("sign-in failed");
    return res;
  }

  it("signs in with a correct code, once only", async () => {
    const req = await createLoginCode(db, "a@example.invalid", SECRET);
    expect(req.ok).toBe(true);
    if (!req.ok) return;
    const first = await verifyLoginCode(db, "a@example.invalid", req.code, SECRET, "de");
    expect(first.ok).toBe(true);
    const again = await verifyLoginCode(db, "a@example.invalid", req.code, SECRET, "de");
    expect(again.ok).toBe(false);
    if (first.ok) expect((await userForSessionToken(db, first.token))?.email).toBe("a@example.invalid");
  });

  it("stores only hashes, never the code or session token", async () => {
    const req = await createLoginCode(db, "b@example.invalid", SECRET);
    if (!req.ok) throw new Error();
    const row = await db.loginCode.findFirstOrThrow();
    expect(row.codeHash).not.toContain(req.code);
    const res = await verifyLoginCode(db, "b@example.invalid", req.code, SECRET, "de");
    if (!res.ok) throw new Error();
    const session = await db.authSession.findFirstOrThrow();
    expect(session.tokenHash).toBe(hashToken(res.token));
    expect(session.tokenHash).not.toBe(res.token);
  });

  it("rejects a code for another email and locks after too many wrong tries", async () => {
    const req = await createLoginCode(db, "c@example.invalid", SECRET);
    if (!req.ok) throw new Error();
    expect((await verifyLoginCode(db, "intruder@example.invalid", req.code, SECRET, "de")).ok).toBe(false);
    const wrong = req.code === "000000" ? "111111" : "000000";
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) await verifyLoginCode(db, "c@example.invalid", wrong, SECRET, "de");
    expect((await verifyLoginCode(db, "c@example.invalid", req.code, SECRET, "de")).ok).toBe(false);
  });

  it("rate-limits code requests per email", async () => {
    for (let i = 0; i < 3; i++) expect((await createLoginCode(db, "d@example.invalid", SECRET)).ok).toBe(true);
    expect((await createLoginCode(db, "d@example.invalid", SECRET)).ok).toBe(false);
  });

  it("expired codes and ended sessions don't work", async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const req = await createLoginCode(db, "e@example.invalid", SECRET, past);
    if (!req.ok) throw new Error();
    expect((await verifyLoginCode(db, "e@example.invalid", req.code, SECRET, "de")).ok).toBe(false);
    const res = await signIn("e2@example.invalid");
    await endSession(db, res.token);
    expect(await userForSessionToken(db, res.token)).toBeNull();
  });

  it("one family can never read, change or delete another family's children", async () => {
    const anna = await signIn("anna@example.invalid");
    const ben = await signIn("ben@example.invalid");
    const annasKid = await addChild(db, anna.userId, { nickname: "Maus", birthYear: 2020, interests: ["music"] });
    expect(annasKid).not.toBeNull();

    expect(await listChildren(db, ben.userId)).toHaveLength(0);
    expect(await updateChild(db, ben.userId, annasKid!.id, { nickname: "hacked", birthYear: 2019, interests: [] })).toBe(false);
    expect(await removeChild(db, ben.userId, annasKid!.id)).toBe(false);
    expect((await exportAccount(db, ben.userId))?.children).toHaveLength(0);

    const still = await listChildren(db, anna.userId);
    expect(still).toHaveLength(1);
    expect(still[0]!.nickname).toBe("Maus");
  });

  it("deleting an account removes its children, sessions and codes but nobody else's", async () => {
    const anna = await signIn("anna@example.invalid");
    const ben = await signIn("ben@example.invalid");
    await addChild(db, anna.userId, { nickname: null, birthYear: 2018, interests: [] });
    await addChild(db, ben.userId, { nickname: "Bär", birthYear: 2017, interests: [] });

    expect(await deleteAccount(db, anna.userId)).toBe(true);
    expect(await db.user.count({ where: { id: anna.userId } })).toBe(0);
    expect(await db.child.count({ where: { userId: anna.userId } })).toBe(0);
    expect(await userForSessionToken(db, anna.token)).toBeNull();
    expect(await db.loginCode.count({ where: { email: "anna@example.invalid" } })).toBe(0);
    expect(await listChildren(db, ben.userId)).toHaveLength(1);
  });

  const PLAN = "demo-a1|2026-11-21T10:00:00+01:00|2026-11-21T10:45:00+01:00";

  it("saved and calendar lists are private to each family", async () => {
    const anna = await signIn("anna@example.invalid");
    const ben = await signIn("ben@example.invalid");
    await addToList(db, anna.userId, "saved", "demo-a7");
    await addToList(db, anna.userId, "planned", PLAN);

    expect(await getLists(db, ben.userId)).toMatchObject({ saved: [], planned: [], assignments: {} });
    await removeFromList(db, ben.userId, "saved", "demo-a7");
    await removeFromList(db, ben.userId, "planned", PLAN);
    expect(await getLists(db, anna.userId)).toMatchObject({ saved: ["demo-a7"], planned: [PLAN] });
  });

  it("merges device items once, ignores junk, and keeps the calendar key exactly", async () => {
    const anna = await signIn("anna@example.invalid");
    await addToList(db, anna.userId, "saved", "demo-a1");
    const merged = await mergeLists(db, anna.userId, { saved: ["demo-a1", "demo-a2", "<script>", 42], planned: [PLAN, "nonsense"] });
    expect(merged.saved.sort()).toEqual(["demo-a1", "demo-a2"]);
    expect(merged.planned).toEqual([PLAN]);
    const again = await mergeLists(db, anna.userId, { saved: ["demo-a2"], planned: [PLAN] });
    expect(again.saved).toHaveLength(2);
    expect(again.planned).toHaveLength(1);
  });

  it("deleting an account also deletes its saved and calendar lists", async () => {
    const anna = await signIn("anna@example.invalid");
    await addToList(db, anna.userId, "saved", "demo-a1");
    await addToList(db, anna.userId, "planned", PLAN);
    await deleteAccount(db, anna.userId);
    expect(await db.savedActivity.count()).toBe(0);
    expect(await db.plannedItem.count()).toBe(0);
  });

  it("assigns only the family's own children to a planned date", async () => {
    const anna = await signIn("anna@example.invalid");
    const ben = await signIn("ben@example.invalid");
    const maus = await addChild(db, anna.userId, { nickname: "Maus", birthYear: 2020, interests: [] });
    const baer = await addChild(db, ben.userId, { nickname: "Bär", birthYear: 2019, interests: [] });
    await addToList(db, anna.userId, "planned", PLAN);

    expect(await assignChildren(db, anna.userId, PLAN, [maus!.id, baer!.id, "made-up"])).toBe(true);
    expect((await getLists(db, anna.userId)).assignments).toEqual({ [PLAN]: [maus!.id] });

    // Ben can't assign anything to Anna's calendar entry
    expect(await assignChildren(db, ben.userId, PLAN, [baer!.id])).toBe(false);
    expect((await getLists(db, ben.userId)).children.map((c) => c.nickname)).toEqual(["Bär"]);

    // a removed child disappears from the assignment
    await removeChild(db, anna.userId, maus!.id);
    expect((await getLists(db, anna.userId)).assignments).toEqual({});
  });
});

