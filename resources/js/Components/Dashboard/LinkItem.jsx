import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { isSuperAdmin } from "@/Utils/authorization";

export default function LinkItem({
    href,
    icon,
    access,
    title,
    sidebarOpen,
    ...props
}) {
    const { url } = usePage();
    const { auth } = usePage().props;

    const isActive = url.startsWith(new URL(href).pathname);
    const canAccess = isSuperAdmin(auth) || access === true;

    if (!canAccess) return null;

    const baseClasses = `
        flex items-center gap-3
        transition-all duration-200
        text-slate-600 dark:text-slate-400
    `;

    const activeClasses = isActive
        ? "bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-l-[3px] border-primary-500"
        : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-[3px] border-transparent";

    if (sidebarOpen) {
        return (
            <Link
                href={href}
                className={`${baseClasses} ${activeClasses} px-4 py-2.5 text-sm font-medium group`}
                {...props}
            >
                <span
                    className={`transition-transform duration-200 group-hover:scale-150 ${
                        isActive ? "text-primary-600 dark:text-primary-400" : ""
                    }`}
                >
                    {icon}
                </span>
                <span className="truncate">{title}</span>
            </Link>
        );
    }

    // Collapsed sidebar
    return (
        <Link
            href={href}
            className={`
                w-full flex justify-center py-3
                transition-all duration-200 group
                ${
                    isActive
                        ? "text-primary-600 dark:text-primary-400 bg-slate-100 dark:bg-slate-800"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
            `}
            title={title}
            {...props}
        >
            <span className="transition-transform duration-200 group-hover:scale-150 inline-flex">
                {icon}
            </span>
        </Link>
    );
}
