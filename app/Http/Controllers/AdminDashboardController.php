<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Shop;
use App\Models\Warehouse;
use App\Models\Invoice;
use App\Models\Company;
use Carbon\Carbon;
use DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        // ====== BASIC STATS ======
        $stats = [
            'total_companies'  => Company::count(),
            'total_warehouses' => Warehouse::count(),
            'total_shops'      => User::where('role', 'shop')->count(),
            'total_invoices'   => Invoice::count(),
        ];

        // ====== FINANCIAL INSIGHTS ======
        $totalRevenue = Invoice::where('status', 'paid')->sum('amount');
        $pendingAmount = Invoice::where('status', 'unpaid')->sum('amount');
        $recentInvoices = Invoice::with(['shop', 'warehouse.company'])
            ->latest()
            ->take(5)
            ->get();

        // ====== SHOP PERFORMANCE ======
        $topShops = DB::table('users as s')
        ->where('s.role', 'shop')
        ->leftJoin('requests as sr', 's.id', '=', 'sr.shop_id')
        ->leftJoin('invoices as i', 's.id', '=', 'i.shop_id')
        ->select(
            's.id',
            's.name',
            DB::raw('COUNT(DISTINCT sr.id) AS total_requests'),
            DB::raw('COUNT(DISTINCT CASE WHEN i.status = "paid" THEN i.id END) AS completed')
        )
        ->groupBy('s.id', 's.name')
        ->orderByDesc('completed')
        ->take(5)
        ->get()
        ->map(function ($shop) {
            $total = (int) $shop->total_requests;
            $completed = (int) $shop->completed; // only paid invoices
            $shop->performance = $total > 0 ? round(($completed / $total) * 100, 1) : 0;
            return $shop;
        });
    


    


        // ====== MONTHLY SALES TREND ======
        $monthlySales = Invoice::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
            ->where('status', 'paid')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ====== RECENT ACTIVITY ======
        $recentShops = User::where('role', 'shop')->latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
        $recentWarehouses = Warehouse::with('company:id,name')->latest()->take(5)->get(['id', 'name', 'company_id', 'created_at']);

        // ====== INVOICE STATUS SUMMARY ======
        $invoiceSummary = [
            'paid'     => Invoice::where('status', 'paid')->count(),
            'unpaid'   => Invoice::where('status', 'unpaid')->count(),
            'invoiced' => Invoice::where('status', 'invoiced')->count(),
        ];

        // ====== COMPANY INSIGHTS ======
// 1️⃣ Revenue by Company
$revenueByCompany = Invoice::selectRaw('companies.name as company, SUM(invoices.amount) as total')
->join('warehouses', 'invoices.warehouse_id', '=', 'warehouses.id')
->join('companies', 'warehouses.company_id', '=', 'companies.id')
->where('invoices.status', 'paid')
->groupBy('companies.name')
->orderByDesc('total')
->get();

// 2️⃣ Invoice count per company
$invoiceCountsByCompany = Invoice::selectRaw('companies.name as company, COUNT(invoices.id) as count')
->join('warehouses', 'invoices.warehouse_id', '=', 'warehouses.id')
->join('companies', 'warehouses.company_id', '=', 'companies.id')
->groupBy('companies.name')
->get();

// 3️⃣ Top performing companies
$topCompanies = DB::table('companies')
    ->selectRaw('
        companies.id,
        companies.name,

        -- ✅ count only valid warehouse requests (pending, approved, invoiced)
        COUNT(DISTINCT r.id) AS total_requests,

        -- ✅ count only invoices with status paid AND linked to valid requests
        COUNT(DISTINCT CASE 
            WHEN invoices.status = "paid" 
                 AND r.status IN ("approved", "invoiced")
            THEN invoices.id 
        END) AS completed
    ')
    ->leftJoin('warehouses', 'companies.id', '=', 'warehouses.company_id')
    ->leftJoin('warehouse_stocks as ws', 'warehouses.id', '=', 'ws.warehouse_id')
    ->leftJoin('requests as r', 'ws.id', '=', 'r.warehouse_stock_id')
    ->leftJoin('invoices', 'warehouses.id', '=', 'invoices.warehouse_id')
    ->groupBy('companies.id', 'companies.name')
    ->orderByDesc('completed')
    ->take(5)
    ->get()
    ->map(function ($c) {
        $performance = $c->total_requests > 0
            ? round(($c->completed / $c->total_requests) * 100, 1)
            : 0;

        return [
            'name' => $c->name,
            'requests' => $c->total_requests,
            'completed' => $c->completed,
            'performance' => $performance,
        ];
    });








$companyInsights = [
'revenueByCompany' => $revenueByCompany,
'invoiceCountsByCompany' => $invoiceCountsByCompany,
'topCompanies' => $topCompanies,
];


        return Inertia::render('Admin/AdminDashboard', [
            'auth' => ['user' => $user],
            'stats' => $stats,
            'financials' => [
                'totalRevenue' => $totalRevenue,
                'pendingAmount' => $pendingAmount,
                'invoiceSummary' => $invoiceSummary,
            ],
            'charts' => [
                'monthlySales' => $monthlySales,
            ],
            'topShops' => $topShops,
            'recent' => [
                'invoices' => $recentInvoices,
                'shops' => $recentShops,
                'warehouses' => $recentWarehouses,
            ],
            'companyInsights' => $companyInsights, // ✅ added
            'flash' => session()->only(['success', 'error']),
        ]);
    }
}
