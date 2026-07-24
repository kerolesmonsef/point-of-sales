<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            PaymentSettingSeeder::class,
            SampleDataSeeder::class,
            OperationalCoreSeeder::class,
            FeatureCoverageSeeder::class,
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->seedDefaultWarehouse();
    }

    private function seedDefaultWarehouse(): void
    {
        if (Warehouse::where('code', 'PUSAT')->exists()) {
            return;
        }

        $pusat = Warehouse::create([
            'code' => 'PUSAT',
            'name' => 'Gudang Pusat',
            'type' => 'main',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        \Illuminate\Support\Facades\DB::table('product_warehouse')->insertUsing([
            'product_id', 'warehouse_id', 'stock', 'created_at', 'updated_at',
        ], \Illuminate\Support\Facades\DB::table('products')->select([
            'id', \Illuminate\Support\Facades\DB::raw("{$pusat->id} as warehouse_id"), 'stock',
            \Illuminate\Support\Facades\DB::raw("datetime('now') as created_at"),
            \Illuminate\Support\Facades\DB::raw("datetime('now') as updated_at"),
        ]));
    }
}
