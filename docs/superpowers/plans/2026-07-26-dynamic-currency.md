# Dynamic Currency from Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the store currency configurable via Settings → Store Profile, stored in the `settings` table, and used everywhere in frontend (JSX) and backend (PHP/Blade).

**Architecture:** Add `store_currency` to settings key-value store → share via Inertia `HandleInertiaRequests` → create a shared `formatCurrency` frontend utility → replace all hardcoded `"id-ID"` / `"IDR"` / `"Rp "` in ~45 frontend files and ~6 backend files.

**Tech Stack:** Laravel 13, Inertia 3, React 19, Intl.NumberFormat

## Global Constraints

- No new dependencies
- `store_currency` default value = `"EGP"`
- `Setting::getTranslated()` wraps value with `__()` for translation
- Frontend utility reads from `window.__storeCurrency` (set once in app.jsx)
- Currency→locale map: `{ EGP: 'ar-EG', IDR: 'id-ID', USD: 'en-US' }`
- PHP backend uses `Setting::currencySymbol()` helper for symbol prefix

---

### Task 1: Setting model — add `getTranslated()` and `currencySymbol()`

**Files:**
- Modify: `app/Models/Setting.php`

**Interfaces:**
- Produces: `Setting::getTranslated(string $key, $default = null): string`
- Produces: `Setting::currencySymbol(?string $code = null): string`

- [ ] **Step 1: Add `getTranslated()` method**

```php
// After getBool()
public static function getTranslated(string $key, $default = null): string
{
    return __(static::get($key, $default));
}

public static function currencySymbol(?string $code = null): string
{
    $code ??= static::get('store_currency', 'IDR');

    return match ($code) {
        'IDR' => 'Rp',
        'EGP' => 'E£',
        'USD' => '$',
        'GBP' => '£',
        'EUR' => '€',
        default => $code,
    };
}
```

- [ ] **Step 2: Run tests to confirm no breakage**

```bash
php artisan test --compact --filter=Setting
```

Expected: no tests for Setting model exist, so this is a no-op. Run the full test suite if desired.

- [ ] **Step 3: Commit**

```bash
git add app/Models/Setting.php
git commit -m "feat: add getTranslated() and currencySymbol() to Setting model"
```

---

### Task 2: Seed default `store_currency`

**Files:**
- Modify: `database/seeders/FeatureCoverageSeeder.php`

- [ ] **Step 1: Add `store_currency` to `seedStoreSettings()`**

In the `$settings` array inside `seedStoreSettings()`, add:
```php
'store_currency' => ['value' => 'EGP', 'description' => 'Currency kode untuk toko (IDR, EGP, USD, dll)'],
```

- [ ] **Step 2: Run seed to verify**

```bash
php artisan db:seed --class=FeatureCoverageSeeder
```

Verify: `php artisan tinker --execute 'echo App\Models\Setting::get("store_currency");'`

Expected output: `EGP`

- [ ] **Step 3: Commit**

```bash
git add database/seeders/FeatureCoverageSeeder.php
git commit -m "feat: seed default store_currency setting as EGP"
```

---

### Task 3: HandleInertiaRequests — share `storeCurrency`

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`

- [ ] **Step 1: Add `storeCurrency` to the shared props array**

In the `return [...]` block, add to the shared props:
```php
'storeCurrency' => Setting::get('store_currency', 'IDR'),
```

- [ ] **Step 2: Verify it's available**

```bash
php artisan route:get / --method=GET 2>/dev/null | head -5
```

Not directly testable via CLI — will verify via browser later.

- [ ] **Step 3: Commit**

```bash
git add app/Http/Middleware/HandleInertiaRequests.php
git commit -m "feat: share storeCurrency via Inertia shared props"
```

---

### Task 4: Create frontend `formatCurrency` utility

**Files:**
- Create: `resources/js/Utils/formatCurrency.js`

- [ ] **Step 1: Create the utility file**

```js
const localeMap = { EGP: 'ar-EG', IDR: 'id-ID', USD: 'en-US' };

export function formatCurrency(value = 0) {
  const currency = window.__storeCurrency || 'IDR';
  const locale = localeMap[currency] || 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}
