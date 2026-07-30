# Desktop App — Payment Gateway Removal Design

> Part of the [desktop-implementations.md](../../desktop-implementations.md) plan (point 1).
> Removes Midtrans & Xendit online payment gateways — they require internet + public `APP_URL`, neither viable on a desktop POS machine.

## Scope

Keep only `cash`, `bank_transfer` (manual/local), and `pay_later` (receivable). Strip all Midtrans and Xendit code.

## Files to Delete

| File | Reason |
|------|--------|
| `app/Services/Payments/MidtransGateway.php` | Midtrans Snap API client |
| `app/Services/Payments/XenditGateway.php` | Xendit Invoice API client |
| `app/Services/Payments/PaymentGatewayManager.php` | Dispatcher that routes to gateway services |
| `app/Exceptions/PaymentGatewayException.php` | Only used by the removed gateways |
| `app/Http/Controllers/Api/PaymentWebhookController.php` | ~200 lines handling webhook callbacks from both providers |

## Files to Modify

### Backend

**`app/Models/PaymentSetting.php`**
- Remove constants `GATEWAY_MIDTRANS` and `GATEWAY_XENDIT`
- Remove `midtrans`/`xendit` from `enabledGateways()` — keep only `bank_transfer`
- Remove `isGatewayReady()` checks for midtrans/xendit
- Remove `midtransConfig()` and `xenditConfig()` methods
- Remove `resolvedSecret()` decryption logic (only used by gateway secrets)
- Remove `secretManagedByEnvironment()` / `maskedSecret()` / `secretMetadata()` — only used by gateway settings UI

**`app/Http/Controllers/Apps/TransactionController.php`**
- Remove `PaymentGatewayManager` constructor injection (line 531 + class signature)
- Remove gateway dispatch block (lines ~736-748)
- Remove the `$paymentGateway` variable / validation logic — simplify `store()` to no longer load `PaymentSetting` for non-cash gateway validation
- Remove `PaymentGatewayException` import
- Remove `PaymentSetting` / `PaymentGatewayManager` use statements

**`routes/api.php`**
- Remove the 2 webhook route definitions under `prefix('webhooks')`
- Remove the `use App\Http\Controllers\Api\PaymentWebhookController;` import
- If the webhook group becomes empty, remove the group entirely

### Frontend

**`resources/js/Pages/Dashboard/Settings/Payment.jsx`**
- Remove Midtrans form section (Server Key, Client Key, Production mode, toggle)
- Remove Xendit form section (Secret Key, Public Key, Callback Token, Production mode, toggle)
- Remove Webhook URLs display section (with copy buttons)
- Simplify `default_gateway` — remove midtrans/xendit from options
- Remove `paymentSettingSources` and `webhookUrls`/`webhookWarnings` prop usage (no longer needed)
- Simplify form state to only: `default_gateway` (cash/bank_transfer), `bank_transfer_enabled`

**`resources/js/Components/POS/PaymentPanel.jsx`**
- Remove the yellow warning box: "Payment link will appear on the invoice page..." (~lines 437-450)

**`resources/js/Pages/Dashboard/Transactions/Print.jsx`**
- Remove `midtrans` and `xendit` entries from `paymentLabels` (lines 75-81)
- Remove the "Payment" link button that opens `transaction.payment_url` (~lines 243-253)
- Remove `showPaymentLink` variable (line ~116)

## Not Changed

- `Transaction` model's `payment_url` column — stays in database, becomes unused. Not worth a migration to drop.
- `transactions.public` / `portal.transaction` routes — these are for invoice sharing, not gateway-specific. Handled in point 3 (WhatsApp share removal) if needed.
- Payment gateways seeder in `PaymentSettingSeeder` — will naturally work after data cleanup since seeders only produce what the model knows about.

## Data Cleanup

- `payment_setting` table rows for midtrans/xendit config remain in DB (no migration to remove). Existing desktop installs with these settings won't break — the frontend just won't show them.
- Transactions already created with `payment_url` or `payment_reference` for midtrans/xendit remain readable in history (display fallback to "Online Payment" label).
