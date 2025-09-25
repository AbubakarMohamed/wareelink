<?php

namespace App\Http\Controllers\Company;

use App\Models\Company;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class StockReportController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ensure only company users can access their stock report
        if ($user->role !== 'company') {
            abort(403, 'Unauthorized access.');
        }

        $company = $user->company;

        if (!$company) {
            return inertia('Company/Reports/StockReport', [
                'company' => null,
                'report' => [],
            ]);
        }

        $company->load(['warehouses.stocks.product']);

        // Prepare a summary
        $report = $company->warehouses->flatMap(function ($warehouse) {
            return $warehouse->stocks->map(function ($stock) use ($warehouse) {
                return [
                    'warehouse' => $warehouse->name,
                    'product'   => $stock->product->name,
                    'sku'       => $stock->product->sku,
                    'category'  => $stock->product->category,
                    'quantity'  => $stock->quantity,
                    'unit_price'=> $stock->product->price,
                    'value'     => $stock->quantity * $stock->product->price,
                ];
            });
        });

        return inertia('Company/Reports/StockReport', [
            'company' => $company,
            'report' => $report,
        ]);
    }
}
