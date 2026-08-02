<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
    ];

    public function payables()
    {
        return $this->hasMany(Payable::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function goodsReceivings()
    {
        return $this->hasMany(GoodsReceiving::class);
    }

    public function supplierReturns()
    {
        return $this->hasMany(SupplierReturn::class);
    }

    public function isInUse(): bool
    {
        return $this->payables()->exists()
            || $this->purchaseOrders()->exists()
            || $this->goodsReceivings()->exists()
            || $this->supplierReturns()->exists();
    }
}
