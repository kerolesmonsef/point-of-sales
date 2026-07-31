<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    public const GATEWAY_CARD = 'card';

    protected $fillable = [
        'default_gateway',
    ];

    public function enabledGateways(): array
    {
        return [
            [
                'value' => self::GATEWAY_CARD,
                'label' => 'Kartu',
                'description' => 'Pembayaran dengan kartu debit/kredit (Visa/Mastercard).',
            ],
        ];
    }
}
