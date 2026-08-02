# Competitors & Market Pricing — Egypt

> Competitive research for selling this POS system in Egypt. Compiled 2026-08-02 via online research (vendor sites + search engines). All figures are list prices as of access date; unverified/anecdotal figures are flagged. FX reference: **1 USD ≈ EGP 48**.

## 1. What We Sell (feature summary from `docs/features/`)

This POS is an open-source, self-hostable system built on Laravel 12 + Inertia 2.0 + React 18. Full feature set below is drawn from the 23 module docs in `docs/features/`.

| Module | Key features |
|---|---|
| **POS & Transactions** (`pos-transactions.md`) | Text/barcode product search, multi-item cart, hold/resume, checkout (cash / card / pay-later), invoice + receipt + shipping label print/share, create customer from POS |
| **Sales Returns** (`sales-returns.md`) | Partial/full return, cash refund, store credit, restock, receivable correction |
| **Inventory & Stock** (`inventory-stock.md`) | Product CRUD with soft-delete, initial stock, stock opname (draft → finalize), full stock-mutation audit trail, low-stock notifications |
| **Multi-Warehouse** (`multi-warehouse.md`) | Per-warehouse stock, branch/stock/main warehouse types, warehouse per cashier shift, inter-warehouse stock transfers |
| **Batch / Expiry** (in `purchasing-chain.md`) | Batch number + expiry date per received item |
| **Unit Conversion** (`unit-conversion.md`) | Multi-unit products (PCS/BOX/KARTON/KG/…), per-unit pricing & barcode, auto base-unit conversion *(UI dropdown not yet shipped)* |
| **Purchasing Chain** (`purchasing-chain.md`) | Purchase Orders, Goods Receiving (full/partial, batch/expiry), Supplier Returns, auto-created 30-day payables |
| **Payables & Suppliers** (`payables-suppliers.md`) | Supplier master, payable tracking, partial payments, PDF |
| **Receivables** (`receivables.md`) | Credit-sale receivables, partial payments, overdue status, PDF, **customer self-service online payment** |
| **Pricing & Promo** (`promotions-loyalty.md`) | Discount rules, qty-break tiers, bundles, buy-X-get-Y, customer-scoped pricing, scheduled promos, price preview |
| **Loyalty** (`promotions-loyalty.md`) | Customer vouchers, points earn/redeem, auto tier sync (Regular→Platinum) |
| **Multi-Price List** (`promotions-loyalty.md`) | Per-customer-group prices |
| **CRM** (`crm-segments.md`) | Manual/rule-based customer segments, campaigns (reminder/promo/follow-up), due-soon & overdue & repeat-order reminders |
| **Members** (`member-management.md`) | Member codes, active/inactive without data loss, POS member picker |
| **Customers & Regions** (`customers-regions.md`) | Rich customer master with Indonesian administrative regions, transaction history *(Indonesia-specific — needs Egypt localization)* |
| **Import / Export** (`import-export.md`) | Products/customers/transactions CSV+Excel, downloadable templates |
| **Reports & Docs** (`reports-documents.md`) | Sales & profit reports, PDF invoice/receipt/shipping, PDF receivables/payables |
| **Settings & Payments** (`settings-payments.md`) | Payment gateways (Midtrans, Xendit — Indonesian), store profile, sales targets |
| **Tax** (`tax-management.md`) | Per-product VAT (exclusive/inclusive), configurable default rate, store NPWP/NIB |
| **Thermal Printer** (`thermal-printer.md`) | 58mm/80mm receipts, ESC/POS, WebUSB, auto-print |
| **Mobile POS / PWA** (`mobile-pos.md`) | Camera barcode scanning, offline-capable PWA, fullscreen, touch-optimized |
| **RBAC** (`rbac-users-roles.md`) | Granular roles/permissions (Spatie), super-admin bypass |
| **Audit Logs** (`audit-logs.md`) | Before/after payloads, user/module/event filters, IP + user-agent |
| **Cashier Shifts** (`cashier-shifts.md`) | Open/close/force-close, expected vs actual cash reconciliation |
| **WhatsApp Gateway** (`whatsapp-gateway.md`) | Own WhatsApp Web bridge, QR connect, campaign/reminder auto-send |
| **Customer Portal** (`customer-portal.md`) | Token-based guest invoice view + online receivable payment |

