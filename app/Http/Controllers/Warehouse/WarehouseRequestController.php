<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Request as ShopRequest;
use App\Models\WarehouseStock;
use App\Models\Invoice;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class WarehouseRequestController extends Controller
{
    public function index()
    {
        $requests = ShopRequest::with(['shop', 'stock.product', 'stock.warehouse'])
            ->latest()
            ->get();

        return Inertia::render('Warehouse/Requests/Index', [
            'requests' => $requests,
            'auth'     => ['user' => auth()->user()],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    public function approve(HttpRequest $httpRequest, ShopRequest $request)
    {
        $stock = $request->stock;

        if ($stock->quantity < $request->quantity) {
            return back()->with('error', 'Not enough stock available to approve this request.');
        }

        // Deduct stock quantity
        $stock->decrement('quantity', $request->quantity);

        // Update request status
        $request->update(['status' => 'approved']);

        return back()->with('success', 'Request approved and stock updated successfully!');
    }

    public function reject(HttpRequest $httpRequest, ShopRequest $request)
    {
        $request->update(['status' => 'rejected']);
        return back()->with('error', 'Request rejected.');
    }

    // ✅ New method to create invoice
    public function createInvoice(HttpRequest $httpRequest)
    {
        $requestId = $httpRequest->input('request_id');
        $request = ShopRequest::findOrFail($requestId);

        if ($request->status === 'invoiced') {
            return back()->with('error', 'Invoice already created for this request.');
        }

        // Create invoice
        $invoice = Invoice::create([
            'request_id' => $request->id,
            'shop_id'    => $request->shop_id,
            'warehouse_id' => $request->stock->warehouse_id,
            'amount'     => $request->quantity * $request->stock->price,
            // Add other invoice fields if needed
        ]);

        // ✅ Update request status to invoiced
        $request->update(['status' => 'invoiced']);

        return back()->with('success', 'Invoice created successfully!');
    }
}
