# Features

What Mivora does today and what is planned, grouped by area. Every feature has an ID, so code, issues and commits can refer to it (e.g. `feat(F-CAL-01): …`).

- **Scope source:** [01-product-brief-and-mvp.md §4](01-product-brief-and-mvp.md) (MoSCoW). **Build order:** [05-implementation-plan.md](05-implementation-plan.md). **Progress:** [status.md](status.md).
- **Status:** ✅ Done (works locally) · 🟡 Partly done · 💤 Not started. Nothing is deployed; everything runs on **demo data** unless a local database is set up.

_Last updated: 2026-11-25, from the code at commit `af30ef3`._

---

## Overview

| ID | Feature | Status | Where in the code |
|---|---|---|---|
| F-ONB-01 | Splash and welcome screen (city, optional child ages) | ✅ | `app/[locale]/willkommen`, `components/Splash.tsx`, `middleware.ts` |
| F-HOME-01 | Home: sky/meadow hero, search, date chips, categories, sections | ✅ | `app/[locale]/(app)/page.tsx` |
| F-HOME-02 | "Für …" suggestions per child | ✅ | `components/ForYou.tsx`, `domain/suggestions.ts` |
| F-HOME-03 | "Was machen wir heute?" surprise picker | ✅ | `components/SurprisePicker.tsx` |
| F-HOME-04 | Rain outlook banner (indoor tips) | ✅ | `server/weather.ts` |
| F-EXP-01 | Explore list with filters (no JS needed) | ✅ | `app/[locale]/(app)/entdecken`, `domain/filters.ts`, `domain/parse-filters.ts` |
| F-EXP-02 | Map view and "near me" | ✅ | `components/MapView.tsx`, `domain/geo.ts` |
| F-ACT-01 | Activity detail page | ✅ | `app/[locale]/(app)/aktivitaet/[slug]` |
| F-ACT-02 | Save / plan / share buttons | ✅ | `SaveButton.tsx`, `PlanButton.tsx`, `ShareButton.tsx` |
| F-ACT-03 | Report a problem | ✅ | `ReportProblem.tsx`, `server/reports.ts` |
| F-ACT-04 | Booking request by email (inquiry) | ✅ | `InquiryForm.tsx`, `server/inquiries.ts` |
| F-ACT-05 | External booking link | ✅ | `Activity.externalUrl` |
| F-SAV-01 | Saved list (device, synced with account) | ✅ | `app/[locale]/(app)/gemerkt`, `saved-store.ts`, `server/lists.ts` |
| F-CAL-01 | Calendar: month/week, per child, overlap warnings, .ics | ✅ | `app/[locale]/(app)/meine-woche`, `domain/calendar.ts` |
| F-ACC-01 | Family account: email code sign-in | ✅ | `app/[locale]/anmelden`, `server/auth/*` |
| F-ACC-02 | Child profiles, data export, account deletion | ✅ | `app/[locale]/(app)/profil`, `server/family.ts`, `api/account/export` |
| F-ACC-03 | Reminder and "still current?" emails | ✅ | `server/jobs.ts`, `scripts/daily-jobs.ts` |
| F-ADM-01 | Admin: dashboard, create/edit listings, approve/decline | ✅ | `app/[locale]/(app)/admin`, `server/listings.ts` |
| F-ADM-02 | Audit log of listing decisions | ✅ | `AuditLog` model |
| F-ADM-03 | Photo upload (checked, re-encoded, metadata removed) | ✅ | `server/photos.ts`, `api/photos/[id]` |
| F-ADM-04 | Problem reports list | ✅ | admin dashboard |
| F-PROV-01 | Provider self-submission | 💤 | Removed in `0a19301`; today only admins create listings |
| F-PROV-02 | Public provider page | 💤 | — |
| F-PROV-03 | "For providers" info page + contact | ✅ | `app/[locale]/(app)/fuer-anbieter` |
| F-LAND-01 | Holiday and district landing pages | 💤 | — |
| F-I18N-01 | 9 languages, Arabic RTL, native-name switcher | ✅ | `i18n/*`, `messages/*.json`, `LanguageSwitcher.tsx` |
| F-I18N-02 | Machine translation of provider texts | 💤 | Demo translations are hand-written |
| F-PLAT-01 | Brand design system, dark mode | ✅ | `app/globals.css`, `ThemeToggle.tsx`, `domain/theme.ts` |
| F-PLAT-02 | Original illustrations (meadow, kids, mascot, empty-state scenes) | ✅ | `components/illustrations/*`, `design/*.svg` |
| F-PLAT-03 | Installable app (PWA), offline page, desktop QR card | ✅ | `app/manifest.ts`, `public/sw.js`, `AppInstall.tsx`, `GetTheApp.tsx` |
| F-PLAT-04 | Accessibility (WCAG 2.2 AA target) | ✅ | contrast tests, Playwright + axe |
| F-PLAT-05 | SEO: schema.org `Event` | ✅ | activity page |
| F-PLAT-06 | Legal pages | 🟡 | Placeholders in `rechtliches/[page]`; texts need a lawyer |
| F-PLAT-07 | About page | ✅ | `app/[locale]/(app)/ueber` |
| F-PLAT-08 | Cookieless analytics | 💤 | — |
| F-PLAT-09 | Re-verify queue for stale listings | 🟡 | "Still current?" email exists; no admin queue |
| F-OPS-01 | Password-protected test version online | 🟡 | Prepared in `deploy/` ([06](06-test-version-online.md)); not deployed |
| F-PAY-01 | Integrated booking and payments | 💤 | Phase 2, needs legal/tax review |
| F-GROW-01 | Reviews, native apps, push, more cities | 💤 | Phase 3. City picker already lists 20 cities, only Köln is live |

