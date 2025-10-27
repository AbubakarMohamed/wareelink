<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use Inertia\Inertia;

class ShopPurchaseHistoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $query = Invoice::with(['request.stock.product', 'warehouse', 'shop']);

        // ✅ Admin sees all paid invoices
        if ($user->role !== 'admin') {
            $query->where('shop_id', $user->id);
        }

        $invoices = $query
            ->where('status', 'paid') // ✅ only paid invoices
            ->latest()
            ->get();

        // ✅ Compute totals
        $totalQuantity = $invoices->sum(fn($invoice) => $invoice->request?->quantity ?? 0);
        $totalAmount   = $invoices->sum(fn($invoice) => $invoice->amount ?? 0);

        // ✅ Fetch all shops (for filter dropdown)
        $shops = [];
        if ($user->role === 'admin') {
            $shops = User::where('role', 'shop')
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('Shop/PurchaseHistory', [
            'invoices'       => $invoices,
            'auth'           => ['user' => $user],
            'flash'          => session()->only(['success', 'error']),
            'totalQuantity'  => $totalQuantity,
            'totalAmount'    => $totalAmount,
            'isAdmin'        => $user->role === 'admin',
            'shops'          => $shops, // ✅ new addition
        ]);
    }
}
