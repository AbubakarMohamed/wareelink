<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WarehouseDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'warehouse') {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Warehouse/WarehouseDashboard');
    }
}
