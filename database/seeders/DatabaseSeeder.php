<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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

        DB::table('product_warehouse')->insertUsing([
            'product_id', 'warehouse_id', 'stock', 'created_at', 'updated_at',
        ], DB::table('products')->select([
            'id', DB::raw("{$pusat->id} as warehouse_id"), 'stock',
            DB::raw("datetime('now') as created_at"),
            DB::raw("datetime('now') as updated_at"),
        ]));
    }
}
