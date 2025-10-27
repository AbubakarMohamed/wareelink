<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; 
use App\Models\Request as ShopRequest; 
use App\Models\WarehouseStock;
use App\Models\User; // for shops
use Inertia\Inertia;

class ShopRequestController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Admin sees all requests, shops see their own
        $query = ShopRequest::with(['stock.product', 'stock.warehouse.company', 'shop']);

        if ($user->role !== 'admin') {
            $query->where('shop_id', $user->id);
        }

        $requests = $query->latest()->get();

        return Inertia::render('Shop/Requests/Index', [
            'requests' => $requests,
            'auth'     => ['user' => $user],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'stock_id' => 'required|exists:warehouse_stocks,id',
            'quantity' => 'required|integer|min:1',
            'shop_id'  => 'nullable|exists:users,id', // admin can specify shop
        ]);

        $user = auth()->user();

        $stock = WarehouseStock::findOrFail($request->stock_id);

        if ($request->quantity > $stock->quantity) {
            return back()->with('error', 'Requested quantity exceeds available stock.');
        }

        // Determine which shop is requesting
        $shopId = $user->role === 'admin' && $request->shop_id
            ? $request->shop_id
            : $user->id;

        ShopRequest::create([
            'warehouse_stock_id' => $stock->id,
            'shop_id'            => $shopId,
            'quantity'           => $request->quantity,
            'status'             => 'pending',
        ]);

        return back()->with('success', 'Request submitted successfully!');
    }

    public function cancel($id)
    {
        $user = auth()->user();

        // Only allow shop to cancel their own requests
        $query = ShopRequest::where('id', $id)->where('status', 'pending');
        if ($user->role !== 'admin') {
            $query->where('shop_id', $user->id);
        }

        $request = $query->firstOrFail();

        $request->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Request cancelled successfully.');
    }
}
