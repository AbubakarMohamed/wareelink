<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
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
        $user = Auth::user();

        // ✅ Admin can view all company stocks
        if ($user->role === 'admin') {
            $stocks = WarehouseStock::with(['warehouse.company', 'product.company', 'company'])->get();
            $warehouses = Warehouse::with('company')->get();
            $products = Product::with('company')->get();
            $companies = Company::all(); // ✅ Include all companies for admin
        } else {
            $companyId = $user->company->id;

            $stocks = WarehouseStock::where('company_id', $companyId)
                ->with(['warehouse', 'product', 'company'])
                ->get();

            $warehouses = Warehouse::where('company_id', $companyId)->get();
            $products = Product::where('company_id', $companyId)->get();
            $companies = []; // non-admin doesn’t need company data
        }

        return inertia('WarehouseStocks/Index', [
            'stocks' => $stocks->load(['warehouse', 'product', 'company']),
            'warehouses' => $warehouses,
            'products' => $products,
            'companies' => Company::all(),
            'auth' => ['user' => Auth::user()],
            'isAdmin' => Auth::user()->role === 'admin',
        ]);
        
    }

    public function store(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id'   => 'required|exists:products,id',
            'quantity'     => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $warehouse = Warehouse::findOrFail($request->warehouse_id);
        $product = Product::findOrFail($request->product_id);

        if ($user->role !== 'admin' && $warehouse->company_id !== $user->company->id) {
            abort(403, 'Unauthorized');
        }

        $companyId = $user->role === 'admin' ? $warehouse->company_id : $user->company->id;

        $currentStock = WarehouseStock::where('warehouse_id', $warehouse->id)
            ->where('product_id', $product->id)
            ->where('company_id', $companyId)
            ->value('quantity') ?? 0;

        $totalAllocated = WarehouseStock::where('product_id', $product->id)
            ->where('company_id', $companyId)
            ->sum('quantity');

        $remaining = $product->stock - $totalAllocated;

        if ($request->quantity > $remaining) {
            return back()->withInput()->withErrors([
                'quantity' => "Cannot allocate {$request->quantity}. Only {$remaining} units remaining."
            ]);
        }

        $newQuantity = $currentStock + $request->quantity;

        $stock = WarehouseStock::updateOrCreate(
            [
                'warehouse_id' => $warehouse->id,
                'product_id'   => $product->id,
                'company_id'   => $companyId,
            ],
            ['quantity' => $newQuantity]
        );

        ActivityLog::record(
            $user->id,
            'created',
            "Added {$request->quantity} units of product {$product->name} to warehouse {$warehouse->name}",
            $stock
        );

        return redirect()->route('warehousestocks.index')
            ->with('success', 'Stock added successfully!');
    }

    public function storeMultiple(Request $request)
    {
        $user = Auth::user();
        $stocksData = $request->input('stocks', []);

        foreach ($stocksData as $index => $stockData) {
            $validated = validator($stockData, [
                'warehouse_id' => 'required|exists:warehouses,id',
                'product_id'   => 'required|exists:products,id',
                'quantity'     => 'required|integer|min:1',
            ])->validate();

            $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
            $product = Product::findOrFail($validated['product_id']);

            if ($user->role !== 'admin' && $warehouse->company_id !== $user->company->id) {
                abort(403, 'Unauthorized');
            }

            $companyId = $user->role === 'admin' ? $warehouse->company_id : $user->company->id;

            $currentStock = WarehouseStock::where('warehouse_id', $warehouse->id)
                ->where('product_id', $product->id)
                ->where('company_id', $companyId)
                ->value('quantity') ?? 0;

            $totalAllocated = WarehouseStock::where('product_id', $product->id)
                ->where('company_id', $companyId)
                ->sum('quantity');

            $remaining = $product->stock - $totalAllocated;

            if ($validated['quantity'] > $remaining) {
                return back()->withInput()->withErrors([
                    "stocks.{$index}.quantity" =>
                        "Cannot allocate {$validated['quantity']} for product {$product->name}. Only {$remaining} units remaining."
                ]);
            }

            $newQuantity = $currentStock + $validated['quantity'];

            $stockRecord = WarehouseStock::updateOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'product_id'   => $product->id,
                    'company_id'   => $companyId,
                ],
                ['quantity' => $newQuantity]
            );

            ActivityLog::record(
                $user->id,
                'created',
                "Added {$validated['quantity']} units of product {$product->name} to warehouse {$warehouse->name}",
                $stockRecord
            );
        }

        return redirect()->route('warehousestocks.index')
            ->with('success', count($stocksData) . " stocks added successfully!");
    }

    public function update(Request $request, WarehouseStock $warehouseStock)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $warehouseStock->company_id !== $user->company->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id'   => 'required|exists:products,id',
            'quantity'     => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($request->product_id);
        $companyId = $user->role === 'admin' ? $warehouseStock->company_id : $user->company->id;

        $totalAllocated = WarehouseStock::where('product_id', $product->id)
            ->where('company_id', $companyId)
            ->where('id', '!=', $warehouseStock->id)
            ->sum('quantity');

        $remaining = $product->stock - $totalAllocated;

        if ($request->quantity > $remaining) {
            return back()->withInput()->withErrors([
                'quantity' => "Cannot set quantity to {$request->quantity}. Only {$remaining} units remaining."
            ]);
        }

        $warehouseStock->update([
            'warehouse_id' => $request->warehouse_id,
            'product_id'   => $request->product_id,
            'quantity'     => $request->quantity,
        ]);

        ActivityLog::record(
            $user->id,
            'updated',
            "Updated stock of product {$product->name} in warehouse {$warehouseStock->warehouse->name} to quantity {$request->quantity}",
            $warehouseStock
        );

        return redirect()->route('warehousestocks.index')
            ->with('success', 'Stock updated successfully!');
    }

    public function destroy(WarehouseStock $warehouseStock)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $warehouseStock->company_id !== $user->company->id) {
            abort(403, 'Unauthorized');
        }

        $warehouseStock->delete();

        ActivityLog::record(
            $user->id,
            'deleted',
            "Deleted stock of product {$warehouseStock->product->name} from warehouse {$warehouseStock->warehouse->name}",
            $warehouseStock
        );

        return redirect()->route('warehousestocks.index')
            ->with('success', 'Stock deleted successfully!');
    }
}
