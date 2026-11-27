# Contributing

## Setup

See [README.md](README.md). Node 20+, pnpm, and Docker for the database.

## Workflow

1. Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
2. Keep changes small, ideally one feature ID ([docs/features.md](docs/features.md)) per PR.
3. Open a PR. CI (typecheck, tests, build) must be green.

## Commit messages

Short and descriptive, in English. A feature ID helps:

```
feat(F-CAL-01): warn when the same child is double-booked
fix(F-EXP-01): keep the district filter when changing the date
docs: update architecture for photo storage
```

## PR checklist

- [ ] `pnpm typecheck`, `pnpm test` (and `pnpm test:e2e` for UI changes) pass
- [ ] New UI strings in all 9 `messages/*.json` files; layout checked in Arabic (RTL)
- [ ] Only semantic colour tokens; new colour pairs in `domain/contrast.test.ts` (light + dark)
- [ ] Checked in light **and** dark mode, and on a phone-sized screen
- [ ] Server Actions check the signed-in user (and `isAdmin` where needed)
- [ ] Prisma schema changed → migration committed (`pnpm db:migrate`)
- [ ] New cookie, stored field or third-party request → [docs/07-data-inventory.md](docs/07-data-inventory.md) updated
- [ ] [docs/features.md](docs/features.md), [docs/status.md](docs/status.md), [CHANGELOG.md](CHANGELOG.md) updated
