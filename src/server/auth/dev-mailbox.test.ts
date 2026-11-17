import { describe, expect, it } from "vitest";
import { usesLocalTestMailbox } from "./dev-mailbox";

describe("showing sign-in codes on screen", () => {
  it("only in local development with the local test mailbox", () => {
    expect(usesLocalTestMailbox({ NODE_ENV: "development", SMTP_URL: "smtp://127.0.0.1:1025" })).toBe(true);
    expect(usesLocalTestMailbox({ NODE_ENV: "development", SMTP_URL: "smtp://localhost:1025" })).toBe(true);
  });
  it("never in production or with a real email service", () => {
    expect(usesLocalTestMailbox({ NODE_ENV: "production", SMTP_URL: "smtp://127.0.0.1:1025" })).toBe(false);
    expect(usesLocalTestMailbox({ NODE_ENV: "development", SMTP_URL: "smtps://user:pw@smtp-relay.example.eu:465" })).toBe(false);
    expect(usesLocalTestMailbox({ NODE_ENV: "test", SMTP_URL: "smtp://127.0.0.1:1025" })).toBe(false);
    expect(usesLocalTestMailbox({ NODE_ENV: "development" })).toBe(false);
  });
});
