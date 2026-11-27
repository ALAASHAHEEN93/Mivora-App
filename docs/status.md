# Project Status

Progress against the [implementation plan](05-implementation-plan.md). Feature-level detail: [features.md](features.md). Update this file when a step changes state.

_Last updated: 2026-11-27 (opt-in holiday idea emails)_

**Legend:** ✅ Done locally · 🟡 Partly done · 💤 Not started. **Nothing is deployed.**

| # | Step | Status | Notes |
|---|---|---|---|
| 1 | Repo scaffold | ✅ | Single Next.js app ([ADR-0001](decisions/0001-single-nextjs-app.md)), Vitest, CI |
| 2 | Design system | ✅ | Brand tokens, dark mode, original artwork incl. empty-state scenes ([ADR-0003](decisions/0003-brand-design-system.md)) |
| 3 | i18n | ✅ | 9 locales, Arabic RTL. Translations except de/en unreviewed |
| 4 | Database | ✅ | Prisma 7 + Postgres, demo fallback ([ADR-0002](decisions/0002-repository-with-demo-fallback.md)). No PostGIS yet |
| 5 | Catalogue read | 🟡 | Home (rain tips sorted for the family's children), Explore (list + map), detail done. 32 visible demo listings in 15 Stadtteile. Provider page, holiday and district pages missing |
| 6 | Accounts & family | ✅ | Email code sign-in, child profiles, export, deletion, isolation tests. Opt-in holiday idea emails ([ADR-0004](decisions/0004-holiday-idea-emails-opt-in.md)) |
| 7 | Saved & My Week | ✅ | Synced with account, per-child calendar, overlap warnings, .ics |
| 8 | Provider submit + admin | 🟡 | Admin create/edit/approve, audit log, reports, photo upload. Provider self-submission removed; no re-verify queue |
| 9 | Inquiry / external booking | 🟡 | Inquiry email done, external link done. Cookieless click tracking not done |
| 10 | Hardening & deploy | 🟡 | Security headers, Docker, Caddy, backups prepared. Not deployed; no Sentry or analytics yet |
| 11 | Phase 2 | 💤 | After Phase 1 go/no-go |
| 12 | Phase 3 | 💤 | City picker ready for 20 cities, only Köln live |

## Open decisions

| Topic | Notes |
|---|---|
| Provider self-submission | Bring back (`/anbieten` was removed in `0a19301`) or keep admin-only for the pilot? |
| Map tiles for production | OpenStreetMap's public server is for light use only; pick an EU tile provider |
| Photo storage | Local disk now; EU object storage before launch |
| Translation review | Native speakers for ar, tr, uk first |
| Legal texts | Impressum, Datenschutz, AGB need a lawyer ([07](07-data-inventory.md) prepared) |
| Retention periods | Inquiries, reports, audit log ([07](07-data-inventory.md)) |
| NRW school holidays | Fill `NRW_SCHOOL_BREAKS` in `domain/occasions.ts` from the official Ferienordnung NRW; until then only holidays are announced |
