<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_confirm_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/confirm-password');

        $response->assertStatus(200);
    }

    public function test_password_can_be_confirmed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/confirm-password', [
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_password_is_not_confirmed_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/confirm-password', [
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors();
    }

    public function test_sensitive_routes_redirect_to_confirm_password_when_recent_confirmation_is_missing(): void
    {
        $user = User::factory()->create();
        Permission::firstOrCreate(['name' => 'payment-settings-update', 'guard_name' => 'web']);
        $user->givePermissionTo('payment-settings-update');

        $response = $this
            ->actingAs($user)
            ->from(route('settings.payments.edit'))
            ->put(route('settings.payments.update'), [
                'default_gateway' => 'cash',
            ]);

        $response->assertRedirect(route('password.confirm'));
    }
}
