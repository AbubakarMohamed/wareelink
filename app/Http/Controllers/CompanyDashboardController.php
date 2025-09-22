<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class CompanyDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'company') {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Company/CompanyDashboard');
    }
}