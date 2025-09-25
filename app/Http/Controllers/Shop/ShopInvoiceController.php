<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopInvoiceController extends Controller
{
    // Show all invoices belonging to this shop
    public function index()
    {
        $shopId = auth()->id();

        $invoices = Invoice::with(['request.stock.product', 'warehouse'])
            ->where('shop_id', $shopId)
            ->latest()
            ->get();

        return Inertia::render('Shop/Invoices/Index', [
            'invoices' => $invoices,
            'auth'     => ['user' => auth()->user()],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    // Mark invoice as paid
public function pay(Request $request, Invoice $invoice)
{
    // Ensure invoice belongs to the logged-in shop
    if ($invoice->shop_id !== auth()->id()) {
        abort(403, 'Unauthorized action.');
    }

    if ($invoice->status === 'paid') {
        return back()->with('error', 'This invoice is already paid.');
    }

    $invoice->update([
        'status' => 'paid',
    ]);

    return back()->with('success', 'Invoice paid successfully.');
}

}
