<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Render the role-specific dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        switch ($user->role) {
            case 'admin':
                return Inertia::render('Admin/Dashboard'); // Admin dashboard view
            case 'company':
                return Inertia::render('Company/Dashboard'); // Company dashboard view
            case 'warehouse_admin':
                return Inertia::render('Warehouse/Dashboard'); // Warehouse dashboard view
            case 'shop':
                return Inertia::render('Shop/Dashboard'); // Shop dashboard view
            default:
                abort(403, 'Unauthorized.');
        }
    }
}
