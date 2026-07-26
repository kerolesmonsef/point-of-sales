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

### Utilities
- [ ] `resources/js/Utils/Menu.jsx`
- [ ] `resources/js/Utils/Translations.jsx` (helper, no translation needed)
- [ ] `resources/js/Utils/Permission.jsx`

### Layouts
- [ ] `resources/js/Layouts/POSLayout.jsx`
- [ ] `resources/js/Layouts/GuestLayout.jsx`
- [ ] `resources/js/Layouts/AuthenticatedLayout.jsx`
- [ ] `resources/js/Layouts/DashboardLayout.jsx`

### Breeze Components
- [ ] `resources/js/Components/Dropdown.jsx`
- [ ] `resources/js/Components/Modal.jsx`
- [ ] `resources/js/Components/TextInput.jsx`
- [ ] `resources/js/Components/DangerButton.jsx`
- [ ] `resources/js/Components/NavLink.jsx`
- [ ] `resources/js/Components/InputError.jsx`
- [ ] `resources/js/Components/InputLabel.jsx`
- [ ] `resources/js/Components/SecondaryButton.jsx`
- [ ] `resources/js/Components/PrimaryButton.jsx`
- [ ] `resources/js/Components/ApplicationLogo.jsx`
- [ ] `resources/js/Components/ResponsiveNavLink.jsx`
- [ ] `resources/js/Components/Checkbox.jsx`
- [ ] `resources/js/Components/AuthBotGuardFields.jsx`

### Dashboard Shared Components
- [ ] `resources/js/Components/Dashboard/Button.jsx`
- [ ] `resources/js/Components/Dashboard/Notification.jsx`
- [ ] `resources/js/Components/Dashboard/ImportButton.jsx`
- [ ] `resources/js/Components/Dashboard/ListBox.jsx`
- [ ] `resources/js/Components/Dashboard/Sidebar.jsx`
- [ ] `resources/js/Components/Dashboard/Widget.jsx`
- [ ] `resources/js/Components/Dashboard/Header.jsx`
- [ ] `resources/js/Components/Dashboard/Card.jsx`
- [ ] `resources/js/Components/Dashboard/Search.jsx`
- [ ] `resources/js/Components/Dashboard/InputSelect.jsx`
- [ ] `resources/js/Components/Dashboard/Barcode.jsx`
- [ ] `resources/js/Components/Dashboard/Modal.jsx`
- [ ] `resources/js/Components/Dashboard/Navbar.jsx`
- [ ] `resources/js/Components/Dashboard/Pagination.jsx`
- [ ] `resources/js/Components/Dashboard/LinkItemDropdown.jsx`
- [ ] `resources/js/Components/Dashboard/Checkbox.jsx`
- [ ] `resources/js/Components/Dashboard/Input.jsx`
- [ ] `resources/js/Components/Dashboard/TextArea.jsx`
- [ ] `resources/js/Components/Dashboard/Skeleton.jsx`
- [ ] `resources/js/Components/Dashboard/Table.jsx`
- [ ] `resources/js/Components/Dashboard/AuthDropdown.jsx`
- [ ] `resources/js/Components/Dashboard/LazyImage.jsx`
- [ ] `resources/js/Components/Dashboard/LinkItem.jsx`

### POS Components
- [ ] `resources/js/Components/POS/CustomerSelect.jsx`
- [ ] `resources/js/Components/POS/CartPanel.jsx`
- [ ] `resources/js/Components/POS/HeldTransactions.jsx`
- [ ] `resources/js/Components/POS/AddCustomerModal.jsx`
- [ ] `resources/js/Components/POS/PaymentPanel.jsx`
- [ ] `resources/js/Components/POS/SearchBar.jsx`
- [ ] `resources/js/Components/POS/ProductGrid.jsx`
- [ ] `resources/js/Components/POS/NumpadModal.jsx`
- [ ] `resources/js/Components/POS/CustomerHistoryPanel.jsx`
- [ ] `resources/js/Components/POS/BarcodeScanner.jsx`

### Receipt Components
- [ ] `resources/js/Components/Receipt/ShippingLabel.jsx`
- [ ] `resources/js/Components/Receipt/ThermalReceipt.jsx`

### Barcode Components
- [ ] `resources/js/Components/Barcode/BarcodePrintModal.jsx`
- [ ] `resources/js/Components/Barcode/BarcodeLabel.jsx`

### Product Components
- [ ] `resources/js/Components/Products/UnitsSection.jsx`

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

- [x] `resources/js/Pages/Dashboard/Transactions/Index.jsx` **← biggest file**
- [x] `resources/js/Pages/Dashboard/Transactions/History.jsx`
- [x] `resources/js/Pages/Dashboard/Transactions/Print.jsx`

