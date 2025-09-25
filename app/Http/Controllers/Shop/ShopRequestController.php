<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; // ✅ Laravel HTTP Request
use App\Models\Request as ShopRequest; // ✅ Alias your model
use App\Models\WarehouseStock;
use Inertia\Inertia;

class ShopRequestController extends Controller
{
    public function index()
    {
        $shopId = auth()->user()->id; // or shop_id if you have shop relation

        $requests = ShopRequest::with(['stock.product', 'stock.warehouse.company'])
            ->where('shop_id', $shopId)
            ->latest()
            ->get();

        return Inertia::render('Shop/Requests/Index', [
            'requests' => $requests,
            'auth'     => ['user' => auth()->user()],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'stock_id' => 'required|exists:warehouse_stocks,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $stock = WarehouseStock::findOrFail($request->stock_id);

        if ($request->quantity > $stock->quantity) {
            return back()->with('error', 'Requested quantity exceeds available stock.');
        }

        ShopRequest::create([
            'warehouse_stock_id' => $stock->id,
            'shop_id'            => auth()->user()->id, // or ->shop->id if relation exists
            'quantity'           => $request->quantity,
            'status'             => 'pending',
        ]);

        return back()->with('success', 'Request submitted successfully!');
    }
}