---

## Details

### Onboarding
- **F-ONB-01 Welcome:** opening `/{locale}` without a chosen city redirects to `/{locale}/willkommen` (`middleware.ts`). The city picker lists Germany's 20 largest cities. Only **Köln** has listings (`domain/cities.ts`, `live: true`); the others say "coming soon". Optional child ages can be ticked. The choices are stored in the cookies `mv_city` and `mv_ages` (1 year).

### Discovery
- **F-HOME-01 Home:** animated sky/meadow hero, search, date chips (Heute / Morgen / Wochenende / 7 Tage), categories, and the sections *Dieses Wochenende*, *Kostenlos* and *Ferienangebote*.
- **F-HOME-02 Suggestions:** for signed-in families, "Für {child}" rows are computed from birth year and interests. Nothing extra is stored.
- **F-HOME-03 Surprise picker:** kids tap, the card shuffles through today's activities and lands on one. If nothing is left today, it suggests the coming days.
- **F-HOME-04 Rain banner:** the Deutscher Wetterdienst rain outlook for Köln, via the free Bright Sky API. Only fixed city coordinates are sent. Any failure means no banner.
- **F-EXP-01 Explore:** filters for text, date, child's age, category, district, price, language, indoor/outdoor and accessibility. It is a plain GET form, so it works without JavaScript, and filters live in the URL.
- **F-EXP-02 Map:** Leaflet with OpenStreetMap tiles, loaded only after the user clicks to agree (tiles come from a third party). "Near me" uses the device location, which never leaves the device.
- **Categories:** `sports, music, dance, arts, stem, theatre, museum, outdoors, baby, holidayCamp` (`domain/types.ts`).

### Activity
- **F-ACT-01 Detail:** dates, price, venue, OpenStreetMap link, languages, accessibility (labelled "provider-stated" or "verified"), provider verification, cancellation text, source and "last checked" date, schema.org `Event`. Listings fall back to their original language and say so.
- **Freshness rule:** drafts, expired listings and past or cancelled sessions never show as upcoming (`domain/filters.ts`, `upcomingSessions`).
- **F-ACT-04 Inquiry:** a form with an explicit consent checkbox. The email goes to the provider with Reply-To set to the parent.

### Planning
- **F-SAV-01 / F-CAL-01:** Saved and Calendar work on the device without an account. After sign-in they sync with the family account: merged on first sign-in, the account wins afterwards, and the device copy is cleared on sign-out. The calendar assigns children to dates, filters by child, uses child colours, warns only when the *same* child is double-booked, and exports `.ics`.

### Accounts
- **F-ACC-01:** sign-in with a 6-digit code sent by email. No passwords. Codes and session tokens are stored only as hashes and are rate-limited. In development, mails land in Mailpit (`localhost:8025`) and the code is shown on screen.
- **F-ACC-02:** a child profile holds only an optional nickname, birth year, interests and a colour. JSON data export and account deletion are available from Profil. Database tests prove one family can't read or change another's children (`server/family.db.test.ts`).

### Admin
- **F-ADM-01..04:** admins are the emails listed in `ADMIN_EMAILS`. They create and edit listings, approve or decline (with a reason), and see problem reports and stats. Every decision is written to `AuditLog`. Photos are checked by content (JPEG/PNG/WebP), limited to 5 MB, re-encoded to WebP ≤ 1600 px with metadata (GPS) removed, and stored on local disk until EU object storage is chosen.

### Platform
- **F-PLAT-01:** brand tokens in `app/globals.css` (see [architecture.md §6](architecture.md#6-design-system)). Light and dark mode follow the device, or the user's choice (`ThemeToggle`).
- **F-PLAT-03:** a web app manifest, generated app icons, a service worker with an offline page, an install card, and a "made for your phone" QR card on desktop.
- **F-PLAT-04:** contrast tests (`domain/contrast.test.ts`), skip link, focus styles, reduced motion, and Playwright + axe end-to-end checks (`e2e/`).