---

## Phase 5: Master Data

### Products
- [x] `resources/js/Pages/Dashboard/Products/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Products/Create.jsx`
- [x] `resources/js/Pages/Dashboard/Products/Edit.jsx`

### Categories
- [x] `resources/js/Pages/Dashboard/Categories/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Categories/Create.jsx`
- [x] `resources/js/Pages/Dashboard/Categories/Edit.jsx`

### Customers
- [x] `resources/js/Pages/Dashboard/Customers/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Customers/Create.jsx`
- [x] `resources/js/Pages/Dashboard/Customers/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/Customers/Show.jsx`

### Suppliers
- [x] `resources/js/Pages/Dashboard/Suppliers/Index.jsx`

---

## Phase 6: Procurement

- [x] `resources/js/Pages/Dashboard/PurchaseOrders/Index.jsx`
- [x] `resources/js/Pages/Dashboard/PurchaseOrders/Create.jsx`
- [x] `resources/js/Pages/Dashboard/PurchaseOrders/Show.jsx`
- [x] `resources/js/Pages/Dashboard/GoodsReceivings/Index.jsx`
- [x] `resources/js/Pages/Dashboard/GoodsReceivings/Create.jsx`
- [x] `resources/js/Pages/Dashboard/GoodsReceivings/Show.jsx`

---

## Phase 7: Sales & Returns

- [x] `resources/js/Pages/Dashboard/SalesReturns/Index.jsx`
- [x] `resources/js/Pages/Dashboard/SalesReturns/Form.jsx`
- [x] `resources/js/Pages/Dashboard/SalesReturns/Show.jsx`
- [x] `resources/js/Pages/Dashboard/SalesReturns/Create.jsx`
- [x] `resources/js/Pages/Dashboard/SupplierReturns/Index.jsx`
- [x] `resources/js/Pages/Dashboard/SupplierReturns/Create.jsx`
- [x] `resources/js/Pages/Dashboard/SupplierReturns/Show.jsx`

---

## Phase 8: Financials

- [x] `resources/js/Pages/Dashboard/Receivables/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Receivables/Show.jsx`
- [x] `resources/js/Pages/Dashboard/Payables/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Payables/Show.jsx`
- [x] `resources/js/Pages/Dashboard/Aging/Index.jsx`

---

## Phase 9: Reports

- [x] `resources/js/Pages/Dashboard/Reports/Sales.jsx`
- [x] `resources/js/Pages/Dashboard/Reports/Profit.jsx`
- [x] `resources/js/Pages/Dashboard/Reports/Insights.jsx`

---

## Phase 10: Inventory

- [x] `resources/js/Pages/Dashboard/StockOpnames/Index.jsx`
- [x] `resources/js/Pages/Dashboard/StockOpnames/Create.jsx`
- [x] `resources/js/Pages/Dashboard/StockOpnames/Show.jsx`
- [x] `resources/js/Pages/Dashboard/StockMutations/Index.jsx`
- [x] `resources/js/Pages/Dashboard/StockTransfers/Index.jsx`
- [x] `resources/js/Pages/Dashboard/StockTransfers/Create.jsx`
- [x] `resources/js/Pages/Dashboard/StockTransfers/Show.jsx`

---

## Phase 11: CRM & Pricing

- [x] `resources/js/Pages/Dashboard/PricingRules/Index.jsx`
- [x] `resources/js/Pages/Dashboard/PricingRules/Form.jsx`
- [x] `resources/js/Pages/Dashboard/PricingRules/Create.jsx`
- [x] `resources/js/Pages/Dashboard/PricingRules/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/Members/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Members/Form.jsx`
- [x] `resources/js/Pages/Dashboard/Members/Create.jsx`
- [x] `resources/js/Pages/Dashboard/Members/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/Members/Show.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerVouchers/Index.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerVouchers/Form.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerVouchers/Create.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerVouchers/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerSegments/Index.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerSegments/Form.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerSegments/Create.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerSegments/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/CustomerSegments/Show.jsx`
- [x] `resources/js/Pages/Dashboard/CrmCampaigns/Index.jsx`
- [x] `resources/js/Pages/Dashboard/CrmCampaigns/Form.jsx`
- [x] `resources/js/Pages/Dashboard/CrmCampaigns/Create.jsx`
- [x] `resources/js/Pages/Dashboard/CrmCampaigns/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/CrmCampaigns/Show.jsx`
- [x] `resources/js/Pages/Dashboard/CrmReminders/Index.jsx`

---

## Phase 12: Operations & Admin

