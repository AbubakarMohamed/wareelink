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
            'users' => User::count(),
            'shops' => Shop::count(),
            'warehouses' => Warehouse::count(),
            'companies' => Company::count(), // 👈 new
            'invoices' => Invoice::count(),
            'paidInvoices' => Invoice::where('status', 'paid')->count(),
            'unpaidInvoices' => Invoice::where('status', '!=', 'paid')->count(),
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'stats' => $stats,
        ]);
    }
}
