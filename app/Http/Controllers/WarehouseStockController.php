<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WarehouseStockController extends Controller
{
    public function index()
    {
        $companyId = Auth::user()->company->id;

        $stocks = WarehouseStock::whereHas('warehouse', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->with(['warehouse', 'product'])
            ->get();

        $warehouses = Warehouse::where('company_id', $companyId)->get();
        $products   = Product::where('company_id', $companyId)->get();

        return Inertia::render('WarehouseStocks/Index', [
            'stocks'     => $stocks,
            'warehouses' => $warehouses,
            'products'   => $products,
        ]);
    }

    // ✅ Handles single stock creation with proper validation
    public function store(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id'   => 'required|exists:products,id',
            'quantity'     => 'required|integer|min:1',
        ]);

        $companyId = Auth::user()->company->id;

        $warehouse = Warehouse::where('id', $request->warehouse_id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        $product = Product::findOrFail($request->product_id);

        // Current quantity in this warehouse
        $currentStock = WarehouseStock::where('warehouse_id', $warehouse->id)
            ->where('product_id', $product->id)
            ->value('quantity') ?? 0;

        // Total allocated in all warehouses
        $totalAllocated = WarehouseStock::where('product_id', $product->id)->sum('quantity');

        // Remaining stock available
        $remaining = $product->stock - $totalAllocated;

        if ($request->quantity > $remaining) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['quantity' => "Cannot allocate {$request->quantity}. Only {$remaining} units remaining."]);
        }

        // Update or create with proper quantity
        $newQuantity = $currentStock + $request->quantity;

        $stock = WarehouseStock::updateOrCreate(
            [
                'warehouse_id' => $warehouse->id,
                'product_id'   => $product->id,
            ],
            [
                'quantity' => $newQuantity,
            ]
        );

        ActivityLog::record(
            Auth::id(),
            'created',
            "Added {$request->quantity} units of product {$product->name} to warehouse {$warehouse->name}",
            $stock
        );

        return redirect()->route('warehouse-stocks.index')
            ->with('success', 'Stock added successfully!');
    }

    // ✅ Store multiple stocks with validation
    public function storeMultiple(Request $request)
    {
        $companyId = auth()->user()->company->id;

        $stocksData = $request->input('stocks', []);

        foreach ($stocksData as $index => $stockData) {
            $validated = validator($stockData, [
                'warehouse_id' => 'required|exists:warehouses,id',
                'product_id'   => 'required|exists:products,id',
                'quantity'     => 'required|integer|min:1',
            ])->validate();

            $warehouse = Warehouse::where('id', $validated['warehouse_id'])
                ->where('company_id', $companyId)
                ->firstOrFail();

            $product = Product::findOrFail($validated['product_id']);

            $currentStock = WarehouseStock::where('warehouse_id', $warehouse->id)
                ->where('product_id', $product->id)
                ->value('quantity') ?? 0;

            $totalAllocated = WarehouseStock::where('product_id', $product->id)->sum('quantity');

            $remaining = $product->stock - $totalAllocated;

            if ($validated['quantity'] > $remaining) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors([
                        "stocks.{$index}.quantity" => "Cannot allocate {$validated['quantity']} for product {$product->name}. Only {$remaining} units remaining."
                    ]);
            }

            $newQuantity = $currentStock + $validated['quantity'];

            $stockRecord = WarehouseStock::updateOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'product_id'   => $product->id,
                ],
                [
                    'quantity' => $newQuantity,
                ]
            );

            ActivityLog::record(
                auth()->id(),
                'created',
                "Added {$validated['quantity']} units of product {$product->name} to warehouse {$warehouse->name}",
                $stockRecord
            );
        }

        return redirect()->route('warehousestocks.index')
            ->with('success', count($stocksData) . " stocks added successfully!");
    }

    // ✅ Update warehouse stock with proper validation
    public function update(Request $request, WarehouseStock $warehouseStock)
    {
        $companyId = Auth::user()->company->id;

        if ($warehouseStock->warehouse->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id'   => 'required|exists:products,id',
            'quantity'     => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Remaining stock excluding this warehouse
        $totalAllocated = WarehouseStock::where('product_id', $product->id)
            ->where('id', '!=', $warehouseStock->id)
            ->sum('quantity');

        $remaining = $product->stock - $totalAllocated;

        if ($request->quantity > $remaining) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['quantity' => "Cannot set quantity to {$request->quantity}. Only {$remaining} units remaining."]);
        }

        $warehouseStock->update($request->only('warehouse_id', 'product_id', 'quantity'));

        ActivityLog::record(
            Auth::id(),
            'updated',
            "Updated stock of product {$product->name} in warehouse {$warehouseStock->warehouse->name} to quantity {$request->quantity}",
            $warehouseStock
        );

        return redirect()->route('warehousestocks.index')
            ->with('success', 'Stock updated successfully!');
    }

    public function destroy(WarehouseStock $warehouseStock)
    {
        $companyId = Auth::user()->company->id;

        if ($warehouseStock->warehouse->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }

        $warehouseStock->delete();

        ActivityLog::record(
            Auth::id(),
            'deleted',
            "Deleted stock of product {$warehouseStock->product->name} from warehouse {$warehouseStock->warehouse->name}",
            $warehouseStock
        );

        return redirect()->route('warehousestocks.index')
            ->with('success', 'Stock deleted successfully!');
    }
}
