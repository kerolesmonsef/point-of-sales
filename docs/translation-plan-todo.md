# Translation Plan — Todo

**Scope of this audit: `resources/js/Pages/**/*.jsx` only** (103 files). Components/** not checked. Re-audited from scratch on 2026-07-26 — the previous checklist marked most Pages files done, but that was not accurate; this replaces it.

**Pattern:** Wrap user-facing strings with `__("English text")` — English key, English value. Do NOT create or edit translation files, only add inline `__()` calls.

**Result:** No raw Indonesian text remains anywhere in Pages/**. Remaining gaps are hardcoded English UI strings not yet wrapped in `__()`.

---

## ✅ Completed — wrapped with `__()` in commit `4a9cdd7` (first 20 files)

- [x] `Auth/ResetPassword.jsx`
- [x] `Profile/Edit.jsx`
- [x] `Profile/Partials/DeleteUserForm.jsx`
- [x] `Profile/Partials/UpdatePasswordForm.jsx`
- [x] `Profile/Partials/UpdateProfileInformationForm.jsx`
- [x] `Dashboard/Index.jsx`
- [x] `Dashboard/Reports/Insights.jsx`
- [x] `Dashboard/Transactions/Index.jsx`
- [x] `Dashboard/Transactions/History.jsx`
- [x] `Dashboard/Transactions/Print.jsx`
- [x] `Public/TransactionDetail.jsx`
- [x] `Dashboard/PricingRules/Index.jsx`
- [x] `Dashboard/PricingRules/Form.jsx`
- [x] `Dashboard/Members/Index.jsx`
- [x] `Dashboard/CashierShifts/Index.jsx`
- [x] `Dashboard/AuditLogs/Index.jsx`
- [x] `Dashboard/AuditLogs/Show.jsx`
- [x] `Dashboard/Customers/Index.jsx`
- [x] `Dashboard/Products/Index.jsx`
- [x] `Dashboard/Products/Create.jsx`

## ✅ Fixed in this session (13 files)

- [x] `Dashboard/Products/Edit.jsx` — `"Margin"` label, `label="Barcode"`, `alt="Preview"`
- [x] `Dashboard/Receivables/Index.jsx` — `"Collection Rate"`
- [x] `Dashboard/Receivables/Show.jsx` — `"Invoice"` (x2)
- [x] `Dashboard/PurchaseOrders/Index.jsx` — `<h1>Purchase Orders</h1>`
- [x] `Dashboard/StockOpnames/Index.jsx` — `<option>Draft</option>`, `<option>Finalized</option>`, `<Table.Th>Finalized</Table.Th>`
- [x] `Dashboard/StockOpnames/Show.jsx` — `isDraft ? "Draft" : "Finalized"`
- [x] `Dashboard/StockMutations/Index.jsx` — `<Table.Th>Qty</Table.Th>`
- [x] `Dashboard/Suppliers/Index.jsx` — `<label>Email</label>`
- [x] `Dashboard/Categories/Create.jsx` — `alt="Preview"`
- [x] `Dashboard/Categories/Edit.jsx` — `alt="Preview"`
- [x] `Dashboard/Users/Create.jsx` — `alt="Preview"`
- [x] `Dashboard/Users/Edit.jsx` — `alt="Preview"`

## Skipped

- `Welcome.jsx` — slated for deletion per `docs/desktop.md`

---

## Confirmed clean (thin wrapper components, no literal UI text of their own)

`CrmCampaigns/Create.jsx`, `CrmCampaigns/Edit.jsx`, `CustomerSegments/Create.jsx`, `CustomerSegments/Edit.jsx`, `CustomerVouchers/Create.jsx`, `CustomerVouchers/Edit.jsx`, `Members/Create.jsx`, `Members/Edit.jsx`, `PricingRules/Create.jsx`, `PricingRules/Edit.jsx`, `SalesReturns/Show.jsx`

All other Pages/**/*.jsx files not listed above (~60 files) had no unwrapped user-facing literals found.

---

## Out of scope for this audit (not re-checked, status unknown)

- `resources/js/Components/**` (~47 files) — previous checklist marked these ⬜ pending; spot-check during this audit found real leftover Indonesian in some (e.g. `KASIR`, `TUNAI`, `Jumlah Bayar`), so treat as still needing full work.
- PHP backend (`app/Http/Controllers/Apps/*.php`, `app/Services/*.php`, ~51 files) — previous checklist marked these ⬜ pending, not re-audited here.
