<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    public const GATEWAY_BANK_TRANSFER = 'bank_transfer';

    protected $fillable = [
        'default_gateway',
        'bank_transfer_enabled',
    ];

    protected $casts = [
        'bank_transfer_enabled' => 'boolean',
    ];

    public function enabledGateways(): array
    {
        $gateways = [];

        if ($this->isBankTransferReady()) {
            $gateways[] = [
                'value' => self::GATEWAY_BANK_TRANSFER,
                'label' => 'Transfer Bank',
                'description' => 'Pembayaran manual via transfer bank.',
            ];
        }

        return $gateways;
    }

    public function isBankTransferReady(): bool
    {
        return $this->bank_transfer_enabled && BankAccount::active()->exists();
    }
}
