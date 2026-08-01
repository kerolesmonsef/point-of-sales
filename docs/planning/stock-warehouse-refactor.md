# Stock Model Refactor: Products.stock → product_warehouse pivot

> Status: in progress (branch `feature/stock-warehouse-refactor`)

## Steps

- [x] 1. Migration: drop `stock` from `create_products_table`
- [x] 2. `Warehouse::default()` + Product accessor/hooks (auto-seed pivot on create)
- [x] 3. Rewrite SQL-level readers (dashboard, notifications, reports, controller selects/filters)
- [x] 4. Remove `products.stock` writes from services and controllers
- [x] 5. Update seeders and import
- [x] 6. Update tests and run affected suites
- [ ] 7. Update `docs/desktop.md` and this plan file
> Scope: remove `products.stock` column; make `product_warehouse` the only source of truth; the create-product form requires selecting a warehouse, which the controller seeds as the pivot.
> Design update: `Product` model no longer auto-seeds a default-warehouse pivot via `booted()`. The product-create form (`Dashboard/Products/Create`) requires the user to pick a warehouse; `ProductController::store` expects `warehouse_id` and attaches the pivot with the initial stock. `Product::create(['stock' => X])` no longer works — callers attach the pivot explicitly.

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
- Remove `'stock'` from `$fillable` (column no longer exists).
- Add accessor:
  ```php
  protected function stock(): Attribute
  {
      return Attribute::get(fn () => $this->stockTotal());
  }
  ```
- `$appends = ['stock']` so `toArray()` serializes the aggregate for the frontend.
- `stockTotal()` already exists and sums pivot rows.
- No `booted()` hook: the create-product flow attaches the pivot explicitly in `ProductController::store`.

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
- `create()`: pass active warehouses to the form.
- `store()`: require `warehouse_id`; create the product without `stock`, then `warehouses()->attach($warehouse_id, ['stock' => $stock])`; pass `warehouse_id` to `recordInitialStock`.
- Product update: stock is unchanged (no `stock` in update payload).

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
- `updateOrCreate` without `'stock'`; attach the default-warehouse pivot with the imported stock via `syncWithoutDetaching`.

### `app/Exports/ProductsExport.php`
No change. `$product->stock` reads the accessor.

## Seeders

- `database/seeders/DatabaseSeeder.php`: `seedDefaultWarehouse()` now runs *before* the other seeders (so products have a warehouse to attach to) and only creates the MAIN warehouse (no `insertUsing` from the dropped column).
- `database/seeders/SampleDataSeeder.php`: products attach the default-warehouse pivot with their `stock`; transaction seeding decrements the pivot instead of the column.
- `database/seeders/OperationalCoreSeeder.php`, `FeatureCoverageSeeder.php`: replace `update(['stock' => ...])` with pivot `updateExistingPivot` (default warehouse when none specified).

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
