import React, { useEffect, useState } from "react";
import { Head, router, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Dashboard/Button";
import Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";
import { useAuthorization } from "@/Utils/authorization";
import { formatCurrency } from '@/Utils/formatCurrency';
import {
    IconDatabaseOff,
    IconSearch,
    IconHistory,
    IconCalendar,
    IconReceipt,
    IconPrinter,
    IconFilter,
    IconX,
    IconCheck,
    IconBuildingBank,
    IconBrandWhatsapp,
} from "@tabler/icons-react";

const defaultFilters = {
    invoice: "",
    start_date: "",
    end_date: "",
    warehouse_id: "",
};

const History = ({ transactions, filters, warehouses = [] }) => {
    const { can } = useAuthorization();
    const canCreateSalesReturn = can("sales-returns-create");
    const canCreateCrmCampaign = can("crm-campaigns-create");
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...filters,
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...filters,
        });
    }, [filters]);

    const handleChange = (field, value) => {
        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route("transactions.history"), filterData, {
            preserveScroll: true,
            preserveState: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route("transactions.history"), defaultFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const rows = transactions?.data ?? [];
    const links = transactions?.links ?? [];
    const currentPage = transactions?.current_page ?? 1;
    const perPage = transactions?.per_page
        ? Number(transactions?.per_page)
        : rows.length || 1;

    const hasActiveFilters =
        filterData.invoice || filterData.start_date || filterData.end_date || filterData.warehouse_id;

    return (
        <>
            <Head title={__("Transaction History")} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconHistory
                                size={28}
                                className="text-primary-500"
                            />
                            {__("Transaction History")}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {transactions?.total || 0} {__("transactions recorded")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                showFilters || hasActiveFilters
                                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800 dark:text-primary-400"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>{__("Filter")}</span>
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            )}
                        </button>
                        <Link
                            href={route("transactions.index")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-500/30"
                        >
                            <IconReceipt size={18} />
                            <span>{__("New Transaction")}</span>
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {__("Invoice Number")}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="TRX-..."
                                        value={filterData.invoice}
                                        onChange={(e) =>
                                            handleChange(
                                                "invoice",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {__("Start Date")}
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "start_date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {__("End Date")}
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "end_date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {__("Warehouse / Branch")}
                                    </label>
                                    <select
                                        value={filterData.warehouse_id}
                                        onChange={(e) => handleChange("warehouse_id", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value="">{__("All Warehouses")}</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>{w.code} — {w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                                    >
                                        <IconSearch size={18} />
                                        <span>{__("Search")}</span>
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Transaction List */}
                {rows.length > 0 ? (
                    <div className="bg-transparent border-0 shadow-none rounded-2xl sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:overflow-hidden">
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("No")}
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Invoice")}
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Date")}
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Cashier")}
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Customer")}
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Item")}
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Total")}
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Status")}
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {__("Action")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rows.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {index +
                                                    1 +
                                                    (currentPage - 1) * perPage}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {transaction.invoice}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.created_at}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.cashier?.name ??
                                                    "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                                    {transaction.customer
                                                        ?.name ?? __("General")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-full">
                                                    {transaction.total_items ??
                                                        0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(
                                                    transaction.grand_total ?? 0
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {transaction.payment_method ===
                                                    "pay_later" &&
                                                transaction.payment_status !==
                                                    "paid" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                        {__("Receivable")}
                                                    </span>
                                                ) : transaction.payment_status ===
                                                  "paid" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full">
                                                        <IconCheck size={12} />
                                                        {__("Paid")}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 rounded-full">
                                                        {transaction.payment_status ??
                                                            "-"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canCreateSalesReturn ? (
                                                        transaction.can_create_sales_return ? (
                                                        <Link
                                                            href={route(
                                                                "sales-returns.create",
                                                                transaction.id
                                                            )}
                                                            className="inline-flex items-center justify-center rounded-lg bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-700 hover:bg-warning-100 dark:bg-warning-950/30 dark:text-warning-300"
                                                            title={__("Create return")}
                                                        >
                                                            {__("Return")}
                                                        </Link>
                                                        ) : (
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            {__("Return completed")}
                                                        </span>
                                                        )
                                                    ) : null}
                                                    <a
                                                        href={`https://wa.me/?text=${encodeURIComponent(
                                                            `Invoice ${transaction.invoice}: ${route(
                                                                "transactions.public",
                                                                transaction.invoice,
                                                                true
                                                            )}`
                                                        )}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors"
                                                        title={__("Share to WhatsApp")}
                                                    >
                                                        <IconBrandWhatsapp
                                                            size={18}
                                                        />
                                                    </a>
                                                    {canCreateCrmCampaign && (
                                                        <Link
                                                            href={route(
                                                                "transactions.share-campaign",
                                                                transaction.id
                                                            )}
                                                            method="post"
                                                            as="button"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-primary-950/30 dark:hover:bg-primary-950/50"
                                                            title={__("Create campaign share")}
                                                        >
                                                            <IconBuildingBank
                                                                size={18}
                                                            />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route(
                                                            "transactions.print",
                                                            transaction.invoice
                                                        )}
                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors"
                                                        title={__("Print Receipt")}
                                                    >
                                                        <IconPrinter size={18} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden flex flex-col gap-3 px-1">
                            {rows.map((transaction, index) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                No {index + 1 + (currentPage - 1) * perPage}
                                            </p>
                                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                {transaction.invoice}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {transaction.created_at}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {transaction.payment_method ===
                                                    "pay_later" &&
                                                transaction.payment_status !==
                                                    "paid" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                        {__("Receivable")}
                                                    </span>
                                                ) : transaction.payment_status ===
                                                  "paid" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full">
                                                        <IconCheck size={12} />
                                                        {__("Paid")}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 rounded-full">
                                                        {transaction.payment_status ??
                                                            "-"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(
                                                    transaction.grand_total ?? 0
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {__("Cashier")}
                                            </p>
                                            <p className="font-medium">
                                                {transaction.cashier?.name ??
                                                    "-"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {__("Customer")}
                                            </p>
                                            <p className="font-medium">
                                                {transaction.customer?.name ??
__("General")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {__("Item")}
                                            </p>
                                            <p className="font-medium">
                                                {transaction.total_items ?? 0}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {__("Payment")}
                                            </p>
                                            <p className="font-medium capitalize">
                                                {transaction.payment_method?.replace("_", " ") ??
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {canCreateSalesReturn ? (
                                            transaction.can_create_sales_return ? (
                                            <Link
                                                href={route(
                                                    "sales-returns.create",
                                                    transaction.id
                                                )}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-950/30 dark:text-warning-300"
                                            >
                                                {__("Return")}
                                            </Link>
                                            ) : (
                                            <div className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                {__("Return completed")}
                                            </div>
                                            )
                                        ) : null}
                                        <Link
                                            href={route(
                                                "transactions.print",
                                                transaction.invoice
                                            )}
                                            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                                        >
                                            {__("Detail")}
                                        </Link>
                                        <a
                                            href={route(
                                                "transactions.public",
                                                transaction.invoice
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                        >
                                            {__("Invoice")}
                                        </a>
                                        {canCreateCrmCampaign && (
                                            <Link
                                                href={route(
                                                    "transactions.share-campaign",
                                                    transaction.id
                                                )}
                                                method="post"
                                                as="button"
                                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                                            >
                                                {__("WA Campaign")}
                                            </Link>
                                        )}
                                        <a
                                            href={route(
                                                "pdf.transactions.shipping",
                                                transaction.invoice
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                        >
                                            {__("Receipt")}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                            {__("No Transactions Yet")}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {hasActiveFilters
                                ? __("No transactions match the filter.")
                                : __("Transactions will appear here.")}
                        </p>
                    </div>
                )}

                {links.length > 3 && <Pagination links={links} />}
            </div>
        </>
    );
};

History.layout = (page) => <DashboardLayout children={page} />;

export default History;
