# Payment Gateway Removal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strip Midtrans & Xendit online payment gateways from the desktop POS app.

**Architecture:** Delete 4 backend service files + 1 controller, simplify 5 backend files, simplify 3 frontend files.

**Tech Stack:** Laravel 13, React 19, Inertia.js 3

## Global Constraints

- Keep `cash`, `bank_transfer`, and `pay_later` payment methods — only remove `midtrans` and `xendit`
- Do NOT drop `payment_url` column from transactions table (zero-cost to keep)
- Run `vendor/bin/pint --format agent` after all PHP changes
- Run tests after all changes

---

### Task 1: Delete Backend Gateway Service Files

**Files:**
- Delete: `app/Services/Payments/MidtransGateway.php`
- Delete: `app/Services/Payments/XenditGateway.php`
- Delete: `app/Services/Payments/PaymentGatewayManager.php`
- Delete: `app/Exceptions/PaymentGatewayException.php`

- [ ] **Step 1: Delete 4 files**

```bash
rm app/Services/Payments/MidtransGateway.php \
   app/Services/Payments/XenditGateway.php \
   app/Services/Payments/PaymentGatewayManager.php \
   app/Exceptions/PaymentGatewayException.php
```

- [ ] **Step 2: Delete PaymentWebhookController**

```bash
rm app/Http/Controllers/Api/PaymentWebhookController.php
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "desktop: remove Midtrans/Xendit payment gateway services and webhook controller"
```

---

### Task 2: Clean Up routes/api.php

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Rewrite routes/api.php**

Remove the `PaymentWebhookController` import and the `webhooks` route group. The entire file becomes just the `Route` facade import.

```php
<?php

use Illuminate\Support\Facades\Route;
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "desktop: remove webhook routes from api.php"
```

---

### Task 3: Clean Up PaymentSetting Model

**Files:**
- Modify: `app/Models/PaymentSetting.php`

Remove constants (`GATEWAY_MIDTRANS`, `GATEWAY_XENDIT`), `SECRET_FIELDS` entries for midtrans/xendit, `$fillable` entries, `$casts` entries, methods: `enabledGateways()` → simplify to only bank_transfer, `isGatewayReady()` → only bank_transfer, remove `midtransConfig()`, `xenditConfig()`, `resolvedSecret()`, `secretSource()`, `secretConfigured()`, `secretManagedByEnvironment()`, `maskedSecret()`, `paymentSettingSources()`, `secretMetadata()`, `envSecretValue()`.

- [x] Already read the file.

