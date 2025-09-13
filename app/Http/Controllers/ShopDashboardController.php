<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ShopDashboardController extends Controller
{
    /**
     * Display the Shop Dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'shop') {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Shop/ShopDashboard');
    }
}
