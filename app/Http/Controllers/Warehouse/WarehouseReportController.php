<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Inertia\Inertia;

class WarehouseReportController extends Controller
{
    public function index()
    {
        // Fetch all invoices with related warehouse and request data
        $invoices = Invoice::with([
            'warehouse',
            'shop',
            'request.stock.product'
        ])->get();

        // Optional: you could also filter by date, warehouse, or status here

        return Inertia::render('Warehouse/Reports/WarehouseReport', [
            'invoices' => $invoices,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
        
        
    }
}