- [ ] **Step 1: Simplify model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    public const GATEWAY_BANK_TRANSFER = 'bank_transfer';

    protected $fillable = [
        'default_gateway',
        'bank_transfer_enabled',
    ];

    protected $casts = [
        'bank_transfer_enabled' => 'boolean',
    ];

    public function enabledGateways(): array
    {
        $gateways = [];

        if ($this->isBankTransferReady()) {
            $gateways[] = [
                'value' => self::GATEWAY_BANK_TRANSFER,
                'label' => 'Transfer Bank',
                'description' => 'Pembayaran manual via transfer bank.',
            ];
        }

        return $gateways;
    }

    public function isBankTransferReady(): bool
    {
        return $this->bank_transfer_enabled && BankAccount::active()->exists();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "desktop: simplify PaymentSetting model"
```

---

### Task 4: Clean Up PaymentSettingController

**Files:**
- Modify: `app/Http/Controllers/Apps/PaymentSettingController.php`

Simplify `edit()` and `update()` to remove midtrans/xendit code.

- [ ] **Step 1: Rewrite controller**

Remove all midtrans/xendit-related code from `edit()` — no webhook URLs, no webhook warnings, no `paymentSettingSources()`, no `supportedGateways` with midtrans/xendit. Simplify `update()` — no midtrans/xendit validation, no gateway credential handling.

```php
<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function edit()
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        return Inertia::render('Dashboard/Settings/Payment', [
            'setting' => [
                'default_gateway' => $setting->default_gateway,
                'bank_transfer_enabled' => (bool) $setting->bank_transfer_enabled,
            ],
            'supportedGateways' => [
                ['value' => 'cash', 'label' => __('Cash')],
                ['value' => PaymentSetting::GATEWAY_BANK_TRANSFER, 'label' => __('Bank Transfer')],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        $data = $request->validate([
            'default_gateway' => [
                'required',
                Rule::in(['cash', PaymentSetting::GATEWAY_BANK_TRANSFER]),
            ],
            'bank_transfer_enabled' => ['boolean'],
        ]);

        $setting->update([
            'default_gateway' => $data['default_gateway'],
            'bank_transfer_enabled' => (bool) ($data['bank_transfer_enabled'] ?? false),
        ]);

        return redirect()
            ->route('settings.payments.edit')
            ->with('success', __('Payment gateway configuration saved successfully.'));
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "desktop: simplify PaymentSettingController"
```

---

### Task 5: Clean Up TransactionController

**Files:**
- Modify: `app/Http/Controllers/Apps/TransactionController.php`

Remove `PaymentGatewayManager` injection, `PaymentGatewayException` import, `PaymentSetting` import (no longer needed in store), gateway dispatch block.

- [ ] **Step 1: Remove use statements**

Remove lines 5, 13, 22:
```php
use App\Exceptions\PaymentGatewayException;
use App\Models\PaymentSetting;
use App\Services\Payments\PaymentGatewayManager;
```

- [ ] **Step 2: Remove constructor parameter**

Change `store(Request $request, PaymentGatewayManager $paymentGatewayManager)` to `store(Request $request)`.

- [ ] **Step 3: Simplify `store()` — remove gateway code**

Remove lines 534-553 (payment gateway detection + validation), remove the `$paymentGateway` variable usage in the closure (line 579), change line 633 from `$paymentGateway ?: 'cash'` to just `'cash'`, change line 634 to simplify, remove lines 736-749 (gateway API dispatch block).

The `$isPayLater` check should stay as-is. Simplify the `payment_method` and `payment_status` logic since there are no more non-cash/non-pay_later payment methods that need external gateway calls.

Updates to `store()`:
- Remove `$paymentGateway` variable entirely
- Remove `$paymentSetting` variable entirely
- Remove the `isCashPayment` derived logic complexity — it's always cash or pay_later
- Remove gateway dispatch block (lines ~736-749)
- Simplify `payment_method` to `$isPayLater ? 'pay_later' : 'cash'`
- Simplify `payment_status` to `$isPayLater ? 'unpaid' : 'paid'`
- Simplify `bank_account_id` to only set for pay_later... actually keep it for bank_transfer too

Wait, looking at the code again more carefully:
- Line 533-537: `$paymentGateway` logic
- Line 546-554: `$paymentSetting` and gateway validation
- Line 563: `$isCashPayment = empty($paymentGateway) && ! $isPayLater` — with no more gateway, `$paymentGateway` is always null, so `$isCashPayment = ! $isPayLater`
- Line 579: `$paymentGateway` in the closure use list
- Line 633: `'payment_method' => $isPayLater ? 'pay_later' : ($paymentGateway ?: 'cash')` → `'payment_method' => $isPayLater ? 'pay_later' : 'cash'`
- Line 634: `'payment_status' => $isCashPayment ? 'paid' : ($isPayLater ? 'unpaid' : 'pending')` → `'payment_status' => $isPayLater ? 'unpaid' : 'paid'`
- Line 635: `'bank_account_id' => $paymentGateway === 'bank_transfer' ? $request->bank_account_id : null` — for bank_transfer, we actually DO need this. But wait, the original check is `$paymentGateway === 'bank_transfer'` and with no more gateway field, how does bank_transfer work?

Hmm, looking at the frontend PaymentPanel.jsx, the `paymentMethod` is `"bank_transfer"` and there's a `selectedBankAccount` prop. The `payment_gateway` request field would be `"bank_transfer"` when the user selects bank transfer. Let me check the frontend to see how the payment method is sent.

Actually, looking at the frontend Transaction/Index.jsx would help, but it might be large. Let me check: the store method receives `$request->input('payment_gateway')` on line 534. With no midtrans/xendit, bank_transfer is still a valid payment method. So actually, `$paymentGateway` can still be `bank_transfer`. We just need to remove the midtrans/xendit parts.

So actually, the simplification is:
- Remove the gateway dispatch block (lines 736-749)
- Remove PaymentSetting loading for gateway validation (lines 546-553) — since bank_transfer doesn't need an external API call
- Remove PaymentGatewayManager injection
- Remove PaymentGatewayException import
- Remove PaymentSetting import (no longer needed in store)
- Keep `$paymentGateway` for identifying bank_transfer vs cash

Actually wait — the `$paymentGateway` is still needed for `bank_transfer` because:
- Line 633: payment_method = bank_transfer when selected
- Line 634: payment_status = 'pending' for bank_transfer (needs manual confirmation)
- Line 635: bank_account_id for bank_transfer

So the simplification is:
- Remove lines 546-553 (gateway readiness check via PaymentSetting)
- Remove lines 736-749 (external API dispatch)
- Remove `$paymentGateway` becomes only about cash vs bank_transfer vs pay_later
- Line 563 simplifies: `$isCashPayment = empty($paymentGateway) && ! $isPayLater` — this still works since `$paymentGateway` can be `bank_transfer`
- Remove PaymentGatewayManager injection
- Remove PaymentGatewayException import
- Remove PaymentSetting import from the file (it was only used in store)

Wait, PaymentSetting also used in `index()` for `enabledGateways()`. Let me check... line 119: `$paymentSetting = PaymentSetting::first();` and line 145: `'paymentGateways' => $paymentSetting?->enabledGateways() ?? []`. So `PaymentSetting` is still used in `index()`. Can't remove the import.

Let me re-think. The imports to remove are:
- `use App\Exceptions\PaymentGatewayException;` (line 5)
- `use App\Services\Payments\PaymentGatewayManager;` (line 22)

Keep `use App\Models\PaymentSetting;` (line 13) — still used in `index()`.

In store():
- Remove `$paymentGatewayManager` from function signature (line 531)
- Remove lines 536-537 (strtolower)
- Remove lines 546-554 (gateway validation)
- Keep `$paymentGateway = $isPayLater ? null : $request->input('payment_gateway');` (line 534) — needed for bank_transfer
- Remove gateway dispatch block (lines 736-749)
- Remove the catch block since it's no longer needed

Actually let me re-read the code more carefully:

Lines 533-537:
```php
$isPayLater = $request->boolean('pay_later');
$paymentGateway = $isPayLater ? null : $request->input('payment_gateway');
if ($paymentGateway) {
    $paymentGateway = strtolower($paymentGateway);
}
$paymentSetting = null;
```

Lines 546-554:
```php
if ($paymentGateway) {
    $paymentSetting = PaymentSetting::first();

    if (! $paymentSetting || ! $paymentSetting->isGatewayReady($paymentGateway)) {
        return redirect()
            ->route('transactions.index')
            ->with('error', __('Payment gateway not configured.'));
    }
}
```

These checks are for midtrans/xendit readiness. bank_transfer doesn't need them (it uses `isBankTransferReady()` separately). So we can remove these.

Lines 563:
```php
$isCashPayment = empty($paymentGateway) && ! $isPayLater;
```
With `$paymentGateway` being null for cash, 'bank_transfer' for bank transfer → `empty($paymentGateway)` returns true for null/false/empty string but false for 'bank_transfer'. So:
- If bank_transfer: empty('bank_transfer') = false → $isCashPayment = false
- If cash: empty(null) = true → $isCashPayment = true
- If pay_later: $isPayLater = true → $isCashPayment = false
This is correct and doesn't need to change.

Line 579: remove `$paymentGateway` from the closure `use` list. No wait — it's used inside for payment_method/payment_status. Let me check... 

Looking at lines 575-715 (the closure), `$paymentGateway` is used at:
- Line 633: `$paymentGateway ?: 'cash'`
- Line 634: `$isCashPayment ? 'paid' : ($isPayLater ? 'unpaid' : 'pending')`
- Line 635: `$paymentGateway === 'bank_transfer' ? $request->bank_account_id : null`

So yes, `$paymentGateway` is still needed. But `$paymentSetting` is NOT used inside the closure anymore (was used for gateway API call which is at line 738 outside the closure). `$paymentSetting = null` on line 538 is also no longer needed.

So:
- Remove line 538: `$paymentSetting = null;`
- Remove lines 546-554 (gateway validation)
- Remove `$paymentSetting` from the code entirely (no longer needed)
- Remove lines 736-749 (gateway dispatch)
- Change signature from `store(Request $request, PaymentGatewayManager $paymentGatewayManager)` to `store(Request $request)`

OK, for the edit, I need to be precise. Let me just write the edits.<｜end▁of▁thinking｜>

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="todowrite">
<｜｜DSML｜｜parameter name="todos" string="false">[{"priority":"high","content":"Task 1: Delete backend gateway services (5 files)","status":"in_progress"},{"priority":"high","content":"Task 2: Clean up routes/api.php","status":"pending"},{"priority":"high","content":"Task 3: Clean up PaymentSetting model","status":"pending"},{"priority":"high","content":"Task 4: Clean up PaymentSettingController","status":"pending"},{"priority":"high","content":"Task 5: Clean up TransactionController","status":"pending"},{"priority":"high","content":"Task 6: Clean up Settings/Payment.jsx","status":"pending"},{"priority":"medium","content":"Task 7: Clean up Print.jsx","status":"pending"},{"priority":"medium","content":"Task 8: Clean up PaymentPanel.jsx","status":"pending"},{"priority":"medium","content":"Task 9: Run pint formatter","status":"pending"},{"priority":"medium","content":"Task 10: Run tests","status":"pending"}]