# Changelog

Notable changes, newest first. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Entries before 2026-11-25 are summarised from the git history.

## [Unreleased]

### Added
- 2026-11-25: Project documentation: `CLAUDE.md`, `CONTRIBUTING.md`, this changelog, `docs/features.md`, `docs/architecture.md`, `docs/status.md`, `docs/glossary.md`, ADRs 0001–0003.

## 2026-11-21
- Dark mode switch, About and For-providers pages, livelier meadow, editable design files (`design/`).
- Installable app: service worker, offline page, install card, `pnpm demo`.
- Surprise picker suggests the coming days when nothing is left today.
- Desktop footer with napping star, contact email, "made for your phone" QR card.

## 2026-11-18
- Admin dashboard, playful home page, brand refresh. Provider self-submission page removed (admins create listings).

## 2026-11-17
- Family accounts with email codes. Saved and Calendar synced to the account. Per-child calendar. Age-based suggestions.
- Admin listing form with review and audit log. Photo upload (re-encoded, metadata removed).
- Booking requests by email. "Report a problem". Map view and "near me". Child ages on the welcome screen.
- Reminder and "still current?" emails (daily job).
- Splash, welcome screen with city picker. Branded 404, error and loading screens.
- Playwright + axe end-to-end tests. Legal page placeholders. Data inventory for the lawyer.
- Password-protected test version prepared (`deploy/`, not deployed).
- Brand iterations: palettes, Fredoka sticker-style logo, rounded headings.

## 2026-11-16
- Initial web MVP on demo data: Home, Explore, activity detail, Saved, Calendar, 9 languages.
- Demo listings translated into all 9 languages, with real (Unsplash) demo photos.
- PostgreSQL catalogue with Prisma 7 (step 4).
