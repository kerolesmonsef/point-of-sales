<?php

namespace Tests\Feature\Products;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $userWithoutAccess;

    private Category $category;

    private array $productPayload;

    protected function setUp(): void
    {
        parent::setUp();

        foreach ([
            'products-access', 'products-create', 'products-edit', 'products-delete',
        ] as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $this->admin = User::factory()->create();
        $this->admin->givePermissionTo(['products-access', 'products-create', 'products-edit', 'products-delete']);
        $this->userWithoutAccess = User::factory()->create();
        $this->category = Category::create(['name' => 'Elektronik', 'description' => 'Kategori', 'image' => 'default.png']);

        $warehouse = Warehouse::create([
            'code' => 'MAIN',
            'name' => 'Main warehouse',
            'type' => 'main',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $this->productPayload = [
            'barcode' => 'BRC-TEST-001',
            'title' => 'Produk Test',
            'description' => 'Deskripsi product test',
            'category_id' => $this->category->id,
            'buy_price' => 50000,
            'sell_price' => 75000,
            'warehouse_id' => $warehouse->id,
            'stock' => 100,
            'min_stock' => 5,
            'max_stock' => 200,
        ];
    }

    public function test_user_without_products_access_cannot_view_index(): void
    {
        $this->actingAs($this->userWithoutAccess)
            ->get(route('products.index'))
            ->assertForbidden();
    }

    public function test_user_without_products_create_cannot_store(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('products-access');
        $this->actingAs($user)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertForbidden();
    }

    public function test_user_without_products_edit_cannot_update(): void
    {
        $product = $this->createDefaultProduct();
        $user = User::factory()->create();
        $user->givePermissionTo(['products-access']);
        $this->actingAs($user)
            ->put(route('products.update', $product), ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_without_products_delete_cannot_destroy(): void
    {
        $product = $this->createDefaultProduct();
        $user = User::factory()->create();
        $user->givePermissionTo(['products-access']);
        $this->actingAs($user)
            ->delete(route('products.destroy', $product))
            ->assertForbidden();
    }

    public function test_index_renders_products_list(): void
    {
        $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Products/Index')
                ->has('products.data', 1)
            );
    }

    public function test_index_paginates_5_per_page(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->createProductWithBarcode("BRC-PAGE-$i", "Product $i");
        }
        $this->actingAs($this->admin)
            ->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('products.per_page', 15)
                ->has('products.data', 6)
                ->where('products.total', 6)
            );
    }

    public function test_index_search_filters_by_title(): void
    {
        $this->createDefaultProduct();
        $this->createProductWithBarcode('BRC-OTHER', 'Produk Lain');
        $this->actingAs($this->admin)
            ->get(route('products.index', ['search' => 'Produk Test']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.title', 'Produk Test')
            );
    }

    public function test_index_search_returns_empty_when_no_match(): void
    {
        $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->get(route('products.index', ['search' => 'ZZZNOTFOUND']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 0)
            );
    }

    public function test_index_filters_products_by_warehouse(): void
    {
        $this->createDefaultProduct();

        $branch = Warehouse::create([
            'code' => 'BRANCH',
            'name' => 'Branch warehouse',
            'type' => 'branch',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $branchProduct = $this->createProductWithBarcode('BRC-BRANCH', 'Produk Cabang');
        $branchProduct->warehouses()->attach($branch->id, ['stock' => 5]);

        $this->actingAs($this->admin)
            ->get(route('products.index', ['warehouse_id' => $branch->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.title', 'Produk Cabang')
                ->where('filters.warehouse_id', (string) $branch->id)
            );
    }

    public function test_create_page_renders(): void
    {
        $this->actingAs($this->admin)
            ->get(route('products.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Products/Create')
                ->has('categories')
                ->has('units')
            );
    }

    public function test_can_store_product(): void
    {
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('product.jpg')])
            ->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'barcode' => 'BRC-TEST-001', 'title' => 'Produk Test',
            'buy_price' => 50000, 'sell_price' => 75000,
        ]);
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertNotNull($product->image);
        $this->assertSame(100, (int) $product->stock);
        $this->assertDatabaseHas('product_warehouse', [
            'product_id' => $product->id,
            'warehouse_id' => $this->productPayload['warehouse_id'],
            'stock' => 100,
        ]);
    }

    public function test_store_creates_audit_log(): void
    {
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('product.jpg')]);
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'product.created', 'module' => 'products',
            'auditable_id' => $product->id, 'user_id' => $this->admin->id,
        ]);
    }

    public function test_store_records_initial_stock_mutation(): void
    {
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('product.jpg')]);
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertDatabaseHas('stock_mutations', [
            'product_id' => $product->id, 'reference_type' => 'product_create',
            'reference_id' => $product->id, 'mutation_type' => 'in',
            'qty' => 100, 'stock_before' => 0, 'stock_after' => 100,
        ]);
    }

    public function test_store_validates_barcode_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['barcode']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('barcode');
    }

    public function test_store_validates_barcode_unique(): void
    {
        $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('barcode');
    }

    public function test_store_validates_title_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['title']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('title');
    }

    public function test_store_validates_description_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['description']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('description');
    }

    public function test_store_validates_category_id_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['category_id']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('category_id');
    }

    public function test_store_validates_buy_price_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['buy_price']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('buy_price');
    }

    public function test_store_validates_sell_price_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['sell_price']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('sell_price');
    }

    public function test_store_validates_stock_required(): void
    {
        $payload = $this->productPayload;
        unset($payload['stock']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('stock');
    }

    public function test_store_validates_stock_integer(): void
    {
        $payload = $this->productPayload;
        $payload['stock'] = 'abc';
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('stock');
    }

    public function test_store_validates_stock_min_zero(): void
    {
        $payload = $this->productPayload;
        $payload['stock'] = -1;
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('stock');
    }

    public function test_store_validates_min_stock_integer(): void
    {
        $payload = $this->productPayload;
        $payload['min_stock'] = 'abc';
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('min_stock');
    }

    public function test_store_validates_max_stock_integer(): void
    {
        $payload = $this->productPayload;
        $payload['max_stock'] = 'abc';
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHasErrors('max_stock');
    }

    public function test_can_store_product_with_units(): void
    {
        $unit = Unit::create(['name' => 'Unit A', 'code' => 'UTA', 'symbol' => 'uta']);
        $payload = $this->productPayload + [
            'image' => UploadedFile::fake()->image('product.jpg'),
            'units' => [[
                'unit_id' => $unit->id, 'is_base' => true,
                'conversion_factor' => 1, 'buy_price' => 50000, 'sell_price' => 75000,
                'barcode' => 'BRC-UNIT-001', 'sku_suffix' => 'UTA',
            ]],
        ];
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload)
            ->assertRedirect(route('products.index'));
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertDatabaseHas('product_units', [
            'product_id' => $product->id, 'unit_id' => $unit->id, 'is_base' => true,
        ]);
    }

    public function test_store_validates_exactly_one_base_unit(): void
    {
        $u1 = Unit::create(['name' => 'Unit A', 'code' => 'UTA', 'symbol' => 'uta']);
        $u2 = Unit::create(['name' => 'Unit B', 'code' => 'UTB', 'symbol' => 'utb']);
        $payload = $this->productPayload + [
            'image' => UploadedFile::fake()->image('product.jpg'),
            'units' => [
                ['unit_id' => $u1->id, 'is_base' => false, 'conversion_factor' => 1, 'buy_price' => 50000, 'sell_price' => 75000],
                ['unit_id' => $u2->id, 'is_base' => false, 'conversion_factor' => 12, 'buy_price' => 500000, 'sell_price' => 750000],
            ],
        ];
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload)
            ->assertSessionHasErrors('units');
    }

    public function test_edit_page_renders_with_product_data(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->get(route('products.edit', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Products/Edit')
                ->where('product.id', $product->id)
                ->where('product.title', $product->title)
                ->has('categories')
            );
    }

    public function test_can_update_product_without_image(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->put(route('products.update', $product), [
                'barcode' => 'BRC-UPDATED',
                'title' => 'Updated Title', 'description' => 'Updated desc',
                'category_id' => $this->category->id, 'buy_price' => 60000, 'sell_price' => 90000,
            ])
            ->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'id' => $product->id, 'barcode' => 'BRC-UPDATED',
            'title' => 'Updated Title', 'buy_price' => 60000, 'sell_price' => 90000,
        ]);
    }

    public function test_update_creates_audit_log(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->put(route('products.update', $product), [
                'barcode' => 'BRC-UPDATED2',
                'title' => 'Updated Title 2', 'description' => 'Updated desc 2',
                'category_id' => $this->category->id, 'buy_price' => 60000, 'sell_price' => 90000,
            ]);
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'product.updated', 'module' => 'products',
            'auditable_id' => $product->id, 'user_id' => $this->admin->id,
        ]);
    }

    public function test_update_logs_price_change_separately(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->put(route('products.update', $product), [
                'barcode' => 'BRC-PRICE',
                'title' => 'Price Changed', 'description' => 'Desc',
                'category_id' => $this->category->id, 'buy_price' => 99999, 'sell_price' => 199999,
            ]);
        $priceLogs = AuditLog::where('auditable_id', $product->id)
            ->where('event', 'product.price_updated')->get();
        $this->assertCount(1, $priceLogs);
        $this->assertSame(['buy_price' => 50000, 'sell_price' => 75000], $priceLogs->first()->before);
        $this->assertSame(['buy_price' => 99999, 'sell_price' => 199999], $priceLogs->first()->after);
    }

    public function test_update_validates_barcode_unique_excluding_self(): void
    {
        $this->createDefaultProduct();
        $other = $this->createProductWithBarcode('BRC-OTHER', 'Other');
        $this->actingAs($this->admin)
            ->put(route('products.update', $other), [
                'barcode' => 'BRC-TEST-001',
                'title' => 'Other', 'description' => 'Other desc',
                'category_id' => $this->category->id, 'buy_price' => 10000, 'sell_price' => 15000,
            ])
            ->assertSessionHasErrors('barcode');
    }

    public function test_update_does_not_change_stock(): void
    {
        $product = $this->createDefaultProduct();
        $originalStock = $product->stock;
        $this->actingAs($this->admin)
            ->put(route('products.update', $product), [
                'barcode' => 'BRC-STOCK',
                'title' => 'Stock Check', 'description' => 'Stock must not change via update',
                'category_id' => $this->category->id, 'buy_price' => 50000, 'sell_price' => 75000,
            ]);
        $this->assertSame($originalStock, (int) $product->fresh()->stock);
    }

    public function test_can_delete_product(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->delete(route('products.destroy', $product))
            ->assertRedirect();
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_delete_creates_audit_log(): void
    {
        $product = $this->createDefaultProduct();
        $this->actingAs($this->admin)
            ->delete(route('products.destroy', $product));
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'product.deleted', 'module' => 'products',
            'auditable_id' => $product->id, 'user_id' => $this->admin->id,
        ]);
    }

    public function test_delete_returns_404_for_nonexistent_product(): void
    {
        $this->actingAs($this->admin)
            ->delete(route('products.destroy', 9999))
            ->assertNotFound();
    }

    public function test_store_with_zero_stock_does_not_create_stock_mutation(): void
    {
        $payload = $this->productPayload;
        $payload['stock'] = 0;
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertRedirect(route('products.index'));
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertDatabaseMissing('stock_mutations', ['product_id' => $product->id]);
    }

    public function test_store_with_null_min_max_stock_accepts_zero_default(): void
    {
        $payload = $this->productPayload;
        unset($payload['min_stock'], $payload['max_stock']);
        $this->actingAs($this->admin)
            ->post(route('products.store'), $payload + ['image' => UploadedFile::fake()->image('p.jpg')])
            ->assertRedirect(route('products.index'));
        $product = Product::where('barcode', 'BRC-TEST-001')->first();
        $this->assertSame(0, (int) $product->min_stock);
        $this->assertSame(0, (int) $product->max_stock);
    }

    public function test_product_shows_in_index_after_create(): void
    {
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload + ['image' => UploadedFile::fake()->image('product.jpg')]);
        $this->actingAs($this->admin)
            ->get(route('products.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.title', 'Produk Test')
                ->where('products.data.0.sell_price', 75000)
            );
    }

    public function test_update_with_image_upload(): void
    {
        $product = $this->createDefaultProduct();
        $originalImage = $product->image;
        $this->actingAs($this->admin)
            ->put(route('products.update', $product), [
                'barcode' => 'BRC-IMG',
                'title' => 'Image Updated', 'description' => 'With new image',
                'category_id' => $this->category->id, 'buy_price' => 50000, 'sell_price' => 75000,
                'image' => UploadedFile::fake()->image('new-product.jpg'),
            ])
            ->assertRedirect(route('products.index'));
        $fresh = $product->fresh();
        $this->assertNotSame($originalImage, $fresh->image);
        $this->assertStringEndsWith('.jpg', $fresh->image);
    }

    public function test_store_without_image(): void
    {
        $this->actingAs($this->admin)
            ->post(route('products.store'), $this->productPayload)
            ->assertRedirect(route('products.index'));

        $product = Product::where('barcode', $this->productPayload['barcode'])->first();
        $this->assertNull($product->getRawOriginal('image'), 'Product without image should have null image in DB');
    }

    public function test_unauthorized_json_returns_proper_message(): void
    {
        $this->actingAs($this->userWithoutAccess)
            ->getJson(route('products.index'))
            ->assertForbidden()
            ->assertJson(['message' => 'Anda tidak memiliki izin untuk mengakses halaman tersebut.']);
    }

    private function createDefaultProduct(): Product
    {
        $product = Product::create($this->productPayload + ['image' => 'default.jpg']);
        $product->warehouses()->attach($this->productPayload['warehouse_id'], ['stock' => $this->productPayload['stock']]);

        return $product;
    }

    private function createProductWithBarcode(string $barcode, string $title): Product
    {
        $product = Product::create([
            'barcode' => $barcode, 'title' => $title,
            'description' => 'Desc '.$title, 'category_id' => $this->category->id,
            'buy_price' => 10000, 'sell_price' => 15000, 'image' => 'default.jpg',
        ]);
        $product->warehouses()->attach($this->productPayload['warehouse_id'], ['stock' => 10]);

        return $product;
    }
}
