<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Models\ActivityLog;
use Inertia\Inertia;

class WarehouseDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'warehouse_admin') {
            abort(403, 'Unauthorized access.');
        }

        $warehouseAdmin = $user->warehouseAdmin;
        if (!$warehouseAdmin || !$warehouseAdmin->warehouse) {
            abort(404, 'No warehouse assigned.');
        }

        $warehouse = $warehouseAdmin->warehouse()->with(['stocks.product'])->first();

        // ✅ Count products & total stock
        $productCount = $warehouse->stocks->count();
        $stockTotal   = $warehouse->stocks->sum('quantity');

        // ✅ Recent activity
        // $recentActivity = ActivityLog::where('warehouse_id', $warehouse->id)
        //     ->latest()
        //     ->take(10)
        //     ->get();

        return Inertia::render("Warehouse/WarehouseDashboard", [
            "warehouse"      => $warehouse,
            "stats"          => [
                "products" => $productCount,
                "stocks"   => $stockTotal,
            ],
            // "recentActivity" => $recentActivity,
            "auth"           => ["user" => $user],
        ]);
    }
}
