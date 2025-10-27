<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopInvoiceController extends Controller
{
    /**
     * Display invoices.
     * - Admin: Sees all invoices (with shop info)
     * - Shop: Sees only their invoices
     */
    public function index()
    {
        $user = auth()->user();

        $invoicesQuery = Invoice::with(['request.stock.product', 'warehouse', 'shop']);

        // ✅ Only filter by shop_id if not admin
        if ($user->role !== 'admin') {
            $invoicesQuery->where('shop_id', $user->id);
        }

        $invoices = $invoicesQuery->latest()->get();

        return Inertia::render('Shop/Invoices/Index', [
            'invoices' => $invoices,
            'auth'     => ['user' => $user],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    /**
     * Mark invoice as paid.
     * - Admin: Can pay any invoice.
     * - Shop: Can only pay their own.
     */
    public function pay(Request $request, Invoice $invoice)
    {
        $user = auth()->user();

        // ✅ Allow admin to pay any invoice
        if ($user->role !== 'admin' && $invoice->shop_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($invoice->status === 'paid') {
            return back()->with('error', 'This invoice is already paid.');
        }

        $invoice->update(['status' => 'paid']);

        return back()->with('success', 'Invoice paid successfully.');
    }
}
