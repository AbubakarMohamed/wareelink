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
        return Inertia::render('Shop/ShopDashboard', [
            'title' => 'Shop Dashboard',
        ]);
    }
}
