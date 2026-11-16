# Mivora — Product Brief & MVP Blueprint

> Status: **Draft v0.1 (2026-11-16)**. Nothing here has been validated, funded or legally reviewed. A first code preview on demo data exists (see repo README).
> Labels used throughout: **[FACT]** = sourced, **[HYPOTHESIS]** = must be validated in Phase 0, **[ASSUMPTION]** = working decision we can change.

---

## 1. One-page product brief

**Product.** Mivora is a multilingual, German-first web app (later native apps) that helps families in Köln discover, plan and book children's activities, organised around *the family's week* rather than a flat event list.

**Problem [HYPOTHESIS — validate in interviews].**
1. Information is fragmented: club websites, Instagram, library/museum programmes, Kita/school flyers, PDF Freizeitkalender of Sozialraumkoordination, and marketplaces such as Kindaling.
2. Planning is the hard part, not finding: parents with 2–3 children of different ages juggle times, districts, holidays (Ferien) and budgets.
3. Non-German-speaking families (a large share of Köln's population) struggle with German-only listings and booking terms.
4. Small providers (studios, Vereine, freelance course leaders) lack time to maintain listings on many platforms.

**Solution.** One trusted catalogue with verified, dated, provenance-tracked listings; child profiles (birth year + interests only) that drive age-appropriate results; a **"My Week"** calendar with conflict warnings; translated listings; and provider self-service.

**Target users.** Parents/guardians of children 0–17 in Köln (all 9 Stadtbezirke); grandparents/carers as secondary users; activity providers (Vereine, studios, Musikschulen, museums, libraries, Familienzentren, camp organisers).

**Positioning [ASSUMPTION].** *"Eure Familienwoche in Köln — geplant in fünf Minuten."* Not "more listings than X", but *the planning layer* for families, especially multilingual ones, with stricter data freshness (every listing expires and shows "zuletzt geprüft am").

**Business model.** Free for parents. Providers list for free. Phase 2: commission on *completed* paid bookings (working range 8–15 %, to be validated). Optional, clearly labelled promoted listings / Pro subscription later — never required, never disguised as ranking.

**Why we could win [HYPOTHESIS].** (a) planning UX for multi-child families, (b) 9 languages incl. Arabic RTL, Turkish, Ukrainian, Polish, (c) hyper-local Köln supply built district by district with in-person relationships, (d) trust: provenance, verification badge, honest prices.

**Success in 12 months [ASSUMPTION — targets, not forecasts].** 150+ verified providers in Köln, 1,500+ active listings with < 2 % stale, 5,000 registered families, 25 % of them planning ≥ 1 activity/month in My Week, first 500 paid bookings through the platform.

**Out of scope for MVP.** Native apps, integrated payments, reviews, AI recommendations, other cities, ticketing for large events, childcare/Kita placement, chat between parents.

---

## 2. Personas [HYPOTHESIS — replace with interview evidence]

| Persona | Situation | Goals | Pain points | Must-haves |
|---|---|---|---|---|
| **Lena, 38, Ehrenfeld** | Works 30 h, 2 kids (4 & 8) | Weekend plans, Sommerferien coverage | Planning across ages, last-minute search | Weekend view, age filter, holiday camps, My Week |
| **Ahmad & Rania, Kalk** | Arabic at home, 3 kids (2, 6, 11) | Affordable activities, language-friendly | German-only info, unclear prices | Arabic UI (RTL), free filter, price clarity, map |
| **Olena, Porz** | Ukrainian, 1 child (9), new to Köln | Social integration, sports club | Doesn't know the Vereinssystem | Ukrainian UI, "Verein" explainer, beginner-friendly tag |
| **Mehmet, grandfather, Mülheim** | Picks up grandkids 2×/week | Nearby, short, cheap | Small text, complex apps | Large type, Turkish UI, distance filter, simple share |
| **Provider: Julia, dance studio, Südstadt** | 4 staff, 120 kids | Fill courses, fewer admin hours | Instagram reach limited, no time | 10-min listing, recurring sessions, capacity |
| **Provider: Sportverein (volunteers)** | Volunteer-run | Get new members | No marketing skills, no budget | Free listing, we help onboard, contact/inquiry |
| **Provider: Museum / library** | Public institution | Reach diverse families | Own website rarely visited | Feed/import with permission, free events |

## 3. Key user journeys

1. **Saturday morning, "what now?"** — Open app → Home shows *Heute* / *Dieses Wochenende* pre-filtered by children's ages + district → filter "Drinnen" + "kostenlos" → open detail → *Zu meiner Woche hinzufügen* → share to partner via WhatsApp link.
2. **Holiday planning (Osterferien)** — Home → "Ferienangebote" tile (NRW holiday dates pre-filled once verified from the official source) → filter child "Sami, 8" + week 2 + max €200 → compare 3 camps → save → My Week shows coverage gaps per child → *Anfragen/Buchen* (external link in MVP).
3. **Multilingual family** — First launch asks language (shows native names: العربية, Türkçe, Українська…) → UI switches incl. RTL → listing shows translated description with "automatisch übersetzt – Original anzeigen" toggle + language-of-instruction tag.
4. **Provider onboarding** — Landing "Für Anbieter" → register org → verify email + Impressum/registration info → create activity from template → recurring sessions → submit → admin review (≤ 48 h target) → published with "Verifiziert" badge.
5. **Provider correction/claim** — Provider finds a listing we imported from a permitted public feed → *Diesen Eintrag beanspruchen* → verification → takes over editing; or reports error → admin queue.

## 4. MVP feature list (Phase 1 = responsive web, Köln)

**MUST (Phase 1)**
- Localised UI: DE (default), EN, AR (RTL), TR, UK, PL, FR, ES, IT. Localised routes `/de/...`.
- Activity catalogue: listing + sessions (dates/times), categories, age range, price (EUR / kostenlos), venue with district, language of instruction, indoor/outdoor, accessibility tags ("provider-stated" vs "verified").
- Home: search, date chips (Heute / Morgen / Wochenende / Ferien), categories, "Kostenlos", "Ferienangebote".
- Explore: list + map, filters (age, date, district, distance, price, language, indoor/outdoor, accessibility).
- Activity detail: all fields from brief, provenance ("Quelle", "zuletzt geprüft"), organizer, cancellation text, CTA = *Anfragen* (email form) or *Beim Anbieter buchen* (external link).
- Parent account (email magic link / passkey), child profiles (nickname optional, birth year, interests), never public.
- Saved activities.
- My Week: weekly calendar, per-child filter, conflict warning, .ics export.
- Provider light: admin-created or provider-submitted listings via a simple form; admin approval.
- Admin: approve/reject listings, edit, expire, provider verification flag, audit log.
- Auto-expiry: past sessions never appear as upcoming; listings without future sessions hidden; "re-verify" queue after 60 days.
- Legal pages: Impressum, Datenschutzerklärung, AGB (lawyer-drafted); cookieless analytics so possibly no consent banner for analytics [ASSUMPTION — confirm with lawyer].
- Accessibility WCAG 2.2 AA target, SEO (SSR, schema.org `Event`), German date/EUR formats.

**SHOULD (Phase 1 if time, else 2)**
- Email reminders (opt-in) for saved/added activities.
- Machine translation of listings with "original" toggle, flagged as automatic.
- Share link (WhatsApp/Signal) with preview image.
- Provider self-service portal (login, edit own listings, recurring sessions).
- Claim/correction workflow.

**COULD (Phase 2+)**
- Integrated booking & payments (Stripe Connect), commission, payouts, invoices.
- Reviews after verified attendance.
- Push notifications, native apps (Expo).
- Personalised recommendations, family sharing (2 parents, one family).
- Promoted listings / provider Pro plan, analytics dashboards.

**WON'T (now) — and why**
- Payments in Phase 1: needs company, AGB, KYC, VAT/marketplace legal review; external links test demand first.
- Reviews: need verified attendance to be trustworthy; moderation load.
- Scraping competitors or provider websites: legal (database rights, ToS) and trust risk.
- Microservices, native apps, AI chat, social features.
- Collecting health/disability data about children — accessibility is a filter on activities, never a field on the child.

## 5. Sitemap

```
/[locale]
├── /                         Home
├── /entdecken                Explore (list | map | calendar)
│   └── ?q=&datum=&alter=&kategorie=&bezirk=&preis=&sprache=&ort=&barrierefrei=
├── /aktivitaet/[slug]        Activity detail
├── /anbieter/[slug]          Provider page
├── /ferien/[ferien-slug]     Holiday landing (osterferien-2027 …)
├── /koeln/[bezirk]           District landing (SEO)
├── /meine-woche              My Week            (auth)
├── /gemerkt                  Saved              (auth; device-only in preview)
├── /profil                   Profile, children, settings, privacy, delete (auth)
├── /anmelden
├── /fuer-anbieter            Provider landing + submit form
├── /provider/*               Provider portal    (role: provider)
├── /admin/*                  Admin console      (role: admin/moderator)
└── /impressum /datenschutz /agb /barrierefreiheit /hilfe
```
Mobile bottom nav: **Start · Entdecken · Meine Woche · Gemerkt · Profil**.

## 6. Screen-by-screen wireframe descriptions (mobile-first; desktop = 2–3 columns)

**Home** — Top bar: logo, language switcher (later: location chip "Köln · Ehrenfeld ▾"). Search field ("Aktivität, Anbieter oder Stadtteil"). Date chips row. If children exist: "Für Mia (4) & Ben (8)" toggles. Category grid. Sections as horizontal card carousels: *Dieses Wochenende*, *Kostenlos*, *Ferienangebote*, *Neu in deinem Bezirk*. Trust note: "Jedes Angebot zeigt Quelle und Prüfdatum".

**Explore** — Date chips; collapsible "Filter (n)" panel; later a List | Karte | Kalender switch. Result cards: image, title, age badge ("6–10 J."), next date ("Sa., 21.11., 10:00"), district, price ("12,00 € pro Kind" / "Kostenlos"), languages ("DE · EN"), save heart. Empty state with illustration + "Filter zurücksetzen".

**Activity detail** — Image; chips (age, category, indoor); title + summary; translation notice when shown in original language; next dates (+ "weitere Termine"); description; cancellation/conditions; provenance line ("Quelle … · Zuletzt geprüft 12.11.2026"). Side/fact panel: price, address + map link, languages, accessibility ("laut Anbieter" / "geprüft"), organizer with "Verifiziert" badge. Sticky bottom on mobile: **Beim Anbieter buchen / Anfragen** · ♡ Merken. Later: "Zu meiner Woche", "Fehler melden", share.

**My Week** — Week header with arrows + "Diese Woche"; child filter avatars (initials/colours, no photos); 7-day agenda on mobile, grid on desktop; conflict banner ("Mia: 2 Termine überschneiden sich am Sa"); empty day suggestions; export .ics.

**Saved** — list grouped "Kommend" / "Abgelaufen" (expired kept greyed, removable).

**Profile** — Family: children (birth year, interests chips), language, home district (not exact address), notifications, privacy (data export, delete account), legal links.

**Provider submit (Phase 1)** — multi-step form: organisation → activity basics → sessions → price/terms → photos (rights confirmation checkbox) → review.

**Admin** — queue tables: Pending listings, Reports, Re-verify due, Providers; detail with diff view and approve/reject reason; audit log.

States for every screen: loading skeletons, empty, error with retry, offline notice, success toasts.
