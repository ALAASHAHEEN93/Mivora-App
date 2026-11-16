# Step-by-step Implementation Plan

Each step ends in something runnable and tested. Phase 1 is the responsive web MVP for Köln.

**Progress (2026-11-16):** steps 1–3 and 5 are done on demo data, plus Saved and a calendar (month/week, overlap warnings, .ics export) stored on the device. Step 7 is therefore partly done; it moves to the server with accounts in step 6. Two deliberate changes from this plan:
- The project is a single Next.js app, not a monorepo. Domain logic lives in `src/domain` and can be split out later.
- The catalogue runs behind a repository interface with demo data. Step 4 (PostgreSQL) comes next.

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
