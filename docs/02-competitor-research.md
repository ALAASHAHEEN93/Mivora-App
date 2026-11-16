# Competitor Research — Plan & Preliminary Comparison

> Status: **preliminary desk research, 2026-11-16**. Only a few web searches were run. Treat everything not marked [FACT] as a hypothesis to verify by hands-on testing (create accounts, test bookings, read AGB) and provider/parent interviews.

## 1. Research plan (Phase 0, weeks 1–3)

1. **Inventory** competitors in 4 groups:
   - Marketplaces/discovery: Kindaling; check also any others active in Köln/NRW (search app stores + Google for "Kinderkurse Köln buchen", "Ferienprogramm Köln", "Kinderveranstaltungen Köln App").
   - City/public sources: stadt-koeln.de events, Stadtbibliothek Köln event booking, museenkoeln.de family programme, Sozialraumkoordination Freizeitkalender (PDFs), Jugendamt Ferienangebote.
   - Local media/blogs/newsletters & Instagram/Facebook family groups.
   - Generic tools: Eventbrite, Meetup, Google Maps, club booking software (Vereins-/Kursverwaltung tools providers already use — these are potential integration partners, not just competitors).
2. **For each:** coverage in Köln (count listings per category/district on a fixed date), freshness (% expired/undated items in a sample of 50), languages, booking model, provider fees (from public provider pages/AGB only), parent features (calendar, child profiles, reminders), app ratings & review themes.
3. **Interviews:** 20 parents (min. 8 non-German-first-language), 15 providers. Ask what they use today, last time planning failed, willingness to pay commission.
4. **Output:** filled matrix below + "unmet needs" list ranked by frequency × severity.

## 2. Preliminary comparison

| Dimension | Kindaling | Stadt Köln / museums / libraries | Instagram / FB groups | Mivora (planned) |
|---|---|---|---|---|
| What it is | [FACT] Online marketplace for children's activities in the German-speaking region; Kindaling GmbH, Berlin, founded 2016 (per its site). Has a Köln section with courses, holiday camps, family events, birthdays | [FACT] Official programmes; Stadtbibliothek has its own event booking; city publishes a "Veranstaltungsorte" open dataset (venues, not events) under dl-zero-de/2.0 | Informal recommendations | Planning-first discovery + booking |
| Köln coverage | [FACT] Many paginated Köln listing pages incl. public venues (libraries, playgrounds) and commercial ones. Volume to be counted | Authoritative but fragmented | Patchy | Starts small, district by district |
| Booking | [FACT] Direct booking for some offers; commission model for providers (per third-party profile — **verify**) | Own systems / none | None | Phase 1 external link/inquiry, Phase 2 integrated |
| Scale claims | 2,000+ providers / 6,000+ offers per a third-party profile (getbaito) — **unverified** | n/a | n/a | — |
| Languages | **To verify** (appears German-first) | Mostly German | Mixed | 9 languages, RTL |
| Child profiles / weekly planner | **To verify** — do not assume absent | No | No | Core feature |
| Freshness signals | **To verify** — search results surfaced past-dated pages | Varies | None | Prüfdatum + auto-expiry on every listing |

**Honest read:** Kindaling is an established incumbent with real Köln supply. Competing head-on on "number of listings" is a losing game for an MVP. Differentiation must come from a validated unmet need. Candidate wedges [HYPOTHESIS]:
- Multi-child **week planning** with conflict detection and holiday coverage.
- **Multilingual** families (Arabic, Turkish, Ukrainian, Polish communities in Köln — verify size with Stadt Köln statistics).
- **Free/low-cost public offers** (libraries, Familienzentren, Jugendzentren) presented as well as commercial ones.
- **Provider effort:** take listings off providers' hands (we enter them, they approve).

## 3. Sources consulted
- https://www.kindaling.de/koeln, https://www.kindaling.de/ausfluege-aktivitaeten/koeln, https://www.kindaling.de/veranstaltungen/koeln
- https://www.getbaito.com/de/orga/kindaling (third-party, unverified figures)
- https://ckan.open.nrw.de/fr/dataset/veranstaltungsorte-in-koln-k (venue dataset; check licence on dataset page)
- https://www.stadt-koeln.de/artikel/71460/index.html?euid=371 (Stadtbibliothek event booking)
- https://museenkoeln.de/portal/Programm-fuer-Kinder-Familien
- https://publish.obsidian.md/datenprojekte-civic-data/Projekt/Veranstaltungen+in+K%C3%B6ln (OK Lab Köln project — licence to verify)
