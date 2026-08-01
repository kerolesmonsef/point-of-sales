<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\CustomerVoucher;
use App\Models\LoyaltyPointHistory;
use App\Models\Payable;
use App\Models\PayablePayment;
use App\Models\Product;
use App\Models\Profit;
use App\Models\Receivable;
use App\Models\ReceivablePayment;
use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use App\Models\StockMutation;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        Cart::truncate();
        LoyaltyPointHistory::truncate();
        CustomerVoucher::truncate();
        CustomerCredit::truncate();
        SalesReturnItem::truncate();
        SalesReturn::truncate();
        CashierShift::truncate();
        StockMutation::truncate();
        ReceivablePayment::truncate();
        PayablePayment::truncate();
        Receivable::truncate();
        Payable::truncate();
        TransactionDetail::truncate();
        Profit::truncate();
        Transaction::truncate();
        Product::truncate();
        Category::truncate();
        Customer::truncate();
        Supplier::truncate();

        Schema::enableForeignKeyConstraints();

        // Ensure storage directories exist
        Storage::disk('public')->makeDirectory('category');
        Storage::disk('public')->makeDirectory('products');

        $this->command->info('Seeding customers...');
        $customers = $this->seedCustomers();

        $this->command->info('Seeding suppliers...');
        $suppliers = $this->seedSuppliers();

        $this->command->info('Seeding categories with images...');
        $categories = $this->seedCategories();

        $this->command->info('Seeding products with images...');
        $products = $this->seedProducts($categories);

        $this->command->info('Seeding transactions...');
        $this->seedTransactions($customers, $products);

        $this->command->info('Seeding receivables...');
        $this->seedReceivables($customers);

        $this->command->info('Seeding loyalty vouchers...');
        $this->seedCustomerVouchers($customers);

        $this->command->info('Seeding payables...');
        $this->seedPayables($suppliers);

        $this->command->info('Sample data seeding completed!');
    }

    /**
     * Download image from URL and save to storage
     */
    private function downloadImage(string $url, string $folder, string $filename): ?string
    {
        try {
            $this->command->info("  Downloading: {$filename}...");

            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $extension = 'jpg';
                $fullFilename = $filename.'.'.$extension;

                Storage::disk('public')->put(
                    $folder.'/'.$fullFilename,
                    $response->body()
                );

                return $fullFilename;
            }
        } catch (\Exception $e) {
            $this->command->warn("  Failed to download {$filename}: ".$e->getMessage());
        }

        return null;
    }

    /**
     * Seed master customers.
     */
    private function seedCustomers(): Collection
    {
        $customers = collect([
            ['name' => 'Daily Customer', 'no_telp' => '6280000000000', 'address' => '-', 'is_default' => true],
        ]);

        return $customers
            ->map(fn ($customer) => Customer::create($customer))
            ->keyBy('name');
    }

    private function seedCustomerVouchers(Collection $customers): void
    {
        $blueprints = [
            [
                'customer' => 'Andi Nugraha',
                'code' => 'VCR-ANDI10',
                'name' => 'Voucher Loyal Gold',
                'discount_type' => 'fixed_amount',
                'discount_value' => 10000,
                'minimum_order' => 75000,
            ],
            [
                'customer' => 'Bunga Maharani',
                'code' => 'VCR-BUNGA5',
                'name' => 'Voucher Repeat Order',
                'discount_type' => 'percentage',
                'discount_value' => 5,
                'minimum_order' => 50000,
            ],
            [
                'customer' => 'Eko Saputra',
                'code' => 'VCR-EKO25',
                'name' => 'Voucher Platinum',
                'discount_type' => 'fixed_amount',
                'discount_value' => 25000,
                'minimum_order' => 150000,
            ],
        ];

        foreach ($blueprints as $blueprint) {
            $customer = $customers->get($blueprint['customer']);

            if (! $customer) {
                continue;
            }

            CustomerVoucher::create([
                'customer_id' => $customer->id,
                'code' => $blueprint['code'],
                'name' => $blueprint['name'],
                'discount_type' => $blueprint['discount_type'],
                'discount_value' => $blueprint['discount_value'],
                'minimum_order' => $blueprint['minimum_order'],
                'is_active' => true,
                'starts_at' => now()->subDays(7),
                'expires_at' => now()->addDays(30),
            ]);
        }
    }

    /**
     * Seed master suppliers.
     */
    private function seedSuppliers(): Collection
    {
        $suppliers = collect([
            ['name' => 'PT Nusantara Food Source', 'phone' => '0215551001', 'email' => 'sales@foodsource.test', 'address' => 'Food Industry St. No. 10, Jakarta'],
            ['name' => 'CV Prosperous Jaya Distribution', 'phone' => '0225551002', 'email' => 'order@prosperousjaya.test', 'address' => 'Soekarno Hatta St. No. 88, Bandung'],
            ['name' => 'PT Fresh Prosperous Eternal', 'phone' => '0315551003', 'email' => 'hello@freshprosperous.test', 'address' => 'Darmo Road No. 21, Surabaya'],
            ['name' => 'UD Blessed Retail Wholesale', 'phone' => '0245551004', 'email' => 'admin@blessedretail.test', 'address' => 'Pandanaran St. No. 45, Semarang'],
        ]);

        return $suppliers
            ->map(fn ($supplier) => Supplier::create($supplier))
            ->keyBy('name');
    }

    /**
     * Seed master categories with downloaded images.
     */
    private function seedCategories(): Collection
    {
        // Categories with Unsplash image URLs (direct download links)
        $categories = collect([
            [
                'name' => 'Beverages',
                'description' => 'Assorted fresh and packaged drinks',
                'image_url' => 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Snacks',
                'description' => 'Packaged chips and snacks',
                'image_url' => 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Main Meals',
                'description' => 'Ready meals and frozen food',
                'image_url' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Dairy Products',
                'description' => 'Milk, yogurt, and dairy products',
                'image_url' => 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Bread & Pastries',
                'description' => 'Fresh bread and assorted pastries',
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Spices & Seasonings',
                'description' => 'Cooking spices and seasonings',
                'image_url' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Body Care',
                'description' => 'Soap, shampoo, and personal care',
                'image_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
            ],
            [
                'name' => 'Household Needs',
                'description' => 'Household supplies',
                'image_url' => 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
            ],
        ]);

        return $categories->map(function ($category) {
            $slug = Str::slug($category['name']);
            $image = $this->downloadImage(
                $category['image_url'],
                'category',
                'cat-'.$slug
            );

            return Category::create([
                'name' => $category['name'],
                'description' => $category['description'],
                'image' => $image ?? 'default.jpg',
            ]);
        })->keyBy('name');
    }

    /**
     * Seed products mapped to categories with downloaded images.
     */
    private function seedProducts(Collection $categories): Collection
    {
        $warehouse = Warehouse::default();
        // Products with Unsplash image URLs
        $products = collect([
            // Beverages
            ['category' => 'Beverages', 'barcode' => 'MNM-0001', 'title' => 'Aqua Bottled Water 600ml', 'description' => 'Pure mineral water in a convenient bottle', 'buy_price' => 3000, 'sell_price' => 5000, 'stock' => 200, 'image_url' => 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop'],
            ['category' => 'Beverages', 'barcode' => 'MNM-0002', 'title' => 'Teh Botol Sosro 450ml', 'description' => 'Fresh sweet tea in a bottle', 'buy_price' => 4000, 'sell_price' => 6000, 'stock' => 150, 'image_url' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop'],
            ['category' => 'Beverages', 'barcode' => 'MNM-0003', 'title' => 'Palm Sugar Milk Coffee', 'description' => 'Coffee milk with authentic palm sugar', 'buy_price' => 12000, 'sell_price' => 18000, 'stock' => 80, 'image_url' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop'],
            ['category' => 'Beverages', 'barcode' => 'MNM-0004', 'title' => 'Fresh Orange Juice 500ml', 'description' => 'Pure orange juice with no preservatives', 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 60, 'image_url' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop'],

            // Snacks
            ['category' => 'Snacks', 'barcode' => 'SNK-0001', 'title' => 'Chitato Original 68g', 'description' => 'Crispy potato chips, original flavor', 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 120, 'image_url' => 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop'],
            ['category' => 'Snacks', 'barcode' => 'SNK-0002', 'title' => 'Oreo Vanilla 133g', 'description' => 'Sandwich cookies with vanilla cream', 'buy_price' => 10000, 'sell_price' => 15000, 'stock' => 100, 'image_url' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop'],
            ['category' => 'Snacks', 'barcode' => 'SNK-0003', 'title' => 'Indomie Fried Noodles', 'description' => "Indonesia's favorite fried instant noodles", 'buy_price' => 2500, 'sell_price' => 3500, 'stock' => 300, 'image_url' => 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop'],
            ['category' => 'Snacks', 'barcode' => 'SNK-0004', 'title' => 'Pringles Sour Cream', 'description' => 'Premium potato chips, sour cream flavor', 'buy_price' => 25000, 'sell_price' => 35000, 'stock' => 50, 'image_url' => 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=300&h=300&fit=crop'],

            // Main Meals
            ['category' => 'Main Meals', 'barcode' => 'MKN-0001', 'title' => 'Frozen Fried Rice', 'description' => 'Ready-to-heat fried rice', 'buy_price' => 15000, 'sell_price' => 22000, 'stock' => 40, 'image_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop'],
            ['category' => 'Main Meals', 'barcode' => 'MKN-0002', 'title' => 'Frozen Fried Chicken', 'description' => 'Ready-to-fry crispy fried chicken', 'buy_price' => 25000, 'sell_price' => 38000, 'stock' => 35, 'image_url' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&h=300&fit=crop'],
            ['category' => 'Main Meals', 'barcode' => 'MKN-0003', 'title' => 'Beef Sausage 500g', 'description' => 'Premium beef sausages, 12 pieces', 'buy_price' => 35000, 'sell_price' => 48000, 'stock' => 45, 'image_url' => 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300&h=300&fit=crop'],

            // Dairy Products
            ['category' => 'Dairy Products', 'barcode' => 'SSU-0001', 'title' => 'Ultra Milk 1L', 'description' => 'UHT full cream milk', 'buy_price' => 16000, 'sell_price' => 21000, 'stock' => 80, 'image_url' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop'],
            ['category' => 'Dairy Products', 'barcode' => 'SSU-0002', 'title' => 'Cimory Yogurt Drink 250ml', 'description' => 'Strawberry yogurt drink', 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 60, 'image_url' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop'],
            ['category' => 'Dairy Products', 'barcode' => 'SSU-0003', 'title' => 'Cheddar Cheese 165g', 'description' => 'Convenient cheddar cheese slices', 'buy_price' => 22000, 'sell_price' => 30000, 'stock' => 40, 'image_url' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop'],

            // Bread & Pastries
            ['category' => 'Bread & Pastries', 'barcode' => 'RTI-0001', 'title' => 'Sari Roti Sandwich Bread', 'description' => 'Soft crustless sandwich bread', 'buy_price' => 12000, 'sell_price' => 16000, 'stock' => 50, 'image_url' => 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=300&fit=crop'],
            ['category' => 'Bread & Pastries', 'barcode' => 'RTI-0002', 'title' => 'Chocolate Donut', 'description' => 'Soft donut with chocolate topping', 'buy_price' => 5000, 'sell_price' => 8000, 'stock' => 30, 'image_url' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop'],
            ['category' => 'Bread & Pastries', 'barcode' => 'RTI-0003', 'title' => 'Butter Croissant', 'description' => 'Croissant with premium butter', 'buy_price' => 10000, 'sell_price' => 15000, 'stock' => 25, 'image_url' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop'],

            // Spices & Seasonings
            ['category' => 'Spices & Seasonings', 'barcode' => 'BMB-0001', 'title' => 'ABC Sweet Soy Sauce 600ml', 'description' => 'Premium sweet soy sauce', 'buy_price' => 18000, 'sell_price' => 25000, 'stock' => 70, 'image_url' => 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=300&fit=crop'],
            ['category' => 'Spices & Seasonings', 'barcode' => 'BMB-0002', 'title' => 'Cooking Oil 2L', 'description' => 'Quality palm cooking oil', 'buy_price' => 28000, 'sell_price' => 38000, 'stock' => 90, 'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop'],
            ['category' => 'Spices & Seasonings', 'barcode' => 'BMB-0003', 'title' => 'White Sugar 1kg', 'description' => 'Premium white sugar', 'buy_price' => 14000, 'sell_price' => 18000, 'stock' => 100, 'image_url' => 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=300&h=300&fit=crop'],

            // Body Care
            ['category' => 'Body Care', 'barcode' => 'PRW-0001', 'title' => 'Lifebuoy Soap 85g', 'description' => 'Antibacterial bath soap', 'buy_price' => 4000, 'sell_price' => 6500, 'stock' => 150, 'image_url' => 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=300&h=300&fit=crop'],
            ['category' => 'Body Care', 'barcode' => 'PRW-0002', 'title' => 'Pantene Shampoo 170ml', 'description' => 'Anti-hair-loss shampoo', 'buy_price' => 22000, 'sell_price' => 32000, 'stock' => 60, 'image_url' => 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop'],
            ['category' => 'Body Care', 'barcode' => 'PRW-0003', 'title' => 'Pepsodent Toothpaste 190g', 'description' => 'Cavity-prevention toothpaste', 'buy_price' => 12000, 'sell_price' => 18000, 'stock' => 100, 'image_url' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop'],

            // Household Needs
            ['category' => 'Household Needs', 'barcode' => 'RMH-0001', 'title' => 'Paseo Tissue 250 Sheets', 'description' => 'Soft and strong facial tissue', 'buy_price' => 15000, 'sell_price' => 22000, 'stock' => 80, 'image_url' => 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=300&h=300&fit=crop'],
            ['category' => 'Household Needs', 'barcode' => 'RMH-0002', 'title' => 'Dish Soap 800ml', 'description' => 'Anti-grease dish soap', 'buy_price' => 12000, 'sell_price' => 18000, 'stock' => 90, 'image_url' => 'https://images.unsplash.com/photo-1585441695325-21557ab93f7e?w=300&h=300&fit=crop'],
            ['category' => 'Household Needs', 'barcode' => 'RMH-0003', 'title' => 'Fabric Freshener 900ml', 'description' => 'Fabric softener and freshener', 'buy_price' => 18000, 'sell_price' => 26000, 'stock' => 70, 'image_url' => 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=300&h=300&fit=crop'],
        ]);

        return $products->map(function ($product) use ($warehouse, $categories) {
            $category = $categories->get($product['category']);

            // Download product image
            $slug = Str::slug($product['title']);
            $image = $this->downloadImage(
                $product['image_url'],
                'products',
                'prod-'.$slug
            );

            $product = Product::create([
                'category_id' => $category?->id,
                'image' => $image ?? 'default.jpg',
                'barcode' => $product['barcode'],
                'title' => $product['title'],
                'description' => $product['description'],
                'buy_price' => $product['buy_price'],
                'sell_price' => $product['sell_price'],
            ]);

            if ($warehouse) {
                $product->warehouses()->attach($warehouse->id, [
                    'stock' => (int) $product['stock'],
                ]);
            }

            return $product;
        })->keyBy('barcode');
    }

    /**
     * Seed historical transactions, transaction details, and profits.
     */
    private function seedTransactions(Collection $customers, Collection $products): void
    {
        $cashier = User::where('email', 'cashier@gmail.com')->first() ?? User::first();

        if (! $cashier) {
            return;
        }

        $warehouse = Warehouse::default();

        $blueprints = [
            [
                'customer' => 'Andi Nugraha',
                'discount' => 5000,
                'cash' => 100000,
                'items' => [
                    ['barcode' => 'MNM-0001', 'qty' => 3],
                    ['barcode' => 'SNK-0001', 'qty' => 2],
                    ['barcode' => 'RTI-0001', 'qty' => 1],
                ],
            ],
            [
                'customer' => 'Bunga Maharani',
                'discount' => 0,
                'cash' => 150000,
                'items' => [
                    ['barcode' => 'SSU-0001', 'qty' => 2],
                    ['barcode' => 'RTI-0002', 'qty' => 3],
                    ['barcode' => 'PRW-0001', 'qty' => 2],
                ],
            ],
            [
                'customer' => 'Cici Amelia',
                'discount' => 10000,
                'cash' => 200000,
                'items' => [
                    ['barcode' => 'MKN-0002', 'qty' => 2],
                    ['barcode' => 'BMB-0002', 'qty' => 1],
                    ['barcode' => 'RMH-0001', 'qty' => 2],
                ],
            ],
            [
                'customer' => 'Davin Pradipta',
                'discount' => 0,
                'cash' => 80000,
                'items' => [
                    ['barcode' => 'MNM-0003', 'qty' => 2],
                    ['barcode' => 'SNK-0003', 'qty' => 5],
                    ['barcode' => 'SSU-0002', 'qty' => 2],
                ],
            ],
            [
                'customer' => 'Fitri Lestari',
                'discount' => 15000,
                'cash' => 250000,
                'items' => [
                    ['barcode' => 'PRW-0002', 'qty' => 1],
                    ['barcode' => 'BMB-0001', 'qty' => 2],
                    ['barcode' => 'MKN-0003', 'qty' => 2],
                    ['barcode' => 'RMH-0003', 'qty' => 1],
                ],
            ],
            [
                'customer' => null,
                'discount' => 0,
                'cash' => 50000,
                'items' => [
                    ['barcode' => 'MNM-0002', 'qty' => 2],
                    ['barcode' => 'SNK-0002', 'qty' => 1],
                ],
            ],
        ];

        foreach ($blueprints as $blueprint) {
            $customer = $blueprint['customer']
                ? $customers->get($blueprint['customer'])
                : null;

            $items = collect($blueprint['items'])
                ->map(function ($item) use ($products) {
                    $product = $products->get($item['barcode']);

                    if (! $product) {
                        return null;
                    }

                    $lineTotal = $product->sell_price * $item['qty'];

                    return [
                        'product' => $product,
                        'qty' => $item['qty'],
                        'line_total' => $lineTotal,
                        'profit' => ($product->sell_price - $product->buy_price) * $item['qty'],
                    ];
                })
                ->filter();

            if ($items->isEmpty()) {
                continue;
            }

            $discount = max(0, $blueprint['discount']);
            $gross = $items->sum('line_total');
            $grandTotal = max(0, $gross - $discount);
            $cashPaid = max($grandTotal, $blueprint['cash']);
            $change = $cashPaid - $grandTotal;

            $transaction = Transaction::create([
                'cashier_id' => $cashier->id,
                'customer_id' => $customer?->id,
                'invoice' => 'TRX-'.Str::upper(Str::random(8)),
                'cash' => $cashPaid,
                'change' => $change,
                'discount' => $discount,
                'grand_total' => $grandTotal,
            ]);

            foreach ($items as $item) {
                $transaction->details()->create([
                    'product_id' => $item['product']->id,
                    'qty' => $item['qty'],
                    'price' => $item['line_total'],
                ]);

                $transaction->profits()->create([
                    'total' => $item['profit'],
                ]);

                if ($warehouse) {
                    $item['product']->warehouses()->updateExistingPivot($warehouse->id, [
                        'stock' => max(0, (int) $item['product']->stock - (int) $item['qty']),
                    ]);
                }
            }
        }
    }

    /**
     * Seed receivables and their payments.
     */
    private function seedReceivables(Collection $customers): void
    {
        $cashier = User::where('email', 'cashier@gmail.com')->first() ?? User::first();

        $sourceTransactions = Transaction::with('customer')
            ->whereNotNull('customer_id')
            ->take(3)
            ->get();

        foreach ($sourceTransactions as $index => $transaction) {
            $paid = match ($index) {
                0 => (float) ($transaction->grand_total * 0.4),
                1 => (float) ($transaction->grand_total * 0.7),
                default => 0,
            };

            $status = $paid <= 0
                ? 'unpaid'
                : ($paid >= $transaction->grand_total ? 'paid' : 'partial');

            $receivable = Receivable::create([
                'customer_id' => $transaction->customer_id,
                'transaction_id' => $transaction->id,
                'invoice' => 'RCV-'.$transaction->invoice,
                'total' => $transaction->grand_total,
                'paid' => $paid,
                'due_date' => now()->addDays(($index + 1) * 7)->toDateString(),
                'status' => $status,
                'note' => 'Receivable from sales transaction '.$transaction->invoice,
            ]);

            if ($paid > 0) {
                ReceivablePayment::create([
                    'receivable_id' => $receivable->id,
                    'paid_at' => now()->subDays(2 + $index)->toDateString(),
                    'amount' => $paid,
                    'method' => 'cash',
                    'user_id' => $cashier?->id,
                    'note' => 'Initial receivable payment',
                ]);
            }

            $transaction->update([
                'payment_method' => 'credit',
                'payment_status' => $status === 'paid' ? 'paid' : 'unpaid',
                'cash' => (int) $paid,
                'change' => 0,
            ]);
        }

        $manualReceivables = [
            [
                'customer' => 'Gina Putri',
                'invoice' => 'RCV-MANUAL-001',
                'total' => 185000,
                'paid' => 50000,
                'due_date' => now()->addDays(10)->toDateString(),
                'status' => 'partial',
                'note' => 'Manual receivable for monthly wholesale purchase',
            ],
            [
                'customer' => 'Hendra Wijaya',
                'invoice' => 'RCV-MANUAL-002',
                'total' => 275000,
                'paid' => 0,
                'due_date' => now()->subDays(3)->toDateString(),
                'status' => 'overdue',
                'note' => 'Manual receivable past its due date',
            ],
        ];

        foreach ($manualReceivables as $item) {
            $customer = $customers->get($item['customer']);

            if (! $customer) {
                continue;
            }

            $receivable = Receivable::create([
                'customer_id' => $customer->id,
                'invoice' => $item['invoice'],
                'total' => $item['total'],
                'paid' => $item['paid'],
                'due_date' => $item['due_date'],
                'status' => $item['status'],
                'note' => $item['note'],
            ]);

            if ($item['paid'] > 0) {
                ReceivablePayment::create([
                    'receivable_id' => $receivable->id,
                    'paid_at' => now()->subDays(1)->toDateString(),
                    'amount' => $item['paid'],
                    'method' => 'bank_transfer',
                    'user_id' => $cashier?->id,
                    'note' => 'Partial payment for manual receivable',
                ]);
            }
        }
    }

    /**
     * Seed payables and their payments.
     */
    private function seedPayables(Collection $suppliers): void
    {
        $cashier = User::where('email', 'cashier@gmail.com')->first() ?? User::first();

        $blueprints = [
            [
                'supplier' => 'PT Nusantara Food Source',
                'document_number' => 'PYB-0001',
                'total' => 450000,
                'paid' => 150000,
                'due_date' => now()->addDays(14)->toDateString(),
                'status' => 'partial',
                'note' => 'Procurement of beverages and snacks',
            ],
            [
                'supplier' => 'CV Prosperous Jaya Distribution',
                'document_number' => 'PYB-0002',
                'total' => 720000,
                'paid' => 0,
                'due_date' => now()->addDays(21)->toDateString(),
                'status' => 'unpaid',
                'note' => 'Procurement of household products',
            ],
            [
                'supplier' => 'PT Fresh Prosperous Eternal',
                'document_number' => 'PYB-0003',
                'total' => 390000,
                'paid' => 390000,
                'due_date' => now()->subDays(2)->toDateString(),
                'status' => 'paid',
                'note' => 'Purchase of dairy products and frozen food',
            ],
            [
                'supplier' => 'UD Blessed Retail Wholesale',
                'document_number' => 'PYB-0004',
                'total' => 510000,
                'paid' => 100000,
                'due_date' => now()->subDays(5)->toDateString(),
                'status' => 'overdue',
                'note' => 'Mixed goods procurement due',
            ],
        ];

        foreach ($blueprints as $item) {
            $supplier = $suppliers->get($item['supplier']);

            if (! $supplier) {
                continue;
            }

            $payable = Payable::create([
                'supplier_id' => $supplier->id,
                'document_number' => $item['document_number'],
                'total' => $item['total'],
                'paid' => $item['paid'],
                'due_date' => $item['due_date'],
                'status' => $item['status'],
                'note' => $item['note'],
            ]);

            if ($item['paid'] > 0) {
                PayablePayment::create([
                    'payable_id' => $payable->id,
                    'paid_at' => now()->subDays(3)->toDateString(),
                    'amount' => $item['paid'],
                    'method' => 'bank_transfer',
                    'user_id' => $cashier?->id,
                    'note' => 'Supplier debt payment',
                ]);
            }
        }
    }
}
