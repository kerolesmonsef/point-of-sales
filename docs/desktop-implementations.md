# Desktop App — Implementation Notes

Back to [desktop.md](desktop.md) (main checklist).

Each section below documents specific changes for a business section when moving to desktop.

---

## POS Cashier

> **Status:** Changes identified. Post-checkout flow & printer profiles designed (see below), not yet implemented.
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

### 4. Receipt Printing & Post-Checkout Flow — Desktop Cycle

Current flow redirects the user to a full-page Print view after checkout. Desktop POS needs a modal overlay on the POS screen so the cashier can handle receipt and continue to the next customer without leaving the POS.

#### 4a. Post-Checkout Receipt Modal

Replace the redirect to the standalone Print page with a modal overlay on the POS screen:

- **TransactionController::store()** — instead of `to_route('transactions.print')`, flash transaction data to session and redirect to `transactions.index`
- **HandleInertiaRequests.php** — share `last_transaction` from flash as an Inertia prop
- **Transactions/Index.jsx** — detect `last_transaction` prop → open ReceiptModal overlay
- **ReceiptModal.jsx** (new) — shows transaction summary + action buttons: Print Thermal, PDF Invoice, PDF Receipt (profile's paper size), Shipping Label, Skip
- **Auto-print** — if active profile has `auto_print=true`, auto-trigger thermal print on modal open with brief undo option
- **Print.jsx** — kept for reprinting from transaction history (no changes needed)

#### 4b. Thermal Print & PDF Routes

Existing PDF/thermal routes (`pdf.transactions.*`) remain unchanged. The modal opens them in popup/tab same as today.

- PDF download links work fine (local backend, no internet needed)
- `window.print()` works in Electron via `webContents.print()`
- `target="_blank"` links reviewed for Electron compatibility

#### 4c. Printer Profile Management — New

Replace the single printer setting form with multiple named printer profiles.

See [Printer Profiles](#printer-profiles) section below for full details.

### 5. Language Switcher — Consider Removing

- **Review** `POSLayout.jsx` language toggle (lines 173-179) — single-store desktop likely needs one locale
- Keep Indonesian (`id`) as default if removing

### 6. Cashier Shift Warehouse — Auto-Set

- **Simplify** `CashierShifts/Index.jsx` warehouse dropdown (lines 36, 70-72, 132-146) — auto-set to the only warehouse for desktop

### 7. Multi-Warehouse Features — Simplify

- **Consider removing** entire `StockTransfers/` module (irrelevant for single-warehouse)
- **Consider removing** warehouse filter in `History.jsx` (lines 28, 187-201)

### 8. Printer Profiles

Replace the single printer setting (paper size dropdown + auto-print checkbox) with multiple named printer profiles, matching the desktop POS industry standard (Square, Shopify POS, etc.).

#### Database

New `printer_profiles` table:

| Column | Type | Notes |
|--------|------|-------|
| id | bigint auto-increment | |
| name | varchar(100) | e.g. "Front Receipt", "Kitchen" |
| paper_size | varchar(20) | `58mm`, `80mm`, `A4` |
| auto_print | boolean | default `false` |
| is_default | boolean | single true per store |
| created_at / updated_at | timestamps | |

No FK to user/store (single-store desktop). The `saving` boot event on the model ensures only one default.

#### Backend

- **`app/Models/PrinterProfile.php`** — bare model, `$fillable` + `$casts` for booleans + `booted` saving event for single-default enforcement
- **`app/Http/Controllers/Apps/PrinterProfileController.php`** — CRUD: index, store, update, destroy
- **Routes**: `settings.printer-profiles.*` (resourceful, except show)
- **Settings/Printer.jsx** — rewrite from single-setting form to profile list manager: list profiles, set default, add/edit/delete

#### Usage in Checkout

The default printer profile's `paper_size` determines which receipt size the modal offers (58mm vs 80mm vs A4). The `auto_print` flag controls whether thermal printing fires automatically after checkout.

### 9. Unit Control on POS Screen

The backend fully supports multi-unit products (`ProductUnit` pivot with conversion factors, per-unit pricing, `UnitConversionService`), but the POS frontend never exposes it. All cart items use the base unit with no unit label shown.

#### 9a. Product Grid — Unit Pills

Each product tile shows available units as small clickable pills below the price:
- Displays unit symbol (pcs, kg, box, ltr)
- One pill pre-selected (base unit)
- Clicking a pill switches selection; tapping the product adds to cart with that unit
- Products loaded with `units.unit` eager-loaded

#### 9b. Cart Item — Unit Label & Switcher

Each cart item shows the unit symbol next to quantity (e.g. `× 3 kg`). Clicking the unit opens a dropdown of other available units for that product. Switching unit recalculates qty and price using conversion factors.

#### 9c. New Endpoint

`PATCH /cart/{cart}/unit` — accepts `unit_id`, returns updated cart with recalculated pricing.

### Files Touched

| Area | Files |
|------|-------|
| Backend Services | `app/Services/Payments/*` (remove 4 files) |
| Backend Models | `app/Models/PrinterProfile.php` (new), `app/Models/Cart.php` (add unit relationship) |
| Backend Controller | `app/Http/Controllers/Apps/TransactionController.php`, `app/Http/Controllers/Apps/PrinterProfileController.php` (new) |
| Database | Migration to create `printer_profiles` table |
| API Routes | `routes/api.php` |
| Web Routes | `routes/web.php` (public routes + printer profile routes + cart switch-unit route) |
| Middleware | `app/Http/Middleware/HandleInertiaRequests.php` (share flash) |
| POS Pages | `Transactions/Index.jsx` (modal + unit control integration), `History.jsx`, `Print.jsx` (kept for reprint) |
| POS Components | `Components/POS/ReceiptModal.jsx` (new), `Components/POS/CartItem.jsx` (new/extract — unit switcher), `Components/POS/ProductCard.jsx` (unit pills), `PaymentPanel.jsx`, `POSLayout.jsx` |
| Context | `OnlineStatusContext.jsx` (remove) |
| Utils | `offlineDb.js` (remove) |
| Settings | `Settings/Payment.jsx` (remove), `Settings/Printer.jsx` (rewrite to profile manager) |
| Cashier Shift | `CashierShifts/Index.jsx` |
| Receivables | `Receivables/Show.jsx` |

