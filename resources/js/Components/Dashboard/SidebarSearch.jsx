import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { IconSearch, IconCornerDownRight } from "@tabler/icons-react";
import { isSuperAdmin } from "@/Utils/authorization";
import { usePage } from "@inertiajs/react";

function flattenMenu(navigation, auth) {
    const flat = [];
    const superAdmin = isSuperAdmin(auth);
    for (const section of navigation) {
        for (const item of section.details) {
            const canAccess = superAdmin || item.permissions === true;
            if (!canAccess) continue;
            if (item.subdetails) {
                for (const sub of item.subdetails) {
                    const canSub = superAdmin || sub.permissions === true;
                    if (canSub && sub.href) {
                        flat.push({ ...sub, section: section.title });
                    }
                }
            } else if (item.href) {
                flat.push({ ...item, section: section.title });
            }
        }
    }
    return flat;
}

export default function SidebarSearch({ sidebarOpen, navigation, __ }) {
    const { auth } = usePage().props;
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const allItems = useMemo(() => flattenMenu(navigation, auth), [navigation, auth]);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return allItems.filter((item) =>
            __(item.title || "").toLowerCase().includes(q)
        );
    }, [query, allItems, __]);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    if (!sidebarOpen) return null;

    return (
        <div ref={ref} className="relative px-3 py-2">
            <div className="relative">
                <IconSearch
                    size={16}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder="Search by menu..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => query.trim() && setOpen(true)}
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
            </div>

            {open && results.length > 0 && (
                <div className="absolute left-3 right-3 top-full mt-1 z-50 max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/30">
                    {results.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 group"
                            onClick={() => {
                                setOpen(false);
                                setQuery("");
                            }}
                        >
                            <span className="shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:scale-150">
                                {item.icon || <IconCornerDownRight size={16} strokeWidth={1.5} />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{item.title}</div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                    {item.section}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {open && query.trim() && results.length === 0 && (
                <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/30 px-3 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                    No menu found
                </div>
            )}
        </div>
    );
}
