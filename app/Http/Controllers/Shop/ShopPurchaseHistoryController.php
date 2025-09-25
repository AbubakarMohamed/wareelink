<?php

namespace App\Http\Controllers\Shop; // Make sure this matches your folder

use App\Http\Controllers\Controller; // <-- THIS IS REQUIRED
use Illuminate\Http\Request;
use App\Models\Invoice;
use Inertia\Inertia;

class ShopPurchaseHistoryController extends Controller
{
    public function index()
    {
        // Fetch invoices with related request, stock, product, and warehouse
        $invoices = Invoice::with([
            'request.stock.product',
            'warehouse'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // Calculate totals
        $totalQuantity = $invoices->sum(fn($invoice) => $invoice->request?->quantity ?? 0);
        $totalAmount = $invoices->sum(fn($invoice) => $invoice->amount ?? 0);

        return Inertia::render('Shop/PurchaseHistory', [
            'invoices' => $invoices,
            'totalQuantity' => $totalQuantity,
            'totalAmount' => $totalAmount,
        ]);
    }
}
