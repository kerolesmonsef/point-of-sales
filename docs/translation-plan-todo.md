# Translation Plan — Todo

**Scope of this audit: `resources/js/Pages/**/*.jsx` only** (103 files). Components/** not checked. Re-audited from scratch on 2026-07-26 — the previous checklist marked most Pages files done, but that was not accurate; this replaces it.

**Pattern:** Wrap user-facing strings with `__("English text")` — English key, English value. Do NOT create or edit translation files, only add inline `__()` calls.

**Result:** No raw Indonesian text remains anywhere in Pages/**. Remaining gaps are hardcoded English UI strings not yet wrapped in `__()`.

---

## Never migrated (0 `__()` calls — stock Breeze scaffolding, untouched)

- [ ] `Auth/ResetPassword.jsx` — `<Head title="Reset Password" />`, labels `Email`/`Password`/`Confirm Password`, button `Reset Password`
- [ ] `Profile/Edit.jsx` — `<Head title="Profile" />`, `<h2>Profile</h2>`
- [ ] `Profile/Partials/DeleteUserForm.jsx` — `Delete Account`, `Are you sure you want to delete your account?`, confirmation copy, `Password`, `Cancel`
- [ ] `Profile/Partials/UpdatePasswordForm.jsx` — `Update Password`, `Current Password`, `New Password`, `Confirm Password`, `Save`, `Saved.`
- [ ] `Profile/Partials/UpdateProfileInformationForm.jsx` — `Profile Information`, `Name`, `Email`, `Avatar`, `Your email address is unverified.`, `Save`, `Saved.`

---

## Partially migrated — isolated unwrapped strings left behind

- [ ] `Dashboard/Index.jsx` — `"Dashboard"` (title/h1), `"Best seller"`, `"Slow Moving"`, `"Top spender"`
- [ ] `Dashboard/Reports/Insights.jsx` — `"Advanced Sales Insights"`, `"Sales by Hour"`, `"Sales by Day"`, `"Qty"`, `"Qty Sold"`, `"Last Sold"`, `"Last Purchase"`, `"Member"`/`"Non-member"`, `"Rule"`, `"Loyalty Performance Summary"`, `"Tier"`, `"CRM Operational Snapshot"`, `"Campaign"`; `promoKindLabel` object (`"Discount"`, `"Bundle"`, `"BXGY"`)
- [ ] `Dashboard/Transactions/Index.jsx` — `"Voucher"`, `"PPN"`, `"Total"`
- [ ] `Dashboard/Transactions/History.jsx` — `"Filter"` button, `"Invoice"`, `"Total"`
- [ ] `Dashboard/Transactions/Print.jsx` — `"Invoice"`, `"Thermal"`, `"Share"`, `"INVOICE"`, `"Subtotal"`, `"Total"`
- [ ] `Public/TransactionDetail.jsx` — `"INVOICE"`, `"Item"`, `"Subtotal"`
- [ ] `Dashboard/PricingRules/Index.jsx` — `<Table.Th>Rule</Table.Th>`, `<Table.Th>Priority</Table.Th>`
- [ ] `Dashboard/PricingRules/Form.jsx` — `title="Bundle Price"`, `title="Buy X Get Y"`, `"Applied Groups"` heading
- [ ] `Dashboard/Members/Index.jsx` — `<Table.Th>Tier</Table.Th>`
- [ ] `Dashboard/CashierShifts/Index.jsx` — `<option>Open</option>`, `<option>Closed</option>`, `<option>Force Closed</option>`
- [ ] `Dashboard/AuditLogs/Index.jsx` — `log.user?.name || "System"` fallback
- [ ] `Dashboard/AuditLogs/Show.jsx` — `log.user?.name || "System"` fallback
- [ ] `Dashboard/Customers/Index.jsx` — `"Export"`, `"Import"` buttons, `<Table.Th>No</Table.Th>`
- [ ] `Dashboard/Products/Index.jsx` — `"Export"`, `"Import"` buttons
- [ ] `Dashboard/Products/Create.jsx` — `"Margin"` label, `alt="Preview"`
- [ ] `Dashboard/Products/Edit.jsx` — `"Margin"` label, `label="Barcode"`, `alt="Preview"`
- [ ] `Dashboard/Receivables/Index.jsx` — `"Collection Rate"`
- [ ] `Dashboard/Receivables/Show.jsx` — `"Invoice"` (x2)
- [ ] `Dashboard/PurchaseOrders/Index.jsx` — `<h1>Purchase Orders</h1>`
- [ ] `Dashboard/StockOpnames/Index.jsx` — `<option>Draft</option>`, `<option>Finalized</option>`, `<Table.Th>Finalized</Table.Th>`
- [ ] `Dashboard/StockOpnames/Show.jsx` — `isDraft ? "Draft" : "Finalized"`
- [ ] `Dashboard/StockMutations/Index.jsx` — `<Table.Th>Qty</Table.Th>`
- [ ] `Dashboard/Suppliers/Index.jsx` — `<label>Email</label>`
- [ ] `Dashboard/Categories/Create.jsx` — `alt="Preview"`
- [ ] `Dashboard/Categories/Edit.jsx` — `alt="Preview"`
- [ ] `Dashboard/Users/Create.jsx` — `alt="Preview"`
- [ ] `Dashboard/Users/Edit.jsx` — `alt="Preview"`
- [ ] `Welcome.jsx` — `"View Repository"`, `"Before & After"`, `"Version 1.0"`, `"✨ Revamp 2.0"`, image alt text (`"POS V1"` etc.) — **note: this page is slated for deletion per `docs/desktop.md`, don't bother translating it, just remove it**

---

## Confirmed clean (thin wrapper components, no literal UI text of their own)

`CrmCampaigns/Create.jsx`, `CrmCampaigns/Edit.jsx`, `CustomerSegments/Create.jsx`, `CustomerSegments/Edit.jsx`, `CustomerVouchers/Create.jsx`, `CustomerVouchers/Edit.jsx`, `Members/Create.jsx`, `Members/Edit.jsx`, `PricingRules/Create.jsx`, `PricingRules/Edit.jsx`, `SalesReturns/Show.jsx`

All other Pages/**/*.jsx files not listed above (~60 files) had no unwrapped user-facing literals found.

---

## Out of scope for this audit (not re-checked, status unknown)

- `resources/js/Components/**` (~47 files) — previous checklist marked these ⬜ pending; spot-check during this audit found real leftover Indonesian in some (e.g. `KASIR`, `TUNAI`, `Jumlah Bayar`), so treat as still needing full work.
- PHP backend (`app/Http/Controllers/Apps/*.php`, `app/Services/*.php`, ~51 files) — previous checklist marked these ⬜ pending, not re-audited here.
