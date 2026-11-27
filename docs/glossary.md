# Glossary

German and domain terms used in the UI, routes and code.

| Term | Meaning | In code |
|---|---|---|
| **Aktivität / Angebot** | An activity offered to children; has one or more dated sessions | `Activity`, route `/aktivitaet/[slug]` |
| **Termin** | One dated occurrence | `Session` |
| **Anbieter** | Organisation or person offering activities | `Provider`, route `/fuer-anbieter` |
| **Verein** | Registered non-profit club | provider type |
| **Stadtteil / Stadtbezirk** | Köln neighbourhood / one of 9 city districts | `Venue.district` |
| **Ferien** | School holidays (NRW) | holiday filter / section |
| **Entdecken** | Explore: search and browse | `/entdecken` |
| **Gemerkt** | Saved activities | `/gemerkt`, `SavedActivity`, `saved-store.ts` |
| **Meine Woche / Kalender** | The family calendar | `/meine-woche`, `PlannedItem` |
| **Willkommen** | First-start screen with city picker | `/willkommen`, cookie `mv_city` |
| **Anmelden** | Sign in with an email code | `/anmelden`, `LoginCode`, `AuthSession` |
| **Anfrage** | Booking request to a provider | `Inquiry` |
| **Problem melden** | Report a wrong listing | `Report` |
| **Zuletzt geprüft** | "Last checked" date on a listing | `lastVerifiedAt` |
| **Verifiziert** | Provider checked by Mivora (no safety guarantee) | provider verification |
| **Impressum / Datenschutz / AGB** | Legal notice / privacy policy / terms | `/rechtliches/[page]` |
| **AVV** | Data processing agreement (DPA) | — |
| **DSGVO** | GDPR | — |
