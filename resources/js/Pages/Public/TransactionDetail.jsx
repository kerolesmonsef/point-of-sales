import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { formatCurrency } from '@/Utils/formatCurrency';

const formatDate = (v) => v ? new Date(v).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" }) : "-";

const statusBadge = (status) => {
    const styles = { paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", unpaid: "bg-rose-100 text-rose-700", pending_approval: "bg-slate-100 text-slate-700" };
    const labels = { paid: __("Paid"), pending: __("Pending"), unpaid: __("Unpaid"), pending_approval: __("Pending Approval") };
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600"}`}>{labels[status] || status}</span>;
};

export default function TransactionDetail({ transaction, token }) {
    return (
        <>
            <Head title={`Invoice ${transaction.invoice}`} />
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-5 text-white text-center">
                        <p className="text-sm opacity-80">INVOICE</p>
                        <p className="text-xl font-bold mt-1">{transaction.invoice}</p>
                        <p className="text-sm opacity-80 mt-1">{formatDate(transaction.created_at)}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">{__("Status")}</span>
                            {statusBadge(transaction.payment_status)}
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Item</p>
                            {transaction.details.map((item, i) => (
                                <div key={i} className="flex justify-between py-1.5 text-sm">
                                    <span className="text-slate-700">{item.product_title} x{item.qty}</span>
                                    <span className="font-medium">{formatCurrency(item.price)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(transaction.grand_total + transaction.discount - (transaction.shipping_cost || 0) - (transaction.tax_total || 0))}</span></div>
                            {transaction.discount > 0 && <div className="flex justify-between text-slate-500"><span>{__("Discount")}</span><span>-{formatCurrency(transaction.discount)}</span></div>}
                            {transaction.tax_total > 0 && <div className="flex justify-between text-slate-500"><span>{__("Tax")}</span><span>{formatCurrency(transaction.tax_total)}</span></div>}
                            {transaction.shipping_cost > 0 && <div className="flex justify-between text-slate-500"><span>{__("Shipping")}</span><span>{formatCurrency(transaction.shipping_cost)}</span></div>}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                                <span>{__("Total")}</span>
                                <span className="text-primary-600">{formatCurrency(transaction.grand_total)}</span>
                            </div>
                        </div>

                        {transaction.payment_method === "cash" && transaction.cash > 0 && (
                            <div className="border-t border-slate-100 pt-4 space-y-1.5 text-sm">
                                <div className="flex justify-between text-slate-500"><span>{__("Cash")}</span><span>{formatCurrency(transaction.cash)}</span></div>
                                {transaction.change > 0 && <div className="flex justify-between text-slate-500"><span>{__("Change")}</span><span>{formatCurrency(transaction.change)}</span></div>}
                            </div>
                        )}

                        {transaction.receivable && transaction.receivable.status !== "paid" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <p className="text-sm font-semibold text-amber-800">{__("Remaining Payment")}</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-700">{__("Due date:")} {formatDate(transaction.receivable.due_date)}</span>
                                    <span className="font-bold text-amber-900">{formatCurrency(transaction.receivable.remaining)}</span>
                                </div>
                                <a
                                    href={route("portal.receivable.pay", [transaction.receivable.id, { token }])}
                                    as="button"
                                    method="post"
                                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const form = document.createElement("form");
                                        form.method = "POST";
                                        form.action = route("portal.receivable.pay", [transaction.receivable.id, { token }]);
                                        document.body.appendChild(form);
                                        form.submit();
                                    }}
                                >
                                    {__("Pay Now")}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-400">
                        {__("Thank you for shopping")}
                    </div>
                </div>
            </div>
        </>
    );
}

TransactionDetail.layout = (page) => <GuestLayout children={page} />;
