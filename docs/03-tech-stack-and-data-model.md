# Tech Stack & Data Model

## 1. Recommended stack (MVP → scale)

| Concern | Choice | Why | Alternatives considered |
|---|---|---|---|
| Language | **TypeScript** everywhere | One language web/mobile/API, type-safe contracts | — |
| Web app | **Next.js (App Router) + React**, SSR/ISR | SEO for listings & district pages, i18n routing, one deployable (UI + API routes) | Remix, Nuxt; SPA (bad for SEO) |
| i18n | **next-intl**, ICU messages, `dir="rtl"` for `ar`, CSS logical properties | Mature, RSC-compatible | i18next |
| UI | Tailwind CSS + own design tokens (Radix primitives when complex widgets are needed) | Fast, accessible, RTL via logical utilities | MUI (heavy) |
| DB | **PostgreSQL** (+ PostGIS for distance, full-text search with German/unaccent config) | Relational fits bookings/inventory; geo + search in one DB until ~100k listings | MongoDB (poor fit), Meilisearch later |
| ORM / migrations | **Prisma** (or Drizzle) with SQL migrations in repo | Typed queries, reviewable migrations | — |
| Hosting/DB | **Supabase (EU region, Frankfurt)** for Postgres + Auth + Storage, *or* Neon + Auth.js + S3-compatible EU storage | Supabase = fastest MVP; data access stays behind our own repository layer so we're not locked in | AWS self-managed (too much ops now) |
| App hosting | Vercel (EU functions region) or Render/Fly in Frankfurt | Simple CI/CD; verify DPA + data transfer terms | Hetzner + Docker (cheapest, more ops) |
| Auth | Email magic link + passkeys; roles: parent, provider_member, moderator, admin | No passwords to leak | Social login (adds third-party data flows; Phase 2 optional) |
| Maps | **MapLibre GL + OpenStreetMap data** via an EU tile provider (verify pricing); geocoding via a Nominatim/Photon-based provider | Avoids Google ToS/cookie issues; OSM licence (ODbL) requires attribution | Google Maps (cost, consent) |
| Email | Postmark or Brevo (EU) — transactional only | Deliverability; Brevo is EU-based | SES |
| Translation | DeepL API (EU) for listing descriptions, cached, labelled "automatisch übersetzt" | Check Arabic/Ukrainian support & pricing | LLM translation |
| Analytics | Plausible/Matomo (cookieless, EU-hosted) | Privacy by design | GA4 (avoid) |
| Errors/logs | Sentry (EU data region) with PII scrubbing; structured JSON logs | — | — |
| Payments (Phase 2) | **Stripe Connect** (Express accounts, separate charges & transfers) — decision pending research of current DE fees, KYC, refunds, deemed-supplier VAT rules from 2027 | Marketplace payouts, SEPA, wallets | Mollie Connect (EU-native) — compare |
| Mobile (Phase 3) | **Expo / React Native**, shared API + types | Reuse TS; PWA first in Phase 1 | Flutter |
| Tests | Vitest (unit), Playwright (e2e + axe accessibility), DB tests on ephemeral Postgres | — | — |
| CI/CD | GitHub Actions: typecheck, test, build, migrations check, preview deploys; secrets in platform env vars only | — | — |

**Architecture:** a modular monolith — currently one Next.js app with `src/domain` (pure logic), `src/data` (repository), `src/components`. Background jobs (expiry, reminders, re-verify) via scheduled cron routes or pg-boss on Postgres. No microservices.

**Cost (MVP, monthly, rough, verify pricing):** hosting + DB €25–80, email €0–20, maps €0–50, error tracking €0–30, analytics €10–20, translation €0–30 → **≈ €50–250/month** at pilot scale.

## 2. Entity model (MVP + Phase 2 placeholders)

```
User(id, email, locale, role[], created_at, deleted_at)
Family(id, owner_user_id, home_district_id?, created_at)
FamilyMember(family_id, user_id, role: owner|guardian)          -- Phase 2 sharing
Child(id, family_id, nickname?, birth_year, interests[], color)   -- NO full name, NO birthday, NO photo, NO health data

Provider(id, name, slug, type: verein|business|public|freelancer,
         legal_name, impressum_url?, address, district_id,
         verification_status: unverified|pending|verified|suspended,
         verified_at, claimed: bool, created_at)
ProviderMember(provider_id, user_id, role: owner|editor)

Venue(id, provider_id?, name, street, postal_code, city, district_id,
      location geography(Point), indoor: bool?, accessibility_notes)
District(id, name, stadtbezirk, city)                              -- Köln: 9 Stadtbezirke / 86 Stadtteile

Category(id, slug, parent_id?, icon) + CategoryTranslation(category_id, locale, name)

Activity(id, provider_id, venue_id?, slug, status: draft|pending_review|published|rejected|archived,
         age_min, age_max, price_type: free|paid|donation, price_cents?, price_unit: per_child|per_family|per_session,
         languages_of_instruction[], indoor_outdoor: indoor|outdoor|both,
         accessibility_tags[], accessibility_source: provider|verified,
         booking_mode: inquiry|external_link|integrated, external_url?,
         cancellation_policy_text, original_locale,
         source_type: provider|admin|partner_feed|claimed, source_ref, source_licence?,
         last_verified_at, expires_at, created_at, updated_at)
ActivityTranslation(activity_id, locale, title, summary, description, is_machine, reviewed_at?)
ActivityCategory(activity_id, category_id)
ActivityImage(id, activity_id, storage_key, alt_text, rights_confirmed_by, rights_confirmed_at)

Session(id, activity_id, starts_at timestamptz, ends_at, capacity?, seats_taken, status: scheduled|cancelled|full)
RecurrenceRule(id, activity_id, rrule, exdates[])                   -- expands into Session rows (materialised N weeks ahead)
HolidayPeriod(id, state: NW, name, starts_on, ends_on, school_year, source_url)

SavedActivity(user_id, activity_id, created_at)
PlannedItem(id, family_id, session_id, child_ids[], note?, reminder_at?)  -- My Week
Inquiry(id, activity_id, session_id?, family_id, message, participants_count, status, created_at)

Report(id, target_type, target_id, reason, reporter_user_id?, status, resolved_by, resolution)
ClaimRequest(id, provider_id|activity_id, user_id, evidence, status)
AuditLog(id, actor_user_id, action, target_type, target_id, diff jsonb, ip_hash, created_at)
Consent(id, user_id, purpose, version, granted_at, withdrawn_at)

-- Phase 2
Booking(id, family_id, session_id, participants jsonb(count + age per child), status, amount_cents,
        fee_cents, commission_cents, currency='EUR', terms_version, payment_intent_id, created_at)
Payment / Refund / Payout / CommissionStatement / Review(after attended booking only)
```

**Key rules**
- Upcoming queries always filter `Session.starts_at > now()` and `Activity.status='published' AND expires_at > now()` (already implemented in `src/domain/filters.ts`).
- Listings with `last_verified_at` older than 60 days → re-verify queue; older than 120 days → auto-hidden.
- Children's data visible only to the family's users (row-level security + service-layer checks); providers never see child data in Phase 1; in Phase 2 they see only participant count + ages needed for eligibility (+ name only if legally required for the activity).
- Account deletion: hard-delete family/child data within 30 days; keep anonymised bookings/invoices for legally required retention (lawyer/tax advisor to confirm periods).
