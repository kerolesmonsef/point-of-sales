<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function edit()
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        return Inertia::render('Dashboard/Settings/Payment', [
            'setting' => [
                'default_gateway' => $setting->default_gateway,
                'bank_transfer_enabled' => (bool) $setting->bank_transfer_enabled,
            ],
            'supportedGateways' => [
                ['value' => 'cash', 'label' => __('Cash')],
                ['value' => PaymentSetting::GATEWAY_BANK_TRANSFER, 'label' => __('Bank Transfer')],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        $data = $request->validate([
            'default_gateway' => [
                'required',
                Rule::in(['cash', PaymentSetting::GATEWAY_BANK_TRANSFER]),
            ],
            'bank_transfer_enabled' => ['boolean'],
        ]);

        $setting->update([
            'default_gateway' => $data['default_gateway'],
            'bank_transfer_enabled' => (bool) ($data['bank_transfer_enabled'] ?? false),
        ]);

        return redirect()
            ->route('settings.payments.edit')
            ->with('success', __('Payment gateway configuration saved successfully.'));
    }
}