- [x] `resources/js/Pages/Dashboard/DiscountApprovals.jsx`
- [x] `resources/js/Pages/Dashboard/CashierShifts/Index.jsx`
- [x] `resources/js/Pages/Dashboard/CashierShifts/Show.jsx`
- [x] `resources/js/Pages/Dashboard/AuditLogs/Index.jsx`
- [x] `resources/js/Pages/Dashboard/AuditLogs/Show.jsx`

---

## Phase 13: User Management

- [x] `resources/js/Pages/Dashboard/Users/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Users/Create.jsx`
- [x] `resources/js/Pages/Dashboard/Users/Edit.jsx`
- [x] `resources/js/Pages/Dashboard/Roles/Index.jsx`
- [x] `resources/js/Pages/Dashboard/Permissions/Index.jsx`

---

## Phase 14: Settings

- [x] `resources/js/Pages/Dashboard/Settings/Store.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Payment.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/PriceLists.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/PriceListItems.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/BankAccounts.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/BankAccountForm.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Warehouses.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Loyalty.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Whatsapp.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Target.jsx`
- [x] `resources/js/Pages/Dashboard/Settings/Printer.jsx`

---

## Phase 15: Profile

- [x] `resources/js/Pages/Profile/Edit.jsx`
- [x] `resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx`
- [x] `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx`
- [x] `resources/js/Pages/Profile/Partials/DeleteUserForm.jsx`

---

## Phase 16: PHP Backend (Controllers & Services)

Controllers in `app/Http/Controllers/Apps/` with Indonesian flash/toast messages:
- [ ] `CustomerController.php`
- [ ] `SupplierController.php`
- [ ] `ProductController.php`
- [ ] `TransactionController.php`
- [ ] `PayableController.php`
- [ ] `ReceivableController.php`
- [ ] `PurchaseOrderController.php`
- [ ] `GoodsReceivingController.php`
- [ ] `SalesReturnController.php`
- [ ] `SupplierReturnController.php`
- [ ] `StockOpnameController.php`
- [ ] `StockTransferController.php`
- [ ] `CashierShiftController.php`
- [ ] `SettingController.php`
- [ ] `PricingRuleController.php`
- [ ] `PriceListController.php`
- [ ] `WarehouseController.php`
- [ ] `BankAccountController.php`
- [ ] `DiscountApprovalController.php`
- [ ] `CrmCampaignController.php`
- [ ] `CustomerSegmentController.php`
- [ ] `CustomerVoucherController.php`
- [ ] `ImportExportController.php`
- [ ] `PaymentSettingController.php`
- [ ] `SaleController.php`
- [ ] `AgingController.php`
- [ ] `MemberController.php`
- [ ] `AuditLogController.php`
- [ ] `CategoryController.php`
- [ ] `StockMutationController.php`
- [ ] `CrmReminderController.php`

Services in `app/Services/` with Indonesian strings:
- [ ] `ThermalPrintService.php`
- [ ] `CrmAutomationService.php`
- [ ] `CustomerSegmentationService.php`
- [ ] `GoodsReceivingService.php`
- [ ] `StockMutationService.php`
- [ ] `LoyaltyService.php`
- [ ] `PricingService.php`
- [ ] `CashierShiftService.php`
- [ ] `AuditLogService.php`
- [ ] `SupplierReturnService.php`
- [ ] `ReorderService.php`
- [ ] `StockTransferService.php`
- [ ] `UnitConversionService.php`
- [ ] `ReceivableService.php`
- [ ] `PurchaseOrderService.php`
- [ ] `PriceListService.php`
- [ ] `PayableAgingService.php`
- [ ] `WhatsAppService.php`
- [ ] `BatchService.php`
- [ ] `TaxService.php`

---

## Summary

| Phase | Area | Files | Status |
|-------|------|-------|--------|
| 1 | Shared components | 47 | ⬜ pending |
| 2 | Auth/public pages | 10 | ✅ 10/10 done |
| 3 | Dashboard main | 2 | ✅ 2/2 done |
| 4 | Transactions | 3 | ✅ 3/3 done |
| 5 | Master Data | 11 | ✅ 11/11 done |
| 6 | Procurement | 7 | ✅ 7/7 done |
| 7 | Sales & Returns | 7 | ✅ 7/7 done |
| 8 | Financials | 5 | ✅ 5/5 done |
| 9 | Reports | 3 | ✅ 3/3 done |
| 10 | Inventory | 7 | ✅ 7/7 done |
| 11 | CRM & Pricing | 26 | ✅ 26/26 done |
| 12 | Operations | 5 | ✅ 5/5 done |
| 13 | User Management | 5 | ✅ 5/5 done |
| 14 | Settings | 11 | ✅ 11/11 done |
| 15 | Profile | 4 | ✅ 4/4 done |
| 16 | PHP Backend | 51 | ⬜ pending |
| **Total** | | **~204 files** | **145/204 done (71%)** |
