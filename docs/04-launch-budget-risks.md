# Köln 90-Day Launch Plan, Budget, Risks & Legal Review Checklist

> All targets and costs are **[ASSUMPTIONS]** for planning, not forecasts. Verify prices before committing.
> Team assumption (confirmed 2026-11-16): **founder + Claude, small budget** — no paid developers.

## 1. 90-day plan (Phase 0 + Phase 1)

**Days 1–30 — Discovery & foundations**
- 20 parent interviews (≥ 8 non-German-first-language; recruit via Familienzentren, parent groups, own network — with consent), 15 provider interviews.
- Competitor hands-on audit (see 02-competitor-research.md).
- Use the coded preview as clickable prototype; usability-test Home / Explore / Detail with 8 parents in 3 languages.
- Decide legal form (UG/GmbH) and book initial lawyer consultation (privacy + platform terms).
- Choose 2 pilot districts **[ASSUMPTION: Ehrenfeld + Kalk** — young families, diversity, dense provider supply; validate].

**Days 31–60 — Supply first**
- Recruit 30–50 pilot providers in pilot districts (in person + German outreach kit). Offer: free listing, we enter data, they approve.
- Request written permission/licences from public institutions (Stadtbibliothek, museums, Familienzentren) for their programme data; check offenedaten-koeln.de datasets and their licences.
- Build remaining Phase 1: database, accounts, child profiles, My Week, admin approval, provider submit form.
- Target: 300+ verified upcoming listings in pilot districts before any parent marketing.

**Days 61–90 — Soft launch**
- Closed beta with 100–200 families (interviewees, provider customers via flyers providers hand out).
- Measure: weekly active families, saves/family, My Week adds, inquiry/external click-through, stale-listing rate, provider time-to-publish.
- Iterate weekly; prepare Phase 2 (provider portal + payments) only if click-through/inquiry data shows booking intent.
- Prepare pitch deck + inquiry to Stadt Köln Wirtschaftsförderung (KölnBusiness) and NRW programmes — **after** researching current programmes and eligibility; no claim of endorsement.

**Go/no-go at day 90 [ASSUMPTION thresholds]:** ≥ 30 % of beta families return in 2 consecutive weeks; ≥ 20 providers actively updating; stale rate < 5 %.

## 2. Budget ranges (first 6 months, excl. founder salaries)

| Item | Low | High | Assumption |
|---|---|---|---|
| Company formation (UG/GmbH, notary, register) | €500 | €3,000 | UG cheapest; GmbH needs €25k share capital (half paid in) — confirm with advisor |
| Lawyer: privacy notice, AGB parents/providers, DPA review | €3,000 | €10,000 | Flat-fee packages vs. bespoke |
| Tax advisor setup + bookkeeping | €1,000 | €3,000 | — |
| Infra & SaaS (hosting, DB, email, maps, Sentry, analytics, translation) | €300 | €1,500 | €50–250/month |
| Design (brand, illustrations) | €0 | €6,000 | Founder/AI-assisted vs. freelance illustrator |
| Development | €0 | €40,000 | Founder-built with Claude (chosen) vs. freelance devs |
| Native-speaker translation review | €300 | €1,500 | Review of AR/TR/UK/PL/FR/ES/IT UI strings |
| Provider outreach (print, travel, events) | €500 | €2,500 | — |
| Parent launch marketing | €1,000 | €5,000 | Flyers via providers, local partnerships, small paid social |
| Insurance (Betriebshaftpflicht, possibly Vermögensschaden/Cyber) | €300 | €1,500 | Get broker quotes |
| **Total** | **≈ €6.9k** | **≈ €74k** | With founder-built development: **≈ €6.9k–34k** |

A 12-month financial model with unit economics follows in the business-plan phase.

## 3. Key risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Incumbent (Kindaling) already covers needs well enough | Med–High | High | Validate wedge in interviews before heavy build; kill/pivot criteria |
| Cold start: too few listings → parents leave | High | High | Supply first, district-by-district; don't market before 300 listings |
| Stale/wrong data destroys trust | High | High | Expiry, Prüfdatum, provider reminders, report button |
| Providers won't pay commission | Med | High | Free listing first; test willingness in interviews; low commission only on completed bookings |
| Legal: children's data, platform obligations, consumer law | Med | High | Data minimisation, lawyer review before launch, no payments until reviewed |
| Machine translation errors in terms/prices | Med | Med | Never translate prices/terms without original shown; "Original anzeigen" |
| Founder bandwidth | High | High | Ruthless scope; phase gates |

## 4. Legal & compliance review checklist (questions for a German lawyer / tax advisor)

Not legal advice. **No compliance is claimed until reviewed by qualified professionals.**

**Privacy (DSGVO/BDSG/TDDDG)**
- [ ] Legal bases for each processing purpose (account, child profiles, reminders, analytics, translation).
- [ ] Is a child profile (nickname + birth year + interests) personal data of the child? Parental-responsibility wording; Art. 8 DSGVO relevance (we don't offer accounts to children).
- [ ] Datenschutzerklärung in German + translations; which version is binding.
- [ ] Terminal-access rules (§ 25 TDDDG) for cookieless analytics, local storage (Saved list), map tiles.
- [ ] DPAs (AVV) with all processors; third-country transfers (US-owned vendors, EU-US DPF).
- [ ] Records of processing, DPIA needed?, deletion/retention periods, export (Art. 15/20).
- [ ] Data protection officer required? (threshold § 38 BDSG).

**Platform & consumer law**
- [ ] Impressum (§ 5 DDG) content.
- [ ] DSA obligations for an online platform/marketplace (notice-and-action, trader traceability Art. 30, ranking transparency, small-enterprise exemptions).
- [ ] P2B Regulation: provider terms, ranking parameters, promoted-listing labelling.
- [ ] Are we intermediary or contracting party for bookings? Consumer withdrawal rights (§ 312g BGB exception for leisure services on specific dates?), information duties, cancellation terms.
- [ ] AGB for parents and providers; liability disclaimers; insurance responsibility of providers.
- [ ] Reviews: UWG/Omnibus rules on verified reviews.
- [ ] Barrierefreiheitsstärkungsgesetz (BFSG, from 28.06.2025): does it apply to our booking/e-commerce service, and microenterprise exemption?
- [ ] Copyright/database rights for imported data and provider-uploaded photos (licence grant in provider terms).

**Payments, tax (Phase 2 — tax advisor)**
- [ ] Payment-services regulation: does using Stripe Connect avoid needing our own ZAG licence?
- [ ] VAT on commission (B2B, reverse charge?), invoicing duties, Kleinunternehmer status.
- [ ] Platform reporting (DAC7 / PStTG) obligations for reporting provider income.
- [ ] Deemed-supplier rules announced for 2027 — relevance for a services marketplace.
- [ ] Refund/chargeback liability allocation between platform and provider.

**Provider verification & child safety**
- [ ] What may we ask providers (Gewerbeanmeldung, Vereinsregister, insurance)? Do we ask about erweitertes Führungszeugnis for staff, and how to phrase it so we don't claim to guarantee safety?
- [ ] Wording of "Verifiziert" badge so it is not misleading.

**App stores (Phase 3)**
- [ ] Apple/Google "Kids" category vs. family-audience rules, privacy labels, account deletion in-app.
