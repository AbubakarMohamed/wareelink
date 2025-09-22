<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShopDashboardController;
use App\Http\Controllers\WarehouseDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Company\CompanyDashboardController;
use App\Http\Controllers\Company\ProductController;
use App\Http\Controllers\Company\WarehouseController;
use App\Http\Controllers\Company\WarehouseStockController;
// use App\Http\Controllers\WarehouseStockController;
use App\Http\Controllers\Company\WarehouseAdminController; // ✅ New
// use App\Http\Controllers\Company\AdminController;
// use App\Http\Controllers\Company\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------|
| Public Routes
|--------------------------------------------------------------------------|
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
|--------------------------------------------------------------------------|
| Authenticated Routes
|--------------------------------------------------------------------------|
*/
// Single dashboard route — controller redirects based on role
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Role-based dashboards
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

 
        // ✅ Warehouse Stocks
    
        // // List all stocks
        // Route::get('warehouse-stocks', [WarehouseStockController::class, 'index'])
        //     ->name('warehousestocks.index');
    
        // // Create stock form (optional, since we use modal)
        // Route::get('warehouse-stocks/create', [WarehouseStockController::class, 'create'])
        //     ->name('warehousestocks.create');
    
        // // Store single stock
        // Route::post('warehouse-stocks', [WarehouseStockController::class, 'store'])
        //     ->name('warehousestocks.store');
    
        // // Store multiple stocks
        // Route::post('warehouse-stocks/multiple', [WarehouseStockController::class, 'storeMultiple'])
        //     ->name('warehousestocks.storeMultiple');
    
        // // Edit stock form
        // Route::get('warehouse-stocks/{warehouseStock}/edit', [WarehouseStockController::class, 'edit'])
        //     ->name('warehousestocks.edit');
    
        // // Update stock
        // Route::put('warehouse-stocks/{warehouseStock}', [WarehouseStockController::class, 'update'])
        //     ->name('warehousestocks.update');
    
        // // Delete stock
        // Route::delete('warehouse-stocks/{warehouseStock}', [WarehouseStockController::class, 'destroy'])
        //     ->name('warehousestocks.destroy');
    ;
    

/*
|--------------------------------------------------------------------------|
| Company Routes
|--------------------------------------------------------------------------|
*/
Route::middleware(['auth'])
    ->prefix('company')
    ->name('company.')
    ->group(function () {
        // ✅ Products
        Route::resource('products', ProductController::class);

        // ✅ Custom route for adding multiple products at once
        Route::post('products/multiple', [ProductController::class, 'storeMultiple'])
            ->name('products.storeMultiple');

            Route::post('/products/import', [ProductController::class, 'import'])
            ->name('company.products.import');
        

        // ✅ Warehouses
        Route::resource('warehouses', WarehouseController::class);


        // ✅ Custom route for adding multiple warehouses at once
        Route::post('warehouses/multiple', [WarehouseController::class, 'storeMultiple'])
            ->name('warehouses.storeMultiple');

        // ✅ Warehouse Stocks
        Route::resource('warehouse-stocks', WarehouseStockController::class);


        Route::resource('warehouse-admins', WarehouseAdminController::class);

        Route::post('warehouse-admins/multiple', [WarehouseAdminController::class, 'storeMultiple'])
    ->name('warehouse-admins.storeMultiple');

    Route::put('/', [WarehouseAdminController::class, 'update'])
    ->name('warehouse-admins.update');

Route::delete('/', [WarehouseAdminController::class, 'destroy'])
    ->name('warehouse-admins.destroy');




    

        // ✅ Warehouse Admins - create directly from company dashboard
        // Display all warehouse admins
     // Display all warehouse admins
     

        // Route::get('/', [WarehouseAdminController::class, 'index'])
        //     ->name('warehouse-admins.index');
    
        // Route::post('/', [WarehouseAdminController::class, 'store'])
        //     ->name('warehouse-admins.store');

        // // Store multiple admins
        // Route::post('/multiple', [WarehouseAdminController::class, 'storeMultiple'])
        // ->name('warehouse-admins.storeMultiple');
    
       
        // Route::prefix('warehouse-admins')->group(function () {
        //     // List all admins
        //     Route::get('/', [WarehouseAdminController::class, 'index'])
        //         ->name('warehouse-admins.index');
        
        //     // Store single admin
        //     Route::post('/', [WarehouseAdminController::class, 'store'])
        //         ->name('warehouse-admins.store');
        
        //     // Store multiple admins
        //     Route::post('/multiple', [WarehouseAdminController::class, 'storeMultiple'])
        //         ->name('warehouse-admins.storeMultiple');
        
        //     // Update an admin
        //     Route::put('/{id}', [WarehouseAdminController::class, 'update'])
        //         ->name('warehouse-admins.update');
        
        //     // Delete an admin
        //     Route::delete('/{id}', [WarehouseAdminController::class, 'destroy'])
        //         ->name('warehouse-admins.destroy');
        // });
    

        // // ✅ Admins
        // Route::get('admins', [AdminController::class, 'index'])->name('admins.index');
        // Route::post('admins', [AdminController::class, 'store'])->name('admins.store');

        // // ✅ Reports
        // Route::get('reports/stock', [ReportController::class, 'stock'])->name('reports.stock');
    });

/*
|--------------------------------------------------------------------------|
| Profile Routes
|--------------------------------------------------------------------------|
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
