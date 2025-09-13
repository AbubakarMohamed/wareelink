<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class CompanyDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Company/CompanyDashboard');
    }
}