```

- [ ] **Step 2: Set global in `app.jsx`**

In `resources/js/app.jsx`, inside `setup()`, before `root.render()`:
```js
window.__storeCurrency = props.initialPage.props.storeCurrency || 'IDR';
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Utils/formatCurrency.js resources/js/app.jsx
git commit -m "feat: create formatCurrency utility + global storeCurrency"
```

---

### Task 5: SettingController — add `store_currency` to Store profile

**Files:**
- Modify: `app/Http/Controllers/Apps/SettingController.php`

- [ ] **Step 1: Add `store_currency` to `storeProfile()`**

In the `$settings` array in `storeProfile()`, add:
```php
'store_currency' => Setting::get('store_currency', 'EGP'),
```

- [ ] **Step 2: Add validation and save in `updateStoreProfile()`**

In the `$request->validate([...])` array, add:
```php
'store_currency' => 'required|string|max:10',
```

After the existing `Setting::set(...)` calls, add:
```php
Setting::set('store_currency', $request->store_currency, __('Store currency code'));
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/Apps/SettingController.php
git commit -m "feat: add store_currency to Settings controller"
```

---

### Task 6: Store.jsx — add currency dropdown to UI

**Files:**
- Modify: `resources/js/Pages/Dashboard/Settings/Store.jsx`

- [ ] **Step 1: Add currency field to form data**

In the `useForm({...})` initial data, add:
```js
store_currency: settings.store_currency || 'EGP',
```

- [ ] **Step 2: Add currency dropdown to the Tax & Legal section**

After the `tax_default_rate` input, add:
```jsx
<div className="mt-4">
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
    {__('Store Currency')}
  </label>
  <select
    value={data.store_currency}
    onChange={(e) => setData('store_currency', e.target.value)}
    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm"
  >
    <option value="EGP">E£ — Egyptian Pound</option>
    <option value="IDR">Rp — Indonesian Rupiah</option>
    <option value="USD">$ — US Dollar</option>
    <option value="GBP">£ — British Pound</option>
    <option value="EUR">€ — Euro</option>
  </select>
  {errors.store_currency && (
    <p className="text-xs text-danger-500 mt-1">{errors.store_currency}</p>
  )}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Dashboard/Settings/Store.jsx
git commit -m "feat: add currency selector to Store settings"
```

---

### Task 7: Replace hardcoded `Intl.NumberFormat` in all JSX files

**Files:** ~40 files across `resources/js/Pages/` and `resources/js/Components/`

**Pattern:** Every file has a local `const formatCurrency = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);`

Replace with:
1. Delete the local `formatCurrency` definition
2. Add: `import { formatCurrency } from '@/Utils/formatCurrency';`

For files that don't define `formatCurrency` but use inline `Intl.NumberFormat("id-ID", { currency: "IDR", ... })`:
1. Add the import
2. Replace the inline call with `formatCurrency(value)`

Files to modify (all have `const formatCurrency =` or inline `Intl.NumberFormat` with IDR):

- `resources/js/Pages/Dashboard/Index.jsx`
- `resources/js/Pages/Dashboard/Products/Index.jsx`
- `resources/js/Pages/Dashboard/Members/Index.jsx`
- `resources/js/Pages/Dashboard/Members/Show.jsx`
- `resources/js/Pages/Dashboard/Customers/Show.jsx`
- `resources/js/Pages/Dashboard/Transactions/Index.jsx`
- `resources/js/Pages/Dashboard/Transactions/History.jsx`
- `resources/js/Pages/Dashboard/Transactions/Print.jsx`
- `resources/js/Pages/Dashboard/PurchaseOrders/Index.jsx`
- `resources/js/Pages/Dashboard/PurchaseOrders/Create.jsx`
- `resources/js/Pages/Dashboard/PurchaseOrders/Show.jsx`
- `resources/js/Pages/Dashboard/GoodsReceivings/Show.jsx`
- `resources/js/Pages/Dashboard/SupplierReturns/Create.jsx`
- `resources/js/Pages/Dashboard/SupplierReturns/Show.jsx`
- `resources/js/Pages/Dashboard/SalesReturns/Index.jsx`
- `resources/js/Pages/Dashboard/SalesReturns/Form.jsx`
- `resources/js/Pages/Dashboard/Receivables/Index.jsx`
- `resources/js/Pages/Dashboard/Receivables/Show.jsx`
- `resources/js/Pages/Dashboard/Payables/Index.jsx`
- `resources/js/Pages/Dashboard/Payables/Show.jsx`
- `resources/js/Pages/Dashboard/Aging/Index.jsx`
- `resources/js/Pages/Dashboard/CashierShifts/Index.jsx`
- `resources/js/Pages/Dashboard/CashierShifts/Show.jsx`
- `resources/js/Pages/Dashboard/Reports/Sales.jsx`
- `resources/js/Pages/Dashboard/Reports/Profit.jsx`
- `resources/js/Pages/Dashboard/Reports/Insights.jsx`
- `resources/js/Pages/Dashboard/PricingRules/Index.jsx`
- `resources/js/Pages/Dashboard/CustomerVouchers/Index.jsx`
- `resources/js/Pages/Dashboard/DiscountApprovals.jsx`
- `resources/js/Pages/Dashboard/Settings/Target.jsx`
- `resources/js/Pages/Public/TransactionDetail.jsx`
- `resources/js/Components/POS/CartPanel.jsx`
- `resources/js/Components/POS/ProductGrid.jsx`
- `resources/js/Components/POS/NumpadModal.jsx`
- `resources/js/Components/POS/HeldTransactions.jsx`
- `resources/js/Components/POS/CustomerHistoryPanel.jsx`
- `resources/js/Components/POS/PaymentPanel.jsx`
- `resources/js/Components/POS/SearchBar.jsx`
- `resources/js/Components/Barcode/BarcodeLabel.jsx`
- `resources/js/Components/Receipt/ShippingLabel.jsx`

- [ ] **Step 1: Batch edit all files**

For each file:
- Remove the local `const formatCurrency = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);`
- Add `import { formatCurrency } from '@/Utils/formatCurrency';` at top

- [ ] **Step 2: Handle special cases**

`resources/js/Components/POS/NumpadModal.jsx` — replace inline `Intl.NumberFormat("id-ID", { currency: "IDR", ... })` with `formatCurrency(num)`.

`resources/js/Pages/Dashboard/Reports/Insights.jsx` — has `formatPercentage` too (no currency), leave it.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add resources/js/
git commit -m "feat: replace hardcoded IDR formatCurrency with dynamic utility"
```

