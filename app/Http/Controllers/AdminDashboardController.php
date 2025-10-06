<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Shop;
use App\Models\Warehouse;
use App\Models\Invoice;
use App\Models\Company; // 👈 add this

class AdminDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $stats = [
            'shops'      => Shop::count() ?? 0,
            'companies'  => Company::count() ?? 0,
            'warehouses' => Warehouse::count() ?? 0,
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'stats' => $stats,
        ]);
    }
}
