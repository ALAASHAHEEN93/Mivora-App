# ADR-0002: Repository boundary, Prisma 7, demo-data fallback

- **Status:** Accepted
- **Date:** 2026-11-16 (recorded 2026-11-25)
- **Deciders:** Founder

## Context
The UI had to be demo-able before a database existed, and must stay demo-able without Docker (presentations, design work). Later the catalogue needs PostgreSQL.

## Decision
- Pages call only `activityRepository` (`src/data/repository.ts`).
- With `DATABASE_URL` set, the `PrismaActivityRepository` (Prisma 7 with `@prisma/adapter-pg`, client generated into `src/generated/prisma`) is used. Without it, the `DemoActivityRepository` serves built-in demo data whose dates are relative to today.
- Locations are plain latitude/longitude for now, with PostGIS deferred to radius search. After the database narrows to visible listings, age/date/category filtering runs in `domain/filters.ts`.

## Consequences
- `pnpm dev` works with zero setup. Accounts, admin and writes need the database.
- The visibility rules live in one place (`domain/filters.ts`) and are unit-tested.
- Revisit filtering in SQL when the listing count grows (hundreds or more), together with PostGIS.
