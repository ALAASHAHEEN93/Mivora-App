# ADR-0001: One Next.js app with a pure `domain/` layer

- **Status:** Accepted
- **Date:** 2026-11-16 (recorded 2026-11-25)
- **Deciders:** Founder

## Context
Plan step 1 ([05](../05-implementation-plan.md)) proposed a pnpm monorepo (`apps/web`, `packages/core|db|ui`). The team is one person, and SEO, i18n and a phone-first web app matter more than package boundaries right now.

## Options considered
1. **Monorepo** with separate packages: clean boundaries, but more config and slower iteration for a solo founder.
2. **Single Next.js app** with folder boundaries (`domain/`, `data/`, `server/`, `components/`): one build and one deploy. Boundaries are kept by convention and tests.

## Decision
**Option 2.** `src/domain` holds pure TypeScript (no React, Next, Prisma or I/O). `src/data` hides storage behind a repository. `src/server` is server-only.

## Consequences
- Fast to change. One Dockerfile (`output: "standalone"`).
- When native apps (Phase 3) or a separate worker need shared code, move `src/domain` into a package first.
