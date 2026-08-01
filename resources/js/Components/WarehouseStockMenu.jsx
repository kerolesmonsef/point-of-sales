import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    IconBuildingWarehouse,
    IconChevronDown,
} from "@tabler/icons-react";

const POPOVER_WIDTH = 236;
const GAP = 6;
const EDGE = 8;

function stockBadgeClass(stock) {
    if (stock === 0) {
        return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    }
    if (stock <= 5) {
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400";
    }
    return "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400";
}

export default function WarehouseStockMenu({
    product,
    label = __("Stock"),
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    const warehouses = product?.warehouses ?? [];
    const total = warehouses.reduce(
        (sum, w) => sum + Number(w.pivot?.stock ?? 0),
        0
    );

    if (warehouses.length === 0) {
        return null;
    }

    const toggle = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setOpen((o) => !o);
    };

    useLayoutEffect(() => {
        if (!open) {
            return;
        }
        const el = triggerRef.current;
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const estHeight = Math.min(warehouses.length, 4) * 33 + 76;
        let top = rect.bottom + GAP;
        if (top + estHeight > vh - EDGE) {
            top = Math.max(EDGE, rect.top - estHeight - GAP);
        }
        let left = rect.right - POPOVER_WIDTH;
        if (left < EDGE) {
            left = rect.left;
        }
        if (left + POPOVER_WIDTH > vw - EDGE) {
            left = vw - EDGE - POPOVER_WIDTH;
        }
        setPos({ top, left });
    }, [open, warehouses.length]);

    useEffect(() => {
        if (!open) {
            return;
        }
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open]);

    return (
        <>
            <span
                ref={triggerRef}
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={open}
                title={__("Stock by warehouse")}
                onClick={toggle}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpen((o) => !o);
                    }
                }}
                className={`inline-flex items-center gap-1 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
                    label ? "px-2" : "px-1"
                } ${className}`}
            >
                {label && (
                    <span className="text-[11px] font-medium whitespace-nowrap">
                        {label}
                    </span>
                )}
                {label && (
                    <span
                        className={`px-1.5 py-px rounded-md text-[10px] font-bold leading-none shrink-0 ${
                            total > 0
                                ? "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400"
                                : "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400"
                        }`}
                    >
                        {total}
                    </span>
                )}
                <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </span>

            {open &&
                createPortal(
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={toggle} />
                        <div
                            className="fixed z-[61]"
                            style={{
                                top: pos.top,
                                left: pos.left,
                                width: POPOVER_WIDTH,
                            }}
                        >
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/30 animate-slide-up overflow-hidden">
                                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                    <IconBuildingWarehouse
                                        size={15}
                                        className="text-primary-500 shrink-0"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                                        {__("Stock by warehouse")}
                                    </span>
                                </div>
                                <div className="max-h-44 overflow-y-auto scrollbar-thin divide-y divide-slate-50 dark:divide-slate-800">
                                    {warehouses.map((w) => (
                                        <div
                                            key={w.id}
                                            className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {w.code && (
                                                    <span className="px-1 py-px rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                                        {w.code}
                                                    </span>
                                                )}
                                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                                    {w.name}
                                                </span>
                                            </div>
                                            <span
                                                className={`px-1.5 py-px rounded-md text-xs font-semibold shrink-0 ${stockBadgeClass(
                                                    Number(w.pivot?.stock ?? 0)
                                                )}`}
                                            >
                                                {Number(w.pivot?.stock ?? 0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {__("Total")}
                                    </span>
                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                        {total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
}
