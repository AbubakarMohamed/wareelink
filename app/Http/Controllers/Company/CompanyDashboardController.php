<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\WarehouseAdmin;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\ActivityLog;
use Inertia\Inertia;

class CompanyDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'company') {
            abort(403, 'Unauthorized access.');
        }

        $company = $user->company;
        if (!$company) {
            abort(404, 'Company record not found for this user.');
        }

        // ===========================
        // Stats
        // ===========================
        $totalProducts        = $company->products()->count();
        $totalWarehouses      = $company->warehouses()->count();
        $totalWarehouseAdmins = WarehouseAdmin::where('company_id', $company->id)->count();

        // Total stock allocated across all warehouses
        $totalStockAllocated = WarehouseStock::where('company_id', $company->id)->sum('quantity');

        // Products low in stock (remaining stock < 10 units)
        $lowStockProducts = Product::where('company_id', $company->id)
            ->whereRaw('stock - (SELECT COALESCE(SUM(quantity),0) FROM warehouse_stocks WHERE warehouse_stocks.product_id = products.id AND warehouse_stocks.company_id = ?) < 10', [$company->id])
            ->get(['id', 'name', 'stock']);

        // Warehouse-wise stock summary
        $warehouseStockSummary = $company->warehouses->map(function ($warehouse) {
            $totalQuantity = $warehouse->stocks->sum('quantity');
            $productsCount = $warehouse->stocks->count();
            return [
                'warehouse' => $warehouse->name,
                'products_count' => $productsCount,
                'total_quantity' => $totalQuantity,
            ];
        });

        // ===========================
        // Recent activity (latest 5)
        // ===========================
        $recentActivity = ActivityLog::where('company_id', $company->id)
            ->latest()
            ->take(5)
            ->get([
                'description',
                'action',
                'created_at'
            ]);

        return Inertia::render("Company/CompanyDashboard", [
            'stats' => [
                'totalProducts'        => $totalProducts,
                'totalWarehouses'      => $totalWarehouses,
                'totalWarehouseAdmins' => $totalWarehouseAdmins,
                'totalStockAllocated'  => $totalStockAllocated,
                'lowStockProducts'     => $lowStockProducts->count(),
            ],
            'warehouseStockSummary' => $warehouseStockSummary,
            'recentActivity'        => $recentActivity,
            'auth'                  => ['user' => $user],
        ]);
    }
}
