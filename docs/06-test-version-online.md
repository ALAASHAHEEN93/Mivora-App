# Putting a test version of Mivora online

Status: **prepared, not deployed.** Nothing is online until you create the accounts below and we run the steps together.

## What the test version is

- The full app (demo listings, accounts, calendar, provider form, photo upload) on one server in Germany.
- **Behind a shared tester password** (browser login box) on every page, and marked `noindex`, so only people you invite can open it and search engines stay away.
- Demo data only. No real families, no real providers yet.
- HTTPS certificates are created and renewed automatically (Caddy).
- Nightly backups of database and photos on the server (`deploy/backup.sh`).

## Recommended setup (small budget, data stays in the EU)

| Part | Recommendation | Why |
|---|---|---|
| Server | One small cloud server at a German host (e.g. Hetzner Cloud, location Nuremberg or Falkenstein), Ubuntu 24.04 | Data in Germany, a few euros a month, runs everything with Docker |
| Database + photos | On the same server (PostgreSQL + Docker volume) | No extra service or cost for a test version |
| Email for sign-in codes | An EU email provider with SMTP and a free tier (e.g. Brevo) | Sign-in codes must reach real inboxes |
| Web address | `<server-ip>.sslip.io` to start (free), your own domain later | No domain purchase needed for testing |

Check current prices on the providers' websites before ordering. Alternatives (Vercel + Neon + object storage) also work but need code changes for photo storage and put parts of the data with US companies.

## Your steps (accounts and payment are yours)

1. **Server:** create an account at the hosting company, add a payment method, and create a server: Ubuntu 24.04, smallest shared plan with ≥2 GB RAM, location Germany. Add your SSH key during creation (I can help you create one). Send me the server's **IP address** — never send passwords.
2. **Email:** create an account at an EU email provider, verify a sender address, and create SMTP credentials. Put them into `deploy/.env` on the server yourself (step 5), not into the chat.
3. **Data protection:** sign the provider's data processing agreement (AVV/DPA) — usually a checkbox or PDF in their account settings. Same for the email provider.
4. **Tester password:** choose a password you'll share with testers.
5. **Secrets file:** on the server, copy `deploy/env.example` to `deploy/.env` and fill it in (I'll guide you line by line; random values can be generated with `openssl rand -base64 32`).

## My steps (once the server exists and you allow me access)

1. Install Docker on the server and copy the code (from GitHub).
2. Build and start: `docker compose -f deploy/compose.yml --env-file deploy/.env up -d --build`
3. Create tables: `docker compose -f deploy/compose.yml --env-file deploy/.env run --rm migrate`
4. Load demo listings: `docker compose -f deploy/compose.yml --env-file deploy/.env run --rm seed`
5. Turn on the firewall (only ports 22, 80, 443), automatic security updates and the nightly backup.
6. Check: tester password works, HTTPS valid, sign-in email arrives, provider → admin flow works, photos load.

## Before real families use it (not for the test version)

- Impressum, Datenschutzerklärung and provider terms written or reviewed by a lawyer.
- Decide on a real domain and remove the tester password.
- Off-server backups (second location) and monitoring/alerts.
- Native-speaker review of the translations.
