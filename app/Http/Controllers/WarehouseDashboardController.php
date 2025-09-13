<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WarehouseDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Warehouse/WarehouseDashboard');
    }
}
