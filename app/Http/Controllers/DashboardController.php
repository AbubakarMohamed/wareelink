<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Main dashboard redirector — sends user to their role's dashboard route.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Redirect based on role
        switch ($user->role) {
            case 'admin':
                return redirect()->route('admin.dashboard');
            case 'company':
                return redirect()->route('company.dashboard');
            case 'warehouse_admin':
                return redirect()->route('warehouse.dashboard');
            case 'shop':
                return redirect()->route('shop.dashboard');
            default:
                abort(403, 'Unauthorized role.');
        }
    }
}
