<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Warehouse;

class WarehouseDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'warehouse_admin') {
            abort(403, 'Unauthorized access.');
        }

        // Get the warehouse(s) this admin belongs to
        $warehouse = $user->warehouseAdmin?->warehouses()->with('stocks.product')->first();

        return Inertia::render('Warehouse/WarehouseDashboard', [
            'warehouse' => $warehouse
        ]);
    }
}
