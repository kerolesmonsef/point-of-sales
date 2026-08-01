<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    public function collection()
    {
        return Product::with('category')->orderBy('title')->get();
    }

    public function headings(): array
    {
        return [
            __('Barcode'),
            __('Name'),
            __('Category'),
            __('Purchase Price'),
            __('Selling Price'),
            __('Stock'),
            __('Min Stock'),
            __('Max Stock'),
            __('Tax Type'),
            __('Tax Rate'),
        ];
    }

    public function map($product): array
    {
        return [
            $product->barcode,
            $product->title,
            $product->category?->name ?? '',
            (int) $product->buy_price,
            (int) $product->sell_price,
            (int) ($product->stock ?? 0),
            (int) ($product->min_stock ?? 0),
            (int) ($product->max_stock ?? 0),
            $product->tax_type ?? 'exclusive',
            (float) ($product->tax_rate ?? 11.00),
        ];
    }
}
