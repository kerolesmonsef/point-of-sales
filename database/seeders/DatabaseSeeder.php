<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->seedDefaultWarehouse();

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
    }

    private function seedDefaultWarehouse(): void
    {
        if (Warehouse::where('code', 'MAIN')->exists()) {
            return;
        }

        Warehouse::create([
            'code' => 'MAIN',
            'name' => 'main warehouse',
            'type' => 'main',
            'is_active' => true,
            'sort_order' => 0,
        ]);
    }
}
