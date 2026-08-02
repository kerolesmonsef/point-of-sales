import React from "react";
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from "@tabler/icons-react";

export default function UnitsSection({ units = [], onChange, unitOptions = [] }) {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  const addRow = () => {
    onChange([
      ...units,
      {
        unit_id: "",
        is_base: units.length === 0,
        conversion_factor: "1",
        buy_price: "",
        sell_price: "",
        barcode: "",
      },
    ]);
  };

  const removeRow = (i) => {
    const next = units.filter((_, idx) => idx !== i);
    if (i === 0 && next.length > 0 && units[0]?.is_base) {
      next[0].is_base = true;
    }
    onChange(next);
  };

  const updateRow = (i, field, value) => {
    const next = units.map((u, idx) => {
      if (idx !== i) return u;
      return { ...u, [field]: value };
    });
    if (field === "is_base" && value === true) {
      next.forEach((u, idx) => {
        if (idx !== i) u.is_base = false;
      });
    }
    onChange(next);
  };

  const baseUnit = units.find((u) => u.is_base);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <button type="button" onClick={toggle} className="w-full flex items-center justify-between text-left">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          {__("Units")} <span className="text-xs font-normal text-slate-400">({__("Optional")})</span>
          {units.length > 0 && (
            <span className="text-xs font-normal text-slate-400">
              {units.length} {__("unit")}{units.length > 1 ? "s" : ""}
            </span>
          )}
        </h3>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {units.length === 0 && (
            <p className="text-sm text-slate-400">{__("No units defined. Product will use default prices.")}</p>
          )}

          {units.map((unit, i) => (
            <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3 relative">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {__("Unit")} {i + 1}
                  {unit.is_base && (
                    <span className="ml-2 text-xs text-primary-600 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full">
                      {__("Base")}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/50 transition-colors"
                >
                  <IconTrash size={16} />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Unit")}</label>
                  <select
                    value={unit.unit_id}
                    onChange={(e) => updateRow(i, "unit_id", e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="">{__("Select unit")}</option>
                    {unitOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Base")}</label>
                  <input
                    type="radio"
                    name="base_unit"
                    checked={unit.is_base}
                    onChange={() => updateRow(i, "is_base", true)}
                    className="mt-2.5 accent-primary-500"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Conv.")}</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={unit.conversion_factor}
                    onChange={(e) => updateRow(i, "conversion_factor", e.target.value)}
                    placeholder="1"
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Buy Price")}</label>
                  <input
                    type="number"
                    min="0"
                    value={unit.buy_price}
                    onChange={(e) => updateRow(i, "buy_price", e.target.value)}
                    placeholder="0"
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Sell Price")}</label>
                  <input
                    type="number"
                    min="0"
                    value={unit.sell_price}
                    onChange={(e) => updateRow(i, "sell_price", e.target.value)}
                    placeholder="0"
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{__("Barcode")}</label>
                  <input
                    type="text"
                    value={unit.barcode}
                    onChange={(e) => updateRow(i, "barcode", e.target.value)}
                    placeholder={__("Optional")}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all font-medium"
          >
            <IconPlus size={16} />
            {__("Add Unit")}
          </button>

          {units.length > 0 && !baseUnit && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {__("Select one unit as the base unit for stock tracking.")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
