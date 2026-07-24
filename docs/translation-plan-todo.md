# Translation Plan — Todo

**Total files to translate: ~60 frontend + ~30 backend = ~90 items**

**Status:** ✅ = done · ⬜ = pending

**Pattern:** Wrap user-facing strings with `__("English text")` — English key, English value. **Do NOT create or edit any translation files** — only add inline `__()` calls.

| Before | After |
|--------|-------|
| `'Pelanggan berhasil ditambahkan'` | `__('Customer added successfully')` |
| `'Data berhasil disimpan'` | `__('Data saved successfully')` |

---

## Phase 1: Shared / Utility Components

- [x] `resources/js/Utils/Menu.jsx`
- [x] `resources/js/Utils/Translations.jsx` (helper, no translation needed)

### Layouts
- [x] `resources/js/Layouts/POSLayout.jsx`

### Dashboard Shared Components
- [x] `resources/js/Components/Dashboard/Button.jsx`
- [x] `resources/js/Components/Dashboard/Notification.jsx`
- [x] `resources/js/Components/Dashboard/ImportButton.jsx`
- [x] `resources/js/Components/Dashboard/ListBox.jsx`

### POS Components
- [x] `resources/js/Components/POS/CustomerSelect.jsx`
- [x] `resources/js/Components/POS/CartPanel.jsx`
- [x] `resources/js/Components/POS/HeldTransactions.jsx`
- [x] `resources/js/Components/POS/AddCustomerModal.jsx`
- [x] `resources/js/Components/POS/PaymentPanel.jsx`
- [x] `resources/js/Components/POS/SearchBar.jsx`
- [x] `resources/js/Components/POS/ProductGrid.jsx`
- [x] `resources/js/Components/POS/NumpadModal.jsx`
- [x] `resources/js/Components/POS/CustomerHistoryPanel.jsx`
- [x] `resources/js/Components/POS/BarcodeScanner.jsx`

### Receipt Components
- [x] `resources/js/Components/Receipt/ShippingLabel.jsx`
- [x] `resources/js/Components/Receipt/ThermalReceipt.jsx`

### Other Components
- [x] `resources/js/Components/Barcode/BarcodePrintModal.jsx`

---

## Phase 2: Public / Auth Pages

- [x] `resources/js/Pages/Welcome.jsx`
- [x] `resources/js/Pages/Error.jsx`
- [x] `resources/js/Pages/Dashboard.jsx`
- [x] `resources/js/Pages/Auth/Login.jsx`
- [x] `resources/js/Pages/Auth/Register.jsx`
- [x] `resources/js/Pages/Auth/VerifyEmail.jsx`
- [x] `resources/js/Pages/Auth/ConfirmPassword.jsx`
- [x] `resources/js/Pages/Auth/ForgotPassword.jsx`
- [x] `resources/js/Pages/Auth/ResetPassword.jsx`
- [x] `resources/js/Pages/Public/TransactionDetail.jsx`

---

## Phase 3: Dashboard Main Pages

- [x] `resources/js/Pages/Dashboard/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Access.jsx`

---

## Phase 4: Transactions

- [ ] `resources/js/Pages/Dashboard/Transactions/Index.jsx` **← biggest file**
- [ ] `resources/js/Pages/Dashboard/Transactions/History.jsx`
- [ ] `resources/js/Pages/Dashboard/Transactions/Print.jsx`

---

## Phase 5: Master Data

### Products
- [ ] `resources/js/Pages/Dashboard/Products/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Products/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/Products/Edit.jsx`

### Categories
- [ ] `resources/js/Pages/Dashboard/Categories/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Categories/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/Categories/Edit.jsx`

### Customers
- [ ] `resources/js/Pages/Dashboard/Customers/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Customers/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/Customers/Edit.jsx`
- [ ] `resources/js/Pages/Dashboard/Customers/Show.jsx`

### Suppliers
- [ ] `resources/js/Pages/Dashboard/Suppliers/Index.jsx`

---

## Phase 6: Procurement

- [ ] `resources/js/Pages/Dashboard/PurchaseOrders/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/PurchaseOrders/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/PurchaseOrders/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/GoodsReceivings/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/GoodsReceivings/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/GoodsReceivings/Show.jsx`

---

## Phase 7: Sales & Returns

- [ ] `resources/js/Pages/Dashboard/SalesReturns/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/SalesReturns/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/SupplierReturns/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/SupplierReturns/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/SupplierReturns/Show.jsx`

---

## Phase 8: Financials

- [ ] `resources/js/Pages/Dashboard/Receivables/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Receivables/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/Payables/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Payables/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/Aging/Index.jsx`

