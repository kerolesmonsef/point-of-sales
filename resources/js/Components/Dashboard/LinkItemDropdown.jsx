import React, { useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    IconChevronDown,
    IconChevronUp,
    IconCornerDownRight,
} from "@tabler/icons-react";
import { isSuperAdmin } from "@/Utils/authorization";

export default function LinkItemDropdown({ icon, title, data, access, sidebarOpen, ...props }) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = usePage().props;
    const superAdmin = isSuperAdmin(auth);

    const visibleItems = useMemo(
        () => data.filter((item) => superAdmin || item.permissions === true),
        [data, superAdmin]
    );

    const canRenderParent = superAdmin || access === true || visibleItems.length > 0;

    const hasActiveChild = useMemo(
        () => visibleItems.some((item) => url.startsWith(new URL(item.href).pathname)),
        [visibleItems, url]
    );

    if (!canRenderParent || visibleItems.length === 0) {
        return null;
    }

    const activeParentClasses = hasActiveChild
        ? "bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-l-[3px] border-primary-500"
        : "text-gray-500 hover:border-r-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:border-r-gray-50 dark:hover:text-gray-100 border-l-[3px] border-transparent hover:bg-slate-100 dark:hover:bg-slate-800";

    const buttonClass = sidebarOpen
        ? `min-w-full flex items-center font-medium gap-x-3.5 px-4 py-3 hover:border-r-2 capitalize hover:cursor-pointer text-sm justify-between transition-all duration-200 group ${activeParentClasses}`
        : "min-w-full flex justify-center py-3 hover:border-r-2 hover:cursor-pointer text-gray-500 hover:border-r-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:border-r-gray-50 dark:hover:text-gray-100 group";

    return (
        <>
            <button className={buttonClass} onClick={() => setIsOpen(!isOpen)}>
                {sidebarOpen ? (
                    <>
                        <div className="flex items-center gap-x-3.5">
                            <span className="transition-transform duration-200 group-hover:scale-125 inline-flex">{icon}</span>
                            {title}
                        </div>
                        {isOpen ? (
                            <IconChevronUp size={18} strokeWidth={1.5} />
                        ) : (
                            <IconChevronDown size={18} strokeWidth={1.5} />
                        )}
                    </>
                ) : !isOpen ? (
                    <span className="transition-transform duration-200 group-hover:scale-125 inline-flex">{icon}</span>
                ) : (
                    <IconChevronDown size={20} strokeWidth={1.5} />
                )}
            </button>

            {isOpen &&
                visibleItems.map((item, index) => {
                    const isSubActive = url.startsWith(new URL(item.href).pathname);
                    return (
                    <Link
                        key={index}
                        href={item.href}
                        className={`${
                            sidebarOpen
                                ? `min-w-full flex items-center font-medium gap-x-3.5 px-5 py-3 capitalize hover:cursor-pointer text-sm line-clamp-1 transition-all duration-200 group ${
                                    isSubActive
                                        ? "bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-l-[3px] border-primary-500"
                                        : "text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100 border-l-[3px] border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                  }`
                                : "min-w-full flex justify-center py-3 hover:border-r-2 hover:cursor-pointer text-gray-500 hover:border-r-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:border-r-gray-50 dark:hover:text-gray-100 group"
                        }`}
                        {...props}
                    >
                        {sidebarOpen ? (
                            <>
                                <span className="transition-transform duration-200 group-hover:scale-125 inline-flex">
                                    <IconCornerDownRight
                                        size={18}
                                        strokeWidth={1.5}
                                    />
                                </span>
                                {item.title}
                            </>
                        ) : (
                            <span className="transition-transform duration-200 group-hover:scale-125 inline-flex">{item.icon}</span>
                        )}
                    </Link>
                    );
                })}
        </>
    );
}
