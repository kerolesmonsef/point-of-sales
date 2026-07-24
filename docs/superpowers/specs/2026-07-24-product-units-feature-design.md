# Product Units Feature Design

Date: 2026-07-24

## Overview

Add multi-unit support to the product creation/edit form. Products can optionally have multiple units (PCS, BOX, KG, etc.), each with its own price, conversion factor, barcode, and SKU suffix. The backend already supports this (`product_units` table, `UnitConversionService`, `TransactionController::addToCart` accepts `unit_id`), but there's no UI to manage it.

## Scope

- Product Create page
- Product Edit page (future — not in this iteration)

## Design

### Component: `ProductUnitsSection`

A new collapsible card below "Pricing & Stock" on the create form. Uses the same card styling as existing sections.

**Collapsed by default** — shows unit count badge:

```
┌──────────────────────────────────────────────┐
│ ▼ Units (Optional)                [2 units]   │
├──────────────────────────────────────────────┤
│ (hidden)                                      │
└──────────────────────────────────────────────┘
```

**Expanded** — table of editable rows:

```
┌──────────────────────────────────────────────┐
│ ▲ Units (Optional)                [2 units]   │
├──────────────────────────────────────────────┤
│                                              │
│  Unit  │ Base │ Conv.  │ Buy    │ Sell   │   │
│ ───────┼──────┼────────┼────────┼────────┤   │
│ [PCS ▼]│  ◉   │   1    │ 4000   │ 5000   │ 🗑│
│ [BOX ▼]│  ○   │  24    │ 85000  │ 110000 │ 🗑│
│                                              │
│  [+ Add Unit]                                │
└──────────────────────────────────────────────┘
```

### Fields per row

| Field | Input type | Required | Notes |
|-------|-----------|----------|-------|
| Unit | Dropdown | Yes | From `units` table (PCS, BOX, KG, etc.) |
| Base | Radio | Yes | Exactly one unit must be base |
| Conv. | Number | Yes | Conversion factor to base unit (min 0.0001) |
| Buy | Number | Yes | Buy price in this unit |
| Sell | Number | Yes | Sell price in this unit |
| Barcode | Text | No | Per-unit barcode |
| SKU suffix | Text | No | Per-unit SKU suffix |

### Behavior

- **Add row**: appends a new empty row below the last
- **Remove row**: deletes the row. If the removed row was the base unit, the first remaining row auto-becomes base
- **Base radio**: clicking sets `is_base=true` on that row and false on others
- **Collapse/expand**: click the card header to toggle. State preserved during form submission if validation fails (Inertia keeps data)

### Backend: validation rules

`ProductController@store` receives optional `units` array:

```php
'units' => 'nullable|array|min:1',
'units.*.unit_id' => 'required|integer|exists:units,id',
'units.*.is_base' => 'required|boolean',
'units.*.conversion_factor' => 'required|numeric|min:0.0001',
'units.*.buy_price' => 'required|integer|min:0',
'units.*.sell_price' => 'required|integer|min:0',
'units.*.barcode' => 'nullable|string|max:100',
'units.*.sku_suffix' => 'nullable|string|max:20',
```

Custom rule: exactly one row must have `is_base = true`. Each `unit_id` must be unique within the array.

### Backend: save logic

After `Product::create(...)`, loop `$request->units` and attach:

```php
foreach ($request->units as $unit) {
    $product->units()->attach($unit['unit_id'], [
        'is_base' => $unit['is_base'],
        'conversion_factor' => $unit['conversion_factor'],
        'buy_price' => $unit['buy_price'],
        'sell_price' => $unit['sell_price'],
        'barcode' => $unit['barcode'] ?? null,
        'sku_suffix' => $unit['sku_suffix'] ?? null,
    ]);
}
```

If no units provided, the product relies on its default `buy_price`/`sell_price` as before.

### Files to create/modify

| File | Change |
|------|--------|
| `resources/js/Components/Products/UnitsSection.jsx` | NEW — the collapsible unit table component |
| `resources/js/Pages/Dashboard/Products/Create.jsx` | Add `units` state, import and render `UnitsSection`, send `units[]` in form data |
| `app/Http/Controllers/Apps/ProductController.php` | Validate `units` array, sync pivot rows after create |

## Out of scope

- Product edit page unit management
- Unit selection in POS product grid (for a later iteration)
- Unit label display in cart panel
