import React, { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { useAuthorization } from "@/Utils/authorization";
import {
    IconCreditCard,
    IconDeviceFloppy,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function Payment({
    setting,
    supportedGateways = [],
}) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canUpdatePaymentSettings = can("payment-settings-update");

    const { data, setData, put, errors, processing } = useForm({
        default_gateway: setting?.default_gateway ?? "cash",
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.payments.update"), { preserveScroll: true });
    };

    return (
        <>
            <Head title={__("Payment Settings")} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconCreditCard size={28} className="text-primary-500" />
                    {__("Payment Gateway Settings")}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {__("Configure payment methods and gateways")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {/* Default Gateway */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        💳 {__("Default Gateway")}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {__("Default payment gateway used by cashier when opening transaction page.")}
                    </p>
                    {!canUpdatePaymentSettings && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                            {__("You only have read access. Changing payment settings requires update permission and password confirmation.")}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {__("Select Gateway")}
                        </label>
                        <select
                            value={data.default_gateway}
                            onChange={(e) =>
                                setData("default_gateway", e.target.value)
                            }
                            disabled={!canUpdatePaymentSettings}
                            className="w-full h-11 px-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        >
                            {supportedGateways.map((gw) => (
                                <option
                                    key={gw.value}
                                    value={gw.value}
                                >
                                    {gw.label}
                                </option>
                            ))}
                        </select>
                        {errors?.default_gateway && (
                            <small className="text-xs text-danger-500 mt-1">
                                {errors.default_gateway}
                            </small>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || !canUpdatePaymentSettings}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={18} />
                        {processing ? __("Saving...") : __("Save Configuration")}
                    </button>
                </div>
            </form>
        </>
    );
}

Payment.layout = (page) => <DashboardLayout children={page} />;
