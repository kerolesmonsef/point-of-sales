import React, { useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconPrinter,
    IconReceipt,
    IconFileInvoice,
    IconTruck,
    IconShare,
} from "@tabler/icons-react";
import ThermalReceipt, {
    ThermalReceipt58mm,
} from "@/Components/Receipt/ThermalReceipt";
import ShippingLabel from "@/Components/Receipt/ShippingLabel";
import { formatCurrency } from '@/Utils/formatCurrency';

export default function Print({ transaction }) {
    const { storeProfile } = usePage().props;
    const [printMode, setPrintMode] = useState("invoice"); // 'invoice' | 'thermal80' | 'thermal58'

    const formatDateTime = (value) =>
        new Date(value).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const items = transaction?.details ?? [];
    const promoDiscountTotal = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + Number(item.discount_total || 0),
                0
            ),
        [items]
    );
    const loyaltyDiscountTotal = Number(
        transaction?.loyalty_discount_total || 0
    );
    const voucherDiscountTotal = Number(
        transaction?.customer_voucher_discount || 0
    );
    const baseSubtotal =
        (transaction?.grand_total || 0) +
        (transaction?.discount || 0) -
        (transaction?.shipping_cost || 0) -
        (transaction?.tax_total || 0) +
        promoDiscountTotal +
        loyaltyDiscountTotal +
        voucherDiscountTotal;

    const store = useMemo(
        () => ({
            name: storeProfile?.name || __("Your Store"),
            logo: storeProfile?.logo || null,
            address: storeProfile?.address || "",
            phone: storeProfile?.phone || "",
            email: storeProfile?.email || "",
            website: storeProfile?.website || "",
        }),
        [storeProfile]
    );

    const paymentLabels = {
        cash: __("Cash"),
        card: __("Card"),
        pay_later: __("Receivable"),
    };
    const paymentMethodKey = (
        transaction?.payment_method || "cash"
    ).toLowerCase();
    const paymentMethodLabel = paymentLabels[paymentMethodKey] ?? __("Cash");

    const paymentStatuses = {
        paid: __("Paid"),
        unpaid: __("Unpaid"),
        partial: __("Partial"),
        failed: __("Failed"),
        expired: __("Expired"),
    };
    const paymentStatusKey = (transaction?.payment_status || "").toLowerCase();
    const paymentStatusLabel =
        paymentStatuses[paymentStatusKey] ??
        (paymentMethodKey === "cash" ? __("Paid") : __("Paid"));

    const statusColors = {
        paid: "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400",
        unpaid:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        partial:
            "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400",
        failed: "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400",
        expired:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    };
    const paymentStatusColor =
        statusColors[paymentStatusKey] ?? statusColors.paid;

    const handlePrint = () => {
        window.print();
    };

    const SimpleBarcode = ({ value }) => {
        const bars = useMemo(() => {
            const data = value || "";
            return data.split("").map((char, idx) => {
                const weight = (char.charCodeAt(0) + idx * 17) % 5;
                return 2 + weight; // 2-6px width
            });
        }, [value]);
        const totalWidth = bars.reduce((acc, w) => acc + w, 0);
        const targetWidth = 180; // px target
        const scale = totalWidth ? Math.min(2.2, targetWidth / totalWidth) : 1;

        return (
            <div className="flex items-end gap-[2px] mt-4">
                {bars.map((w, i) => (
                    <span
                        key={i}
                        style={{ width: `${w * scale}px` }}
                        className="h-10 sm:h-14 bg-slate-800 dark:bg-slate-100 block"
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title={__("Sales Invoice")} />

            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 print:bg-white print:p-0">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
                        <Link
                            href={route("transactions.index")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <IconArrowLeft size={18} />
                            {__("Back to register")}
                        </Link>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            {/* Print Mode Selector */}
                            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto">
                                <button
                                    onClick={() => setPrintMode("invoice")}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode === "invoice"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconFileInvoice
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    {__("Invoice")}
                                </button>
                                <button
                                    onClick={() => setPrintMode("thermal80")}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode === "thermal80"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    {__("Receipt 80mm")}
                                </button>
                                <button
                                    onClick={() => setPrintMode("thermal58")}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode === "thermal58"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    {__("Receipt 58mm")}
                                </button>
                                <button
                                    onClick={() => setPrintMode("shipping")}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode === "shipping"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconTruck
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    {__("Shipping Label")}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(route("pdf.transactions.thermal", transaction.invoice));
                                        const html = await res.text();
                                        const blob = new Blob([html], { type: "text/html" });
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, "_blank", "width=400,height=600");
                                    } catch (e) {
                                        alert(__("Failed to print thermal: ") + e.message);
                                    }
                                }}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                            >
                                <IconPrinter size={18} />
                                {__("Thermal")}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const url = route("portal.transaction", [transaction.invoice, { token: transaction.access_token }]);
                                    navigator.clipboard?.writeText(window.location.origin + "/" + url.replace(/^\/+/, ""));
                                    alert(__("Invoice link copied"));
                                }}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                            >
                                <IconShare size={18} />
                                {__("Share")}
                            </button>

                            {printMode === "invoice" && (
                                <a
                                    href={route("pdf.transactions.invoice", transaction.invoice)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-colors w-full sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                        {__("PDF Invoice")}
                                </a>
                            )}

                            {(printMode === "thermal80" || printMode === "thermal58") && (
                                <a
                                    href={route("pdf.transactions.receipt", {
                                        invoice: transaction.invoice,
                                        size: printMode === "thermal58" ? "58" : "80",
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-sm font-semibold text-white transition-colors w-full sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                    {__("PDF Receipt")} {printMode === "thermal58" ? "58mm" : "80mm"}
                                </a>
                            )}

                            {printMode === "shipping" && (
                                <a
                                    href={route("pdf.transactions.shipping", transaction.invoice)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors w-full sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                            {__("PDF Receipt")}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Thermal Receipt Preview */}
                    {(printMode === "thermal80" || printMode === "thermal58") && (
                        <div className="flex justify-center print:block">
                            <div className="bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 print:shadow-none print:border-0 print:p-0 print:rounded-none">
                                {printMode === "thermal80" ? (
                                    <ThermalReceipt
                                        transaction={transaction}
                                        storeName={store.name}
                                        storeAddress={store.address}
                                        storePhone={store.phone}
                                        storeEmail={store.email}
                                        storeWebsite={store.website}
                                    />
                                ) : (
                                    <ThermalReceipt58mm
                                        transaction={transaction}
                                        storeName={store.name}
                                        storePhone={store.phone}
                                        storeEmail={store.email}
                                        storeWebsite={store.website}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shipping Label Preview */}
{printMode === "shipping" && (
    <div className="flex justify-center items-center py-10 print:py-0 print:block">
        <div className="w-full max-w-[150mm] mx-auto transition-all duration-300 transform scale-100 md:scale-110 lg:scale-125 print:scale-100">
            <ShippingLabel
                transaction={transaction}
                store={store}
            />
        </div>
    </div>
)}

                    {/* Invoice View */}
                    {printMode === "invoice" && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl print:shadow-none print:border-slate-300">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-4 sm:px-6 py-5 sm:py-6 text-white print:bg-slate-100 print:text-slate-900">
                                <div className="flex flex-col items-center text-center gap-4 sm:gap-5 sm:grid sm:grid-cols-[1.4fr,1fr] sm:text-left sm:items-start">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 min-w-0">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-1 flex-shrink-0">
                                            {store.logo ? (
                                                <img
                                                    src={store.logo}
                                                    alt={store.name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-white print:text-slate-800">
                                                    {store.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-white print:text-slate-800 space-y-1 min-w-0 text-center sm:text-left">
                                            <p className="text-base sm:text-lg font-bold leading-tight">
                                                {store.name}
                                            </p>
                                            {store.address && (
                                                <p className="text-[11px] sm:text-xs opacity-90 leading-snug break-words">
                                                    {store.address}
                                                </p>
                                            )}
                                            {(store.phone ||
                                                store.email ||
                                                store.website) && (
                                                <p className="text-[11px] sm:text-xs opacity-90 space-x-2 leading-snug flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1">
                                                    {store.phone && (
                                                        <span>
                                                            {__("Telp")}: {store.phone}
                                                        </span>
                                                    )}
                                                    {store.email && (
                                                        <span>
                                                            {__("Email")}: {store.email}
                                                        </span>
                                                    )}
                                                    {store.website && (
                                                        <span>{store.website}</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center sm:text-right">
                                        <div className="inline-flex flex-col items-center sm:items-end bg-white/5 print:bg-transparent rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[180px] sm:min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-end">
                                                <IconReceipt size={20} className="sm:w-6 sm:h-6" />
                                                <span className="text-xs sm:text-sm font-medium opacity-90 print:opacity-100">
                                                    {__("INVOICE")}
                                                </span>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold leading-tight">
                                                {transaction.invoice}
                                            </p>
                                            <p className="text-xs sm:text-sm opacity-80 print:opacity-100 mt-1">
                                                {formatDateTime(
                                                    transaction.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-3 sm:p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                        {__("Customer")}
                                    </p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {transaction.customer?.name ?? __("General")}
                                    </p>
                                    {transaction.customer?.address && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {transaction.customer.address}
                                        </p>
                                    )}
                                    {transaction.customer?.phone && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {transaction.customer.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-3 sm:p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                        {__("Cashier")}
                                    </p>
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {transaction.cashier?.name ?? "-"}
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${paymentStatusColor}`}
                                            >
                                                {paymentStatusLabel}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {paymentMethodLabel}
                                            </span>
                                            {transaction.payment_method ===
                                                "pay_later" &&
                                                transaction.receivable && (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                                        {__("Due date:")}{" "}
                                                        {transaction.receivable
                                                            ?.due_date || "-"}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>


                        
                            {/* Items Table */}
                            <div className="px-4 sm:px-6 py-6">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[620px] text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {__("Product")}
                                                </th>
                                                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {__("Price")}
                                                </th>
                                                <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {__("Qty")}
                                                </th>
                                                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {__("Subtotal")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {items.map((item, index) => {
                                                const quantity =
                                                    Number(item.qty) || 1;
                                                const subtotal =
                                                    Number(item.price) || 0;
                                                const unitPrice =
                                                    Number(
                                                        item.unit_price || 0
                                                    ) || subtotal / quantity;
                                                const baseUnitPrice =
                                                    Number(
                                                        item.base_unit_price || 0
                                                    ) || unitPrice;
                                                const hasPromo =
                                                    Number(
                                                        item.discount_total || 0
                                                    ) > 0 &&
                                                    baseUnitPrice > unitPrice;

                                                return (
                                                    <tr
                                                        key={item.id ?? index}
                                                        className={
                                                            index % 2 === 0
                                                                ? "bg-slate-50/60 dark:bg-slate-800/30"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="py-3">
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {
                                                                    item.product
                                                                        ?.title
                                                                }
                                                            </p>
                                                            {hasPromo && (
                                                                <p className="text-xs font-medium text-rose-500 dark:text-rose-400">
                                                                    {item.pricing_group_label ||
                                                                        item.pricing_rule_name ||
                                                                        __("Active promo")}
                                                                </p>
                                                            )}
                                                            {item.product
                                                                ?.barcode && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {
                                                                        item.product
                                                                            .barcode
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                                            <div>
                                                                {hasPromo && (
                                                                    <p className="text-xs text-slate-400 line-through">
                                                                        {formatCurrency(
                                                                            baseUnitPrice
                                                                        )}
                                                                    </p>
                                                                )}
                                                                <p>
                                                                    {formatCurrency(
                                                                        unitPrice
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                                                            {quantity}
                                                        </td>
                                                        <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                            {formatCurrency(
                                                                subtotal
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-6">
                                <div className="max-w-xs ml-auto space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>{__("Subtotal")}</span>
                                        <span>{formatCurrency(baseSubtotal)}</span>
                                    </div>
                                    {promoDiscountTotal > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>{__("Auto Promo")}</span>
                                            <span>
                                                -{" "}
                                                {formatCurrency(
                                                    promoDiscountTotal
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>{__("Manual Discount")}</span>
                                        <span>
                                            -{" "}
                                            {formatCurrency(transaction.discount)}
                                        </span>
                                    </div>
                                    {transaction.shipping_cost > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>{__("Shipping Cost")}</span>
                                            <span>
                                                +{" "}
                                                {formatCurrency(
                                                    transaction.shipping_cost
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {transaction.tax_total > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>{__("PPN")} {transaction.tax_rate ? Number(transaction.tax_rate).toFixed(0) : "11"}%</span>
                                            <span>
                                                +{" "}
                                                {formatCurrency(transaction.tax_total)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>{__("Total")}</span>
                                    <span>
                                        {formatCurrency(
                                            transaction.grand_total
                                        )}
                                    </span>
                                    </div>
                                    {paymentMethodKey === "cash" && (
                                        <>
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2">
                                                <span>{__("Cash")}</span>
                                                <span>
                                                    {formatCurrency(
                                                        transaction.cash
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-success-600 dark:text-success-400 font-medium">
                                                <span>{__("Change")}</span>
                                                <span>
                                                    {formatCurrency(
                                                        transaction.change
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Barcode + Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Invoice: {transaction.invoice}
                                </p>
                                <SimpleBarcode value={transaction.invoice} />
                                <div className="text-center mt-4">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {__("Thank you for shopping")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
