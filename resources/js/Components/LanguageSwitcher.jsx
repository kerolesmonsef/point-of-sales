import React, { useState, useRef, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { IconLanguage, IconCheck } from "@tabler/icons-react";

const locales = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
];

export default function LanguageSwitcher() {
    const { locale } = usePage().props;
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-touch min-h-touch flex items-center justify-center"
                title="Language"
            >
                <IconLanguage size={20} className="text-slate-500" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {locales.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => {
                                router.post(route("language.switch"), { locale: l.code }, {
                                    onSuccess: () => window.location.reload(),
                                });
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="flex-1 text-left">{l.label}</span>
                            {locale === l.code && (
                                <IconCheck size={16} className="text-primary-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