---

### Task 8: Replace `'Rp '` in backend PHP services

**Files:**
- Modify: `app/Services/PricingService.php`
- Modify: `app/Services/CrmAutomationService.php`

- [ ] **Step 1: PricingService.php — replace `'Rp '` strings**

Line 150: `'Bundle Rp '.number_format(...)` → `'Bundle '.Setting::currencySymbol().' '.number_format(...)`

Add import: `use App\Models\Setting;`

Change:
```php
// line 150
PricingRule::KIND_BUNDLE_PRICE => 'Bundle '.Setting::currencySymbol().' '.number_format((float) $rule->discount_value, 0, ',', '.'),
```

```php
// line 642-643
PricingRule::TYPE_FIXED_AMOUNT => 'Hemat '.Setting::currencySymbol().' '.number_format((float) $rule->discount_value, 0, ',', '.'),
PricingRule::TYPE_FIXED_PRICE => 'Harga '.Setting::currencySymbol().' '.number_format((float) $rule->discount_value, 0, ',', '.'),
```

- [ ] **Step 2: CrmAutomationService.php — replace `'Rp '` strings**

Add import: `use App\Models\Setting;`

Line 260: `'Rp %s'` → `Setting::currencySymbol().' %s'`

Change:
```php
// line 259-264
$shareText = sprintf(
    __('Receivable reminder %s. Remaining balance %s. Due date: %s'),
    $receivable->invoice,
    Setting::currencySymbol().' '.number_format($receivable->remaining, 0, ',', '.'),
    optional($receivable->due_date)?->format('d/m/Y') ?? '-'
);
```

```php
// line 417-423
$message = sprintf(
    __('Reminder %s for invoice %s. Remaining balance %s. Due date %s.'),
    $reason,
    $receivable->invoice,
    Setting::currencySymbol().' '.number_format($receivable->remaining, 0, ',', '.'),
    optional($receivable->due_date)?->format('d/m/Y') ?? '-'
);
```

- [ ] **Step 3: Run tests**

```bash
php artisan test --compact --filter=PricingService 2>&1 | tail -10
php artisan test --compact --filter=CrmAutomation 2>&1 | tail -10
```

- [ ] **Step 4: Run pint**

```bash
vendor/bin/pint --format agent
```

- [ ] **Step 5: Commit**

```bash
git add app/Services/
git commit -m "feat: replace hardcoded Rp in services with dynamic currency symbol"
```

---

### Task 9: Replace `'Rp '` in Blade PDF templates

**Files:**
- Modify: `resources/views/pdf/receipt_58.blade.php`
- Modify: `resources/views/pdf/receipt_80.blade.php`
- Modify: `resources/views/pdf/shipping_label.blade.php`

- [ ] **Step 1: Replace `$formatPrice` closure in each blade**

Each file has:
```php
$formatPrice = fn($v) => 'Rp ' . number_format($v ?? 0, 0, ',', '.');
```

Replace with:
```php
$formatPrice = fn($v) => \App\Models\Setting::currencySymbol() . ' ' . number_format($v ?? 0, 0, ',', '.');
```

- [ ] **Step 2: Commit**

```bash
git add resources/views/pdf/
git commit -m "feat: replace hardcoded Rp in PDF blades with dynamic symbol"
```

---

### Task 10: Replace `'Rp '` in ThermalReceipt.jsx

**Files:**
- Modify: `resources/js/Components/Receipt/ThermalReceipt.jsx`

- [ ] **Step 1: Replace `formatPrice` functions**

Line 22 (80mm):
```js
const formatPrice = (price = 0) => {
    return "Rp " + Number(price || 0).toLocaleString("id-ID");
};
```

Replace with:
```js
import { formatCurrency } from '@/Utils/formatCurrency';
const formatPrice = (price = 0) => formatCurrency(price);
```

Line 274 (58mm):
```js
const formatPrice = (price = 0) => {
    return "Rp" + Number(price || 0).toLocaleString("id-ID");
};
```

Replace with:
```js
const formatPrice = (price = 0) => formatCurrency(price);
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/Receipt/ThermalReceipt.jsx
git commit -m "feat: replace hardcoded Rp in ThermalReceipt with formatCurrency"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run PHP tests**

```bash
php artisan test --compact
```

- [ ] **Step 2: Build frontend**

```bash
npm run build
```

- [ ] **Step 3: Run Pint**

```bash
vendor/bin/pint --format agent
```

- [ ] **Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "chore: finalize dynamic currency implementation"
```
