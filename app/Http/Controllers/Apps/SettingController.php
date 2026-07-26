<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditLogService;
use App\Services\LoyaltyService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly LoyaltyService $loyaltyService,
        private readonly WhatsAppService $whatsAppService
    ) {}

    /**
     * Show the target settings page
     */
    public function target()
    {
        $settings = [
            'monthly_sales_target' => Setting::get('monthly_sales_target', 0),
        ];

        return Inertia::render('Dashboard/Settings/Target', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update target settings
     */
    public function updateTarget(Request $request)
    {
        $request->validate([
            'monthly_sales_target' => 'required|numeric|min:0',
        ]);

        Setting::set(
            'monthly_sales_target',
            $request->monthly_sales_target,
            __('Monthly sales target')
        );

        return back()->with('success', __('Target saved successfully'));
    }

    /**
     * Store profile settings page
     */
    public function storeProfile()
    {
        $settings = [
            'store_name' => Setting::get('store_name', ''),
            'store_logo' => Setting::get('store_logo', ''),
            'store_address' => Setting::get('store_address', ''),
            'store_phone' => Setting::get('store_phone', ''),
            'store_email' => Setting::get('store_email', ''),
            'store_website' => Setting::get('store_website', ''),
            'store_city' => Setting::get('store_city', ''),
            'store_npwp' => Setting::get('store_npwp', ''),
            'store_nib' => Setting::get('store_nib', ''),
            'tax_default_rate' => Setting::get('tax_default_rate', '11.00'),
            'store_currency' => Setting::get('store_currency', 'EGP'),
        ];

        return Inertia::render('Dashboard/Settings/Store', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update store profile settings
     */
    public function updateStoreProfile(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'required|string|max:500',
            'store_phone' => 'nullable|string|max:50',
            'store_email' => 'nullable|email|max:255',
            'store_website' => 'nullable|string|max:255',
            'store_city' => 'nullable|string|max:255',
            'store_logo' => 'nullable|image|max:2048',
            'store_npwp' => 'nullable|string|max:20',
            'store_nib' => 'nullable|string|max:30',
            'tax_default_rate' => 'nullable|numeric|min:0|max:100',
            'store_currency' => 'required|string|max:10',
        ]);

        $before = [
            'store_name' => Setting::get('store_name', ''),
            'store_address' => Setting::get('store_address', ''),
            'store_phone' => Setting::get('store_phone', ''),
            'store_email' => Setting::get('store_email', ''),
            'store_website' => Setting::get('store_website', ''),
            'store_city' => Setting::get('store_city', ''),
            'store_logo_changed' => false,
        ];

        $logoPath = Setting::get('store_logo');
        $logoChanged = false;

        if ($request->file('store_logo')) {
            if ($logoPath) {
                Storage::disk('public')->delete($logoPath);
            }
            $logoPath = $request->file('store_logo')->store('store', 'public');
            $logoChanged = true;
        }

        Setting::set('store_name', $request->store_name, __('Store name'));
        Setting::set('store_address', $request->store_address, __('Store address'));
        Setting::set('store_phone', $request->store_phone, __('Store phone'));
        Setting::set('store_email', $request->store_email, __('Store email'));
        Setting::set('store_website', $request->store_website, __('Store website'));
        Setting::set('store_city', $request->store_city, __('Store city/district'));
        Setting::set('store_logo', $logoPath, __('Store logo'));
        Setting::set('store_npwp', $request->store_npwp, __('Store NPWP'));
        Setting::set('store_nib', $request->store_nib, __('Store NIB'));
        Setting::set('tax_default_rate', $request->tax_default_rate, __('Default VAT rate (%)'));
        Setting::set('store_currency', $request->store_currency, __('Store currency code'));

        $this->auditLogService->log(
            event: 'store.setting.updated',
            module: 'store_settings',
            auditable: ['target_label' => 'Store Profile'],
            description: __('Store profile updated.'),
            before: $before,
            after: [
                'store_name' => $request->store_name,
                'store_address' => $request->store_address,
                'store_phone' => $request->store_phone,
                'store_email' => $request->store_email,
                'store_website' => $request->store_website,
                'store_city' => $request->store_city,
                'store_logo_changed' => $logoChanged,
                'store_npwp' => $request->store_npwp ? '***' : null,
                'tax_default_rate' => $request->tax_default_rate,
            ],
        );

        return back()->with('success', __('Store profile updated successfully'));
    }

    public function printer()
    {
        return Inertia::render('Dashboard/Settings/Printer', [
            'settings' => [
                'printer_auto_print' => Setting::getBool('printer_auto_print', false),
                'printer_paper_size' => Setting::get('printer_paper_size', '80mm'),
            ],
        ]);
    }

    public function updatePrinter(Request $request)
    {
        $validated = $request->validate([
            'printer_auto_print' => ['boolean'],
            'printer_paper_size' => ['required', 'in:80mm,58mm'],
        ]);

        Setting::set('printer_auto_print', $validated['printer_auto_print'] ? '1' : '0', __('Auto-print receipt after transaction'));
        Setting::set('printer_paper_size', $validated['printer_paper_size'], __('Thermal printer paper size'));

        return back()->with('success', __('Printer settings saved.'));
    }

    public function loyalty()
    {
        return Inertia::render('Dashboard/Settings/Loyalty', [
            'settings' => $this->loyaltyService->settingsPayload(),
        ]);
    }

    public function updateLoyalty(Request $request)
    {
        $validated = $request->validate([
            'enable_earn' => ['required', 'boolean'],
            'enable_redeem' => ['required', 'boolean'],
            'earn_rate_amount' => ['required', 'integer', 'min:1'],
            'redeem_point_value' => ['required', 'integer', 'min:1'],
            'tiers' => ['required', 'array'],
            'tiers.regular' => ['required', 'integer', 'min:0'],
            'tiers.silver' => ['required', 'integer', 'min:0'],
            'tiers.gold' => ['required', 'integer', 'min:0'],
            'tiers.platinum' => ['required', 'integer', 'min:0'],
        ]);

        $orderedThresholds = [
            'regular' => (int) $validated['tiers']['regular'],
            'silver' => (int) $validated['tiers']['silver'],
            'gold' => (int) $validated['tiers']['gold'],
            'platinum' => (int) $validated['tiers']['platinum'],
        ];

        if (
            $orderedThresholds['silver'] < $orderedThresholds['regular']
            || $orderedThresholds['gold'] < $orderedThresholds['silver']
            || $orderedThresholds['platinum'] < $orderedThresholds['gold']
        ) {
            return back()
                ->withErrors([
                    'tiers' => __('Tier thresholds must be sequential from Regular to Platinum.'),
                ])
                ->withInput();
        }

        $before = $this->loyaltyService->settingsPayload();
        $this->loyaltyService->updateSettings([
            ...$validated,
            'tiers' => $orderedThresholds,
        ]);
        $this->loyaltyService->syncAllMemberTiers();

        $this->auditLogService->log(
            event: 'loyalty.setting.updated',
            module: 'loyalty_settings',
            auditable: ['target_label' => 'Loyalty Settings'],
            description: __('Loyalty settings updated.'),
            before: $before,
            after: $this->loyaltyService->settingsPayload()
        );

        return back()->with('success', __('Loyalty settings saved successfully'));
    }

    public function whatsapp()
    {
        $waStatus = ['connected' => false, 'phone' => null, 'qr' => null];
        if (Setting::get('wa_service_url')) {
            try {
                $waStatus = $this->whatsAppService->status();
            } catch (\Exception $e) {
                $waStatus['error'] = $e->getMessage();
            }
        }

        return Inertia::render('Dashboard/Settings/Whatsapp', [
            'settings' => [
                'wa_service_url' => Setting::get('wa_service_url', ''),
                'wa_enabled' => Setting::getBool('wa_enabled', false),
                'wa_auto_reminder' => Setting::getBool('wa_auto_reminder', false),
                'wa_auto_invoice' => Setting::getBool('wa_auto_invoice', false),
            ],
            'waStatus' => $waStatus,
        ]);
    }

    public function updateWhatsapp(Request $request)
    {
        $validated = $request->validate([
            'wa_service_url' => ['nullable', 'string', 'max:255'],
            'wa_enabled' => ['boolean'],
            'wa_auto_reminder' => ['boolean'],
            'wa_auto_invoice' => ['boolean'],
        ]);

        Setting::set('wa_service_url', $validated['wa_service_url'] ?? '', __('WhatsApp service URL'));
        Setting::set('wa_enabled', ($validated['wa_enabled'] ?? false) ? '1' : '0', __('WhatsApp gateway active'));
        Setting::set('wa_auto_reminder', ($validated['wa_auto_reminder'] ?? false) ? '1' : '0', __('Auto-send reminder via WA'));
        Setting::set('wa_auto_invoice', ($validated['wa_auto_invoice'] ?? false) ? '1' : '0', __('Auto-send invoice via WA'));

        return back()->with('success', __('WhatsApp settings saved.'));
    }

    public function testWhatsapp(Request $request)
    {
        $request->validate(['target' => 'required|string']);

        $sent = $this->whatsAppService->send(
            $request->target,
            'Test pesan dari Point of Sales — '.config('app.url')
        );

        return response()->json(['status' => $sent]);
    }

    public function startWhatsapp()
    {
        $result = $this->whatsAppService->start();

        return response()->json($result);
    }

    public function whatsappStatus()
    {
        $status = $this->whatsAppService->status();

        return response()->json($status);
    }

    public function disconnectWhatsapp()
    {
        $this->whatsAppService->disconnect();

        return response()->json(['status' => true]);
    }
}
