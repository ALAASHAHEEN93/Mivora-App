# ADR-0004: Holiday idea emails are opt-in

- **Status:** Accepted
- **Date:** 2026-11-27
- **Deciders:** Owner (asked for the feature and approved opt-in), Claude Code

## Context
About a week before Christmas, Köln carnival, St. Martin, Easter or the NRW school holidays, families should get an email: "Christmas is coming, here are ideas for you", with activities that fit their children.

Unlike the evening-before reminder (about dates the parent planned themselves), this email suggests activities the parent did not ask about. In Germany that very likely counts as advertising by email (§ 7 UWG), which needs prior, provable consent. The project has had no legal review yet.

## Options considered
1. **On by default, like reminders**: reaches every family, but likely unlawful advertising without consent, and annoying.
2. **Opt-in switch in Profil, off by default**: fewer recipients, but lawful by design and trusted.
3. **Push notifications instead of email**: needs web push, a service worker subscription and more consent text; bigger step.

## Decision
Option 2. `User.occasionEmailsSince` is null (off) until the parent switches "Ideen zu Feiertagen & Ferien" on in Profil; it then stores when, as proof of consent. The sign-in code already proved the address belongs to the parent (instead of a separate double opt-in email).

Rules in `sendOccasionSuggestions` (`server/jobs.ts`), with dates from `domain/occasions.ts`:
- Sent during the 7 days before an occasion's suggestion window starts.
- Up to 5 activities in that window that fit at least one child's age, best family fit first; no email when nothing fits.
- Each occasion once per family (`OccasionNotice`), and at most one such email per week.
- Every email says why it arrives and links to Profil to switch it off.

NRW school-break dates are a table (`NRW_SCHOOL_BREAKS`) to be filled from the official Ferienordnung; dates are never guessed.

## Consequences
- A lawyer must confirm the consent wording and whether in-app consent is enough or a double opt-in email is needed (see [07-data-inventory.md](../07-data-inventory.md)).
- The school-break table needs yearly upkeep.
- Push notifications can come later on top of the same occasion calendar and suggestion logic.
