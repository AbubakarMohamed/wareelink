<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShopDashboardController;
use App\Http\Controllers\CompanyDashboardController;
use App\Http\Controllers\WarehouseDashboardController;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

// Single dashboard route — controller redirects based on role
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Optional: explicit role dashboards (used only if needed for direct access)
Route::get('/shop/dashboard', [ShopDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('shop.dashboard');

Route::get('/company/dashboard', [CompanyDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('company.dashboard');

Route::get('/warehouse/dashboard', [WarehouseDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('warehouse.dashboard');

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin.dashboard');

/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
