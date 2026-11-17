# Step-by-step Implementation Plan

Each step ends in something runnable and tested. Phase 1 is the responsive web MVP for Köln.

**Progress (2026-11-16):** steps 1–3 and 5 are done on demo data, plus Saved and a calendar (month/week, overlap warnings, .ics export) stored on the device. Step 7 is therefore partly done; it moves to the server with accounts in step 6. Two deliberate changes from this plan:
- The project is a single Next.js app, not a monorepo. Domain logic lives in `src/domain` and can be split out later.
- The catalogue runs behind a repository interface. Step 4 is done locally (2026-11-16): Prisma 7 schema, first migration, demo seed, and a PostgreSQL repository used whenever `DATABASE_URL` is set; otherwise demo data. Deviations: plain lat/lng instead of PostGIS (add it with the map/radius search), 13 visible demo listings instead of ~40, and age/date/category filters still run in app code after the database narrows to visible listings. Step 6 is done locally (2026-11-17): email one-time-code sign-in (app-friendly, no passwords, codes and session tokens stored only as hashes, rate-limited), child profiles with nickname/birth year/interests only, JSON data export and account deletion; database tests in CI prove one family can't read or change another's children. Saved and Calendar now sync with the family account across devices (device copy kept for offline use; merged on first sign-in, account wins afterwards, cleared on sign-out). Per-child calendar: assign children to planned dates, filter by child, child colours, overlap warnings only when the same child is double-booked (named in the warning), child names in the .ics export. Age-based suggestions on Home ("Für Maus"), computed from birth year + interests, nothing extra stored. Step 8 (provider submit + admin) done locally: providers sign in and submit listings (strict validation, weekly dates, German + optional English text); submissions stay hidden until an admin (ADMIN_EMAILS) approves or rejects with a reason; every status change goes to an audit log; providers see their own submissions and status. Photo upload done locally: one photo per listing, real JPEG/PNG/WebP only (checked by content), max 5 MB, re-encoded to WebP ≤1600 px with all metadata (GPS) removed, visible only to provider/admins until approved, deleted when declined, rights + consent confirmation; stored on local disk until EU object storage is chosen at deploy. Not yet: editing a submitted listing, re-verify queue, report button, provider terms (need legal review), legal review of the privacy texts. Also added: splash, welcome screen with German city picker, installable home-screen app.

Not built yet: Explore map view (needs a tile provider choice), calendar view, Playwright/axe end-to-end tests.

| # | Step | Deliverable | Done when |
|---|---|---|---|
| 1 | Repo scaffold | Next.js + TypeScript app, Vitest, `.env.example`, GitHub Actions CI | `pnpm dev` runs, CI green |
| 2 | Design system | Tokens (coral, sunshine, teal, lavender, neutrals; contrast-checked), typography, buttons, cards, chips, inputs, bottom nav, empty states; RTL-safe | Contrast tests pass |
| 3 | i18n | next-intl, locales de/en/ar/tr/uk/fr/es/it/pl, `/[locale]` routing, RTL `dir`, de-DE date/EUR formatting | Switching locale works incl. Arabic RTL |
| 4 | Database | Prisma schema from 03-tech-stack-and-data-model.md, migrations, PostGIS, seed with **clearly-marked demo data** (Köln districts, categories, ~40 demo activities) | `pnpm db:migrate && pnpm db:seed` works locally (Docker Postgres) |
| 5 | Catalogue read | Home, Explore (list + map), Activity detail, Provider page; search & filters; expiry rules in queries | Filter by age+date returns only valid upcoming sessions |
| 6 | Accounts & family | Magic-link auth, child profiles, settings, data export, delete account | Tests prove other users can't read child data |
| 7 | Saved & My Week | Save (server-side), plan session for children, conflicts, .ics export | Conflict detection unit-tested |
| 8 | Provider submit + admin | Submission form, admin queue, approve/reject, audit log, re-verify queue, report button | Listing goes draft → pending → published with audit entries |
| 9 | Inquiry / external booking | Inquiry email to provider (transactional), external-link click tracking (cookieless) | Inquiry delivered in dev mail catcher |
| 10 | Hardening & deploy | Security headers, rate limits, Sentry, backups, staging + production in EU region, legal page placeholders | Staging URL live (only after you approve accounts/costs) |
| 11 | Phase 2 | Provider portal, recurring sessions UI, Stripe Connect integrated bookings, refunds, commission statements | After Phase 1 go/no-go |
| 12 | Phase 3 | Expo apps, push, reviews, personalisation, new cities | After Phase 2 traction |

Local dev needs Node 20+ and pnpm (Docker from step 4). No external accounts are required until step 10.
