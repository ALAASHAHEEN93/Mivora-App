# Changelog

Notable changes, newest first. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Entries before 2026-11-25 are summarised from the git history.

## [Unreleased]

### Added
- 2026-11-27: Holiday idea emails (opt-in, [ADR-0004](docs/decisions/0004-holiday-idea-emails-opt-in.md)): about a week before Christmas, Köln carnival, St. Martin, Nikolaus, Halloween, Easter or NRW school holidays, `pnpm jobs:daily` emails parents up to 5 activities in that window that fit their children. Off by default; switch "Ideen zu Feiertagen & Ferien" in Profil. Once per occasion, at most weekly, never empty. Occasion calendar with Easter/carnival dates in `domain/occasions.ts`; NRW school-break dates still to fill in. New `User.occasionEmailsSince` and `OccasionNotice` (migration `occasion_emails`); both included in the data export.
- 2026-11-27: Rainy days on the home screen: the indoor ideas that fit the family's children (by age, then interests) now come first, with the line "Passend für eure Kinder zuerst." Uses child profiles or the welcome-screen ages; nothing new is stored or sent.
- 2026-11-26: Empty-state scenes with the star mascot (`components/illustrations/EmptyArt.tsx`): nothing saved (empty heart), no search results (magnifier), nothing planned today (napping star + calendar), not found (signpost), screen error (plaster), offline (cloud). Used on Gemerkt, Entdecken, Kalender, the not-found pages, the error screen and `offline.html`. The star now has sleepy, curious and "oops" faces.
- 2026-11-26: `pnpm art:export` writes the editable copy `design/mivora-empty-states.svg`.
- 2026-11-25: 19 more fictional demo listings (32 visible, 15 Köln Stadtteile, all 9 languages) in `src/data/demo-activities-more.ts`.
- 2026-11-25: `pnpm demo:phone` serves the built demo on the local Wi-Fi and prints the phone link + QR code; [docs/demo-guide.md](docs/demo-guide.md) with the meeting click path.
- 2026-11-25: Project documentation: `CLAUDE.md`, `CONTRIBUTING.md`, this changelog, `docs/features.md`, `docs/architecture.md`, `docs/status.md`, `docs/glossary.md`, ADRs 0001–0003.

### Changed
- 2026-11-26: `pnpm demo:phone` first stops an older Mivora demo still running on port 3000 (only a Next.js server from this project folder), then builds and serves. Anything else on the port is left alone with a short hint.
- 2026-11-26: Swipe rows (Kategorien, "Für {child}"): no more "more" arrow button; swipe with a finger, or drag with the mouse on a laptop. The edge fade and cut-off item still show there is more.
- 2026-11-26: "Für {child}" headings on the home screen: calm Fredoka ink letters instead of the outlined sticker style; the child's name gets a hand-drawn squiggle in their own colour (works in light and dark).

### Fixed
- 2026-11-26: Screen readers read the "Für {child}" headings with gaps ("Für dein Kind ( 5 )"); they now hear the plain sentence. This also fixes the failing first-launch e2e test.
- 2026-11-26: iPhone Safari: Kategorien swipes still failed now and then. Touching a bubble no longer starts the icon wiggle, the press-shrink or the section badge wiggle on touch screens (they stay for the mouse).
- 2026-11-26: iPhone Safari: the Kategorien row still didn't swipe when the finger started on a bubble. The bubbles' pop-in animation no longer stays attached after it plays.
- 2026-11-26: iPhone Safari: sideways rows on the home screen (Kategorien, Wochenende, Kostenlos, Ferien) didn't move with a finger. Sections with a swipe row no longer use the scroll-in rise animation.
- 2026-11-25: The desktop "get the app" QR code used `https` for home-network addresses (e.g. `192.168.…`); it now uses `http` there.

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
