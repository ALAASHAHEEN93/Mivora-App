# What Mivora stores: data inventory for the legal review

Status: factual list of what the code does today (2026-11-17). **This is not a privacy policy and not legal advice.** It is meant to save the lawyer time when writing the Datenschutzerklärung, AGB and provider terms.

## Personal data in the database

| Data | Whose | Why | Source | Deletion |
|---|---|---|---|---|
| Email address, chosen language | Parent / provider account | Sign-in with one-time code; replies to requests | Typed in at sign-in | With the account (Profil → "Konto löschen") |
| Sign-in codes (HMAC hash only), attempts | Account | Sign-in security, rate limiting | Generated | Code valid 10 min; deleted with the account |
| Session tokens (SHA-256 hash only) | Account | Staying signed in (30 days) | Generated | Sign-out or account deletion |
| Child profile: optional nickname, birth year, interests | Parent's children | Age-fitting suggestions, per-child calendar | Typed in by parent | Editable in Profil; deleted with account |
| Saved activities, planned dates, which child goes | Parent | Sync across devices, reminders | Parent's taps | Removable anytime; deleted with account |
| Reminder setting, "reminder sent" times | Parent | Evening-before reminder email | Setting in Profil | Deleted with account |
| Booking requests: preferred date, optional child age, message | Parent → provider | Forwarded to the provider by email (Reply-To = parent) | Request form, with explicit consent checkbox | Deleted with parent account; retention period still to decide |
| Problem reports: reason, optional note, optional reporter | Anyone | Fixing wrong listings | Report form | Retention still to decide |
| Provider listings: organisation, venue address, dates, texts, booking link, terms, optional photo | Provider | Publishing the activity | Provider form | Until deleted/archived; photo deleted when declined |
| Audit log: who submitted / approved / edited / confirmed which listing | Provider / admin | Accountability for published content | Automatic | Retention still to decide |

Not collected: children's real names, birthdays, family photos, health data, payment data, precise location.

## On the device only

| Item | Type | Purpose |
|---|---|---|
| `mv_city` | Cookie, 1 year | Chosen city |
| `mv_ages` | Cookie, 1 year | Children's ages ticked on the welcome screen (only if chosen) |
| `mv_session` | Cookie, httpOnly, 30 days | Signed-in session |
| `mv_login_email` | Cookie, httpOnly, 10 min | Email between "send code" and "enter code" |
| `NEXT_LOCALE` | Cookie | Language |
| `kw.saved.v1`, `mv.planned.v1`, `mv.syncedAccount.v1` | localStorage | Saved / planned lists and which account they synced with |
| `mv.mapConsent.v1` | localStorage | Parent agreed to load the OpenStreetMap map |
| "Near me" position | Browser memory | Sorting by distance; never sent to the server |

All cookies are functional. There is no analytics or advertising tracking.

## Third parties

| Who | When | What they receive |
|---|---|---|
| Hosting provider (planned: German cloud server) | Always | All data above (processor, needs a DPA/AVV) |
| Email provider (planned: EU SMTP service) | Sign-in codes, booking requests, reminders, "still current?" | Recipient address and email content (processor, needs a DPA/AVV) |
| OpenStreetMap tile servers | Only after the parent taps "Karte laden" | Parent's IP address and the map area viewed |
| Unsplash | Demo photos only, fetched by our server | Nothing about visitors |

## Open questions for the lawyer

1. Legal basis for each row and retention periods for requests, reports and the audit log.
2. Is the child profile (nickname, birth year, interests) fine as designed, and what must parents be told?
3. Provider terms: rights to texts and photos, consent of people shown in photos, liability for wrong listings.
4. Booking requests forward the parent's email to providers: wording of the consent and the provider's duties.
5. Is a cookie banner needed with only functional cookies and the two-click map?
6. Impressum details (company form, address, responsible person).
