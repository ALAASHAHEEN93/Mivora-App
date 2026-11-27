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
import { adminStats, approveSubmission, createSubmission, listAllActivities, listOwnSubmissions, listPending, photoAccess, rejectSubmission, submissionFormValues, updateSubmission } from "./listings";
import { readPhoto, savePhoto } from "./photos";
import { createReport, listOpenReports, resolveReport } from "./reports";
import { createInquiry } from "./inquiries";
import { confirmListing, sendOccasionSuggestions, sendRecheckRequests, sendTomorrowReminders, type OutgoingMail } from "./jobs";
import { buildDemoActivities } from "@/data/demo-activities";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseSubmission } from "@/domain/submission";
import { validSubmissionForm } from "@/test/submission-form";

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
    await db.inquiry.deleteMany();
    await db.report.deleteMany();
    await db.auditLog.deleteMany();
    await db.activity.deleteMany({ where: { sourceType: "provider" } });
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

  describe("provider submissions", () => {
    const now = new Date("2026-11-17T12:00:00Z");
    const ADMIN = "admin@example.invalid";
    beforeAll(() => {
      process.env.ADMIN_EMAILS = ADMIN;
    });
    function input() {
      const r = parseSubmission(validSubmissionForm(), now);
      if (!r.ok) throw new Error(JSON.stringify(r.errors));
      return r.value;
    }

    it("a submission stays hidden until an admin approves it, with an audit trail", async () => {
      const provider = await signIn("anbieter@example.invalid");
      const admin = await signIn(ADMIN);
      const res = await createSubmission(db, provider.userId, input(), now);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const pending = await db.activity.findUniqueOrThrow({ where: { id: res.id } });
      expect(pending.status).toBe("pending");

      expect(await approveSubmission(db, { id: admin.userId, email: ADMIN }, res.id)).toBe(true);
      expect((await db.activity.findUniqueOrThrow({ where: { id: res.id } })).status).toBe("published");
      // approving twice does nothing
      expect(await approveSubmission(db, { id: admin.userId, email: ADMIN }, res.id)).toBe(false);

      const log = await db.auditLog.findMany({ where: { activityId: res.id }, orderBy: { createdAt: "asc" } });
      expect(log.map((l) => l.action)).toEqual(["submitted", "approved"]);
      expect(log[1]!.actorId).toBe(admin.userId);
    });

    it("providers cannot approve, reject or see the queue", async () => {
      const provider = await signIn("anbieter@example.invalid");
      const res = await createSubmission(db, provider.userId, input(), now);
      if (!res.ok) throw new Error();
      const me = { id: provider.userId, email: "anbieter@example.invalid" };
      await expect(approveSubmission(db, me, res.id)).rejects.toThrow("forbidden");
      await expect(rejectSubmission(db, me, res.id, "nope")).rejects.toThrow("forbidden");
      await expect(listPending(db, me)).rejects.toThrow("forbidden");
    });

    it("a rejection keeps the reason for the provider, who only sees their own submissions", async () => {
      const a = await signIn("anbieter@example.invalid");
      const b = await signIn("andere@example.invalid");
      const admin = await signIn(ADMIN);
      const res = await createSubmission(db, a.userId, input(), now);
      await createSubmission(db, b.userId, input(), now);
      if (!res.ok) throw new Error();

      expect(await rejectSubmission(db, { id: admin.userId, email: ADMIN }, res.id, "  ")).toBe(false);
      expect(await rejectSubmission(db, { id: admin.userId, email: ADMIN }, res.id, "Bitte genaue Adresse angeben.")).toBe(true);

      const mine = await listOwnSubmissions(db, a.userId);
      expect(mine).toHaveLength(1);
      expect(mine[0]).toMatchObject({ status: "archived", reviewNote: "Bitte genaue Adresse angeben." });
    });

    it("an unpublished photo is only visible to its provider and admins; declining deletes it", async () => {
      process.env.STORAGE_DIR = mkdtempSync(path.join(tmpdir(), "mivora-photos-"));
      const provider = await signIn("anbieter@example.invalid");
      const other = await signIn("andere@example.invalid");
      const admin = await signIn(ADMIN);
      const photoId = await savePhoto(Buffer.from("test"));
      const res = await createSubmission(db, provider.userId, input(), now, photoId);
      if (!res.ok) throw new Error();

      expect(await photoAccess(db, photoId, null, now)).toBeNull();
      expect(await photoAccess(db, photoId, { id: other.userId, email: "andere@example.invalid" }, now)).toBeNull();
      expect(await photoAccess(db, photoId, { id: provider.userId, email: "anbieter@example.invalid" }, now)).toBe("private");
      expect(await photoAccess(db, photoId, { id: admin.userId, email: ADMIN }, now)).toBe("private");

      await rejectSubmission(db, { id: admin.userId, email: ADMIN }, res.id, "Foto passt nicht");
      expect(await readPhoto(photoId)).toBeNull();
      expect(await photoAccess(db, photoId, { id: provider.userId, email: "anbieter@example.invalid" }, now)).toBeNull();
    });

    it("an approved listing's photo is public", async () => {
      process.env.STORAGE_DIR = mkdtempSync(path.join(tmpdir(), "mivora-photos-"));
      const provider = await signIn("anbieter@example.invalid");
      const admin = await signIn(ADMIN);
      const photoId = await savePhoto(Buffer.from("test"));
      const res = await createSubmission(db, provider.userId, input(), now, photoId);
      if (!res.ok) throw new Error();
      await approveSubmission(db, { id: admin.userId, email: ADMIN }, res.id);
      expect(await photoAccess(db, photoId, null, now)).toBe("public");
    });

    it("admins can publish directly (logged); providers cannot, even if they ask", async () => {
      const admin = await signIn(ADMIN);
      const provider = await signIn("anbieter@example.invalid");

      const own = await createSubmission(db, admin.userId, input(), now, null, { id: admin.userId, email: ADMIN });
      if (!own.ok) throw new Error();
      expect(own.published).toBe(true);
      expect((await db.activity.findUniqueOrThrow({ where: { id: own.id } })).status).toBe("published");
      expect((await db.auditLog.findFirstOrThrow({ where: { activityId: own.id } })).action).toBe("published_by_admin");

      // a provider claiming to be the admin, or passing their own non-admin identity, stays pending
      const sneaky = await createSubmission(db, provider.userId, input(), now, null, { id: admin.userId, email: ADMIN });
      const plain = await createSubmission(db, provider.userId, input(), now, null, { id: provider.userId, email: "anbieter@example.invalid" });
      for (const r of [sneaky, plain]) {
        if (!r.ok) throw new Error();
        expect(r.published).toBe(false);
        expect((await db.activity.findUniqueOrThrow({ where: { id: r.id } })).status).toBe("pending");
      }
    });

    it("providers edit only their own listings; edits go back to review", async () => {
      const admin = await signIn(ADMIN);
      const provider = await signIn("anbieter@example.invalid");
      const other = await signIn("andere@example.invalid");
      const res = await createSubmission(db, provider.userId, input(), now);
      if (!res.ok) throw new Error();
      await approveSubmission(db, { id: admin.userId, email: ADMIN }, res.id);

      const changed = parseSubmission(validSubmissionForm({ title: "Kinderturnen am Donnerstag" }), now);
      if (!changed.ok) throw new Error();
      expect(await updateSubmission(db, other.userId, res.id, changed.value, now)).toBeNull();
      expect(await submissionFormValues(db, other.userId, res.id, now)).toBeNull();

      const upd = await updateSubmission(db, provider.userId, res.id, changed.value, now);
      expect(upd).toMatchObject({ published: false });
      const row = await db.activity.findUniqueOrThrow({ where: { id: res.id }, include: { translations: true } });
      expect(row.status).toBe("pending");
      expect(row.translations.find((x) => x.locale === "de")?.title).toBe("Kinderturnen am Donnerstag");

      const values = await submissionFormValues(db, provider.userId, res.id, now);
      expect(values?.values).toMatchObject({ title: "Kinderturnen am Donnerstag", district: "Kalk", startTime: "16:00", repeatWeeks: "4" });
    });

    it("an admin can see, edit and publish any listing; a non-admin editor flag is ignored", async () => {
      const admin = await signIn(ADMIN);
      const me = { id: admin.userId, email: ADMIN };
      const provider = await signIn("anbieter@example.invalid");
      const other = await signIn("andere@example.invalid");
      const res = await createSubmission(db, provider.userId, input(), now);
      if (!res.ok) throw new Error();
      const changed = parseSubmission(validSubmissionForm({ title: "Vom Admin korrigiert" }), now);
      if (!changed.ok) throw new Error();

      // Pretending to be an admin without being one changes nothing.
      const fake = { id: other.userId, email: "andere@example.invalid" };
      expect(await updateSubmission(db, other.userId, res.id, changed.value, now, null, fake, fake)).toBeNull();
      expect(await submissionFormValues(db, other.userId, res.id, now, fake)).toBeNull();
      await expect(listAllActivities(db, fake)).rejects.toThrow("forbidden");
      await expect(adminStats(db, fake)).rejects.toThrow("forbidden");

      expect(await submissionFormValues(db, admin.userId, res.id, now, me)).not.toBeNull();
      expect(await updateSubmission(db, admin.userId, res.id, changed.value, now, null, me, me)).toMatchObject({ published: true });
      const row = await db.activity.findUniqueOrThrow({ where: { id: res.id }, include: { translations: true } });
      expect(row.status).toBe("published");
      expect(row.translations.find((x) => x.locale === "de")?.title).toBe("Vom Admin korrigiert");
      expect((await listAllActivities(db, me)).map((a) => a.id)).toContain(res.id);
      expect(await adminStats(db, me, now)).toMatchObject({ pending: 0, live: expect.any(Number), accounts: expect.any(Number) });
    });

    it("limits open submissions per provider", async () => {
      const a = await signIn("anbieter@example.invalid");
      for (let i = 0; i < 10; i++) expect((await createSubmission(db, a.userId, input(), now)).ok).toBe(true);
      expect((await createSubmission(db, a.userId, input(), now)).ok).toBe(false);
    });
  });

  describe("problem reports", () => {
    const ADMIN = "admin@example.invalid";
    beforeAll(() => {
      process.env.ADMIN_EMAILS = ADMIN;
    });
    async function publishedActivity() {
      const admin = await signIn(ADMIN);
      const r = parseSubmission(validSubmissionForm(), new Date("2026-11-17T12:00:00Z"));
      if (!r.ok) throw new Error();
      const res = await createSubmission(db, admin.userId, r.value, new Date("2026-11-17T12:00:00Z"), null, { id: admin.userId, email: ADMIN });
      if (!res.ok) throw new Error();
      return { admin, id: res.id };
    }

    it("anyone can report a published listing; admins see and resolve it; others can't", async () => {
      const { admin, id } = await publishedActivity();
      const parent = await signIn("eltern@example.invalid");
      expect(await createReport(db, { activityId: id, reason: "cancelled", message: "Findet nicht statt", reporterId: null })).toEqual({ ok: true });
      expect(await createReport(db, { activityId: id, reason: "wrongInfo", message: "", reporterId: parent.userId })).toEqual({ ok: true });

      await expect(listOpenReports(db, { id: parent.userId, email: "eltern@example.invalid" })).rejects.toThrow("forbidden");
      const open = await listOpenReports(db, { id: admin.userId, email: ADMIN });
      expect(open).toHaveLength(2);
      expect(await resolveReport(db, { id: admin.userId, email: ADMIN }, open[0]!.id)).toBe(true);
      expect(await listOpenReports(db, { id: admin.userId, email: ADMIN })).toHaveLength(1);
    });

    it("rejects junk reasons, empty 'other', unknown listings, and limits flooding", async () => {
      const { id } = await publishedActivity();
      const parent = await signIn("eltern@example.invalid");
      expect(await createReport(db, { activityId: id, reason: "<script>", message: "x", reporterId: null })).toEqual({ ok: false, reason: "invalid" });
      expect(await createReport(db, { activityId: id, reason: "other", message: "  ", reporterId: null })).toEqual({ ok: false, reason: "invalid" });
      expect(await createReport(db, { activityId: "nope", reason: "cancelled", message: null, reporterId: null })).toEqual({ ok: false, reason: "invalid" });
      for (let i = 0; i < 3; i++) await createReport(db, { activityId: id, reason: "wrongInfo", message: null, reporterId: parent.userId });
      expect(await createReport(db, { activityId: id, reason: "wrongInfo", message: null, reporterId: parent.userId })).toEqual({ ok: false, reason: "limit" });
    });
  });

  describe("booking requests", () => {
    const ADMIN = "admin@example.invalid";
    const now = new Date("2026-11-17T12:00:00Z");
    beforeAll(() => {
      process.env.ADMIN_EMAILS = ADMIN;
    });
    async function inquiryListing() {
      const provider = await signIn(ADMIN);
      // no booking link -> "inquiry" mode
      const r = parseSubmission(validSubmissionForm({ bookingUrl: null }), now);
      if (!r.ok) throw new Error(JSON.stringify(r.errors));
      const res = await createSubmission(db, provider.userId, r.value, now, null, { id: provider.userId, email: ADMIN });
      if (!res.ok) throw new Error();
      const first = await db.session.findFirstOrThrow({ where: { activityId: res.id }, orderBy: { startsAt: "asc" } });
      return { id: res.id, firstSession: first.startsAt };
    }

    it("sends to the provider only with consent, a real message and a real date", async () => {
      const { id, firstSession } = await inquiryListing();
      const parent = await signIn("eltern@example.invalid");
      const base = { activityId: id, parentId: parent.userId, message: "Gibt es noch Plätze für zwei Kinder?", childAge: "5" };
      expect(await createInquiry(db, { ...base, sessionAt: "", consent: null }, now)).toEqual({ ok: false, reason: "consent" });
      expect(await createInquiry(db, { ...base, message: "hi", sessionAt: "", consent: "yes" }, now)).toEqual({ ok: false, reason: "invalid" });
      expect(await createInquiry(db, { ...base, sessionAt: "2030-01-01T10:00:00Z", consent: "yes" }, now)).toEqual({ ok: false, reason: "invalid" });
      const ok = await createInquiry(db, { ...base, sessionAt: firstSession.toISOString(), consent: "yes" }, now);
      expect(ok).toMatchObject({ ok: true, to: { email: ADMIN } });
      expect(await db.inquiry.count()).toBe(1);
    });

    it("limits requests per parent per day", async () => {
      const { id } = await inquiryListing();
      const parent = await signIn("eltern@example.invalid");
      const req = { activityId: id, parentId: parent.userId, message: "Gibt es noch Plätze für uns?", childAge: "", sessionAt: "", consent: "yes" };
      for (let i = 0; i < 5; i++) expect((await createInquiry(db, req, now)).ok).toBe(true);
      expect(await createInquiry(db, req, now)).toEqual({ ok: false, reason: "limit" });
    });
  });

  describe("daily email jobs", () => {
    const ADMIN = "admin@example.invalid";
    beforeAll(() => {
      process.env.ADMIN_EMAILS = ADMIN;
    });

    it("reminds parents once, the evening before, only if they want reminders", async () => {
      const anna = await signIn("anna@example.invalid");
      const ben = await signIn("ben@example.invalid");
      await db.user.update({ where: { id: ben.userId }, data: { remindersEnabled: false } });
      const maus = await addChild(db, anna.userId, { nickname: "Maus", birthYear: 2020, interests: [] });
      const tomorrow = "demo-a1|2026-11-21T10:00:00+01:00|2026-11-21T10:45:00+01:00";
      const later = "demo-a1|2026-11-28T10:00:00+01:00|2026-11-28T10:45:00+01:00";
      for (const u of [anna, ben]) {
        await addToList(db, u.userId, "planned", tomorrow);
        await addToList(db, u.userId, "planned", later);
      }
      await assignChildren(db, anna.userId, tomorrow, [maus!.id]);

      const mails: OutgoingMail[] = [];
      const send = async (m: OutgoingMail) => {
        mails.push(m);
      };
      const evening = new Date("2026-11-20T17:00:00Z"); // 18:00 in Köln, the day before
      expect(await sendTomorrowReminders(db, send, "https://test.example", evening)).toBe(1);
      expect(mails).toHaveLength(1);
      expect(mails[0]!.to).toBe("anna@example.invalid");
      expect(mails[0]!.text).toContain("10:00");
      expect(mails[0]!.text).toContain("(Maus)");
      // not twice
      expect(await sendTomorrowReminders(db, send, "https://test.example", evening)).toBe(0);
    });

    it("sends holiday ideas only to parents who opted in, once per occasion, at most weekly", async () => {
      const anna = await signIn("anna@example.invalid");
      await signIn("ben@example.invalid"); // never opted in
      await db.user.update({ where: { id: anna.userId }, data: { occasionEmailsSince: new Date("2026-11-01T12:00:00Z") } });
      await addChild(db, anna.userId, { nickname: "Maus", birthYear: 2020, interests: [] });
      const now = new Date("2026-11-20T17:00:00Z");
      const activities = buildDemoActivities(now);
      const breaks = [
        { id: "autumnBreak" as const, from: "2026-11-23", to: "2026-11-29" },
        { id: "summerBreak" as const, from: "2026-11-24", to: "2026-11-29" },
      ];
      const mails: OutgoingMail[] = [];
      const send = async (m: OutgoingMail) => {
        mails.push(m);
      };
      expect(await sendOccasionSuggestions(db, send, "https://test.example", activities, now, breaks)).toBe(1);
      expect(mails[0]!.to).toBe("anna@example.invalid");
      expect(mails[0]!.subject).toContain("Herbstferien");
      expect(mails[0]!.text).toContain("https://test.example/de/aktivitaet/");
      expect(mails[0]!.text).toContain("https://test.example/de/profil");
      // the second occasion waits: at most one such email a week
      const nextDay = new Date("2026-11-21T17:00:00Z");
      expect(await sendOccasionSuggestions(db, send, "https://test.example", activities, nextDay, breaks)).toBe(0);
      // switching off stops it
      await db.user.update({ where: { id: anna.userId }, data: { occasionEmailsSince: null } });
      await db.occasionNotice.deleteMany();
      expect(await sendOccasionSuggestions(db, send, "https://test.example", activities, now, breaks)).toBe(0);
    });

    it("asks providers about stale listings, at most weekly; confirming resets it", async () => {
      const admin = await signIn(ADMIN);
      const r = parseSubmission(validSubmissionForm(), new Date("2026-11-17T12:00:00Z"));
      if (!r.ok) throw new Error();
      const res = await createSubmission(db, admin.userId, r.value, new Date("2026-11-17T12:00:00Z"), null, { id: admin.userId, email: ADMIN });
      if (!res.ok) throw new Error();
      const mails: OutgoingMail[] = [];
      const send = async (m: OutgoingMail) => {
        mails.push(m);
      };
      const in10days = new Date("2026-11-27T12:00:00Z");
      expect(await sendRecheckRequests(db, send, "https://test.example", in10days)).toBe(0);
      // make it look unconfirmed for 40 days, still running
      await db.activity.update({ where: { id: res.id }, data: { lastVerifiedAt: new Date("2026-10-01T12:00:00Z"), expiresAt: new Date("2027-06-01T00:00:00Z") } });
      expect(await sendRecheckRequests(db, send, "https://test.example", in10days)).toBe(1);
      expect(mails[0]!.subject).toContain("Kinderturnen am Mittwoch");
      expect(await sendRecheckRequests(db, send, "https://test.example", in10days)).toBe(0); // not again this week
      expect(await confirmListing(db, admin.userId, res.id, in10days)).toBe(true);
      expect(await sendRecheckRequests(db, send, "https://test.example", new Date("2026-12-05T12:00:00Z"))).toBe(0);
    });
  });
});

