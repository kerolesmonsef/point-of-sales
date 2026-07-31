<?php

namespace Tests\Feature\Security;

use App\Models\PaymentSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PhaseTwoSecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_settings_page_loads(): void
    {
        Permission::firstOrCreate(['name' => 'payment-settings-access', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->givePermissionTo('payment-settings-access');

        PaymentSetting::create([
            'default_gateway' => 'cash',
        ]);

        $response = $this->actingAs($user)->get(route('settings.payments.edit'));

        $response->assertOk();
    }
}
