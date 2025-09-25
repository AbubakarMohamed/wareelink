<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Request as ShopRequest;
use App\Models\Invoice;

class ShopDashboardController extends Controller
{
    /**
     * Display the Shop Dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'shop') {
            abort(403, 'Unauthorized access.');
        }

        $shopId = $user->id;

        // ✅ Stats
        $totalRequests = ShopRequest::where('shop_id', $shopId)->count();
        $approved      = ShopRequest::where('shop_id', $shopId)->where('status', 'approved')->count();
        $pending       = ShopRequest::where('shop_id', $shopId)->where('status', 'pending')->count();
        $rejected      = ShopRequest::where('shop_id', $shopId)->where('status', 'rejected')->count();
        $cancelled      = ShopRequest::where('shop_id', $shopId)->where('status', 'cancelled')->count();

        $unpaidInvoices = Invoice::where('shop_id', $shopId)
            ->where('status', 'unpaid')
            ->count();

        // ✅ Recent Requests (last 5)
        $recentRequests = ShopRequest::with(['stock.product'])
            ->where('shop_id', $shopId)
            ->latest()
            ->take(5)
            ->get([
                'id',
                'warehouse_stock_id',
                'quantity',
                'status',
                'created_at'
            ]);

        return Inertia::render('Shop/ShopDashboard', [
            'stats' => [
                'totalRequests' => $totalRequests,
                'approved'      => $approved,
                'pending'       => $pending,
                'rejected'      => $rejected,
                'cancelled'      => $cancelled,
                'unpaidInvoices'=> $unpaidInvoices,
            ],
            'recentRequests' => $recentRequests,
            'auth'  => ['user' => $user],
            'flash' => session()->only(['success', 'error']),
        ]);
    }
}
