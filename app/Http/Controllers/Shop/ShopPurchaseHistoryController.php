<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Inertia\Inertia;

class ShopPurchaseHistoryController extends Controller
{
    // Show only paid invoices belonging to this shop
    public function index()
    {
        $shopId = auth()->id();

        $invoices = Invoice::with(['request.stock.product', 'warehouse'])
            ->where('shop_id', $shopId)     // ✅ only this shop
            ->where('status', 'paid')       // ✅ only paid invoices
            ->latest()
            ->get();

        return Inertia::render('Shop/PurchaseHistory', [
            'invoices' => $invoices,
            'auth'     => ['user' => auth()->user()],
            'flash'    => session()->only(['success', 'error']),
            'totalQuantity' => $invoices->sum(fn($invoice) => $invoice->request?->quantity ?? 0),
            'totalAmount'   => $invoices->sum(fn($invoice) => $invoice->amount ?? 0),
        ]);
    }
}
