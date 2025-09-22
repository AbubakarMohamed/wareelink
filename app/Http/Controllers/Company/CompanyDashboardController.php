<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\WarehouseAdmin;
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

        // ✅ Stats scoped to this company
        $stats = [
            "products"        => $company->products()->count(),
            "warehouses"      => $company->warehouses()->count(),
            "warehouseAdmins" => WarehouseAdmin::where('company_id', $company->id)->count(),
        ];

        // ✅ Recent activity scoped by company_id
        $recentActivity = ActivityLog::where('company_id', $company->id)
            ->latest()
            ->take(5)
            ->get([
                "description",
                "action",
                "created_at"
            ]);

        return Inertia::render("Company/CompanyDashboard", [
            "stats"          => $stats,
            "recentActivity" => $recentActivity,
            "auth"           => ["user" => $user],
        ]);
    }
}
