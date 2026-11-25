# CLAUDE.md

Working guide for AI coding assistants (and a fast onboarding for humans). Keep it short and current; put long explanations in `docs/`.

## Project

**Mivora**: a multilingual, German-first, phone-first web app for families in Köln to discover, plan and book children's activities. Parents use it, but it looks playful and kid-friendly. Early MVP: runs on **demo data**, nothing deployed, no legal review yet.

Read first: [docs/features.md](docs/features.md), [docs/architecture.md](docs/architecture.md), [docs/status.md](docs/status.md), [docs/07-data-inventory.md](docs/07-data-inventory.md).

## Commands (pnpm only, Node 20+)

```bash
pnpm install
pnpm dev            # http://localhost:3000 → /de (demo data without DATABASE_URL)
pnpm typecheck
pnpm test           # Vitest unit tests (+ DB tests when TEST_DATABASE_URL is set)
pnpm test:e2e       # Playwright + axe (dev server on :3100)
pnpm build
pnpm db:up          # Docker: Postgres 17 + Mailpit (http://localhost:8025)
pnpm db:migrate     # prisma migrate dev
pnpm db:seed        # demo listings (local hosts only)
pnpm jobs:daily     # reminder + "still current?" emails
pnpm dev:present    # demo without the Next.js dev badge
```

## Where things go

- `src/domain/`: pure TypeScript (types, filters, time, calendar, ages, geo, format). No React, Next, Prisma or I/O. Unit-test everything here.
- `src/data/`: the `activityRepository` (Prisma when `DATABASE_URL` is set, otherwise demo data). Pages never query Prisma directly for the catalogue.
- `src/server/`: server-only logic (auth, family, lists, listings, photos, mail, jobs, weather).
- `src/app/[locale]/(app)/…`: pages inside the app shell. Server Actions sit next to their page (`actions.ts`).
- `src/components/`: UI. Artwork in `components/illustrations/`, with editable copies in `design/`.
- `messages/<locale>.json`: UI strings. `de.json` is the source.

## Rules that must not be broken

- **Design:** use the semantic tokens from `src/app/globals.css` (`bg-surface`, `text-ink`, `bg-primary`, `text-accent`…), never raw hex values in components. New colour pairs → add to `src/domain/contrast.test.ts`, light **and** dark. Keep the brand palette ([ADR-0003](docs/decisions/0003-brand-design-system.md)). Don't change the visual style without the owner asking.
- **Artwork:** original only. New drawings need dark-mode and RTL checks.
- **Children's data:** optional nickname, birth year, interests and colour only. Never real names, birthdays, photos or health data. Never log it.
- **Family data:** every query scoped to the signed-in user. Admin checks (`isAdmin`) on every admin page **and** action.
- **Freshness:** public listings go through `domain/filters.ts` (`upcomingSessions`, `searchActivities`). Past, expired, draft or cancelled never show as upcoming.
- **i18n/RTL:** no hard-coded UI strings. Add every key to all 9 message files (`i18n/messages.test.ts`). Use logical CSS properties (`ms-`, `pe-`, `start-`). Use `Link` from `@/i18n/navigation`.
- **Privacy:** new cookie, stored field or third-party request → update [docs/07-data-inventory.md](docs/07-data-inventory.md) and the external-services table in [architecture.md](docs/architecture.md#external-services).
- **Demo data** must stay visibly fictional. No real providers, prices or legal text invented.
- **No external accounts or paid services** (hosting, email, tiles, storage) without the owner's explicit approval. No secrets in the repo; use `.env.local`.

## Keeping docs in sync

With each change, update: [docs/features.md](docs/features.md) (status), [docs/status.md](docs/status.md), [CHANGELOG.md](CHANGELOG.md), and add an ADR in [docs/decisions/](docs/decisions/README.md) for significant technical decisions.
