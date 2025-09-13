<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function index()
    {
        return Inertia::render('Admin/AdminDashboard', [
            'title' => 'Admin Dashboard',
        ]);
    }
}
