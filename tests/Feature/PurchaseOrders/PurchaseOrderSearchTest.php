<?php

namespace Tests\Feature\PurchaseOrders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PurchaseOrderSearchTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $userWithoutAccess;

    private Category $category;

    private Warehouse $warehouseA;

    private Warehouse $warehouseB;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'purchase-orders-create', 'guard_name' => 'web']);

        $this->admin = User::factory()->create();
        $this->admin->givePermissionTo('purchase-orders-create');
        $this->userWithoutAccess = User::factory()->create();

        $this->category = Category::create(['name' => 'Electronics', 'description' => 'Category', 'image' => 'default.png']);

        $this->warehouseA = Warehouse::create([
            'code' => 'WH-A', 'name' => 'Warehouse A',
            'type' => 'main', 'is_active' => true, 'sort_order' => 0,
        ]);
        $this->warehouseB = Warehouse::create([
            'code' => 'WH-B', 'name' => 'Warehouse B',
            'type' => 'branch', 'is_active' => true, 'sort_order' => 1,
        ]);
    }

    private function createProduct(array $attributes, array $stocks): Product
    {
        $product = Product::create($attributes + [
            'description' => 'Description',
            'category_id' => $this->category->id,
            'buy_price' => 10000,
            'sell_price' => 15000,
            'image' => 'default.jpg',
        ]);

        foreach ($stocks as $warehouseId => $stock) {
            $product->warehouses()->attach($warehouseId, ['stock' => $stock]);
        }

        return $product;
    }

    public function test_user_without_permission_cannot_search_products(): void
    {
        $this->actingAs($this->userWithoutAccess)
            ->getJson(route('purchase-orders.products.search'))
            ->assertForbidden();
    }

    public function test_search_products_by_title_and_barcode(): void
    {
        $this->createProduct(['title' => 'USB Cable', 'barcode' => 'BRC-USB'], [$this->warehouseA->id => 12]);
        $this->createProduct(['title' => 'HDMI Cable', 'barcode' => 'BRC-HDMI'], [$this->warehouseA->id => 5]);
        $this->createProduct(['title' => 'Keyboard', 'barcode' => 'BRC-KBD'], [$this->warehouseA->id => 3]);

        $this->actingAs($this->admin)
            ->getJson(route('purchase-orders.products.search', ['search' => 'cable']))
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.title', 'HDMI Cable')
            ->assertJsonPath('data.0.stock', 5)
            ->assertJsonPath('data.1.title', 'USB Cable');

        $this->actingAs($this->admin)
            ->getJson(route('purchase-orders.products.search', ['search' => 'BRC-KBD']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Keyboard')
            ->assertJsonPath('data.0.buy_price', 10000);
    }

    public function test_warehouse_specific_stock_is_returned(): void
    {
        $product = $this->createProduct(['title' => 'Mouse', 'barcode' => 'BRC-MSE'], [
            $this->warehouseA->id => 20,
            $this->warehouseB->id => 7,
        ]);

        $this->actingAs($this->admin)
            ->getJson(route('purchase-orders.products.search', ['search' => 'mouse', 'warehouse_id' => $this->warehouseB->id]))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $product->id)
            ->assertJsonPath('data.0.stock', 7);
    }

    public function test_empty_search_returns_products_limited_to_fifty(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $this->createProduct(['title' => "Product {$i}", 'barcode' => "BRC-{$i}"], [$this->warehouseA->id => 1]);
        }

        $this->actingAs($this->admin)
            ->getJson(route('purchase-orders.products.search'))
            ->assertOk()
            ->assertJsonCount(50, 'data');
    }
}
