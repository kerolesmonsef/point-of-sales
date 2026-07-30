# Desktop App — Implementation Notes

Back to [desktop.md](desktop.md) (main checklist).

Each section below documents specific changes for a business section when moving to desktop.

---

## POS Cashier

> **Status:** Changes identified, not yet implemented.
> **Checklist entry:** [desktop.md#pos-cashier](desktop.md#pos-cashier) — `[PROCESSING]`

### 1. Payment Gateways — Remove Midtrans/Xendit

Online payment gateways (Midtrans Snap, Xendit Invoice) require internet + public `APP_URL` — both dead on a desktop machine.

- **Remove** `app/Services/Payments/MidtransGateway.php`, `XenditGateway.php`, `PaymentGatewayManager.php`, `PaymentGatewayException.php`
- **Keep only** `cash` and `bank_transfer` (bank_transfer is manual/local, no external call)
- **Remove** payment gateway config UI in `Settings/Payment.jsx`
- **Remove** webhook endpoints in `routes/api.php` (`webhooks.midtrans`, `webhooks.xendit`)
- **Update** `TransactionController::store()` — remove gateway dispatch (lines 736-748)
- **Update** `Print.jsx` — remove gateway labels (lines 75-80) and `payment_url` link (lines 243-253)
- **Update** `PaymentPanel.jsx` — remove "Payment link will appear on the invoice page" text (lines 438-450)

### 2. Online Status & Offline Queue — Remove Entirely

The app has offline-first logic (IndexedDB queue, `navigator.onLine` checks) that's irrelevant for desktop — the app IS the server.

- **Remove** `resources/js/Context/OnlineStatusContext.jsx`
- **Remove** `resources/js/Utils/offlineDb.js` (and `idb` npm dependency)
- **Remove** offline warning banner from `POSLayout.jsx` (lines 233-237)
- **Remove** offline queue path from `Transactions/Index.jsx` (lines 487-508, `queueTransaction` import)
- **Remove** `useOnlineStatus` import from `POSLayout.jsx` and `Transactions/Index.jsx`

### 3. WhatsApp Share Buttons — Remove

All "Share to WhatsApp" and "Invoice share" buttons rely on `wa.me` URLs and public routes — neither works offline.

- **Remove** WhatsApp share icon button from `History.jsx` (lines 357-372)
- **Remove** "Create campaign share" button from `History.jsx` (lines 374-389)
- **Remove** mobile WA share buttons from `History.jsx` (lines 536-559)
- **Remove** "Share" button from `Print.jsx` (lines 257-266) — clipboard copy of invoice link
- **Remove** WhatsApp share from `Receivables/Show.jsx` (line 154)
- **Remove** public routes `transactions.public`, `portal.transaction`

### 4. Receipt Printing — Adapt for Electron

PDF download links + `window.open()` patterns need adjustment for Electron shell.

- **Keep** `Print.jsx` thermal receipt templates — they work via `window.print()` which Electron supports
- **Review** PDF download links (`route("pdf.transactions.invoice")`, etc.) — they hit the local backend which is fine, but `target="_blank"` may need Electron's `shell.openExternal()`
- **Keep** Printer settings page (`Settings/Printer.jsx`) — adapt for Electron's `webContents.print()` API

### 5. Language Switcher — Consider Removing

- **Review** `POSLayout.jsx` language toggle (lines 173-179) — single-store desktop likely needs one locale
- Keep Indonesian (`id`) as default if removing

### 6. Cashier Shift Warehouse — Auto-Set

- **Simplify** `CashierShifts/Index.jsx` warehouse dropdown (lines 36, 70-72, 132-146) — auto-set to the only warehouse for desktop

### 7. Multi-Warehouse Features — Simplify

- **Consider removing** entire `StockTransfers/` module (irrelevant for single-warehouse)
- **Consider removing** warehouse filter in `History.jsx` (lines 28, 187-201)

### Files Touched

| Area | Files |
|------|-------|
| Backend Services | `app/Services/Payments/*` (remove 4 files) |
| Backend Controller | `app/Http/Controllers/Apps/TransactionController.php` |
| API Routes | `routes/api.php` |
| Web Routes | `routes/web.php` (public routes) |
| POS Pages | `Transactions/Index.jsx`, `History.jsx`, `Print.jsx` |
| POS Components | `PaymentPanel.jsx`, `POSLayout.jsx` |
| Context | `OnlineStatusContext.jsx` (remove) |
| Utils | `offlineDb.js` (remove) |
| Settings | `Settings/Payment.jsx`, `Settings/Printer.jsx` (review) |
| Cashier Shift | `CashierShifts/Index.jsx` |
| Receivables | `Receivables/Show.jsx` |
