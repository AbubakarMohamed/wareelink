<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Inertia\Inertia;

class WarehouseReportController extends Controller
{
    public function index()
{
    $user = auth()->user();

    // Get warehouse IDs this admin manages
    $warehouseIds = $user->managedWarehouses()->pluck('warehouses.id');

    if ($warehouseIds->isEmpty()) {
        $invoices = collect(); // empty collection
    } else {
        // Fetch only invoices for these warehouses
        $invoices = Invoice::whereIn('warehouse_id', $warehouseIds)
            ->with([
                'warehouse',
                'shop',
                'request.stock.product'
            ])
            ->latest()
            ->get();
    }

    return \Inertia\Inertia::render('Warehouse/Reports/WarehouseReport', [
        'invoices' => $invoices,
        'auth'     => ['user' => $user],
        'flash'    => session()->only(['success', 'error']),
    ]);
}

}
