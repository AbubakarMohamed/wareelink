<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; // ✅ Add this
use App\Models\Shipment;
use App\Models\Invoice;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index()
    {
        // Existing shipments
        $shipments = Shipment::with([
            'invoice.request.stock.product',
            'warehouse',
            'shop',
        ])->latest()->get();

        // Paid invoices without a shipment
        $invoices = Invoice::with(['request.stock.product', 'shop', 'warehouse'])
            ->where('status', 'paid')
            ->get();

        return Inertia::render('Warehouse/Shipments/Index', [
            'shipments' => $shipments,
            'invoices'  => $invoices,
            'auth'      => ['user' => auth()->user()],
            'flash'     => session()->only(['success', 'error']),
        ]);
    }

    public function store(Request $request)
{
    // Validate invoice ID
    $request->validate([
        'invoice_id' => 'required|exists:invoices,id',
    ]);

    // Load invoice with request and stock
    $invoice = Invoice::with('request.stock')->findOrFail($request->invoice_id);

    // Ensure the invoice is paid
    if ($invoice->status !== 'paid') {
        return back()->with('error', 'Invoice must be paid to ship.');
    }

    // Prevent duplicate shipments
    if (Shipment::where('invoice_id', $invoice->id)->exists()) {
        return back()->with('error', 'Shipment already exists for this invoice.');
    }

    // Use the invoice's shop_id if valid, otherwise default to shop ID 1
    $shopId = $invoice->request->shop_id;
    if (!\App\Models\Shop::find($shopId)) {
        $shopId = 1; // default shop ID (must exist in shops table)
    }

    // Create shipment
    Shipment::create([
        'invoice_id'   => $invoice->id,
        'warehouse_id' => $invoice->warehouse_id,
        'shop_id'      => $shopId,
        'quantity'     => $invoice->request->quantity,
        'status'       => 'shipped',
    ]);

    return back()->with('success', 'Shipment created successfully.');
}

}
