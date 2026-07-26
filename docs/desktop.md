# Desktop App (NativePHP)

> **Status: Plan/proposal — not yet implemented.** This document describes the agreed approach for converting to a desktop app, not a feature that's already live.

Back to docs index: `docs/README.md`

## Decision

Target: **standalone single-store app** — one install per shop, running locally on a single computer, not dependent on a server/internet for daily operations.

Tool: [NativePHP](https://nativephp.com) (`nativephp/electron`) — wraps the existing Laravel + Inertia app in an Electron shell, bundles the PHP binary along with it, no separate web server needed.

Reason this approach was chosen over the alternatives (thin client to a hosted server, or hybrid web+desktop): simplest, matches NativePHP's design, and avoids the app still needing internet for daily transactions.

## What Must Be Removed/Changed

The following features depend on network infrastructure that doesn't make sense for a single-machine app:

| Feature | Problem | Action |
|---------|---------|--------|
| Payment webhook (`app/Http/Controllers/Api/PaymentWebhookController.php`, `PaymentSettingController.php`) | Needs a public `APP_URL` — dead on the customer's PC | Replace with status polling to the gateway API (Midtrans/Xendit), or remove & use cash/manual only |
| WhatsApp gateway (`app/Services/WhatsAppService.php`, `CrmAutomationService.php`, `resources/js/Pages/Dashboard/Settings/Whatsapp.jsx`, `CrmCampaigns/*`, `CrmReminders/Index.jsx`) | Needs a separate Node process (`whatsapp-web.js`) — no way to bundle it into Electron | Remove for v1, WA-send buttons in `Transactions/History.jsx` & `Receivables/Show.jsx` removed along with it |

See details on the removed WhatsApp feature in `docs/features/whatsapp-gateway.md` (this feature no longer applies in the desktop build).

## What Doesn't Change

- All other Inertia pages (`resources/js/Pages/Dashboard/**`) — used as-is.
- Spatie roles/permissions & Breeze auth — still relevant (multi-staff login on one machine).
- `QUEUE_CONNECTION=database` & `BROADCAST_CONNECTION=log` — already fine for local use, no Redis/Pusher needed.

## Configuration Changes

- `DB_CONNECTION=sqlite` for production (the default fallback in `config/database.php:19` is already sqlite — just don't override it to mysql in the built `.env`).
- First-launch bootstrap: run `migrate --seed` once against the local sqlite DB + `storage:link` to NativePHP's app-data path (via a native boot hook).

## Setup (planned)

```bash
composer require nativephp/electron
php artisan native:install
php artisan native:build   # generate installer per OS (mac/win/linux)
```

## Not Yet Decided

- Payment gateway: drop entirely, or switch to API status polling?
- Migrating existing customer data from multi-terminal MySQL to single-store sqlite (if a shop is already running the web version).