**Important honesty note:** the product was built for the **Indonesian market** (Rupiah, PPN, Midtrans/Xendit, Indonesian regions, Indonesian-language UI). Selling in Egypt requires localization: Arabic + English UI, **ETA e-invoicing / e-receipt integration (government-mandated)**, Egyptian payment rails (Paymob, Fawry, Meeza), and Egyptian address/tax data.

## 2. Egypt Market Context (regulatory)

- **E-invoicing (B2B)** is mandatory for all VAT-registered businesses; **e-receipts (B2C)** are being rolled out in waves to small retailers (ETA Resolution 281/2025). Since March 2026, access to the simplified tax regime (< EGP 20M turnover) is **conditional on e-invoice + e-receipt compliance**.
- Model = central clearance: invoice must be signed, submitted to the ETA portal, and approved to be legally valid. Penalties EGP 20,000–100,000.
- **Implication:** any POS sold in Egypt without ETA e-invoicing/e-receipt support is a hard sell. This is the single biggest competitive lever and the biggest gap in the current product.

## 3. Competitor Landscape

### 3.1 Local Egyptian cloud/SaaS POS (verified, published pricing)

| Vendor | Product | Pricing (verified) | Free tier | Target |
|---|---|---|---|---|
| **Kashir** (kashir.net, "SOLIQ") | Cloud POS (restaurant/supermarket/pharmacy) | Starter **$19/mo** (~EGP 900), Business **$49/mo** (~EGP 2,400), Enterprise custom; 20% off annual. Own blog: "from EGP 299/mo" | 14-day trial | F&B, retail |
| **X9 / Xnine POS** (get-x9.com) | Cloud POS (restaurants/cafes) | Starter **EGP 999/mo** (5k txns), Basic **EGP 1,500/mo**, Professional **EGP 2,499/mo** (2 branches), Business **EGP 4,999/mo** (3 branches + SLA); 6-month-free promo | No (promo trial) | Restaurants |
| **Talabxy** (talabxy.com) | POS + QR menu + HRM | **EGP 300–1,500/mo** (self-published range) | Trial | F&B, retail |
| **Siindbad** (siindbad.com) | Cloud POS + e-commerce | **Free plan** (1 branch, unlimited items); Advanced **EGP 2,000/year/branch** | ✅ Free plan | Retail, supermarkets |
| **alCashier** (alcashier.com) | Arabic cloud POS (web/Android/iOS/Win) | **Free plan** (1 branch/1 device/1 user, weekly reports); Advanced = custom quote | ✅ Free plan | Stores, restaurants |

### 3.2 Local one-time-license / desktop POS (dominant model in Egypt)

| Vendor | Model | Pricing (verified where published) |
|---|---|---|
| **DEXEF** (dexef.com) | One-time license (POS, ONE, SMART, ERP) | Not published — custom quote; free POS download + 30-day trial, 3-month refund guarantee |
| **Deltawy** (deltawy.com) | Modular one-time license | Modules EGP 1,000–5,000 each; **ETA e-invoicing integration EGP 7,000**; full package **EGP 43,000** (2022 figures — dated/indicative) |
| **Microtech Egypt** | POS/retail systems integrator | Not published — custom quote |
| **Kashboss** | Arabic ERP + POS | Not published (SPA site); free tier advertised |
| Market range (per Kashir 2026 guide) | Desktop one-time | Budget **EGP 1,500–4,000**; mid **EGP 5,000–15,000**; professional **EGP 15,000–35,000**; enterprise ERP **EGP 35,000–80,000+** |

### 3.3 International / open-source (used in Egypt)

| Product | Pricing | Free tier | Arabic | ETA e-invoicing | In Egypt |
|---|---|---|---|---|---|
| **Loyverse** | Core free; add-ons: unlimited history **$5/mo/store**, employees **$5/mo/employee**, advanced inventory **$25/mo/store** | ✅ | ✅ | ❌ | Used (no local support/payment rails) |
| **Odoo POS** | One-app-free **$0**; Standard **$8.95/user/mo**; Custom **$13.60/user/mo** | ✅ (+ free Community) | ✅ | ✅ **native** | ✅ partners |
| **ERPNext** | Free OSS (AGPL); hosting from **$5/mo** | ✅ | ~ | ~ community apps | ~ |
| **iRestaurant** (Turkey, serves Egypt) | **$50 / $75 / $100 per mo** by plan | ❌ | ✅ | ❌ | ✅ Arab market |
| **Foodics** (Saudi) | Higher-cost cloud restaurant POS | ❌ | ✅ | ~ | ✅ used |
| **Zyda** (Saudi) | Starter **$85/mo**, Growth **$135/mo** (online ordering platform, not POS) | ❌ | ✅ | ❌ | ✅ |
| **Square** | n/a — **not available in Egypt** | – | – | – | ❌ |
| **TouchBistro** | POS from **$69/mo**; bundle $119/mo | ❌ | ❌ | ❌ | ❌ |