---

## Phase 9: Reports

- [ ] `resources/js/Pages/Dashboard/Reports/Sales.jsx`
- [ ] `resources/js/Pages/Dashboard/Reports/Profit.jsx`
- [ ] `resources/js/Pages/Dashboard/Reports/Insights.jsx`

---

## Phase 10: Inventory

- [ ] `resources/js/Pages/Dashboard/StockOpnames/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/StockOpnames/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/StockOpnames/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/StockMutations/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/StockTransfers/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/StockTransfers/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/StockTransfers/Show.jsx`

---

## Phase 11: CRM & Pricing

- [ ] `resources/js/Pages/Dashboard/PricingRules/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/PricingRules/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/Members/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Members/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/Members/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/CustomerVouchers/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/CustomerVouchers/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/CustomerSegments/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/CustomerSegments/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/CustomerSegments/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/CrmCampaigns/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/CrmCampaigns/Form.jsx`
- [ ] `resources/js/Pages/Dashboard/CrmCampaigns/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/CrmReminders/Index.jsx`

---

## Phase 12: Operations & Admin

- [ ] `resources/js/Pages/Dashboard/DiscountApprovals.jsx`
- [ ] `resources/js/Pages/Dashboard/CashierShifts/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/CashierShifts/Show.jsx`
- [ ] `resources/js/Pages/Dashboard/AuditLogs/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/AuditLogs/Show.jsx`

---

## Phase 13: User Management

- [ ] `resources/js/Pages/Dashboard/Users/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Users/Create.jsx`
- [ ] `resources/js/Pages/Dashboard/Users/Edit.jsx`
- [ ] `resources/js/Pages/Dashboard/Roles/Index.jsx`
- [ ] `resources/js/Pages/Dashboard/Permissions/Index.jsx`

---

## Phase 14: Settings

- [ ] `resources/js/Pages/Dashboard/Settings/Store.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Payment.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/PriceLists.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/PriceListItems.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/BankAccounts.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/BankAccountForm.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Warehouses.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Loyalty.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Whatsapp.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Target.jsx`
- [ ] `resources/js/Pages/Dashboard/Settings/Printer.jsx`

---

## Phase 15: PHP Backend (Controllers & Services)

Controllers in `app/Http/Controllers/Apps/` with Indonesian flash/toast messages:
- [x] `CustomerController.php`
- [x] `SupplierController.php`
- [x] `ProductController.php`
- [x] `TransactionController.php`
- [x] `PayableController.php`
- [x] `ReceivableController.php`
- [x] `PurchaseOrderController.php`
- [x] `GoodsReceivingController.php`
- [x] `SalesReturnController.php`
- [x] `SupplierReturnController.php`
- [x] `StockOpnameController.php`
- [x] `StockTransferController.php`
- [x] `CashierShiftController.php`
- [x] `SettingController.php`
- [x] `PricingRuleController.php`
- [x] `PriceListController.php`
- [x] `WarehouseController.php`
- [x] `BankAccountController.php`
- [x] `DiscountApprovalController.php`
- [x] `CrmCampaignController.php`
- [x] `CustomerSegmentController.php`
- [x] `CustomerVoucherController.php`
- [x] `ImportExportController.php`
- [x] `PaymentSettingController.php`

Services in `app/Services/` with Indonesian strings:
- [x] `ThermalPrintService.php`
- [x] `CrmAutomationService.php`
- [x] `CustomerSegmentationService.php`
- [x] `GoodsReceivingService.php`
- [x] `StockMutationService.php`
- [x] `LoyaltyService.php`

---

## Summary

| Phase | Area | Files | Status |
|-------|------|-------|--------|
| 1 | Shared components | 16 | ✅ done |
| 2 | Auth/public pages | 10 | ✅ done |
| 3 | Dashboard main | 2 | ✅ done |
| 4 | Transactions | 3 | ⬜ |
| 5 | Master Data | 11 | ⬜ |
| 6 | Procurement | 7 | ⬜ |
| 7 | Sales & Returns | 6 | ⬜ |
| 8 | Financials | 5 | ⬜ |
| 9 | Reports | 3 | ⬜ |
| 10 | Inventory | 7 | ⬜ |
| 11 | CRM & Pricing | 14 | ⬜ |
| 12 | Operations | 5 | ⬜ |
| 13 | User Management | 5 | ⬜ |
| 14 | Settings | 11 | ⬜ |
| 15 | PHP Backend | 28 | ✅ done |
| **Total** | | **~133 files** | **41/133 done (31%)** |
