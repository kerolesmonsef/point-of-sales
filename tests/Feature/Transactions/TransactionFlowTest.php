<?php

namespace Tests\Feature\Transactions;

use App\Models\Cart;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class TransactionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate([
            'name' => 'transactions-access',
            'guard_name' => 'web',
        ]);
        Permission::firstOrCreate([
            'name' => 'cashier-shifts-access',
            'guard_name' => 'web',
        ]);
        Permission::firstOrCreate([
            'name' => 'cashier-shifts-open',
            'guard_name' => 'web',
        ]);
        Permission::firstOrCreate([
            'name' => 'cashier-shifts-close',
            'guard_name' => 'web',
        ]);
    }

    public function test_cashier_can_complete_transaction_and_redirects_to_invoice(): void
    {
        $cashier = $this->createCashier();
        $shift = $this->openShiftFor($cashier);
        $customer = Customer::create([
            'name' => 'John Doe',
            'no_telp' => 62812345,
            'address' => 'Jl. Pengujian No. 1',
        ]);
        $product = $this->createProduct();
        $originalStock = $product->stock;

        $quantity = 2;
        $cart = Cart::create([
            'cashier_id' => $cashier->id,
            'product_id' => $product->id,
            'qty' => $quantity,
            'price' => $product->sell_price * $quantity,
        ]);

        $discount = 5000;
        $grandTotal = $cart->price - $discount;
        $cashPaid = 150000;

        $response = $this
            ->actingAs($cashier)
            ->post(route('transactions.store'), [
                'customer_id' => $customer->id,
                'discount' => $discount,
                'grand_total' => $grandTotal,
                'cash' => $cashPaid,
                'change' => $cashPaid - $grandTotal,
            ]);

        $transaction = Transaction::with(['details', 'profits'])->latest('id')->first();

        $this->assertNotNull($transaction, 'Transaction record should exist after checkout.');
        $response->assertRedirect(route('transactions.print', $transaction->invoice));
        $this->assertStringStartsWith('TRX-', $transaction->invoice);
        $this->assertSame($cashier->id, $transaction->cashier_id);
        $this->assertSame($shift->id, $transaction->cashier_shift_id);
        $this->assertSame($customer->id, $transaction->customer_id);
        $this->assertSame($grandTotal, (int) $transaction->grand_total);
        $this->assertSame($discount, (int) $transaction->discount);
        $this->assertSame($cashPaid, (int) $transaction->cash);
        $this->assertSame($cashPaid - $grandTotal, (int) $transaction->change);
        $this->assertSame('cash', $transaction->payment_method);
        $this->assertSame('paid', $transaction->payment_status);
        $this->assertNull($transaction->payment_url);

        $this->assertSame(1, $transaction->details->count());
        $detail = $transaction->details->first();
        $this->assertSame($product->id, $detail->product_id);
        $this->assertSame($quantity, (int) $detail->qty);
        $this->assertSame($cart->price, (int) $detail->price);

        $this->assertSame(1, $transaction->profits->count());
        $profit = $transaction->profits->first();
        $expectedProfit = (($product->sell_price * $quantity) - $discount)
            - ($product->buy_price * $quantity);
        $this->assertSame($expectedProfit, (int) $profit->total);

        $this->assertDatabaseMissing('carts', ['id' => $cart->id]);
        $this->assertSame($originalStock - $quantity, $product->fresh()->stock);
    }

    public function cashier_can_view_invoice_page_after_transaction(): void
    {
        $cashier = $this->createCashier();
        $shift = $this->openShiftFor($cashier);
        $customer = Customer::create([
            'name' => 'Jane Customer',
            'no_telp' => 62856789,
            'address' => 'Jl. Inertia No. 2',
        ]);
        $product = $this->createProduct();

        $transaction = Transaction::create([
            'cashier_id' => $cashier->id,
            'cashier_shift_id' => $shift->id,
            'customer_id' => $customer->id,
            'invoice' => 'TRX-'.Str::upper(Str::random(8)),
            'cash' => 200000,
            'change' => 50000,
            'discount' => 10000,
            'grand_total' => 150000,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
        ]);

        $transaction->details()->create([
            'product_id' => $product->id,
            'qty' => 3,
            'price' => $product->sell_price * 3,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->get(route('transactions.print', $transaction->invoice));

        $response
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Dashboard/Transactions/Print')
                    ->where('transaction.invoice', $transaction->invoice)
                    ->where('transaction.grand_total', $transaction->grand_total)
                    ->where('transaction.customer.name', $customer->name)
                    ->where('transaction.cashier.name', $cashier->name)
                    ->where('transaction.details.0.product.title', $product->title)
                    ->where('transaction.details.0.qty', 3)
            );
    }

    public function test_transaction_page_serializes_product_and_category_numeric_fields_as_integers(): void
    {
        $cashier = $this->createCashier();
        $shift = $this->openShiftFor($cashier);
        $product = $this->createProduct();

        $response = $this
            ->actingAs($cashier)
            ->get(route('transactions.index'));

        $response
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($product, $shift) {
                $page->component('Dashboard/Transactions/Index');

                $products = $page->toArray()['props']['products']['data'] ?? [];
                $categories = $page->toArray()['props']['categories'] ?? [];

                $serializedProduct = collect($products)->firstWhere('id', $product->id);
                $serializedCategory = collect($categories)->firstWhere('id', $product->category_id);

                $this->assertIsInt($serializedProduct['id']);
                $this->assertIsInt($serializedProduct['category_id']);
                $this->assertIsInt($serializedProduct['sell_price']);
                $this->assertIsInt($serializedProduct['stock']);
                $this->assertIsInt($serializedCategory['id']);
                $this->assertSame($shift->id, $page->toArray()['props']['activeCashierShift']['id']);
            });
    }

    protected function createCashier(): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo([
            'transactions-access',
            'cashier-shifts-access',
            'cashier-shifts-open',
            'cashier-shifts-close',
        ]);

        return $user;
    }

    public function test_transaction_page_serializes_product_warehouses_with_stock(): void
    {
        $cashier = $this->createCashier();
        $this->openShiftFor($cashier);
        $product = $this->createProduct();
        $warehouse = Warehouse::create([
            'code' => 'WH-02',
            'name' => 'Gudang Cabang',
            'is_active' => true,
        ]);
        $product->warehouses()->attach($warehouse->id, ['stock' => 7]);

        $response = $this
            ->actingAs($cashier)
            ->get(route('transactions.index'));

        $response
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($product) {
                $products = $page->toArray()['props']['products']['data'];
                $serialized = collect($products)->firstWhere('id', $product->id);

                $this->assertIsArray($serialized['warehouses']);
                $this->assertCount(2, $serialized['warehouses']);
                $this->assertArrayHasKey('pivot', $serialized['warehouses'][0]);
                $this->assertIsInt($serialized['warehouses'][0]['pivot']['stock']);
            });
    }

    public function test_transaction_page_paginates_products_with_limit(): void
    {
        $cashier = $this->createCashier();
        $this->openShiftFor($cashier);

        for ($i = 0; $i < 6; $i++) {
            $this->createProduct();
        }

        $response = $this
            ->actingAs($cashier)
            ->get(route('transactions.index', ['limit' => 5]));

        $response
            ->assertOk()
            ->assertInertia(function (Assert $page) {
                $page->component('Dashboard/Transactions/Index');
                $products = $page->toArray()['props']['products'];
                $this->assertCount(5, $products['data']);
                $this->assertSame(6, $products['total']);
                $this->assertSame(2, $products['last_page']);
            });
    }

    public function test_transaction_page_filters_products_by_search_and_category(): void
    {
        $cashier = $this->createCashier();
        $this->openShiftFor($cashier);

        $category = Category::create([
            'name' => 'Makanan',
            'description' => 'Kategori makanan',
            'image' => 'food.png',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'image' => 'product.png',
            'barcode' => 'BRCD-'.Str::upper(Str::random(10)),
            'title' => 'Indomie Goreng',
            'description' => 'Mie instan.',
            'buy_price' => 2000,
            'sell_price' => 3500,
            'tax_rate' => 0,
        ]);
        $product->warehouses()->attach($this->defaultWarehouse()->id, ['stock' => 10]);
        $this->createProduct();

        $this
            ->actingAs($cashier)
            ->get(route('transactions.index', ['search' => 'indomie']))
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($product) {
                $data = $page->toArray()['props']['products']['data'];
                $this->assertCount(1, $data);
                $this->assertSame($product->id, $data[0]['id']);
            });

        $this
            ->actingAs($cashier)
            ->get(route('transactions.index', ['category' => $category->id]))
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($product) {
                $data = $page->toArray()['props']['products']['data'];
                $this->assertCount(1, $data);
                $this->assertSame($product->id, $data[0]['id']);
            });
    }

    public function test_transaction_page_hides_zero_stock_products_unless_show_zero_stock_requested(): void
    {
        $cashier = $this->createCashier();
        $this->openShiftFor($cashier);

        $inStock = $this->createProduct();
        $outOfStock = Product::create([
            'category_id' => Category::create([
                'name' => 'Minuman',
                'description' => 'Kategori pengujian',
                'image' => 'category.png',
            ])->id,
            'image' => 'product.png',
            'barcode' => 'BRCD-'.Str::upper(Str::random(10)),
            'title' => 'Produk Habis',
            'description' => 'Deskripsi produk habis.',
            'buy_price' => 3000,
            'sell_price' => 5000,
            'tax_rate' => 0,
        ]);
        $outOfStock->warehouses()->attach($this->defaultWarehouse()->id, ['stock' => 0]);

        $this
            ->actingAs($cashier)
            ->get(route('transactions.index'))
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($inStock, $outOfStock) {
                $ids = collect($page->toArray()['props']['products']['data'])->pluck('id');
                $this->assertContains($inStock->id, $ids);
                $this->assertNotContains($outOfStock->id, $ids);
            });

        $this
            ->actingAs($cashier)
            ->get(route('transactions.index', ['show_zero_stock' => 1]))
            ->assertOk()
            ->assertInertia(function (Assert $page) use ($inStock, $outOfStock) {
                $ids = collect($page->toArray()['props']['products']['data'])->pluck('id');
                $this->assertContains($inStock->id, $ids);
                $this->assertContains($outOfStock->id, $ids);
            });
    }

    public function test_cashier_cannot_store_transaction_without_active_shift(): void
    {
        $cashier = $this->createCashier();
        $customer = Customer::create([
            'name' => 'No Shift',
            'no_telp' => 62812345,
            'address' => 'Jl. Tanpa Shift',
        ]);
        $product = $this->createProduct();

        Cart::create([
            'cashier_id' => $cashier->id,
            'product_id' => $product->id,
            'qty' => 1,
            'price' => $product->sell_price,
        ]);

        $response = $this
            ->from(route('transactions.index'))
            ->actingAs($cashier)
            ->post(route('transactions.store'), [
                'customer_id' => $customer->id,
                'discount' => 0,
                'grand_total' => $product->sell_price,
                'cash' => $product->sell_price,
                'change' => 0,
            ]);

        $response->assertRedirect(route('transactions.index'));
        $response->assertSessionHas('error', 'Shift kasir belum dibuka.');
        $this->assertDatabaseCount('transactions', 0);
    }

    protected function openShiftFor(User $cashier, ?int $warehouseId = null)
    {
        return CashierShift::create([
            'user_id' => $cashier->id,
            'opened_by' => $cashier->id,
            'opened_at' => now(),
            'opening_cash' => 100000,
            'expected_cash' => 100000,
            'warehouse_id' => $warehouseId,
            'status' => 'open',
        ]);
    }

    protected function defaultWarehouse(): Warehouse
    {
        return Warehouse::default() ?? Warehouse::create([
            'code' => 'MAIN',
            'name' => 'Main warehouse',
            'type' => 'main',
            'is_active' => true,
            'sort_order' => 0,
        ]);
    }

    protected function createProduct(): Product
    {
        $category = Category::create([
            'name' => 'Sembako',
            'description' => 'Kategori pengujian',
            'image' => 'category.png',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'image' => 'product.png',
            'barcode' => 'BRCD-'.Str::upper(Str::random(10)),
            'title' => 'Produk Uji',
            'description' => 'Deskripsi produk uji.',
            'buy_price' => 45000,
            'sell_price' => 60000,
            'tax_rate' => 0,
        ]);

        $product->warehouses()->attach($this->defaultWarehouse()->id, ['stock' => 25]);

        return $product;
    }

    public function test_search_product_by_barcode_returns_product_with_warehouse_stock(): void
    {
        $cashier = $this->createCashier();
        $warehouse = Warehouse::create([
            'code' => 'WH-01',
            'name' => 'Gudang Utama',
            'is_active' => true,
        ]);
        $this->openShiftFor($cashier, $warehouse->id);
        $product = $this->createProduct();
        $product->warehouses()->updateExistingPivot($warehouse->id, ['stock' => 7]);

        $this
            ->actingAs($cashier)
            ->postJson(route('transactions.searchProduct'), ['barcode' => $product->barcode])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'barcode' => $product->barcode,
                    'stock' => 7,
                ],
            ]);
    }

    public function test_search_product_by_barcode_returns_not_found_when_barcode_unknown(): void
    {
        $cashier = $this->createCashier();
        $this->openShiftFor($cashier);

        $this
            ->actingAs($cashier)
            ->postJson(route('transactions.searchProduct'), ['barcode' => 'BRCD-UNKNOWN'])
            ->assertOk()
            ->assertJson(['success' => false]);
    }
}
