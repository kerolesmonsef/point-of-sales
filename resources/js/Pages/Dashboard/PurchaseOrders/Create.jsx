import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import axios from "axios";
import {
    IconArrowLeft,
    IconCheck,
    IconClipboardList,
    IconLoader2,
    IconPackage,
    IconPlus,
    IconSearch,
    IconShoppingCart,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import { formatCurrency } from '@/Utils/formatCurrency';

const inputClass =
    "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:border-slate-600";

export default function Create({ suppliers, warehouses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: "",
        warehouse_id: "",
        document_number: "",
        notes: "",
        items: [],
    });

    const [searchProduct, setSearchProduct] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            setIsSearching(true);

            try {
                const response = await axios.get(route("purchase-orders.products.search"), {
                    params: {
                        search: searchProduct.trim() || undefined,
                        warehouse_id: data.warehouse_id || undefined,
                    },
                    signal: controller.signal,
                });

                setSearchResults(response.data?.data ?? []);
            } catch (error) {
                if (error.name !== "CanceledError") {
                    setSearchResults([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchProduct, data.warehouse_id]);

    const addItem = (product) => {
        if (data.items.some((i) => i.product_id === product.id)) {
            toast.error(__("Product already in list."));
            return;
        }
        setData("items", [
            ...data.items,
            {
                product_id: product.id,
                product_title: product.title,
                qty_ordered: 1,
                unit_price: Number(product.buy_price) || 0,
            },
        ]);
    };

    const removeItem = (index) => {
        setData(
            "items",
            data.items.filter((_, i) => i !== index)
        );
    };

    const updateItem = (index, key, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], [key]: key === "qty_ordered" ? parseInt(value) || 0 : Number(value) || 0 };
        setData("items", items);
    };

    const submit = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            toast.error(__("Add at least one item."));
            return;
        }
        post(route("purchase-orders.store"), {
            onError: () => toast.error(__("Failed to create purchase order")),
        });
    };

    const total = data.items.reduce((sum, item) => sum + item.qty_ordered * item.unit_price, 0);

    return (
        <>
            <Head title={__("Create Purchase Order")} />
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <Link
                        href={route("purchase-orders.index")}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                    >
                        <IconArrowLeft size={16} />
                        {__("Back to Purchase Order list")}
                    </Link>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                                <IconShoppingCart size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {__("Create Purchase Order")}
                                </h1>
                                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                    {__("Document the goods you plan to order from a supplier.")}
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-700 dark:bg-warning-950/30 dark:text-warning-400">
                            <IconClipboardList size={14} />
                            {__("Draft — not yet ordered")}
                        </span>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                                <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-900 dark:text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                                        <IconClipboardList size={17} />
                                    </span>
                                    {__("Order Details")}
                                </h2>
                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{__("Supplier")}</label>
                                        <select
                                            value={data.supplier_id}
                                            onChange={(e) => setData("supplier_id", e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">{__("Select supplier")}</option>
                                            {suppliers.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{__("Destination Warehouse")}</label>
                                        <select
                                            value={data.warehouse_id}
                                            onChange={(e) => setData("warehouse_id", e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">{__("Select warehouse")}</option>
                                            {warehouses.map((w) => (
                                                <option key={w.id} value={w.id}>{w.code} — {w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{__("Document Number")}</label>
                                        <input
                                            type="text"
                                            value={data.document_number}
                                            onChange={(e) => setData("document_number", e.target.value)}
                                            placeholder={__("Leave blank for auto-generate")}
                                            className={`${inputClass} font-mono`}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{__("Notes")}</label>
                                        <input
                                            type="text"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            placeholder={__("Order notes")}
                                            className={inputClass}
                                        />
                                        {errors.notes && <p className="mt-1.5 text-xs text-danger-500">{errors.notes}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-900 dark:text-white">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                                            <IconPackage size={17} />
                                        </span>
                                        {__("Line Items")}
                                    </h2>
                                    {data.items.length > 0 && (
                                        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
                                            {data.items.length} {data.items.length === 1 ? __("item") : __("items")}
                                        </span>
                                    )}
                                </div>

                                <div className="relative mt-5">
                                    <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchProduct}
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                        placeholder={__("Search products to add...")}
                                        className={`${inputClass} pl-10 pr-10`}
                                    />
                                    {searchProduct && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchProduct("")}
                                            aria-label={__("Clear search")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                        >
                                            <IconX size={16} />
                                        </button>
                                    )}
                                </div>

                                {(searchProduct || searchResults.length > 0 || isSearching) && (
                                    <div className="mt-3 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                        {isSearching && searchResults.length === 0 && (
                                            <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                                                <IconLoader2 size={16} className="animate-spin" />
                                                {__("Searching products...")}
                                            </div>
                                        )}
                                        {searchResults.length > 0 && (
                                            <div className="max-h-52 space-y-1.5 overflow-y-auto">
                                                {searchResults.map((product) => {
                                                    const isAdded = data.items.some((i) => i.product_id === product.id);
                                                    return (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => addItem(product)}
                                                            disabled={isAdded}
                                                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-primary-100 hover:bg-primary-50/60 disabled:cursor-default disabled:opacity-80 disabled:hover:border-transparent disabled:hover:bg-transparent dark:hover:border-primary-900 dark:hover:bg-primary-950/20"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{product.title}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {product.barcode && <span className="font-mono text-slate-400">{product.barcode} · </span>}
                                                                    {__("Stock")}: {product.stock}
                                                                </p>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-3">
                                                                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                                                    {formatCurrency(product.buy_price)}
                                                                </span>
                                                                {isAdded ? (
                                                                    <span className="inline-flex animate-cart-add items-center gap-1 rounded-lg bg-success-100 px-2 py-1 text-xs font-semibold text-success-700 dark:bg-success-950/30 dark:text-success-400">
                                                                        <IconCheck size={14} />
                                                                        {__("Added")}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/30 dark:text-primary-400">
                                                                        <IconPlus size={14} />
                                                                        {__("Add")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {!isSearching && searchResults.length === 0 && searchProduct && (
                                            <div className="py-8 text-center">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {__("No products match")} “{searchProduct}”
                                                </p>
                                            </div>
                                        )}
                                        {!isSearching && searchResults.length === 0 && !searchProduct && (
                                            <div className="py-8 text-center">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {__("No products found")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {data.items.length > 0 ? (
                                    <div className="mt-5 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                                    <th className="px-2 pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{__("Product")}</th>
                                                    <th className="px-2 pb-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{__("Qty")}</th>
                                                    <th className="px-2 pb-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{__("Unit Price")}</th>
                                                    <th className="px-2 pb-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{__("Subtotal")}</th>
                                                    <th className="w-12 px-2 pb-2.5"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {data.items.map((item, index) => (
                                                    <tr key={item.product_id} className="group">
                                                        <td className="px-2 py-3">
                                                            <p className="font-medium text-slate-800 dark:text-slate-200">{item.product_title}</p>
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.qty_ordered}
                                                                onChange={(e) => updateItem(index, "qty_ordered", e.target.value)}
                                                                className="h-10 w-20 rounded-lg border border-slate-300 bg-white px-3 text-right font-mono text-sm text-slate-800 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                                                                className="h-10 w-28 rounded-lg border border-slate-300 bg-white px-3 text-right font-mono text-sm text-slate-800 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-3 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                                                            {formatCurrency(item.qty_ordered * item.unit_price)}
                                                        </td>
                                                        <td className="px-2 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                title={__("Remove item")}
                                                                aria-label={__("Remove item")}
                                                                className="rounded-lg p-1.5 text-slate-300 transition group-hover:text-slate-400 hover:bg-danger-50 hover:text-danger-500 dark:text-slate-600 dark:group-hover:text-slate-400 dark:hover:bg-danger-950/30 dark:hover:text-danger-400"
                                                            >
                                                                <IconTrash size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                                                    <td colSpan={3} className="px-2 py-3.5 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">{__("Total")}</td>
                                                    <td className="px-2 py-3.5 text-right font-mono text-base font-bold text-primary-600 dark:text-primary-400">{formatCurrency(total)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                            <IconPackage size={26} className="text-slate-400" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{__("Your order is empty")}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {__("Search for products above and press Add to include them.")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="xl:sticky xl:top-6 xl:self-start">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {__("Order Summary")}
                                    </p>
                                </div>
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">{__("Line Items")}</span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{data.items.length}</span>
                                    </div>
                                    <div className="my-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700" />
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{__("Grand Total")}</p>
                                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{__("payable to supplier")}</p>
                                        </div>
                                        <p className="font-mono text-2xl font-bold leading-none text-primary-600 dark:text-primary-400">
                                            {formatCurrency(total)}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2.5 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <Button
                                        type="submit"
                                        icon={<IconPlus size={18} />}
                                        className="w-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                                        label={processing ? __("Saving...") : __("Save Purchase Order")}
                                        disabled={processing}
                                    />
                                    <Link
                                        href={route("purchase-orders.index")}
                                        className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        {__("Cancel")}
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