### 3.4 Payment-terminal players (complementary, not direct competitors)

They sell card acceptance (per-transaction %, not cashier software) and are **integration partners** for cashier POS.

| Company | Product | Pricing |
|---|---|---|
| **Paymob** | Gateway + smart POS terminal (PAX A920) | **2.75% + EGP 3/transaction**, no monthly/subscription fee; device price not published |
| **Kashier** | Gateway + POS machine + Scan2Pay | **2.75% + EGP 3.00/transaction**, free account |
| **Fawry** | Fawry Accept POS (cards, wallets, BNPL) | Not published — sales-led |
| **Geidea** | Card-acquiring terminals | Not published |

## 4. Pricing Summary (where this product sits)

| Segment | Pricing model | Typical EGP | Typical USD/mo |
|---|---|---|---|
| Free/budget cloud | Subscription | EGP 0 – 1,500/mo | $0 – 30 |
| Mid cloud | Subscription | EGP 2,000–5,000/mo | $40 – 100 |
| Desktop one-time | License + 15–25%/yr maintenance | EGP 3,000–25,000 | — |
| Professional desktop | License | EGP 15,000–35,000 | — |
| Enterprise ERP | License | EGP 35,000–80,000+ | — |

**Price anchors:** Egyptian local cloud POS runs **EGP 299–4,999/mo ($6–104)**; desktop one-time **EGP 3,000–25,000**; global cloud **$69–135/mo**. Open-source competitors (Odoo, ERPNext) sell **free software + hosting/implementation**.

## 5. Recommended Positioning

- **Price point:** undercut local cloud SaaS with an open-source / self-hosted model — e.g. **free core + paid support/hosting (EGP 500–1,500/mo)** or a **one-time license EGP 4,000–8,000 + 15–20%/yr maintenance**, matching the dominant desktop model.
- **Lead differentiators** (from current feature set): full multi-warehouse, offline-capable PWA, WhatsApp receipts/reminders, loyalty + promo engine, thermal printing, RBAC, audit logs — most local players lack several of these.
- **Blockers to fix before Egypt launch:** ETA e-invoicing + e-receipt integration (mandatory), Arabic UI, Egyptian payment rails (Paymob/Fawry/Meeza), Egypt address/tax data, local support.
- **Do not compete head-on** with payment-terminal pricing (2.75% + EGP 3/tx) — integrate with them.

## 6. Sources

**Vendor sites:** loyverse.com/pricing · odoo.com/pricing · erpnext.com/pricing · touchbistro.com/pricing · zyda.com/pricing · get-x9.com/ar/pricing · kashir.net/en/pricing · kashir.net/en/blog/cashier-software-prices-egypt-2026 · talabxy.com/blog/pos-system-cost-egypt-2026 · siindbad.com · alcashier.com/pricing · dexef.com/accounting-software/pos-software/ · deltawy.com/article/403/ · paymob.com/en/pricing · kashier.io/en/pricing · fawry.com/business/acceptance/point-of-sale/ · irestaurant.iqtech-sys.com · casheregypt.com · cairopos.com

**Market/regulation:** e-invoicing.org/egypt · vatfaqs.com/e-invoicing/egypt · cleartax.com/eg/en/e-invoicing-egypt · odoo.com/documentation (Egypt localization) · ensun.io/search/point-of-sale-pos/egypt

**Unverifiable (do not benchmark):** "R9 POS", "Violet POS", "Naveca", "Molo POS", "ClickPOS Egypt", "EBC Konnect", "Al-Fawater", "IBS Egypt", "KASPI" — no verifiable Egyptian presence or domain footprint found at research time (likely defunct, Facebook/WhatsApp-only resellers, or name collisions).
