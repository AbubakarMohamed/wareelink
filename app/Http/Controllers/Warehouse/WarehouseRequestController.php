<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Request;
use App\Models\WarehouseStock;
use Illuminate\Http\Request as HttpRequest;

class WarehouseRequestController extends Controller
{
    public function index()
    {
        $requests = Request::with(['shop', 'stock.product', 'stock.warehouse'])
            ->latest()
            ->get();

        return \Inertia\Inertia::render('Warehouse/Requests/Index', [
            'requests' => $requests,
            'auth'     => ['user' => auth()->user()],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    public function approve(HttpRequest $httpRequest, Request $request)
    {
        $stock = $request->stock;

        if ($stock->quantity < $request->quantity) {
            return back()->with('error', 'Not enough stock available to approve this request.');
        }

        // ✅ Deduct quantity
        $stock->decrement('quantity', $request->quantity);

        // ✅ Update request status
        $request->update(['status' => 'approved']);

        return back()->with('success', 'Request approved and stock updated successfully!');
    }

    public function reject(HttpRequest $httpRequest, Request $request)
    {
        $request->update(['status' => 'rejected']);
        return back()->with('error', 'Request rejected.');
    }
}
