# Stock Model Refactor: Products.stock → product_warehouse pivot

> Status: planned for desktop v1
> Scope: remove `products.stock` column; make `product_warehouse` the only source of truth; enforce ≥1 pivot row per product via an auto default warehouse.

## Why

The existing `products.stock` column is an aggregate that already drifts from the pivot:
- `StockTransferService` touches both pivot and column net-zero, proving the column is meant to be a sum.
- `GoodsReceivingService` decrements `products.stock` on receiving (wrong direction).
- `StockOpnameController` writes both, so they can diverge.

A single-store desktop app does not need visible multi-warehouse features, but it still benefits from a location-aware stock table because:
1. It removes duplicate data and phantom inventory.
2. It fixes the bug where `ProductController::store` creates a product with no pivot row, making it unsellable at POS.
3. It keeps the backend ready for future multi-location expansion without another migration.

## No migration (new product, no customers)

Because this is a new startup product with no production data, we edit the existing migration directly instead of adding a new migration.

## Field/table changes

### `database/migrations/2024_06_13_131744_create_products_table.php`
Remove:
```php
$table->integer('stock')->default(0);
```

### `app/Models/Warehouse.php`
Add helper:
```php
public static function default(): ?self
{
    return self::where('type', 'main')->where('is_active', true)->first()
        ?? self::where('is_active', true)->first();
}
```

### `app/Models/Product.php`
- Remove `'stock'` from `$casts`.
- Keep `'stock'` in `$fillable` so existing `Product::create(['stock' => X])` calls keep compiling.
- Add accessor:
  ```php
  protected function stock(): Attribute
  {
      return Attribute::get(fn () => $this->stockTotal());
  }
  ```
- Add `booted()` hooks:
  - `creating`: read `stock` from attributes, unset it so the INSERT does not reference the dropped column.
  - `created`: attach the default warehouse pivot with the stashed stock (default `0`).
- `stockTotal()` already exists and sums pivot rows.

## Service changes

### `app/Services/StockTransferService.php`
Remove the `products.stock` increment/decrement lines. Keep only pivot updates.

### `app/Services/GoodsReceivingService.php`
Remove `$product->decrement('stock', ...)` line. Keep only pivot increment.

### `app/Services/SupplierReturnService.php`
Remove `$product->decrement('stock', ...)` line. Keep only pivot decrement.

### `app/Services/StockMutationService.php`
`recordInitialStock` reads `$product->stock` via the accessor. Ensure it records the state before the pivot is updated; adjust if needed to avoid `stockBefore === stockAfter`.

## Controller changes

### `app/Http/Controllers/Apps/ProductController.php`
- Keep `$request->stock` in the create payload; the model hook seeds the pivot.
- On product update, if `stock` is provided, update the default-warehouse pivot row.

### `app/Http/Controllers/Apps/TransactionController.php`
- `index()`: remove `'stock'` from the `select()`.
- No-shift fallback filter: use `whereHas('warehouses', fn ($q) => $q->where('warehouse_id', $defaultId)->where('stock', '>', 0))`.
- `store()`: remove `$product->decrement('stock', ...)` calls.

### `app/Http/Controllers/Apps/SalesReturnController.php`
Remove `products.stock` read/update; rely on pivot increment.

### `app/Http/Controllers/Apps/StockOpnameController.php`
Remove `products.stock` read/update; rely on pivot update.

### `app/Http/Controllers/Apps/PurchaseOrderController.php`
### `app/Http/Controllers/Apps/SupplierReturnController.php`
### `app/Http/Controllers/Apps/StockTransferController.php`
Drop `'stock'` from the `select()` list. `$product->stock` (accessor) supplies the value when needed.

### `app/Http/Controllers/DashboardController.php`
Rewrite low-stock and slow-moving widget queries to aggregate from `product_warehouse`.

### `app/Http/Middleware/HandleInertiaRequests.php`
Rewrite low-stock notification query to aggregate from `product_warehouse` (reuse logic from `ReorderService`).

### `app/Http/Controllers/Reports/AdvancedSalesInsightsController.php`
Replace raw `products.stock` selects/filters/order with a `SUM(product_warehouse.stock)` scalar subquery or left join.

## Import/export

### `app/Imports/ProductsImport.php`
- On create: `updateOrCreate` with `'stock'` triggers the model hook → pivot seeded.
- On update: explicitly update the default-warehouse pivot stock.

### `app/Exports/ProductsExport.php`
No change. `$product->stock` reads the accessor.

## Seeders

- `database/seeders/DatabaseSeeder.php`: keep `seedDefaultWarehouse()` to ensure the default warehouse exists.
- `database/seeders/SampleDataSeeder.php`
- `database/seeders/OperationalCoreSeeder.php`
- `database/seeders/FeatureCoverageSeeder.php`

Replace direct `update(['stock' => ...])` / `decrement('stock')` calls with pivot operations, or rely on `Product::create(['stock' => X])` plus the model hook.

## Tests

- Update product helpers if they bypass mass assignment.
- Add focused tests:
  - Creating a product seeds a default-warehouse pivot row.
  - `Product->stock` returns the pivot sum.
  - Stock transfers keep aggregate `stock` unchanged.
- Run affected suites: Products, Transactions, Inventory, SalesReturn, Reports.

## Frontend

- `resources/js/Pages/Dashboard/Transactions/Index.jsx`: POS list already uses active-warehouse pivot stock in `searchProduct`; ensure the index list payload exposes the active-warehouse stock per product.
- Product cards/grids that display `product.stock` continue to work; for single-store, aggregate equals default-warehouse stock.
- Hide or disable Stock Transfer menu item in desktop v1.

## Rollout order

1. Edit `create_products_table` migration to drop `stock`.
2. Add `Warehouse::default()` and Product accessor + hooks.
3. Rewrite SQL-level readers (dashboard, notifications, reports, controller selects/filters).
4. Remove `products.stock` writes from services and controllers.
5. Update seeders and import.
6. Update tests and run affected suites.
7. Update `docs/desktop.md` and this plan file.
