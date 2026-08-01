<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Services\AuditLogService;
use App\Services\StockMutationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(
        private readonly StockMutationService $stockMutationService,
        private readonly AuditLogService $auditLogService
    ) {}

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index(Request $request)
    {
        $products = Product::when($request->search, function ($products, $search) {
            $products = $products->where('title', 'like', '%'.$search.'%');
        })->with('category')->latest()->paginate(15);

        $warehouses = Warehouse::active()->orderBy('code')->get(['id', 'code', 'name']);

        return Inertia::render('Dashboard/Products/Index', [
            'products' => $products,
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        return Inertia::render('Dashboard/Products/Create', [
            'categories' => Category::all(),
            'units' => Unit::all(),
            'warehouses' => Warehouse::active()->orderBy('code')->get(['id', 'code', 'name', 'type']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request)
    {
        /**
         * validate
         */
        $request->validate([
            'barcode' => 'required|unique:products,barcode',
            'title' => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'buy_price' => 'required',
            'sell_price' => 'required',
            'warehouse_id' => 'required|exists:warehouses,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'units' => 'nullable|array',
            'units.*.unit_id' => 'required_with:units|integer|exists:units,id',
            'units.*.is_base' => 'required|boolean',
            'units.*.conversion_factor' => 'required|numeric|min:0.0001',
            'units.*.buy_price' => 'required|integer|min:0',
            'units.*.sell_price' => 'required|integer|min:0',
            'units.*.barcode' => 'nullable|string|max:100',
        ], $this->unitValidationMessages($request));
        // upload image
        $imageName = null;
        if ($request->file('image')) {
            $image = $request->file('image');
            $image->storeAs('public/products', $image->hashName());
            $imageName = $image->hashName();
        }

        // create product
        $product = Product::create([
            'image' => $imageName,
            'barcode' => $request->barcode,
            'title' => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'buy_price' => $request->buy_price,
            'sell_price' => $request->sell_price,
            'min_stock' => $request->min_stock ?? 0,
            'max_stock' => $request->max_stock ?? 0,
        ]);

        $product->warehouses()->attach($request->warehouse_id, [
            'stock' => (int) $request->stock,
        ]);

        if ($request->units) {
            $baseCount = collect($request->units)->where('is_base', true)->count();
            if ($baseCount !== 1) {
                return redirect()->back()->withErrors(['units' => 'Exactly one unit must be marked as base.'])->withInput();
            }
            foreach ($request->units as $unit) {
                $product->units()->attach($unit['unit_id'], [
                    'is_base' => $unit['is_base'],
                    'conversion_factor' => $unit['conversion_factor'],
                    'buy_price' => $unit['buy_price'],
                    'sell_price' => $unit['sell_price'],
                    'barcode' => $unit['barcode'] ?? null,
                ]);
            }
        }

        $this->stockMutationService->recordInitialStock($product, $request->user()?->id, (int) $request->warehouse_id);
        $this->auditLogService->log(
            event: 'product.created',
            module: 'products',
            auditable: $product,
            description: __('New product created.'),
            after: $this->productAuditPayload($product->fresh())
        );

        // redirect
        return to_route('products.index');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function edit(Product $product)
    {
        $product->load('units');

        return Inertia::render('Dashboard/Products/Edit', [
            'product' => $product,
            'categories' => Category::all(),
            'units' => Unit::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, Product $product)
    {
        $before = $this->productAuditPayload($product);

        /**
         * validate
         */
        $request->validate([
            'barcode' => 'required|unique:products,barcode,'.$product->id,
            'title' => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'buy_price' => 'required',
            'sell_price' => 'required',
            'min_stock' => 'nullable|integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'units' => 'sometimes|nullable|array',
            'units.*.unit_id' => 'required_with:units|integer|exists:units,id',
            'units.*.is_base' => 'required|boolean',
            'units.*.conversion_factor' => 'required|numeric|min:0.0001',
            'units.*.buy_price' => 'required|integer|min:0',
            'units.*.sell_price' => 'required|integer|min:0',
            'units.*.barcode' => 'nullable|string|max:100',
        ], $this->unitValidationMessages($request));

        // check image update
        if ($request->file('image')) {

            // remove old image
            Storage::disk('local')->delete('public/products/'.basename($product->image));

            // upload new image
            $image = $request->file('image');
            $image->storeAs('public/products', $image->hashName());

            // update product with new image
            $product->update([
                'image' => $image->hashName(),
                'barcode' => $request->barcode,
                'title' => $request->title,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'buy_price' => $request->buy_price,
                'sell_price' => $request->sell_price,
            ]);

            $this->syncUnits($product, $request->units);
            $this->logProductUpdate($product, $before);

            return to_route('products.index');
        }

        // update product without image
        $product->update([
            'barcode' => $request->barcode,
            'title' => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'buy_price' => $request->buy_price,
            'sell_price' => $request->sell_price,
        ]);

        $this->logProductUpdate($product, $before);
        $this->syncUnits($product, $request->units);

        // redirect
        return to_route('products.index');
    }

    private function syncUnits(Product $product, ?array $units): void
    {
        if ($units === null) {
            return;
        }

        $baseCount = collect($units)->where('is_base', true)->count();
        if ($baseCount !== 1) {
            return;
        }

        $syncData = [];
        foreach ($units as $unit) {
            $syncData[$unit['unit_id']] = [
                'is_base' => $unit['is_base'],
                'conversion_factor' => $unit['conversion_factor'],
                'buy_price' => $unit['buy_price'],
                'sell_price' => $unit['sell_price'],
                'barcode' => $unit['barcode'] ?? null,
            ];
        }

        $product->units()->sync($syncData);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        // find by ID
        $product = Product::findOrFail($id);
        $before = $this->productAuditPayload($product);

        // remove image
        Storage::disk('local')->delete('public/products/'.basename($product->image));

        // delete
        $product->delete();

        $this->auditLogService->log(
            event: 'product.deleted',
            module: 'products',
            auditable: $product,
            description: __('Product deleted.'),
            before: $before
        );

        // redirect
        return back();
    }

    private function logProductUpdate(Product $product, array $before): void
    {
        $after = $this->productAuditPayload($product->fresh());

        $this->auditLogService->log(
            event: 'product.updated',
            module: 'products',
            auditable: $product,
            description: __('Product data updated.'),
            before: $before,
            after: $after
        );

        if (
            (int) $before['buy_price'] !== (int) $after['buy_price']
            || (int) $before['sell_price'] !== (int) $after['sell_price']
        ) {
            $this->auditLogService->log(
                event: 'product.price_updated',
                module: 'products',
                auditable: $product,
                description: __('Product price updated.'),
                before: [
                    'buy_price' => $before['buy_price'],
                    'sell_price' => $before['sell_price'],
                ],
                after: [
                    'buy_price' => $after['buy_price'],
                    'sell_price' => $after['sell_price'],
                ]
            );
        }
    }

    private function productAuditPayload(Product $product): array
    {
        return $this->auditLogService->only($product->toArray(), [
            'title',
            'barcode',
            'buy_price',
            'sell_price',
            'stock',
            'category_id',
        ]);
    }

    private function unitValidationMessages(Request $request): array
    {
        $messages = [];

        if (! $request->has('units')) {
            return $messages;
        }

        foreach ($request->input('units') as $i => $unit) {
            $num = $i + 1;

            $messages["units.{$i}.unit_id.required_with"] = __('validation.unit_field_required', ['field' => 'Unit', 'num' => $num]);
            $messages["units.{$i}.unit_id.integer"] = __('validation.unit_field_integer', ['field' => 'Unit', 'num' => $num]);
            $messages["units.{$i}.unit_id.exists"] = __('validation.unit_field_exists', ['field' => 'Unit', 'num' => $num]);
            $messages["units.{$i}.is_base.required"] = __('validation.unit_field_required', ['field' => 'Base unit status', 'num' => $num]);
            $messages["units.{$i}.is_base.boolean"] = __('validation.unit_field_boolean', ['field' => 'Base unit status', 'num' => $num]);
            $messages["units.{$i}.conversion_factor.required"] = __('validation.unit_field_required', ['field' => 'Conversion factor', 'num' => $num]);
            $messages["units.{$i}.conversion_factor.numeric"] = __('validation.unit_field_numeric', ['field' => 'Conversion factor', 'num' => $num]);
            $messages["units.{$i}.conversion_factor.min"] = __('validation.unit_field_min', ['field' => 'Conversion factor', 'num' => $num, 'min' => '0.0001']);
            $messages["units.{$i}.buy_price.required"] = __('validation.unit_field_required', ['field' => 'Buy price', 'num' => $num]);
            $messages["units.{$i}.buy_price.integer"] = __('validation.unit_field_integer', ['field' => 'Buy price', 'num' => $num]);
            $messages["units.{$i}.buy_price.min"] = __('validation.unit_field_min', ['field' => 'Buy price', 'num' => $num, 'min' => '0']);
            $messages["units.{$i}.sell_price.required"] = __('validation.unit_field_required', ['field' => 'Sell price', 'num' => $num]);
            $messages["units.{$i}.sell_price.integer"] = __('validation.unit_field_integer', ['field' => 'Sell price', 'num' => $num]);
            $messages["units.{$i}.sell_price.min"] = __('validation.unit_field_min', ['field' => 'Sell price', 'num' => $num, 'min' => '0']);
            $messages["units.{$i}.barcode.string"] = __('validation.unit_field_string', ['field' => 'Barcode', 'num' => $num]);
            $messages["units.{$i}.barcode.max"] = __('validation.unit_field_max', ['field' => 'Barcode', 'num' => $num, 'max' => '100']);
        }

        return $messages;
    }
}
