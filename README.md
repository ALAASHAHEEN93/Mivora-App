# Mivora

Multilingual family activity discovery for Köln (German-first, 9 languages, Arabic RTL).

> **Status:** early MVP preview. Runs on **fictional demo data only**. Nothing is deployed and nothing has had legal review.
> Planning docs: [docs/](docs/README.md).

## What works now
- Home: search, date chips (Heute / Morgen / Wochenende / 7 Tage), categories, *Dieses Wochenende*, *Kostenlos*, *Ferienangebote*
- Explore: list with filters for text, date, child's age, category, district, price, language, indoor/outdoor and accessibility. The filters work without JavaScript (plain GET form).
- Activity detail page with dates, price, venue, OpenStreetMap link, languages, accessibility (labelled as "provider-stated" or "verified"), provider verification, cancellation text, source and "last checked" date, schema.org `Event` JSON-LD
- Freshness rule: drafts, expired listings and past or cancelled sessions never show as upcoming
- Saved: stored on the device only (localStorage) until family accounts exist
- 9 UI languages with native-name switcher; listings fall back to their original language and say so
- Light and dark mode, WCAG contrast tested, skip link, focus styles, reduced motion
- Calendar (Kalender): month and week views, plan specific dates from an activity or from the day's ideas, overlap warnings, .ics export for Google/Apple/Outlook. Planned dates are stored on the device only until family accounts exist.
- Original illustrated artwork per category (SVG, no image licensing), Mivora sun mascot
- Profile is a placeholder

## Run locally
Requires Node 20+ and pnpm.
```bash
pnpm install
pnpm dev          # http://localhost:3000 → redirects to /de
pnpm test         # unit tests (filters, dates, i18n parity, colour contrast)
pnpm typecheck
pnpm build && pnpm start
pnpm build:check  # production build without disturbing a running dev server
```

## Structure
```
messages/            UI strings per locale (de is the source; missing keys fall back to de)
src/app/[locale]/    pages: / · entdecken · aktivitaet/[slug] · gemerkt · meine-woche · profil
src/components/      UI components (design tokens live in src/app/globals.css)
src/domain/          pure logic: types, filters, Berlin-time date ranges, formatting, query validation
src/data/            repository interface + demo data (swap for PostgreSQL in the next step)
src/i18n/            next-intl routing/config
docs/                product, research, tech and launch docs
```

## Notes
- **Translations** other than German and English were written without native-speaker review. Have them checked before launch, starting with Arabic, Turkish and Ukrainian.
- **Demo data:** providers, addresses and prices are invented; districts are real Köln Stadtteile. Session dates are generated relative to today.
- **Secrets:** none needed yet. Use `.env.local` (git-ignored) later, never commit real values.
- **CI:** `.github/workflows/ci.yml` runs typecheck, tests and build.
