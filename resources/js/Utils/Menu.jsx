import { usePage } from "@inertiajs/react";
import {
    IconBooks,
    IconBox,
    IconCategory,
    IconChartArrowsVertical,
    IconChartBar,
    IconChartBarPopular,
    IconChartInfographic,
    IconCirclePlus,
    IconClockHour6,
    IconClipboardCheck,
    IconCreditCard,
    IconCrown,
    IconFileCertificate,
    IconFileDescription,
    IconFolder,
    IconGift,
    IconLayout2,
    IconBuildingStore,
    IconSchool,
    IconShoppingCart,
    IconTable,
    IconUserBolt,
    IconUserShield,
    IconUserSquare,
    IconUsers,
    IconUsersPlus,
    IconFileInvoice,
    IconBuildingWarehouse,
    IconCurrencyDollar,
    IconWallet,
    IconFileSearch,
    IconTruckDelivery,
    IconTruckReturn,
    IconSpeakerphone,
    IconArrowsLeftRight,
    IconAlertCircle,
    IconListDetails,
    IconBrandWhatsapp,
} from "@tabler/icons-react";
import hasAnyPermission from "./Permission";
import React from "react";

export default function Menu(__) {
    const fallback = (k) => k;
    const t = __ || fallback;
    const { url } = usePage();

    // define menu navigations
    const menuNavigation = [
        {
            title: t("menu.overview"),
            details: [
                {
                    title: t("menu.dashboard"),
                    href: route("dashboard"),
                    active: url === "/dashboard" ? true : false, // Update comparison here
                    icon: <IconLayout2 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: t("menu.master_data"),
            details: [
                {
                    title: t("menu.categories"),
                    href: route("categories.index"),
                    active: url === "/dashboard/categories" ? true : false, // Update comparison here
                    icon: <IconFolder size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["categories-access"]),
                },
                {
                    title: t("menu.products"),
                    href: route("products.index"),
                    active: url === "/dashboard/products" ? true : false, // Update comparison here
                    icon: <IconBox size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["products-access"]),
                },
                {
                    title: t("menu.customers"),
                    href: route("customers.index"),
                    active: url === "/dashboard/customers" ? true : false, // Update comparison here
                    icon: <IconUsersPlus size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customers-access"]),
                },
                {
                    title: t("menu.suppliers"),
                    href: route("suppliers.index"),
                    active: url.startsWith("/dashboard/suppliers"),
                    icon: <IconBuildingWarehouse size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["suppliers-access"]),
                },
            ],
        },
        {
            title: t("menu.sales"),
            details: [
                {
                    title: t("menu.transactions"),
                    href: route("transactions.index"),
                    active: url === "/dashboard/transactions" ? true : false, // Update comparison here
                    icon: <IconShoppingCart size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: t("menu.transaction_history"),
                    href: route("transactions.history"),
                    active:
                        url === "/dashboard/transactions/history"
                            ? true
                            : false,
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: t("menu.sales_returns"),
                    href: route("sales-returns.index"),
                    active: url.startsWith("/dashboard/sales-returns"),
                    icon: <IconFileCertificate size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["sales-returns-access"]),
                },
                {
                    title: t("menu.receivables"),
                    href: route("receivables.index"),
                    active: url.startsWith("/dashboard/receivables"),
                    icon: <IconFileInvoice size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["receivables-access"]),
                },
                {
                    title: t("menu.aging_reminders"),
                    href: route("aging.index"),
                    active: url.startsWith("/dashboard/aging"),
                    icon: <IconChartBar size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["receivables-access"]),
                },
            ],
        },
        {
            title: t("menu.approval"),
            details: [
                {
                    title: t("menu.discount_approval"),
                    href: route("discount-approvals.pending"),
                    active: url.startsWith("/dashboard/discount-approvals"),
                    icon: <IconAlertCircle size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["discounts-approve"]),
                },
            ],
        },
        {
            title: t("menu.inventory"),
            details: [
                {
                    title: t("menu.stock_opname"),
                    href: route("stock-opnames.index"),
                    active: url.startsWith("/dashboard/stock-opnames"),
                    icon: <IconFileDescription size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["stock-opnames-access"]),
                },
                {
                    title: t("menu.stock_mutations"),
                    href: route("stock-mutations.index"),
                    active: url.startsWith("/dashboard/stock-mutations"),
                    icon: (
                        <IconChartArrowsVertical size={20} strokeWidth={1.5} />
                    ),
                    permissions: hasAnyPermission(["stock-mutations-access"]),
                },
                {
                    title: t("menu.stock_transfers"),
                    href: route("stock-transfers.index"),
                    active: url.startsWith("/dashboard/stock-transfers"),
                    icon: <IconArrowsLeftRight size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["stock-transfers-access"]),
                },
            ],
        },
        {
            title: t("menu.procurement"),
            details: [
                {
                    title: t("menu.purchase_orders"),
                    href: route("purchase-orders.index"),
                    active: url.startsWith("/dashboard/purchase-orders"),
                    icon: <IconClipboardCheck size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["purchase-orders-access"]),
                },
                {
                    title: t("menu.goods_receiving"),
                    href: route("goods-receivings.index"),
                    active: url.startsWith("/dashboard/goods-receivings"),
                    icon: <IconTruckDelivery size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["goods-receivings-access"]),
                },
                {
                    title: t("menu.supplier_returns"),
                    href: route("supplier-returns.index"),
                    active: url.startsWith("/dashboard/supplier-returns"),
                    icon: <IconTruckReturn size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["supplier-returns-access"]),
                },
                {
                    title: t("menu.supplier_payables"),
                    href: route("payables.index"),
                    active: url.startsWith("/dashboard/payables"),
                    icon: <IconCurrencyDollar size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["payables-access"]),
                },
            ],
        },
        {
            title: t("menu.crm_pricing"),
            details: [
                {
                    title: t("menu.members"),
                    href: route("members.index"),
                    active: url.startsWith("/dashboard/members"),
                    icon: <IconCrown size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customers-access"]),
                },
                {
                    title: t("menu.promo_pricing"),
                    href: route("pricing-rules.index"),
                    active: url.startsWith("/dashboard/pricing-rules"),
                    icon: <IconChartInfographic size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["pricing-rules-access"]),
                },
                {
                    title: t("menu.customer_vouchers"),
                    href: route("customer-vouchers.index"),
                    active: url.startsWith("/dashboard/customer-vouchers"),
                    icon: <IconCreditCard size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customer-vouchers-access"]),
                },
                {
                    title: t("menu.customer_segments"),
                    href: route("customer-segments.index"),
                    active: url.startsWith("/dashboard/customer-segments"),
                    icon: <IconUsers size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customer-segments-access"]),
                },
                {
                    title: t("menu.crm_campaigns"),
                    href: route("crm-campaigns.index"),
                    active: url.startsWith("/dashboard/crm-campaigns"),
                    icon: <IconSpeakerphone size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["crm-campaigns-access"]),
                },
                {
                    title: t("menu.crm_reminders"),
                    href: route("crm-reminders.index"),
                    active: url.startsWith("/dashboard/crm-reminders"),
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["crm-reminders-access"]),
                },
            ],
        },
        {
            title: t("menu.reports"),
            details: [
                {
                    title: t("menu.sales_report"),
                    href: route("reports.sales.index"),
                    active: url.startsWith("/dashboard/reports/sales"),
                    icon: (
                        <IconChartArrowsVertical size={20} strokeWidth={1.5} />
                    ),
                    permissions: hasAnyPermission(["reports-access"]),
                },
                {
                    title: t("menu.profit_report"),
                    href: route("reports.profits.index"),
                    active: url.startsWith("/dashboard/reports/profits"),
                    icon: <IconChartBarPopular size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["profits-access"]),
                },
                {
                    title: t("menu.advanced_insights"),
                    href: route("reports.insights.index"),
                    active: url.startsWith("/dashboard/reports/insights"),
                    icon: <IconChartBar size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["reports-access"]),
                },
            ],
        },
        {
            title: t("menu.operations"),
            details: [
                {
                    title: t("menu.cashier_shifts"),
                    href: route("cashier-shifts.index"),
                    active: url.startsWith("/dashboard/cashier-shifts"),
                    icon: <IconWallet size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["cashier-shifts-access"]),
                },
                {
                    title: t("menu.audit_log"),
                    href: route("audit-logs.index"),
                    active: url.startsWith("/dashboard/audit-logs"),
                    icon: <IconFileSearch size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["audit-logs-access"]),
                },
            ],
        },
        {
            title: t("menu.user_management"),
            details: [
                {
                    title: t("menu.permissions"),
                    href: route("permissions.index"),
                    active: url === "/dashboard/permissions" ? true : false, // Update comparison here
                    icon: <IconUserBolt size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["permissions-access"]),
                },
                {
                    title: t("menu.roles"),
                    href: route("roles.index"),
                    active: url === "/dashboard/roles" ? true : false, // Update comparison here
                    icon: <IconUserShield size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["roles-access"]),
                },
                {
                    title: t("menu.users"),
                    icon: <IconUsers size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["users-access"]),
                    subdetails: [
                        {
                            title: t("menu.user_data"),
                            href: route("users.index"),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            active: url === "/dashboard/users" ? true : false,
                            permissions: hasAnyPermission(["users-access"]),
                        },
                        {
                            title: t("menu.add_user"),
                            href: route("users.create"),
                            icon: (
                                <IconCirclePlus size={20} strokeWidth={1.5} />
                            ),
                            active:
                                url === "/dashboard/users/create"
                                    ? true
                                    : false,
                            permissions: hasAnyPermission(["users-create"]),
                        },
                    ],
                },
            ],
        },
        {
            title: t("menu.settings"),
            details: [
                {
                    title: t("menu.payment_gateway"),
                    href: route("settings.payments.edit"),
                    active: url === "/dashboard/settings/payments",
                    icon: <IconCreditCard size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["payment-settings-access"]),
                },
                {
                    title: t("menu.store_profile"),
                    href: route("settings.store"),
                    active: url === "/dashboard/settings/store",
                    icon: <IconBuildingStore size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: t("menu.bank_accounts"),
                    href: route("settings.bank-accounts.index"),
                    active: url === "/dashboard/settings/bank-accounts",
                    icon: <IconCreditCard size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["payment-settings-access"]),
                },
                {
                    title: t("menu.loyalty"),
                    href: route("settings.loyalty"),
                    active: url === "/dashboard/settings/loyalty",
                    icon: <IconGift size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: t("menu.sales_target"),
                    href: route("settings.target"),
                    active: url === "/dashboard/settings/target",
                    icon: <IconChartInfographic size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: t("menu.price_list"),
                    href: route("price-lists.index"),
                    active: url.startsWith("/dashboard/settings/price-lists"),
                    icon: <IconListDetails size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["price-lists-access"]),
                },
                {
                    title: t("menu.warehouses"),
                    href: route("settings.warehouses.index"),
                    active: url === "/dashboard/settings/warehouses",
                    icon: <IconBuildingWarehouse size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["warehouses-access"]),
                },
                {
                    title: t("menu.whatsapp"),
                    href: route("settings.whatsapp"),
                    active: url === "/dashboard/settings/whatsapp",
                    icon: <IconBrandWhatsapp size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["whatsapp-settings-access"]),
                },
            ],
        },
    ];

    return menuNavigation;
}
